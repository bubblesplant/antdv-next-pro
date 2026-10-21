import { config, flushPromises, mount } from '@vue/test-utils'
import {
  Checkbox,
  CheckboxGroup,
  DatePicker,
  DateRangePicker,
  Input,
  InputNumber,
  InputPassword,
  RadioGroup,
  Segmented,
  Select,
  Slider,
  Switch,
  TextArea,
  TimePicker,
  TimeRangePicker,
  TreeSelect,
} from 'antdv-next'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vite-plus/test'
import { h, type Component } from 'vue'

import ProTable from '../src/ProTable.vue'
import FieldControl from '../src/pro-form-fields/FieldControl.vue'
import type { ProValueType } from '../src/types'
import {
  formatProValue,
  ValueTypeControl,
  type ProFieldOption,
} from '../src/table/ValueTypeControl'

const originalRenderStubDefaultSlot = config.global.renderStubDefaultSlot

// Keep field controls visible inside shallowly stubbed layout containers such as ProCard.
beforeAll(() => {
  config.global.renderStubDefaultSlot = true
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  )
})
afterAll(() => {
  config.global.renderStubDefaultSlot = originalRenderStubDefaultSlot
})

describe('table value type controls', () => {
  it('maps all public table field value types to Antdv Next controls', () => {
    const options: ProFieldOption[] = [
      { label: 'Enabled', value: 'enabled' },
      { label: 'Disabled', value: 'disabled' },
    ]
    const cases: Array<{
      type: ProValueType | undefined
      component: Component
      options?: ProFieldOption[]
    }> = [
      { type: undefined, component: Input },
      { type: 'text', component: Input },
      { type: 'textarea', component: TextArea },
      { type: 'password', component: InputPassword },
      { type: 'digit', component: InputNumber },
      { type: 'money', component: InputNumber },
      { type: 'percent', component: InputNumber },
      { type: 'select', component: Select, options },
      { type: 'treeSelect', component: TreeSelect, options },
      { type: 'radio', component: RadioGroup, options },
      { type: 'checkbox', component: Checkbox },
      { type: 'checkbox', component: CheckboxGroup, options },
      { type: 'switch', component: Switch },
      { type: 'slider', component: Slider },
      { type: 'segmented', component: Segmented, options },
      { type: 'date', component: DatePicker },
      { type: 'dateTime', component: DatePicker },
      { type: 'dateRange', component: DateRangePicker },
      { type: 'dateTimeRange', component: DateRangePicker },
      { type: 'time', component: TimePicker },
      { type: 'timeRange', component: TimeRangePicker },
    ]

    for (const item of cases) {
      const wrapper = mount(ValueTypeControl, {
        props: {
          column: { dataIndex: 'value', valueType: item.type },
          value:
            item.type === 'checkbox'
              ? item.options
                ? []
                : false
              : item.type === 'switch'
                ? false
                : undefined,
          options: item.options ?? [],
        },
      })
      expect(wrapper.findComponent(item.component).exists(), item.type ?? 'default').toBe(true)
      wrapper.unmount()
    }
  })

  it('emits model updates and applies money and percent affordances', () => {
    const money = mount(ValueTypeControl, {
      props: { column: { valueType: 'money' }, value: 12 },
    })
    const moneyInput = money.findComponent(InputNumber)
    moneyInput.vm.$emit('update:value', 20)
    expect(money.emitted('update:value')).toEqual([[20]])
    expect(moneyInput.props('prefix')).toBe('¥')

    const percent = mount(ValueTypeControl, {
      props: { column: { valueType: 'percent' }, value: 12 },
    })
    expect(percent.findComponent(InputNumber).props('addonAfter')).toBe('%')
  })

  it.each([
    ['checkbox', Checkbox],
    ['switch', Switch],
  ] as const)('forwards the fieldProps %s update handler once', (valueType, component) => {
    const fieldUpdate = vi.fn()
    const wrapper = mount(ValueTypeControl, {
      props: {
        column: { valueType },
        value: false,
        fieldProps: { 'onUpdate:checked': fieldUpdate },
      },
    })

    wrapper.findComponent(component).vm.$emit('update:checked', true)
    expect(wrapper.emitted('update:value')).toEqual([[true]])
    expect(fieldUpdate).toHaveBeenCalledExactlyOnceWith(true)
  })

  it('forwards fallthrough attributes and listeners to the resolved control', () => {
    const checkedUpdate = vi.fn()
    const wrapper = mount(ValueTypeControl, {
      props: { column: { valueType: 'checkbox' }, value: false },
      attrs: {
        'data-testid': 'value-type-control',
        'onUpdate:checked': checkedUpdate,
      },
    })

    const checkbox = wrapper.findComponent(Checkbox)
    expect(checkbox.attributes('data-testid')).toBe('value-type-control')

    checkbox.vm.$emit('update:checked', true)
    expect(wrapper.emitted('update:value')).toEqual([[true]])
    expect(checkedUpdate).toHaveBeenCalledWith(true)
  })

  it('reuses a control instance when related value types share the same component', async () => {
    const wrapper = mount(ValueTypeControl, {
      props: { column: { valueType: 'digit' }, value: 12 },
    })
    const input = wrapper.findComponent(InputNumber).vm.$

    await wrapper.setProps({ column: { valueType: 'money' } })
    expect(wrapper.findComponent(InputNumber).vm.$).toBe(input)

    await wrapper.setProps({ column: { valueType: 'percent' } })
    expect(wrapper.findComponent(InputNumber).vm.$).toBe(input)
  })

  it('re-reads in-place configuration changes on an unrelated rerender', async () => {
    const column: { valueType: ProValueType } = { valueType: 'text' }
    const fieldProps: Record<string, unknown> = { placeholder: 'Before' }
    const options: ProFieldOption[] = []
    const wrapper = mount(ValueTypeControl, {
      props: { column, value: undefined, options, fieldProps, loading: false },
    })

    expect(wrapper.findComponent(Input).exists()).toBe(true)

    column.valueType = 'select'
    fieldProps.placeholder = 'After'
    options.push({ label: 'Enabled', value: 'enabled' })
    await wrapper.setProps({ loading: true })

    const select = wrapper.findComponent(Select)
    expect(select.exists()).toBe(true)
    expect(select.props('placeholder')).toBe('After')
    expect(select.props('options')).toEqual([
      expect.objectContaining({ label: 'Enabled', value: 'enabled' }),
    ])
    expect(select.props('loading')).toBe(true)
  })

  it('formats readonly enum, ranges, password, money, percent and date-like values', () => {
    const options = [{ label: 'Enabled', value: 'enabled' }]
    const dateLike = { format: vi.fn(() => '2026-08-23') }
    const richLabel = h('span', 'Complex')

    expect(formatProValue('enabled', options, 'select')).toBe('Enabled')
    expect(formatProValue(['enabled', 'missing'], options, 'checkbox')).toBe('Enabled, missing')
    expect(formatProValue(['start', 'end'], [], 'dateRange')).toBe('start ~ end')
    expect(formatProValue('secret', [], 'password')).toBe('••••••')
    expect(formatProValue(12, [], 'money')).toBe('¥12.00')
    expect(formatProValue(80, [], 'percent')).toBe('80%')
    expect(formatProValue(dateLike, [], 'date')).toBe('2026-08-23')
    expect(formatProValue({ nested: true }, [], 'text')).toBe('-')
    expect(formatProValue('complex', [{ label: richLabel, value: 'complex' }], 'select')).toBe(
      richLabel,
    )
    expect(dateLike.format).toHaveBeenCalledWith('YYYY-MM-DD')
  })

  it('loads column request options for the ProFormField search control', async () => {
    const request = vi.fn(async () => [
      { label: 'Enabled', value: 'enabled' },
      { text: 'Disabled', key: 'disabled', disabled: true },
    ])
    const wrapper = mount(ProTable, {
      global: { stubs: { NativeTable: true, ProCard: true, ListToolBar: true } },
      props: {
        columns: [
          {
            dataIndex: 'status',
            title: 'Status',
            valueType: 'select',
            params: { scope: 'active' },
            request,
          },
        ],
        dataSource: [{ id: 1, status: 'enabled' }],
        editable: { type: 'multiple' },
        pagination: false,
      },
    })
    await vi.waitFor(() => expect(request).toHaveBeenCalledWith({ scope: 'active' }))
    await flushPromises()

    const control = wrapper.findComponent(FieldControl)
    expect((control.props('fieldProps') as Record<string, unknown>).options).toEqual([
      expect.objectContaining({ label: 'Enabled', value: 'enabled', disabled: false }),
      expect.objectContaining({ label: 'Disabled', value: 'disabled', disabled: true }),
    ])
    expect((control.props('fieldProps') as Record<string, unknown>).loading).toBe(false)
  })

  it('treats an empty remote option result as authoritative', async () => {
    const request = vi.fn(async () => [])
    const wrapper = mount(ProTable, {
      global: { stubs: { NativeTable: true, ProCard: true, ListToolBar: true } },
      props: {
        columns: [
          {
            dataIndex: 'status',
            valueType: 'select',
            valueEnum: { local: 'Local' },
            request,
          },
        ],
        dataSource: [],
        pagination: false,
      },
    })

    await vi.waitFor(() => expect(request).toHaveBeenCalledOnce())
    await flushPromises()

    expect(
      (
        wrapper.findComponent(FieldControl).props('fieldProps') as
          | Record<string, unknown>
          | undefined
      )?.options,
    ).toEqual([])
    wrapper.unmount()
  })

  it('keeps the last successful options when a later request fails', async () => {
    const requestError = new Error('network failed')
    const onFieldRequestError = vi.fn()
    const request = vi
      .fn()
      .mockResolvedValueOnce([{ label: 'Remote', value: 'remote' }])
      .mockRejectedValueOnce(requestError)
    const wrapper = mount(ProTable, {
      global: { stubs: { NativeTable: true, ProCard: true, ListToolBar: true } },
      props: {
        columns: [
          {
            dataIndex: 'status',
            valueType: 'select',
            valueEnum: { local: 'Local' },
            params: { page: 1 },
            request,
            onFieldRequestError,
          },
        ],
        dataSource: [],
        pagination: false,
      },
    })

    await vi.waitFor(() => expect(request).toHaveBeenCalledOnce())
    await flushPromises()
    expect(
      (
        wrapper.findComponent(FieldControl).props('fieldProps') as
          | Record<string, unknown>
          | undefined
      )?.options,
    ).toEqual([expect.objectContaining({ label: 'Remote', value: 'remote' })])

    await wrapper.setProps({
      columns: [
        {
          dataIndex: 'status',
          valueType: 'select',
          valueEnum: { local: 'Local' },
          params: { page: 2 },
          request,
          onFieldRequestError,
        },
      ],
    })
    await vi.waitFor(() => expect(request).toHaveBeenCalledTimes(2))
    await flushPromises()

    expect(
      (
        wrapper.findComponent(FieldControl).props('fieldProps') as
          | Record<string, unknown>
          | undefined
      )?.options,
    ).toEqual([expect.objectContaining({ label: 'Remote', value: 'remote' })])
    expect(onFieldRequestError).toHaveBeenCalledExactlyOnceWith(requestError)
    wrapper.unmount()
  })
})
