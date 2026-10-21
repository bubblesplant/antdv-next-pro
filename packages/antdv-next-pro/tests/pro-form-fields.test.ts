import { flushPromises, mount, shallowMount } from '@vue/test-utils'
import {
  Button,
  Checkbox,
  CheckboxGroup,
  DatePicker,
  DateRangePicker,
  FormItem,
  Input,
  InputNumber,
  RadioGroup,
  Segmented,
  Select,
  Slider,
  Switch,
  TreeSelect,
  Upload,
} from 'antdv-next'
import { Comment, createApp, defineComponent, h, isVNode, type Component, type VNode } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'

import {
  AntdvNextPro,
  FieldControl,
  ProFormCaptcha,
  ProFormCheckbox,
  ProFormDatePicker,
  ProFormDateRangePicker,
  ProFormDateTimePicker,
  ProFormDateTimeRangePicker,
  ProFormDigit,
  ProFormField,
  ProFormMoney,
  ProFormRadio,
  ProFormRadioGroup,
  ProFormSegmented,
  ProFormSelect,
  ProFormSlider,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
  ProFormTextPassword,
  ProFormTreeSelect,
  ProFormUploadButton,
  ProFormUploadDragger,
  ReadonlyField,
  resolveFieldDescriptor,
} from '../src'

afterEach(() => {
  vi.useRealTimers()
})

describe('ProFormFields public surface', () => {
  const publicFields: Array<readonly [string, Component, string]> = [
    ['ProFormText', ProFormText, 'text'],
    ['ProFormDigit', ProFormDigit, 'digit'],
    ['ProFormTextPassword', ProFormTextPassword, 'password'],
    ['ProFormTextArea', ProFormTextArea, 'textarea'],
    ['ProFormCaptcha', ProFormCaptcha, 'captcha'],
    ['ProFormDatePicker', ProFormDatePicker, 'date'],
    ['ProFormDateTimePicker', ProFormDateTimePicker, 'dateTime'],
    ['ProFormDateRangePicker', ProFormDateRangePicker, 'dateRange'],
    ['ProFormDateTimeRangePicker', ProFormDateTimeRangePicker, 'dateTimeRange'],
    ['ProFormSelect', ProFormSelect, 'select'],
    ['ProFormTreeSelect', ProFormTreeSelect, 'treeSelect'],
    ['ProFormCheckbox', ProFormCheckbox, 'checkbox'],
    ['ProFormRadioGroup', ProFormRadioGroup, 'radioGroup'],
    ['ProFormSlider', ProFormSlider, 'slider'],
    ['ProFormSwitch', ProFormSwitch, 'switch'],
    ['ProFormUploadButton', ProFormUploadButton, 'uploadButton'],
    ['ProFormUploadDragger', ProFormUploadDragger, 'uploadDragger'],
    ['ProFormMoney', ProFormMoney, 'money'],
    ['ProFormSegmented', ProFormSegmented, 'segmented'],
  ]

  it('exposes 19 independent wrappers with stable field mappings', () => {
    for (const [name, component, fieldType] of publicFields) {
      const wrapper = shallowMount(component, {
        props: name === 'ProFormCaptcha' ? { onGetCaptcha: vi.fn() } : {},
        global: {
          stubs: {
            ProFormField: defineComponent({
              name: 'AntdvNextProFormField',
              props: ['fieldType', 'prefix'],
              inheritAttrs: false,
              setup: () => () => h('span'),
            }),
          },
        },
      })
      expect(wrapper.findComponent(ProFormField).props('fieldType'), name).toBe(fieldType)
      wrapper.unmount()
    }

    expect(resolveFieldDescriptor('checkbox', false).component).toBe(Checkbox)
    expect(resolveFieldDescriptor('checkbox', true).component).toBe(CheckboxGroup)
    expect(resolveFieldDescriptor('switch').valueProp).toBe('checked')
    expect(resolveFieldDescriptor('uploadButton').valueProp).toBe('fileList')
  })

  it('provides template-friendly aliases and registers all public names', () => {
    expect(ProFormText.Password).toBe(ProFormTextPassword)
    expect(ProFormRadio.Group).toBe(ProFormRadioGroup)
    expect(ProFormRadio).toHaveProperty('setup')

    const app = createApp({ render: () => null })
    app.use(AntdvNextPro)
    for (const [name, component] of publicFields) {
      expect(app.component(name), name).toBe(component)
    }
  })
})

describe('ProFormField composition', () => {
  it('keeps FieldControl as the direct FormItem child and routes form attrs and slots', () => {
    let directControl: VNode | undefined
    let formItemAttrs: Record<string, unknown> = {}
    const FormItemStub = defineComponent({
      name: 'FormItem',
      inheritAttrs: false,
      setup(_, { attrs, slots }) {
        return () => {
          formItemAttrs = { ...attrs }
          const children = (slots.default?.() ?? []).filter(
            (child) => isVNode(child) && child.type !== Comment,
          )
          directControl = children.find((child) => child.type === FieldControl) as VNode | undefined
          return h('section', attrs, [
            h('span', { 'data-testid': 'label-slot' }, slots.label?.()),
            ...children,
          ])
        }
      },
    })
    const rules = [{ required: true }]
    const wrapper = mount(ProFormText, {
      props: {
        name: 'top-name',
        rules,
        formItemProps: { class: 'from-form-item', name: 'nested-name' } as never,
        fieldProps: { class: 'from-field' } as never,
      },
      attrs: { class: 'from-attrs', 'data-testid': 'form-item' },
      slots: { label: () => 'Display name' },
      global: { stubs: { AFormItem: FormItemStub, FormItem: FormItemStub } },
    })

    expect(directControl?.type).toBe(FieldControl)
    expect(formItemAttrs.name).toEqual(['top-name'])
    expect(formItemAttrs.rules).toEqual(rules)
    expect(wrapper.get('section').classes()).toEqual(
      expect.arrayContaining(['from-form-item', 'from-attrs']),
    )
    expect(wrapper.findComponent(Input).attributes('data-testid')).toBe('form-item')
    expect(wrapper.get('[data-testid="label-slot"]').text()).toBe('Display name')
    expect(wrapper.findComponent(Input).classes()).toContain('from-field')
  })

  it('renders only the field in field mode and sends fallthrough attrs to the control', () => {
    const wrapper = mount(ProFormText, {
      props: { fieldMode: 'field', modelValue: 'Ada' },
      attrs: { class: 'field-root', 'data-testid': 'field-root' },
    })

    expect(wrapper.findComponent(FormItem).exists()).toBe(false)
    const input = wrapper.findComponent(Input)
    expect(input.props('value')).toBe('Ada')
    expect(input.attributes('data-testid')).toBe('field-root')
    expect(input.classes()).toContain('field-root')
  })
})

describe('FieldControl behavior', () => {
  it('bridges value, checked and fileList through modelValue', () => {
    const files = [{ uid: '1', name: 'before.txt' }]
    const nextFiles = [{ uid: '2', name: 'after.txt' }]
    const cases: Array<{
      fieldType: 'text' | 'switch' | 'uploadButton'
      component: Component
      valueProp: 'value' | 'checked' | 'fileList'
      updateEvent: 'update:value' | 'update:checked' | 'update:fileList'
      value: unknown
      nextValue: unknown
    }> = [
      {
        fieldType: 'text',
        component: Input,
        valueProp: 'value',
        updateEvent: 'update:value',
        value: 'before',
        nextValue: 'after',
      },
      {
        fieldType: 'switch',
        component: Switch,
        valueProp: 'checked',
        updateEvent: 'update:checked',
        value: false,
        nextValue: true,
      },
      {
        fieldType: 'uploadButton',
        component: Upload,
        valueProp: 'fileList',
        updateEvent: 'update:fileList',
        value: files,
        nextValue: nextFiles,
      },
    ]

    for (const item of cases) {
      const wrapper = shallowMount(FieldControl, {
        props: { fieldType: item.fieldType, modelValue: item.value },
      })
      const control = wrapper.findComponent(item.component)
      expect((control.props() as Record<string, unknown>)[item.valueProp], item.fieldType).toEqual(
        item.value,
      )
      control.vm.$emit(item.updateEvent, item.nextValue)
      expect(wrapper.emitted('update:modelValue'), item.fieldType).toEqual([[item.nextValue]])
      wrapper.unmount()
    }
  })

  it('lets fieldProps override convenient props and preserves disabled defaults explicitly', () => {
    const inherited = mount(ProFormDigit, {
      props: {
        fieldMode: 'field',
        fieldProps: { disabled: true, precision: 4, min: -3 },
      },
    }).findComponent(InputNumber)
    expect(inherited.props()).toMatchObject({ disabled: true, precision: 4, min: -3 })

    const explicit = mount(ProFormDigit, {
      props: {
        fieldMode: 'field',
        disabled: false,
        precision: false,
        min: false,
        fieldProps: { disabled: true, precision: 4, min: -3 },
      },
    }).findComponent(InputNumber)
    expect(explicit.props('disabled')).toBe(true)
    expect(explicit.props('precision')).toBe(4)
    expect(explicit.props('min')).toBe(-3)

    const defaults = shallowMount(FieldControl, { props: { fieldType: 'digit' } })
    expect(defaults.findComponent(InputNumber).props()).toMatchObject({ min: 0 })
    expect(defaults.findComponent(InputNumber).props('precision')).toBeUndefined()
    const money = shallowMount(FieldControl, { props: { fieldType: 'money' } })
    expect(money.findComponent(InputNumber).props('prefix')).toBe('¥')
    const dateTime = shallowMount(FieldControl, { props: { fieldType: 'dateTime' } })
    expect(dateTime.findComponent(DatePicker).props('showTime')).toBe(true)
  })

  it('combines field callbacks before public update and change listeners', () => {
    const calls: string[] = []
    const wrapper = mount(ProFormText, {
      props: {
        fieldMode: 'field',
        fieldProps: {
          'onUpdate:value': () => calls.push('field update'),
          onChange: () => calls.push('field change'),
        },
        'onUpdate:modelValue': () => calls.push('public update'),
        onChange: () => calls.push('public change'),
      },
    })
    const input = wrapper.findComponent(Input)

    input.vm.$emit('update:value', 'Grace')
    input.vm.$emit('change', { target: { value: 'Grace' } })
    expect(calls).toEqual(['field update', 'public update', 'field change', 'public change'])
  })

  it('uses the shared readonly output for empty, falsy, password and upload values', async () => {
    const wrapper = mount(FieldControl, {
      props: {
        fieldType: 'text',
        modelValue: 0,
        readonly: true,
        emptyText: 'N/A',
        fieldProps: { class: 'readonly-field' },
      },
      attrs: { 'data-testid': 'readonly' },
    })
    expect(wrapper.findComponent(ReadonlyField).text()).toBe('0')
    expect(wrapper.get('[data-testid="readonly"]').classes()).toContain('readonly-field')

    await wrapper.setProps({ modelValue: undefined })
    expect(wrapper.findComponent(ReadonlyField).text()).toBe('N/A')
    await wrapper.setProps({ fieldType: 'switch', modelValue: false })
    expect(wrapper.findComponent(ReadonlyField).text()).toBe('关闭')
    await wrapper.setProps({ fieldType: 'password', modelValue: 'secret' })
    expect(wrapper.findComponent(ReadonlyField).text()).toBe('••••••')

    await wrapper.setProps({
      fieldType: 'uploadButton',
      modelValue: [
        { uid: '1', name: 'one.txt' },
        { uid: '2', name: 'two.txt' },
      ],
    })
    expect(wrapper.text()).toContain('one.txt, two.txt')
    expect(wrapper.findComponent(Upload).exists()).toBe(false)
  })

  it('loads request options and reports request failures without dropping local fallback', async () => {
    const pending = deferred<Array<{ label: string; value: string }>>()
    const request = vi.fn(() => pending.promise)
    const wrapper = shallowMount(FieldControl, {
      props: {
        fieldType: 'select',
        options: [{ label: 'Local', value: 'local' }],
        request,
      },
    })
    expect(wrapper.findComponent(Select).props('options')).toEqual([
      { label: 'Local', value: 'local', disabled: false },
    ])

    pending.resolve([{ label: 'Remote', value: 'remote' }])
    await flushPromises()
    expect(wrapper.findComponent(Select).props('options')).toEqual([
      { label: 'Remote', value: 'remote', disabled: false },
    ])

    const error = new Error('failed')
    const failed = shallowMount(FieldControl, {
      props: {
        fieldType: 'select',
        options: [{ label: 'Fallback', value: 'fallback' }],
        request: async () => Promise.reject(error),
      },
    })
    await flushPromises()
    expect(failed.emitted('requestError')).toEqual([[error]])
    expect(failed.findComponent(Select).props('options')).toEqual([
      { label: 'Fallback', value: 'fallback', disabled: false },
    ])
  })
})

describe('ProFormFields specialized protocols', () => {
  it('normalizes nested TreeSelect options from local and request sources and resolves readonly labels', async () => {
    const localOptions = [
      {
        title: 'Local root',
        id: 1,
        children: [
          {
            text: 'Local child',
            key: 2,
            children: [{ name: 'Local leaf', id: 3 }],
          },
        ],
      },
    ]
    const local = shallowMount(FieldControl, {
      props: {
        fieldType: 'treeSelect',
        modelValue: 2,
        options: localOptions as never,
      },
    })
    const localTree = local.findComponent(TreeSelect)
    expect(localTree.props('treeData')).toEqual([
      {
        title: 'Local root',
        id: 1,
        label: 'Local root',
        value: 1,
        disabled: false,
        children: [
          {
            text: 'Local child',
            key: 2,
            title: 'Local child',
            label: 'Local child',
            value: 2,
            disabled: false,
            children: [
              {
                name: 'Local leaf',
                id: 3,
                title: 'Local leaf',
                label: 'Local leaf',
                value: 3,
                disabled: false,
              },
            ],
          },
        ],
      },
    ])
    localTree.vm.$emit('update:value', 3)
    expect(local.emitted('update:modelValue')).toEqual([[3]])

    const readonly = mount(FieldControl, {
      props: {
        fieldType: 'treeSelect',
        modelValue: 3,
        readonly: true,
        options: localOptions as never,
      },
    })
    expect(readonly.findComponent(ReadonlyField).text()).toBe('Local leaf')

    const request = vi.fn(async () => [
      {
        label: 'Remote root',
        value: 'remote-root',
        children: [{ name: 'Remote child', key: 'remote-child' }],
      },
    ])
    const remote = shallowMount(FieldControl, {
      props: { fieldType: 'treeSelect', request },
    })
    await flushPromises()
    expect(request).toHaveBeenCalledOnce()
    expect(remote.findComponent(TreeSelect).props('treeData')).toEqual([
      {
        label: 'Remote root',
        title: 'Remote root',
        value: 'remote-root',
        disabled: false,
        children: [
          {
            name: 'Remote child',
            key: 'remote-child',
            label: 'Remote child',
            title: 'Remote child',
            value: 'remote-child',
            disabled: false,
          },
        ],
      },
    ])
  })

  it('bridges Slider and Segmented values while preserving their field properties', () => {
    const slider = shallowMount(FieldControl, {
      props: {
        fieldType: 'slider',
        modelValue: [10, 20],
        fieldProps: { range: true, min: 0, max: 100, step: 5, disabled: true },
      },
    })
    const sliderControl = slider.findComponent(Slider)
    expect(sliderControl.props()).toMatchObject({
      value: [10, 20],
      range: true,
      min: 0,
      max: 100,
      step: 5,
      disabled: true,
    })
    sliderControl.vm.$emit('update:value', [25, 50])
    expect(slider.emitted('update:modelValue')).toEqual([[[25, 50]]])

    const segmented = shallowMount(FieldControl, {
      props: {
        fieldType: 'segmented',
        modelValue: 'list',
        options: [
          { label: 'List', value: 'list' },
          { label: 'Grid', value: 'grid' },
        ],
        fieldProps: { block: true, size: 'large' },
      },
    })
    const segmentedControl = segmented.findComponent(Segmented)
    expect(segmentedControl.props()).toMatchObject({
      value: 'list',
      block: true,
      size: 'large',
      options: [
        { label: 'List', value: 'list', disabled: false },
        { label: 'Grid', value: 'grid', disabled: false },
      ],
    })
    segmentedControl.vm.$emit('update:value', 'grid')
    expect(segmented.emitted('update:modelValue')).toEqual([['grid']])
  })

  it('applies Checkbox layout and refreshes Radio options asynchronously', async () => {
    const checkbox = mount(FieldControl, {
      props: {
        fieldType: 'checkbox',
        modelValue: ['read'],
        layout: 'vertical',
        options: [
          { label: 'Read', value: 'read' },
          { label: 'Write', value: 'write' },
        ],
      },
    })
    expect(checkbox.get('.ant-pro-field-checkbox-group').classes()).toContain(
      'ant-pro-field-checkbox-group-vertical',
    )
    const checkboxGroup = checkbox.findComponent(CheckboxGroup)
    expect(checkboxGroup.props('value')).toEqual(['read'])
    checkboxGroup.vm.$emit('update:value', ['read', 'write'])
    expect(checkbox.emitted('update:modelValue')).toEqual([[['read', 'write']]])

    const pending = deferred<Array<{ text: string; id: number }>>()
    const radio = shallowMount(FieldControl, {
      props: {
        fieldType: 'radio',
        options: [{ label: 'Local', value: 0 }],
        request: () => pending.promise,
      },
    })
    expect(radio.findComponent(RadioGroup).props('options')).toEqual([
      { label: 'Local', value: 0, disabled: false },
    ])
    pending.resolve([
      { text: 'First', id: 1 },
      { text: 'Second', id: 2 },
    ])
    await flushPromises()
    expect(radio.findComponent(RadioGroup).props('options')).toEqual([
      { text: 'First', id: 1, label: 'First', value: 1, disabled: false },
      { text: 'Second', id: 2, label: 'Second', value: 2, disabled: false },
    ])
  })

  it('bridges update and clear events for all four date field variants', () => {
    const cases: Array<{
      fieldType: 'date' | 'dateTime' | 'dateRange' | 'dateTimeRange'
      component: Component
      value: unknown
      nextValue: unknown
    }> = [
      { fieldType: 'date', component: DatePicker, value: '2026-09-14', nextValue: '2026-09-15' },
      {
        fieldType: 'dateTime',
        component: DatePicker,
        value: '2026-09-14 09:00:00',
        nextValue: '2026-09-14 10:00:00',
      },
      {
        fieldType: 'dateRange',
        component: DateRangePicker,
        value: ['2026-09-14', '2026-09-15'],
        nextValue: ['2026-09-16', '2026-09-17'],
      },
      {
        fieldType: 'dateTimeRange',
        component: DateRangePicker,
        value: ['2026-09-14 09:00:00', '2026-09-14 10:00:00'],
        nextValue: ['2026-09-14 11:00:00', '2026-09-14 12:00:00'],
      },
    ]

    for (const item of cases) {
      const wrapper = shallowMount(FieldControl, {
        props: {
          fieldType: item.fieldType,
          modelValue: item.value,
          fieldProps: {
            valueFormat: item.fieldType.includes('Time') ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD',
          },
        },
      })
      const control = wrapper.findComponent(item.component)
      const controlProps = control.props() as Record<string, unknown>
      expect(controlProps.value, item.fieldType).toEqual(item.value)
      if (item.fieldType === 'dateTime' || item.fieldType === 'dateTimeRange') {
        expect(controlProps.showTime, item.fieldType).toBe(true)
      }
      control.vm.$emit('update:value', item.nextValue)
      control.vm.$emit('update:value', null)
      expect(wrapper.emitted('update:modelValue'), item.fieldType).toEqual([
        [item.nextValue],
        [null],
      ])
      wrapper.unmount()
    }
  })

  it('passes Money formatter/parser and keeps string values intact', () => {
    const formatter = vi.fn((value: string | number | undefined) => `$ ${value ?? ''}`)
    const parser = vi.fn((value: string | undefined) => value?.replace(/\$\s?/g, '') ?? '')
    const wrapper = shallowMount(FieldControl, {
      props: {
        fieldType: 'money',
        modelValue: '1234.50',
        prefix: false,
        fieldProps: { formatter, parser, stringMode: true, precision: 2 },
      },
    })
    const control = wrapper.findComponent(InputNumber)
    expect(control.props()).toMatchObject({
      value: '1234.50',
      formatter,
      parser,
      stringMode: true,
      precision: 2,
    })
    expect(control.props('prefix')).toBeUndefined()
    expect((control.props('formatter') as typeof formatter)('12')).toBe('$ 12')
    expect((control.props('parser') as typeof parser)('$ 12')).toBe('12')
    control.vm.$emit('update:value', '12.00')
    expect(wrapper.emitted('update:modelValue')).toEqual([['12.00']])
  })
})

describe('Captcha and Upload fields', () => {
  it('starts, blocks and explicitly resets the captcha countdown', async () => {
    vi.useFakeTimers()
    const pending = deferred<void>()
    const onGetCaptcha = vi.fn(() => pending.promise)
    const wrapper = mount(ProFormCaptcha, {
      props: { fieldMode: 'field', onGetCaptcha, countDown: 2 },
    })
    const button = wrapper.findComponent(Button)

    await button.trigger('click')
    await button.trigger('click')
    expect(onGetCaptcha).toHaveBeenCalledOnce()
    expect(button.props('loading')).toBe(true)

    pending.resolve()
    await flushPromises()
    expect(button.text()).toContain('2 秒后重新获取')
    await vi.advanceTimersByTimeAsync(1000)
    expect(button.text()).toContain('1 秒后重新获取')

    ;(wrapper.vm as unknown as { resetCountdown: () => void }).resetCountdown()
    await wrapper.vm.$nextTick()
    expect(button.text()).toContain('获取验证码')
  })

  it('does not start a captcha countdown after false or rejection', async () => {
    const cancelled = mount(ProFormCaptcha, {
      props: { fieldMode: 'field', onGetCaptcha: async () => false },
    })
    await cancelled.findComponent(Button).trigger('click')
    await flushPromises()
    expect(cancelled.emitted('captchaError')).toEqual([[false]])
    expect(cancelled.findComponent(Button).text()).toContain('获取验证码')

    const error = new Error('captcha failed')
    const rejected = mount(ProFormCaptcha, {
      props: { fieldMode: 'field', onGetCaptcha: async () => Promise.reject(error) },
    })
    await rejected.findComponent(Button).trigger('click')
    await flushPromises()
    expect(rejected.emitted('captchaError')).toEqual([[error]])
    expect(rejected.findComponent(Button).props('loading')).toBe(false)
  })

  it('bridges upload events and prevents an implicit network transport', () => {
    const beforeUpload = vi.fn(() => true)
    const file = { uid: '1', name: 'report.pdf' }
    const nextFiles = [file]
    const wrapper = shallowMount(FieldControl, {
      props: {
        fieldType: 'uploadDragger',
        modelValue: [],
        fieldProps: { beforeUpload },
      },
    })
    const upload = wrapper.findComponent(Upload)
    const resolvedUpload = upload.exists()
      ? upload
      : wrapper.findComponent(resolveFieldDescriptor('uploadDragger').component)

    const uploadProps = resolvedUpload.props() as Record<string, unknown>
    const resolvedBeforeUpload = uploadProps.beforeUpload as (...args: unknown[]) => unknown
    expect(resolvedBeforeUpload(file, nextFiles)).toBe(false)
    expect(beforeUpload).toHaveBeenCalledWith(file, nextFiles)
    resolvedUpload.vm.$emit('update:fileList', nextFiles)
    resolvedUpload.vm.$emit('change', { file, fileList: nextFiles })
    resolvedUpload.vm.$emit('drop', { type: 'drop' })
    expect(wrapper.emitted('update:modelValue')).toEqual([[nextFiles]])
    expect(wrapper.emitted('change')).toHaveLength(1)
    expect(wrapper.emitted('drop')).toEqual([[{ type: 'drop' }]])
  })

  it('renders custom button and dragger contents through the default slot', () => {
    const UploadSlotStub = defineComponent({
      name: 'AUpload',
      setup(_, { slots }) {
        return () => h('div', { 'data-testid': 'upload-slot' }, slots.default?.())
      },
    })
    const UploadDraggerSlotStub = defineComponent({
      name: 'AUploadDragger',
      setup(_, { slots }) {
        return () => h('div', { 'data-testid': 'dragger-slot' }, slots.default?.())
      },
    })
    const button = mount(FieldControl, {
      props: { fieldType: 'uploadButton' },
      slots: {
        default: () => h('span', { 'data-testid': 'button-content' }, 'Choose file'),
      },
      global: { stubs: { AUpload: UploadSlotStub } },
    })
    expect(button.get('[data-testid="upload-slot"]').attributes('data-testid')).toBe('upload-slot')
    expect(button.get('[data-testid="button-content"]').text()).toBe('Choose file')

    const dragger = mount(FieldControl, {
      props: { fieldType: 'uploadDragger' },
      slots: {
        default: () => h('span', { 'data-testid': 'dragger-content' }, 'Drop files here'),
      },
      global: { stubs: { AUploadDragger: UploadDraggerSlotStub } },
    })
    expect(dragger.get('[data-testid="dragger-slot"]').attributes('data-testid')).toBe(
      'dragger-slot',
    )
    expect(dragger.get('[data-testid="dragger-content"]').text()).toBe('Drop files here')
  })
})

function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })
  return { promise, resolve, reject }
}
