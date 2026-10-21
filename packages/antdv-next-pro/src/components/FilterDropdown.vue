<script setup lang="ts">
import type { FilterDropdownProps } from './types'
import { computed, ref } from 'vue'
import { Popover } from 'antdv-next'
import DropdownFooter from './DropdownFooter.vue'
import RenderNode from '../table/RenderNode.vue'
import { useAuxiliaryStyle } from './useAuxiliaryStyle'
defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<FilterDropdownProps>(), {
  open: undefined,
  footerRender: undefined,
  label: undefined,
})
const emit = defineEmits<{ 'update:open': [open: boolean]; openChange: [open: boolean] }>()
const { prefix, direction, classes, styles, themeVars } = useAuxiliaryStyle(
  props,
  'core-field-dropdown',
)
const popoverBindings = computed(() => {
  const { onOpenChange, styles, ...rest } = props.popoverProps ?? {}
  return rest
})
const popoverStyles = computed(() => {
  const source = props.popoverProps?.styles
  const resolved =
    typeof source === 'function' ? source({ props: props.popoverProps ?? {} }) : source
  return {
    ...resolved,
    container: {
      padding: 0,
      boxShadow: 'var(--antdv-next-pro-box-shadow-secondary)',
      ...themeVars.value,
      ...resolved?.container,
    },
  }
})
const internal = ref(false)
const opened = computed(() => props.open ?? internal.value)
function setOpen(value: boolean) {
  if (props.disabled && value) return
  if (props.open === undefined) internal.value = value
  emit('update:open', value)
  emit('openChange', value)
  props.popoverProps?.onOpenChange?.(value)
}
</script>
<template>
  <Popover
    v-bind="popoverBindings"
    :open="opened && !disabled"
    trigger="click"
    :placement="placement ?? popoverProps?.placement"
    :classes="{ root: `${prefix}-overlay` }"
    :styles="popoverStyles"
    @open-change="setOpen"
    ><template #content
      ><div
        :class="[`${prefix}-content`, classes.content]"
        :style="[
          themeVars,
          {
            padding:
              padding === undefined
                ? 'calc(var(--antdv-next-pro-padding-lg,24px) * 2 / 3)'
                : `${padding}px`,
          },
          styles.content,
        ]"
        data-pro-filter-content
        :dir="direction"
      >
        <slot />
      </div>
      <DropdownFooter v-if="footer" v-bind="footer" :footer-render="footerRender" /></template
    ><span
      v-bind="$attrs"
      :class="[`${prefix}-label`, prefix, classes.root, $attrs.class]"
      :style="[themeVars, styles.root, $attrs.style]"
      data-pro-filter-dropdown
      :dir="direction"
      ><slot name="label"><RenderNode :content="label" /></slot></span
  ></Popover>
</template>
