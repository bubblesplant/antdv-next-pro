<script setup lang="ts">
import { Badge } from 'antdv-next'

defineOptions({ name: 'FieldStatusBadge', inheritAttrs: false })
const { status, color } = defineProps<{
  status?: 'success' | 'error' | 'processing' | 'default' | 'warning'
  color?: string
}>()
</script>

<template>
  <Badge v-bind="$attrs" :status="status" :color="color">
    <template #text
      ><span><slot /></span
    ></template>
  </Badge>
</template>
