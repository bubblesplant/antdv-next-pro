import { h, type FunctionalComponent, type VNodeChild } from 'vue'
import type { ProValueType } from '../types'
import { getValueEnumOptions } from '../pro-form-fields/options'
import type { ProFormValueEnum } from '../pro-form-fields/types'
import ProField, { type ProFieldProps } from './ProField'
import CustomProField from './CustomProField.vue'
import FieldStatusBadge from './FieldStatusBadge.vue'
import type { ProFieldDualRender, ProFieldRenderText } from './types'

export { default as FieldMoney } from './FieldMoney.vue'
export { default as FieldIndexColumn } from './FieldIndexColumn.vue'
export type {
  FieldMoneyProps,
  ProFieldMoneyProps,
  ProFieldRenderText,
  ProFieldDualRender,
} from './types'

// Runtime aliases retain a single VNode delegation boundary; their implementation is an SFC.
function field(name: string, valueType: ProValueType) {
  const component: FunctionalComponent<ProFieldProps> = (props, { attrs, slots }) =>
    h(ProField, { ...props, ...attrs, valueType }, slots)
  component.displayName = name
  component.inheritAttrs = false
  return component
}
export const FieldText = field('FieldText', 'text')
export const FieldCascader = field('FieldCascader', 'cascader')
export const FieldCheckbox = field('FieldCheckbox', 'checkbox')
export const FieldCode = field('FieldCode', 'code')
export const FieldColorPicker = field('FieldColorPicker', 'color')
export const FieldDatePicker = field('FieldDatePicker', 'date')
export const FieldDigit = field('FieldDigit', 'digit')
export const FieldDigitRange = field('FieldDigitRange', 'digitRange')
export const FieldFromNow = field('FieldFromNow', 'fromNow')
export const FieldImage = field('FieldImage', 'image')
export const FieldOptions = field('FieldOptions', 'option')
export const FieldPassword = field('FieldPassword', 'password')
export const FieldPercent = field('FieldPercent', 'percent')
export const FieldProgress = field('FieldProgress', 'progress')
export const FieldRadio = field('FieldRadio', 'radio')
export const FieldRangePicker = field('FieldRangePicker', 'dateRange')
export const FieldRate = field('FieldRate', 'rate')
export const FieldSecond = field('FieldSecond', 'second')
export const FieldSegmented = field('FieldSegmented', 'segmented')
export const FieldSelect = field('FieldSelect', 'select')
export const FieldSlider = field('FieldSlider', 'slider')
export const FieldSwitch = field('FieldSwitch', 'switch')
export const FieldTextArea = field('FieldTextArea', 'textarea')
export const FieldTimePicker = field('FieldTimePicker', 'time')
export const FieldTimeRangePicker = field('FieldTimeRangePicker', 'timeRange')
export const FieldTreeSelect = field('FieldTreeSelect', 'treeSelect')

function statusComponent(status: 'success' | 'error' | 'processing' | 'default' | 'warning') {
  const component: FunctionalComponent = (_, { attrs, slots }) =>
    h(FieldStatusBadge, { ...attrs, status }, slots)
  component.displayName = `FieldStatus${status}`
  component.inheritAttrs = false
  return component
}
const Success = statusComponent('success'),
  Error = statusComponent('error'),
  Processing = statusComponent('processing'),
  Default = statusComponent('default'),
  Warning = statusComponent('warning')
export const FieldStatus = {
  Success,
  Error,
  Processing,
  Default,
  Warning,
  success: Success,
  error: Error,
  processing: Processing,
  default: Default,
  warning: Warning,
}
export const ProFieldBadgeColor: FunctionalComponent<{ color?: string }> = (
  props,
  { attrs, slots },
) => h(FieldStatusBadge, { ...attrs, color: props.color }, slots)
ProFieldBadgeColor.displayName = 'ProFieldBadgeColor'
ProFieldBadgeColor.props = ['color']
ProFieldBadgeColor.inheritAttrs = false
export type ProFieldStatusType = keyof typeof FieldStatus
export type ProFieldEmptyText = VNodeChild
export type ProFieldPropsType = ProFieldProps

export function createProField(renderer: ProFieldRenderText | ProFieldDualRender) {
  const component: FunctionalComponent<ProFieldProps> = (props, { attrs, slots }) =>
    h(CustomProField, { ...props, ...attrs, renderer }, slots)
  component.displayName = 'CustomProField'
  component.inheritAttrs = false
  component.props = [
    'text',
    'modelValue',
    'valueType',
    'mode',
    'fieldProps',
    'valueEnum',
    'options',
    'request',
    'params',
  ]
  return component
}

export const defaultRenderText: ProFieldRenderText = (text, valueType, props, valueTypeMap) => {
  const definition = valueTypeMap[valueType]
  return h(ProField, {
    ...props,
    text,
    valueType,
    render: definition?.render,
    formItemRender: definition?.formItemRender ?? definition?.renderFormItem,
  })
}
export function proFieldParsingValueEnumToArray(valueEnum: ProFormValueEnum) {
  return getValueEnumOptions(valueEnum)
}
