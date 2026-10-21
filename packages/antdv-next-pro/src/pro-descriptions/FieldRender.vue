<script setup lang="ts" generic="T extends Record<string, unknown> = Record<string, unknown>">
import type { VNodeChild } from 'vue'
import type { FieldRenderProps, ProDescriptionsColumn, ProDescriptionsRenderContext } from './types'
import { computed, getCurrentInstance, h, useAttrs } from 'vue'
import { ProField } from '../pro-field'
import { resolveColumnValueType } from '../table/valueType'
import { getValue, setValue } from '../table/utils'
import RenderNode from '../table/RenderNode.vue'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<FieldRenderProps<T>>(), { emptyText: undefined })
const emit = defineEmits<{ 'update:text': [value: unknown] }>()
const $attrs = useAttrs()
const instance = getCurrentInstance()
const schema = computed<ProDescriptionsColumn<T>>(() => {
  const key = instance?.vnode.key
  return { ...props, key: typeof key === 'string' || typeof key === 'number' ? key : undefined }
})
const params = computed(() =>
  (props.dependencies ?? []).reduce<Record<string, unknown>>(
    (result, path) => setValue(result, path, getValue(props.entity, path)),
    { ...props.params },
  ),
)
const fieldProps = computed(() =>
  typeof props.fieldProps === 'function' ? props.fieldProps(props.entity) : props.fieldProps,
)
function defaultRender(): VNodeChild {
  return h(ProField, {
    ...$attrs,
    text: props.renderText
      ? props.renderText(props.text, props.entity, props.index ?? 0, props.action)
      : props.text,
    valueType: resolveColumnValueType(props.valueType, props.entity, props.index ?? 0),
    mode: props.mode ?? 'read',
    fieldProps: fieldProps.value,
    valueEnum: typeof props.valueEnum === 'function' ? props.valueEnum() : props.valueEnum,
    request: props.request,
    params: params.value,
    onRequestError: props.onFieldRequestError,
    copyable: props.copyable,
    ellipsis: props.ellipsis,
    emptyText: props.emptyText,
    'onUpdate:modelValue': (value: unknown) => emit('update:text', value),
  })
}
function renderField(): VNodeChild {
  const dom = defaultRender()
  const editing = props.mode === 'edit' || props.mode === 'update'
  if (editing && (props.formItemRender || props.renderFormItem)) {
    const context: ProDescriptionsRenderContext<T> = {
      record: props.entity,
      index: props.index ?? 0,
      column: schema.value,
      editable: true,
      isEditable: true,
      recordKey: props.dataIndex,
      type: 'descriptions',
      dependencies: props.dependencies?.map((path) => getValue(props.entity, path)),
      defaultRender,
      update: (value) => emit('update:text', value),
    }
    return props.formItemRender
      ? props.formItemRender(schema.value, context, props.form)
      : props.renderFormItem?.(schema.value, context)
  }
  return !editing && props.render
    ? props.render(dom, props.entity, props.index ?? 0, props.action, schema.value)
    : dom
}
</script>
<template><RenderNode :content="renderField()" /></template>
