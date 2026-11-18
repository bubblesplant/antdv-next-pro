<script setup lang="ts">
import type { TableDropdownProps } from './types'
import { Dropdown, Button } from 'antdv-next'
import { DownOutlined } from '@antdv-next/icons'
import RenderNode from '../table/RenderNode.vue'
import { useAuxiliaryStyle } from './useAuxiliaryStyle'

defineOptions({ inheritAttrs: false })
const {
  menus,
  options,
  onSelect,
  text = undefined,
  disabled,
  prefixCls,
  classes: classesProp,
  classNames,
  styles: stylesProp,
} = defineProps<TableDropdownProps>()
// 保留整体 props 接口，getter 持续读取响应式解构值。
const props = {
  get menus() {
    return menus
  },
  get options() {
    return options
  },
  get onSelect() {
    return onSelect
  },
  get text() {
    return text
  },
  get disabled() {
    return disabled
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
