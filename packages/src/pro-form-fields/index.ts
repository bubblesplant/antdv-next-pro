import type { Component } from 'vue'
import { RadioButton } from 'antdv-next'

import FieldControl from './FieldControl.vue'
import ProFormCaptcha from './ProFormCaptcha.vue'
import ProFormCheckboxRaw from './ProFormCheckbox.vue'
import {
  additionalFieldComponents,
  ProFormCheckboxGroup,
  ProFormRadioSingle,
  ProFormDateWeekPicker,
  ProFormDateMonthPicker,
  ProFormDateQuarterPicker,
  ProFormDateYearPicker,
} from './additionalFields'
import ProFormDatePickerRaw from './ProFormDatePicker.vue'
import ProFormDateRangePicker from './ProFormDateRangePicker.vue'
import ProFormDateTimePicker from './ProFormDateTimePicker.vue'
import ProFormDateTimeRangePicker from './ProFormDateTimeRangePicker.vue'
import ProFormDigit from './ProFormDigit.vue'
import ProFormField from './ProFormField.vue'
import ProFormMoney from './ProFormMoney.vue'
import ProFormRadioGroup from './ProFormRadioGroup.vue'
import ProFormSegmented from './ProFormSegmented.vue'
import ProFormSelectRaw from './ProFormSelect.vue'
import ProFormSearchSelect from './ProFormSearchSelect'
import ProFormSlider from './ProFormSlider.vue'
import ProFormSwitch from './ProFormSwitch.vue'
import ProFormTextRaw from './ProFormText.vue'
import ProFormTextArea from './ProFormTextArea.vue'
import ProFormTextPassword from './ProFormTextPassword.vue'
import ProFormTreeSelect from './ProFormTreeSelect.vue'
import ProFormUploadButton from './ProFormUploadButton.vue'
import ProFormUploadDragger from './ProFormUploadDragger.vue'
import ReadonlyField from './ReadonlyField.vue'

export const ProFormText = Object.assign(ProFormTextRaw, {
  Password: ProFormTextPassword,
}) as typeof ProFormTextRaw & { readonly Password: typeof ProFormTextPassword }

export const ProFormRadio = Object.assign(ProFormRadioSingle, {
  Group: ProFormRadioGroup,
  Button: RadioButton,
})
export const ProFormCheckbox = Object.assign(ProFormCheckboxRaw, { Group: ProFormCheckboxGroup })
export const ProFormDatePicker = Object.assign(ProFormDatePickerRaw, {
  Week: ProFormDateWeekPicker,
  Month: ProFormDateMonthPicker,
  Quarter: ProFormDateQuarterPicker,
  Year: ProFormDateYearPicker,
})
export const ProFormSelect = Object.assign(ProFormSelectRaw, { SearchSelect: ProFormSearchSelect })

export const proFormFieldComponents: Array<readonly [publicName: string, component: Component]> = [
  ['ProFormText', ProFormText],
  ['ProFormDigit', ProFormDigit],
  ['ProFormTextPassword', ProFormTextPassword],
  ['ProFormTextArea', ProFormTextArea],
  ['ProFormCaptcha', ProFormCaptcha],
  ['ProFormDatePicker', ProFormDatePicker],
  ['ProFormDateTimePicker', ProFormDateTimePicker],
  ['ProFormDateRangePicker', ProFormDateRangePicker],
  ['ProFormDateTimeRangePicker', ProFormDateTimeRangePicker],
  ['ProFormSelect', ProFormSelect],
  ['ProFormSearchSelect', ProFormSearchSelect],
  ['ProFormTreeSelect', ProFormTreeSelect],
  ['ProFormCheckbox', ProFormCheckbox],
  ['ProFormRadioGroup', ProFormRadioGroup],
  ['ProFormSlider', ProFormSlider],
  ['ProFormSwitch', ProFormSwitch],
  ['ProFormUploadButton', ProFormUploadButton],
  ['ProFormUploadDragger', ProFormUploadDragger],
  ['ProFormMoney', ProFormMoney],
  ['ProFormSegmented', ProFormSegmented],
  ['ProFormRadio', ProFormRadio],
  ...Object.entries(additionalFieldComponents),
]

export {
  FieldControl,
  ProFormCaptcha,
  ProFormDateRangePicker,
  ProFormDateTimePicker,
  ProFormDateTimeRangePicker,
  ProFormDigit,
  ProFormField,
  ProFormMoney,
  ProFormRadioGroup,
  ProFormSegmented,
  ProFormSearchSelect,
  ProFormSlider,
  ProFormSwitch,
  ProFormTextArea,
  ProFormTextPassword,
  ProFormTreeSelect,
  ProFormUploadButton,
  ProFormUploadDragger,
  ReadonlyField,
}
export * from './fieldRegistry'
export * from './options'
export * from './readonly'
export type * from './types'
export * from './useFieldOptions'
export * from './additionalFields'
