<script setup lang="ts">
import { getCurrentInstance, ref } from 'vue'
import ProFormField from './ProFormField.vue'
import { pickExplicitProps } from './fieldRegistry'
import type { ProFormTreeSelectProps } from './types'

defineOptions({ name: 'AntdvNextProFormTreeSelect', inheritAttrs: false })
const props = defineProps<ProFormTreeSelectProps>()
const emit = defineEmits<{
  (event: 'update:modelValue', value: ProFormTreeSelectProps['modelValue']): void
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
    field-type="treeSelect"
    v-bind="{ ...explicitProps(), ...$attrs }"
    @update:model-value="emit('update:modelValue', $event as ProFormTreeSelectProps['modelValue'])"
    @change="(...args) => emit('change', ...args)"
    @request-error="emit('requestError', $event)"
  >
    <template v-for="(_, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps ?? {}" />
    </template>
  </ProFormField>
</template>
