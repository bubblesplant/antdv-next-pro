import { defineComponent, h, type Component } from 'vue'
import ProFormField from './ProFormField.vue'
import type { ProFormControlType } from './fieldRegistry'
import type {
  ProFormCascaderProps,
  ProFormColorPickerProps,
  ProFormRateProps,
  ProFormDigitRangeProps,
  ProFormTimePickerProps,
  ProFormTimeRangePickerProps,
  ProFormDatePickerProps,
  ProFormDateRangePickerProps,
  ProFormRadioProps,
  ProFormCheckboxGroupProps,
} from './types'

function createField<Props extends object>(name: string, fieldType: ProFormControlType) {
  return defineComponent(
    (props: Props, { attrs, slots, emit }) =>
      () =>
        h(
          ProFormField,
          {
            ...props,
            ...attrs,
            fieldType,
            'onUpdate:modelValue': (value: unknown) => emit('update:modelValue', value),
            onChange: (...args: unknown[]) => emit('change', ...args),
          },
          slots,
        ),
    { name, inheritAttrs: false, emits: ['update:modelValue', 'change'] },
  )
}

export const ProFormCascader: ReturnType<typeof createField<ProFormCascaderProps>> =
  createField<ProFormCascaderProps>('ProFormCascader', 'cascader')
export const ProFormColorPicker = createField<ProFormColorPickerProps>(
  'ProFormColorPicker',
  'colorPicker',
)
export const ProFormRate = createField<ProFormRateProps>('ProFormRate', 'rate')
export const ProFormDigitRange = createField<ProFormDigitRangeProps>(
  'ProFormDigitRange',
  'digitRange',
)
export const ProFormTimeRangePicker = createField<ProFormTimeRangePickerProps>(
  'ProFormTimeRangePicker',
  'timeRange',
)
export const ProFormTimePicker = Object.assign(
  createField<ProFormTimePickerProps>('ProFormTimePicker', 'time'),
  { RangePicker: ProFormTimeRangePicker },
)
export const ProFormDateWeekPicker = createField<ProFormDatePickerProps>(
  'ProFormDateWeekPicker',
  'dateWeek',
)
export const ProFormDateMonthPicker = createField<ProFormDatePickerProps>(
  'ProFormDateMonthPicker',
  'dateMonth',
)
export const ProFormDateQuarterPicker = createField<ProFormDatePickerProps>(
  'ProFormDateQuarterPicker',
  'dateQuarter',
)
export const ProFormDateYearPicker = createField<ProFormDatePickerProps>(
  'ProFormDateYearPicker',
  'dateYear',
)
export const ProFormDateWeekRangePicker = createField<ProFormDateRangePickerProps>(
  'ProFormDateWeekRangePicker',
  'dateWeekRange',
)
export const ProFormDateMonthRangePicker = createField<ProFormDateRangePickerProps>(
  'ProFormDateMonthRangePicker',
  'dateMonthRange',
)
export const ProFormDateQuarterRangePicker = createField<ProFormDateRangePickerProps>(
  'ProFormDateQuarterRangePicker',
  'dateQuarterRange',
)
export const ProFormDateYearRangePicker = createField<ProFormDateRangePickerProps>(
  'ProFormDateYearRangePicker',
  'dateYearRange',
)
export const ProFormRadioSingle = createField<ProFormRadioProps>('ProFormRadio', 'radio')
export const ProFormCheckboxGroup = createField<ProFormCheckboxGroupProps>(
  'ProFormCheckboxGroup',
  'checkboxGroup',
)

export const additionalFieldComponents: Record<string, Component> = {
  ProFormCascader,
  ProFormColorPicker,
  ProFormRate,
  ProFormDigitRange,
  ProFormTimePicker,
  ProFormTimeRangePicker,
  ProFormDateWeekPicker,
  ProFormDateMonthPicker,
  ProFormDateQuarterPicker,
  ProFormDateYearPicker,
  ProFormDateWeekRangePicker,
  ProFormDateMonthRangePicker,
  ProFormDateQuarterRangePicker,
  ProFormDateYearRangePicker,
  ProFormCheckboxGroup,
}
