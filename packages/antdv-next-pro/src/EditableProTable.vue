<script
  setup
  lang="ts"
  generic="
    T extends Record<string, unknown> = Record<string, unknown>,
    P extends Record<string, unknown> = Record<string, unknown>
  "
>
import type {
  EditableConfig,
  EditableProTableInstance,
  EditableProTableProps,
  ProFilter,
  ProKey,
  ProSort,
  ProTableInstance,
  ProTablePagination,
  ProTableScrollTarget,
  RecordCreatorProps,
} from './types'

import { Button, FormItem } from 'antdv-next'
import { computed, ref, shallowRef, toRaw, useSlots, watch } from 'vue'

import ProTable from './ProTable.vue'
import { recordsInTree } from './table/utils'

const props = withDefaults(defineProps<EditableProTableProps<T, P>>(), {
  editable: () => ({ type: 'multiple' }),
  toolbar: undefined,
})

const emit = defineEmits<{
  'update:value': [rows: T[]]
  'update:editableKeys': [keys: ProKey[]]
  valuesChange: [rows: T[], changedRecord: T]
  tableChange: [pagination: ProTablePagination, filters: ProFilter, sorter: ProSort]
  requestError: [error: unknown]
  editableError: [error: unknown]
}>()

type ExtendedTableInstance = ProTableInstance<T> & {
  getRowData: (indexOrKey: number | ProKey) => T | undefined
  getRowsData: () => T[]
  setRowData: (indexOrKey: number | ProKey, value: Partial<T>) => boolean
}

const slots = useSlots()
const tableRef = ref<ExtendedTableInstance>()
const internalValue = shallowRef<T[]>([...(props.value ?? props.defaultValue ?? [])])
const activeEditableKeys = ref<ProKey[]>([...(props.editableKeys ?? [])])
const pendingDraftValue = shallowRef<T[]>()

const effectiveEditable = computed<false | EditableConfig<T>>(() =>
  props.editable === false ? false : (props.editable ?? { type: 'multiple' }),
)

const creator = computed(() =>
  props.recordCreatorProps === false ? undefined : props.recordCreatorProps,
)
const reachedMaxLength = computed(
  () => props.maxLength !== undefined && recordsInTree(getRowsData()).length >= props.maxLength,
)
const showCreatorAtTop = computed(
  () => !reachedMaxLength.value && creator.value?.position === 'top',
)
const showCreatorAtBottom = computed(
  () => !reachedMaxLength.value && Boolean(creator.value) && !showCreatorAtTop.value,
)

watch(
  () => props.value,
  (value) => {
    if (value === undefined) return
    if (pendingDraftValue.value && toRaw(value) === pendingDraftValue.value) return
    internalValue.value = [...value]
  },
  { deep: true },
)

watch(
  () => props.editableKeys,
  (keys) => {
    if (keys !== undefined) activeEditableKeys.value = [...keys]
  },
  { deep: true },
)

function handleValueUpdate(rows: T[]): void {
  internalValue.value = [...rows]
  const currentRows = tableRef.value?.getRowsData?.() ?? rows
  const nextRows = [...currentRows]
  pendingDraftValue.value = activeEditableKeys.value.length > 0 ? nextRows : undefined
  emit('update:value', nextRows)
}

function handleValuesChange(rows: T[], changedRecord?: T): void {
  if (!changedRecord) return
  const currentRows = tableRef.value?.getRowsData?.() ?? rows
  emit('valuesChange', [...currentRows], changedRecord)
}

function handleDraftChange(rows: T[], changedRecord: T): void {
  const nextRows = [...rows]
  pendingDraftValue.value = activeEditableKeys.value.length > 0 ? nextRows : undefined
  emit('update:value', nextRows)
  emit('valuesChange', nextRows, changedRecord)
}

function handleEditableKeysUpdate(keys: ProKey[]): void {
  activeEditableKeys.value = [...keys]
  if (keys.length === 0) pendingDraftValue.value = undefined
  emit('update:editableKeys', [...keys])
}

function handleTableChange(
  pagination: ProTablePagination,
  filters: ProFilter,
  sorter: ProSort,
): void {
  emit('tableChange', pagination, filters, sorter)
}

function createRecord(): boolean {
  const config = creator.value
  if (!config || reachedMaxLength.value) return false
  const record = typeof config.record === 'function' ? config.record() : { ...config.record }
  return (
    tableRef.value?.addEditRecord(record, {
      position: config.position,
      parentKey: config.parentKey,
      newRecordType: config.newRecordType,
      creatorButtonText: config.creatorButtonText,
    }) ?? false
  )
}

function reload(resetPageIndex?: boolean): Promise<void> {
  return tableRef.value?.reload(resetPageIndex) ?? Promise.resolve()
}

function reset(): Promise<void> {
  return tableRef.value?.reset() ?? Promise.resolve()
}

function setPageInfo(page: Partial<ProTablePagination>): void {
  tableRef.value?.setPageInfo(page)
}

function clearSelected(): void {
  tableRef.value?.clearSelected()
}

function getSortFilter(): { sort: ProSort; filter: ProFilter } {
  return tableRef.value?.getSortFilter() ?? { sort: {}, filter: {} }
}

function fullScreen(): Promise<void> {
  return tableRef.value?.fullScreen() ?? Promise.resolve()
}

function scrollTo(target: ProTableScrollTarget): void {
  tableRef.value?.scrollTo(target)
}

function startEditable(key: ProKey): boolean {
  return tableRef.value?.startEditable(key) ?? false
}

function saveEditable(key: ProKey): Promise<boolean> {
  return tableRef.value?.saveEditable(key) ?? Promise.resolve(false)
}

function cancelEditable(key: ProKey): void {
  tableRef.value?.cancelEditable(key)
}

function addEditRecord(record: T, options?: Omit<RecordCreatorProps<T>, 'record'>): boolean {
  if (props.maxLength !== undefined && recordsInTree(getRowsData()).length >= props.maxLength) {
    return false
  }
  return tableRef.value?.addEditRecord(record, options) ?? false
}

function getRowData(indexOrKey: number | ProKey): T | undefined {
  return tableRef.value?.getRowData(indexOrKey)
}

function getRowsData(): T[] {
  return tableRef.value?.getRowsData?.() ?? [...internalValue.value]
}

function setRowData(indexOrKey: number | ProKey, value: Partial<T>): boolean {
  return tableRef.value?.setRowData(indexOrKey, value) ?? false
}

defineExpose<EditableProTableInstance<T>>({
  getSortFilter,
  reload,
  reset,
  setPageInfo,
  clearSelected,
  fullScreen,
  scrollTo,
  startEditable,
  saveEditable,
  cancelEditable,
  addEditRecord,
  getRowData,
  getRowsData,
  setRowData,
})
</script>

<template>
  <component
    :is="props.formItemProps ? FormItem : 'div'"
    class="antdv-next-pro-editable-table"
    v-bind="props.formItemProps"
  >
    <div v-if="showCreatorAtTop" class="antdv-next-pro__creator">
      <Button block type="dashed" @click="createRecord">
        {{ creator?.creatorButtonText ?? '添加一行数据' }}
      </Button>
    </div>

    <ProTable
      ref="tableRef"
      :columns="props.columns"
      :data-source="internalValue"
      :request="props.request"
      :params="props.params"
      :post-data="props.postData"
      :row-key="props.rowKey"
      :loading="props.loading"
      :toolbar="props.toolbar"
      :row-selection="props.rowSelection"
      :polling="props.polling"
      :revalidate-on-focus="props.revalidateOnFocus ?? false"
      :manual-request="props.manualRequest"
      :columns-state="props.columnsState"
      :editable="effectiveEditable"
      :editable-keys="props.editableKeys"
      :scroll="props.scroll"
      :size="props.size"
      :bordered="props.bordered"
      :search="false"
      :pagination="false"
      :options="false"
      @update:data-source="handleValueUpdate"
      @update:editable-keys="handleEditableKeysUpdate"
      @data-source-change="handleValuesChange"
      @editable-draft-change="handleDraftChange"
      @change="handleTableChange"
      @request-error="emit('requestError', $event)"
      @editable-error="emit('editableError', $event)"
    >
      <template v-for="(_, name) in slots" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps ?? {}" />
      </template>
    </ProTable>

    <div v-if="showCreatorAtBottom" class="antdv-next-pro__creator">
      <Button block type="dashed" @click="createRecord">
        {{ creator?.creatorButtonText ?? '添加一行数据' }}
      </Button>
    </div>
  </component>
</template>
