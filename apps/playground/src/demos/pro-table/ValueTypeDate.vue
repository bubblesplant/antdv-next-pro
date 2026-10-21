<script setup lang="ts">
import type { ProColumns, ProTableInstance, ProTableProps } from '@bubblesjs/antv-next-pro'
import { ProTable } from '@bubblesjs/antv-next-pro'
import { ref } from 'vue'
import { demoRows, type DemoQuery, type DemoRow } from './demoData'
const emit = defineEmits<{
  event: [message: string]
}>()
const tableRef = ref<ProTableInstance<DemoRow> | null>(null)
function announce(message: string) {
  emit('event', `valueType - 日期类：${message}`)
}
const dateRows = demoRows.slice(0, 3).map((row, index) => ({
  ...row,
  dateRange: [`2026-08-${String(10 + index).padStart(2, '0')}`, `2026-08-${15 + index}`],
  dateTimeRange: [row.updatedAt, `2026-08-${20 + index} 18:00:00`],
  timeRange: [row.time, '20:30:00'],
}))
const tableColumns: ProColumns<DemoRow>[] = [
  { title: '#', valueType: 'indexBorder', width: 56, search: false },
  { title: '日期', dataIndex: 'createdAt', valueType: 'date', width: 130 },
  { title: '日期时间', dataIndex: 'updatedAt', valueType: 'dateTime', width: 190 },
  { title: '日期范围', dataIndex: 'dateRange', valueType: 'dateRange', width: 220 },
  { title: '日期时间范围', dataIndex: 'dateTimeRange', valueType: 'dateTimeRange', width: 280 },
  { title: '时间', dataIndex: 'time', valueType: 'time', width: 120 },
  { title: '时间范围', dataIndex: 'timeRange', valueType: 'timeRange', width: 210 },
]
const resolvedDataSource: DemoRow[] | undefined = dateRows
const searchConfig: ProTableProps<DemoRow, DemoQuery>['search'] = {
  labelWidth: 'auto',
  span: 12,
  defaultCollapsed: false,
}
const toolbarConfig: ProTableProps<DemoRow, DemoQuery>['toolbar'] = { title: '项目清单' }
const optionsConfig: ProTableProps<DemoRow, DemoQuery>['options'] = {
  density: true,
  fullScreen: true,
  reload: true,
  setting: true,
}
const tableBindings: ProTableProps<DemoRow, DemoQuery> = {
  columns: tableColumns,
  dataSource: resolvedDataSource,
  rowKey: 'id',
  search: searchConfig,
  pagination: false,
  options: optionsConfig,
  toolbar: toolbarConfig,
  scroll: { x: 1150 },
}
</script>

<template>
  <div class="scenario-demo mode-date-value-types" data-scenario-mode="date-value-types">
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

button:hover {
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
