import type { ComputedRef, InjectionKey, Ref } from 'vue'
import { computed, inject } from 'vue'
import type { FormRecord } from '../schema-form/utils'
import { normalizePath } from '../schema-form/utils'
import type { ProDataIndex } from '../types'

export type FormNamePath = Array<string | number>

export interface RegisteredFormField {
  path: () => FormNamePath
  convertValue?: (value: unknown, values: FormRecord) => unknown
  transform?: (value: unknown, values: FormRecord) => unknown
  valueType?: () => unknown
  preserve?: boolean
}

export interface ProFormContextValue {
  model: FormRecord
  readonly: Ref<boolean>
  disabled: Ref<boolean>
  getFieldValue: (name: ProDataIndex) => unknown
  setFieldValue: (name: ProDataIndex, value: unknown) => void
  setFieldsValue: (values: FormRecord) => void
  getFieldsValue: () => FormRecord
  validateFields: (names?: ProDataIndex[]) => Promise<FormRecord>
  clearValidate: (names?: ProDataIndex[]) => void
  registerField: (field: RegisteredFormField) => () => void
  submit: () => Promise<FormRecord>
}

export interface ProFormListContextValue {
  index: Ref<number>
  key: number
  listName: ComputedRef<FormNamePath>
}

export const proFormContextKey: InjectionKey<ProFormContextValue> = Symbol('ProFormContext')
export const proFormNamePathKey: InjectionKey<Ref<FormNamePath>> = Symbol('ProFormNamePath')
export const proFormListContextKey: InjectionKey<ProFormListContextValue> =
  Symbol('ProFormListContext')

export function useProFormContext(): ProFormContextValue | undefined {
  return inject(proFormContextKey, undefined)
}

export function useProFormNamePath(
  name: () => ProDataIndex | undefined,
): ComputedRef<FormNamePath> {
  const prefix = inject(
    proFormNamePathKey,
    computed<FormNamePath>(() => []),
  )
  return computed(() => [...prefix.value, ...normalizePath(name())])
}

export function useProFormListContext(): ProFormListContextValue | undefined {
  return inject(proFormListContextKey, undefined)
}
