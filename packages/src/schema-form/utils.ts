import type { ProDataIndex, SchemaFormColumn, SchemaFormProps, SchemaFormStep } from '../types'
import type { VNodeChild } from 'vue'
import { resolveColumnValueType } from '../table/valueType'
import { formatDates } from '../pro-form/utils'

export type FormRecord = Record<string, unknown>

export function schemaChildren<T extends FormRecord>(
  column: SchemaFormColumn<T>,
): SchemaFormColumn<T>[] {
  return column.children ?? column.columns ?? []
}

export function formatSchemaValues<T extends FormRecord>(
  columns: SchemaFormColumn<T>[],
  values: FormRecord,
  formatter: SchemaFormProps<T>['dateFormatter'],
): FormRecord {
  const result = cloneValue(values)
  for (const column of columns) {
    const path = normalizePath(column.dataIndex)
    const type = resolveColumnValueType(column.valueType, values as T, 0).type
    const children = schemaChildren(column)
    const value = getValue(result, path)
    if (type === 'formList' && Array.isArray(value)) {
      setValue(
        result,
        path,
        value.map((row) =>
          isPlainRecord(row) ? formatSchemaValues(children, row, formatter) : row,
        ),
      )
    } else if (children.length) {
      Object.assign(result, formatSchemaValues(children, result, formatter))
    } else if (path.length && value !== undefined)
      setValue(result, path, formatDates(value, formatter, type))
  }
  return result
}

export function normalizePath(dataIndex?: ProDataIndex): Array<string | number> {
  if (dataIndex === undefined) return []
  if (typeof dataIndex === 'string' || typeof dataIndex === 'number') return [dataIndex]
  return [...dataIndex]
}

export function getValue(source: unknown, path: readonly (string | number)[]): unknown {
  let current = source
  for (const key of path) {
    if (current === null || typeof current !== 'object') return undefined
    current = (current as Record<string | number, unknown>)[key]
  }
  return current
}

export function setValue(
  target: FormRecord,
  path: readonly (string | number)[],
  value: unknown,
): void {
  if (path.length === 0) return

  let current: Record<string | number, unknown> = target
  path.forEach((key, index) => {
    if (index === path.length - 1) {
      current[key] = value
      return
    }

    const nextKey = path[index + 1]
    const existing = current[key]
    if (existing === null || typeof existing !== 'object') {
      current[key] = typeof nextKey === 'number' ? [] : {}
    }
    current = current[key] as Record<string | number, unknown>
  })
}

export function cloneValue<T>(value: T): T {
  if (value instanceof Date) return new Date(value.getTime()) as T
  if (Array.isArray(value)) return value.map((item) => cloneValue(item)) as T
  if (isPlainRecord(value)) {
    const cloned = Object.create(Object.getPrototypeOf(value)) as FormRecord
    for (const [key, item] of Object.entries(value)) cloned[key] = cloneValue(item)
    return cloned as T
  }
  return value
}

export function mergeValues(...sources: Array<unknown>): FormRecord {
  const output: FormRecord = {}
  for (const source of sources) mergeInto(output, source)
  return output
}

export function replaceRecord(target: FormRecord, next: FormRecord): void {
  for (const key of Object.keys(target)) delete target[key]
  Object.assign(target, cloneValue(next))
}

export function reconcileUrlValues(
  current: FormRecord,
  incoming: FormRecord,
  fieldNames: readonly string[],
): FormRecord {
  const output = cloneValue(current)
  for (const name of fieldNames) deletePlainPath(output, name.split('.'))
  return mergeValues(output, incoming)
}

export function convertInboundValues<T extends FormRecord>(
  columns: SchemaFormColumn<T>[],
  values: Partial<T> | FormRecord,
): FormRecord {
  const output = cloneValue(values) as FormRecord
  convertColumns(columns, output, output, [])
  return output
}

export function buildSubmitValues<T extends FormRecord>(
  columns: SchemaFormColumn<T>[],
  values: Partial<T> | FormRecord,
): Partial<T> {
  const output: FormRecord = {}
  collectSubmitValues(columns, values as FormRecord, output, [])
  return output as Partial<T>
}

export function buildSchemaSteps<T extends FormRecord>(
  columns: SchemaFormColumn<T>[],
): SchemaFormStep<T>[] {
  const visible = columns.filter((column) => !column.hideInForm)
  const grouped = visible.filter(
    (column) =>
      (resolveColumnValueType(column.valueType, {} as T, 0).type === 'group' ||
        resolveColumnValueType(column.valueType, {} as T, 0).type === 'formSet') &&
      Boolean(schemaChildren(column).length),
  )

  if (grouped.length !== visible.length || grouped.length === 0) {
    return [{ title: '', columns: visible }]
  }

  return grouped.map((column, index) => ({
    title: resolveTitle(column, index),
    columns: schemaChildren(column),
  }))
}

export function schemaFieldNames<T extends FormRecord>(columns: SchemaFormColumn<T>[]): string[] {
  const names = new Set<string>()
  const visit = (items: SchemaFormColumn<T>[], prefix: Array<string | number>) => {
    for (const column of items) {
      const path = [...prefix, ...normalizePath(column.dataIndex)]
      if (resolveColumnValueType(column.valueType, {} as T, 0).type === 'formList') {
        if (path.length > 0) names.add(path.join('.'))
        continue
      }
      if (schemaChildren(column).length) {
        visit(schemaChildren(column), prefix)
        continue
      }
      if (path.length > 0) names.add(path.join('.'))
    }
  }
  visit(columns, [])
  return [...names]
}

export function readUrlValues(
  config: SchemaFormProps<FormRecord>['urlSync'],
  fieldNames: readonly string[],
): FormRecord {
  if (!config || typeof window === 'undefined') return {}
  const normalized = normalizeUrlConfig(config)
  const params = readUrlSearchParams(normalized.mode)

  if (normalized.key) {
    const encoded = params.get(normalized.key)
    if (!encoded) return {}
    const parsed = parseUrlValue(encoded)
    return isPlainRecord(parsed) ? parsed : {}
  }

  const output: FormRecord = {}
  for (const name of fieldNames) {
    const encoded = params.get(name)
    if (encoded === null) continue
    setValue(output, name.split('.'), parseUrlValue(encoded))
  }
  return output
}

export function writeUrlValues(
  config: SchemaFormProps<FormRecord>['urlSync'],
  values: FormRecord,
  fieldNames: readonly string[],
): void {
  if (!config || typeof window === 'undefined') return
  const normalized = normalizeUrlConfig(config)
  const url = new URL(window.location.href)
  const params = readUrlSearchParams(normalized.mode)

  if (normalized.key) {
    params.set(normalized.key, JSON.stringify(values))
  } else {
    for (const name of fieldNames) {
      const value = getValue(values, name.split('.'))
      if (value === undefined || value === null || value === '') params.delete(name)
      else params.set(name, JSON.stringify(value))
    }
  }

  if (normalized.mode === 'hash') {
    url.hash = params.toString()
  } else {
    url.search = params.toString()
  }
  window.history.replaceState(window.history.state, '', url)
}

export function recordsEqual(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true
  try {
    return JSON.stringify(left) === JSON.stringify(right)
  } catch {
    return false
  }
}

function convertColumns<T extends FormRecord>(
  columns: SchemaFormColumn<T>[],
  root: FormRecord,
  container: FormRecord,
  prefix: Array<string | number>,
): void {
  for (const column of columns) {
    const type = resolveColumnValueType(column.valueType, root as T, 0).type
    const children = schemaChildren(column)
    const path = [...prefix, ...normalizePath(column.dataIndex)]

    if (type === 'formList') {
      const list = getValue(container, path)
      if (Array.isArray(list) && children.length) {
        const converted = list.map((item) => {
          const record = isPlainRecord(item) ? cloneValue(item) : {}
          convertColumns(children, record, record, [])
          return record
        })
        setValue(container, path, converted)
      }
      continue
    }

    if (children.length) {
      convertColumns(children, root, container, prefix)
      continue
    }

    if (path.length === 0 || !column.convertValue) continue
    const current = getValue(container, path)
    if (current === undefined) continue
    setValue(container, path, column.convertValue(current, root as Partial<T>))
  }
}

function collectSubmitValues<T extends FormRecord>(
  columns: SchemaFormColumn<T>[],
  source: FormRecord,
  target: FormRecord,
  prefix: Array<string | number>,
): void {
  for (const column of columns) {
    if (column.hideInForm) continue
    const type = resolveColumnValueType(column.valueType, source as T, 0).type
    const children = schemaChildren(column)
    const path = [...prefix, ...normalizePath(column.dataIndex)]

    if (type === 'divider' || type === 'option' || type === 'index' || type === 'indexBorder') {
      continue
    }

    if (type === 'formList') {
      const list = getValue(source, path)
      if (!Array.isArray(list)) {
        if (path.length > 0 && list !== undefined) setValue(target, path, cloneValue(list))
        continue
      }

      const transformed = list.map((item) => {
        if (!isPlainRecord(item) || !children.length) return cloneValue(item)
        const row: FormRecord = {}
        collectSubmitValues(children, item, row, [])
        return row
      })
      if (path.length > 0) setValue(target, path, transformed)
      continue
    }

    if (children.length) {
      collectSubmitValues(children, source, target, prefix)
      continue
    }

    if (path.length === 0) continue
    const value = getValue(source, path)
    if (!column.transform) {
      if (value !== undefined) setValue(target, path, cloneValue(value))
      continue
    }

    const transformed = column.transform(value, source as Partial<T>)
    if (isPlainRecord(transformed)) mergeInto(target, transformed)
    else setValue(target, path, cloneValue(transformed))
  }
}

function mergeInto(target: FormRecord, source: unknown): void {
  if (!isPlainRecord(source)) return
  for (const [key, value] of Object.entries(source)) {
    if (isPlainRecord(value) && isPlainRecord(target[key])) {
      mergeInto(target[key] as FormRecord, value)
    } else {
      target[key] = cloneValue(value)
    }
  }
}

function isPlainRecord(value: unknown): value is FormRecord {
  if (Object.prototype.toString.call(value) !== '[object Object]') return false
  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

function deletePlainPath(target: FormRecord, path: readonly string[]): void {
  const [key, ...rest] = path
  if (key === undefined) return
  if (rest.length === 0) {
    delete target[key]
    return
  }

  const child = target[key]
  if (!isPlainRecord(child)) return
  deletePlainPath(child, rest)
  if (Object.keys(child).length === 0) delete target[key]
}

function resolveTitle<T extends FormRecord>(
  column: SchemaFormColumn<T>,
  index: number,
): VNodeChild {
  if (typeof column.title === 'function') return column.title(column)
  return column.title ?? `Step ${index + 1}`
}

function normalizeUrlConfig(
  config: Exclude<SchemaFormProps<FormRecord>['urlSync'], false | undefined>,
): {
  key?: string
  mode: 'query' | 'hash'
} {
  return config === true ? { mode: 'query' } : { mode: config.mode ?? 'query', key: config.key }
}

function readUrlSearchParams(mode: 'query' | 'hash'): URLSearchParams {
  if (mode === 'hash') return new URLSearchParams(window.location.hash.replace(/^#\??/, ''))
  return new URLSearchParams(window.location.search)
}

function parseUrlValue(value: string): unknown {
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}
