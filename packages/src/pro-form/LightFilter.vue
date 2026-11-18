<script setup lang="ts">
import type { VNodeChild } from 'vue'
import { cloneVNode, computed, ref, useAttrs, useSlots } from 'vue'
import type { ProDataIndex } from '../types'
import { FilterOutlined } from '@antdv-next/icons'
import ProForm from './ProForm'
import type { ProFormInstance } from './types'
import { flattenChildren, resolveSemantic, useFormPrefix } from './utils'

import VNodeContent from '../shared/VNodeContent'
import { pickFormProps, proxyForm } from './layoutHelpers'
import { lightFilterProps } from './componentProps'
import LightWrapper from './LightWrapper.vue'

defineOptions({ name: 'LightFilter', inheritAttrs: false })
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
  collapse: propCollapse,
  collapseLabel: propCollapseLabel,
  placement: propPlacement,
  footerRender: propFooterRender,
} = defineProps(lightFilterProps)
const emit = defineEmits([
  'update:modelValue',
  'change',
  'reset',
  'submit',
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
  get collapse() {
    return propCollapse
  },
  get collapseLabel() {
    return propCollapseLabel
  },
  get placement() {
    return propPlacement
  },
  get footerRender() {
    return propFooterRender
  },
}

const inner = ref<ProFormInstance>()
const api = proxyForm(inner)
const { prefix, t, config } = useFormPrefix('form-light-filter', () => propPrefixCls)
defineExpose(api)
const semantic = computed(() => resolveSemantic(props))
const size = computed(() => {
  const configured = attrs.size ?? config.value.componentSize
  return configured === 'small' || configured === 'large' ? configured : 'middle'
})
function children() {
  const nodes = flattenChildren(slots.default?.())
  return {
    primary: propCollapse
      ? []
      : nodes.filter((child) => child.props?.secondary !== true && child.props?.secondary !== ''),
    secondary: propCollapse
      ? nodes
      : nodes.filter((child) => child.props?.secondary === true || child.props?.secondary === ''),
  }
}
function effective(values: Record<string, unknown>) {
  return Object.values(values).some(
    (value) =>
      value !== undefined &&
      value !== null &&
      value !== '' &&
      (!Array.isArray(value) || value.length > 0),
  )
}
function secondaryNames(nodes: import('vue').VNode[]) {
  return nodes.flatMap((node) =>
    node.props?.name === undefined ? [] : [node.props.name as ProDataIndex],
  )
}
</script>

<template>
  <ProForm
    v-bind="{ ...attrs, ...pickFormProps(props) }"
    ref="inner"
    :prefix-cls="prefix"
    layout="inline"
    :submitter="false"
    :data-pro-light-filter="size"
    :class="[attrs.class, semantic.classes.root]"
    :style="[attrs.style as any, semantic.styles.root]"
    @update:model-value="emit('update:modelValue', $event)"
    @change="emit('change', $event)"
    @submit="emit('submit', $event)"
    @reset="emit('reset', $event)"
    @error="emit('error', $event)"
    @request-error="emit('requestError', $event)"
  >
    <template
      v-for="name in Object.keys(slots).filter((name) => name !== 'default')"
      #[name]="slotProps"
    >
      <slot :name="name" v-bind="slotProps || {}" />
    </template>
    <template #default="{ values }">
      <div :class="[prefix, `${prefix}-${size}`, { [`${prefix}-effective`]: effective(values) }]">
        <template v-for="(content, contentIndex) in [children()]" :key="contentIndex">
          <div
            data-pro-light-container=""
            :class="[`${prefix}-container`, semantic.classes.container]"
            :style="semantic.styles.container"
          >
            <div
              v-for="(node, index) in content.primary"
              :key="node.key ?? index"
              :class="`${prefix}-item`"
            >
              <LightWrapper
                :name="node.props?.name"
                :label="node.props?.label"
                :disabled="node.props?.disabled"
                :placement="propPlacement"
                :footer-render="propFooterRender"
              >
                <VNodeContent
                  :content="cloneVNode(node, { label: undefined, secondary: undefined })"
                />
              </LightWrapper>
            </div>
            <div v-if="content.secondary.length" :class="`${prefix}-item`">
              <LightWrapper
                :label="(propCollapseLabel as VNodeChild) ?? t('form.lightFilter.more', '更多筛选')"
                :field-names="secondaryNames(content.secondary)"
                :placement="propPlacement"
                :footer-render="propFooterRender"
              >
                <template #label>
                  <VNodeContent
                    v-if="propCollapseLabel != null"
                    :content="propCollapseLabel as VNodeChild"
                  />
                  <FilterOutlined
                    v-else-if="propCollapse"
                    :class="`${prefix}-collapse-icon`"
                    :aria-label="t('form.lightFilter.more', '更多筛选')"
                  />
                  <template v-else>{{ t('form.lightFilter.more', '更多筛选') }}</template>
                </template>
                <div
                  v-for="(node, index) in content.secondary"
                  :key="node.key ?? index"
                  :class="`${prefix}-line`"
                >
                  <VNodeContent :content="cloneVNode(node, { secondary: undefined })" />
                </div>
              </LightWrapper>
            </div>
          </div>
        </template>
      </div>
    </template>
  </ProForm>
</template>
