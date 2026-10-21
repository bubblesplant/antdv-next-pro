import { ConfigProvider, theme } from 'antdv-next'
import { useConfig } from 'antdv-next/config-provider'
import { computed, defineComponent, h, inject, onBeforeUnmount, provide, type PropType } from 'vue'
import { proConfigContextKey } from './context'
import type { IntlType, ProConfigProviderProps, ProToken, ProValueTypeMap } from './types'

export const ProConfigProvider = defineComponent({
  name: 'ProConfigProvider',
  inheritAttrs: false,
  props: {
    intl: Object as PropType<IntlType>,
    token: Object as PropType<ProToken>,
    valueTypeMap: Object as PropType<ProValueTypeMap>,
    prefixCls: String,
    dark: { type: Boolean, default: undefined },
    contentHash: String,
    autoClearCache: { type: Boolean, default: false },
    hashed: { type: Boolean, default: undefined },
    needDeps: Boolean,
  },
  setup(props, { slots }) {
    const parent = inject(proConfigContextKey, undefined)
    const nativeConfig = useConfig()
    const cache =
      props.needDeps &&
      parent &&
      !props.intl &&
      !props.token &&
      !props.valueTypeMap &&
      !props.prefixCls &&
      props.dark === undefined &&
      props.hashed === undefined
        ? parent.cache
        : new Map()
    provide(proConfigContextKey, {
      explicitIntl: computed(() => props.intl ?? parent?.explicitIntl.value),
      proToken: computed(() => mergeProToken(parent?.proToken.value ?? {}, props.token ?? {})),
      valueTypeMap: computed(() => ({ ...parent?.valueTypeMap.value, ...props.valueTypeMap })),
      prefixCls: computed(() => props.prefixCls ?? parent?.prefixCls.value),
      contentHash: computed(() => props.contentHash ?? parent?.contentHash.value),
      cache,
    })
    onBeforeUnmount(() => {
      if (props.autoClearCache && cache !== parent?.cache) cache.clear()
    })
    return () => {
      if (
        props.needDeps &&
        parent &&
        !props.intl &&
        !props.token &&
        !props.valueTypeMap &&
        !props.prefixCls &&
        props.dark === undefined &&
        props.hashed === undefined
      )
        return slots.default?.()
      if (props.dark === undefined && props.hashed === undefined) return slots.default?.()
      const inherited = nativeConfig.value.theme?.algorithm
      const algorithms = inherited ? (Array.isArray(inherited) ? inherited : [inherited]) : []
      // Explicit false retains the native provider's algorithm, including native dark mode.
      const algorithm = props.dark
        ? [...algorithms.filter((item) => item !== theme.darkAlgorithm), theme.darkAlgorithm]
        : inherited
      return h(
        ConfigProvider,
        {
          theme: {
            algorithm:
              algorithm && (!Array.isArray(algorithm) || algorithm.length)
                ? algorithm
                : theme.defaultAlgorithm,
            ...(props.hashed === undefined ? {} : { hashed: props.hashed }),
          },
        },
        slots,
      )
    }
  },
})

export const ProProvider = ProConfigProvider
export type { ProConfigProviderProps }

export function mergeProToken(base: ProToken, patch: ProToken): ProToken {
  const result = { ...base, ...patch }
  if (base.layout || patch.layout)
    result.layout = {
      ...base.layout,
      ...patch.layout,
      sider: { ...base.layout?.sider, ...patch.layout?.sider },
      header: { ...base.layout?.header, ...patch.layout?.header },
      pageContainer: { ...base.layout?.pageContainer, ...patch.layout?.pageContainer },
    }
  return result
}
