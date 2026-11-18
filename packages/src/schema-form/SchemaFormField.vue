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

const {
  column: columnProp,
  model,
  prefix = [],
  readonly: readonlyProp = false,
  grid = false,
  layoutType: layoutTypeProp = 'Form',
  schemaSlots = {},
  onValueChange,
} = defineProps<FieldProps>()
// 保留整体 props 接口，getter 持续读取响应式解构值。
const props = {
  get column() {
    return columnProp
  },
  get model() {
    return model
  },
  get prefix() {
    return prefix
  },
  get readonly() {
    return readonlyProp
  },
  get grid() {
    return grid
  },
  get layoutType() {
    return layoutTypeProp
  },
  get schemaSlots() {
    return schemaSlots
  },
  get onValueChange() {
    return onValueChange
  },
}

const ADivider = Divider as Component
const nativeForm = useFormInstance()
const { t } = useFormPrefix('form', () => undefined)
const valueType = computed(() => resolveColumnValueType(columnProp.valueType, model, 0))

function renderFormItem(context: ProRenderContext<FormRecord>): VNodeChild {
  return columnProp.formItemRender
    ? columnProp.formItemRender(columnProp, context, nativeForm)
    : columnProp.renderFormItem?.(columnProp, context)
}

function resolvePath(): Array<string | number> {
  return [...prefix, ...normalizePath(columnProp.dataIndex)]
}

function resolveDependencyValues(): unknown[] | undefined {
  return columnProp.dependencies?.map((dependency) => getValue(model, normalizePath(dependency)))
}

function createUpdate(currentPath: Array<string | number>): (next: unknown) => void {
  return (next) => onValueChange(currentPath, next)
}

function createRenderContext(
  dependencies: unknown[] | undefined,
  update: (next: unknown) => void,
): ProRenderContext<FormRecord> {
  return {
    record: model,
    index: 0,
    column: columnProp as ProColumns<FormRecord>,
    editable: !readonlyProp && !columnProp.readonly,
    dependencies,
    update,
  }
}

function resolveFormListState(): FormListState {
  const currentPath = resolvePath()
  const current = getValue(model, currentPath)
  const rows = Array.isArray(current) ? current : []
  const fieldProps = resolveObjectProps(columnProp.fieldProps, model)
  return {
    rows,
    fieldProps,
    creatorText: toDisplayText(
      fieldProps.creatorButtonText ?? t('editableTable.action.add', '添加一行数据'),
    ),
    path: currentPath,
    title: columnProp.title ? resolveTitle(columnProp) : undefined,
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
    title: !hasContent && columnProp.title ? resolveTitle(columnProp) : undefined,
  }
}

function resolveDefaultControlState(
  currentValue: unknown,
  update: (next: unknown) => void,
): DefaultControlState {
  const { type, ...configuration } = valueType.value
  const fieldProps = {
    ...configuration,
    ...resolveObjectProps(columnProp.fieldProps, model),
  }
  const valueEnum =
    typeof columnProp.valueEnum === 'function' ? columnProp.valueEnum() : columnProp.valueEnum
  const readonly = readonlyProp || columnProp.readonly === true
  const disabled = Boolean(fieldProps.disabled)

  if (columnProp.component) {
    return {
      disabled: false,
      component: columnProp.component,
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
  if (columnProp.request) {
    componentProps.request = columnProp.request
    if (columnProp.params !== undefined) componentProps.params = columnProp.params
  }
  if (columnProp.onFieldRequestError) {
    componentProps.onRequestError = columnProp.onFieldRequestError
  }

  return { disabled: false, component: FieldControl, componentProps }
}

function resolveFieldRenderState(): FormItemState {
  const currentPath = resolvePath()
  const dependencies = resolveDependencyValues()
  const update = createUpdate(currentPath)
  const context = createRenderContext(dependencies, update)
  const currentValue = getValue(model, currentPath)
  const currentFieldName = currentPath.join('.')
  const fieldSlot =
    schemaSlots[`field-${currentFieldName}`] ??
    schemaSlots[currentFieldName] ??
    schemaSlots[String(columnProp.key ?? '')]
  const fieldSlotContent = fieldSlot?.({
    value: currentValue,
    record: model,
    column: columnProp,
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
  const resolvedFormItemProps = resolveObjectProps(columnProp.formItemProps, model)
  const labelSlot = schemaSlots[`label-${currentFieldName}`]
  const label = labelSlot?.({ column: columnProp, record: model }) ?? resolveTitle(columnProp)
  return {
    content,
    defaultControl,
    hasContent: content !== undefined && content !== null,
    formItemProps: {
      ...resolvedFormItemProps,
      name: currentPath,
      label,
      tooltip: columnProp.tooltip,
      extra: columnProp.extra,
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
  <template v-if="!isHidden(columnProp, layoutTypeProp)">
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
