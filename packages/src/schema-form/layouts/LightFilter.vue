<script setup lang="ts" generic="T extends Record<string, unknown> = Record<string, unknown>">
import type { SchemaLayoutProps, SchemaFormSlots } from '../../types'
import SchemaLayout from '../SchemaLayout.vue'
import { useSchemaFormRef } from '../useSchemaFormRef'

defineOptions({ name: 'AntdvNextProLightFilter', inheritAttrs: false })
const {
  trigger = undefined,
  open = undefined,
  title = undefined,
  grid = undefined,
  readonly = undefined,
  disabled = undefined,
  urlSync = undefined,
  syncToUrl = undefined,
  syncToInitialValues = undefined,
  submitter = undefined,
  collapsed = undefined,
  defaultCollapsed = undefined,
  split = undefined,
  searchText = undefined,
  resetText = undefined,
  optionRender = undefined,
  collapseRender = undefined,
  collapse = undefined,
  collapseLabel = undefined,
  footerRender = undefined,
  ...props
} = defineProps<SchemaLayoutProps<T>>()

const slots = defineSlots<SchemaFormSlots<T>>()
const { formRef, formApi } = useSchemaFormRef<T>()
defineExpose(formApi)
</script>

<template>
  <SchemaLayout
    ref="formRef"
    v-bind="{
      ...$attrs,
      ...props,
      trigger,
      open,
      title,
      grid,
      readonly,
      disabled,
      urlSync,
      syncToUrl,
      syncToInitialValues,
      submitter,
      collapsed,
      defaultCollapsed,
      split,
      searchText,
      resetText,
      optionRender,
      collapseRender,
      collapse,
      collapseLabel,
      footerRender,
    }"
    layout-type="LightFilter"
  >
    <template v-for="(_, name) in slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps ?? {}" />
    </template>
  </SchemaLayout>
</template>
