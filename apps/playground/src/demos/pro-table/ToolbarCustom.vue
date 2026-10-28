<script setup lang="ts">
import type { ProColumns, ProTableInstance, ProTableProps } from '@bubblesjs/antdv-next-pro'
import { ProTable } from '@bubblesjs/antdv-next-pro'
import { computed, h, ref } from 'vue'
import { createDemoRequest, type DemoQuery, type DemoRow } from './demoData'
const emit = defineEmits<{
  event: [message: string]
}>()
const statusEnum = {
  running: { text: '进行中', status: 'processing' },
  paused: { text: '已暂停', status: 'warning' },
  done: { text: '已完成', status: 'success' },
}
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
  emit('event', `Toolbar 自定义：${message}`)
}
function handleLoad(_rows: DemoRow[], total: number) {
  loadedTotal.value = total
  requestFailure.value = ''
}
function handleRequestError(error: unknown) {
  requestFailure.value = error instanceof Error ? error.message : String(error)
  announce(`请求失败：${requestFailure.value}`)
}
const commonColumns: ProColumns<DemoRow>[] = [
  {
    title: '项目',
    dataIndex: 'project',
    valueType: 'text',
    width: 210,
    copyable: true,
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
const tableColumns: ProColumns<DemoRow>[] = commonColumns
const searchConfig: ProTableProps<DemoRow, DemoQuery>['search'] = {
  labelWidth: 'auto',
  span: 8,
  defaultCollapsed: false,
}
function toolbarButton(label: string, onClick: () => void, active = false) {
  return h('button', { type: 'button', class: ['toolbar-demo-button', { active }], onClick }, label)
}
const toolbarConfig = computed<ProTableProps<DemoRow, DemoQuery>['toolbar']>(() => {
  return {
    title: h('span', { class: 'rich-toolbar-title' }, [
      h('strong', '增长项目清单'),
      h('small', `共 ${loadedTotal.value} 项 · request 驱动`),
    ]),
    actions: h('span', { class: 'toolbar-action-row' }, [
      toolbarButton('重置', () => void tableRef.value?.reset()),
      toolbarButton('刷新', () => void tableRef.value?.reload()),
      toolbarButton('新建项目', () => announce('点击自定义新建操作'), true),
    ]),
  }
})
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
  toolbar: toolbarConfig.value,
}))
</script>

<template>
  <div class="scenario-demo mode-custom-toolbar" data-scenario-mode="custom-toolbar">
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
button.active {
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

:deep(.toolbar-action-row) {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

:deep(.toolbar-demo-button) {
  padding: 5px 8px;
  border: 1px solid #b9c9db;
  border-radius: 5px;
  background: white;
  color: #28445f;
  cursor: pointer;
  font-size: 11px;
}

:deep(.toolbar-demo-button.active) {
  border-color: #1768d3;
  background: #1768d3;
  color: white;
}

:deep(.rich-toolbar-title) {
  display: grid;
  gap: 3px;
}

:deep(.rich-toolbar-title small) {
  color: #718399;
  font-size: 10px;
  font-weight: 400;
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
