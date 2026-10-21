import type { Ref } from 'vue'
import { ref } from 'vue'
import { message } from 'antdv-next'
import { resolveColumnValueType } from './valueType'

import type { EditableConfig, ProColumns, ProDataIndex, ProKey, RecordCreatorProps } from '../types'
import {
  cloneRecord,
  columnKey,
  findRecord,
  flattenColumns,
  getValue,
  insertRecord,
  recordsInTree,
  removeRecord,
  replaceRecord,
  resolveRowKey,
  setValue,
} from './utils'

interface ValidationRule {
  required?: boolean
  message?: string
  validator?: (rule: ValidationRule, value: unknown, record?: Record<string, unknown>) => unknown
}

export interface EditableTableOptions<T extends Record<string, unknown>> {
  rows: Ref<T[]>
  columns: () => ProColumns<T>[]
  rowKey: () => keyof T | string | ((record: T) => ProKey)
  editable: () => false | EditableConfig<T> | undefined
  editableKeys: Ref<ProKey[]>
  onRowsChange: (rows: T[], changedRecord?: T, silent?: boolean) => void
  onDraftChange?: (rows: T[], changedRecord: T, reason: 'change' | 'cancel') => void
  onEditableKeysChange: (keys: ProKey[]) => void
  validateRecord?: (key: ProKey, record: T) => Promise<Map<string, string>>
  getMessage?: (key: string, fallback: string) => string
  onError?: (error: unknown) => void
}

export interface EditableTableController<T extends Record<string, unknown>> {
  drafts: Ref<Map<ProKey, T>>
  savingKeys: Ref<Set<ProKey>>
  validationErrors: Ref<Map<string, string>>
  isEditing: (key: ProKey | undefined) => boolean
  isCellEditable: (record: T, column: ProColumns<T>, index: number) => boolean
  displayRecord: (record: T) => T
  syncKeys: (keys: ProKey[]) => void
  updateField: (key: ProKey, dataIndex: ProDataIndex | undefined, value: unknown) => void
  updateRecord: (key: ProKey, value: Partial<T>) => void
  start: (key: ProKey) => boolean
  save: (key: ProKey) => Promise<boolean>
  cancel: (key: ProKey) => void
  remove: (key: ProKey) => Promise<boolean>
  add: (record: T, options?: Omit<RecordCreatorProps<T>, 'record'>) => boolean
  validationError: (key: ProKey, column: ProColumns<T>) => string | undefined
}

export function useEditableTable<T extends Record<string, unknown>>(
  options: EditableTableOptions<T>,
): EditableTableController<T> {
  const drafts = ref(new Map<ProKey, T>()) as Ref<Map<ProKey, T>>
  const origins = new Map<ProKey, T>()
  const cachedKeys = new Set<ProKey>()
  const savingKeys = ref(new Set<ProKey>()) as Ref<Set<ProKey>>
  const validationErrors = ref(new Map<string, string>()) as Ref<Map<string, string>>

  const updateEditableKeys = (keys: ProKey[]) => {
    options.editableKeys.value = keys
    options.onEditableKeysChange([...keys])
    const config = options.editable()
    if (config)
      config.onChange?.(
        [...keys],
        keys
          .map((key) => findRecord(options.rows.value, key, options.rowKey()))
          .filter((record): record is T => Boolean(record))
          .map(displayRecord),
      )
  }

  const clearKeyState = (key: ProKey) => {
    drafts.value = withoutMapKey(drafts.value, key)
    origins.delete(key)
    cachedKeys.delete(key)
    validationErrors.value = withoutErrorPrefix(validationErrors.value, key)
  }

  const clearKey = (key: ProKey) => {
    clearKeyState(key)
    updateEditableKeys(options.editableKeys.value.filter((item) => item !== key))
  }

  const isEditing = (key: ProKey | undefined) =>
    key !== undefined && options.editableKeys.value.includes(key)

  const displayRecord = (record: T): T => {
    const key = resolveRowKey(record, options.rowKey())
    return key === undefined ? record : (drafts.value.get(key) ?? record)
  }

  const materializeDraftRows = (source = options.rows.value): T[] => {
    let rows = source
    for (const key of cachedKeys) rows = removeRecord(rows, key, options.rowKey())
    for (const [key, draft] of drafts.value) {
      if (cachedKeys.has(key)) continue
      rows = replaceRecord(rows, key, cloneRecord(draft), options.rowKey())
    }
    return rows
  }

  const emitDraftChange = (
    key: ProKey,
    draft: T,
    reason: 'change' | 'cancel' = 'change',
    rows = materializeDraftRows(),
  ): void => {
    if (cachedKeys.has(key)) return
    options.onDraftChange?.(rows, cloneRecord(draft), reason)
    const config = options.editable()
    if (config) config.onValuesChange?.(cloneRecord(draft), rows)
  }

  const syncKeys = (keys: ProKey[]): void => {
    const nextKeys = [...new Set(keys)]
    const nextKeySet = new Set(nextKeys)
    const restoredRecords: Array<{ key: ProKey; record: T }> = []

    for (const activeKey of options.editableKeys.value) {
      if (nextKeySet.has(activeKey)) continue
      const cached = cachedKeys.has(activeKey)
      const origin = origins.get(activeKey)
      if (cached) {
        options.onRowsChange(
          removeRecord(options.rows.value, activeKey, options.rowKey()),
          undefined,
          true,
        )
      } else if (origin) {
        restoredRecords.push({ key: activeKey, record: cloneRecord(origin) })
      }
      clearKeyState(activeKey)
    }

    for (const key of nextKeys) {
      if (origins.has(key) && drafts.value.has(key)) continue
      const record = findRecord(options.rows.value, key, options.rowKey())
      if (!record) continue
      if (!origins.has(key)) origins.set(key, cloneRecord(record))
      if (!drafts.value.has(key)) {
        drafts.value = new Map(drafts.value).set(key, cloneRecord(record))
      }
    }

    options.editableKeys.value = nextKeys

    if (restoredRecords.length > 0) {
      let rows = materializeDraftRows()
      for (const restored of restoredRecords) {
        rows = replaceRecord(rows, restored.key, restored.record, options.rowKey())
      }
      const changed = restoredRecords.at(-1)!
      options.onDraftChange?.(rows, cloneRecord(changed.record), 'cancel')
    }
  }

  const start = (key: ProKey): boolean => {
    const editable = options.editable()
    if (!editable) return false
    if (isEditing(key) && drafts.value.has(key)) return true
    const record = findRecord(options.rows.value, key, options.rowKey())
    if (!record) return false

    if (editable.type !== 'multiple') {
      if (options.editableKeys.value.some((activeKey) => activeKey !== key)) {
        message.warning(
          editable.onlyOneLineEditorAlertMessage ??
            options.getMessage?.('editableTable.onlyOneLineEditor', '只能同时编辑一行') ??
            '只能同时编辑一行',
        )
        return false
      }
    }
    if (!origins.has(key)) origins.set(key, cloneRecord(record))
    drafts.value = new Map(drafts.value).set(key, cloneRecord(record))
    if (!options.editableKeys.value.includes(key)) {
      updateEditableKeys([...options.editableKeys.value, key])
    }
    return true
  }

  const updateField = (key: ProKey, dataIndex: ProDataIndex | undefined, value: unknown): void => {
    if (!isEditing(key)) return
    const current = drafts.value.get(key) ?? findRecord(options.rows.value, key, options.rowKey())
    if (!current || dataIndex === undefined) return
    const draft = setValue(current, dataIndex, value)
    drafts.value = new Map(drafts.value).set(key, draft)
    validationErrors.value = withoutErrorKey(
      validationErrors.value,
      errorKey(key, toColumnIdentity(dataIndex)),
    )
    emitDraftChange(key, draft)
  }

  const updateRecord = (key: ProKey, value: Partial<T>): void => {
    if (!isEditing(key)) return
    const current = drafts.value.get(key) ?? findRecord(options.rows.value, key, options.rowKey())
    if (!current) return
    const draft = { ...current, ...value }
    drafts.value = new Map(drafts.value).set(key, draft)
    for (const field of Object.keys(value)) {
      validationErrors.value = withoutErrorKey(validationErrors.value, errorKey(key, field))
    }
    emitDraftChange(key, draft)
  }

  const save = async (key: ProKey): Promise<boolean> => {
    if (!isEditing(key) || savingKeys.value.has(key)) return false
    const draft = drafts.value.get(key)
    const origin = origins.get(key)
    if (!draft || !origin) return false

    savingKeys.value = new Set(savingKeys.value).add(key)
    try {
      const errors = options.validateRecord
        ? await options.validateRecord(key, draft)
        : await validateEditableRecord(draft, options.columns(), options.getMessage)
      validationErrors.value = mergeValidationErrors(validationErrors.value, key, errors)
      if (errors.size > 0) return false

      const config = options.editable()
      const result = config
        ? await config.onSave?.(key, cloneRecord(draft), cloneRecord(origin))
        : undefined
      if (result === false) return false

      const rows = replaceRecord(options.rows.value, key, cloneRecord(draft), options.rowKey())
      options.onRowsChange(rows, cloneRecord(draft), false)
      clearKey(key)
      return true
    } catch (error) {
      options.onError?.(error)
      return false
    } finally {
      savingKeys.value = withoutSetValue(savingKeys.value, key)
    }
  }

  const cancel = (key: ProKey): void => {
    const record = drafts.value.get(key)
    const origin = origins.get(key)
    const cached = cachedKeys.has(key)
    if (record && origin) {
      const config = options.editable()
      if (config) {
        Promise.resolve(config.onCancel?.(key, cloneRecord(record), cloneRecord(origin))).catch(
          (error: unknown) => options.onError?.(error),
        )
      }
    }
    if (cached) {
      options.onRowsChange(removeRecord(options.rows.value, key, options.rowKey()), undefined, true)
    }
    clearKey(key)
    if (record && origin && !cached) {
      const rows = replaceRecord(materializeDraftRows(), key, cloneRecord(origin), options.rowKey())
      emitDraftChange(key, origin, 'cancel', rows)
    }
  }

  const remove = async (key: ProKey): Promise<boolean> => {
    const record = drafts.value.get(key) ?? findRecord(options.rows.value, key, options.rowKey())
    if (!record) return false
    try {
      if (!cachedKeys.has(key)) {
        const config = options.editable()
        const result = config ? await config.onDelete?.(key, cloneRecord(record)) : undefined
        if (result === false) return false
      }
      const rows = removeRecord(options.rows.value, key, options.rowKey())
      options.onRowsChange(rows, cloneRecord(record), false)
      clearKey(key)
      return true
    } catch (error) {
      options.onError?.(error)
      return false
    }
  }

  const add = (record: T, creatorOptions: Omit<RecordCreatorProps<T>, 'record'> = {}): boolean => {
    if (!options.editable()) return false
    const key = resolveRowKey(record, options.rowKey())
    if (key === undefined) return false
    const config = options.editable()
    if (config && config.type !== 'multiple' && options.editableKeys.value.length > 0) {
      message.warning(
        config.onlyAddOneLineAlertMessage ??
          options.getMessage?.('editableTable.onlyAddOneLine', '只能新增一行') ??
          '只能新增一行',
      )
      return false
    }
    if (
      recordsInTree(options.rows.value).some((row) => resolveRowKey(row, options.rowKey()) === key)
    ) {
      return false
    }
    const inserted = insertRecord(
      options.rows.value,
      cloneRecord(record),
      creatorOptions.position,
      creatorOptions.parentKey,
      options.rowKey(),
    )
    if (!inserted.inserted) return false
    const cached = creatorOptions.newRecordType === 'cache'
    options.onRowsChange(inserted.rows, cloneRecord(record), cached)
    if (cached) cachedKeys.add(key)
    return start(key)
  }

  const isCellEditable = (record: T, column: ProColumns<T>, index: number): boolean => {
    const key = resolveRowKey(record, options.rowKey())
    if (
      !isEditing(key) ||
      column.readonly ||
      resolveColumnValueType(column.valueType, record, index).type === 'option'
    )
      return false
    return typeof column.editable === 'function'
      ? column.editable(record, index)
      : column.editable !== false
  }

  const validationError = (key: ProKey, column: ProColumns<T>): string | undefined =>
    validationErrors.value.get(errorKey(key, columnKey(column)))

  return {
    drafts,
    savingKeys,
    validationErrors,
    isEditing,
    isCellEditable,
    displayRecord,
    syncKeys,
    updateField,
    updateRecord,
    start,
    save,
    cancel,
    remove,
    add,
    validationError,
  }
}

export async function validateEditableRecord<T extends Record<string, unknown>>(
  record: T,
  columns: ProColumns<T>[],
  getMessage: (key: string, fallback: string) => string = (_key, fallback) => fallback,
): Promise<Map<string, string>> {
  const errors = new Map<string, string>()
  for (const column of flattenColumns(columns)) {
    if (column.dataIndex === undefined || column.readonly || column.editable === false) continue
    const formItemProps =
      typeof column.formItemProps === 'function'
        ? column.formItemProps(record)
        : column.formItemProps
    const rawRules = formItemProps?.rules
    const rules = Array.isArray(rawRules)
      ? (rawRules as ValidationRule[])
      : rawRules && typeof rawRules === 'object'
        ? [rawRules as ValidationRule]
        : []
    const value = getValue(record, column.dataIndex)
    for (const rule of rules) {
      if (rule.required && isEmpty(value)) {
        errors.set(columnKey(column), rule.message ?? getMessage('form.required', '此项为必填项'))
        break
      }
      if (!rule.validator) continue
      try {
        const result = await rule.validator(rule, value, record)
        if (result === false) {
          errors.set(
            columnKey(column),
            rule.message ?? getMessage('form.validationFailed', '校验失败'),
          )
          break
        }
      } catch (error) {
        errors.set(
          columnKey(column),
          error instanceof Error
            ? error.message
            : typeof error === 'string'
              ? error
              : (rule.message ?? getMessage('form.validationFailed', '校验失败')),
        )
        break
      }
    }
  }
  return errors
}

function isEmpty(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    value === '' ||
    (Array.isArray(value) && value.length === 0)
  )
}

function mergeValidationErrors(
  current: Map<string, string>,
  key: ProKey,
  errors: Map<string, string>,
): Map<string, string> {
  const next = withoutErrorPrefix(current, key)
  for (const [column, message] of errors) next.set(errorKey(key, column), message)
  return next
}

function errorKey(key: ProKey, column: string): string {
  return `${String(key)}::${column}`
}

function toColumnIdentity(dataIndex: ProDataIndex): string {
  return Array.isArray(dataIndex) ? dataIndex.join('.') : String(dataIndex)
}

function withoutMapKey<K, V>(source: Map<K, V>, key: K): Map<K, V> {
  const next = new Map(source)
  next.delete(key)
  return next
}

function withoutSetValue<T>(source: Set<T>, value: T): Set<T> {
  const next = new Set(source)
  next.delete(value)
  return next
}

function withoutErrorPrefix(source: Map<string, string>, key: ProKey): Map<string, string> {
  const prefix = `${String(key)}::`
  return new Map([...source].filter(([error]) => !error.startsWith(prefix)))
}

function withoutErrorKey(source: Map<string, string>, key: string): Map<string, string> {
  const next = new Map(source)
  next.delete(key)
  return next
}
