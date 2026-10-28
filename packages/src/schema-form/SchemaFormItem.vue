<script setup lang="ts">
import type { Component } from 'vue'
import type { FormItemState } from './fieldTypes'
import { FormItem } from 'antdv-next'
import DirectSlotRenderer from '../shared/DirectSlotRenderer'
import VNodeContent from '../shared/VNodeContent'

defineOptions({ inheritAttrs: false })
defineProps<{ state: FormItemState; rootAttrs?: Record<string, unknown> }>()
const AFormItem = FormItem as Component
</script>

<template>
  <DirectSlotRenderer
    :component="AFormItem"
    :component-props="state.formItemProps"
    :content="state.content"
    :root-attrs="rootAttrs"
    :use-content="state.hasContent"
  >
    <span v-if="state.defaultControl?.disabled" class="antdv-next-pro-schema-readonly">
      <VNodeContent :content="state.defaultControl.readonlyValue" />
    </span>
    <component
      :is="state.defaultControl.component"
      v-else-if="state.defaultControl?.component"
      v-bind="state.defaultControl.componentProps"
    />
  </DirectSlotRenderer>
</template>
