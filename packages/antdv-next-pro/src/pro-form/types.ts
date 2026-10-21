import type {
  ButtonProps,
  DrawerProps,
  FormItemProps,
  FormProps,
  ModalProps,
  PopoverProps,
  StepsProps,
} from 'antdv-next'
import type { Component, CSSProperties, Ref, VNodeChild } from 'vue'
import type { ProDataIndex } from '../types'
import type { FormRecord } from '../schema-form/utils'
import type { ProFieldValueTypeInput } from '../pro-field/valueType'

export type ProFormFinish<T extends FormRecord = FormRecord> = (
  values: T,
) => boolean | void | Promise<boolean | void>
export type SemanticValue<T, P = object> = T | ((context: { props: P }) => T)
export type FormSemanticPart =
  | 'root'
  | 'form'
  | 'content'
  | 'submitter'
  | 'title'
  | 'actions'
  | 'row'
  | 'item'
  | 'container'
  | 'collapseButton'
  | 'step'
export type FormClasses = Partial<Record<FormSemanticPart, string>>
export type FormStyles = Partial<Record<FormSemanticPart, CSSProperties>>

export interface SubmitterProps {
  searchConfig?: { submitText?: VNodeChild; resetText?: VNodeChild }
  submitText?: VNodeChild
  resetText?: VNodeChild
  submitButtonProps?: Partial<ButtonProps> | false
  resetButtonProps?: Partial<ButtonProps> | false
  render?:
    | false
    | ((
        props: { form: ProFormInstance; submit: () => Promise<FormRecord>; reset: () => void },
        doms: VNodeChild[],
      ) => VNodeChild)
}

export interface ProFormProps<T extends FormRecord = FormRecord> extends Omit<
  FormProps,
  'model' | 'onFinish' | 'onValuesChange' | 'onReset' | 'classes' | 'styles'
> {
  modelValue?: Partial<T>
  initialValues?: Partial<T>
  onFinish?: ProFormFinish<T>
  onValuesChange?: (changedValues: Partial<T>, values: T) => void
  request?: (params?: FormRecord) => Promise<Partial<T>>
  params?: FormRecord
  readonly?: boolean
  submitter?: false | SubmitterProps
  syncToUrl?: boolean | ((values: FormRecord, type: 'get' | 'set') => FormRecord)
  syncToInitialValues?: boolean
  dateFormatter?: 'string' | 'number' | false | ((value: unknown, valueType?: unknown) => unknown)
  prefixCls?: string
  classes?: SemanticValue<FormClasses, ProFormProps<T>>
  classNames?: FormClasses
  styles?: SemanticValue<FormStyles, ProFormProps<T>>
  formRef?: Ref<ProFormInstance | undefined> | ((instance: ProFormInstance | undefined) => void)
}

export interface ProFormInstance<T extends FormRecord = FormRecord> {
  readonly nativeForm?: import('antdv-next').FormInstance
  validate: (names?: ProDataIndex[]) => Promise<T>
  validateFields: (names?: ProDataIndex[]) => Promise<T>
  validateFieldsReturnFormatValue: (names?: ProDataIndex[]) => Promise<T>
  reset: () => void
  resetFields: () => void
  clearValidate: (names?: ProDataIndex[]) => void
  getFieldsValue: (all?: boolean) => T
  getFieldValue: (name: ProDataIndex) => unknown
  getFieldsFormatValue: () => T
  getFieldFormatValue: (name: ProDataIndex) => unknown
  setFieldsValue: (values: Partial<T>) => void
  setFieldValue: (name: ProDataIndex, value: unknown) => void
  submit: () => Promise<T>
  scrollToField: (name: ProDataIndex, options?: ScrollIntoViewOptions) => void
  loading: Readonly<Ref<boolean>>
}

export interface ModalFormProps<T extends FormRecord = FormRecord> extends ProFormProps<T> {
  submitTimeout?: number
  open?: boolean
  title?: VNodeChild
  width?: number | string
  trigger?: VNodeChild
  modalProps?: Partial<ModalProps>
}

export interface DrawerFormProps<T extends FormRecord = FormRecord> extends ProFormProps<T> {
  submitTimeout?: number
  open?: boolean
  title?: VNodeChild
  width?: number | string
  trigger?: VNodeChild
  drawerProps?: Partial<DrawerProps>
}

export interface QueryFilterProps<T extends FormRecord = FormRecord> extends ProFormProps<T> {
  collapsed?: boolean
  defaultCollapsed?: boolean
  defaultColsNumber?: number
  span?: number | Record<string, number>
  labelWidth?: number | 'auto'
  split?: boolean
  searchText?: VNodeChild
  resetText?: VNodeChild
  optionRender?:
    | false
    | ((props: QueryFilterProps<T>, form: ProFormInstance<T>, doms: VNodeChild[]) => VNodeChild)
  collapseRender?: false | ((collapsed: boolean) => VNodeChild)
}

export interface LightFilterProps<T extends FormRecord = FormRecord> extends ProFormProps<T> {
  collapse?: boolean
  collapseLabel?: VNodeChild
  placement?: PopoverProps['placement']
  footerRender?:
    | false
    | ((props: { confirm: () => void; clear: () => void }, doms: VNodeChild[]) => VNodeChild)
}

export interface StepsFormProps<T extends FormRecord = FormRecord> {
  current?: number
  onFinish?: ProFormFinish<T>
  stepsProps?: Partial<StepsProps>
  submitter?: false | SubmitterProps
  formProps?: ProFormProps<T>
  formMapRef?: Ref<Map<string, ProFormInstance>>
  prefixCls?: string
  classes?: SemanticValue<FormClasses, StepsFormProps<T>>
  classNames?: FormClasses
  styles?: SemanticValue<FormStyles, StepsFormProps<T>>
}

export interface StepFormProps<T extends FormRecord = FormRecord> extends ProFormProps<T> {
  name?: string
  title?: VNodeChild
  stepProps?: Record<string, unknown>
}

export interface ProFormGroupProps {
  title?: VNodeChild
  titleStyle?: CSSProperties
  tooltip?: VNodeChild | Record<string, unknown>
  collapsible?: boolean
  collapsed?: boolean
  defaultCollapsed?: boolean
  direction?: 'horizontal' | 'vertical'
  size?: number | 'small' | 'middle' | 'large'
  extra?: VNodeChild
  labelLayout?: 'inline' | 'twoLine'
  prefixCls?: string
  classes?: SemanticValue<FormClasses, ProFormGroupProps>
  classNames?: FormClasses
  styles?: SemanticValue<FormStyles, ProFormGroupProps>
}

export interface FormListFieldData {
  name: number
  key: number
  fieldKey: number
}
export interface FormListActionType<T = FormRecord> {
  add: (defaultValue?: T, insertIndex?: number) => Promise<boolean>
  remove: (index: number | number[]) => Promise<boolean>
  move: (from: number, to: number) => boolean
  copy: (index: number) => Promise<boolean>
  get: (index: number) => T | undefined
  getList: () => T[]
}

export interface ProFormListProps<T extends FormRecord = FormRecord> {
  name: ProDataIndex
  label?: VNodeChild
  initialValue?: T[]
  min?: number
  max?: number
  creatorRecord?: T | (() => T)
  creatorButtonProps?:
    | false
    | (Partial<ButtonProps> & { creatorButtonText?: VNodeChild; position?: 'top' | 'bottom' })
  copyIconProps?: false | { tooltipText?: VNodeChild; Icon?: Component }
  deleteIconProps?: false | { tooltipText?: VNodeChild; Icon?: Component }
  actionGuard?: {
    beforeAddRow?: (
      defaultValue: T,
      insertIndex: number,
      count: number,
    ) => boolean | Promise<boolean>
    beforeRemoveRow?: (index: number | number[], count: number) => boolean | Promise<boolean>
  }
  actionRef?:
    | Ref<FormListActionType<T> | undefined>
    | ((actions: FormListActionType<T> | undefined) => void)
  actionRender?: (
    field: FormListFieldData,
    action: FormListActionType<T>,
    defaultActionDom: VNodeChild[],
    count: number,
  ) => VNodeChild
  itemRender?: (
    dom: { listDom: VNodeChild; action: VNodeChild },
    listMeta: { field: FormListFieldData; index: number; record: T },
  ) => VNodeChild
  rules?: FormItemProps['rules']
  alwaysShowItemLabel?: boolean
  prefixCls?: string
  classes?: SemanticValue<FormClasses, ProFormListProps<T>>
  classNames?: FormClasses
  styles?: SemanticValue<FormStyles, ProFormListProps<T>>
}

export interface ProFormFieldSetProps extends Omit<FormItemProps, 'name'> {
  name?: ProDataIndex
  modelValue?: unknown[]
  initialValue?: unknown[]
  transform?: (value: unknown[], values: FormRecord) => unknown
  convertValue?: (value: unknown) => unknown[]
  type?: 'space' | 'group'
  space?: Record<string, unknown>
}

export interface ProFormDependencyProps {
  name: ProDataIndex[]
  ignoreFormListField?: boolean
}
export interface ProFormItemProps extends Omit<FormItemProps, 'name'> {
  name?: ProDataIndex
  valueType?: ProFieldValueTypeInput
  readonly?: boolean
}
