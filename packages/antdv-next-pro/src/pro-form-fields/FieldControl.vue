<script setup lang="ts">
import type { VNodeChild } from 'vue'

import { Button, Input, Image, type ImageProps, type UploadFile } from 'antdv-next'
import { InboxOutlined, UploadOutlined } from '@antdv-next/icons'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'
import { useFormItemInputContext } from 'antdv-next/dist/form/context'
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
import { useSemanticStyles } from '../shared/semantic'
import type { ProSemanticClasses, ProSemanticStyles, ProSemanticSource } from '../provider/types'
import { useIntl, useProPrefix, useProConfig } from '../provider/context'
import { useProFormContext } from '../pro-form/context'
import { formatMoney, parseMoney, resolveMoneyLocale, moneyFormatOptions } from '../pro-field/money'
import type { ProDataIndex } from '../types'
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
  options?: unknown[]
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
  radioType?: 'button' | 'radio'
  onGetCaptcha?: (phone: string) => void | boolean | Promise<void | boolean>
  countDown?: number
  captchaText?: VNodeChild
  countDownText?: (seconds: number) => VNodeChild
  buttonProps?: Record<string, unknown>
  prefixCls?: string
  debounceTime?: number
  proFieldKey?: string
  cacheForSwr?: boolean
  searchValue?: string
  phoneName?: ProDataIndex
  captchaTextRender?: (timing: boolean, count: number) => VNodeChild
  captchaProps?: Record<string, unknown>
  onTiming?: (count: number) => void
  icon?: VNodeChild
  title?: VNodeChild
  description?: VNodeChild
  max?: number
  imageProps?: Omit<ImageProps, 'src'>
  classes?: ProSemanticSource<ProSemanticClasses>
  classNames?: ProSemanticSource<ProSemanticClasses>
  styles?: ProSemanticSource<ProSemanticStyles>
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

dayjs.extend(customParseFormat)

const attrs = useAttrs()
const slots = useSlots()
const instance = getCurrentInstance()
const { classes, styles } = useSemanticStyles(props, {
  classes: () => props.classes,
  classNames: () => props.classNames,
  styles: () => props.styles,
})
const intl = useIntl()
const config = useProConfig()
const prefixCls = useProPrefix('field', () => props.prefixCls)
const form = useProFormContext()
const formItemStatus = useFormItemInputContext()
const controlRef = ref<{ focus?: () => void }>()
const captchaLoading = ref(false)
const remainingSeconds = ref(0)
const previewImage = ref('')
const previewOpen = ref(false)
const nativeUploadPrefix = computed(() => config.nativeConfig.value.getPrefixCls('upload'))
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
  keyWords: computed(
    () => props.searchValue ?? (props.fieldProps?.searchValue as string | undefined),
  ),
  debounceTime: computed(
    () => props.debounceTime ?? (props.fieldProps?.debounceTime as number | undefined) ?? 0,
  ),
  proFieldKey: computed(() => props.proFieldKey),
  cacheForSwr: computed(() => props.cacheForSwr),
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
  const fieldProps = props.fieldProps ?? {}
  if (Object.hasOwn(fieldProps, name)) return fieldProps[name]
  if (isExplicit(name)) return props[name]
  return fallback
}

function resolveReadonly(): boolean {
  const fieldProps = props.fieldProps ?? {}
  if (Object.hasOwn(fieldProps, 'readonly') || Object.hasOwn(fieldProps, 'readOnly'))
    return fieldProps.readonly === true || fieldProps.readOnly === true
  if (isExplicit('readonly')) return props.readonly === true
  return fieldProps.readonly === true || fieldProps.readOnly === true
}

function resolveDisabled(): boolean {
  return resolveSemanticProp('disabled', config.nativeConfig.value.componentDisabled) === true
}

function hasOptionSource(): boolean {
  const fieldProps = props.fieldProps ?? {}
  return (
    props.options !== undefined ||
    props.valueEnum !== undefined ||
    props.request !== undefined ||
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
  const merged = mergeProps(rootAttrs, fieldProps) as Record<string, unknown>
  merged.style = [merged.style, styles.value.control]
  const layout = resolveSemanticProp('layout', 'horizontal')
  const nativeField =
    fieldType === 'treeSelect'
      ? 'tree-select'
      : fieldType === 'colorPicker' || fieldType === 'color'
        ? 'color-picker'
        : fieldType
  const group =
    ['checkbox', 'checkboxGroup', 'radio', 'radioGroup', 'radioButton'].includes(fieldType) &&
    (hasOptionSource() || fieldType.endsWith('Group') || fieldType === 'radioButton')
  const groupName = fieldType.startsWith('checkbox') ? 'checkbox' : 'radio'
  const status = fieldProps.status ?? formItemStatus.value.status
  merged.class = [
    merged.class,
    classes.value.control,
    ['treeSelect', 'cascader', 'color', 'colorPicker'].includes(fieldType)
      ? `${prefixCls.value}-${nativeField}`
      : undefined,
    group ? `${prefixCls.value}-${groupName}-${layout}` : undefined,
    group && (status === 'error' || status === 'warning')
      ? `${prefixCls.value}-${groupName}-${status}`
      : undefined,
  ]

  merged.disabled = resolveDisabled()

  if (fieldType === 'digit') {
    applyOptionalDefault(merged, 'precision', resolveSemanticProp('precision'))
    applyOptionalDefault(merged, 'min', resolveSemanticProp('min', 0))
  } else if (fieldType === 'money') {
    const moneyProps = props.fieldProps ?? {}
    const locale = resolveMoneyLocale(
      typeof moneyProps.locale === 'string' ? moneyProps.locale : intl.value.locale,
    )
    const parts = new Intl.NumberFormat(
      locale,
      moneyFormatOptions(locale, moneyProps),
    ).formatToParts(1)
    const currencyIndex = parts.findIndex((part) => part.type === 'currency')
    const currency =
      moneyProps.moneySymbol === false
        ? ''
        : (moneyProps.customSymbol ?? parts[currencyIndex]?.value ?? '')
    const isSuffix = currencyIndex > parts.findIndex((part) => part.type === 'integer')
    applyOptionalDefault(
      merged,
      'prefix',
      resolveSemanticProp('prefix', isSuffix ? undefined : currency),
    )
    if (isSuffix && !Object.hasOwn(merged, 'suffix') && moneyProps.moneySymbol !== false)
      merged.suffix = currency
    merged.formatter ??= (value: unknown, info: { userTyping: boolean; input: string }) =>
      info.userTyping
        ? info.input
        : formatMoney(value, locale, { ...moneyProps, moneySymbol: false })
    merged.parser ??= (text: string | undefined) => parseMoney(text, locale)
    for (const key of [
      'locale',
      'customSymbol',
      'moneySymbol',
      'numberFormatOptions',
      'numberPopoverRender',
    ])
      delete merged[key]
  } else if (fieldType === 'percent' && !Object.hasOwn(merged, 'addonAfter')) {
    merged.addonAfter = '%'
  }

  if (fieldType === 'dateTime' || fieldType === 'dateTimeRange' || fieldType === 'fromNow') {
    merged.showTime = resolveSemanticProp('showTime', true)
  }
  if (fieldType === 'second') merged.min ??= 0
  if (fieldType === 'code' || fieldType === 'jsonCode') merged.rows ??= 5
  const pickerMatch = /^date(Week|Month|Quarter|Year)(?:Range)?$/.exec(fieldType)
  if (pickerMatch && !Object.hasOwn(merged, 'picker')) merged.picker = pickerMatch[1]!.toLowerCase()
  if (fieldType === 'radioButton') merged.optionType = 'button'
  if (fieldType === 'radioGroup' || (fieldType === 'radio' && hasOptionSource())) {
    merged.optionType ??= resolveSemanticProp('radioType') === 'button' ? 'button' : 'default'
    if (resolveSemanticProp('layout') === 'vertical')
      merged.style = [
        merged.style,
        { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' },
      ]
  }

  if (descriptor.optionProp === 'options') merged.options = resolveOptions()
  if (descriptor.optionProp === 'treeData') merged.treeData = resolveTreeData(resolveOptions())
  if (fieldType === 'segmented' && !Array.isArray(merged.options)) merged.options = []
  if (fieldType === 'select' || fieldType === 'treeSelect') merged.loading = resolveLoading()
  if (props.request && ['select', 'treeSelect', 'cascader'].includes(fieldType)) {
    merged.showSearch ??= true
    merged.filterOption = false
    merged.onSearch = (value: string) => {
      optionState.search(value)
      callHandler(props.fieldProps?.onSearch, [value])
      callHandler(attrs.onSearch, [value])
    }
  }

  if (fieldType === 'checkboxGroup' || (fieldType === 'checkbox' && hasOptionSource())) {
    merged.style = [
      merged.style,
      resolveCheckboxLayout() === 'vertical'
        ? { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }
        : undefined,
    ]
  }
  let value = descriptor.valueProp === 'fileList' ? (props.modelValue ?? []) : props.modelValue
  if (/^(?:date|time|fromNow)/.test(fieldType) && !merged.valueFormat && value != null) {
    const parse = (item: unknown) => {
      if (item == null || item === '') return null
      const parsed = dayjs.isDayjs(item)
        ? item
        : typeof item === 'string' && fieldType.startsWith('time')
          ? dayjs(item, typeof merged.format === 'string' ? merged.format : 'HH:mm:ss')
          : dayjs(item as string | number | Date)
      return parsed.isValid() ? parsed : null
    }
    value = Array.isArray(value) ? value.map(parse) : parse(value)
  }
  if (
    (fieldType === 'code' || fieldType === 'jsonCode') &&
    typeof value === 'object' &&
    value !== null
  ) {
    try {
      value = JSON.stringify(value, null, 2)
    } catch {
      value = String(value)
    }
  }
  merged[descriptor.valueProp] = value
  merged[`onUpdate:${descriptor.valueProp}`] = handleModelUpdate
  merged.onChange = handleChange
  if (descriptor.valueProp === 'fileList') {
    if (props.max !== undefined) merged.maxCount ??= props.max
    if (fieldType === 'uploadButton') {
      merged.listType ??= 'picture'
      merged.onPreview ??= handleUploadPreview
    } else if (!showUploadTrigger()) merged.style = [merged.style, { display: 'none' }]
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
    ? (resolveSemanticProp('prefix') as VNodeChild | false | undefined)
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
  const buttonProps = { ...(props.buttonProps ?? {}), ...(props.captchaProps ?? {}) }
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
  if (props.captchaTextRender)
    return props.captchaTextRender(remainingSeconds.value > 0, remainingSeconds.value)
  if (remainingSeconds.value > 0) {
    return (
      props.countDownText?.(remainingSeconds.value) ??
      intl.value
        .getMessage('captcha.retryAfter', '{count} 秒后重新获取')
        .replace('{count}', String(remainingSeconds.value))
    )
  }
  return resolveSemanticProp(
    'captchaText',
    intl.value.getMessage('captcha.getCaptcha', '获取验证码'),
  ) as VNodeChild
}

function resolveCheckboxLayout(): 'horizontal' | 'vertical' {
  return (resolveSemanticProp('layout', 'horizontal') as 'horizontal' | 'vertical') ?? 'horizontal'
}

function showUploadTrigger(): boolean {
  const max = (props.fieldProps?.maxCount as number | undefined) ?? props.max
  return max === undefined || !Array.isArray(props.modelValue) || props.modelValue.length < max
}

async function handleUploadPreview(file: UploadFile): Promise<void> {
  const url = file.url || file.preview
  if (url) previewImage.value = url
  else if (file.originFileObj) {
    previewImage.value = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result ?? ''))
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(file.originFileObj!)
    })
  }
  if (previewImage.value) previewOpen.value = true
}

const previewConfig = computed(() => ({
  open: previewOpen.value,
  onOpenChange: (open: boolean) => {
    previewOpen.value = open
  },
  afterOpenChange: (open: boolean) => {
    if (!open) previewImage.value = ''
  },
  ...(typeof props.imageProps?.preview === 'object' ? props.imageProps.preview : {}),
}))

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
  if (props.captchaProps?.onClick !== props.buttonProps?.onClick)
    callHandler(props.captchaProps?.onClick, [event])
  try {
    if (props.phoneName !== undefined) await form?.validateFields([props.phoneName])
    const phone =
      props.phoneName === undefined ? '' : String(form?.getFieldValue(props.phoneName) ?? '')
    const result = await props.onGetCaptcha?.(phone)
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
  props.onTiming?.(remainingSeconds.value)
  if (remainingSeconds.value === 0) return
  countdownTimer = setInterval(() => {
    remainingSeconds.value = Math.max(remainingSeconds.value - 1, 0)
    props.onTiming?.(remainingSeconds.value)
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
  if (
    fieldType === 'checkbox' ||
    fieldType === 'checkboxGroup' ||
    fieldType === 'radio' ||
    fieldType === 'radioGroup'
  )
    managedProps.push('layout', 'radioType')

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
  focus: () => controlRef.value?.focus?.(),
  startTiming: startCountdown,
  endTiming: resetCountdown,
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
    :field-props="fieldProps"
    :readonly-render="readonlyRender"
    v-bind="resolveReadonlyAttrs()"
  />

  <div
    v-else-if="resolveFieldType() === 'captcha'"
    :class="`${prefixCls}-captcha`"
    style="display: flex; width: 100%; gap: 8px"
  >
    <Input
      ref="controlRef"
      v-bind="resolveCaptchaInputProps()"
      :style="[resolveCaptchaInputProps().style, { minWidth: 0, flex: 1 }]"
    >
      <template v-for="(_, name) in $slots" #[name]="slotProps">
        <slot v-if="name !== 'captcha'" :name="name" v-bind="slotProps ?? {}" />
      </template>
    </Input>
    <Button v-bind="resolveCaptchaButtonProps()" @click="getCaptcha">
      <slot v-if="$slots.captcha" name="captcha" :seconds="remainingSeconds" />
      <VNodeContent v-else :content="resolveCaptchaButtonText()" />
    </Button>
  </div>

  <span v-else-if="resolveFieldType() === 'uploadButton'">
    <component :is="resolveControlComponent()" v-bind="resolveControlProps()">
      <template #default>
        <slot v-if="showUploadTrigger()">
          <span
            v-if="fieldProps?.listType === 'picture-card'"
            :class="classes.button"
            :style="styles.button"
            ><UploadOutlined v-if="icon === undefined" /><VNodeContent v-else :content="icon" />
            <VNodeContent :content="title ?? intl.getMessage('upload.button', '单击上传')"
          /></span>
          <Button
            v-else
            v-bind="buttonProps"
            :class="[buttonProps?.class, classes.button]"
            :style="[buttonProps?.style, styles.button]"
            :disabled="resolveDisabled() || buttonProps?.disabled === true"
            ><UploadOutlined v-if="icon === undefined" /><VNodeContent
              v-else
              :content="icon" /><VNodeContent
              :content="title ?? intl.getMessage('upload.button', '单击上传')"
          /></Button>
        </slot>
      </template>
      <template v-for="name in resolveNonDefaultSlotNames()" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps ?? {}" />
      </template>
    </component>
    <Image
      v-if="previewImage"
      v-bind="imageProps"
      :src="previewImage"
      :styles="{ root: { display: 'none' } }"
      :preview="previewConfig"
    />
  </span>

  <component
    :is="resolveControlComponent()"
    v-else-if="resolveFieldType() === 'uploadDragger'"
    v-bind="resolveControlProps()"
  >
    <template #default>
      <slot v-if="showUploadTrigger()">
        <p :class="[`${nativeUploadPrefix}-drag-icon`, classes.icon]" :style="styles.icon">
          <InboxOutlined v-if="icon === undefined" /><VNodeContent v-else :content="icon" />
        </p>
        <p :class="[`${nativeUploadPrefix}-text`, classes.title]" :style="styles.title">
          <VNodeContent
            :content="title ?? intl.getMessage('upload.drag', '单击或拖动文件到此区域进行上传')"
          />
        </p>
        <p :class="[`${nativeUploadPrefix}-hint`, classes.description]" :style="styles.description">
          <VNodeContent
            :content="description ?? intl.getMessage('upload.description', '支持单次或批量上传')"
          />
        </p>
      </slot>
    </template>
    <template v-for="name in resolveNonDefaultSlotNames()" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps ?? {}" />
    </template>
  </component>

  <div
    v-else-if="
      resolveFieldType() === 'checkboxGroup' ||
      (resolveFieldType() === 'checkbox' && hasOptionSource())
    "
    :class="[
      `${prefixCls}-checkbox-group`,
      `${prefixCls}-checkbox-group-${resolveCheckboxLayout()}`,
    ]"
    :style="
      resolveCheckboxLayout() === 'vertical'
        ? { display: 'flex', flexDirection: 'column' }
        : undefined
    "
  >
    <component :is="resolveControlComponent()" v-bind="resolveControlProps()">
      <template v-for="(_, name) in $slots" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps ?? {}" />
      </template>
    </component>
  </div>

  <component :is="resolveControlComponent()" v-else ref="controlRef" v-bind="resolveControlProps()">
    <template v-for="(_, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps ?? {}" />
    </template>
  </component>
</template>
