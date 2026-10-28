<script setup lang="ts">
import type { SchemaFormColumn, SchemaFormLayoutType, SchemaFormSlots } from '../types'
import type { FormRecord } from './utils'

import { Row } from 'antdv-next'

import SchemaFormChildren from './SchemaFormChildren.vue'
import { useFormPrefix } from '../pro-form/utils'
const props = withDefaults(defineProps<FieldsProps>(), {
  grid: false,
  readonly: false,
  schemaSlots: () => ({}),
})

const emit = defineEmits<{
  fieldChange: [path: Array<string | number>, value: unknown]
}>()

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
