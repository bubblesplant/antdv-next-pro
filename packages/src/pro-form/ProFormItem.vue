<script setup lang="ts">
import { FormItem } from 'antdv-next'
import { cloneVNode, h, useAttrs, useSlots } from 'vue'
import { useProFormContext, useProFormNamePath } from './context'

import { flattenChildren } from './utils'
import ProField from '../pro-field/ProField'
import VNodeContent from '../shared/VNodeContent'

import { proFormItemProps } from './componentProps'

defineOptions({ name: 'ProFormItem', inheritAttrs: false })
const {
  name: propName,
  readonly: propReadonly,
  valueType: propValueType,
} = defineProps(proFormItemProps)

const attrs = useAttrs()
const slots = useSlots()

const form = useProFormContext()
const path = useProFormNamePath(() => propName)
const renderContent = () =>
  h(
    FormItem,
    {
      ...attrs,
      ...(form?.ignoreRules.value && { rules: undefined }),
      name: propName === undefined ? undefined : path.value,
    },
    {
      ...slots,
      default: () => {
        const children = flattenChildren(
          slots.default?.({ value: form?.getFieldValue(path.value), form }),
        )
        if (propName === undefined || !form) return children
        if (propReadonly ?? form.readonly.value)
          return h(ProField, {
            text: form.getFieldValue(path.value),
            valueType: propValueType,
            mode: 'read',
          })
        return children.map((node, index) =>
          index > 0
            ? node
            : cloneVNode(node, {
                value: form.getFieldValue(path.value),
                'onUpdate:value': (value: unknown) => form.setFieldValue(path.value, value),
              }),
        )
      },
    },
  )
</script>

<template>
  <VNodeContent :content="renderContent()" />
</template>
