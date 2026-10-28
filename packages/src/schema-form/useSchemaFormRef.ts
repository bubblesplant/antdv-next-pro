import { computed, shallowRef, unref } from 'vue'
import type { SchemaFormInstance } from '../types'
import type { FormRecord } from './utils'

// Layout aliases share only imperative API forwarding; their views remain ordinary SFC templates.
export function useSchemaFormRef<T extends FormRecord = FormRecord>() {
  const formRef = shallowRef<SchemaFormInstance<T>>()
  const formApi: SchemaFormInstance<T> = {
    get nativeForm() {
      return formRef.value?.nativeForm
    },
    validate: () => formRef.value?.validate() ?? Promise.resolve({}),
    reset: () => formRef.value?.reset(),
    validateFields: (names) =>
      formRef.value?.validateFields?.(names) ?? formRef.value?.validate() ?? Promise.resolve({}),
    validateFieldsReturnFormatValue: (names) =>
      formRef.value?.validateFieldsReturnFormatValue?.(names) ??
      formRef.value?.validate() ??
      Promise.resolve({}),
    resetFields: () => formRef.value?.resetFields?.() ?? formRef.value?.reset(),
    clearValidate: (names) => formRef.value?.clearValidate?.(names),
    getFieldsValue: () => formRef.value?.getFieldsValue() ?? {},
    setFieldsValue: (values) => formRef.value?.setFieldsValue(values),
    getFieldValue: (name) => formRef.value?.getFieldValue?.(name),
    getFieldsFormatValue: () => formRef.value?.getFieldsFormatValue?.() ?? {},
    getFieldFormatValue: (name) => formRef.value?.getFieldFormatValue?.(name),
    setFieldValue: (name, value) => formRef.value?.setFieldValue?.(name, value),
    scrollToField: (name, options) => formRef.value?.scrollToField?.(name, options),
    loading: computed(() => Boolean(unref(formRef.value?.loading))),
    submit: () => formRef.value?.submit() ?? Promise.resolve({}),
    open: () => formRef.value?.open?.(),
    close: () => formRef.value?.close?.(),
    next: () => formRef.value?.next?.() ?? Promise.resolve(false),
    prev: () => formRef.value?.prev?.(),
    formMap: () => formRef.value?.formMap?.() ?? new Map(),
  }
  return { formRef, formApi }
}
