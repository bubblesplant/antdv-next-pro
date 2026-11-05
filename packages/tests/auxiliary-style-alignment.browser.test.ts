import type { VueWrapper } from '@vue/test-utils'
import { flushPromises, mount } from '@vue/test-utils'
import { ConfigProvider } from 'antdv-next'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import { page } from 'vite-plus/test/browser'
import { defineComponent, h, ref } from 'vue'
import ListToolBar from '../src/components/ListToolBar.vue'
import DropdownFooter from '../src/components/DropdownFooter.vue'
import FilterDropdown from '../src/components/FilterDropdown.vue'
import FieldLabel from '../src/components/FieldLabel.vue'
import LabelIconTip from '../src/components/LabelIconTip.vue'
import { ProConfigProvider } from '../src/provider'

let wrapper: VueWrapper | undefined
afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  document.body.innerHTML = ''
})

describe('auxiliary component style alignment', () => {
  it('uses independent toolbar padding, gap and typography tokens with semantic overrides', async () => {
    const padding = ref(22)
    const overridden = ref(false)
    wrapper = mount(
      defineComponent(
        () => () =>
          h(
            ProConfigProvider,
            {
              token: {
                padding: padding.value,
                paddingLG: 90,
                marginXS: 11,
                fontSizeLG: 20,
                fontWeightStrong: 700,
              },
            },
            () =>
              h(ListToolBar, {
                title: 'Tools',
                subTitle: 'Details',
                actions: h('button', 'Create'),
                styles: overridden.value
                  ? { container: { paddingBlock: '7px' }, title: { fontWeight: 400 } }
                  : undefined,
              }),
          ),
      ),
      {
        attachTo: document.body,
      },
    )
    const container = wrapper.get('[data-pro-toolbar-container]').element
    const title = wrapper.get('[data-pro-toolbar-title]').element
    expect(getComputedStyle(container).paddingTop).toBe('22px')
    expect(getComputedStyle(container).gap).toBe('11px')
    expect(getComputedStyle(title).fontSize).toBe('20px')
    expect(getComputedStyle(title).fontWeight).toBe('700')
    padding.value = 30
    await flushPromises()
    expect(getComputedStyle(container).paddingTop).toBe('30px')
    overridden.value = true
    await flushPromises()
    expect(getComputedStyle(container).paddingTop).toBe('7px')
    expect(getComputedStyle(title).fontWeight).toBe('400')
  })

  it.each([{ subTitle: 'Details' }, { tooltip: 'Explanation' }])(
    'renders standalone title decorations and places search on the right',
    async (decoration) => {
      wrapper = mount(ListToolBar, {
        attachTo: document.body,
        props: { ...decoration, search: true },
      })
      expect(wrapper.find('[data-pro-toolbar-title]').exists()).toBe(true)
      expect(wrapper.find('[data-pro-toolbar-right] input').exists()).toBe(true)
      expect(getComputedStyle(wrapper.get('[data-pro-toolbar-search]').element).width).toBe('200px')
      expect(wrapper.get('input').attributes('placeholder')).toBe('请输入')
    },
  )

  it('puts filters in the main line and renders extra tabs only in multiple-line mode', async () => {
    const change = vi.fn()
    wrapper = mount(ListToolBar, {
      attachTo: document.body,
      props: {
        title: 'Tools',
        filter: h('span', 'Filters'),
        tabs: { items: [{ key: 'a', label: 'Alpha' }] },
        menu: {
          type: 'inline',
          onChange: change,
          items: [
            { key: 'x', label: 'One' },
            { key: 'y', label: 'Two' },
          ],
        },
      },
    })
    expect(wrapper.get('[data-pro-toolbar-right]').text()).toContain('Filters')
    expect(wrapper.find('[data-pro-toolbar-extra-line]').exists()).toBe(false)
    expect(wrapper.find('[role=tab]').exists()).toBe(false)
    await wrapper.findAll('[data-pro-toolbar-inline-menu] button')[1]!.trigger('click')
    expect(change).toHaveBeenCalledExactlyOnceWith('y')
    expect(
      wrapper.findAll('[data-pro-toolbar-inline-menu] button')[1]!.attributes('aria-pressed'),
    ).toBe('true')
    await wrapper.setProps({ multipleLine: true })
    expect(wrapper.get('[data-pro-toolbar-extra-line]').text()).toContain('Filters')
    expect(wrapper.get('[role=tab]').text()).toBe('Alpha')
    expect(wrapper.find('[data-pro-toolbar-right] [data-pro-toolbar-filter]').exists()).toBe(false)
  })

  it('does not leave vertical space for an empty toolbar', () => {
    wrapper = mount(ListToolBar, { attachTo: document.body })
    expect(wrapper.find('[data-pro-toolbar-container]').exists()).toBe(false)
    expect(wrapper.element.getBoundingClientRect().height).toBe(0)
  })

  it('separates footer actions and hides the clear action when no handler exists', async () => {
    const clear = vi.fn()
    const bubbled = vi.fn()
    wrapper = mount(DropdownFooter, { attachTo: document.body, props: { onClear: clear } })
    const root = wrapper.get('[data-pro-dropdown-footer]').element
    root.addEventListener('click', bubbled)
    expect(getComputedStyle(root).justifyContent).toBe('space-between')
    expect(getComputedStyle(root).paddingInlineStart).toBe('8px')
    await wrapper.findAll('button')[0]!.trigger('click')
    expect(clear).toHaveBeenCalledOnce()
    expect(bubbled).not.toHaveBeenCalled()
    await wrapper.setProps({ onClear: undefined })
    await vi.waitFor(() =>
      expect(getComputedStyle(wrapper!.findAll('button')[0]!.element).visibility).toBe('hidden'),
    )
    const custom = vi.fn(() => false as const)
    await wrapper.setProps({ footerRender: custom })
    expect(wrapper.find('[data-pro-dropdown-footer]').exists()).toBe(false)
    expect(custom).toHaveBeenCalledOnce()
    const empty = vi.fn(() => null)
    await wrapper.setProps({ footerRender: empty })
    expect(wrapper.find('[data-pro-dropdown-footer]').exists()).toBe(true)
    expect(wrapper.findAll('button')).toHaveLength(0)
    expect(empty).toHaveBeenCalledOnce()
  })

  it('preserves native popover semantic classes and styles around the default panel', async () => {
    wrapper = mount(FilterDropdown, {
      attachTo: document.body,
      props: {
        label: 'Filter',
        open: true,
        popoverProps: {
          classes: () => ({ root: 'custom-filter-overlay' }),
          styles: () => ({ container: { padding: '5px' } }),
        },
      },
      slots: { default: () => 'Panel' },
    })
    await vi.waitFor(() => expect(document.querySelector('.custom-filter-overlay')).not.toBeNull())
    const content = document.querySelector('[data-pro-filter-content]')!
    expect(getComputedStyle(content).paddingTop).toBe('16px')
    expect(content.closest('.ant-popover-container')?.getAttribute('style')).toContain(
      'padding: 5px',
    )
  })

  it('inherits compact field-label sizing and keeps its hover geometry stable', async () => {
    wrapper = mount(ConfigProvider, {
      attachTo: document.body,
      props: { componentSize: 'small' },
      slots: { default: () => h(FieldLabel, { label: 'Filter', 'data-testid': 'compact-label' }) },
    })
    const label = wrapper.get('[data-pro-field-label]').element
    const before = label.getBoundingClientRect().toJSON()
    expect(getComputedStyle(label).height).toBe('24px')
    expect(getComputedStyle(label).paddingInlineStart).toBe('4px')
    await page.getByTestId('compact-label').hover()
    expect(label.getBoundingClientRect().toJSON()).toEqual(before)
  })

  it('keeps label-tip adornments outside the ellipsis and resets subtitle typography', () => {
    wrapper = mount(LabelIconTip, {
      attachTo: document.body,
      props: { label: 'Title', subTitle: 'Details', ellipsis: true },
      attrs: { style: { fontSize: '24px', fontWeight: 700, width: '120px' } },
    })
    const root = wrapper.get('[data-pro-label-tip]')
    expect(getComputedStyle(root.element).display).toBe('inline-flex')
    expect(getComputedStyle(root.element.children[0]!).textOverflow).toBe('ellipsis')
    expect(getComputedStyle(root.element.children[1]!).fontSize).toBe('14px')
    expect(getComputedStyle(root.element.children[1]!).fontWeight).toBe('400')
  })
})
