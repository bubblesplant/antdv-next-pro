<script setup lang="ts" generic="T extends Record<string, unknown> = Record<string, unknown>">
import type { SchemaLayoutProps, SchemaFormSlots } from '../../types'
import SchemaLayout from '../SchemaLayout.vue'
import { useSchemaFormRef } from '../useSchemaFormRef'

defineOptions({ name: 'AntdvNextProStepsForm', inheritAttrs: false })
const props = withDefaults(defineProps<SchemaLayoutProps<T>>(), {
  submitter: undefined,
  syncToUrl: undefined,
  syncToInitialValues: undefined,
  open: undefined,
  readonly: undefined,
  grid: undefined,
  disabled: undefined,
  collapsed: undefined,
  defaultCollapsed: undefined,
  split: undefined,
  collapse: undefined,
  urlSync: undefined,
  title: undefined,
  trigger: undefined,
  searchText: undefined,
  resetText: undefined,
  optionRender: undefined,
  collapseRender: undefined,
  collapseLabel: undefined,
  footerRender: undefined,
})
const slots = defineSlots<SchemaFormSlots<T>>()
const { formRef, formApi } = useSchemaFormRef<T>()
defineExpose(formApi)
</script>

<template>
  <SchemaLayout ref="formRef" v-bind="{ ...$attrs, ...props }" layout-type="StepsForm">
    <template v-for="(_, name) in slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps ?? {}" />
    </template>
  </SchemaLayout>
</template>
