import type { VueWrapper } from '@vue/test-utils'

import type { ProFilter, ProSort, ProTableInstance } from '../src/types'
import { flushPromises, mount } from '@vue/test-utils'
import { ConfigProvider, Table, theme } from 'antdv-next'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'

import { defineComponent, h, nextTick } from 'vue'

import EditableProTable from '../src/EditableProTable.vue'
import ProCard from '../src/ProCard.vue'
import ProTable from '../src/ProTable.vue'
import { resolveCssVariableColor } from './helpers/themeProbe'
import '../src/style.css'

interface Row extends Record<string, unknown> {
  id: number
  name: string
  status?: string
}

interface ExtendedProTableInstance extends ProTableInstance<Row> {
  getRowsData: () => Row[]
}

interface RequestResult {
  data: Row[]
  total: number
}

let wrapper: VueWrapper | undefined
const initialClipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard')
const columnsStateStorageKey = 'antdv-next-pro:test:capabilities:columns-state'

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  document.body.innerHTML = ''
  window.localStorage.removeItem(columnsStateStorageKey)

  if (initialClipboardDescriptor) {
    Object.defineProperty(navigator, 'clipboard', initialClipboardDescriptor)
  } else {
    Reflect.deleteProperty(navigator, 'clipboard')
  }

  vi.restoreAllMocks()
})

function buttonByText(text: string) {
  const normalizeName = (value?: string) => value?.replace(/\s+/g, '').trim()
  const button = wrapper?.findAll('button').find((candidate) => {
    const names = [
      candidate.text(),
      candidate.attributes('title'),
      candidate.attributes('aria-label'),
    ]
    return names.some((name) => normalizeName(name) === normalizeName(text))
  })
  if (!button) throw new Error(`Button not found: ${text}`)
  return button
}

describe('ProTable browser capabilities', () => {
  it('preserves editable toolbar slots by default and hides them only when explicitly disabled', async () => {
    wrapper = mount(EditableProTable, {
      attachTo: document.body,
      props: {
        columns: [{ title: 'Name', dataIndex: 'name' }],
        value: [{ id: 1, name: 'Ada' }],
      },
      slots: {
        'toolbar-title': () => h('strong', { 'data-testid': 'editable-title' }, 'Editable users'),
        'toolbar-actions': () => h('button', { 'data-testid': 'editable-action' }, 'Export'),
      },
    })
    await flushPromises()
    expect(wrapper.get('[data-testid="editable-title"]').text()).toBe('Editable users')
    expect(wrapper.get('[data-testid="editable-action"]').text()).toBe('Export')
    const table = wrapper.findComponent(ProTable)
    table
      .findComponent(Table)
      .vm.$emit('change', {}, { name: ['Ada'] }, { field: 'name', order: 'ascend' })
    await flushPromises()
    expect((wrapper.vm as unknown as ProTableInstance<Row>).getSortFilter()).toEqual({
      sort: { name: 'ascend' },
      filter: { name: ['Ada'] },
    })
    await wrapper.setProps({ toolbar: false })
    expect(wrapper.find('[data-pro-table-list-toolbar]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="editable-action"]').exists()).toBe(false)
  })

  it('places search before a themed card containing the toolbar, table and pagination', async () => {
    wrapper = mount(ProTable, {
      attachTo: document.body,
      props: {
        columns: [{ title: 'Name', dataIndex: 'name' }],
        dataSource: [{ id: 1, name: 'Ada' }],
        toolbar: { title: 'Users' },
      },
    })
    await flushPromises()
    const root = wrapper.element as HTMLElement
    const search = wrapper.get('[data-pro-table-search]').element
    const card = wrapper.get('[data-pro-table-container]').element
    expect(wrapper.findAllComponents(ProCard)).toHaveLength(2)
    expect(wrapper.find('[data-pro-card-header]').exists()).toBe(false)
    expect(search.nextElementSibling).toBe(card)
    expect(card.contains(wrapper.get('[data-pro-table-list-toolbar]').element)).toBe(true)
    expect(card.contains(wrapper.get('.ant-table-wrapper').element)).toBe(true)
    expect(card.contains(wrapper.get('[data-pro-table-pagination]').element)).toBe(true)
    expect(getComputedStyle(search).backgroundColor).toBe(
      resolveCssVariableColor(root, '--antdv-next-pro-color-bg-container'),
    )
    expect(getComputedStyle(card).backgroundColor).toBe(getComputedStyle(search).backgroundColor)
    expect(
      getComputedStyle(wrapper.get('[data-pro-table-search] .ant-pro-card-body').element).padding,
    ).toBe('24px')
    expect(
      getComputedStyle(wrapper.get('[data-pro-table-container] .ant-pro-card-body').element)
        .paddingTop,
    ).toBe('0px')
    expect(card.getBoundingClientRect().top).toBeGreaterThan(search.getBoundingClientRect().bottom)
  })

  it('submits and clears toolbar keywords even when the query form is disabled', async () => {
    const request = vi.fn(async (): Promise<RequestResult> => ({ data: [], total: 0 }))
    wrapper = mount(ProTable, {
      attachTo: document.body,
      props: {
        columns: [{ title: 'Name', dataIndex: 'name' }],
        request,
        search: false,
        options: { search: { name: 'q', placeholder: 'Find users' } },
        pagination: { defaultCurrent: 3 },
      },
    })
    await flushPromises()
    expect(wrapper.find('[data-pro-table-search]').exists()).toBe(false)
    await wrapper.get('[data-pro-table-toolbar-search] input').setValue('Ada')
    await wrapper.get('[data-pro-table-toolbar-search] .ant-input-search-btn').trigger('click')
    await flushPromises()
    expect(request).toHaveBeenLastCalledWith({ q: 'Ada', current: 1, pageSize: 10 }, {}, {})
    await (wrapper.vm as unknown as ProTableInstance<Row>).reset()
    await flushPromises()
    expect(request).toHaveBeenLastCalledWith({ current: 3, pageSize: 10 }, {}, {})
    expect(
      (wrapper.get('[data-pro-table-toolbar-search] input').element as HTMLInputElement).value,
    ).toBe('')
  })

  it('filters local rows with toolbar search and honors an async search veto', async () => {
    const onSearch = vi.fn(async (value: string) =>
      value === 'blocked' ? (false as const) : undefined,
    )
    wrapper = mount(ProTable, {
      attachTo: document.body,
      props: {
        columns: [{ title: 'Name', dataIndex: 'name' }],
        dataSource: [
          { id: 1, name: 'Ada' },
          { id: 2, name: 'Grace' },
        ],
        toolbar: { title: 'Users', search: { onSearch } },
        search: false,
        pagination: false,
      },
    })
    await flushPromises()
    await wrapper.get('[data-pro-table-toolbar-search] input').setValue('ada')
    await wrapper.get('[data-pro-table-toolbar-search] .ant-input-search-btn').trigger('click')
    await flushPromises()
    expect(wrapper.get('.ant-table-tbody').text()).toContain('Ada')
    expect(wrapper.get('.ant-table-tbody').text()).not.toContain('Grace')
    await wrapper.get('[data-pro-table-toolbar-search] input').setValue('blocked')
    await wrapper.get('[data-pro-table-toolbar-search] .ant-input-search-btn').trigger('click')
    await flushPromises()
    expect(onSearch).toHaveBeenLastCalledWith('blocked')
    expect(wrapper.get('.ant-table-tbody').text()).toContain('Ada')
    await wrapper.get('[data-pro-table-toolbar-search] input').setValue('')
    await wrapper.get('[data-pro-table-toolbar-search] .ant-input-search-btn').trigger('click')
    await flushPromises()
    expect(wrapper.get('.ant-table-tbody').text()).toContain('Grace')
  })

  it('reflows a partially configured search grid when the container resizes', async () => {
    wrapper = mount(ProTable, {
      attachTo: document.body,
      props: {
        columns: [1, 2, 3, 4].map((id) => ({ title: `Field ${id}`, dataIndex: `field${id}` })),
        dataSource: [],
        search: { span: { xs: 24, md: 8 }, defaultCollapsed: true },
        pagination: false,
      },
    })
    const root = wrapper.element as HTMLElement
    root.style.width = '500px'
    await vi.waitFor(() =>
      expect(
        wrapper!.findAll('.ant-pro-query-filter-col').filter((field) => field.isVisible()),
      ).toHaveLength(1),
    )
    root.style.width = '1100px'
    await vi.waitFor(() =>
      expect(
        wrapper!.findAll('.ant-pro-query-filter-col').filter((field) => field.isVisible()),
      ).toHaveLength(2),
    )
  })

  it('applies postData only to rendered rows and preserves the source data', async () => {
    const source: Row[] = [
      { id: 1, name: 'Ada', status: 'active' },
      { id: 2, name: 'Grace', status: 'disabled' },
    ]
    const postData = vi.fn((rows: Record<string, unknown>[]) =>
      rows
        .filter((row) => row.status === 'active')
        .map((row) => ({ ...row, name: `${String(row.name)} (processed)` })),
    )

    wrapper = mount(ProTable, {
      attachTo: document.body,
      props: {
        columns: [{ title: 'Name', dataIndex: 'name' }],
        dataSource: source,
        postData,
        rowKey: 'id',
        search: false,
        pagination: false,
        options: false,
      },
    })
    await flushPromises()

    const table = wrapper.vm as unknown as ExtendedProTableInstance
    expect(wrapper.text()).toContain('Ada (processed)')
    expect(wrapper.text()).not.toContain('Grace')
    expect(postData).toHaveBeenCalled()
    expect(postData.mock.calls.at(-1)?.[0]).not.toBe(source)
    expect(source).toEqual([
      { id: 1, name: 'Ada', status: 'active' },
      { id: 2, name: 'Grace', status: 'disabled' },
    ])
    expect(table.getRowsData()).toEqual(source)
  })

  it('reports rejected requests, clears loading and keeps the previous rows', async () => {
    const error = new Error('network unavailable')
    let rejectRequest: ((reason?: unknown) => void) | undefined
    const request = vi.fn(
      () =>
        new Promise<RequestResult>((_resolve, reject) => {
          rejectRequest = reject
        }),
    )

    wrapper = mount(ProTable, {
      attachTo: document.body,
      props: {
        columns: [{ title: 'Name', dataIndex: 'name' }],
        dataSource: [{ id: 1, name: 'cached row' }],
        request,
        manualRequest: true,
        rowKey: 'id',
        search: false,
        pagination: false,
        options: false,
      },
    })
    await flushPromises()
    const table = wrapper.vm as unknown as ExtendedProTableInstance

    const pendingReload = table.reload()
    await nextTick()
    expect(wrapper.findComponent(Table).props('loading')).toBe(true)

    rejectRequest?.(error)
    await pendingReload
    await nextTick()

    expect(wrapper.findComponent(Table).props('loading')).toBe(false)
    expect(wrapper.text()).toContain('cached row')
    expect(table.getRowsData()).toEqual([{ id: 1, name: 'cached row' }])
    expect(wrapper.emitted('requestError')?.at(-1)).toEqual([error])
  })

  it('supports setPageInfo, clearSelected and reset through the exposed ref API', async () => {
    const request = vi.fn(
      async (
        _params: Record<string, unknown>,
        _sort: ProSort,
        _filter: ProFilter,
      ): Promise<RequestResult> => ({
        data: [{ id: 1, name: 'Ada', status: 'active' }],
        total: 100,
      }),
    )
    const onSelectionChange = vi.fn()

    wrapper = mount(ProTable, {
      attachTo: document.body,
      props: {
        columns: [
          { title: 'Name', dataIndex: 'name', sorter: true },
          {
            title: 'Status',
            dataIndex: 'status',
            filters: [{ text: 'Active', value: 'active' }],
          },
        ],
        dataSource: [{ id: 1, name: 'Ada', status: 'active' }],
        request,
        manualRequest: true,
        rowKey: 'id',
        rowSelection: { onChange: onSelectionChange },
        search: false,
        pagination: {
          defaultCurrent: 2,
          defaultPageSize: 5,
          showSizeChanger: false,
        },
        options: false,
      },
    })
    await flushPromises()
    const table = wrapper.vm as unknown as ExtendedProTableInstance

    wrapper
      .findComponent(Table)
      .vm.$emit(
        'change',
        {},
        { status: ['active'] },
        { columnKey: 'name', field: 'name', order: 'descend' },
      )
    await flushPromises()

    expect(table.getSortFilter()).toEqual({
      sort: { name: 'descend' },
      filter: { status: ['active'] },
    })
    const snapshot = table.getSortFilter()
    snapshot.sort.name = 'ascend'
    snapshot.filter.status?.push('disabled')
    expect(table.getSortFilter()).toEqual({
      sort: { name: 'descend' },
      filter: { status: ['active'] },
    })

    table.setPageInfo({ current: 3, pageSize: 20 })
    await flushPromises()

    expect(request).toHaveBeenLastCalledWith(
      expect.objectContaining({ current: 3, pageSize: 20 }),
      { name: 'descend' },
      { status: ['active'] },
    )
    expect(wrapper.emitted('change')?.at(-1)).toEqual([
      expect.objectContaining({ current: 3, pageSize: 20 }),
      { status: ['active'] },
      { name: 'descend' },
    ])

    const rowSelection = wrapper.findComponent(Table).props('rowSelection') as {
      selectedRowKeys: Array<string | number>
      onChange: (keys: Array<string | number>, rows: Row[]) => void
    }
    rowSelection.onChange([1], [{ id: 1, name: 'Ada', status: 'active' }])
    await nextTick()
    expect(
      (
        wrapper.findComponent(Table).props('rowSelection') as {
          selectedRowKeys: Array<string | number>
        }
      ).selectedRowKeys,
    ).toEqual([1])

    table.clearSelected()
    await nextTick()
    expect(
      (
        wrapper.findComponent(Table).props('rowSelection') as {
          selectedRowKeys: Array<string | number>
        }
      ).selectedRowKeys,
    ).toEqual([])
    expect(onSelectionChange).toHaveBeenLastCalledWith([], [], { type: 'none' })
    expect(wrapper.emitted('selectionChange')?.at(-1)).toEqual([[], []])

    await table.reset()
    await flushPromises()
    expect(request).toHaveBeenLastCalledWith(
      expect.objectContaining({ current: 2, pageSize: 5 }),
      {},
      {},
    )
  })

  it('uses custom search labels and restores local rows when reset', async () => {
    wrapper = mount(ProTable, {
      attachTo: document.body,
      props: {
        columns: [
          {
            title: 'Name',
            dataIndex: 'name',
            fieldProps: { 'data-testid': 'search-name' },
          },
        ],
        dataSource: [
          { id: 1, name: 'Ada' },
          { id: 2, name: 'Grace' },
        ],
        rowKey: 'id',
        search: { searchText: '应用筛选', resetText: '清空条件' },
        pagination: false,
        options: false,
      },
    })
    await flushPromises()

    expect(buttonByText('应用筛选').exists()).toBe(true)
    expect(buttonByText('清空条件').exists()).toBe(true)
    await wrapper.get('[data-testid="search-name"]').setValue('Ada')
    await buttonByText('应用筛选').trigger('click')
    await flushPromises()

    expect(wrapper.findAll('tbody tr.ant-table-row')).toHaveLength(1)
    expect(wrapper.text()).not.toContain('Grace')

    await buttonByText('清空条件').trigger('click')
    await flushPromises()

    expect((wrapper.get('[data-testid="search-name"]').element as HTMLInputElement).value).toBe('')
    expect(wrapper.findAll('tbody tr.ant-table-row')).toHaveLength(2)
    expect(wrapper.text()).toContain('Grace')
  })

  it('localizes built-in search, collapse and toolbar option labels', async () => {
    wrapper = mount(ProTable, {
      attachTo: document.body,
      props: {
        columns: [1, 2, 3, 4].map((index) => ({
          title: `Field ${index}`,
          dataIndex: `field${index}`,
        })),
        dataSource: [],
        search: { defaultCollapsed: true, span: 12 },
        pagination: false,
        options: { fullScreen: true },
        localeText: {
          search: 'Search',
          reset: 'Reset',
          expand: 'Expand',
          collapse: 'Collapse',
          density: 'Density',
          densityDefault: 'Default density',
          densityCompact: 'Compact density',
          densityLoose: 'Loose density',
          fullScreen: 'Fullscreen',
          reload: 'Reload',
          setting: 'Column settings',
          columnDisplay: 'Columns',
          columnDrag: 'Drag to reorder',
        },
      },
    })
    await flushPromises()

    expect(buttonByText('Search').exists()).toBe(true)
    expect(buttonByText('Reset').exists()).toBe(true)
    expect(buttonByText('Expand').exists()).toBe(true)
    const collapseIcon = buttonByText('Expand').get('[data-icon="down"]').element
      .parentElement as HTMLElement
    expect(collapseIcon.style.transform).toBe('rotate(0turn)')
    expect(collapseIcon.style.marginInlineStart).toBe('0.5em')
    expect(collapseIcon.style.transitionDuration).toBe('0.3s')
    expect(collapseIcon.style.transitionProperty).toBe('all')
    expect(buttonByText('Reload').exists()).toBe(true)
    expect(buttonByText('Fullscreen').exists()).toBe(true)

    await buttonByText('Expand').trigger('click')
    expect(buttonByText('Collapse').exists()).toBe(true)
    expect(buttonByText('Collapse').get('[data-icon="down"]').element.parentElement).toBe(
      collapseIcon,
    )
    expect(collapseIcon.style.transform).toBe('rotate(0.5turn)')

    await buttonByText('Density').trigger('click')
    await vi.waitFor(() => expect(buttonByText('Compact density').exists()).toBe(true))
    await buttonByText('Compact density').trigger('click')
    expect(wrapper.findComponent(Table).props('size')).toBe('small')

    await buttonByText('Column settings').trigger('click')
    await vi.waitFor(() =>
      expect(wrapper!.get('[data-pro-table-column-settings]').text()).toContain('Field 1'),
    )
    expect(wrapper.get('[data-pro-table-column-settings-header]').text()).toContain('Columns')
    expect(wrapper.get('[data-pro-table-column-drag-handle]').attributes('aria-label')).toBe(
      'Drag to reorder',
    )
  })

  it('prefers search-specific labels and falls back for partial localeText', async () => {
    wrapper = mount(ProTable, {
      attachTo: document.body,
      props: {
        columns: [1, 2, 3, 4].map((index) => ({
          title: `Field ${index}`,
          dataIndex: `field${index}`,
        })),
        dataSource: [],
        search: {
          defaultCollapsed: true,
          span: 12,
          searchText: 'Run query',
          resetText: 'Clear query',
        },
        pagination: false,
        localeText: {
          search: 'Locale search',
          setting: 'Settings',
        },
      },
    })
    await flushPromises()

    expect(buttonByText('Run query').exists()).toBe(true)
    expect(buttonByText('Clear query').exists()).toBe(true)
    expect(wrapper.text()).not.toContain('Locale search')
    expect(buttonByText('展开').exists()).toBe(true)
    expect(buttonByText('密度').exists()).toBe(true)
    expect(buttonByText('刷新').exists()).toBe(true)
    expect(wrapper.find('button[aria-label="全屏"]').exists()).toBe(false)
    expect(buttonByText('Settings').exists()).toBe(true)
  })

  it('uses Antdv theme tokens for ProTable containers in dark mode', async () => {
    const DarkThemeHost = defineComponent({
      setup() {
        return () =>
          h(
            ConfigProvider,
            { theme: { algorithm: theme.darkAlgorithm } },
            {
              default: () =>
                h(ProTable, {
                  columns: [{ title: 'Name', dataIndex: 'name' }],
                  dataSource: [{ id: 1, name: 'Ada' }],
                  rowKey: 'id',
                  pagination: false,
                }),
            },
          )
      },
    })

    wrapper = mount(DarkThemeHost, { attachTo: document.body })
    await flushPromises()
    await wrapper.get('button[aria-label="列设置"]').trigger('click')
    await vi.waitFor(() =>
      expect(wrapper!.find('[data-pro-table-column-settings]').exists()).toBe(true),
    )

    const root = wrapper.get('[data-pro-table]').element as HTMLElement
    const settings = wrapper.get('[data-pro-table-column-settings]').element as HTMLElement
    const search = wrapper.get('[data-pro-table-search]').element as HTMLElement
    expect(root.style.getPropertyValue('--antdv-next-pro-color-bg-elevated')).not.toBe('')
    expect(getComputedStyle(settings).backgroundColor).toBe(
      resolveCssVariableColor(root, '--antdv-next-pro-color-bg-elevated'),
    )
    expect(getComputedStyle(search).backgroundColor).toBe(
      resolveCssVariableColor(root, '--antdv-next-pro-color-bg-container'),
    )
    expect(
      getComputedStyle(wrapper.get('[data-pro-table-container]').element).backgroundColor,
    ).toBe(getComputedStyle(search).backgroundColor)
  })

  it('ignores stale internal search values while search is disabled', async () => {
    const request = vi.fn(async (params: Record<string, unknown>): Promise<RequestResult> => ({
      data: [{ id: 1, name: typeof params.name === 'string' ? params.name : 'all' }],
      total: 1,
    }))

    wrapper = mount(ProTable, {
      attachTo: document.body,
      props: {
        columns: [
          {
            title: 'Name',
            dataIndex: 'name',
            fieldProps: { 'data-testid': 'search-name' },
          },
        ],
        request,
        rowKey: 'id',
        search: { defaultCollapsed: false },
        pagination: false,
        options: false,
      },
    })
    await flushPromises()

    await wrapper.get('[data-testid="search-name"]').setValue('Ada')
    await buttonByText('查询').trigger('click')
    await flushPromises()
    await vi.waitFor(() => expect(request.mock.calls.at(-1)?.[0]).toEqual({ name: 'Ada' }))

    await wrapper.setProps({ search: false, params: { name: 'Grace' } })
    await flushPromises()
    expect(request.mock.calls.at(-1)?.[0]).toEqual({ name: 'Grace' })
  })

  it('restores local rows when a populated search form is disabled', async () => {
    wrapper = mount(ProTable, {
      attachTo: document.body,
      props: {
        columns: [
          {
            title: 'Name',
            dataIndex: 'name',
            fieldProps: { 'data-testid': 'search-name' },
          },
        ],
        dataSource: [
          { id: 1, name: 'Ada' },
          { id: 2, name: 'Grace' },
        ],
        rowKey: 'id',
        search: { defaultCollapsed: false },
        pagination: false,
        options: false,
      },
    })
    await flushPromises()

    await wrapper.get('[data-testid="search-name"]').setValue('Ada')
    await buttonByText('查询').trigger('click')
    await flushPromises()
    expect(wrapper.findAll('tbody tr.ant-table-row')).toHaveLength(1)

    await wrapper.setProps({ search: false })
    await flushPromises()
    expect(wrapper.findAll('tbody tr.ant-table-row')).toHaveLength(2)
  })

  it('applies columnsState visibility, order and fixed positions to the rendered table', async () => {
    const persistedState = {
      status: { fixed: 'left' as const, order: 0 },
      age: { show: false, order: 1 },
      name: { fixed: 'right' as const, order: 2 },
    }
    window.localStorage.setItem(columnsStateStorageKey, JSON.stringify(persistedState))

    wrapper = mount(ProTable, {
      attachTo: document.body,
      props: {
        columns: [
          { title: 'Name', dataIndex: 'name', width: 140 },
          { title: 'Status', dataIndex: 'status', width: 120 },
          { title: 'Age', dataIndex: 'age', width: 90 },
        ],
        dataSource: [{ id: 1, name: 'Ada', status: 'active', age: 36 }],
        rowKey: 'id',
        search: false,
        pagination: false,
        options: false,
        scroll: { x: 480 },
        columnsState: {
          persistenceKey: columnsStateStorageKey,
          persistenceType: 'localStorage',
          defaultValue: {
            name: { order: 0 },
            status: { order: 1 },
            age: { order: 2 },
          },
        },
      },
    })
    await flushPromises()

    const table = wrapper.findComponent(Table)
    const columns = table.props('columns') as Array<{ fixed?: string; title?: string }>
    expect(columns.map((column) => column.title)).toEqual(['Status', 'Name'])
    expect(columns.map((column) => column.fixed)).toEqual(['left', 'right'])
    expect(table.props('scroll')).toEqual({ x: 480 })
    expect(wrapper.findAll('thead th').map((cell) => cell.text())).not.toContain('Age')
  })

  it('selects density from a Popover without changing size when the menu is opened', async () => {
    wrapper = mount(ProTable, {
      attachTo: document.body,
      props: {
        columns: [{ title: 'Name', dataIndex: 'name' }],
        dataSource: [{ id: 1, name: 'Ada' }],
        rowKey: 'id',
        search: false,
        pagination: false,
        options: {
          density: true,
          fullScreen: false,
          reload: false,
          setting: false,
        },
      },
    })
    await flushPromises()

    expect(wrapper.findComponent(Table).props('size')).toBe('middle')
    await buttonByText('密度').trigger('click')
    await vi.waitFor(() => expect(wrapper!.find('[role="menu"]').exists()).toBe(true))
    expect(wrapper.findComponent(Table).props('size')).toBe('middle')
    expect(buttonByText('中等').attributes('aria-checked')).toBe('true')
    expect(wrapper.findAll('[role="menuitemradio"]').map((item) => item.text())).toEqual([
      '宽松',
      '中等',
      '紧凑',
    ])
    await buttonByText('紧凑').trigger('click')
    expect(wrapper.findComponent(Table).props('size')).toBe('small')
    expect(buttonByText('密度').attributes('aria-expanded')).toBe('false')

    await buttonByText('密度').trigger('click')
    await buttonByText('宽松').trigger('click')
    expect(wrapper.findComponent(Table).props('size')).toBe('large')

    await buttonByText('密度').trigger('click')
    await buttonByText('中等').trigger('click')
    expect(wrapper.findComponent(Table).props('size')).toBe('middle')
    expect(buttonByText('密度').exists()).toBe(true)
  })

  it('anchors column settings in a Popover and persists visibility, sorting and reset', async () => {
    const onChange = vi.fn()
    wrapper = mount(ProTable, {
      attachTo: document.body,
      props: {
        columns: [
          { title: 'Name', dataIndex: 'name' },
          { title: 'Status', dataIndex: 'status' },
          { title: 'Actions', key: 'actions', valueType: 'option' },
          { title: 'Hidden', dataIndex: 'hidden', hideInTable: true },
        ],
        dataSource: [{ id: 1, name: 'Ada', status: 'active' }],
        search: false,
        pagination: false,
        columnsState: {
          persistenceKey: columnsStateStorageKey,
          defaultValue: { name: { fixed: 'left' } },
          onChange,
        },
      },
    })
    await flushPromises()
    const tableTop = wrapper.get('table').element.getBoundingClientRect().top
    expect(wrapper.find('[data-pro-table-column-settings]').exists()).toBe(false)
    await buttonByText('列设置').trigger('click')
    await vi.waitFor(() =>
      expect(wrapper!.find('[data-pro-table-column-settings]').exists()).toBe(true),
    )
    const panel = wrapper.get('[data-pro-table-column-settings]')
    expect(panel.element.closest('.ant-popover')).not.toBeNull()
    expect(panel.text()).toContain('列展示')
    expect(panel.text()).not.toContain('Hidden')
    expect(panel.findAll('[data-pro-table-column-settings-item]')).toHaveLength(3)
    expect(wrapper.get('table').element.getBoundingClientRect().top).toBe(tableTop)

    await panel.get('[data-column-key="actions"] input').setValue(false)
    expect(wrapper.findAll('thead th').map((cell) => cell.text())).not.toContain('Actions')
    expect(panel.find('.ant-checkbox-indeterminate').exists()).toBe(true)
    expect(onChange).toHaveBeenLastCalledWith({ name: { fixed: 'left' }, actions: { show: false } })

    await panel
      .get('[data-column-key="status"] [data-pro-table-column-drag-handle]')
      .trigger('dragstart')
    await panel.get('[data-column-key="name"]').trigger('drop')
    expect(wrapper.findAll('thead th').map((cell) => cell.text())).toEqual(['Status', 'Name'])
    expect(JSON.parse(window.localStorage.getItem(columnsStateStorageKey)!)).toEqual({
      name: { fixed: 'left', order: 1 },
      status: { order: 0 },
      actions: { show: false, order: 2 },
    })

    await panel.get('[data-pro-table-column-settings-header] input').setValue(true)
    expect(wrapper.findAll('thead th').map((cell) => cell.text())).toEqual([
      'Status',
      'Name',
      'Actions',
    ])
    await panel.get('[data-pro-table-column-settings-header] input').setValue(false)
    expect(onChange).toHaveBeenLastCalledWith({
      name: { fixed: 'left', order: 1, show: false },
      status: { order: 0, show: false },
      actions: { order: 2, show: false },
    })
    await panel.get('[data-pro-table-column-settings-header] input').setValue(true)
    expect(wrapper.findAll('thead th').map((cell) => cell.text())).toEqual([
      'Status',
      'Name',
      'Actions',
    ])

    await buttonByText('重置').trigger('click')
    expect(wrapper.findAll('thead th').map((cell) => cell.text())).toEqual([
      'Name',
      'Status',
      'Actions',
    ])
    expect(JSON.parse(window.localStorage.getItem(columnsStateStorageKey)!)).toEqual({
      name: { fixed: 'left' },
    })

    await panel.trigger('keydown', { key: 'Escape' })
    expect(buttonByText('列设置').attributes('aria-expanded')).toBe('false')
  })

  it('keeps sorting within column groups and handles columns without explicit keys', async () => {
    wrapper = mount(ProTable, {
      attachTo: document.body,
      props: {
        columns: [
          {
            title: 'Group',
            key: 'group',
            columns: [
              { title: 'Name', dataIndex: 'name' },
              { title: 'Actions', valueType: 'option' },
            ],
          },
          { title: 'Status', dataIndex: 'status' },
          {
            title: 'Hidden group',
            hideInTable: true,
            columns: [{ title: 'Hidden child', dataIndex: 'hidden' }],
          },
        ],
        dataSource: [{ id: 1, name: 'Ada', status: 'active' }],
        search: false,
        pagination: false,
      },
    })
    await buttonByText('列设置').trigger('click')
    await vi.waitFor(() =>
      expect(wrapper!.find('[data-pro-table-column-settings]').exists()).toBe(true),
    )
    const panel = wrapper.get('[data-pro-table-column-settings]')
    expect(panel.text()).not.toContain('Hidden child')
    const keys = () =>
      panel.findAll('[data-column-key]').map((item) => item.attributes('data-column-key'))
    expect(keys()).toEqual(['name', 'group.column-1', 'status'])

    const handle = panel.get(
      '[data-column-key="group.column-1"] [data-pro-table-column-drag-handle]',
    )
    await handle.trigger('dragstart')
    await panel.get('[data-column-key="status"]').trigger('drop')
    expect(keys()).toEqual(['name', 'group.column-1', 'status'])
    await handle.trigger('keydown', { key: 'ArrowUp' })
    expect(keys()).toEqual(['group.column-1', 'name', 'status'])
    expect(
      wrapper
        .findAll('thead tr')
        .at(-1)!
        .findAll('th')
        .map((cell) => cell.text()),
    ).toEqual(['Actions', 'Name'])

    await panel.get('[data-column-key="group.column-1"] input').setValue(false)
    expect(wrapper.findAll('thead th').map((cell) => cell.text())).not.toContain('Actions')
    await buttonByText('重置').trigger('click')
    expect(keys()).toEqual(['name', 'group.column-1', 'status'])
    expect(wrapper.findAll('thead th').map((cell) => cell.text())).toContain('Actions')

    await buttonByText('密度').trigger('click')
    expect(buttonByText('列设置').attributes('aria-expanded')).toBe('false')
    expect(buttonByText('密度').attributes('aria-expanded')).toBe('true')
  })

  it('syncs the rendered table size when the controlled size prop changes', async () => {
    wrapper = mount(ProTable, {
      attachTo: document.body,
      props: {
        columns: [{ title: 'Name', dataIndex: 'name' }],
        dataSource: [{ id: 1, name: 'Ada' }],
        rowKey: 'id',
        search: false,
        pagination: false,
        options: false,
        size: 'large',
      },
    })
    await flushPromises()

    expect(wrapper.findComponent(Table).props('size')).toBe('large')
    await wrapper.setProps({ size: 'small' })
    await nextTick()
    expect(wrapper.findComponent(Table).props('size')).toBe('small')

    await wrapper.setProps({ size: undefined })
    await nextTick()
    expect(wrapper.findComponent(Table).props('size')).toBe('middle')
  })

  it('renders toolbar, header and cell customization slots together', async () => {
    wrapper = mount(ProTable, {
      attachTo: document.body,
      props: {
        columns: [{ title: 'Name', dataIndex: 'name' }],
        dataSource: [{ id: 1, name: 'Ada' }],
        rowKey: 'id',
        search: false,
        pagination: false,
        options: false,
      },
      slots: {
        'toolbar-title': () => h('strong', { 'data-testid': 'toolbar-title' }, 'Capability table'),
        'toolbar-actions': () => h('button', { 'data-testid': 'toolbar-action' }, 'Export'),
        'header-name': () => h('span', { 'data-testid': 'name-header' }, 'Custom name'),
        'cell-name': ({ value }: { value: unknown }) =>
          h('span', { 'data-testid': 'name-cell' }, `Member: ${String(value)}`),
      },
    })
    await flushPromises()

    expect(wrapper.get('[data-testid="toolbar-title"]').text()).toBe('Capability table')
    expect(wrapper.get('[data-testid="toolbar-action"]').text()).toBe('Export')
    expect(wrapper.get('[data-testid="name-header"]').text()).toBe('Custom name')
    expect(wrapper.get('[data-testid="name-cell"]').text()).toBe('Member: Ada')
  })

  it('copies the final renderText value for copyable columns', async () => {
    const writeText = vi.fn(async (_value: string) => undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })

    wrapper = mount(ProTable, {
      attachTo: document.body,
      props: {
        columns: [
          {
            title: 'Name',
            dataIndex: 'name',
            copyable: true,
            renderText: (value: unknown) => `Display: ${String(value)}`,
          },
        ],
        dataSource: [{ id: 1, name: 'Ada' }],
        rowKey: 'id',
        search: false,
        pagination: false,
        options: false,
      },
    })
    await flushPromises()

    expect(wrapper.text()).toContain('Display: Ada')
    await wrapper.get('.ant-typography-copy').trigger('click')
    await flushPromises()
    expect(writeText).toHaveBeenCalledOnce()
    expect(writeText).toHaveBeenCalledWith('Display: Ada')
  })

  it('revalidates on window focus and removes the listener after unmount', async () => {
    const request = vi.fn(async (): Promise<RequestResult> => ({ data: [], total: 0 }))
    wrapper = mount(ProTable, {
      attachTo: document.body,
      props: {
        columns: [{ title: 'Name', dataIndex: 'name' }],
        request,
        manualRequest: true,
        revalidateOnFocus: true,
        rowKey: 'id',
        search: false,
        pagination: false,
        options: false,
      },
    })
    await flushPromises()

    expect(request).not.toHaveBeenCalled()
    window.dispatchEvent(new Event('focus'))
    await flushPromises()
    expect(request).toHaveBeenCalledOnce()

    wrapper.unmount()
    wrapper = undefined
    window.dispatchEvent(new Event('focus'))
    await flushPromises()
    expect(request).toHaveBeenCalledOnce()
  })
})
