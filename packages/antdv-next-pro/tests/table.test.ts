import type { VueWrapper } from '@vue/test-utils'
import type { EditableAction, ProKey, ProTableInstance } from '../src/types'
import { config, flushPromises, mount, shallowMount } from '@vue/test-utils'
import { Button, Pagination, Table } from 'antdv-next'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vite-plus/test'

import { defineComponent, h } from 'vue'
import EditableProTable from '../src/EditableProTable.vue'
import ProTable from '../src/ProTable.vue'

interface Row extends Record<string, unknown> {
  id: number
  name: string
}

type ExtendedInstance = ProTableInstance<Row> & {
  getRowData: (indexOrKey: number | ProKey) => Row | undefined
  getRowsData: () => Row[]
  setRowData: (indexOrKey: number | ProKey, value: Partial<Row>) => boolean
}

let wrapper: VueWrapper | undefined
const originalRenderStubDefaultSlot = config.global.renderStubDefaultSlot

// Keep table logic visible inside shallowly stubbed layout containers such as ProCard.
beforeAll(() => {
  config.global.renderStubDefaultSlot = true
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  )
})
afterAll(() => {
  config.global.renderStubDefaultSlot = originalRenderStubDefaultSlot
})

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
})

describe('ProTable', () => {
  it('renders built-in toolbar options without bordered button styling', () => {
    wrapper = shallowMount(ProTable, {
      props: {
        columns: [],
        dataSource: [],
        pagination: false,
        search: false,
      },
      global: { stubs: { ListToolBar: false } },
    })

    const optionButtons = wrapper
      .get('[data-pro-table-list-toolbar-actions]')
      .findAllComponents(Button)
    expect(optionButtons).toHaveLength(3)
    expect(
      optionButtons.every(
        (button: VueWrapper) => (button.props() as Record<string, unknown>).type === 'text',
      ),
    ).toBe(true)
  })

  it('accepts only the latest remote request result', async () => {
    const resolvers = new Map<number, (result: { data: Row[]; total: number }) => void>()
    const request = vi.fn(
      (params: Record<string, unknown>) =>
        new Promise<{ data: Row[]; total: number }>((resolve) => {
          resolvers.set(Number(params.id), resolve)
        }),
    )
    wrapper = shallowMount(ProTable, {
      props: {
        columns: [{ dataIndex: 'name', title: 'Name' }],
        params: { id: 1 },
        request,
        pagination: false,
      },
    })
    await flushPromises()
    await wrapper.setProps({ params: { id: 2 } })
    await flushPromises()

    resolvers.get(2)?.({ data: [{ id: 2, name: 'latest' }], total: 1 })
    await flushPromises()
    resolvers.get(1)?.({ data: [{ id: 1, name: 'stale' }], total: 1 })
    await flushPromises()

    const table = wrapper.vm as unknown as ExtendedInstance
    expect(table.getRowsData()).toEqual([{ id: 2, name: 'latest' }])
    expect(wrapper.emitted('load')).toHaveLength(1)
  })

  it('shares draft state across instance edits and commits after async save', async () => {
    const onSave = vi.fn(async () => true)
    wrapper = shallowMount(ProTable, {
      props: {
        columns: [
          {
            dataIndex: 'name',
            title: 'Name',
            formItemProps: { rules: [{ required: true, message: '请输入名称' }] },
          },
        ],
        dataSource: [{ id: 1, name: 'Ada' }],
        rowKey: 'id',
        editable: { type: 'multiple', onSave },
        pagination: false,
      },
    })
    const table = wrapper.vm as unknown as ExtendedInstance

    expect(table.startEditable(1)).toBe(true)
    expect(table.setRowData(0, { name: 'Grace' })).toBe(true)
    expect(table.getRowData(0)?.name).toBe('Grace')
    expect(wrapper.emitted('update:dataSource')).toBeUndefined()
    expect(wrapper.emitted('editableDraftChange')?.at(-1)).toEqual([
      [{ id: 1, name: 'Grace' }],
      { id: 1, name: 'Grace' },
      'change',
    ])
    await expect(table.saveEditable(1)).resolves.toBe(true)

    expect(onSave).toHaveBeenCalledWith(1, { id: 1, name: 'Grace' }, { id: 1, name: 'Ada' })
    expect(wrapper.emitted('update:dataSource')?.at(-1)?.[0]).toEqual([{ id: 1, name: 'Grace' }])
  })

  it('hydrates externally controlled editable keys and prioritizes an exact numeric row key', async () => {
    const onSave = vi.fn(async () => true)
    wrapper = shallowMount(ProTable, {
      props: {
        columns: [{ dataIndex: 'name', title: 'Name' }],
        dataSource: [
          { id: 1, name: 'Ada' },
          { id: 2, name: 'Grace' },
        ],
        rowKey: 'id',
        editable: { type: 'multiple', onSave },
        editableKeys: [1],
        pagination: false,
      },
    })
    const table = wrapper.vm as unknown as ExtendedInstance

    expect(table.getRowData(1)).toEqual({ id: 1, name: 'Ada' })
    expect(table.setRowData(1, { name: 'Lin' })).toBe(true)
    expect(table.getRowsData()).toEqual([
      { id: 1, name: 'Lin' },
      { id: 2, name: 'Grace' },
    ])
    await expect(table.saveEditable(1)).resolves.toBe(true)
    expect(onSave).toHaveBeenCalledWith(1, { id: 1, name: 'Lin' }, { id: 1, name: 'Ada' })
  })

  it('requests once when controlled pagination changes externally', async () => {
    const request = vi.fn(async () => ({ data: [{ id: 2, name: 'Grace' }], total: 21 }))
    wrapper = shallowMount(ProTable, {
      props: {
        columns: [{ dataIndex: 'name' }],
        request,
        manualRequest: true,
        pagination: { current: 1, pageSize: 10 },
      },
    })

    await wrapper.setProps({ pagination: { current: 2, pageSize: 20 } })
    await flushPromises()

    expect(request).toHaveBeenCalledTimes(1)
    expect(request).toHaveBeenCalledWith({ current: 2, pageSize: 20 }, {}, {})
  })

  it('treats success false as a request error while retaining data and clearing loading', async () => {
    const request = vi.fn(async () => ({ data: [{ id: 2, name: 'Ignored' }], success: false }))
    wrapper = shallowMount(ProTable, {
      props: {
        columns: [{ dataIndex: 'name' }],
        dataSource: [{ id: 1, name: 'Ada' }],
        request,
        manualRequest: true,
        pagination: false,
      },
    })
    const table = wrapper.vm as unknown as ExtendedInstance

    await table.reload()

    expect(table.getRowsData()).toEqual([{ id: 1, name: 'Ada' }])
    expect(wrapper.emitted('requestError')?.[0]?.[0]).toEqual(
      expect.objectContaining({ message: 'ProTable request returned success: false' }),
    )
    expect(wrapper.findComponent(Table).props('loading')).toBe(false)
    expect(wrapper.emitted('load')).toBeUndefined()
  })

  it('supports controlled and uncontrolled search collapsing with span and label width', async () => {
    const onCollapse = vi.fn()
    const columns = [1, 2, 3, 4].map((id) => ({ dataIndex: `field${id}`, title: `Field ${id}` }))
    wrapper = mount(ProTable, {
      props: {
        columns,
        dataSource: [],
        search: { defaultCollapsed: true, span: 12, labelWidth: 80, onCollapse },
        pagination: false,
        options: false,
      },
      global: { stubs: { NativeTable: true, ProCard: true, ListToolBar: true } },
    })
    const visibleFields = () =>
      wrapper!
        .findAll('.ant-pro-query-filter-col')
        .filter((field) => (field.element as HTMLElement).style.display !== 'none')
    const collapseButton = () => wrapper!.get('.ant-pro-query-filter-collapse-button')
    expect(visibleFields()).toHaveLength(1)
    expect(wrapper.get('.ant-pro-query-filter-col').attributes('style')).toContain('50%')
    expect(wrapper.get('.ant-form-item-label').attributes('style')).toContain('width: 80px')
    expect(collapseButton().attributes('aria-expanded')).toBe('false')
    await collapseButton().trigger('click')
    expect(visibleFields()).toHaveLength(4)
    expect(collapseButton().attributes('aria-expanded')).toBe('true')
    expect(onCollapse).toHaveBeenLastCalledWith(false)
    expect(wrapper.emitted('searchCollapse')?.at(-1)).toEqual([false])
    await wrapper.setProps({
      search: { collapsed: true, span: 12, labelWidth: 'auto', onCollapse },
    })
    expect(visibleFields()).toHaveLength(1)
    await collapseButton().trigger('click')
    expect(visibleFields()).toHaveLength(1)
    await wrapper.setProps({
      search: { collapsed: false, span: 12, labelWidth: 'auto', onCollapse },
    })
    expect(visibleFields()).toHaveLength(4)
  })

  it('keeps hideInTable fields searchable and honors an explicit pagination total', () => {
    wrapper = shallowMount(ProTable, {
      props: {
        columns: [
          { dataIndex: 'hidden', title: 'Hidden', hideInTable: true },
          { dataIndex: 'name', title: 'Name' },
        ],
        dataSource: [{ id: 1, name: 'Ada', hidden: 'secret' }],
        pagination: { total: 99 },
      },
    })

    const columns = wrapper.findComponent(Table).props('columns') as Array<Record<string, unknown>>
    expect(columns.map((column) => column.dataIndex)).toEqual(['name'])
    expect(wrapper.findComponent({ name: 'Search' }).props('columns')).toHaveLength(2)
    expect(wrapper.findComponent(Pagination).props('total')).toBe(99)
  })

  it('disambiguates numeric scroll targets and supports explicit key and top targets', () => {
    wrapper = shallowMount(ProTable, {
      props: {
        columns: [{ dataIndex: 'name' }],
        dataSource: [{ id: 1, name: 'Ada' }],
        pagination: false,
      },
    })
    const root = wrapper.element as HTMLElement
    const body = document.createElement('div')
    const row = document.createElement('div')
    const scrollIntoView = vi.fn()
    body.className = 'ant-table-body'
    row.dataset.rowKey = '1'
    row.scrollIntoView = scrollIntoView
    body.append(row)
    root.append(body)
    const table = wrapper.vm as unknown as ExtendedInstance

    table.scrollTo(1)
    table.scrollTo({ key: 1 })
    expect(scrollIntoView).toHaveBeenCalledTimes(2)
    table.scrollTo(48)
    expect(body.scrollTop).toBe(48)
    table.scrollTo({ top: 24 })
    expect(body.scrollTop).toBe(24)
  })

  it('keeps cache-created rows out of v-model until save and removes them on cancel', () => {
    wrapper = shallowMount(ProTable, {
      props: {
        columns: [{ dataIndex: 'name' }],
        dataSource: [{ id: 1, name: 'Ada' }],
        editable: { type: 'multiple' },
        pagination: false,
      },
    })
    const table = wrapper.vm as unknown as ExtendedInstance

    expect(table.addEditRecord({ id: 2, name: 'Draft' }, { newRecordType: 'cache' })).toBe(true)
    expect(table.getRowsData()).toHaveLength(2)
    expect(wrapper.emitted('update:dataSource')).toBeUndefined()

    table.cancelEditable(2)
    expect(table.getRowsData()).toEqual([{ id: 1, name: 'Ada' }])
    expect(wrapper.emitted('update:dataSource')).toBeUndefined()
  })

  it('rejects invalid rows before invoking onSave', async () => {
    const onSave = vi.fn()
    wrapper = shallowMount(ProTable, {
      props: {
        columns: [
          {
            dataIndex: 'name',
            formItemProps: { rules: [{ required: true, message: '请输入名称' }] },
          },
        ],
        dataSource: [{ id: 1, name: '' }],
        editable: { onSave },
        pagination: false,
      },
    })
    const table = wrapper.vm as unknown as ExtendedInstance

    table.startEditable(1)
    await expect(table.saveEditable(1)).resolves.toBe(false)
    expect(onSave).not.toHaveBeenCalled()
    expect(wrapper.emitted('validationError')).toHaveLength(1)
  })

  it('routes custom action saves through the public validation error path', async () => {
    const TableStub = defineComponent({
      name: 'Table',
      props: {
        columns: { type: Array, default: () => [] },
        dataSource: { type: Array, default: () => [] },
      },
      setup(stubProps, { slots }) {
        return () => {
          const column = (stubProps.columns as Array<Record<string, unknown>>).at(-1)
          const record = (stubProps.dataSource as Row[])[0]
          return h('div', column && record ? [slots.bodyCell?.({ column, record, index: 0 })] : [])
        }
      },
    })
    const onSave = vi.fn()
    let actions: EditableAction<Record<string, unknown>> | undefined
    const actionRender = vi.fn(
      (
        _record: Record<string, unknown>,
        currentActions: EditableAction<Record<string, unknown>>,
      ) => {
        actions = currentActions
        return null
      },
    )
    wrapper = shallowMount(ProTable, {
      props: {
        columns: [
          {
            dataIndex: 'name',
            formItemProps: { rules: [{ required: true, message: '请输入名称' }] },
          },
        ],
        dataSource: [{ id: 1, name: '' }],
        rowKey: 'id',
        editable: { actionRender, onSave },
        pagination: false,
      },
      global: {
        stubs: {
          NativeTable: TableStub,
          ATable: TableStub,
          Table: TableStub,
        },
      },
    })

    const initialActions = actions
    expect(initialActions).toBeDefined()
    if (!initialActions) throw new Error('actionRender did not receive editable actions')
    expect(initialActions.start()).toBe(true)
    await wrapper.vm.$nextTick()
    const editingActions = actions
    if (!editingActions) throw new Error('actionRender did not refresh editable actions')
    await expect(editingActions.save()).resolves.toBe(false)
    expect(onSave).not.toHaveBeenCalled()
    expect(wrapper.emitted('validationError')).toEqual([[1, { '1::name': '请输入名称' }]])
  })
})

describe('EditableProTable', () => {
  const editableStubs = {
    ProTable: false,
    ProCard: true,
    NativeTable: true,
    Form: true,
    ListToolBar: true,
  }

  it('hides the record creator after reaching maxLength', async () => {
    wrapper = shallowMount(EditableProTable, {
      global: { stubs: editableStubs },
      props: {
        columns: [{ dataIndex: 'name', title: 'Name' }],
        value: [{ id: 1, name: 'Ada' }],
        rowKey: 'id',
        maxLength: 1,
        recordCreatorProps: {
          record: () => ({ id: 2, name: 'Grace' }),
        },
      },
    })

    expect(wrapper.find('[data-pro-table-record-creator]').exists()).toBe(false)

    await wrapper.setProps({ value: [] })

    expect(wrapper.find('[data-pro-table-record-creator]').exists()).toBe(true)
  })

  it('uses top-level row count and allows adding a child before maxLength', async () => {
    wrapper = shallowMount(EditableProTable, {
      global: { stubs: editableStubs },
      props: {
        columns: [{ dataIndex: 'name', title: 'Name' }],
        value: [
          {
            id: 1,
            name: 'Parent',
            children: [{ id: 2, name: 'Child' }],
          },
        ],
        rowKey: 'id',
        maxLength: 2,
        recordCreatorProps: {
          record: () => ({ id: 3, name: 'Nested' }),
          parentKey: 1,
        },
      },
    })
    const table = wrapper.vm as unknown as ExtendedInstance

    expect(wrapper.find('[data-pro-table-record-creator]').exists()).toBe(true)
    expect(
      table.addEditRecord({ id: 3, name: 'Nested' }, { parentKey: 1, newRecordType: 'cache' }),
    ).toBe(true)
    expect(table.getRowsData()[0]?.children).toHaveLength(2)
    table.cancelEditable(3)
    expect(table.getRowsData()[0]?.children).toHaveLength(1)
  })

  it('calls compatibility callbacks and applies formItemProps to FormItem', async () => {
    const onValuesChange = vi.fn()
    const onTableChange = vi.fn()
    wrapper = shallowMount(EditableProTable, {
      props: {
        columns: [{ dataIndex: 'name', title: 'Name' }],
        value: [{ id: 1, name: 'Ada' }],
        rowKey: 'id',
        onValuesChange,
        onTableChange,
      },
    })
    const table = wrapper.findComponent({ name: 'ProTable' })
    const rows = [{ id: 1, name: 'Grace' }]
    const pagination = { current: 2, pageSize: 20, total: 40 }
    const filters = { name: ['Grace'] }
    const sorter = { name: 'ascend' as const }

    table.vm.$emit('dataSourceChange', rows, rows[0])
    table.vm.$emit('change', pagination, filters, sorter)
    await wrapper.setProps({ formItemProps: { name: 'members' } })
    await wrapper.vm.$nextTick()

    expect(onValuesChange).toHaveBeenCalledWith(rows, rows[0])
    expect(onValuesChange).toHaveBeenCalledTimes(1)
    expect(onTableChange).toHaveBeenCalledWith(pagination, filters, sorter)
    expect(onTableChange).toHaveBeenCalledTimes(1)
    expect(wrapper.emitted('valuesChange')).toEqual([[rows, rows[0]]])
    expect(wrapper.emitted('tableChange')).toEqual([[pagination, filters, sorter]])
    expect(wrapper.attributes('name')).toBe('members')
  })
})
