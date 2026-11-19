<script setup lang="ts">
import { FormItem, Space } from 'antdv-next'
import { cloneVNode, computed, h, ref, watch, useAttrs, useSlots } from 'vue'
import { cloneValue } from '../schema-form/utils'
import { useProFormContext, useProFormNamePath } from './context'

import { flattenChildren, useFormPrefix } from './utils'
import VNodeContent from '../shared/VNodeContent'

import { proFormFieldSetProps } from './componentProps'

defineOptions({ name: 'ProFormFieldSet', inheritAttrs: false })
const {
  name: propName,
  modelValue: propModelValue,
  initialValue: propInitialValue,
  transform: propTransform,
  convertValue: propConvertValue,
  type: propType,
  space: propSpace,
} = defineProps(proFormFieldSetProps)
const emit = defineEmits(['update:modelValue', 'change'])
const attrs = useAttrs()
const slots = useSlots()

const form = useProFormContext()
const { prefix } = useFormPrefix('form-field-set', () => undefined)
const path = useProFormNamePath(() => propName)
const local = ref<unknown[]>(propInitialValue ?? [])
const values = computed(
  () =>
    propModelValue ??
    (propName !== undefined ? (form?.getFieldValue(path.value) as unknown[]) : undefined) ??
    local.value,
)
if (
  propName !== undefined &&
  form &&
  form.getFieldValue(path.value) === undefined &&
  propInitialValue
)
  form.setFieldValue(path.value, cloneValue(propInitialValue))
watch(
  path,
  (current, _previous, onCleanup) => {
    if (propName === undefined || !current.length) return
    const registeredPath = [...current]
    const unregister = form?.registerField({
      path: () => registeredPath,
      transform: propTransform
        ? (value, record) => propTransform!(value as unknown[], record)
        : undefined,
      convertValue: propConvertValue,
    })
    onCleanup(() => unregister?.())
  },
  { immediate: true },
)
function update(index: number, value: unknown) {
  const next = [...values.value]
  next[index] = value
  local.value = next
  if (propName !== undefined) form?.setFieldValue(path.value, next)
  emit('update:modelValue', next)
  emit('change', next)
}
const renderContent = () =>
  h(
    FormItem,
    {
      ...attrs,
      ...(form?.ignoreRules.value && { rules: undefined }),
      name: propName === undefined ? undefined : path.value,
    },
    {
      ...slots,
      default: () =>
        h(Space, { ...propSpace, class: [prefix.value, `${prefix.value}-${propType}`] }, () =>
          flattenChildren(slots.default?.()).map((node, index) =>
            cloneVNode(node, {
              fieldMode: 'field',
              name: undefined,
              modelValue: values.value[index],
              'onUpdate:modelValue': (value: unknown) => update(index, value),
            }),
          ),
        ),
    },
  )
</script>

<template>
  <VNodeContent :content="renderContent()" />
</template>
