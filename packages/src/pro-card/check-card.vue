<script setup lang="ts">
import type { CheckCardProps, ProCardProps } from '../types'
import { Avatar } from 'antdv-next'
import { computed, ref } from 'vue'
import ProCard from '../ProCard.vue'
import { useProConfig, useProPrefix } from '../provider'
import RenderNode from '../table/RenderNode.vue'

defineOptions({ name: 'CheckCard', inheritAttrs: false })
const {
  avatar = undefined,
  description = undefined,
  cover = undefined,
  checked = undefined,
  defaultChecked = false,
  disabled = undefined,
  loading,
  size,
  bordered = true,
  prefixCls,
  onClick,
  onChange: _onChange,
  'onUpdate:checked': _onUpdateChecked,
  selectionType,
  ...cardProps
} = defineProps<CheckCardProps & { selectionType?: 'checkbox' | 'radio' }>()
const emit = defineEmits<{
  'update:checked': [checked: boolean]
  change: [checked: boolean]
  select: [checked: boolean, event: MouseEvent | KeyboardEvent]
}>()

const prefix = useProPrefix('checkcard', () => prefixCls)
const { nativeConfig } = useProConfig()
const localChecked = ref(defaultChecked)
const selected = computed(() => checked ?? localChecked.value)
const inactive = computed(() => loading || (disabled ?? nativeConfig.value.componentDisabled))
const hasCover = computed(() => cover != null && cover !== false)

function cardStyles(context: { props: ProCardProps }) {
  const source = cardProps.styles
  const styles = typeof source === 'function' ? source(context) : source
  if (size !== 'large') return styles ?? {}
  return {
    ...styles,
    header: {
      paddingInline: 'var(--antdv-next-pro-padding-lg)',
      ...cardProps.headStyle,
      ...styles?.header,
    },
  }
}

function handleClick(event: MouseEvent) {
  if (!inactive.value) onClick?.(event)
}

function activate(event: MouseEvent | KeyboardEvent) {
  if (inactive.value) return
  if (event.type === 'click') {
    const target = event.target
    const interactive =
      target instanceof Element
        ? target.closest(
            `a, button, input, select, textarea, label, summary, [contenteditable], [role="button"], [tabindex], [data-pro-check-card-ignore], .${prefix.value}-actions`,
          )
        : null
    if (event.defaultPrevented || (interactive && interactive !== event.currentTarget)) return
  } else if ((event as KeyboardEvent).repeat) return

  const next = selectionType === 'radio' ? true : !selected.value
  if (next === selected.value) return
  if (checked === undefined) localChecked.value = next
  emit('update:checked', next)
  emit('change', next)
  emit('select', next, event)
}
</script>

<template>
  <ProCard
    v-bind="{ ...$attrs, ...cardProps }"
    data-pro-check-card
    :prefix-cls="prefix"
    :class="size === 'large' && `${prefix}-lg`"
    :role="selectionType"
    :checked="selected"
    :disabled="inactive"
    :loading="loading"
    :size="size === 'large' ? 'default' : size"
    :bordered="bordered"
    :styles="cardStyles"
    :title="hasCover ? undefined : cardProps.title"
    :sub-title="hasCover ? undefined : cardProps.subTitle"
    :extra="undefined"
    @click="handleClick"
    @checked="activate"
  >
    <template v-if="!hasCover && ($slots.title || avatar)" #title>
      <div class="check-card__heading">
        <Avatar v-if="typeof avatar === 'string'" :src="avatar" shape="square" :size="48" />
        <RenderNode v-else :content="avatar" />
        <slot name="title"><RenderNode :content="cardProps.title" /></slot>
      </div>
    </template>
    <template
      v-if="!hasCover && ($slots.extra || (cardProps.extra != null && cardProps.extra !== false))"
      #extra
    >
      <div data-pro-check-card-ignore>
        <slot name="extra"><RenderNode :content="cardProps.extra" /></slot>
      </div>
    </template>
    <template v-if="hasCover" #cover>
      <img v-if="typeof cover === 'string'" :src="cover" alt="" />
      <RenderNode v-else :content="typeof cover === 'function' ? cover() : cover" />
    </template>
    <template v-if="$slots.actions" #actions>
      <div data-pro-check-card-ignore>
        <slot name="actions" />
      </div>
    </template>
    <template v-if="!hasCover">
      <slot name="description"><RenderNode :content="description" /></slot>
    </template>
    <slot />
  </ProCard>
</template>

<style scoped>
[data-pro-check-card]:not([aria-disabled='true']) {
  cursor: pointer;
}
[data-pro-check-card]:focus-visible {
  outline: 2px solid var(--antdv-next-pro-color-primary);
  outline-offset: 2px;
}
.check-card__heading {
  display: flex;
  align-items: center;
  gap: var(--antdv-next-pro-margin-xs);
}
</style>
