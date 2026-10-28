<script setup lang="ts">
import { getCurrentInstance } from 'vue'
import ProFormField from './ProFormField.vue'
import { pickExplicitProps } from './fieldRegistry'
import type { ProFormDateTimeRangePickerProps } from './types'

defineOptions({ name: 'AntdvNextProFormDateTimeRangePicker', inheritAttrs: false })
const props = defineProps<ProFormDateTimeRangePickerProps>()
const emit = defineEmits<{
  (event: 'update:modelValue', value: ProFormDateTimeRangePickerProps['modelValue']): void
  (event: 'change', ...args: unknown[]): void
}>()
const instance = getCurrentInstance()
const explicitProps = () => pickExplicitProps(props, instance?.vnode.props)
</script>

<template>
  <ProFormField
    field-type="dateTimeRange"
    v-bind="{ ...explicitProps(), ...$attrs }"
    @update:model-value="
      emit('update:modelValue', $event as ProFormDateTimeRangePickerProps['modelValue'])
    "
    @change="(...args) => emit('change', ...args)"
  >
    <template v-for="(_, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps ?? {}" />
    </template>
  </ProFormField>
</template>
