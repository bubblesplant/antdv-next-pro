import type { TabsProps } from 'antdv-next'
import type { VueWrapper } from '@vue/test-utils'

import { flushPromises, mount } from '@vue/test-utils'
import { ConfigProvider } from 'antdv-next'
import { afterEach, describe, expect, it } from 'vite-plus/test'
import { defineComponent, h } from 'vue'

import ProCard from '../src/ProCard.vue'
import '../src/style.css'

let wrapper: VueWrapper | undefined
const items = [{ key: 'a', label: 'Alpha', content: 'Alpha body' }]

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  document.body.innerHTML = ''
})

describe('ProCard Tabs spacing', () => {
  it.each([
    ['top', 'top', false],
    ['bottom', 'bottom', false],
    ['start', 'left', true],
    ['end', 'right', true],
  ] as const)('uses the upstream spacing for %s tabs', async (tabPlacement, position, vertical) => {
    wrapper = mount(ProCard, {
      attachTo: document.body,
      props: { tabs: { items, tabPlacement } },
    })
    await flushPromises()

    expect(wrapper.find(`.ant-tabs-${position}`).exists()).toBe(true)
    expect(getComputedStyle(wrapper.get('.ant-pro-card-body').element).padding).toBe('0px')
    const header = getComputedStyle(wrapper.get('[role="tablist"]').element)
    // The upstream bottom placement retains native Tabs' margin above the navigation.
    expect([header.marginTop, header.marginRight, header.marginBottom, header.marginLeft]).toEqual([
      position === 'bottom' ? '16px' : '0px',
      '0px',
      '0px',
      '0px',
    ])
    expect(header.marginBlockEnd).toBe('0px')
    expect(header.marginInlineEnd).toBe('0px')
    const nav = getComputedStyle(wrapper.get('.ant-tabs-nav-list').element)
    expect(nav.paddingInlineStart).toBe(vertical ? '0px' : '24px')
    expect(nav.paddingBlockStart).toBe(vertical ? '16px' : '0px')
    const panel = wrapper.get('[role="tabpanel"]').element
    expect(getComputedStyle(panel).padding).toBe('24px')
    expect(getComputedStyle(panel.parentElement!).padding).toBe('0px')
    expect(getComputedStyle(panel.parentElement!.parentElement!).padding).toBe('0px')
  })

  it.each(['top', 'start', 'end'] as const)(
    'removes content spacing for ghost %s tabs',
    async (tabPlacement) => {
      wrapper = mount(ProCard, {
        attachTo: document.body,
        props: { tabs: { items, tabPlacement, cardProps: { ghost: true } } },
      })
      await flushPromises()
      expect(getComputedStyle(wrapper.get('[role="tabpanel"]').element).padding).toBe('0px')
    },
  )

  it('uses theme spacing tokens with custom card and native Tabs prefixes', async () => {
    wrapper = mount(
      defineComponent(
        () => () =>
          h(
            ConfigProvider,
            { prefixCls: 'brand', theme: { token: { paddingLG: 32, padding: 20 } } },
            {
              default: () =>
                h(ProCard, { prefixCls: 'business-card', tabs: { items, tabPlacement: 'start' } }),
            },
          ),
      ),
      { attachTo: document.body },
    )
    await flushPromises()
    expect(getComputedStyle(wrapper.get('.business-card-body').element).padding).toBe('0px')
    expect(getComputedStyle(wrapper.get('.brand-tabs-nav-list').element).paddingBlockStart).toBe(
      '20px',
    )
    expect(getComputedStyle(wrapper.get('[role="tabpanel"]').element).padding).toBe('32px')
  })

  it.each(['object', 'function'] as const)(
    'preserves %s semantic styles and classes with user priority',
    async (source) => {
      const styles = { header: { marginBlockEnd: '9px' }, content: { padding: '7px' } }
      const classes = { header: 'business-tab-header', content: 'business-tab-content' }
      let resolvedActiveKey: string | undefined
      const callbackStyles: TabsProps['styles'] = ({ props }) => {
        resolvedActiveKey = props.activeKey
        return styles
      }
      wrapper = mount(ProCard, {
        attachTo: document.body,
        props: {
          tabs: {
            activeKey: 'a',
            items,
            cardProps: { ghost: true },
            styles: source === 'function' ? callbackStyles : styles,
            classes: source === 'function' ? () => classes : classes,
          },
        },
      })
      await flushPromises()
      const header = wrapper.get('.business-tab-header')
      expect(header.classes()).toContain('antdv-next-pro-card-tabs-header')
      expect(getComputedStyle(header.element).marginBlockEnd).toBe('9px')
      expect(getComputedStyle(wrapper.get('.business-tab-content').element).padding).toBe('7px')
      if (source === 'function') expect(resolvedActiveKey).toBe('a')
    },
  )

  it('allows Card body styles to override the default zero spacing', async () => {
    wrapper = mount(ProCard, {
      attachTo: document.body,
      props: {
        tabs: { items },
        bodyStyle: { padding: '11px' },
        styles: { body: { padding: '13px' } },
      },
    })
    await flushPromises()
    expect(getComputedStyle(wrapper.get('.ant-pro-card-body').element).padding).toBe('13px')
    expect(getComputedStyle(wrapper.get('[role="tabpanel"]').element).padding).toBe('24px')
  })
})
