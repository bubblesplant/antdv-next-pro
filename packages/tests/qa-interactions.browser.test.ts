import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { Select, Table } from 'antdv-next'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import { nextTick } from 'vue'

import EditableProTable from '../src/EditableProTable.vue'
import ProTable from '../src/ProTable.vue'
import SchemaForm from '../src/SchemaForm.vue'
import type { FormRecord } from '../src/schema-form/utils'
import type {
  EditableProTableInstance,
  ProFilter,
  ProKey,
  ProSort,
  ProTableInstance,
  SchemaFormColumn,
  SchemaFormInstance,
  SchemaFormLayoutType,
} from '../src/types'

interface Row extends Record<string, unknown> {
  id: number
  name: string
  status?: string
  age?: number
  children?: Row[]
}

interface ExtendedProTableInstance extends ProTableInstance<Row> {
  getRowsData: () => Row[]
}

interface RequestResult {
  data: Row[]
  total: number
}

let wrapper: VueWrapper | undefined
const initialUrl = window.location.href

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  document.body.innerHTML = ''
  window.history.replaceState(window.history.state, '', initialUrl)
  window.localStorage.clear()
  vi.restoreAllMocks()
})

function buttonByText(text: string) {
  const normalizeName = (value?: string) => value?.replace(/\s+/g, '').trim()
  const button = wrapper?.findAll('button').find((candidate) => {
    const names = [
      candidate.text(),
      candidate.attributes('title'),
      candidate.attributes('aria-label'),
    ]
    return names.some((name) => normalizeName(name) === normalizeName(text))
  })
  if (!button) {
    const available =
      wrapper?.findAll('button').map((candidate) => ({
        ariaLabel: candidate.attributes('aria-label'),
        text: candidate.text().trim(),
        title: candidate.attributes('title'),
      })) ?? []
    throw new Error(`Button not found: ${text}; available: ${JSON.stringify(available)}`)
  }
  return button
}

function documentButton(selector: string): HTMLButtonElement {
  const button = document.querySelector<HTMLButtonElement>(selector)
  if (!button) throw new Error(`Document button not found: ${selector}`)
  return button
}

describe('ProTable browser QA matrix', () => {
  it('drives remote search, pagination and refresh through rendered Antdv Next controls', async () => {
    const request = vi.fn(
      async (
        params: Record<string, unknown>,
        _sort: ProSort,
        _filter: ProFilter,
      ): Promise<RequestResult> => {
        const current = Number(params.current ?? 1)
        const name = typeof params.name === 'string' ? params.name : 'all'
        return {
          data: [
            {
              id: current,
              name: `${name}-${current}`,
            },
          ],
          total: 3,
        }
      },
    )

    wrapper = mount(ProTable, {
      attachTo: document.body,
      props: {
        columns: [
          {
            title: 'Name',
            dataIndex: 'name',
            fieldProps: { 'data-testid': 'remote-name' },
          },
        ],
        request,
        manualRequest: true,
        rowKey: 'id',
        pagination: { pageSize: 1, showSizeChanger: false },
        options: {
          density: false,
          fullScreen: false,
          reload: true,
          setting: false,
        },
      },
    })
    await flushPromises()

    expect(request).not.toHaveBeenCalled()
    await wrapper.get('[data-testid="remote-name"]').setValue('Ada')
    await wrapper.get('[data-pro-table-search] form').trigger('submit')
    await vi.waitFor(() => {
      expect(request).toHaveBeenCalledTimes(1)
      expect(wrapper!.text()).toContain('Ada-1')
    })

    expect(request).toHaveBeenLastCalledWith(
      expect.objectContaining({ current: 1, name: 'Ada', pageSize: 1 }),
      {},
      {},
    )
    expect(wrapper.text()).toContain('Ada-1')

    await wrapper.get('.ant-pagination-item-2 a').trigger('click')
    await flushPromises()

    expect(request).toHaveBeenLastCalledWith(
      expect.objectContaining({ current: 2, name: 'Ada', pageSize: 1 }),
      {},
      {},
    )
    expect(wrapper.text()).toContain('Ada-2')

    await buttonByText('刷新').trigger('click')
    await flushPromises()
    expect(request).toHaveBeenCalledTimes(3)
    expect(request.mock.calls.at(-1)?.[0]).toEqual(
      expect.objectContaining({ current: 2, name: 'Ada', pageSize: 1 }),
    )
  })

  it('normalizes table sort/filter events and supports selection plus column settings', async () => {
    const onColumnsStateChange = vi.fn()
    wrapper = mount(ProTable, {
      attachTo: document.body,
      props: {
        columns: [
          { title: 'Name', dataIndex: 'name', sorter: true },
          {
            title: 'Status',
            dataIndex: 'status',
            filters: [
              { text: 'Active', value: 'active' },
              { text: 'Disabled', value: 'disabled' },
            ],
          },
          { title: 'Age', dataIndex: 'age' },
        ],
        dataSource: [
          { id: 1, name: 'Ada', status: 'active', age: 36 },
          { id: 2, name: 'Grace', status: 'active', age: 40 },
          { id: 3, name: 'Linus', status: 'disabled', age: 55 },
        ],
        rowKey: 'id',
        rowSelection: {},
        search: false,
        pagination: false,
        options: {
          density: false,
          fullScreen: false,
          reload: false,
          setting: true,
        },
        columnsState: { onChange: onColumnsStateChange },
      },
    })
    await flushPromises()

    wrapper
      .findComponent(Table)
      .vm.$emit(
        'change',
        {},
        { status: ['active'] },
        { columnKey: 'name', field: 'name', order: 'descend' },
      )
    await nextTick()

    const bodyRows = wrapper.findAll('tbody tr.ant-table-row')
    expect(bodyRows).toHaveLength(2)
    expect(bodyRows[0]?.text()).toContain('Grace')
    expect(bodyRows[1]?.text()).toContain('Ada')
    expect(wrapper.emitted('change')?.at(-1)).toEqual([
      { current: 1, pageSize: 10, total: 2 },
      { status: ['active'] },
      { name: 'descend' },
    ])

    const rowCheckbox = wrapper.find('tbody .ant-checkbox-input')
    expect(rowCheckbox.exists()).toBe(true)
    await rowCheckbox.trigger('click')
    await flushPromises()
    expect(wrapper.emitted('selectionChange')?.at(-1)?.[0]).toEqual([2])

    await buttonByText('列设置').trigger('click')
    const ageSetting = wrapper
      .findAll('[data-pro-table-column-settings] label')
      .find((item) => item.text().includes('Age'))
    expect(ageSetting).toBeDefined()
    await ageSetting?.get('input').trigger('click')
    await nextTick()

    expect(onColumnsStateChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ age: expect.objectContaining({ show: false }) }),
    )
    expect(wrapper.findAll('thead th').map((cell) => cell.text())).not.toContain('Age')
  })

  it('commits only the last concurrent request result', async () => {
    const resolvers: Array<(result: RequestResult) => void> = []
    const request = vi.fn(
      () =>
        new Promise<RequestResult>((resolve) => {
          resolvers.push(resolve)
        }),
    )
    wrapper = mount(ProTable, {
      attachTo: document.body,
      props: {
        columns: [{ title: 'Name', dataIndex: 'name' }],
        request,
        manualRequest: true,
        rowKey: 'id',
        search: false,
        pagination: false,
        options: false,
      },
    })
    const table = wrapper.vm as unknown as ExtendedProTableInstance

    const first = table.reload()
    const second = table.reload()
    expect(resolvers).toHaveLength(2)

    resolvers[1]?.({ data: [{ id: 2, name: 'latest' }], total: 1 })
    await second
    await nextTick()
    resolvers[0]?.({ data: [{ id: 1, name: 'stale' }], total: 1 })
    await first
    await nextTick()

    expect(table.getRowsData()).toEqual([{ id: 2, name: 'latest' }])
    expect(wrapper.text()).toContain('latest')
    expect(wrapper.text()).not.toContain('stale')
    expect(wrapper.emitted('load')).toHaveLength(1)
  })
})

describe('EditableProTable browser QA matrix', () => {
  it('renders validation, preserves a rejected save, cancels drafts and deletes after confirmation', async () => {
    const onSave = vi.fn(
      async (_key: ProKey, record: Record<string, unknown>) => record.name !== 'blocked',
    )
    const onDelete = vi.fn(async () => true)
    wrapper = mount(EditableProTable, {
      attachTo: document.body,
      props: {
        columns: [
          {
            title: 'Name',
            dataIndex: 'name',
            fieldProps: { 'data-testid': 'editable-name' },
            formItemProps: { rules: [{ required: true, message: 'Name is required' }] },
          },
        ],
        value: [{ id: 1, name: 'Ada' }],
        rowKey: 'id',
        editable: { type: 'multiple', onSave, onDelete },
      },
    })
    await flushPromises()

    await buttonByText('编辑').trigger('click')
    await nextTick()
    const editor = wrapper.get('[data-testid="editable-name"]')
    await editor.setValue('')
    await buttonByText('保存').trigger('click')
    await flushPromises()

    expect(wrapper.get('[data-pro-table-validation-error]').text()).toBe('Name is required')
    expect(onSave).not.toHaveBeenCalled()

    await editor.setValue('blocked')
    await buttonByText('保存').trigger('click')
    await flushPromises()
    expect(onSave).toHaveBeenLastCalledWith(1, { id: 1, name: 'blocked' }, { id: 1, name: 'Ada' })
    expect(wrapper.find('[data-pro-table-editable-cell]').exists()).toBe(true)

    await buttonByText('取消').trigger('click')
    await nextTick()
    const table = wrapper.vm as unknown as EditableProTableInstance<Row>
    expect(table.getRowsData()).toEqual([{ id: 1, name: 'Ada' }])

    await buttonByText('编辑').trigger('click')
    await nextTick()
    await wrapper.get('[data-testid="editable-name"]').setValue('Grace')
    await buttonByText('保存').trigger('click')
    await flushPromises()
    expect(wrapper.emitted('update:value')?.at(-1)?.[0]).toEqual([{ id: 1, name: 'Grace' }])

    await buttonByText('删除').trigger('click')
    await flushPromises()
    documentButton('.ant-popconfirm-buttons .ant-btn-primary').click()
    await flushPromises()

    expect(onDelete).toHaveBeenLastCalledWith(1, { id: 1, name: 'Grace' })
    expect(wrapper.emitted('update:value')?.at(-1)?.[0]).toEqual([])
  })

  it('creates a tree child with a unique key and emits the complete controlled value', async () => {
    wrapper = mount(EditableProTable, {
      attachTo: document.body,
      props: {
        columns: [{ title: 'Name', dataIndex: 'name' }],
        value: [{ id: 1, name: 'Parent', children: [] }],
        rowKey: 'id',
        editable: { type: 'multiple' },
        recordCreatorProps: {
          record: () => ({ id: 2, name: 'Child' }),
          parentKey: 1,
          creatorButtonText: 'Add child',
          newRecordType: 'dataSource',
        },
      },
    })
    await flushPromises()

    await buttonByText('Add child').trigger('click')
    await flushPromises()
    const table = wrapper.vm as unknown as EditableProTableInstance<Row>
    const expected = [
      {
        id: 1,
        name: 'Parent',
        children: [{ id: 2, name: 'Child' }],
      },
    ]

    expect(table.getRowsData()).toEqual(expected)
    expect(wrapper.emitted('update:value')?.at(-1)?.[0]).toEqual(expected)
    expect(table.addEditRecord({ id: 2, name: 'Duplicate' })).toBe(false)
  })

  it('hides the creator at maxLength and restores it after the v-model value shrinks', async () => {
    wrapper = mount(EditableProTable, {
      attachTo: document.body,
      props: {
        columns: [{ title: 'Name', dataIndex: 'name' }],
        value: [{ id: 1, name: 'Ada' }],
        rowKey: 'id',
        maxLength: 1,
        recordCreatorProps: {
          record: () => ({ id: 2, name: 'Grace' }),
          creatorButtonText: 'Add row',
        },
      },
    })

    expect(wrapper.find('[data-pro-table-record-creator]').exists()).toBe(false)
    await wrapper.setProps({ value: [] })
    await nextTick()
    expect(buttonByText('Add row').exists()).toBe(true)

    await buttonByText('Add row').trigger('click')
    await nextTick()
    expect(wrapper.find('[data-pro-table-record-creator]').exists()).toBe(false)
    expect(wrapper.emitted('update:value')?.at(-1)?.[0]).toEqual([{ id: 2, name: 'Grace' }])
  })
})

describe('SchemaForm browser QA matrix', () => {
  it('loads asynchronous select options and validates through real form controls', async () => {
    const optionRequest = vi.fn(async () => [{ label: 'Administrator', value: 'admin' }])
    const columns: SchemaFormColumn<FormRecord>[] = [
      {
        title: 'Role',
        dataIndex: 'role',
        valueType: 'select',
        request: optionRequest,
        fieldProps: { 'data-testid': 'role-select' },
        formItemProps: { rules: [{ required: true, message: 'Role is required' }] },
      },
    ]
    wrapper = mount(SchemaForm, {
      attachTo: document.body,
      props: { columns },
    })
    await flushPromises()

    const select = wrapper.findComponent(Select)
    expect(optionRequest).toHaveBeenCalledTimes(1)
    expect(select.props('options')).toEqual([
      { label: 'Administrator', value: 'admin', disabled: false },
    ])

    await buttonByText('提交').trigger('click')
    await flushPromises()
    expect(wrapper.get('.ant-form-item-explain-error').text()).toContain('Role is required')

    await wrapper.get('[data-testid="role-select"].ant-select').trigger('mousedown')
    await flushPromises()
    const option = Array.from(
      document.querySelectorAll<HTMLElement>('.ant-select-item-option'),
    ).find((item) => item.textContent?.includes('Administrator'))
    expect(option).toBeDefined()
    option?.click()
    await flushPromises()
    expect(select.props('value')).toBe('admin')

    await buttonByText('提交').trigger('click')
    await flushPromises()
    expect(wrapper.emitted('finish')?.at(-1)?.[0]).toEqual({ role: 'admin' })
  })

  it.each([
    ['ModalForm', '.ant-modal', '.ant-modal-close'],
    ['DrawerForm', '.ant-drawer', '.ant-drawer-close'],
  ] as const)(
    'opens and closes the %s overlay through its rendered close control',
    async (layoutType, overlaySelector, closeSelector) => {
      wrapper = mount(SchemaForm, {
        attachTo: document.body,
        props: {
          columns: [{ title: 'Name', dataIndex: 'name' }],
          layoutType,
          open: false,
          title: `${layoutType} title`,
        },
      })
      await flushPromises()
      const form = wrapper.vm as unknown as SchemaFormInstance<FormRecord>

      form.open()
      await flushPromises()
      expect(document.querySelector(overlaySelector)).not.toBeNull()

      documentButton(closeSelector).click()
      await flushPromises()
      expect(wrapper.emitted('update:open')?.at(-1)).toEqual([false])
      expect(wrapper.emitted('close')).toHaveLength(1)
    },
  )

  it.each([
    ['QueryFilter', 'is-queryfilter', true],
    ['LightFilter', 'is-lightfilter', false],
  ] as const)(
    'renders the %s layout and excludes hideInSearch fields',
    async (layoutType, bodyClass, usesGrid) => {
      const columns: SchemaFormColumn<FormRecord>[] = [
        { title: 'Keyword', dataIndex: 'keyword', fieldProps: { 'data-testid': 'keyword' } },
        {
          title: 'Hidden',
          dataIndex: 'hidden',
          hideInSearch: true,
          fieldProps: { 'data-testid': 'hidden' },
        },
      ]
      wrapper = mount(SchemaForm, {
        attachTo: document.body,
        props: { columns, layoutType },
      })
      await flushPromises()

      expect(wrapper.get('.antdv-next-pro-schema-body').classes()).toContain(bodyClass)
      expect(wrapper.find('[data-pro-query-row]').exists()).toBe(usesGrid)
      if (layoutType === 'LightFilter') {
        expect(wrapper.find('[data-testid="keyword"]').exists()).toBe(false)
        const trigger = wrapper.findAll('button').find((item) => item.text().includes('Keyword'))!
        await trigger.trigger('click')
        await flushPromises()
        expect(document.querySelector('[data-testid="keyword"]')).not.toBeNull()
        expect(document.querySelector('[data-testid="hidden"]')).toBeNull()
      } else {
        expect(wrapper.find('[data-testid="keyword"]').exists()).toBe(true)
        expect(wrapper.find('[data-testid="hidden"]').exists()).toBe(false)
        expect(buttonByText('查询').exists()).toBe(true)
      }
    },
  )

  it('hydrates and writes URL values while moving a controlled StepsForm with real buttons', async () => {
    const url = new URL(window.location.href)
    url.searchParams.set('name', JSON.stringify('from-url'))
    window.history.replaceState(window.history.state, '', url)

    const columns: SchemaFormColumn<FormRecord>[] = [
      {
        title: 'Account',
        valueType: 'group',
        columns: [
          {
            title: 'Name',
            dataIndex: 'name',
            fieldProps: { 'data-testid': 'step-name' },
          },
        ],
      },
      {
        title: 'Profile',
        valueType: 'group',
        columns: [
          {
            title: 'Bio',
            dataIndex: 'bio',
            fieldProps: { 'data-testid': 'step-bio' },
          },
        ],
      },
    ]
    wrapper = mount(SchemaForm, {
      attachTo: document.body,
      props: {
        columns,
        layoutType: 'StepsForm' as SchemaFormLayoutType,
        current: 0,
        urlSync: true,
      },
    })
    await flushPromises()

    const nameInput = wrapper.get('[data-testid="step-name"]')
    expect((nameInput.element as HTMLInputElement).value).toBe('from-url')
    await nameInput.setValue('Grace')
    await flushPromises()
    expect(new URL(window.location.href).searchParams.get('name')).toBe(JSON.stringify('Grace'))

    await buttonByText('下一步').trigger('click')
    await flushPromises()
    expect(wrapper.emitted('update:current')?.at(-1)).toEqual([1])
    expect(wrapper.get('[data-testid="step-name"]').isVisible()).toBe(false)
    expect(wrapper.get('[data-testid="step-bio"]').isVisible()).toBe(true)

    await buttonByText('上一步').trigger('click')
    await flushPromises()
    expect(wrapper.emitted('update:current')?.at(-1)).toEqual([0])
  })
})
