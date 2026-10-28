<script setup lang="ts" generic="T extends Record<string, unknown> = Record<string, unknown>">
import type { Component } from 'vue'
import { computed, useAttrs } from 'vue'
import type { SchemaLayoutProps, SchemaFormSlots } from '../types'
import SchemaForm from '../SchemaForm.vue'
import ProForm from '../pro-form/ProForm'
import { ModalForm, DrawerForm, QueryFilter, LightFilter } from '../pro-form/layouts'
import { StepsForm, StepForm } from '../pro-form/StepsForm'
import { useSchemaFormRef } from './useSchemaFormRef'

defineOptions({ inheritAttrs: false })
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
const attrs = useAttrs()
const { formRef, formApi } = useSchemaFormRef<T>()
const layouts: Record<string, Component> = {
  Form: ProForm,
  Embed: ProForm,
  ModalForm,
  DrawerForm,
  QueryFilter,
  LightFilter,
  StepsForm,
  StepForm,
}
const composition = computed(() => layouts[props.layoutType ?? 'Form'])
const compositionProps = computed(() => ({
  ...attrs,
  ...props,
  columns: undefined,
  layoutType: undefined,
}))
defineExpose(formApi)
</script>

<template>
  <SchemaForm v-if="columns" ref="formRef" v-bind="{ ...attrs, ...props }" :columns="columns">
    <template v-for="(_, name) in slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps ?? {}" />
    </template>
  </SchemaForm>
  <component :is="composition" v-else ref="formRef" v-bind="compositionProps">
    <template v-for="(_, name) in slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps ?? {}" />
    </template>
  </component>
</template>
