<script setup lang="ts">
import type { FilterDropdownProps } from './types'
import { computed, ref } from 'vue'
import { Popover } from 'antdv-next'
import DropdownFooter from './DropdownFooter.vue'
import RenderNode from '../table/RenderNode.vue'
import { useAuxiliaryStyle } from './useAuxiliaryStyle'
defineOptions({ inheritAttrs: false })
const {
  label = undefined,
  open = undefined,
  disabled,
  placement,
  popoverProps,
  footer,
  footerRender = undefined,
  padding,
  prefixCls,
  classes: classesProp,
  classNames,
  styles: stylesProp,
} = defineProps<FilterDropdownProps>()
const emit = defineEmits<{ 'update:open': [open: boolean]; openChange: [open: boolean] }>()
// 保留整体 props 接口，getter 持续读取响应式解构值。
const props = {
  get label() {
    return label
  },
  get open() {
    return open
  },
  get disabled() {
    return disabled
  },
  get placement() {
    return placement
  },
  get popoverProps() {
    return popoverProps
  },
  get footer() {
    return footer
  },
  get footerRender() {
    return footerRender
  },
  get padding() {
    return padding
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
const { prefix, direction, classes, styles, themeVars } = useAuxiliaryStyle(
  props,
  'core-field-dropdown',
)
const popoverBindings = computed(() => {
  const { onOpenChange, styles, classes, ...rest } = popoverProps ?? {}
  return rest
})
const popoverClasses = computed(() => {
  const source = popoverProps?.classes
  const resolved = typeof source === 'function' ? source({ props: popoverProps ?? {} }) : source
  return {
    ...resolved,
    root: [`${prefix.value}-overlay`, resolved?.root].filter(Boolean).join(' '),
  }
})
const popoverStyles = computed(() => {
  const source = popoverProps?.styles
  const resolved = typeof source === 'function' ? source({ props: popoverProps ?? {} }) : source
  return {
    ...resolved,
    container: {
      padding: 0,
      minWidth: '200px',
      boxShadow: 'var(--antdv-next-pro-box-shadow-secondary)',
      ...themeVars.value,
      ...resolved?.container,
    },
  }
})
const internal = ref(false)
const opened = computed(() => open ?? internal.value)
function setOpen(value: boolean) {
  if (disabled && value) return
  if (open === undefined) internal.value = value
  emit('update:open', value)
  emit('openChange', value)
  popoverProps?.onOpenChange?.(value)
}
</script>
<template>
  <Popover
    v-bind="popoverBindings"
    :open="opened && !disabled"
    trigger="click"
    :placement="placement ?? popoverProps?.placement"
    :classes="popoverClasses"
    :styles="popoverStyles"
    @open-change="setOpen"
    ><template #content
      ><div
        :class="[`${prefix}-content`, classes.content]"
        :style="[
          themeVars,
          {
            padding: `${padding ?? 16}px`,
          },
          styles.content,
        ]"
        data-pro-filter-content
        :dir="direction"
      >
        <slot />
      </div>
      <DropdownFooter
        v-if="footer"
        :disabled="disabled"
        v-bind="footer"
        :footer-render="footerRender" /></template
    ><span
      v-bind="$attrs"
      :class="[`${prefix}-label`, prefix, classes.root, $attrs.class]"
      :style="[themeVars, styles.root, $attrs.style]"
      data-pro-filter-dropdown
      :dir="direction"
      ><slot name="label"><RenderNode :content="label" /></slot></span
  ></Popover>
</template>
