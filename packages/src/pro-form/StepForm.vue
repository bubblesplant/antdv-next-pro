<script setup lang="ts">
import type { VNodeChild } from 'vue'
import { computed, getCurrentInstance, inject, onBeforeUnmount, ref, useAttrs, useSlots } from 'vue'
import ProForm from './ProForm'
import { pickFormProps, proxyForm } from './layouts'
import type { FormRecord } from '../schema-form/utils'
import type { ProFormInstance } from './types'
import { useFormPrefix } from './utils'

import { stepsContextKey, type RegisteredStep } from './stepsContext'
import { stepFormProps } from './componentProps'

defineOptions({ name: 'StepForm', inheritAttrs: false })
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
  title: propTitle,
  stepProps: propStepProps,
} = defineProps(stepFormProps)
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
  get title() {
    return propTitle
  },
  get stepProps() {
    return propStepProps
  },
}

const parent = inject(stepsContextKey, undefined)
const inner = ref<ProFormInstance>()
const api = proxyForm(inner)
const id = Symbol('StepForm')
const instance = getCurrentInstance()
const { prefix } = useFormPrefix('steps-form-step', () => propPrefixCls)
let accepted = true
const entry: RegisteredStep = {
  id,
  name: () => propName ?? `step-${parent?.forms.value.findIndex((step) => step.id === id) ?? 0}`,
  title: () => slots.title?.() ?? (propTitle as VNodeChild),
  stepProps: () => propStepProps,
  form: api,
  submit: async () => {
    accepted = propOnFinish === undefined
    await api.submit()
    return accepted
  },
}
const unregister = parent?.register(entry)
onBeforeUnmount(() => unregister?.())
const active = computed(() => !parent || parent.forms.value[parent.current.value]?.id === id)
defineExpose(api)
function formBindings() {
  const parentProps = parent?.formProps() ?? {}
  const explicitProps = instance?.vnode.props ?? {}
  const ownProps = Object.fromEntries(
    Object.entries(pickFormProps(props)).filter(
      ([key, value]) =>
        value !== undefined &&
        (!(key in parentProps) ||
          key in explicitProps ||
          key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`) in explicitProps),
    ),
  )
  return { ...parentProps, ...attrs, ...ownProps }
}
async function finish(values: FormRecord) {
  const result = await propOnFinish?.(values)
  accepted = propOnFinish === undefined || result === true
  return result
}
</script>

<template>
  <div
    data-pro-steps-form-step=""
    :class="[prefix, { [`${prefix}-active`]: active }]"
    :style="{ display: active ? undefined : 'none' }"
    :aria-hidden="!active"
  >
    <ProForm
      v-bind="formBindings()"
      ref="inner"
      :submitter="parent ? false : propSubmitter"
      :on-finish="finish"
      @update:model-value="emit('update:modelValue', $event)"
      @change="emit('change', $event)"
      @submit="emit('submit', $event)"
      @reset="emit('reset', $event)"
      @error="emit('error', $event)"
      @request-error="emit('requestError', $event)"
    >
      <template v-for="(_, name) in slots" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps || {}" />
      </template>
    </ProForm>
  </div>
</template>
