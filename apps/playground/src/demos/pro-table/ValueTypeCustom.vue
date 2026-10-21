<script setup lang="ts">
import type {
  ProColumns,
  ProTableInstance,
  ProTableProps,
  ProValueTypeMap,
} from '@bubblesjs/antv-next-pro'
import { ProTable, ProConfigProvider } from '@bubblesjs/antv-next-pro'
import { computed, h, ref } from 'vue'
import { demoRows, type DemoQuery, type DemoRow } from './demoData'
const emit = defineEmits<{
  event: [message: string]
}>()
const tableRef = ref<ProTableInstance<DemoRow> | null>(null)
function announce(message: string) {
  emit('event', `自定义 valueType：${message}`)
}
const valueTypeMap: ProValueTypeMap = {
  healthMeter: {
    render: (text) => {
      const score = Number(text ?? 0)
      return h('span', { class: 'health-meter' }, [
        h('i', { style: { width: `${score}%` } }),
        h('b', String(score)),
      ])
    },
    formItemRender: (text, context) =>
      h('input', {
        ...context.fieldProps,
        type: 'range',
        min: 0,
        max: 100,
        value: Number(text ?? 0),
        onInput: (event: Event) =>
          context.onChange(Number((event.target as HTMLInputElement).value)),
      }),
  },
}
const customRows = ref(
  demoRows.slice(0, 4).map((row) => ({ ...row, health: row.score, note: `健康度 ${row.score}` })),
)
const tableColumns = computed<ProColumns<DemoRow>[]>(() => {
  return [
    { title: '项目', dataIndex: 'project', valueType: 'text', editable: false, width: 210 },
    {
      title: '自定义健康度',
      dataIndex: 'health',
      valueType: 'healthMeter',
      search: false,
    },
    {
      title: 'renderText 转换',
      dataIndex: 'score',
      valueType: 'text',
      search: false,
      renderText: (value) => `S-${String(value).padStart(3, '0')}`,
    },
    { title: '操作', valueType: 'option', search: false, width: 150 },
  ]
})
const resolvedDataSource = computed<DemoRow[] | undefined>(() => {
  return customRows.value
})
const toolbarConfig: ProTableProps<DemoRow, DemoQuery>['toolbar'] = { title: '项目清单' }
const optionsConfig: ProTableProps<DemoRow, DemoQuery>['options'] = {
  density: true,
  fullScreen: true,
  reload: true,
  setting: true,
}
const tableBindings = computed<ProTableProps<DemoRow, DemoQuery>>(() => ({
  columns: tableColumns.value,
  dataSource: resolvedDataSource.value,
  rowKey: 'id',
  search: false,
  pagination: false,
  options: optionsConfig,
  toolbar: toolbarConfig,
  editable: {
    type: 'single',
    onSave: (_key, row) => announce(`保存自定义健康度 ${String(row.health)}`),
  },
}))
function startCustomEdit() {
  tableRef.value?.startEditable(customRows.value[0]!.id)
  announce('进入自定义 valueType 编辑态')
}
</script>

<template>
  <div class="scenario-demo mode-custom-value-type" data-scenario-mode="custom-value-type">
    <div class="demo-control-row">
      <span>ProConfigProvider.valueTypeMap 注册健康度展示和编辑控件。</span>
      <button type="button" class="primary" @click="startCustomEdit">编辑第一行健康度</button>
    </div>

    <ProConfigProvider :value-type-map="valueTypeMap"
      ><ProTable
        ref="tableRef"
        v-bind="tableBindings"
        @change="announce('分页、排序或筛选发生变化')"
    /></ProConfigProvider>
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

:deep(.health-meter) {
  width: 150px;
  display: inline-grid;
  grid-template-columns: minmax(0, 1fr) 30px;
  gap: 8px;
  align-items: center;
}

:deep(.health-meter::before) {
  content: '';
  grid-area: 1 / 1;
  height: 7px;
  border-radius: 999px;
  background: #e2eaf2;
}

:deep(.health-meter i) {
  z-index: 1;
  grid-area: 1 / 1;
  height: 7px;
  max-width: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #00a7b5, #1768d3);
}

:deep(.health-meter b) {
  font-size: 11px;
}
</style>
