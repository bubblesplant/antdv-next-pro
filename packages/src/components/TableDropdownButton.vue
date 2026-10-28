<script setup lang="ts">
import type { TableDropdownProps } from './types'
import { Dropdown, Button } from 'antdv-next'
import { DownOutlined } from '@antdv-next/icons'
import RenderNode from '../table/RenderNode.vue'
import { useAuxiliaryStyle } from './useAuxiliaryStyle'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<TableDropdownProps>(), { text: undefined })
const { prefix, direction, classes, styles, themeVars } = useAuxiliaryStyle(props, 'table-dropdown')
</script>
<template>
  <Dropdown
    :disabled="disabled"
    :menu="{
      items: (menus ?? options ?? []).map((item) => ({ ...item, label: item.label ?? item.name })),
      onClick: ({ key }) => onSelect?.(String(key)),
    }"
  >
    <Button
      v-bind="$attrs"
      :class="[prefix, classes.root]"
      :style="[themeVars, styles.root]"
      :disabled="disabled"
      :dir="direction"
      data-pro-table-dropdown
    >
      <slot><RenderNode :content="text" /></slot><DownOutlined />
    </Button>
  </Dropdown>
</template>
