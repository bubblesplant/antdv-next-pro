<script setup lang="ts">
import type { VNodeChild } from 'vue'

import { Button, Input } from 'antdv-next'
import {
  computed,
  getCurrentInstance,
  mergeProps,
  onBeforeUnmount,
  ref,
  useAttrs,
  useSlots,
} from 'vue'

import VNodeContent from '../shared/VNodeContent'
import { useThemeVars } from '../shared/useThemeVars'
import { hasExplicitProp, resolveFieldDescriptor, type ProFormControlType } from './fieldRegistry'
import { normalizeFieldOption, resolveLocalFieldOptions } from './options'
import ReadonlyField from './ReadonlyField.vue'
import type { ProFormFieldOption, ProFormFieldRequest, ProFormValueEnum } from './types'
import { useFieldOptions } from './useFieldOptions'

interface Props {
  fieldType?: ProFormControlType
  valueType?: ProFormControlType
  modelValue?: unknown
  fieldProps?: Record<string, unknown>
  options?: ProFormFieldOption[]
  valueEnum?: ProFormValueEnum
  request?: ProFormFieldRequest
  params?: Record<string, unknown>
  disabled?: boolean
  readonly?: boolean
  emptyText?: VNodeChild
  readonlyRender?: (value: unknown) => VNodeChild
  loading?: boolean
  precision?: number | false
  min?: number | string | false
  prefix?: VNodeChild | false
  showTime?: boolean | Record<string, unknown>
  layout?: 'horizontal' | 'vertical'
  onGetCaptcha?: () => void | boolean | Promise<void | boolean>
  countDown?: number
  captchaText?: VNodeChild
  countDownText?: (seconds: number) => VNodeChild
  buttonProps?: Record<string, unknown>
}

defineOptions({ name: 'AntdvNextProFieldControl', inheritAttrs: false })

const props = defineProps<Props>()
const emit = defineEmits<{
  (event: 'update:modelValue', value: unknown): void
  (event: 'change', ...args: unknown[]): void
  (event: 'drop', value: unknown): void
  (event: 'requestError', error: unknown): void
  (event: 'captchaError', error: unknown): void
}>()

const attrs = useAttrs()
const slots = useSlots()
const instance = getCurrentInstance()
const themeVars = useThemeVars()
const captchaLoading = ref(false)
const remainingSeconds = ref(0)
let countdownTimer: ReturnType<typeof setInterval> | undefined

const sourceOptions = computed(() => props.options)
const sourceFieldOptions = computed(() => {
  const fieldProps = props.fieldProps ?? {}
  const fieldType = resolveFieldType()
  const value = fieldType === 'treeSelect' ? fieldProps.treeData : fieldProps.options
  return Array.isArray(value) ? value : undefined
})
const sourceValueEnum = computed(() => props.valueEnum)
const sourceRequest = computed(() => props.request)
const sourceParams = computed(() => props.params)

const optionState = useFieldOptions({
  options: sourceOptions,
  fieldOptions: sourceFieldOptions,
  valueEnum: sourceValueEnum,
  request: sourceRequest,
  params: sourceParams,
  onRequestError: (error) => emit('requestError', error),
})

function resolveFieldType(): ProFormControlType {
  return props.fieldType ?? props.valueType ?? 'text'
}

function rawProps(): Record<string, unknown> | null | undefined {
  return instance?.vnode.props
}

function isExplicit(name: string): boolean {
  return hasExplicitProp(rawProps(), name)
}

function resolveSemanticProp(name: keyof Props, fallback?: unknown): unknown {
  if (isExplicit(name)) return props[name]
  const fieldProps = props.fieldProps ?? {}
  if (Object.hasOwn(fieldProps, name)) return fieldProps[name]
  return fallback
}

function resolveReadonly(): boolean {
  if (isExplicit('readonly')) return props.readonly === true
  const fieldProps = props.fieldProps ?? {}
  return fieldProps.readonly === true || fieldProps.readOnly === true
}

function resolveDisabled(): boolean {
  return resolveSemanticProp('disabled', false) === true
}

function hasOptionSource(): boolean {
  const fieldProps = props.fieldProps ?? {}
  return (
    isExplicit('options') ||
    isExplicit('valueEnum') ||
    isExplicit('request') ||
    Array.isArray(fieldProps.options) ||
    Array.isArray(fieldProps.treeData)
  )
}

function resolveOptions(): ProFormFieldOption[] {
  if (props.request) return optionState.options.value
  const fieldProps = props.fieldProps ?? {}
  const fieldOptions =
    resolveFieldType() === 'treeSelect' ? fieldProps.treeData : fieldProps.options
  return resolveLocalFieldOptions({
    options: props.options,
    fieldOptions: Array.isArray(fieldOptions) ? fieldOptions : undefined,
    valueEnum: props.valueEnum,
  })
}

function resolveLoading(): boolean {
  if (isExplicit('loading')) return props.loading === true
  const fieldProps = props.fieldProps ?? {}
  if (Object.hasOwn(fieldProps, 'loading')) return fieldProps.loading === true
  return optionState.loading.value
}

function resolveControlComponent() {
  return resolveFieldDescriptor(resolveFieldType(), hasOptionSource()).component
}

function resolveControlProps(): Record<string, unknown> {
  const fieldType = resolveFieldType()
  const descriptor = resolveFieldDescriptor(fieldType, hasOptionSource())
  const fieldProps = omitManagedProps(props.fieldProps ?? {}, fieldType)
  const rootAttrs = omitManagedProps(attrs, fieldType)
  const merged = mergeProps(fieldProps, rootAttrs) as Record<string, unknown>

  merged.disabled = resolveDisabled()

  if (fieldType === 'digit') {
    applyOptionalDefault(merged, 'precision', resolveSemanticProp('precision', 2))
    applyOptionalDefault(merged, 'min', resolveSemanticProp('min', 0))
  } else if (fieldType === 'money') {
    applyOptionalDefault(merged, 'prefix', resolveSemanticProp('prefix', '¥'))
  } else if (fieldType === 'percent' && !Object.hasOwn(merged, 'addonAfter')) {
    merged.addonAfter = '%'
  }

  if (fieldType === 'dateTime' || fieldType === 'dateTimeRange') {
    merged.showTime = resolveSemanticProp('showTime', true)
  }

  if (descriptor.optionProp === 'options') merged.options = resolveOptions()
  if (descriptor.optionProp === 'treeData') merged.treeData = resolveTreeData(resolveOptions())
  if (fieldType === 'segmented' && !Array.isArray(merged.options)) merged.options = []
  if (fieldType === 'select' || fieldType === 'treeSelect') merged.loading = resolveLoading()

  const value = descriptor.valueProp === 'fileList' ? (props.modelValue ?? []) : props.modelValue
  merged[descriptor.valueProp] = value
  merged[`onUpdate:${descriptor.valueProp}`] = handleModelUpdate
  merged.onChange = handleChange
  if (descriptor.valueProp === 'fileList') {
    merged.onDrop = handleDrop
    merged.beforeUpload = handleBeforeUpload
  }

  return merged
}

function resolveReadonlyType() {
  return resolveFieldDescriptor(resolveFieldType(), hasOptionSource()).readonlyType
}

function resolveMoneyPrefix(): VNodeChild | false | undefined {
  return resolveFieldType() === 'money'
    ? (resolveSemanticProp('prefix', '¥') as VNodeChild | false)
    : undefined
}

function resolveEmptyText(): VNodeChild {
  return resolveSemanticProp('emptyText', '-') as VNodeChild
}

function resolveReadonlyAttrs(): Record<string, unknown> {
  return mergeProps(
    omitManagedProps(props.fieldProps ?? {}, resolveFieldType()),
    omitManagedProps({ ...attrs }, resolveFieldType()),
  ) as Record<string, unknown>
}

function resolveCaptchaInputProps(): Record<string, unknown> {
  const result = resolveControlProps()
  delete result.addonAfter
  return result
}

function resolveCaptchaButtonProps(): Record<string, unknown> {
  const buttonProps = { ...(props.buttonProps ?? {}) }
  delete buttonProps.onClick
  return {
    ...buttonProps,
    loading: captchaLoading.value,
    disabled:
      resolveDisabled() ||
      resolveReadonly() ||
      captchaLoading.value ||
      remainingSeconds.value > 0 ||
      buttonProps.disabled === true,
  }
}

function resolveCaptchaButtonText(): VNodeChild {
  if (remainingSeconds.value > 0) {
    return props.countDownText?.(remainingSeconds.value) ?? `${remainingSeconds.value} 秒后重新获取`
  }
  return resolveSemanticProp('captchaText', '获取验证码') as VNodeChild
}

function resolveCheckboxLayout(): 'horizontal' | 'vertical' {
  return (resolveSemanticProp('layout', 'horizontal') as 'horizontal' | 'vertical') ?? 'horizontal'
}

function resolveNonDefaultSlotNames(): string[] {
  return Object.keys(slots).filter((name) => name !== 'default')
}

function handleModelUpdate(value: unknown): void {
  const descriptor = resolveFieldDescriptor(resolveFieldType(), hasOptionSource())
  callHandler(props.fieldProps?.[`onUpdate:${descriptor.valueProp}`], [value])
  callHandler(attrs[`onUpdate:${descriptor.valueProp}`], [value])
  emit('update:modelValue', value)
}

function handleChange(...args: unknown[]): void {
  callHandler(props.fieldProps?.onChange, args)
  emit('change', ...args)
}

function handleDrop(event: unknown): void {
  callHandler(props.fieldProps?.onDrop, [event])
  emit('drop', event)
}

function handleBeforeUpload(...args: unknown[]): unknown {
  const handlers = [props.fieldProps?.beforeUpload, attrs.beforeUpload].filter(Boolean)
  const results = handlers.flatMap((handler) => callHandlerWithResults(handler, args))
  const hasTransport = Boolean(
    (props.fieldProps ?? {}).action ||
    (props.fieldProps ?? {}).customRequest ||
    attrs.action ||
    attrs.customRequest,
  )

  if (results.some(isPromiseLike)) {
    return Promise.all(results.map((result) => Promise.resolve(result))).then((resolved) =>
      hasTransport ? resolveBeforeUploadResult(resolved) : false,
    )
  }
  return hasTransport ? resolveBeforeUploadResult(results) : false
}

async function getCaptcha(event?: unknown): Promise<void> {
  if (
    captchaLoading.value ||
    remainingSeconds.value > 0 ||
    resolveDisabled() ||
    resolveReadonly()
  ) {
    return
  }

  captchaLoading.value = true
  callHandler(props.buttonProps?.onClick, [event])
  try {
    const result = await props.onGetCaptcha?.()
    if (result === false) {
      emit('captchaError', false)
      return
    }
    startCountdown()
  } catch (error) {
    emit('captchaError', error)
  } finally {
    captchaLoading.value = false
  }
}

function startCountdown(): void {
  resetCountdown()
  remainingSeconds.value = Math.max(0, Math.floor(props.countDown ?? 60))
  if (remainingSeconds.value === 0) return
  countdownTimer = setInterval(() => {
    remainingSeconds.value = Math.max(remainingSeconds.value - 1, 0)
    if (remainingSeconds.value === 0) clearCountdownTimer()
  }, 1000)
}

function resetCountdown(): void {
  clearCountdownTimer()
  remainingSeconds.value = 0
}

function clearCountdownTimer(): void {
  if (countdownTimer === undefined) return
  clearInterval(countdownTimer)
  countdownTimer = undefined
}

function omitManagedProps(
  source: Record<string, unknown>,
  fieldType: ProFormControlType,
): Record<string, unknown> {
  const result = { ...source }
  const managedProps = [
    'value',
    'checked',
    'fileList',
    'onUpdate:value',
    'onUpdate:checked',
    'onUpdate:fileList',
    'onChange',
    'onDrop',
    'beforeUpload',
    'options',
    'treeData',
    'loading',
    'disabled',
    'readonly',
    'readOnly',
  ]
  if (fieldType === 'digit') managedProps.push('precision', 'min')
  if (fieldType === 'money') managedProps.push('prefix')
  if (fieldType === 'dateTime' || fieldType === 'dateTimeRange') managedProps.push('showTime')
  if (fieldType === 'checkbox') managedProps.push('layout')

  for (const key of managedProps) {
    delete result[key]
  }
  return result
}

function applyOptionalDefault(target: Record<string, unknown>, key: string, value: unknown): void {
  if (value !== false && value !== undefined) target[key] = value
}

function resolveTreeData(options: readonly unknown[]): Array<Record<string, unknown>> {
  return options.map((item) => {
    const option = normalizeFieldOption(item)
    return {
      ...option,
      title: option.title ?? option.label,
      label: option.label,
      value: option.value,
      children: Array.isArray(option.children) ? resolveTreeData(option.children) : option.children,
    }
  })
}

function callHandler(handler: unknown, args: unknown[]): void {
  for (const callback of toHandlers(handler)) callback(...args)
}

function callHandlerWithResults(handler: unknown, args: unknown[]): unknown[] {
  return toHandlers(handler).map((callback) => callback(...args))
}

function toHandlers(value: unknown): Array<(...args: unknown[]) => unknown> {
  if (typeof value === 'function') return [value as (...args: unknown[]) => unknown]
  if (!Array.isArray(value)) return []
  return value.filter((item): item is (...args: unknown[]) => unknown => typeof item === 'function')
}

function resolveBeforeUploadResult(results: unknown[]): unknown {
  if (results.some((result) => result === false)) return false
  return results.at(-1)
}

function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return isRecord(value) && typeof value.then === 'function'
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

onBeforeUnmount(clearCountdownTimer)

defineExpose({
  refresh: optionState.refresh,
  resetCountdown,
})
</script>

<template>
  <ReadonlyField
    v-if="resolveReadonly()"
    :value="modelValue"
    :options="resolveOptions()"
    :type="resolveReadonlyType()"
    :empty-text="resolveEmptyText()"
    :money-prefix="resolveMoneyPrefix()"
    :readonly-render="readonlyRender"
    v-bind="resolveReadonlyAttrs()"
  />

  <div v-else-if="resolveFieldType() === 'captcha'" class="antdv-next-pro-captcha">
    <Input v-bind="resolveCaptchaInputProps()">
      <template v-for="(_, name) in $slots" #[name]="slotProps">
        <slot v-if="name !== 'captcha'" :name="name" v-bind="slotProps ?? {}" />
      </template>
    </Input>
    <Button v-bind="resolveCaptchaButtonProps()" @click="getCaptcha">
      <slot v-if="$slots.captcha" name="captcha" :seconds="remainingSeconds" />
      <VNodeContent v-else :content="resolveCaptchaButtonText()" />
    </Button>
  </div>

  <component
    :is="resolveControlComponent()"
    v-else-if="resolveFieldType() === 'uploadButton'"
    v-bind="resolveControlProps()"
  >
    <template #default>
      <slot>
        <Button :disabled="resolveDisabled()">点击上传</Button>
      </slot>
    </template>
    <template v-for="name in resolveNonDefaultSlotNames()" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps ?? {}" />
    </template>
  </component>

  <component
    :is="resolveControlComponent()"
    v-else-if="resolveFieldType() === 'uploadDragger'"
    v-bind="resolveControlProps()"
  >
    <template #default>
      <slot>
        <div class="antdv-next-pro-upload-dragger-placeholder" :style="themeVars">
          点击或拖拽文件到此区域上传
        </div>
      </slot>
    </template>
    <template v-for="name in resolveNonDefaultSlotNames()" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps ?? {}" />
    </template>
  </component>

  <div
    v-else-if="resolveFieldType() === 'checkbox' && hasOptionSource()"
    class="antdv-next-pro-checkbox-group"
    :class="`is-${resolveCheckboxLayout()}`"
  >
    <component :is="resolveControlComponent()" v-bind="resolveControlProps()">
      <template v-for="(_, name) in $slots" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps ?? {}" />
      </template>
    </component>
  </div>

  <component :is="resolveControlComponent()" v-else v-bind="resolveControlProps()">
    <template v-for="(_, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps ?? {}" />
    </template>
  </component>
</template>

<style scoped>
.antdv-next-pro-captcha {
  display: flex;
  width: 100%;
  gap: 8px;
}

.antdv-next-pro-captcha :deep(.ant-input-affix-wrapper),
.antdv-next-pro-captcha :deep(.ant-input) {
  min-width: 0;
  flex: 1;
}

.antdv-next-pro-checkbox-group.is-vertical :deep(.ant-checkbox-group) {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.antdv-next-pro-upload-dragger-placeholder {
  padding: 24px;
  color: var(--antdv-next-pro-color-text-secondary, rgba(0, 0, 0, 0.65));
  text-align: center;
}
</style>
