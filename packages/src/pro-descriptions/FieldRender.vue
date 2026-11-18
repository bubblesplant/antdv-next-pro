<script setup lang="ts" generic="T extends Record<string, unknown> = Record<string, unknown>">
import type { VNodeChild } from 'vue'
import type { FieldRenderProps, ProDescriptionsColumn, ProDescriptionsRenderContext } from './types'
import { computed, getCurrentInstance, h, useAttrs } from 'vue'
import { ProField } from '../pro-field'
import { resolveColumnValueType } from '../table/valueType'
import { getValue, setValue } from '../table/utils'
import RenderNode from '../table/RenderNode.vue'

defineOptions({ inheritAttrs: false })
const {
  dataIndex,
  title,
  label,
  valueType,
  valueEnum,
  request,
  onFieldRequestError,
  params: paramsProp,
  dependencies,
  fieldProps: fieldPropsProp,
  formItemProps,
  renderText,
  render,
  formItemRender,
  renderFormItem,
  copyable,
  ellipsis,
  mode,
  text,
  entity,
  action,
  index,
  emptyText = undefined,
  form,
} = defineProps<FieldRenderProps<T>>()
const emit = defineEmits<{ 'update:text': [value: unknown] }>()
// 保留整体 props 接口，getter 持续读取响应式解构值。
const props = {
  get dataIndex() {
    return dataIndex
  },
  get title() {
    return title
  },
  get label() {
    return label
  },
  get valueType() {
    return valueType
  },
  get valueEnum() {
    return valueEnum
  },
  get request() {
    return request
  },
  get onFieldRequestError() {
    return onFieldRequestError
  },
  get params() {
    return paramsProp
  },
  get dependencies() {
    return dependencies
  },
  get fieldProps() {
    return fieldPropsProp
  },
  get formItemProps() {
    return formItemProps
  },
  get renderText() {
    return renderText
  },
  get render() {
    return render
  },
  get formItemRender() {
    return formItemRender
  },
  get renderFormItem() {
    return renderFormItem
  },
  get copyable() {
    return copyable
  },
  get ellipsis() {
    return ellipsis
  },
  get mode() {
    return mode
  },
  get text() {
    return text
  },
  get entity() {
    return entity
  },
  get action() {
    return action
  },
  get index() {
    return index
  },
  get emptyText() {
    return emptyText
  },
  get form() {
    return form
  },
}
const $attrs = useAttrs()
const instance = getCurrentInstance()
const schema = computed<ProDescriptionsColumn<T>>(() => {
  const key = instance?.vnode.key
  return { ...props, key: typeof key === 'string' || typeof key === 'number' ? key : undefined }
})
const params = computed(() =>
  (dependencies ?? []).reduce<Record<string, unknown>>(
    (result, path) => setValue(result, path, getValue(entity, path)),
    { ...paramsProp },
  ),
)
const fieldProps = computed(() =>
  typeof fieldPropsProp === 'function' ? fieldPropsProp(entity) : fieldPropsProp,
)
function defaultRender(): VNodeChild {
  return h(ProField, {
    ...$attrs,
    text: renderText ? renderText(text, entity, index ?? 0, action) : text,
    valueType: resolveColumnValueType(valueType, entity, index ?? 0),
    mode: mode ?? 'read',
    fieldProps: fieldProps.value,
    valueEnum: typeof valueEnum === 'function' ? valueEnum() : valueEnum,
    request,
    params: params.value,
    onRequestError: onFieldRequestError,
    copyable,
    ellipsis,
    emptyText,
    'onUpdate:modelValue': (value: unknown) => emit('update:text', value),
  })
}
function renderField(): VNodeChild {
  const dom = defaultRender()
  const editing = mode === 'edit' || mode === 'update'
  if (editing && (formItemRender || renderFormItem)) {
    const context: ProDescriptionsRenderContext<T> = {
      record: entity,
      index: index ?? 0,
      column: schema.value,
      editable: true,
      isEditable: true,
      recordKey: dataIndex,
      type: 'descriptions',
      dependencies: dependencies?.map((path) => getValue(entity, path)),
      defaultRender,
      update: (value) => emit('update:text', value),
    }
    return formItemRender
      ? formItemRender(schema.value, context, form)
      : renderFormItem?.(schema.value, context)
  }
  return !editing && render ? render(dom, entity, index ?? 0, action, schema.value) : dom
}
</script>
<template><RenderNode :content="renderField()" /></template>
