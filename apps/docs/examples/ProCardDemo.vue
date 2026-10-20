<script setup lang="ts">
import { ProCard } from '@bubblesjs/antv-next-pro'
import { Button, Input, Switch } from 'antdv-next'
import { ref } from 'vue'

const collapsed = ref(false)
const loading = ref(false)
const note = ref('折叠再展开，输入内容仍会保留')
</script>

<template>
  <div class="demo-frame vp-raw">
    <div class="card-demo-controls">
      <span>加载状态 <Switch v-model:checked="loading" aria-label="加载状态" /></span>
      <Button @click="collapsed = !collapsed">{{ collapsed ? '展开' : '收起' }}</Button>
    </div>
    <ProCard
      v-model:collapsed="collapsed"
      title="用户概览"
      sub-title="本月"
      tooltip="展示当前筛选范围内的用户信息"
      variant="borderless"
      collapsible
      :loading="loading"
    >
      <template #extra><Button type="link" @click="note = ''">清空备注</Button></template>
      <Input v-model:value="note" aria-label="备注" placeholder="输入备注" />
    </ProCard>
  </div>
</template>

<style scoped>
.card-demo-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-block-end: 16px;
}

.card-demo-controls span {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
</style>
