<script setup lang="ts" generic="T extends Record<string, unknown> = Record<string, unknown>">
import type { CSSProperties, VNodeChild } from 'vue'
import type { ProListViewProps, ProListColumn } from './types'
import { computed, h, inject, ref, mergeProps, nextTick, Fragment, isVNode, useSlots } from 'vue'
import { Checkbox, Radio, Button, Empty, Spin } from 'antdv-next'
import { DownOutlined, RightOutlined } from '@antdv-next/icons'
import { useProPrefix, useProConfig } from '../provider'
import { useThemeVars } from '../shared/useThemeVars'
import { ProField } from '../pro-field'
import CheckCard from '../pro-card/check-card.vue'
import { resolveColumnValueType } from '../table/valueType'
import { getValue, resolveRowKey } from '../table/utils'
import { proTableViewKey, type ProTableViewContext } from '../table/viewContext'
import RenderNode from '../table/RenderNode.vue'
import RenderView from '../components/RenderView.vue'

const {
  columns: columnsProp,
  dataSource,
  rowKey,
  rowSelection,
  expandable,
  grid,
  itemCardProps,
  split = undefined,
  itemTitleRender = undefined,
  itemHeaderRender = undefined,
  onItem,
  onRow,
  prefixCls,
  action,
  classes,
  styles,
} = defineProps<ProListViewProps<T>>()
const slots = useSlots()
const prefix = useProPrefix('list', () => prefixCls)
const { direction, token } = useProConfig()
const themeVars = useThemeVars()
const tokenStyles = computed<CSSProperties>(() => ({
  '--pro-list-padding-xs': `${token.value.paddingXS}px`,
  '--pro-list-margin-sm': `${token.value.marginSM}px`,
  '--pro-list-color-text-description': token.value.colorTextDescription,
  '--pro-list-color-selected': token.value.colorPrimaryBgHover,
  '--pro-list-color-hover': `color-mix(in srgb, ${token.value.colorTextBase} 2%, transparent)`,
  '--pro-list-line-width': `${token.value.lineWidth}px`,
  '--pro-list-line-type': token.value.lineType,
  '--pro-list-line-height': token.value.lineHeight,
}))
const tableView = inject<ProTableViewContext<T>>(proTableViewKey)
const selected = ref<import('../types').ProKey[]>(
  rowSelection ? (rowSelection.defaultSelectedRowKeys ?? []) : [],
)
const expanded = ref<import('../types').ProKey[]>([...(expandable?.defaultExpandedRowKeys ?? [])])
const columns = computed<ProListColumn<T>[]>(() => columnsProp ?? [])
const selectedKeys = computed(() =>
  rowSelection && Array.isArray(rowSelection.selectedRowKeys)
    ? rowSelection.selectedRowKeys
    : selected.value,
)
const expandedKeys = computed(() => expandable?.expandedRowKeys ?? expanded.value)
const gridStyles = computed<CSSProperties>(() => {
  const result: Record<string, string | number> = {
    '--pro-list-gap': `${grid?.gutter ?? 16}px`,
  }
  let count = grid?.column ?? 1
  for (const size of ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as const) {
    count = grid?.[size] ?? count
    result[`--pro-list-${size}`] = count
  }
  return result
})
function keyOf(record: T, index: number) {
  return resolveRowKey(record, rowKey) ?? index
}
function meta(slot: string) {
  return columns.value.find(
    (column) => column.listSlot === slot || (!column.listSlot && column.dataIndex === slot),
  )
}
function value(record: T, slot: string) {
  return getValue(record, meta(slot)?.dataIndex ?? slot)
}
function renderSlot(record: T, index: number, slot: string): VNodeChild {
  const column = meta(slot)
  if (!column) return undefined
  if (tableView) return tableView.renderCell(record, column, index)
  const text =
    column.renderText && action
      ? column.renderText(value(record, slot), record, index, action)
      : value(record, slot)
  const dom = h(ProField, {
    text,
    valueType: resolveColumnValueType(column.valueType, record, index),
    fieldProps:
      typeof column.fieldProps === 'function' ? column.fieldProps(record) : column.fieldProps,
    valueEnum: typeof column.valueEnum === 'function' ? column.valueEnum() : column.valueEnum,
    copyable: column.copyable,
    ellipsis: column.ellipsis,
  })
  return column.render && action ? column.render(dom, record, index, action, column) : dom
}
function select(record: T, index: number, checked: boolean, event: Event) {
  const key = keyOf(record, index)
  selected.value =
    rowSelection && rowSelection.type === 'radio'
      ? [key]
      : checked
        ? [...new Set([...selectedKeys.value, key])]
        : selectedKeys.value.filter((item) => item !== key)
  const rows = dataSource?.filter((item, i) => selected.value.includes(keyOf(item, i))) ?? []
  if (rowSelection) {
    rowSelection.onSelect?.(record, checked, rows, event)
    rowSelection.onChange?.(selected.value, rows, { type: 'single' })
  }
  // Native checkbox clicks mutate the input before an unchanged controlled prop can patch it.
  void nextTick(() => {
    if (rowSelection && rowSelection.selectedRowKeys && event?.target instanceof HTMLInputElement)
      event.target.checked = selectedKeys.value.includes(key)
  })
}
function toggle(record: T, index: number) {
  const key = keyOf(record, index)
  const open = !expandedKeys.value.includes(key)
  expanded.value = open
    ? [...expandedKeys.value, key]
    : expandedKeys.value.filter((item) => item !== key)
  expandable?.onExpand?.(open, record)
  expandable?.onExpandedRowsChange?.(expanded.value)
}
function rowBindings(record: T, index: number) {
  return mergeProps(
    { ...onRow?.(record, index) },
    { ...onItem?.(record, index) },
    expandable?.expandRowByClick ? { onClick: () => toggle(record, index) } : {},
  )
}
function customRender(render: ProListViewProps<T>['itemTitleRender'], record: T, index: number) {
  return typeof render === 'function' ? (dom: VNodeChild) => render(record, index, dom) : undefined
}
function needExpanded(record: T, index: number) {
  return (
    !expandable ||
    !Object.keys(expandable).length ||
    expandedKeys.value.includes(keyOf(record, index))
  )
}
function actionItems(dom: VNodeChild): VNodeChild[] {
  return Array.isArray(dom)
    ? dom.flatMap((child) => actionItems(child))
    : isVNode(dom) && dom.type === Fragment
      ? actionItems(dom.children as VNodeChild)
      : dom == null || typeof dom === 'boolean'
        ? []
        : [dom]
}
function renderActions(record: T, index: number): VNodeChild {
  const children = actionItems(
    slots.actions?.({ record, index }) ?? renderSlot(record, index, 'actions'),
  )
  return children.map((child, key) =>
    h('div', { key, class: `${prefix.value}-item-action-item` }, [child]),
  )
}
function renderGridCard(record: T, index: number): VNodeChild {
  const showBody = needExpanded(record, index)
  const actions = meta('actions') || slots.actions ? renderActions(record, index) : undefined
  const footer = meta('actions')?.cardActionProps === 'actions'
  const title =
    slots.title?.({ record, index }) ?? renderSlot(record, index, 'title') ?? itemCardProps?.title
  const titleDom =
    typeof itemTitleRender === 'function'
      ? itemTitleRender(record, index, title)
      : itemTitleRender === false
        ? undefined
        : title
  const actionDom = actions
    ? h(
        'div',
        {
          class: [`${prefix.value}-item-action`, `${prefix.value}-row-actions`, classes?.actions],
          style: styles?.actions,
          'data-pro-list-row-actions': '',
          onClick: (event: Event) => event.stopPropagation(),
        },
        [actions],
      )
    : undefined
  const header = h(
    'div',
    {
      class: [`${prefix.value}-row-header-container`, classes?.header],
      style: styles?.header,
      'data-pro-list-row-header': '',
    },
    [
      slots.avatar?.({ record, index }) ?? renderSlot(record, index, 'avatar'),
      h(
        'span',
        {
          class: [`${prefix.value}-item-meta-title`, `${prefix.value}-row-title`, classes?.title],
          style: styles?.title,
          'data-pro-list-row-title': '',
        },
        [titleDom],
      ),
      meta('subTitle') || slots.subTitle
        ? h(
            'span',
            {
              class: [`${prefix.value}-row-sub-title`, classes?.subTitle],
              style: styles?.subTitle,
              'data-pro-list-row-sub-title': '',
            },
            [slots.subTitle?.({ record, index }) ?? renderSlot(record, index, 'subTitle')],
          )
        : undefined,
    ],
  )
  const headerDom =
    typeof itemHeaderRender === 'function' ? itemHeaderRender(record, index, header) : header
  const extraDom =
    meta('extra') || slots.extra
      ? h(
          'div',
          {
            class: [`${prefix.value}-row-extra`, classes?.extra],
            style: styles?.extra,
            'data-pro-list-row-extra': '',
          },
          [slots.extra?.({ record, index }) ?? renderSlot(record, index, 'extra')],
        )
      : undefined
  const description =
    meta('description') || slots.description
      ? h(
          'div',
          {
            class: [
              `${prefix.value}-item-meta-description`,
              `${prefix.value}-row-description`,
              classes?.description,
            ],
            style: styles?.description,
            'data-pro-list-row-description': '',
          },
          [slots.description?.({ record, index }) ?? renderSlot(record, index, 'description')],
        )
      : undefined
  const content =
    meta('content') || slots.content
      ? h(
          'div',
          {
            class: [`${prefix.value}-row-content`, classes?.content],
            style: styles?.content,
          },
          [slots.content?.({ record, index }) ?? renderSlot(record, index, 'content')],
        )
      : undefined
  return h(
    CheckCard,
    {
      ...itemCardProps,
      class: [`${prefix.value}-row-card`, itemCardProps?.class],
      title: undefined,
      subTitle: itemHeaderRender === false ? undefined : itemCardProps?.subTitle,
      avatar:
        itemHeaderRender === false || meta('avatar') || slots.avatar
          ? undefined
          : itemCardProps?.avatar,
      disabled:
        (rowSelection && rowSelection.getCheckboxProps?.(record)?.disabled) ||
        itemCardProps?.disabled,
      selectionType: rowSelection ? (rowSelection.type ?? 'checkbox') : undefined,
      'aria-label': rowSelection
        ? String(value(record, 'title') ?? keyOf(record, index))
        : undefined,
      checked: rowSelection
        ? selectedKeys.value.includes(keyOf(record, index))
        : itemCardProps?.checked,
      onChange: rowSelection ? undefined : itemCardProps?.onChange,
      'onUpdate:checked': rowSelection ? undefined : itemCardProps?.['onUpdate:checked'],
      onSelect: rowSelection
        ? (checked: boolean, event: Event) => select(record, index, checked, event)
        : undefined,
    },
    {
      ...(itemHeaderRender !== false ? { title: () => headerDom } : {}),
      ...(extraDom || (actions && !footer)
        ? { extra: () => [extraDom ?? itemCardProps?.extra, footer ? undefined : actionDom] }
        : {}),
      ...(actions && footer ? { actions: () => actionDom } : {}),
      ...(description || !showBody
        ? { description: () => (showBody ? description : undefined) }
        : {}),
      default: () => (showBody ? content : undefined),
    },
  )
}
</script>
<template>
  <Spin :spinning="typeof loading === 'object' ? loading.spinning : Boolean(loading)">
    <div
      :class="[prefix, classes?.root]"
      :dir="direction"
      data-pro-list
      :style="[themeVars, tokenStyles, gridStyles, styles?.root]"
    >
      <Empty v-if="!dataSource?.length" />
      <ul
        v-else
        :class="[`${prefix}-container`, classes?.container]"
        :style="styles?.container"
        data-pro-list-container
        :data-grid="grid ? true : undefined"
      >
        <li
          v-for="(record, index) in dataSource"
          :key="keyOf(record, index)"
          v-bind="rowBindings(record, index)"
          :class="[
            `${prefix}-item`,
            `${prefix}-row`,
            {
              [`${prefix}-row-selected`]: selectedKeys.includes(keyOf(record, index)),
              [`${prefix}-row-show-action-hover`]: showActions === 'hover',
              [`${prefix}-row-show-extra-hover`]: showExtra === 'hover',
              [`${prefix}-row-item-has-checkbox`]: rowSelection,
              [`${prefix}-row-item-has-avatar`]: meta('avatar'),
            },
            classes?.row,
            typeof rowClassName === 'function' ? rowClassName(record, index) : rowClassName,
          ]"
          :style="styles?.row"
          :data-row-key="keyOf(record, index)"
          data-pro-list-row
          :data-split="split !== false || undefined"
          :data-split-border="split === true || undefined"
          :data-layout="itemLayout"
          :data-actions="showActions"
          :data-extra="showExtra"
          :data-selected="selectedKeys.includes(keyOf(record, index)) || undefined"
        >
          <RenderView :render="itemRender ? (dom) => itemRender!(record, index, dom) : undefined">
            <RenderNode v-if="grid" :content="renderGridCard(record, index)" />
            <div
              v-else
              :class="[`${prefix}-item-main`, `${prefix}-row-container`]"
              data-pro-list-row-container
            >
              <div :class="`${prefix}-row-header-option`">
                <span v-if="rowSelection" :class="`${prefix}-row-checkbox`" @click.stop
                  ><component
                    :is="rowSelection.type === 'radio' ? Radio : Checkbox"
                    v-bind="rowSelection.getCheckboxProps?.(record)"
                    :checked="selectedKeys.includes(keyOf(record, index))"
                    :aria-label="String(value(record, 'title') ?? keyOf(record, index))"
                    @change="
                      select(record, index, Boolean($event.target.checked), $event.nativeEvent)
                    "
                /></span>
                <Button
                  v-if="
                    expandable && (!expandable.rowExpandable || expandable.rowExpandable(record))
                  "
                  :class="[
                    `${prefix}-row-expand-icon`,
                    `${prefix}-row-${expandedKeys.includes(keyOf(record, index)) ? 'expanded' : 'collapsed'}`,
                  ]"
                  type="text"
                  :aria-expanded="expandedKeys.includes(keyOf(record, index))"
                  @click.stop="toggle(record, index)"
                  ><DownOutlined v-if="expandedKeys.includes(keyOf(record, index))" /><RightOutlined
                    v-else
                /></Button>
              </div>
              <div data-pro-list-row-main>
                <RenderView
                  v-if="itemHeaderRender !== false"
                  :render="customRender(itemHeaderRender, record, index)"
                >
                  <div :class="`${prefix}-item-meta`" data-pro-list-meta>
                    <div v-if="meta('avatar')" :class="`${prefix}-item-meta-avatar`">
                      <RenderNode :content="renderSlot(record, index, 'avatar')" />
                    </div>
                    <div :class="`${prefix}-item-meta-content`" data-pro-list-meta-content>
                      <div
                        :class="[
                          `${prefix}-row-header`,
                          `${prefix}-row-header-container`,
                          classes?.header,
                        ]"
                        :style="styles?.header"
                        data-pro-list-row-header
                      >
                        <RenderView
                          v-if="itemTitleRender !== false"
                          :render="customRender(itemTitleRender, record, index)"
                          ><div
                            :class="[
                              `${prefix}-row-title`,
                              `${prefix}-item-meta-title`,
                              classes?.title,
                            ]"
                            :style="styles?.title"
                            data-pro-list-row-title
                          >
                            <slot name="title" :record="record" :index="index"
                              ><RenderNode :content="renderSlot(record, index, 'title')"
                            /></slot></div
                        ></RenderView>
                        <span
                          v-if="meta('subTitle')"
                          :class="[`${prefix}-row-sub-title`, classes?.subTitle]"
                          :style="styles?.subTitle"
                          data-pro-list-row-sub-title
                          ><RenderNode :content="renderSlot(record, index, 'subTitle')"
                        /></span>
                      </div>
                      <div
                        v-if="meta('description') && needExpanded(record, index)"
                        :class="[
                          `${prefix}-row-description`,
                          `${prefix}-item-meta-description`,
                          classes?.description,
                        ]"
                        :style="styles?.description"
                        data-pro-list-row-description
                      >
                        <slot name="description" :record="record" :index="index"
                          ><RenderNode :content="renderSlot(record, index, 'description')"
                        /></slot>
                      </div>
                    </div>
                  </div>
                </RenderView>
                <div
                  v-if="meta('content') && needExpanded(record, index)"
                  :class="[`${prefix}-row-content`, classes?.content]"
                  :style="styles?.content"
                >
                  <slot name="content" :record="record" :index="index"
                    ><RenderNode :content="renderSlot(record, index, 'content')"
                  /></slot>
                </div>
              </div>
              <div
                v-if="meta('extra')"
                :class="[`${prefix}-item-extra`, `${prefix}-row-extra`, classes?.extra]"
                :style="styles?.extra"
                data-pro-list-row-extra
              >
                <slot name="extra" :record="record" :index="index"
                  ><RenderNode :content="renderSlot(record, index, 'extra')"
                /></slot>
              </div>
              <div
                v-if="meta('actions') || $slots.actions"
                :class="[`${prefix}-item-action`, `${prefix}-row-actions`, classes?.actions]"
                :style="styles?.actions"
                data-pro-list-row-actions
                @click.stop
              >
                <RenderView
                  v-if="$slots.actions"
                  :render="
                    (dom) =>
                      (actionItems(dom) as VNodeChild[]).map((child, key) =>
                        h('div', { key, class: `${prefix}-item-action-item` }, [child]),
                      )
                  "
                  ><slot name="actions" :record="record" :index="index" /></RenderView
                ><RenderNode v-else :content="renderActions(record, index)" />
              </div>
            </div>
            <div
              v-if="expandable && expandedKeys.includes(keyOf(record, index))"
              :class="[`${prefix}-row-expanded`, classes?.expanded]"
              :style="styles?.expanded"
            >
              <slot name="expandedRowRender" :record="record" :index="index"
                ><RenderNode :content="expandable.expandedRowRender?.(record, index, 0, true)"
              /></slot>
            </div>
          </RenderView>
        </li>
      </ul>
    </div>
  </Spin>
</template>
<style>
[data-pro-list] {
  box-sizing: border-box;
  color: var(--antdv-next-pro-color-text);
  background: transparent;
}
[data-pro-list] *,
[data-pro-list] *::before,
[data-pro-list] *::after {
  box-sizing: border-box;
}
[data-pro-list-container] {
  list-style: none;
  padding: 0;
  margin: 0;
}
[data-pro-list-container][data-grid] {
  display: grid;
  grid-template-columns: repeat(var(--pro-list-xs, 1), minmax(0, 1fr));
  gap: var(--pro-list-gap, 16px);
}
[data-pro-list-row] {
  padding: var(--pro-list-padding-xs);
  border-radius: var(--antdv-next-pro-border-radius);
  min-width: 0;
}
[data-pro-list-row][data-split] {
  border-radius: 0;
}
[data-pro-list-row][data-split-border]:not(:last-child) {
  border-block-end: var(--pro-list-line-width) var(--pro-list-line-type)
    var(--antdv-next-pro-color-split);
}
[data-pro-list-container][data-grid] > [data-pro-list-row] {
  padding: 0;
  border: 0;
}
[data-pro-list-row]:hover,
[data-pro-list-row]:focus-within {
  background: var(--pro-list-color-hover);
}
[data-pro-list-row][data-selected] {
  background: var(--pro-list-color-selected);
}
[data-pro-list-container][data-grid] > [data-pro-list-row]:hover,
[data-pro-list-container][data-grid] > [data-pro-list-row]:focus-within {
  background: transparent;
}
[data-pro-list-row-container],
[data-pro-list-row-header] {
  display: flex;
  align-items: center;
  gap: var(--antdv-next-pro-margin-xs);
}
[data-pro-list-row-main] {
  flex: 1;
  min-width: 0;
}
[data-pro-list-meta] {
  display: flex;
  align-items: flex-start;
  gap: var(--antdv-next-pro-margin-xs);
}
[data-pro-list-meta-content] {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--antdv-next-pro-margin-xxs);
}
[data-pro-list-row-header],
[data-pro-list-row-title] {
  flex-wrap: wrap;
  min-width: 0;
}
[data-pro-list-row-title] {
  display: flex;
  align-items: center;
  gap: var(--antdv-next-pro-margin-xs);
  margin: 0;
  color: var(--antdv-next-pro-color-text);
  font-size: var(--antdv-next-pro-font-size);
  font-weight: var(--antdv-next-pro-font-weight-strong);
  line-height: var(--pro-list-line-height);
  word-break: break-word;
}
[data-pro-list-row-sub-title] {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--antdv-next-pro-margin-xxs);
  color: var(--antdv-next-pro-color-text-secondary);
}
[data-pro-list-row-description] {
  margin-block-start: var(--antdv-next-pro-margin-xxs);
  color: var(--pro-list-color-text-description);
  font-size: var(--antdv-next-pro-font-size);
  line-height: var(--pro-list-line-height);
  word-break: break-all;
}
[data-pro-list-row-actions] {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: var(--pro-list-margin-sm);
}
[data-pro-list-row][data-actions='hover'] [data-pro-list-row-actions],
[data-pro-list-row][data-extra='hover'] [data-pro-list-row-extra] {
  /* Match upstream hover-only controls: hidden actions release their row space. */
  display: none;
}
[data-pro-list-row]:hover [data-pro-list-row-actions],
[data-pro-list-row]:focus-within [data-pro-list-row-actions],
[data-pro-list-row]:hover [data-pro-list-row-extra],
[data-pro-list-row]:focus-within [data-pro-list-row-extra] {
  display: flex;
}
[data-pro-list-row][data-layout='vertical'] [data-pro-list-row-container] {
  align-items: flex-start;
  flex-wrap: wrap;
}
@media (min-width: 576px) {
  [data-pro-list-container][data-grid] {
    grid-template-columns: repeat(var(--pro-list-sm), minmax(0, 1fr));
  }
}
@media (min-width: 768px) {
  [data-pro-list-container][data-grid] {
    grid-template-columns: repeat(var(--pro-list-md), minmax(0, 1fr));
  }
}
@media (min-width: 992px) {
  [data-pro-list-container][data-grid] {
    grid-template-columns: repeat(var(--pro-list-lg), minmax(0, 1fr));
  }
}
@media (min-width: 1200px) {
  [data-pro-list-container][data-grid] {
    grid-template-columns: repeat(var(--pro-list-xl), minmax(0, 1fr));
  }
}
@media (min-width: 1600px) {
  [data-pro-list-container][data-grid] {
    grid-template-columns: repeat(var(--pro-list-xxl), minmax(0, 1fr));
  }
}
</style>
