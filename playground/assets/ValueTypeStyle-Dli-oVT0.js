var e=`<script setup lang="ts">
import type { ProColumns, ProTableInstance, ProTableProps } from '@bubblesjs/antdv-next-pro'
import { ProTable } from '@bubblesjs/antdv-next-pro'
import { h, ref } from 'vue'
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
  emit('event', \`valueType - 样式类：\${message}\`)
}
const numberRows = demoRows.slice(0, 5)
const tableColumns: ProColumns<DemoRow>[] = [
  { title: '序号', valueType: 'index', width: 65, search: false },
  { title: '边框序号', valueType: 'indexBorder', width: 85, search: false },
  { title: '项目', dataIndex: 'project', valueType: 'text', copyable: true },
  {
    title: '状态枚举',
    dataIndex: 'status',
    valueType: 'select',
    valueEnum: statusEnum,
  },
  {
    title: '标签组',
    dataIndex: 'tags',
    search: false,
    render(_dom, record) {
      return h(
        'span',
        { class: 'tag-cluster' },
        (Array.isArray(record.tags) ? record.tags : []).map((tag) =>
          h('i', { class: 'demo-tag' }, String(tag)),
        ),
      )
    },
  },
  { title: '长文本', dataIndex: 'address', valueType: 'text', ellipsis: true, search: false },
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
<\/script>

<template>
  <div class="scenario-demo mode-style-value-types" data-scenario-mode="style-value-types">
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

:deep(.tag-cluster) {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 4px;
}

:deep(.demo-tag) {
  padding: 2px 6px;
  border-radius: 999px;
  background: #e7f3ff;
  color: #1768d3;
  font-size: 10px;
  font-style: normal;
}
</style>
`;export{e as default};