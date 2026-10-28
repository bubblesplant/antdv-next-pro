<script setup lang="ts" generic="T extends Record<string, unknown> = Record<string, unknown>">
import type {
  ProColumns,
  ProTableSearchConfig,
  ProTableSearchForm,
  SchemaFormInstance,
} from '../types'
import { computed, watch, onBeforeUnmount } from 'vue'
import { QueryFilter, LightFilter } from '../schema-form/layouts'
import { useSchemaFormRef } from '../schema-form/useSchemaFormRef'

const props = defineProps<{
  columns: ProColumns<T>[]
  search?: ProTableSearchConfig<T>
  form?: ProTableSearchForm<T>
  loading?: boolean
  formRef?: import('vue').Ref<SchemaFormInstance<T> | undefined>
}>()
const emit = defineEmits<{
  submit: [values: Record<string, unknown>]
  reset: []
  collapse: [value: boolean]
}>()
const { formRef: form, formApi } = useSchemaFormRef<T>()
const formBindings = computed(() => {
  const { initialValues, submitter, onSubmit, onReset, classes, styles, ...rest } = props.form ?? {}
  return {
    ...rest,
    classes: typeof classes === 'function' ? () => classes({ props: props.form ?? {} }) : classes,
    styles: typeof styles === 'function' ? () => styles({ props: props.form ?? {} }) : styles,
    labelCol: rest.labelCol ? { ...rest.labelCol } : undefined,
    wrapperCol: rest.wrapperCol ? { ...rest.wrapperCol } : undefined,
  }
})
const formColumns = computed(() =>
  props.columns
    .filter((column) => !column.hideInSearch && column.search !== false)
    .map((column) => ({
      ...column,
      renderFormItem: column.formItemRender
        ? (schema: ProColumns<T>, context: import('../types').ProRenderContext<T>) =>
            column.formItemRender!(schema, context, form.value?.nativeForm)
        : column.renderFormItem,
    })),
)
const optionRender = computed(() =>
  props.search?.optionRender === false
    ? false
    : props.search?.optionRender
      ? (_query: unknown, _form: unknown, dom: import('vue').VNodeChild[]) =>
          typeof props.search?.optionRender === 'function'
            ? props.search.optionRender(props.search, form.value, dom)
            : dom
      : undefined,
)
const submitter = computed(() => {
  const source = props.form?.submitter
  if (source === false) return false
  return {
    ...source,
    submitButtonProps:
      source?.submitButtonProps === false
        ? (false as const)
        : { loading: props.loading, ...source?.submitButtonProps },
  }
})
watch(
  () => props.formRef,
  (value, previous) => {
    if (previous) previous.value = undefined
    if (value) value.value = formApi
  },
  { immediate: true },
)
onBeforeUnmount(() => {
  const target = props.formRef
  if (target) target.value = undefined
})
async function finish(values: Record<string, unknown>) {
  emit('submit', values)
  return true
}
defineExpose(formApi)
</script>
<template>
  <component
    :is="search?.filterType === 'light' ? LightFilter : QueryFilter"
    ref="form"
    :form-props="formBindings"
    :date-formatter="false"
    :initial-values="props.form?.initialValues"
    :submitter="submitter"
    :columns="formColumns"
    :default-collapsed="search?.defaultCollapsed ?? true"
    :collapsed="search?.collapsed"
    :span="search?.span"
    :label-width="search?.labelWidth"
    :search-text="search?.searchText"
    :reset-text="search?.resetText"
    :option-render="optionRender"
    :collapse-render="search?.collapseRender"
    :on-finish="finish"
    @reset="emit('reset')"
    @collapse="emit('collapse', $event)"
  />
</template>
