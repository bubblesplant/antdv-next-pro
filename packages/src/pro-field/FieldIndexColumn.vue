<script setup lang="ts">
import { useProPrefix } from '../provider/context'

defineOptions({ name: 'FieldIndexColumn', inheritAttrs: false })
const { text, border } = defineProps<{ text?: number; border?: boolean }>()
const prefix = useProPrefix('field-index-column')
</script>

<template>
  <span
    v-bind="$attrs"
    :class="[prefix, border && `${prefix}-border`, (text ?? 0) > 3 && 'top-three', $attrs.class]"
    :style="[
      {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '18px',
        height: '18px',
      },
      border
        ? {
            color: '#fff',
            borderRadius: '9px',
            backgroundColor: (text ?? 0) > 3 ? '#979797' : '#314659',
            fontSize: '12px',
          }
        : undefined,
      $attrs.style,
    ]"
  >
    <slot>{{ text ?? '' }}</slot>
  </span>
</template>
