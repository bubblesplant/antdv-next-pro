<script setup lang="ts">
import type { ListToolBarProps } from './types'
import { computed, ref, useSlots } from 'vue'
import { InputSearch, Tooltip, Tabs, Dropdown, Button } from 'antdv-next'
import { DownOutlined, QuestionCircleOutlined } from '@antdv-next/icons'
import { useAuxiliaryStyle } from './useAuxiliaryStyle'
import RenderNode from '../table/RenderNode.vue'
defineOptions({ inheritAttrs: false })
const props = defineProps<ListToolBarProps>()
const emit = defineEmits<{ search: [value: string] }>()
const slots = useSlots()
const { prefix, direction, intl, classes, styles, themeVars } = useAuxiliaryStyle(
  props,
  'table-list-toolbar',
)
const searchBindings = computed(() => {
  const { onSearch, ...rest } = typeof props.search === 'object' ? props.search : {}
  return { placeholder: intl.value.getMessage('tableForm.inputPlaceholder', '请输入'), ...rest }
})
const hasTitle = computed(() =>
  Boolean(props.menu || props.title || props.subTitle || props.tooltip || slots.title),
)
const hasFilter = computed(() => Boolean(props.filter || slots.filter))
const hasLeft = computed(() => hasTitle.value || Boolean(props.search))
const hasRight = computed(() =>
  Boolean(
    (hasTitle.value && props.search) ||
    (!props.multipleLine && hasFilter.value) ||
    props.actions ||
    slots.actions ||
    props.settings?.length ||
    slots.settings,
  ),
)
const current = ref(props.menu?.defaultActiveKey)
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
      v-if="hasLeft || hasRight"
      :class="[`${prefix}-container`, classes.container]"
      :style="styles.container"
      data-pro-toolbar-container
    >
      <div :class="[`${prefix}-left`, classes.left]" :style="styles.left" data-pro-toolbar-left>
        <div
          v-if="!menu && ($slots.title || title || subTitle || tooltip)"
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
            ><QuestionCircleOutlined style="margin-inline-start: 4px"
          /></Tooltip>
        </div>
        <Dropdown
          v-if="menu?.type === 'dropdown'"
          :menu="{ items: menuItems, onClick: ({ key }) => selectMenu(String(key)) }"
          ><Button type="text"><RenderNode :content="menuLabel" /><DownOutlined /></Button
        ></Dropdown>
        <div v-else-if="menu?.type === 'inline'" data-pro-toolbar-inline-menu>
          <Button
            v-for="item in menuItems"
            :key="item.key"
            type="text"
            :disabled="item.disabled"
            :aria-pressed="item.key === (menu?.activeKey ?? current ?? menuItems[0]?.key)"
            @click="selectMenu(item.key)"
            ><RenderNode :content="item.label"
          /></Button>
        </div>
        <Tabs
          v-else-if="menuItems.length"
          :active-key="menu?.activeKey ?? current"
          :items="menuItems"
          @change="selectMenu(String($event))"
        />
        <InputSearch
          v-if="search && !hasTitle"
          v-bind="searchBindings"
          data-pro-toolbar-search
          @search="submitSearch"
        />
      </div>
      <div
        v-if="hasRight"
        :class="[`${prefix}-right`, classes.right]"
        :style="styles.right"
        data-pro-toolbar-right
      >
        <div v-if="!multipleLine && hasFilter" data-pro-toolbar-filter>
          <slot name="filter"><RenderNode :content="filter" /></slot>
        </div>
        <InputSearch
          v-if="search && hasTitle"
          v-bind="searchBindings"
          data-pro-toolbar-search
          @search="submitSearch"
        /><slot name="actions"
          ><RenderNode :content="typeof actions === 'function' ? actions() : actions" /></slot
        ><slot name="settings"
          ><RenderNode v-for="(setting, index) in settings" :key="index" :content="setting"
        /></slot>
      </div>
    </div>
    <div
      v-if="multipleLine && (tabs?.items?.length || hasFilter)"
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
  box-sizing: border-box;
  line-height: 1;
  min-width: 0;
}
[data-pro-toolbar-container],
[data-pro-toolbar-left],
[data-pro-toolbar-right] {
  display: flex;
  align-items: center;
  gap: var(--antdv-next-pro-margin-xs, 8px);
  flex-wrap: wrap;
}
[data-pro-toolbar-container] {
  justify-content: space-between;
  padding-block: var(--antdv-next-pro-padding, 16px);
}
[data-pro-toolbar-title] {
  display: flex;
  align-items: center;
  gap: 0;
  color: var(--antdv-next-pro-color-text-heading);
  font-size: var(--antdv-next-pro-font-size-lg, 16px);
  font-weight: var(--antdv-next-pro-font-weight-strong, 600);
}
[data-pro-toolbar-sub-title] {
  margin-inline-start: 8px;
  font-size: var(--antdv-next-pro-font-size, 14px);
  font-weight: normal;
  color: var(--antdv-next-pro-color-text-secondary);
  white-space: nowrap;
}
[data-pro-toolbar-right] {
  flex: 1;
  justify-content: flex-end;
  margin-inline-start: auto;
}
[data-pro-toolbar-search] {
  width: 200px;
}
[data-pro-toolbar-extra-line] {
  margin-block-end: var(--antdv-next-pro-margin, 16px);
}
[data-pro-toolbar-inline-menu] {
  display: flex;
}
[data-pro-toolbar-inline-menu] button {
  height: auto;
  margin-inline-end: var(--antdv-next-pro-margin-lg, 24px);
  padding: 0;
  border: 0;
  font: inherit;
  opacity: 0.75;
}
[data-pro-toolbar-inline-menu] button[aria-pressed='true'] {
  font-weight: bold;
  opacity: 1;
}
</style>
