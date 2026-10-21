<script setup lang="ts">
import type { CSSProperties, VNode, VNodeChild } from 'vue'
import type { ProCardProps, ProCardSemanticName, ProCardSlots } from './types'

import { QuestionCircleOutlined, RightOutlined } from '@antdv-next/icons'
import { Card, Tabs, Tooltip, useConfig } from 'antdv-next'
import { useProPrefix, useIntl, useProConfig } from './provider'
import { useSemanticStyles } from './shared/semantic'
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
const props = withDefaults(defineProps<ProCardProps>(), {
  title: undefined,
  subTitle: undefined,
  extra: undefined,
  cover: undefined,
  bordered: undefined,
  checked: undefined,
  disabled: undefined,
  collapsed: undefined,
})
const emit = defineEmits<{
  'update:collapsed': [collapsed: boolean]
  collapse: [collapsed: boolean]
  checked: [event: MouseEvent | KeyboardEvent]
  tabChange: [key: string]
}>()
const slots = defineSlots<ProCardSlots>()
const attrs = useAttrs()
const prefix = useProPrefix('card', () => props.prefixCls)
const intl = useIntl()
const { nativeConfig, token } = useProConfig()
const nativeCardToken = computed(() => nativeConfig.value.theme?.components?.Card ?? {})
const disabled = computed(() => props.disabled ?? nativeConfig.value.componentDisabled ?? false)
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
  if (props.tabs?.items) return props.tabs.items
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
  const { cardProps, ...rest } = props.tabs ?? {}
  return { ...rest, items: tabItems.value }
})
const gutter = computed(() => {
  const g = props.gutter
  return Array.isArray(g) ? [responsive(g[0]) ?? 0, responsive(g[1]) ?? 0] : [responsive(g) ?? 0, 0]
})
const { classes: resolvedClasses, styles: resolvedStyles } = useSemanticStyles(props, {
  classes: () => props.classes,
  classNames: () => props.classNames,
  styles: () => props.styles,
})
const tooltipProps = computed(() =>
  typeof props.tooltip === 'string' ? { title: props.tooltip } : (props.tooltip ?? {}),
)
const isCardGroup = computed(() => {
  const children = slots.default?.()
  return Boolean(
    props.split ||
    props.gutter ||
    props.direction ||
    (Array.isArray(children) &&
      children.some(
        (node) =>
          node &&
          typeof node === 'object' &&
          'type' in node &&
          typeof node.type === 'object' &&
          (node.type as { name?: string }).name === 'ProCard',
      )),
  )
})
const rootLayoutStyle = computed<CSSProperties>(() => ({
  ...(props.boxShadow ? { boxShadow: token.value.boxShadow } : {}),
}))
const { componentSize } = useConfig()
const isSmall = computed(() => (props.size ?? componentSize.value) === 'small')
const bodyId = `pro-card-body-${useId()}`
const internalCollapsed = ref(props.defaultCollapsed ?? false)
const isCollapsed = computed(() => props.collapsed ?? internalCollapsed.value)
const headerCollapsible = computed(
  () => props.collapsible === true || props.collapsible === 'header',
)
const showTitle = computed(() =>
  Boolean(
    slots.title ||
    slots.subTitle ||
    (props.title != null && props.title !== false) ||
    (props.subTitle != null && props.subTitle !== false) ||
    props.tooltip ||
    props.collapsible,
  ),
)
const variant = computed(() =>
  props.ghost
    ? 'borderless'
    : (props.variant ??
      (props.bordered === undefined ? undefined : props.bordered ? 'outlined' : 'borderless')),
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
        name === 'body' && props.layout === 'center' ? `${prefix.value}-body-center` : undefined,
        name === 'body' && (props.split === 'horizontal' || props.direction === 'column')
          ? `${prefix.value}-body-direction-column`
          : undefined,
        name === 'body' && props.wrap && isCardGroup.value
          ? `${prefix.value}-body-wrap`
          : undefined,
        name === 'header' && (props.headerBordered || props.type === 'inner')
          ? `${prefix.value}-header-border`
          : undefined,
        name === 'header' && props.collapsible ? `${prefix.value}-header-collapsible` : undefined,
        resolvedClasses.value[name] ?? props.classNames?.[name],
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
          props.split && index < children.length - 1 && `${prefix.value}-split-${props.split}`,
        ],
        style: {
          boxSizing: 'border-box',
          minWidth: 0,
          flex: width ? `0 0 ${width}` : '1 1 0',
          ...(span === 0 ? { display: 'none' } : {}),
          ...props.colStyle,
        },
        'data-pro-card-col': '',
      },
      [node],
    )
  })
}
const cardStyles = computed(() => {
  const cardToken = nativeCardToken.value
  const headerPadding = `${(isSmall.value ? cardToken.headerPaddingSM : cardToken.headerPadding) ?? (isSmall.value ? token.value.paddingXS : token.value.padding)}px`
  const headerHeight = isSmall.value ? cardToken.headerHeightSM : cardToken.headerHeight
  const header: CSSProperties =
    props.headerBordered || props.type === 'inner'
      ? {}
      : {
          borderBottom: 'none',
          minHeight: headerHeight ?? 'auto',
          paddingBlockStart: headerPadding,
          paddingBlockEnd: isCollapsed.value ? headerPadding : 0,
        }
  return {
    ...resolvedStyles.value,
    root: {
      ...(props.ghost ? { background: 'transparent', border: 'none', boxShadow: 'none' } : {}),
      ...rootLayoutStyle.value,
      ...resolvedStyles.value.root,
    },
    header: {
      ...header,
      ...(props.ghost ? { paddingInline: 0, paddingBlockEnd: headerPadding } : {}),
      ...(headerCollapsible.value ? { cursor: 'pointer' } : {}),
      ...props.headStyle,
      ...resolvedStyles.value.header,
    },
    body: {
      ...(props.ghost ? { padding: 0 } : {}),
      ...props.bodyStyle,
      ...(isCardGroup.value ? { padding: props.split ? 0 : undefined } : {}),
      ...resolvedStyles.value.body,
      ...(isCollapsed.value ? { display: 'none' } : {}),
    },
  }
})

function toggleCollapsed(): void {
  if (disabled.value) return
  const next = !isCollapsed.value
  if (props.collapsed === undefined) internalCollapsed.value = next
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
  if (props.checked !== undefined && !disabled.value) emit('checked', event)
}
</script>

<template>
  <Card
    v-bind="attrs"
    data-pro-card
    :data-pro-card-checked="props.checked || undefined"
    :data-pro-card-disabled="disabled || undefined"
    :tabindex="props.checked !== undefined ? (disabled ? -1 : 0) : attrs.tabindex"
    :role="props.checked !== undefined ? 'checkbox' : attrs.role"
    :aria-checked="props.checked"
    :aria-disabled="disabled || undefined"
    @keydown="
      ($event.key === 'Enter' || $event.key === ' ') &&
      props.checked !== undefined &&
      !disabled &&
      ($event.preventDefault(), emit('checked', $event))
    "
    :data-pro-card-split="props.split"
    :class="[
      {
        [`${prefix}-ghost`]: props.ghost,
        [`${prefix}-checked`]: props.checked,
        [`${prefix}-split`]: props.split,
        [`${prefix}-collapsible`]: props.collapsible,
        [`${prefix}-collapse`]: isCollapsed,
        [`${prefix}-contain-card`]: isCardGroup,
        [`${prefix}-border`]:
          variant !== 'borderless' &&
          (isCardGroup ||
            props.collapsible ||
            props.ghost ||
            props.checked !== undefined ||
            props.boxShadow ||
            props.layout === 'center'),
        [`${prefix}-box-shadow`]: props.boxShadow,
        [`${prefix}-loading`]: props.loading,
        [`${prefix}-hoverable`]: props.hoverable,
        [`${prefix}-size-${props.size}`]: props.size,
        [`${prefix}-type-${props.type}`]: props.type,
      },
      attrs.class,
    ]"
    :style="themeVars"
    :classes="cardClasses"
    :styles="cardStyles"
    :variant="variant"
    :size="props.size === 'default' ? 'medium' : props.size"
    :type="props.type === 'inner' ? 'inner' : undefined"
    :hoverable="props.hoverable"
    :loading="props.loading && !slots.loading && !isCollapsed"
    :cover="isCollapsed ? undefined : props.cover"
    :actions="isCollapsed ? undefined : props.actions"
    :aria-busy="props.loading || undefined"
    @click="handleRootClick"
  >
    <template v-if="showTitle" #title>
      <div :class="`${prefix}-title-heading`" data-pro-card-title-heading>
        <button
          v-if="props.collapsible"
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
              v-if="props.collapsibleIconRender"
              :content="props.collapsibleIconRender({ collapsed: isCollapsed })"
            /><RightOutlined v-else :rotate="isCollapsed ? 0 : 90" aria-hidden="true" />
          </slot>
        </button>
        <slot name="title"><RenderNode :content="props.title" /></slot>
        <span
          v-if="slots.subTitle || (props.subTitle != null && props.subTitle !== false)"
          :class="`${prefix}-sub-title`"
          data-pro-card-sub-title
        >
          <slot name="subTitle"><RenderNode :content="props.subTitle" /></slot>
        </span>
        <Tooltip v-if="props.tooltip" v-bind="tooltipProps">
          <QuestionCircleOutlined
            :class="`${prefix}-tooltip`"
            data-pro-card-tooltip
            tabindex="0"
            :aria-label="typeof tooltipProps.title === 'string' ? tooltipProps.title : undefined"
          />
        </Tooltip>
      </div>
    </template>
    <template v-if="slots.extra || (props.extra != null && props.extra !== false)" #extra>
      <slot name="extra"><RenderNode :content="props.extra" /></slot>
    </template>
    <template v-if="slots.cover && !isCollapsed" #cover><slot name="cover" /></template>
    <template v-if="slots.actions && !isCollapsed" #actions><slot name="actions" /></template>
    <Tabs
      v-if="props.tabs"
      v-bind="tabsBindings"
      :data-pro-card-tabs-ghost="props.tabs.cardProps?.ghost || undefined"
      :class="[`${prefix}-tabs`, { [`${prefix}-tabs-ghost`]: props.tabs.cardProps?.ghost }]"
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
              flexDirection: props.split === 'horizontal' ? 'column' : (props.direction ?? 'row'),
              flexWrap: props.wrap ? 'wrap' : 'nowrap',
              columnGap: `${gutter[0]}px`,
              rowGap: `${gutter[1]}px`,
            }
          : props.layout === 'center'
            ? { display: 'flex', alignItems: 'center', justifyContent: 'center' }
            : undefined
      "
    >
      <slot v-if="props.loading && slots.loading" name="loading" />
      <RenderNode v-else :content="renderBodyChildren()" />
    </div>
  </Card>
</template>

<style>
[data-pro-card] {
  min-width: 0;
}
[data-pro-card-tabs-ghost] [role='tabpanel'] {
  padding: 0;
}
[data-pro-card-disabled] {
  opacity: 0.55;
  cursor: not-allowed;
}
[data-pro-card-checked] {
  outline: 1px solid var(--antdv-next-pro-color-primary);
}
[data-pro-card-col] > [data-pro-card] {
  height: 100%;
}
[data-pro-card-split='vertical']
  > div
  > [data-pro-card-content]
  > [data-pro-card-col]
  + [data-pro-card-col] {
  border-inline-start: 1px solid var(--antdv-next-pro-color-border-secondary, #f0f0f0);
}
[data-pro-card-split='horizontal']
  > div
  > [data-pro-card-content]
  > [data-pro-card-col]
  + [data-pro-card-col] {
  border-block-start: 1px solid var(--antdv-next-pro-color-border-secondary, #f0f0f0);
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
