import type { VueWrapper } from '@vue/test-utils'
import type { FormInstance } from 'antdv-next'
import type { DropdownFooterProps } from '../src/components/types'
import type { ProTableInstance, ProColumns } from '../src/types'
import type { ProDescriptionsInstance } from '../src/pro-descriptions/types'
import { flushPromises, mount } from '@vue/test-utils'
import { ConfigProvider, Popover } from 'antdv-next'
import enUS from 'antdv-next/locale/en_US'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import { defineComponent, h, ref, shallowRef, nextTick, isVNode, type VNodeChild } from 'vue'
import { ProList } from '../src/pro-list'
import { ProDescriptions } from '../src/pro-descriptions'
import { ProCard, ProCardTabPane, ProCardGroup, ProCardDivider } from '../src/pro-card'
import { CellEditorTable, RowEditorTable, DragSortTable } from '../src/table'
import ListToolBar from '../src/components/ListToolBar.vue'
import FilterDropdown from '../src/components/FilterDropdown.vue'
import DropdownFooter from '../src/components/DropdownFooter.vue'
import TableDropdown from '../src/components/TableDropdown.vue'
import ErrorBoundary from '../src/components/ErrorBoundary.vue'
import Search from '../src/components/Search.vue'
import ProTable from '../src/ProTable.vue'
import { ProConfigProvider } from '../src/provider'
import '../src/style.css'

interface Row extends Record<string, unknown> {
  id: number
  name: string
  note: string
}
let wrapper: VueWrapper | undefined
const rows: Row[] = [
  { id: 1, name: 'Ada', note: 'First' },
  { id: 2, name: 'Grace', note: 'Second' },
]
afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})
function tableAction() {
  return wrapper!.vm as unknown as ProTableInstance<Row>
}
function descriptionsAction() {
  return wrapper!.vm as unknown as ProDescriptionsInstance<Row>
}

describe('new data display families', () => {
  it('preserves description schema keys without declaring the reserved Vue key prop', async () => {
    const warn = vi.spyOn(console, 'warn')
    const render = vi.fn((dom, _record, _index, _action, schema) => {
      expect(schema.key).toBe('display-name')
      return dom
    })
    const editor = vi.fn((schema, context) => {
      expect(schema.key).toBe('display-name')
      expect(context.column.key).toBe('display-name')
      return context.defaultRender()
    })
    wrapper = mount(ProDescriptions<Row>, {
      attachTo: document.body,
      props: {
        dataSource: rows[0],
        column: 1,
        columns: [
          { key: 'display-name', title: 'Name', dataIndex: 'name', render, formItemRender: editor },
        ],
        editable: {},
      },
    })
    await flushPromises()
    expect(render).toHaveBeenCalled()
    expect(descriptionsAction().startEditable('display-name')).toBe(true)
    await nextTick()
    expect(editor).toHaveBeenCalled()
    expect(
      warn.mock.calls.filter((args) =>
        args.some((value) => String(value).includes('Invalid prop name: "key"')),
      ),
    ).toHaveLength(0)
  })

  it('moves grid list actions between real card extra and footer regions', async () => {
    const selection = vi.fn()
    wrapper = mount(ProList<Row>, {
      attachTo: document.body,
      props: {
        dataSource: rows,
        rowKey: 'id',
        grid: { column: 2 },
        itemCardProps: { boxShadow: true },
        metas: {
          title: { dataIndex: 'name' },
          content: { dataIndex: 'note' },
          actions: { render: () => [h('button', 'Archive')] },
        },
        rowSelection: { selectedRowKeys: [], onChange: selection },
      },
    })
    await flushPromises()
    expect(wrapper.findAll('[data-pro-list-row] [data-pro-card]')).toHaveLength(2)
    expect(wrapper.get('.ant-pro-list-row-card .ant-pro-card-extra').text()).toContain('Archive')
    expect(wrapper.find('.ant-pro-list-row-card .ant-pro-card-actions').exists()).toBe(false)
    ;(wrapper.get('.ant-pro-list-row-card input').element as HTMLInputElement).checked = true
    await wrapper.get('.ant-pro-list-row-card input').trigger('change')
    expect(selection).toHaveBeenCalledTimes(1)
    await wrapper.setProps({
      metas: {
        title: { dataIndex: 'name' },
        content: { dataIndex: 'note' },
        actions: { cardActionProps: 'actions', render: () => [h('button', 'Archive')] },
      },
    })
    expect(wrapper.get('.ant-pro-list-row-card .ant-pro-card-actions').text()).toContain('Archive')
    expect(wrapper.find('.ant-pro-list-row-card .ant-pro-card-extra').exists()).toBe(false)
    expect(wrapper.get('.ant-pro-list-row-card').classes()).toContain('ant-pro-card-box-shadow')
    const itemHeaderRender = vi.fn((_record: Row, _index: number, dom: VNodeChild) =>
      h('section', { 'data-grid-header': '' }, [dom]),
    )
    await wrapper.setProps({
      itemHeaderRender,
      classes: {
        header: 'grid-header',
        title: 'grid-title',
        subTitle: 'grid-subtitle',
        description: 'grid-description',
        content: 'grid-content',
        extra: 'grid-extra',
      },
    })
    await wrapper.setProps({
      metas: {
        title: { dataIndex: 'name' },
        subTitle: { dataIndex: 'note' },
        description: { dataIndex: 'note' },
        content: { dataIndex: 'note' },
        extra: { dataIndex: 'note' },
      },
    })
    expect(wrapper.find('[data-grid-header] .grid-header').exists()).toBe(true)
    for (const part of ['title', 'subtitle', 'description', 'content', 'extra'])
      expect(wrapper.find(`.grid-${part}`).exists()).toBe(true)
    wrapper.unmount()
    wrapper = mount(ProList<Row>, {
      attachTo: document.body,
      props: { dataSource: rows, grid: { column: 2 } },
      slots: {
        description: () => h('span', { 'data-grid-description-slot': '' }, 'Slotted description'),
        extra: () => h('span', { 'data-grid-extra-slot': '' }, 'Slotted extra'),
      },
    })
    expect(wrapper.findAll('[data-grid-description-slot]')).toHaveLength(2)
    expect(wrapper.findAll('[data-grid-extra-slot]')).toHaveLength(2)
  })

  it('shares request/paging, controlled selection, expansion and v3 DOM rendering in ProList', async () => {
    const request = vi.fn(async (params: { current?: number }) => ({
      data: rows.slice((params.current ?? 1) - 1, params.current ?? 1),
      total: 2,
    }))
    const selection = vi.fn()
    const render = vi.fn((dom, record: Row, _index, action) => {
      expect(isVNode(dom)).toBe(true)
      expect(typeof action.reload).toBe('function')
      return h('b', [dom, ` #${record.id}`])
    })
    wrapper = mount(ProList<Row>, {
      attachTo: document.body,
      props: {
        request,
        rowKey: 'id',
        metas: {
          title: { dataIndex: 'name', render },
          description: { dataIndex: 'note' },
          content: { dataIndex: 'note' },
          avatar: { render: () => h('span', 'Avatar') },
          actions: { render: () => [h('button', 'One'), h('button', 'Two')] },
        },
        pagination: { pageSize: 1, showSizeChanger: false },
        rowSelection: { selectedRowKeys: [], onChange: selection },
        expandable: { expandedRowRender: (record) => h('em', `expanded:${record.name}`) },
      },
    })
    await flushPromises()
    expect(wrapper.get('[data-pro-list-row]').text()).toContain('Ada #1')
    expect(wrapper.get('.ant-pro-list-item-meta > .ant-pro-list-item-meta-avatar').text()).toBe(
      'Avatar',
    )
    expect(
      wrapper.findAll('.ant-pro-list-item-action > .ant-pro-list-item-action-item'),
    ).toHaveLength(2)
    expect(wrapper.find('.ant-pro-list-item-meta-description').exists()).toBe(false)
    expect(wrapper.find('.ant-pro-list-row-content').exists()).toBe(false)
    ;(wrapper.get('[data-pro-list-row] input[type=checkbox]').element as HTMLInputElement).click()
    await nextTick()
    expect(selection).toHaveBeenCalledTimes(1)
    expect(selection.mock.calls[0]?.[0]).toEqual([1])
    expect((wrapper.get('input[type=checkbox]').element as HTMLInputElement).checked).toBe(false)
    await wrapper.setProps({ rowSelection: { selectedRowKeys: [1], onChange: selection } })
    expect(wrapper.get('[data-pro-list-row]').classes()).toContain('ant-pro-list-row-selected')
    await wrapper.get('[aria-expanded=false]').trigger('click')
    expect(wrapper.text()).toContain('expanded:Ada')
    expect(wrapper.get('.ant-pro-list-item-meta-description').text()).toBe('First')
    expect(wrapper.get('.ant-pro-list-row-content').text()).toBe('First')
    tableAction().setPageInfo({ current: 2 })
    await flushPromises()
    expect(request.mock.calls.at(-1)?.[0].current).toBe(2)
    expect(wrapper.get('[data-pro-list-row]').text()).toContain('Grace #2')
    expect(tableAction().getRowsData()[0]?.id).toBe(2)
  })

  it('validates and saves list fields through the shared editable controller', async () => {
    const onSave = vi.fn()
    const formRef = shallowRef<FormInstance>()
    wrapper = mount(ProList<Row>, {
      attachTo: document.body,
      props: {
        defaultDataSource: rows,
        rowKey: 'id',
        metas: {
          title: {
            dataIndex: 'name',
            formItemProps: { rules: [{ required: true, message: 'Name required' }] },
          },
          actions: { valueType: 'option' },
        },
        editable: { type: 'single', onSave, formRef },
      },
    })
    await flushPromises()
    expect(typeof formRef.value?.validateFields).toBe('function')
    expect(tableAction().startEditable(1)).toBe(true)
    await nextTick()
    await wrapper.get('[data-pro-list-row] input').setValue('')
    expect(await tableAction().saveEditable(1)).toBe(false)
    expect(onSave).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('Name required')
    await wrapper.get('[data-pro-list-row] input').setValue('Ada saved')
    expect(await tableAction().saveEditable(1)).toBe(true)
    expect(onSave.mock.calls[0]?.[1].name).toBe('Ada saved')
    expect(tableAction().getRowsData()[0]?.name).toBe('Ada saved')
    wrapper.unmount()
    wrapper = undefined
    expect(formRef.value).toBeUndefined()
  })

  it('saves only the selected description field and retains other unsaved drafts on failure/cancel', async () => {
    const formRef = shallowRef<FormInstance>()
    const replacement = shallowRef<FormInstance>()
    const onSave = vi.fn(async (_key, record: Row) => record.note !== 'reject')
    const editable = shallowRef<import('../src/types').EditableConfig<Row>>({
      type: 'multiple',
      onSave,
      formRef,
    })
    const target = shallowRef<ProDescriptionsInstance<Row>>()
    wrapper = mount(
      defineComponent(
        () => () =>
          h(ProDescriptions<Row>, {
            ref: target,
            dataSource: rows[0],
            columns: [
              {
                title: 'Name',
                dataIndex: 'name',
                formItemProps: { rules: [{ required: true, message: 'Required' }] },
              },
              { title: 'Note', dataIndex: 'note' },
            ],
            editable: editable.value,
          }),
      ),
      { attachTo: document.body },
    )
    const descriptionsAction = () => target.value!
    await flushPromises()
    expect(descriptionsAction().startEditable('name')).toBe(true)
    expect(descriptionsAction().startEditable('note')).toBe(true)
    await nextTick()
    await wrapper.findAll('input')[0]!.setValue('Ada edited')
    await wrapper.findAll('input')[1]!.setValue('reject')
    expect(await descriptionsAction().saveEditable('name')).toBe(true)
    expect(descriptionsAction().getData()).toMatchObject({ name: 'Ada edited', note: 'First' })
    expect((wrapper.get('input').element as HTMLInputElement).value).toBe('reject')
    expect(await descriptionsAction().saveEditable('note')).toBe(false)
    expect(descriptionsAction().isEditable('note')).toBe(true)
    expect((wrapper.get('input').element as HTMLInputElement).value).toBe('reject')
    descriptionsAction().cancelEditable('note')
    await nextTick()
    expect(descriptionsAction().getData().note).toBe('First')
    expect(typeof formRef.value?.validateFields).toBe('function')
    editable.value = { type: 'multiple', onSave, formRef: replacement }
    await nextTick()
    expect(formRef.value).toBeUndefined()
    expect(typeof replacement.value?.validateFields).toBe('function')
    wrapper.unmount()
    wrapper = undefined
    expect(replacement.value).toBeUndefined()
  })

  it('honors controlled description keys and exposes custom editor dependencies/native form', async () => {
    const onChange = vi.fn()
    const editor = vi.fn((_schema, context, form) => {
      expect(context.dependencies).toEqual(['Ada'])
      expect(typeof form?.validateFields).toBe('function')
      return h('input', {
        'data-custom-editor': '',
        value: context.record.note,
        onInput: (event: Event) => context.update((event.target as HTMLInputElement).value),
      })
    })
    wrapper = mount(ProDescriptions<Row>, {
      attachTo: document.body,
      props: {
        dataSource: rows[0],
        columns: [
          { title: 'Name', dataIndex: 'name' },
          { title: 'Note', dataIndex: 'note', dependencies: ['name'], formItemRender: editor },
        ],
        editable: { editableKeys: [], onChange },
      },
    })
    await flushPromises()
    expect(descriptionsAction().startEditable('note')).toBe(true)
    expect(onChange.mock.calls[0]?.[0]).toEqual(['note'])
    expect(wrapper.find('input').exists()).toBe(false)
    await wrapper.setProps({ editable: { editableKeys: ['note'], onChange } })
    await wrapper.get('[data-custom-editor]').setValue('Custom')
    expect(await descriptionsAction().saveEditable('note')).toBe(true)
    expect(descriptionsAction().getData().note).toBe('Custom')
    expect(descriptionsAction().isEditable('note')).toBe(true)
    await wrapper.setProps({ editable: { editableKeys: [], onChange } })
    expect(wrapper.find('input').exists()).toBe(false)
    expect(editor).toHaveBeenCalled()
  })

  it('keeps descriptions data when requests fail and ignores stale results', async () => {
    const pending: Array<(value: { data: Row }) => void> = []
    const request = vi.fn(() => new Promise<{ data: Row }>((resolve) => pending.push(resolve)))
    wrapper = mount(ProDescriptions<Row>, {
      attachTo: document.body,
      props: {
        columns: [{ title: 'Name', dataIndex: 'name' }],
        dataSource: rows[0],
        request,
        params: { id: 1 },
      },
    })
    await wrapper.setProps({ params: { id: 2 } })
    pending[1]!({ data: rows[1]! })
    await flushPromises()
    pending[0]!({ data: rows[0]! })
    await flushPromises()
    expect(descriptionsAction().getData().name).toBe('Grace')
    await wrapper.setProps({
      request: async () => {
        throw new Error('offline')
      },
    })
    await flushPromises()
    expect(descriptionsAction().getData().name).toBe('Grace')
    expect(wrapper.emitted('requestError')?.[0]?.[0]).toBeInstanceOf(Error)
  })
})

describe('table enhancements and card compositions', () => {
  const columns: ProColumns<Row>[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      formItemProps: { rules: [{ required: true, message: 'Name required' }] },
    },
    { title: 'Note', dataIndex: 'note' },
  ]
  it.each([
    { name: 'row', component: RowEditorTable<Row> },
    { name: 'cell', component: CellEditorTable<Row> },
  ])('edits and updates v-model:dataSource in $name editor tables', async ({ component }) => {
    const model = ref([...rows])
    const target = shallowRef<ProTableInstance<Row>>()
    const update = vi.fn((value: Row[]) => {
      model.value = value
    })
    wrapper = mount(
      defineComponent(
        () => () =>
          h(component, {
            ref: target,
            columns,
            dataSource: model.value,
            'onUpdate:dataSource': update,
          }),
      ),
      { attachTo: document.body },
    )
    await flushPromises()
    expect(wrapper.findAll('tbody tr[data-row-key]')).toHaveLength(2)
    expect(target.value!.startEditable(1)).toBe(true)
    await nextTick()
    await wrapper.get('input').setValue('Model saved')
    expect(await target.value!.saveEditable(1)).toBe(true)
    await nextTick()
    expect(model.value[0]?.name).toBe('Model saved')
    expect(wrapper.text()).toContain('Model saved')
    model.value = [{ id: 3, name: 'Parent updated', note: 'Third' }]
    await nextTick()
    expect(wrapper.text()).toContain('Parent updated')
    expect(target.value!.getRowsData()).toHaveLength(1)
  })

  it('blocks cell switching on validation failure and commits valid edits before switching', async () => {
    const onSave = vi.fn()
    const onRowEditStart = vi.fn()
    const onRowEditEnd = vi.fn()
    wrapper = mount(CellEditorTable<Row>, {
      attachTo: document.body,
      props: { columns, defaultValue: rows, editable: { onSave }, onRowEditStart, onRowEditEnd },
    })
    await flushPromises()
    const cells = () => wrapper!.findAll('tbody tr[data-row-key="1"] td')
    await cells()[0]!.trigger('dblclick')
    await flushPromises()
    expect(wrapper.findAll('input')).toHaveLength(1)
    await wrapper.get('input').setValue('')
    await cells()[1]!.trigger('dblclick')
    await flushPromises()
    expect(cells()[0]!.find('input').exists()).toBe(true)
    expect(cells()[1]!.find('input').exists()).toBe(false)
    expect(onSave).not.toHaveBeenCalled()
    await wrapper.get('input').setValue('Cell saved')
    await cells()[1]!.trigger('dblclick')
    await flushPromises()
    expect(onSave).toHaveBeenCalledTimes(1)
    expect(cells()[1]!.find('input').exists()).toBe(true)
    expect(tableAction().getRowsData()[0]?.name).toBe('Cell saved')
    expect(onRowEditStart).toHaveBeenCalledTimes(2)
    expect(onRowEditEnd).toHaveBeenCalledTimes(1)
    tableAction().cancelEditable(1)
    await nextTick()
    expect(onRowEditEnd).toHaveBeenCalledTimes(2)
    expect(wrapper.find('input').exists()).toBe(false)
    expect(tableAction().startEditable(1)).toBe(true)
  })

  it('distinguishes repeated dataIndex columns and emits operation-cell lifecycle once', async () => {
    const onRowEditEnd = vi.fn()
    wrapper = mount(CellEditorTable<Row>, {
      attachTo: document.body,
      props: {
        columns: [
          { title: 'First name', dataIndex: 'name' },
          { title: 'Second name', dataIndex: 'name' },
        ],
        defaultValue: rows,
        onRowEditEnd,
      },
    })
    await flushPromises()
    const cells = () => wrapper!.findAll('tbody tr[data-row-key="1"] td')
    await cells()[0]!.trigger('dblclick')
    await nextTick()
    expect(cells()[0]!.find('input').exists()).toBe(true)
    expect(cells()[1]!.find('input').exists()).toBe(false)
    await wrapper.get('input').setValue('Saved once')
    await cells()[1]!.trigger('dblclick')
    await flushPromises()
    expect(cells()[0]!.find('input').exists()).toBe(false)
    expect(cells()[1]!.find('input').exists()).toBe(true)
    expect(onRowEditEnd).toHaveBeenCalledTimes(1)
    await cells()
      .at(-1)!
      .findAll('button')
      .find((button) => button.text() === '取消')!
      .trigger('click')
    await nextTick()
    expect(onRowEditEnd).toHaveBeenCalledTimes(2)
    expect(wrapper.find('input').exists()).toBe(false)
    wrapper.unmount()
    onRowEditEnd.mockClear()
    wrapper = mount(RowEditorTable<Row>, {
      attachTo: document.body,
      props: { columns, defaultValue: rows, onRowEditEnd },
    })
    await flushPromises()
    expect(tableAction().startEditable(1)).toBe(true)
    await nextTick()
    await wrapper.get('input').setValue('Operation saved')
    await wrapper
      .findAll('tbody tr[data-row-key="1"] button')
      .find((button) => button.text() === '保存')!
      .trigger('click')
    await flushPromises()
    expect(onRowEditEnd).toHaveBeenCalledTimes(1)
    expect(onRowEditEnd.mock.calls[0]?.[1].name).toBe('Operation saved')
    expect(await tableAction().saveEditable(1)).toBe(false)
    expect(onRowEditEnd).toHaveBeenCalledTimes(1)
  })

  it('applies real card borders and setting groups/custom icons/title render/options callbacks', async () => {
    const reload = vi.fn()
    const fullScreen = vi.fn()
    wrapper = mount(ProTable, {
      attachTo: document.body,
      props: {
        columns: [
          { title: 'Name', dataIndex: 'name', fixed: 'left' },
          { title: 'Note', dataIndex: 'note' },
          { title: 'ID', dataIndex: 'id', fixed: 'right' },
        ],
        dataSource: rows,
        cardBordered: true,
        search: { defaultCollapsed: false },
        pagination: false,
        options: {
          reload,
          fullScreen,
          setting: {
            settingIcon: h('i', { 'data-custom-setting-icon': '' }, 'settings'),
            listItemTitleRender: (title: VNodeChild, column: ProColumns<Record<string, unknown>>) =>
              h('strong', { 'data-setting-title': String(column.dataIndex) }, [title]),
            showListItemOption: false,
          },
        },
      },
    })
    await flushPromises()
    expect(getComputedStyle(wrapper.get('[data-pro-table-search]').element).borderTopWidth).toBe(
      '1px',
    )
    expect(getComputedStyle(wrapper.get('[data-pro-table-container]').element).borderTopWidth).toBe(
      '1px',
    )
    await wrapper.setProps({ cardBordered: false })
    expect(getComputedStyle(wrapper.get('[data-pro-table-search]').element).borderTopWidth).toBe(
      '0px',
    )
    expect(getComputedStyle(wrapper.get('[data-pro-table-container]').element).borderTopWidth).toBe(
      '0px',
    )
    await wrapper.get('button[aria-label="刷新"]').trigger('click')
    await wrapper.get('button[aria-label="全屏"]').trigger('click')
    expect(reload).toHaveBeenCalledTimes(1)
    expect(fullScreen).toHaveBeenCalledTimes(1)
    expect(typeof reload.mock.calls[0]?.[1].reload).toBe('function')
    await wrapper.get('[data-custom-setting-icon]').trigger('click')
    await flushPromises()
    expect(
      wrapper.findAll('.ant-pro-table-column-setting-list-title').map((item) => item.text()),
    ).toEqual(['固定在左侧', '不固定', '固定在右侧'])
    expect(wrapper.findAll('[data-setting-title]')).toHaveLength(3)
    expect(wrapper.find('.ant-pro-table-column-setting-list-item-option').exists()).toBe(false)
  })

  it('uses independent row blur timers while preserving focus changes inside a row', async () => {
    const onSave = vi.fn()
    wrapper = mount(RowEditorTable<Row>, {
      attachTo: document.body,
      props: { columns, defaultValue: rows, editable: { type: 'multiple', onSave } },
    })
    await flushPromises()
    const first = wrapper.get('tbody tr[data-row-key="1"]')
    const second = wrapper.get('tbody tr[data-row-key="2"]')
    await first.trigger('dblclick')
    await second.trigger('dblclick')
    await nextTick()
    await first.findAll('input')[0]!.setValue('Row saved')
    await first.trigger('focusout', { relatedTarget: first.findAll('input')[1]!.element })
    await new Promise((resolve) => setTimeout(resolve, 180))
    expect(onSave).not.toHaveBeenCalled()
    await first.trigger('focusout', { relatedTarget: second.get('input').element })
    await second.trigger('focusin')
    await vi.waitFor(() => expect(onSave).toHaveBeenCalledTimes(1))
    expect(onSave.mock.calls[0]?.[0]).toBe(1)
    expect(first.find('input').exists()).toBe(false)
    expect(second.find('input').exists()).toBe(true)
    expect(tableAction().getRowsData()[0]?.name).toBe('Row saved')
  })

  it('sorts using keyboard and drag while controlled data waits for parent updates', async () => {
    const onDragSortEnd = vi.fn()
    wrapper = mount(DragSortTable<Row>, {
      attachTo: document.body,
      props: {
        columns,
        dataSource: rows,
        search: false,
        toolbar: false,
        pagination: false,
        onDragSortEnd,
      },
    })
    await flushPromises()
    await wrapper
      .findAll('[data-pro-table-drag-handle]')[0]!
      .trigger('keydown', { key: 'ArrowDown' })
    expect(onDragSortEnd).toHaveBeenCalledTimes(1)
    expect(onDragSortEnd.mock.calls[0]?.slice(0, 2)).toEqual([0, 1])
    const moved = onDragSortEnd.mock.calls[0]?.[2] as Row[]
    expect(moved.map((row) => row.id)).toEqual([2, 1])
    expect(
      tableAction()
        .getRowsData()
        .map((row) => row.id),
    ).toEqual([1, 2])
    await wrapper.setProps({ dataSource: moved })
    expect(
      tableAction()
        .getRowsData()
        .map((row) => row.id),
    ).toEqual([2, 1])
    await wrapper.findAll('[data-pro-table-drag-handle]')[0]!.trigger('dragstart')
    await wrapper.get('tbody tr[data-row-key="1"]').trigger('drop')
    expect(onDragSortEnd).toHaveBeenCalledTimes(2)
    expect(onDragSortEnd.mock.calls[1]?.[2].map((row: Row) => row.id)).toEqual([1, 2])
  })

  it('renders responsive card column wrappers, tabs members and separators', async () => {
    expect(ProCard.isProCard).toBe(true)
    expect(ProCard.TabPane).toBe(ProCardTabPane)
    wrapper = mount(ProCardGroup, {
      attachTo: document.body,
      attrs: { split: 'vertical', gutter: 16 },
      slots: {
        default: () => [
          h(ProCard, { colSpan: { xs: 24, md: 12 }, title: 'One' }, () => 'First'),
          h(ProCardDivider),
          h(ProCard, { colSpan: 12 }, () => 'Second'),
        ],
      },
    })
    expect(wrapper.findAll('[data-pro-card-col]')).toHaveLength(2)
    expect(wrapper.get('[data-pro-card-col]').classes()).toContain('ant-pro-card-col')
    expect(wrapper.get('[role=separator]').attributes('aria-orientation')).toBe('vertical')
    wrapper.unmount()
    wrapper = mount(ProCard, {
      attachTo: document.body,
      props: { tabs: { defaultActiveKey: 'b' } },
      slots: {
        default: () => [
          h(ProCardTabPane, { key: 'a', tab: 'Alpha' }, () => 'Alpha body'),
          h(ProCardTabPane, { key: 'b', tab: 'Beta' }, () => 'Beta body'),
        ],
      },
    })
    expect(wrapper.get('[role=tab][aria-selected=true]').text()).toBe('Beta')
    expect(wrapper.text()).toContain('Beta body')
    await wrapper.findAll('[role=tab]')[0]!.trigger('click')
    expect(wrapper.get('[role=tab][aria-selected=true]').text()).toBe('Alpha')
  })
})

describe('auxiliary components', () => {
  it('routes Search loading to the query button and respects explicit submitter overrides', async () => {
    wrapper = mount(Search, {
      attachTo: document.body,
      props: { columns: [{ title: 'Name', dataIndex: 'name' }], loading: true },
    })
    await flushPromises()
    expect(wrapper.find('button.ant-btn-loading').exists()).toBe(true)
    await wrapper.setProps({ loading: false })
    expect(wrapper.find('button.ant-btn-loading').exists()).toBe(false)
    await wrapper.setProps({
      loading: true,
      form: { submitter: { submitButtonProps: { loading: false } } },
    })
    expect(wrapper.find('button.ant-btn-loading').exists()).toBe(false)
    await wrapper.setProps({ form: { submitter: false } })
    expect(wrapper.find('button[type=submit]').exists()).toBe(false)
  })

  it('reacts to native prefix/locale/RTL and Pro tokens with semantic callback precedence', async () => {
    const prefix = ref('demo')
    const padding = ref(30)
    const clear = vi.fn()
    wrapper = mount(
      defineComponent(
        () => () =>
          h(ConfigProvider, { prefixCls: prefix.value, direction: 'rtl', locale: enUS }, () =>
            h(ProConfigProvider, { token: { paddingLG: padding.value } }, () => [
              h(DropdownFooter, {
                onClear: clear,
                classNames: { root: 'legacy' },
                classes: ({ props }: { props: DropdownFooterProps }) => ({
                  root: props.disabled ? 'disabled' : 'current',
                }),
                styles: { root: { borderWidth: '3px' } },
              }),
              h(ListToolBar, { title: 'Tools' }),
            ]),
          ),
      ),
      { attachTo: document.body },
    )
    await flushPromises()
    const footer = wrapper.get('[data-pro-dropdown-footer]')
    expect(footer.classes()).toContain('demo-pro-core-field-dropdown-footer')
    expect(footer.classes()).toContain('current')
    expect(footer.classes()).not.toContain('legacy')
    expect(footer.attributes('dir')).toBe('rtl')
    expect(footer.text()).toContain('Clear')
    await footer.findAll('button')[0]!.trigger('click')
    expect(clear).toHaveBeenCalledTimes(1)
    expect(getComputedStyle(wrapper.get('[data-pro-toolbar]').element).paddingTop).toBe('20px')
    padding.value = 45
    prefix.value = 'changed'
    await flushPromises()
    expect(footer.classes()).toContain('changed-pro-core-field-dropdown-footer')
    expect(getComputedStyle(wrapper.get('[data-pro-toolbar]').element).paddingTop).toBe('30px')
  })

  it('calls toolbar search/tab/menu callbacks once and renders multiple-line structure', async () => {
    const search = vi.fn()
    const tabs = vi.fn()
    const menu = vi.fn()
    wrapper = mount(ListToolBar, {
      attachTo: document.body,
      props: {
        title: 'Tools',
        multipleLine: true,
        search: { onSearch: search },
        tabs: {
          items: [
            { key: 'a', label: 'A' },
            { key: 'b', label: 'B' },
          ],
          onChange: tabs,
        },
        menu: {
          type: 'tab',
          items: [
            { key: 'x', label: 'X' },
            { key: 'y', label: 'Y' },
          ],
          onChange: menu,
        },
        filter: h('span', 'Filters'),
      },
    })
    await wrapper.get('input').setValue('Ada')
    await wrapper.get('.ant-input-search-btn').trigger('click')
    await flushPromises()
    expect(search).toHaveBeenCalledTimes(1)
    expect(wrapper.emitted('search')).toEqual([['Ada']])
    await wrapper
      .findAll('[role=tab]')
      .find((tab) => tab.text() === 'B')!
      .trigger('click')
    expect(tabs).toHaveBeenCalledTimes(1)
    await wrapper
      .findAll('[role=tab]')
      .find((tab) => tab.text() === 'Y')!
      .trigger('click')
    expect(menu).toHaveBeenCalledTimes(1)
    expect(wrapper.get('[data-pro-toolbar]').classes()).toContain(
      'ant-pro-table-list-toolbar-multiple-line',
    )
    expect(wrapper.get('[data-pro-toolbar-extra-line]').text()).toContain('Filters')
  })

  it('keeps controlled dropdown state and invokes native open listeners once', async () => {
    const changed = vi.fn()
    wrapper = mount(FilterDropdown, {
      attachTo: document.body,
      props: { label: 'Filter', open: false, footer: {}, popoverProps: { onOpenChange: changed } },
      slots: { default: () => h('input') },
    })
    wrapper.findComponent(Popover).vm.$emit('openChange', true)
    await nextTick()
    expect(changed).toHaveBeenCalledTimes(1)
    expect(wrapper.findComponent(Popover).props('open')).toBe(false)
    await wrapper.setProps({ open: true })
    await flushPromises()
    expect(document.querySelector('[data-pro-dropdown-footer]')?.textContent).toContain('确认')
    expect(wrapper.findComponent(Popover).props('open')).toBe(true)
    await wrapper.setProps({ open: undefined })
    wrapper.findComponent(Popover).vm.$emit('openChange', true)
    await nextTick()
    expect(wrapper.findComponent(Popover).props('open')).toBe(true)
  })

  it('renders table dropdown actions and recovers a real rendering error', async () => {
    const select = vi.fn()
    wrapper = mount(TableDropdown, {
      attachTo: document.body,
      props: { menus: [{ key: 'archive', name: 'Archive' }], onSelect: select },
    })
    await wrapper.get('[data-pro-table-dropdown]').trigger('mouseenter')
    await vi.waitFor(() => expect(document.querySelector('[role=menuitem]')).not.toBeNull())
    ;(document.querySelector('[role=menuitem]') as HTMLElement).click()
    await flushPromises()
    expect(select).toHaveBeenCalledOnce()
    expect(select).toHaveBeenCalledWith('archive')
    wrapper.unmount()
    const failed = ref(true)
    const Child = defineComponent(() => () => {
      if (failed.value) throw new Error('render failed')
      return h('span', 'Recovered')
    })
    wrapper = mount(ErrorBoundary, {
      attachTo: document.body,
      props: {
        fallback: (error: Error, reset: () => void) =>
          h(
            'button',
            {
              onClick: () => {
                failed.value = false
                reset()
              },
            },
            error.message,
          ),
      },
      slots: { default: () => h(Child) },
    })
    await nextTick()
    expect(wrapper.text()).toContain('render failed')
    await wrapper.get('button').trigger('click')
    expect(wrapper.text()).toContain('Recovered')
  })
})
