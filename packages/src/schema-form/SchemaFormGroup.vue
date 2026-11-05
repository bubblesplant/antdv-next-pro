<script setup lang="ts">
import type { CompositeState, FieldProps } from './fieldTypes'
import { Row } from 'antdv-next'
import { computed, mergeProps } from 'vue'
import { ProFormGroup } from '../pro-form/structure'
import VNodeContent from '../shared/VNodeContent'
import SchemaFormChildren from './SchemaFormChildren.vue'
import { schemaChildren } from './utils'
import { useFormPrefix } from '../pro-form/utils'

defineOptions({ inheritAttrs: false })
const props = defineProps<{
  context: FieldProps
  state: CompositeState
  rootAttrs: Record<string, unknown>
}>()
const { prefix } = useFormPrefix('form-group', () => undefined)
const groupProps = computed(() => {
  const fieldProps = props.context.column.fieldProps
  return (typeof fieldProps === 'function' ? fieldProps(props.context.model) : fieldProps) ?? {}
})
</script>

<template>
  <div
    v-if="state.hasContent"
    v-bind="mergeProps({ class: ['antdv-next-pro-dependency', `${prefix}-dependency`] }, rootAttrs)"
  >
    <VNodeContent :content="state.content" />
  </div>
  <ProFormGroup
    v-else
    v-bind="
      mergeProps(
        {
          class: [
            'antdv-next-pro-schema-group',
            prefix,
            `antdv-next-pro-schema-${context.column.valueType ?? 'group'}`,
          ],
        },
        groupProps,
        rootAttrs,
      )
    "
    :title="state.title"
    :tooltip="context.column.tooltip"
    :extra="context.column.extra"
  >
    <Row
      v-if="context.grid"
      v-bind="{ gutter: 16, ...context.column.rowProps }"
      :class="`${prefix}-container`"
    >
      <SchemaFormChildren :columns="schemaChildren(context.column)" :context="context" />
    </Row>
    <template v-else>
      <SchemaFormChildren :columns="schemaChildren(context.column)" :context="context" />
    </template>
  </ProFormGroup>
</template>
