import type { VNodeChild } from 'vue'
import type {
  ProFieldRenderContext,
  ProSemanticClasses,
  ProSemanticSource,
  ProSemanticStyles,
  ProValueTypeMap,
} from '../provider/types'
import type {
  ProFormFieldOption,
  ProFormFieldRequest,
  ProFormValueEnum,
} from '../pro-form-fields/types'
import type { ProFieldValueTypeInput } from './valueType'
import type { ProValueType } from '../types'
import type { FieldMoneyOptions } from './money'

export interface ProFieldProps {
  text?: unknown
  modelValue?: unknown
  value?: unknown
  readonly?: boolean
  valueType?: ProFieldValueTypeInput
  mode?: 'read' | 'edit' | 'update'
  formItemRender?: (text: unknown, context: ProFieldRenderContext, dom: VNodeChild) => VNodeChild
  fieldProps?: Record<string, unknown>
  valueEnum?: ProFormValueEnum
  options?: ProFormFieldOption[]
  request?: ProFormFieldRequest
  params?: Record<string, unknown>
  debounceTime?: number
  proFieldKey?: string
  cacheForSwr?: boolean
  onRequestError?: (error: unknown) => void
  emptyText?: VNodeChild
  render?: (text: unknown, context: ProFieldRenderContext, dom: VNodeChild) => VNodeChild
  renderFormItem?: (text: unknown, context: ProFieldRenderContext, dom: VNodeChild) => VNodeChild
  copyable?: boolean | Record<string, unknown>
  ellipsis?: boolean | Record<string, unknown>
  prefixCls?: string
  classes?: ProSemanticSource<ProSemanticClasses, ProFieldProps>
  classNames?: ProSemanticSource<ProSemanticClasses, ProFieldProps>
  styles?: ProSemanticSource<ProSemanticStyles, ProFieldProps>
}

export interface FieldMoneyProps extends ProFieldProps, FieldMoneyOptions {}
export type ProFieldMoneyProps = FieldMoneyProps
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
