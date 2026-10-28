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
const props = withDefaults(defineProps<ProListProps<T, P>>(), {
  itemTitleRender: undefined,
  itemHeaderRender: undefined,
  toolBarRender: undefined,
  headerTitle: undefined,
})
const slots = defineSlots<{
  [name: string]:
    | ((scope: { record?: T; index?: number; column?: ProListColumn<T> }) => VNodeChild)
    | undefined
}>()
const table = ref<ProTableInstance<T>>()
const action = useTableRef(table)
const prefix = useProPrefix('list', () => props.prefixCls)
const instance = getCurrentInstance()
const { classes, styles } = useSemanticStyles(props, {
  classes: () => props.classes,
  classNames: () => props.classNames,
  styles: () => props.styles,
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
    props.columns ??
    Object.entries(props.metas ?? {})
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
      rowKey: props.rowKey,
      rowSelection: view.rowSelection,
      expandable: props.expandable,
      grid: props.grid,
      itemCardProps: props.itemCardProps,
      itemLayout: props.itemLayout,
      split: props.split,
      showActions: props.showActions,
      showExtra: props.showExtra,
      itemRender: props.itemRender,
      itemTitleRender: props.itemTitleRender,
      itemHeaderRender: props.itemHeaderRender,
      onItem: props.onItem,
      onRow: props.onRow,
      rowClassName: props.rowClassName,
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
    :card-props="props.cardProps ?? false"
    :search="props.search ?? false"
    :options="props.options ?? false"
    :pagination="props.pagination ?? false"
    :table-view-render="renderView"
    ><template v-for="(_, name) in $slots" #[name]="scope"
      ><slot :name="name" v-bind="scope ?? {}" /></template
  ></ProTable>
</template>
