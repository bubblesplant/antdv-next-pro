<script setup lang="ts">
import { useSlots, type FunctionalComponent, type VNodeChild } from 'vue'

defineOptions({ name: 'ProRenderView' })
const { render } = defineProps<{ render?: (dom: VNodeChild) => VNodeChild }>()
const slots = useSlots()

// Public render callbacks may return existing VNodes; keep their VDOM boundary local.
const RenderContent: FunctionalComponent = () => {
  const dom = slots.default?.()
  return render ? render(dom) : dom
}
// Declaring props keeps full attribute fallthrough on the returned root VNode.
RenderContent.props = []
</script>

<template>
  <RenderContent />
</template>
