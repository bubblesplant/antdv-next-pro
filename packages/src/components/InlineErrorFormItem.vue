<script setup lang="ts">
import { computed } from 'vue'
import { FormItem, Popover } from 'antdv-next'
import RenderNode from '../table/RenderNode.vue'
import type { InlineErrorFormItemProps } from './types'
import { useAuxiliaryStyle } from './useAuxiliaryStyle'
defineOptions({ inheritAttrs: false })
const {
  error,
  errorType,
  name,
  rules,
  trigger,
  validateTrigger,
  validateDebounce,
  validateFirst,
  preserve,
  rootClass,
  colon,
  htmlFor,
  label,
  labelAlign,
  labelCol,
  tooltip,
  vertical,
  wrapperCol,
  extra,
  status,
  help,
  fieldId,
  noStyle,
  id,
  hasFeedback,
  validateStatus,
  required,
  hidden,
  messageVariables,
  layout,
  prefixCls,
  classes: classesProp,
  classNames,
  styles: stylesProp,
} = defineProps<InlineErrorFormItemProps>()
// 保留整体 props 接口，getter 持续读取响应式解构值。
const props = {
  get error() {
    return error
  },
  get errorType() {
    return errorType
  },
  get name() {
    return name
  },
  get rules() {
    return rules
  },
  get trigger() {
    return trigger
  },
  get validateTrigger() {
    return validateTrigger
  },
  get validateDebounce() {
    return validateDebounce
  },
  get validateFirst() {
    return validateFirst
  },
  get preserve() {
    return preserve
  },
  get rootClass() {
    return rootClass
  },
  get colon() {
    return colon
  },
  get htmlFor() {
    return htmlFor
  },
  get label() {
    return label
  },
  get labelAlign() {
    return labelAlign
  },
  get labelCol() {
    return labelCol
  },
  get tooltip() {
    return tooltip
  },
  get vertical() {
    return vertical
  },
  get wrapperCol() {
    return wrapperCol
  },
  get extra() {
    return extra
  },
  get status() {
    return status
  },
  get help() {
    return help
  },
  get fieldId() {
    return fieldId
  },
  get noStyle() {
    return noStyle
  },
  get id() {
    return id
  },
  get hasFeedback() {
    return hasFeedback
  },
  get validateStatus() {
    return validateStatus
  },
  get required() {
    return required
  },
  get hidden() {
    return hidden
  },
  get messageVariables() {
    return messageVariables
  },
  get layout() {
    return layout
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
