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
  emit('event', `valueType - 数字类：${message}`)
}
const numberRows = demoRows.slice(0, 5)
const tableColumns: ProColumns<DemoRow>[] = [
  { title: '项目', dataIndex: 'project', valueType: 'text', width: 210 },
  { title: '访问量', dataIndex: 'visits', valueType: 'digit', sorter: true },
  { title: '预算', dataIndex: 'budget', valueType: 'money', sorter: true },
  { title: '完成度', dataIndex: 'progress', valueType: 'percent', sorter: true },
  { title: '评分', dataIndex: 'score', valueType: 'digit', sorter: true },
]
const resolvedDataSource: DemoRow[] | undefined = numberRows
const searchConfig: ProTableProps<DemoRow, DemoQuery>['search'] = {
  labelWidth: 'auto',
  span: 8,
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
}
</script>

<template>
  <div class="scenario-demo mode-number-value-types" data-scenario-mode="number-value-types">
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
