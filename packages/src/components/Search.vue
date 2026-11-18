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

const {
  columns,
  search,
  form: formProp,
  loading,
  formRef,
} = defineProps<{
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
  const { initialValues, submitter, onSubmit, onReset, layout, classes, styles, ...rest } =
    formProp ?? {}
  return {
    ...rest,
    classes: typeof classes === 'function' ? () => classes({ props: formProp ?? {} }) : classes,
    styles: typeof styles === 'function' ? () => styles({ props: formProp ?? {} }) : styles,
    labelCol: rest.labelCol ? { ...rest.labelCol } : undefined,
    wrapperCol: rest.wrapperCol ? { ...rest.wrapperCol } : undefined,
  }
})
const formColumns = computed(() =>
  columns
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
  search?.optionRender === false
    ? false
    : search?.optionRender
      ? (_query: unknown, _form: unknown, dom: import('vue').VNodeChild[]) =>
          typeof search?.optionRender === 'function'
            ? search.optionRender(search, form.value, dom)
            : dom
      : undefined,
)
const submitter = computed(() => {
  const source = formProp?.submitter
  if (source === false) return false
  return {
    ...source,
    submitButtonProps:
      source?.submitButtonProps === false
        ? (false as const)
        : { loading, ...source?.submitButtonProps },
  }
})
watch(
  () => formRef,
  (value, previous) => {
    if (previous) previous.value = undefined
    if (value) value.value = formApi
  },
  { immediate: true },
)
onBeforeUnmount(() => {
  const target = formRef
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
    :layout="formProp?.layout"
    :date-formatter="false"
    :initial-values="formProp?.initialValues"
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
