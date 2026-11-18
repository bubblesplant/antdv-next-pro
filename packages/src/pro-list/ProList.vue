<script
  setup
  lang="ts"
  generic="
    T extends Record<string, unknown> = Record<string, unknown>,
    P extends Record<string, unknown> = Record<string, unknown>
  "
>
import type { VNodeChild } from 'vue'
import type { ProListProps, ProListColumn } from './types'
import type { ProTableInstance } from '../types'
import { computed, h, ref, getCurrentInstance } from 'vue'
import ProTable from '../ProTable.vue'
import ListView from './ListView.vue'
import { useProPrefix } from '../provider'
import { useSemanticStyles } from '../shared/semantic'
import { useTableRef } from '../table/useTableRef'

defineOptions({ inheritAttrs: false })
const {
  request,
  classes: classesProp,
  classNames,
  styles: stylesProp,
  columns: columnsProp,
  metas,
  grid,
  itemCardProps,
  itemLayout,
  split = undefined,
  showActions,
  showExtra,
  itemRender,
  itemTitleRender = undefined,
  itemHeaderRender = undefined,
  onItem,
  onRow,
  rowClassName,
  prefixCls,
  dataSource,
  defaultDataSource,
  params,
  postData,
  rowKey,
  loading,
  headerTitle = undefined,
  tooltip,
  form,
  formRef,
  onSubmit,
  onReset,
  onLoadingChange,
  beforeSearchSubmit,
  dateFormatter,
  debounceTime,
  toolBarRender = undefined,
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
  search,
  localeText,
  pagination,
  options,
  toolbar,
  rowSelection,
  polling,
  revalidateOnFocus,
  manualRequest,
  columnsState,
  editable,
  editableKeys,
  scroll,
  size,
  bordered,
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
  footer,
  summary,
  headerCell,
  bodyCell,
  caption,
  id,
  showHeader,
  components,
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
} = defineProps<ProListProps<T, P>>()
const slots = defineSlots<{
  [name: string]:
    | ((scope: { record?: T; index?: number; column?: ProListColumn<T> }) => VNodeChild)
    | undefined
}>()
// 保留整体 props 接口，getter 持续读取响应式解构值。
const props = {
  get request() {
    return request
  },
  get classes() {
    return classesProp
  },
  get classNames() {
    return classNames
  },
  get styles() {
    return stylesProp
  },
  get columns() {
    return columnsProp
  },
  get metas() {
    return metas
  },
  get grid() {
    return grid
  },
  get itemCardProps() {
    return itemCardProps
  },
  get itemLayout() {
    return itemLayout
  },
  get split() {
    return split
  },
  get showActions() {
    return showActions
  },
  get showExtra() {
    return showExtra
  },
  get itemRender() {
    return itemRender
  },
  get itemTitleRender() {
    return itemTitleRender
  },
  get itemHeaderRender() {
    return itemHeaderRender
  },
  get onItem() {
    return onItem
  },
  get onRow() {
    return onRow
  },
  get rowClassName() {
    return rowClassName
  },
  get prefixCls() {
    return prefixCls
  },
  get dataSource() {
    return dataSource
  },
  get defaultDataSource() {
    return defaultDataSource
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
  get search() {
    return search
  },
  get localeText() {
    return localeText
  },
  get pagination() {
    return pagination
  },
  get options() {
    return options
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
const table = ref<ProTableInstance<T>>()
const action = useTableRef(table)
const prefix = useProPrefix('list', () => prefixCls)
const instance = getCurrentInstance()
const { classes, styles } = useSemanticStyles(props, {
  classes: () => classesProp,
  classNames: () => classNames,
  styles: () => stylesProp,
})
const tableBindings = computed(() => {
  Object.values(props)
  return Object.fromEntries(
    Object.entries(instance?.vnode.props ?? {}).filter(
      ([raw]) =>
        ![
          'onRow',
          'onItem',
          'rowClassName',
          'metas',
          'grid',
          'itemCardProps',
          'itemLayout',
          'split',
          'showActions',
          'showExtra',
          'itemRender',
          'itemTitleRender',
          'itemHeaderRender',
          'prefixCls',
          'classes',
          'classNames',
          'styles',
          'ref',
        ].includes(raw.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase())),
    ),
  )
})
const columns = computed<ProListColumn<T>[]>(
  () =>
    columnsProp ??
    Object.entries(metas ?? {})
      .filter((entry): entry is [string, ProListColumn<T>] => Boolean(entry[1]))
      .map(([slot, meta]) => ({
        dataIndex: slot,
        listSlot: slot as ProListColumn<T>['listSlot'],
        valueType: slot === 'avatar' ? 'avatar' : slot === 'actions' ? 'option' : 'text',
        ...meta,
      })),
)
function renderView(view: import('../types').ProTableProps<T, P>): VNodeChild {
  return h(
    ListView<T>,
    {
      columns: columns.value,
      prefixCls: prefix.value,
      classes: classes.value,
      styles: styles.value,
      dataSource: view.dataSource ?? [],
      loading: view.loading,
      rowKey,
      rowSelection: view.rowSelection,
      expandable,
      grid,
      itemCardProps,
      itemLayout,
      split,
      showActions,
      showExtra,
      itemRender,
      itemTitleRender,
      itemHeaderRender,
      onItem,
      onRow,
      rowClassName,
      action,
    },
    slots,
  )
}
defineExpose<ProTableInstance<T>>(action)
</script>
<template>
  <!-- @vue-generic {T, P} --><ProTable
    ref="table"
    v-bind="{ ...tableBindings, ...$attrs }"
    :columns="columns"
    :card-props="cardProps ?? false"
    :search="search ?? false"
    :options="options ?? false"
    :pagination="pagination ?? false"
    :table-view-render="renderView"
    ><template v-for="(_, name) in $slots" #[name]="scope"
      ><slot :name="name" v-bind="scope ?? {}" /></template
  ></ProTable>
</template>
