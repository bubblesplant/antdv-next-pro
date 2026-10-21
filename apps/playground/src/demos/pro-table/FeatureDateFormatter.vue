<script setup lang="ts">
import type { ProColumns, ProTableInstance, ProTableProps } from '@bubblesjs/antv-next-pro'
import { ProTable } from '@bubblesjs/antv-next-pro'
import { computed, ref } from 'vue'
import { createDemoRequest, type DemoQuery, type DemoRow } from './demoData'
const emit = defineEmits<{
  event: [message: string]
}>()
const tableRef = ref<ProTableInstance<DemoRow> | null>(null)
const requestCount = ref(0)
const lastRequest = ref('')
const loadedTotal = ref(0)
const requestFailure = ref('')
const requestLabels = { requests: '次请求', matches: '条匹配', waiting: '等待请求' }
const request = createDemoRequest((params, sort, filter) => {
  requestCount.value += 1
  const visibleParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== ''),
  )
  lastRequest.value = JSON.stringify({ params: visibleParams, sort, filter })
})
function announce(message: string) {
  emit('event', `dateFormatter - 日期格式化：${message}`)
}
function handleLoad(_rows: DemoRow[], total: number) {
  loadedTotal.value = total
  requestFailure.value = ''
}
function handleRequestError(error: unknown) {
  requestFailure.value = error instanceof Error ? error.message : String(error)
  announce(`请求失败：${requestFailure.value}`)
}
const dateFormat = ref<'string' | 'number' | 'raw' | 'custom'>('string')
const dateFormatter = computed<ProTableProps<DemoRow, DemoQuery>['dateFormatter']>(() =>
  dateFormat.value === 'raw'
    ? false
    : dateFormat.value === 'custom'
      ? (value) => `自定义:${String(value)}`
      : dateFormat.value,
)
const tableColumns: ProColumns<DemoRow>[] = [
  { title: '项目', dataIndex: 'project', valueType: 'text', width: 210 },
  { title: '最近更新', dataIndex: 'updatedAt', valueType: 'dateTime' },
  { title: '负责人', dataIndex: 'owner', valueType: 'text' },
]
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
const tableBindings = computed<ProTableProps<DemoRow, DemoQuery>>(() => ({
  columns: tableColumns,
  request,
  rowKey: 'id',
  search: searchConfig,
  pagination: { defaultPageSize: 5, showSizeChanger: true, pageSizeOptions: [5, 10, 20] },
  options: optionsConfig,
  toolbar: toolbarConfig,
  dateFormatter: dateFormatter.value,
}))
</script>

<template>
  <div class="scenario-demo mode-date-formatter" data-scenario-mode="date-formatter">
    <div class="request-monitor">
      <span
        ><b>{{ requestCount }}</b> {{ requestLabels.requests }}</span
      >
      <span
        ><b>{{ loadedTotal }}</b> {{ requestLabels.matches }}</span
      >
      <code :title="lastRequest || requestLabels.waiting">{{
        lastRequest || requestLabels.waiting
      }}</code>
    </div>

    <div v-if="requestFailure" class="inline-error" role="alert">{{ requestFailure }}</div>

    <div class="demo-control-row">
      <span>选择查询日期后提交，观察 request 参数中的日期格式。</span>
      <label>
        dateFormatter
        <select v-model="dateFormat">
          <option value="string">string</option>
          <option value="number">number / timestamp</option>
          <option value="raw">false / 原始值</option>
          <option value="custom">自定义函数</option>
        </select></label
      >
    </div>

    <ProTable
      ref="tableRef"
      v-bind="tableBindings"
      @load="handleLoad"
      @request-error="handleRequestError"
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

.request-monitor {
  display: grid;
  grid-template-columns: auto auto minmax(120px, 1fr);
  gap: 8px;
  align-items: center;
  padding: 9px 11px;
  border: 1px solid #d7e3ef;
  border-radius: 7px;
  background: #f7faff;
  color: var(--demo-muted);
  font-size: 10px;
}

.request-monitor span {
  white-space: nowrap;
}

.request-monitor b {
  color: #1768d3;
  font-family: 'Cascadia Code', Consolas, monospace;
  font-size: 14px;
}

.request-monitor code {
  overflow: hidden;
  color: #64758a;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.inline-error {
  padding: 8px 10px;
  border-radius: 6px;
  background: #fff1f0;
  color: #b4232d;
  font-size: 12px;
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

@media (width <= 760px) {
  .request-monitor {
    grid-template-columns: auto auto;
  }

  .request-monitor code {
    grid-column: 1 / -1;
  }
}
</style>
