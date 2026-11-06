import type { VueWrapper } from '@vue/test-utils'

import { flushPromises, mount } from '@vue/test-utils'
import { Card, ConfigProvider, theme } from 'antdv-next'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import { userEvent } from 'vite-plus/test/browser'
import { defineComponent, Fragment, h, ref } from 'vue'

import ProCard from '../src/ProCard.vue'
import '../src/style.css'

let wrapper: VueWrapper | undefined

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  document.body.innerHTML = ''
})

describe('ProCard', () => {
  it('does not reserve header space when optional node props are omitted', async () => {
    wrapper = mount(ProCard, { attachTo: document.body, slots: { default: () => 'Content' } })
    expect(wrapper.find('.ant-pro-card-header').exists()).toBe(false)
    expect(wrapper.find('.ant-pro-card-extra').exists()).toBe(false)
    await wrapper.setProps({ title: false, subTitle: false, extra: false })
    expect(wrapper.find('.ant-pro-card-header').exists()).toBe(false)
    await wrapper.setProps({ title: 'Title' })
    expect(wrapper.find('.ant-pro-card-header').exists()).toBe(true)
    expect(wrapper.find('.ant-pro-card-sub-title').exists()).toBe(false)
    expect(wrapper.find('.ant-pro-card-extra').exists()).toBe(false)
  })

  it('inherits native card tokens and reacts to dark theme changes', async () => {
    const dark = ref(false)
    wrapper = mount(
      defineComponent(
        () => () =>
          h(
            ConfigProvider,
            {
              theme: {
                algorithm: dark.value ? theme.darkAlgorithm : theme.defaultAlgorithm,
                components: { Card: { bodyPadding: 30, borderRadiusLG: 12 } },
              },
            },
            {
              default: () => [
                h(
                  ProCard,
                  { title: 'Overview', variant: 'borderless' },
                  { default: () => 'Content' },
                ),
                h(
                  Card,
                  { title: 'Native', variant: 'borderless', class: 'native-card' },
                  { default: () => 'Native content' },
                ),
              ],
            },
          ),
      ),
      { attachTo: document.body },
    )
    await flushPromises()
    const card = wrapper.get('.ant-pro-card').element
    const native = wrapper.get('.native-card').element
    const light = getComputedStyle(card).backgroundColor
    expect(light).toBe(getComputedStyle(native).backgroundColor)
    expect(getComputedStyle(card).boxShadow).toBe('none')
    expect(getComputedStyle(native).boxShadow).not.toBe('none')
    expect(getComputedStyle(card).borderRadius).toBe('12px')
    expect(getComputedStyle(wrapper.get('.ant-pro-card-body').element).padding).toBe('30px')
    expect(getComputedStyle(wrapper.get('.ant-pro-card-header').element).borderBottomWidth).toBe(
      '0px',
    )
    expect(getComputedStyle(wrapper.get('.ant-pro-card-header').element).paddingTop).toBe('16px')
    dark.value = true
    await flushPromises()
    expect(getComputedStyle(card).backgroundColor).toBe(getComputedStyle(native).backgroundColor)
    expect(getComputedStyle(card).backgroundColor).not.toBe(light)
    expect(getComputedStyle(card).boxShadow).toBe('none')
  })

  it('only shows shadows when enabled, hovered or supplied through semantic styles', async () => {
    wrapper = mount(ProCard, {
      attachTo: document.body,
      props: { variant: 'borderless', prefixCls: 'business-card' },
      slots: { default: () => 'Content' },
    })
    const card = wrapper.element
    const outside = document.createElement('button')
    outside.textContent = 'Outside'
    document.body.append(outside)
    await userEvent.hover(outside)
    expect(getComputedStyle(card).boxShadow).toBe('none')

    await wrapper.setProps({ boxShadow: true })
    expect(getComputedStyle(card).boxShadow).not.toBe('none')
    await wrapper.setProps({ boxShadow: false, hoverable: true })
    await userEvent.hover(outside)
    await vi.waitFor(() => expect(getComputedStyle(card).boxShadow).toBe('none'))
    await userEvent.hover(card)
    await vi.waitFor(() => expect(getComputedStyle(card).boxShadow).not.toBe('none'))
    await userEvent.hover(outside)
    await vi.waitFor(() => expect(getComputedStyle(card).boxShadow).toBe('none'))

    await wrapper.setProps({
      styles: { root: { boxShadow: 'rgb(255, 0, 0) 0px 1px 2px 0px' } },
    })
    await vi.waitFor(() =>
      expect(getComputedStyle(card).boxShadow).toBe('rgb(255, 0, 0) 0px 1px 2px 0px'),
    )
  })

  it('inherits small size and honors borders and semantic style precedence', async () => {
    const headerBordered = ref(true)
    const variant = ref<'outlined' | 'borderless'>()
    wrapper = mount(ConfigProvider, {
      attachTo: document.body,
      props: { componentSize: 'small' },
      slots: {
        default: () =>
          h(
            ProCard,
            {
              title: 'Small',
              headerBordered: headerBordered.value,
              variant: variant.value,
              bordered: false,
              headStyle: { color: 'red' },
              bodyStyle: { padding: '20px' },
              styles: { header: { color: 'blue' }, body: { padding: '6px' } },
              classNames: { header: 'custom-head', body: 'custom-body' },
            },
            { default: () => 'Content' },
          ),
      },
    })
    await flushPromises()
    const card = wrapper.findComponent(ProCard)
    expect(card.classes()).toContain('ant-card-small')
    expect(card.classes()).not.toContain('ant-card-bordered')
    expect(getComputedStyle(card.get('.custom-head').element).color).toBe('rgb(0, 0, 255)')
    expect(getComputedStyle(card.get('.custom-head').element).borderBottomWidth).toBe('1px')
    expect(getComputedStyle(card.get('.custom-body').element).padding).toBe('6px')
    headerBordered.value = false
    variant.value = 'outlined'
    await flushPromises()
    expect(card.classes()).toContain('ant-card-bordered')
    expect(getComputedStyle(card.get('.custom-head').element).paddingTop).toBe('8px')
  })

  it.each([
    { size: 'default' as const, horizontalPadding: '36px', verticalPadding: '16px' },
    { size: 'small' as const, horizontalPadding: '20px', verticalPadding: '8px' },
  ])(
    'uses Card header padding tokens horizontally for $size cards',
    async ({ size, horizontalPadding, verticalPadding }) => {
      wrapper = mount(ConfigProvider, {
        attachTo: document.body,
        props: {
          theme: { components: { Card: { headerPadding: 36, headerPaddingSM: 20 } } },
        },
        slots: {
          default: () =>
            h(ProCard, { title: 'Details', size, collapsible: true }, { default: () => 'Body' }),
        },
      })
      await flushPromises()
      const card = wrapper.findComponent(ProCard)
      const header = card.get('.ant-pro-card-header').element
      expect(getComputedStyle(header).paddingLeft).toBe(horizontalPadding)
      expect(getComputedStyle(header).paddingRight).toBe(horizontalPadding)
      expect(getComputedStyle(header).paddingTop).toBe(verticalPadding)
      expect(getComputedStyle(header).paddingBottom).toBe('0px')
      await card.get('[data-pro-card-collapsible-icon]').trigger('click')
      expect(getComputedStyle(header).paddingTop).toBe(verticalPadding)
      expect(getComputedStyle(header).paddingBottom).toBe(verticalPadding)
    },
  )

  it.each(['direct', 'fragment'] as const)(
    'removes default body padding around %s nested cards',
    async (nesting) => {
      wrapper = mount(ProCard, {
        attachTo: document.body,
        slots: {
          default: () => {
            const children = ['First', 'Second'].map((title) =>
              h(ProCard, { key: title, title }, { default: () => `${title} body` }),
            )
            return nesting === 'fragment' ? h(Fragment, null, children) : children
          },
        },
      })
      await flushPromises()
      expect(wrapper.classes()).toContain('ant-pro-card-contain-card')
      expect(getComputedStyle(wrapper.get('.ant-pro-card-body').element).padding).toBe('0px')
      expect(getComputedStyle(wrapper.get('[data-pro-card-content]').element).display).toBe('flex')
      expect(wrapper.findAll('[data-pro-card-col]')).toHaveLength(2)
      expect(
        getComputedStyle(wrapper.get('[data-pro-card-col] .ant-pro-card-body').element).padding,
      ).toBe('24px')
    },
  )

  it('allows explicit body padding to override the nested card layout default', async () => {
    wrapper = mount(ProCard, {
      attachTo: document.body,
      props: { bodyStyle: { padding: '14px' } },
      slots: {
        default: () => h(ProCard, { title: 'Nested' }, { default: () => 'Nested body' }),
      },
    })
    await flushPromises()
    const body = wrapper.get('.ant-pro-card-body').element
    expect(getComputedStyle(body).padding).toBe('14px')
    await wrapper.setProps({ styles: { body: { padding: '9px' } } })
    expect(getComputedStyle(body).padding).toBe('9px')
  })

  it.each([{ direction: 'column' as const }, { gutter: 16 }])(
    'keeps leaf cards out of the nested layout for %j',
    async (props) => {
      wrapper = mount(ProCard, {
        attachTo: document.body,
        props: { direction: props.direction, gutter: props.gutter },
        slots: { default: () => 'Leaf body' },
      })
      await flushPromises()
      expect(wrapper.classes()).not.toContain('ant-pro-card-contain-card')
      expect(getComputedStyle(wrapper.get('.ant-pro-card-body').element).padding).toBe('24px')
      expect(getComputedStyle(wrapper.get('[data-pro-card-content]').element).display).toBe('block')
      await wrapper.setProps({ bodyStyle: { padding: '14px' } })
      expect(getComputedStyle(wrapper.get('.ant-pro-card-body').element).padding).toBe('14px')
    },
  )

  it('updates the checked skin and corner marker from the active theme tokens', async () => {
    const dark = ref(false)
    const customTokens = ref(false)
    const checked = ref(true)
    const ThemeReference = defineComponent(() => {
      const { token } = theme.useToken()
      return () =>
        h('div', {
          class: 'checked-theme-reference',
          style: {
            backgroundColor: token.value.controlItemBgActive,
            border: `1px solid ${token.value.controlOutline}`,
            color: token.value.colorPrimary,
          },
        })
    })
    wrapper = mount(
      defineComponent(
        () => () =>
          h(
            ConfigProvider,
            {
              theme: {
                algorithm: dark.value ? theme.darkAlgorithm : theme.defaultAlgorithm,
                token: customTokens.value
                  ? {
                      colorPrimary: '#8b2266',
                      controlItemBgActive: '#e1bccc',
                      controlOutline: '#9b3072',
                    }
                  : { colorPrimary: '#8c36ba' },
              },
            },
            {
              default: () => [
                h(
                  ProCard,
                  { checked: checked.value, prefixCls: 'business-card' },
                  { default: () => 'Selectable body' },
                ),
                h(ThemeReference),
              ],
            },
          ),
      ),
      { attachTo: document.body },
    )
    await flushPromises()
    const card = wrapper.get('[data-pro-card]').element
    const reference = wrapper.get('.checked-theme-reference').element
    const expectThemeSkin = () => {
      const style = getComputedStyle(card)
      const marker = getComputedStyle(card, '::after')
      const referenceStyle = getComputedStyle(reference)
      expect(style.backgroundColor).toBe(referenceStyle.backgroundColor)
      expect(style.borderColor).toBe(referenceStyle.borderColor)
      expect(style.outlineStyle).toBe('none')
      expect(marker.content).toBe('""')
      expect(marker.position).toBe('absolute')
      expect(marker.top).toBe('2px')
      expect(marker.right).toBe('2px')
      expect(marker.borderTopWidth).toBe('6px')
      expect(marker.borderRightWidth).toBe('6px')
      expect(marker.borderTopColor).toBe(referenceStyle.color)
      expect(marker.borderRightColor).toBe(referenceStyle.color)
      expect(marker.borderBottomColor).toBe('rgba(0, 0, 0, 0)')
      expect(marker.borderLeftColor).toBe('rgba(0, 0, 0, 0)')
    }
    expectThemeSkin()
    const lightBackground = getComputedStyle(card).backgroundColor
    dark.value = true
    await flushPromises()
    await vi.waitFor(expectThemeSkin)
    expect(getComputedStyle(card).backgroundColor).not.toBe(lightBackground)

    dark.value = false
    customTokens.value = true
    await flushPromises()
    await vi.waitFor(expectThemeSkin)
    expect(getComputedStyle(card).backgroundColor).toBe('rgb(225, 188, 204)')
    expect(getComputedStyle(card).borderColor).toBe('rgb(155, 48, 114)')
    expect(getComputedStyle(card, '::after').borderTopColor).toBe('rgb(139, 34, 102)')

    checked.value = false
    await flushPromises()
    expect(card.getAttribute('aria-checked')).toBe('false')
    expect(getComputedStyle(card).backgroundColor).not.toBe('rgb(225, 188, 204)')
    expect(getComputedStyle(card, '::after').content).toBe('none')
  })

  it.each([
    { split: 'vertical' as const, side: 'Left' as const },
    { split: 'horizontal' as const, side: 'Top' as const },
  ])('uses theme line tokens for $split split borders', async ({ split, side }) => {
    wrapper = mount(ConfigProvider, {
      attachTo: document.body,
      props: {
        theme: { token: { lineWidth: 3, lineType: 'dashed', colorSplit: '#a85c14' } },
      },
      slots: {
        default: () =>
          h(
            ProCard,
            { split },
            {
              default: () =>
                ['First', 'Second'].map((title) =>
                  h(ProCard, { key: title, title }, { default: () => `${title} body` }),
                ),
            },
          ),
      },
    })
    await flushPromises()
    const columns = wrapper.findAll('[data-pro-card-col]')
    expect(columns).toHaveLength(2)
    expect(getComputedStyle(columns[0]!.element)[`border${side}Width`]).toBe('0px')
    expect(getComputedStyle(columns[1]!.element)[`border${side}Width`]).toBe('3px')
    expect(getComputedStyle(columns[1]!.element)[`border${side}Style`]).toBe('dashed')
    expect(getComputedStyle(columns[1]!.element)[`border${side}Color`]).toBe('rgb(168, 92, 20)')
    await wrapper.setProps({
      theme: { token: { lineWidth: 2, lineType: 'dotted', colorSplit: '#167866' } },
    })
    expect(getComputedStyle(columns[1]!.element)[`border${side}Width`]).toBe('2px')
    expect(getComputedStyle(columns[1]!.element)[`border${side}Style`]).toBe('dotted')
    expect(getComputedStyle(columns[1]!.element)[`border${side}Color`]).toBe('rgb(22, 120, 102)')
  })

  it('renders node props and lets named slots override them', async () => {
    wrapper = mount(ProCard, {
      attachTo: document.body,
      props: {
        title: 'Title prop',
        subTitle: 'Subtitle',
        extra: 'Extra prop',
        tooltip: 'Help',
        cover: h('div', 'Cover'),
        actions: [h('button', 'Save')],
      },
      slots: {
        title: () => h('strong', 'Slot title'),
        extra: () => h('button', 'Slot action'),
        default: () => 'Body',
      },
    })
    await flushPromises()
    expect(wrapper.get('.ant-pro-card-title').text()).toContain('Slot title')
    expect(wrapper.get('.ant-pro-card-title').text()).toContain('Subtitle')
    expect(wrapper.get('.ant-pro-card-extra').text()).toBe('Slot action')
    expect(wrapper.get('[data-pro-card-tooltip]').attributes('aria-label')).toBe('Help')
    expect(wrapper.get('.ant-pro-card-cover').text()).toBe('Cover')
    expect(wrapper.get('.ant-pro-card-actions').text()).toBe('Save')
    expect(wrapper.text()).not.toContain('Title prop')
  })

  it('keeps the content mounted across uncontrolled collapse and supports keyboard use', async () => {
    wrapper = mount(ProCard, {
      attachTo: document.body,
      props: { title: 'Details', collapsible: true, defaultCollapsed: true },
      slots: { default: () => h('input', { 'aria-label': 'Draft' }) },
    })
    const content = wrapper.get('input').element
    const toggle = wrapper.get('[data-pro-card-collapsible-icon]')
    expect(wrapper.get('.ant-pro-card-body').isVisible()).toBe(false)
    expect(document.getElementById(toggle.attributes('aria-controls')!)).not.toBeNull()
    ;(toggle.element as HTMLButtonElement).focus()
    await userEvent.keyboard('{Enter}')
    await flushPromises()
    expect(toggle.attributes('aria-expanded')).toBe('true')
    await wrapper.get('input').setValue('unsaved draft')
    await wrapper.get('[data-pro-card-title-heading]').trigger('click')
    expect(wrapper.get('.ant-pro-card-body').isVisible()).toBe(false)
    await toggle.trigger('click')
    expect(wrapper.get('input').element).toBe(content)
    expect((content as HTMLInputElement).value).toBe('unsaved draft')
    expect(wrapper.emitted('collapse')).toEqual([[false], [true], [false]])
    expect(wrapper.emitted('update:collapsed')).toEqual(wrapper.emitted('collapse'))
  })

  it('waits for the parent to update controlled collapsed state', async () => {
    wrapper = mount(ProCard, {
      attachTo: document.body,
      props: { title: 'Controlled', collapsible: true, collapsed: false },
      slots: { default: () => 'Body' },
    })
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('update:collapsed')).toEqual([[true]])
    expect(wrapper.get('.ant-pro-card-body').isVisible()).toBe(true)
    await wrapper.setProps({ collapsed: true })
    expect(wrapper.get('.ant-pro-card-body').isVisible()).toBe(false)
  })

  it('supports v-model and ignores extra actions and nested card header clicks', async () => {
    const collapsed = ref(false)
    wrapper = mount(
      defineComponent(
        () => () =>
          h(
            ProCard,
            {
              title: 'Parent',
              collapsible: 'header',
              collapsed: collapsed.value,
              'onUpdate:collapsed': (value: boolean) => {
                collapsed.value = value
              },
            },
            {
              extra: () => h('button', { class: 'extra-action' }, 'Export'),
              default: () =>
                h(
                  ProCard,
                  { title: 'Nested', collapsible: true },
                  { default: () => 'Nested content' },
                ),
            },
          ),
      ),
      { attachTo: document.body },
    )
    await wrapper.get('.extra-action').trigger('click')
    expect(collapsed.value).toBe(false)
    await wrapper
      .findAllComponents(ProCard)[1]!
      .get('[data-pro-card-title-heading]')
      .trigger('click')
    expect(collapsed.value).toBe(false)
    await wrapper.get('[data-pro-card-title-heading]').trigger('click')
    expect(collapsed.value).toBe(true)
  })

  it('only toggles the button in icon mode and exposes its state to the icon slot', async () => {
    wrapper = mount(ProCard, {
      attachTo: document.body,
      props: { title: 'Details', collapsible: 'icon' },
      slots: {
        collapsibleIcon: ({ collapsed }: { collapsed: boolean }) =>
          h('span', collapsed ? '+' : '−'),
        default: () => 'Body',
      },
    })
    await wrapper.get('[data-pro-card-title-heading]').trigger('click')
    expect(wrapper.emitted('collapse')).toBeUndefined()
    await wrapper.get('button').trigger('click')
    expect(wrapper.get('button').text()).toBe('+')
    expect(wrapper.get('.ant-pro-card-body').isVisible()).toBe(false)
  })

  it('provides native skeleton and custom loading content', async () => {
    wrapper = mount(ProCard, {
      attachTo: document.body,
      props: { title: 'Loading', loading: true },
      slots: { default: () => 'Loaded body' },
    })
    expect(wrapper.attributes('aria-busy')).toBe('true')
    expect(wrapper.find('.ant-skeleton').exists()).toBe(true)
    expect(wrapper.text()).not.toContain('Loaded body')
    await wrapper.setProps({ loading: false })
    expect(wrapper.text()).toContain('Loaded body')
    wrapper.unmount()
    wrapper = mount(ProCard, {
      attachTo: document.body,
      props: { loading: true },
      slots: { loading: () => h('p', 'Please wait'), default: () => 'Loaded body' },
    })
    expect(wrapper.text()).toBe('Please wait')
    expect(wrapper.find('.ant-skeleton').exists()).toBe(false)
    await wrapper.setProps({ loading: false })
    expect(wrapper.text()).toBe('Loaded body')
  })

  it('renders a transparent ghost card with no body padding', async () => {
    wrapper = mount(ProCard, {
      attachTo: document.body,
      props: { ghost: true, title: 'Ghost' },
      slots: { default: () => 'Body' },
    })
    const style = getComputedStyle(wrapper.element)
    expect(style.backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(style.borderWidth).toBe('0px')
    expect(style.boxShadow).toBe('none')
    expect(getComputedStyle(wrapper.get('.ant-pro-card-body').element).padding).toBe('0px')
  })

  it('keeps ghost cards flat when boxShadow is enabled and honors explicit root styles', async () => {
    wrapper = mount(ProCard, {
      attachTo: document.body,
      props: { ghost: true, boxShadow: true },
      slots: { default: () => 'Body' },
    })
    expect(getComputedStyle(wrapper.element).boxShadow).toBe('none')
    await wrapper.setProps({
      styles: { root: { boxShadow: 'rgb(255, 0, 0) 0px 1px 2px 0px' } },
    })
    await vi.waitFor(() =>
      expect(getComputedStyle(wrapper!.element).boxShadow).toBe('rgb(255, 0, 0) 0px 1px 2px 0px'),
    )
  })

  it('keeps tabs controlled, respects disabled items and updates ghost panels', async () => {
    const onChange = vi.fn()
    const items = [
      { key: 'a', label: 'Alpha', content: 'Alpha body' },
      { key: 'b', label: 'Beta', content: 'Beta body' },
      { key: 'disabled', label: 'Disabled', content: 'Disabled body', disabled: true },
    ]
    wrapper = mount(ProCard, {
      attachTo: document.body,
      props: { tabs: { activeKey: 'a', items, onChange, cardProps: { ghost: true } } },
    })
    await wrapper.findAll('[role=tab]')[1]!.trigger('click')
    expect(onChange).toHaveBeenCalledExactlyOnceWith('b')
    expect(wrapper.emitted('tabChange')).toEqual([['b']])
    expect(wrapper.get('[role=tab][aria-selected=true]').text()).toBe('Alpha')
    expect(wrapper.get('.ant-pro-card-tabs').classes()).toContain('ant-pro-card-tabs-ghost')
    expect(wrapper.find('[data-pro-card-tabs-ghost]').exists()).toBe(true)
    expect(getComputedStyle(wrapper.get('[role=tabpanel]').element).padding).toBe('0px')
    await wrapper.setProps({
      tabs: { activeKey: 'b', items, onChange, cardProps: { ghost: false } },
    })
    expect(wrapper.get('[role=tab][aria-selected=true]').text()).toBe('Beta')
    expect(wrapper.get('.ant-pro-card-tabs').classes()).not.toContain('ant-pro-card-tabs-ghost')
    expect(wrapper.find('[data-pro-card-tabs-ghost]').exists()).toBe(false)
    await wrapper.findAll('[role=tab]')[2]!.trigger('click')
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(wrapper.emitted('tabChange')).toEqual([['b']])
    expect(wrapper.get('[role=tab][aria-selected=true]').text()).toBe('Beta')
    expect(wrapper.text()).toContain('Beta body')
    expect(wrapper.text()).not.toContain('Disabled body')
  })

  it('opens a native tooltip from an object configuration', async () => {
    wrapper = mount(ProCard, {
      attachTo: document.body,
      props: {
        title: 'Details',
        tooltip: { title: 'Object hint', placement: 'bottom', mouseEnterDelay: 0 },
      },
    })
    await userEvent.hover(wrapper.get('[data-pro-card-tooltip]').element)
    await vi.waitFor(() => {
      const tooltip = document.querySelector('[role=tooltip]')
      expect(tooltip?.textContent).toContain('Object hint')
      expect(tooltip?.closest('.ant-tooltip-placement-bottom')).not.toBeNull()
    })
  })
})
