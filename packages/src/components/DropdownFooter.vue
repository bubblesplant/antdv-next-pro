<script setup lang="ts">
import type { DropdownFooterProps } from './types'
import { computed } from 'vue'
import { Button } from 'antdv-next'
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
const customFooter = computed(() =>
  typeof props.footerRender === 'function'
    ? props.footerRender(props.onConfirm, props.onClear)
    : undefined,
)
</script>
<template>
  <div
    v-if="footerRender !== false && customFooter !== false"
    v-bind="$attrs"
    :class="[prefix, classes.root, $attrs.class]"
    :style="[themeVars, styles.root, $attrs.style]"
    data-pro-dropdown-footer
    :dir="direction"
  >
    <RenderNode v-if="typeof footerRender === 'function'" :content="customFooter" /><template v-else
      ><Button
        type="link"
        size="small"
        :disabled="disabled"
        :class="classes.clear"
        :style="[{ visibility: onClear ? 'visible' : 'hidden' }, styles.clear]"
        @click.stop="onClear"
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
    ></template>
  </div>
</template>
<style>
[data-pro-dropdown-footer] {
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  padding: 8px;
  border-block-start: 1px solid var(--antdv-next-pro-color-split);
  color: var(--antdv-next-pro-color-text);
  background: var(--antdv-next-pro-color-bg-elevated);
}
</style>
