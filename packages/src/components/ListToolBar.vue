<script setup lang="ts">
import type { ListToolBarProps } from './types'
import { computed, ref } from 'vue'
import { InputSearch, Tooltip, Tabs, Dropdown, Button } from 'antdv-next'
import { DownOutlined, QuestionCircleOutlined } from '@antdv-next/icons'
import { useAuxiliaryStyle } from './useAuxiliaryStyle'
import RenderNode from '../table/RenderNode.vue'
defineOptions({ inheritAttrs: false })
const props = defineProps<ListToolBarProps>()
const emit = defineEmits<{ search: [value: string] }>()
const { prefix, direction, classes, styles, themeVars } = useAuxiliaryStyle(
  props,
  'table-list-toolbar',
)
const searchBindings = computed(() => {
  const { onSearch, ...rest } = typeof props.search === 'object' ? props.search : {}
  return rest
})
const current = ref(props.tabs?.defaultActiveKey ?? props.menu?.defaultActiveKey)
const menuItems = computed(() => props.menu?.items ?? [])
const menuLabel = computed(
  () =>
    menuItems.value.find((item) => item.key === (props.menu?.activeKey ?? current.value))?.label ??
    menuItems.value[0]?.label,
)
function selectMenu(key: string) {
  current.value = key
  props.menu?.onChange?.(key)
}
function submitSearch(value: string) {
  const cfg = typeof props.search === 'object' ? props.search : undefined
  Promise.resolve(cfg?.onSearch?.(value)).then((result) => {
    if (result !== false) {
      emit('search', value)
    }
  })
}
</script>
<template>
  <div
    data-pro-toolbar
    :dir="direction"
    v-bind="$attrs"
    :class="[prefix, { [`${prefix}-multiple-line`]: multipleLine }, classes.root, $attrs.class]"
    :style="[themeVars, styles.root, $attrs.style]"
  >
    <div
      :class="[`${prefix}-container`, classes.container]"
      :style="styles.container"
      data-pro-toolbar-container
    >
      <div :class="[`${prefix}-left`, classes.left]" :style="styles.left" data-pro-toolbar-left>
        <div
          v-if="$slots.title || title != null"
          :class="[`${prefix}-title`, classes.title]"
          :style="styles.title"
          data-pro-toolbar-title
        >
          <slot name="title"><RenderNode :content="title" /></slot
          ><span
            v-if="subTitle"
            :class="[`${prefix}-sub-title`, classes.subTitle]"
            :style="styles.subTitle"
            data-pro-toolbar-sub-title
            ><RenderNode :content="subTitle" /></span
          ><Tooltip
            v-if="tooltip"
            v-bind="typeof tooltip === 'string' ? { title: tooltip } : tooltip"
            ><QuestionCircleOutlined
          /></Tooltip>
        </div>
        <Dropdown
          v-if="menu?.type === 'dropdown'"
          :menu="{ items: menuItems, onClick: ({ key }) => selectMenu(String(key)) }"
          ><Button type="text"><RenderNode :content="menuLabel" /><DownOutlined /></Button
        ></Dropdown>
        <Tabs
          v-else-if="menuItems.length"
          :active-key="menu?.activeKey ?? current"
          :items="menuItems"
          @change="selectMenu(String($event))"
        />
        <InputSearch v-if="search && !title" v-bind="searchBindings" @search="submitSearch" />
      </div>
      <div :class="[`${prefix}-right`, classes.right]" :style="styles.right" data-pro-toolbar-right>
        <InputSearch v-if="search && title" v-bind="searchBindings" @search="submitSearch" /><slot
          name="actions"
          ><RenderNode :content="typeof actions === 'function' ? actions() : actions" /></slot
        ><slot name="settings"
          ><RenderNode v-for="(setting, index) in settings" :key="index" :content="setting"
        /></slot>
      </div>
    </div>
    <div
      v-if="tabs || filter || $slots.filter"
      :class="[`${prefix}-extra-line`, classes.extraLine]"
      :style="styles.extraLine"
      data-pro-toolbar-extra-line
    >
      <Tabs v-if="tabs" v-bind="tabs" /><slot name="filter"><RenderNode :content="filter" /></slot>
    </div>
  </div>
</template>
<style>
[data-pro-toolbar] {
  padding-block: calc(var(--antdv-next-pro-padding-lg, 24px) * 2 / 3);
  min-width: 0;
}
[data-pro-toolbar-container],
[data-pro-toolbar-left],
[data-pro-toolbar-right] {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
[data-pro-toolbar-container] {
  justify-content: space-between;
}
[data-pro-toolbar-title] {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
}
[data-pro-toolbar-sub-title] {
  font-size: 14px;
  font-weight: normal;
  opacity: 0.65;
}
[data-pro-toolbar-right] {
  margin-inline-start: auto;
}
</style>
