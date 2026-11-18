import type { ComputedRef, InjectionKey, ShallowRef, VNodeChild } from 'vue'
import type { ProFormInstance, StepsFormProps } from './types'
export interface RegisteredStep {
  id: symbol
  name: () => string
  title: () => VNodeChild
  stepProps: () => Record<string, unknown> | undefined
  form: ProFormInstance
  submit: () => Promise<boolean>
}
export interface StepsContext {
  current: ComputedRef<number>
  forms: ShallowRef<RegisteredStep[]>
  formProps: () => StepsFormProps['formProps']
  register: (entry: RegisteredStep) => () => void
}
export const stepsContextKey: InjectionKey<StepsContext> = Symbol('StepsFormContext')
