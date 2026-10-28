<script
  setup
  lang="ts"
  generic="
    T extends Record<string, unknown> = Record<string, unknown>,
    P extends Record<string, unknown> = Record<string, unknown>
  "
>
import type { DragSortTableProps } from './enhancements'
import type { ProTableInstance, ProKey, ProColumns } from '../types'
import { ref, shallowRef, computed, h, watch, getCurrentInstance } from 'vue'
import { HolderOutlined } from '@antdv-next/icons'
import { useProPrefix, useIntl } from '../provider'
import { resolveRowKey } from './utils'
import { useTableRef } from './useTableRef'
import ProTable from '../ProTable.vue'
defineOptions({ inheritAttrs: false })
const props = defineProps<DragSortTableProps<T, P>>()
const emit = defineEmits<{
  'update:dataSource': [rows: T[]]
  dataSourceChange: [rows: T[]]
  dragSortEnd: [beforeIndex: number, afterIndex: number, rows: T[]]
}>()
const table = ref<ProTableInstance<T>>()
const rows = shallowRef<T[]>(props.dataSource ?? props.defaultDataSource ?? [])
const dragging = ref<ProKey>()
const prefix = useProPrefix('table', () => props.prefixCls)
const intl = useIntl()
const instance = getCurrentInstance()
const bindings = computed(() => {
  Object.values(props)
  return Object.fromEntries(
    Object.entries(instance?.vnode.props ?? {}).filter(
      ([key]) =>
        ![
          'columns',
          'dataSource',
          'defaultDataSource',
          'dragSortKey',
          'dragSortHandlerRender',
          'onDragSortEnd',
          'onDataSourceChange',
          'onUpdate:dataSource',
          'onRow',
          'ref',
        ].includes(key.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase())),
    ),
  )
})
watch(
  () => props.dataSource,
  (value) => {
    if (value) rows.value = value
  },
  { deep: true },
)
function key(record: T) {
  return resolveRowKey(record, props.rowKey)
}
async function move(from: ProKey | undefined, to: ProKey | undefined) {
  if (from === undefined || to === undefined || from === to) return
  const source = [...(table.value?.getRowsData() ?? rows.value)]
  const before = source.findIndex((row) => key(row) === from)
  const after = source.findIndex((row) => key(row) === to)
  if (before < 0 || after < 0) return
  const [row] = source.splice(before, 1)
  source.splice(after, 0, row!)
  if (props.dataSource === undefined) rows.value = source
  emit('update:dataSource', source)
  emit('dataSourceChange', source)
  emit('dragSortEnd', before, after, source)
}
function keyboard(event: KeyboardEvent, record: T) {
  if (!['ArrowUp', 'ArrowDown'].includes(event.key)) return
  event.preventDefault()
  const source = table.value?.getRowsData() ?? rows.value
  const index = source.findIndex((row) => key(row) === key(record))
  const next = source[index + (event.key === 'ArrowUp' ? -1 : 1)]
  if (next) void move(key(record), key(next))
}
function handle(record: T, index: number) {
  return h(
    'button',
    {
      type: 'button',
      draggable: true,
      'data-pro-table-drag-handle': '',
      class: `${prefix.value}-drag-icon`,
      'aria-label': intl.value.getMessage('tableToolBar.columnDrag', '拖动排序'),
      onDragstart: (event: DragEvent) => {
        dragging.value = key(record)
        event.dataTransfer?.setData('text/plain', String(dragging.value))
        if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
      },
      onDragend: () => (dragging.value = undefined),
      onKeydown: (event: KeyboardEvent) => keyboard(event, record),
    },
    [props.dragSortHandlerRender ? props.dragSortHandlerRender(record, index) : h(HolderOutlined)],
  )
}
const columns = computed<ProColumns<T>[]>(() => {
  const field = props.dragSortKey ?? '__dragSort'
  const source = props.columns.map((column) => ({ ...column }))
  const index = source.findIndex((column) => column.key === field || column.dataIndex === field)
  const drag: ProColumns<T> = {
    ...(index >= 0 ? source[index] : {}),
    key: field,
    width: 48,
    search: false,
    editable: false,
    render: (_dom, record, index) => handle(record, index),
  }
  if (index >= 0) source[index] = drag
  else source.unshift(drag)
  return source
})
function onRow(record: T, index?: number) {
  const original = props.onRow?.(record, index) ?? {}
  return {
    ...original,
    onDragover: (event: DragEvent) => {
      original.onDragover?.(event)
      event.preventDefault()
    },
    onDrop: (event: DragEvent) => {
      original.onDrop?.(event)
      event.preventDefault()
      void move(dragging.value, key(record))
      dragging.value = undefined
    },
  }
}
defineExpose<ProTableInstance<T>>(useTableRef(table))
</script>
<template>
  <!-- @vue-generic {T,P} --><ProTable
    ref="table"
    v-bind="{ ...bindings, ...$attrs }"
    :columns="columns"
    :data-source="props.dataSource ?? rows"
    :on-row="onRow"
    @load="rows = $event"
    ><template v-for="(_, name) in $slots" #[name]="scope"
      ><slot :name="name" v-bind="scope ?? {}" /></template
  ></ProTable>
</template>
<style>
[data-pro-table-drag-handle] {
  border: 0;
  background: transparent;
  color: inherit;
  cursor: grab;
  padding: 6px;
  touch-action: none;
}
[data-pro-table-drag-handle]:active {
  cursor: grabbing;
}
</style>
