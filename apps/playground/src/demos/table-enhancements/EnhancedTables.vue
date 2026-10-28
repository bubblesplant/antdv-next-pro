<script setup lang="ts">
import { ref } from 'vue'
import { Button, Space } from 'antdv-next'
import {
  CellEditorTable,
  DragSortTable,
  RowEditorTable,
  type EditableConfig,
  type ProColumns,
  type ProKey,
  type ProTableInstance,
} from '@bubblesjs/antdv-next-pro'

interface Task extends Record<string, unknown> {
  id: number
  name: string
  priority: number
}
const initial: Task[] = [
  { id: 1, name: '编写示例', priority: 1 },
  { id: 2, name: '交互验收', priority: 2 },
  { id: 3, name: '整理文档', priority: 3 },
]
const columns: ProColumns<Task>[] = [
  {
    title: '任务',
    dataIndex: 'name',
    formItemProps: { rules: [{ required: true, message: '请输入任务名称' }] },
  },
  { title: '优先级', dataIndex: 'priority', valueType: 'digit', fieldProps: { min: 1, max: 5 } },
]
const dragRows = ref(initial.map((row) => ({ ...row })))
const rowRows = ref(initial.map((row) => ({ ...row })))
const cellRows = ref(initial.map((row) => ({ ...row })))
const rowAction = ref<ProTableInstance<Task>>()
const cellAction = ref<ProTableInstance<Task>>()
const feedback = ref('拖动手柄排序；也可以聚焦手柄后按上下方向键。')
const editable: EditableConfig<Task> = {
  type: 'single',
  onSave: async (_key, record) => {
    feedback.value = `已保存任务：${record.name}`
    return true
  },
}
function dragEnd(from: number, to: number, rows: Task[]) {
  feedback.value = `第 ${from + 1} 项移至第 ${to + 1} 项；当前顺序：${rows.map((row) => row.name).join('、')}`
}
function begin(_key: ProKey, record: Task) {
  feedback.value = `正在编辑：${record.name}`
}
function end(_key: ProKey, record: Task) {
  feedback.value = `编辑结束：${record.name}`
}
</script>

<template>
  <div class="enhanced-demo" data-demo="table-enhancements">
    <section data-demo-drag-table>
      <h3>拖动排序</h3>
      <p>拖动行首手柄，或聚焦手柄后按 ↑ / ↓。排序结果保存在当前页面。</p>
      <DragSortTable
        v-model:data-source="dragRows"
        row-key="id"
        :columns="columns"
        :search="false"
        :options="false"
        :pagination="false"
        :tool-bar-render="false"
        @drag-sort-end="dragEnd"
      />
    </section>
    <section data-demo-row-table>
      <h3>行编辑</h3>
      <p>双击一行进入编辑，焦点离开当前行后保存；按钮也可启动、保存和取消。</p>
      <Space class="actions">
        <Button data-demo-row-start @click="rowAction?.startEditable(1)">编辑第一行</Button>
        <Button data-demo-row-save @click="rowAction?.saveEditable(1)">保存第一行</Button>
        <Button data-demo-row-cancel @click="rowAction?.cancelEditable(1)">取消编辑</Button>
      </Space>
      <RowEditorTable
        ref="rowAction"
        v-model:data-source="rowRows"
        row-key="id"
        :columns="columns"
        :editable="editable"
        :search="false"
        :options="false"
        :pagination="false"
        :tool-bar-render="false"
        :on-row-edit-start="begin"
        :on-row-edit-end="end"
      />
    </section>
    <section data-demo-cell-table>
      <h3>单元格编辑</h3>
      <p>双击名称或优先级，只编辑当前单元格；切换单元格时先保存并校验。</p>
      <Space class="actions">
        <Button data-demo-cell-start @click="cellAction?.startEditable(1)">编辑首个单元格</Button>
        <Button data-demo-cell-save @click="cellAction?.saveEditable(1)">保存第一行</Button>
        <Button data-demo-cell-cancel @click="cellAction?.cancelEditable(1)">取消编辑</Button>
      </Space>
      <CellEditorTable
        ref="cellAction"
        v-model:data-source="cellRows"
        row-key="id"
        :columns="columns"
        :editable="editable"
        :search="false"
        :options="false"
        :pagination="false"
        :tool-bar-render="false"
        :on-row-edit-start="begin"
        :on-row-edit-end="end"
      />
    </section>
    <p data-demo-enhanced-state aria-live="polite">{{ feedback }}</p>
  </div>
</template>

<style scoped>
.enhanced-demo {
  display: grid;
  gap: 28px;
}
h3 {
  margin-block: 0 8px;
}
p {
  margin-block: 0 16px;
}
.actions {
  margin-block-end: 12px;
}
</style>
