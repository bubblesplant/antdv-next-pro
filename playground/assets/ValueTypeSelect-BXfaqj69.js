var e=`<script setup lang="ts">
import type { ProColumns, ProTableInstance, ProTableProps } from '@bubblesjs/antdv-next-pro'
import { ProTable } from '@bubblesjs/antdv-next-pro'
import { ref } from 'vue'
import { demoRows, type DemoQuery, type DemoRow } from './demoData'
const emit = defineEmits<{
  event: [message: string]
}>()
const categoryEnum = {
  growth: '增长',
  experience: '体验',
  efficiency: '效能',
}
const priorityEnum = {
  high: { text: '高', status: 'error' },
  medium: { text: '中', status: 'warning' },
  low: { text: '低', status: 'default' },
}
const tableRef = ref<ProTableInstance<DemoRow> | null>(null)
function announce(message: string) {
  emit('event', \`valueType - 选择类：\${message}\`)
}
const selectRows = demoRows.slice(0, 5).map((row, index) => ({
  ...row,
  reviewer: ['lin', 'zhou', 'meng'][index % 3],
}))
const tableColumns: ProColumns<DemoRow>[] = [
  { title: '项目', dataIndex: 'project', valueType: 'text', width: 210 },
  { title: 'Select', dataIndex: 'category', valueType: 'select', valueEnum: categoryEnum },
  { title: 'Radio', dataIndex: 'priority', valueType: 'radio', valueEnum: priorityEnum },
  {
    title: 'Checkbox',
    dataIndex: 'tags',
    valueType: 'checkbox',
    valueEnum: { 分析: '分析', 增长: '增长', 渠道: '渠道', 体验: '体验' },
  },
  { title: 'Switch', dataIndex: 'enabled', valueType: 'switch' },
  {
    title: '异步选择',
    dataIndex: 'reviewer',
    valueType: 'select',
    request: async () => {
      await new Promise((resolve) => setTimeout(resolve, 180))
      return [
        { label: '林默', value: 'lin' },
        { label: '周芮', value: 'zhou' },
        { label: '孟晴', value: 'meng' },
      ]
    },
  },
]
const resolvedDataSource: DemoRow[] | undefined = selectRows
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
  scroll: { x: 1150 },
}
<\/script>

<template>
  <div class="scenario-demo mode-select-value-types" data-scenario-mode="select-value-types">
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
`;export{e as default};