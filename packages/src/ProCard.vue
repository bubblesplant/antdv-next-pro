<script setup lang="ts">
import type { CSSProperties, VNode, VNodeChild } from 'vue'
import type { TabsProps } from 'antdv-next'
import type { ProCardProps, ProCardSemanticName, ProCardSlots } from './types'

import { QuestionCircleOutlined, RightOutlined } from '@antdv-next/icons'
import { Card, Tabs, Tooltip, useConfig } from 'antdv-next'
import { useProPrefix, useIntl, useProConfig } from './provider'
import { mergeStyle, useSemanticStyles } from './shared/semantic'
import {
  computed,
  ref,
  useId,
  useAttrs,
  onMounted,
  onBeforeUnmount,
  provide,
  Fragment,
  isVNode,
  h,
} from 'vue'

import { useThemeVars } from './shared/useThemeVars'
import RenderNode from './table/RenderNode.vue'

defineOptions({ name: 'ProCard', inheritAttrs: false })
const {
  title = undefined,
  subTitle = undefined,
  extra = undefined,
  tooltip,
  prefixCls,
  layout,
  direction,
  wrap,
  colSpan,
  colStyle,
  gutter: gutterProp,
  split,
  checked = undefined,
  disabled: disabledProp = undefined,
  boxShadow,
  tabs,
  collapsibleIconRender,
  cover = undefined,
  actions,
  size,
  type,
  variant: variantProp,
  bordered = undefined,
  headerBordered,
  ghost,
  hoverable,
  loading,
  collapsible,
  collapsed = undefined,
  defaultCollapsed,
  headStyle,
  bodyStyle,
  styles: stylesProp,
  classes: classesProp,
  classNames,
} = defineProps<ProCardProps>()
const emit = defineEmits<{
  'update:collapsed': [collapsed: boolean]
  collapse: [collapsed: boolean]
  checked: [event: MouseEvent | KeyboardEvent]
  tabChange: [key: string]
}>()
const slots = defineSlots<ProCardSlots>()
// 保留整体 props 接口，getter 持续读取响应式解构值。
const props = {
  get title() {
    return title
  },
  get subTitle() {
    return subTitle
  },
  get extra() {
    return extra
  },
  get tooltip() {
    return tooltip
  },
  get prefixCls() {
    return prefixCls
  },
  get layout() {
    return layout
  },
  get direction() {
    return direction
  },
  get wrap() {
    return wrap
  },
  get colSpan() {
    return colSpan
  },
  get colStyle() {
    return colStyle
  },
  get gutter() {
    return gutterProp
  },
  get split() {
    return split
  },
  get checked() {
    return checked
  },
  get disabled() {
    return disabledProp
  },
  get boxShadow() {
    return boxShadow
  },
  get tabs() {
    return tabs
  },
  get collapsibleIconRender() {
    return collapsibleIconRender
  },
  get cover() {
    return cover
  },
  get actions() {
    return actions
  },
  get size() {
    return size
  },
  get type() {
    return type
  },
  get variant() {
    return variantProp
  },
  get bordered() {
    return bordered
  },
  get headerBordered() {
    return headerBordered
  },
  get ghost() {
    return ghost
  },
  get hoverable() {
    return hoverable
  },
  get loading() {
    return loading
  },
  get collapsible() {
    return collapsible
  },
  get collapsed() {
    return collapsed
  },
  get defaultCollapsed() {
    return defaultCollapsed
  },
  get headStyle() {
    return headStyle
  },
  get bodyStyle() {
    return bodyStyle
  },
  get styles() {
    return stylesProp
  },
  get classes() {
    return classesProp
  },
  get classNames() {
    return classNames
  },
}
const attrs = useAttrs()
const prefix = useProPrefix('card', () => prefixCls)
const intl = useIntl()
const { nativeConfig, token } = useProConfig()
const nativeCardToken = computed(() => nativeConfig.value.theme?.components?.Card ?? {})
const disabled = computed(() => disabledProp ?? nativeConfig.value.componentDisabled ?? false)
const themeVars = useThemeVars()
const viewportWidth = ref(typeof window === 'undefined' ? 1024 : window.innerWidth)
function onResize() {
  viewportWidth.value = window.innerWidth
}
onMounted(() => window.addEventListener('resize', onResize))
onBeforeUnmount(() => window.removeEventListener('resize', onResize))
function responsive<T>(
  value: T | Partial<Record<'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl', T>> | undefined,
): T | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return value as T | undefined
  const values = value as Partial<Record<string, T>>
  const breakpoints: Array<[string, number]> = [
    ['xxl', 1600],
    ['xl', 1200],
    ['lg', 992],
    ['md', 768],
    ['sm', 576],
    ['xs', 0],
  ]
  const match = breakpoints.find(
    ([key, width]) => viewportWidth.value >= width && values[key] !== undefined,
  )
  return match ? values[match[0]] : undefined
}
provide(
  'pro-card-layout',
  computed(() => props),
)
function flattenChildren(children: VNodeChild): VNode[] {
  return (Array.isArray(children) ? children : [children]).flatMap((child) =>
    isVNode(child)
      ? child.type === Fragment
        ? flattenChildren(child.children as VNodeChild)
        : [child]
      : [],
  )
}
const tabItems = computed(() => {
  if (tabs?.items) return tabs.items
  return flattenChildren(slots.default?.())
    .filter(
      (node) =>
        typeof node.type === 'object' && (node.type as { name?: string }).name === 'ProCardTabPane',
    )
    .map((node, index) => ({
      key: String(node.key ?? index),
      label: node.props?.tab ?? node.props?.label,
      disabled: Boolean(node.props?.disabled),
      content: node,
    }))
})
const tabsBindings = computed(() => {
  const { cardProps, styles, classes, ...rest } = tabs ?? {}
  const vertical = ['left', 'right', 'start', 'end'].includes(
    rest.tabPlacement ?? rest.tabPosition ?? 'top',
  )
  return {
    ...rest,
    items: tabItems.value,
    styles: (info: { props: TabsProps }) => {
      const own = typeof styles === 'function' ? styles(info) : styles
      return {
        ...own,
        header: {
          marginBlockEnd: 0,
          marginInlineEnd: 0,
          '--antdv-next-pro-card-tabs-nav-padding-inline': vertical
            ? 0
            : `${token.value.paddingLG}px`,
          '--antdv-next-pro-card-tabs-nav-padding-block': vertical ? `${token.value.padding}px` : 0,
          ...own?.header,
        },
        content: {
          padding: cardProps?.ghost ? 0 : `${token.value.paddingLG}px`,
          ...own?.content,
        },
      }
    },
    classes: (info: { props: TabsProps }) => {
      const own = typeof classes === 'function' ? classes(info) : classes
      return {
        ...own,
        header: ['antdv-next-pro-card-tabs-header', own?.header].filter(Boolean).join(' '),
      }
    },
  }
})
const gutter = computed(() => {
  const g = gutterProp
  return Array.isArray(g) ? [responsive(g[0]) ?? 0, responsive(g[1]) ?? 0] : [responsive(g) ?? 0, 0]
})
const { classes: resolvedClasses, styles: resolvedStyles } = useSemanticStyles(props, {
  classes: () => classesProp,
  classNames: () => classNames,
  styles: () => stylesProp,
})
const tooltipProps = computed(() =>
  typeof tooltip === 'string' ? { title: tooltip } : (tooltip ?? {}),
)
const isCardGroup = computed(() => {
  return Boolean(
    split ||
    flattenChildren(slots.default?.()).some(
      (node) =>
        typeof node.type === 'object' && (node.type as { name?: string }).name === 'ProCard',
    ),
  )
})
const rootLayoutStyle = computed<CSSProperties>(() => ({
  '--antdv-next-pro-card-split-border': `${token.value.lineWidth}px ${token.value.lineType} ${token.value.colorSplit}`,
  ...(checked
    ? {
        backgroundColor: token.value.controlItemBgActive,
        borderColor: token.value.controlOutline,
      }
    : {}),
  ...(boxShadow ? { boxShadow: token.value.boxShadowTertiary } : {}),
}))
const { componentSize } = useConfig()
const isSmall = computed(() => (size ?? componentSize.value) === 'small')
const bodyId = `pro-card-body-${useId()}`
const internalCollapsed = ref(defaultCollapsed ?? false)
const isCollapsed = computed(() => collapsed ?? internalCollapsed.value)
const headerCollapsible = computed(() => collapsible === true || collapsible === 'header')
const showTitle = computed(() =>
  Boolean(
    slots.title ||
    slots.subTitle ||
    (title != null && title !== false) ||
    (subTitle != null && subTitle !== false) ||
    tooltip ||
    collapsible,
  ),
)
const variant = computed(() =>
  ghost
    ? 'borderless'
    : (variantProp ?? (bordered === undefined ? undefined : bordered ? 'outlined' : 'borderless')),
)
const cardClasses = computed(() => {
  const names: ProCardSemanticName[] = [
    'root',
    'header',
    'body',
    'extra',
    'title',
    'actions',
    'cover',
  ]
  return Object.fromEntries(
    names.map((name) => [
      name,
      [
        name === 'root' ? prefix.value : `${prefix.value}-${name}`,
        name === 'body' && layout === 'center' ? `${prefix.value}-body-center` : undefined,
        name === 'body' && (split === 'horizontal' || direction === 'column')
          ? `${prefix.value}-body-direction-column`
          : undefined,
        name === 'body' && wrap && isCardGroup.value ? `${prefix.value}-body-wrap` : undefined,
        name === 'header' && (headerBordered || type === 'inner')
          ? `${prefix.value}-header-border`
          : undefined,
        name === 'header' && collapsible ? `${prefix.value}-header-collapsible` : undefined,
        resolvedClasses.value[name] ?? classNames?.[name],
      ]
        .filter(Boolean)
        .join(' '),
    ]),
  )
})

function renderBodyChildren(): VNodeChild {
  const children = flattenChildren(slots.default?.())
  return children.map((node, index) => {
    if (typeof node.type !== 'object' || (node.type as { name?: string }).name !== 'ProCard')
      return node
    const span = responsive<number | string>(node.props?.colSpan ?? node.props?.['col-span'])
    const width =
      typeof span === 'number'
        ? `calc((100% - ${gutter.value[0]! * (span ? 24 / span - 1 : 0)}px) * ${span} / 24)`
        : span
    return h(
      'div',
      {
        key: node.key ?? index,
        class: [
          `${prefix.value}-col`,
          typeof span === 'number' && `${prefix.value}-col-${span}`,
          split && index < children.length - 1 && `${prefix.value}-split-${split}`,
        ],
        style: {
          boxSizing: 'border-box',
          minWidth: 0,
          flex: width ? `0 0 ${width}` : '1 1 0',
          ...(span === 0 ? { display: 'none' } : {}),
          ...colStyle,
        },
        'data-pro-card-col': '',
      },
      [node],
    )
  })
}
const cardStyles = computed(() => {
  const cardToken = nativeCardToken.value
  const headerPadding = `${isSmall.value ? token.value.paddingXS : token.value.padding}px`
  const headerHeight = isSmall.value ? cardToken.headerHeightSM : cardToken.headerHeight
  const header: CSSProperties =
    headerBordered || type === 'inner'
      ? {}
      : {
          borderBottom: 'none',
          minHeight: headerHeight ?? 'auto',
          paddingBlockStart: headerPadding,
          paddingBlockEnd: isCollapsed.value ? headerPadding : 0,
        }
  return {
    ...resolvedStyles.value,
    root: mergeStyle(
      rootLayoutStyle.value,
      ghost ? { background: 'transparent', border: 'none', boxShadow: 'none' } : undefined,
      resolvedStyles.value.root,
    ),
    header: mergeStyle(
      header,
      ghost ? { paddingInline: 0, paddingBlockEnd: headerPadding } : undefined,
      headerCollapsible.value ? { cursor: 'pointer' } : undefined,
      headStyle,
      resolvedStyles.value.header,
    ),
    body: mergeStyle(
      ghost || tabs || (isCardGroup.value && !loading) ? { padding: 0 } : undefined,
      bodyStyle,
      resolvedStyles.value.body,
      isCollapsed.value ? { display: 'none' } : undefined,
    ),
  }
})

function toggleCollapsed(): void {
  if (disabled.value) return
  const next = !isCollapsed.value
  if (collapsed === undefined) internalCollapsed.value = next
  emit('update:collapsed', next)
  emit('collapse', next)
}

function handleCardClick(event: MouseEvent): void {
  if (disabled.value || !headerCollapsible.value || !(event.target instanceof Element)) return
  const target = event.target
  if (target.closest(`.${prefix.value}`) !== event.currentTarget) return
  if (!target.closest(`.${prefix.value}-header`)) return
  if (
    target.closest(
      `.${prefix.value}-extra, button, a, input, select, textarea, [role="button"], [tabindex]`,
    )
  )
    return
  toggleCollapsed()
}

function handleRootClick(event: MouseEvent): void {
  handleCardClick(event)
  if (checked !== undefined && !disabled.value) emit('checked', event)
}
</script>

<template>
  <Card
    v-bind="attrs"
    data-pro-card
    :data-pro-card-hoverable="hoverable || undefined"
    :data-pro-card-checked="checked || undefined"
    :data-pro-card-disabled="disabled || undefined"
    :tabindex="checked !== undefined ? (disabled ? -1 : 0) : attrs.tabindex"
    :role="checked !== undefined ? 'checkbox' : attrs.role"
    :aria-checked="checked"
    :aria-disabled="disabled || undefined"
    @keydown="
      ($event.key === 'Enter' || $event.key === ' ') &&
      checked !== undefined &&
      !disabled &&
      ($event.preventDefault(), emit('checked', $event))
    "
    :data-pro-card-split="split"
    :class="[
      {
        [`${prefix}-ghost`]: ghost,
        [`${prefix}-checked`]: checked,
        [`${prefix}-split`]: split,
        [`${prefix}-collapsible`]: collapsible,
        [`${prefix}-collapse`]: isCollapsed,
        [`${prefix}-contain-card`]: isCardGroup,
        [`${prefix}-border`]:
          variant !== 'borderless' &&
          (isCardGroup ||
            collapsible ||
            ghost ||
            checked !== undefined ||
            boxShadow ||
            layout === 'center'),
        [`${prefix}-box-shadow`]: boxShadow,
        [`${prefix}-loading`]: loading,
        [`${prefix}-hoverable`]: hoverable,
        [`${prefix}-size-${size}`]: size,
        [`${prefix}-type-${type}`]: type,
      },
      attrs.class,
    ]"
    :style="themeVars"
    :classes="cardClasses"
    :styles="cardStyles"
    :variant="variant"
    :size="size === 'default' ? 'medium' : size"
    :type="type === 'inner' ? 'inner' : undefined"
    :hoverable="hoverable"
    :loading="loading && !slots.loading && !isCollapsed"
    :cover="isCollapsed ? undefined : cover"
    :actions="isCollapsed ? undefined : actions"
    :aria-busy="loading || undefined"
    @click="handleRootClick"
  >
    <template v-if="showTitle" #title>
      <div :class="`${prefix}-title-heading`" data-pro-card-title-heading>
        <button
          v-if="collapsible"
          type="button"
          :class="`${prefix}-collapsible-icon`"
          data-pro-card-collapsible-icon
          :disabled="disabled"
          :aria-label="
            intl.getMessage(
              isCollapsed ? 'tableForm.collapsed' : 'tableForm.expand',
              isCollapsed ? '展开' : '收起',
            )
          "
          :aria-expanded="!isCollapsed"
          :aria-controls="bodyId"
          @click.stop="toggleCollapsed"
        >
          <slot name="collapsibleIcon" :collapsed="isCollapsed">
            <RenderNode
              v-if="collapsibleIconRender"
              :content="collapsibleIconRender({ collapsed: isCollapsed })"
            /><RightOutlined v-else :rotate="isCollapsed ? 0 : 90" aria-hidden="true" />
          </slot>
        </button>
        <slot name="title"><RenderNode :content="title" /></slot>
        <span
          v-if="slots.subTitle || (subTitle != null && subTitle !== false)"
          :class="`${prefix}-sub-title`"
          data-pro-card-sub-title
        >
          <slot name="subTitle"><RenderNode :content="subTitle" /></slot>
        </span>
        <Tooltip v-if="tooltip" v-bind="tooltipProps">
          <QuestionCircleOutlined
            :class="`${prefix}-tooltip`"
            data-pro-card-tooltip
            tabindex="0"
            :aria-label="typeof tooltipProps.title === 'string' ? tooltipProps.title : undefined"
          />
        </Tooltip>
      </div>
    </template>
    <template v-if="slots.extra || (extra != null && extra !== false)" #extra>
      <slot name="extra"><RenderNode :content="extra" /></slot>
    </template>
    <template v-if="slots.cover && !isCollapsed" #cover><slot name="cover" /></template>
    <template v-if="slots.actions && !isCollapsed" #actions><slot name="actions" /></template>
    <Tabs
      v-if="tabs"
      v-bind="tabsBindings"
      :data-pro-card-tabs-ghost="tabs.cardProps?.ghost || undefined"
      :class="[`${prefix}-tabs`, { [`${prefix}-tabs-ghost`]: tabs.cardProps?.ghost }]"
      @change="emit('tabChange', String($event))"
    />
    <div
      v-else
      :id="bodyId"
      :class="`${prefix}-content`"
      data-pro-card-content
      :style="
        isCardGroup
          ? {
              display: 'flex',
              flexDirection: split === 'horizontal' ? 'column' : (direction ?? 'row'),
              flexWrap: wrap ? 'wrap' : 'nowrap',
              columnGap: `${gutter[0]}px`,
              rowGap: `${gutter[1]}px`,
            }
          : layout === 'center'
            ? { display: 'flex', alignItems: 'center', justifyContent: 'center' }
            : undefined
      "
    >
      <slot v-if="loading && slots.loading" name="loading" />
      <RenderNode v-else :content="renderBodyChildren()" />
    </div>
  </Card>
</template>

<style>
[data-pro-card] {
  min-width: 0;
}
/* ProCard is flat by default; retain the native Card hover shadow when requested. */
[data-pro-card]:not([data-pro-card-hoverable]:hover) {
  box-shadow: none;
}
.antdv-next-pro-card-tabs-header > [class*='-nav-wrap'] > [class*='-nav-list'] {
  padding-inline-start: var(--antdv-next-pro-card-tabs-nav-padding-inline);
  padding-block-start: var(--antdv-next-pro-card-tabs-nav-padding-block);
}
[data-pro-card-disabled] {
  opacity: 0.55;
  cursor: not-allowed;
}
[data-pro-card-checked] {
  position: relative;
}
[data-pro-card-checked]::after {
  position: absolute;
  inset-block-start: 2px;
  inset-inline-end: 2px;
  width: 0;
  height: 0;
  border: 6px solid var(--antdv-next-pro-color-primary);
  border-block-end-color: transparent;
  border-inline-start-color: transparent;
  border-start-end-radius: 2px;
  content: '';
}
[data-pro-card-col] > [data-pro-card] {
  height: 100%;
}
[data-pro-card-split='vertical']
  > div
  > [data-pro-card-content]
  > [data-pro-card-col]
  + [data-pro-card-col] {
  border-inline-start: var(--antdv-next-pro-card-split-border);
}
[data-pro-card-split='horizontal']
  > div
  > [data-pro-card-content]
  > [data-pro-card-col]
  + [data-pro-card-col] {
  border-block-start: var(--antdv-next-pro-card-split-border);
}
[data-pro-card-title-heading] {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  white-space: normal;
  overflow-wrap: anywhere;
}
[data-pro-card-sub-title],
[data-pro-card-tooltip] {
  color: var(--antdv-next-pro-color-text-secondary);
  font-size: 14px;
  font-weight: normal;
}
[data-pro-card-collapsible-icon] {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  padding: 4px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
}
[data-pro-card-collapsible-icon]:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}
</style>
