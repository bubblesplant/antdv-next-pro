<script setup lang="ts">
import type { CSSProperties } from 'vue'
import type { ProCardProps, ProCardSemanticName, ProCardSlots } from './types'

import { QuestionCircleOutlined, RightOutlined } from '@antdv-next/icons'
import { Card, Tooltip, theme, useConfig } from 'antdv-next'
import { computed, ref, useId } from 'vue'

import { useThemeVars } from './shared/useThemeVars'
import RenderNode from './table/RenderNode.vue'

const props = withDefaults(defineProps<ProCardProps>(), {
  title: undefined,
  subTitle: undefined,
  extra: undefined,
  cover: undefined,
  bordered: undefined,
  collapsed: undefined,
})
const emit = defineEmits<{
  'update:collapsed': [collapsed: boolean]
  collapse: [collapsed: boolean]
}>()
const slots = defineSlots<ProCardSlots>()
const themeVars = useThemeVars()
const { token } = theme.useToken()
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
        name === 'root' ? 'antdv-next-pro-card' : `antdv-next-pro-card__${name}`,
        props.classNames?.[name],
      ]
        .filter(Boolean)
        .join(' '),
    ]),
  )
})
const cardStyles = computed(() => {
  const headerPadding = `${isSmall.value ? token.value.paddingXS : token.value.padding}px`
  const header: CSSProperties =
    props.headerBordered || props.type === 'inner'
      ? {}
      : {
          borderBottom: 'none',
          minHeight: 'auto',
          paddingBlockStart: headerPadding,
          paddingBlockEnd: isCollapsed.value ? headerPadding : 0,
        }
  return {
    ...props.styles,
    root: {
      ...(props.ghost ? { background: 'transparent', border: 'none', boxShadow: 'none' } : {}),
      ...props.styles?.root,
    },
    header: {
      ...header,
      ...(props.ghost ? { paddingInline: 0, paddingBlockEnd: headerPadding } : {}),
      ...(headerCollapsible.value ? { cursor: 'pointer' } : {}),
      ...props.headStyle,
      ...props.styles?.header,
    },
    body: {
      ...(props.ghost ? { padding: 0 } : {}),
      ...props.bodyStyle,
      ...props.styles?.body,
      ...(isCollapsed.value ? { display: 'none' } : {}),
    },
  }
})

function toggleCollapsed(): void {
  const next = !isCollapsed.value
  if (props.collapsed === undefined) internalCollapsed.value = next
  emit('update:collapsed', next)
  emit('collapse', next)
}

function handleCardClick(event: MouseEvent): void {
  if (!headerCollapsible.value || !(event.target instanceof Element)) return
  const target = event.target
  if (target.closest('.antdv-next-pro-card') !== event.currentTarget) return
  if (!target.closest('.antdv-next-pro-card__header')) return
  if (
    target.closest(
      '.antdv-next-pro-card__extra, button, a, input, select, textarea, [role="button"], [tabindex]',
    )
  )
    return
  toggleCollapsed()
}
</script>

<template>
  <Card
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
    @click="handleCardClick"
  >
    <template v-if="showTitle" #title>
      <div class="antdv-next-pro-card__heading">
        <button
          v-if="props.collapsible"
          type="button"
          class="antdv-next-pro-card__collapse-button"
          :aria-label="isCollapsed ? '展开卡片' : '收起卡片'"
          :aria-expanded="!isCollapsed"
          :aria-controls="bodyId"
          @click.stop="toggleCollapsed"
        >
          <slot name="collapsibleIcon" :collapsed="isCollapsed">
            <RightOutlined :rotate="isCollapsed ? 0 : 90" aria-hidden="true" />
          </slot>
        </button>
        <slot name="title"><RenderNode :content="props.title" /></slot>
        <span
          v-if="slots.subTitle || (props.subTitle != null && props.subTitle !== false)"
          class="antdv-next-pro-card__subtitle"
        >
          <slot name="subTitle"><RenderNode :content="props.subTitle" /></slot>
        </span>
        <Tooltip v-if="props.tooltip" :title="props.tooltip">
          <QuestionCircleOutlined
            class="antdv-next-pro-card__tooltip"
            tabindex="0"
            :aria-label="props.tooltip"
          />
        </Tooltip>
      </div>
    </template>
    <template v-if="slots.extra || (props.extra != null && props.extra !== false)" #extra>
      <slot name="extra"><RenderNode :content="props.extra" /></slot>
    </template>
    <template v-if="slots.cover && !isCollapsed" #cover><slot name="cover" /></template>
    <template v-if="slots.actions && !isCollapsed" #actions><slot name="actions" /></template>
    <div :id="bodyId" class="antdv-next-pro-card__content">
      <slot v-if="props.loading && slots.loading" name="loading" />
      <slot v-else />
    </div>
  </Card>
</template>

<style scoped>
.antdv-next-pro-card {
  min-width: 0;
}

.antdv-next-pro-card__heading {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  white-space: normal;
  overflow-wrap: anywhere;
}

.antdv-next-pro-card__subtitle,
.antdv-next-pro-card__tooltip {
  color: var(--antdv-next-pro-color-text-secondary);
  font-size: 14px;
  font-weight: normal;
}

.antdv-next-pro-card__collapse-button {
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

.antdv-next-pro-card__collapse-button:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}
</style>
