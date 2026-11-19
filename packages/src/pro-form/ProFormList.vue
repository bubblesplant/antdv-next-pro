<script setup lang="ts">
import type { VNodeChild } from 'vue'
import { Button, FormItem, Space } from 'antdv-next'
import { computed, h, onBeforeUnmount, onMounted, ref, watch, useAttrs, useSlots } from 'vue'
import { cloneValue } from '../schema-form/utils'
import type { FormRecord } from '../schema-form/utils'
import { useProFormContext, useProFormNamePath } from './context'
import type { FormListActionType, FormListFieldData } from './types'
import { assignRef, resolveSemantic, useFormPrefix } from './utils'
import { useFormThemeVars } from './useFormThemeVars'

import VNodeContent from '../shared/VNodeContent'

import { proFormListProps } from './componentProps'
import ListRowScope from './ListRowScope.vue'

defineOptions({ name: 'ProFormList', inheritAttrs: false })
const {
  prefixCls: propPrefixCls,
  classes: propClasses,
  classNames: propClassNames,
  styles: propStyles,
  name: propName,
  label: propLabel,
  initialValue: propInitialValue,
  min: propMin,
  max: propMax,
  creatorRecord: propCreatorRecord,
  creatorButtonProps: propCreatorButtonProps,
  copyIconProps: propCopyIconProps,
  deleteIconProps: propDeleteIconProps,
  actionGuard: propActionGuard,
  actionRef: propActionRef,
  actionRender: propActionRender,
  itemRender: propItemRender,
  rules: propRules,
  alwaysShowItemLabel: propAlwaysShowItemLabel,
} = defineProps(proFormListProps)
const emit = defineEmits(['afterAdd', 'afterRemove', 'change', 'error'])
const attrs = useAttrs()
const slots = useSlots()
const props = {
  get prefixCls() {
    return propPrefixCls
  },
  get classes() {
    return propClasses
  },
  get classNames() {
    return propClassNames
  },
  get styles() {
    return propStyles
  },
  get name() {
    return propName
  },
  get label() {
    return propLabel
  },
  get initialValue() {
    return propInitialValue
  },
  get min() {
    return propMin
  },
  get max() {
    return propMax
  },
  get creatorRecord() {
    return propCreatorRecord
  },
  get creatorButtonProps() {
    return propCreatorButtonProps
  },
  get copyIconProps() {
    return propCopyIconProps
  },
  get deleteIconProps() {
    return propDeleteIconProps
  },
  get actionGuard() {
    return propActionGuard
  },
  get actionRef() {
    return propActionRef
  },
  get actionRender() {
    return propActionRender
  },
  get itemRender() {
    return propItemRender
  },
  get rules() {
    return propRules
  },
  get alwaysShowItemLabel() {
    return propAlwaysShowItemLabel
  },
}

const form = useProFormContext()
if (!form) throw new Error('ProFormList must be used inside ProForm')
const path = useProFormNamePath(() => propName)
const { prefix, t, config } = useFormPrefix('form-list', () => propPrefixCls)
const themeVars = useFormThemeVars()
const busy = ref(false)
let sequence = 0
const keys = ref<number[]>([])
const list = computed(() => {
  const value = form.getFieldValue(path.value)
  return Array.isArray(value) ? (value as FormRecord[]) : []
})
const createRecord = () =>
  cloneValue(
    typeof propCreatorRecord === 'function' ? propCreatorRecord() : (propCreatorRecord ?? {}),
  )
if (!Array.isArray(form.getFieldValue(path.value)))
  form.setFieldValue(
    path.value,
    cloneValue(propInitialValue ?? Array.from({ length: propMin }, createRecord)),
  )
watch(
  () => list.value.length,
  (length) => {
    while (keys.value.length < length) keys.value.push(sequence++)
    keys.value.length = length
  },
  { immediate: true, flush: 'sync' },
)
function commit(value: FormRecord[]) {
  form!.setFieldValue(path.value, value)
  emit('change', cloneValue(value))
}
async function add(
  defaultValue = createRecord(),
  insertIndex = list.value.length,
): Promise<boolean> {
  if (
    busy.value ||
    form!.readonly.value ||
    form!.disabled.value ||
    (propMax !== undefined && list.value.length >= propMax)
  )
    return false
  busy.value = true
  try {
    const index = Math.max(0, Math.min(insertIndex, list.value.length))
    if ((await propActionGuard?.beforeAddRow?.(defaultValue, index, list.value.length)) === false)
      return false
    if (propMax !== undefined && list.value.length >= propMax) return false
    const next = cloneValue(list.value)
    next.splice(index, 0, cloneValue(defaultValue))
    keys.value.splice(index, 0, sequence++)
    commit(next)
    emit('afterAdd', cloneValue(defaultValue), index)
    return true
  } catch (error) {
    emit('error', error)
    return false
  } finally {
    busy.value = false
  }
}
async function remove(index: number | number[]): Promise<boolean> {
  const indices = [...new Set(Array.isArray(index) ? index : [index])]
    .filter((entry) => entry >= 0 && entry < list.value.length)
    .sort((a, b) => b - a)
  if (
    busy.value ||
    form!.readonly.value ||
    form!.disabled.value ||
    !indices.length ||
    list.value.length - indices.length < propMin
  )
    return false
  busy.value = true
  try {
    if ((await propActionGuard?.beforeRemoveRow?.(index, list.value.length)) === false) return false
    if (list.value.length - indices.length < propMin) return false
    const next = cloneValue(list.value)
    for (const item of indices) {
      next.splice(item, 1)
      keys.value.splice(item, 1)
    }
    commit(next)
    emit('afterRemove', index)
    return true
  } catch (error) {
    emit('error', error)
    return false
  } finally {
    busy.value = false
  }
}
const action: FormListActionType = {
  add,
  remove,
  move(from, to) {
    if (
      busy.value ||
      form!.readonly.value ||
      form!.disabled.value ||
      from < 0 ||
      to < 0 ||
      from >= list.value.length ||
      to >= list.value.length
    )
      return false
    const next = cloneValue(list.value)
    next.splice(to, 0, next.splice(from, 1)[0]!)
    keys.value.splice(to, 0, keys.value.splice(from, 1)[0]!)
    commit(next)
    return true
  },
  copy: (index) =>
    index < 0 || index >= list.value.length
      ? Promise.resolve(false)
      : add(cloneValue(list.value[index]!), index + 1),
  get: (index) => cloneValue(list.value[index]),
  getList: () => cloneValue(list.value),
}
defineExpose(action)
onMounted(() => assignRef(propActionRef, action))
onBeforeUnmount(() => assignRef(propActionRef, undefined))
const semantic = computed(() => resolveSemantic(props))
function resolveRows() {
  const creatorConfig =
    propCreatorButtonProps && typeof propCreatorButtonProps === 'object'
      ? propCreatorButtonProps
      : {}
  const { creatorButtonText, position: creatorPosition, ...creatorButtonProps } = creatorConfig
  const creator =
    !form!.readonly.value &&
    propCreatorButtonProps !== false &&
    (propMax === undefined || list.value.length < propMax)
      ? h(
          Button,
          {
            block: true,
            type: 'dashed',
            ...creatorButtonProps,
            'data-pro-form-list-creator': creatorPosition === 'top' ? 'top' : 'bottom',
            class: [
              `${prefix.value}-creator`,
              creatorPosition === 'top' && `${prefix.value}-creator-button-top`,
            ],
            disabled: busy.value || form!.disabled.value,
            onClick: () => void add(),
          },
          () => creatorButtonText ?? t('editableTable.action.add', '添加一行数据'),
        )
      : null
  const rows = list.value.map((record, index) => {
    const field: FormListFieldData = {
      name: index,
      key: keys.value[index]!,
      fieldKey: keys.value[index]!,
    }
    const defaultActions: VNodeChild[] = [
      !form!.readonly.value &&
        propCopyIconProps !== false &&
        h(
          Button,
          {
            type: 'text',
            size: 'small',
            class: [`${prefix.value}-action-icon`, 'action-copy'],
            disabled:
              busy.value ||
              form!.disabled.value ||
              (propMax !== undefined && list.value.length >= propMax),
            'aria-label': t('copyThisLine', '复制此项'),
            onClick: () => void action.copy(index),
          },
          () => (propCopyIconProps && propCopyIconProps.Icon ? h(propCopyIconProps.Icon) : '⧉'),
        ),
      !form!.readonly.value &&
        propDeleteIconProps !== false &&
        h(
          Button,
          {
            type: 'text',
            size: 'small',
            class: [`${prefix.value}-action-icon`, 'action-remove'],
            'data-pro-form-list-remove': '',
            disabled: busy.value || form!.disabled.value || list.value.length <= propMin,
            'aria-label': t('deleteThisLine', '删除此项'),
            onClick: () => void remove(index),
          },
          () =>
            propDeleteIconProps && propDeleteIconProps.Icon ? h(propDeleteIconProps.Icon) : '−',
        ),
    ].filter(Boolean)
    const content = h(
      ListRowScope,
      { path: path.value, index, rowKey: field.key },
      {
        default: () =>
          slots.default?.({
            field,
            index,
            action,
            fields: list.value.map((_, i) => ({
              name: i,
              key: keys.value[i],
              fieldKey: keys.value[i],
            })),
            record,
            list: list.value,
          }),
      },
    )
    const actions =
      propActionRender?.(field, action, defaultActions, list.value.length) ?? defaultActions
    return {
      record,
      index,
      field,
      content,
      actions,
      custom: propItemRender?.({ listDom: content, action: actions }, { field, index, record }),
    }
  })
  return { creatorPosition, creator, rows }
}
function fields() {
  return list.value.map((_, index) => ({
    name: index,
    key: keys.value[index],
    fieldKey: keys.value[index],
  }))
}
</script>

<template>
  <div
    v-bind="attrs"
    data-pro-form-list=""
    :class="[prefix, attrs.class, semantic.classes.root]"
    :style="[themeVars, attrs.style as any, semantic.styles.root]"
  >
    <FormItem
      :name="path"
      :label="propLabel"
      :rules="form?.ignoreRules.value ? undefined : propRules"
      :auto-link="false"
    >
      <template v-for="(content, contentIndex) in [resolveRows()]" :key="contentIndex">
        <VNodeContent v-if="content.creatorPosition === 'top'" :content="content.creator" />
        <div
          v-for="row in content.rows"
          :key="row.field.key"
          data-pro-form-list-item=""
          :data-pro-form-list-first="row.index === 0 ? '' : undefined"
          :data-pro-form-list-labels="
            propAlwaysShowItemLabel === undefined
              ? 'default'
              : propAlwaysShowItemLabel
                ? 'show'
                : 'hide'
          "
          :class="[
            `${prefix}-item`,
            {
              [`${prefix}-item-default`]: propAlwaysShowItemLabel === undefined,
              [`${prefix}-item-show-label`]: propAlwaysShowItemLabel,
            },
            semantic.classes.item,
          ]"
          :style="semantic.styles.item"
        >
          <VNodeContent v-if="propItemRender" :content="row.custom" />
          <template v-else>
            <div
              data-pro-form-list-content=""
              :class="[`${prefix}-container`, semantic.classes.container]"
              :style="semantic.styles.container"
            >
              <ListRowScope :path="path" :index="row.index" :row-key="row.field.key">
                <slot
                  :field="row.field"
                  :index="row.index"
                  :action="action"
                  :fields="fields()"
                  :record="row.record"
                  :list="list"
                />
              </ListRowScope>
            </div>
            <Space
              :data-pro-form-list-actions="config.componentSize === 'small' ? 'small' : ''"
              :class="[`${prefix}-action`, semantic.classes.actions]"
              :style="semantic.styles.actions"
              ><VNodeContent :content="row.actions"
            /></Space>
          </template>
        </div>
        <VNodeContent v-if="content.creatorPosition !== 'top'" :content="content.creator" />
      </template>
    </FormItem>
  </div>
</template>
