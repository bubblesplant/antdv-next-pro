import type { VueWrapper } from '@vue/test-utils'
import type { ProTableInstance } from '../src/types'
import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import { page } from 'vite-plus/test/browser'
import { h, type Component } from 'vue'
import AdaptiveProTable from '../src/adaptive-pro-table/AdaptiveProTable'
import EditableProTable from '../src/EditableProTable.vue'
import ProTable from '../src/ProTable.vue'

interface Row extends Record<string, unknown> {
  id: number
  name: string
}

let wrapper: VueWrapper | undefined

beforeEach(async () => {
  await page.viewport(1280, 900)
})

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  document.body.innerHTML = ''
})

describe('toolbar-actions scoped slot', () => {
  it('spaces action buttons by 8px and wraps them on narrow screens', async () => {
    wrapper = mount(ProTable as Component, {
      attachTo: document.body,
      props: {
        columns: [{ title: 'Name', dataIndex: 'name' }],
        dataSource: [],
        headerTitle: 'Projects',
        search: false,
        pagination: false,
        options: false,
      },
      slots: {
        'toolbar-actions': () =>
          ['Create', 'Export', 'Reload'].map((label) =>
            h('button', { style: { width: '120px', height: '32px' } }, label),
          ),
      },
    })
    await flushPromises()

    const actions = wrapper.get('[data-pro-table-list-toolbar-actions]').element
    const buttons = wrapper.findAll('[data-pro-table-list-toolbar-actions] button')
    const buttonRect = (index: number) => buttons[index]!.element.getBoundingClientRect()
    expect(getComputedStyle(actions).display).toBe('flex')
    expect(getComputedStyle(actions).alignItems).toBe('center')
    expect(buttonRect(1).left - buttonRect(0).right).toBeCloseTo(8, 1)
    expect(buttonRect(2).top).toBe(buttonRect(0).top)

    await page.viewport(390, 900)
    expect(buttonRect(1).left - buttonRect(0).right).toBeCloseTo(8, 1)
    expect(buttonRect(2).top - buttonRect(1).bottom).toBeCloseTo(8, 1)
    expect(actions.getBoundingClientRect().right).toBeLessThanOrEqual(
      wrapper.get('[data-pro-table]').element.getBoundingClientRect().right,
    )
  })

  it.each([
    ['ProTable', ProTable],
    ['AdaptiveProTable', AdaptiveProTable],
    ['EditableProTable', EditableProTable],
  ] as const)(
    'provides reactive selection and table actions through %s',
    async (_name, component) => {
      const rows: Row[] = [{ id: 1, name: 'Ada' }]
      const request = vi.fn(async () => ({ data: rows, total: rows.length, success: true }))
      const toolBarRender = vi.fn(() => h('button', 'Callback action'))
      wrapper = mount(component as Component, {
        attachTo: document.body,
        props: {
          columns: [{ title: 'Name', dataIndex: 'name' }],
          request,
          rowKey: 'id',
          rowSelection: {},
          search: false,
          pagination: false,
          options: { reload: true },
          toolBarRender,
          ...(component === EditableProTable ? { recordCreatorProps: false } : {}),
        },
        slots: {
          'toolbar-actions': ({
            action,
            selectedRows,
          }: {
            action: ProTableInstance<Row>
            selectedRows: Row[]
          }) => [
            h('button', { 'data-testid': 'reload', onClick: () => action.reload() }, 'Reload'),
            h(
              'button',
              {
                'data-testid': 'selection',
                disabled: !selectedRows.length,
                onClick: () => action.clearSelected(),
              },
              selectedRows.map((row) => row.name).join(', ') || 'No selection',
            ),
          ],
        },
      })
      await flushPromises()

      expect(request).toHaveBeenCalledTimes(1)
      expect(wrapper.get('[data-testid="selection"]').text()).toBe('No selection')
      expect(wrapper.get('[data-testid="selection"]').attributes('disabled')).toBeDefined()
      expect(toolBarRender).not.toHaveBeenCalled()
      expect(
        wrapper.find('[data-pro-table-list-toolbar-actions] button[title="刷新"]').exists(),
      ).toBe(true)

      await wrapper.get('tbody input[type="checkbox"]').setValue(true)
      await flushPromises()
      expect(wrapper.get('[data-testid="selection"]').text()).toBe('Ada')
      expect(wrapper.get('[data-testid="selection"]').attributes('disabled')).toBeUndefined()

      await wrapper.get('[data-testid="selection"]').trigger('click')
      await flushPromises()
      expect(wrapper.get('[data-testid="selection"]').text()).toBe('No selection')
      expect(
        (wrapper.get('tbody input[type="checkbox"]').element as HTMLInputElement).checked,
      ).toBe(false)

      await wrapper.get('[data-testid="reload"]').trigger('click')
      await flushPromises()
      expect(request).toHaveBeenCalledTimes(2)

      await wrapper.setProps({ toolBarRender: false })
      expect(wrapper.find('[data-pro-table-list-toolbar]').exists()).toBe(false)
    },
  )

  it('retains callback and toolbar.actions fallbacks when no slot is provided', async () => {
    const rows: Row[] = [{ id: 1, name: 'Ada' }]
    const toolBarRender = vi.fn((_action: ProTableInstance<Row>, selectedRows: Row[]) =>
      h('button', { 'data-testid': 'callback' }, `Callback: ${selectedRows.length}`),
    )
    wrapper = mount(ProTable as Component, {
      attachTo: document.body,
      props: {
        columns: [{ title: 'Name', dataIndex: 'name' }],
        dataSource: rows,
        rowKey: 'id',
        rowSelection: {},
        search: false,
        pagination: false,
        options: false,
        toolBarRender,
        toolbar: { actions: h('button', { 'data-testid': 'fallback' }, 'Config action') },
      },
    })
    await flushPromises()

    expect(wrapper.get('[data-testid="callback"]').text()).toBe('Callback: 0')
    expect(wrapper.find('[data-testid="fallback"]').exists()).toBe(false)
    expect(toolBarRender).toHaveBeenLastCalledWith(
      expect.objectContaining({ reload: expect.any(Function) }),
      [],
    )

    await wrapper.get('tbody input[type="checkbox"]').setValue(true)
    await flushPromises()
    expect(wrapper.get('[data-testid="callback"]').text()).toBe('Callback: 1')
    expect(toolBarRender).toHaveBeenLastCalledWith(expect.any(Object), rows)

    await wrapper.setProps({ toolBarRender: undefined })
    expect(wrapper.get('[data-testid="fallback"]').text()).toBe('Config action')
    expect(wrapper.find('[data-testid="callback"]').exists()).toBe(false)
  })
})
