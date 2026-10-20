<script setup lang="ts" generic="T extends Record<string, unknown> = Record<string, unknown>">
import type { VNodeChild } from 'vue'
import type { FormRecord } from './schema-form/utils'
import type {
  SchemaFormColumn,
  SchemaFormInstance,
  SchemaFormLayoutType,
  SchemaFormProps,
  SchemaFormSlots,
} from './types'

import { Drawer, Modal } from 'antdv-next'
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'

import SchemaFormBody from './schema-form/SchemaFormBody.vue'
import {
  buildSchemaSteps,
  buildSubmitValues,
  cloneValue,
  convertInboundValues,
  mergeValues,
  readUrlValues,
  reconcileUrlValues,
  recordsEqual,
  replaceRecord,
  schemaFieldNames,
  setValue,
  writeUrlValues,
} from './schema-form/utils'

interface BodyApi {
  validateFields?: () => Promise<void>
  resetFields?: () => void
}

type RuntimeSchemaSlots = Record<
  string,
  ((props: Record<string, unknown>) => VNodeChild) | undefined
>

const props = withDefaults(defineProps<SchemaFormProps<T>>(), {
  submitter: () => ({}),
})
const emit = defineEmits<{
  'update:modelValue': [values: Partial<T>]
  'update:open': [open: boolean]
  'update:current': [current: number]
  change: [values: Partial<T>]
  valuesChange: [changed: { path: Array<string | number>; value: unknown }, values: Partial<T>]
  submit: [values: Partial<T>]
  finish: [values: Partial<T>]
  reset: [values: Partial<T>]
  open: []
  close: []
  currentChange: [current: number]
  error: [error: unknown]
  requestError: [error: unknown]
}>()

const slots = defineSlots<SchemaFormSlots<T>>()
const bodyRef = ref<BodyApi>()
const formState = reactive<FormRecord>({})
const initialSnapshot = ref<FormRecord>({})
const requestLoading = ref(false)
const submitting = ref(false)
const internalOpen = ref(props.open ?? false)
const internalCurrent = ref(props.current ?? 0)
const initialized = ref(false)
let requestSequence = 0
let urlWriteQueued = false
let nextNavigation: Promise<boolean> | undefined

const layoutType = computed<SchemaFormLayoutType>(() => props.layoutType ?? 'Form')
const bodyColumns = computed(() => props.columns as unknown as SchemaFormColumn<FormRecord>[])
const schemaSlots = slots as unknown as RuntimeSchemaSlots
const slotValues = computed(() => formState as unknown as Partial<T>)
const fieldNames = computed(() => schemaFieldNames(props.columns))
const steps = computed(() => buildSchemaSteps(props.columns))
const isDialog = computed(
  () => layoutType.value === 'ModalForm' || layoutType.value === 'DrawerForm',
)
const dialogTitle = computed(() => props.title as unknown as string | undefined)
const dialogFooter = computed(() => (slots.footer ? undefined : null))
const dialogSubmitter = computed(() => (slots.footer ? false : props.submitter))

watch(
  () => props.open,
  (open) => {
    if (open !== undefined) internalOpen.value = open
  },
)

watch(
  () => props.current,
  (current) => {
    if (current !== undefined) internalCurrent.value = normalizeCurrent(current)
  },
)

watch(
  () => props.modelValue,
  (modelValue) => {
    if (!initialized.value || modelValue === undefined) return
    const converted = convertInboundValues(props.columns, modelValue)
    if (!recordsEqual(formState, converted)) replaceRecord(formState, converted)
  },
  { deep: true },
)

watch(
  [() => props.request, () => props.params, () => props.initialValues, () => props.urlSync],
  () => void initialize(),
  { deep: true, immediate: true },
)

watch(
  () => props.columns,
  () => {
    const converted = convertInboundValues(props.columns, formState)
    if (!recordsEqual(formState, converted)) replaceRecord(formState, converted)
  },
  { deep: true },
)

async function initialize(): Promise<void> {
  const sequence = ++requestSequence
  requestLoading.value = Boolean(props.request)

  try {
    let requested: Partial<T> = {}
    if (props.request) requested = await props.request(props.params)
    if (sequence !== requestSequence) return

    const fromUrl = readUrlValues(
      props.urlSync as SchemaFormProps<FormRecord>['urlSync'],
      fieldNames.value,
    )
    const merged = mergeValues(props.initialValues, requested, fromUrl, props.modelValue)
    const converted = convertInboundValues(props.columns, merged)
    replaceRecord(formState, converted)
    initialSnapshot.value = cloneValue(converted)
    initialized.value = true
  } catch (error) {
    if (sequence !== requestSequence) return
    emit('requestError', error)
    emit('error', error)

    const fallback = convertInboundValues(
      props.columns,
      mergeValues(props.initialValues, props.modelValue),
    )
    replaceRecord(formState, fallback)
    initialSnapshot.value = cloneValue(fallback)
    initialized.value = true
  } finally {
    if (sequence === requestSequence) requestLoading.value = false
  }
}

function handleFieldChange(path: Array<string | number>, value: unknown): void {
  setValue(formState, path, value)
  const snapshot = getFieldsValue()
  emit('update:modelValue', snapshot)
  emit('change', snapshot)
  emit('valuesChange', { path: [...path], value: cloneValue(value) }, snapshot)
  scheduleUrlWrite()
}

function getFieldsValue(): Partial<T> {
  return cloneValue(formState) as Partial<T>
}

function setFieldsValue(values: Partial<T>): void {
  const converted = convertInboundValues(props.columns, values)
  replaceRecord(formState, mergeValues(formState, converted))
  const snapshot = getFieldsValue()
  emit('update:modelValue', snapshot)
  emit('change', snapshot)
  scheduleUrlWrite()
}

async function validate(): Promise<Partial<T>> {
  try {
    await bodyRef.value?.validateFields?.()
    return getFieldsValue()
  } catch (error) {
    emit('error', error)
    throw error
  }
}

async function submit(): Promise<Partial<T>> {
  submitting.value = true
  try {
    const validated = await validate()
    const values = buildSubmitValues(props.columns, validated)
    emit('submit', values)
    emit('finish', values)
    return values
  } finally {
    submitting.value = false
  }
}

async function handleSubmit(): Promise<void> {
  try {
    await submit()
    if (isDialog.value) closeForm()
  } catch {
    // Validation and request errors are surfaced through the error event.
  }
}

function reset(): void {
  replaceRecord(formState, initialSnapshot.value)
  void nextTick(() => bodyRef.value?.resetFields?.())
  const snapshot = getFieldsValue()
  emit('update:modelValue', snapshot)
  emit('change', snapshot)
  emit('reset', snapshot)
  scheduleUrlWrite()
}

function openForm(): void {
  if (internalOpen.value) return
  internalOpen.value = true
  emit('update:open', true)
  emit('open')
}

function closeForm(): void {
  if (!internalOpen.value) return
  internalOpen.value = false
  emit('update:open', false)
  emit('close')
}

function next(): Promise<boolean> {
  if (nextNavigation) return nextNavigation

  const startCurrent = internalCurrent.value
  if (startCurrent >= steps.value.length - 1) return Promise.resolve(false)

  const navigation = advanceToNextStep(startCurrent)
  nextNavigation = navigation
  void navigation.finally(() => {
    if (nextNavigation === navigation) nextNavigation = undefined
  })
  return navigation
}

async function advanceToNextStep(startCurrent: number): Promise<boolean> {
  try {
    await bodyRef.value?.validateFields?.()
    if (internalCurrent.value !== startCurrent) return false
    setCurrent(startCurrent + 1)
    return true
  } catch (error) {
    emit('error', error)
    return false
  }
}

function prev(): void {
  if (internalCurrent.value > 0) setCurrent(internalCurrent.value - 1)
}

function setCurrent(current: number): void {
  const normalized = normalizeCurrent(current)
  if (normalized === internalCurrent.value) return
  internalCurrent.value = normalized
  emit('update:current', normalized)
  emit('currentChange', normalized)
}

function normalizeCurrent(current: number): number {
  return Math.max(0, Math.min(current, Math.max(steps.value.length - 1, 0)))
}

function scheduleUrlWrite(): void {
  if (!props.urlSync || urlWriteQueued) return
  urlWriteQueued = true
  queueMicrotask(() => {
    urlWriteQueued = false
    writeUrlValues(
      props.urlSync as SchemaFormProps<FormRecord>['urlSync'],
      formState,
      fieldNames.value,
    )
  })
}

function hydrateFromUrl(): void {
  if (!props.urlSync) return
  const fromUrl = readUrlValues(
    props.urlSync as SchemaFormProps<FormRecord>['urlSync'],
    fieldNames.value,
  )
  const converted = convertInboundValues(props.columns, fromUrl)
  const reconciled = reconcileUrlValues(formState, converted, fieldNames.value)
  if (recordsEqual(formState, reconciled)) return
  replaceRecord(formState, reconciled)
  const snapshot = getFieldsValue()
  emit('update:modelValue', snapshot)
  emit('change', snapshot)
}

onMounted(() => {
  if (typeof window === 'undefined') return
  window.addEventListener('popstate', hydrateFromUrl)
  window.addEventListener('hashchange', hydrateFromUrl)
})

onBeforeUnmount(() => {
  if (typeof window === 'undefined') return
  window.removeEventListener('popstate', hydrateFromUrl)
  window.removeEventListener('hashchange', hydrateFromUrl)
})

defineExpose<SchemaFormInstance<T>>({
  validate,
  reset,
  getFieldsValue,
  setFieldsValue,
  submit,
  open: openForm,
  close: closeForm,
  next,
  prev,
})
</script>

<template>
  <slot
    v-if="isDialog && slots.trigger"
    name="trigger"
    :open="internalOpen"
    :open-form="openForm"
    :close-form="closeForm"
  />

  <Modal
    v-if="layoutType === 'ModalForm'"
    :open="internalOpen"
    :title="dialogTitle"
    :width="width"
    :footer="dialogFooter"
    :destroy-on-hidden="false"
    @cancel="closeForm"
  >
    <template v-if="slots.title" #title>
      <slot
        name="title"
        :title="title"
        :open="internalOpen"
        :values="slotValues"
        :close="closeForm"
      />
    </template>

    <div :style="style">
      <SchemaFormBody
        ref="bodyRef"
        :columns="bodyColumns"
        :model="formState"
        :layout-type="layoutType"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
        :grid="grid"
        :readonly="readonly"
        :submitter="dialogSubmitter"
        :current="internalCurrent"
        :loading="requestLoading"
        :submitting="submitting"
        :schema-slots="schemaSlots"
        @field-change="handleFieldChange"
        @submit="handleSubmit"
        @reset="reset"
        @next="next"
        @prev="prev"
        @current-change="setCurrent"
      />
    </div>

    <template v-if="slots.footer" #footer>
      <slot
        name="footer"
        :values="slotValues"
        :submitting="submitting"
        :submit="handleSubmit"
        :reset="reset"
        :close="closeForm"
      />
    </template>
  </Modal>

  <Drawer
    v-else-if="layoutType === 'DrawerForm'"
    :open="internalOpen"
    :title="dialogTitle"
    :width="width"
    :destroy-on-close="false"
    @close="closeForm"
  >
    <template v-if="slots.title" #title>
      <slot
        name="title"
        :title="title"
        :open="internalOpen"
        :values="slotValues"
        :close="closeForm"
      />
    </template>

    <div :style="style">
      <SchemaFormBody
        ref="bodyRef"
        :columns="bodyColumns"
        :model="formState"
        :layout-type="layoutType"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
        :grid="grid"
        :readonly="readonly"
        :submitter="dialogSubmitter"
        :current="internalCurrent"
        :loading="requestLoading"
        :submitting="submitting"
        :schema-slots="schemaSlots"
        @field-change="handleFieldChange"
        @submit="handleSubmit"
        @reset="reset"
        @next="next"
        @prev="prev"
        @current-change="setCurrent"
      />
    </div>

    <template v-if="slots.footer" #footer>
      <slot
        name="footer"
        :values="slotValues"
        :submitting="submitting"
        :submit="handleSubmit"
        :reset="reset"
        :close="closeForm"
      />
    </template>
  </Drawer>

  <div v-else class="antdv-next-pro-schema-form" :style="style">
    <SchemaFormBody
      ref="bodyRef"
      :columns="bodyColumns"
      :model="formState"
      :layout-type="layoutType"
      :label-col="labelCol"
      :wrapper-col="wrapperCol"
      :grid="grid"
      :readonly="readonly"
      :submitter="submitter"
      :current="internalCurrent"
      :loading="requestLoading"
      :submitting="submitting"
      :schema-slots="schemaSlots"
      @field-change="handleFieldChange"
      @submit="handleSubmit"
      @reset="reset"
      @next="next"
      @prev="prev"
      @current-change="setCurrent"
    />
  </div>
</template>

<style>
.antdv-next-pro-schema-form,
.antdv-next-pro-schema-body {
  width: 100%;
}

.antdv-next-pro-schema-steps {
  margin-block-end: 28px;
}

.antdv-next-pro-schema-grid {
  width: 100%;
}

.antdv-next-pro-schema-submitter {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  margin-block-start: 16px;
}

.antdv-next-pro-schema-body.is-queryfilter .antdv-next-pro-schema-submitter,
.antdv-next-pro-schema-body.is-lightfilter .antdv-next-pro-schema-submitter {
  display: inline-flex;
  width: auto;
  margin-block-start: 0;
  margin-inline-start: 8px;
  vertical-align: top;
}

.antdv-next-pro-schema-group {
  min-width: 0;
  margin: 0 0 20px;
  padding: 0;
  border: 0;
}

/* Antdv Form's reset targets `.ant-form legend` with higher specificity, so the group title's
   color, size and margin come from Antdv tokens; only the weight is ours. */
.antdv-next-pro-schema-group-title {
  font-weight: 600;
}

.antdv-next-pro-form-list-title {
  margin-block-end: 16px;
  color: var(--antdv-next-pro-color-text, rgba(0, 0, 0, 0.88));
  font-size: 16px;
  font-weight: 600;
}

.antdv-next-pro-form-list {
  margin-block-end: 20px;
}

.antdv-next-pro-form-list-row {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  padding: 12px;
  margin-block-end: 8px;
  background: var(--antdv-next-pro-color-fill-alter, rgba(0, 0, 0, 0.02));
  border-radius: 6px;
}

.antdv-next-pro-form-list-fields {
  flex: 1;
  min-width: 0;
}

.antdv-next-pro-schema-readonly {
  display: inline-block;
  min-height: 22px;
  color: var(--antdv-next-pro-color-text, rgba(0, 0, 0, 0.88));
  line-height: 22px;
}
</style>
