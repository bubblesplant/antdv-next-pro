<script
  setup
  lang="ts"
  generic="
    T extends Record<string, unknown> = Record<string, unknown>,
    P extends Record<string, unknown> = Record<string, unknown>
  "
>
import type { TableColumnsType, FormInstance } from 'antdv-next'
import type { CSSProperties, VNodeChild, VNode } from 'vue'
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
  SchemaFormInstance,
  RecordCreatorProps,
} from './types'

import {
  ColumnHeightOutlined,
  FullscreenOutlined,
  HolderOutlined,
  ReloadOutlined,
  SettingOutlined,
} from '@antdv-next/icons'
import {
  Button,
  Form,
  FormItem,
  Select,
  Checkbox,
  InputSearch,
  Pagination,
  Popconfirm,
  Popover,
  Space,
  Table,
  Tooltip,
} from 'antdv-next'
import {
  computed,
  h,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  useSlots,
  useAttrs,
  getCurrentInstance,
  watch,
  provide,
} from 'vue'
import { useProPrefix, useIntl, useProConfig } from './provider'
import { ProField } from './pro-field'
import Search from './components/Search.vue'
import ListToolBar from './components/ListToolBar.vue'
import RenderView from './components/RenderView.vue'
import ErrorBoundary from './components/ErrorBoundary.vue'

import ProCard from './ProCard.vue'
import { useThemeVars } from './shared/useThemeVars'
import RenderNode from './table/RenderNode.vue'
import { resolveColumnValueType } from './table/valueType'
import { proTableViewKey } from './table/viewContext'
import { useEditableTable, validateEditableRecord } from './table/editable'
import {
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

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<ProTableProps<T, P>>(), {
  toolbar: undefined,
  headerTitle: undefined,
  toolBarRender: undefined,
  tableAlertRender: undefined,
  tableAlertOptionRender: undefined,
  cardProps: undefined,
  ErrorBoundary: undefined,
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

defineSlots<{ [name: string]: ((props: any) => VNodeChild) | undefined }>()
const NativeTable = Table<T>
const attrs = useAttrs()
const instance = getCurrentInstance()

const DEFAULT_LOCALE_TEXT: ProTableLocaleText = {
  search: '查询',
  reset: '重置',
  expand: '展开',
  collapse: '收起',
  density: '密度',
  densityDefault: '中等',
  densityCompact: '紧凑',
  densityLoose: '宽松',
  fullScreen: '全屏',
  reload: '刷新',
  setting: '列设置',
  columnDisplay: '列展示',
  columnDrag: '拖动排序',
}

const prefix = useProPrefix('table', () => props.prefixCls)
const intl = useIntl()
const { nativeConfig, direction } = useProConfig()
const slots = useSlots()
const searchRef = ref<SchemaFormInstance<T>>()
const selectedRows = shallowRef<T[]>([])
const submittedSearch = ref<Record<string, unknown>>({})
const searchRequestParams = shallowRef<Record<string, unknown>>({})
let resettingAction = false
const PRO_PROPS = new Set([
  'ErrorBoundary',
  'onSubmit',
  'onReset',
  'onLoadingChange',
  'columns',
  'dataSource',
  'defaultDataSource',
  'request',
  'params',
  'postData',
  'rowKey',
  'loading',
  'search',
  'localeText',
  'pagination',
  'options',
  'toolbar',
  'rowSelection',
  'polling',
  'revalidateOnFocus',
  'manualRequest',
  'columnsState',
  'editable',
  'editableKeys',
  'scroll',
  'size',
  'bordered',
  'prefixCls',
  'headerTitle',
  'tooltip',
  'form',
  'formRef',
  'beforeSearchSubmit',
  'dateFormatter',
  'debounceTime',
  'toolBarRender',
  'optionsRender',
  'tableRender',
  'tableViewRender',
  'tableExtraRender',
  'searchFormRender',
  'tableAlertRender',
  'tableAlertOptionRender',
  'cardProps',
  'cardBordered',
  'tableClassName',
  'tableStyle',
  'classes',
  'styles',
])
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
          typeof key === 'string' &&
          !PRO_PROPS.has(key) &&
          !['class', 'style', 'onChange', 'ref', 'key'].includes(key),
      ),
  )
})
const tableCardProps = computed(() => {
  const bordered =
    typeof props.cardBordered === 'object' ? props.cardBordered.table : props.cardBordered
  return props.cardProps === false
    ? { ghost: true, variant: 'borderless' as const }
    : {
        variant: 'borderless' as const,
        ...props.cardProps,
        ...(bordered === undefined
          ? {}
          : { bordered, variant: bordered ? ('outlined' as const) : ('borderless' as const) }),
      }
})
function findPart(dom: VNodeChild, part: string): VNodeChild {
  for (const node of Array.isArray(dom) ? dom : [dom]) {
    if (!node || typeof node !== 'object' || !('type' in node)) continue
    const vnode = node as VNode
    if (vnode.props?.['data-pro-part'] === part) return vnode
    const children = Array.isArray(vnode.children)
      ? vnode.children
      : vnode.children &&
          typeof vnode.children === 'object' &&
          'default' in vnode.children &&
          typeof vnode.children.default === 'function'
        ? vnode.children.default()
        : undefined
    const found = findPart(children, part)
    if (found) return found
  }
}
function renderOptions(dom: VNodeChild): VNodeChild {
  return props.optionsRender ? props.optionsRender(props, Array.isArray(dom) ? dom : [dom]) : dom
}

function renderTableRoot(dom: VNodeChild): VNodeChild {
  return props.tableRender
    ? props.tableRender(props, dom, {
        toolbar: findPart(dom, 'toolbar'),
        alert: findPart(dom, 'alert'),
        table: findPart(dom, 'table'),
      })
    : dom
}
const action = {
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
}

provide(proTableViewKey, { renderCell: renderViewCell })
const rootElement = ref<HTMLElement>()
const tableData = shallowRef<T[]>([...(props.dataSource ?? props.defaultDataSource ?? [])])
const internalLoading = ref(false)
const requestTotal = ref<number>()
const toolbarKeyword = ref('')
const submittedKeyword = ref('')
const internalSearchCollapsed = ref(
  typeof props.search === 'object' ? (props.search.defaultCollapsed ?? true) : true,
)
const activeSort = ref<ProSort>({})
const activeFilter = ref<ProFilter>({})
const editableKeys = ref<ProKey[]>([...(props.editableKeys ?? [])])
const internalSelectedKeys = ref<ProKey[]>([])
const selectedKeys = computed<ProKey[]>(() =>
  props.rowSelection && Array.isArray(props.rowSelection.selectedRowKeys)
    ? props.rowSelection.selectedRowKeys
    : internalSelectedKeys.value,
)
const editingForm = ref<FormInstance>()
watch(
  [() => (props.editable ? props.editable.formRef : undefined), editingForm],
  ([target, value], [previous]) => {
    if (previous && previous !== target) previous.value = undefined
    if (target) target.value = props.editable ? value : undefined
  },
)
onBeforeUnmount(() => {
  const target = props.editable && props.editable.formRef
  if (target) target.value = undefined
})
function editorName(record: T, column: ProColumns<T>) {
  return [
    String(getRecordKey(record)),
    ...(Array.isArray(column.dataIndex)
      ? column.dataIndex
      : [column.dataIndex ?? columnKey(column)]),
  ]
}
function editorItemProps(record: T, column: ProColumns<T>) {
  return typeof column.formItemProps === 'function'
    ? column.formItemProps(getDisplayedRecord(record))
    : column.formItemProps
}
function editText(action: 'save' | 'cancel' | 'delete', fallback: string): VNodeChild {
  const config = props.editable
  return config && config[`${action}Text`] != null
    ? config[`${action}Text`]
    : intl.value.getMessage(`editableTable.action.${action}`, fallback)
}
const settingsOpen = ref(false)
const densityOpen = ref(false)
const draggedColumnKey = ref<string>()
const fallbackFullscreen = ref(false)
const density = ref<'small' | 'middle' | 'large'>(
  props.size ??
    (nativeConfig.value.componentSize === 'small'
      ? 'small'
      : nativeConfig.value.componentSize === 'large'
        ? 'large'
        : 'middle'),
)
const columnsState = ref<Record<string, ProColumnsState>>(loadColumnsState(props.columnsState))
const remoteColumnOptions = shallowRef(new Map<string, ProFieldOption[]>())
const loadingOptionKeys = shallowRef(new Set<string>())
const mounted = ref(false)
let requestSequence = 0
let optionRequestSequence = 0
let pollingTimer: ReturnType<typeof setTimeout> | undefined
let debounceTimer: ReturnType<typeof setTimeout> | undefined
let toolbarSearchSequence = 0

const localeText = computed<ProTableLocaleText>(() => ({
  ...DEFAULT_LOCALE_TEXT,
  search: intl.value.getMessage('tableForm.search', DEFAULT_LOCALE_TEXT.search),
  reset: intl.value.getMessage('tableForm.reset', DEFAULT_LOCALE_TEXT.reset),
  expand: intl.value.getMessage('tableForm.collapsed', DEFAULT_LOCALE_TEXT.expand),
  collapse: intl.value.getMessage('tableForm.expand', DEFAULT_LOCALE_TEXT.collapse),
  density: intl.value.getMessage('tableToolBar.density', DEFAULT_LOCALE_TEXT.density!),
  reload: intl.value.getMessage('tableToolBar.reload', DEFAULT_LOCALE_TEXT.reload),
  fullScreen: intl.value.getMessage('tableToolBar.fullScreen', DEFAULT_LOCALE_TEXT.fullScreen),
  setting: intl.value.getMessage('tableToolBar.columnSetting', DEFAULT_LOCALE_TEXT.setting),
  densityLoose: intl.value.getMessage(
    'tableToolBar.densityLarger',
    DEFAULT_LOCALE_TEXT.densityLoose,
  ),
  densityDefault: intl.value.getMessage(
    'tableToolBar.densityMiddle',
    DEFAULT_LOCALE_TEXT.densityDefault,
  ),
  densityCompact: intl.value.getMessage(
    'tableToolBar.densitySmall',
    DEFAULT_LOCALE_TEXT.densityCompact,
  ),
  ...props.localeText,
}))
const rootStyle = useThemeVars()

const toolbarSearch = computed(() => {
  if (props.toolbar === false) return false
  const toolbar = typeof props.toolbar === 'object' ? props.toolbar : undefined
  return toolbar?.search ?? (typeof props.options === 'object' ? props.options.search : false)
})
const toolbarSearchConfig = computed(() =>
  typeof toolbarSearch.value === 'object' ? toolbarSearch.value : {},
)
const toolbarSearchBindings = computed(() => {
  const { name: _name, onSearch: _onSearch, ...fieldProps } = toolbarSearchConfig.value
  return { placeholder: localeText.value.search, allowClear: true, ...fieldProps }
})
const toolbarSearchParams = computed(() =>
  toolbarSearch.value && submittedKeyword.value
    ? { [toolbarSearchConfig.value.name ?? 'keyword']: submittedKeyword.value }
    : {},
)

const initialCurrent = () => {
  if (props.pagination === false || props.pagination?.type === 'cursor') return 1
  return props.pagination?.current ?? props.pagination?.defaultCurrent ?? 1
}

const initialPageSize = () => {
  if (props.pagination === false) return 10
  return props.pagination?.pageSize ?? props.pagination?.defaultPageSize ?? 10
}

const current = ref(initialCurrent())
const pageSize = ref(initialPageSize())
const cursorPagination = computed(() =>
  Boolean(props.request && props.pagination && props.pagination.type === 'cursor'),
)
const nextToken = ref<string>()
let cursorHistory: Array<string | undefined> = [undefined]
function resetCursor() {
  cursorHistory = [undefined]
  nextToken.value = undefined
}
function canGoToPage(page: number) {
  return (
    !cursorPagination.value ||
    page === 1 ||
    (page <= cursorHistory.length && cursorHistory[page - 1] !== undefined)
  )
}

const effectiveRowKey = computed<string | ((record: T) => ProKey)>(() =>
  typeof props.rowKey === 'function' ? props.rowKey : String(props.rowKey ?? 'id'),
)

const effectiveColumns = computed<ProColumns<T>[]>(() => {
  const source = [...props.columns]
  const hasOptionColumn = flattenColumns(source).some(
    (column) => column.valueType === 'option' && !column.hideInTable,
  )
  if (props.editable && !hasOptionColumn) {
    source.push({
      key: '__pro_actions',
      title: intl.value.getMessage('table.operation', '操作'),
      valueType: 'option',
      width: 160,
    })
  }
  return source
})

const searchableColumns = computed(() =>
  flattenColumns(effectiveColumns.value).filter(
    (column) =>
      column.dataIndex !== undefined &&
      !column.hideInSearch &&
      column.search !== false &&
      !['option', 'index', 'indexBorder'].includes(
        typeof column.valueType === 'string' ? column.valueType : 'text',
      ),
  ),
)

const searchFormColumns = computed<ProColumns<T>[]>(() =>
  searchableColumns.value.map((column) => {
    const { request, onFieldRequestError, ...rest } = column
    const options = fieldOptions(column)
    return {
      ...rest,
      valueEnum: remoteColumnOptions.value.has(columnKey(column)) ? undefined : column.valueEnum,
      fieldProps: (record) => ({
        ...fieldProps(column, record),
        ...(request || options.length || Array.isArray(fieldProps(column, record).options)
          ? { options }
          : {}),
        loading: isOptionLoading(column),
      }),
    }
  }),
)
const settingsConfig = computed(() =>
  props.options && typeof props.options.setting === 'object' ? props.options.setting : {},
)
const fixedOptions = computed(() => [
  { value: 'none', label: intl.value.getMessage('tableToolBar.noFixed', '不固定') },
  { value: 'left', label: intl.value.getMessage('tableToolBar.leftFixedTitle', '固定在左侧') },
  { value: 'right', label: intl.value.getMessage('tableToolBar.rightFixedTitle', '固定在右侧') },
])
watch(
  () => [selectedKeys.value, tableData.value] as const,
  () => {
    selectedRows.value = selectedKeys.value
      .map((key) => findRecord(tableData.value, key, effectiveRowKey.value))
      .filter((record): record is T => record !== undefined)
  },
  { deep: true, immediate: true },
)

const searchConfig = computed(() => (typeof props.search === 'object' ? props.search : {}))
const searchCollapsed = computed(() =>
  searchConfig.value.collapsed === undefined
    ? internalSearchCollapsed.value
    : searchConfig.value.collapsed,
)

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
        props.search === false ? {} : submittedSearch.value,
        activeSort.value,
        activeFilter.value,
      ),
)

const keywordQueriedData = computed(() => {
  if (props.request || !toolbarSearch.value || !submittedKeyword.value)
    return locallyQueriedData.value
  const keyword = submittedKeyword.value.toLocaleLowerCase()
  return locallyQueriedData.value.filter((record) =>
    flattenColumns(effectiveColumns.value).some((column) => {
      if (column.dataIndex === undefined || column.valueType === 'option') return false
      return String(getValue(record, column.dataIndex) ?? '')
        .toLocaleLowerCase()
        .includes(keyword)
    }),
  )
})

const total = computed(() =>
  cursorPagination.value
    ? current.value * pageSize.value + (nextToken.value ? 1 : 0)
    : props.request
      ? (requestTotal.value ??
        (props.pagination === false ? undefined : props.pagination?.total) ??
        keywordQueriedData.value.length)
      : props.pagination === false
        ? keywordQueriedData.value.length
        : (props.pagination?.total ?? keywordQueriedData.value.length),
)

const displayedData = computed(() => {
  if (props.pagination === false || props.request) return keywordQueriedData.value
  const start = Math.max(0, (current.value - 1) * pageSize.value)
  return keywordQueriedData.value.slice(start, start + pageSize.value)
})

const effectiveLoading = computed(() =>
  typeof props.loading === 'object'
    ? { ...props.loading, spinning: props.loading.spinning ?? internalLoading.value }
    : Boolean(props.loading) || internalLoading.value,
)
watch(
  () =>
    typeof effectiveLoading.value === 'object'
      ? Boolean(effectiveLoading.value.spinning)
      : effectiveLoading.value,
  (value) => props.onLoadingChange?.(value),
)
const paginationInfo = computed<ProTablePagination>(() => ({
  ...(cursorPagination.value ? { type: 'cursor' as const, nextToken: nextToken.value } : {}),
  current: current.value,
  pageSize: pageSize.value,
  total: total.value,
}))

const nativePaginationProps = computed(() => {
  if (!props.pagination) return {}
  const { type: _type, nextToken: _nextToken, onChange: _onChange, ...rest } = props.pagination
  if (!cursorPagination.value) return rest
  const itemRender: NonNullable<ProTablePagination['itemRender']> = (page, itemType, element) =>
    itemType === 'prev' || itemType === 'next'
      ? (rest.itemRender?.(page, itemType, element) ?? element)
      : null
  return {
    ...rest,
    showQuickJumper: false,
    showSizeChanger: false,
    showTotal: undefined,
    itemRender,
  }
})
const paginationOptions = computed(() => {
  if (props.pagination === false) return undefined
  return {
    showSizeChanger: cursorPagination.value ? false : (props.pagination?.showSizeChanger ?? true),
    pageSizeOptions: props.pagination?.pageSizeOptions ?? [10, 20, 50, 100],
  }
})

const editable = useEditableTable<T>({
  rows: tableData,
  columns: () => effectiveColumns.value,
  rowKey: () => effectiveRowKey.value,
  editable: () => props.editable,
  editableKeys,
  getMessage: (key, fallback) => intl.value.getMessage(key, fallback),
  async validateRecord(key, record) {
    const errors = new Map<string, string>()
    const fields = flattenColumns(effectiveColumns.value).filter(
      (column) =>
        column.dataIndex !== undefined &&
        !column.readonly &&
        (typeof column.editable === 'function'
          ? column.editable(record, 0)
          : column.editable !== false) &&
        resolveColumnValueType(column.valueType, record, 0).type !== 'option',
    )
    if (!editingForm.value || typeof editingForm.value.validateFields !== 'function')
      return validateEditableRecord(record, effectiveColumns.value, (key, fallback) =>
        intl.value.getMessage(key, fallback),
      )
    try {
      await editingForm.value.validateFields(fields.map((column) => editorName(record, column)))
    } catch {
      for (const item of editingForm.value.getFieldsError(
        fields.map((column) => editorName(record, column)),
      )) {
        const column = fields.find(
          (field) => JSON.stringify(editorName(record, field)) === JSON.stringify(item.name),
        )
        if (column && item.errors.length) errors.set(columnKey(column), item.errors.join('; '))
      }
    }
    return errors
  },
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

interface SettingsColumn {
  column: ProColumns<T>
  key: string
  parent: string
  index: number
}

function collectSettingsColumns(columns: ProColumns<T>[], parent = ''): SettingsColumn[] {
  return columns
    .map((column, index) => ({
      column,
      key: columnKey(column, `${parent}column-${index}`),
      parent,
      index,
    }))
    .filter(({ column }) => !column.hideInTable)
    .sort(
      (left, right) =>
        (columnsState.value[left.key]?.order ?? left.index) -
        (columnsState.value[right.key]?.order ?? right.index),
    )
    .flatMap((entry) =>
      (entry.column.children ?? entry.column.columns)?.length
        ? collectSettingsColumns((entry.column.children ?? entry.column.columns)!, `${entry.key}.`)
        : [entry],
    )
}

const settingsColumns = computed(() => collectSettingsColumns(effectiveColumns.value))
const settingsGroups = computed(() => {
  const groups = fixedOptions.value.map((option) => ({
    ...option,
    entries: settingsColumns.value.filter((entry) => {
      const fixed = columnsState.value[entry.key]?.fixed ?? entry.column.fixed
      return option.value === 'none' ? !fixed : fixed === option.value
    }),
  }))
  const grouped = groups.some((group) => group.value !== 'none' && group.entries.length)
  return [groups[1]!, groups[0]!, groups[2]!]
    .filter((group) => group.entries.length)
    .map((group) => ({ ...group, showTitle: grouped }))
})
function settingTitle(entry: SettingsColumn): VNodeChild {
  const dom = resolveColumnTitle(entry.column)
  return settingsConfig.value.listItemTitleRender?.(dom, entry.column) ?? dom
}
const visibleSettingsColumnCount = computed(
  () => settingsColumns.value.filter(({ key }) => columnsState.value[key]?.show !== false).length,
)
const densityOptions = computed(() => [
  { value: 'large' as const, label: localeText.value.densityLoose },
  { value: 'middle' as const, label: localeText.value.densityDefault },
  { value: 'small' as const, label: localeText.value.densityCompact },
])

watch(settingsOpen, (open) => {
  draggedColumnKey.value = undefined
  if (open) densityOpen.value = false
})
watch(densityOpen, (open) => {
  if (open) settingsOpen.value = false
})

const rowSelectionConfig = computed<import('./types').ProTableRowSelection<T> | undefined>(() => {
  if (props.rowSelection === false || props.rowSelection === undefined) return undefined
  const source = props.rowSelection
  const controlledKeys = Array.isArray(source.selectedRowKeys)
    ? (source.selectedRowKeys as ProKey[])
    : selectedKeys.value
  const originalOnChange = source.onChange
  return {
    ...source,
    selectedRowKeys: controlledKeys,
    onChange(keys: ProKey[], rows: T[], info) {
      internalSelectedKeys.value = [...keys]
      selectedRows.value = [...rows]
      if (typeof originalOnChange === 'function') originalOnChange(keys, rows, info)
      emit('selectionChange', [...keys], rows)
    },
  }
})

const showToolbar = computed(
  () =>
    props.toolbar !== false &&
    (props.toolbar !== undefined ||
      props.headerTitle !== undefined ||
      props.toolBarRender !== false ||
      props.options !== false ||
      Boolean(slots['toolbar-title'] || slots['toolbar-actions'])),
)

const toolbarTitle = computed(() =>
  props.toolbar && typeof props.toolbar === 'object'
    ? (props.toolbar.title ?? props.headerTitle)
    : props.headerTitle,
)

const showToolbarTitle = computed(
  () => toolbarTitle.value !== undefined || Boolean(slots['toolbar-title']),
)

const toolbarActions = computed(() => {
  if (props.toolBarRender) return props.toolBarRender(action, selectedRows.value)
  if (!props.toolbar || typeof props.toolbar !== 'object') return undefined
  return typeof props.toolbar.actions === 'function'
    ? props.toolbar.actions()
    : props.toolbar.actions
})

const fullscreenClass = computed(() => ({
  [`${prefix.value}-fullscreen`]: fallbackFullscreen.value,
}))

watch(toolbarSearch, (search) => {
  if (search) return
  const hadKeyword = Boolean(submittedKeyword.value)
  clearToolbarSearch()
  if (hadKeyword) {
    resetCursor()
    current.value = 1
    if (mounted.value) void refresh()
  }
})

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
  () =>
    [
      props.pagination === false ? false : props.pagination?.type,
      props.pagination === false ? undefined : props.pagination?.current,
      props.pagination === false ? undefined : props.pagination?.pageSize,
    ] as const,
  ([type, controlledCurrent, controlledSize], [previousType]) => {
    if (props.pagination === false) return
    const nextPageSize = controlledSize ?? pageSize.value
    const typeChanged = type !== previousType
    const sizeChanged = nextPageSize !== pageSize.value
    const nextCurrent =
      typeChanged || (sizeChanged && cursorPagination.value)
        ? 1
        : (controlledCurrent ?? current.value)
    const targetCurrent = canGoToPage(nextCurrent) ? nextCurrent : current.value
    if (!typeChanged && targetCurrent === current.value && !sizeChanged) return
    if (typeChanged || (sizeChanged && cursorPagination.value)) resetCursor()
    current.value = typeChanged ? 1 : targetCurrent
    pageSize.value = nextPageSize
    if (mounted.value && props.request) void refresh()
  },
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
    resetCursor()
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
  if (pollingTimer) clearTimeout(pollingTimer)
  const sequence = ++requestSequence
  internalLoading.value = true
  const queryParams = {
    ...(props.search === false ? {} : searchRequestParams.value),
    ...toolbarSearchParams.value,
    ...(props.params ?? ({} as P)),
    ...(props.pagination === false
      ? {}
      : cursorPagination.value
        ? {
            pageSize: pageSize.value,
            ...(cursorHistory[current.value - 1] === undefined
              ? {}
              : { nextToken: cursorHistory[current.value - 1] }),
          }
        : { current: current.value, pageSize: pageSize.value }),
  } as P & { current?: number; pageSize?: number }
  try {
    const result = await props.request(
      queryParams,
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
    if (cursorPagination.value) {
      nextToken.value = result.nextToken
      cursorHistory[current.value] = result.nextToken
      cursorHistory.length = current.value + 1
    }
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
    if (sequence === requestSequence) {
      internalLoading.value = false
      configurePolling()
    }
  }
}

async function reload(resetPageIndex = false): Promise<void> {
  if (resetPageIndex) {
    resetCursor()
    current.value = 1
  }
  await refresh()
}

async function reset(): Promise<void> {
  clearSearchDebounce()
  resettingAction = true
  try {
    searchRef.value?.reset()
  } finally {
    resettingAction = false
  }
  if (!commitSearch(initialSearchValues())) return
  resetCursor()
  clearToolbarSearch()
  activeSort.value = {}
  activeFilter.value = {}
  current.value = cursorPagination.value ? 1 : initialCurrent()
  pageSize.value = initialPageSize()
  props.onReset?.()
  await refresh()
}

function setPageInfo(page: Partial<ProTablePagination>): void {
  if (page.pageSize !== undefined && page.pageSize !== pageSize.value && cursorPagination.value) {
    resetCursor()
    current.value = 1
  } else if (page.current !== undefined) {
    if (!canGoToPage(page.current)) return
    current.value = page.current
  }
  if (page.pageSize !== undefined) pageSize.value = page.pageSize
  emitTableChange()
  void refresh()
}

function clearSelected(): void {
  internalSelectedKeys.value = []
  selectedRows.value = []
  const onChange =
    props.rowSelection && typeof props.rowSelection === 'object'
      ? props.rowSelection.onChange
      : undefined
  if (typeof onChange === 'function') onChange([], [], { type: 'none' })
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

function formatSearchDates(values: Record<string, unknown>): Record<string, unknown> {
  if (props.dateFormatter === false) return values
  const walk = (value: unknown, type = ''): unknown => {
    if (Array.isArray(value)) return value.map((item) => walk(item, type))
    if (value && typeof value === 'object') {
      if ('format' in value && typeof value.format === 'function')
        return typeof props.dateFormatter === 'function'
          ? props.dateFormatter(value, type)
          : props.dateFormatter === 'number' && 'valueOf' in value
            ? value.valueOf()
            : value.format(
                type.includes('Time')
                  ? 'YYYY-MM-DD HH:mm:ss'
                  : type.startsWith('time')
                    ? 'HH:mm:ss'
                    : 'YYYY-MM-DD',
              )
      if (value instanceof Date)
        return props.dateFormatter === 'number' ? value.getTime() : value.toISOString()
      return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, walk(item, type)]))
    }
    return value
  }
  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => [
      key,
      walk(
        value,
        String(
          flattenColumns(props.columns).find((column) => columnKey(column) === key)?.valueType ??
            '',
        ),
      ),
    ]),
  )
}
function initialSearchValues(): Record<string, unknown> {
  return Object.fromEntries(
    searchableColumns.value.map((column) => [
      columnKey(column),
      column.initialValue ?? getValue(props.form?.initialValues ?? {}, column.dataIndex),
    ]),
  )
}
function clearSearchDebounce(): void {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = undefined
}
function commitSearch(values: Record<string, unknown>, submit = false): boolean {
  try {
    const formatted = buildSearchParams(effectiveColumns.value, formatSearchDates(values))
    const page =
      props.pagination === false
        ? {}
        : { ...(cursorPagination.value ? {} : { current: 1 }), pageSize: pageSize.value }
    const prepared =
      props.search === false
        ? {}
        : props.beforeSearchSubmit
          ? props.beforeSearchSubmit({ ...formatted, ...page } as P)
          : formatted
    const { current: _current, pageSize: _pageSize, nextToken: _nextToken, ...query } = prepared
    submittedSearch.value = values
    searchRequestParams.value = query
    if (submit) props.onSubmit?.(formatted as P)
    return true
  } catch (error) {
    emit('requestError', error)
    return false
  }
}
function submitSearch(values: Record<string, unknown>): void {
  clearSearchDebounce()
  const next = Object.fromEntries(
    searchableColumns.value.map((column) => [
      columnKey(column),
      getValue(values, column.dataIndex),
    ]),
  )
  if (!commitSearch(next, true)) return
  resetCursor()
  current.value = 1
  emitTableChange()
  debounceTimer = setTimeout(() => {
    debounceTimer = undefined
    void refresh()
  }, props.debounceTime ?? 10)
}
function resetSearch(): void {
  if (resettingAction) return
  clearSearchDebounce()
  if (!commitSearch(initialSearchValues())) return
  resetCursor()
  props.onReset?.()
  clearToolbarSearch()
  current.value = 1
  emitTableChange()
  void refresh()
}

function clearToolbarSearch(): void {
  toolbarSearchSequence += 1
  toolbarKeyword.value = ''
  submittedKeyword.value = ''
}

async function submitToolbarSearch(value: string): Promise<void> {
  const sequence = ++toolbarSearchSequence
  try {
    const result = await toolbarSearchConfig.value.onSearch?.(value)
    if (sequence !== toolbarSearchSequence || result === false) return
    toolbarKeyword.value = value
    submittedKeyword.value = value
    resetCursor()
    if (typeof props.toolbar === 'object') props.toolbar.onSearch?.(value)
    current.value = 1
    emitTableChange()
    await refresh()
  } catch (error) {
    if (sequence === toolbarSearchSequence) emit('requestError', error)
  }
}

function getSortFilter(): { sort: ProSort; filter: ProFilter } {
  return {
    sort: { ...activeSort.value },
    filter: Object.fromEntries(
      Object.entries(activeFilter.value).map(([key, values]) => [key, values ? [...values] : null]),
    ),
  }
}

function onPageChange(page: number, size: number): void {
  const sizeChanged = size !== pageSize.value
  if (sizeChanged && cursorPagination.value) resetCursor()
  else if (!canGoToPage(page)) return
  if (props.pagination) props.pagination.onChange?.(page, size)
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
  resetCursor()
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
    const childColumns = column.children ?? column.columns
    const children = childColumns?.length ? decorateColumns(childColumns, `${key}.`) : undefined
    if (childColumns?.length && !children?.length) return
    const native = Object.fromEntries(
      Object.entries(column).filter(
        ([name]) =>
          ![
            'valueType',
            'valueEnum',
            'request',
            'params',
            'onFieldRequestError',
            'search',
            'editable',
            'hideInTable',
            'hideInSearch',
            'hideInForm',
            'readonly',
            'fieldProps',
            'formItemProps',
            'convertValue',
            'transform',
            'dependencies',
            'columns',
            'children',
            'render',
            'renderText',
            'renderFormItem',
            'formItemRender',
            'initialValue',
            'order',
            'colSize',
            'copyable',
          ].includes(name),
      ),
    )
    result.push({
      ...native,
      key,
      dataIndex: column.dataIndex,
      title: resolveColumnTitle(column),
      width: column.width,
      minWidth: column.minWidth,
      fixed: state?.fixed === false ? undefined : (state?.fixed ?? column.fixed),
      align: column.align,
      ellipsis: column.ellipsis,
      sorter: column.sorter,
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
  if (['index', 'indexBorder'].includes(typeOf(column, record, index))) {
    return (props.pagination === false ? 0 : (current.value - 1) * pageSize.value) + index + 1
  }
  const displayed = getDisplayedRecord(record)
  const value = getValue(displayed, column.dataIndex)
  return column.renderText ? column.renderText(value, displayed, index, action) : value
}

function getRenderedCell(record: T, column: ProColumns<T>, index: number): VNodeChild {
  const displayed = getDisplayedRecord(record)
  const value = getCellValue(displayed, column, index)
  const dom = h(ProField, {
    text: value,
    valueType: resolveColumnValueType(column.valueType, displayed, index),
    mode: 'read',
    fieldProps: fieldProps(column, displayed),
    valueEnum: typeof column.valueEnum === 'function' ? column.valueEnum() : column.valueEnum,
    options: fieldOptions(column, displayed),
    copyable: column.copyable,
    ellipsis: column.ellipsis,
  })
  return column.render ? column.render(dom, displayed, index, action, column) : dom
}

function customEditor(record: T, column: ProColumns<T>, index: number): VNodeChild | undefined {
  if (!column.renderFormItem && !column.formItemRender) return undefined
  const displayed = getDisplayedRecord(record)
  const config = {
    record: displayed,
    index,
    column,
    editable: true,
    update: (value: unknown) => updateCell(record, column, value),
  }
  return column.formItemRender
    ? column.formItemRender(column, config, editingForm.value)
    : column.renderFormItem?.(column, config)
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
  return props.editable.actionRender(displayed, actions, {
    save: h(Button, { type: 'link', onClick: actions.save }, () => editText('save', '保存')),
    cancel: h(Button, { type: 'link', onClick: actions.cancel }, () => editText('cancel', '取消')),
    delete: h(Button, { type: 'link', danger: true, onClick: actions.remove }, () =>
      editText('delete', '删除'),
    ),
  })
}

function hasCustomActions(): boolean {
  return Boolean(props.editable && props.editable.actionRender)
}

function fieldOptions(column: ProColumns<T>, record?: T): ProFieldOption[] {
  const props = fieldProps(column, record)
  const source: ProFieldOptionSource = {
    valueType: typeOf(column, record),
    valueEnum: column.valueEnum,
  }
  const remoteOptions = remoteColumnOptions.value.get(columnKey(column))
  return resolveFieldOptions(source, remoteOptions, props)
}

function typeOf(column: ProColumns<T>, record?: T, index = 0) {
  return resolveColumnValueType(column.valueType, record ?? ({} as T), index).type
}
function fieldProps(column: ProColumns<T>, record?: T, index = 0): Record<string, unknown> {
  const { type, ...config } = resolveColumnValueType(
    column.valueType,
    record ? getDisplayedRecord(record) : ({} as T),
    index,
  )
  return {
    ...config,
    ...(typeof column.fieldProps === 'function'
      ? column.fieldProps(record ? getDisplayedRecord(record) : undefined)
      : (column.fieldProps ?? {})),
  }
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

function toggleSearchCollapsed(next: boolean): void {
  if (searchConfig.value.collapsed === undefined) internalSearchCollapsed.value = next
  searchConfig.value.onCollapse?.(next)
  emit('searchCollapse', next)
}

function updateColumnsState(key: string, value: Partial<ProColumnsState>): void {
  commitColumnsState({
    ...columnsState.value,
    [key]: { ...columnsState.value[key], ...value },
  })
}

function commitColumnsState(state: Record<string, ProColumnsState>): void {
  columnsState.value = state
  persistColumnsState(columnsState.value, props.columnsState)
}

function updateAllColumnVisibility(checked: boolean): void {
  const state = cloneState(columnsState.value)
  for (const { key } of settingsColumns.value) state[key] = { ...state[key], show: checked }
  commitColumnsState(state)
}

function resetColumnsState(): void {
  commitColumnsState(cloneState(props.columnsState?.defaultValue ?? {}))
}

function moveSettingsColumn(sourceKey: string, targetKey: string): void {
  if (sourceKey === targetKey) return
  const source = settingsColumns.value.find(({ key }) => key === sourceKey)
  const target = settingsColumns.value.find(({ key }) => key === targetKey)
  if (!source || !target || source.parent !== target.parent) return
  const siblings = settingsColumns.value.filter(({ parent }) => parent === source.parent)
  const sourceIndex = siblings.findIndex(({ key }) => key === sourceKey)
  const targetIndex = siblings.findIndex(({ key }) => key === targetKey)
  siblings.splice(sourceIndex, 1)
  siblings.splice(targetIndex, 0, source)
  const state = cloneState(columnsState.value)
  siblings.forEach(({ key }, order) => {
    state[key] = { ...state[key], order }
  })
  commitColumnsState(state)
}

function startColumnDrag(event: DragEvent, key: string): void {
  draggedColumnKey.value = key
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', key)
  }
}

function dropSettingsColumn(key: string): void {
  if (draggedColumnKey.value) moveSettingsColumn(draggedColumnKey.value, key)
  draggedColumnKey.value = undefined
}

function moveColumnByKeyboard(event: KeyboardEvent, entry: SettingsColumn): void {
  if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return
  event.preventDefault()
  const siblings = settingsColumns.value.filter(({ parent }) => parent === entry.parent)
  const index = siblings.findIndex(({ key }) => key === entry.key)
  const target = siblings[index + (event.key === 'ArrowUp' ? -1 : 1)]
  if (target) moveSettingsColumn(entry.key, target.key)
}

function selectDensity(value: 'small' | 'middle' | 'large'): void {
  density.value = value
  densityOpen.value = false
}

function getToolbarPopupContainer(): HTMLElement {
  return rootElement.value!
}

function showOption(option: 'density' | 'fullScreen' | 'reload' | 'setting'): boolean {
  if (props.options === false) return false
  return Boolean(props.options?.[option] ?? option !== 'fullScreen')
}

function optionText(option: 'density' | 'fullScreen' | 'reload' | 'setting'): string {
  if (option === 'density') return localeText.value.density ?? DEFAULT_LOCALE_TEXT.density!
  if (option === 'fullScreen') return localeText.value.fullScreen
  if (option === 'reload') return localeText.value.reload
  return localeText.value.setting
}
function activateOption(option: 'fullScreen' | 'reload', event: MouseEvent) {
  const callback = props.options && props.options[option]
  if (typeof callback === 'function') callback(event, action)
  else if (option === 'reload') void reload()
  else void fullScreen()
}

function configurePolling(): void {
  if (pollingTimer) clearTimeout(pollingTimer)
  pollingTimer = undefined
  const interval =
    typeof props.polling === 'function' ? props.polling(tableData.value) : props.polling
  if (!mounted.value || !props.request || internalLoading.value || !interval || interval <= 0)
    return
  pollingTimer = setTimeout(
    () => {
      if (typeof document === 'undefined' || !document.hidden) void refresh()
      else configurePolling()
    },
    Math.max(2000, interval),
  )
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
  const initializedSearch = commitSearch(initialSearchValues())
  window.addEventListener('focus', onWindowFocus)
  document.addEventListener('fullscreenchange', onFullscreenChange)
  configurePolling()
  if (initializedSearch && props.request && !props.manualRequest) void refresh()
})

onBeforeUnmount(() => {
  mounted.value = false
  toolbarSearchSequence += 1
  requestSequence += 1
  optionRequestSequence += 1
  if (pollingTimer) clearTimeout(pollingTimer)
  if (debounceTimer) clearTimeout(debounceTimer)
  window.removeEventListener('focus', onWindowFocus)
  document.removeEventListener('fullscreenchange', onFullscreenChange)
})

const alertContext = computed(() => ({
  selectedRowKeys: [...selectedKeys.value],
  selectedRows: [...selectedRows.value],
  onCleanSelected: clearSelected,
}))
const alertContent = computed(() =>
  typeof props.tableAlertRender === 'function'
    ? props.tableAlertRender(alertContext.value)
    : undefined,
)
const editingModel = computed(() =>
  Object.fromEntries([...editable.drafts.value].map(([key, record]) => [String(key), record])),
)
function renderTableView(dom: VNodeChild): VNodeChild {
  return props.tableViewRender
    ? props.tableViewRender(
        {
          ...props,
          columns: effectiveColumns.value,
          dataSource: displayedData.value,
          loading: effectiveLoading.value,
          rowSelection: rowSelectionConfig.value,
          size: density.value,
        },
        dom,
      )
    : dom
}
function renderViewCell(record: T, column: ProColumns<T>, index: number): VNodeChild {
  const slot = cellSlotName(column)
  if (slot)
    return slots[slot]?.({
      value: getCellValue(record, column, index),
      record: getDisplayedRecord(record),
      index,
      column,
      editable: isRowEditing(record),
    })
  if (typeOf(column, record, index) === 'option' && props.editable) {
    if (hasCustomActions()) return customActions(record)
    if (isRowEditing(record))
      return h(Space, { size: 'small' }, () => [
        h(
          Button,
          { type: 'link', loading: isRowSaving(record), onClick: () => saveRow(record) },
          () => editText('save', '保存'),
        ),
        h(Button, { type: 'link', onClick: () => cancelRow(record) }, () =>
          editText('cancel', '取消'),
        ),
      ])
    if (!column.render)
      return h(Button, { type: 'link', onClick: () => editRow(record) }, () =>
        intl.value.getMessage('table.edit', '编辑'),
      )
  }
  if (isCellEditable(record, column, index))
    return h(
      FormItem,
      {
        ...editorItemProps(record, column),
        name: editorName(record, column),
        style: { marginBottom: 0 },
      },
      () =>
        column.formItemRender || column.renderFormItem
          ? customEditor(record, column, index)
          : h(ValueTypeControl, {
              column: { ...column, valueType: typeOf(column, record, index) },
              value: getCellValue(record, column, index),
              options: fieldOptions(column, record),
              fieldProps: fieldProps(column, record, index),
              loading: isOptionLoading(column),
              'onUpdate:value': (value: unknown) => updateCell(record, column, value),
            }),
    )
  return getRenderedCell(record, column, index)
}

defineExpose<
  ProTableInstance<T> & {
    getRowData: (indexOrKey: number | ProKey) => T | undefined
    getRowsData: () => T[]
    setRowData: (indexOrKey: number | ProKey, value: Partial<T>) => boolean
  }
>({
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
  <div
    ref="rootElement"
    :dir="direction"
    :data-pro-fullscreen="fallbackFullscreen || undefined"
    data-pro-table
    v-bind="
      Object.fromEntries(
        Object.entries(attrs).filter(
          ([key]) => key.startsWith('data-') || key.startsWith('aria-') || key === 'id',
        ),
      )
    "
    :class="[prefix, fullscreenClass, attrs.class]"
    :style="[rootStyle, attrs.style as CSSProperties]"
  >
    <RenderView
      :render="props.searchFormRender ? (dom) => props.searchFormRender!(props, dom) : undefined"
    >
      <ProCard
        v-if="props.search !== false && searchableColumns.length"
        :class="`${prefix}-search`"
        data-pro-table-search
        :variant="
          (typeof props.cardBordered === 'object' ? props.cardBordered.search : props.cardBordered)
            ? 'outlined'
            : 'borderless'
        "
      >
        <Search
          ref="searchRef"
          :loading="
            typeof effectiveLoading === 'object' ? effectiveLoading.spinning : effectiveLoading
          "
          :columns="searchFormColumns"
          :search="{
            ...searchConfig,
            collapsed: searchCollapsed,
            searchText: searchConfig.searchText ?? localeText.search,
            resetText: searchConfig.resetText ?? localeText.reset,
            collapseRender:
              searchConfig.collapseRender ??
              ((collapsed) => (collapsed ? localeText.expand : localeText.collapse)),
          }"
          :form="props.form"
          :form-ref="props.formRef"
          @submit="submitSearch"
          @reset="resetSearch"
          @collapse="toggleSearchCollapsed"
        />
      </ProCard>
    </RenderView>
    <RenderNode v-if="props.tableExtraRender" :content="props.tableExtraRender(props, tableData)" />
    <component
      :is="props.ErrorBoundary === false ? RenderView : (props.ErrorBoundary ?? ErrorBoundary)"
    >
      <ProCard
        v-bind="tableCardProps"
        :class="`${prefix}-container`"
        data-pro-table-container
        :styles="{ body: showToolbar ? { paddingBlockStart: 0 } : { padding: 0 } }"
      >
        <RenderView :render="renderTableRoot">
          <ListToolBar
            v-if="showToolbar && props.toolBarRender !== false"
            data-pro-part="toolbar"
            :class="`${prefix}-list-toolbar`"
            data-pro-table-list-toolbar
            v-bind="typeof props.toolbar === 'object' ? props.toolbar : {}"
            :title="toolbarTitle"
            :tooltip="props.tooltip"
            :search="false"
          >
            <template #title>
              <div
                v-if="showToolbarTitle"
                :class="`${prefix}-toolbar-title`"
                data-pro-table-toolbar-title
              >
                <slot name="toolbar-title">
                  <RenderNode v-if="toolbarTitle !== undefined" :content="toolbarTitle" />
                </slot>
              </div>
              <InputSearch
                v-if="toolbarSearch && !showToolbarTitle"
                v-model:value="toolbarKeyword"
                v-bind="toolbarSearchBindings"
                :class="`${prefix}-toolbar-search`"
                data-pro-table-toolbar-search
                :aria-label="toolbarSearchBindings.placeholder"
                @search="submitToolbarSearch"
              /> </template
            ><template #actions
              ><div :class="`${prefix}-list-toolbar-actions`" data-pro-table-list-toolbar-actions>
                <InputSearch
                  v-if="toolbarSearch && showToolbarTitle"
                  v-model:value="toolbarKeyword"
                  v-bind="toolbarSearchBindings"
                  :class="`${prefix}-toolbar-search`"
                  data-pro-table-toolbar-search
                  :aria-label="toolbarSearchBindings.placeholder"
                  @search="submitToolbarSearch"
                />
                <slot name="toolbar-actions">
                  <RenderNode v-if="toolbarActions !== undefined" :content="toolbarActions" />
                </slot>
                <RenderView :render="renderOptions">
                  <Button
                    v-if="showOption('reload')"
                    type="text"
                    size="small"
                    :loading="effectiveLoading"
                    :aria-label="optionText('reload')"
                    :title="optionText('reload')"
                    @click="activateOption('reload', $event)"
                  >
                    <template #icon><ReloadOutlined /></template>
                  </Button>
                  <Popover
                    v-if="showOption('density')"
                    v-model:open="densityOpen"
                    trigger="click"
                    placement="bottomRight"
                    :arrow="false"
                    :get-popup-container="getToolbarPopupContainer"
                    :styles="{ container: { padding: '4px' } }"
                  >
                    <template #content>
                      <div
                        :class="`${prefix}-density-menu`"
                        data-pro-table-density-menu
                        role="menu"
                        :aria-label="optionText('density')"
                        @keydown.esc.stop="densityOpen = false"
                      >
                        <Button
                          v-for="option in densityOptions"
                          :key="option.value"
                          type="text"
                          role="menuitemradio"
                          :aria-checked="density === option.value"
                          :class="{ [`${prefix}-density-selected`]: density === option.value }"
                          :data-pro-table-density-selected="density === option.value || undefined"
                          @click="selectDensity(option.value)"
                        >
                          {{ option.label }}
                        </Button>
                      </div>
                    </template>
                    <Tooltip :title="densityOpen ? undefined : optionText('density')">
                      <Button
                        type="text"
                        size="small"
                        :aria-label="optionText('density')"
                        aria-haspopup="menu"
                        :aria-expanded="densityOpen"
                      >
                        <template #icon><ColumnHeightOutlined /></template>
                      </Button>
                    </Tooltip>
                  </Popover>
                  <Button
                    v-if="showOption('fullScreen')"
                    type="text"
                    size="small"
                    :aria-label="optionText('fullScreen')"
                    :title="optionText('fullScreen')"
                    @click="activateOption('fullScreen', $event)"
                  >
                    <template #icon><FullscreenOutlined /></template>
                  </Button>
                  <Popover
                    v-if="showOption('setting')"
                    v-model:open="settingsOpen"
                    trigger="click"
                    placement="bottomRight"
                    :arrow="false"
                    :get-popup-container="getToolbarPopupContainer"
                    :classes="{ root: `${prefix}-column-setting-overlay` }"
                    :styles="{ container: { padding: 0 } }"
                  >
                    <template #content>
                      <div
                        :class="`${prefix}-column-setting`"
                        data-pro-table-column-settings
                        role="dialog"
                        :aria-label="localeText.setting"
                        @keydown.esc.stop="settingsOpen = false"
                      >
                        <div
                          :class="`${prefix}-column-setting-title`"
                          data-pro-table-column-settings-header
                        >
                          <Checkbox
                            v-if="settingsConfig.checkable !== false"
                            :checked="
                              settingsColumns.length > 0 &&
                              visibleSettingsColumnCount === settingsColumns.length
                            "
                            :indeterminate="
                              visibleSettingsColumnCount > 0 &&
                              visibleSettingsColumnCount < settingsColumns.length
                            "
                            :disabled="settingsColumns.length === 0"
                            @update:checked="updateAllColumnVisibility(Boolean($event))"
                          >
                            {{ localeText.columnDisplay }}
                          </Checkbox>
                          <Button
                            v-if="settingsConfig.checkedReset !== false"
                            :class="`${prefix}-column-setting-action-rest-button`"
                            type="link"
                            size="small"
                            @click="resetColumnsState"
                          >
                            {{ localeText.reset }}
                          </Button>
                        </div>
                        <div
                          :class="`${prefix}-column-setting-list`"
                          data-pro-table-column-settings-list
                          :style="
                            settingsConfig.listsHeight
                              ? { maxHeight: `${settingsConfig.listsHeight}px` }
                              : undefined
                          "
                        >
                          <template v-for="group in settingsGroups" :key="group.value">
                            <div
                              v-if="group.showTitle"
                              :class="`${prefix}-column-setting-list-title`"
                            >
                              {{ group.label }}
                            </div>
                            <div
                              v-for="entry in group.entries"
                              :key="entry.key"
                              data-pro-table-column-settings-item
                              :class="[
                                `${prefix}-column-setting-list-item`,
                                {
                                  [`${prefix}-column-setting-dragging`]:
                                    draggedColumnKey === entry.key,
                                },
                              ]"
                              :data-pro-table-column-settings-dragging="
                                draggedColumnKey === entry.key || undefined
                              "
                              :data-column-key="entry.key"
                              @dragover.prevent
                              @drop.prevent="dropSettingsColumn(entry.key)"
                            >
                              <button
                                v-if="settingsConfig.draggable !== false"
                                type="button"
                                :class="`${prefix}-column-drag-handle`"
                                data-pro-table-column-drag-handle
                                draggable="true"
                                :aria-label="localeText.columnDrag"
                                :title="localeText.columnDrag"
                                @dragstart="startColumnDrag($event, entry.key)"
                                @dragend="draggedColumnKey = undefined"
                                @keydown="moveColumnByKeyboard($event, entry)"
                              >
                                <HolderOutlined aria-hidden="true" />
                              </button>
                              <Checkbox
                                v-if="settingsConfig.checkable !== false"
                                :checked="columnsState[entry.key]?.show !== false"
                                @update:checked="
                                  updateColumnsState(entry.key, { show: Boolean($event) })
                                "
                              >
                                <span :class="`${prefix}-column-setting-list-item-title`"
                                  ><RenderNode :content="settingTitle(entry)"
                                /></span>
                              </Checkbox>
                              <RenderNode v-else :content="settingTitle(entry)" />
                              <Select
                                v-if="settingsConfig.showListItemOption !== false"
                                :class="`${prefix}-column-setting-list-item-option`"
                                size="small"
                                :value="
                                  columnsState[entry.key]?.fixed ?? entry.column.fixed ?? 'none'
                                "
                                :options="fixedOptions"
                                :aria-label="intl.getMessage('tableToolBar.fixed', '固定列')"
                                :style="{ minWidth: '100px', marginInlineStart: 'auto' }"
                                @update:value="
                                  updateColumnsState(entry.key, {
                                    fixed:
                                      $event === 'none'
                                        ? false
                                        : $event === 'left'
                                          ? 'left'
                                          : 'right',
                                  })
                                "
                              />
                            </div>
                          </template>
                        </div>
                        <RenderNode v-if="settingsConfig.extra" :content="settingsConfig.extra" />
                      </div>
                    </template>
                    <RenderNode v-if="settingsConfig.children" :content="settingsConfig.children" />
                    <Tooltip v-else :title="settingsOpen ? undefined : optionText('setting')">
                      <Button
                        type="text"
                        size="small"
                        :aria-label="optionText('setting')"
                        aria-haspopup="dialog"
                        :aria-expanded="settingsOpen"
                      >
                        <template #icon
                          ><RenderNode
                            v-if="settingsConfig.settingIcon"
                            :content="settingsConfig.settingIcon" /><SettingOutlined v-else
                        /></template>
                      </Button>
                    </Tooltip>
                  </Popover>
                </RenderView>
              </div> </template
          ></ListToolBar>
          <div
            v-if="
              rowSelectionConfig &&
              (selectedKeys.length || (props.rowSelection && props.rowSelection.alwaysShowAlert)) &&
              props.tableAlertRender !== false &&
              alertContent !== false
            "
            data-pro-part="alert"
            :class="`${prefix}-alert`"
            data-pro-table-alert
          >
            <div :class="`${prefix}-alert-container`">
              <div :class="`${prefix}-alert-info`" data-pro-table-alert-info>
                <div :class="`${prefix}-alert-info-content`">
                  <RenderNode v-if="props.tableAlertRender" :content="alertContent" /><span v-else
                    >{{ intl.getMessage('alert.selected', '已选择') }} {{ selectedKeys.length }}
                    {{ intl.getMessage('alert.item', '项') }}</span
                  >
                </div>
                <div
                  v-if="props.tableAlertOptionRender !== false"
                  :class="`${prefix}-alert-info-option`"
                >
                  <RenderNode
                    v-if="props.tableAlertOptionRender"
                    :content="props.tableAlertOptionRender(alertContext)"
                  /><Button v-else type="link" @click="clearSelected">{{
                    intl.getMessage('alert.clear', '取消选择')
                  }}</Button>
                </div>
              </div>
            </div>
          </div>
          <slot name="before-table" />
          <component
            :is="props.editable ? Form : 'div'"
            ref="editingForm"
            v-bind="props.editable ? props.editable.formProps : {}"
            :model="editingModel"
            @submit.prevent
          >
            <RenderView :render="props.tableViewRender ? renderTableView : undefined">
              <NativeTable
                data-pro-part="table"
                v-bind="tableBindings"
                :class="props.tableClassName"
                :style="props.tableStyle"
                :classes="props.classes"
                :styles="props.styles"
                :columns="tableColumns"
                :data-source="displayedData"
                :row-key="effectiveRowKey"
                :loading="effectiveLoading"
                :pagination="false"
                :row-selection="rowSelectionConfig"
                :scroll="props.scroll"
                :size="density"
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

                    <template
                      v-else-if="
                        props.editable &&
                        typeOf(resolveOriginalColumn(column)!, record, index) === 'option'
                      "
                    >
                      <RenderNode v-if="hasCustomActions()" :content="customActions(record)" />
                      <Space v-else-if="isRowEditing(record)" size="small">
                        <Button
                          type="link"
                          size="small"
                          :loading="isRowSaving(record)"
                          @click="saveRow(record)"
                        >
                          <RenderNode :content="editText('save', '保存')" />
                        </Button>
                        <Button type="link" size="small" @click="cancelRow(record)"
                          ><RenderNode :content="editText('cancel', '取消')"
                        /></Button>
                      </Space>
                      <RenderView
                        v-else-if="resolveOriginalColumn(column)!.render"
                        :render="
                          () => getRenderedCell(record, resolveOriginalColumn(column)!, index)
                        "
                      />
                      <Space v-else size="small">
                        <Button type="link" size="small" @click="editRow(record)">{{
                          intl.getMessage('table.edit', '编辑')
                        }}</Button>
                        <Popconfirm @confirm="removeRow(record)"
                          ><template #title
                            ><RenderNode
                              :content="
                                (props.editable && props.editable.deletePopconfirmMessage) ||
                                intl.getMessage('deleteThisLine', '确认删除此行？')
                              "
                          /></template>
                          <Button danger type="link" size="small"
                            ><RenderNode :content="editText('delete', '删除')"
                          /></Button>
                        </Popconfirm>
                      </Space>
                    </template>

                    <div
                      v-else-if="isCellEditable(record, resolveOriginalColumn(column)!, index)"
                      :class="`${prefix}-editable-cell`"
                      data-pro-table-editable-cell
                    >
                      <FormItem
                        v-bind="editorItemProps(record, resolveOriginalColumn(column)!)"
                        :name="editorName(record, resolveOriginalColumn(column)!)"
                        :style="{ marginBottom: 0 }"
                      >
                        <RenderNode
                          v-if="
                            resolveOriginalColumn(column)!.renderFormItem ||
                            resolveOriginalColumn(column)!.formItemRender
                          "
                          :content="customEditor(record, resolveOriginalColumn(column)!, index)"
                        />
                        <ValueTypeControl
                          v-else
                          :column="{
                            ...resolveOriginalColumn(column)!,
                            valueType: typeOf(resolveOriginalColumn(column)!, record, index),
                          }"
                          :value="getCellValue(record, resolveOriginalColumn(column)!, index)"
                          :options="fieldOptions(resolveOriginalColumn(column)!, record)"
                          :loading="isOptionLoading(resolveOriginalColumn(column)!)"
                          :field-props="fieldProps(resolveOriginalColumn(column)!, record, index)"
                          @update:value="updateCell(record, resolveOriginalColumn(column)!, $event)"
                        />
                      </FormItem>
                      <div
                        v-if="validationMessage(record, resolveOriginalColumn(column)!)"
                        :class="`${prefix}-validation-error`"
                        data-pro-table-validation-error
                      >
                        {{ validationMessage(record, resolveOriginalColumn(column)!) }}
                      </div>
                    </div>

                    <span v-else :class="`${prefix}-cell-value`" data-pro-table-cell-value>
                      <RenderView
                        :render="
                          () => getRenderedCell(record, resolveOriginalColumn(column)!, index)
                        "
                      />
                    </span>
                  </template>
                </template>
                <template v-for="(_, name) in slots" #[name]="slotProps">
                  <slot
                    v-if="!String(name).startsWith('cell-') && !String(name).startsWith('header-')"
                    :name="name"
                    v-bind="slotProps ?? {}"
                  />
                </template> </NativeTable
            ></RenderView>
          </component>
          <slot name="after-table" />

          <div
            v-if="props.pagination !== false"
            :class="`${prefix}-pagination`"
            data-pro-table-pagination
          >
            <Pagination
              v-bind="nativePaginationProps"
              :current="current"
              :page-size="pageSize"
              :total="total"
              :show-size-changer="paginationOptions?.showSizeChanger"
              :page-size-options="paginationOptions?.pageSizeOptions"
              @change="onPageChange"
            />
          </div>
        </RenderView>
      </ProCard>
    </component>
  </div>
</template>

<style scoped>
[data-pro-table] {
  color: var(--antdv-next-pro-color-text);
  min-width: 0;
}
[data-pro-table-search] {
  margin-block-end: 16px;
}

[data-pro-table-toolbar] {
  min-height: 64px;
  margin-block-end: 0;
  padding-block: 16px;
  box-sizing: border-box;
  flex-wrap: wrap;
}

[data-pro-table]:fullscreen,
[data-pro-table][data-pro-fullscreen] {
  background: var(--antdv-next-pro-color-bg-container, #fff);
}

[data-pro-table-toolbar-title] {
  min-width: 0;
  font-size: 16px;
  font-weight: 600;
}

[data-pro-table-toolbar-actions] {
  margin-inline-start: auto;
  flex-wrap: wrap;
  justify-content: flex-end;
}

[data-pro-table-toolbar-search] {
  width: 200px;
  max-width: 100%;
}

[data-pro-table-column-settings] {
  width: 200px;
  max-width: calc(100vw - 32px);
  color: var(--antdv-next-pro-color-text);
  background: var(--antdv-next-pro-color-bg-elevated);
  border-radius: var(--antdv-next-pro-border-radius-lg, 8px);
}

[data-pro-table-column-settings-header] {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  font-weight: 600;
}

[data-pro-table-column-settings-header] :deep(.ant-btn) {
  padding-inline: 0;
}

[data-pro-table-column-settings-list] {
  max-height: min(320px, 60vh);
  overflow-y: auto;
  padding: 4px 8px 12px;
}

[data-pro-table-column-settings-item] {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 28px;
  padding-inline: 4px;
  border-radius: 4px;
}

[data-pro-table-column-settings-item]:hover {
  background: var(--antdv-next-pro-color-fill-alter);
}

[data-pro-table-column-settings-dragging] {
  opacity: 0.45;
}

[data-pro-table-column-drag-handle] {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 28px;
  height: 24px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--antdv-next-pro-color-text-secondary);
  cursor: grab;
}

[data-pro-table-column-drag-handle]:active {
  cursor: grabbing;
}

[data-pro-table-density-menu] {
  display: flex;
  flex-direction: column;
  min-width: 48px;
}

[data-pro-table-density-menu] :deep(.ant-btn) {
  padding-inline: 8px;
}

[data-pro-table-density-selected] {
  color: var(--antdv-next-pro-color-primary);
  background: var(--antdv-next-pro-color-primary-bg);
}

[data-pro-table-search-fields] {
  display: grid;
  grid-template-columns: repeat(var(--antdv-next-pro-search-columns, 3), minmax(0, 1fr));
  align-items: center;
  gap: 24px;
}

[data-pro-table-search-field] {
  display: block;
  grid-template-columns: auto minmax(0, 1fr);
  min-width: 0;
  margin-block-end: 0;
}

[data-pro-table-search-field] :deep(.ant-form-item-row) {
  display: grid;
  grid-template-columns: inherit;
  align-items: center;
}

[data-pro-table-search-field] :deep(.ant-form-item-label) {
  padding-block-end: 0;
  white-space: nowrap;
}

[data-pro-table-search-field] :deep(.ant-form-item-control) {
  min-width: 0;
}

[data-pro-table-search-field] :deep(.ant-select),
[data-pro-table-search-field] :deep(.ant-input-number),
[data-pro-table-search-field] :deep(.ant-picker) {
  width: 100%;
}

[data-pro-table-search-label] {
  white-space: nowrap;
}

[data-pro-table-search-actions] {
  display: flex;
  grid-column: -2 / -1;
  align-items: center;
  justify-content: flex-end;
  justify-self: end;
  gap: 8px;
  white-space: nowrap;
}

[data-pro-table-editable-cell] :deep(.ant-input),
[data-pro-table-editable-cell] :deep(.ant-input-number),
[data-pro-table-editable-cell] :deep(.ant-select) {
  width: 100%;
}

[data-pro-table-validation-error] {
  margin-block-start: 4px;
  color: var(--antdv-next-pro-color-error, #ff4d4f);
  font-size: 12px;
}

[data-pro-table-cell-value] {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

[data-pro-table-copy] {
  padding-inline: 2px;
}

[data-pro-table-pagination] {
  display: flex;
  justify-content: flex-end;
  margin-block-start: 16px;
}

@media (width <= 575px) {
  [data-pro-table-search-actions] {
    grid-column: 1 / -1;
  }

  [data-pro-table-toolbar-actions] {
    width: 100%;
  }
}
</style>

<style>
[data-pro-table-alert] {
  padding: 8px 16px;
  margin-block-end: 16px;
  border: 1px solid var(--antdv-next-pro-color-border-secondary);
  border-radius: var(--antdv-next-pro-border-radius-lg);
  background: var(--antdv-next-pro-color-primary-bg);
}
[data-pro-table-alert-info] {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
</style>
