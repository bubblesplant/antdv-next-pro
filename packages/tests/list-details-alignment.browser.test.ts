import type { VueWrapper } from '@vue/test-utils'

import { flushPromises, mount } from '@vue/test-utils'
import { ConfigProvider } from 'antdv-next'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import { userEvent } from 'vite-plus/test/browser'
import { defineComponent, h, ref, type CSSProperties } from 'vue'

import EditableProTable from '../src/EditableProTable.vue'
import { ProDescriptions } from '../src/pro-descriptions'
import { BaseProList, ProList } from '../src/pro-list'
import { ProConfigProvider } from '../src/provider'
import { DragSortTable } from '../src/table'
import '../src/style.css'

interface Row extends Record<string, unknown> {
  id: number
  name: string
  note: string
}

let wrapper: VueWrapper | undefined
const rows: Row[] = [
  { id: 1, name: 'Ada', note: 'First record' },
  { id: 2, name: 'Grace', note: 'Second record' },
]
const columns = [{ title: 'Name', dataIndex: 'name' }]
const metas = {
  title: { dataIndex: 'name' },
  description: { dataIndex: 'note' },
  actions: { render: () => [h('button', 'Archive'), h('button', 'Open')] },
}

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

describe('list, descriptions and editable table upstream styles', () => {
  it.each([
    ['ProList', ProList],
    ['BaseProList', BaseProList],
  ] as const)(
    'uses transparent background and upstream row spacing in %s',
    async (_name, component) => {
      wrapper = mount(component<Row>, {
        attachTo: document.body,
        props: { dataSource: rows, rowKey: 'id', metas },
      })
      await flushPromises()

      expect(getComputedStyle(wrapper.get('[data-pro-list]').element).backgroundColor).toBe(
        'rgba(0, 0, 0, 0)',
      )
      const items = wrapper.findAll('[data-pro-list-row]')
      const first = getComputedStyle(items[0]!.element)
      expect(first.padding).toBe('8px')
      expect(first.borderRadius).toBe('0px')
      expect(first.borderBottomWidth).toBe('0px')
      expect(getComputedStyle(items[1]!.element).borderBottomWidth).toBe('0px')
      expect(getComputedStyle(wrapper.get('[data-pro-list-meta]').element).gap).toBe('8px')
      expect(getComputedStyle(wrapper.get('[data-pro-list-row-actions]').element).gap).toBe('12px')
      expect(getComputedStyle(wrapper.get('[data-pro-list-row-title]').element).fontWeight).toBe(
        '600',
      )
    },
  )

  it('adds list separators only when split is explicitly enabled', async () => {
    wrapper = mount(ProList<Row>, {
      attachTo: document.body,
      props: { dataSource: rows, rowKey: 'id', metas, split: true },
    })
    await flushPromises()
    const item = wrapper.get('[data-pro-list-row]')
    expect(getComputedStyle(item.element).borderBottomWidth).toBe('1px')
    expect(getComputedStyle(item.element).borderRadius).toBe('0px')
    await wrapper.setProps({ split: false })
    expect(getComputedStyle(item.element).borderBottomWidth).toBe('0px')
    expect(getComputedStyle(item.element).borderRadius).toBe('6px')
  })

  it('inherits list theme tokens and custom prefixes while keeping user styles last', async () => {
    const customRowStyle = ref<CSSProperties>()
    wrapper = mount(
      defineComponent(
        () => () =>
          h(
            ConfigProvider,
            { prefixCls: 'brand' },
            {
              default: () =>
                h(
                  ProConfigProvider,
                  {
                    token: {
                      paddingXS: 11,
                      marginXS: 13,
                      marginSM: 17,
                      colorPrimaryBgHover: '#123456',
                    },
                  },
                  {
                    default: () =>
                      h(ProList<Row>, {
                        dataSource: rows,
                        rowKey: 'id',
                        metas,
                        split: false,
                        rowSelection: { selectedRowKeys: [1] },
                        classes: ({ props }) => ({
                          row: props.split === false ? 'custom-row' : '',
                        }),
                        styles: ({ props }) => ({
                          title: { color: props.split === false ? '#abcdef' : '' },
                          row: customRowStyle.value,
                        }),
                      }),
                  },
                ),
            },
          ),
      ),
      { attachTo: document.body },
    )
    await flushPromises()
    expect(wrapper.get('[data-pro-list]').classes()).toContain('brand-pro-list')
    const item = wrapper.get('[data-pro-list-row]')
    expect(item.classes()).toContain('custom-row')
    expect(getComputedStyle(item.element).padding).toBe('11px')
    expect(getComputedStyle(item.element).backgroundColor).toBe('rgb(18, 52, 86)')
    expect(getComputedStyle(wrapper.get('[data-pro-list-row-header]').element).gap).toBe('13px')
    expect(getComputedStyle(wrapper.get('[data-pro-list-row-actions]').element).gap).toBe('17px')
    expect(getComputedStyle(wrapper.get('[data-pro-list-row-title]').element).color).toBe(
      'rgb(171, 205, 239)',
    )

    customRowStyle.value = { padding: '3px 5px' }
    await expect.poll(() => getComputedStyle(item.element).padding).toBe('3px 5px')
  })

  it('keeps grid card spacing inside ProCard and forwards item card styles', async () => {
    wrapper = mount(ProList<Row>, {
      attachTo: document.body,
      props: {
        dataSource: rows,
        rowKey: 'id',
        metas,
        grid: { column: 2, gutter: 12 },
        itemCardProps: { styles: { body: { padding: '7px' } } },
      },
    })
    await flushPromises()
    expect(getComputedStyle(wrapper.get('[data-pro-list-container]').element).gap).toBe('12px')
    const item = getComputedStyle(wrapper.get('[data-pro-list-row]').element)
    expect(item.padding).toBe('0px')
    expect(item.borderBottomWidth).toBe('0px')
    expect(
      getComputedStyle(wrapper.get('[data-pro-list-row] .ant-pro-card-body').element).padding,
    ).toBe('7px')
  })

  it('hides hover-only list actions without reserving their row width', async () => {
    wrapper = mount(ProList<Row>, {
      attachTo: document.body,
      props: { dataSource: rows, rowKey: 'id', metas, showActions: 'hover' },
    })
    await flushPromises()
    const item = wrapper.get('[data-pro-list-row]').element
    const actions = wrapper.get('[data-pro-list-row-actions]').element
    const outside = document.createElement('button')
    outside.textContent = 'Outside'
    document.body.append(outside)
    await userEvent.hover(outside)
    expect(getComputedStyle(actions).display).toBe('none')
    await userEvent.hover(item)
    expect(getComputedStyle(actions).display).toBe('flex')
  })

  it('applies descriptions content minimum width and renders a tooltip-only header', async () => {
    wrapper = mount(ProDescriptions<Row>, {
      attachTo: document.body,
      props: {
        dataSource: rows[0],
        columns,
        tooltip: 'About this record',
        size: 'small',
        bordered: true,
      },
    })
    await flushPromises()
    expect(wrapper.find('.ant-descriptions-small').exists()).toBe(true)
    expect(wrapper.find('.ant-descriptions-bordered').exists()).toBe(true)
    expect(wrapper.find('.ant-descriptions-header').exists()).toBe(true)
    expect(wrapper.find('.ant-descriptions-title [role="img"]').exists()).toBe(true)
    expect(getComputedStyle(wrapper.get('.ant-descriptions-item-content').element).minWidth).toBe(
      '0px',
    )
  })

  it('preserves descriptions semantic callbacks and native theme inheritance', async () => {
    wrapper = mount(
      defineComponent(
        () => () =>
          h(
            ConfigProvider,
            {
              prefixCls: 'brand',
              theme: { token: { colorText: '#123456' } },
            },
            {
              default: () =>
                h(ProDescriptions<Row>, {
                  prefixCls: 'business-descriptions',
                  dataSource: rows[0],
                  columns,
                  classes: ({ props }) => ({
                    content: props.dataSource?.id === 1 ? 'custom-content' : '',
                  }),
                  styles: ({ props }) => ({
                    content: { minWidth: props.dataSource?.id === 1 ? '19px' : 0 },
                  }),
                }),
            },
          ),
      ),
      { attachTo: document.body },
    )
    await flushPromises()
    expect(wrapper.get('[data-pro-descriptions]').classes()).toContain('business-descriptions')
    const content = wrapper.get('.brand-descriptions-item-content')
    expect(content.classes()).toContain('custom-content')
    expect(getComputedStyle(content.element).minWidth).toBe('19px')
    expect(getComputedStyle(content.element).color).toBe('rgb(18, 52, 86)')
  })

  it('uses the default editable creator icon and 10px vertical button margins', async () => {
    wrapper = mount(EditableProTable, {
      attachTo: document.body,
      props: { value: rows, rowKey: 'id', columns },
    })
    await flushPromises()
    const creator = wrapper.get('[data-pro-table-record-creator]')
    const button = creator.get('button')
    expect(getComputedStyle(creator.element).padding).toBe('0px')
    expect(getComputedStyle(button.element).margin).toBe('10px 0px')
    expect(button.find('[role="img"]').exists()).toBe(true)
    expect(button.text()).toContain('添加一行数据')

    await wrapper.setProps({
      recordCreatorProps: {
        icon: h('span', { 'data-custom-creator-icon': '' }, '+'),
        style: { margin: '3px 0', width: '50%' },
      },
    })
    expect(button.find('[data-custom-creator-icon]').exists()).toBe(true)
    expect((button.element as HTMLElement).style.margin).toBe('3px 0px')
    await expect.poll(() => getComputedStyle(button.element).margin).toBe('3px 0px')
    expect((button.element as HTMLElement).style.width).toBe('50%')
  })

  it('uses themed drag handle metrics and retains table semantics and keyboard sorting', async () => {
    const sorted = vi.fn()
    wrapper = mount(
      defineComponent(
        () => () =>
          h(
            ConfigProvider,
            { prefixCls: 'brand' },
            {
              default: () =>
                h(
                  ProConfigProvider,
                  {
                    token: {
                      controlHeightSM: 30,
                      marginSM: 13,
                      colorInfoBg: '#123456',
                      motionDurationMid: '0s',
                    },
                  },
                  {
                    default: () =>
                      h(DragSortTable<Row>, {
                        defaultDataSource: rows,
                        rowKey: 'id',
                        columns,
                        search: false,
                        options: false,
                        pagination: false,
                        size: 'small',
                        bordered: true,
                        classes: { root: 'custom-table' },
                        styles: { root: { padding: '5px' } },
                        onDragSortEnd: sorted,
                      }),
                  },
                ),
            },
          ),
      ),
      { attachTo: document.body },
    )
    await flushPromises()
    const handle = wrapper.get('[data-pro-table-drag-handle]')
    const style = getComputedStyle(handle.element)
    expect(handle.classes()).toContain('brand-pro-table-drag-icon')
    expect(style.width).toBe('30px')
    expect(style.minHeight).toBe('30px')
    expect(style.marginInlineEnd).toBe('13px')
    expect(style.padding).toBe('0px')
    expect(wrapper.find('.brand-table-small').exists()).toBe(true)
    expect(wrapper.find('.brand-table-bordered').exists()).toBe(true)
    expect(getComputedStyle(wrapper.get('.custom-table').element).padding).toBe('5px')
    await userEvent.hover(handle.element)
    await expect
      .poll(() => getComputedStyle(handle.element).backgroundColor)
      .toBe('rgb(18, 52, 86)')
    await handle.trigger('keydown', { key: 'ArrowDown' })
    expect(sorted).toHaveBeenCalledWith(0, 1, [rows[1], rows[0]])
  })
})
