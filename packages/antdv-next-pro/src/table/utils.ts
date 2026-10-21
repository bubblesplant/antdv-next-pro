import type {
  ProColumns,
  ProColumnsState,
  ProColumnsStateConfig,
  ProDataIndex,
  ProFilter,
  ProKey,
  ProSort,
  ProValueEnum,
  ProValueEnumItem,
} from '../types'

export const DEFAULT_ROW_KEY = 'id'

export function toPath(dataIndex?: ProDataIndex): ProKey[] {
  if (dataIndex === undefined) return []
  return Array.isArray(dataIndex) ? [...dataIndex] : [dataIndex as ProKey]
}

export function columnKey<T extends Record<string, unknown>>(
  column: Pick<ProColumns<T>, 'key' | 'dataIndex'>,
  fallback = '',
): string {
  if (column.key !== undefined) return String(column.key)
  const path = toPath(column.dataIndex)
  return path.length > 0 ? path.join('.') : fallback
}

export function getValue(record: Record<string, unknown>, dataIndex?: ProDataIndex): unknown {
  const path = toPath(dataIndex)
  let current: unknown = record
  for (const segment of path) {
    if (!isRecord(current)) return undefined
    current = current[String(segment)]
  }
  return current
}

export function setValue<T extends Record<string, unknown>>(
  record: T,
  dataIndex: ProDataIndex | undefined,
  value: unknown,
): T {
  const path = toPath(dataIndex)
  if (path.length === 0) return record

  const result = { ...record }
  let target: Record<string, unknown> = result
  for (let index = 0; index < path.length - 1; index += 1) {
    const segment = String(path[index])
    const next = target[segment]
    const cloned = isRecord(next) ? { ...next } : {}
    target[segment] = cloned
    target = cloned
  }
  target[String(path[path.length - 1])] = value
  return result
}

export function resolveRowKey<T extends Record<string, unknown>>(
  record: T,
  rowKey: keyof T | string | ((record: T) => ProKey) = DEFAULT_ROW_KEY,
): ProKey | undefined {
  const value = typeof rowKey === 'function' ? rowKey(record) : record[String(rowKey)]
  return typeof value === 'string' || typeof value === 'number' ? value : undefined
}

export function flattenColumns<T extends Record<string, unknown>>(
  columns: ProColumns<T>[],
): ProColumns<T>[] {
  return columns.flatMap((column) =>
    (column.children ?? column.columns)?.length
      ? flattenColumns((column.children ?? column.columns)!)
      : [column],
  )
}

export function getValueEnumOptions<Value = unknown>(
  valueEnum?: ProValueEnum<Value> | (() => ProValueEnum<Value>),
): Array<{
  label: string
  value: Value | string
  disabled?: boolean
}> {
  if (!valueEnum) return []
  const resolved = typeof valueEnum === 'function' ? valueEnum() : valueEnum

  const entries =
    resolved instanceof Map
      ? Array.from(resolved.entries())
      : Object.entries(resolved).map(([key, item]) => {
          const value = typeof item === 'string' ? key : (item.value ?? key)
          return [value, item] as const
        })

  return entries.map(([value, item]) => {
    const normalized = normalizeValueEnumItem(item)
    return {
      label: normalized.text,
      value,
      disabled: normalized.disabled,
    }
  })
}

export function getValueEnumItem<Value = unknown>(
  valueEnum: ProValueEnum<Value> | (() => ProValueEnum<Value>) | undefined,
  value: unknown,
): ProValueEnumItem<Value> | undefined {
  if (!valueEnum) return undefined
  const resolved = typeof valueEnum === 'function' ? valueEnum() : valueEnum

  if (resolved instanceof Map) {
    const exactItem = resolved.get(value as Value)
    if (exactItem !== undefined) return normalizeValueEnumItem(exactItem)

    const compatibleEntry = Array.from(resolved.entries()).find(([entryValue]) =>
      hasCompatibleValue(entryValue, value),
    )
    return compatibleEntry ? normalizeValueEnumItem(compatibleEntry[1]) : undefined
  }

  const compatibleEntry = Object.entries(resolved).find(([key, item]) => {
    const itemValue = typeof item === 'string' ? key : (item.value ?? key)
    return Object.is(itemValue, value) || hasCompatibleValue(itemValue, value)
  })
  return compatibleEntry ? normalizeValueEnumItem(compatibleEntry[1]) : undefined
}

export function buildSearchParams<T extends Record<string, unknown>>(
  columns: ProColumns<T>[],
  values: Record<string, unknown>,
): Record<string, unknown> {
  return flattenColumns(columns).reduce<Record<string, unknown>>((result, column) => {
    if (column.hideInSearch || column.search === false || column.dataIndex === undefined) {
      return result
    }
    const key = columnKey(column)
    const value = values[key]
    if (isEmptySearchValue(value)) return result
    if (typeof column.search === 'object' && column.search.transform) {
      Object.assign(result, column.search.transform(value))
      return result
    }
    return setValue(result, column.dataIndex, value)
  }, {})
}

export function applyLocalQuery<T extends Record<string, unknown>>(
  source: T[],
  columns: ProColumns<T>[],
  searchValues: Record<string, unknown>,
  sort: ProSort,
  filter: ProFilter,
): T[] {
  const leafColumns = flattenColumns(columns)
  const byKey = new Map(
    leafColumns.map((column, index) => [columnKey(column, String(index)), column]),
  )

  const searched = source.filter((record) =>
    leafColumns.every((column, index) => {
      if (column.hideInSearch || column.search === false || column.dataIndex === undefined)
        return true
      const expected = searchValues[columnKey(column, String(index))]
      if (isEmptySearchValue(expected)) return true
      return matchesSearch(getValue(record, column.dataIndex), expected)
    }),
  )

  const filtered = searched.filter((record) =>
    Object.entries(filter).every(([key, accepted]) => {
      if (!accepted?.length) return true
      const column = byKey.get(key)
      if (!column) return true
      const actual = getValue(record, column.dataIndex)
      return accepted.some((value) => String(value) === String(actual))
    }),
  )

  const sortEntries = Object.entries(sort).filter(
    (entry): entry is [string, 'ascend' | 'descend'] => entry[1] !== null,
  )
  if (sortEntries.length === 0) return filtered

  return [...filtered].sort((left, right) => {
    for (const [key, direction] of sortEntries) {
      const column = byKey.get(key)
      if (!column) continue
      const comparison =
        typeof column.sorter === 'function'
          ? column.sorter(left, right)
          : typeof column.sorter === 'object' && column.sorter.compare
            ? column.sorter.compare(left, right)
            : compareValues(getValue(left, column.dataIndex), getValue(right, column.dataIndex))
      if (comparison !== 0) return direction === 'ascend' ? comparison : -comparison
    }
    return 0
  })
}

export function loadColumnsState(
  config: ProColumnsStateConfig | undefined,
): Record<string, ProColumnsState> {
  if (!config) return {}
  if (config.value) return cloneColumnsState(config.value)
  const storage = getStorage(config.persistenceType)
  if (storage && config.persistenceKey) {
    try {
      const serialized = storage.getItem(config.persistenceKey)
      if (serialized) return JSON.parse(serialized) as Record<string, ProColumnsState>
    } catch {
      // Ignore malformed or inaccessible persisted state and fall back to defaults.
    }
  }
  return cloneColumnsState(config.defaultValue ?? {})
}

export function persistColumnsState(
  state: Record<string, ProColumnsState>,
  config: ProColumnsStateConfig | undefined,
): void {
  if (!config) return
  const cloned = cloneColumnsState(state)
  config.onChange?.(cloned)
  const storage = getStorage(config.persistenceType)
  if (!storage || !config.persistenceKey) return
  try {
    storage.setItem(config.persistenceKey, JSON.stringify(cloned))
  } catch {
    // Storage can be unavailable in private mode; state still works in memory.
  }
}

export function cloneRecord<T extends Record<string, unknown>>(record: T): T {
  return { ...record }
}

export function recordsInTree<T extends Record<string, unknown>>(rows: T[]): T[] {
  return rows.flatMap((row) => {
    const children = Array.isArray(row.children) ? (row.children as T[]) : []
    return [row, ...recordsInTree(children)]
  })
}

export function findRecord<T extends Record<string, unknown>>(
  rows: T[],
  key: ProKey,
  rowKey: keyof T | string | ((record: T) => ProKey),
): T | undefined {
  return recordsInTree(rows).find((record) => resolveRowKey(record, rowKey) === key)
}

export function replaceRecord<T extends Record<string, unknown>>(
  rows: T[],
  key: ProKey,
  replacement: T,
  rowKey: keyof T | string | ((record: T) => ProKey),
): T[] {
  return rows.map((row) => {
    if (resolveRowKey(row, rowKey) === key) return replacement
    if (!Array.isArray(row.children)) return row
    return {
      ...row,
      children: replaceRecord(row.children as T[], key, replacement, rowKey),
    }
  })
}

export function removeRecord<T extends Record<string, unknown>>(
  rows: T[],
  key: ProKey,
  rowKey: keyof T | string | ((record: T) => ProKey),
): T[] {
  return rows
    .filter((row) => resolveRowKey(row, rowKey) !== key)
    .map((row) => {
      if (!Array.isArray(row.children)) return row
      const children = removeRecord(row.children as T[], key, rowKey)
      if (children.length > 0) return { ...row, children }
      const { children: _children, ...recordWithoutChildren } = row
      return recordWithoutChildren as T
    })
}

export function insertRecord<T extends Record<string, unknown>>(
  rows: T[],
  record: T,
  position: 'top' | 'bottom' = 'bottom',
  parentKey?: ProKey,
  rowKey: keyof T | string | ((record: T) => ProKey) = DEFAULT_ROW_KEY,
): { rows: T[]; inserted: boolean } {
  if (parentKey === undefined) {
    return {
      rows: position === 'top' ? [record, ...rows] : [...rows, record],
      inserted: true,
    }
  }

  let inserted = false
  const nextRows = rows.map((row) => {
    if (resolveRowKey(row, rowKey) === parentKey) {
      inserted = true
      const children = Array.isArray(row.children) ? (row.children as T[]) : []
      return {
        ...row,
        children: position === 'top' ? [record, ...children] : [...children, record],
      }
    }
    if (!Array.isArray(row.children)) return row
    const nested = insertRecord(row.children as T[], record, position, parentKey, rowKey)
    inserted ||= nested.inserted
    return nested.inserted ? { ...row, children: nested.rows } : row
  })
  return { rows: nextRows, inserted }
}

function normalizeValueEnumItem<Value>(
  item: string | ProValueEnumItem<Value>,
): ProValueEnumItem<Value> {
  return typeof item === 'string' ? { text: item } : item
}

function hasCompatibleValue(left: unknown, right: unknown): boolean {
  if (
    (typeof left !== 'string' && typeof left !== 'number') ||
    (typeof right !== 'string' && typeof right !== 'number')
  ) {
    return false
  }
  return String(left) === String(right)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isEmptySearchValue(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    value === '' ||
    (Array.isArray(value) && value.length === 0)
  )
}

function matchesSearch(actual: unknown, expected: unknown): boolean {
  if (Array.isArray(expected)) {
    return expected.some((value) => matchesSearch(actual, value))
  }
  if (actual === null || actual === undefined) return false
  if (typeof actual === 'string' || typeof expected === 'string') {
    return toComparableText(actual)
      .toLocaleLowerCase()
      .includes(toComparableText(expected).toLocaleLowerCase())
  }
  return Object.is(actual, expected)
}

function compareValues(left: unknown, right: unknown): number {
  if (Object.is(left, right)) return 0
  const leftIsNullish = left === undefined || left === null
  const rightIsNullish = right === undefined || right === null
  if (leftIsNullish && rightIsNullish) return 0
  if (leftIsNullish) return -1
  if (rightIsNullish) return 1
  if (typeof left === 'number' && typeof right === 'number') return left - right
  return toComparableText(left).localeCompare(toComparableText(right), undefined, {
    numeric: true,
  })
}

function toComparableText(value: unknown): string {
  if (typeof value === 'string') return value
  if (
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint' ||
    typeof value === 'symbol'
  ) {
    return String(value)
  }
  if (value instanceof Date) return value.toISOString()
  try {
    return JSON.stringify(value) ?? ''
  } catch {
    return '[unserializable]'
  }
}

function getStorage(type: ProColumnsStateConfig['persistenceType']): Storage | undefined {
  if (typeof window === 'undefined') return undefined
  return type === 'sessionStorage' ? window.sessionStorage : window.localStorage
}

function cloneColumnsState(
  state: Record<string, ProColumnsState>,
): Record<string, ProColumnsState> {
  return Object.fromEntries(Object.entries(state).map(([key, value]) => [key, { ...value }]))
}
