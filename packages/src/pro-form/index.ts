import ProFormComponent from './ProForm'
import {
  ProFormDependency,
  ProFormFieldSet,
  ProFormGroup,
  ProFormItem,
  ProFormList,
} from './structure'
import ProFormErrorList from 'antdv-next/dist/form/ErrorList'
import { ProFormProvider, useForm, useFormInstance, useWatch } from './hooks'
import type { DefineComponent } from 'vue'
import type { ProFormInstance, ProFormProps } from './types'

type PublicProForm = DefineComponent<ProFormProps<any>, ProFormInstance<any>>

export const ProForm = Object.assign(ProFormComponent as unknown as PublicProForm, {
  Group: ProFormGroup,
  FieldSet: ProFormFieldSet,
  List: ProFormList,
  Dependency: ProFormDependency,
  Item: ProFormItem,
  ErrorList: ProFormErrorList,
  Provider: ProFormProvider,
  useForm,
  useFormInstance,
  useWatch,
})

export {
  ProFormDependency,
  ProFormFieldSet,
  ProFormGroup,
  ProFormItem,
  ProFormList,
  ProFormErrorList,
  ProFormProvider,
  useForm,
  useFormInstance,
  useWatch,
}
export { LightWrapper } from './layouts'
export type * from './types'
