<script setup lang="ts">
import type { ProColumns, ProTableInstance, ProTableProps } from '@bubblesjs/antv-next-pro'
import { ConfigProvider } from 'antdv-next'
import arEG from 'antdv-next/locale/ar_EG'
import { ProTable } from '@bubblesjs/antv-next-pro'
import { ref } from 'vue'
import { createDemoRequest, type DemoQuery, type DemoRow } from './demoData'
const emit = defineEmits<{
  event: [message: string]
}>()
const tableRef = ref<ProTableInstance<DemoRow> | null>(null)
const requestCount = ref(0)
const lastRequest = ref('')
const loadedTotal = ref(0)
const requestFailure = ref('')
const requestLabels = { requests: 'طلبات', matches: 'نتائج مطابقة', waiting: 'بانتظار الطلب' }
const request = createDemoRequest((params, sort, filter) => {
  requestCount.value += 1
  const visibleParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== ''),
  )
  lastRequest.value = JSON.stringify({ params: visibleParams, sort, filter })
})
function announce(message: string) {
  emit('event', `RTL (النسخة العربية)：${message}`)
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
  { title: 'المشروع', dataIndex: 'project', valueType: 'text', width: 210 },
  { title: 'المالك', dataIndex: 'owner', valueType: 'text', width: 110 },
  {
    title: 'الحالة',
    dataIndex: 'status',
    valueType: 'select',
    valueEnum: {
      running: 'قيد التنفيذ',
      paused: 'متوقف',
      done: 'مكتمل',
    },
    width: 120,
  },
  { title: 'التقدم', dataIndex: 'progress', valueType: 'percent', sorter: true, search: false },
  { title: 'آخر تحديث', dataIndex: 'updatedAt', valueType: 'dateTime', search: false },
]
const tableColumns: ProColumns<DemoRow>[] = commonColumns
const searchConfig: ProTableProps<DemoRow, DemoQuery>['search'] = { labelWidth: 'auto', span: 8 }
const providerLocale = arEG
const localeTextConfig: ProTableProps<DemoRow, DemoQuery>['localeText'] = {
  search: 'بحث',
  reset: 'إعادة تعيين',
  expand: 'عرض المزيد',
  collapse: 'عرض أقل',
  density: 'الكثافة',
  densityDefault: 'الكثافة الافتراضية',
  densityCompact: 'كثافة مضغوطة',
  densityLoose: 'كثافة مريحة',
  fullScreen: 'ملء الشاشة',
  reload: 'تحديث',
  setting: 'إعدادات الأعمدة',
  columnDisplay: 'عرض الأعمدة',
  columnDrag: 'اسحب لإعادة الترتيب',
}
const toolbarConfig: ProTableProps<DemoRow, DemoQuery>['toolbar'] = { title: 'قائمة المشاريع' }
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
  localeText: localeTextConfig,
  pagination: { defaultPageSize: 5, showSizeChanger: true, pageSizeOptions: [5, 10, 20] },
  options: optionsConfig,
  toolbar: toolbarConfig,
}
</script>

<template>
  <ConfigProvider :locale="providerLocale" direction="rtl"
    ><div class="scenario-demo mode-rtl-arabic" dir="rtl" data-scenario-mode="rtl-arabic">
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

      <div class="demo-control-row rtl-note">
        <span>اتجاه الصفحة من اليمين إلى اليسار</span> <b>ConfigProvider · RTL · العربية</b>
      </div>

      <ProTable
        ref="tableRef"
        v-bind="tableBindings"
        @load="handleLoad"
        @request-error="handleRequestError"
        @change="announce('分页、排序或筛选发生变化')"
      /></div
  ></ConfigProvider>
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

.rtl-note {
  direction: rtl;
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
