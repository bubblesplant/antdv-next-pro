<script setup lang="ts">
import type { VNodeChild } from 'vue'
import { Button, Popover, Space } from 'antdv-next'
import { computed, h, ref, watch, useAttrs, useSlots } from 'vue'
import { cloneValue, getValue, normalizePath, setValue } from '../schema-form/utils'

import FieldLabel from '../components/FieldLabel.vue'
import ProField from '../pro-field/ProField'

import { useProFormContext, useProFormNamePath } from './context'
import { useFormPrefix } from './utils'

import VNodeContent from '../shared/VNodeContent'
import { lightWrapperProps } from './componentProps'

defineOptions({ name: 'LightWrapper', inheritAttrs: false })
const {
  name: propName,
  label: propLabel,
  disabled: propDisabled,
  placement: propPlacement,
  fieldNames: propFieldNames,
  footerRender: propFooterRender,
  open: propOpen,
} = defineProps(lightWrapperProps)
const emit = defineEmits<{
  'update:open': [open: boolean]
  confirm: [value: unknown]
  clear: []
}>()
const attrs = useAttrs()
const slots = useSlots()

const form = useProFormContext()
const path = useProFormNamePath(() => propName as import('../types').ProDataIndex | undefined)
const local = ref(false)
const { prefix, t } = useFormPrefix('field-light-wrapper', () => undefined)
const paths = () =>
  propFieldNames?.map(normalizePath) ?? (propName === undefined ? [] : [path.value])
const value = computed(() => {
  if (!propFieldNames) return form?.getFieldValue(path.value)
  const values: import('../schema-form/utils').FormRecord = {}
  for (const name of paths()) setValue(values, name, form?.getFieldValue(name))
  return values
})
const isEffective = (entry: unknown) =>
  entry !== undefined &&
  entry !== null &&
  entry !== '' &&
  (!Array.isArray(entry) || entry.length > 0)
const effective = computed(() =>
  propFieldNames
    ? paths().some((name) => isEffective(getValue(value.value, name)))
    : isEffective(value.value),
)
const open = computed(() => propOpen ?? local.value)
let snapshot: unknown
let captured = false
let revision = 0
const confirming = ref(false)
function transition(next: boolean, accepted = false) {
  revision++
  if (next) {
    snapshot = cloneValue(value.value)
    captured = true
  } else {
    if (!accepted && captured) {
      if (propFieldNames)
        for (const name of paths()) form?.setFieldValue(name, cloneValue(getValue(snapshot, name)))
      else if (path.value.length) form?.setFieldValue(path.value, cloneValue(snapshot))
    }
    captured = false
    form?.clearValidate?.(paths().length ? paths() : undefined)
  }
  local.value = next
}
watch(
  () => propOpen,
  (next) => {
    if (next !== undefined && next !== local.value) transition(next)
  },
  { immediate: true, flush: 'sync' },
)
function setOpen(next: boolean, accepted = false) {
  if (next === open.value) return
  transition(next, accepted)
  emit('update:open', next)
}
async function confirm() {
  if (confirming.value) return
  confirming.value = true
  const submittedRevision = revision
  try {
    await form?.validateFields(paths().length ? paths() : undefined)
    await form?.submit()
    if (revision === submittedRevision) {
      setOpen(false, true)
      emit('confirm', value.value)
    }
  } catch {
    /* errors remain visible in the field */
  } finally {
    confirming.value = false
  }
}
function clear() {
  for (const name of paths()) form?.setFieldValue(name, undefined)
  emit('clear')
  void form?.submit().catch(() => undefined)
}
function resolveFooter() {
  const buttons = [
    h(Button, { size: 'small', disabled: confirming.value, onClick: clear }, () =>
      t('form.lightFilter.clear', '清除'),
    ),
    h(
      Button,
      {
        type: 'primary',
        size: 'small',
        loading: confirming.value,
        onClick: () => void confirm(),
      },
      () => t('form.lightFilter.confirm', '确认'),
    ),
  ]
  const footer =
    propFooterRender === false
      ? null
      : typeof propFooterRender === 'function'
        ? propFooterRender({ clear, confirm: () => void confirm() }, buttons)
        : buttons
  return footer
}
function displayLabel() {
  return slots.label?.({ value: value.value }) ?? (propLabel as VNodeChild) ?? ''
}
function displayValue() {
  return !propFieldNames && effective.value
    ? h(ProField, { text: value.value, mode: 'read' })
    : undefined
}
</script>

<template>
  <Popover
    v-bind="attrs"
    trigger="click"
    :placement="propPlacement"
    :open="open"
    @update:open="(next) => setOpen(next)"
    @open-change="(next) => setOpen(next)"
  >
    <FieldLabel
      :disabled="propDisabled || form?.disabled.value"
      :label="displayLabel()"
      :value="displayValue()"
      :expanded="open"
    />
    <template #content>
      <div data-pro-light-popover="" :class="`${prefix}-container`">
        <slot />
        <template v-for="(footer, index) in [resolveFooter()]" :key="index">
          <div v-if="footer" data-pro-light-footer="" :class="`${prefix}-footer`">
            <Space><VNodeContent :content="footer" /></Space>
          </div>
        </template>
      </div>
    </template>
  </Popover>
</template>
