import { flushPromises, mount } from '@vue/test-utils'
import {
  Avatar,
  Badge,
  Cascader,
  CheckboxGroup,
  ColorPicker,
  DatePicker,
  DateRangePicker,
  Image,
  Input,
  InputNumber,
  InputPassword,
  Progress,
  Radio,
  RadioGroup,
  Rate,
  Segmented,
  Select,
  Slider,
  Switch,
  TextArea,
  TimePicker,
  TimeRangePicker,
  TreeSelect,
} from 'antdv-next'
import dayjs from 'dayjs'
import { defineComponent, h, nextTick, ref, type Component } from 'vue'
import { beforeAll, describe, expect, it, vi } from 'vite-plus/test'
import {
  ProField,
  PRO_FIELD_BUILTIN_VALUE_TYPES,
  PRO_FIELD_SCHEMA_LAYOUT_VALUE_TYPES,
  FieldMoney,
  ProConfigProvider,
  useProConfig,
  createIntl,
  enUSIntl,
} from '../src'
import DigitRange from '../src/pro-form-fields/DigitRange'

beforeAll(() => {
  window.matchMedia ??= vi
    .fn()
    .mockImplementation(() => ({ matches: false, addListener: vi.fn(), removeListener: vi.fn() }))
})

// This is an independently enumerated behavioral baseline, not a registry snapshot.
const cases: Array<[string, Component | null, unknown, string?]> = [
  ['text', Input, 'hello'],
  ['password', InputPassword, 'secret'],
  ['money', InputNumber, 1234.5],
  ['index', null, 0, '1'],
  ['indexBorder', null, 0, '1'],
  ['option', null, 'action', 'action'],
  ['textarea', TextArea, 'long'],
  ...['date', 'dateWeek', 'dateMonth', 'dateQuarter', 'dateYear', 'dateTime', 'fromNow'].map(
    (type) => [type, DatePicker, dayjs('2026-10-21')] as [string, Component, unknown],
  ),
  ...[
    'dateRange',
    'dateTimeRange',
    'dateWeekRange',
    'dateMonthRange',
    'dateQuarterRange',
    'dateYearRange',
  ].map(
    (type) =>
      [type, DateRangePicker, [dayjs('2026-10-21'), dayjs('2026-10-22')]] as [
        string,
        Component,
        unknown,
      ],
  ),
  ['time', TimePicker, dayjs('2026-10-21T12:34:56')],
  ['timeRange', TimeRangePicker, [dayjs('2026-10-21T12:00:00'), dayjs('2026-10-21T13:00:00')]],
  ['select', Select, 'a'],
  ['checkbox', CheckboxGroup, ['a']],
  ['rate', Rate, 3],
  ['slider', Slider, 3],
  ['radio', Radio, true],
  ['radioButton', RadioGroup, 'a'],
  ['progress', InputNumber, 55],
  ['percent', InputNumber, 55],
  ['digit', InputNumber, 3.125],
  ['digitRange', DigitRange, [1, 3]],
  ['second', InputNumber, 65],
  ['code', TextArea, 'const x = 1'],
  ['jsonCode', TextArea, '{"x":1}'],
  ['avatar', null, '/avatar.png'],
  ['switch', Switch, true],
  ['image', Input, '/image.png'],
  ['cascader', Cascader, ['a']],
  ['treeSelect', TreeSelect, 'a'],
  ['color', ColorPicker, '#ff0000'],
  ['segmented', Segmented, 'a'],
]
const options = [{ label: 'Alpha', value: 'a' }]

describe('all 42 built-in field modes', () => {
  it('covers every fixed baseline valueType exactly once', () => {
    expect(cases.map((item) => item[0]).sort()).toEqual([...PRO_FIELD_BUILTIN_VALUE_TYPES].sort())
  })
  it.each(cases)(
    '%s renders in read mode without an editable fallback',
    (type, _control, value, display) => {
      const wrapper = mount(ProField, {
        props: {
          valueType: type,
          text: value,
          mode: 'read',
          options: type === 'radio' ? undefined : options,
        },
      })
      expect(wrapper.find('input:not([type=hidden]),textarea').exists()).toBe(false)
      if (display) expect(wrapper.text()).toBe(display)
      else if (type === 'avatar') expect(wrapper.findComponent(Avatar).props('src')).toBe(value)
      else if (type === 'image') expect(wrapper.findComponent(Image).props('src')).toBe(value)
      else if (type === 'progress')
        expect(wrapper.findComponent(Progress).props('percent')).toBe(55)
      else if (type === 'rate') expect(wrapper.findComponent(Rate).props('disabled')).toBe(true)
      else if (type === 'color')
        expect(wrapper.findComponent(ColorPicker).props()).toMatchObject({ value, open: false })
      else expect(wrapper.text().length).toBeGreaterThan(0)
      wrapper.unmount()
    },
  )
  for (const mode of ['edit', 'update'] as const) {
    it.each(cases)(
      `%s ${mode} controls values or stays a display-only field`,
      async (type, control, value, display) => {
        const wrapper = mount(ProField, {
          props: {
            valueType: type,
            modelValue: value,
            mode,
            options: type === 'radio' ? undefined : options,
          },
        })
        if (!control) {
          expect(wrapper.find('input').exists()).toBe(false)
          if (display) expect(wrapper.text()).toBe(display)
          else expect(wrapper.findComponent(Avatar).props('src')).toBe(value)
        } else {
          const input = wrapper.findComponent(control)
          expect(input.exists()).toBe(true)
          const prop = type === 'switch' || type === 'radio' ? 'checked' : 'value'
          expect((input.props() as Record<string, unknown>)[prop]).toEqual(value)
          input.vm.$emit(`update:${prop}`, value)
          expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([value])
          await wrapper.setProps({ modelValue: value })
          expect((input.props() as Record<string, unknown>)[prop]).toEqual(value)
        }
        wrapper.unmount()
      },
    )
  }
  it.each(PRO_FIELD_SCHEMA_LAYOUT_VALUE_TYPES)(
    '%s is a schema container and never an Input',
    (type) => {
      for (const mode of ['read', 'edit', 'update'] as const) {
        const wrapper = mount(ProField, { props: { valueType: type, text: 'layout', mode } })
        expect(wrapper.find('input').exists()).toBe(false)
        expect(wrapper.text()).toBe('')
        wrapper.unmount()
      }
    },
  )
})

describe('field edge contracts', () => {
  it('loads read labels, reacts to params, and refreshes without an edit request duplicate', async () => {
    const request = vi.fn(async (params?: Record<string, unknown>) => [
      { label: `Label ${typeof params?.id === 'number' ? params.id : ''}`, value: 'a' },
    ])
    const wrapper = mount(ProField, {
      props: { text: 'a', valueType: 'select', request, params: { id: 1 } },
    })
    await flushPromises()
    expect(wrapper.text()).toBe('Label 1')
    await wrapper.setProps({ params: { id: 2 } })
    await flushPromises()
    expect(wrapper.text()).toBe('Label 2')
    await (wrapper.vm as unknown as { refresh: () => Promise<void> }).refresh()
    expect(request).toHaveBeenCalledTimes(3)
    wrapper.unmount()
    request.mockClear()
    const edit = mount(ProField, {
      props: { modelValue: 'a', valueType: 'select', mode: 'edit', request },
    })
    await flushPromises()
    expect(request).toHaveBeenCalledTimes(1)
    await (edit.vm as unknown as { refresh: () => Promise<void> }).refresh()
    expect(request).toHaveBeenCalledTimes(2)
    edit.unmount()
  })
  it('uses boolean enum labels and normalizes Success and Danger badges reactively', async () => {
    const wrapper = mount(ProField, {
      props: { text: false, valueEnum: new Map([[false, { text: 'Off', status: 'Success' }]]) },
    })
    expect(wrapper.text()).toBe('Off')
    expect(wrapper.findComponent(Badge).props('status')).toBe('success')
    await wrapper.setProps({ valueEnum: new Map([[false, { text: 'Closed', status: 'Danger' }]]) })
    expect(wrapper.text()).toBe('Closed')
    expect(wrapper.findComponent(Badge).props('status')).toBe('error')
    wrapper.unmount()
  })
  it('applies object valueType config and gives explicit fieldProps precedence', () => {
    const wrapper = mount(ProField, {
      props: {
        valueType: { type: 'digit', min: 2, precision: 1 },
        mode: 'edit',
        fieldProps: { precision: 3 },
      },
    })
    expect(wrapper.findComponent(InputNumber).props()).toMatchObject({ min: 2, precision: 3 })
    wrapper.unmount()
  })
  it('inherits custom types by key, replaces matching definitions, isolates siblings and owns cache cleanup', async () => {
    const show = ref(true)
    const maps: Record<string, ReturnType<typeof useProConfig>> = {}
    const Probe = defineComponent({
      props: { id: String },
      setup(props) {
        const config = useProConfig()
        maps[props.id!] = config
        return () => h('output', config.intl.value.getMessage('tableForm.search'))
      },
    })
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(
            ProConfigProvider,
            {
              intl: enUSIntl,
              valueTypeMap: {
                a: { render: () => 'a', formItemRender: () => 'edit-a' },
                b: { render: () => 'b' },
              },
            },
            {
              default: () => [
                h(Probe, { id: 'parent' }),
                show.value
                  ? h(
                      ProConfigProvider,
                      {
                        autoClearCache: true,
                        valueTypeMap: { a: { render: () => 'new-a' } },
                        intl: createIntl('custom', { tableForm: { search: '' } }),
                      },
                      { default: () => h(Probe, { id: 'child' }) },
                    )
                  : null,
                h(
                  ProConfigProvider,
                  { needDeps: true, autoClearCache: true },
                  { default: () => h(Probe, { id: 'shared' }) },
                ),
              ],
            },
          ),
      }),
    )
    expect(maps.child!.valueTypeMap.value.b).toBe(maps.parent!.valueTypeMap.value.b)
    expect(maps.child!.valueTypeMap.value.a?.formItemRender).toBeUndefined()
    expect(maps.parent!.valueTypeMap.value.a?.formItemRender).toBeTypeOf('function')
    expect(maps.child!.intl.value.getMessage('tableForm.search')).toBe('')
    expect(maps.shared!.cache).toBe(maps.parent!.cache)
    maps.parent!.cache!.set('p', { value: 1 })
    maps.child!.cache!.set('c', { value: 1 })
    show.value = false
    await nextTick()
    expect(maps.child!.cache!.size).toBe(0)
    expect(maps.parent!.cache!.size).toBe(1)
    wrapper.unmount()
  })
  it('formats money by locale, custom symbols, precision, grouping and zero without dropping values', () => {
    const checks: Array<[Record<string, unknown>, number, string]> = [
      [{ locale: 'en-US' }, 1234.5, '$1,234.50'],
      [{ locale: 'zh-CN' }, 0, '¥0.00'],
      [{ locale: 'de-DE', numberFormatOptions: { currency: 'EUR' } }, 1234.5, '1.234,50 €'],
      [{ locale: 'en-US', customSymbol: 'US$' }, 12, 'US$12.00'],
      [
        {
          locale: 'en-US',
          numberFormatOptions: {
            useGrouping: false,
            maximumFractionDigits: 1,
            minimumFractionDigits: 1,
          },
        },
        1234.56,
        '$1234.6',
      ],
      [{ locale: 'en-US', moneySymbol: false }, 1234.5, '1,234.50'],
      [{ locale: 'en-US' }, -12.345, '-$12.35'],
      [{ locale: 'zh-CN' }, 123456789.12, '¥123,456,789.12'],
    ]
    for (const [props, text, expected] of checks) {
      const wrapper = mount(FieldMoney, { props: { ...props, text } })
      expect(wrapper.text()).toBe(expected)
      wrapper.unmount()
    }
    const edit = mount(FieldMoney, {
      props: {
        locale: 'de-DE',
        customSymbol: '€',
        mode: 'edit',
        modelValue: 1234.5,
        numberPopoverRender: false,
      },
    })
    const control = edit.findComponent(InputNumber)
    const formatter = control.props('formatter')!
    const parser = control.props('parser')!
    expect(formatter(1234.5, { userTyping: false, input: '' })).toBe('1.234,50')
    expect(parser('1.234,50')).toBe('1234.50')
    edit.unmount()
  })
})
