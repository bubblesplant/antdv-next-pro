<script setup lang="ts">
import type { VNodeChild } from 'vue'
import VNodeContent from '../shared/VNodeContent'

defineOptions({ name: 'AntdvNextProRenderNode' })
defineProps<{ content?: VNodeChild }>()
</script>

<template>
  <VNodeContent :content="content" />
</template>
