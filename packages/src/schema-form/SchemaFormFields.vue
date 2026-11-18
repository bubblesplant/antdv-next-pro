<script setup lang="ts">
import type { SchemaFormColumn, SchemaFormLayoutType, SchemaFormSlots } from '../types'
import type { FormRecord } from './utils'

import { Row } from 'antdv-next'

import SchemaFormChildren from './SchemaFormChildren.vue'
import { useFormPrefix } from '../pro-form/utils'
const {
  columns,
  model,
  layoutType,
  grid = false,
  readonly = false,
  schemaSlots = {},
} = defineProps<FieldsProps>()
const emit = defineEmits<{
  fieldChange: [path: Array<string | number>, value: unknown]
}>()

// 保留整体 props 接口，getter 持续读取响应式解构值。
const props = {
  get columns() {
    return columns
  },
  get model() {
    return model
  },
  get layoutType() {
    return layoutType
  },
  get grid() {
    return grid
  },
  get readonly() {
    return readonly
  },
  get schemaSlots() {
    return schemaSlots
  },
}

const { prefix } = useFormPrefix('form', () => undefined)

type SchemaSlot = NonNullable<SchemaFormSlots<FormRecord>[string]>
type SchemaSlots = Record<string, SchemaSlot | undefined>

interface FieldsProps {
  columns: SchemaFormColumn<FormRecord>[]
  model: FormRecord
  layoutType: SchemaFormLayoutType
  grid?: boolean
  readonly?: boolean
  schemaSlots?: SchemaSlots
}

function handleValueChange(path: Array<string | number>, value: unknown): void {
  emit('fieldChange', path, value)
}
</script>

<template>
  <Row v-if="grid" class="antdv-next-pro-schema-grid" :class="`${prefix}-row`" :gutter="16">
    <SchemaFormChildren
      :columns="columns"
      :context="{ ...props, onValueChange: handleValueChange }"
    />
  </Row>
  <SchemaFormChildren
    v-else
    :columns="columns"
    :context="{ ...props, onValueChange: handleValueChange }"
  />
</template>
