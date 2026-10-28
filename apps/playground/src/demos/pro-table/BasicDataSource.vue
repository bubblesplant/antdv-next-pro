<script setup lang="ts">
import type { ProColumns, ProTableInstance, ProTableProps } from '@bubblesjs/antdv-next-pro'
import { ProTable } from '@bubblesjs/antdv-next-pro'
import { computed, ref } from 'vue'
import { demoRows, type DemoQuery, type DemoRow } from './demoData'
const emit = defineEmits<{
  event: [message: string]
}>()
const statusEnum = {
  running: { text: '进行中', status: 'processing' },
  paused: { text: '已暂停', status: 'warning' },
  done: { text: '已完成', status: 'success' },
}
const tableRef = ref<ProTableInstance<DemoRow> | null>(null)
function announce(message: string) {
  emit('event', `使用 DataSource：${message}`)
}
const commonColumns: ProColumns<DemoRow>[] = [
  {
    title: '项目',
    dataIndex: 'project',
    valueType: 'text',
    width: 210,
    copyable: false,
  },
  {
    title: '负责人',
    dataIndex: 'owner',
    valueType: 'text',
    width: 110,
  },
  {
    title: '状态',
    dataIndex: 'status',
    valueType: 'select',
    valueEnum: statusEnum,
    filters: [
      { text: '进行中', value: 'running' },
      { text: '已暂停', value: 'paused' },
      { text: '已完成', value: 'done' },
    ],
    width: 115,
  },
  {
    title: '进度',
    dataIndex: 'progress',
    valueType: 'percent',
    sorter: true,
    search: false,
    width: 105,
  },
  {
    title: '最近更新',
    dataIndex: 'updatedAt',
    valueType: 'dateTime',
    sorter: true,
    search: false,
    width: 175,
  },
]
const localRows = ref(demoRows.slice(0, 7).map((row) => ({ ...row })))
const tableColumns: ProColumns<DemoRow>[] = commonColumns
const resolvedDataSource = computed<DemoRow[] | undefined>(() => {
  return localRows.value
})
const searchConfig: ProTableProps<DemoRow, DemoQuery>['search'] = {
  labelWidth: 'auto',
  span: 8,
  defaultCollapsed: false,
}
const toolbarConfig: ProTableProps<DemoRow, DemoQuery>['toolbar'] = { title: '本地 DataSource' }
const optionsConfig: ProTableProps<DemoRow, DemoQuery>['options'] = {
  density: true,
  fullScreen: true,
  reload: true,
  setting: true,
}
const tableBindings = computed<ProTableProps<DemoRow, DemoQuery>>(() => ({
  columns: tableColumns,
  dataSource: resolvedDataSource.value,
  rowKey: 'id',
  search: searchConfig,
  pagination: { defaultPageSize: 5, showSizeChanger: true, pageSizeOptions: [5, 10, 20] },
  options: optionsConfig,
  toolbar: toolbarConfig,
}))
function addLocalRow() {
  const id = Math.max(...localRows.value.map((row) => row.id)) + 1
  localRows.value = [
    ...localRows.value,
    { ...demoRows[0]!, id, project: `本地新增项目 ${id}`, updatedAt: '2026-08-24 16:00:00' },
  ]
  announce(`受控 dataSource 新增记录 ${id}`)
}
function resetLocalRows() {
  localRows.value = demoRows.slice(0, 7).map((row) => ({ ...row }))
  announce('受控 dataSource 已重置')
}
</script>

<template>
  <div class="scenario-demo mode-data-source" data-scenario-mode="data-source">
    <div class="demo-control-row">
      <span>受控数组当前 {{ localRows.length }} 行，不会调用 request。</span>
      <span class="button-row"
        ><button type="button" @click="resetLocalRows">重置数组</button>
        <button type="button" class="primary" @click="addLocalRow">新增一行</button></span
      >
    </div>

    <ProTable
      ref="tableRef"
      v-bind="tableBindings"
      @change="announce('分页、排序或筛选发生变化')"
    />
  </div>
</template>

<style scoped>
.scenario-demo {
  --demo-line: #d6e2ee;
  --demo-muted: #60738a;
  --demo-ink: #172b45;
  display: grid;
  gap: 16px;
  min-width: 0;
  color: var(--demo-ink);
}

.demo-control-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border: 1px solid var(--demo-line);
  border-radius: 8px;
  background: #f6f9fd;
  color: var(--demo-muted);
  font-size: 12px;
}

.button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

button,
input,
select {
  font: inherit;
}

button {
  padding: 7px 10px;
  border: 1px solid #bacbdd;
  border-radius: 6px;
  background: white;
  color: #29445f;
  cursor: pointer;
}

button:hover,
button.primary {
  border-color: #1768d3;
  background: #1768d3;
  color: white;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

input:not([type='checkbox']):not([type='range']),
select {
  min-height: 34px;
  padding: 6px 9px;
  border: 1px solid #becfe0;
  border-radius: 6px;
  background: white;
  color: var(--demo-ink);
}
</style>
