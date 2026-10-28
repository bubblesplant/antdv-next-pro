<script setup lang="ts" generic="T extends Record<string, unknown> = Record<string, unknown>">
import type { VNodeChild } from 'vue'
import type { FormRecord } from './schema-form/utils'
import type {
  SchemaFormColumn,
  ProDataIndex,
  SchemaFormInstance,
  SchemaFormLayoutType,
  SchemaFormProps,
  SchemaFormSlots,
} from './types'

import { Drawer, Modal } from 'antdv-next'
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, useAttrs, watch } from 'vue'
import { useSemanticStyles } from './shared/semantic'
import { useFormPrefix, assignRef } from './pro-form/utils'
import { useThemeVars } from './shared/useThemeVars'
import { useOverlaySubmitLock } from './pro-form/useOverlaySubmitLock'

import SchemaFormBody from './schema-form/SchemaFormBody.vue'
import {
  buildSchemaSteps,
  buildSubmitValues,
  formatSchemaValues,
  cloneValue,
  convertInboundValues,
  mergeValues,
  readUrlValues,
  reconcileUrlValues,
  recordsEqual,
  replaceRecord,
  schemaFieldNames,
  setValue,
  getValue,
  normalizePath,
  writeUrlValues,
} from './schema-form/utils'

interface BodyApi {
  getNativeForm?: () => import('antdv-next').FormInstance | undefined
  validateFields?: (names?: ProDataIndex[], all?: boolean) => Promise<void>
  resetFields?: () => void
  clearValidate?: (names?: ProDataIndex[]) => void
  scrollToField?: (name: ProDataIndex, options?: ScrollIntoViewOptions) => void
}

type RuntimeSchemaSlots = Record<
  string,
  ((props: Record<string, unknown>) => VNodeChild) | undefined
>

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<SchemaFormProps<T>>(), {
  submitter: () => ({}),
  syncToUrl: undefined,
  syncToInitialValues: true,
  title: undefined,
  searchText: undefined,
  resetText: undefined,
  optionRender: undefined,
  collapseRender: undefined,
  collapseLabel: undefined,
  footerRender: undefined,
  collapsed: undefined,
  defaultCollapsed: undefined,
  disabled: undefined,
  collapse: undefined,
})
const emit = defineEmits<{
  'update:modelValue': [values: Partial<T>]
  'update:open': [open: boolean]
  'update:current': [current: number]
  change: [values: Partial<T>]
  valuesChange: [changed: Partial<T>, values: Partial<T>]
  fieldChange: [changed: { path: Array<string | number>; value: unknown }, values: Partial<T>]
  submit: [values: Partial<T>]
  finish: [values: Partial<T>]
  reset: [values: Partial<T>]
  open: []
  close: []
  currentChange: [current: number]
  error: [error: unknown]
  requestError: [error: unknown]
  'update:collapsed': [collapsed: boolean]
  collapse: [collapsed: boolean]
}>()
const slots = defineSlots<SchemaFormSlots<T>>()
const attrs = useAttrs()
const { prefix: defaultPrefix } = useFormPrefix('', () => undefined)
const { prefix, direction, t } = useFormPrefix(
  'form',
  () =>
    props.prefixCls ??
    `${defaultPrefix.value}-${props.layoutType === 'QueryFilter' ? 'query-filter' : props.layoutType === 'LightFilter' ? 'form-light-filter' : props.layoutType === 'StepsForm' || props.layoutType === 'StepForm' ? 'steps-form' : 'form'}`,
)
const rootStyle = useThemeVars()
const semantic = useSemanticStyles(props, {
  classes: () => props.classes,
  classNames: () => props.classNames,
  styles: () => props.styles,
})
const rootAttrs = computed(() => ({
  ...attrs,
  class: ['antdv-next-pro-schema-form', prefix.value, attrs.class, semantic.classes.value.root],
  style: [
    rootStyle.value,
    { direction: direction.value },
    props.style,
    attrs.style,
    semantic.styles.value.root,
  ],
}))
const bodyRef = ref<BodyApi>()
const formState = reactive<FormRecord>({})
const initialSnapshot = ref<FormRecord>({})
const requestLoading = ref(false)
const submitting = ref(false)
const closeLock = useOverlaySubmitLock(() => props.submitTimeout)
const internalOpen = ref(props.open ?? false)
const internalCurrent = ref(props.current ?? 0)
const initialized = ref(false)
let requestSequence = 0
let urlWriteQueued = false
let nextNavigation: Promise<boolean> | undefined
let pendingSubmit: Promise<Partial<T>> | undefined
let openRevision = 0
let alive = true
watch(
  internalOpen,
  () => {
    openRevision++
  },
  { flush: 'sync' },
)
const effectiveUrlSync = computed(() =>
  props.syncToUrl === undefined ? props.urlSync : Boolean(props.syncToUrl),
)
const bodyOptions = computed(() => ({
  formProps: { ...props.formProps, layout: props.layout, disabled: props.disabled },
  prefixCls: prefix.value,
  classes: semantic.classes.value,
  styles: semantic.styles.value,
  collapsed: props.collapsed,
  defaultCollapsed: props.defaultCollapsed,
  defaultColsNumber: props.defaultColsNumber,
  span: props.span,
  labelWidth: props.labelWidth,
  split: props.split,
  optionRender: props.optionRender,
  collapseRender: props.collapseRender,
  searchText: props.searchText,
  resetText: props.resetText,
  collapse: props.collapse,
  collapseLabel: props.collapseLabel,
  placement: props.placement,
  footerRender: props.footerRender,
  stepsProps: props.stepsProps,
  finish: submit,
}))

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
const dialogSubmitter = computed(() => {
  if (slots.footer || props.submitter === false) return false
  const source = props.submitter ?? {}
  const sourceReset = source.resetButtonProps
  return {
    ...source,
    searchConfig: {
      resetText: source.resetText ?? t('editableTable.action.cancel', '取消'),
      ...source.searchConfig,
    },
    resetButtonProps:
      sourceReset === false
        ? (false as const)
        : {
            ...sourceReset,
            disabled: closeLock.locked.value || sourceReset?.disabled,
            onClick: (event: MouseEvent) => {
              event.preventDefault()
              if (closeLock.locked.value) return
              if (sourceReset?.onClick) sourceReset.onClick(event)
              else {
                closeForm()
                if (layoutType.value === 'ModalForm') props.modalProps?.onCancel?.(event)
                else props.drawerProps?.onClose?.(event)
              }
            },
          },
  }
})
const modalOptions = computed(() => ({
  ...props.modalProps,
  onCancel: undefined,
  afterClose: () => {
    if (
      !internalOpen.value &&
      (props.modalProps?.destroyOnHidden ?? props.modalProps?.destroyOnClose)
    )
      reset()
    props.modalProps?.afterClose?.()
  },
}))
const drawerOptions = computed(() => ({
  ...props.drawerProps,
  onClose: undefined,
  afterOpenChange: (next: boolean) => {
    if (
      !next &&
      !internalOpen.value &&
      (props.drawerProps?.destroyOnHidden ?? props.drawerProps?.destroyOnClose)
    )
      reset()
    props.drawerProps?.afterOpenChange?.(next)
  },
}))
function cancelModal(event: MouseEvent | KeyboardEvent): void {
  if (closeLock.locked.value) return
  props.modalProps?.onCancel?.(event)
  closeForm()
}
function closeDrawer(event: MouseEvent | KeyboardEvent): void {
  if (closeLock.locked.value) return
  props.drawerProps?.onClose?.(event)
  closeForm()
}

watch(
  () => props.open,
  (open) => {
    if (open !== undefined) internalOpen.value = open
  },
  { flush: 'sync' },
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
  () =>
    [
      props.request,
      cloneValue(props.params),
      cloneValue(props.initialValues),
      cloneValue(effectiveUrlSync.value),
    ] as const,
  (next, previous) => {
    if (
      !previous ||
      next[0] !== previous[0] ||
      !recordsEqual(next[1], previous[1]) ||
      !recordsEqual(next[2], previous[2]) ||
      !recordsEqual(next[3], previous[3])
    )
      void initialize()
  },
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

    const fromUrl = readUrlValues(effectiveUrlSync.value, fieldNames.value)
    const hydrated =
      props.syncToInitialValues === false
        ? {}
        : typeof props.syncToUrl === 'function'
          ? props.syncToUrl(fromUrl, 'get')
          : fromUrl
    const merged = mergeValues(props.initialValues, requested, hydrated, props.modelValue)
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
  emit('fieldChange', { path: [...path], value: cloneValue(value) }, snapshot)
  const changed: FormRecord = {}
  setValue(changed, path, cloneValue(value))
  emit('valuesChange', changed as Partial<T>, snapshot)
  props.onValuesChange?.(changed as Partial<T>, snapshot)
  scheduleUrlWrite()
}

function handleModelChange(values: FormRecord): void {
  if (recordsEqual(formState, values)) return
  const changed = changedValues(formState, values)
  replaceRecord(formState, values)
  const snapshot = getFieldsValue()
  emit('update:modelValue', snapshot)
  emit('change', snapshot)
  emit('valuesChange', changed as Partial<T>, snapshot)
  props.onValuesChange?.(changed as Partial<T>, snapshot)
  scheduleUrlWrite()
}

function changedValues(previous: FormRecord, next: FormRecord): FormRecord {
  const result: FormRecord = {}
  for (const key of new Set([...Object.keys(previous), ...Object.keys(next)])) {
    if (recordsEqual(previous[key], next[key])) continue
    const oldValue = previous[key]
    const value = next[key]
    result[key] =
      oldValue &&
      value &&
      Object.getPrototypeOf(oldValue) === Object.prototype &&
      Object.getPrototypeOf(value) === Object.prototype
        ? changedValues(oldValue as FormRecord, value as FormRecord)
        : cloneValue(value)
  }
  return result
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

async function validate(names?: ProDataIndex[]): Promise<Partial<T>> {
  try {
    await bodyRef.value?.validateFields?.(names, true)
    return getFieldsValue()
  } catch (error) {
    emit('error', error)
    throw error
  }
}

function getFieldsFormatValue(): Partial<T> {
  const values = formatSchemaValues(props.columns, formState, props.dateFormatter)
  return buildSubmitValues(props.columns, values) as Partial<T>
}

async function performSubmit(): Promise<Partial<T>> {
  const submittedRevision = openRevision
  submitting.value = true
  try {
    await validate()
    const values = getFieldsFormatValue()
    emit('submit', values)
    if (isDialog.value) closeLock.start()
    const result = await props.onFinish?.(values)
    if (!props.onFinish) emit('finish', values)
    if (alive && result === true && isDialog.value && openRevision === submittedRevision)
      closeForm()
    return values
  } catch (error) {
    emit('error', error)
    throw error
  } finally {
    closeLock.stop()
    submitting.value = false
  }
}

function submit(): Promise<Partial<T>> {
  if (!pendingSubmit)
    pendingSubmit = performSubmit().finally(() => {
      pendingSubmit = undefined
    })
  return pendingSubmit
}

async function handleSubmit(): Promise<void> {
  try {
    await submit()
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
  if (!effectiveUrlSync.value || urlWriteQueued) return
  urlWriteQueued = true
  queueMicrotask(() => {
    urlWriteQueued = false
    writeUrlValues(
      effectiveUrlSync.value,
      typeof props.syncToUrl === 'function'
        ? props.syncToUrl(cloneValue(formState), 'set')
        : formState,
      fieldNames.value,
    )
  })
}

function hydrateFromUrl(): void {
  if (!effectiveUrlSync.value) return
  const fromUrl = readUrlValues(effectiveUrlSync.value, fieldNames.value)
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

const formApi: SchemaFormInstance<T> = {
  get nativeForm() {
    return bodyRef.value?.getNativeForm?.()
  },
  validate,
  validateFields: validate,
  validateFieldsReturnFormatValue: async (names) => {
    await validate(names)
    return getFieldsFormatValue()
  },
  reset,
  resetFields: reset,
  clearValidate: (names) => bodyRef.value?.clearValidate?.(names),
  getFieldsValue,
  getFieldValue: (name) => getValue(formState, normalizePath(name)),
  getFieldsFormatValue,
  getFieldFormatValue: (name) => getValue(getFieldsFormatValue(), normalizePath(name)),
  setFieldsValue,
  setFieldValue: (name, value) => handleFieldChange(normalizePath(name), value),
  submit,
  open: openForm,
  close: closeForm,
  next,
  prev,
  scrollToField: (name, options) => bodyRef.value?.scrollToField?.(name, options),
  loading: submitting,
}
defineExpose<SchemaFormInstance<T>>(formApi)
onMounted(() => assignRef(props.formRef, formApi))
onBeforeUnmount(() => {
  alive = false
  openRevision++
  requestSequence++
  assignRef(props.formRef, undefined)
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
    v-bind="modalOptions"
    :open="internalOpen"
    :title="dialogTitle"
    :width="width"
    :footer="dialogFooter"
    @cancel="cancelModal"
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

    <div v-bind="rootAttrs">
      <SchemaFormBody
        v-bind="bodyOptions"
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
        @model-change="handleModelChange"
        @collapse="emit('collapse', $event)"
        @update:collapsed="emit('update:collapsed', $event)"
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
    v-bind="drawerOptions"
    :open="internalOpen"
    :title="dialogTitle"
    :width="width"
    @close="closeDrawer"
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

    <div v-bind="rootAttrs">
      <SchemaFormBody
        v-bind="bodyOptions"
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
        @model-change="handleModelChange"
        @collapse="emit('collapse', $event)"
        @update:collapsed="emit('update:collapsed', $event)"
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

  <div v-else v-bind="rootAttrs">
    <SchemaFormBody
      v-bind="bodyOptions"
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
      @model-change="handleModelChange"
      @collapse="emit('collapse', $event)"
      @update:collapsed="emit('update:collapsed', $event)"
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
