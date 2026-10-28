<script setup lang="ts">
import { ref } from 'vue'
import { Button, Space } from 'antdv-next'
import {
  EditableProTable,
  type EditableProTableInstance,
  type ProColumns,
  type ProKey,
} from '@bubblesjs/antdv-next-pro'

interface Task extends Record<string, unknown> {
  id: string
  name: string
  owner: string
  progress: number
  children?: Task[]
}

const rows = ref<Task[]>([
  {
    id: 'website',
    name: '官网升级',
    owner: '林默',
    progress: 72,
    children: [
      { id: 'design', name: '设计规范', owner: '周芮', progress: 100 },
      { id: 'frontend', name: '前端开发', owner: '林默', progress: 65 },
    ],
  },
  { id: 'platform', name: '数据平台', owner: '程一', progress: 48 },
])
const table = ref<EditableProTableInstance<Task>>()
const editableKeys = ref<ProKey[]>([])
const feedback = ref('展开「官网升级」可以编辑子任务，也可以向它添加子任务。')
let sequence = 1

const columns: ProColumns<Task>[] = [
  {
    title: '任务名称',
    dataIndex: 'name',
    width: 280,
    formItemProps: { rules: [{ required: true, message: '请输入任务名称' }] },
  },
  { title: '负责人', dataIndex: 'owner', width: 160 },
  { title: '完成进度', dataIndex: 'progress', valueType: 'percent', width: 140 },
  { title: '操作', valueType: 'option', width: 180 },
]

function addTask(parentKey?: string) {
  const added = table.value?.addEditRecord(
    { id: `new-${sequence++}`, name: '', owner: '林默', progress: 0 },
    { parentKey, position: 'bottom', newRecordType: 'dataSource' },
  )
  feedback.value = added
    ? parentKey
      ? '子任务已加入「官网升级」，展开父任务后填写并保存。'
      : '已添加根任务，请填写后保存。'
    : '添加失败：最多允许 10 个任务。'
}
</script>

<template>
  <div>
    <Space wrap style="margin-bottom: 16px">
      <Button type="primary" @click="addTask('website')">添加子任务</Button>
      <Button @click="addTask()">添加根任务</Button>
    </Space>
    <EditableProTable
      ref="table"
      v-model:value="rows"
      v-model:editable-keys="editableKeys"
      :columns="columns"
      row-key="id"
      :editable="{
        type: 'multiple',
        onSave: (_key, record) => {
          feedback = `已保存「${record.name}」`
        },
      }"
      :record-creator-props="false"
      :max-length="10"
      :scroll="{ x: 760 }"
    />
    <p class="feedback" role="status">{{ feedback }}</p>
  </div>
</template>

<style scoped>
.feedback {
  margin: 16px 0 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.8;
}
</style>
