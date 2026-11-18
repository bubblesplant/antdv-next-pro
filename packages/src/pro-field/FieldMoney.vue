<script setup lang="ts">
import { computed } from 'vue'
import { Popover, type InputNumberProps } from 'antdv-next'
import { useProConfig } from '../provider/context'
import VNodeContent from '../shared/VNodeContent'
import ProField from './ProField.vue'
import { formatMoney } from './money'
import type { FieldMoneyProps } from './types'

defineOptions({ name: 'FieldMoney', inheritAttrs: false })
const {
  locale,
  customSymbol,
  moneySymbol = undefined,
  numberFormatOptions,
  numberPopoverRender = undefined,
  fieldProps,
  mode,
  readonly = undefined,
  modelValue,
  value,
  text,
  cacheForSwr = undefined,
  ...rest
} = defineProps<FieldMoneyProps>()
const config = useProConfig()
const moneyFieldProps = computed(() => ({
  locale,
  customSymbol,
  moneySymbol,
  numberFormatOptions,
  ...fieldProps,
}))
const forwardedProps = computed(() =>
  Object.fromEntries(
    Object.entries({ ...rest, mode, readonly, modelValue, value, text, cacheForSwr }).filter(
      ([, item]) => item !== undefined,
    ),
  ),
)
const showPopover = computed(
  () => (mode === 'edit' || mode === 'update') && numberPopoverRender !== false && !readonly,
)
const popoverContent = computed(() => {
  const actualValue = modelValue ?? value ?? text
  const formatted = formatMoney(actualValue, locale ?? config.intl.value.locale, {
    ...moneyFieldProps.value,
    numberFormatOptions: { ...numberFormatOptions, notation: 'compact' },
  })
  return typeof numberPopoverRender === 'function'
    ? numberPopoverRender(
        { ...moneyFieldProps.value, value: actualValue } as InputNumberProps,
        formatted,
      )
    : formatted
})
</script>

<template>
  <Popover v-if="showPopover" trigger="focus">
    <template #content>
      <span v-if="typeof numberPopoverRender === 'function'"
        ><VNodeContent :content="popoverContent"
      /></span>
      <VNodeContent v-else :content="popoverContent" />
    </template>
    <ProField
      v-bind="{ ...forwardedProps, ...$attrs }"
      value-type="money"
      :field-props="moneyFieldProps"
    >
      <template v-for="(_, name) in $slots" #[name]="slotProps"
        ><slot :name="name" v-bind="slotProps || {}"
      /></template>
    </ProField>
  </Popover>
  <ProField
    v-else
    v-bind="{ ...forwardedProps, ...$attrs }"
    value-type="money"
    :field-props="moneyFieldProps"
  >
    <template v-for="(_, name) in $slots" #[name]="slotProps"
      ><slot :name="name" v-bind="slotProps || {}"
    /></template>
  </ProField>
</template>
