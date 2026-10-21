import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { ConfigProvider, Input, InputNumber, theme } from 'antdv-next'
import enUS from 'antdv-next/locale/en_US'
import dayjs from 'dayjs'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import { defineComponent, h, nextTick, ref, shallowRef } from 'vue'
import {
  BetaSchemaForm,
  DrawerForm,
  LightFilter,
  LightWrapper,
  ModalForm,
  ProForm,
  ProFormDependency,
  ProFormFieldSet,
  ProFormGroup,
  ProFormItem,
  ProFormList,
  ProFormProvider,
  ProFormText,
  QueryFilter,
  StepsForm,
} from '../src'
import type { FormListActionType, ProFormInstance, SubmitterProps } from '../src/pro-form/types'
import type { SchemaFormInstance } from '../src/types'

let wrapper: VueWrapper | undefined
const initialUrl = window.location.href
const tick = async () => {
  await nextTick()
  await flushPromises()
}

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  document.body.innerHTML = ''
  window.history.replaceState(window.history.state, '', initialUrl)
})

function button(text: string): HTMLButtonElement {
  const result = [...document.querySelectorAll<HTMLButtonElement>('button')].find(
    (node) =>
      node.checkVisibility() && node.textContent?.replace(/\s/g, '') === text.replace(/\s/g, ''),
  )
  if (!result) throw new Error(`Missing button: ${text}`)
  return result
}

describe('ProForm composed real controls', () => {
  it('keeps native form layout, label configuration and semantic attribute targets', async () => {
    const layout = ref<'vertical' | 'horizontal'>('vertical'),
      marker = ref('first')
    wrapper = mount(
      defineComponent(
        () => () =>
          h(
            ProForm,
            {
              layout: layout.value,
              labelCol: { span: 6 },
              wrapperCol: { span: 18 },
              colon: false,
              class: 'external-form',
              id: 'native-form',
              'data-domain': 'forms',
              'aria-label': 'Profile',
              style: { maxWidth: '700px' },
              classNames: { root: 'legacy-root' },
              classes: ({ props }) => ({
                root: `${marker.value}-root`,
                submitter: `${props.layout}-submitter`,
              }),
              styles: () => ({
                submitter: { marginTop: marker.value === 'first' ? '30px' : '40px' },
              }),
            },
            { default: () => h(ProFormText, { name: 'name', label: 'Name' }) },
          ),
      ),
      { attachTo: document.body },
    )
    await tick()
    expect(wrapper.get('form').classes()).toContain('ant-form-vertical')
    expect(wrapper.get('form').classes()).toContain('external-form')
    expect(wrapper.get('form').classes()).toContain('first-root')
    expect(wrapper.get('form').classes()).not.toContain('legacy-root')
    expect(wrapper.get('form').attributes()).toMatchObject({
      id: 'native-form',
      'data-domain': 'forms',
      'aria-label': 'Profile',
    })
    expect((wrapper.get('form').element as HTMLElement).style.maxWidth).toBe('700px')
    expect(
      wrapper.find('.ant-form-item-label.ant-col-6 label.ant-form-item-no-colon').exists(),
    ).toBe(true)
    expect(wrapper.find('.ant-form-item-control.ant-col-18').exists()).toBe(true)
    expect(getComputedStyle(wrapper.get('.vertical-submitter').element).marginTop).toBe('30px')
    layout.value = 'horizontal'
    marker.value = 'second'
    await tick()
    expect(wrapper.get('form').classes()).toContain('ant-form-horizontal')
    expect(wrapper.get('form').classes()).toContain('second-root')
    expect(getComputedStyle(wrapper.get('.horizontal-submitter').element).marginTop).toBe('40px')
  })

  it('applies QueryFilter collapse, labelWidth, default column count and action renderers without bypassing validation', async () => {
    const form = ref<ProFormInstance>(),
      width = ref('1000px'),
      finish = vi.fn(),
      optionRender = vi.fn((_props, _form, doms) => doms)
    wrapper = mount(
      defineComponent(
        () => () =>
          h(
            QueryFilter,
            {
              ref: form,
              style: { width: width.value },
              defaultColsNumber: 3,
              labelWidth: 120,
              split: true,
              onFinish: finish,
              optionRender,
              collapseRender: (collapsed: boolean) => (collapsed ? 'Open fields' : 'Close fields'),
              initialValues: { name: 'Ada' },
            },
            {
              default: () =>
                ['name', 'code', 'city', 'role'].map((name) =>
                  h(ProFormText, {
                    name,
                    label: name,
                    rules: name === 'role' ? [{ required: true }] : undefined,
                  }),
                ),
            },
          ),
      ),
      { attachTo: document.body },
    )
    await tick()
    const visible = () =>
      wrapper!
        .findAll('[data-pro-query-col]')
        .filter((node) => (node.element as HTMLElement).style.display !== 'none')
    await vi.waitFor(() => expect(visible()).toHaveLength(2))
    expect(wrapper.find('.ant-pro-query-filter-split').exists()).toBe(true)
    expect((wrapper.get('.ant-form-item-label').element as HTMLElement).style.width).toBe('120px')
    expect(optionRender.mock.calls.at(-1)?.[1].getFieldValue('name')).toBe('Ada')
    button('Open fields').click()
    await tick()
    expect(visible()).toHaveLength(4)
    button('Close fields').click()
    await tick()
    await expect(form.value!.submit()).rejects.toBeDefined()
    expect(finish).not.toHaveBeenCalled()
    form.value!.setFieldValue('role', 'admin')
    width.value = '400px'
    await tick()
    await vi.waitFor(() =>
      expect((wrapper!.get('[data-pro-query-col]').element as HTMLElement).style.maxWidth).toBe(
        '100%',
      ),
    )
    expect(visible()).toHaveLength(1)
    expect(form.value!.getFieldValue('name')).toBe('Ada')
    await form.value!.submit()
    expect(finish).toHaveBeenCalledWith({ name: 'Ada', role: 'admin' })
  })

  it.each([
    ['composition', 'ModalForm', false],
    ['composition', 'ModalForm', true],
    ['composition', 'DrawerForm', false],
    ['composition', 'DrawerForm', true],
    ['schema', 'ModalForm', false],
    ['schema', 'ModalForm', true],
    ['schema', 'DrawerForm', false],
    ['schema', 'DrawerForm', true],
  ] as const)(
    'applies %s %s native destroyOnHidden=%s after closing',
    async (kind, layoutType, destroyOnHidden) => {
      const form = ref<any>(),
        open = ref(true),
        afterClose = vi.fn(),
        afterOpenChange = vi.fn()
      const component = layoutType === 'ModalForm' ? ModalForm : DrawerForm
      const options =
        layoutType === 'ModalForm'
          ? { modalProps: { destroyOnHidden, afterClose } }
          : { drawerProps: { destroyOnHidden, afterOpenChange } }
      wrapper = mount(
        defineComponent(() => () => {
          const props = {
            ref: form,
            ...options,
            open: open.value,
            'onUpdate:open': (next: boolean) => {
              open.value = next
            },
            initialValues: { name: 'Ada' },
          }
          return kind === 'composition'
            ? h(component, props, { default: () => h(ProFormText, { name: 'name' }) })
            : h(BetaSchemaForm, { ...props, layoutType, columns: [{ dataIndex: 'name' }] })
        }),
        {
          attachTo: document.body,
          global: { stubs: { transition: false, 'transition-group': false } },
        },
      )
      await tick()
      form.value.setFieldValue('name', 'Grace')
      await tick()
      button('取消').click()
      await tick()
      expect(open.value).toBe(false)
      await vi.waitFor(() => {
        if (layoutType === 'ModalForm') expect(afterClose).toHaveBeenCalledTimes(1)
        else expect(afterOpenChange).toHaveBeenCalledWith(false)
      })
      open.value = true
      await tick()
      await vi.waitFor(() =>
        expect(
          document.querySelector<HTMLInputElement>(
            layoutType === 'ModalForm' ? '.ant-modal input' : '.ant-drawer input',
          )?.value,
        ).toBe(destroyOnHidden ? 'Ada' : 'Grace'),
      )
      expect(form.value.getFieldValue('name')).toBe(destroyOnHidden ? 'Ada' : 'Grace')
    },
  )

  it.each([
    ['QueryFilter', 'query-filter'],
    ['LightFilter', 'form-light-filter'],
    ['StepsForm', 'steps-form'],
  ] as const)(
    'keeps schema %s public parts aligned with dynamic native prefixes',
    async (layoutType, suffix) => {
      const nativePrefix = ref('demo'),
        explicitPrefix = ref<string>()
      wrapper = mount(
        defineComponent(
          () => () =>
            h(
              ConfigProvider,
              { prefixCls: nativePrefix.value },
              {
                default: () =>
                  h(BetaSchemaForm, {
                    layoutType,
                    prefixCls: explicitPrefix.value,
                    classes: { container: 'schema-layout-container', step: 'schema-step' },
                    columns:
                      layoutType === 'StepsForm'
                        ? [
                            {
                              title: 'First',
                              valueType: 'group',
                              children: [{ dataIndex: 'name' }],
                            },
                            {
                              title: 'Second',
                              valueType: 'group',
                              children: [{ dataIndex: 'code' }],
                            },
                          ]
                        : [{ title: 'Name', dataIndex: 'name' }],
                  }),
              },
            ),
        ),
        { attachTo: document.body },
      )
      await tick()
      expect(wrapper.find(`.demo-pro-${suffix}`).exists()).toBe(true)
      if (layoutType === 'StepsForm') {
        expect(wrapper.find('.demo-pro-steps-form-steps-container .demo-steps').exists()).toBe(true)
        expect(
          wrapper
            .find('.demo-pro-steps-form-container .demo-pro-steps-form-step-active input')
            .exists(),
        ).toBe(true)
        expect(wrapper.find('.schema-layout-container .schema-step input').exists()).toBe(true)
      }
      nativePrefix.value = 'kit'
      await tick()
      expect(wrapper.find(`.kit-pro-${suffix}`).exists()).toBe(true)
      expect(wrapper.find(`.demo-pro-${suffix}`).exists()).toBe(false)
      explicitPrefix.value = 'custom-form'
      await tick()
      expect(wrapper.find('.custom-form').exists()).toBe(true)
      expect(wrapper.find(`.kit-pro-${suffix}`).exists()).toBe(false)
    },
  )

  it.each([
    ['composition', 'ModalForm'],
    ['composition', 'DrawerForm'],
    ['schema', 'ModalForm'],
    ['schema', 'DrawerForm'],
  ] as const)(
    'protects %s %s closing only until submitTimeout expires',
    async (kind, layoutType) => {
      const form = ref<any>(),
        open = ref(true),
        nativeClose = vi.fn()
      let resolve: (value: boolean) => void = () => {}
      let reject: (reason: unknown) => void = () => {}
      const finish = vi.fn(
        () =>
          new Promise<boolean>((yes, no) => {
            resolve = yes
            reject = no
          }),
      )
      const options =
        layoutType === 'ModalForm'
          ? { modalProps: { onCancel: nativeClose } }
          : { drawerProps: { onClose: nativeClose } }
      const component = layoutType === 'ModalForm' ? ModalForm : DrawerForm
      wrapper = mount(
        defineComponent(() => () => {
          const props = {
            ref: form,
            ...options,
            open: open.value,
            'onUpdate:open': (next: boolean) => {
              open.value = next
            },
            submitTimeout: 100,
            initialValues: { name: 'Ada' },
            onFinish: finish,
          }
          return kind === 'composition'
            ? h(component, props, { default: () => h(ProFormText, { name: 'name' }) })
            : h(BetaSchemaForm, { ...props, layoutType, columns: [{ dataIndex: 'name' }] })
        }),
        { attachTo: document.body },
      )
      await tick()
      const pending = form.value.submit()
      await tick()
      const close = document.querySelector<HTMLButtonElement>(
        layoutType === 'ModalForm' ? '.ant-modal-close' : '.ant-drawer-close',
      )!
      expect(button('取消').disabled).toBe(true)
      close.click()
      await tick()
      expect(open.value).toBe(true)
      expect(nativeClose).not.toHaveBeenCalled()
      await vi.waitFor(() => expect(button('取消').disabled).toBe(false))
      expect(button('提交').classList.contains('ant-btn-loading')).toBe(true)
      form.value.setFieldValue('name', 'Grace')
      button('取消').click()
      await tick()
      expect(open.value).toBe(false)
      expect(nativeClose).toHaveBeenCalledTimes(1)
      expect(form.value.getFieldValue('name')).toBe('Grace')
      resolve(false)
      await pending
      open.value = true
      await tick()
      const rejected = form.value.submit()
      await tick()
      reject(new Error('save failed'))
      await expect(rejected).rejects.toThrow('save failed')
      await tick()
      expect(button('取消').disabled).toBe(false)
      close.click()
      await tick()
      expect(nativeClose).toHaveBeenCalledTimes(2)
      expect(open.value).toBe(false)
    },
  )

  it('registers, validates, converts once and formats without changing the store', async () => {
    const form = ref<ProFormInstance>()
    const convert = vi.fn((value) => Number(value))
    const transform = vi.fn((value) => ({ serial: Number(value) * 10 }))
    const finish = vi.fn()
    wrapper = mount(
      defineComponent(
        () => () =>
          h(
            ProForm,
            {
              ref: form,
              initialValues: { code: '7', birthday: dayjs('2026-01-02') },
              onFinish: finish,
            },
            {
              default: () => [
                h(ProFormText, { name: 'code', convertValue: convert, transform }),
                h(ProFormText, {
                  name: 'name',
                  label: 'Name',
                  rules: [{ required: true, message: 'Name required' }],
                }),
                h(ProFormText, { name: 'birthday', readonly: true, valueType: 'date' }),
              ],
            },
          ),
      ),
      { attachTo: document.body },
    )
    await tick()
    expect(convert).toHaveBeenCalledTimes(1)
    await expect(form.value!.submit()).rejects.toBeDefined()
    expect(finish).not.toHaveBeenCalled()
    expect(document.querySelector('.ant-form-item-explain-error')?.textContent).toContain(
      'Name required',
    )
    form.value!.setFieldValue('name', 'Ada')
    const result = await form.value!.submit()
    expect(result).toMatchObject({ serial: 70, name: 'Ada', birthday: '2026-01-02' })
    expect(result).not.toHaveProperty('code')
    expect(form.value!.getFieldsValue()).toMatchObject({ code: 7, name: 'Ada' })
    expect(dayjs.isDayjs(form.value!.getFieldValue('birthday'))).toBe(true)
    expect(transform).toHaveBeenCalledTimes(1)
    expect(form.value!.nativeForm?.validateFields).toBeTypeOf('function')
  })

  it('keeps List DOM and nested paths through move/copy and enforces asynchronous guards', async () => {
    const form = ref<ProFormInstance>(),
      list = ref<FormListActionType>()
    const guard = vi.fn(async (record) => record.name !== 'blocked')
    const readonly = ref(false),
      disabled = ref(false)
    wrapper = mount(
      defineComponent(
        () => () =>
          h(
            ProForm,
            {
              ref: form,
              readonly: readonly.value,
              disabled: disabled.value,
              submitter: false,
              initialValues: {
                people: [{ name: 'Ada', addresses: [{ city: 'Paris' }] }, { name: 'Grace' }],
              },
            },
            {
              default: () =>
                h(
                  ProFormList,
                  {
                    ref: list,
                    name: 'people',
                    min: 2,
                    max: 3,
                    actionGuard: { beforeAddRow: guard },
                  },
                  {
                    default: () => [
                      h(ProFormText, { name: 'name', 'data-person': '' }),
                      h(
                        ProFormList,
                        { name: 'addresses', creatorButtonProps: false },
                        { default: () => h(ProFormText, { name: 'city', 'data-city': '' }) },
                      ),
                    ],
                  },
                ),
            },
          ),
      ),
      { attachTo: document.body },
    )
    await tick()
    const inputs = () => [...document.querySelectorAll<HTMLInputElement>('[data-person]')]
    const ada = inputs()[0]
    expect(
      wrapper.find('.ant-pro-form-list-item-default .ant-pro-form-list-container').exists(),
    ).toBe(true)
    expect(wrapper.find('.ant-pro-form-list-action-icon.action-copy').exists()).toBe(true)
    expect(inputs().map((node) => node.value)).toEqual(['Ada', 'Grace'])
    expect(list.value!.move(0, 1)).toBe(true)
    await tick()
    expect(inputs()[1]).toBe(ada)
    expect(inputs().map((node) => node.value)).toEqual(['Grace', 'Ada'])
    const city = document.querySelector<HTMLInputElement>('[data-city]')!
    city.value = 'Berlin'
    city.dispatchEvent(new Event('input', { bubbles: true }))
    await tick()
    expect(form.value!.getFieldValue(['people', 1, 'addresses', 0, 'city'])).toBe('Berlin')
    expect(await list.value!.remove(0)).toBe(false)
    expect(await list.value!.add({ name: 'blocked' })).toBe(false)
    expect(await list.value!.copy(0)).toBe(true)
    await tick()
    expect(inputs().map((node) => node.value)).toEqual(['Grace', 'Grace', 'Ada'])
    expect(await list.value!.add({ name: 'extra' })).toBe(false)
    expect(await list.value!.remove(1)).toBe(true)
    await tick()
    readonly.value = true
    await tick()
    expect(list.value!.move(0, 1)).toBe(false)
    expect(await list.value!.copy(0)).toBe(false)
    readonly.value = false
    disabled.value = true
    await tick()
    expect(await list.value!.add({ name: 'disabled' })).toBe(false)
    expect(guard).toHaveBeenCalledTimes(2)
    expect(list.value!.getList().map((row) => row.name)).toEqual(['Grace', 'Ada'])
  })

  it('composes collapsing Group, FieldSet conversion, Dependency and ordinary native controls', async () => {
    const form = ref<ProFormInstance>()
    const convert = vi.fn((value) => (typeof value === 'string' ? value.split('/') : []))
    wrapper = mount(
      defineComponent(
        () => () =>
          h(
            ProForm,
            { ref: form, submitter: false, initialValues: { pair: 'a/b', title: 'Ada' } },
            {
              default: () => [
                h(
                  ProFormGroup,
                  { title: 'Details', collapsible: true },
                  {
                    default: () => [
                      h(
                        ProFormFieldSet,
                        {
                          name: 'pair',
                          label: 'Pair',
                          convertValue: convert,
                          transform: (value) => ({ first: value[0], last: value[1] }),
                        },
                        {
                          default: () => [h(ProFormText), h(ProFormText)],
                        },
                      ),
                      h(
                        ProFormItem,
                        { name: 'title' },
                        { default: () => h(Input, { 'data-native': '' }) },
                      ),
                    ],
                  },
                ),
                h(
                  ProFormDependency,
                  { name: ['title'] },
                  {
                    default: (values: Record<string, unknown>) =>
                      h(
                        'output',
                        { 'data-dependent': '' },
                        typeof values.title === 'string' ? values.title : '',
                      ),
                  },
                ),
              ],
            },
          ),
      ),
      { attachTo: document.body },
    )
    await tick()
    expect(convert).toHaveBeenCalledTimes(1)
    const fields = wrapper.findAll('input')
    expect(fields.map((field) => (field.element as HTMLInputElement).value)).toEqual([
      'a',
      'b',
      'Ada',
    ])
    await fields[0]!.setValue('updated')
    await wrapper.get('[data-native]').setValue('Grace')
    expect(wrapper.get('[data-dependent]').text()).toBe('Grace')
    expect(form.value!.getFieldsFormatValue()).toEqual({
      first: 'updated',
      last: 'b',
      title: 'Grace',
    })
    const sameInput = fields[0]!.element
    await wrapper.get('[data-pro-form-group-toggle]').trigger('click')
    expect(
      (wrapper.get('[data-pro-form-group-content]').element as HTMLElement).style.display,
    ).toBe('none')
    await wrapper.get('[data-pro-form-group-toggle]').trigger('click')
    expect(wrapper.find('input').element).toBe(sameInput)
  })

  it('forwards root StepsForm ref, validates each independent step and preserves drafts after rejection', async () => {
    const steps = ref<any>(),
      decision = ref<'false' | 'true' | 'reject'>('false'),
      second = ref(true)
    const finish = vi.fn(() => false)
    wrapper = mount(
      defineComponent(
        () => () =>
          h(
            StepsForm,
            { ref: steps, onFinish: finish },
            {
              default: () => [
                h(
                  StepsForm.StepForm,
                  {
                    name: 'first',
                    title: 'First',
                    initialValues: { name: 'Ada' },
                    onFinish: async () => {
                      if (decision.value === 'reject') throw new Error('rejected')
                      return decision.value === 'true'
                    },
                  },
                  { default: () => h(ProFormText, { name: 'name', rules: [{ required: true }] }) },
                ),
                second.value &&
                  h(
                    StepsForm.StepForm,
                    { name: 'second', title: 'Second', initialValues: { code: '7' } },
                    { default: () => h(ProFormText, { name: 'code' }) },
                  ),
              ],
            },
          ),
      ),
      { attachTo: document.body },
    )
    await tick()
    expect([...steps.value.formMap().keys()]).toEqual(['first', 'second'])
    expect(wrapper.find('.ant-pro-steps-form-steps-container').exists()).toBe(true)
    expect(steps.value.formMap().get('first').nativeForm).not.toBe(
      steps.value.formMap().get('second').nativeForm,
    )
    expect(await steps.value.next()).toBe(false)
    decision.value = 'reject'
    await expect(steps.value.next()).rejects.toThrow('rejected')
    decision.value = 'true'
    steps.value.formMap().get('first').setFieldValue('name', '')
    await expect(steps.value.next()).rejects.toBeDefined()
    steps.value.formMap().get('first').setFieldValue('name', 'Grace')
    expect(await steps.value.next()).toBe(true)
    await tick()
    expect(wrapper.get('.ant-pro-steps-form-step-active input').element).toHaveProperty(
      'value',
      '7',
    )
    steps.value.prev()
    await tick()
    expect(wrapper.get('.ant-pro-steps-form-step-active input').element).toHaveProperty(
      'value',
      'Grace',
    )
    await steps.value.next()
    await steps.value.submit()
    expect(finish).toHaveBeenLastCalledWith({ name: 'Grace', code: '7' })
    second.value = false
    await tick()
    expect([...steps.value.formMap().keys()]).toEqual(['first'])
    second.value = true
    await tick()
    expect([...steps.value.formMap().keys()]).toEqual(['first', 'second'])
  })

  it.each(['composition', 'schema'] as const)(
    'applies %s submitter configuration and custom render through validation',
    async (kind) => {
      const form = ref<any>(),
        finish = vi.fn(),
        resetClick = vi.fn()
      const submitter = shallowRef<false | SubmitterProps>({
        searchConfig: { submitText: 'Save', resetText: 'Restore' },
        submitButtonProps: { disabled: true },
        resetButtonProps: { onClick: resetClick },
      })
      let attempted: Promise<unknown> | undefined
      wrapper = mount(
        defineComponent(
          () => () =>
            kind === 'composition'
              ? h(
                  ProForm,
                  {
                    ref: form,
                    submitter: submitter.value,
                    initialValues: { name: 'Ada' },
                    onFinish: finish,
                  },
                  { default: () => h(ProFormText, { name: 'name', rules: [{ required: true }] }) },
                )
              : h(BetaSchemaForm, {
                  ref: form,
                  submitter: submitter.value,
                  initialValues: { name: 'Ada' },
                  onFinish: finish,
                  columns: [{ dataIndex: 'name', formItemProps: { rules: [{ required: true }] } }],
                }),
        ),
        { attachTo: document.body },
      )
      await tick()
      expect(button('Save').disabled).toBe(true)
      form.value.setFieldValue('name', 'Grace')
      await tick()
      button('Restore').click()
      await tick()
      expect(resetClick).toHaveBeenCalledTimes(1)
      expect(form.value.getFieldValue('name')).toBe('Ada')
      submitter.value = {
        render: ({ submit }, doms) =>
          h('div', [
            doms,
            h(
              'button',
              {
                type: 'button',
                onClick: () => {
                  attempted = submit().catch(() => undefined)
                },
              },
              'Custom',
            ),
          ]),
      }
      await tick()
      form.value.setFieldValue('name', '')
      await tick()
      button('Custom').click()
      await attempted
      await tick()
      expect(finish).not.toHaveBeenCalled()
      form.value.setFieldValue('name', 'Grace')
      await tick()
      button('Custom').click()
      await attempted
      await tick()
      expect(finish).toHaveBeenLastCalledWith({ name: 'Grace' })
      submitter.value = { render: false }
      await tick()
      expect(wrapper.findAll('button')).toHaveLength(0)
      submitter.value = { resetButtonProps: false, submitButtonProps: false }
      await tick()
      expect(wrapper.findAll('button')).toHaveLength(0)
      submitter.value = false
      await tick()
      expect(wrapper.find('[data-pro-form-submitter]').exists()).toBe(false)
    },
  )

  it.each(['composition', 'schema'] as const)(
    'applies %s step button props and custom rendering',
    async (kind) => {
      const form = ref<any>(),
        previousClick = vi.fn(),
        submitClick = vi.fn()
      let attempted: Promise<unknown> | undefined
      const submitter = shallowRef<SubmitterProps>({
        searchConfig: { resetText: 'Back' },
        submitButtonProps: { onClick: submitClick },
        resetButtonProps: { disabled: true, onClick: previousClick },
      })
      wrapper = mount(
        defineComponent(
          () => () =>
            kind === 'composition'
              ? h(
                  StepsForm,
                  { ref: form, submitter: submitter.value },
                  {
                    default: () => [
                      h(
                        StepsForm.StepForm,
                        { name: 'first', title: 'First' },
                        { default: () => h(ProFormText, { name: 'name', 'data-step-name': '' }) },
                      ),
                      h(
                        StepsForm.StepForm,
                        { name: 'second', title: 'Second' },
                        { default: () => h(ProFormText, { name: 'code', 'data-step-code': '' }) },
                      ),
                    ],
                  },
                )
              : h(BetaSchemaForm, {
                  ref: form,
                  layoutType: 'StepsForm',
                  submitter: submitter.value,
                  columns: [
                    {
                      title: 'First',
                      valueType: 'group',
                      children: [{ dataIndex: 'name', fieldProps: { 'data-step-name': '' } }],
                    },
                    {
                      title: 'Second',
                      valueType: 'group',
                      children: [{ dataIndex: 'code', fieldProps: { 'data-step-code': '' } }],
                    },
                  ],
                }),
        ),
        { attachTo: document.body },
      )
      await tick()
      button('下一步').click()
      await tick()
      expect(submitClick).toHaveBeenCalledTimes(1)
      expect(button('Back').disabled).toBe(true)
      submitter.value = {
        searchConfig: { resetText: 'Back' },
        resetButtonProps: { onClick: previousClick },
      }
      await tick()
      button('Back').click()
      await tick()
      expect(previousClick).toHaveBeenCalledTimes(1)
      expect(
        [...document.querySelectorAll('button')]
          .filter((node) => node.checkVisibility())
          .some((node) => node.textContent === 'Back'),
      ).toBe(false)
      submitter.value = { render: false }
      await tick()
      expect(
        [...document.querySelectorAll('button')].filter((node) => node.checkVisibility()),
      ).toHaveLength(0)
      submitter.value = {
        render: ({ submit }) =>
          h(
            'button',
            {
              type: 'button',
              onClick: () => {
                attempted = submit()
              },
            },
            'Custom next',
          ),
      }
      await tick()
      button('Custom next').click()
      await attempted
      await tick()
      expect(document.querySelector('[data-step-code]')?.checkVisibility()).toBe(true)
      expect(document.querySelector('[data-step-name]')?.checkVisibility()).toBe(false)
    },
  )

  it('inherits locale, disabled, size, native tokens and custom prefix without breaking semantic layout', async () => {
    const form = ref<any>(),
      disabled = ref(true),
      width = ref('1000px')
    wrapper = mount(
      defineComponent(
        () => () =>
          h(
            ConfigProvider,
            {
              prefixCls: 'demo',
              locale: enUS,
              direction: 'rtl',
              componentSize: 'large',
              componentDisabled: disabled.value,
              theme: {
                algorithm: theme.darkAlgorithm,
                components: { Form: { labelColor: '#123456' } },
              },
            },
            {
              default: () =>
                h(
                  QueryFilter,
                  {
                    ref: form,
                    prefixCls: 'handmade-filter',
                    style: { width: width.value },
                    classes: () => ({
                      root: 'extra-root second-root',
                      row: 'extra-row second-row',
                    }),
                    styles: () => ({ actions: { minHeight: '31px' } }),
                    initialValues: { name: 'Ada' },
                  },
                  {
                    default: () =>
                      ['name', 'code', 'city', 'role'].map((name) =>
                        h(ProFormText, { name, label: name }),
                      ),
                  },
                ),
            },
          ),
      ),
      { attachTo: document.body },
    )
    await tick()
    expect(wrapper.find('.handmade-filter-container.extra-root.second-root').exists()).toBe(true)
    expect(
      wrapper.find('form.handmade-filter .handmade-filter-row .handmade-filter-actions').exists(),
    ).toBe(true)
    expect(getComputedStyle(wrapper.get('[data-pro-query-row]').element).display).toBe('flex')
    expect(getComputedStyle(wrapper.get('[data-pro-query-actions]').element).minHeight).toBe('31px')
    expect(getComputedStyle(wrapper.get('.demo-form-item-label label').element).color).toBe(
      'rgb(18, 52, 86)',
    )
    expect(wrapper.get('.demo-input').attributes('disabled')).toBeDefined()
    expect(wrapper.get('.demo-input').classes()).toContain('demo-input-lg')
    expect(button('Query')).toBeDefined()
    expect(getComputedStyle(wrapper.get('form').element).direction).toBe('rtl')
    disabled.value = false
    width.value = '400px'
    await tick()
    await vi.waitFor(() =>
      expect(getComputedStyle(wrapper!.get('[data-pro-query-col]').element).maxWidth).toBe('100%'),
    )
    expect(form.value.getFieldValue('name')).toBe('Ada')
    expect(wrapper.get('.demo-input').attributes('disabled')).toBeUndefined()
  })

  it('restores controlled LightWrapper drafts on cancellation and validates before confirmation', async () => {
    const form = ref<ProFormInstance>(),
      open = ref(false),
      finish = vi.fn()
    wrapper = mount(
      defineComponent(
        () => () =>
          h(
            ProForm,
            { ref: form, submitter: false, initialValues: { name: 'Ada' }, onFinish: finish },
            {
              default: () =>
                h(
                  LightWrapper,
                  {
                    name: 'name',
                    label: 'Name',
                    open: open.value,
                    'onUpdate:open': (next) => {
                      open.value = next
                    },
                  },
                  {
                    default: () =>
                      h(ProFormText, {
                        name: 'name',
                        rules: [{ required: true, message: 'Name required' }],
                        'data-light-input': '',
                      }),
                  },
                ),
            },
          ),
      ),
      { attachTo: document.body },
    )
    await tick()
    open.value = true
    await tick()
    await vi.waitFor(() => expect(document.querySelector('[data-light-input]')).not.toBeNull())
    form.value!.setFieldValue('name', 'draft')
    open.value = false
    await tick()
    expect(form.value!.getFieldValue('name')).toBe('Ada')
    expect(finish).not.toHaveBeenCalled()
    open.value = true
    await tick()
    form.value!.setFieldValue('name', '')
    button('确认').click()
    await tick()
    expect(open.value).toBe(true)
    expect(finish).not.toHaveBeenCalled()
    form.value!.setFieldValue('name', 'Grace')
    button('确认').click()
    await tick()
    expect(open.value).toBe(false)
    expect(finish).toHaveBeenLastCalledWith({ name: 'Grace' })
  })

  it('renders LightFilter secondary field rows, restores cancelled drafts and submits confirmation and clear', async () => {
    const form = ref<any>(),
      finish = vi.fn()
    wrapper = mount(
      defineComponent(
        () => () =>
          h(
            LightFilter,
            { ref: form, initialValues: { name: 'Ada' }, onFinish: finish },
            {
              default: () => [
                h(ProFormText, { name: 'name', label: 'Name' }),
                h(ProFormText, { name: 'code', label: 'Code', secondary: true }),
              ],
            },
          ),
      ),
      { attachTo: document.body },
    )
    await tick()
    expect(
      wrapper
        .find('.ant-pro-form-light-filter-middle.ant-pro-form-light-filter-effective')
        .exists(),
    ).toBe(true)
    expect(
      wrapper
        .get('[data-pro-light-container]')
        .findAll('button')
        .map((node) => node.text()),
    ).toContain('更多筛选')
    const more = button('更多筛选')
    more.click()
    await tick()
    await vi.waitFor(() =>
      expect(document.querySelector('.ant-pro-form-light-filter-line input')).not.toBeNull(),
    )
    expect(
      document.querySelector(
        '.ant-pro-field-light-wrapper-container .ant-pro-form-light-filter-line label',
      )?.textContent,
    ).toBe('Code')
    form.value.setFieldValue('code', 'draft')
    more.click()
    await tick()
    expect(form.value.getFieldValue('code')).toBeUndefined()
    expect(finish).not.toHaveBeenCalled()
    more.click()
    await tick()
    form.value.setFieldValue('code', 'confirmed')
    button('确认').click()
    await tick()
    expect(finish).toHaveBeenLastCalledWith({ name: 'Ada', code: 'confirmed' })
    button('Name: Ada').click()
    await tick()
    await vi.waitFor(() => expect(document.querySelector('[data-pro-light-footer]')).not.toBeNull())
    button('清除').click()
    await tick()
    expect(form.value.getFieldValue('name')).toBeUndefined()
    expect(finish).toHaveBeenCalledWith(expect.objectContaining({ name: undefined }))
  })

  it('collects all LightFilter fields into one popover when collapse is true', async () => {
    wrapper = mount(LightFilter, {
      attachTo: document.body,
      props: { collapse: true, collapseLabel: 'Filters' },
      slots: {
        default: () => [
          h(ProFormText, { name: 'name', label: 'Name' }),
          h(ProFormText, { name: 'code', label: 'Code', secondary: true }),
        ],
      },
    })
    await tick()
    expect(
      wrapper
        .get('[data-pro-light-container]')
        .findAll('button')
        .map((node) => node.text()),
    ).toEqual(['Filters'])
    button('Filters').click()
    await tick()
    await vi.waitFor(() =>
      expect(document.querySelectorAll('.ant-pro-form-light-filter-line input')).toHaveLength(2),
    )
  })

  it('updates Group spacing and label layout from native theme and explicit props', async () => {
    const padding = ref(32),
      labelLayout = ref<'twoLine' | 'inline'>('twoLine')
    wrapper = mount(
      defineComponent(
        () => () =>
          h(
            ConfigProvider,
            { prefixCls: 'demo', theme: { token: { paddingLG: padding.value } } },
            {
              default: () =>
                h(
                  ProForm,
                  { submitter: false, layout: 'horizontal' },
                  {
                    default: () =>
                      h(
                        ProFormGroup,
                        { size: 'large', labelLayout: labelLayout.value },
                        {
                          default: () => h(ProFormText, { name: 'name', label: 'Name' }),
                        },
                      ),
                  },
                ),
            },
          ),
      ),
      { attachTo: document.body },
    )
    await tick()
    expect(
      wrapper.find('.demo-pro-form-group-twoLine .demo-pro-form-group-container').exists(),
    ).toBe(true)
    const content = wrapper.get('[data-pro-form-group-content]').element
    const row = wrapper.get('.demo-form-item-row').element
    expect(getComputedStyle(content).gap).toBe('32px')
    expect(getComputedStyle(row).flexDirection).toBe('column')
    padding.value = 40
    labelLayout.value = 'inline'
    await tick()
    expect(getComputedStyle(content).gap).toBe('40px')
    expect(getComputedStyle(row).flexDirection).toBe('row')
    expect(wrapper.find('.demo-pro-form-group-twoLine').exists()).toBe(false)
  })

  it.each([ModalForm, DrawerForm])(
    'awaits async %s finish, deduplicates, and ignores a stale close after reopening',
    async (component) => {
      const form = ref<any>(),
        open = ref(true)
      let resolve: (value: boolean | void) => void = () => {}
      let reject: (reason: unknown) => void = () => {}
      const finish = vi.fn(
        () =>
          new Promise<boolean | void>((yes, no) => {
            resolve = yes
            reject = no
          }),
      )
      wrapper = mount(
        defineComponent(
          () => () =>
            h(
              component,
              {
                ref: form,
                open: open.value,
                'onUpdate:open': (next: boolean) => {
                  open.value = next
                },
                initialValues: { name: 'Ada' },
                onFinish: finish,
              },
              {
                default: () => h(ProFormText, { name: 'name' }),
              },
            ),
        ),
        { attachTo: document.body },
      )
      await tick()
      const pending = form.value.submit()
      void form.value.submit()
      await tick()
      await vi.waitFor(() => expect(document.querySelector('.ant-btn-loading')).not.toBeNull())
      expect(finish).toHaveBeenCalledTimes(1)
      expect(open.value).toBe(true)
      resolve(false)
      await pending
      await tick()
      expect(open.value).toBe(true)
      const noDecision = form.value.submit()
      await tick()
      resolve(undefined)
      await noDecision
      expect(open.value).toBe(true)
      const failure = form.value.submit()
      await tick()
      reject(new Error('save failed'))
      await expect(failure).rejects.toThrow('save failed')
      expect(open.value).toBe(true)
      expect(form.value.getFieldsValue()).toEqual({ name: 'Ada' })
      const stale = form.value.submit()
      await tick()
      open.value = false
      await tick()
      open.value = true
      await tick()
      resolve(true)
      await stale
      await tick()
      expect(open.value).toBe(true)
      const success = form.value.submit()
      await tick()
      resolve(true)
      await success
      await tick()
      expect(open.value).toBe(false)
    },
  )

  it.each(['composition', 'schema'] as const)(
    'hydrates %s from real browser back and forward navigation',
    async (kind) => {
      const form = ref<any>()
      const url = new URL(window.location.href)
      url.search = '?external=keep&profile.name=%22Ada%22'
      window.history.replaceState(window.history.state, '', url)
      wrapper = mount(
        defineComponent(() => () => {
          const props = { ref: form, syncToUrl: true, submitter: false as const }
          return kind === 'composition'
            ? h(ProForm, props, { default: () => h(ProFormText, { name: ['profile', 'name'] }) })
            : h(BetaSchemaForm, { ...props, columns: [{ dataIndex: ['profile', 'name'] }] })
        }),
        { attachTo: document.body },
      )
      await tick()
      expect(form.value.getFieldValue(['profile', 'name'])).toBe('Ada')
      url.searchParams.set('profile.name', JSON.stringify('Grace'))
      window.history.pushState(window.history.state, '', url)
      form.value.setFieldValue(['profile', 'name'], 'Grace')
      await tick()
      window.history.back()
      await vi.waitFor(() => expect(form.value.getFieldValue(['profile', 'name'])).toBe('Ada'))
      window.history.forward()
      await vi.waitFor(() => expect(form.value.getFieldValue(['profile', 'name'])).toBe('Grace'))
      expect(new URL(window.location.href).searchParams.get('external')).toBe('keep')
      expect(form.value.getFieldsValue()).not.toHaveProperty('external')
    },
  )

  it('keeps URL nesting, removes owned empty keys and retains unrelated query parameters', async () => {
    const form = ref<ProFormInstance>()
    const url = new URL(window.location.href)
    url.search = '?external=keep&profile.name=%22URL%22'
    window.history.replaceState(window.history.state, '', url)
    wrapper = mount(
      defineComponent(
        () => () =>
          h(
            ProForm,
            {
              ref: form,
              syncToUrl: true,
              initialValues: { profile: { name: 'initial' } },
              submitter: false,
            },
            {
              default: () => h(ProFormText, { name: ['profile', 'name'] }),
            },
          ),
      ),
      { attachTo: document.body },
    )
    await tick()
    expect(form.value!.getFieldValue(['profile', 'name'])).toBe('URL')
    form.value!.setFieldValue(['profile', 'name'], 'Ada')
    expect(new URL(window.location.href).searchParams.get('profile.name')).toBe('"Ada"')
    form.value!.setFieldValue(['profile', 'name'], undefined)
    expect(new URL(window.location.href).searchParams.has('profile.name')).toBe(false)
    expect(new URL(window.location.href).searchParams.get('external')).toBe('keep')
    const restored = new URL(window.location.href)
    restored.searchParams.set('profile.name', JSON.stringify('back'))
    window.history.replaceState(window.history.state, '', restored)
    window.dispatchEvent(new PopStateEvent('popstate'))
    await tick()
    expect(form.value!.getFieldValue(['profile', 'name'])).toBe('back')
    restored.searchParams.delete('profile.name')
    window.history.replaceState(window.history.state, '', restored)
    window.dispatchEvent(new PopStateEvent('popstate'))
    await tick()
    expect(form.value!.getFieldValue(['profile', 'name'])).toBeUndefined()
    expect(new URL(window.location.href).searchParams.get('external')).toBe('keep')
    expect(form.value!.getFieldsValue()).not.toHaveProperty('external')
  })

  it.each([ModalForm, DrawerForm])(
    'does not close an unmounted %s when its submission finishes',
    async (component) => {
      const form = ref<ProFormInstance>()
      const updateOpen = vi.fn()
      let resolve: (value: boolean) => void = () => {}
      wrapper = mount(
        defineComponent(
          () => () =>
            h(
              component,
              {
                ref: form,
                open: true,
                'onUpdate:open': updateOpen,
                onFinish: () =>
                  new Promise<boolean>((yes) => {
                    resolve = yes
                  }),
              },
              { default: () => h(ProFormText, { name: 'name' }) },
            ),
        ),
        { attachTo: document.body },
      )
      await tick()
      const pending = form.value!.submit()
      await tick()
      wrapper.unmount()
      wrapper = undefined
      resolve(true)
      await pending
      await tick()
      expect(updateOpen).not.toHaveBeenCalled()
    },
  )

  it.each(['ModalForm', 'DrawerForm'] as const)(
    'does not close an unmounted schema %s',
    async (layoutType) => {
      let resolve: (value: boolean) => void = () => {}
      const updateOpen = vi.fn()
      wrapper = mount(BetaSchemaForm, {
        attachTo: document.body,
        props: {
          layoutType,
          open: true,
          columns: [{ dataIndex: 'name' }],
          'onUpdate:open': updateOpen,
          onFinish: () =>
            new Promise<boolean>((yes) => {
              resolve = yes
            }),
        },
      })
      await tick()
      const pending = (wrapper.vm as unknown as SchemaFormInstance).submit()
      await tick()
      wrapper.unmount()
      wrapper = undefined
      resolve(true)
      await pending
      await tick()
      expect(updateOpen).not.toHaveBeenCalled()
    },
  )

  it('connects Provider and useWatch to named real forms', async () => {
    const form = ref<ProFormInstance>(),
      change = vi.fn(),
      finish = vi.fn()
    const Watcher = defineComponent({
      setup() {
        const value = ProForm.useWatch('name')
        return () => h('output', typeof value.value === 'string' ? value.value : '')
      },
    })
    wrapper = mount(
      defineComponent(
        () => () =>
          h(
            ProFormProvider,
            { onFormChange: change, onFormFinish: finish },
            {
              default: () =>
                h(
                  ProForm,
                  { ref: form, name: 'profile', initialValues: { name: 'Ada' }, submitter: false },
                  { default: () => [h(ProFormText, { name: 'name' }), h(Watcher)] },
                ),
            },
          ),
      ),
      { attachTo: document.body },
    )
    await tick()
    await wrapper.get('input').setValue('Grace')
    expect(wrapper.get('output').text()).toBe('Grace')
    expect(change).toHaveBeenCalledTimes(1)
    expect(change.mock.calls[0]![1]).toMatchObject({
      changedValues: { name: 'Grace' },
      forms: { profile: expect.any(Object) },
    })
    await form.value!.submit()
    expect(finish).toHaveBeenCalledTimes(1)
    expect(finish.mock.calls[0]![1].values).toEqual({ name: 'Grace' })
  })

  it('runs BetaSchemaForm children, object valueType and v3 formItemRender with the native form', async () => {
    const form = ref<SchemaFormInstance>()
    const render = vi.fn((_schema, context, native) =>
      h(Input, {
        value: context.record.name,
        'onUpdate:value': context.update,
        'data-schema-custom': '',
        'data-native-ref': String(Boolean(native?.validateFields)),
      }),
    )
    wrapper = mount(BetaSchemaForm, {
      attachTo: document.body,
      props: {
        ref: form,
        initialValues: { name: 'Ada', amount: 4 },
        submitter: false,
        columns: [
          {
            valueType: 'group',
            title: 'Profile',
            children: [{ dataIndex: 'name', formItemRender: render }],
          },
          { dataIndex: 'amount', valueType: { type: 'digit', min: 2, max: 8 } },
        ],
      },
    })
    await tick()
    expect(wrapper.get('[data-schema-custom]').attributes('data-native-ref')).toBe('true')
    await wrapper.get('[data-schema-custom]').setValue('Grace')
    expect((wrapper.vm as unknown as SchemaFormInstance).getFieldValue('name')).toBe('Grace')
    expect(wrapper.findComponent(InputNumber).props('max')).toBe(8)
    expect(render.mock.calls[0]![0]).toMatchObject({ dataIndex: 'name' })
  })
})
