<script setup lang="ts">
import type { VNodeChild } from 'vue'
import { Button, Space, Steps } from 'antdv-next'
import {
  computed,
  Fragment,
  h,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  shallowRef,
  watch,
  useAttrs,
  useSlots,
} from 'vue'
import type { FormRecord } from '../schema-form/utils'
import { mergeValues } from '../schema-form/utils'
import type { ProFormInstance } from './types'
import { resolveSemantic, useFormPrefix } from './utils'
import { useThemeVars } from '../shared/useThemeVars'

import VNodeContent from '../shared/VNodeContent'
import { stepsContextKey, type RegisteredStep } from './stepsContext'
import { stepsFormProps } from './componentProps'

defineOptions({ name: 'StepsForm', inheritAttrs: false })
const {
  current: propCurrent,
  onFinish: propOnFinish,
  stepsProps: propStepsProps,
  submitter: propSubmitter,
  formProps: propFormProps,
  formMapRef: propFormMapRef,
  prefixCls: propPrefixCls,
  classes: propClasses,
  classNames: propClassNames,
  styles: propStyles,
} = defineProps(stepsFormProps)
const emit = defineEmits(['update:current', 'currentChange', 'finish', 'error', 'reset'])
const attrs = useAttrs()
const slots = useSlots()
const props = {
  get current() {
    return propCurrent
  },
  get onFinish() {
    return propOnFinish
  },
  get stepsProps() {
    return propStepsProps
  },
  get submitter() {
    return propSubmitter
  },
  get formProps() {
    return propFormProps
  },
  get formMapRef() {
    return propFormMapRef
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
}

const forms = shallowRef<RegisteredStep[]>([])
const localCurrent = ref(0)
const current = computed(() =>
  Math.max(0, Math.min(propCurrent ?? localCurrent.value, Math.max(0, forms.value.length - 1))),
)
const loading = ref(false)
const { prefix, t } = useFormPrefix('steps-form', () => propPrefixCls)
const themeVars = useThemeVars()
let pending: Promise<FormRecord> | undefined
function syncFormMap() {
  const target = propFormMapRef
  if (target) target.value = new Map(forms.value.map((step) => [step.name(), step.form]))
}
function setCurrent(value: number) {
  const next = Math.max(0, Math.min(value, Math.max(0, forms.value.length - 1)))
  localCurrent.value = next
  emit('update:current', next)
  emit('currentChange', next)
}
provide(stepsContextKey, {
  current,
  forms,
  formProps: () => propFormProps,
  register(entry) {
    forms.value = [...forms.value, entry]
    syncFormMap()
    return () => {
      forms.value = forms.value.filter((step) => step.id !== entry.id)
      syncFormMap()
    }
  },
})
watch(() => propFormMapRef, syncFormMap)
watch(() => forms.value.map((step) => step.name()), syncFormMap)
onMounted(syncFormMap)
onBeforeUnmount(() => {
  const target = propFormMapRef
  if (target) target.value = new Map()
})
const values = () => mergeValues(...forms.value.map((step) => step.form.getFieldsValue()))
const formattedValues = () =>
  mergeValues(...forms.value.map((step) => step.form.getFieldsFormatValue()))
async function validateAll(): Promise<FormRecord> {
  for (const [index, step] of forms.value.entries()) {
    try {
      await step.form.validateFields()
    } catch (error) {
      setCurrent(index)
      throw error
    }
  }
  return values()
}
function reset() {
  forms.value.forEach((step) => step.form.reset())
  setCurrent(0)
  emit('reset', values())
}
async function advance(): Promise<FormRecord> {
  loading.value = true
  try {
    const index = current.value
    const step = forms.value[index]
    if (!step || !(await step.submit())) return formattedValues()
    if (current.value !== index) return formattedValues()
    if (index < forms.value.length - 1) {
      setCurrent(index + 1)
      return formattedValues()
    }
    await validateAll()
    const resultValues = formattedValues()
    const accepted = await propOnFinish?.(resultValues)
    if (!propOnFinish) emit('finish', resultValues)
    if (accepted === true) reset()
    return resultValues
  } catch (error) {
    emit('error', error)
    throw error
  } finally {
    loading.value = false
  }
}
function submit(): Promise<FormRecord> {
  if (!pending)
    pending = advance().finally(() => {
      pending = undefined
    })
  return pending
}
async function next(): Promise<boolean> {
  const before = current.value
  if (before >= forms.value.length - 1) return false
  await submit()
  return current.value !== before
}
const api: ProFormInstance & {
  next: () => Promise<boolean>
  prev: () => void
  formMap: () => Map<string, ProFormInstance>
} = {
  validate: validateAll,
  validateFields: validateAll,
  validateFieldsReturnFormatValue: async () => {
    await validateAll()
    return formattedValues()
  },
  reset,
  resetFields: reset,
  clearValidate: (names) => forms.value.forEach((step) => step.form.clearValidate(names)),
  getFieldsValue: values,
  getFieldValue: (name) =>
    forms.value.map((step) => step.form.getFieldValue(name)).find((value) => value !== undefined),
  getFieldsFormatValue: formattedValues,
  getFieldFormatValue: (name) =>
    forms.value
      .map((step) => step.form.getFieldFormatValue(name))
      .find((value) => value !== undefined),
  setFieldsValue: (record) => forms.value.forEach((step) => step.form.setFieldsValue(record)),
  setFieldValue: (name, value) => forms.value[current.value]?.form.setFieldValue(name, value),
  submit,
  loading,
  scrollToField: (name, options) => forms.value[current.value]?.form.scrollToField(name, options),
  next,
  prev: () => setCurrent(current.value - 1),
  formMap: () => new Map(forms.value.map((step) => [step.name(), step.form])),
}
defineExpose(api)
const semantic = computed(() => resolveSemantic(props))
function resolveActions() {
  const submitter = propSubmitter === false ? undefined : propSubmitter
  const last = current.value >= forms.value.length - 1
  const defaults: VNodeChild[] = [
    current.value > 0 &&
      submitter?.resetButtonProps !== false &&
      h(
        Button,
        {
          ...submitter?.resetButtonProps,
          disabled:
            loading.value || (submitter?.resetButtonProps && submitter.resetButtonProps.disabled),
          onClick: (event: MouseEvent) => {
            if (submitter?.resetButtonProps) submitter.resetButtonProps.onClick?.(event)
            api.prev()
          },
        },
        () =>
          submitter?.searchConfig?.resetText ??
          submitter?.resetText ??
          t('stepsForm.prev', '上一步'),
      ),
    submitter?.submitButtonProps !== false &&
      h(
        Button,
        {
          type: 'primary',
          ...submitter?.submitButtonProps,
          loading: loading.value,
          onClick: (event: MouseEvent) => {
            if (submitter?.submitButtonProps) submitter.submitButtonProps.onClick?.(event)
            void submit().catch(() => undefined)
          },
        },
        () =>
          last
            ? (submitter?.searchConfig?.submitText ??
              submitter?.submitText ??
              t('stepsForm.submit', '提交'))
            : t('stepsForm.next', '下一步'),
      ),
  ].filter(Boolean)
  const actions =
    slots.submitter?.({
      form: api,
      current: current.value,
      submit,
      next,
      prev: api.prev,
      values: values(),
    }) ??
    (submitter?.render === false
      ? null
      : submitter?.render
        ? submitter.render({ form: api, submit, reset }, defaults)
        : defaults)
  return actions
}
function stepItems() {
  return forms.value.map((step, index) => ({
    ...step.stepProps(),
    key: step.name(),
    title: h(Fragment, null, [step.title() ?? String(index + 1)]),
  }))
}
function changeStep(index: number) {
  propStepsProps?.onChange?.(index)
  if (index < current.value) setCurrent(index)
  else if (index > current.value) void next().catch(() => undefined)
}
</script>

<template>
  <div
    v-bind="attrs"
    data-pro-steps-form=""
    :class="[prefix, attrs.class, semantic.classes.root]"
    :style="[themeVars, attrs.style as any, semantic.styles.root]"
  >
    <div data-pro-steps-form-header="" :class="`${prefix}-steps-container`">
      <Steps v-bind="propStepsProps" :current="current" :items="stepItems()" @change="changeStep" />
    </div>
    <div
      data-pro-steps-form-content=""
      :class="[`${prefix}-container`, semantic.classes.container]"
      :style="semantic.styles.container"
    >
      <slot />
      <template v-for="(actions, index) in [resolveActions()]" :key="index">
        <div
          v-if="propSubmitter !== false && actions"
          data-pro-steps-form-submitter=""
          :class="[`${prefix}-submitter`, semantic.classes.submitter]"
          :style="semantic.styles.submitter"
        >
          <Space><VNodeContent :content="actions" /></Space>
        </div>
      </template>
    </div>
  </div>
</template>
