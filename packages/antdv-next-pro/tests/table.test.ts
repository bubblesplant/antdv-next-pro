import type { VueWrapper } from '@vue/test-utils'
import type { EditableAction, ProKey, ProTableInstance } from '../src/types'
import { DownOutlined, UpOutlined } from '@antdv-next/icons'
import { config, flushPromises, shallowMount } from '@vue/test-utils'
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
    })

    const optionButtons = wrapper.get('.antdv-next-pro__toolbar-actions').findAllComponents(Button)
    expect(optionButtons).toHaveLength(4)
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
    wrapper = shallowMount(ProTable, {
      props: {
        columns,
        dataSource: [],
        search: { defaultCollapsed: true, span: 12, labelWidth: 80, onCollapse },
        pagination: false,
      },
    })

    expect(wrapper.findAll('.antdv-next-pro__search-field')).toHaveLength(1)
    expect(wrapper.get('.antdv-next-pro__search-fields').attributes('style')).toContain(
      '--antdv-next-pro-search-columns: 2',
    )
    expect(
      wrapper
        .get('.antdv-next-pro__search-fields')
        .find('.antdv-next-pro__search-actions')
        .exists(),
    ).toBe(true)
    const actionButtons = wrapper
      .get('.antdv-next-pro__search-actions')
      .findAllComponents(Button) as VueWrapper[]
    expect(actionButtons).toHaveLength(3)
    expect(
      actionButtons.map((button: VueWrapper) => (button.props() as Record<string, unknown>).type),
    ).toEqual([undefined, 'primary', 'link'])
    expect(actionButtons[2]?.classes()).toContain('antdv-next-pro__search-collapse')
    expect(wrapper.get('.antdv-next-pro__search-field').attributes('style')).toContain(
      'grid-template-columns: 80px minmax(0, 1fr)',
    )
    const collapseButton = actionButtons[2] as VueWrapper
    expect(collapseButton.attributes('aria-expanded')).toBe('false')
    expect((collapseButton.props() as Record<string, unknown>).iconPlacement).toBe('end')
    expect((collapseButton.vm.$slots.icon?.()[0]?.type as { name?: string }).name).toBe(
      DownOutlined.name,
    )

    await wrapper.get('.antdv-next-pro__search-collapse').trigger('click')
    expect(wrapper.findAll('.antdv-next-pro__search-field')).toHaveLength(4)
    expect(collapseButton.attributes('aria-expanded')).toBe('true')
    expect((collapseButton.vm.$slots.icon?.()[0]?.type as { name?: string }).name).toBe(
      UpOutlined.name,
    )
    expect(onCollapse).toHaveBeenLastCalledWith(false)
    expect(wrapper.emitted('searchCollapse')?.at(-1)).toEqual([false])

    await wrapper.setProps({
      search: { collapsed: true, span: 12, labelWidth: 'auto', onCollapse },
    })
    expect(wrapper.findAll('.antdv-next-pro__search-field')).toHaveLength(1)
    await wrapper.get('.antdv-next-pro__search-collapse').trigger('click')
    expect(wrapper.findAll('.antdv-next-pro__search-field')).toHaveLength(1)
    await wrapper.setProps({
      search: { collapsed: false, span: 12, labelWidth: 'auto', onCollapse },
    })
    expect(wrapper.findAll('.antdv-next-pro__search-field')).toHaveLength(4)
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
    expect(wrapper.findAll('.antdv-next-pro__search-field')).toHaveLength(2)
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
  it('hides the record creator after reaching maxLength', async () => {
    wrapper = shallowMount(EditableProTable, {
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

    expect(wrapper.find('.antdv-next-pro__creator').exists()).toBe(false)

    await wrapper.setProps({ value: [] })

    expect(wrapper.find('.antdv-next-pro__creator').exists()).toBe(true)
  })

  it('counts nested rows when enforcing maxLength', () => {
    wrapper = shallowMount(EditableProTable, {
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

    expect(wrapper.find('.antdv-next-pro__creator').exists()).toBe(false)
    expect(table.addEditRecord({ id: 3, name: 'Nested' }, { parentKey: 1 })).toBe(false)
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
