import { ref } from 'vue'
import { describe, expect, it, vi } from 'vite-plus/test'

import type { EditableConfig, ProColumns, ProKey } from '../src/types'
import { useEditableTable, validateEditableRecord } from '../src/table/editable'

interface Row extends Record<string, unknown> {
  id: number
  name: string
  children?: Row[]
}

function createController(
  initialRows: Row[] = [
    { id: 1, name: 'Ada' },
    { id: 2, name: 'Grace' },
  ],
) {
  const rows = ref<Row[]>(initialRows)
  const editableKeys = ref<ProKey[]>([])
  const state: {
    columns: ProColumns<Row>[]
    editable: false | EditableConfig<Row>
  } = {
    columns: [{ dataIndex: 'name' }],
    editable: { type: 'multiple' },
  }
  const onRowsChange = vi.fn((nextRows: Row[]) => {
    rows.value = nextRows
  })
  const onEditableKeysChange = vi.fn()
  const onDraftChange = vi.fn()
  const onError = vi.fn()
  const controller = useEditableTable<Row>({
    rows,
    columns: () => state.columns,
    rowKey: () => 'id',
    editable: () => state.editable,
    editableKeys,
    onRowsChange,
    onDraftChange,
    onEditableKeysChange,
    onError,
  })

  return {
    controller,
    editableKeys,
    onEditableKeysChange,
    onDraftChange,
    onError,
    onRowsChange,
    rows,
    state,
  }
}

describe('editable table controller', () => {
  it('resolves fallback validation messages through the active locale without replacing explicit errors', async () => {
    const messages: Record<string, string> = {
      'form.required': 'Required',
      'form.validationFailed': 'Validation failed',
    }
    const getMessage = vi.fn((key: string, fallback: string) => messages[key] ?? fallback)
    const required: ProColumns<Row> = {
      dataIndex: 'name',
      formItemProps: { rules: [{ required: true }] },
    }
    expect(
      (await validateEditableRecord({ id: 1, name: '' }, [required], getMessage)).get('name'),
    ).toBe('Required')
    const validator: ProColumns<Row> = {
      dataIndex: 'name',
      formItemProps: { rules: [{ validator: () => false }] },
    }
    expect(
      (await validateEditableRecord({ id: 1, name: 'Ada' }, [validator], getMessage)).get('name'),
    ).toBe('Validation failed')
    const explicit: ProColumns<Row> = {
      dataIndex: 'name',
      formItemProps: { rules: [{ required: true, message: 'Explicit error' }] },
    }
    getMessage.mockClear()
    expect(
      (await validateEditableRecord({ id: 1, name: '' }, [explicit], getMessage)).get('name'),
    ).toBe('Explicit error')
    expect(getMessage).not.toHaveBeenCalled()
  })

  it('handles disabled, single-row and cell editability states', () => {
    const context = createController()
    const { controller, editableKeys, rows, state } = context

    state.editable = false
    expect(controller.start(1)).toBe(false)
    expect(controller.add({ id: 3, name: 'Lin' })).toBe(false)

    state.editable = { type: 'single' }
    expect(controller.start(99)).toBe(false)
    expect(controller.start(1)).toBe(true)
    expect(controller.isEditing(undefined)).toBe(false)
    expect(controller.isEditing(1)).toBe(true)
    expect(controller.displayRecord(rows.value[0]!)).toEqual({ id: 1, name: 'Ada' })

    controller.updateField(99, 'name', 'Ignored')
    controller.updateField(1, undefined, 'Ignored')
    controller.updateField(1, 'name', 'Updated')
    expect(controller.displayRecord(rows.value[0]!).name).toBe('Updated')

    expect(controller.isCellEditable(rows.value[0]!, { dataIndex: 'name' }, 0)).toBe(true)
    expect(
      controller.isCellEditable(rows.value[0]!, { dataIndex: 'name', readonly: true }, 0),
    ).toBe(false)
    expect(
      controller.isCellEditable(rows.value[0]!, { dataIndex: 'name', valueType: 'option' }, 0),
    ).toBe(false)
    expect(
      controller.isCellEditable(rows.value[0]!, { dataIndex: 'name', editable: false }, 0),
    ).toBe(false)
    expect(
      controller.isCellEditable(
        rows.value[0]!,
        { dataIndex: 'name', editable: (_record, index) => index > 0 },
        0,
      ),
    ).toBe(false)

    expect(controller.start(2)).toBe(false)
    expect(editableKeys.value).toEqual([1])
    expect(controller.displayRecord(rows.value[0]!).name).toBe('Updated')
    expect(controller.isCellEditable(rows.value[0]!, { dataIndex: 'name' }, 0)).toBe(true)
    controller.cancel(1)
    expect(controller.start(2)).toBe(true)
    expect(editableKeys.value).toEqual([2])
    expect(controller.displayRecord({ id: 3, name: 'No draft' })).toEqual({
      id: 3,
      name: 'No draft',
    })
  })

  it('validates required fields and custom validators before saving', async () => {
    const context = createController([{ id: 1, name: '' }])
    const { controller, state } = context
    const column: ProColumns<Row> = {
      dataIndex: 'name',
      formItemProps: { rules: { required: true, message: '请输入名称' } },
    }
    state.columns = [column]

    expect(await controller.save(1)).toBe(false)
    expect(controller.start(1)).toBe(true)
    expect(await controller.save(1)).toBe(false)
    expect(controller.validationError(1, column)).toBe('请输入名称')

    controller.updateField(1, 'name', 'Ada')
    expect(controller.validationError(1, column)).toBeUndefined()

    column.formItemProps = {
      rules: [{ validator: () => false, message: '名称不可用' }],
    }
    expect(await controller.save(1)).toBe(false)
    expect(controller.validationError(1, column)).toBe('名称不可用')

    column.formItemProps = () => ({
      rules: [
        {
          validator: () => {
            throw new Error('校验服务异常')
          },
        },
      ],
    })
    expect(await controller.save(1)).toBe(false)
    expect(controller.validationError(1, column)).toBe('校验服务异常')
  })

  it('keeps editing after rejected saves and commits a later successful save', async () => {
    const context = createController([{ id: 1, name: 'Ada' }])
    const { controller, editableKeys, onError, rows, state } = context
    const onSave = vi.fn<NonNullable<EditableConfig<Row>['onSave']>>(() => false)
    state.editable = { onSave }

    expect(controller.start(1)).toBe(true)
    controller.updateField(1, 'name', 'Grace')
    expect(await controller.save(1)).toBe(false)
    expect(editableKeys.value).toEqual([1])

    onSave.mockRejectedValueOnce(new Error('保存失败'))
    expect(await controller.save(1)).toBe(false)
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: '保存失败' }))

    onSave.mockResolvedValueOnce(true)
    expect(await controller.save(1)).toBe(true)
    expect(rows.value).toEqual([{ id: 1, name: 'Grace' }])
    expect(editableKeys.value).toEqual([])
    expect(controller.savingKeys.value.size).toBe(0)
  })

  it('hydrates and clears drafts when editable keys are controlled externally', async () => {
    const context = createController()
    const { controller, editableKeys, rows, state } = context
    const onSave = vi.fn<NonNullable<EditableConfig<Row>['onSave']>>(() => true)
    state.editable = { type: 'multiple', onSave }

    controller.syncKeys([1])
    controller.updateField(1, 'name', 'Lin')
    await expect(controller.save(1)).resolves.toBe(true)
    expect(onSave).toHaveBeenCalledWith(1, { id: 1, name: 'Lin' }, { id: 1, name: 'Ada' })
    expect(rows.value[0]?.name).toBe('Lin')

    controller.syncKeys([2])
    controller.updateField(2, 'name', 'Draft')
    expect(controller.drafts.value.get(2)?.name).toBe('Draft')
    controller.syncKeys([])
    expect(editableKeys.value).toEqual([])
    expect(controller.drafts.value.has(2)).toBe(false)
    await expect(controller.save(2)).resolves.toBe(false)
  })

  it('materializes all active drafts and restores canceled rows', () => {
    const context = createController()
    const { controller, onDraftChange } = context

    expect(controller.start(1)).toBe(true)
    expect(controller.start(2)).toBe(true)
    controller.updateField(1, 'name', 'Lin')
    expect(onDraftChange).toHaveBeenLastCalledWith(
      [
        { id: 1, name: 'Lin' },
        { id: 2, name: 'Grace' },
      ],
      { id: 1, name: 'Lin' },
      'change',
    )

    controller.updateField(2, 'name', 'Hopper')
    expect(onDraftChange).toHaveBeenLastCalledWith(
      [
        { id: 1, name: 'Lin' },
        { id: 2, name: 'Hopper' },
      ],
      { id: 2, name: 'Hopper' },
      'change',
    )

    controller.cancel(1)
    expect(onDraftChange).toHaveBeenLastCalledWith(
      [
        { id: 1, name: 'Ada' },
        { id: 2, name: 'Hopper' },
      ],
      { id: 1, name: 'Ada' },
      'cancel',
    )

    controller.syncKeys([])
    expect(onDraftChange).toHaveBeenLastCalledWith(
      [
        { id: 1, name: 'Ada' },
        { id: 2, name: 'Grace' },
      ],
      { id: 2, name: 'Grace' },
      'cancel',
    )
  })

  it('shallow-merges a row update and emits one complete draft change', () => {
    const context = createController()
    const { controller, onDraftChange, rows } = context

    expect(controller.start(1)).toBe(true)
    controller.updateRecord(1, { name: 'Lin' })

    expect(controller.displayRecord(rows.value[0]!)).toEqual({ id: 1, name: 'Lin' })
    expect(onDraftChange).toHaveBeenCalledTimes(1)
    expect(onDraftChange).toHaveBeenLastCalledWith(
      [
        { id: 1, name: 'Lin' },
        { id: 2, name: 'Grace' },
      ],
      { id: 1, name: 'Lin' },
      'change',
    )
  })

  it('runs cancel and delete callbacks while preserving data on failures', async () => {
    const context = createController([{ id: 1, name: 'Ada' }])
    const { controller, onError, onRowsChange, rows, state } = context
    const onCancel = vi.fn(() => Promise.reject(new Error('取消失败')))
    const onDelete = vi.fn<NonNullable<EditableConfig<Row>['onDelete']>>(() => false)
    state.editable = { type: 'multiple', onCancel, onDelete }

    expect(await controller.remove(99)).toBe(false)
    expect(controller.start(1)).toBe(true)
    controller.cancel(1)
    await vi.waitFor(() => expect(onError).toHaveBeenCalled())
    expect(controller.isEditing(1)).toBe(false)

    expect(await controller.remove(1)).toBe(false)
    expect(rows.value).toHaveLength(1)
    onDelete.mockRejectedValueOnce(new Error('删除失败'))
    expect(await controller.remove(1)).toBe(false)
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: '删除失败' }))

    onDelete.mockResolvedValueOnce(true)
    expect(await controller.remove(1)).toBe(true)
    expect(rows.value).toEqual([])
    expect(onRowsChange).toHaveBeenLastCalledWith([], { id: 1, name: 'Ada' }, false)
  })

  it('creates unique root, cached and nested records', () => {
    const context = createController([
      { id: 1, name: 'Parent', children: [{ id: 2, name: 'Child' }] },
    ])
    const { controller, onDraftChange, onRowsChange, rows, state } = context

    expect(controller.add({ name: 'Missing key' } as Row)).toBe(false)
    expect(controller.add({ id: 2, name: 'Duplicate' })).toBe(false)
    expect(controller.add({ id: 3, name: 'Missing parent' }, { parentKey: 99 })).toBe(false)

    expect(
      controller.add(
        { id: 3, name: 'Nested' },
        { parentKey: 1, position: 'top', newRecordType: 'dataSource' },
      ),
    ).toBe(true)
    expect(rows.value[0]?.children?.[0]).toEqual({ id: 3, name: 'Nested' })

    expect(
      controller.add({ id: 4, name: 'Cached' }, { position: 'top', newRecordType: 'cache' }),
    ).toBe(true)
    expect(onRowsChange).toHaveBeenLastCalledWith(
      expect.arrayContaining([{ id: 4, name: 'Cached' }]),
      { id: 4, name: 'Cached' },
      true,
    )
    controller.updateField(4, 'name', 'Cached draft')
    expect(onDraftChange).not.toHaveBeenCalled()
    controller.cancel(4)
    expect(rows.value.some((record) => record.id === 4)).toBe(false)

    state.editable = false
    expect(controller.add({ id: 5, name: 'Disabled' })).toBe(false)
  })
})
