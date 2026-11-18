<script setup lang="ts">
import { InputNumber, SpaceCompact } from 'antdv-next'
import { computed, useAttrs } from 'vue'
import { useProConfig } from '../provider/context'

defineOptions({ name: 'ProDigitRange', inheritAttrs: false })

const {
  value,
  disabled,
  separator = '~',
  separatorWidth = 30,
} = defineProps<{
  value?: readonly (number | string | null)[]
  disabled?: boolean
  separator?: string
  separatorWidth?: number
}>()
const emit = defineEmits<{
  (event: 'update:value', value: (number | string | null)[]): void
  (event: 'change', value: (number | string | null)[]): void
}>()
const attrs = useAttrs()
const { token } = useProConfig()
const width = computed(() => `calc((100% - ${separatorWidth}px) / 2)`)
const separatorStyle = computed(() => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: `${separatorWidth}px`,
  flexShrink: 0,
  boxSizing: 'border-box' as const,
  border: `1px solid ${token.value.colorBorder}`,
  backgroundColor: token.value.colorBgContainer,
  color: token.value.colorTextSecondary,
  pointerEvents: 'none' as const,
  userSelect: 'none' as const,
}))

function inputAttrs(): Record<string, unknown> {
  const { class: _class, style: _style, ...rest } = attrs
  return rest
}

function placeholder(index: number): string | undefined {
  return (Array.isArray(attrs.placeholder) ? attrs.placeholder[index] : attrs.placeholder) as
    | string
    | undefined
}

function update(index: number, updatedValue: number | string | null): void {
  const next = [...(value ?? [null, null])]
  next[index] = updatedValue
  emit('update:value', next)
  emit('change', next)
}
</script>

<template>
  <SpaceCompact block :class="$attrs.class" :style="$attrs.style">
    <InputNumber
      v-bind="inputAttrs()"
      :disabled="disabled"
      :value="value?.[0]"
      :placeholder="placeholder(0)"
      :style="{ width }"
      @update:value="update(0, $event)"
    />
    <span aria-hidden="true" :style="separatorStyle">{{ separator }}</span>
    <InputNumber
      v-bind="inputAttrs()"
      :disabled="disabled"
      :value="value?.[1]"
      :placeholder="placeholder(1)"
      :style="{ width, borderInlineStart: 0 }"
      @update:value="update(1, $event)"
    />
  </SpaceCompact>
</template>
