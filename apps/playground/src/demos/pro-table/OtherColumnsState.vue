<script setup lang="ts">
import type {
  ProColumns,
  ProColumnsState,
  ProTableInstance,
  ProTableProps,
} from '@bubblesjs/antv-next-pro'
import { ProTable } from '@bubblesjs/antv-next-pro'
import { computed, ref } from 'vue'
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
  emit('event', `列状态 columnsState：${message}`)
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
const tableColumns: ProColumns<DemoRow>[] = commonColumns
const searchConfig: ProTableProps<DemoRow, DemoQuery>['search'] = {
  labelWidth: 'auto',
  span: 8,
  defaultCollapsed: false,
}
const columnsStateStorageKey = 'antdv-next-pro-demo-columns-state-v2'
const columnsStateResetKey = ref(0)
const columnsStateDefaultValue: Record<string, ProColumnsState> = {
  project: { fixed: 'left', order: 0 },
  progress: { order: 1 },
  status: { order: 2 },
  owner: { show: false, order: 3 },
  updatedAt: { fixed: 'right', order: 4 },
}
const columnsStateConfig: ProTableProps<DemoRow, DemoQuery>['columnsState'] = {
  persistenceKey: columnsStateStorageKey,
  persistenceType: 'localStorage',
  defaultValue: columnsStateDefaultValue,
  onChange: (state) => announce(`列状态更新：${Object.keys(state).length} 项`),
}
function resetColumnsStateDemo() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(columnsStateStorageKey)
  } catch {
    announce('浏览器存储不可用，无法清除持久化列状态')
    return
  }
  columnsStateResetKey.value += 1
  announce('已恢复默认列顺序、固定位置与显隐')
}
const tableRenderKey = computed(() => {
  return `columns-state-${columnsStateResetKey.value}`
})
const toolbarConfig: ProTableProps<DemoRow, DemoQuery>['toolbar'] = { title: '项目清单' }
const optionsConfig: ProTableProps<DemoRow, DemoQuery>['options'] = {
  density: true,
  fullScreen: true,
  reload: true,
  setting: true,
}
const tableBindings: ProTableProps<DemoRow, DemoQuery> = {
  columns: tableColumns,
  request,
  rowKey: 'id',
  search: searchConfig,
  pagination: { defaultPageSize: 5, showSizeChanger: true, pageSizeOptions: [5, 10, 20] },
  options: optionsConfig,
  toolbar: toolbarConfig,
  columnsState: columnsStateConfig,
  scroll: { x: 850 },
}
</script>

<template>
  <div class="scenario-demo mode-columns-state" data-scenario-mode="columns-state">
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
      <span>
        项目列默认左固定、最近更新列右固定，进度列提前且负责人默认隐藏；变更会写入 localStorage。
      </span>
      <span class="button-row"
        ><button type="button" @click="resetColumnsStateDemo">恢复默认列状态</button>
        <button type="button" @click="announce('横向滚动并刷新页面可核对固定列与持久化')">
          验证说明
        </button></span
      >
    </div>

    <ProTable
      :key="tableRenderKey"
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
