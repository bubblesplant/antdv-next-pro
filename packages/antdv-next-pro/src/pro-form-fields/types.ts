import type {
  ButtonProps,
  CascaderProps,
  ColorPickerProps,
  RateProps,
  TimePickerProps,
  CheckboxGroupProps,
  CheckboxProps,
  DatePickerProps,
  FormItemProps,
  InputNumberProps,
  InputPasswordProps,
  InputProps,
  ImageProps,
  RangePickerProps,
  RadioGroupProps,
  RadioProps,
  SegmentedProps,
  SelectProps,
  SliderProps,
  SwitchProps,
  TextAreaProps,
  TreeSelectProps,
  UploadDraggerProps,
  UploadFile,
  UploadProps,
} from 'antdv-next'
import type { VNodeChild } from 'vue'

import type { ProDataIndex, ProValueEnumItem } from '../types'
import type { ProFieldValueTypeInput } from '../pro-field/valueType'
import type { FieldMoneyOptions } from '../pro-field/money'
import type { ProSemanticClasses, ProSemanticStyles, ProSemanticSource } from '../provider/types'

export type ProFormFieldMode = 'form-item' | 'field'
export type ProFormFieldName = ProDataIndex
export type ProFormFieldValue = unknown

export type ProFormOptionValue<ModelValue> = ModelValue extends null | undefined
  ? never
  : ModelValue extends readonly (infer OptionValue)[]
    ? OptionValue
    : ModelValue

export interface ProFormFieldOption<Value = unknown> {
  label: VNodeChild
  value: Value
  disabled?: boolean
  [key: string]: unknown
}

export interface ProFormValueEnumItem<Value = unknown> extends ProValueEnumItem<Value> {
  value?: Value
}

export type ProFormValueEnum<Value = unknown> =
  | Record<string | number, string | ProFormValueEnumItem<Value>>
  | ReadonlyMap<Value, string | ProFormValueEnumItem<Value>>

export type ProFormFieldRequest<
  OptionValue = unknown,
  Params extends Record<string, unknown> = Record<string, unknown>,
> = (
  params?: Params,
) => Promise<Array<ProFormFieldOption<OptionValue> | Record<string, unknown> | OptionValue>>

export interface ProFormBaseFieldProps<
  Value = unknown,
  FieldProps extends object = Record<string, unknown>,
> {
  modelValue?: Value
  name?: ProFormFieldName
  label?: VNodeChild
  rules?: FormItemProps['rules']
  fieldMode?: ProFormFieldMode
  fieldProps?: Partial<FieldProps>
  formItemProps?: Partial<FormItemProps>
  disabled?: boolean
  readonly?: boolean
  emptyText?: VNodeChild
  readonlyRender?: (value: Value) => VNodeChild
  width?: number | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  ignoreFormItem?: boolean
  placeholder?: FieldProps extends { placeholder?: infer P } ? P : string | string[]
  prefixCls?: string
  classes?: ProSemanticSource<ProSemanticClasses>
  classNames?: ProSemanticSource<ProSemanticClasses>
  styles?: ProSemanticSource<ProSemanticStyles>
  convertValue?: (value: unknown, values: Record<string, unknown>) => unknown
  transform?: (value: unknown, values: Record<string, unknown>) => unknown
  preserve?: boolean
  proFieldProps?: Record<string, unknown>
}

export interface ProFormOptionFieldProps<
  OptionValue = unknown,
  Params extends Record<string, unknown> = Record<string, unknown>,
> {
  options?: Array<ProFormFieldOption<OptionValue>>
  valueEnum?: ProFormValueEnum<OptionValue>
  request?: ProFormFieldRequest<OptionValue, Params>
  params?: Params
  debounceTime?: number
  proFieldKey?: string
  cacheForSwr?: boolean
  searchValue?: string
}

export interface ProFormFieldProps<
  ModelValue = unknown,
  OptionValue = ProFormOptionValue<ModelValue>,
  FieldProps extends object = Record<string, unknown>,
  Params extends Record<string, unknown> = Record<string, unknown>,
>
  extends
    ProFormBaseFieldProps<ModelValue, FieldProps>,
    ProFormOptionFieldProps<OptionValue, Params> {
  valueType?: ProFieldValueTypeInput
}

export type ProFormTextProps = ProFormBaseFieldProps<string | undefined, InputProps>

export type ProFormTextPasswordProps = ProFormBaseFieldProps<string | undefined, InputPasswordProps>

export type ProFormTextAreaProps = ProFormBaseFieldProps<string | undefined, TextAreaProps>

export interface ProFormDigitProps extends ProFormBaseFieldProps<
  number | string | null,
  InputNumberProps
> {
  precision?: InputNumberProps['precision'] | false
  min?: InputNumberProps['min'] | false
}

export interface ProFormMoneyProps
  extends
    FieldMoneyOptions,
    ProFormBaseFieldProps<number | string | null, InputNumberProps & FieldMoneyOptions> {
  prefix?: InputNumberProps['prefix'] | false
}

export type ProFormDateValue = DatePickerProps['value']
export type ProFormDateRangeValue = RangePickerProps['value']

export type ProFormDatePickerProps = ProFormBaseFieldProps<ProFormDateValue, DatePickerProps>

export interface ProFormDateTimePickerProps extends ProFormBaseFieldProps<
  ProFormDateValue,
  DatePickerProps
> {
  showTime?: DatePickerProps['showTime']
}

export type ProFormDateRangePickerProps = ProFormBaseFieldProps<
  ProFormDateRangeValue,
  RangePickerProps
>

export interface ProFormDateTimeRangePickerProps extends ProFormBaseFieldProps<
  ProFormDateRangeValue,
  RangePickerProps
> {
  showTime?: RangePickerProps['showTime']
}

export interface ProFormSelectProps<
  ModelValue = SelectProps['value'],
  OptionValue = ProFormOptionValue<ModelValue>,
  Params extends Record<string, unknown> = Record<string, unknown>,
>
  extends
    ProFormBaseFieldProps<ModelValue, SelectProps>,
    ProFormOptionFieldProps<OptionValue, Params> {}

export interface ProFormSearchSelectProps extends ProFormSelectProps {
  mode?: 'multiple' | 'tags' | 'single'
}

export interface ProFormTreeSelectProps<
  ModelValue = TreeSelectProps['value'],
  OptionValue = ProFormOptionValue<ModelValue>,
  Params extends Record<string, unknown> = Record<string, unknown>,
>
  extends
    ProFormBaseFieldProps<ModelValue, TreeSelectProps>,
    ProFormOptionFieldProps<OptionValue, Params> {}

export type ProFormCheckboxValue = CheckboxProps['checked'] | CheckboxGroupProps['value']

export interface ProFormCheckboxProps<
  ModelValue = ProFormCheckboxValue,
  OptionValue = ProFormOptionValue<ModelValue>,
  Params extends Record<string, unknown> = Record<string, unknown>,
>
  extends
    ProFormBaseFieldProps<ModelValue, CheckboxProps | CheckboxGroupProps>,
    Omit<ProFormOptionFieldProps<OptionValue, Params>, 'options'> {
  options?: CheckboxGroupProps['options'] | Array<ProFormFieldOption<OptionValue>>
  layout?: 'horizontal' | 'vertical'
}

export interface ProFormRadioGroupProps<
  ModelValue = RadioGroupProps['value'],
  OptionValue = ProFormOptionValue<ModelValue>,
  Params extends Record<string, unknown> = Record<string, unknown>,
>
  extends
    ProFormBaseFieldProps<ModelValue, RadioGroupProps>,
    Omit<ProFormOptionFieldProps<OptionValue, Params>, 'options'> {
  options?: RadioGroupProps['options'] | Array<ProFormFieldOption<OptionValue>>
  radioType?: 'button' | 'radio'
  layout?: 'horizontal' | 'vertical'
}

export type ProFormSliderProps = ProFormBaseFieldProps<number | number[] | undefined, SliderProps>

export type ProFormSwitchProps = ProFormBaseFieldProps<SwitchProps['checked'], SwitchProps>

export interface ProFormUploadButtonProps extends ProFormBaseFieldProps<UploadFile[], UploadProps> {
  icon?: VNodeChild
  title?: VNodeChild
  max?: number
  buttonProps?: Partial<ButtonProps>
  action?: UploadProps['action']
  accept?: UploadProps['accept']
  listType?: UploadProps['listType']
  imageProps?: Omit<ImageProps, 'src'>
}

export interface ProFormUploadDraggerProps extends ProFormBaseFieldProps<
  UploadFile[],
  UploadDraggerProps
> {
  icon?: VNodeChild
  title?: VNodeChild
  description?: VNodeChild
  max?: number
  action?: UploadProps['action']
  accept?: UploadProps['accept']
}

export interface ProFormSegmentedProps<
  ModelValue = SegmentedProps['value'],
  OptionValue = ProFormOptionValue<ModelValue>,
  Params extends Record<string, unknown> = Record<string, unknown>,
>
  extends
    ProFormBaseFieldProps<ModelValue, SegmentedProps>,
    ProFormOptionFieldProps<OptionValue, Params> {}

export interface ProFormCaptchaProps extends ProFormBaseFieldProps<string | undefined, InputProps> {
  onGetCaptcha: (phone: string) => void | boolean | Promise<void | boolean>
  phoneName?: ProDataIndex
  captchaTextRender?: (timing: boolean, count: number) => VNodeChild
  captchaProps?: Partial<ButtonProps>
  onTiming?: (count: number) => void
  countDown?: number
  captchaText?: VNodeChild
  countDownText?: (seconds: number) => VNodeChild
  buttonProps?: Partial<ButtonProps>
}

export interface ProFormCaptchaInstance {
  resetCountdown: () => void
  startTiming: () => void
  endTiming: () => void
  focus: () => void
}

export type ProFormCascaderProps = ProFormBaseFieldProps<CascaderProps['value'], CascaderProps> &
  ProFormOptionFieldProps
export type ProFormColorPickerProps = ProFormBaseFieldProps<
  ColorPickerProps['value'],
  ColorPickerProps
>
export type ProFormRateProps = ProFormBaseFieldProps<RateProps['value'], RateProps>
export type ProFormDigitRangeProps = ProFormBaseFieldProps<
  [number | null, number | null],
  InputNumberProps
>
export type ProFormTimePickerProps = ProFormBaseFieldProps<
  TimePickerProps['value'],
  TimePickerProps
>
export type ProFormTimeRangePickerProps = ProFormBaseFieldProps<
  RangePickerProps['value'],
  RangePickerProps
>
export type ProFormRadioProps = ProFormBaseFieldProps<RadioProps['checked'], RadioProps>
export type ProFormCheckboxGroupProps = ProFormCheckboxProps
