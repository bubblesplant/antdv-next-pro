<script setup lang="ts">
import { ref } from 'vue'
import { Button, Space } from 'antdv-next'
import { AdaptiveProTable, type ProColumns, type ProTableInstance } from '@bubblesjs/antdv-next-pro'

interface Project extends Record<string, unknown> {
  id: number
  name: string
  owner: string
  department: string
  status: string
}

const table = ref<ProTableInstance<Project>>()
const height = ref(600)
const empty = ref(false)
const message = ref('调整容器高度或展开查询条件，观察表体高度变化。')
const rows: Project[] = Array.from({ length: 40 }, (_, index) => ({
  id: index + 1,
  name: `项目 ${index + 1}`,
  owner: ['林默', '周芮', '孟晴'][index % 3]!,
  department: ['数据产品', '研发平台'][index % 2]!,
  status: index % 3 === 0 ? 'done' : 'running',
}))
const columns: ProColumns<Project>[] = [
  { title: '项目名称', dataIndex: 'name', width: 240 },
  { title: '负责人', dataIndex: 'owner', width: 160 },
  { title: '所属部门', dataIndex: 'department', width: 220 },
  {
    title: '状态',
    dataIndex: 'status',
    width: 160,
    valueType: 'select',
    valueEnum: {
      running: { text: '进行中', status: 'processing' },
      done: { text: '已完成', status: 'success' },
    },
  },
]

async function reload() {
  await table.value?.reload()
  message.value = '已通过 ProTableInstance.reload() 刷新。'
}
</script>

<template>
  <div class="demo-frame vp-raw">
    <Space wrap class="adaptive-doc-actions">
      <Button @click="height = height === 600 ? 760 : 600">切换高度：{{ height }}px</Button>
      <Button @click="empty = !empty">{{ empty ? '恢复数据' : '清空数据' }}</Button>
    </Space>
    <p class="adaptive-doc-hint">{{ message }}</p>
    <div :style="{ height: `${height}px`, minHeight: 0 }">
      <AdaptiveProTable
        ref="table"
        :columns="columns"
        :data-source="empty ? [] : rows"
        row-key="id"
        header-title="项目清单"
        :search="{ defaultCollapsed: true, span: 12 }"
        :pagination="{ defaultPageSize: 20 }"
        :scroll="{ x: 780, y: '100%' }"
        @search-collapse="message = $event ? '已收起查询条件。' : '已展开查询条件，表体自动缩小。'"
      >
        <template #toolbar-actions><Button @click="reload">刷新数据</Button></template>
        <template #cell-name="{ record }"
          ><strong>{{ record.name }}</strong></template
        >
      </AdaptiveProTable>
    </div>
  </div>
</template>

<style scoped>
.adaptive-doc-actions {
  margin-bottom: 8px;
}

.adaptive-doc-hint {
  margin: 0 0 16px;
  color: var(--vp-c-text-2);
  font-size: 13px;
}
</style>
