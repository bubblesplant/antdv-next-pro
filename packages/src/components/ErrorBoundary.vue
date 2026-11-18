<script setup lang="ts">
import type { ErrorBoundaryProps } from './types'
import { ref, onErrorCaptured, watch } from 'vue'
import { Result, Button } from 'antdv-next'
import { useAuxiliaryStyle } from './useAuxiliaryStyle'
import RenderNode from '../table/RenderNode.vue'
const {
  fallback = undefined,
  resetKeys,
  onError,
  prefixCls,
  classes: classesProp,
  classNames,
  styles: stylesProp,
} = defineProps<ErrorBoundaryProps>()
// 保留整体 props 接口，getter 持续读取响应式解构值。
const props = {
  get fallback() {
    return fallback
  },
  get resetKeys() {
    return resetKeys
  },
  get onError() {
    return onError
  },
  get prefixCls() {
    return prefixCls
  },
  get classes() {
    return classesProp
  },
  get classNames() {
    return classNames
  },
  get styles() {
    return stylesProp
  },
}
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
  onError?.(cause, info)
  return false
})
watch(() => resetKeys, reset, { deep: true })
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
