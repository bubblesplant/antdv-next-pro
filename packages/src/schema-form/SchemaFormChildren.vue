<script setup lang="ts">
import type { SchemaFormColumn } from '../types'
import type { FieldProps } from './fieldTypes'
import type { FormRecord } from './utils'
import SchemaFormField from './SchemaFormField.vue'
import { normalizePath } from './utils'

defineProps<{
  columns: SchemaFormColumn<FormRecord>[]
  context: Omit<FieldProps, 'column'>
  prefix?: Array<string | number>
}>()

function childKey(column: SchemaFormColumn<FormRecord>, index: number): string {
  const key = column.key ?? normalizePath(column.dataIndex).join('.')
  return String(key === '' ? index : key)
}
</script>

<template>
  <SchemaFormField
    v-for="(child, index) in columns"
    :key="childKey(child, index)"
    :column="child"
    :model="context.model"
    :prefix="prefix ?? context.prefix"
    :readonly="context.readonly"
    :grid="context.grid"
    :layout-type="context.layoutType"
    :schema-slots="context.schemaSlots"
    :on-value-change="context.onValueChange"
  />
</template>
