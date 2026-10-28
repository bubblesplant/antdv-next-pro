<script setup lang="ts">
import { ref } from 'vue'
import { Button, Space } from 'antdv-next'
import {
  ProDescriptions,
  type ProDescriptionsColumn,
  type ProDescriptionsInstance,
  type ProKey,
} from '@bubblesjs/antdv-next-pro'

interface ProjectDetails extends Record<string, unknown> {
  name: string
  owner: string
  status: string
  budget: number
  createdAt: string
  notes: string
}

const action = ref<ProDescriptionsInstance<ProjectDetails>>()
const server = ref<ProjectDetails>({
  name: '组件升级计划',
  owner: '林晓',
  status: 'active',
  budget: 16800,
  createdAt: '2026-10-21',
  notes: '先完成示例，再安排团队验收。',
})
const requests = ref(0)
const feedback = ref('点击字段旁的编辑图标；清空项目名称后保存可查看校验。')
const columns: ProDescriptionsColumn<ProjectDetails>[] = [
  {
    title: '项目名称',
    dataIndex: 'name',
    formItemProps: { rules: [{ required: true, message: '请输入项目名称' }] },
  },
  { title: '负责人', dataIndex: 'owner' },
  {
    title: '状态',
    dataIndex: 'status',
    valueType: 'select',
    valueEnum: {
      active: { text: '进行中', status: 'Processing' },
      done: { text: '已完成', status: 'Success' },
      pending: { text: '待开始', status: 'Default' },
    },
  },
  { title: '预算', dataIndex: 'budget', valueType: 'money', editable: false },
  { title: '创建日期', dataIndex: 'createdAt', valueType: 'date', editable: false },
  { title: '备注', dataIndex: 'notes', valueType: 'textarea' },
]

async function request() {
  requests.value++
  return { data: { ...server.value }, success: true }
}
async function save(_key: ProKey, record: ProjectDetails) {
  server.value = { ...record }
  feedback.value = `已保存：${record.name} · ${record.owner}`
  return true
}
</script>

<template>
  <div class="descriptions-demo" data-demo="pro-descriptions">
    <ProDescriptions
      ref="action"
      title="项目详情"
      tooltip="通过 request 获取详情，逐字段编辑并保存。"
      :columns="columns"
      :request="request"
      :editable="{ type: 'single', onSave: save }"
      :column="{ xs: 1, sm: 2 }"
      bordered
      @editable-error="feedback = '请检查字段内容后重试。'"
    >
      <template #extra>
        <Space>
          <Button data-demo-descriptions-edit @click="action?.startEditable('name')"
            >编辑名称</Button
          >
          <Button data-demo-descriptions-reload @click="action?.reload()">重新加载</Button>
        </Space>
      </template>
    </ProDescriptions>
    <p data-demo-descriptions-state aria-live="polite">已加载 {{ requests }} 次。{{ feedback }}</p>
    <pre data-demo-descriptions-data>{{ JSON.stringify(server, null, 2) }}</pre>
  </div>
</template>

<style scoped>
.descriptions-demo {
  display: grid;
  gap: 16px;
}
p {
  margin: 0;
}
pre {
  margin: 0;
  overflow: auto;
  padding: 16px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
}
</style>
