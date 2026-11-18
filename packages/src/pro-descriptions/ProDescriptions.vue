<script
  setup
  lang="ts"
  generic="
    T extends Record<string, unknown> = Record<string, unknown>,
    P extends Record<string, unknown> = Record<string, unknown>
  "
>
import type { FormInstance } from 'antdv-next'
import type { ProKey } from '../types'
import type { ProDescriptionsProps, ProDescriptionsColumn, ProDescriptionsInstance } from './types'
import {
  Descriptions,
  DescriptionsItem,
  Form,
  FormItem,
  Button,
  Space,
  Spin,
  Tooltip,
} from 'antdv-next'
import { EditOutlined, QuestionCircleOutlined } from '@antdv-next/icons'
import { computed, ref, shallowRef, watch, onBeforeUnmount, getCurrentInstance } from 'vue'
import { useIntl, useProPrefix, useProConfig } from '../provider'
import { useSemanticStyles } from '../shared/semantic'
import { useThemeVars } from '../shared/useThemeVars'
import { getValue, setValue, columnKey, cloneRecord } from '../table/utils'
import RenderNode from '../table/RenderNode.vue'
import FieldRender from './FieldRender.vue'

defineOptions({ inheritAttrs: false })
const {
  prefixCls,
  title = undefined,
  tooltip,
  extra = undefined,
  columns: columnsProp,
  dataSource,
  request,
  params,
  loading,
  editable,
  formProps,
  actionRef,
  formRef,
  emptyText = undefined,
  classes: classesProp,
  classNames,
  styles: stylesProp,
  onLoadingChange,
  onRequestError,
  onDataSourceChange,
  onEditableError,
  bordered,
  size,
  labelRender,
  contentRender,
  column: columnProp,
  layout,
  colon,
  id: idProp,
  rootClass,
} = defineProps<ProDescriptionsProps<T, P>>()
const emit = defineEmits<{
  dataSourceChange: [data: T]
  requestError: [error: unknown]
  editableError: [error: unknown]
}>()
defineSlots<{
  [name: string]:
    | ((scope: { record?: T; column?: ProDescriptionsColumn<T> }) => import('vue').VNodeChild)
    | undefined
}>()
// 保留整体 props 接口，getter 持续读取响应式解构值。
const props = {
  get prefixCls() {
    return prefixCls
  },
  get title() {
    return title
  },
  get tooltip() {
    return tooltip
  },
  get extra() {
    return extra
  },
  get columns() {
    return columnsProp
  },
  get dataSource() {
    return dataSource
  },
  get request() {
    return request
  },
  get params() {
    return params
  },
  get loading() {
    return loading
  },
  get editable() {
    return editable
  },
  get formProps() {
    return formProps
  },
  get actionRef() {
    return actionRef
  },
  get formRef() {
    return formRef
  },
  get emptyText() {
    return emptyText
  },
  get classes() {
    return classesProp
  },
  get classNames() {
    return classNames
  },
  get styles() {
    return stylesProp
  },
  get onLoadingChange() {
    return onLoadingChange
  },
  get onRequestError() {
    return onRequestError
  },
  get onDataSourceChange() {
    return onDataSourceChange
  },
  get onEditableError() {
    return onEditableError
  },
  get bordered() {
    return bordered
  },
  get size() {
    return size
  },
  get labelRender() {
    return labelRender
  },
  get contentRender() {
    return contentRender
  },
  get column() {
    return columnProp
  },
  get layout() {
    return layout
  },
  get colon() {
    return colon
  },
  get id() {
    return idProp
  },
  get rootClass() {
    return rootClass
  },
}
const intl = useIntl()
const prefix = useProPrefix('descriptions', () => prefixCls)
const { direction } = useProConfig()
const themeVars = useThemeVars()
const { classes, styles } = useSemanticStyles(
  props,
  {
    classes: () => classesProp,
    classNames: () => classNames,
    styles: () => stylesProp,
  },
  { styles: { content: { minWidth: 0 } } },
)
const instance = getCurrentInstance()
const bindings = computed(() => {
  Object.values(props)
  return Object.fromEntries(
    Object.entries(instance?.vnode.props ?? {}).filter(
      ([raw]) =>
        ![
          'columns',
          'dataSource',
          'request',
          'params',
          'loading',
          'editable',
          'actionRef',
          'formRef',
          'formProps',
          'prefixCls',
          'classes',
          'classNames',
          'styles',
          'title',
          'extra',
          'tooltip',
          'emptyText',
          'onLoadingChange',
          'onRequestError',
          'onDataSourceChange',
          'onEditableError',
          'ref',
        ].includes(raw.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase())),
    ),
  )
})
const data = shallowRef<T>(cloneRecord((dataSource ?? {}) as T))
const draft = shallowRef<T>(cloneRecord(data.value))
const internalEditing = ref<string[]>([])
const editing = computed<string[]>(
  () => (editable ? editable.editableKeys : undefined)?.map(String) ?? internalEditing.value,
)
const busy = ref(false)
const saving = ref<string>()
const form = ref<FormInstance>()
let sequence = 0
const columns = computed(() =>
  [...(columnsProp ?? [])]
    .filter((column) => !column.hide && !column.hideInDescriptions)
    .sort((a, b) => (b.order ?? 0) - (a.order ?? 0)),
)
watch(
  () => dataSource,
  (value) => {
    if (value) {
      data.value = cloneRecord(value)
      if (!editing.value.length) draft.value = cloneRecord(value)
    }
  },
  { deep: true },
)
watch(
  editing,
  (next, previous) => {
    for (const key of previous ?? []) {
      if (next.includes(key)) continue
      const column = columns.value.find((item) => columnKey(item) === key)
      if (column)
        draft.value = setValue(
          draft.value,
          column.dataIndex ?? key,
          getValue(data.value, column.dataIndex ?? key),
        )
    }
  },
  { flush: 'sync' },
)
watch(busy, (value) => onLoadingChange?.(value))
async function reload() {
  if (!request) return
  const id = ++sequence
  busy.value = true
  try {
    const result = await request((params ?? {}) as P)
    if (id !== sequence) return
    if (result.success !== false) {
      data.value = cloneRecord(result.data)
      draft.value = cloneRecord(result.data)
    }
  } catch (error) {
    if (id === sequence) emit('requestError', error)
  } finally {
    if (id === sequence) busy.value = false
  }
}
watch(
  () => [request, params],
  () => void reload(),
  { deep: true, immediate: true },
)
function setEditing(keys: string[]) {
  internalEditing.value = keys
  if (editable) editable.onChange?.(keys, [draft.value])
}
function canEdit(column: ProDescriptionsColumn<T>, index = columns.value.indexOf(column)) {
  return (
    Boolean(editable) &&
    !column.readonly &&
    (typeof column.editable === 'function'
      ? column.editable(data.value, index)
      : column.editable !== false)
  )
}
function startEditable(key: ProKey) {
  const id = String(key)
  const column = columns.value.find((item) => columnKey(item) === id)
  if (!editable || !column || !canEdit(column)) return false
  if (editing.value.includes(id)) return true
  if (editable.type !== 'multiple' && editing.value.length) return false
  if (!editing.value.length) draft.value = cloneRecord(data.value)
  setEditing([...editing.value, id])
  return true
}
function cancelEditable(key: ProKey) {
  const id = String(key)
  if (!editing.value.includes(id)) return
  if (editable)
    Promise.resolve(
      editable.onCancel?.(key, cloneRecord(draft.value), cloneRecord(data.value)),
    ).catch((error) => emit('editableError', error))
  const column = columns.value.find((item) => columnKey(item) === id)
  if (column)
    draft.value = setValue(
      draft.value,
      column.dataIndex ?? id,
      getValue(data.value, column.dataIndex ?? id),
    )
  setEditing(editing.value.filter((item) => item !== id))
}
async function saveEditable(key: ProKey) {
  const id = String(key)
  const column = columns.value.find((item) => columnKey(item) === id)
  if (!column || !editable || saving.value || !editing.value.includes(id)) return false
  saving.value = id
  try {
    await form.value?.validateFields([name(column)])
    const next = setValue(
      data.value,
      column.dataIndex ?? id,
      getValue(draft.value, column.dataIndex ?? id),
    )
    const result = await editable.onSave?.(key, cloneRecord(next), cloneRecord(data.value))
    if (result === false) return false
    data.value = next
    setEditing(editing.value.filter((item) => item !== id))
    emit('dataSourceChange', cloneRecord(next))
    return true
  } catch (error) {
    emit('editableError', error)
    return false
  } finally {
    saving.value = undefined
  }
}
function name(column: ProDescriptionsColumn<T>) {
  return Array.isArray(column.dataIndex)
    ? [...column.dataIndex]
    : [column.dataIndex ?? columnKey(column)]
}
function update(column: ProDescriptionsColumn<T>, value: unknown) {
  draft.value = setValue(draft.value, column.dataIndex ?? columnKey(column), value)
  if (editable) editable.onValuesChange?.(cloneRecord(draft.value), [cloneRecord(draft.value)])
}
function itemProps(column: ProDescriptionsColumn<T>) {
  return typeof column.formItemProps === 'function'
    ? column.formItemProps(draft.value)
    : column.formItemProps
}
function setDataSource(value: T | undefined) {
  data.value = cloneRecord(value ?? ({} as T))
  draft.value = cloneRecord(data.value)
}
const action: ProDescriptionsInstance<T> = {
  reload,
  getData: () => data.value,
  get dataSource() {
    return data.value
  },
  setDataSource,
  startEditable,
  saveEditable,
  cancelEditable,
  isEditable: (key) => editing.value.includes(String(key)),
}
watch(
  () => actionRef,
  (value, previous) => {
    if (previous) previous.value = undefined
    if (value) value.value = action
  },
  { immediate: true },
)
watch(
  [() => formRef, () => (editable ? editable.formRef : undefined), form],
  ([target, editTarget, value], [previous, previousEdit]) => {
    if (previous && previous !== target && previous !== editTarget) previous.value = undefined
    if (previousEdit && previousEdit !== target && previousEdit !== editTarget)
      previousEdit.value = undefined
    if (target) target.value = value
    if (editTarget) editTarget.value = value
  },
)
onBeforeUnmount(() => {
  sequence++
  const actionTarget = actionRef
  const formTarget = formRef
  const editTarget = editable ? editable.formRef : undefined
  if (actionTarget) actionTarget.value = undefined
  if (formTarget) formTarget.value = undefined
  if (editTarget) editTarget.value = undefined
})
defineExpose<ProDescriptionsInstance<T>>(action)
</script>
<template>
  <Spin :spinning="loading ?? busy"
    ><Form
      ref="form"
      v-bind="{ ...props.formProps, ...(editable ? editable.formProps : {}) }"
      :model="draft"
      ><Descriptions
        v-bind="{ ...bindings, ...$attrs }"
        :dir="direction"
        :classes="classes"
        :styles="styles"
        :class="prefix"
        :style="themeVars"
        data-pro-descriptions
      >
        <template v-if="title !== undefined || tooltip || $slots.title" #title
          ><slot name="title"><RenderNode :content="title" /></slot
          ><Tooltip
            v-if="tooltip"
            v-bind="typeof tooltip === 'string' ? { title: tooltip } : tooltip"
            ><QuestionCircleOutlined /></Tooltip></template
        ><template v-if="extra !== undefined || $slots.extra" #extra
          ><slot name="extra"><RenderNode :content="extra" /></slot
        ></template>
        <DescriptionsItem
          v-for="(column, index) in columns"
          :key="columnKey(column)"
          :span="column.span"
          ><template #label
            ><RenderNode
              :content="
                typeof column.title === 'function'
                  ? column.title(column)
                  : (column.title ?? column.label)
              "
          /></template>
          <FormItem
            v-if="editing.includes(columnKey(column))"
            v-bind="itemProps(column)"
            :name="name(column)"
            :style="{ marginBottom: 0 }"
            ><FieldRender
              v-bind="column"
              :text="getValue(draft, column.dataIndex)"
              :entity="draft"
              :index="index"
              :action="action"
              :form="form"
              mode="edit"
              :empty-text="emptyText"
              @update:text="update(column, $event)"
            /><Space
              ><Button
                type="link"
                :loading="saving === columnKey(column)"
                @click="saveEditable(columnKey(column))"
                >{{ intl.getMessage('editableTable.action.save', '保存') }}</Button
              ><Button type="link" @click="cancelEditable(columnKey(column))">{{
                intl.getMessage('editableTable.action.cancel', '取消')
              }}</Button></Space
            ></FormItem
          >
          <template v-else
            ><slot :name="`field-${columnKey(column)}`" :record="data" :column="column"
              ><FieldRender
                v-bind="column"
                :text="getValue(data, column.dataIndex)"
                :entity="data"
                :index="index"
                :action="action"
                :empty-text="emptyText" /></slot
            ><Button
              v-if="canEdit(column, index)"
              type="text"
              size="small"
              :aria-label="intl.getMessage('table.edit', '编辑')"
              @click="startEditable(columnKey(column))"
              ><EditOutlined /></Button
          ></template> </DescriptionsItem
        ><slot /></Descriptions></Form
  ></Spin>
</template>
