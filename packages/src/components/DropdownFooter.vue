<script setup lang="ts">
import type { DropdownFooterProps } from './types'
import { Button, Space } from 'antdv-next'
import RenderNode from '../table/RenderNode.vue'
import { useAuxiliaryStyle } from './useAuxiliaryStyle'
defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<DropdownFooterProps>(), {
  footerRender: undefined,
  confirmText: undefined,
  clearText: undefined,
})
const { prefix, direction, intl, classes, styles, themeVars } = useAuxiliaryStyle(
  props,
  'core-field-dropdown-footer',
)
</script>
<template>
  <div
    v-if="footerRender !== false"
    v-bind="$attrs"
    :class="[prefix, classes.root, $attrs.class]"
    :style="[themeVars, styles.root, $attrs.style]"
    data-pro-dropdown-footer
    :dir="direction"
  >
    <RenderNode v-if="footerRender" :content="footerRender(onConfirm, onClear)" /><Space v-else
      ><Button
        size="small"
        :disabled="disabled"
        :class="classes.clear"
        :style="styles.clear"
        @click="onClear"
        ><RenderNode
          :content="clearText ?? intl.getMessage('form.lightFilter.clear', '清空')" /></Button
      ><Button
        type="primary"
        size="small"
        :disabled="disabled"
        :class="classes.confirm"
        :style="styles.confirm"
        @click="onConfirm"
        ><RenderNode
          :content="confirmText ?? intl.getMessage('form.lightFilter.confirm', '确认')" /></Button
    ></Space>
  </div>
</template>
<style>
[data-pro-dropdown-footer] {
  padding: 8px 12px;
  border-block-start: 1px solid var(--antdv-next-pro-color-border-secondary);
  text-align: end;
  color: var(--antdv-next-pro-color-text);
  background: var(--antdv-next-pro-color-bg-elevated);
}
</style>
