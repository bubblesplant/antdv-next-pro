<script setup lang="ts">
import { provide } from 'vue'
import type { ProFormInstance } from './types'
import type { FormRecord } from '../schema-form/utils'
import { formProviderKey } from './providerContext'

defineOptions({ name: 'ProFormProvider' })
const { onFormChange, onFormFinish } = defineProps<{
  onFormChange?: (
    name: string,
    info: { changedValues: FormRecord; forms: Record<string, ProFormInstance> },
  ) => void
  onFormFinish?: (
    name: string,
    info: { values: FormRecord; forms: Record<string, ProFormInstance> },
  ) => void
}>()

const forms: Record<string, ProFormInstance> = {}
provide(formProviderKey, {
  register(name, form) {
    forms[name] = form
    return () => {
      if (forms[name] === form) delete forms[name]
    }
  },
  change(name, changedValues) {
    onFormChange?.(name, { changedValues, forms: { ...forms } })
  },
  finish(name, values) {
    onFormFinish?.(name, { values, forms: { ...forms } })
  },
})
</script>

<template><slot /></template>
