import type { Component } from 'vue'

import {
  Checkbox,
  CheckboxGroup,
  Cascader,
  ColorPicker,
  Rate,
  Radio,
  DatePicker,
  DateRangePicker,
  Input,
  InputNumber,
  InputPassword,
  RadioGroup,
  Segmented,
  Select,
  Slider,
  Switch,
  TextArea,
  TimePicker,
  TimeRangePicker,
  TreeSelect,
  Upload,
  UploadDragger,
} from 'antdv-next'

import type { ProValueType } from '../types'
import DigitRange from './DigitRange'

export type ProFormControlType =
  | ProValueType
  | 'captcha'
  | 'uploadButton'
  | 'uploadDragger'
  | 'radioGroup'
  | 'checkboxGroup'

export interface ProFormFieldDescriptor {
  component: Component
  valueProp: 'value' | 'checked' | 'fileList'
  optionProp?: 'options' | 'treeData'
  readonlyType?: ProValueType | 'upload'
}

const valueDescriptors: Partial<Record<ProFormControlType, ProFormFieldDescriptor>> = {
  text: { component: Input as Component, valueProp: 'value', readonlyType: 'text' },
  cascader: {
    component: Cascader as Component,
    valueProp: 'value',
    optionProp: 'options',
    readonlyType: 'cascader',
  },
  color: { component: ColorPicker as Component, valueProp: 'value', readonlyType: 'color' },
  colorPicker: { component: ColorPicker as Component, valueProp: 'value', readonlyType: 'color' },
  rate: { component: Rate as Component, valueProp: 'value', readonlyType: 'rate' },
  progress: { component: InputNumber as Component, valueProp: 'value', readonlyType: 'progress' },
  second: { component: InputNumber as Component, valueProp: 'value', readonlyType: 'second' },
  code: { component: TextArea as Component, valueProp: 'value', readonlyType: 'code' },
  jsonCode: { component: TextArea as Component, valueProp: 'value', readonlyType: 'jsonCode' },
  image: { component: Input as Component, valueProp: 'value', readonlyType: 'image' },
  fromNow: { component: DatePicker as Component, valueProp: 'value', readonlyType: 'fromNow' },
  digitRange: { component: DigitRange, valueProp: 'value', readonlyType: 'digitRange' },
  textarea: { component: TextArea as Component, valueProp: 'value', readonlyType: 'textarea' },
  password: {
    component: InputPassword as Component,
    valueProp: 'value',
    readonlyType: 'password',
  },
  digit: { component: InputNumber as Component, valueProp: 'value', readonlyType: 'digit' },
  money: { component: InputNumber as Component, valueProp: 'value', readonlyType: 'money' },
  percent: { component: InputNumber as Component, valueProp: 'value', readonlyType: 'percent' },
  select: {
    component: Select as Component,
    valueProp: 'value',
    optionProp: 'options',
    readonlyType: 'select',
  },
  treeSelect: {
    component: TreeSelect as Component,
    valueProp: 'value',
    optionProp: 'treeData',
    readonlyType: 'treeSelect',
  },
  radioGroup: {
    component: RadioGroup as Component,
    valueProp: 'value',
    optionProp: 'options',
    readonlyType: 'radio',
  },
  switch: { component: Switch as Component, valueProp: 'checked', readonlyType: 'switch' },
  slider: { component: Slider as Component, valueProp: 'value', readonlyType: 'slider' },
  segmented: {
    component: Segmented as Component,
    valueProp: 'value',
    optionProp: 'options',
    readonlyType: 'segmented',
  },
  date: { component: DatePicker as Component, valueProp: 'value', readonlyType: 'date' },
  dateTime: {
    component: DatePicker as Component,
    valueProp: 'value',
    readonlyType: 'dateTime',
  },
  dateRange: {
    component: DateRangePicker as Component,
    valueProp: 'value',
    readonlyType: 'dateRange',
  },
  dateTimeRange: {
    component: DateRangePicker as Component,
    valueProp: 'value',
    readonlyType: 'dateTimeRange',
  },
  time: { component: TimePicker as Component, valueProp: 'value', readonlyType: 'time' },
  timeRange: {
    component: TimeRangePicker as Component,
    valueProp: 'value',
    readonlyType: 'timeRange',
  },
  captcha: { component: Input as Component, valueProp: 'value', readonlyType: 'text' },
  uploadButton: {
    component: Upload as Component,
    valueProp: 'fileList',
    readonlyType: 'upload',
  },
  uploadDragger: {
    component: UploadDragger as Component,
    valueProp: 'fileList',
    readonlyType: 'upload',
  },
}

for (const picker of ['Week', 'Month', 'Quarter', 'Year']) {
  valueDescriptors[`date${picker}`] = {
    component: DatePicker as Component,
    valueProp: 'value',
    readonlyType: `date${picker}`,
  }
  valueDescriptors[`date${picker}Range`] = {
    component: DateRangePicker as Component,
    valueProp: 'value',
    readonlyType: `date${picker}Range`,
  }
}
valueDescriptors.radioButton = valueDescriptors.radioGroup

const checkboxDescriptor: ProFormFieldDescriptor = {
  component: Checkbox as Component,
  valueProp: 'checked',
  readonlyType: 'checkbox',
}

const checkboxGroupDescriptor: ProFormFieldDescriptor = {
  component: CheckboxGroup as Component,
  valueProp: 'value',
  optionProp: 'options',
  readonlyType: 'checkbox',
}

const fallbackDescriptor = valueDescriptors.text as ProFormFieldDescriptor

export const fieldRegistry = Object.freeze(valueDescriptors)

export function resolveFieldDescriptor(
  fieldType: ProFormControlType | undefined,
  hasOptions = false,
): ProFormFieldDescriptor {
  if (fieldType === 'checkbox') return hasOptions ? checkboxGroupDescriptor : checkboxDescriptor
  if (fieldType === 'checkboxGroup') return checkboxGroupDescriptor
  if (fieldType === 'radio')
    return hasOptions
      ? valueDescriptors.radioGroup!
      : { component: Radio as Component, valueProp: 'checked', readonlyType: 'radio' }
  return valueDescriptors[fieldType ?? 'text'] ?? fallbackDescriptor
}

export function hasExplicitProp(
  rawProps: Record<string, unknown> | null | undefined,
  name: string,
): boolean {
  if (!rawProps) return false
  return Object.hasOwn(rawProps, name) || Object.hasOwn(rawProps, hyphenate(name))
}

export function pickExplicitProps<T extends object>(
  props: T,
  rawProps: Record<string, unknown> | null | undefined,
): Partial<T> {
  const result: Partial<T> = {}
  for (const key of Object.keys(props) as Array<keyof T & string>) {
    if (hasExplicitProp(rawProps, key)) result[key] = props[key]
  }
  return result
}

function hyphenate(value: string): string {
  return value.replace(/\B([A-Z])/g, '-$1').toLowerCase()
}
