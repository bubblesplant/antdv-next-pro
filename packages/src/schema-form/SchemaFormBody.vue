<script setup lang="ts">
import type { FormProps } from 'antdv-next'
import type { VNodeChild } from 'vue'
import type {
  ProDataIndex,
  SchemaFormColumn,
  SchemaFormLayoutType,
  SchemaFormProps,
  SchemaFormSlots,
} from '../types'
import type { FormRecord } from './utils'
import type {
  FormClasses,
  FormStyles,
  ProFormInstance,
  QueryFilterProps,
  LightFilterProps,
  SubmitterProps,
} from '../pro-form/types'
import { Button, Space, Spin, Steps } from 'antdv-next'
import { computed, Fragment, h, shallowRef } from 'vue'
import VNodeContent from '../shared/VNodeContent'
import { useThemeVars } from '../shared/useThemeVars'
import { useFormPrefix } from '../pro-form/utils'
import ProForm from '../pro-form/ProForm'
import { QueryFilter, LightFilter } from '../pro-form/layouts'
import SchemaFormFields from './SchemaFormFields.vue'
import SchemaFormField from './SchemaFormField.vue'
import { buildSchemaSteps, normalizePath } from './utils'

type SchemaSlot = NonNullable<SchemaFormSlots<FormRecord>[string]>
interface BodyProps {
  columns: SchemaFormColumn<FormRecord>[]
  model: FormRecord
  layoutType: SchemaFormLayoutType
  labelCol?: Record<string, unknown>
  wrapperCol?: Record<string, unknown>
  grid?: boolean
  readonly?: boolean
  submitter?: SchemaFormProps<FormRecord>['submitter']
  current?: number
  loading?: boolean
  submitting?: boolean
  schemaSlots?: Record<string, SchemaSlot | undefined>
  formProps?: Partial<FormProps>
  prefixCls?: string
  classes?: FormClasses
  styles?: FormStyles
  collapsed?: boolean
  defaultCollapsed?: boolean
  defaultColsNumber?: number
  span?: QueryFilterProps['span']
  labelWidth?: QueryFilterProps['labelWidth']
  split?: boolean
  searchText?: VNodeChild
  resetText?: VNodeChild
  optionRender?: QueryFilterProps['optionRender']
  collapseRender?: QueryFilterProps['collapseRender']
  collapse?: boolean
  collapseLabel?: VNodeChild
  placement?: LightFilterProps['placement']
  footerRender?: LightFilterProps['footerRender']
  stepsProps?: import('antdv-next').StepsProps
  finish?: () => Promise<unknown>
}

const props = withDefaults(defineProps<BodyProps>(), {
  grid: false,
  readonly: false,
  current: 0,
  loading: false,
  submitting: false,
  schemaSlots: () => ({}),
  classes: () => ({}),
  styles: () => ({}),
  collapsed: undefined,
  defaultCollapsed: undefined,
  collapse: undefined,
  searchText: undefined,
  resetText: undefined,
  optionRender: undefined,
  collapseRender: undefined,
  collapseLabel: undefined,
  footerRender: undefined,
})
const emit = defineEmits<{
  fieldChange: [path: Array<string | number>, value: unknown]
  modelChange: [values: FormRecord]
  submit: []
  reset: []
  next: []
  prev: []
  currentChange: [current: number]
  'update:collapsed': [collapsed: boolean]
  collapse: [collapsed: boolean]
}>()
const formRef = shallowRef<ProFormInstance>()
const stepForms = shallowRef<ProFormInstance[]>([])
const rootStyle = useThemeVars()
const { prefix, t } = useFormPrefix('form', () => props.prefixCls)
const isStepLayout = computed(
  () => props.layoutType === 'StepForm' || props.layoutType === 'StepsForm',
)
const steps = computed(() => buildSchemaSteps(props.columns))
const normalizedCurrent = computed(() =>
  Math.max(0, Math.min(props.current, Math.max(steps.value.length - 1, 0))),
)
const activeColumns = computed(() =>
  isStepLayout.value ? (steps.value[normalizedCurrent.value]?.columns ?? []) : props.columns,
)
const hasPrevious = computed(() => isStepLayout.value && normalizedCurrent.value > 0)
const hasNext = computed(
  () => isStepLayout.value && normalizedCurrent.value < steps.value.length - 1,
)
const showSubmitter = computed(() => props.submitter !== false && !props.readonly)
const filterComponent = computed(() =>
  props.layoutType === 'QueryFilter' ? QueryFilter : LightFilter,
)
const isFilter = computed(
  () => props.layoutType === 'QueryFilter' || props.layoutType === 'LightFilter',
)
const formSubmitter = computed<false | SubmitterProps>(() => {
  if (props.submitter === false || props.readonly) return false
  const source = props.submitter ?? {}
  return {
    ...source,
    submitButtonProps:
      source.submitButtonProps === false
        ? false
        : {
            ...source.submitButtonProps,
            loading: props.submitting || source.submitButtonProps?.loading,
          },
  }
})
const filterProps = computed(() => ({
  ...props.formProps,
  prefixCls: props.prefixCls,
  modelValue: props.model,
  readonly: props.readonly,
  labelCol: props.labelCol,
  wrapperCol: props.wrapperCol,
  submitter: formSubmitter.value,
  classes: props.classes,
  styles: props.styles,
  collapsed: props.collapsed,
  defaultCollapsed: props.defaultCollapsed,
  defaultColsNumber: props.defaultColsNumber,
  span: props.span,
  labelWidth: props.labelWidth,
  split: props.split,
  searchText: props.searchText,
  resetText: props.resetText,
  optionRender: props.optionRender,
  collapseRender: props.collapseRender,
  collapse: props.collapse,
  collapseLabel: props.collapseLabel,
  placement: props.placement,
  footerRender: props.footerRender,
  onFinish: finishForm,
}))
const submitterConfig = computed(() =>
  props.submitter && typeof props.submitter === 'object' ? props.submitter : {},
)
const submitText = computed(
  () =>
    submitterConfig.value.searchConfig?.submitText ??
    submitterConfig.value.submitText ??
    t('tableForm.submit', '提交'),
)
const stepItems = computed(() =>
  steps.value.map((step, index) => ({
    key: String(index),
    title: h(Fragment, null, [
      props.schemaSlots['step-title']?.({
        title: step.title,
        index,
        current: normalizedCurrent.value,
        step,
        steps: steps.value,
        values: props.model,
      }) ??
        step.title ??
        String(index + 1),
    ]),
  })),
)

async function validateFields(names?: ProDataIndex[], all = false): Promise<void> {
  if (isStepLayout.value) {
    const targets = all ? stepForms.value : [stepForms.value[normalizedCurrent.value]]
    for (const target of targets) await target?.validateFields(names)
  } else await formRef.value?.validateFields(names)
}
function clearValidate(names?: ProDataIndex[]): void {
  formRef.value?.clearValidate(names)
  stepForms.value.forEach((form) => form.clearValidate(names))
}
function resetFields(): void {
  clearValidate()
}
function scrollToField(name: ProDataIndex, options?: ScrollIntoViewOptions): void {
  const target = isStepLayout.value ? stepForms.value[normalizedCurrent.value] : formRef.value
  target?.scrollToField(name, options)
}
function handleFieldChange(path: Array<string | number>, value: unknown): void {
  emit('fieldChange', path, value)
}
async function finishForm(): Promise<void> {
  if (props.finish) await props.finish()
  else emit('submit')
}
function renderFields(columns = activeColumns.value): VNodeChild {
  return h(SchemaFormFields, {
    columns,
    model: props.model,
    readonly: props.readonly,
    grid: props.grid,
    layoutType: props.layoutType,
    schemaSlots: props.schemaSlots,
    onFieldChange: handleFieldChange,
  })
}
function stepSlotProps(index: number) {
  const step = steps.value[index]
  return {
    current: index,
    step,
    steps: steps.value,
    columns: step?.columns ?? [],
    values: props.model,
    content: () => renderFields(step?.columns ?? []),
  }
}
function requestStep(current: number): void {
  if (current < normalizedCurrent.value) emit('currentChange', current)
  else if (current > normalizedCurrent.value) emit('next')
}
const stepActionSlotProps = computed(() => ({
  current: normalizedCurrent.value,
  step: steps.value[normalizedCurrent.value],
  steps: steps.value,
  values: props.model,
  hasPrevious: hasPrevious.value,
  hasNext: hasNext.value,
  submitting: props.submitting,
  next: () => emit('next'),
  prev: () => emit('prev'),
  submit: () => void finishForm(),
  reset: () => emit('reset'),
}))
function renderStepActions(): VNodeChild {
  const config = submitterConfig.value
  const defaults = [
    hasPrevious.value &&
      config.resetButtonProps !== false &&
      h(
        Button,
        {
          ...config.resetButtonProps,
          disabled: props.submitting || Boolean(config.resetButtonProps?.disabled),
          onClick: (event: MouseEvent) => {
            if (config.resetButtonProps) config.resetButtonProps.onClick?.(event)
            emit('prev')
          },
        },
        () => config.searchConfig?.resetText ?? config.resetText ?? t('stepsForm.prev', '上一步'),
      ),
    config.submitButtonProps !== false &&
      h(
        Button,
        {
          type: 'primary',
          ...config.submitButtonProps,
          loading: props.submitting,
          onClick: (event: MouseEvent) => {
            if (config.submitButtonProps) config.submitButtonProps.onClick?.(event)
            if (hasNext.value) emit('next')
            else void finishForm()
          },
        },
        () => (hasNext.value ? t('stepsForm.next', '下一步') : submitText.value),
      ),
  ].filter(Boolean)
  if (config.render === false) return null
  const form = stepForms.value[normalizedCurrent.value]
  return config.render && form
    ? config.render({ form, submit: () => form.submit(), reset: () => emit('reset') }, defaults)
    : defaults
}
defineExpose({
  validateFields,
  resetFields,
  clearValidate,
  scrollToField,
  getNativeForm: () =>
    (isStepLayout.value ? stepForms.value[normalizedCurrent.value] : formRef.value)?.nativeForm,
})
</script>

<template>
  <div
    class="antdv-next-pro-schema-body"
    :class="[
      `${prefix}-content`,
      isStepLayout && `${prefix}-container`,
      isStepLayout && classes.container,
      `is-${layoutType.toLowerCase()}`,
      classes.content,
    ]"
    :style="[rootStyle, styles.content, isStepLayout && styles.container]"
  >
    <Spin :spinning="loading">
      <component
        :is="filterComponent"
        v-if="isFilter"
        ref="formRef"
        v-bind="filterProps"
        @update:model-value="emit('modelChange', $event)"
        @reset="emit('reset')"
        @update:collapsed="emit('update:collapsed', $event)"
        @collapse="emit('collapse', $event)"
      >
        <SchemaFormField
          v-for="(column, index) in columns"
          :key="String(column.key ?? index)"
          :column="column"
          :name="normalizePath(column.dataIndex)"
          :label="typeof column.title === 'function' ? column.title(column) : column.title"
          :secondary="column.secondary"
          :model="model"
          :readonly="readonly"
          :grid="false"
          :layout-type="layoutType"
          :schema-slots="schemaSlots"
          :on-value-change="handleFieldChange"
        />
        <template v-if="schemaSlots.submitter" #submitter>
          <VNodeContent
            :content="schemaSlots.submitter({ values: model, current: normalizedCurrent })"
          />
        </template>
      </component>
      <template v-else-if="isStepLayout">
        <div
          v-if="layoutType === 'StepsForm' && steps.length > 1"
          :class="`${prefix}-steps-container`"
        >
          <Steps
            v-bind="stepsProps"
            class="antdv-next-pro-schema-steps"
            :class="`${prefix}-steps`"
            :current="normalizedCurrent"
            :items="stepItems"
            @change="requestStep"
          />
        </div>
        <div
          v-for="(step, index) in steps"
          :key="index"
          :class="[
            `${prefix}-step`,
            index === normalizedCurrent && `${prefix}-step-active`,
            classes.step,
          ]"
          :style="[{ display: index === normalizedCurrent ? undefined : 'none' }, styles.step]"
          :aria-hidden="index !== normalizedCurrent"
        >
          <ProForm
            ref="stepForms"
            v-bind="formProps"
            :model-value="model"
            :readonly="readonly"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
            :submitter="false"
            :on-finish="
              async () => {
                if (hasNext) emit('next')
                else await finishForm()
              }
            "
            @update:model-value="emit('modelChange', $event)"
          >
            <VNodeContent
              v-if="schemaSlots['step-content']"
              :content="schemaSlots['step-content'](stepSlotProps(index))"
            />
            <SchemaFormFields
              v-else
              :columns="step.columns"
              :model="model"
              :readonly="readonly"
              :grid="grid"
              :layout-type="layoutType"
              :schema-slots="schemaSlots"
              @field-change="handleFieldChange"
            />
          </ProForm>
        </div>
        <div
          v-if="showSubmitter"
          class="antdv-next-pro-schema-submitter"
          :class="[`${prefix}-submitter`, classes.submitter]"
          :style="styles.submitter"
        >
          <VNodeContent
            v-if="schemaSlots['step-actions']"
            :content="schemaSlots['step-actions'](stepActionSlotProps)"
          />
          <VNodeContent
            v-else-if="schemaSlots.submitter"
            :content="schemaSlots.submitter({ values: model, current: normalizedCurrent })"
          />
          <Space v-else><VNodeContent :content="renderStepActions()" /></Space>
        </div>
      </template>
      <ProForm
        v-else
        ref="formRef"
        v-bind="formProps"
        :model-value="model"
        :readonly="readonly"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
        :submitter="formSubmitter"
        :on-finish="finishForm"
        @update:model-value="emit('modelChange', $event)"
        @reset="emit('reset')"
      >
        <SchemaFormFields
          :columns="columns"
          :model="model"
          :readonly="readonly"
          :grid="grid"
          :layout-type="layoutType"
          :schema-slots="schemaSlots"
          @field-change="handleFieldChange"
        />
        <template v-if="schemaSlots.submitter" #submitter>
          <VNodeContent
            :content="schemaSlots.submitter({ values: model, current: normalizedCurrent })"
          />
        </template>
      </ProForm>
    </Spin>
  </div>
</template>
