import type {
  DescriptionsProps,
  DescriptionsItemProps as NativeDescriptionsItemProps,
  FormInstance,
  FormProps,
  TooltipProps,
} from 'antdv-next'
import type { Ref, VNodeChild } from 'vue'
import type { ProColumns, EditableConfig, ProKey, ProDataIndex } from '../types'
import type { ProSemanticClasses, ProSemanticSource, ProSemanticStyles } from '../provider/types'

export interface ProDescriptionsInstance<
  T extends Record<string, unknown> = Record<string, unknown>,
> {
  reload: () => Promise<void>
  getData: () => T
  readonly dataSource: T | undefined
  setDataSource: (data: T | undefined) => void
  startEditable: (key: ProKey) => boolean
  saveEditable: (key: ProKey) => Promise<boolean>
  cancelEditable: (key: ProKey) => void
  isEditable: (key: ProKey) => boolean
}
export interface ProDescriptionsRenderContext<T extends Record<string, unknown>> {
  record: T
  index: number
  column: ProDescriptionsColumn<T>
  editable: boolean
  isEditable: boolean
  recordKey?: ProDataIndex
  type: 'descriptions'
  dependencies?: unknown[]
  defaultRender: () => VNodeChild
  update: (value: unknown) => void
}
export interface ProDescriptionsColumn<
  T extends Record<string, unknown> = Record<string, unknown>,
> extends Omit<
  ProColumns<T>,
  'render' | 'renderText' | 'title' | 'formItemRender' | 'renderFormItem'
> {
  title?: VNodeChild | ((column: ProDescriptionsColumn<T>) => VNodeChild)
  label?: VNodeChild
  renderText?: (
    value: unknown,
    record: T,
    index: number,
    action: ProDescriptionsInstance<T>,
  ) => unknown
  span?: NativeDescriptionsItemProps['span']
  hideInDescriptions?: boolean
  hide?: boolean
  plain?: boolean
  mode?: 'read' | 'edit' | 'update'
  render?: (
    dom: VNodeChild,
    record: T,
    index: number,
    action: ProDescriptionsInstance<T>,
    schema: ProDescriptionsColumn<T>,
  ) => VNodeChild
  formItemRender?: (
    schema: ProDescriptionsColumn<T>,
    context: ProDescriptionsRenderContext<T>,
    form: FormInstance | undefined,
  ) => VNodeChild
  renderFormItem?: (
    schema: ProDescriptionsColumn<T>,
    context: ProDescriptionsRenderContext<T>,
  ) => VNodeChild
}
export interface ProDescriptionsRequestResult<T> {
  data: T
  success?: boolean
}
export interface ProDescriptionsProps<
  T extends Record<string, unknown> = Record<string, unknown>,
  P extends Record<string, unknown> = Record<string, unknown>,
> extends Omit<
  DescriptionsProps,
  'items' | 'title' | 'extra' | 'prefixCls' | 'classes' | 'styles'
> {
  prefixCls?: string
  title?: VNodeChild
  tooltip?: string | TooltipProps
  extra?: VNodeChild
  columns?: ProDescriptionsColumn<T>[]
  dataSource?: T
  request?: (params: P) => Promise<ProDescriptionsRequestResult<T>>
  params?: P
  loading?: boolean
  editable?: false | EditableConfig<T>
  formProps?: FormProps
  actionRef?: Ref<ProDescriptionsInstance<T> | undefined>
  formRef?: Ref<FormInstance | undefined>
  emptyText?: VNodeChild
  classes?: ProSemanticSource<ProSemanticClasses, ProDescriptionsProps<T, P>>
  classNames?: ProSemanticSource<ProSemanticClasses, ProDescriptionsProps<T, P>>
  styles?: ProSemanticSource<ProSemanticStyles, ProDescriptionsProps<T, P>>
  onLoadingChange?: (loading: boolean) => void
  onRequestError?: (error: unknown) => void
  onDataSourceChange?: (data: T) => void
  onEditableError?: (error: unknown) => void
}
export type ProDescriptionsItemProps<T extends Record<string, unknown> = Record<string, unknown>> =
  ProDescriptionsColumn<T>
export type DescriptionsItemProps = NativeDescriptionsItemProps
export type ProDescriptionsActionType<T extends Record<string, unknown> = Record<string, unknown>> =
  ProDescriptionsInstance<T>
export interface FieldRenderProps<T extends Record<string, unknown> = Record<string, unknown>> {
  dataIndex?: ProDataIndex
  title?: ProDescriptionsColumn<T>['title']
  label?: VNodeChild
  valueType?: ProDescriptionsColumn<T>['valueType']
  valueEnum?: ProDescriptionsColumn<T>['valueEnum']
  request?: ProDescriptionsColumn<T>['request']
  onFieldRequestError?: (error: unknown) => void
  params?: Record<string, unknown>
  dependencies?: ProDataIndex[]
  fieldProps?: ProDescriptionsColumn<T>['fieldProps']
  formItemProps?: ProDescriptionsColumn<T>['formItemProps']
  renderText?: ProDescriptionsColumn<T>['renderText']
  render?: ProDescriptionsColumn<T>['render']
  formItemRender?: ProDescriptionsColumn<T>['formItemRender']
  renderFormItem?: ProDescriptionsColumn<T>['renderFormItem']
  copyable?: boolean
  ellipsis?: ProDescriptionsColumn<T>['ellipsis']
  mode?: 'read' | 'edit' | 'update'
  text?: unknown
  entity: T
  action: ProDescriptionsInstance<T>
  index?: number
  emptyText?: VNodeChild
  form?: FormInstance
}
