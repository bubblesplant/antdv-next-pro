<script setup lang="ts">
import { computed } from 'vue'
import { FormItem, Popover } from 'antdv-next'
import RenderNode from '../table/RenderNode.vue'
import type { InlineErrorFormItemProps } from './types'
import { useAuxiliaryStyle } from './useAuxiliaryStyle'
defineOptions({ inheritAttrs: false })
const props = defineProps<InlineErrorFormItemProps>()
const { prefix, direction, classes, styles, themeVars } = useAuxiliaryStyle(
  props,
  'form-inline-error-form-item',
)
const bindings = computed(() =>
  Object.fromEntries(
    Object.entries(props).filter(
      ([key]) =>
        !['error', 'errorType', 'prefixCls', 'classes', 'classNames', 'styles'].includes(key),
    ),
  ),
)
</script>
<template>
  <div
    v-bind="$attrs"
    :class="[prefix, classes.root, $attrs.class]"
    :style="[themeVars, styles.root, $attrs.style]"
    data-pro-inline-error-form-item
    :dir="direction"
  >
    <Popover v-if="errorType === 'popover'" :open="Boolean(error)"
      ><template #content
        ><slot name="error"><RenderNode :content="error" /></slot></template
      ><FormItem
        v-bind="bindings"
        :help="undefined"
        :validate-status="error ? 'error' : validateStatus"
        :class="classes.field"
        :style="styles.field"
        ><slot /></FormItem></Popover
    ><FormItem
      v-else
      v-bind="bindings"
      :validate-status="error ? 'error' : validateStatus"
      :class="classes.field"
      :style="styles.field"
      ><slot /><template v-if="error !== undefined || $slots.error" #help
        ><slot name="error"><RenderNode :content="error" /></slot></template
    ></FormItem>
  </div>
</template>
