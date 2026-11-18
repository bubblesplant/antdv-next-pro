<script setup lang="ts">
import { h, mergeProps, useSlots, type Component, type VNodeChild } from 'vue'

defineOptions({ name: 'AntdvNextProDirectSlotRenderer', inheritAttrs: false })

const {
  component,
  componentProps,
  rootAttrs,
  content,
  useContent = false,
} = defineProps<{
  component: Component
  componentProps?: Record<string, unknown>
  rootAttrs?: Record<string, unknown>
  content?: VNodeChild
  useContent?: boolean
}>()
const slots = useSlots()

// FormItem must receive the real control as its direct slot result for id, ARIA and refs.
// Keep this VNode boundary so callback fallbacks retain FormItem identity and validation state.
const RenderControl = () =>
  h(component, mergeProps(componentProps ?? {}, rootAttrs ?? {}), {
    default: () => (useContent ? content : slots.default?.()),
  })
</script>

<template>
  <RenderControl />
</template>
