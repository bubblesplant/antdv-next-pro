<script setup lang="ts">
import { computed, ref } from 'vue'
import type { LightWrapperProps } from './types'
import FieldLabel from './FieldLabel.vue'
import FilterDropdown from './FilterDropdown.vue'
import { useAuxiliaryStyle } from './useAuxiliaryStyle'
defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<LightWrapperProps>(), {
  open: undefined,
  footerRender: undefined,
  label: undefined,
  value: undefined,
})
const emit = defineEmits<{ 'update:open': [value: boolean]; clear: []; confirm: [] }>()
const { prefix, classes, styles, themeVars } = useAuxiliaryStyle(props, 'field-light-wrapper')
const internal = ref(false)
const opened = computed(() => props.open ?? internal.value)
function setOpen(value: boolean) {
  if (props.disabled && value) return
  if (props.open === undefined) internal.value = value
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
