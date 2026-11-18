<script setup lang="ts">
import type { VNodeChild } from 'vue'
import ProCardBase from '../ProCard.vue'
import type { ProCardProps } from '../types'

/** Historical TabPane adapter. Prefer tabs.items for new usage. */
defineOptions({ name: 'ProCardTabPane', inheritAttrs: false })
const { cardProps } = defineProps<{ tab?: VNodeChild; cardProps?: ProCardProps }>()
</script>

<template>
  <ProCardBase v-bind="{ ...cardProps, ...$attrs }">
    <template v-for="(_, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps || {}" />
    </template>
  </ProCardBase>
</template>
