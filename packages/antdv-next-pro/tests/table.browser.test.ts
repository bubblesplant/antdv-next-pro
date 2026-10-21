import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import { defineComponent, h, nextTick, ref } from 'vue'

import EditableProTable from '../src/EditableProTable.vue'
import type {
  EditableAction,
  EditableProTableInstance,
  ProColumns,
  ProRenderContext,
} from '../src/types'

interface Row extends Record<string, unknown> {
  id: number
  name: string
}

let wrapper: VueWrapper | undefined

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  document.body.innerHTML = ''
})

describe('EditableProTable browser interactions', () => {
  it('syncs live drafts to a controlled model and restores canceled rows', async () => {
    const model = ref<Row[]>([
      { id: 1, name: 'Ada' },
      { id: 2, name: 'Grace' },
    ])
    const tableRef = ref<EditableProTableInstance<Row>>()
    const onValuesChange = vi.fn()
    const Host = defineComponent(
      () => () =>
        h(EditableProTable, {
          ref: tableRef,
          columns: [
            {
              title: 'Name',
              dataIndex: 'name',
              fieldProps: { 'data-testid': 'controlled-name' },
            },
          ],
          value: model.value,
          rowKey: 'id',
          editable: { type: 'multiple' },
          onValuesChange,
          'onUpdate:value': (rows: Record<string, unknown>[]) => {
            model.value = rows as Row[]
          },
        }),
    )
    wrapper = mount(Host, { attachTo: document.body })
    await flushPromises()
    const table = tableRef.value!

    expect(table.startEditable(1)).toBe(true)
    expect(table.startEditable(2)).toBe(true)
    expect(table.setRowData(1, { name: 'Lin' })).toBe(true)
    expect(table.setRowData(2, { name: 'Hopper' })).toBe(true)
    await nextTick()
    expect(model.value).toEqual([
      { id: 1, name: 'Lin' },
      { id: 2, name: 'Hopper' },
    ])

    table.cancelEditable(1)
    await nextTick()
    expect(model.value).toEqual([
      { id: 1, name: 'Ada' },
      { id: 2, name: 'Hopper' },
    ])

    table.cancelEditable(2)
    await nextTick()
    expect(model.value).toEqual([
      { id: 1, name: 'Ada' },
      { id: 2, name: 'Grace' },
    ])

    expect(table.startEditable(1)).toBe(true)
    await nextTick()
    await wrapper.get('[data-testid="controlled-name"]').setValue('Katherine')
    await nextTick()
    expect(model.value[0]?.name).toBe('Katherine')
    expect(onValuesChange).toHaveBeenLastCalledWith(
      [
        { id: 1, name: 'Katherine' },
        { id: 2, name: 'Grace' },
      ],
      { id: 1, name: 'Katherine' },
    )
  })

  it('edits controlled values and creates rows through real Antdv Next controls', async () => {
    wrapper = mount(EditableProTable, {
      attachTo: document.body,
      props: {
        columns: [{ title: 'Name', dataIndex: 'name' }],
        value: [{ id: 1, name: 'Ada' }],
        rowKey: 'id',
        editable: { type: 'multiple' },
        recordCreatorProps: {
          record: () => ({ id: 2, name: 'Draft' }),
          creatorButtonText: 'Add row',
          newRecordType: 'dataSource',
        },
      },
    })
    await flushPromises()
    const table = wrapper.vm as unknown as EditableProTableInstance<Row>

    expect(table.startEditable(1)).toBe(true)
    expect(table.setRowData(0, { name: 'Grace' })).toBe(true)
    await expect(table.saveEditable(1)).resolves.toBe(true)
    await nextTick()
    expect(wrapper.emitted('update:value')?.at(-1)?.[0]).toEqual([{ id: 1, name: 'Grace' }])

    await wrapper.get('[data-pro-table-record-creator] button').trigger('click')
    await flushPromises()
    expect(table.getRowsData()).toEqual([
      { id: 1, name: 'Grace' },
      { id: 2, name: 'Draft' },
    ])
    expect(wrapper.emitted('update:value')?.at(-1)?.[0]).toEqual([
      { id: 1, name: 'Grace' },
      { id: 2, name: 'Draft' },
    ])
  })

  it('starts editing from actionRender and syncs renderFormItem updates once', async () => {
    const model = ref<Row[]>([{ id: 1, name: 'Ada' }])
    const onValuesChange = vi.fn()
    const actionRender = vi.fn(
      (_record: Record<string, unknown>, actions: EditableAction<Record<string, unknown>>) =>
        h(
          'button',
          {
            'data-testid': 'custom-action',
            onClick: () => {
              if (actions.editing) void actions.save()
              else actions.start()
            },
          },
          actions.editing ? 'Save custom row' : 'Edit custom row',
        ),
    )
    const Host = defineComponent(
      () => () =>
        h(EditableProTable, {
          columns: [
            {
              title: 'Name',
              dataIndex: 'name',
              renderFormItem: (
                _column: ProColumns<Record<string, unknown>>,
                context: ProRenderContext<Record<string, unknown>>,
              ) =>
                h('input', {
                  'data-testid': 'custom-editor',
                  value: context.record.name,
                  onInput: (event: Event) =>
                    context.update((event.target as HTMLInputElement).value),
                }),
            },
          ],
          value: model.value,
          rowKey: 'id',
          editable: { type: 'multiple', actionRender },
          onValuesChange,
          'onUpdate:value': (rows: Record<string, unknown>[]) => {
            model.value = rows as Row[]
          },
        }),
    )
    wrapper = mount(Host, { attachTo: document.body })
    await flushPromises()

    expect(wrapper.get('[data-testid="custom-action"]').text()).toBe('Edit custom row')
    expect(actionRender.mock.calls.at(-1)?.[1].editing).toBe(false)

    await wrapper.get('[data-testid="custom-action"]').trigger('click')
    await nextTick()
    expect(wrapper.get('[data-testid="custom-action"]').text()).toBe('Save custom row')
    expect(actionRender.mock.calls.at(-1)?.[1].editing).toBe(true)

    await wrapper.get('[data-testid="custom-editor"]').setValue('Grace')
    await nextTick()
    expect(model.value).toEqual([{ id: 1, name: 'Grace' }])
    expect(onValuesChange).toHaveBeenCalledTimes(1)
    expect(onValuesChange).toHaveBeenLastCalledWith([{ id: 1, name: 'Grace' }], {
      id: 1,
      name: 'Grace',
    })
  })
})
