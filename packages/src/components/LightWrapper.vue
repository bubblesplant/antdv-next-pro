<script setup lang="ts">
import { computed, ref } from 'vue'
import type { LightWrapperProps } from './types'
import FieldLabel from './FieldLabel.vue'
import FilterDropdown from './FilterDropdown.vue'
import { useAuxiliaryStyle } from './useAuxiliaryStyle'
defineOptions({ inheritAttrs: false })
const {
  label = undefined,
  value: valueProp = undefined,
  open = undefined,
  disabled,
  allowClear,
  footerRender = undefined,
  placement,
  prefixCls,
  classes: classesProp,
  classNames,
  styles: stylesProp,
} = defineProps<LightWrapperProps>()
const emit = defineEmits<{ 'update:open': [value: boolean]; clear: []; confirm: [] }>()
// 保留整体 props 接口，getter 持续读取响应式解构值。
const props = {
  get label() {
    return label
  },
  get value() {
    return valueProp
  },
  get open() {
    return open
  },
  get disabled() {
    return disabled
  },
  get allowClear() {
    return allowClear
  },
  get footerRender() {
    return footerRender
  },
  get placement() {
    return placement
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
const { prefix, classes, styles, themeVars } = useAuxiliaryStyle(props, 'field-light-wrapper')
const internal = ref(false)
const opened = computed(() => open ?? internal.value)
function setOpen(value: boolean) {
  if (disabled && value) return
  if (open === undefined) internal.value = value
  emit('update:open', value)
}
</script>
<template>
  <FilterDropdown
    v-bind="$attrs"
    :prefix-cls="prefix"
    :classes="classes"
    :styles="{ ...styles, root: { ...themeVars, ...styles.root } }"
    :open="opened"
    :disabled="disabled"
    :placement="placement"
    :footer="{
      onConfirm: () => {
        emit('confirm')
        setOpen(false)
      },
      onClear: () => emit('clear'),
    }"
    :footer-render="footerRender"
    @update:open="setOpen"
    ><template #label
      ><FieldLabel
        :label="label"
        :value="value"
        :expanded="opened"
        :disabled="disabled"
        :on-clear="allowClear ? () => emit('clear') : undefined" /></template
    ><slot
  /></FilterDropdown>
</template>
