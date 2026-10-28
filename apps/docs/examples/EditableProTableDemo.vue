<script setup lang="ts">
import { ref } from 'vue'
import {
  EditableProTable,
  type EditableConfig,
  type EditableProTableInstance,
  type ProColumns,
  type ProKey,
  type RecordCreatorProps,
} from '@bubblesjs/antdv-next-pro'

type Member = Record<string, unknown> & {
  id: number
  name: string
  role: '开发' | '设计' | '测试'
  allocation: number
  active: boolean
}

const tableRef = ref<EditableProTableInstance<Member>>()
const value = ref<Member[]>([
  { id: 1, name: '林默', role: '开发', allocation: 80, active: true },
  { id: 2, name: '周芮', role: '设计', allocation: 60, active: true },
])
const editableKeys = ref<ProKey[]>([])
const lastAction = ref('editableKeys 由 v-model 完整控制')
let sequence = 3

const columns: ProColumns<Member>[] = [
  {
    title: '成员',
    dataIndex: 'name',
    valueType: 'text',
    formItemProps: { rules: [{ required: true, message: '请输入成员姓名' }] },
  },
  {
    title: '角色',
    dataIndex: 'role',
    valueType: 'select',
    valueEnum: { 开发: '开发', 设计: '设计', 测试: '测试' },
  },
  { title: '投入比例', dataIndex: 'allocation', valueType: 'percent' },
  { title: '参与项目', dataIndex: 'active', valueType: 'switch' },
  { title: '操作', valueType: 'option', width: 160 },
]

const editable: EditableConfig<Member> = {
  type: 'multiple',
  async onSave(_key, record) {
    await new Promise((resolve) => setTimeout(resolve, 120))
    lastAction.value = `已保存「${record.name}」`
  },
}

const recordCreatorProps: RecordCreatorProps<Member> = {
  record: () => ({
    id: sequence++,
    name: '',
    role: '开发',
    allocation: 50,
    active: true,
  }),
  position: 'bottom',
  creatorButtonText: '添加成员',
  newRecordType: 'dataSource',
}

const editFirst = () => {
  const first = value.value[0]
  if (first && tableRef.value?.startEditable(first.id)) {
    lastAction.value = '正在编辑第一行'
  }
}

const patchFirst = () => {
  const first = value.value[0]
  if (first && tableRef.value?.setRowData(first.id, { allocation: 100 })) {
    lastAction.value = 'setRowData 已浅合并第一行'
  }
}
</script>

<template>
  <div class="demo-frame vp-raw">
    <p class="demo-label">LIVE · CONTROLLED VALUE + COMPONENT REF</p>
    <div class="demo-actions">
      <span>编辑中：{{ editableKeys.length ? editableKeys.join(', ') : '无' }}</span>
      <span>{{ lastAction }}</span>
      <button type="button" @click="editFirst">编辑第一行</button>
      <button type="button" @click="patchFirst">投入改为 100%</button>
    </div>
    <EditableProTable
      ref="tableRef"
      v-model:value="value"
      v-model:editable-keys="editableKeys"
      :columns="columns"
      :editable="editable"
      :record-creator-props="recordCreatorProps"
      :max-length="5"
      row-key="id"
      @values-change="lastAction = `完整 value 已更新，共 ${value.length} 行`"
      @editable-error="lastAction = '保存失败，编辑状态已保留'"
    >
      <template #header-role="{ column }"> {{ column.title }}（共享列插槽） </template>
    </EditableProTable>
  </div>
</template>

<style scoped>
.demo-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  color: #64748b;
  font-size: 12px;
}

.demo-actions button {
  padding: 5px 10px;
  border: 1px solid #bfd2e7;
  border-radius: 6px;
  background: #fff;
  color: #1768d3;
  cursor: pointer;
}
</style>
