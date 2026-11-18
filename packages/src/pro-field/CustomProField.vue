<script setup lang="ts">
import { useAttrs } from 'vue'
import { useProConfig } from '../provider/context'
import ProField from './ProField.vue'
import { resolveProFieldValueType } from './valueType'
import type { ProFieldDualRender, ProFieldProps, ProFieldRenderText } from './types'

defineOptions({ name: 'CustomProField', inheritAttrs: false })
const {
  renderer,
  text,
  modelValue,
  valueType,
  mode,
  fieldProps,
  valueEnum,
  options,
  request,
  params,
} = defineProps<
  Pick<
    ProFieldProps,
    | 'text'
    | 'modelValue'
    | 'valueType'
    | 'mode'
    | 'fieldProps'
    | 'valueEnum'
    | 'options'
    | 'request'
    | 'params'
  > & {
    renderer: ProFieldRenderText | ProFieldDualRender
  }
>()
const config = useProConfig()
const attrs = useAttrs()
const renderValue = (value: unknown) => {
  const render =
    typeof renderer === 'function'
      ? renderer
      : mode === 'edit' || mode === 'update'
        ? renderer.renderEdit
        : renderer.renderRead
  return render(
    value,
    resolveProFieldValueType(valueType).type,
    { text, modelValue, valueType, mode, fieldProps, valueEnum, options, request, params },
    config.valueTypeMap.value,
  )
}
</script>

<template>
  <ProField
    v-bind="{
      text,
      modelValue,
      valueType,
      mode,
      fieldProps,
      valueEnum,
      options,
      request,
      params,
      ...attrs,
    }"
    :render="renderValue"
    :form-item-render="renderValue"
  >
    <template v-for="(_, name) in $slots" #[name]="slotProps"
      ><slot :name="name" v-bind="slotProps || {}"
    /></template>
  </ProField>
</template>
