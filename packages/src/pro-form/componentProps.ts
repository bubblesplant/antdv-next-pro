import type { PropType } from 'vue'
import type { FormProps, PopoverProps } from 'antdv-next'
import type { ProDataIndex } from '../types'
import type { FormRecord } from '../schema-form/utils'
import type { ProFieldValueTypeInput } from '../pro-field/valueType'
import type {
  FormClasses,
  FormStyles,
  ProFormProps,
  SemanticValue,
  SubmitterProps,
  ProFormFinish,
  StepFormProps,
  StepsFormProps,
  ModalFormProps,
  DrawerFormProps,
  QueryFilterProps,
  LightFilterProps,
  ProFormListProps,
  ProFormDependencyProps,
  ProFormFieldSetProps,
} from './types'
export const proFormProps = {
  name: String,
  modelValue: Object as PropType<FormRecord>,
  initialValues: Object as PropType<FormRecord>,
  onFinish: Function as PropType<ProFormFinish>,
  onValuesChange: Function as PropType<(changed: FormRecord, values: FormRecord) => void>,
  request: Function as PropType<(params?: FormRecord) => Promise<FormRecord>>,
  params: Object as PropType<FormRecord>,
  readonly: Boolean,
  disabled: { type: Boolean, default: undefined },
  submitter: { type: [Object, Boolean] as PropType<false | SubmitterProps>, default: () => ({}) },
  syncToUrl: [Boolean, Function] as PropType<ProFormProps['syncToUrl']>,
  syncToInitialValues: { type: Boolean, default: true },
  dateFormatter: {
    type: [String, Boolean, Function] as PropType<ProFormProps['dateFormatter']>,
    default: 'string',
  },
  prefixCls: String,
  classes: [Object, Function] as PropType<SemanticValue<FormClasses, ProFormProps>>,
  classNames: Object as PropType<FormClasses>,
  styles: [Object, Function] as PropType<SemanticValue<FormStyles, ProFormProps>>,
  formRef: [Object, Function] as PropType<ProFormProps['formRef']>,
  layout: { type: String as PropType<FormProps['layout']>, default: 'vertical' },
}
const semanticProps = {
  prefixCls: String,
  classes: [Object, Function] as PropType<SemanticValue<FormClasses>>,
  classNames: Object as PropType<FormClasses>,
  styles: [Object, Function] as PropType<SemanticValue<FormStyles>>,
}
export const stepFormProps = {
  ...proFormProps,
  name: String,
  title: null,
  stepProps: Object as PropType<StepFormProps['stepProps']>,
} as const
export const stepsFormProps = {
  current: { type: Number, default: undefined },
  onFinish: Function as PropType<ProFormFinish>,
  stepsProps: Object as PropType<StepsFormProps['stepsProps']>,
  submitter: {
    type: [Object, Boolean] as PropType<StepsFormProps['submitter']>,
    default: () => ({}),
  },
  formProps: Object as PropType<StepsFormProps['formProps']>,
  formMapRef: Object as PropType<StepsFormProps['formMapRef']>,
  prefixCls: String,
  classes: [Object, Function] as PropType<StepsFormProps['classes']>,
  classNames: Object as PropType<StepsFormProps['classNames']>,
  styles: [Object, Function] as PropType<StepsFormProps['styles']>,
} as const
export const proFormGroupProps = {
  ...semanticProps,
  title: null,
  titleStyle: Object,
  tooltip: null,
  extra: null,
  collapsible: Boolean,
  collapsed: { type: Boolean, default: undefined },
  defaultCollapsed: Boolean,
  direction: { type: String, default: 'horizontal' },
  size: { type: [Number, String] as PropType<number | string>, default: 32 },
  labelLayout: String,
} as const
export const listRowScopeProps = {
  path: { type: Array as PropType<Array<string | number>>, required: true },
  index: { type: Number, required: true },
  rowKey: { type: Number, required: true },
} as const
export const proFormListProps = {
  ...semanticProps,
  name: { type: [String, Number, Array] as PropType<ProDataIndex>, required: true },
  label: null,
  initialValue: Array as PropType<FormRecord[]>,
  min: { type: Number, default: 0 },
  max: Number,
  creatorRecord: [Object, Function] as PropType<ProFormListProps['creatorRecord']>,
  creatorButtonProps: {
    type: [Object, Boolean] as PropType<ProFormListProps['creatorButtonProps']>,
    default: undefined,
  },
  copyIconProps: {
    type: [Object, Boolean] as PropType<ProFormListProps['copyIconProps']>,
    default: undefined,
  },
  deleteIconProps: {
    type: [Object, Boolean] as PropType<ProFormListProps['deleteIconProps']>,
    default: undefined,
  },
  actionGuard: Object as PropType<ProFormListProps['actionGuard']>,
  actionRef: [Object, Function] as PropType<ProFormListProps['actionRef']>,
  actionRender: Function as PropType<ProFormListProps['actionRender']>,
  itemRender: Function as PropType<ProFormListProps['itemRender']>,
  rules: [Object, Array] as PropType<ProFormListProps['rules']>,
  alwaysShowItemLabel: { type: Boolean, default: undefined },
} as const
export const proFormDependencyProps = {
  name: { type: Array as PropType<ProFormDependencyProps['name']>, required: true },
  ignoreFormListField: Boolean,
} as const
export const proFormFieldSetProps = {
  name: [String, Number, Array] as PropType<ProDataIndex>,
  modelValue: Array as PropType<unknown[]>,
  initialValue: Array as PropType<unknown[]>,
  transform: Function as PropType<ProFormFieldSetProps['transform']>,
  convertValue: Function as PropType<ProFormFieldSetProps['convertValue']>,
  type: { type: String, default: 'space' },
  space: Object,
} as const
export const proFormItemProps = {
  name: [String, Number, Array] as PropType<ProDataIndex>,
  readonly: { type: Boolean, default: undefined },
  valueType: [String, Object] as PropType<ProFieldValueTypeInput>,
} as const
export const modalFormProps = {
  ...proFormProps,
  open: { type: Boolean, default: undefined },
  title: null,
  width: [Number, String] as PropType<number | string>,
  trigger: null,
  modalProps: Object as PropType<ModalFormProps['modalProps']>,
  drawerProps: Object as PropType<DrawerFormProps['drawerProps']>,
  submitTimeout: Number,
} as const
export const drawerFormProps = {
  ...proFormProps,
  open: { type: Boolean, default: undefined },
  title: null,
  width: [Number, String] as PropType<number | string>,
  trigger: null,
  modalProps: Object as PropType<ModalFormProps['modalProps']>,
  drawerProps: Object as PropType<DrawerFormProps['drawerProps']>,
  submitTimeout: Number,
} as const
export const queryFilterProps = {
  ...proFormProps,
  layout: { ...proFormProps.layout, default: 'horizontal' },
  collapsed: { type: Boolean, default: undefined },
  defaultCollapsed: { type: Boolean, default: true },
  defaultColsNumber: { type: Number, default: 3 },
  span: [Number, Object] as PropType<QueryFilterProps['span']>,
  labelWidth: { type: [Number, String] as PropType<QueryFilterProps['labelWidth']>, default: 80 },
  split: Boolean,
  searchText: null,
  resetText: null,
  optionRender: {
    type: [Boolean, Function] as PropType<QueryFilterProps['optionRender']>,
    default: undefined,
  },
  collapseRender: {
    type: [Boolean, Function] as PropType<QueryFilterProps['collapseRender']>,
    default: undefined,
  },
} as const
export const lightWrapperProps = {
  name: [String, Number, Array] as PropType<ProDataIndex>,
  label: null,
  disabled: Boolean,
  placement: { type: String as PropType<PopoverProps['placement']>, default: 'bottomLeft' },
  fieldNames: Array as PropType<ProDataIndex[]>,
  footerRender: {
    type: [Boolean, Function] as PropType<LightFilterProps['footerRender']>,
    default: undefined,
  },
  open: { type: Boolean, default: undefined },
} as const
export const lightFilterProps = {
  ...proFormProps,
  collapse: Boolean,
  collapseLabel: null,
  placement: { type: String as PropType<PopoverProps['placement']>, default: 'bottomLeft' },
  footerRender: {
    type: [Boolean, Function] as PropType<LightFilterProps['footerRender']>,
    default: undefined,
  },
} as const
