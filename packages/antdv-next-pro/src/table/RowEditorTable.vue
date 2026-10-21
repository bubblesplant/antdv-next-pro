<script
  setup
  lang="ts"
  generic="
    T extends Record<string, unknown> = Record<string, unknown>,
    P extends Record<string, unknown> = Record<string, unknown>
  "
>
import type { RowEditorTableProps } from './enhancements'
import type { ProTableInstance, ProKey } from '../types'
import { ref, computed, onBeforeUnmount, getCurrentInstance } from 'vue'
import EditableProTable from '../EditableProTable.vue'
import { resolveRowKey } from './utils'
import { useTableRef } from './useTableRef'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<RowEditorTableProps<T, P>>(), {
  editable: () => ({ type: 'single' }),
})
const emit = defineEmits<{
  'update:editableKeys': [keys: ProKey[]]
  'update:dataSource': [rows: T[]]
}>()
const table = ref<ProTableInstance<T>>()
const instance = getCurrentInstance()
const timers = new Map<ProKey, ReturnType<typeof setTimeout>>()
const editing = new Set<ProKey>()
const bindings = computed(() => {
  Object.values(props)
  return Object.fromEntries(
    Object.entries(instance?.vnode.props ?? {}).filter(
      ([raw]) =>
        ![
          'onRow',
          'onRowEditStart',
          'onRowEditEnd',
          'dataSource',
          'defaultDataSource',
          'onUpdate:dataSource',
          'onUpdate:editableKeys',
          'ref',
        ].includes(raw.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase())),
    ),
  )
})
function clear(key: ProKey) {
  const timer = timers.get(key)
  if (timer) clearTimeout(timer)
  timers.delete(key)
}
onBeforeUnmount(() => {
  for (const key of timers.keys()) clear(key)
})
function start(key: ProKey) {
  const record = table.value?.getRowData(key)
  if (!record || !table.value?.startEditable(key)) return false
  if (!editing.has(key)) props.onRowEditStart?.(key, record)
  editing.add(key)
  return true
}
function finish(key: ProKey) {
  if (!editing.has(key)) return
  clear(key)
  editing.delete(key)
  const record = table.value?.getRowData(key)
  if (record) props.onRowEditEnd?.(key, record)
}
async function save(key: ProKey) {
  clear(key)
  const result = (await table.value?.saveEditable(key)) ?? false
  if (result) finish(key)
  return result
}
function onRow(record: T, index?: number) {
  const original = props.onRow?.(record, index) ?? {}
  const key = resolveRowKey(record, props.rowKey)
  return {
    ...original,
    onDblclick: (event: MouseEvent) => {
      original.onDblclick?.(event)
      if (!event.defaultPrevented && key !== undefined) start(key)
    },
    onFocusin: (event: FocusEvent) => {
      original.onFocusin?.(event)
      if (key !== undefined) clear(key)
    },
    onFocusout: (event: FocusEvent) => {
      original.onFocusout?.(event)
      if (
        key === undefined ||
        !editing.has(key) ||
        (event.relatedTarget instanceof Node &&
          (event.currentTarget as HTMLElement).contains(event.relatedTarget))
      )
        return
      clear(key)
      timers.set(
        key,
        setTimeout(() => {
          void save(key)
        }, 150),
      )
    },
  }
}
function syncEditing(keys: ProKey[]) {
  for (const key of editing) if (!keys.includes(key)) finish(key)
  emit('update:editableKeys', keys)
}
const action = useTableRef(table)
defineExpose<ProTableInstance<T>>({
  ...action,
  startEditable: start,
  saveEditable: save,
  cancelEditable: (key) => {
    action.cancelEditable(key)
    finish(key)
  },
})
</script>
<template>
  <!-- @vue-generic {T,P} --><EditableProTable
    ref="table"
    @update:editable-keys="syncEditing"
    v-bind="{ ...bindings, ...$attrs }"
    :value="props.value ?? props.dataSource"
    :default-value="props.defaultValue ?? props.defaultDataSource"
    @update:value="emit('update:dataSource', $event)"
    :columns="props.columns"
    :editable="props.editable ?? { type: 'single' }"
    :record-creator-props="props.recordCreatorProps ?? false"
    :on-row="onRow"
    ><template v-for="(_, name) in $slots" #[name]="scope"
      ><slot :name="name" v-bind="scope ?? {}" /></template
  ></EditableProTable>
</template>
