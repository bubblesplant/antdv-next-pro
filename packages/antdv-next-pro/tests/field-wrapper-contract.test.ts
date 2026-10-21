import { flushPromises, mount } from '@vue/test-utils'
import {
  Button,
  Cascader,
  Checkbox,
  CheckboxGroup,
  ColorPicker,
  DatePicker,
  DateRangePicker,
  Image,
  Input,
  InputNumber,
  InputPassword,
  Radio,
  RadioButton,
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
  Upload,
  UploadDragger,
} from 'antdv-next'
import dayjs from 'dayjs'
import { h, type Component } from 'vue'
import { beforeAll, describe, expect, it, vi } from 'vite-plus/test'
import * as library from '../src'
import DigitRange from '../src/pro-form-fields/DigitRange'

beforeAll(() => {
  window.matchMedia ??= vi
    .fn()
    .mockImplementation(() => ({ matches: false, addListener: vi.fn(), removeListener: vi.fn() }))
})
const files = [{ uid: '1', name: 'photo.png', url: '/photo.png', status: 'done' as const }]
const originalFields: Array<[keyof typeof library, Component, unknown, unknown, string]> = [
  ['ProFormText', Input, 'before', 'after', 'value'],
  ['ProFormDigit', InputNumber, 1, 2, 'value'],
  ['ProFormTextPassword', InputPassword, 'before', 'after', 'value'],
  ['ProFormTextArea', TextArea, 'before', 'after', 'value'],
  ['ProFormCaptcha', Input, '123', '456', 'value'],
  ['ProFormDatePicker', DatePicker, dayjs('2026-10-21'), dayjs('2026-10-22'), 'value'],
  ['ProFormDateTimePicker', DatePicker, dayjs('2026-10-21'), dayjs('2026-10-22'), 'value'],
  [
    'ProFormDateRangePicker',
    DateRangePicker,
    [dayjs('2026-10-21'), dayjs('2026-10-22')],
    [dayjs('2026-10-23'), dayjs('2026-10-24')],
    'value',
  ],
  [
    'ProFormDateTimeRangePicker',
    DateRangePicker,
    [dayjs('2026-10-21'), dayjs('2026-10-22')],
    [dayjs('2026-10-23'), dayjs('2026-10-24')],
    'value',
  ],
  ['ProFormSelect', Select, 'a', 'b', 'value'],
  ['ProFormTreeSelect', TreeSelect, 'a', 'b', 'value'],
  ['ProFormCheckbox', Checkbox, false, true, 'checked'],
  ['ProFormRadioGroup', RadioGroup, 'a', 'b', 'value'],
  ['ProFormSlider', Slider, 1, 2, 'value'],
  ['ProFormSwitch', Switch, false, true, 'checked'],
  ['ProFormUploadButton', Upload, files, [], 'fileList'],
  ['ProFormUploadDragger', UploadDragger, files, [], 'fileList'],
  ['ProFormMoney', InputNumber, 1, 2, 'value'],
  ['ProFormSegmented', Segmented, 'a', 'b', 'value'],
]
const options = [
  { label: 'Alpha', value: 'a' },
  { label: 'Beta', value: 'b' },
]
function fieldOptions(name: string) {
  return ['ProFormSelect', 'ProFormTreeSelect', 'ProFormRadioGroup', 'ProFormSegmented'].includes(
    name,
  )
    ? { options }
    : {}
}

describe('original 19 field wrappers', () => {
  it.each(originalFields)(
    '%s forwards controlled values both ways',
    async (name, native, value, next, prop) => {
      const wrapper = mount(library[name] as Component, {
        props: { fieldMode: 'field', modelValue: value, ...fieldOptions(name) },
      })
      const control = wrapper.findComponent(native)
      expect((control.props() as Record<string, unknown>)[prop]).toEqual(value)
      control.vm.$emit(`update:${prop}`, next)
      expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([next])
      await wrapper.setProps({ modelValue: next })
      expect((control.props() as Record<string, unknown>)[prop]).toEqual(next)
      wrapper.unmount()
    },
  )
  it.each(originalFields)('%s uses a real readonly display', (name, _native, value) => {
    const wrapper = mount(library[name] as Component, {
      props: { fieldMode: 'field', readonly: true, modelValue: value, ...fieldOptions(name) },
    })
    expect(wrapper.find('input,textarea,button').exists()).toBe(false)
    if (name === 'ProFormTextPassword') expect(wrapper.text()).toBe('••••••')
    else if (name.startsWith('ProFormUpload')) expect(wrapper.text()).toBe('photo.png')
    else expect(wrapper.text().length).toBeGreaterThan(0)
    wrapper.unmount()
  })
  it.each(originalFields)(
    '%s registers named values and changes in ProForm',
    async (name, native, value, next, prop) => {
      const wrapper = mount(library.ProForm, {
        props: { initialValues: { sample: value }, submitter: false },
        slots: {
          default: () => h(library[name] as Component, { name: 'sample', ...fieldOptions(name) }),
        },
      })
      await flushPromises()
      expect((wrapper.findComponent(native).props() as Record<string, unknown>)[prop]).toEqual(
        value,
      )
      wrapper.findComponent(native).vm.$emit(`update:${prop}`, next)
      await flushPromises()
      expect(
        (
          wrapper.vm as unknown as { getFieldsValue: () => Record<string, unknown> }
        ).getFieldsValue().sample,
      ).toEqual(next)
      wrapper.unmount()
    },
  )
})

describe('enhanced field behavior', () => {
  it('renders all composed members and applies radio button and layout settings', () => {
    expect(library.ProFormRadio.Group).toBe(library.ProFormRadioGroup)
    expect(library.ProFormRadio.Button).toBe(RadioButton)
    expect(library.ProFormCheckbox.Group).toBe(library.ProFormCheckboxGroup)
    expect(library.ProFormText.Password).toBe(library.ProFormTextPassword)
    for (const picker of ['Week', 'Month', 'Quarter', 'Year'] as const)
      expect(library.ProFormDatePicker[picker]).toBe(library[`ProFormDate${picker}Picker`])
    expect(library.ProFormTimePicker.RangePicker).toBe(library.ProFormTimeRangePicker)
    const group = mount(library.ProFormRadioGroup, {
      props: { fieldMode: 'field', options, radioType: 'button', layout: 'vertical' },
    })
    expect(group.findComponent(RadioGroup).props('optionType')).toBe('button')
    expect(group.findComponent(RadioGroup).attributes('style')).toContain('flex-direction: column')
    expect(group.find('input').attributes('radioType')).toBeUndefined()
    group.unmount()
  })
  it('gives SearchSelect its real defaults and a single-select override', () => {
    expect(library.ProFormSelect.SearchSelect).toBe(library.ProFormSearchSelect)
    const multiple = mount(library.ProFormSearchSelect, { props: { fieldMode: 'field', options } })
    expect(multiple.findComponent(Select).props()).toMatchObject({
      mode: 'multiple',
      labelInValue: true,
      showSearch: true,
    })
    multiple.unmount()
    const single = mount(library.ProFormSearchSelect, {
      props: { fieldMode: 'field', mode: 'single', fieldProps: { labelInValue: false } },
    })
    expect(single.findComponent(Select).props('mode')).toBeUndefined()
    expect(single.findComponent(Select).props('labelInValue')).toBe(false)
    single.unmount()
  })
  it('normalizes date inputs but preserves valueFormat strings', () => {
    const plain = mount(library.ProFormDatePicker, {
      props: { fieldMode: 'field', modelValue: '2026-10-21' as never },
    })
    expect(dayjs.isDayjs(plain.findComponent(DatePicker).props('value'))).toBe(true)
    plain.unmount()
    const formatted = mount(library.ProFormDatePicker, {
      props: {
        fieldMode: 'field',
        modelValue: '2026-10-21' as never,
        fieldProps: { valueFormat: 'YYYY-MM-DD' },
      },
    })
    expect(formatted.findComponent(DatePicker).props('value')).toBe('2026-10-21')
    formatted.unmount()
  })
  it('applies upload card/max behavior and opens controlled image preview', async () => {
    const wrapper = mount(library.ProFormUploadButton, {
      props: {
        fieldMode: 'field',
        modelValue: files,
        max: 1,
        title: 'Add photo',
        fieldProps: { listType: 'picture-card' },
        imageProps: { alt: 'preview' },
      },
    })
    expect(wrapper.text()).not.toContain('Add photo')
    expect(wrapper.findComponent(Upload).props('maxCount')).toBe(1)
    await wrapper.setProps({ max: 2 })
    expect(wrapper.text()).toContain('Add photo')
    wrapper.findComponent(Upload).props('onPreview')!(files[0]!)
    await flushPromises()
    expect(wrapper.findComponent(Image).props('src')).toBe('/photo.png')
    expect(wrapper.findComponent(Image).props('preview')).toMatchObject({ open: true })
    wrapper.unmount()
  })
  it('validates phoneName before sending captcha and exposes countdown controls', async () => {
    vi.useFakeTimers()
    const request = vi.fn(async () => true)
    const timing = vi.fn()
    const wrapper = mount(library.ProForm, {
      props: { initialValues: { phone: '13800000000' }, submitter: false },
      slots: {
        default: () => [
          h(library.ProFormText, {
            name: 'phone',
            rules: [{ pattern: /^1\d{10}$/, message: 'Invalid phone' }],
          }),
          h(library.ProFormCaptcha, {
            phoneName: 'phone',
            countDown: 3,
            onGetCaptcha: request,
            onTiming: timing,
            captchaTextRender: (running: boolean, count: number) =>
              running ? `${count} remaining` : 'Send',
          }),
        ],
      },
    })
    const field = wrapper.findComponent(library.ProFormCaptcha)
    await field.findComponent(Button).trigger('click')
    await flushPromises()
    expect(request).toHaveBeenCalledWith('13800000000')
    expect(field.text()).toContain('3 remaining')
    await vi.advanceTimersByTimeAsync(1000)
    expect(timing).toHaveBeenLastCalledWith(2)
    ;(field.vm as unknown as { endTiming: () => void }).endTiming()
    await flushPromises()
    expect(field.text()).toContain('Send')
    wrapper.findComponent(Input).vm.$emit('update:value', 'invalid')
    await flushPromises()
    await field.findComponent(Button).trigger('click')
    await flushPromises()
    expect(request).toHaveBeenCalledTimes(1)
    wrapper.unmount()
    vi.useRealTimers()
  })
})

const date = dayjs('2026-10-21')
const extraFields: Array<[keyof typeof library, Component, unknown, string, unknown]> = [
  ['ProFormCascader', Cascader, ['a'], 'value', []],
  ['ProFormColorPicker', ColorPicker, '#1677ff', 'value', ''],
  ['ProFormRate', Rate, 3, 'value', 0],
  ['ProFormDigitRange', DigitRange, [1, 5], 'value', [null, null]],
  ['ProFormTimePicker', TimePicker, date, 'value', null],
  ['ProFormTimeRangePicker', TimeRangePicker, [date, date], 'value', null],
  ['ProFormRadio', Radio, true, 'checked', false],
  ['ProFormCheckboxGroup', CheckboxGroup, ['a'], 'value', []],
  ...(['Week', 'Month', 'Quarter', 'Year'] as const).flatMap(
    (picker) =>
      [
        [`ProFormDate${picker}Picker`, DatePicker, date, 'value', null],
        [`ProFormDate${picker}RangePicker`, DateRangePicker, [date, date], 'value', null],
      ] as Array<[keyof typeof library, Component, unknown, string, unknown]>,
  ),
]

describe('additional named fields and form registration', () => {
  it.each(extraFields)(
    '%s controls values and clears through its native protocol',
    async (name, native, value, prop, cleared) => {
      const wrapper = mount(library[name] as Component, {
        props: {
          fieldMode: 'field',
          modelValue: value,
          ...(name === 'ProFormCascader' || name === 'ProFormCheckboxGroup' ? { options } : {}),
        },
      })
      const control = wrapper.findComponent(native)
      expect((control.props() as Record<string, unknown>)[prop]).toEqual(value)
      control.vm.$emit(`update:${prop}`, cleared)
      expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([cleared])
      await wrapper.setProps({ modelValue: cleared })
      expect((control.props() as Record<string, unknown>)[prop]).toEqual(cleared)
      if (name.startsWith('ProFormDate'))
        expect((control.props() as Record<string, unknown>).picker).toBe(
          name
            .replace('ProFormDate', '')
            .replace('RangePicker', '')
            .replace('Picker', '')
            .toLowerCase(),
        )
      wrapper.unmount()
    },
  )
  it.each(extraFields)('%s provides readonly output', (name, _native, value) => {
    const wrapper = mount(library[name] as Component, {
      props: {
        fieldMode: 'field',
        modelValue: value,
        readonly: true,
        ...(name === 'ProFormCascader' || name === 'ProFormCheckboxGroup' ? { options } : {}),
      },
    })
    expect(wrapper.find('input,textarea,button').exists()).toBe(false)
    if (name === 'ProFormRate') expect(wrapper.findComponent(Rate).props('disabled')).toBe(true)
    else if (name === 'ProFormColorPicker')
      expect(wrapper.findComponent(ColorPicker).props('open')).toBe(false)
    else expect(wrapper.text().length).toBeGreaterThan(0)
    wrapper.unmount()
  })
  it.each(extraFields)(
    '%s registers named values and changes in ProForm',
    async (name, native, value, prop, cleared) => {
      const wrapper = mount(library.ProForm, {
        props: { initialValues: { sample: value }, submitter: false },
        slots: {
          default: () =>
            h(library[name] as Component, {
              name: 'sample',
              ...(name === 'ProFormCascader' || name === 'ProFormCheckboxGroup' ? { options } : {}),
            }),
        },
      })
      await flushPromises()
      expect((wrapper.findComponent(native).props() as Record<string, unknown>)[prop]).toEqual(
        value,
      )
      wrapper.findComponent(native).vm.$emit(`update:${prop}`, cleared)
      await flushPromises()
      expect(
        (
          wrapper.vm as unknown as { getFieldsValue: () => Record<string, unknown> }
        ).getFieldsValue().sample,
      ).toEqual(cleared)
      wrapper.unmount()
    },
  )
})
