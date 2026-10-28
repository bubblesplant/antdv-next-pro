<script setup lang="ts">
import type { Component, VNodeChild } from 'vue'
import type { ProColumns, ProRenderContext, SchemaFormColumn, SchemaFormLayoutType } from '../types'
import type { FormRecord } from './utils'

import { Divider, useFormInstance } from 'antdv-next'
import { computed } from 'vue'
import { resolveColumnValueType } from '../table/valueType'
import { useFormPrefix } from '../pro-form/utils'

import FieldControl from '../pro-form-fields/FieldControl.vue'
import DirectSlotRenderer from '../shared/DirectSlotRenderer'
import SchemaFormGroup from './SchemaFormGroup.vue'
import SchemaFormFieldItem from './SchemaFormFieldItem.vue'
import SchemaFormList from './SchemaFormList.vue'
import type {
  CompositeState,
  DefaultControlState,
  FieldProps,
  FormItemState,
  FormListState,
} from './fieldTypes'
import { toDisplayText } from './fieldUtils'
import { getValue, normalizePath } from './utils'

defineOptions({ name: 'AntdvNextProSchemaFormField', inheritAttrs: false })

const props = withDefaults(defineProps<FieldProps>(), {
  prefix: () => [],
  readonly: false,
  grid: false,
  layoutType: 'Form',
  schemaSlots: () => ({}),
})

const ADivider = Divider as Component
const nativeForm = useFormInstance()
const { t } = useFormPrefix('form', () => undefined)
const valueType = computed(() => resolveColumnValueType(props.column.valueType, props.model, 0))

function renderFormItem(context: ProRenderContext<FormRecord>): VNodeChild {
  return props.column.formItemRender
    ? props.column.formItemRender(props.column, context, nativeForm)
    : props.column.renderFormItem?.(props.column, context)
}

function resolvePath(): Array<string | number> {
  return [...props.prefix, ...normalizePath(props.column.dataIndex)]
}

function resolveDependencyValues(): unknown[] | undefined {
  return props.column.dependencies?.map((dependency) =>
    getValue(props.model, normalizePath(dependency)),
  )
}

function createUpdate(currentPath: Array<string | number>): (next: unknown) => void {
  return (next) => props.onValueChange(currentPath, next)
}

function createRenderContext(
  dependencies: unknown[] | undefined,
  update: (next: unknown) => void,
): ProRenderContext<FormRecord> {
  return {
    record: props.model,
    index: 0,
    column: props.column as ProColumns<FormRecord>,
    editable: !props.readonly && !props.column.readonly,
    dependencies,
    update,
  }
}

function resolveFormListState(): FormListState {
  const currentPath = resolvePath()
  const current = getValue(props.model, currentPath)
  const rows = Array.isArray(current) ? current : []
  const fieldProps = resolveObjectProps(props.column.fieldProps, props.model)
  return {
    rows,
    fieldProps,
    creatorText: toDisplayText(
      fieldProps.creatorButtonText ?? t('editableTable.action.add', '添加一行数据'),
    ),
    path: currentPath,
    title: props.column.title ? resolveTitle(props.column) : undefined,
  }
}

function resolveCompositeRenderState(): CompositeState {
  const currentPath = resolvePath()
  const dependencies = resolveDependencyValues()
  const update = createUpdate(currentPath)
  const context = createRenderContext(dependencies, update)
  const content = renderFormItem(context)
  const hasContent = content !== undefined && content !== null
  return {
    content,
    hasContent,
    title: !hasContent && props.column.title ? resolveTitle(props.column) : undefined,
  }
}

function resolveDefaultControlState(
  currentValue: unknown,
  update: (next: unknown) => void,
): DefaultControlState {
  const { type, ...configuration } = valueType.value
  const fieldProps = {
    ...configuration,
    ...resolveObjectProps(props.column.fieldProps, props.model),
  }
  const valueEnum =
    typeof props.column.valueEnum === 'function' ? props.column.valueEnum() : props.column.valueEnum
  const readonly = props.readonly || props.column.readonly === true
  const disabled = Boolean(fieldProps.disabled)

  if (props.column.component) {
    return {
      disabled: false,
      component: props.column.component,
      componentProps: {
        ...fieldProps,
        value: currentValue,
        modelValue: currentValue,
        disabled: readonly || disabled,
        'onUpdate:value': update,
        'onUpdate:modelValue': update,
      },
    }
  }

  const componentProps: Record<string, unknown> = {
    fieldType: type,
    modelValue: currentValue,
    fieldProps,
    readonly,
    disabled,
    'onUpdate:modelValue': update,
  }
  if (valueEnum !== undefined) componentProps.valueEnum = valueEnum
  if (props.column.request) {
    componentProps.request = props.column.request
    if (props.column.params !== undefined) componentProps.params = props.column.params
  }
  if (props.column.onFieldRequestError) {
    componentProps.onRequestError = props.column.onFieldRequestError
  }

  return { disabled: false, component: FieldControl, componentProps }
}

function resolveFieldRenderState(): FormItemState {
  const currentPath = resolvePath()
  const dependencies = resolveDependencyValues()
  const update = createUpdate(currentPath)
  const context = createRenderContext(dependencies, update)
  const currentValue = getValue(props.model, currentPath)
  const currentFieldName = currentPath.join('.')
  const fieldSlot =
    props.schemaSlots[`field-${currentFieldName}`] ??
    props.schemaSlots[currentFieldName] ??
    props.schemaSlots[String(props.column.key ?? '')]
  const fieldSlotContent = fieldSlot?.({
    value: currentValue,
    record: props.model,
    column: props.column,
    dependencies,
    update,
  })
  // Keep the original render order and call both public callbacks on every component render,
  // even when the field slot wins by nullish precedence.
  const renderedByColumn = renderFormItem(context)
  const content = fieldSlotContent ?? renderedByColumn
  const defaultControl =
    content === undefined || content === null
      ? resolveDefaultControlState(currentValue, update)
      : undefined
  const resolvedFormItemProps = resolveObjectProps(props.column.formItemProps, props.model)
  const labelSlot = props.schemaSlots[`label-${currentFieldName}`]
  const label =
    labelSlot?.({ column: props.column, record: props.model }) ?? resolveTitle(props.column)
  return {
    content,
    defaultControl,
    hasContent: content !== undefined && content !== null,
    formItemProps: {
      ...resolvedFormItemProps,
      name: currentPath,
      label,
      tooltip: props.column.tooltip,
      extra: props.column.extra,
    },
  }
}

function isCompositeColumn(): boolean {
  return (
    valueType.value.type === 'group' ||
    valueType.value.type === 'formSet' ||
    valueType.value.type === 'dependency'
  )
}

function isRenderableFieldColumn(): boolean {
  return (
    valueType.value.type !== 'option' &&
    valueType.value.type !== 'index' &&
    valueType.value.type !== 'indexBorder' &&
    resolvePath().length > 0
  )
}

function resolveObjectProps(
  value: SchemaFormColumn<FormRecord>['fieldProps'] | SchemaFormColumn<FormRecord>['formItemProps'],
  record: FormRecord,
): Record<string, unknown> {
  return (typeof value === 'function' ? value(record) : value) ?? {}
}

function resolveTitle(column: SchemaFormColumn<FormRecord>): VNodeChild {
  return typeof column.title === 'function' ? column.title(column) : column.title
}

function isHidden(column: SchemaFormColumn<FormRecord>, layoutType: SchemaFormLayoutType): boolean {
  if (column.hideInForm) return true
  if ((layoutType === 'QueryFilter' || layoutType === 'LightFilter') && column.hideInSearch) {
    return true
  }
  return false
}
</script>

<template>
  <template v-if="!isHidden(column, layoutType)">
    <DirectSlotRenderer
      v-if="valueType.type === 'divider'"
      :component="ADivider"
      :content="resolveTitle(column)"
      :root-attrs="$attrs"
      use-content
    />
    <SchemaFormList
      v-else-if="valueType.type === 'formList' && resolvePath().length > 0"
      :context="props"
      :state="resolveFormListState()"
      :root-attrs="$attrs"
    />
    <SchemaFormGroup
      v-else-if="isCompositeColumn()"
      :context="props"
      :state="resolveCompositeRenderState()"
      :root-attrs="$attrs"
    />
    <SchemaFormFieldItem
      v-else-if="isRenderableFieldColumn()"
      :state="resolveFieldRenderState()"
      :grid="grid"
      :col-props="column.colProps"
      :root-attrs="$attrs"
    />
  </template>
</template>
