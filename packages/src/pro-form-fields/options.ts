import type { ProFormFieldOption, ProFormValueEnum, ProFormValueEnumItem } from './types'

export type ResolvableProFormValueEnum<Value = unknown> =
  | ProFormValueEnum<Value>
  | (() => ProFormValueEnum<Value>)

export interface ResolveLocalFieldOptionsInput<Value = unknown> {
  options?: readonly unknown[]
  fieldOptions?: readonly unknown[]
  valueEnum?: ResolvableProFormValueEnum<Value>
}

export function normalizeFieldOption<Value = unknown>(item: unknown): ProFormFieldOption<Value> {
  if (!isRecord(item)) {
    return {
      label: item as ProFormFieldOption<Value>['label'],
      value: item as Value,
    }
  }

  const value = (item.value ?? item.key ?? item.id) as Value
  const label = (item.label ??
    item.text ??
    item.title ??
    item.name ??
    value) as ProFormFieldOption<Value>['label']

  return {
    ...item,
    label,
    value,
    disabled: Boolean(item.disabled),
  }
}

export function normalizeFieldOptions<Value = unknown>(
  items: readonly unknown[] | undefined,
): Array<ProFormFieldOption<Value>> {
  return items?.map((item) => normalizeFieldOption<Value>(item)) ?? []
}

export function getValueEnumOptions<Value = unknown>(
  valueEnum: ResolvableProFormValueEnum<Value> | undefined,
): Array<ProFormFieldOption<Value>> {
  if (!valueEnum) return []

  const resolved = typeof valueEnum === 'function' ? valueEnum() : valueEnum
  if (resolved instanceof Map) {
    return Array.from(resolved, ([value, item]) => normalizeValueEnumOption(value, item))
  }

  return Object.entries(resolved).map(([key, item]) => {
    const value = typeof item === 'string' ? (key as Value) : (item.value ?? (key as Value))
    return normalizeValueEnumOption(value, item)
  })
}

export function resolveLocalFieldOptions<Value = unknown>({
  options,
  fieldOptions,
  valueEnum,
}: ResolveLocalFieldOptionsInput<Value>): Array<ProFormFieldOption<Value>> {
  if (options !== undefined) return normalizeFieldOptions<Value>(options)
  if (fieldOptions !== undefined) return normalizeFieldOptions<Value>(fieldOptions)
  return getValueEnumOptions(valueEnum)
}

export function stableSerialize(value: unknown): string {
  return serializeStableValue(value, new WeakSet<object>())
}

function normalizeValueEnumOption<Value>(
  value: Value,
  item: string | ProFormValueEnumItem<Value>,
): ProFormFieldOption<Value> {
  if (typeof item === 'string') return { label: item, value }
  return normalizeFieldOption<Value>({ ...item, label: item.text, value })
}

function serializeStableValue(value: unknown, ancestors: WeakSet<object>): string {
  if (value === null) return 'null'

  switch (typeof value) {
    case 'undefined':
      return 'undefined'
    case 'string':
      return JSON.stringify(value)
    case 'number':
      if (Number.isNaN(value)) return 'NaN'
      if (Object.is(value, -0)) return '-0'
      return `${value}`
    case 'bigint':
      return `${value}n`
    case 'boolean':
      return value ? 'true' : 'false'
    case 'symbol':
      return `[Symbol:${value.description ?? ''}]`
    case 'function':
      return `[Function:${value.name}]`
    case 'object':
      break
  }

  if (value instanceof Date) return `[Date:${value.toISOString()}]`
  if (ancestors.has(value)) return '[Circular]'
  ancestors.add(value)

  let serialized: string
  if (Array.isArray(value)) {
    serialized = `[${value.map((item) => serializeStableValue(item, ancestors)).join(',')}]`
  } else if (value instanceof Map) {
    const entries = Array.from(
      value,
      ([key, item]) =>
        [serializeStableValue(key, ancestors), serializeStableValue(item, ancestors)] as const,
    ).sort((left, right) => left[0].localeCompare(right[0]))
    serialized = `[Map:${entries.map(([key, item]) => `${key}:${item}`).join(',')}]`
  } else if (value instanceof Set) {
    const entries = Array.from(value, (item) => serializeStableValue(item, ancestors)).sort()
    serialized = `[Set:${entries.join(',')}]`
  } else {
    const record = value as Record<string, unknown>
    serialized = `{${Object.keys(record)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${serializeStableValue(record[key], ancestors)}`)
      .join(',')}}`
  }

  ancestors.delete(value)
  return serialized
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
