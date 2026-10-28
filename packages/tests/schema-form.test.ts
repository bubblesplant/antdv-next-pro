import { flushPromises, mount, shallowMount } from '@vue/test-utils'
import {
  Button,
  FormItem,
  Input,
  Segmented,
  Select,
  Slider,
  TimeRangePicker,
  TreeSelect,
} from 'antdv-next'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import {
  Comment,
  cloneVNode,
  createApp,
  defineComponent,
  h,
  isVNode,
  type Component,
  type VNode,
  type VNodeChild,
} from 'vue'

import AntdvNextPro from '../src'
import FieldControl from '../src/pro-form-fields/FieldControl.vue'
import SchemaForm from '../src/SchemaForm.vue'
import SchemaFormBody from '../src/schema-form/SchemaFormBody.vue'
import { SchemaFormField } from '../src/schema-form/SchemaFormField'
import SchemaFormFieldItem from '../src/schema-form/SchemaFormFieldItem.vue'
import {
  DrawerForm,
  Embed,
  Form,
  LightFilter,
  ModalForm,
  QueryFilter,
  StepForm,
  StepsForm,
} from '../src/schema-form'
import type {
  SchemaFormColumn,
  SchemaFormFieldSlotProps,
  SchemaFormInstance,
  SchemaFormStepContentSlotProps,
} from '../src/types'
import type { FormRecord } from '../src/schema-form/utils'

afterEach(() => {
  window.history.replaceState({}, '', '/')
})

describe('SchemaForm', () => {
  it('initializes, updates and submits through the public instance API', async () => {
    const amountTransform = vi.fn((value: unknown) => Number(value) * 100)
    const nameTransform = vi.fn((value: unknown) => ({
      displayName: String(value).trim(),
    }))
    const columns: SchemaFormColumn<FormRecord>[] = [
      {
        dataIndex: 'amount',
        convertValue: (value) => Number(value),
        transform: amountTransform,
      },
      {
        dataIndex: 'name',
        transform: nameTransform,
      },
    ]
    const wrapper = shallowMount(SchemaForm, {
      props: {
        columns,
        initialValues: { amount: '12.5', name: 'Ada' },
      },
    })
    await flushPromises()
    const form = wrapper.vm as unknown as SchemaFormInstance<FormRecord>

    expect(form.getFieldsValue()).toEqual({ amount: 12.5, name: 'Ada' })
    form.setFieldsValue({ name: ' Grace ' })
    expect(form.getFieldsValue()).toEqual({ amount: 12.5, name: ' Grace ' })
    await expect(form.validate()).resolves.toEqual({ amount: 12.5, name: ' Grace ' })
    expect(amountTransform).not.toHaveBeenCalled()
    expect(nameTransform).not.toHaveBeenCalled()
    await expect(form.submit()).resolves.toEqual({ amount: 1250, displayName: 'Grace' })
    expect(amountTransform).toHaveBeenCalledTimes(1)
    expect(nameTransform).toHaveBeenCalledTimes(1)
    expect(wrapper.emitted('finish')?.at(-1)?.[0]).toEqual({
      amount: 1250,
      displayName: 'Grace',
    })

    form.reset()
    expect(form.getFieldsValue()).toEqual({ amount: 12.5, name: 'Ada' })
  })

  it('accepts only the latest request result when params change', async () => {
    const resolvers = new Map<number, (values: FormRecord) => void>()
    const request = vi.fn(
      (params?: Record<string, unknown>) =>
        new Promise<FormRecord>((resolve) => {
          resolvers.set(Number(params?.id), resolve)
        }),
    )
    const wrapper = shallowMount(SchemaForm, {
      props: {
        columns: [{ dataIndex: 'name' }],
        params: { id: 1 },
        request,
      },
    })
    await flushPromises()
    await wrapper.setProps({ params: { id: 2 } })
    await flushPromises()

    resolvers.get(2)?.({ name: 'latest' })
    await flushPromises()
    resolvers.get(1)?.({ name: 'stale' })
    await flushPromises()

    const form = wrapper.vm as unknown as SchemaFormInstance<FormRecord>
    expect(form.getFieldsValue()).toEqual({ name: 'latest' })
    expect(request).toHaveBeenCalledTimes(2)
  })

  it('controls dialog visibility with Vue model events and exposed methods', async () => {
    const wrapper = shallowMount(SchemaForm, {
      props: {
        columns: [{ dataIndex: 'name' }],
        layoutType: 'ModalForm',
        open: false,
      },
    })
    await flushPromises()
    const form = wrapper.vm as unknown as SchemaFormInstance<FormRecord>

    form.open()
    expect(wrapper.emitted('update:open')?.at(-1)).toEqual([true])
    form.close()
    expect(wrapper.emitted('update:open')?.at(-1)).toEqual([false])
  })

  it.each(['ModalForm', 'DrawerForm'] as const)(
    'provides trigger, title and footer slots for %s without duplicate submitters',
    async (layoutType) => {
      const DialogStub = defineComponent({
        name: 'DialogStub',
        inheritAttrs: false,
        setup(_props, { attrs, slots }) {
          return () =>
            h('section', { 'data-open': String(attrs.open) }, [
              h('header', {}, slots.title?.()),
              slots.default?.(),
              h('footer', {}, slots.footer?.()),
            ])
        },
      })
      const trigger = vi.fn(({ open, openForm }: { open: boolean; openForm: () => void }) =>
        h('button', { 'data-testid': 'dialog-trigger', onClick: openForm }, String(open)),
      )
      const title = vi.fn(({ title }: { title: VNodeChild }) =>
        h('strong', { 'data-testid': 'dialog-title' }, [title]),
      )
      const footer = vi.fn(({ close }: { close: () => void }) =>
        h('button', { 'data-testid': 'dialog-footer', onClick: close }, 'Close'),
      )
      const wrapper = shallowMount(SchemaForm, {
        props: {
          columns: [{ dataIndex: 'name' }],
          layoutType,
          open: false,
          title: 'Account',
        },
        slots: { trigger, title, footer },
        global: {
          stubs: {
            ADrawer: DialogStub,
            AModal: DialogStub,
          },
        },
      })
      await flushPromises()

      expect(wrapper.get('[data-testid="dialog-title"]').text()).toBe('Account')
      expect(wrapper.get('[data-testid="dialog-footer"]').text()).toBe('Close')
      expect(wrapper.findComponent(SchemaFormBody).props('submitter')).toBe(false)
      expect(trigger.mock.calls[0]?.[0].open).toBe(false)

      await wrapper.get('[data-testid="dialog-trigger"]').trigger('click')
      expect(wrapper.emitted('update:open')?.at(-1)).toEqual([true])
      wrapper.unmount()
    },
  )

  it('moves between grouped steps and emits controlled current state', async () => {
    const columns: SchemaFormColumn<FormRecord>[] = [
      { title: 'Account', valueType: 'group', columns: [{ dataIndex: 'name' }] },
      { title: 'Profile', valueType: 'group', columns: [{ dataIndex: 'bio' }] },
    ]
    const wrapper = shallowMount(SchemaForm, {
      props: { columns, layoutType: 'StepsForm', current: 0 },
    })
    await flushPromises()
    const form = wrapper.vm as unknown as SchemaFormInstance<FormRecord>

    await expect(form.next()).resolves.toBe(true)
    expect(wrapper.emitted('update:current')?.at(-1)).toEqual([1])
    form.prev()
    expect(wrapper.emitted('update:current')?.at(-1)).toEqual([0])
  })

  it('coalesces concurrent next validation and advances at most one step', async () => {
    let resolveValidation!: () => void
    const validateFields = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveValidation = resolve
        }),
    )
    const BodyStub = defineComponent({
      name: 'SchemaFormBody',
      setup(_, { expose }) {
        expose({ validateFields })
        return () => h('div')
      },
    })
    const columns: SchemaFormColumn<FormRecord>[] = [
      { title: 'Account', valueType: 'group', columns: [{ dataIndex: 'name' }] },
      { title: 'Profile', valueType: 'group', columns: [{ dataIndex: 'bio' }] },
      { title: 'Confirm', valueType: 'group', columns: [{ dataIndex: 'accepted' }] },
    ]
    const wrapper = shallowMount(SchemaForm, {
      props: { columns, layoutType: 'StepsForm', current: 0 },
      global: { stubs: { SchemaFormBody: BodyStub } },
    })
    await flushPromises()
    const form = wrapper.vm as unknown as SchemaFormInstance<FormRecord>

    const firstNavigation = form.next()
    const secondNavigation = form.next()
    expect(validateFields).toHaveBeenCalledTimes(1)

    resolveValidation()
    await expect(Promise.all([firstNavigation, secondNavigation])).resolves.toEqual([true, true])
    expect(wrapper.emitted('update:current')).toEqual([[1]])
    expect(wrapper.emitted('currentChange')).toEqual([[1]])
  })

  it('keeps the current step when concurrent next validation fails', async () => {
    let rejectValidation!: (reason?: unknown) => void
    const validationError = new Error('validation failed')
    const validateFields = vi.fn(
      () =>
        new Promise<void>((_, reject) => {
          rejectValidation = reject
        }),
    )
    const BodyStub = defineComponent({
      name: 'SchemaFormBody',
      setup(_, { expose }) {
        expose({ validateFields })
        return () => h('div')
      },
    })
    const columns: SchemaFormColumn<FormRecord>[] = [
      { title: 'Account', valueType: 'group', columns: [{ dataIndex: 'name' }] },
      { title: 'Profile', valueType: 'group', columns: [{ dataIndex: 'bio' }] },
    ]
    const wrapper = shallowMount(SchemaForm, {
      props: { columns, layoutType: 'StepsForm', current: 0 },
      global: { stubs: { SchemaFormBody: BodyStub } },
    })
    await flushPromises()
    const form = wrapper.vm as unknown as SchemaFormInstance<FormRecord>

    const firstNavigation = form.next()
    const secondNavigation = form.next()
    expect(validateFields).toHaveBeenCalledTimes(1)

    rejectValidation(validationError)
    await expect(Promise.all([firstNavigation, secondNavigation])).resolves.toEqual([false, false])
    expect(wrapper.emitted('update:current')).toBeUndefined()
    expect(wrapper.emitted('currentChange')).toBeUndefined()
    expect(wrapper.emitted('error')).toEqual([[validationError]])
  })

  it('routes forward step clicks through next validation and allows direct backward clicks', async () => {
    const SpinStub = defineComponent({
      name: 'Spin',
      setup(_, { slots }) {
        return () => h('div', slots.default?.())
      },
    })
    const StepsStub = defineComponent({
      name: 'Steps',
      emits: ['change'],
      setup(_, { emit }) {
        return () =>
          h('div', [
            h(
              'button',
              {
                'data-testid': 'forward-step',
                onClick: () => emit('change', 2),
              },
              'Forward',
            ),
            h(
              'button',
              {
                'data-testid': 'backward-step',
                onClick: () => emit('change', 0),
              },
              'Backward',
            ),
          ])
      },
    })
    const columns: SchemaFormColumn<FormRecord>[] = [
      { title: 'Account', valueType: 'group', columns: [{ dataIndex: 'name' }] },
      { title: 'Profile', valueType: 'group', columns: [{ dataIndex: 'bio' }] },
      { title: 'Confirm', valueType: 'group', columns: [{ dataIndex: 'accepted' }] },
    ]
    const wrapper = shallowMount(SchemaFormBody, {
      props: {
        columns,
        model: {},
        layoutType: 'StepsForm',
        current: 0,
      },
      global: {
        stubs: {
          ASpin: SpinStub,
          ASteps: StepsStub,
          Spin: SpinStub,
          Steps: StepsStub,
        },
      },
    })

    await wrapper.get('[data-testid="forward-step"]').trigger('click')
    expect(wrapper.emitted('next')).toHaveLength(1)
    expect(wrapper.emitted('currentChange')).toBeUndefined()

    await wrapper.setProps({ current: 2 })
    await wrapper.get('[data-testid="backward-step"]').trigger('click')
    expect(wrapper.emitted('currentChange')?.at(-1)).toEqual([0])
  })

  it('provides step title, content and action slots with navigation context', async () => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn(
        (query: string) =>
          ({
            matches: false,
            media: query,
            onchange: null,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            addListener: vi.fn(),
            removeListener: vi.fn(),
            dispatchEvent: vi.fn(() => false),
          }) satisfies MediaQueryList,
      ),
    })
    const columns: SchemaFormColumn<FormRecord>[] = [
      { title: 'Account', valueType: 'group', columns: [{ dataIndex: 'name' }] },
      { title: 'Profile', valueType: 'group', columns: [{ dataIndex: 'bio' }] },
    ]
    const stepTitle = vi.fn((slotProps: Record<string, unknown>) =>
      h('span', {}, `Custom ${String(slotProps.title)}`),
    )
    const stepContent = vi.fn((slotProps: Record<string, unknown>) => {
      const content = slotProps.content as () => VNodeChild
      return h('section', { 'data-testid': 'step-content' }, [content()])
    })
    const stepActions = vi.fn((slotProps: Record<string, unknown>) =>
      h(
        'button',
        {
          'data-testid': 'step-next',
          onClick: slotProps.next as () => void,
        },
        'Continue',
      ),
    )
    const wrapper = mount(SchemaFormBody, {
      props: {
        columns,
        model: { name: 'Ada' },
        layoutType: 'StepsForm',
        submitter: {},
        schemaSlots: {
          'step-title': stepTitle,
          'step-content': stepContent,
          'step-actions': stepActions,
        },
      },
    })

    expect(stepTitle).toHaveBeenCalled()
    expect(stepTitle.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({ current: 0, index: 0, title: 'Account' }),
    )
    expect(wrapper.find('[data-testid="step-content"]').exists()).toBe(true)
    expect(stepContent).toHaveBeenCalledWith(
      expect.objectContaining({ current: 0, values: { name: 'Ada' } }),
    )

    await wrapper.get('[data-testid="step-next"]').trigger('click')
    expect(wrapper.emitted('next')).toHaveLength(1)
    expect(stepActions.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({ current: 0, hasNext: true, hasPrevious: false }),
    )
    wrapper.unmount()
  })

  it('renders normalized parent slots through step content and template fields', async () => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn(
        (query: string) =>
          ({
            matches: false,
            media: query,
            onchange: null,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            addListener: vi.fn(),
            removeListener: vi.fn(),
            dispatchEvent: vi.fn(() => false),
          }) satisfies MediaQueryList,
      ),
    })
    let fieldPrefix = 'Initial'
    const renderFormItem = vi.fn(() => null)
    const columns: SchemaFormColumn<FormRecord>[] = [
      {
        title: 'Account',
        valueType: 'group',
        columns: [{ dataIndex: 'name', title: 'Name', renderFormItem }],
      },
    ]
    const fieldSlot = vi.fn((slotProps: SchemaFormFieldSlotProps<FormRecord>) =>
      h('strong', { 'data-testid': 'field-name' }, `${fieldPrefix}:${String(slotProps.value)}`),
    )
    const stepContent = vi.fn((slotProps: SchemaFormStepContentSlotProps<FormRecord>) => {
      const content = slotProps.content as () => VNodeChild
      return h('section', { 'data-testid': 'normalized-step-content' }, [content()])
    })
    const wrapper = mount(SchemaForm, {
      props: {
        columns,
        initialValues: { name: 'Ada' },
        layoutType: 'StepsForm',
        submitter: false,
      },
      slots: {
        'field-name': fieldSlot,
        'step-content': stepContent,
      },
    })
    await flushPromises()

    expect(wrapper.find('[data-testid="normalized-step-content"]').exists()).toBe(true)
    expect(wrapper.get('[data-testid="field-name"]').text()).toBe('Initial:Ada')
    expect(stepContent.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({ current: 0, values: { name: 'Ada' } }),
    )
    expect(fieldSlot.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({ value: 'Ada', record: { name: 'Ada' } }),
    )

    const fieldSlotCalls = fieldSlot.mock.calls.length
    const renderFormItemCalls = renderFormItem.mock.calls.length
    const initialStepContentProps = stepContent.mock.calls[stepContent.mock.calls.length - 1]?.[0]
    fieldPrefix = 'Updated'
    await wrapper.setProps({ grid: true })
    expect(wrapper.get('[data-testid="field-name"]').text()).toBe('Updated:Ada')
    expect(fieldSlot.mock.calls.length).toBeGreaterThan(fieldSlotCalls)
    expect(renderFormItem.mock.calls.length).toBeGreaterThan(renderFormItemCalls)
    expect(stepContent.mock.calls[stepContent.mock.calls.length - 1]?.[0]).not.toBe(
      initialStepContentProps,
    )
    wrapper.unmount()
  })

  it('preserves default control callback evaluation order on every render', async () => {
    const calls: string[] = []
    const slotDependencies: Array<unknown[] | undefined> = []
    const renderDependencies: Array<unknown[] | undefined> = []
    const slotUpdates: Array<(value: unknown) => void> = []
    const renderUpdates: Array<(value: unknown) => void> = []
    const renderContexts: object[] = []
    const fieldSlot = vi.fn((slotProps: SchemaFormFieldSlotProps<FormRecord>) => {
      calls.push('field slot')
      slotDependencies.push(slotProps.dependencies)
      slotUpdates.push(slotProps.update)
      return undefined
    })
    const renderFormItem = vi.fn(
      (
        _column: unknown,
        context: { dependencies?: unknown[]; update: (value: unknown) => void },
      ) => {
        calls.push('renderFormItem')
        renderContexts.push(context)
        renderDependencies.push(context.dependencies)
        renderUpdates.push(context.update)
        return null
      },
    )
    const fieldProps = vi.fn(() => {
      calls.push('fieldProps')
      return {}
    })
    const valueEnum = vi.fn(() => {
      calls.push('valueEnum')
      return { Ada: 'Ada' }
    })
    const formItemProps = vi.fn(() => {
      calls.push('formItemProps')
      return {}
    })
    const labelSlot = vi.fn(() => {
      calls.push('label slot')
      return undefined
    })
    const title = vi.fn(() => {
      calls.push('title')
      return 'Name'
    })
    const expectedOrder = [
      'field slot',
      'renderFormItem',
      'fieldProps',
      'valueEnum',
      'formItemProps',
      'label slot',
      'title',
    ]
    const wrapper = shallowMount(SchemaFormField, {
      props: {
        column: {
          dataIndex: 'name',
          dependencies: ['role'],
          valueType: 'select',
          title,
          valueEnum,
          fieldProps,
          formItemProps,
          renderFormItem,
        },
        model: { name: 'Ada', role: 'admin' },
        schemaSlots: {
          'field-name': fieldSlot,
          'label-name': labelSlot,
        },
        onValueChange: vi.fn(),
      },
    })

    expect(calls).toEqual(expectedOrder)
    calls.length = 0
    await wrapper.setProps({ grid: true })
    expect(calls).toEqual(expectedOrder)
    expect(slotDependencies[0]).toBe(renderDependencies[0])
    expect(slotDependencies[1]).toBe(renderDependencies[1])
    expect(slotDependencies[1]).not.toBe(slotDependencies[0])
    expect(slotUpdates[0]).toBe(renderUpdates[0])
    expect(slotUpdates[1]).toBe(renderUpdates[1])
    expect(slotUpdates[1]).not.toBe(slotUpdates[0])
    expect(renderContexts[1]).not.toBe(renderContexts[0])
    for (const callback of [
      fieldSlot,
      renderFormItem,
      fieldProps,
      valueEnum,
      formItemProps,
      labelSlot,
      title,
    ]) {
      expect(callback).toHaveBeenCalledTimes(2)
    }
    wrapper.unmount()
  })

  it('uses the shared FieldControl for the default schema control', () => {
    const fieldProps = { placeholder: 'Name' }
    const wrapper = shallowMount(SchemaFormField, {
      props: {
        column: { dataIndex: ['profile', 'name'], valueType: 'text', fieldProps },
        model: { profile: { name: 'Ada' } },
        onValueChange: vi.fn(),
      },
    })

    const state = wrapper.findComponent(SchemaFormFieldItem).props('state') as {
      defaultControl?: { component?: Component; componentProps?: Record<string, unknown> }
    }
    expect(state.defaultControl?.component).toBe(FieldControl)
    expect(state.defaultControl?.componentProps).toMatchObject({
      fieldType: 'text',
      modelValue: 'Ada',
      fieldProps,
      readonly: false,
      disabled: false,
    })
    wrapper.unmount()
  })

  it.each([
    ['treeSelect', TreeSelect, { treeData: [{ title: 'Node', value: 'node' }] }],
    ['slider', Slider, {}],
    ['segmented', Segmented, { options: ['First', 'Second'] }],
    ['timeRange', TimeRangePicker, {}],
  ] as const)('maps schema %s fields through FieldControl', (valueType, component, fieldProps) => {
    const wrapper = mount(SchemaFormField, {
      props: {
        column: { dataIndex: 'value', valueType, fieldProps },
        model: {},
        onValueChange: vi.fn(),
      },
    })

    expect(wrapper.findComponent(component).exists()).toBe(true)
    wrapper.unmount()
  })

  it('forwards schema requests, authoritative empty results and request errors', async () => {
    const emptyRequest = vi.fn(async () => [])
    const emptyWrapper = mount(SchemaFormField, {
      props: {
        column: {
          dataIndex: 'status',
          valueType: 'select',
          valueEnum: { local: 'Local' },
          params: { scope: 'active' },
          request: emptyRequest,
        },
        model: {},
        onValueChange: vi.fn(),
      },
    })

    await vi.waitFor(() => expect(emptyRequest).toHaveBeenCalledWith({ scope: 'active' }))
    await flushPromises()
    expect(emptyWrapper.findComponent(Select).props('options')).toEqual([])
    emptyWrapper.unmount()

    const requestError = new Error('network failed')
    const onFieldRequestError = vi.fn()
    const errorWrapper = mount(SchemaFormField, {
      props: {
        column: {
          dataIndex: 'status',
          valueType: 'select',
          valueEnum: { local: 'Local' },
          request: vi.fn().mockRejectedValue(requestError),
          onFieldRequestError,
        },
        model: {},
        onValueChange: vi.fn(),
      },
    })

    await vi.waitFor(() => expect(onFieldRequestError).toHaveBeenCalledOnce())
    await flushPromises()
    expect(onFieldRequestError).toHaveBeenCalledWith(requestError)
    expect(errorWrapper.findComponent(Select).props('options')).toEqual([
      expect.objectContaining({ label: 'Local', value: 'local' }),
    ])
    errorWrapper.unmount()
  })

  it('rereads an in-place column path mutation on the next render', async () => {
    const column: SchemaFormColumn<FormRecord> = { dataIndex: 'name' }
    const wrapper = mount(SchemaFormField, {
      props: {
        column,
        model: { name: 'Ada', age: 36 },
        schemaSlots: {
          'field-name': ({ value }: SchemaFormFieldSlotProps<FormRecord>) =>
            h('strong', { 'data-testid': 'current-field' }, `name:${String(value)}`),
          'field-age': ({ value }: SchemaFormFieldSlotProps<FormRecord>) =>
            h('strong', { 'data-testid': 'current-field' }, `age:${String(value)}`),
        },
        onValueChange: vi.fn(),
      },
    })

    expect(wrapper.get('[data-testid="current-field"]').text()).toBe('name:Ada')

    column.dataIndex = 'age'
    await wrapper.setProps({ grid: true })

    expect(wrapper.get('[data-testid="current-field"]').text()).toBe('age:36')
    wrapper.unmount()
  })

  it('resolves formList field props before its title without rendering buttons', async () => {
    const calls: string[] = []
    const fieldProps = vi.fn(() => {
      calls.push('fieldProps')
      return { creatorButtonText: 'Create' }
    })
    const title = vi.fn(() => {
      calls.push('title')
      return 'Members'
    })
    const wrapper = shallowMount(SchemaFormField, {
      props: {
        column: {
          dataIndex: 'members',
          valueType: 'formList',
          title,
          fieldProps,
        },
        model: { members: [] },
        readonly: true,
        onValueChange: vi.fn(),
      },
    })

    expect(calls).toEqual(['fieldProps', 'title'])
    calls.length = 0
    await wrapper.setProps({ grid: true })
    expect(calls).toEqual(['fieldProps', 'title'])
    expect(fieldProps).toHaveBeenCalledTimes(2)
    expect(title).toHaveBeenCalledTimes(2)
    wrapper.unmount()
  })

  it('keeps slot and renderFormItem controls as direct FormItem children', () => {
    for (const source of ['field slot', 'renderFormItem'] as const) {
      const testId = source === 'field slot' ? 'slot-control' : 'render-control'
      const fieldProps = vi.fn(() => ({}))
      const valueEnum = vi.fn(() => ({ Ada: 'Ada' }))
      let directControl: VNode | undefined
      const FormItemStub = defineComponent({
        name: 'FormItem',
        inheritAttrs: false,
        setup(_, { slots }) {
          return () => {
            const children = slots.default?.() ?? []
            const controlIndex = children.findIndex(
              (child) => isVNode(child) && child.props?.['data-testid'] === testId,
            )
            if (controlIndex >= 0) directControl = children[controlIndex] as VNode
            return h(
              'div',
              children.map((child, index) =>
                index === controlIndex && isVNode(child)
                  ? cloneVNode(child, {
                      id: 'injected-field-id',
                      'aria-describedby': 'injected-field-help',
                      'aria-invalid': 'true',
                    })
                  : child,
              ),
            )
          }
        },
      })
      const renderControl = () =>
        h('input', {
          'data-testid': testId,
        })
      const column: SchemaFormColumn<FormRecord> = {
        dataIndex: 'name',
        fieldProps,
        valueEnum,
        ...(source === 'renderFormItem' ? { renderFormItem: renderControl } : {}),
      }
      const schemaSlots = source === 'field slot' ? { 'field-name': renderControl } : {}
      const wrapper = mount(SchemaFormField, {
        props: {
          column,
          model: { name: 'Ada' },
          schemaSlots,
          onValueChange: vi.fn(),
        },
        global: {
          stubs: {
            AFormItem: FormItemStub,
            FormItem: FormItemStub,
          },
        },
      })

      expect(directControl?.type).toBe('input')
      expect(fieldProps).not.toHaveBeenCalled()
      expect(valueEnum).not.toHaveBeenCalled()
      const control = wrapper.get(`[data-testid="${testId}"]`)
      expect(control.attributes('id')).toBe('injected-field-id')
      expect(control.attributes('aria-describedby')).toBe('injected-field-help')
      expect(control.attributes('aria-invalid')).toBe('true')
      wrapper.unmount()
    }
  })

  it('leaves the default slot empty for a divider without a title', () => {
    let normalizedChildren: VNode[] = []
    const DividerStub = defineComponent({
      name: 'Divider',
      inheritAttrs: false,
      setup(_, { slots }) {
        return () => {
          normalizedChildren = (slots.default?.() ?? []).filter((child) => child.type !== Comment)
          return h('div', { 'data-testid': 'divider' })
        }
      },
    })
    const wrapper = mount(SchemaFormField, {
      props: {
        column: { valueType: 'divider' },
        model: {},
        onValueChange: vi.fn(),
      },
      global: {
        stubs: {
          ADivider: DividerStub,
          Divider: DividerStub,
        },
      },
    })

    expect(wrapper.find('[data-testid="divider"]').exists()).toBe(true)
    expect(normalizedChildren).toHaveLength(0)
    wrapper.unmount()
  })

  it('falls through attrs to the same branch root as the render implementation', async () => {
    const RootStub = defineComponent({
      name: 'SchemaFormFieldRootStub',
      inheritAttrs: false,
      setup(_, { attrs, slots }) {
        return () => h('div', attrs, slots.default?.())
      },
    })
    const global = {
      stubs: {
        ACol: RootStub,
        ADivider: RootStub,
        AFormItem: RootStub,
        Col: RootStub,
        Divider: RootStub,
        FormItem: RootStub,
      },
    }
    const scenarios: Array<{
      id: string
      column: SchemaFormColumn<FormRecord>
      model: FormRecord
      expectedClass?: string
      grid?: boolean
      readonly?: boolean
    }> = [
      {
        id: 'divider-root',
        column: { valueType: 'divider' },
        model: {},
      },
      {
        id: 'form-list-root',
        column: { dataIndex: 'members', valueType: 'formList' },
        model: { members: [] },
        expectedClass: 'antdv-next-pro-form-list',
        readonly: true,
      },
      {
        id: 'dependency-root',
        column: {
          valueType: 'dependency',
          renderFormItem: () => h('span', 'custom dependency'),
        },
        model: {},
        expectedClass: 'antdv-next-pro-dependency',
      },
      {
        id: 'group-root',
        column: { valueType: 'group' },
        model: {},
        expectedClass: 'antdv-next-pro-schema-group',
      },
      {
        id: 'grid-root',
        column: { dataIndex: 'name', colProps: { class: 'column-grid-root' } },
        model: { name: 'Ada' },
        expectedClass: 'column-grid-root',
        grid: true,
      },
    ]

    for (const scenario of scenarios) {
      const onClick = vi.fn()
      const wrapper = mount(SchemaFormField, {
        props: {
          column: scenario.column,
          model: scenario.model,
          grid: scenario.grid,
          readonly: scenario.readonly,
          onValueChange: vi.fn(),
        },
        attrs: {
          class: 'caller-root',
          'data-testid': scenario.id,
          onClick,
        },
        global,
      })
      const root = wrapper.get(`[data-testid="${scenario.id}"]`)
      expect(root.classes()).toContain('caller-root')
      if (scenario.expectedClass) expect(root.classes()).toContain(scenario.expectedClass)
      await root.trigger('click')
      expect(onClick).toHaveBeenCalledOnce()
      wrapper.unmount()
    }

    const clickOrder: string[] = []
    const formItemWrapper = mount(SchemaFormField, {
      props: {
        column: {
          dataIndex: 'name',
          formItemProps: {
            class: 'form-item-root',
            onClick: () => clickOrder.push('formItemProps'),
          },
        },
        model: { name: 'Ada' },
        onValueChange: vi.fn(),
      },
      attrs: {
        class: 'caller-root',
        'data-testid': 'form-item-root',
        onClick: () => clickOrder.push('attrs'),
      },
      global,
    })
    const formItemRoot = formItemWrapper.get('[data-testid="form-item-root"]')
    expect(formItemRoot.classes()).toEqual(
      expect.arrayContaining(['form-item-root', 'caller-root']),
    )
    await formItemRoot.trigger('click')
    expect(clickOrder).toEqual(['formItemProps', 'attrs'])
    formItemWrapper.unmount()
  })

  it('clears deleted query fields and all URL-owned fields on popstate', async () => {
    window.history.replaceState({}, '', '/schema-form?name=%22Ada%22&age=36')
    const wrapper = shallowMount(SchemaForm, {
      props: {
        columns: [{ dataIndex: 'name' }, { dataIndex: 'age' }],
        initialValues: { localOnly: true },
        urlSync: true,
      },
    })
    await flushPromises()
    const form = wrapper.vm as unknown as SchemaFormInstance<FormRecord>
    expect(form.getFieldsValue()).toEqual({ name: 'Ada', age: 36, localOnly: true })

    window.history.pushState({}, '', '/schema-form?name=%22Grace%22')
    window.dispatchEvent(new PopStateEvent('popstate'))
    await flushPromises()
    expect(form.getFieldsValue()).toEqual({ name: 'Grace', localOnly: true })

    window.history.pushState({}, '', '/schema-form?preserved=yes')
    window.dispatchEvent(new PopStateEvent('popstate'))
    await flushPromises()
    expect(form.getFieldsValue()).toEqual({ localOnly: true })
    wrapper.unmount()
  })

  it('clears deleted hash fields and an empty hash on hashchange', async () => {
    window.history.replaceState({}, '', '/schema-form#name=%22Ada%22&age=36')
    const wrapper = shallowMount(SchemaForm, {
      props: {
        columns: [{ dataIndex: 'name' }, { dataIndex: 'age' }],
        initialValues: { localOnly: true },
        urlSync: { mode: 'hash' },
      },
    })
    await flushPromises()
    const form = wrapper.vm as unknown as SchemaFormInstance<FormRecord>
    expect(form.getFieldsValue()).toEqual({ name: 'Ada', age: 36, localOnly: true })

    const oldUrl = window.location.href
    window.history.replaceState({}, '', '/schema-form#name=%22Grace%22')
    window.dispatchEvent(
      new HashChangeEvent('hashchange', { oldURL: oldUrl, newURL: window.location.href }),
    )
    await flushPromises()
    expect(form.getFieldsValue()).toEqual({ name: 'Grace', localOnly: true })

    const previousUrl = window.location.href
    window.history.replaceState({}, '', '/schema-form')
    window.dispatchEvent(
      new HashChangeEvent('hashchange', {
        oldURL: previousUrl,
        newURL: window.location.href,
      }),
    )
    await flushPromises()
    expect(form.getFieldsValue()).toEqual({ localOnly: true })
    wrapper.unmount()
  })

  it.each([
    [Form, 'Form'],
    [Embed, 'Embed'],
    [ModalForm, 'ModalForm'],
    [DrawerForm, 'DrawerForm'],
    [QueryFilter, 'QueryFilter'],
    [LightFilter, 'LightFilter'],
    [StepForm, 'StepForm'],
    [StepsForm, 'StepsForm'],
  ] as const)(
    'forwards the %s layout alias without allowing layout overrides',
    (component, layoutType) => {
      const finish = vi.fn()
      const wrapper = mount(component, {
        attrs: { columns: [], layoutType: 'ignored', 'data-testid': 'layout', onFinish: finish },
        global: { stubs: { SchemaForm: true } },
      })
      const form = wrapper.findComponent(SchemaForm as Component)
      expect(form.props()).toMatchObject({ layoutType })
      expect(form.attributes('data-testid')).toBe('layout')
      form.vm.$emit('finish', { name: 'Ada' })
      expect(finish).toHaveBeenCalledExactlyOnceWith({ name: 'Ada' })
      wrapper.unmount()
    },
  )

  it('forwards layout slots and every public instance method through the template wrapper', async () => {
    const values = { name: 'Ada' }
    const methods = {
      validate: vi.fn(async () => values),
      reset: vi.fn(),
      getFieldsValue: vi.fn(() => values),
      setFieldsValue: vi.fn(),
      submit: vi.fn(async () => values),
      open: vi.fn(),
      close: vi.fn(),
      next: vi.fn(async () => true),
      prev: vi.fn(),
    }
    const SchemaFormStub = defineComponent({
      name: 'SchemaForm',
      setup(_, { expose, slots }) {
        expose(methods)
        return () => h('div', slots['field-profile.name']?.({ value: values.name }))
      },
    })
    const wrapper = mount(ModalForm, {
      props: { columns: [] },
      slots: {
        'field-profile.name': ({ value }: { value: unknown }) => h('strong', String(value)),
      },
      global: { stubs: { SchemaForm: SchemaFormStub } },
    })
    const form = wrapper.vm as unknown as SchemaFormInstance<FormRecord>
    expect(wrapper.get('strong').text()).toBe('Ada')
    await expect(form.validate()).resolves.toEqual(values)
    expect(form.getFieldsValue()).toEqual(values)
    form.setFieldsValue({ name: 'Grace' })
    expect(methods.setFieldsValue).toHaveBeenCalledExactlyOnceWith({ name: 'Grace' })
    await expect(form.submit()).resolves.toEqual(values)
    await expect(form.next()).resolves.toBe(true)
    form.reset()
    form.open()
    form.close()
    form.prev()
    for (const method of Object.values(methods)) expect(method).toHaveBeenCalledOnce()
    wrapper.unmount()
  })

  it('keeps the FormItem instance when custom field content switches to the default control', async () => {
    const wrapper = mount(SchemaFormField, {
      props: {
        column: { dataIndex: 'name' },
        model: { name: 'Ada' },
        schemaSlots: { 'field-name': () => h('input', { 'data-testid': 'custom-control' }) },
        onValueChange: vi.fn(),
      },
    })
    const formItem = wrapper.findComponent(FormItem).vm
    expect(wrapper.find('[data-testid="custom-control"]').exists()).toBe(true)
    await wrapper.setProps({ schemaSlots: {} })
    expect(wrapper.findComponent(Input).props('value')).toBe('Ada')
    expect(wrapper.findComponent(FormItem).vm).toBe(formItem)
    await wrapper.setProps({ schemaSlots: { 'field-name': () => 0 } })
    expect(wrapper.findComponent(Input).exists()).toBe(false)
    expect(wrapper.findComponent(FormItem).vm).toBe(formItem)
    expect(wrapper.text()).toContain('0')
    wrapper.unmount()
  })

  it.each([false, true])('preserves nested group and list paths with grid=%s', async (grid) => {
    const initial = { name: 'New', nested: { active: true } }
    const model = { members: [{ name: 'Ada', nested: { active: false } }] }
    const onValueChange = vi.fn()
    const wrapper = mount(SchemaFormField, {
      props: {
        column: {
          valueType: 'group',
          title: 'Team',
          columns: [
            {
              dataIndex: 'members',
              valueType: 'formList',
              fieldProps: {
                initialValue: initial,
                creatorButtonText: 'Add member',
                removeText: 'Delete member',
              },
              columns: [{ dataIndex: 'name', title: 'Name' }],
            },
          ],
        },
        grid,
        model,
        onValueChange,
      },
    })
    expect(
      wrapper
        .findAllComponents(FormItem)
        .some(
          (item) => JSON.stringify(item.props('name')) === JSON.stringify(['members', 0, 'name']),
        ),
    ).toBe(true)
    wrapper.findComponent(Input).vm.$emit('update:value', 'Grace')
    expect(onValueChange).toHaveBeenLastCalledWith(['members', 0, 'name'], 'Grace')
    const add = wrapper.findAllComponents(Button).find((button) => button.text() === 'Add member')!
    await add.trigger('click')
    const [path, rows] = onValueChange.mock.calls.at(-1)!
    expect(path).toEqual(['members'])
    expect(rows).toEqual([...model.members, initial])
    expect(rows[0]).not.toBe(model.members[0])
    expect(rows[1].nested).not.toBe(initial.nested)
    const remove = wrapper
      .findAllComponents(Button)
      .find((button) => button.attributes('data-pro-form-list-remove') !== undefined)!
    await remove.trigger('click')
    expect(onValueChange).toHaveBeenLastCalledWith(['members'], [initial])
    expect(model.members).toHaveLength(1)
    wrapper.unmount()
  })

  it('registers every schema layout with its public global component name', () => {
    const app = createApp({ render: () => null })
    app.use(AntdvNextPro)

    for (const [name, component] of [
      ['Form', Form],
      ['Embed', Embed],
      ['ModalForm', ModalForm],
      ['DrawerForm', DrawerForm],
      ['QueryFilter', QueryFilter],
      ['LightFilter', LightFilter],
      ['StepForm', StepForm],
      ['StepsForm', StepsForm],
    ] as const) {
      expect(app.component(name)).toBe(component)
    }
    expect(app.component('AntdvNextProModalForm')).toBe(ModalForm)
  })
})
