<script setup lang="ts">
import { getCurrentInstance, ref } from 'vue'
import ProFormField from './ProFormField.vue'
import { pickExplicitProps } from './fieldRegistry'
import type { ProFormSelectProps } from './types'

defineOptions({ name: 'AntdvNextProFormSelect', inheritAttrs: false })
const props = defineProps<ProFormSelectProps>()
const emit = defineEmits<{
  (event: 'update:modelValue', value: ProFormSelectProps['modelValue']): void
  (event: 'change', ...args: unknown[]): void
  (event: 'requestError', error: unknown): void
}>()
const instance = getCurrentInstance()
const fieldRef = ref<{ refresh?: () => Promise<void> }>()
const explicitProps = () => pickExplicitProps(props, instance?.vnode.props)
const refresh = () => fieldRef.value?.refresh?.() ?? Promise.resolve()
defineExpose({ refresh })
</script>

<template>
  <ProFormField
    ref="fieldRef"
    field-type="select"
    v-bind="{ ...explicitProps(), ...$attrs }"
    @update:model-value="emit('update:modelValue', $event as ProFormSelectProps['modelValue'])"
    @change="(...args) => emit('change', ...args)"
    @request-error="emit('requestError', $event)"
  >
    <template v-for="(_, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps ?? {}" />
    </template>
  </ProFormField>
</template>
