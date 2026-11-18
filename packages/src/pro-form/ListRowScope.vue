<script setup lang="ts">
import { computed, provide } from 'vue'
import { proFormListContextKey, proFormNamePathKey } from './context'

import { listRowScopeProps } from './componentProps'

defineOptions({ name: 'ProFormListRow' })
const { path: propPath, index: propIndex, rowKey: propRowKey } = defineProps(listRowScopeProps)

provide(
  proFormNamePathKey,
  computed(() => [...propPath, propIndex]),
)
provide(proFormListContextKey, {
  index: computed(() => propIndex),
  key: propRowKey,
  listName: computed(() => propPath),
})
</script>

<template>
  <slot />
</template>
