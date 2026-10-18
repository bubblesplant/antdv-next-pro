import type { VueWrapper } from '@vue/test-utils'

import type { ProFilter, ProSort, ProTableInstance } from '../src/types'
import { flushPromises, mount } from '@vue/test-utils'
import { ConfigProvider, Table, theme } from 'antdv-next'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'

import { defineComponent, h, nextTick } from 'vue'

import ProTable from '../src/ProTable.vue'
import { resolveCssVariableColor } from './helpers/themeProbe'

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
    expect(onSelectionChange).toHaveBeenLastCalledWith([], [])
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
        localeText: {
          search: 'Search',
          reset: 'Reset',
          expand: 'Expand',
          collapse: 'Collapse',
          densityDefault: 'Default density',
          densityCompact: 'Compact density',
          densityLoose: 'Loose density',
          fullScreen: 'Fullscreen',
          reload: 'Reload',
          setting: 'Column settings',
        },
      },
    })
    await flushPromises()

    expect(buttonByText('Search').exists()).toBe(true)
    expect(buttonByText('Reset').exists()).toBe(true)
    expect(buttonByText('Expand').exists()).toBe(true)
    expect(buttonByText('Reload').exists()).toBe(true)
    expect(buttonByText('Fullscreen').exists()).toBe(true)

    await buttonByText('Expand').trigger('click')
    expect(buttonByText('Collapse').exists()).toBe(true)

    await buttonByText('Default density').trigger('click')
    expect(buttonByText('Compact density').exists()).toBe(true)

    await buttonByText('Column settings').trigger('click')
    expect(wrapper.get('.antdv-next-pro__column-settings').text()).toContain('Field 1')
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
    expect(buttonByText('默认').exists()).toBe(true)
    expect(buttonByText('刷新').exists()).toBe(true)
    expect(buttonByText('全屏').exists()).toBe(true)
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
    await nextTick()

    const root = wrapper.get('.antdv-next-pro').element as HTMLElement
    const settings = wrapper.get('.antdv-next-pro__column-settings').element as HTMLElement
    const search = wrapper.get('.antdv-next-pro__search').element as HTMLElement
    expect(root.style.getPropertyValue('--antdv-next-pro-color-bg-elevated')).not.toBe('')
    expect(getComputedStyle(settings).backgroundColor).toBe(
      resolveCssVariableColor(root, '--antdv-next-pro-color-bg-elevated'),
    )
    expect(getComputedStyle(search).backgroundColor).toBe(
      resolveCssVariableColor(root, '--antdv-next-pro-color-fill-alter'),
    )
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
    expect(request.mock.calls.at(-1)?.[0]).toEqual({ name: 'Ada' })

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

  it('cycles all three density levels and updates the rendered table size', async () => {
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
    await buttonByText('默认').trigger('click')
    await nextTick()
    expect(wrapper.findComponent(Table).props('size')).toBe('small')

    await buttonByText('紧凑').trigger('click')
    await nextTick()
    expect(wrapper.findComponent(Table).props('size')).toBe('large')

    await buttonByText('宽松').trigger('click')
    await nextTick()
    expect(wrapper.findComponent(Table).props('size')).toBe('middle')
    expect(buttonByText('默认').exists()).toBe(true)
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
    await wrapper.get('.antdv-next-pro__copy').trigger('click')
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
