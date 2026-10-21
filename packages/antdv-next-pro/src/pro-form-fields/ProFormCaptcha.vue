<script setup lang="ts">
import { getCurrentInstance, ref } from 'vue'
import ProFormField from './ProFormField.vue'
import { pickExplicitProps } from './fieldRegistry'
import type { ProFormCaptchaInstance, ProFormCaptchaProps } from './types'

defineOptions({ name: 'AntdvNextProFormCaptcha', inheritAttrs: false })
const props = defineProps<ProFormCaptchaProps>()
const emit = defineEmits<{
  (event: 'update:modelValue', value: ProFormCaptchaProps['modelValue']): void
  (event: 'change', ...args: unknown[]): void
  (event: 'captchaError', error: unknown): void
}>()
const instance = getCurrentInstance()
const fieldRef = ref<ProFormCaptchaInstance>()
const explicitProps = () => pickExplicitProps(props, instance?.vnode.props)
const resetCountdown = () => fieldRef.value?.resetCountdown()
const startTiming = () => fieldRef.value?.startTiming()
const endTiming = () => fieldRef.value?.endTiming()
const focus = () => fieldRef.value?.focus()
defineExpose<ProFormCaptchaInstance>({ resetCountdown, startTiming, endTiming, focus })
</script>

<template>
  <ProFormField
    ref="fieldRef"
    field-type="captcha"
    v-bind="{ ...explicitProps(), ...$attrs }"
    @update:model-value="emit('update:modelValue', $event as ProFormCaptchaProps['modelValue'])"
    @change="(...args) => emit('change', ...args)"
    @captcha-error="emit('captchaError', $event)"
  >
    <template v-for="(_, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps ?? {}" />
    </template>
  </ProFormField>
</template>
