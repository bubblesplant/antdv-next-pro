<script setup lang="ts">
import type { VNodeChild } from 'vue'
import { Tooltip } from 'antdv-next'
import { computed, ref, useAttrs, useSlots } from 'vue'

import { resolveSemantic, useFormPrefix } from './utils'
import { useFormThemeVars } from './useFormThemeVars'

import VNodeContent from '../shared/VNodeContent'

import { proFormGroupProps } from './componentProps'

defineOptions({ name: 'ProFormGroup', inheritAttrs: false })
const {
  prefixCls: propPrefixCls,
  classes: propClasses,
  classNames: propClassNames,
  styles: propStyles,
  title: propTitle,
  titleStyle: propTitleStyle,
  tooltip: propTooltip,
  extra: propExtra,
  collapsible: propCollapsible,
  collapsed: propCollapsed,
  defaultCollapsed: propDefaultCollapsed,
  direction: propDirection,
  size: propSize,
  labelLayout: propLabelLayout,
} = defineProps(proFormGroupProps)
const emit = defineEmits(['update:collapsed', 'collapse'])
const attrs = useAttrs()
const slots = useSlots()
const props = {
  get prefixCls() {
    return propPrefixCls
  },
  get classes() {
    return propClasses
  },
  get classNames() {
    return propClassNames
  },
  get styles() {
    return propStyles
  },
  get title() {
    return propTitle
  },
  get titleStyle() {
    return propTitleStyle
  },
  get tooltip() {
    return propTooltip
  },
  get extra() {
    return propExtra
  },
  get collapsible() {
    return propCollapsible
  },
  get collapsed() {
    return propCollapsed
  },
  get defaultCollapsed() {
    return propDefaultCollapsed
  },
  get direction() {
    return propDirection
  },
  get size() {
    return propSize
  },
  get labelLayout() {
    return propLabelLayout
  },
}

const { prefix } = useFormPrefix('form-group', () => propPrefixCls)
const themeVars = useFormThemeVars()
const internal = ref(propDefaultCollapsed)
const collapsed = computed(() => propCollapsed ?? internal.value)
function toggle() {
  internal.value = !collapsed.value
  emit('update:collapsed', internal.value)
  emit('collapse', internal.value)
}
const semantic = computed(() => resolveSemantic(props))
const gap = computed(() =>
  typeof propSize === 'number'
    ? `${propSize}px`
    : propSize === 'small'
      ? 'var(--pro-form-space-small, 8px)'
      : propSize === 'middle'
        ? 'var(--antdv-next-pro-padding, 16px)'
        : propSize === 'large'
          ? 'var(--antdv-next-pro-padding-lg, 24px)'
          : undefined,
)
</script>

<template>
  <div
    v-bind="attrs"
    data-pro-form-group=""
    :data-pro-form-label-layout="propLabelLayout"
    :class="[
      prefix,
      attrs.class,
      semantic.classes.root,
      { [`${prefix}-collapsed`]: collapsed, [`${prefix}-twoLine`]: propLabelLayout === 'twoLine' },
    ]"
    :style="[themeVars, attrs.style as any, semantic.styles.root]"
  >
    <div
      v-if="slots.title || propTitle || propTooltip || slots.extra || propExtra || propCollapsible"
      data-pro-form-group-title=""
      :class="[`${prefix}-title`, semantic.classes.title]"
      :style="[propTitleStyle, semantic.styles.title]"
    >
      <button
        v-if="propCollapsible"
        type="button"
        data-pro-form-group-toggle=""
        :class="`${prefix}-collapse-button`"
        :aria-expanded="!collapsed"
        @click="toggle"
      >
        {{ collapsed ? '› ' : '⌄ ' }}
        <slot name="title"><VNodeContent :content="propTitle as VNodeChild" /></slot>
      </button>
      <slot v-else name="title"><VNodeContent :content="propTitle as VNodeChild" /></slot>
      <Tooltip
        v-if="propTooltip"
        v-bind="typeof propTooltip === 'object' ? propTooltip : { title: propTooltip }"
      >
        <span tabindex="0" :class="`${prefix}-tooltip`"> ⓘ</span>
      </Tooltip>
      <span data-pro-form-group-extra="" :class="`${prefix}-extra`">
        <slot name="extra"><VNodeContent :content="propExtra as VNodeChild" /></slot>
      </span>
    </div>
    <div
      data-pro-form-group-content=""
      :data-pro-form-label-layout="propLabelLayout"
      :class="[`${prefix}-container`, semantic.classes.container]"
      :style="[
        {
          display: collapsed ? 'none' : 'flex',
          flexDirection: propDirection === 'vertical' ? 'column' : 'row',
          gap,
          flexWrap: 'wrap',
          rowGap: 0,
          alignItems: 'flex-start',
        },
        semantic.styles.container,
      ]"
    >
      <slot />
    </div>
  </div>
</template>
