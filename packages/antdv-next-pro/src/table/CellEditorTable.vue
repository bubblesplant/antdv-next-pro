<script
  setup
  lang="ts"
  generic="
    T extends Record<string, unknown> = Record<string, unknown>,
    P extends Record<string, unknown> = Record<string, unknown>
  "
>
import type { CellEditorTableProps } from './enhancements'
import type { ProColumns, ProTableInstance, ProKey } from '../types'
import { ref, computed, onBeforeUnmount, getCurrentInstance, nextTick } from 'vue'
import EditableProTable from '../EditableProTable.vue'
import { resolveRowKey, columnKey, flattenColumns } from './utils'
import { resolveColumnValueType } from './valueType'
import { useTableRef } from './useTableRef'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<CellEditorTableProps<T, P>>(), {
  editable: () => ({ type: 'single' }),
})
const emit = defineEmits<{
  'update:editableKeys': [keys: ProKey[]]
  'update:dataSource': [rows: T[]]
}>()
const table = ref<ProTableInstance<T>>()
const active = ref<{ key: ProKey; column: string }>()
const instance = getCurrentInstance()
let timer: ReturnType<typeof setTimeout> | undefined
let switching = false
const identifiers = new WeakMap<ProColumns<T>, string>()
const bindings = computed(() => {
  Object.values(props)
  return Object.fromEntries(
    Object.entries(instance?.vnode.props ?? {}).filter(
      ([raw]) =>
        ![
          'columns',
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
function clear() {
  if (timer) clearTimeout(timer)
  timer = undefined
}
onBeforeUnmount(clear)
function permitted(column: ProColumns<T>, record: T, index: number) {
  return (
    !column.readonly &&
    resolveColumnValueType(column.valueType, record, index).type !== 'option' &&
    (typeof column.editable === 'function'
      ? column.editable(record, index)
      : column.editable !== false)
  )
}
function finish(key: ProKey) {
  if (active.value?.key !== key) return
  clear()
  active.value = undefined
  const record = table.value?.getRowData(key)
  if (record) props.onRowEditEnd?.(key, record)
}
async function save(key: ProKey) {
  const result = (await table.value?.saveEditable(key)) ?? false
  if (result) finish(key)
  return result
}
function start(key: ProKey, column?: ProColumns<T>, identifier?: string) {
  const record = table.value?.getRowData(key)
  if (!record) return false
  const target = column ?? flattenColumns(props.columns).find((item) => permitted(item, record, 0))
  if (!target) return false
  const previous = active.value
  active.value = { key, column: identifier ?? identifiers.get(target) ?? columnKey(target) }
  if (!table.value?.startEditable(key)) {
    active.value = previous
    return false
  }
  if (previous?.key !== key || previous.column !== active.value.column)
    props.onRowEditStart?.(key, record)
  return true
}
async function activate(
  record: T,
  index: number,
  column: ProColumns<T>,
  identifier: string,
  cell: HTMLElement,
) {
  const key = resolveRowKey(record, props.rowKey)
  if (key === undefined || !permitted(column, record, index) || switching) return
  if (active.value?.key === key && active.value.column === identifier) return
  clear()
  switching = true
  try {
    if (active.value && !(await save(active.value.key))) return
    if (!start(key, column, identifier)) return
    await nextTick()
    cell.querySelector<HTMLElement>('input,textarea,select,[tabindex="0"]')?.focus()
  } finally {
    switching = false
  }
}
function decorate(source: ProColumns<T>[], path = ''): ProColumns<T>[] {
  return source.map((column, columnIndex) => {
    const identifier = `${path}${columnIndex}:${columnKey(column)}`
    identifiers.set(column, identifier)
    const duplicate =
      flattenColumns(props.columns).filter((item) => columnKey(item) === columnKey(column)).length >
      1
    return {
      ...column,
      key: column.key ?? (duplicate ? identifier : undefined),
      children: column.children ? decorate(column.children, `${identifier}/`) : undefined,
      columns: column.columns ? decorate(column.columns, `${identifier}/`) : undefined,
      editable: (record, index) =>
        permitted(column, record, index) &&
        active.value?.key === resolveRowKey(record, props.rowKey) &&
        active.value?.column === identifier,
      onCell: (record, index = 0) => {
        const original = column.onCell?.(record, index) ?? {}
        const key = resolveRowKey(record, props.rowKey)
        const isActive = () => active.value?.key === key && active.value?.column === identifier
        return {
          ...original,
          onDblclick: (event: MouseEvent) => {
            original.onDblclick?.(event)
            if (!event.defaultPrevented)
              void activate(record, index, column, identifier, event.currentTarget as HTMLElement)
          },
          onFocusin: (event: FocusEvent) => {
            original.onFocusin?.(event)
            if (isActive()) clear()
          },
          onFocusout: (event: FocusEvent) => {
            original.onFocusout?.(event)
            if (
              !isActive() ||
              (event.relatedTarget instanceof Node &&
                (event.currentTarget as HTMLElement).contains(event.relatedTarget))
            )
              return
            clear()
            timer = setTimeout(() => {
              if (key !== undefined && isActive()) void save(key)
            }, 150)
          },
        }
      },
    }
  })
}
function syncEditing(keys: ProKey[]) {
  if (active.value && !keys.includes(active.value.key)) finish(active.value.key)
  emit('update:editableKeys', keys)
}
const columns = computed(() => decorate(props.columns))
const action = useTableRef(table)
defineExpose<ProTableInstance<T>>({
  ...action,
  startEditable: (key) => start(key),
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
    :columns="columns"
    :editable="props.editable ?? { type: 'single' }"
    :record-creator-props="props.recordCreatorProps ?? false"
    ><template v-for="(_, name) in $slots" #[name]="scope"
      ><slot :name="name" v-bind="scope ?? {}" /></template
  ></EditableProTable>
</template>
