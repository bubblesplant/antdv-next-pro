<script setup lang="ts">
import type { ErrorBoundaryProps } from './types'
import { ref, onErrorCaptured, watch } from 'vue'
import { Result, Button } from 'antdv-next'
import { useAuxiliaryStyle } from './useAuxiliaryStyle'
import RenderNode from '../table/RenderNode.vue'
const props = withDefaults(defineProps<ErrorBoundaryProps>(), { fallback: undefined })
const { intl, prefix, direction, classes, styles, themeVars } = useAuxiliaryStyle(
  props,
  'error-boundary',
)
const error = ref<Error>()
function reset() {
  error.value = undefined
}
onErrorCaptured((cause, _instance, info) => {
  error.value = cause
  props.onError?.(cause, info)
  return false
})
watch(() => props.resetKeys, reset, { deep: true })
defineExpose({ reset })
</script>
<template>
  <slot v-if="!error" />
  <div
    v-else
    :class="[prefix, classes.root]"
    :style="[themeVars, styles.root]"
    data-pro-error-boundary
    :dir="direction"
  >
    <slot name="fallback" :error="error" :reset="reset"
      ><RenderNode
        v-if="fallback"
        :content="typeof fallback === 'function' ? fallback(error, reset) : fallback"
      /><Result v-else status="error" :sub-title="error.message"
        ><template #extra
          ><Button @click="reset">{{
            intl.getMessage('tableToolBar.reload', '重试')
          }}</Button></template
        ></Result
      ></slot
    >
  </div>
</template>
