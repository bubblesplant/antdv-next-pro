import type { Component, ComponentOptionsMixin, DefineComponent } from 'vue'
import type { ProFormTimePickerProps, ProFormTimeRangePickerProps } from './types'
import ProFormCascader from './ProFormCascader.vue'
import ProFormCheckboxGroup from './ProFormCheckboxGroup.vue'
import ProFormColorPicker from './ProFormColorPicker.vue'
import ProFormDateMonthPicker from './ProFormDateMonthPicker.vue'
import ProFormDateMonthRangePicker from './ProFormDateMonthRangePicker.vue'
import ProFormDateQuarterPicker from './ProFormDateQuarterPicker.vue'
import ProFormDateQuarterRangePicker from './ProFormDateQuarterRangePicker.vue'
import ProFormDateWeekPicker from './ProFormDateWeekPicker.vue'
import ProFormDateWeekRangePicker from './ProFormDateWeekRangePicker.vue'
import ProFormDateYearPicker from './ProFormDateYearPicker.vue'
import ProFormDateYearRangePicker from './ProFormDateYearRangePicker.vue'
import ProFormDigitRange from './ProFormDigitRange.vue'
import ProFormRadioSingle from './ProFormRadioSingle.vue'
import ProFormRate from './ProFormRate.vue'
import ProFormTimePickerRaw from './ProFormTimePicker.vue'
import ProFormTimeRangePicker from './ProFormTimeRangePicker.vue'

type TimePickerComponent<Props extends { modelValue?: unknown }> = DefineComponent<
  Props,
  Record<never, never>,
  Record<never, never>,
  Record<never, never>,
  Record<never, never>,
  ComponentOptionsMixin,
  ComponentOptionsMixin,
  {
    'update:modelValue': (value: Props['modelValue']) => void
    change: (...args: unknown[]) => void
  }
>

export const ProFormTimePicker = Object.assign(ProFormTimePickerRaw, {
  RangePicker: ProFormTimeRangePicker,
}) as TimePickerComponent<ProFormTimePickerProps> & {
  RangePicker: TimePickerComponent<ProFormTimeRangePickerProps>
}

export {
  ProFormCascader,
  ProFormCheckboxGroup,
  ProFormColorPicker,
  ProFormDateMonthPicker,
  ProFormDateMonthRangePicker,
  ProFormDateQuarterPicker,
  ProFormDateQuarterRangePicker,
  ProFormDateWeekPicker,
  ProFormDateWeekRangePicker,
  ProFormDateYearPicker,
  ProFormDateYearRangePicker,
  ProFormDigitRange,
  ProFormRadioSingle,
  ProFormRate,
  ProFormTimeRangePicker,
}

export const additionalFieldComponents: Record<string, Component> = {
  ProFormCascader,
  ProFormColorPicker,
  ProFormRate,
  ProFormDigitRange,
  ProFormTimeRangePicker,
  ProFormTimePicker,
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
