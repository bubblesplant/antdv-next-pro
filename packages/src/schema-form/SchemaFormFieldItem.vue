<script setup lang="ts">
import type { FormItemState } from './fieldTypes'
import { Col } from 'antdv-next'
import { mergeProps } from 'vue'
import SchemaFormItem from './SchemaFormItem.vue'

defineOptions({ inheritAttrs: false })
defineProps<{
  state: FormItemState
  grid: boolean
  colProps?: Record<string, unknown>
  rootAttrs: Record<string, unknown>
}>()
</script>

<template>
  <Col v-if="grid" v-bind="mergeProps({ xs: 24, sm: 12, lg: 8, ...colProps }, rootAttrs)">
    <SchemaFormItem :state="state" />
  </Col>
  <SchemaFormItem v-else :state="state" :root-attrs="rootAttrs" />
</template>
