<script setup lang="ts">
import type { CompositeState, FieldProps } from './fieldTypes'
import { Row } from 'antdv-next'
import { mergeProps } from 'vue'
import VNodeContent from '../shared/VNodeContent'
import SchemaFormChildren from './SchemaFormChildren.vue'
import { schemaChildren } from './utils'
import { useFormPrefix } from '../pro-form/utils'

defineOptions({ inheritAttrs: false })
defineProps<{
  context: FieldProps
  state: CompositeState
  rootAttrs: Record<string, unknown>
}>()
const { prefix } = useFormPrefix('form-group', () => undefined)
</script>

<template>
  <div
    v-if="state.hasContent"
    v-bind="mergeProps({ class: ['antdv-next-pro-dependency', `${prefix}-dependency`] }, rootAttrs)"
  >
    <VNodeContent :content="state.content" />
  </div>
  <fieldset
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
        rootAttrs,
      )
    "
  >
    <legend
      v-if="context.column.title"
      class="antdv-next-pro-schema-group-title"
      :class="`${prefix}-title`"
    >
      <VNodeContent :content="state.title" />
    </legend>
    <Row
      v-if="context.grid"
      v-bind="{ gutter: 16, ...context.column.rowProps }"
      :class="`${prefix}-container`"
    >
      <SchemaFormChildren :columns="schemaChildren(context.column)" :context="context" />
    </Row>
    <div v-else :class="`${prefix}-container`">
      <SchemaFormChildren :columns="schemaChildren(context.column)" :context="context" />
    </div>
  </fieldset>
</template>
