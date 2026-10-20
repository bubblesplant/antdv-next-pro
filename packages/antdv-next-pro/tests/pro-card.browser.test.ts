import type { VueWrapper } from '@vue/test-utils'

import { flushPromises, mount } from '@vue/test-utils'
import { Card, ConfigProvider, theme } from 'antdv-next'
import { afterEach, describe, expect, it } from 'vite-plus/test'
import { userEvent } from 'vite-plus/test/browser'
import { defineComponent, h, ref } from 'vue'

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
    expect(wrapper.find('.antdv-next-pro-card__header').exists()).toBe(false)
    expect(wrapper.find('.antdv-next-pro-card__extra').exists()).toBe(false)
    await wrapper.setProps({ title: false, subTitle: false, extra: false })
    expect(wrapper.find('.antdv-next-pro-card__header').exists()).toBe(false)
    await wrapper.setProps({ title: 'Title' })
    expect(wrapper.find('.antdv-next-pro-card__header').exists()).toBe(true)
    expect(wrapper.find('.antdv-next-pro-card__subtitle').exists()).toBe(false)
    expect(wrapper.find('.antdv-next-pro-card__extra').exists()).toBe(false)
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
    const card = wrapper.get('.antdv-next-pro-card').element
    const native = wrapper.get('.native-card').element
    const light = getComputedStyle(card).backgroundColor
    expect(light).toBe(getComputedStyle(native).backgroundColor)
    expect(getComputedStyle(card).borderRadius).toBe('12px')
    expect(getComputedStyle(wrapper.get('.antdv-next-pro-card__body').element).padding).toBe('30px')
    expect(
      getComputedStyle(wrapper.get('.antdv-next-pro-card__header').element).borderBottomWidth,
    ).toBe('0px')
    expect(getComputedStyle(wrapper.get('.antdv-next-pro-card__header').element).paddingTop).toBe(
      '16px',
    )
    dark.value = true
    await flushPromises()
    expect(getComputedStyle(card).backgroundColor).toBe(getComputedStyle(native).backgroundColor)
    expect(getComputedStyle(card).backgroundColor).not.toBe(light)
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
    expect(wrapper.get('.antdv-next-pro-card__title').text()).toContain('Slot title')
    expect(wrapper.get('.antdv-next-pro-card__title').text()).toContain('Subtitle')
    expect(wrapper.get('.antdv-next-pro-card__extra').text()).toBe('Slot action')
    expect(wrapper.get('.antdv-next-pro-card__tooltip').attributes('aria-label')).toBe('Help')
    expect(wrapper.get('.antdv-next-pro-card__cover').text()).toBe('Cover')
    expect(wrapper.get('.antdv-next-pro-card__actions').text()).toBe('Save')
    expect(wrapper.text()).not.toContain('Title prop')
  })

  it('keeps the content mounted across uncontrolled collapse and supports keyboard use', async () => {
    wrapper = mount(ProCard, {
      attachTo: document.body,
      props: { title: 'Details', collapsible: true, defaultCollapsed: true },
      slots: { default: () => h('input', { 'aria-label': 'Draft' }) },
    })
    const content = wrapper.get('input').element
    const toggle = wrapper.get('.antdv-next-pro-card__collapse-button')
    expect(wrapper.get('.antdv-next-pro-card__body').isVisible()).toBe(false)
    expect(document.getElementById(toggle.attributes('aria-controls')!)).not.toBeNull()
    ;(toggle.element as HTMLButtonElement).focus()
    await userEvent.keyboard('{Enter}')
    await flushPromises()
    expect(toggle.attributes('aria-expanded')).toBe('true')
    await wrapper.get('input').setValue('unsaved draft')
    await wrapper.get('.antdv-next-pro-card__heading').trigger('click')
    expect(wrapper.get('.antdv-next-pro-card__body').isVisible()).toBe(false)
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
    expect(wrapper.get('.antdv-next-pro-card__body').isVisible()).toBe(true)
    await wrapper.setProps({ collapsed: true })
    expect(wrapper.get('.antdv-next-pro-card__body').isVisible()).toBe(false)
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
      .get('.antdv-next-pro-card__heading')
      .trigger('click')
    expect(collapsed.value).toBe(false)
    await wrapper.get('.antdv-next-pro-card__heading').trigger('click')
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
    await wrapper.get('.antdv-next-pro-card__heading').trigger('click')
    expect(wrapper.emitted('collapse')).toBeUndefined()
    await wrapper.get('button').trigger('click')
    expect(wrapper.get('button').text()).toBe('+')
    expect(wrapper.get('.antdv-next-pro-card__body').isVisible()).toBe(false)
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
    expect(getComputedStyle(wrapper.get('.antdv-next-pro-card__body').element).padding).toBe('0px')
  })
})
