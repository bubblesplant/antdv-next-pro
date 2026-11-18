<script setup lang="ts">
import { ConfigProvider, theme } from 'antdv-next'
import { useConfig } from 'antdv-next/config-provider'
import { computed, inject, onBeforeUnmount, provide } from 'vue'
import { proConfigContextKey } from './context'
import type { ProConfigProviderProps } from './types'
import { mergeProToken } from './token'

defineOptions({ name: 'ProConfigProvider', inheritAttrs: false })
const {
  intl,
  token,
  valueTypeMap,
  prefixCls,
  dark = undefined,
  contentHash,
  autoClearCache = false,
  hashed = undefined,
  needDeps,
} = defineProps<ProConfigProviderProps>()
const parent = inject(proConfigContextKey, undefined)
const nativeConfig = useConfig()
const sharesParent = computed(() =>
  Boolean(
    needDeps &&
    parent &&
    !intl &&
    !token &&
    !valueTypeMap &&
    !prefixCls &&
    dark === undefined &&
    hashed === undefined,
  ),
)
const cache = sharesParent.value && parent ? parent.cache : new Map()
provide(proConfigContextKey, {
  explicitIntl: computed(() => intl ?? parent?.explicitIntl.value),
  proToken: computed(() => mergeProToken(parent?.proToken.value ?? {}, token ?? {})),
  valueTypeMap: computed(() => ({ ...parent?.valueTypeMap.value, ...valueTypeMap })),
  prefixCls: computed(() => prefixCls ?? parent?.prefixCls.value),
  contentHash: computed(() => contentHash ?? parent?.contentHash.value),
  cache,
})
onBeforeUnmount(() => {
  if (autoClearCache && cache !== parent?.cache) cache.clear()
})
const providerTheme = computed(() => {
  const inherited = nativeConfig.value.theme?.algorithm
  const algorithms = inherited ? (Array.isArray(inherited) ? inherited : [inherited]) : []
  // Explicit false retains the native provider's algorithm, including native dark mode.
  const algorithm = dark
    ? [...algorithms.filter((item) => item !== theme.darkAlgorithm), theme.darkAlgorithm]
    : inherited
  return {
    algorithm:
      algorithm && (!Array.isArray(algorithm) || algorithm.length)
        ? algorithm
        : theme.defaultAlgorithm,
    ...(hashed === undefined ? {} : { hashed }),
  }
})
</script>

<template>
  <slot v-if="sharesParent || (dark === undefined && hashed === undefined)" />
  <ConfigProvider v-else :theme="providerTheme">
    <template v-for="(_, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps || {}" />
    </template>
  </ConfigProvider>
</template>
