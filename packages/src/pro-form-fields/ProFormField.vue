<script setup lang="ts">
import type { VNodeChild } from 'vue'

import { FormItem, type ImageProps } from 'antdv-next'
import { computed, getCurrentInstance, mergeProps, ref, useAttrs, useSlots, watch } from 'vue'
import { useProFormContext, useProFormNamePath } from '../pro-form/context'
import { useSemanticStyles } from '../shared/semantic'
import ProField from '../pro-field/ProField'
import {
  resolveProFieldValueType,
  PRO_FIELD_SCHEMA_LAYOUT_VALUE_TYPES,
} from '../pro-field/valueType'
import { useProConfig } from '../provider/context'

import FieldControl from './FieldControl.vue'
import { hasExplicitProp, type ProFormControlType } from './fieldRegistry'
import type {
  ProFormCaptchaProps,
  ProFormDateTimePickerProps,
  ProFormDateTimeRangePickerProps,
  ProFormDigitProps,
  ProFormFieldProps,
  ProFormMoneyProps,
} from './types'

// The public generic remains available through ProFormFieldProps. The SFC accepts every
// specialized wrapper value type, so its internal bridge intentionally uses `any` here.
interface Props extends ProFormFieldProps<any, any, any, any> {
  modelValue?: unknown
  options?: any[]
  fieldType?: ProFormControlType
  loading?: boolean
  precision?: ProFormDigitProps['precision']
  min?: ProFormDigitProps['min']
  prefix?: ProFormMoneyProps['prefix']
  locale?: string
  moneySymbol?: boolean
  customSymbol?: string
  numberFormatOptions?: Intl.NumberFormatOptions
  numberPopoverRender?: ProFormMoneyProps['numberPopoverRender']
  showTime?: ProFormDateTimePickerProps['showTime'] | ProFormDateTimeRangePickerProps['showTime']
  layout?: 'horizontal' | 'vertical'
  radioType?: 'button' | 'radio'
  onGetCaptcha?: ProFormCaptchaProps['onGetCaptcha']
  phoneName?: ProFormCaptchaProps['phoneName']
  captchaTextRender?: ProFormCaptchaProps['captchaTextRender']
  captchaProps?: ProFormCaptchaProps['captchaProps']
  onTiming?: ProFormCaptchaProps['onTiming']
  countDown?: number
  captchaText?: VNodeChild
  countDownText?: (seconds: number) => VNodeChild
  buttonProps?: ProFormCaptchaProps['buttonProps']
  icon?: VNodeChild
  title?: VNodeChild
  description?: VNodeChild
  max?: number
  imageProps?: Omit<ImageProps, 'src'>
}

defineOptions({ name: 'AntdvNextProFormField', inheritAttrs: false })

const props = withDefaults(defineProps<Props>(), { preserve: undefined })
const emit = defineEmits<{
  (event: 'update:modelValue', value: unknown): void
  (event: 'change', ...args: unknown[]): void
  (event: 'drop', value: unknown): void
  (event: 'requestError', error: unknown): void
  (event: 'captchaError', error: unknown): void
}>()

interface FieldControlInstance {
  refresh?: () => Promise<void>
  resetCountdown?: () => void
  focus?: () => void
  startTiming?: () => void
  endTiming?: () => void
}

const attrs = useAttrs()
const slots = useSlots()
const instance = getCurrentInstance()
const fieldRef = ref<FieldControlInstance>()
const form = useProFormContext()
const config = useProConfig()
const namePath = useProFormNamePath(() => props.name)
const valueType = computed(() => resolveProFieldValueType(props.valueType ?? props.fieldType))
const proFieldTypes = new Set([
  'progress',
  'avatar',
  'image',
  'code',
  'jsonCode',
  'fromNow',
  'second',
  'index',
  'indexBorder',
  'option',
  'color',
  'colorPicker',
  'rate',
  ...PRO_FIELD_SCHEMA_LAYOUT_VALUE_TYPES,
])
const controlComponent = computed(() =>
  config.valueTypeMap.value[valueType.value.type] || proFieldTypes.has(valueType.value.type)
    ? ProField
    : FieldControl,
)
const { classes, styles } = useSemanticStyles(props, {
  classes: () => props.classes,
  classNames: () => props.classNames,
  styles: () => props.styles,
})
const fieldValue = computed(() =>
  hasExplicitProp(rawProps(), 'modelValue')
    ? props.modelValue
    : namePath.value.length
      ? form?.getFieldValue(namePath.value)
      : undefined,
)
watch(
  namePath,
  (path, _oldPath, onCleanup) => {
    if (!namePath.value.length) return
    const registeredPath = [...path]
    const unregister = form?.registerField({
      path: () => registeredPath,
      convertValue: props.convertValue,
      transform: props.transform,
      valueType: () => valueType.value.type,
      preserve: props.preserve,
    })
    if (unregister) onCleanup(unregister)
  },
  { immediate: true },
)
const formItemSlotNames = new Set(['label', 'extra', 'help', 'tooltip'])
const controlPropNames: Array<keyof Props> = [
  'modelValue',
  'fieldProps',
  'options',
  'valueEnum',
  'request',
  'params',
  'disabled',
  'readonly',
  'emptyText',
  'readonlyRender',
  'loading',
  'precision',
  'min',
  'prefix',
  'locale',
  'moneySymbol',
  'customSymbol',
  'numberFormatOptions',
  'numberPopoverRender',
  'showTime',
  'layout',
  'radioType',
  'onGetCaptcha',
  'countDown',
  'captchaText',
  'countDownText',
  'buttonProps',
  'phoneName',
  'captchaTextRender',
  'captchaProps',
  'onTiming',
  'debounceTime',
  'proFieldKey',
  'cacheForSwr',
  'searchValue',
  'prefixCls',
  'icon',
  'title',
  'description',
  'max',
  'imageProps',
]

function rawProps(): Record<string, unknown> | null | undefined {
  return instance?.vnode.props
}

function resolveFieldMode(): 'form-item' | 'field' {
  return props.ignoreFormItem ? 'field' : (props.fieldMode ?? 'form-item')
}

const formItemAttrNames = new Set([
  'class',
  'style',
  'id',
  'extra',
  'help',
  'tooltip',
  'required',
  'validateStatus',
  'labelCol',
  'wrapperCol',
  'colon',
  'labelAlign',
  'labelWrap',
  'hasFeedback',
  'autoLink',
  'htmlFor',
  'validateFirst',
  'validateTrigger',
  'validateDebounce',
])

function resolveFormItemProps(): Record<string, unknown> {
  const result = mergeProps(
    (props.formItemProps ?? {}) as Record<string, unknown>,
    Object.fromEntries(Object.entries(attrs).filter(([key]) => formItemAttrNames.has(key))),
  ) as Record<string, unknown>

  for (const name of ['name', 'label', 'rules'] as const) {
    if (hasExplicitProp(rawProps(), name)) result[name] = props[name]
  }
  if (namePath.value.length) result.name = namePath.value
  result.class = [result.class, classes.value.root]
  const widths = { xs: 104, sm: 216, md: 328, lg: 440, xl: 552 }
  const width = typeof props.width === 'string' ? widths[props.width] : props.width
  result.style = [
    result.style,
    width === undefined ? undefined : { width: `${width}px`, maxWidth: '100%' },
    styles.value.root,
  ]
  return result
}

function resolveControlProps(): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  if (props.fieldType !== undefined) result.fieldType = props.fieldType
  if (props.valueType !== undefined) result.valueType = valueType.value.type

  for (const name of controlPropNames) {
    if (!hasExplicitProp(rawProps(), name)) continue
    const value = props[name]
    result[name] =
      name === 'fieldProps' || name === 'buttonProps'
        ? ((value ?? {}) as Record<string, unknown>)
        : value
  }

  const controlAttrs = Object.fromEntries(
    Object.entries(attrs).filter(([key]) => !formItemAttrNames.has(key)),
  )
  Object.assign(result, controlAttrs)
  result.modelValue = fieldValue.value
  if (
    form &&
    !hasExplicitProp(rawProps(), 'disabled') &&
    !Object.hasOwn(props.fieldProps ?? {}, 'disabled')
  )
    result.disabled = form.disabled.value
  if (
    form &&
    !hasExplicitProp(rawProps(), 'readonly') &&
    !Object.hasOwn(props.fieldProps ?? {}, 'readonly')
  )
    result.readonly = form.readonly.value
  const { type: _type, ...typeConfig } = valueType.value
  result.fieldProps = mergeProps(controlAttrs, typeConfig, props.fieldProps ?? {})
  for (const key of [
    'locale',
    'moneySymbol',
    'customSymbol',
    'numberFormatOptions',
    'numberPopoverRender',
  ] as const) {
    if (hasExplicitProp(rawProps(), key) && !Object.hasOwn(props.fieldProps ?? {}, key))
      (result.fieldProps as Record<string, unknown>)[key] = props[key]
  }
  if (props.proFieldProps?.mode === 'read' || props.proFieldProps?.readonly === true)
    result.readonly = true
  if (controlComponent.value === ProField) {
    const { root: _rootClass, ...controlClasses } = classes.value
    const { root: _rootStyle, ...controlStyles } = styles.value
    Object.assign(result, { classes: controlClasses, styles: controlStyles }, props.proFieldProps, {
      valueType: valueType.value,
      mode: result.readonly ? 'read' : 'edit',
    })
    delete result.fieldType
  } else {
    result.classes = classes.value
    result.styles = styles.value
  }
  if (resolveFieldMode() === 'field') {
    result.class = [attrs.class, classes.value.root]
    const widths = { xs: 104, sm: 216, md: 328, lg: 440, xl: 552 }
    const width = typeof props.width === 'string' ? widths[props.width] : props.width
    result.style = [
      attrs.style,
      width === undefined ? undefined : { width: `${width}px`, maxWidth: '100%' },
      styles.value.root,
    ]
  }
  return result
}

function updateValue(value: unknown): void {
  if (namePath.value.length) form?.setFieldValue(namePath.value, value)
  emit('update:modelValue', value)
}

function resolveControlSlotNames(): string[] {
  return Object.keys(slots).filter((name) => !formItemSlotNames.has(name))
}

function resolveFormItemSlotNames(): string[] {
  return Object.keys(slots).filter((name) => formItemSlotNames.has(name))
}

function refresh(): Promise<void> {
  return fieldRef.value?.refresh?.() ?? Promise.resolve()
}

function resetCountdown(): void {
  fieldRef.value?.resetCountdown?.()
}

defineExpose({
  refresh,
  resetCountdown,
  focus: () => fieldRef.value?.focus?.(),
  startTiming: () => fieldRef.value?.startTiming?.(),
  endTiming: () => fieldRef.value?.endTiming?.(),
})
</script>

<template>
  <FormItem v-if="resolveFieldMode() === 'form-item'" v-bind="resolveFormItemProps()">
    <template v-for="name in resolveFormItemSlotNames()" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps ?? {}" />
    </template>

    <component
      :is="controlComponent"
      ref="fieldRef"
      v-bind="resolveControlProps()"
      @update:model-value="updateValue"
      @change="(...args: unknown[]) => emit('change', ...args)"
      @drop="emit('drop', $event)"
      @request-error="emit('requestError', $event)"
      @captcha-error="emit('captchaError', $event)"
    >
      <template v-for="name in resolveControlSlotNames()" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps ?? {}" />
      </template>
    </component>
  </FormItem>

  <component
    :is="controlComponent"
    v-else
    ref="fieldRef"
    v-bind="resolveControlProps()"
    @update:model-value="updateValue"
    @change="(...args: unknown[]) => emit('change', ...args)"
    @drop="emit('drop', $event)"
    @request-error="emit('requestError', $event)"
    @captcha-error="emit('captchaError', $event)"
  >
    <template v-for="name in resolveControlSlotNames()" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps ?? {}" />
    </template>
  </component>
</template>
