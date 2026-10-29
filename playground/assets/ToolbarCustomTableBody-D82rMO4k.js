var e=`<script setup lang="ts">
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
const externalQuery = ref<DemoQuery>({})
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
  emit('event', \`表格主体自定义：\${message}\`)
}
function applyQuery(next: DemoQuery, message: string) {
  externalQuery.value = { ...next }
  announce(message)
}
function handleLoad(_rows: DemoRow[], total: number) {
  loadedTotal.value = total
  requestFailure.value = ''
}
function handleRequestError(error: unknown) {
  requestFailure.value = error instanceof Error ? error.message : String(error)
  announce(\`请求失败：\${requestFailure.value}\`)
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
  params: externalQuery.value,
  rowKey: 'id',
  search: false,
  pagination: { defaultPageSize: 5, showSizeChanger: true, pageSizeOptions: [5, 10, 20] },
  options: optionsConfig,
  toolbar: toolbarConfig,
  tableViewRender: (_props, dom) =>
    h('div', { class: 'custom-table-body' }, [
      h('p', \`自定义 tableViewRender 主体，当前 \${loadedTotal.value} 条记录\`),
      dom,
    ]),
}))
const customBodyEmpty = ref(false)
function setCustomBodyState(empty: boolean) {
  customBodyEmpty.value = empty
  applyQuery(
    empty ? { keyWords: '__custom_body_empty__' } : {},
    empty ? '切换到自定义空态' : '恢复自定义数据态',
  )
}
<\/script>

<template>
  <div
    class="scenario-demo mode-custom-table-body is-custom-body"
    data-scenario-mode="custom-table-body"
  >
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

    <div class="body-shell-heading">
      <span>自定义表格主体容器</span>
      <span class="button-row"
        ><b>{{ loadedTotal }} records</b>
        <button
          type="button"
          :class="{ active: !customBodyEmpty }"
          @click="setCustomBodyState(false)"
        >
          数据态
        </button>
        <button
          type="button"
          :class="{ active: customBodyEmpty }"
          @click="setCustomBodyState(true)"
        >
          自定义空态
        </button></span
      >
    </div>

    <ProTable
      ref="tableRef"
      v-bind="tableBindings"
      @load="handleLoad"
      @request-error="handleRequestError"
      ><template #emptyText
        ><div class="custom-empty-state">
          <strong>没有符合当前条件的项目</strong>
          <span>这是通过 ProTable 转发的 Antdv Table emptyText 插槽渲染的自定义主体空态。</span>
          <button type="button" @click="setCustomBodyState(false)">恢复演示数据</button>
        </div></template
      ></ProTable
    >
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

.body-shell-heading {
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

.is-custom-body {
  padding: 14px;
  border: 1px dashed #8fb1d5;
  border-radius: 18px 4px 18px 4px;
  background: linear-gradient(135deg, #f5f9fd, white);
}

.body-shell-heading {
  border: 0;
  border-radius: 7px 7px 0 0;
  background: #132a46;
  color: #d9e8f6;
  font-family: 'Cascadia Code', Consolas, monospace;
}

.body-shell-heading button {
  padding-block: 5px;
}

.custom-table-body {
  overflow: hidden;
  border-radius: 0 0 10px 10px;
  background: white;
}

.custom-empty-state {
  display: grid;
  justify-items: center;
  gap: 8px;
  min-height: 180px;
  align-content: center;
  padding: 24px;
  color: var(--demo-muted);
  text-align: center;
}

.custom-empty-state strong {
  color: var(--demo-ink);
  font-size: 16px;
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
`;export{e as default};