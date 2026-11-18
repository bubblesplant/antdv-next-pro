<script setup lang="ts">
import { getCurrentInstance, useAttrs } from 'vue'
import ProFormSelect from './ProFormSelect.vue'
import { pickExplicitProps } from './fieldRegistry'
import type { ProFormSearchSelectProps } from './types'
import { useProPrefix } from '../provider/context'

defineOptions({ name: 'ProFormSearchSelect', inheritAttrs: false })

const { ...props } = defineProps<ProFormSearchSelectProps>()
const attrs = useAttrs()
const instance = getCurrentInstance()
const prefix = useProPrefix('filed-search-select', () => props.prefixCls)

function selectProps(): ProFormSearchSelectProps {
  const input = {
    ...pickExplicitProps(props, instance?.vnode.props),
    ...attrs,
  } as ProFormSearchSelectProps
  const mode = input.fieldProps?.mode ?? input.mode ?? 'multiple'
  const fieldProps = {
    labelInValue: true,
    showSearch: true,
    suffixIcon: null,
    autoClearSearchValue: true,
    optionLabelProp: 'label',
    ...input.fieldProps,
    mode: mode === 'single' ? undefined : mode,
    class: [
      prefix.value,
      (input.fieldProps?.disabled ?? input.disabled) && `${prefix.value}-disabled`,
      (input.fieldProps as { class?: unknown } | undefined)?.class,
    ],
  }
  return { ...input, fieldProps }
}
</script>

<template>
  <ProFormSelect v-bind="selectProps()">
    <template v-for="(_, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps ?? {}" />
    </template>
  </ProFormSelect>
</template>
