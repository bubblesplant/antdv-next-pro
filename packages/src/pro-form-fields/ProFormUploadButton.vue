<script setup lang="ts">
import { getCurrentInstance } from 'vue'
import ProFormField from './ProFormField.vue'
import { pickExplicitProps } from './fieldRegistry'
import type { ProFormUploadButtonProps } from './types'

defineOptions({ name: 'AntdvNextProFormUploadButton', inheritAttrs: false })
const props = defineProps<ProFormUploadButtonProps>()
const emit = defineEmits<{
  (event: 'update:modelValue', value: ProFormUploadButtonProps['modelValue']): void
  (event: 'change', ...args: unknown[]): void
  (event: 'drop', value: unknown): void
}>()
const instance = getCurrentInstance()
const explicitProps = () => pickExplicitProps(props, instance?.vnode.props)
</script>

<template>
  <ProFormField
    field-type="uploadButton"
    v-bind="{ ...explicitProps(), ...$attrs }"
    @update:model-value="
      emit('update:modelValue', $event as ProFormUploadButtonProps['modelValue'])
    "
    @change="(...args) => emit('change', ...args)"
    @drop="emit('drop', $event)"
  >
    <template v-for="(_, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps ?? {}" />
    </template>
  </ProFormField>
</template>
