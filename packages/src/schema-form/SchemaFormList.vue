<script setup lang="ts">
import type { FieldProps, FormListState } from './fieldTypes'
import type { FormRecord } from './utils'
import type { ProFormListProps } from '../pro-form/types'
import { Row } from 'antdv-next'
import { computed, provide } from 'vue'
import ProForm from '../pro-form/ProForm'
import { ProFormList } from '../pro-form/structure'
import { proFormNamePathKey, useProFormContext } from '../pro-form/context'
import SchemaFormChildren from './SchemaFormChildren.vue'
import SchemaFormContainer from './SchemaFormContainer.vue'
import { getValue, schemaChildren } from './utils'

defineOptions({ inheritAttrs: false })
const { context, state } = defineProps<{
  context: FieldProps
  state: FormListState
  rootAttrs: Record<string, unknown>
}>()
const form = useProFormContext()
provide(
  proFormNamePathKey,
  computed(() => []),
)
const FormContainer = form ? SchemaFormContainer : ProForm
const creatorRecord = computed(() => {
  const value = state.fieldProps.creatorRecord ?? state.fieldProps.initialValue
  return typeof value === 'function'
    ? (value as () => FormRecord)
    : value && typeof value === 'object' && !Array.isArray(value)
      ? (value as FormRecord)
      : {}
})
const listProps = computed(() => {
  const { initialValue: _initial, creatorButtonText: _text, ...rest } = state.fieldProps
  const button = rest.creatorButtonProps
  return {
    ...rest,
    creatorButtonProps: (button === false
      ? false
      : {
          creatorButtonText: state.creatorText,
          ...(button && typeof button === 'object' ? button : {}),
        }) as ProFormListProps['creatorButtonProps'],
  }
})
function updateModel(values: FormRecord) {
  if (!form) context.onValueChange(state.path, getValue(values, state.path))
}
</script>

<template>
  <component
    :is="FormContainer"
    :model-value="form ? undefined : context.model"
    :readonly="context.readonly"
    :submitter="false"
    @update:model-value="updateModel"
  >
    <ProFormList
      v-bind="{ ...listProps, ...rootAttrs }"
      :name="state.path"
      :label="state.title"
      :creator-record="creatorRecord"
      class="antdv-next-pro-form-list"
      :classes="{ item: 'antdv-next-pro-form-list-row' }"
    >
      <template #default="{ index }">
        <component
          :is="context.grid ? Row : 'div'"
          v-bind="context.grid ? { gutter: 16 } : {}"
          class="antdv-next-pro-form-list-fields"
        >
          <SchemaFormChildren
            :columns="schemaChildren(context.column)"
            :context="context"
            :prefix="[...state.path, index]"
          />
        </component>
      </template>
    </ProFormList>
  </component>
</template>
