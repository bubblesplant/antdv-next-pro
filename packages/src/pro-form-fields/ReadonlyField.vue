<script setup lang="ts">
import type { VNodeChild } from 'vue'

import ProField from '../pro-field/ProField'
import type { ProReadonlyValueType } from './readonly'
import type { ProFormFieldOption } from './types'
import { useProPrefix } from '../provider/context'

defineOptions({ name: 'AntdvNextProReadonlyField', inheritAttrs: false })

const {
  value,
  options = [],
  type,
  emptyText = '-',
  moneyPrefix,
  readonlyRender,
  fieldProps,
  prefixCls,
} = defineProps<{
  value?: unknown
  options?: ProFormFieldOption[]
  type?: ProReadonlyValueType
  emptyText?: VNodeChild
  moneyPrefix?: VNodeChild | false
  readonlyRender?: (value: unknown) => VNodeChild
  fieldProps?: Record<string, unknown>
  prefixCls?: string
}>()
const prefix = useProPrefix('field', () => prefixCls)
</script>

<template>
  <ProField
    :class="`${prefix}-readonly`"
    v-bind="$attrs"
    :prefix-cls="prefix"
    :text="value"
    :value-type="type"
    mode="read"
    :options="options"
    :empty-text="emptyText"
    :field-props="{ ...fieldProps, ...(moneyPrefix === undefined ? {} : { prefix: moneyPrefix }) }"
    :render="(text, _context, dom) => readonlyRender?.(text) ?? dom"
  />
</template>
