import { computed, unref } from 'vue'
import { proFormProps } from './componentProps'
import type { ProFormInstance } from './types'
export function pickFormProps(props: Record<string, unknown>) {
  return Object.fromEntries(Object.keys(proFormProps).map((key) => [key, props[key]]))
}
export function proxyForm(refValue: { value: ProFormInstance | undefined }): ProFormInstance {
  return {
    get nativeForm() {
      return refValue.value?.nativeForm
    },
    validate: (...args) => refValue.value?.validate(...args) ?? Promise.resolve({}),
    validateFields: (...args) => refValue.value?.validateFields(...args) ?? Promise.resolve({}),
    validateFieldsReturnFormatValue: (...args) =>
      refValue.value?.validateFieldsReturnFormatValue(...args) ?? Promise.resolve({}),
    reset: () => refValue.value?.reset(),
    resetFields: () => refValue.value?.resetFields(),
    clearValidate: (...args) => refValue.value?.clearValidate(...args),
    getFieldsValue: (...args) => refValue.value?.getFieldsValue(...args) ?? {},
    getFieldValue: (...args) => refValue.value?.getFieldValue(...args),
    getFieldsFormatValue: () => refValue.value?.getFieldsFormatValue() ?? {},
    getFieldFormatValue: (...args) => refValue.value?.getFieldFormatValue(...args),
    setFieldsValue: (...args) => refValue.value?.setFieldsValue(...args),
    setFieldValue: (...args) => refValue.value?.setFieldValue(...args),
    submit: () => refValue.value?.submit() ?? Promise.resolve({}),
    scrollToField: (...args) => refValue.value?.scrollToField(...args),
    loading: computed(() => Boolean(unref(refValue.value?.loading))),
  }
}
