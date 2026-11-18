import type { InjectionKey } from 'vue'
import type { ProFormInstance } from './types'
import type { FormRecord } from '../schema-form/utils'

export interface FormProviderContext {
  register: (name: string, form: ProFormInstance) => () => void
  change: (name: string, changedValues: FormRecord) => void
  finish: (name: string, values: FormRecord) => void
}

export const formProviderKey: InjectionKey<FormProviderContext> = Symbol('ProFormProvider')
