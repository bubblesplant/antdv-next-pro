<script setup lang="ts">
import { computed, inject } from 'vue'
import { normalizePath, setValue } from '../schema-form/utils'
import type { FormRecord } from '../schema-form/utils'
import { proFormNamePathKey, useProFormContext } from './context'

import { proFormDependencyProps } from './componentProps'

defineOptions({ name: 'ProFormDependency' })
const { name: propName, ignoreFormListField: propIgnoreFormListField } =
  defineProps(proFormDependencyProps)
defineSlots<{ default?: (props: FormRecord & { form: typeof form }) => unknown }>()

const form = useProFormContext()
const prefix = inject(
  proFormNamePathKey,
  computed<Array<string | number>>(() => []),
)
const slotValues = computed<FormRecord & { form: typeof form }>(() => {
  const values: FormRecord = {}
  for (const name of propName) {
    const path = normalizePath(name)
    const full = propIgnoreFormListField ? path : [...prefix.value, ...path]
    setValue(values, path, form?.getFieldValue(full))
  }
  return { ...values, form }
})
</script>

<template>
  <slot v-bind="slotValues" />
</template>
