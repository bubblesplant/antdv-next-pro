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
import { PlusOutlined } from '@antdv-next/icons'
import { computed, ref, shallowRef, toRaw, useSlots, watch, getCurrentInstance, h } from 'vue'

import ProTable from './ProTable.vue'
import RenderNode from './table/RenderNode.vue'
import { useIntl, useProPrefix } from './provider'

defineOptions({ inheritAttrs: false })
const {
  columns,
  value: valueProp,
  defaultValue,
  request,
  params,
  postData,
  rowKey,
  loading,
  toolbar = undefined,
  rowSelection,
  polling,
  revalidateOnFocus,
  manualRequest,
  columnsState,
  editable = { type: 'single' },
  editableKeys,
  scroll,
  size,
  bordered,
  recordCreatorProps = undefined,
  maxLength,
  formItemProps,
  onValuesChange,
  onTableChange,
  prefixCls,
  headerTitle,
  tooltip,
  form,
  formRef,
  onSubmit,
  onReset,
  onLoadingChange,
  beforeSearchSubmit,
  dateFormatter,
  debounceTime,
  toolBarRender,
  optionsRender,
  tableRender,
  tableViewRender,
  ErrorBoundary,
  tableExtraRender,
  searchFormRender,
  tableAlertRender,
  tableAlertOptionRender,
  cardProps,
  cardBordered,
  tableClassName,
  tableStyle,
  classes,
  styles,
  localeText,
  options: optionsProp,
  dropdownPrefixCls,
  column,
  locale,
  getPopupContainer,
  sortDirections,
  showSorterTooltip,
  virtual,
  rootClass,
  tableLayout,
  expandable,
  indentSize,
  rowClassName,
  footer,
  summary,
  headerCell,
  bodyCell,
  caption,
  id,
  showHeader,
  components,
  onRow,
  onHeaderRow,
  direction,
  sticky,
  rowHoverable,
  tailor,
  getContainerWidth,
  measureRowRender,
  expandedRowKeys,
  defaultExpandedRowKeys,
  expandedRowRender,
  expandRowByClick,
  expandIcon,
  onExpand,
  onExpandedRowsChange,
  defaultExpandAllRows,
  expandIconColumnIndex,
  expandedRowClassName,
  childrenColumnName,
} = defineProps<EditableProTableProps<T, P>>()
const emit = defineEmits<{
  'update:value': [rows: T[]]
  'update:editableKeys': [keys: ProKey[]]
  valuesChange: [rows: T[], changedRecord: T]
  tableChange: [pagination: ProTablePagination, filters: ProFilter, sorter: ProSort]
  requestError: [error: unknown]
  editableError: [error: unknown]
}>()

// 保留整体 props 接口，getter 持续读取响应式解构值。
const props = {
  get columns() {
    return columns
  },
  get value() {
    return valueProp
  },
  get defaultValue() {
    return defaultValue
  },
  get request() {
    return request
  },
  get params() {
    return params
  },
  get postData() {
    return postData
  },
  get rowKey() {
    return rowKey
  },
  get loading() {
    return loading
  },
  get toolbar() {
    return toolbar
  },
  get rowSelection() {
    return rowSelection
  },
  get polling() {
    return polling
  },
  get revalidateOnFocus() {
    return revalidateOnFocus
  },
  get manualRequest() {
    return manualRequest
  },
  get columnsState() {
    return columnsState
  },
  get editable() {
    return editable
  },
  get editableKeys() {
    return editableKeys
  },
  get scroll() {
    return scroll
  },
  get size() {
    return size
  },
  get bordered() {
    return bordered
  },
  get recordCreatorProps() {
    return recordCreatorProps
  },
  get maxLength() {
    return maxLength
  },
  get formItemProps() {
    return formItemProps
  },
  get onValuesChange() {
    return onValuesChange
  },
  get onTableChange() {
    return onTableChange
  },
  get prefixCls() {
    return prefixCls
  },
  get headerTitle() {
    return headerTitle
  },
  get tooltip() {
    return tooltip
  },
  get form() {
    return form
  },
  get formRef() {
    return formRef
  },
  get onSubmit() {
    return onSubmit
  },
  get onReset() {
    return onReset
  },
  get onLoadingChange() {
    return onLoadingChange
  },
  get beforeSearchSubmit() {
    return beforeSearchSubmit
  },
  get dateFormatter() {
    return dateFormatter
  },
  get debounceTime() {
    return debounceTime
  },
  get toolBarRender() {
    return toolBarRender
  },
  get optionsRender() {
    return optionsRender
  },
  get tableRender() {
    return tableRender
  },
  get tableViewRender() {
    return tableViewRender
  },
  get ErrorBoundary() {
    return ErrorBoundary
  },
  get tableExtraRender() {
    return tableExtraRender
  },
  get searchFormRender() {
    return searchFormRender
  },
  get tableAlertRender() {
    return tableAlertRender
  },
  get tableAlertOptionRender() {
    return tableAlertOptionRender
  },
  get cardProps() {
    return cardProps
  },
  get cardBordered() {
    return cardBordered
  },
  get tableClassName() {
    return tableClassName
  },
  get tableStyle() {
    return tableStyle
  },
  get classes() {
    return classes
  },
  get styles() {
    return styles
  },
  get localeText() {
    return localeText
  },
  get options() {
    return optionsProp
  },
  get dropdownPrefixCls() {
    return dropdownPrefixCls
  },
  get column() {
    return column
  },
  get locale() {
    return locale
  },
  get getPopupContainer() {
    return getPopupContainer
  },
  get sortDirections() {
    return sortDirections
  },
  get showSorterTooltip() {
    return showSorterTooltip
  },
  get virtual() {
    return virtual
  },
  get rootClass() {
    return rootClass
  },
  get tableLayout() {
    return tableLayout
  },
  get expandable() {
    return expandable
  },
  get indentSize() {
    return indentSize
  },
  get rowClassName() {
    return rowClassName
  },
  get footer() {
    return footer
  },
  get summary() {
    return summary
  },
  get headerCell() {
    return headerCell
  },
  get bodyCell() {
    return bodyCell
  },
  get caption() {
    return caption
  },
  get id() {
    return id
  },
  get showHeader() {
    return showHeader
  },
  get components() {
    return components
  },
  get onRow() {
    return onRow
  },
  get onHeaderRow() {
    return onHeaderRow
  },
  get direction() {
    return direction
  },
  get sticky() {
    return sticky
  },
  get rowHoverable() {
    return rowHoverable
  },
  get tailor() {
    return tailor
  },
  get getContainerWidth() {
    return getContainerWidth
  },
  get measureRowRender() {
    return measureRowRender
  },
  get expandedRowKeys() {
    return expandedRowKeys
  },
  get defaultExpandedRowKeys() {
    return defaultExpandedRowKeys
  },
  get expandedRowRender() {
    return expandedRowRender
  },
  get expandRowByClick() {
    return expandRowByClick
  },
  get expandIcon() {
    return expandIcon
  },
  get onExpand() {
    return onExpand
  },
  get onExpandedRowsChange() {
    return onExpandedRowsChange
  },
  get defaultExpandAllRows() {
    return defaultExpandAllRows
  },
  get expandIconColumnIndex() {
    return expandIconColumnIndex
  },
  get expandedRowClassName() {
    return expandedRowClassName
  },
  get childrenColumnName() {
    return childrenColumnName
  },
}

type ExtendedTableInstance = ProTableInstance<T> & {
  getRowData: (indexOrKey: number | ProKey) => T | undefined
  getRowsData: () => T[]
  setRowData: (indexOrKey: number | ProKey, value: Partial<T>) => boolean
}

const intl = useIntl()
const prefix = useProPrefix('table', () => prefixCls)
const instance = getCurrentInstance()
const tableBindings = computed(() => {
  Object.values(props)
  return Object.fromEntries(
    Object.entries(instance?.vnode.props ?? {})
      .map(([raw, value]) => {
        const key = raw.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase())
        return [key, (props as Record<string, unknown>)[key] ?? value]
      })
      .filter(
        ([key]) =>
          ![
            'value',
            'defaultValue',
            'recordCreatorProps',
            'maxLength',
            'formItemProps',
            'onValuesChange',
            'onTableChange',
            'ref',
          ].includes(String(key)),
      ),
  )
})
const slots = useSlots()
const tableRef = ref<ExtendedTableInstance>()
const internalValue = shallowRef<T[]>([...(valueProp ?? defaultValue ?? [])])
const activeEditableKeys = ref<ProKey[]>([
  ...(editableKeys ?? (editable ? editable.editableKeys : undefined) ?? []),
])
const pendingDraftValue = shallowRef<T[]>()

const effectiveEditable = computed<false | EditableConfig<T>>(() =>
  editable === false ? false : { ...editable, type: editable?.type ?? 'single' },
)

const creator = computed(() =>
  recordCreatorProps === false ? undefined : (recordCreatorProps ?? {}),
)
const creatorBindings = computed(() => {
  const { record, position, parentKey, newRecordType, creatorButtonText, ...rest } =
    creator.value ?? {}
  return rest
})
const reachedMaxLength = computed(
  () => maxLength !== undefined && getRowsData().length >= maxLength,
)
const showCreatorAtTop = computed(
  () => !reachedMaxLength.value && creator.value?.position === 'top',
)
const showCreatorAtBottom = computed(
  () => !reachedMaxLength.value && Boolean(creator.value) && !showCreatorAtTop.value,
)

watch(
  () => valueProp,
  (value) => {
    if (value === undefined) return
    if (pendingDraftValue.value && toRaw(value) === pendingDraftValue.value) return
    internalValue.value = [...value]
  },
  { deep: true },
)

watch(
  () => editableKeys,
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
  const generatedKey = `pro-created-${Date.now()}-${Math.random().toString(36).slice(2)}`
  const record =
    typeof config.record === 'function'
      ? config.record(getRowsData().length, getRowsData())
      : config.record
        ? { ...config.record }
        : ({ [typeof rowKey === 'string' ? rowKey : 'id']: generatedKey } as T)
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
  if (maxLength !== undefined && getRowsData().length >= maxLength) {
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
    :is="formItemProps ? FormItem : 'div'"
    v-bind="formItemProps"
    :class="`${prefix}-editable`"
    data-pro-editable-table
  >
    <!-- @vue-generic {T, P} -->
    <ProTable
      ref="tableRef"
      :columns="columns"
      v-bind="{ ...tableBindings, ...$attrs }"
      :data-source="internalValue"
      :editable="effectiveEditable"
      :editable-keys="
        editableKeys ?? (editable ? editable.editableKeys : undefined) ?? activeEditableKeys
      "
      :search="false"
      :pagination="false"
      :options="optionsProp ?? false"
      @update:data-source="handleValueUpdate"
      @update:editable-keys="handleEditableKeysUpdate"
      @data-source-change="handleValuesChange"
      @editable-draft-change="handleDraftChange"
      @change="handleTableChange"
      @request-error="emit('requestError', $event)"
      @editable-error="emit('editableError', $event)"
    >
      <template #before-table
        ><slot name="before-table" />
        <div
          v-if="showCreatorAtTop"
          :class="`${prefix}-record-creator`"
          data-pro-table-record-creator
        >
          <Button
            block
            type="dashed"
            :icon="h(PlusOutlined)"
            v-bind="creatorBindings"
            @click="createRecord"
            ><slot name="creator-button"
              ><RenderNode
                :content="
                  creator?.creatorButtonText ??
                  intl.getMessage('editableTable.action.add', '添加一行数据')
                " /></slot
          ></Button></div
      ></template>
      <template #after-table
        ><div
          v-if="showCreatorAtBottom"
          :class="`${prefix}-record-creator`"
          data-pro-table-record-creator
        >
          <Button
            block
            type="dashed"
            :icon="h(PlusOutlined)"
            v-bind="creatorBindings"
            @click="createRecord"
            ><slot name="creator-button"
              ><RenderNode
                :content="
                  creator?.creatorButtonText ??
                  intl.getMessage('editableTable.action.add', '添加一行数据')
                " /></slot
          ></Button>
        </div>
        <slot name="after-table"
      /></template>
      <template v-for="(_, name) in slots" #[name]="slotProps"
        ><slot
          v-if="name !== 'before-table' && name !== 'after-table' && name !== 'creator-button'"
          :name="name"
          v-bind="slotProps ?? {}"
      /></template>
    </ProTable>
  </component>
</template>
<style>
[data-pro-table-record-creator] > button {
  display: block;
  width: 100%;
  margin: 10px 0;
}
</style>
