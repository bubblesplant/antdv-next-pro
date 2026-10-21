import type { ProValueType, ProValueTypeDefinitionValue } from '../types'

export type ProFieldValueTypeInput = ProValueType | ProValueTypeDefinitionValue

export const PRO_FIELD_BUILTIN_VALUE_TYPES = [
  'text',
  'password',
  'money',
  'index',
  'indexBorder',
  'option',
  'textarea',
  'date',
  'dateWeek',
  'dateMonth',
  'dateQuarter',
  'dateYear',
  'dateTime',
  'fromNow',
  'dateRange',
  'dateTimeRange',
  'dateWeekRange',
  'dateMonthRange',
  'dateQuarterRange',
  'dateYearRange',
  'time',
  'timeRange',
  'select',
  'checkbox',
  'rate',
  'slider',
  'radio',
  'radioButton',
  'progress',
  'percent',
  'digit',
  'digitRange',
  'second',
  'code',
  'jsonCode',
  'avatar',
  'switch',
  'image',
  'cascader',
  'treeSelect',
  'color',
  'segmented',
] as const

/** Schema containers are resolved by BetaSchemaForm, never by an input fallback. */
export const PRO_FIELD_SCHEMA_LAYOUT_VALUE_TYPES = [
  'group',
  'formList',
  'formSet',
  'divider',
  'dependency',
] as const
export type ProFieldSchemaLayoutValueType = (typeof PRO_FIELD_SCHEMA_LAYOUT_VALUE_TYPES)[number]

export function resolveProFieldValueType(
  valueType: ProFieldValueTypeInput | undefined,
): ProValueTypeDefinitionValue {
  return typeof valueType === 'object' && valueType ? valueType : { type: valueType ?? 'text' }
}

export function normalizeBadgeStatus(
  value: unknown,
): 'success' | 'error' | 'processing' | 'default' | 'warning' | undefined {
  if (typeof value !== 'string') return undefined
  switch (value.toLowerCase()) {
    case 'success':
      return 'success'
    case 'danger':
    case 'error':
      return 'error'
    case 'processing':
      return 'processing'
    case 'default':
      return 'default'
    case 'warning':
      return 'warning'
    default:
      return undefined
  }
}
