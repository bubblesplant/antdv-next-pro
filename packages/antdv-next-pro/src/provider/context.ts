import { theme, useConfig as useNativeBaseConfig, type GlobalToken } from 'antdv-next'
import { useConfig } from 'antdv-next/config-provider'
import {
  computed,
  inject,
  type ComputedRef,
  type InjectionKey,
  type MaybeRefOrGetter,
  toValue,
} from 'vue'
import { findIntlKeyByAntdLocaleKey, intlMap, zhCNIntl } from './locales'
import type { IntlType, ProRequestCacheEntry, ProToken, ProValueTypeMap } from './types'

export interface ProProviderContext {
  explicitIntl: ComputedRef<IntlType | undefined>
  proToken: ComputedRef<ProToken>
  valueTypeMap: ComputedRef<ProValueTypeMap>
  prefixCls: ComputedRef<string | undefined>
  contentHash: ComputedRef<string | undefined>
  cache: Map<string, ProRequestCacheEntry>
}

export const proConfigContextKey: InjectionKey<ProProviderContext> = Symbol('ProConfigProvider')

export interface ProConfigContext {
  intl: ComputedRef<IntlType>
  token: ComputedRef<GlobalToken & ProToken>
  nativeToken: ReturnType<typeof theme.useToken>['token']
  nativeConfig: ComputedRef<
    ReturnType<typeof useConfig>['value'] & {
      componentDisabled: boolean
      componentSize: ReturnType<typeof useNativeBaseConfig>['componentSize']['value']
    }
  >
  hashId: ReturnType<typeof theme.useToken>['hashId']
  prefixCls: ComputedRef<string>
  direction: ComputedRef<'ltr' | 'rtl'>
  valueTypeMap: ComputedRef<ProValueTypeMap>
  cache: Map<string, ProRequestCacheEntry> | undefined
  contentHash: ComputedRef<string | undefined> | undefined
}

export function useProConfig(): ProConfigContext {
  const context = inject(proConfigContextKey, undefined)
  const fullConfig = useConfig()
  const baseConfig = useNativeBaseConfig()
  const nativeConfig = computed(() => ({
    ...fullConfig.value,
    componentDisabled: baseConfig.componentDisabled.value,
    componentSize: baseConfig.componentSize.value,
  }))
  const { token: nativeToken, hashId } = theme.useToken()
  const intl = computed(
    () =>
      context?.explicitIntl.value ??
      intlMap[findIntlKeyByAntdLocaleKey(nativeConfig.value.locale?.locale)] ??
      zhCNIntl,
  )
  const token = computed(() => ({ ...nativeToken.value, ...context?.proToken.value }))
  const prefixCls = computed(
    () => context?.prefixCls.value ?? nativeConfig.value.getPrefixCls('pro'),
  )
  const direction = computed(() => nativeConfig.value.direction ?? 'ltr')
  const valueTypeMap = computed(() => context?.valueTypeMap.value ?? {})
  return {
    intl,
    token,
    nativeToken,
    nativeConfig,
    hashId,
    prefixCls,
    direction,
    valueTypeMap,
    cache: context?.cache,
    contentHash: context?.contentHash,
  }
}

export function useIntl(): ComputedRef<IntlType> {
  return useProConfig().intl
}

export function useProPrefix(
  suffix: string,
  customizePrefixCls?: MaybeRefOrGetter<string | undefined>,
): ComputedRef<string> {
  const { prefixCls } = useProConfig()
  return computed(
    () => toValue(customizePrefixCls) ?? `${prefixCls.value}${suffix ? `-${suffix}` : ''}`,
  )
}
