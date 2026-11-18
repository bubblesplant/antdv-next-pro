<script setup lang="ts">
import type { PropType } from 'vue'

import { resolveColumnValueType } from './valueType'
import { computed, getCurrentInstance } from 'vue'
import { ProField } from '../pro-field'
import { useProConfig } from '../provider/context'

import FieldControl from '../pro-form-fields/FieldControl.vue'
import { hasExplicitProp, type ProFormControlType } from '../pro-form-fields/fieldRegistry'
import type { ProColumns } from '../types'
import type { ProFieldOption } from './ValueTypeControl'

defineOptions({ name: 'AntdvNextProValueTypeControl', inheritAttrs: false })

const {
  column: columnProp,
  value,
  options,
  loading,
  fieldProps,
} = defineProps({
  column: {
    type: Object as PropType<object>,
    required: true,
  },
  value: { type: null as unknown as PropType<unknown> },
  options: {
    type: Array as PropType<ProFieldOption[]>,
    default: () => [],
  },
  loading: Boolean,
  fieldProps: {
    type: Object as PropType<Record<string, unknown>>,
    default: () => ({}),
  },
})

const emit = defineEmits({
  'update:value': (_value: unknown) => true,
})

const instance = getCurrentInstance()
const config = useProConfig()
const registeredType = computed(() => Boolean(config.valueTypeMap.value[resolveFieldType()]))

function resolveColumn(): ProColumns<Record<string, unknown>> {
  return columnProp as ProColumns<Record<string, unknown>>
}

function resolveFieldType(): ProFormControlType {
  const valueType = resolveColumn().valueType
  if (valueType !== undefined) return resolveColumnValueType(valueType, {}, 0).type
  return options.length > 0 || resolveColumn().valueEnum !== undefined ? 'select' : 'text'
}

function resolveControlProps(): Record<string, unknown> {
  const column = resolveColumn()
  const result: Record<string, unknown> = {
    fieldType: resolveFieldType(),
    modelValue: value,
    fieldProps,
    loading,
  }

  const hasResolvedOptions =
    options.length > 0 ||
    column.request !== undefined ||
    column.valueEnum !== undefined ||
    Array.isArray(fieldProps.options) ||
    Array.isArray(fieldProps.treeData)

  if (hasExplicitProp(instance?.vnode.props, 'options') && hasResolvedOptions) {
    result.options = options
  } else if (column.valueEnum !== undefined) {
    result.valueEnum = column.valueEnum
  }

  return result
}
</script>

<template>
  <ProField
    v-if="registeredType"
    v-bind="$attrs"
    :value-type="resolveColumnValueType(resolveColumn().valueType, {}, 0)"
    mode="edit"
    :model-value="value"
    :field-props="fieldProps"
    :options="options"
    @update:model-value="emit('update:value', $event)"
  />
  <FieldControl
    v-else
    v-bind="{ ...resolveControlProps(), ...$attrs }"
    @update:model-value="emit('update:value', $event)"
  >
    <template v-for="(_, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps ?? {}" />
    </template>
  </FieldControl>
</template>
