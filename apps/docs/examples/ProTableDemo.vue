<script setup lang="ts">
import { ref } from 'vue'
import {
  ProTable,
  type EditableConfig,
  type ProColumns,
  type ProKey,
  type ProRequest,
  type ProTableInstance,
} from '@bubblesjs/antdv-next-pro'

type Project = Record<string, unknown> & {
  id: number
  name: string
  owner: string
  status: 'running' | 'done'
  budget: number
}

type Query = Record<string, unknown> & {
  name?: string
  owner?: string
  status?: Project['status']
  minBudget?: number
}

const projects: Project[] = [
  { id: 1, name: '增长驾驶舱', owner: '林默', status: 'running', budget: 80 },
  { id: 2, name: '会员洞察', owner: '周芮', status: 'done', budget: 45 },
  { id: 3, name: '留存预警', owner: '孟晴', status: 'running', budget: 60 },
  { id: 4, name: '区域经营', owner: '方屿', status: 'done', budget: 35 },
]

const tableRef = ref<ProTableInstance<Project>>()
const visibleRows = ref<Project[]>([])
const editableKeys = ref<ProKey[]>([])
const collapsed = ref(true)
const lastAction = ref('可展开查询区，也可通过 ref 刷新或进入编辑')

const columns: ProColumns<Project>[] = [
  { title: '#', valueType: 'indexBorder', width: 56, search: false },
  {
    title: '项目',
    dataIndex: 'name',
    valueType: 'text',
    formItemProps: { rules: [{ required: true, message: '请输入项目名称' }] },
  },
  { title: '负责人', dataIndex: 'owner', valueType: 'text' },
  {
    title: '状态',
    dataIndex: 'status',
    valueType: 'select',
    editable: false,
    valueEnum: {
      running: { text: '进行中', status: 'processing' },
      done: { text: '已完成', status: 'success' },
    },
  },
  {
    title: '最低预算',
    dataIndex: 'budget',
    valueType: 'money',
    search: { transform: (value) => ({ minBudget: value }) },
  },
]

const request: ProRequest<Project, Query> = async (params) => {
  await new Promise((resolve) => setTimeout(resolve, 180))
  const name = String(params.name ?? '').toLowerCase()
  const owner = String(params.owner ?? '').toLowerCase()
  const data = projects.filter(
    (item) =>
      (!name || item.name.toLowerCase().includes(name)) &&
      (!owner || item.owner.toLowerCase().includes(owner)) &&
      (!params.status || item.status === params.status) &&
      (!params.minBudget || item.budget >= Number(params.minBudget)),
  )
  return { data, total: data.length, success: true }
}

const editable: EditableConfig<Project> = {
  type: 'multiple',
  async onSave(_key, record) {
    await new Promise((resolve) => setTimeout(resolve, 120))
    lastAction.value = `已保存「${record.name}」`
  },
}

const editFirst = () => {
  const first = visibleRows.value[0]
  if (first && tableRef.value?.startEditable(first.id)) {
    lastAction.value = `正在编辑「${first.name}」`
  }
}

const reload = async () => {
  await tableRef.value?.reload()
  lastAction.value = '已通过组件 ref 重新请求'
}
</script>

<template>
  <div class="demo-frame vp-raw">
    <p class="demo-label">LIVE · REQUEST + EDITABLE + SLOTS</p>
    <div class="demo-actions">
      <span>{{ lastAction }}</span>
      <button type="button" @click="editFirst">编辑第一行</button>
    </div>
    <ProTable
      ref="tableRef"
      v-model:data-source="visibleRows"
      v-model:editable-keys="editableKeys"
      :columns="columns"
      :request="request"
      :editable="editable"
      row-key="id"
      :pagination="false"
      :row-selection="{}"
      :search="{ collapsed, span: 8, labelWidth: 'auto' }"
      :options="{ reload: true, setting: true }"
      @search-collapse="collapsed = $event"
      @request-error="lastAction = '请求失败，现有数据已保留'"
    >
      <template #toolbar-title> 项目清单 · {{ visibleRows.length }} 条 </template>
      <template #toolbar-actions>
        <button class="slot-button" type="button" @click="reload">ref 刷新</button>
      </template>
      <template #cell-status="{ value }">
        <span :class="['status-chip', `is-${value}`]">
          {{ value === 'running' ? '进行中' : '已完成' }}
        </span>
      </template>
    </ProTable>
  </div>
</template>

<style scoped>
.demo-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
  color: #64748b;
  font-size: 13px;
}

.demo-actions button,
.slot-button {
  padding: 5px 10px;
  border: 1px solid #bfd2e7;
  border-radius: 6px;
  background: #fff;
  color: #1768d3;
  cursor: pointer;
}

.status-chip {
  display: inline-flex;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
}

.status-chip.is-running {
  background: #e6f7f7;
  color: #087b84;
}

.status-chip.is-done {
  background: #eef5ff;
  color: #1768d3;
}
</style>
