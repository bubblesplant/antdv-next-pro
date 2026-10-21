import { Badge, Popover, type InputNumberProps } from 'antdv-next'
import { defineComponent, h, type VNodeChild } from 'vue'
import { useProConfig, useProPrefix } from '../provider/context'
import type { ProValueTypeMap } from '../provider/types'
import type { ProValueType } from '../types'
import { resolveProFieldValueType } from './valueType'
import { getValueEnumOptions } from '../pro-form-fields/options'
import type { ProFormValueEnum } from '../pro-form-fields/types'
import ProField, { type ProFieldProps } from './ProField'
import { formatMoney, type FieldMoneyOptions } from './money'

function field(name: string, valueType: ProValueType) {
  return defineComponent(
    (props: ProFieldProps, { attrs, slots }) =>
      () =>
        h(ProField, { ...props, ...attrs, valueType }, slots),
    { name, inheritAttrs: false },
  )
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
export interface FieldMoneyProps extends ProFieldProps, FieldMoneyOptions {}
export type ProFieldMoneyProps = FieldMoneyProps
export const FieldMoney = defineComponent(
  (props: FieldMoneyProps, { attrs, slots }) => {
    const config = useProConfig()
    return () => {
      const {
        locale,
        customSymbol,
        moneySymbol,
        numberFormatOptions,
        numberPopoverRender,
        ...rest
      } = props
      const fieldProps = {
        locale,
        customSymbol,
        moneySymbol,
        numberFormatOptions,
        ...props.fieldProps,
      }
      const definedProps = Object.fromEntries(
        Object.entries(rest).filter(([, value]) => value !== undefined),
      )
      const dom = h(ProField, { ...definedProps, ...attrs, valueType: 'money', fieldProps }, slots)
      if (
        (props.mode !== 'edit' && props.mode !== 'update') ||
        numberPopoverRender === false ||
        props.readonly
      )
        return dom
      const value = props.modelValue ?? props.value ?? props.text
      const text = formatMoney(value, locale ?? config.intl.value.locale, {
        ...fieldProps,
        numberFormatOptions: { ...numberFormatOptions, notation: 'compact' },
      })
      return h(
        Popover,
        {
          trigger: 'focus',
          content:
            typeof numberPopoverRender === 'function'
              ? h('span', [numberPopoverRender({ ...fieldProps, value } as InputNumberProps, text)])
              : text,
        },
        { default: () => dom },
      )
    }
  },
  {
    name: 'FieldMoney',
    inheritAttrs: false,
    props: [
      'text',
      'modelValue',
      'value',
      'mode',
      'readonly',
      'fieldProps',
      'locale',
      'customSymbol',
      'moneySymbol',
      'numberFormatOptions',
      'numberPopoverRender',
    ],
  },
)
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

export const FieldIndexColumn = defineComponent({
  name: 'FieldIndexColumn',
  props: { text: Number, border: Boolean },
  setup(props, { attrs, slots }) {
    const prefix = useProPrefix('field-index-column')
    return () =>
      h(
        'span',
        {
          ...attrs,
          class: [
            prefix.value,
            props.border && `${prefix.value}-border`,
            (props.text ?? 0) > 3 && 'top-three',
            attrs.class,
          ],
          style: [
            {
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '18px',
              height: '18px',
            },
            props.border
              ? {
                  color: '#fff',
                  borderRadius: '9px',
                  backgroundColor: (props.text ?? 0) > 3 ? '#979797' : '#314659',
                  fontSize: '12px',
                }
              : undefined,
            attrs.style,
          ],
        },
        slots.default?.() ?? String(props.text ?? ''),
      )
  },
})

function statusComponent(status: 'success' | 'error' | 'processing' | 'default' | 'warning') {
  return defineComponent({
    name: `FieldStatus${status}`,
    setup(_, { attrs, slots }) {
      return () => h(Badge, { ...attrs, status, text: h('span', slots.default?.()) })
    },
  })
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
export const ProFieldBadgeColor = defineComponent({
  name: 'ProFieldBadgeColor',
  props: { color: String },
  setup(props, { attrs, slots }) {
    return () => h(Badge, { ...attrs, color: props.color, text: h('span', slots.default?.()) })
  },
})
export type ProFieldStatusType = keyof typeof FieldStatus
export type ProFieldEmptyText = VNodeChild
export type ProFieldPropsType = ProFieldProps
export type ProFieldRenderText = (
  value: unknown,
  valueType: ProValueType,
  props: ProFieldProps,
  valueTypeMap: ProValueTypeMap,
) => VNodeChild
export interface ProFieldDualRender {
  renderRead: ProFieldRenderText
  renderEdit: ProFieldRenderText
}

export function createProField(renderer: ProFieldRenderText | ProFieldDualRender) {
  return defineComponent(
    (props: ProFieldProps, { attrs, slots }) => {
      const config = useProConfig()
      return () => {
        const render =
          typeof renderer === 'function'
            ? renderer
            : props.mode === 'edit' || props.mode === 'update'
              ? renderer.renderEdit
              : renderer.renderRead
        return h(
          ProField,
          {
            ...props,
            ...attrs,
            render: (value) =>
              render(
                value,
                resolveProFieldValueType(props.valueType).type,
                props,
                config.valueTypeMap.value,
              ),
            formItemRender: (value) =>
              render(
                value,
                resolveProFieldValueType(props.valueType).type,
                props,
                config.valueTypeMap.value,
              ),
          },
          slots,
        )
      }
    },
    {
      name: 'CustomProField',
      inheritAttrs: false,
      props: [
        'text',
        'modelValue',
        'valueType',
        'mode',
        'fieldProps',
        'valueEnum',
        'options',
        'request',
        'params',
      ],
    },
  )
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
