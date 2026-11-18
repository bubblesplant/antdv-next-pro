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

const {
  columns: columnsProp,
  model,
  layoutType,
  labelCol,
  wrapperCol,
  grid = false,
  readonly = false,
  submitter,
  current: currentProp = 0,
  loading = false,
  submitting = false,
  schemaSlots = {},
  formProps,
  prefixCls,
  classes = {},
  styles = {},
  collapsed = undefined,
  defaultCollapsed = undefined,
  defaultColsNumber,
  span,
  labelWidth,
  split,
  searchText = undefined,
  resetText = undefined,
  optionRender = undefined,
  collapseRender = undefined,
  collapse = undefined,
  collapseLabel = undefined,
  placement,
  footerRender = undefined,
  finish,
} = defineProps<BodyProps>()
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
const { prefix, t } = useFormPrefix('form', () => prefixCls)
const isStepLayout = computed(() => layoutType === 'StepForm' || layoutType === 'StepsForm')
const steps = computed(() => buildSchemaSteps(columnsProp))
const normalizedCurrent = computed(() =>
  Math.max(0, Math.min(currentProp, Math.max(steps.value.length - 1, 0))),
)
const activeColumns = computed(() =>
  isStepLayout.value ? (steps.value[normalizedCurrent.value]?.columns ?? []) : columnsProp,
)
const hasPrevious = computed(() => isStepLayout.value && normalizedCurrent.value > 0)
const hasNext = computed(
  () => isStepLayout.value && normalizedCurrent.value < steps.value.length - 1,
)
const showSubmitter = computed(() => submitter !== false && !readonly)
const filterComponent = computed(() => (layoutType === 'QueryFilter' ? QueryFilter : LightFilter))
const isFilter = computed(() => layoutType === 'QueryFilter' || layoutType === 'LightFilter')
const formSubmitter = computed<false | SubmitterProps>(() => {
  if (submitter === false || readonly) return false
  const source = submitter ?? {}
  return {
    ...source,
    submitButtonProps:
      source.submitButtonProps === false
        ? false
        : {
            ...source.submitButtonProps,
            loading: submitting || source.submitButtonProps?.loading,
          },
  }
})
const formClasses = computed(() => {
  const source = formProps?.classes
  return {
    ...(typeof source === 'function' ? source({ props: formProps ?? {} }) : source),
    ...(classes.form !== undefined && { form: classes.form }),
    ...(classes.submitter !== undefined && { submitter: classes.submitter }),
  }
})
const formStyles = computed(() => {
  const source = formProps?.styles
  return {
    ...(typeof source === 'function' ? source({ props: formProps ?? {} }) : source),
    ...(styles.form !== undefined && { form: styles.form }),
    ...(styles.submitter !== undefined && { submitter: styles.submitter }),
  }
})
const filterProps = computed(() => ({
  ...formProps,
  prefixCls,
  modelValue: model,
  readonly,
  labelCol,
  wrapperCol,
  submitter: formSubmitter.value,
  classes,
  styles,
  collapsed,
  defaultCollapsed,
  defaultColsNumber,
  span,
  labelWidth,
  split,
  searchText,
  resetText,
  optionRender,
  collapseRender,
  collapse,
  collapseLabel,
  placement,
  footerRender,
  onFinish: finishForm,
}))
const submitterConfig = computed(() =>
  submitter && typeof submitter === 'object' ? submitter : {},
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
      schemaSlots['step-title']?.({
        title: step.title,
        index,
        current: normalizedCurrent.value,
        step,
        steps: steps.value,
        values: model,
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
  if (finish) await finish()
  else emit('submit')
}
function renderFields(columns = activeColumns.value): VNodeChild {
  return h(SchemaFormFields, {
    columns,
    model,
    readonly,
    grid,
    layoutType,
    schemaSlots,
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
    values: model,
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
  values: model,
  hasPrevious: hasPrevious.value,
  hasNext: hasNext.value,
  submitting,
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
          disabled: submitting || Boolean(config.resetButtonProps?.disabled),
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
          loading: submitting,
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
    :class="[`${prefix}-content`, `is-${layoutType.toLowerCase()}`, classes.content]"
    :style="[rootStyle, styles.content]"
    :data-pro-steps-form="isStepLayout ? '' : undefined"
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
          data-pro-steps-form-header
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
          data-pro-steps-form-content
          :class="[`${prefix}-container`, classes.container]"
          :style="styles.container"
        >
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
            data-pro-steps-form-step
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
        :prefix-cls="prefix"
        :classes="formClasses"
        :styles="formStyles"
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
