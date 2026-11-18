<script setup lang="ts">
import type { LabelIconTipProps } from './types'
import { Tooltip } from 'antdv-next'
import { QuestionCircleOutlined } from '@antdv-next/icons'
import RenderNode from '../table/RenderNode.vue'
import { useAuxiliaryStyle } from './useAuxiliaryStyle'
const {
  label = undefined,
  tooltip,
  subTitle = undefined,
  ellipsis,
  prefixCls,
  classes: classesProp,
  classNames,
  styles: stylesProp,
} = defineProps<LabelIconTipProps>()
// 保留整体 props 接口，getter 持续读取响应式解构值。
const props = {
  get label() {
    return label
  },
  get tooltip() {
    return tooltip
  },
  get subTitle() {
    return subTitle
  },
  get ellipsis() {
    return ellipsis
  },
  get prefixCls() {
    return prefixCls
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
}
const { prefix, direction, classes, styles, themeVars } = useAuxiliaryStyle(props, 'core-label-tip')
</script>
<template>
  <span
    :class="[prefix, classes.root]"
    :style="[
      themeVars,
      { boxSizing: 'border-box', display: 'inline-flex', alignItems: 'center', maxWidth: '100%' },
      styles.root,
    ]"
    data-pro-label-tip
    :dir="direction"
    ><span
      :class="classes.label"
      :style="[
        { display: 'inline-flex', flex: 1, minWidth: 0 },
        ellipsis
          ? { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
          : undefined,
        styles.label,
      ]"
      ><slot><RenderNode :content="label" /></slot></span
    ><span
      v-if="subTitle"
      :class="[`${prefix}-sub-title`, classes.subTitle]"
      :style="[
        {
          marginInlineStart: '8px',
          color: 'var(--antdv-next-pro-color-text-secondary)',
          fontSize: 'var(--antdv-next-pro-font-size)',
          fontWeight: 'normal',
          whiteSpace: 'nowrap',
        },
        styles.subTitle,
      ]"
      ><RenderNode :content="subTitle" /></span
    ><Tooltip v-if="tooltip" v-bind="typeof tooltip === 'string' ? { title: tooltip } : tooltip"
      ><QuestionCircleOutlined
        :class="classes.tooltip"
        :style="[{ marginInlineStart: '4px' }, styles.tooltip]"
        tabindex="0"
        :aria-label="typeof tooltip === 'string' ? tooltip : undefined" /></Tooltip
  ></span>
</template>
