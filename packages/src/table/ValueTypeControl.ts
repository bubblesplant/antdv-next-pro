import type { VNodeChild } from 'vue'

import {
  normalizeFieldOption as normalizeProFieldOption,
  resolveLocalFieldOptions,
} from '../pro-form-fields/options'
import { formatReadonlyValue } from '../pro-form-fields/readonly'
import type { ProFormFieldOption } from '../pro-form-fields/types'
import type { ProValueEnum, ProValueType } from '../types'
import ValueTypeControlComponent from './ValueTypeControl.vue'

export type ProFieldOption = ProFormFieldOption

export interface ProFieldOptionSource {
  valueType?: ProValueType
  valueEnum?: ProValueEnum | (() => ProValueEnum)
}

export const ValueTypeControl = ValueTypeControlComponent

export function resolveFieldOptions(
  column: ProFieldOptionSource,
  remoteOptions: ProFieldOption[] | undefined,
  fieldProps: Record<string, unknown>,
): ProFieldOption[] {
  if (remoteOptions !== undefined) return remoteOptions
  const fieldOptions = column.valueType === 'treeSelect' ? fieldProps.treeData : fieldProps.options
  return resolveLocalFieldOptions({
    fieldOptions: Array.isArray(fieldOptions) ? fieldOptions : undefined,
    valueEnum: column.valueEnum,
  })
}

export function normalizeFieldOption(item: unknown): ProFieldOption {
  return normalizeProFieldOption(item)
}

export function formatProValue(
  value: unknown,
  options: ProFieldOption[],
  type: ProValueType | undefined,
): VNodeChild {
  return formatReadonlyValue(value, { options, type })
}
