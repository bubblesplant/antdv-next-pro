import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { ConfigProvider, theme } from 'antdv-next'
import { afterEach, describe, expect, it } from 'vite-plus/test'
import { defineComponent, h, nextTick } from 'vue'

import SchemaForm from '../src/SchemaForm.vue'
import type { SchemaFormColumn, SchemaFormInstance } from '../src/types'
import type { FormRecord } from '../src/schema-form/utils'
import { resolveCssVariableColor } from './helpers/themeProbe'

let wrapper: VueWrapper | undefined

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  document.body.innerHTML = ''
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

  it('themes form list titles and rows from Antdv dark tokens', async () => {
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
    const listTitle = wrapper.get('.antdv-next-pro-form-list-title').element as HTMLElement
    const listRow = wrapper.get('.antdv-next-pro-form-list-row').element as HTMLElement

    expect(body.style.getPropertyValue('--antdv-next-pro-color-text')).not.toBe('')
    expect(getComputedStyle(listTitle).color).toBe(
      resolveCssVariableColor(body, '--antdv-next-pro-color-text'),
    )
    expect(getComputedStyle(listRow).backgroundColor).toBe(
      resolveCssVariableColor(body, '--antdv-next-pro-color-fill-alter'),
    )
  })
})
