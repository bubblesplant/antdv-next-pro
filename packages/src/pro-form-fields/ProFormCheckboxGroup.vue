<script setup lang="ts">
import { getCurrentInstance } from 'vue'
import ProFormField from './ProFormField.vue'
import { pickExplicitProps } from './fieldRegistry'
import type { ProFormCheckboxGroupProps } from './types'

defineOptions({ name: 'ProFormCheckboxGroup', inheritAttrs: false })
const { ...props } = defineProps<ProFormCheckboxGroupProps>()
const emit = defineEmits<{
  (event: 'update:modelValue', value: ProFormCheckboxGroupProps['modelValue']): void
  (event: 'change', ...args: unknown[]): void
}>()
const instance = getCurrentInstance()
const explicitProps = () => pickExplicitProps(props, instance?.vnode.props)
</script>

<template>
  <ProFormField
    field-type="checkboxGroup"
    v-bind="{ ...explicitProps(), ...$attrs }"
    @update:model-value="
      emit('update:modelValue', $event as ProFormCheckboxGroupProps['modelValue'])
    "
    @change="(...args) => emit('change', ...args)"
  >
    <template v-for="(_, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps ?? {}" />
    </template>
  </ProFormField>
</template>
