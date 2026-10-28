import { defineComponent, h, type PropType, type VNodeChild } from 'vue'
import { useProPrefix } from '../provider'
import { useThemeVars } from '../shared/useThemeVars'
import ProCardBase from '../ProCard.vue'
import type { ProCardProps } from '../types'

export const ProCardGroup = defineComponent({
  name: 'ProCardGroup',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h(
        ProCardBase,
        { ...attrs, ghost: true, direction: attrs.direction === 'column' ? 'column' : 'row' },
        slots,
      )
  },
})
export const ProCardDivider = defineComponent({
  name: 'ProCardDivider',
  props: { type: { type: String as PropType<'horizontal' | 'vertical'>, default: 'vertical' } },
  setup(props, { attrs }) {
    const prefix = useProPrefix('card-divider')
    const themeVars = useThemeVars()
    return () =>
      h('div', {
        ...attrs,
        role: 'separator',
        'aria-orientation': props.type,
        class: [prefix.value, attrs.class],
        style: [
          themeVars.value,
          props.type === 'vertical'
            ? {
                width: '1px',
                alignSelf: 'stretch',
                background: 'var(--antdv-next-pro-color-border-secondary, #f0f0f0)',
              }
            : {
                height: '1px',
                width: '100%',
                background: 'var(--antdv-next-pro-color-border-secondary, #f0f0f0)',
              },
          attrs.style,
        ],
      })
  },
})
/** Historical TabPane adapter. Prefer tabs.items for new usage. */
export const ProCardTabPane = defineComponent({
  name: 'ProCardTabPane',
  props: {
    tab: null as unknown as PropType<VNodeChild>,
    cardProps: Object as PropType<ProCardProps>,
  },
  setup(props, { slots, attrs }) {
    return () => h(ProCardBase, { ...props.cardProps, ...attrs }, slots)
  },
})
export const ProCard = Object.assign(ProCardBase, {
  isProCard: true as const,
  Group: ProCardGroup,
  Divider: ProCardDivider,
  TabPane: ProCardTabPane,
})
export default ProCard
