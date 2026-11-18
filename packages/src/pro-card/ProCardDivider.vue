<script setup lang="ts">
import { useProPrefix } from '../provider'
import { useThemeVars } from '../shared/useThemeVars'

defineOptions({ name: 'ProCardDivider', inheritAttrs: false })
const { type = 'vertical' } = defineProps<{ type?: 'horizontal' | 'vertical' }>()
const prefix = useProPrefix('card-divider')
const themeVars = useThemeVars()
</script>

<template>
  <div
    v-bind="$attrs"
    role="separator"
    :aria-orientation="type"
    :class="[prefix, $attrs.class]"
    :style="[
      themeVars,
      type === 'vertical'
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
      $attrs.style,
    ]"
  />
</template>
