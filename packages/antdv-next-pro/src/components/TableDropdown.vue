<script setup lang="ts">
import type { TableDropdownProps } from './types'
import { Dropdown } from 'antdv-next'
import { EllipsisOutlined } from '@antdv-next/icons'
import RenderNode from '../table/RenderNode.vue'
import { useAuxiliaryStyle } from './useAuxiliaryStyle'
defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<TableDropdownProps>(), { text: undefined })
const { prefix, direction, intl, classes, styles, themeVars } = useAuxiliaryStyle(
  props,
  'table-dropdown',
)
</script>
<template>
  <Dropdown
    :disabled="disabled"
    :menu="{
      items: (menus ?? options ?? []).map((item) => ({ ...item, label: item.label ?? item.name })),
      onClick: ({ key }) => onSelect?.(String(key)),
    }"
    ><span
      v-bind="$attrs"
      :class="[prefix, classes.root]"
      :style="[themeVars, styles.root]"
      data-pro-table-dropdown
      :dir="direction"
      tabindex="0"
      role="button"
      :aria-label="intl.getMessage('form.lightFilter.more', '更多')"
      ><slot
        ><RenderNode v-if="text !== undefined" :content="text" /><EllipsisOutlined
          v-else /></slot></span
  ></Dropdown>
</template>
