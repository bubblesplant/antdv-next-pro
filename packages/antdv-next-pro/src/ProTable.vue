<script
  setup
  lang="ts"
  generic="
    T extends Record<string, unknown> = Record<string, unknown>,
    P extends Record<string, unknown> = Record<string, unknown>
  "
>
import type { TableColumnsType } from 'antdv-next'
import type { CSSProperties, VNodeChild } from 'vue'
import type {
  EditableAction,
  ProColumns,
  ProColumnsState,
  ProFilter,
  ProKey,
  ProTableLocaleText,
  ProSort,
  ProTableInstance,
  ProTablePagination,
  ProTableProps,
  ProTableScrollTarget,
  RecordCreatorProps,
} from './types'

import {
  ColumnHeightOutlined,
  DownOutlined,
  FullscreenOutlined,
  ReloadOutlined,
  SettingOutlined,
  UpOutlined,
} from '@antdv-next/icons'
import { Button, Checkbox, Pagination, Popconfirm, Space, Table } from 'antdv-next'
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, useSlots, watch } from 'vue'

import ProFormField from './pro-form-fields/ProFormField.vue'
import { useThemeVars } from './shared/useThemeVars'
import RenderNode from './table/RenderNode.vue'
import { useEditableTable } from './table/editable'
import {
  formatProValue,
  normalizeFieldOption,
  resolveFieldOptions,
  ValueTypeControl,
  type ProFieldOption,
  type ProFieldOptionSource,
} from './table/ValueTypeControl'
import {
  applyLocalQuery,
  buildSearchParams,
  columnKey,
  findRecord,
  flattenColumns,
  getValue,
  loadColumnsState,
  persistColumnsState,
  replaceRecord,
  resolveRowKey,
} from './table/utils'

const props = withDefaults(defineProps<ProTableProps<T, P>>(), {
  search: () => ({}),
  pagination: () => ({}),
  options: () => ({}),
})

const emit = defineEmits<{
  'update:dataSource': [rows: T[]]
  'update:editableKeys': [keys: ProKey[]]
  dataSourceChange: [rows: T[], changedRecord?: T]
  editableDraftChange: [rows: T[], changedRecord: T, reason: 'change' | 'cancel']
  requestError: [error: unknown]
  editableError: [error: unknown]
  validationError: [key: ProKey, errors: Record<string, string>]
  searchCollapse: [collapsed: boolean]
  change: [pagination: ProTablePagination, filters: ProFilter, sorter: ProSort]
  selectionChange: [keys: ProKey[], rows: T[]]
  load: [rows: T[], total: number]
}>()

const DEFAULT_LOCALE_TEXT: ProTableLocaleText = {
  search: '查询',
  reset: '重置',
  expand: '展开',
  collapse: '收起',
  densityDefault: '默认',
  densityCompact: '紧凑',
  densityLoose: '宽松',
  fullScreen: '全屏',
  reload: '刷新',
  setting: '列设置',
}

const slots = useSlots()
const rootElement = ref<HTMLElement>()
const tableData = shallowRef<T[]>([...(props.dataSource ?? props.defaultDataSource ?? [])])
const internalLoading = ref(false)
const requestTotal = ref<number>()
const searchValues = ref<Record<string, unknown>>({})
const internalSearchCollapsed = ref(
  typeof props.search === 'object' ? (props.search.defaultCollapsed ?? false) : false,
)
const activeSort = ref<ProSort>({})
const activeFilter = ref<ProFilter>({})
const editableKeys = ref<ProKey[]>([...(props.editableKeys ?? [])])
const selectedKeys = ref<ProKey[]>([])
const settingsOpen = ref(false)
const fallbackFullscreen = ref(false)
const density = ref<'small' | 'middle' | 'large'>(props.size ?? 'middle')
const columnsState = ref<Record<string, ProColumnsState>>(loadColumnsState(props.columnsState))
const remoteColumnOptions = shallowRef(new Map<string, ProFieldOption[]>())
const loadingOptionKeys = shallowRef(new Set<string>())
const mounted = ref(false)
let requestSequence = 0
let optionRequestSequence = 0
let pollingTimer: ReturnType<typeof setInterval> | undefined

const localeText = computed<ProTableLocaleText>(() => ({
  ...DEFAULT_LOCALE_TEXT,
  ...props.localeText,
}))
const rootStyle = useThemeVars()

const initialCurrent = () => {
  if (props.pagination === false) return 1
  return props.pagination?.current ?? props.pagination?.defaultCurrent ?? 1
}

const initialPageSize = () => {
  if (props.pagination === false) return 10
  return props.pagination?.pageSize ?? props.pagination?.defaultPageSize ?? 10
}

const current = ref(initialCurrent())
const pageSize = ref(initialPageSize())

const effectiveRowKey = computed<string | ((record: T) => ProKey)>(() =>
  typeof props.rowKey === 'function' ? props.rowKey : String(props.rowKey ?? 'id'),
)

const effectiveColumns = computed<ProColumns<T>[]>(() => {
  const source = [...props.columns]
  const hasOptionColumn = flattenColumns(source).some(
    (column) => column.valueType === 'option' && !column.hideInTable,
  )
  if (props.editable && !hasOptionColumn) {
    source.push({ key: '__pro_actions', title: '操作', valueType: 'option', width: 160 })
  }
  return source
})

const searchableColumns = computed(() =>
  flattenColumns(effectiveColumns.value).filter(
    (column) =>
      column.dataIndex !== undefined &&
      !column.hideInSearch &&
      column.search !== false &&
      !['option', 'index', 'indexBorder'].includes(column.valueType ?? ''),
  ),
)

const searchConfig = computed(() => (typeof props.search === 'object' ? props.search : {}))
const searchCollapsed = computed(() =>
  searchConfig.value.collapsed === undefined
    ? internalSearchCollapsed.value
    : searchConfig.value.collapsed,
)
const searchColumnsPerRow = computed(() => {
  const span = Math.min(24, Math.max(1, Math.floor(searchConfig.value.span ?? 8)))
  return Math.max(1, Math.floor(24 / span))
})
const collapsedSearchFieldCount = computed(() => Math.max(1, searchColumnsPerRow.value - 1))
const visibleSearchableColumns = computed(() =>
  searchCollapsed.value
    ? searchableColumns.value.slice(0, collapsedSearchFieldCount.value)
    : searchableColumns.value,
)
const showSearchCollapse = computed(
  () => searchableColumns.value.length > collapsedSearchFieldCount.value,
)
const searchGridStyle = computed<CSSProperties>(() => ({
  '--antdv-next-pro-search-columns': searchColumnsPerRow.value,
}))

const processedData = computed(() => {
  const source = [...tableData.value]
  return props.postData ? props.postData(source) : source
})

const locallyQueriedData = computed(() =>
  props.request
    ? processedData.value
    : applyLocalQuery(
        processedData.value,
        effectiveColumns.value,
        props.search === false ? {} : searchValues.value,
        activeSort.value,
        activeFilter.value,
      ),
)

const total = computed(() =>
  props.request
    ? (requestTotal.value ??
      (props.pagination === false ? undefined : props.pagination?.total) ??
      locallyQueriedData.value.length)
    : props.pagination === false
      ? locallyQueriedData.value.length
      : (props.pagination?.total ?? locallyQueriedData.value.length),
)

const displayedData = computed(() => {
  if (props.pagination === false || props.request) return locallyQueriedData.value
  const start = Math.max(0, (current.value - 1) * pageSize.value)
  return locallyQueriedData.value.slice(start, start + pageSize.value)
})

const effectiveLoading = computed(() => Boolean(props.loading) || internalLoading.value)
const paginationInfo = computed<ProTablePagination>(() => ({
  current: current.value,
  pageSize: pageSize.value,
  total: total.value,
}))

const paginationOptions = computed(() => {
  if (props.pagination === false) return undefined
  return {
    showSizeChanger: props.pagination?.showSizeChanger ?? true,
    pageSizeOptions: props.pagination?.pageSizeOptions ?? [10, 20, 50, 100],
  }
})

const editable = useEditableTable<T>({
  rows: tableData,
  columns: () => effectiveColumns.value,
  rowKey: () => effectiveRowKey.value,
  editable: () => props.editable,
  editableKeys,
  onRowsChange(rows, changedRecord, silent) {
    tableData.value = rows
    if (silent) return
    emit('update:dataSource', [...rows])
    emit('dataSourceChange', [...rows], changedRecord)
  },
  onDraftChange(rows, changedRecord, reason) {
    emit('editableDraftChange', [...rows], changedRecord, reason)
  },
  onEditableKeysChange(keys) {
    emit('update:editableKeys', keys)
  },
  onError(error) {
    emit('editableError', error)
  },
})

const originalColumnMap = computed(
  () =>
    new Map(
      flattenColumns(effectiveColumns.value).map((column, index) => [
        columnKey(column, `column-${index}`),
        column,
      ]),
    ),
)

const tableColumns = computed(() => decorateColumns(effectiveColumns.value))

const rowSelectionConfig = computed<Record<string, unknown> | undefined>(() => {
  if (props.rowSelection === false || props.rowSelection === undefined) return undefined
  const source = props.rowSelection
  const controlledKeys = Array.isArray(source.selectedRowKeys)
    ? (source.selectedRowKeys as ProKey[])
    : selectedKeys.value
  const originalOnChange = source.onChange
  return {
    ...source,
    selectedRowKeys: controlledKeys,
    onChange(keys: ProKey[], rows: T[]) {
      selectedKeys.value = [...keys]
      if (typeof originalOnChange === 'function') originalOnChange(keys, rows)
      emit('selectionChange', [...keys], rows)
    },
  }
})

const showToolbar = computed(
  () =>
    (props.toolbar !== false && props.toolbar !== undefined) ||
    props.options !== false ||
    Boolean(slots['toolbar-title'] || slots['toolbar-actions']),
)

const toolbarTitle = computed(() =>
  props.toolbar && typeof props.toolbar === 'object' ? props.toolbar.title : undefined,
)

const showToolbarTitle = computed(
  () => toolbarTitle.value !== undefined || Boolean(slots['toolbar-title']),
)

const toolbarActions = computed(() => {
  if (!props.toolbar || typeof props.toolbar !== 'object') return undefined
  return typeof props.toolbar.actions === 'function'
    ? props.toolbar.actions()
    : props.toolbar.actions
})

const fullscreenClass = computed(() => ({
  'antdv-next-pro__fullscreen': fallbackFullscreen.value,
}))

watch(
  () => props.size,
  (size) => {
    density.value = size ?? 'middle'
  },
)

watch(
  () => props.dataSource,
  (value) => {
    if (value === undefined) return
    tableData.value = [...value]
    editable.syncKeys(props.editableKeys ?? editableKeys.value)
  },
  { deep: true },
)

watch(
  () => props.editableKeys,
  (keys) => {
    editable.syncKeys(keys ?? [])
  },
  { deep: true, immediate: true },
)

watch(
  () => props.columnsState?.value,
  (value) => {
    if (value) columnsState.value = cloneState(value)
  },
  { deep: true },
)

watch(
  () => props.pagination,
  (pagination) => {
    if (pagination === false) return
    const nextCurrent = pagination?.current ?? current.value
    const nextPageSize = pagination?.pageSize ?? pageSize.value
    if (nextCurrent === current.value && nextPageSize === pageSize.value) return
    current.value = nextCurrent
    pageSize.value = nextPageSize
    if (mounted.value && props.request) void refresh()
  },
  { deep: true },
)

watch(
  () => props.columns,
  () => void loadColumnOptions(),
  { deep: true, immediate: true },
)

watch(
  () => props.params,
  () => {
    if (!mounted.value || !props.request) return
    current.value = 1
    void refresh()
  },
  { deep: true },
)

watch(
  () => props.polling,
  () => configurePolling(),
)

watch(total, (nextTotal) => {
  if (props.pagination === false || props.request) return
  const lastPage = Math.max(1, Math.ceil(nextTotal / pageSize.value))
  if (current.value > lastPage) current.value = lastPage
})

async function refresh(): Promise<void> {
  if (!props.request) return
  const sequence = ++requestSequence
  internalLoading.value = true
  const requestParams = {
    ...(props.params ?? ({} as P)),
    ...(props.search === false
      ? {}
      : buildSearchParams(effectiveColumns.value, searchValues.value)),
    ...(props.pagination === false ? {} : { current: current.value, pageSize: pageSize.value }),
  } as P & { current?: number; pageSize?: number }
  try {
    const result = await props.request(
      requestParams,
      { ...activeSort.value },
      { ...activeFilter.value },
    )
    if (sequence !== requestSequence) return
    if (result.success === false) {
      emit('requestError', new Error('ProTable request returned success: false'))
      return
    }
    tableData.value = [...result.data]
    editable.syncKeys(props.editableKeys ?? editableKeys.value)
    requestTotal.value = result.total
    const loadedTotal =
      result.total ??
      (props.pagination === false ? undefined : props.pagination?.total) ??
      result.data.length
    emit('update:dataSource', [...result.data])
    emit('load', [...result.data], loadedTotal)
  } catch (error) {
    if (sequence === requestSequence) emit('requestError', error)
  } finally {
    if (sequence === requestSequence) internalLoading.value = false
  }
}

async function reload(resetPageIndex = false): Promise<void> {
  if (resetPageIndex) current.value = 1
  await refresh()
}

async function reset(): Promise<void> {
  searchValues.value = {}
  activeSort.value = {}
  activeFilter.value = {}
  current.value = initialCurrent()
  pageSize.value = initialPageSize()
  await refresh()
}

function setPageInfo(page: Partial<ProTablePagination>): void {
  if (page.current !== undefined) current.value = page.current
  if (page.pageSize !== undefined) pageSize.value = page.pageSize
  emitTableChange()
  void refresh()
}

function clearSelected(): void {
  selectedKeys.value = []
  const onChange =
    props.rowSelection && typeof props.rowSelection === 'object'
      ? props.rowSelection.onChange
      : undefined
  if (typeof onChange === 'function') onChange([], [])
  emit('selectionChange', [], [])
}

async function fullScreen(): Promise<void> {
  const element = rootElement.value
  if (!element || typeof document === 'undefined') return
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
      fallbackFullscreen.value = false
      return
    }
    if (element.requestFullscreen) {
      await element.requestFullscreen()
      return
    }
  } catch {
    // Browser fullscreen can be denied; the CSS fallback remains available.
  }
  fallbackFullscreen.value = !fallbackFullscreen.value
}

function scrollTo(target: ProTableScrollTarget): void {
  const root = rootElement.value
  if (!root) return
  const explicitTop = typeof target === 'object' && 'top' in target ? target.top : undefined
  const explicitKey = typeof target === 'object' && 'key' in target ? target.key : undefined
  const inferredKey =
    typeof target === 'object'
      ? explicitKey
      : typeof target === 'number'
        ? findRecord(getRowsData(), target, effectiveRowKey.value)
          ? target
          : undefined
        : target
  const top =
    explicitTop ?? (typeof target === 'number' && inferredKey === undefined ? target : undefined)

  if (top !== undefined) {
    const body = root.querySelector<HTMLElement>('.ant-table-body')
    if (body) body.scrollTop = top
    else root.scrollTop = top
    return
  }
  if (inferredKey === undefined) return
  const escaped =
    typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(String(inferredKey)) : String(inferredKey)
  root
    .querySelector<HTMLElement>(`[data-row-key="${escaped}"]`)
    ?.scrollIntoView({ block: 'nearest' })
}

function startEditable(key: ProKey): boolean {
  return editable.start(key)
}

async function saveEditable(key: ProKey): Promise<boolean> {
  const saved = await editable.save(key)
  if (!saved && editable.validationErrors.value.size > 0) {
    emit('validationError', key, Object.fromEntries(editable.validationErrors.value))
  }
  return saved
}

function cancelEditable(key: ProKey): void {
  editable.cancel(key)
}

function addEditRecord(record: T, options?: Omit<RecordCreatorProps<T>, 'record'>): boolean {
  return editable.add(record, options)
}

function getRowsData(): T[] {
  const materialize = (rows: T[]): T[] =>
    rows.map((row) => {
      const displayed = editable.displayRecord(row)
      if (!Array.isArray(displayed.children)) return { ...displayed }
      return { ...displayed, children: materialize(displayed.children as T[]) }
    })
  return materialize(tableData.value)
}

function getRowData(indexOrKey: number | ProKey): T | undefined {
  const rows = getRowsData()
  return findRowByIndexOrKey(rows, indexOrKey)
}

function setRowData(indexOrKey: number | ProKey, value: Partial<T>): boolean {
  const rows = getRowsData()
  const record = findRowByIndexOrKey(rows, indexOrKey)
  if (!record) return false
  const key = resolveRowKey(record, effectiveRowKey.value)
  if (key === undefined) return false
  if (editable.isEditing(key)) {
    editable.updateRecord(key, value)
    return true
  }
  const next = { ...record, ...value }
  const nextRows = replaceRecord(tableData.value, key, next, effectiveRowKey.value)
  tableData.value = nextRows
  emit('update:dataSource', [...nextRows])
  emit('dataSourceChange', [...nextRows], next)
  return true
}

function findRowByIndexOrKey(rows: T[], indexOrKey: number | ProKey): T | undefined {
  const exactKeyMatch = findRecord(rows, indexOrKey, effectiveRowKey.value)
  if (exactKeyMatch) return exactKeyMatch
  if (
    typeof indexOrKey === 'number' &&
    Number.isInteger(indexOrKey) &&
    indexOrKey >= 0 &&
    indexOrKey < rows.length
  ) {
    return rows[indexOrKey]
  }
  return undefined
}

function submitSearch(): void {
  current.value = 1
  emitTableChange()
  void refresh()
}

function resetSearch(): void {
  searchValues.value = {}
  current.value = 1
  emitTableChange()
  void refresh()
}

function setSearchValue(column: ProColumns<T>, value: unknown): void {
  searchValues.value = { ...searchValues.value, [columnKey(column)]: value }
}

function onPageChange(page: number, size: number): void {
  const sizeChanged = size !== pageSize.value
  pageSize.value = size
  current.value = sizeChanged ? 1 : page
  emitTableChange()
  void refresh()
}

function handleTableChange(
  _pagination: unknown,
  filters: Record<string, unknown[] | null>,
  sorter: unknown,
): void {
  activeFilter.value = normalizeFilters(filters)
  activeSort.value = normalizeSorter(sorter)
  current.value = 1
  emitTableChange()
  void refresh()
}

function emitTableChange(): void {
  emit('change', { ...paginationInfo.value }, { ...activeFilter.value }, { ...activeSort.value })
}

type DecoratedColumn = TableColumnsType<T>[number] & {
  __proColumnKey: string
  __proOrder: number
}

function decorateColumns(columns: ProColumns<T>[], parent = ''): DecoratedColumn[] {
  const result: DecoratedColumn[] = []
  columns.forEach((column, index) => {
    if (column.hideInTable) return
    const key = columnKey(column, `${parent}column-${index}`)
    const state = columnsState.value[key]
    if (state?.show === false) return
    const children = column.columns?.length ? decorateColumns(column.columns, `${key}.`) : undefined
    if (column.columns?.length && !children?.length) return
    result.push({
      key,
      dataIndex: column.dataIndex,
      title: resolveColumnTitle(column),
      width: column.width,
      minWidth: column.minWidth,
      fixed: state?.fixed === false ? undefined : (state?.fixed ?? column.fixed),
      align: column.align,
      ellipsis: column.ellipsis,
      sorter: column.sorter ? true : undefined,
      sortOrder: activeSort.value[key] ?? undefined,
      filters: column.filters,
      filteredValue: activeFilter.value[key] ?? undefined,
      children,
      __proColumnKey: key,
      __proOrder: state?.order ?? index,
    } as DecoratedColumn)
  })
  return result.sort((left, right) => left.__proOrder - right.__proOrder)
}

function resolveColumnTitle(column: ProColumns<T>): VNodeChild {
  const key = columnKey(column)
  const headerSlot = slots[`header-${key}`]
  if (headerSlot) return headerSlot({ column })
  return typeof column.title === 'function' ? column.title(column) : column.title
}

function resolveOriginalColumn(column: unknown): ProColumns<T> | undefined {
  if (!column || typeof column !== 'object') return undefined
  const lookup = column as { __proColumnKey?: unknown; key?: unknown }
  return originalColumnMap.value.get(String(lookup.__proColumnKey ?? lookup.key ?? ''))
}

function cellSlotName(column: ProColumns<T>): string | undefined {
  const key = columnKey(column)
  if (slots[`cell-${key}`]) return `cell-${key}`
  return slots[key] ? key : undefined
}

function getRecordKey(record: T): ProKey | undefined {
  return resolveRowKey(record, effectiveRowKey.value)
}

function getDisplayedRecord(record: T): T {
  return editable.displayRecord(record)
}

function getCellValue(record: T, column: ProColumns<T>, index: number): unknown {
  if (column.valueType === 'index' || column.valueType === 'indexBorder') {
    return (props.pagination === false ? 0 : (current.value - 1) * pageSize.value) + index + 1
  }
  const displayed = getDisplayedRecord(record)
  const value = getValue(displayed, column.dataIndex)
  return column.renderText ? column.renderText(value, displayed, index) : value
}

function getRenderedCell(record: T, column: ProColumns<T>, index: number): VNodeChild {
  const displayed = getDisplayedRecord(record)
  const value = getCellValue(displayed, column, index)
  if (column.render) {
    return column.render(value, {
      record: displayed,
      index,
      column,
      editable: editable.isEditing(getRecordKey(displayed)),
      update: (nextValue) => updateCell(record, column, nextValue),
    })
  }
  return formatProValue(value, fieldOptions(column, displayed), column.valueType)
}

function customEditor(record: T, column: ProColumns<T>, index: number): VNodeChild | undefined {
  if (!column.renderFormItem) return undefined
  const displayed = getDisplayedRecord(record)
  return column.renderFormItem(column, {
    record: displayed,
    index,
    column,
    editable: true,
    update: (value) => updateCell(record, column, value),
  })
}

function updateCell(record: T, column: ProColumns<T>, value: unknown): void {
  const key = getRecordKey(record)
  if (key !== undefined) editable.updateField(key, column.dataIndex, value)
}

function isCellEditable(record: T, column: ProColumns<T>, index: number): boolean {
  return editable.isCellEditable(record, column, index)
}

function isRowEditing(record: T): boolean {
  return editable.isEditing(getRecordKey(record))
}

function isRowSaving(record: T): boolean {
  const key = getRecordKey(record)
  return key !== undefined && editable.savingKeys.value.has(key)
}

function validationMessage(record: T, column: ProColumns<T>): string | undefined {
  const key = getRecordKey(record)
  return key === undefined ? undefined : editable.validationError(key, column)
}

function editRow(record: T): void {
  const key = getRecordKey(record)
  if (key !== undefined) editable.start(key)
}

function saveRow(record: T): void {
  const key = getRecordKey(record)
  if (key !== undefined) void saveEditable(key)
}

function cancelRow(record: T): void {
  const key = getRecordKey(record)
  if (key !== undefined) editable.cancel(key)
}

function removeRow(record: T): void {
  const key = getRecordKey(record)
  if (key !== undefined) void editable.remove(key)
}

function customActions(record: T): VNodeChild | undefined {
  if (!props.editable || !props.editable.actionRender) return undefined
  const key = getRecordKey(record)
  if (key === undefined) return undefined
  const displayed = getDisplayedRecord(record)
  const actions: EditableAction<T> = {
    start: () => editable.start(key),
    save: () => saveEditable(key),
    cancel: () => editable.cancel(key),
    remove: () => editable.remove(key),
    record: displayed,
    editing: editable.isEditing(key),
  }
  return props.editable.actionRender(displayed, actions)
}

function hasCustomActions(): boolean {
  return Boolean(props.editable && props.editable.actionRender)
}

function fieldOptions(column: ProColumns<T>, record?: T): ProFieldOption[] {
  const props = fieldProps(column, record)
  const source: ProFieldOptionSource = {
    valueType: column.valueType,
    valueEnum: column.valueEnum,
  }
  const remoteOptions = remoteColumnOptions.value.get(columnKey(column))
  return resolveFieldOptions(source, remoteOptions, props)
}

function fieldProps(column: ProColumns<T>, record?: T): Record<string, unknown> {
  return typeof column.fieldProps === 'function'
    ? column.fieldProps(record ? getDisplayedRecord(record) : undefined)
    : (column.fieldProps ?? {})
}

function searchFieldProps(column: ProColumns<T>): Record<string, unknown> {
  return fieldProps(column)
}

function searchFormItemProps(column: ProColumns<T>): Record<string, unknown> {
  return typeof column.formItemProps === 'function'
    ? column.formItemProps(undefined)
    : (column.formItemProps ?? {})
}

function searchFieldBindings(column: ProColumns<T>): Record<string, unknown> {
  const resolvedFieldProps: Record<string, unknown> = {
    allowClear: true,
    ...searchFieldProps(column),
  }
  const options = fieldOptions(column)
  const result: Record<string, unknown> = {
    fieldMode: 'form-item',
    fieldType:
      column.valueType ??
      (options.length > 0 || column.valueEnum !== undefined ? 'select' : 'text'),
    modelValue: searchValues.value[columnKey(column)],
    name: column.dataIndex,
    label: resolveColumnTitle(column),
    fieldProps: resolvedFieldProps,
    formItemProps: searchFormItemProps(column),
    loading: isOptionLoading(column),
  }

  if (
    options.length > 0 ||
    column.request !== undefined ||
    column.valueEnum !== undefined ||
    Array.isArray(resolvedFieldProps.options) ||
    Array.isArray(resolvedFieldProps.treeData)
  ) {
    result.options = options
  }

  return result
}

function isOptionLoading(column: ProColumns<T>): boolean {
  return loadingOptionKeys.value.has(columnKey(column))
}

async function loadColumnOptions(): Promise<void> {
  const sequence = ++optionRequestSequence
  const requestColumns = flattenColumns(props.columns).filter(
    (column): column is ProColumns<T> & Required<Pick<ProColumns<T>, 'request'>> =>
      typeof column.request === 'function',
  )
  loadingOptionKeys.value = new Set(requestColumns.map((column) => columnKey(column)))
  const results = await Promise.all(
    requestColumns.map(async (column) => {
      try {
        const options = await column.request(column.params)
        return {
          column,
          key: columnKey(column),
          options: options.map(normalizeFieldOption),
        }
      } catch (error) {
        return { column, key: columnKey(column), error }
      }
    }),
  )
  if (sequence !== optionRequestSequence) return

  const requestKeys = new Set(requestColumns.map((column) => columnKey(column)))
  const nextOptions = new Map(remoteColumnOptions.value)
  for (const key of nextOptions.keys()) {
    if (!requestKeys.has(key)) nextOptions.delete(key)
  }
  for (const result of results) {
    if ('error' in result) continue
    nextOptions.set(result.key, result.options)
  }
  remoteColumnOptions.value = nextOptions
  loadingOptionKeys.value = new Set()

  for (const result of results) {
    if ('error' in result) result.column.onFieldRequestError?.(result.error)
  }
}

function searchFieldStyle(): CSSProperties {
  const labelWidth = searchConfig.value.labelWidth
  return labelWidth === undefined
    ? {}
    : {
        gridTemplateColumns:
          labelWidth === 'auto' ? 'auto minmax(0, 1fr)' : `${labelWidth}px minmax(0, 1fr)`,
      }
}

function toggleSearchCollapsed(): void {
  const next = !searchCollapsed.value
  if (searchConfig.value.collapsed === undefined) internalSearchCollapsed.value = next
  searchConfig.value.onCollapse?.(next)
  emit('searchCollapse', next)
}

function updateColumnVisibility(column: ProColumns<T>, checked: boolean): void {
  const key = columnKey(column)
  updateColumnsState(key, { show: checked })
}

function updateColumnsState(key: string, value: Partial<ProColumnsState>): void {
  columnsState.value = {
    ...columnsState.value,
    [key]: { ...columnsState.value[key], ...value },
  }
  persistColumnsState(columnsState.value, props.columnsState)
}

function isColumnVisible(column: ProColumns<T>): boolean {
  return columnsState.value[columnKey(column)]?.show !== false
}

function cycleDensity(): void {
  density.value =
    density.value === 'middle' ? 'small' : density.value === 'small' ? 'large' : 'middle'
}

function showOption(option: 'density' | 'fullScreen' | 'reload' | 'setting'): boolean {
  if (props.options === false) return false
  return props.options?.[option] !== false
}

function optionText(option: 'density' | 'fullScreen' | 'reload' | 'setting'): string {
  if (option === 'density')
    return density.value === 'small'
      ? localeText.value.densityCompact
      : density.value === 'large'
        ? localeText.value.densityLoose
        : localeText.value.densityDefault
  if (option === 'fullScreen') return localeText.value.fullScreen
  if (option === 'reload') return localeText.value.reload
  return localeText.value.setting
}

async function copyCell(record: T, column: ProColumns<T>, index: number): Promise<void> {
  if (typeof navigator === 'undefined' || !navigator.clipboard) return
  await navigator.clipboard.writeText(String(getCellValue(record, column, index) ?? ''))
}

function configurePolling(): void {
  if (pollingTimer) clearInterval(pollingTimer)
  pollingTimer = undefined
  if (!mounted.value || !props.request || !props.polling || props.polling <= 0) return
  pollingTimer = setInterval(() => {
    if (typeof document === 'undefined' || !document.hidden) void refresh()
  }, props.polling)
}

function onWindowFocus(): void {
  if (props.revalidateOnFocus && props.request) void refresh()
}

function onFullscreenChange(): void {
  if (typeof document !== 'undefined' && document.fullscreenElement)
    fallbackFullscreen.value = false
}

function normalizeFilters(filters: Record<string, unknown[] | null>): ProFilter {
  return Object.fromEntries(
    Object.entries(filters).map(([key, values]) => [
      key,
      values?.filter((value): value is ProKey => ['string', 'number'].includes(typeof value)) ??
        null,
    ]),
  )
}

function normalizeSorter(sorter: unknown): ProSort {
  const list = Array.isArray(sorter) ? sorter : [sorter]
  const result: ProSort = {}
  for (const item of list) {
    if (!item || typeof item !== 'object') continue
    const value = item as Record<string, unknown>
    const key = value.columnKey ?? value.field
    const order = value.order
    if (
      (typeof key === 'string' || typeof key === 'number') &&
      (order === 'ascend' || order === 'descend')
    ) {
      result[String(key)] = order
    }
  }
  return result
}

function cloneState(state: Record<string, ProColumnsState>): Record<string, ProColumnsState> {
  return Object.fromEntries(Object.entries(state).map(([key, value]) => [key, { ...value }]))
}

onMounted(() => {
  mounted.value = true
  window.addEventListener('focus', onWindowFocus)
  document.addEventListener('fullscreenchange', onFullscreenChange)
  configurePolling()
  if (props.request && !props.manualRequest) void refresh()
})

onBeforeUnmount(() => {
  requestSequence += 1
  optionRequestSequence += 1
  if (pollingTimer) clearInterval(pollingTimer)
  window.removeEventListener('focus', onWindowFocus)
  document.removeEventListener('fullscreenchange', onFullscreenChange)
})

defineExpose<
  ProTableInstance<T> & {
    getRowData: (indexOrKey: number | ProKey) => T | undefined
    getRowsData: () => T[]
    setRowData: (indexOrKey: number | ProKey, value: Partial<T>) => boolean
  }
>({
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
  <div ref="rootElement" class="antdv-next-pro" :class="fullscreenClass" :style="rootStyle">
    <div v-if="showToolbar" class="antdv-next-pro__toolbar">
      <div v-if="showToolbarTitle" class="antdv-next-pro__toolbar-title">
        <slot name="toolbar-title">
          <RenderNode v-if="toolbarTitle !== undefined" :content="toolbarTitle" />
        </slot>
      </div>
      <div class="antdv-next-pro__toolbar-actions">
        <slot name="toolbar-actions">
          <RenderNode v-if="toolbarActions !== undefined" :content="toolbarActions" />
        </slot>
        <Button
          v-if="showOption('density')"
          type="text"
          size="small"
          :aria-label="optionText('density')"
          :title="optionText('density')"
          @click="cycleDensity"
        >
          <template #icon><ColumnHeightOutlined /></template>
        </Button>
        <Button
          v-if="showOption('reload')"
          type="text"
          size="small"
          :loading="effectiveLoading"
          :aria-label="optionText('reload')"
          :title="optionText('reload')"
          @click="reload()"
        >
          <template #icon><ReloadOutlined /></template>
        </Button>
        <Button
          v-if="showOption('fullScreen')"
          type="text"
          size="small"
          :aria-label="optionText('fullScreen')"
          :title="optionText('fullScreen')"
          @click="fullScreen"
        >
          <template #icon><FullscreenOutlined /></template>
        </Button>
        <Button
          v-if="showOption('setting')"
          type="text"
          size="small"
          :aria-label="optionText('setting')"
          :title="optionText('setting')"
          @click="settingsOpen = !settingsOpen"
        >
          <template #icon><SettingOutlined /></template>
        </Button>
      </div>
    </div>

    <div v-if="settingsOpen" class="antdv-next-pro__column-settings">
      <Checkbox
        v-for="(column, index) in flattenColumns(effectiveColumns).filter(
          (item) => item.valueType !== 'option' && !item.hideInTable,
        )"
        :key="columnKey(column, String(index))"
        :checked="isColumnVisible(column)"
        @update:checked="updateColumnVisibility(column, Boolean($event))"
      >
        {{ resolveColumnTitle(column) }}
      </Checkbox>
    </div>

    <form
      v-if="props.search !== false && searchableColumns.length > 0"
      class="antdv-next-pro__search"
      @submit.prevent="submitSearch"
    >
      <div class="antdv-next-pro__search-fields" :style="searchGridStyle">
        <ProFormField
          v-for="(column, index) in visibleSearchableColumns"
          :key="columnKey(column, String(index))"
          v-bind="searchFieldBindings(column)"
          class="antdv-next-pro__search-field"
          :style="searchFieldStyle()"
          @update:model-value="setSearchValue(column, $event)"
        />
        <div class="antdv-next-pro__search-actions">
          <Button html-type="button" @click="resetSearch">
            {{
              typeof props.search === 'object'
                ? (props.search.resetText ?? localeText.reset)
                : localeText.reset
            }}
          </Button>
          <Button type="primary" html-type="submit">
            {{
              typeof props.search === 'object'
                ? (props.search.searchText ?? localeText.search)
                : localeText.search
            }}
          </Button>
          <Button
            v-if="showSearchCollapse"
            class="antdv-next-pro__search-collapse"
            type="link"
            html-type="button"
            icon-placement="end"
            :aria-expanded="!searchCollapsed"
            @click="toggleSearchCollapsed"
          >
            {{ searchCollapsed ? localeText.expand : localeText.collapse }}
            <template #icon>
              <DownOutlined v-if="searchCollapsed" aria-hidden="true" />
              <UpOutlined v-else aria-hidden="true" />
            </template>
          </Button>
        </div>
      </div>
    </form>

    <Table
      :columns="tableColumns"
      :data-source="displayedData"
      :row-key="effectiveRowKey"
      :loading="effectiveLoading"
      :pagination="false"
      :row-selection="rowSelectionConfig"
      :scroll="props.scroll"
      :size="density"
      :bordered="props.bordered"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record, index }">
        <template v-if="resolveOriginalColumn(column)">
          <slot
            v-if="cellSlotName(resolveOriginalColumn(column)!)"
            :name="cellSlotName(resolveOriginalColumn(column)!)!"
            :value="getCellValue(record, resolveOriginalColumn(column)!, index)"
            :record="getDisplayedRecord(record)"
            :index="index"
            :column="resolveOriginalColumn(column)!"
            :editable="isRowEditing(record)"
          />

          <template v-else-if="resolveOriginalColumn(column)!.valueType === 'option'">
            <RenderNode v-if="hasCustomActions()" :content="customActions(record)" />
            <Space v-else-if="isRowEditing(record)" size="small">
              <Button
                type="link"
                size="small"
                :loading="isRowSaving(record)"
                @click="saveRow(record)"
              >
                保存
              </Button>
              <Button type="link" size="small" @click="cancelRow(record)"> 取消 </Button>
            </Space>
            <Space v-else size="small">
              <Button type="link" size="small" @click="editRow(record)"> 编辑 </Button>
              <Popconfirm title="确认删除此行？" @confirm="removeRow(record)">
                <Button danger type="link" size="small"> 删除 </Button>
              </Popconfirm>
            </Space>
          </template>

          <div
            v-else-if="isCellEditable(record, resolveOriginalColumn(column)!, index)"
            class="antdv-next-pro__editable-cell"
          >
            <RenderNode
              v-if="resolveOriginalColumn(column)!.renderFormItem"
              :content="customEditor(record, resolveOriginalColumn(column)!, index)"
            />
            <ValueTypeControl
              v-else
              :column="resolveOriginalColumn(column)!"
              :value="getCellValue(record, resolveOriginalColumn(column)!, index)"
              :options="fieldOptions(resolveOriginalColumn(column)!, record)"
              :loading="isOptionLoading(resolveOriginalColumn(column)!)"
              :field-props="fieldProps(resolveOriginalColumn(column)!, record)"
              @update:value="updateCell(record, resolveOriginalColumn(column)!, $event)"
            />
            <div
              v-if="validationMessage(record, resolveOriginalColumn(column)!)"
              class="antdv-next-pro__validation-error"
            >
              {{ validationMessage(record, resolveOriginalColumn(column)!) }}
            </div>
          </div>

          <span v-else class="antdv-next-pro__cell-value">
            <RenderNode :content="getRenderedCell(record, resolveOriginalColumn(column)!, index)" />
            <Button
              v-if="resolveOriginalColumn(column)!.copyable"
              class="antdv-next-pro__copy"
              type="link"
              size="small"
              @click="copyCell(record, resolveOriginalColumn(column)!, index)"
            >
              复制
            </Button>
          </span>
        </template>
      </template>
      <template v-for="(_, name) in slots" #[name]="slotProps">
        <slot
          v-if="!String(name).startsWith('cell-') && !String(name).startsWith('header-')"
          :name="name"
          v-bind="slotProps ?? {}"
        />
      </template>
    </Table>

    <div v-if="props.pagination !== false" class="antdv-next-pro__pagination">
      <Pagination
        :current="current"
        :page-size="pageSize"
        :total="total"
        :show-size-changer="paginationOptions?.showSizeChanger"
        :page-size-options="paginationOptions?.pageSizeOptions"
        @change="onPageChange"
      />
    </div>
  </div>
</template>

<style scoped>
.antdv-next-pro {
  color: var(--antdv-next-pro-color-text);
}

.antdv-next-pro:fullscreen,
.antdv-next-pro__fullscreen {
  background: var(--antdv-next-pro-color-bg-container, #fff);
}

.antdv-next-pro__toolbar-title {
  min-width: 0;
  font-size: 16px;
  font-weight: 600;
}

.antdv-next-pro__toolbar-actions {
  margin-inline-start: auto;
}

.antdv-next-pro__column-settings {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-block: -8px 16px;
  padding: 12px;
  border: 1px solid var(--antdv-next-pro-color-border-secondary);
  border-radius: 8px;
  background: var(--antdv-next-pro-color-bg-elevated);
  box-shadow: var(--antdv-next-pro-box-shadow-secondary);
}

.antdv-next-pro__search {
  padding: 16px;
  border-radius: 8px;
  background: var(--antdv-next-pro-color-fill-alter, rgba(0, 0, 0, 0.02));
}

.antdv-next-pro__search-fields {
  display: grid;
  grid-template-columns: repeat(var(--antdv-next-pro-search-columns, 3), minmax(0, 1fr));
  align-items: center;
  gap: 16px;
}

.antdv-next-pro__search-field {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  margin-block-end: 0;
}

.antdv-next-pro__search-label {
  white-space: nowrap;
}

.antdv-next-pro__search-actions {
  display: flex;
  grid-column: -2 / -1;
  align-items: center;
  justify-content: flex-end;
  justify-self: end;
  gap: 8px;
  white-space: nowrap;
}

.antdv-next-pro__editable-cell :deep(.ant-input),
.antdv-next-pro__editable-cell :deep(.ant-input-number),
.antdv-next-pro__editable-cell :deep(.ant-select) {
  width: 100%;
}

.antdv-next-pro__validation-error {
  margin-block-start: 4px;
  color: var(--antdv-next-pro-color-error, #ff4d4f);
  font-size: 12px;
}

.antdv-next-pro__cell-value {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.antdv-next-pro__copy {
  padding-inline: 2px;
}

.antdv-next-pro__pagination {
  display: flex;
  justify-content: flex-end;
  margin-block-start: 16px;
}

@media (width <= 768px) {
  .antdv-next-pro__search-fields {
    grid-template-columns: 1fr;
  }

  .antdv-next-pro__search-actions {
    grid-column: 1 / -1;
  }
}
</style>
