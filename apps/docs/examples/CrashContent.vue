<script setup lang="ts">
const { fail = false } = defineProps<{ fail?: boolean }>()

function content() {
  if (fail) throw new Error('这是用于演示恢复流程的错误。')
  return '内容正常，点击“触发错误”查看自定义降级界面。'
}
</script>

<template>
  <p data-demo-boundary-content>{{ content() }}</p>
</template>
