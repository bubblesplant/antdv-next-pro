import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import { page } from 'vite-plus/test/browser'
import { defineComponent, h, nextTick, ref, type Component } from 'vue'
import AdaptiveProTable from '../src/adaptive-pro-table/AdaptiveProTable'
import ProTable from '../src/ProTable.vue'
import type { ProColumns, ProTableInstance, ProTableProps } from '../src/types'

interface Row extends Record<string, unknown> {
  id: number
  name: string
  owner: string
  department: string
  status: string
}

const rows: Row[] = Array.from({ length: 40 }, (_, index) => ({
  id: index + 1,
  name: `Project ${index + 1}`,
  owner: 'Ada',
  department: 'Engineering',
  status: 'Running',
}))
const columns: ProColumns<Row>[] = [
  { title: 'Name', dataIndex: 'name', width: 280 },
  { title: 'Owner', dataIndex: 'owner', width: 240 },
  { title: 'Department', dataIndex: 'department', width: 280 },
  { title: 'Status', dataIndex: 'status', width: 200 },
]

let wrapper: VueWrapper | undefined

beforeEach(async () => {
  await page.viewport(1280, 900)
})

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  document.body.innerHTML = ''
})

async function settle() {
  await flushPromises()
  await nextTick()
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
}

function element(selector: string): HTMLElement {
  return wrapper!.get(selector).element as HTMLElement
}

describe('AdaptiveProTable', () => {
  it('keeps the header and pagination visible while resizing and expanding search', async () => {
    const height = ref(680)
    const collapsed = ref(true)
    wrapper = mount(
      defineComponent(
        () => () =>
          h('div', { style: { height: `${height.value}px`, width: '960px' } }, [
            h(AdaptiveProTable as Component, {
              columns,
              dataSource: rows,
              rowKey: 'id',
              headerTitle: 'Projects',
              search: { collapsed: collapsed.value, span: 8 },
              onSearchCollapse: (value: boolean) => {
                collapsed.value = value
              },
              pagination: { defaultPageSize: 20 },
              scroll: { x: 1100, y: '100%' },
            }),
          ]),
      ),
      { attachTo: document.body },
    )
    await settle()
    const body = element('.ant-table-body')
    const header = element('.ant-table-header')
    const pagination = element('[data-pro-table-pagination]')
    const table = element('[data-pro-table]')
    expect(table.getBoundingClientRect().height).toBeCloseTo(680, 0)
    expect(body.clientHeight).toBeGreaterThan(100)
    expect(body.scrollHeight).toBeGreaterThan(body.clientHeight)
    expect(body.scrollWidth).toBeGreaterThan(body.clientWidth)
    expect(pagination.getBoundingClientRect().bottom).toBeLessThanOrEqual(
      table.getBoundingClientRect().bottom + 1,
    )

    const headerTop = header.getBoundingClientRect().top
    const paginationTop = pagination.getBoundingClientRect().top
    body.scrollTop = 120
    await settle()
    expect(body.scrollTop).toBe(120)
    expect(header.getBoundingClientRect().top).toBe(headerTop)
    expect(pagination.getBoundingClientRect().top).toBe(paginationTop)

    const initialHeight = body.clientHeight
    height.value = 560
    await settle()
    expect(initialHeight - body.clientHeight).toBeCloseTo(120, 0)
    const collapsedHeight = body.clientHeight
    const expand = wrapper.get('[data-pro-table-search] button[aria-expanded="false"]')
    expect(expand.find('[data-icon="down"]').exists()).toBe(true)
    await expand.trigger('click')
    await settle()
    expect(
      wrapper
        .get('[data-pro-table-search] button[aria-expanded="true"]')
        .find('[data-icon="down"]')
        .exists(),
    ).toBe(true)
    expect(body.clientHeight).toBeLessThan(collapsedHeight)
    await expect
      .poll(() => pagination.getBoundingClientRect().bottom)
      .toBeLessThanOrEqual(table.getBoundingClientRect().bottom + 1)
  })

  it('updates empty/loading states and optional regions without changing plain ProTable', async () => {
    const empty = ref(false)
    const loading = ref(false)
    const regions = ref(true)
    const scroll = ref<ProTableProps<Row>['scroll']>({ x: 1100, y: '100%' })
    wrapper = mount(
      defineComponent(
        () => () =>
          h('div', [
            h('div', { style: { height: '600px', width: '900px' } }, [
              h(AdaptiveProTable as Component, {
                columns,
                dataSource: empty.value ? [] : rows,
                loading: loading.value,
                rowKey: 'id',
                search: regions.value ? {} : false,
                pagination: regions.value ? { defaultPageSize: 20 } : false,
                scroll: scroll.value,
                prefixCls: 'custom-pro-table',
                class: 'caller-class',
                style: { color: 'rgb(1, 2, 3)' },
                'data-testid': 'adaptive',
              }),
            ]),
            h(ProTable as Component, {
              columns,
              dataSource: rows,
              rowKey: 'id',
              'data-testid': 'plain',
            }),
          ]),
      ),
      { attachTo: document.body },
    )
    await settle()
    const adaptive = element('[data-testid="adaptive"]')
    const plain = element('[data-testid="plain"]')
    expect(adaptive.classList.contains('caller-class')).toBe(true)
    expect(adaptive.classList.contains('custom-pro-table')).toBe(true)
    expect(adaptive.style.color).toBe('rgb(1, 2, 3)')
    expect(getComputedStyle(plain).display).toBe('block')
    expect(plain.querySelector('.ant-table-header')).toBeNull()
    expect(adaptive.querySelector('[data-pro-table-search]')).not.toBeNull()

    regions.value = false
    empty.value = true
    loading.value = true
    await settle()
    expect(adaptive.querySelector('[data-pro-table-search]')).toBeNull()
    expect(adaptive.querySelector('[data-pro-table-pagination]')).toBeNull()
    expect(adaptive.querySelector('.ant-table-placeholder')).not.toBeNull()
    expect(element('[data-testid="adaptive"] .ant-table-body').clientHeight).toBeGreaterThan(300)
    expect(adaptive.querySelector('.ant-spin-spinning')).not.toBeNull()
    const adaptiveBottom = adaptive.getBoundingClientRect().bottom
    expect(
      element('[data-testid="adaptive"] .ant-table-body').getBoundingClientRect().bottom,
    ).toBeLessThanOrEqual(adaptiveBottom + 1)

    empty.value = false
    loading.value = false
    scroll.value = { x: 1200, y: 180 }
    await settle()
    const body = element('[data-testid="adaptive"] .ant-table-body')
    expect(body.style.maxHeight).toBe('180px')
    expect(body.clientHeight).toBeLessThanOrEqual(180)
    expect(body.scrollWidth).toBeGreaterThanOrEqual(1200)
    expect(getComputedStyle(plain).display).toBe('block')
  })

  it('forwards requests, events, scoped slots and ref actions', async () => {
    const action = ref<ProTableInstance<Row>>()
    const onLoad = vi.fn()
    const onChange = vi.fn()
    const request = vi.fn(async () => ({ data: rows, total: rows.length, success: true }))
    wrapper = mount(
      defineComponent(
        () => () =>
          h('div', { style: { height: '600px', width: '900px' } }, [
            h(
              AdaptiveProTable as Component,
              {
                ref: action,
                columns,
                request,
                rowKey: 'id',
                search: false,
                pagination: { defaultPageSize: 20 },
                onLoad,
                onChange,
              },
              {
                'toolbar-title': () => h('span', { 'data-testid': 'title' }, 'Custom title'),
                'cell-name': ({ record }: { record: Row }) =>
                  h('strong', { 'data-testid': 'name' }, record.name),
              },
            ),
          ]),
      ),
      { attachTo: document.body },
    )
    await settle()
    expect(request).toHaveBeenCalledTimes(1)
    expect(onLoad).toHaveBeenCalledWith(rows, 40)
    expect(element('[data-testid="title"]').textContent).toBe('Custom title')
    expect(element('[data-testid="name"]').textContent).toBe('Project 1')
    expect(action.value?.getRowsData()).toEqual(rows)
    await action.value?.reload()
    expect(request).toHaveBeenCalledTimes(2)

    await wrapper.get('[data-pro-table-pagination] .ant-pagination-next button').trigger('click')
    await settle()
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(request.mock.calls.at(-1)).toEqual([
      expect.objectContaining({ current: 2, pageSize: 20 }),
      {},
      {},
    ])
  })

  it('keeps pagination visible on a narrow screen with space for the expanded search form', async () => {
    await page.viewport(390, 1000)
    wrapper = mount(
      defineComponent(
        () => () =>
          h('div', { style: { height: '900px', width: '100%' } }, [
            h(AdaptiveProTable as Component, {
              columns,
              dataSource: rows,
              rowKey: 'id',
              search: { defaultCollapsed: false },
              pagination: { defaultPageSize: 20 },
              scroll: { x: 1100, y: '100%' },
            }),
          ]),
      ),
      { attachTo: document.body },
    )
    await settle()
    expect(element('.ant-table-body').clientHeight).toBeGreaterThan(100)
    expect(
      element('[data-pro-table-pagination]').getBoundingClientRect().bottom,
    ).toBeLessThanOrEqual(element('[data-pro-table]').getBoundingClientRect().bottom + 1)
  })

  it('passes search and scroll through without adding defaults', async () => {
    wrapper = mount(AdaptiveProTable as Component, {
      attachTo: document.body,
      props: { columns, dataSource: [], search: { span: 12 } },
    })
    await settle()
    const table = wrapper.findComponent(ProTable)
    expect(table.props()).toHaveProperty('search', { span: 12 })
    expect(table.props()).toHaveProperty('scroll', undefined)

    await wrapper.setProps({ search: { collapseRender: false }, scroll: { x: 1100 } })
    expect(table.props()).toHaveProperty('search', { collapseRender: false })
    expect(table.props()).toHaveProperty('scroll', { x: 1100 })
  })

  it('preserves localized labels and custom collapse rendering', async () => {
    const search = ref<ProTableProps<Row>['search']>({ defaultCollapsed: true, span: 8 })
    wrapper = mount(
      defineComponent(
        () => () =>
          h('div', { style: { height: '680px', width: '960px' } }, [
            h(AdaptiveProTable as Component, {
              columns,
              dataSource: rows,
              rowKey: 'id',
              search: search.value,
              'locale-text': { expand: 'More filters', collapse: 'Fewer filters' },
            }),
          ]),
      ),
      { attachTo: document.body },
    )
    await settle()
    const expand = wrapper.get('[data-pro-table-search] button[aria-expanded="false"]')
    expect(expand.text()).toBe('More filters')
    await expand.trigger('click')
    await settle()
    expect(wrapper.get('[data-pro-table-search] button[aria-expanded="true"]').text()).toBe(
      'Fewer filters',
    )
    search.value = {
      collapseRender: () => h('b', { 'data-testid': 'custom-collapse' }, 'Custom fields'),
    }
    await settle()
    expect(element('[data-testid="custom-collapse"]').textContent).toBe('Custom fields')
    expect(wrapper.find('[data-pro-table-search] button[aria-expanded] [data-icon]').exists()).toBe(
      false,
    )
    search.value = { collapseRender: false }
    await settle()
    expect(wrapper.find('[data-pro-table-search] button[aria-expanded]').exists()).toBe(false)
  })

  it('retains model updates and the editable Form height chain', async () => {
    const action = ref<ProTableInstance<Row>>()
    const model = ref([...rows])
    const updated = vi.fn((next: Row[]) => {
      model.value = next
    })
    wrapper = mount(
      defineComponent(
        () => () =>
          h('div', { style: { height: '600px', width: '900px' } }, [
            h(AdaptiveProTable as Component, {
              ref: action,
              columns,
              dataSource: model.value,
              'onUpdate:dataSource': updated,
              rowKey: 'id',
              editable: { type: 'single' },
              search: false,
              pagination: false,
              scroll: { y: '100%' },
            }),
          ]),
      ),
      { attachTo: document.body },
    )
    await settle()
    expect(action.value?.startEditable(1)).toBe(true)
    expect(action.value?.setRowData(1, { name: 'Updated project' })).toBe(true)
    await action.value?.saveEditable(1)
    await settle()
    expect(updated).toHaveBeenCalledTimes(1)
    expect(model.value[0]?.name).toBe('Updated project')
    expect(element('form > .ant-table-wrapper .ant-table-body').clientHeight).toBeGreaterThan(300)
    expect(element('.ant-table-body').getBoundingClientRect().bottom).toBeLessThanOrEqual(
      element('[data-pro-table]').getBoundingClientRect().bottom + 1,
    )
  })
})
