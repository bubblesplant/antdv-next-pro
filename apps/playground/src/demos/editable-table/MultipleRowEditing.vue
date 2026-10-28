<script setup lang="ts">
import { ref } from 'vue'
import { Button } from 'antdv-next'
import {
  EditableProTable,
  type EditableConfig,
  type EditableProTableInstance,
  type ProColumns,
  type ProKey,
  type RecordCreatorProps,
} from '@bubblesjs/antdv-next-pro'

interface Member extends Record<string, unknown> {
  id: number
  name: string
  role: string
  allocation: number
  active: boolean
}

const rows = ref<Member[]>([
  { id: 101, name: '林默', role: '前端', allocation: 80, active: true },
  { id: 102, name: '周芮', role: '设计', allocation: 60, active: true },
  { id: 103, name: '孟晴', role: '测试', allocation: 40, active: false },
])
const editableKeys = ref<ProKey[]>([])
const table = ref<EditableProTableInstance<Member>>()
const feedback = ref('点击行内「编辑」，或添加一位新成员。')
let sequence = 104

const columns: ProColumns<Member>[] = [
  {
    title: '成员',
    dataIndex: 'name',
    width: 180,
    formItemProps: { rules: [{ required: true, message: '请输入成员姓名' }] },
  },
  {
    title: '角色',
    dataIndex: 'role',
    valueType: 'select',
    width: 150,
    valueEnum: { 前端: '前端', 设计: '设计', 测试: '测试' },
  },
  { title: '投入比例', dataIndex: 'allocation', valueType: 'percent', width: 150 },
  { title: '参与项目', dataIndex: 'active', valueType: 'switch', width: 120 },
  { title: '操作', valueType: 'option', width: 180 },
]

const editable: EditableConfig<Member> = {
  type: 'multiple',
  async onSave(_key, record) {
    await new Promise((resolve) => setTimeout(resolve, 180))
    feedback.value = `已保存成员「${record.name}」`
  },
  onCancel(_key, record) {
    feedback.value = `已取消「${record.name}」的修改`
  },
  onDelete(_key, record) {
    feedback.value = `已删除成员「${record.name}」`
    return true
  },
}

const creator: RecordCreatorProps<Member> = {
  record: () => ({ id: sequence++, name: '', role: '前端', allocation: 50, active: true }),
  newRecordType: 'dataSource',
  position: 'bottom',
  creatorButtonText: '添加项目成员',
}
</script>

<template>
  <div>
    <Button style="margin-bottom: 16px" @click="rows[0] && table?.startEditable(rows[0].id)"
      >编辑第一行</Button
    >
    <EditableProTable
      ref="table"
      v-model:value="rows"
      v-model:editable-keys="editableKeys"
      :columns="columns"
      row-key="id"
      :editable="editable"
      :record-creator-props="creator"
      :max-length="6"
      :scroll="{ x: 780 }"
    />
    <p class="feedback" role="status">{{ feedback }} 当前 {{ rows.length }} 位成员，最多 6 位。</p>
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
