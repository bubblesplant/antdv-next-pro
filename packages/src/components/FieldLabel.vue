<script setup lang="ts">
import type { FieldLabelProps } from './types'
import { CloseOutlined, DownOutlined } from '@antdv-next/icons'
import RenderNode from '../table/RenderNode.vue'
import { useAuxiliaryStyle } from './useAuxiliaryStyle'
const props = withDefaults(defineProps<FieldLabelProps>(), { label: undefined, value: undefined })
const { prefix, direction, intl, nativeConfig, classes, styles, themeVars } = useAuxiliaryStyle(
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
    :data-pro-field-label-small="nativeConfig.componentSize === 'small' || undefined"
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
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: var(--antdv-next-pro-margin-xxs, 4px);
  height: 30px;
  padding: 0 8px;
  border: 0;
  border-radius: var(--antdv-next-pro-border-radius, 6px);
  background: transparent;
  color: var(--antdv-next-pro-color-text);
  cursor: pointer;
  font: inherit;
  font-size: var(--antdv-next-pro-font-size, 14px);
  line-height: 30px;
  max-width: 100%;
}
[data-pro-field-label]:hover:not(:disabled) {
  background: var(--antdv-next-pro-color-bg-text-hover);
}
[data-pro-field-label-small] {
  height: 24px;
  padding-inline: 4px;
  font-size: var(--antdv-next-pro-font-size-sm, 12px);
  line-height: 24px;
}
[data-pro-field-label]:disabled {
  color: var(--antdv-next-pro-color-text-placeholder);
  cursor: not-allowed;
}
</style>
