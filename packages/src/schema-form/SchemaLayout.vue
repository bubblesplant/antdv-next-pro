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
const {
  columns,
  trigger = undefined,
  name,
  layoutType,
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
  ...restProps
} = defineProps<SchemaLayoutProps<T>>()

const slots = defineSlots<SchemaFormSlots<T>>()
const props = computed(() => ({
  ...restProps,
  columns,
  trigger,
  name,
  layoutType,
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
}))
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
const composition = computed(() => layouts[layoutType ?? 'Form'])
const compositionProps = computed(() => ({
  ...attrs,
  ...props.value,
  columns: undefined,
  layoutType: undefined,
}))
defineExpose(formApi)
</script>

<template>
  <SchemaForm v-if="columns" ref="formRef" v-bind="{ ...attrs, ...props }" :columns="columns">
    <template v-for="(_, slotName) in slots" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps ?? {}" />
    </template>
  </SchemaForm>
  <component :is="composition" v-else ref="formRef" v-bind="compositionProps">
    <template v-for="(_, slotName) in slots" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps ?? {}" />
    </template>
  </component>
</template>
