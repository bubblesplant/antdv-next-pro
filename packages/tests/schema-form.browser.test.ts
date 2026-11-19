import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { ConfigProvider, theme } from 'antdv-next'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import { defineComponent, h, nextTick, type Component } from 'vue'

import SchemaForm from '../src/SchemaForm.vue'
import { StepsForm } from '../src/schema-form'
import type { SchemaFormColumn, SchemaFormInstance } from '../src/types'
import type { FormRecord } from '../src/schema-form/utils'
import { resolveCssVariableColor } from './helpers/themeProbe'

let wrapper: VueWrapper | undefined
const initialUrl = window.location.href

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  document.body.innerHTML = ''
  window.history.replaceState(window.history.state, '', initialUrl)
})

describe('SchemaForm browser interactions', () => {
  it('binds a real Antdv Next input and reactively renders dependencies', async () => {
    const columns: SchemaFormColumn<FormRecord>[] = [
      {
        title: 'Kind',
        dataIndex: 'kind',
        fieldProps: { 'data-testid': 'kind-input' },
        transform: (value) => ({ normalizedKind: String(value).toUpperCase() }),
      },
      {
        valueType: 'dependency',
        dependencies: ['kind'],
        renderFormItem: (_column, context) =>
          h(
            'output',
            { 'data-testid': 'kind-output' },
            typeof context.record.kind === 'string' ? context.record.kind : '',
          ),
      },
    ]
    wrapper = mount(SchemaForm, {
      attachTo: document.body,
      props: {
        columns,
        layoutType: 'Embed',
        initialValues: { kind: 'basic' },
        submitter: false,
      },
    })
    await flushPromises()

    const input = wrapper.get('[data-testid="kind-input"]')
    expect(input.element).toBeInstanceOf(HTMLInputElement)
    expect(wrapper.get('[data-testid="kind-output"]').text()).toBe('basic')

    await input.setValue('advanced')
    await nextTick()
    expect(wrapper.get('[data-testid="kind-output"]').text()).toBe('advanced')

    const form = wrapper.vm as unknown as SchemaFormInstance<FormRecord>
    expect(form.getFieldsValue()).toEqual({ kind: 'advanced' })
    await expect(form.submit()).resolves.toEqual({ normalizedKind: 'ADVANCED' })
  })

  it.each([
    ['SchemaForm', SchemaForm],
    ['StepsForm', StepsForm],
  ] as const)(
    'maps %s step metadata to matrix columns and submits all fields',
    async (_name, component) => {
      const onFinish = vi.fn()
      const url = new URL(initialUrl)
      url.searchParams.set('count', JSON.stringify('2'))
      window.history.replaceState(window.history.state, '', url)
      const columns: SchemaFormColumn<FormRecord>[][] = [
        [{ dataIndex: 'name', title: 'Name', formItemProps: { rules: [{ required: true }] } }],
        [
          {
            dataIndex: 'count',
            title: 'Count',
            convertValue: Number,
            transform: (value) => ({ total: Number(value) * 10 }),
          },
        ],
      ]
      wrapper = mount(component as Component, {
        attachTo: document.body,
        props: {
          columns,
          steps: [
            { name: 'account', title: 'Account', stepProps: { content: 'Create your account' } },
            { name: 'profile', title: 'Profile' },
          ],
          layoutType: 'StepsForm',
          current: 0,
          urlSync: true,
          onFinish,
        },
      })
      await flushPromises()
      const form = wrapper.vm as unknown as SchemaFormInstance<FormRecord>
      expect(wrapper.get('[data-pro-steps-form-header]').text()).toContain('Create your account')
      expect(wrapper.findAll('[data-pro-steps-form-step]')).toHaveLength(2)
      expect(form.getFieldValue('count')).toBe(2)
      await expect(form.next()).resolves.toBe(false)
      const activeStep = () => wrapper!.get('[data-pro-steps-form-step][aria-hidden="false"]')
      await activeStep().get('input').setValue('Ada')
      await expect(form.next()).resolves.toBe(true)
      await flushPromises()
      expect(activeStep().text()).toContain('Count')
      await expect(form.submit()).resolves.toEqual({ name: 'Ada', total: 20 })
      expect(onFinish).toHaveBeenCalledExactlyOnceWith({ name: 'Ada', total: 20 })
    },
  )

  it('themes list labels and controls from Antdv dark tokens', async () => {
    const DarkThemeHost = defineComponent({
      setup() {
        return () =>
          h(
            ConfigProvider,
            { theme: { algorithm: theme.darkAlgorithm } },
            {
              default: () =>
                h(SchemaForm, {
                  columns: [
                    {
                      title: 'Account',
                      valueType: 'group',
                      columns: [{ title: 'Name', dataIndex: 'name' }],
                    },
                    {
                      title: 'Members',
                      dataIndex: 'members',
                      valueType: 'formList',
                      columns: [{ dataIndex: 'memberName' }],
                    },
                  ] satisfies SchemaFormColumn<FormRecord>[],
                  layoutType: 'Embed',
                  initialValues: { name: 'Ada', members: [{ memberName: 'Grace' }] },
                  submitter: false,
                }),
            },
          )
      },
    })

    wrapper = mount(DarkThemeHost, { attachTo: document.body })
    await flushPromises()

    const body = wrapper.get('.antdv-next-pro-schema-body').element as HTMLElement
    const listTitle = wrapper.get('[data-pro-form-list] .ant-form-item-label label')
      .element as HTMLElement
    const listControl = wrapper.get('[data-pro-form-list] input').element as HTMLElement

    expect(body.style.getPropertyValue('--antdv-next-pro-color-text')).not.toBe('')
    expect(getComputedStyle(listTitle).color).toBe(
      resolveCssVariableColor(body, '--antdv-next-pro-color-text'),
    )
    expect(getComputedStyle(listControl).backgroundColor).toBe(
      resolveCssVariableColor(body, '--antdv-next-pro-color-bg-container'),
    )
  })
})
