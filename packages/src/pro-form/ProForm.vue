<script setup lang="ts">
import type { FormInstance } from 'antdv-next'
import { Button, Form, Space, Spin } from 'antdv-next'
import {
  computed,
  h,
  inject,
  onBeforeUnmount,
  onMounted,
  provide,
  reactive,
  ref,
  useId,
  watch,
  useAttrs,
  useSlots,
} from 'vue'
import type { ProDataIndex } from '../types'
import {
  cloneValue,
  getValue,
  mergeValues,
  normalizePath,
  recordsEqual,
  replaceRecord,
  setValue,
} from '../schema-form/utils'
import type { FormRecord } from '../schema-form/utils'
import { useFormThemeVars } from './useFormThemeVars'
import { useOverlayFormFooter } from './useOverlayFormFooter'
import { useProConfig } from '../provider'
import { proFormContextKey } from './context'
import { formProviderKey } from './providerContext'
import type { RegisteredFormField } from './context'
import type { ProFormInstance } from './types'
import {
  assignRef,
  deletePath,
  formatDates,
  logicalRootStyle,
  resolveSemantic,
  useFormPrefix,
} from './utils'

import VNodeContent from '../shared/VNodeContent'

import { proFormProps } from './componentProps'

defineOptions({ name: 'ProForm', inheritAttrs: false })
const {
  name: propName,
  modelValue: propModelValue,
  initialValues: propInitialValues,
  onFinish: propOnFinish,
  onValuesChange: propOnValuesChange,
  request: propRequest,
  params: propParams,
  readonly: propReadonly,
  disabled: propDisabled,
  submitter: propSubmitter,
  syncToUrl: propSyncToUrl,
  syncToInitialValues: propSyncToInitialValues,
  dateFormatter: propDateFormatter,
  prefixCls: propPrefixCls,
  classes: propClasses,
  classNames: propClassNames,
  styles: propStyles,
  formRef: propFormRef,
  layout: propLayout,
} = defineProps(proFormProps)
const emit = defineEmits([
  'update:modelValue',
  'change',
  'reset',
  'submit',
  'error',
  'requestError',
])
const attrs = useAttrs()
const slots = useSlots()
const props = {
  get name() {
    return propName
  },
  get modelValue() {
    return propModelValue
  },
  get initialValues() {
    return propInitialValues
  },
  get onFinish() {
    return propOnFinish
  },
  get onValuesChange() {
    return propOnValuesChange
  },
  get request() {
    return propRequest
  },
  get params() {
    return propParams
  },
  get readonly() {
    return propReadonly
  },
  get disabled() {
    return propDisabled
  },
  get submitter() {
    return propSubmitter
  },
  get syncToUrl() {
    return propSyncToUrl
  },
  get syncToInitialValues() {
    return propSyncToInitialValues
  },
  get dateFormatter() {
    return propDateFormatter
  },
  get prefixCls() {
    return propPrefixCls
  },
  get classes() {
    return propClasses
  },
  get classNames() {
    return propClassNames
  },
  get styles() {
    return propStyles
  },
  get formRef() {
    return propFormRef
  },
  get layout() {
    return propLayout
  },
}

const model = reactive<FormRecord>({})
const initial = ref<FormRecord>({})
const formRef = ref<FormInstance>()
const loading = ref(false)
const requesting = ref(false)
const fields = new Set<RegisteredFormField>()
const provider = inject(formProviderKey, undefined)
const { prefix, direction, config, t } = useFormPrefix('form', () => propPrefixCls)
const themeVars = useFormThemeVars()
const { token } = useProConfig()
const overlayFooter = useOverlayFormFooter()
const formId = `pro-form-${useId()}`
let requestSequence = 0
let submission: Promise<FormRecord> | undefined
let alive = true
let initialized = false
const ownedUrlKeys = new Set<string>()
const hydratedUrlPaths = new Set<string>()
function readUrl(base: FormRecord = model): FormRecord {
  if (!propSyncToUrl || typeof window === 'undefined') return {}
  const values: FormRecord = {}
  for (const [key, value] of new URLSearchParams(window.location.search)) {
    const path = key.split('.').map((part) => (/^\d+$/.test(part) ? Number(part) : part))
    try {
      setValue(values, path, JSON.parse(value))
    } catch {
      setValue(values, path, value)
    }
  }
  const incoming = typeof propSyncToUrl === 'function' ? propSyncToUrl(values, 'get') : values
  const result: FormRecord = {}
  const paths = [...fields].map((field) => field.path())
  const visit = (record: FormRecord, parent: Array<string | number> = []) => {
    for (const [key, value] of Object.entries(record)) {
      const path = [...parent, key]
      if (value && Object.getPrototypeOf(value) === Object.prototype)
        visit(value as FormRecord, path)
      else paths.push(path)
    }
  }
  visit(base)
  for (const path of paths) {
    const value = getValue(incoming, path)
    if (value !== undefined) {
      setValue(result, path, value)
      ownedUrlKeys.add(path.join('.'))
    }
  }
  return result
}
function convert(values: FormRecord): FormRecord {
  const output = cloneValue(values)
  for (const field of fields) {
    const path = field.path()
    const value = getValue(output, path)
    if (value !== undefined && field.convertValue)
      setValue(output, path, field.convertValue(value, output))
  }
  return output
}
async function initialize() {
  const sequence = ++requestSequence
  requesting.value = Boolean(propRequest)
  try {
    const requested = propRequest ? await propRequest(propParams) : {}
    if (!alive || sequence !== requestSequence) return
    const base = mergeValues(propInitialValues, requested, propModelValue)
    const urlValues = propSyncToInitialValues ? readUrl(base) : {}
    replaceRecord(
      model,
      convert(mergeValues(propInitialValues, requested, urlValues, propModelValue)),
    )
    initial.value = cloneValue(model)
    initialized = true
    hydratedUrlPaths.clear()
    for (const field of fields) hydratedUrlPaths.add(field.path().join('.'))
  } catch (error) {
    if (!alive || sequence !== requestSequence) return
    emit('requestError', error)
    replaceRecord(model, convert(mergeValues(propInitialValues, propModelValue)))
    initial.value = cloneValue(model)
  } finally {
    if (sequence === requestSequence) requesting.value = false
  }
}
watch(
  () => [propRequest, cloneValue(propParams), cloneValue(propInitialValues)] as const,
  (next, previous) => {
    if (
      !previous ||
      next[0] !== previous[0] ||
      !recordsEqual(next[1], previous[1]) ||
      !recordsEqual(next[2], previous[2])
    )
      void initialize()
  },
  { immediate: true, deep: true },
)
watch(
  () => propModelValue,
  (value) => {
    if (value !== undefined && !recordsEqual(value, model)) replaceRecord(model, convert(value))
  },
  { deep: true },
)
function writeUrl(values: FormRecord) {
  if (!propSyncToUrl || typeof window === 'undefined') return
  const data =
    typeof propSyncToUrl === 'function' ? propSyncToUrl(cloneValue(values), 'set') : values
  const url = new URL(window.location.href)
  const nextKeys = new Set<string>()
  const visit = (record: FormRecord, path: string[] = []) => {
    for (const [key, value] of Object.entries(record)) {
      const parts = [...path, key]
      if (value && Object.getPrototypeOf(value) === Object.prototype)
        visit(value as FormRecord, parts)
      else {
        const name = parts.join('.')
        nextKeys.add(name)
        if (value === undefined || value === null || value === '') url.searchParams.delete(name)
        else url.searchParams.set(name, JSON.stringify(value))
      }
    }
  }
  visit(data)
  for (const key of ownedUrlKeys) if (!nextKeys.has(key)) url.searchParams.delete(key)
  ownedUrlKeys.clear()
  for (const key of nextKeys) ownedUrlKeys.add(key)
  window.history.replaceState(window.history.state, '', url)
}
function notify(changed: FormRecord, syncUrl = true) {
  const values = cloneValue(model)
  emit('update:modelValue', values)
  emit('change', values)
  propOnValuesChange?.(cloneValue(changed), values)
  if (propName) provider?.change(propName, cloneValue(changed))
  if (syncUrl) writeUrl(values)
}
function setFieldValue(name: ProDataIndex, value: unknown) {
  const path = normalizePath(name)
  setValue(model, path, value)
  const changed: FormRecord = {}
  setValue(changed, path, cloneValue(value))
  notify(changed)
}
function setFieldsValue(values: FormRecord) {
  const converted = convert(values)
  replaceRecord(model, mergeValues(model, converted))
  notify(converted)
}
function getFieldsFormatValue(): FormRecord {
  const output = cloneValue(model)
  for (const field of fields) {
    const path = field.path()
    const value = formatDates(getValue(model, path), propDateFormatter, field.valueType?.())
    if (field.transform) {
      const transformed = field.transform(value, cloneValue(model))
      if (transformed && Object.getPrototypeOf(transformed) === Object.prototype) {
        deletePath(output, path)
        Object.assign(output, mergeValues(output, transformed))
      } else setValue(output, path, transformed)
    } else if (value !== undefined) setValue(output, path, value)
  }
  return output
}
async function validateFields(names?: ProDataIndex[]): Promise<FormRecord> {
  await formRef.value?.validateFields(names)
  return cloneValue(model)
}
function reset() {
  replaceRecord(model, initial.value)
  formRef.value?.clearValidate()
  notify(cloneValue(model))
  emit('reset', cloneValue(model))
}
async function performSubmit(): Promise<FormRecord> {
  loading.value = true
  try {
    await validateFields()
    const values = getFieldsFormatValue()
    emit('submit', values)
    if (propName) provider?.finish(propName, values)
    await propOnFinish?.(values)
    return values
  } catch (error) {
    emit('error', error)
    throw error
  } finally {
    if (alive) loading.value = false
  }
}
function submit(): Promise<FormRecord> {
  if (submission) return submission
  submission = performSubmit().finally(() => {
    submission = undefined
  })
  return submission
}
const api: ProFormInstance = {
  get nativeForm() {
    return formRef.value
  },
  validate: validateFields,
  validateFields,
  validateFieldsReturnFormatValue: async (names) => {
    await validateFields(names)
    return getFieldsFormatValue()
  },
  reset,
  resetFields: reset,
  clearValidate: (names) => formRef.value?.clearValidate(names),
  getFieldsValue: () => cloneValue(model),
  getFieldValue: (name) => getValue(model, normalizePath(name)),
  getFieldsFormatValue,
  getFieldFormatValue: (name) => getValue(getFieldsFormatValue(), normalizePath(name)),
  setFieldsValue,
  setFieldValue,
  submit,
  scrollToField: (name, options) => formRef.value?.scrollToField(name, options),
  loading,
}
provide(proFormContextKey, {
  model,
  readonly: computed(() => propReadonly),
  disabled: computed(() => propDisabled ?? config.value.componentDisabled ?? false),
  ...api,
  registerField(field) {
    fields.add(field)
    const path = field.path()
    if (initialized && propSyncToInitialValues && !hydratedUrlPaths.has(path.join('.'))) {
      hydratedUrlPaths.add(path.join('.'))
      const urlValue = getValue(readUrl(), path)
      if (urlValue !== undefined && getValue(propModelValue, path) === undefined) {
        setValue(model, path, urlValue)
        setValue(initial.value, path, cloneValue(urlValue))
      }
    }
    const value = getValue(model, path)
    if (value !== undefined && field.convertValue) {
      setValue(model, path, field.convertValue(value, model))
      if (getValue(initial.value, path) !== undefined)
        setValue(initial.value, path, cloneValue(getValue(model, path)))
    }
    return () => {
      fields.delete(field)
      if (field.preserve === false) deletePath(model, path)
    }
  },
})
defineExpose(api)
watch(
  () => propName,
  (name, _previous, onCleanup) => {
    if (name) {
      const unregister = provider?.register(name, api)
      onCleanup(() => unregister?.())
    }
  },
  { immediate: true },
)
onMounted(() => assignRef(propFormRef, api))
onBeforeUnmount(() => {
  alive = false
  requestSequence++
  assignRef(propFormRef, undefined)
})
function hydrate() {
  if (!propSyncToUrl) return
  const incoming = readUrl()
  const next = cloneValue(model)
  const changed: FormRecord = {}
  for (const key of ownedUrlKeys) {
    const path = key.split('.').map((part) => (/^\d+$/.test(part) ? Number(part) : part))
    const value = getValue(incoming, path)
    if (!recordsEqual(getValue(next, path), value)) setValue(changed, path, cloneValue(value))
    if (value === undefined) deletePath(next, path)
  }
  const converted = convert(incoming)
  replaceRecord(model, mergeValues(next, converted))
  if (Object.keys(changed).length) notify(mergeValues(changed, converted), false)
}
onMounted(() => window.addEventListener('popstate', hydrate))
onBeforeUnmount(() => window.removeEventListener('popstate', hydrate))
const semantic = computed(() => resolveSemantic(props))
function resolveActions() {
  const submitter = propSubmitter === false ? undefined : propSubmitter
  const defaults = submitter
    ? [
        submitter.resetButtonProps === false
          ? null
          : h(
              Button,
              {
                ...submitter.resetButtonProps,
                onClick: (event: MouseEvent) => {
                  if (submitter.resetButtonProps) submitter.resetButtonProps.onClick?.(event)
                  if (!event.defaultPrevented) reset()
                },
              },
              () =>
                submitter.searchConfig?.resetText ??
                submitter.resetText ??
                t('tableForm.reset', '重置'),
            ),
        submitter.submitButtonProps === false
          ? null
          : h(
              Button,
              {
                type: 'primary',
                ...submitter.submitButtonProps,
                htmlType: 'submit',
                form: overlayFooter?.enabled.value ? (attrs.id ?? formId) : undefined,
                loading: loading.value || submitter.submitButtonProps?.loading,
              },
              () =>
                submitter.searchConfig?.submitText ??
                submitter.submitText ??
                t('tableForm.submit', '提交'),
            ),
      ].filter(Boolean)
    : []
  const actions = submitter
    ? (slots.submitter?.({
        form: api,
        values: model,
        submit,
        reset,
        submitting: loading.value,
      }) ??
      (submitter.render === false
        ? null
        : submitter.render
          ? submitter.render({ form: api, submit, reset }, defaults)
          : defaults))
    : null
  return actions
}
function finish() {
  void submit().catch(() => undefined)
}
</script>

<template>
  <Form
    v-bind="attrs"
    :id="(attrs.id as string) ?? (overlayFooter?.enabled.value ? formId : undefined)"
    ref="formRef"
    :model="model"
    :name="propName"
    data-pro-form=""
    :data-pro-form-layout="propLayout"
    :layout="propLayout"
    :disabled="propDisabled"
    :class="[
      prefix,
      { [`${prefix}-rtl`]: direction === 'rtl' },
      attrs.class,
      semantic.classes.root,
      semantic.classes.form,
    ]"
    :style="[
      themeVars,
      logicalRootStyle(direction),
      attrs.style as any,
      semantic.styles.root,
      semantic.styles.form,
    ]"
    @finish="finish"
  >
    <template
      v-for="name in Object.keys(slots).filter((name) => name !== 'default')"
      #[name]="slotProps"
    >
      <slot :name="name" v-bind="slotProps || {}" />
    </template>
    <Spin :spinning="requesting">
      <slot :values="model" :form="api" />
    </Spin>
    <template v-for="(actions, index) in [resolveActions()]" :key="index">
      <Teleport
        v-if="actions"
        :to="overlayFooter?.target.value ?? 'body'"
        :disabled="!overlayFooter?.enabled.value || !overlayFooter.target.value"
      >
        <div
          data-pro-form-submitter=""
          :class="[`${prefix}-submitter`, semantic.classes.submitter]"
          :style="[themeVars, semantic.styles.submitter]"
        >
          <Space :size="token.marginXS"><VNodeContent :content="actions" /></Space>
        </div>
      </Teleport>
    </template>
  </Form>
</template>
