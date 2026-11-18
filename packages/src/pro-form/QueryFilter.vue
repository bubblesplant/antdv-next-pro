<script setup lang="ts">
import type { VNodeChild } from 'vue'
import { Button, FormItem, Space, theme } from 'antdv-next'
import { computed, h, onBeforeUnmount, onMounted, ref, unref, useAttrs, useSlots } from 'vue'
import ProForm from './ProForm'
import type { ProFormInstance } from './types'
import { flattenChildren, resolveSemantic, useFormPrefix } from './utils'
import { defaultCollapseRender } from './query-filter/Actions'
import { resolveQueryFilterLayout } from './query-filter/layout'
import { useFormThemeVars } from './useFormThemeVars'

import VNodeContent from '../shared/VNodeContent'
import { pickFormProps, proxyForm } from './layoutHelpers'
import { queryFilterProps } from './componentProps'

defineOptions({ name: 'QueryFilter', inheritAttrs: false })
const {
  name: propName,
  modelValue: propModelValue,
  initialValues: propInitialValues,
  onFinish: propOnFinish,
  onValuesChange: propOnValuesChange,
  request: propRequest,
  params: propParams,
  readonly: propReadonly,
  disabled: propDisabled,
  submitter: propSubmitter,
  syncToUrl: propSyncToUrl,
  syncToInitialValues: propSyncToInitialValues,
  dateFormatter: propDateFormatter,
  prefixCls: propPrefixCls,
  classes: propClasses,
  classNames: propClassNames,
  styles: propStyles,
  formRef: propFormRef,
  layout: propLayout,
  collapsed: propCollapsed,
  defaultCollapsed: propDefaultCollapsed,
  defaultColsNumber: propDefaultColsNumber,
  span: propSpan,
  labelWidth: propLabelWidth,
  split: propSplit,
  searchText: propSearchText,
  resetText: propResetText,
  optionRender: propOptionRender,
  collapseRender: propCollapseRender,
} = defineProps(queryFilterProps)
const emit = defineEmits([
  'update:modelValue',
  'update:collapsed',
  'collapse',
  'reset',
  'submit',
  'change',
  'error',
  'requestError',
])
const attrs = useAttrs()
const slots = useSlots()
const props = {
  get name() {
    return propName
  },
  get modelValue() {
    return propModelValue
  },
  get initialValues() {
    return propInitialValues
  },
  get onFinish() {
    return propOnFinish
  },
  get onValuesChange() {
    return propOnValuesChange
  },
  get request() {
    return propRequest
  },
  get params() {
    return propParams
  },
  get readonly() {
    return propReadonly
  },
  get disabled() {
    return propDisabled
  },
  get submitter() {
    return propSubmitter
  },
  get syncToUrl() {
    return propSyncToUrl
  },
  get syncToInitialValues() {
    return propSyncToInitialValues
  },
  get dateFormatter() {
    return propDateFormatter
  },
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
  get formRef() {
    return propFormRef
  },
  get layout() {
    return propLayout
  },
  get collapsed() {
    return propCollapsed
  },
  get defaultCollapsed() {
    return propDefaultCollapsed
  },
  get defaultColsNumber() {
    return propDefaultColsNumber
  },
  get span() {
    return propSpan
  },
  get labelWidth() {
    return propLabelWidth
  },
  get split() {
    return propSplit
  },
  get searchText() {
    return propSearchText
  },
  get resetText() {
    return propResetText
  },
  get optionRender() {
    return propOptionRender
  },
  get collapseRender() {
    return propCollapseRender
  },
}

const inner = ref<ProFormInstance>()
const api = proxyForm(inner)
const root = ref<HTMLElement>()
const width = ref(1024)
const local = ref(propDefaultCollapsed)
const collapsed = computed(() => propCollapsed ?? local.value)
const { prefix, t } = useFormPrefix('query-filter', () => propPrefixCls)
const themeVars = useFormThemeVars()
const { token } = theme.useToken()
const grid = computed(() =>
  resolveQueryFilterLayout({
    width: width.value,
    layout: propLayout,
    span: propSpan,
    defaultColsNumber: propDefaultColsNumber,
    token: token.value,
  }),
)
const columnWidth = computed(() => `${(grid.value.span / 24) * 100}%`)
let observer: ResizeObserver | undefined
let frame: number | undefined
onMounted(() => {
  const container = root.value
  if (!container) return
  const measure = () => {
    const nextWidth = container.offsetWidth
    if (nextWidth > 17) width.value = nextWidth
  }
  measure()
  if (typeof ResizeObserver === 'undefined') return
  observer = new ResizeObserver(() => {
    if (frame !== undefined) return
    frame = requestAnimationFrame(() => {
      frame = undefined
      measure()
    })
  })
  observer.observe(container, { box: 'border-box' })
})
onBeforeUnmount(() => {
  observer?.disconnect()
  if (frame !== undefined) cancelAnimationFrame(frame)
})
defineExpose(api)
function toggle() {
  local.value = !collapsed.value
  emit('update:collapsed', local.value)
  emit('collapse', local.value)
}
const semantic = computed(() => resolveSemantic(props))
const visible = computed(() => Math.max(1, Math.floor(24 / grid.value.span) - 1))
function resolveContent() {
  const children = flattenChildren(slots.default?.())
  const shouldCollapse = children.length > visible.value
  const submitter = propSubmitter === false ? undefined : propSubmitter
  const defaults: VNodeChild[] = submitter
    ? [
        submitter.resetButtonProps === false
          ? null
          : h(
              Button,
              { ...submitter.resetButtonProps, onClick: () => api.reset() },
              () =>
                (propResetText as VNodeChild) ??
                submitter.searchConfig?.resetText ??
                submitter.resetText ??
                t('tableForm.reset', '重置'),
            ),
        submitter.submitButtonProps === false
          ? null
          : h(
              Button,
              {
                type: 'primary',
                ...submitter.submitButtonProps,
                htmlType: 'submit',
                loading: unref(inner.value?.loading) || submitter.submitButtonProps?.loading,
              },
              () =>
                (propSearchText as VNodeChild) ??
                submitter.searchConfig?.submitText ??
                submitter.submitText ??
                t('tableForm.search', '查询'),
            ),
      ].filter(Boolean)
    : []
  const custom =
    propOptionRender === false
      ? null
      : typeof propOptionRender === 'function'
        ? propOptionRender(props, api, defaults)
        : submitter?.render === false
          ? null
          : submitter?.render
            ? submitter.render({ form: api, submit: api.submit, reset: api.reset }, defaults)
            : (slots.submitter?.({
                form: api,
                values: api.getFieldsValue(),
                submit: api.submit,
                reset: api.reset,
              }) ?? defaults)
  const collapseButton =
    shouldCollapse && propCollapseRender !== false
      ? h(
          Button,
          {
            type: 'link',
            class: [`${prefix.value}-collapse-button`, semantic.value.classes.collapseButton],
            style: [{ paddingInline: 0 }, semantic.value.styles.collapseButton],
            'aria-expanded': !collapsed.value,
            onClick: toggle,
          },
          () =>
            typeof propCollapseRender === 'function'
              ? propCollapseRender(collapsed.value)
              : defaultCollapseRender(
                  collapsed.value,
                  t('tableForm.collapsed', '展开'),
                  t('tableForm.expand', '收起'),
                ),
        )
      : null
  const hasCustom = Array.isArray(custom) ? custom.length > 0 : Boolean(custom)
  const actions =
    hasCustom || collapseButton
      ? h(
          Space,
          { size: [16, 8], wrap: true, style: { display: 'flex', justifyContent: 'flex-end' } },
          () => [
            hasCustom
              ? h(Space, { wrap: true, style: { justifyContent: 'flex-end' } }, () => custom)
              : null,
            collapseButton,
          ],
        )
      : null
  return { children, actions }
}
function formBindings() {
  return {
    ...attrs,
    ...pickFormProps(props),
    class: undefined,
    style: undefined,
    classes: { ...semantic.value.classes, root: undefined },
    classNames: undefined,
    styles: { ...semantic.value.styles, root: undefined },
    labelCol:
      grid.value.layout === 'horizontal' && typeof propLabelWidth === 'number'
        ? { style: { width: `${propLabelWidth}px` } }
        : attrs.labelCol,
  }
}
</script>

<template>
  <div
    ref="root"
    data-pro-query-filter=""
    :class="[
      `${prefix}-container`,
      attrs.class,
      semantic.classes.root,
      { [`${prefix}-split`]: propSplit },
    ]"
    :style="[themeVars, attrs.style as any, semantic.styles.root]"
  >
    <ProForm
      v-bind="formBindings()"
      ref="inner"
      :prefix-cls="prefix"
      :layout="grid.layout"
      :submitter="false"
      @update:model-value="emit('update:modelValue', $event)"
      @reset="emit('reset', $event)"
      @submit="emit('submit', $event)"
      @change="emit('change', $event)"
      @error="emit('error', $event)"
      @request-error="emit('requestError', $event)"
    >
      <template
        v-for="name in Object.keys(slots).filter((name) => name !== 'default')"
        #[name]="slotProps"
      >
        <slot :name="name" v-bind="slotProps || {}" />
      </template>
      <template v-for="(content, contentIndex) in [resolveContent()]" :key="contentIndex">
        <div
          data-pro-query-row=""
          :class="[`${prefix}-row`, semantic.classes.row]"
          :style="semantic.styles.row"
        >
          <div
            v-for="(child, index) in content.children"
            :key="child.key ?? index"
            data-pro-query-col=""
            :class="[`${prefix}-col`, semantic.classes.item]"
            :style="[
              {
                flex: `0 0 ${columnWidth}`,
                maxWidth: columnWidth,
                display: collapsed && index >= visible ? 'none' : undefined,
              },
              semantic.styles.item,
            ]"
          >
            <VNodeContent :content="child" />
          </div>
          <div
            v-if="content.actions"
            data-pro-query-actions=""
            :class="[`${prefix}-actions`, semantic.classes.actions]"
            :style="[
              { marginInlineStart: 'auto', flex: `0 0 ${columnWidth}`, maxWidth: columnWidth },
              semantic.styles.actions,
            ]"
          >
            <FormItem
              :label="grid.layout === 'vertical' ? ' ' : undefined"
              :colon="false"
              :label-col="{}"
              :wrapper-col="{}"
            >
              <VNodeContent :content="content.actions" />
            </FormItem>
          </div>
        </div>
      </template>
    </ProForm>
  </div>
</template>
