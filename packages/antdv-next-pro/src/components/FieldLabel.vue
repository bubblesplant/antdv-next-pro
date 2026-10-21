<script setup lang="ts">
import type { FieldLabelProps } from './types'
import { CloseOutlined, DownOutlined } from '@antdv-next/icons'
import RenderNode from '../table/RenderNode.vue'
import { useAuxiliaryStyle } from './useAuxiliaryStyle'
const props = withDefaults(defineProps<FieldLabelProps>(), { label: undefined, value: undefined })
const { prefix, direction, intl, classes, styles, themeVars } = useAuxiliaryStyle(
  props,
  'core-field-label',
)
function clear() {
  if (!props.disabled) props.onClear?.()
}
</script>
<template>
  <button
    type="button"
    :disabled="disabled"
    :aria-expanded="expanded"
    :class="[prefix, classes.root]"
    :style="[themeVars, styles.root]"
    data-pro-field-label
    :dir="direction"
  >
    <span
      :class="classes.label"
      :style="[
        ellipsis
          ? { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
          : undefined,
        styles.label,
      ]"
      ><RenderNode :content="label" /><span
        v-if="value != null"
        :class="classes.value"
        :style="styles.value"
        >: <RenderNode :content="value" /></span></span
    ><CloseOutlined
      v-if="value != null && onClear"
      role="button"
      :tabindex="disabled ? -1 : 0"
      :aria-label="intl.getMessage('form.lightFilter.clear', '清空')"
      @click.stop="clear"
      @keydown.enter.stop="clear"
      @keydown.space.stop.prevent="clear"
    /><DownOutlined v-else />
  </button>
</template>
<style>
[data-pro-field-label] {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border: 0;
  background: transparent;
  color: var(--antdv-next-pro-color-text);
  cursor: pointer;
  font: inherit;
  max-width: 100%;
}
[data-pro-field-label]:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
