<script setup lang="ts">
import type { LabelIconTipProps } from './types'
import { Tooltip } from 'antdv-next'
import { QuestionCircleOutlined } from '@antdv-next/icons'
import RenderNode from '../table/RenderNode.vue'
import { useAuxiliaryStyle } from './useAuxiliaryStyle'
const props = withDefaults(defineProps<LabelIconTipProps>(), {
  label: undefined,
  subTitle: undefined,
})
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
