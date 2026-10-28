import { flushPromises, mount } from '@vue/test-utils'
import { ConfigProvider, FormItem, Input, Select, theme } from 'antdv-next'
import enUS from 'antdv-next/locale/en_US'
import zhCN from 'antdv-next/locale/zh_CN'
import { defineComponent, h, nextTick, ref } from 'vue'
import { beforeAll, describe, expect, it, vi } from 'vite-plus/test'
import {
  ProConfigProvider,
  createIntl,
  intlMapKeys,
  useProConfig,
  useProPrefix,
} from '../src/provider'
import ProField from '../src/pro-field/ProField'
import ProFormText from '../src/pro-form-fields/ProFormText.vue'
import {
  ProFormDateQuarterPicker,
  ProFormRadioSingle,
} from '../src/pro-form-fields/additionalFields'
import { useFieldOptions } from '../src/pro-form-fields/useFieldOptions'
import {
  ProFormColorPicker,
  ProFormUploadDragger,
  ProFormSearchSelect,
} from '../src/pro-form-fields'

beforeAll(() => {
  window.matchMedia ??= vi
    .fn()
    .mockImplementation(() => ({ matches: false, addListener: vi.fn(), removeListener: vi.fn() }))
})

describe('Provider and field alignment', () => {
  it('inherits reactive native locale/prefix/direction and merges explicit Pro tokens', async () => {
    const locale = ref(enUS)
    const color = ref('#135790')
    const Probe = defineComponent({
      setup() {
        const config = useProConfig()
        const prefix = useProPrefix('field')
        return () =>
          h(
            'output',
            {
              'data-prefix': prefix.value,
              dir: config.direction.value,
              style: { color: config.token.value.colorText },
            },
            config.intl.value.getMessage('tableForm.search'),
          )
      },
    })
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(
            ConfigProvider,
            { locale: locale.value, prefixCls: 'demo', direction: 'rtl' },
            {
              default: () =>
                h(
                  ProConfigProvider,
                  { token: { colorText: color.value } },
                  { default: () => h(Probe) },
                ),
            },
          ),
      }),
    )
    expect(wrapper.find('output').text()).toBe('Query')
    expect(wrapper.find('output').attributes('data-prefix')).toBe('demo-pro-field')
    expect(wrapper.find('output').attributes('dir')).toBe('rtl')
    expect(wrapper.find('output').attributes('style')).toContain('rgb(19, 87, 144)')
    locale.value = zhCN
    color.value = '#ff0000'
    await nextTick()
    expect(wrapper.find('output').text()).toBe('查询')
    expect(wrapper.find('output').attributes('style')).toContain('rgb(255, 0, 0)')
    wrapper.unmount()
  })

  it('keeps explicit intl and preserves empty translations and all 34 locales', () => {
    expect(intlMapKeys).toHaveLength(34)
    expect(
      createIntl('custom', { tableForm: { search: '' } }).getMessage(
        'tableForm.search',
        'fallback',
      ),
    ).toBe('')
    const wrapper = mount(ProConfigProvider, {
      props: { intl: createIntl('custom', { tableForm: { search: 'Own' } }) },
      slots: {
        default: () =>
          h(
            ConfigProvider,
            { locale: enUS },
            { default: () => h(ProField, { text: 'x', valueType: 'local' }) },
          ),
      },
    })
    expect(wrapper.text()).toBe('x')
    wrapper.unmount()
  })

  it('consumes formal custom formItemRender and feeds changes back to the model', async () => {
    const value = ref('initial')
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(
            ProConfigProvider,
            {
              valueTypeMap: {
                custom: {
                  formItemRender: (text, context) =>
                    h('input', {
                      value: String(text),
                      onInput: (event: Event) =>
                        context.onChange((event.target as HTMLInputElement).value),
                    }),
                },
              },
            },
            {
              default: () =>
                h(ProField, {
                  valueType: 'custom',
                  mode: 'edit',
                  modelValue: value.value,
                  'onUpdate:modelValue': (next: unknown) => {
                    value.value = String(next)
                  },
                }),
            },
          ),
      }),
    )
    await wrapper.find('input').setValue('updated')
    expect(value.value).toBe('updated')
    wrapper.unmount()
  })

  it('routes convenient props to controls and lets fieldProps override them', () => {
    const wrapper = mount(ProFormText, {
      props: {
        fieldMode: 'field',
        placeholder: 'convenience',
        fieldProps: { placeholder: 'field', maxlength: 3 },
      },
    })
    expect(wrapper.findComponent(Input).props('placeholder')).toBe('field')
    expect(wrapper.find('input').attributes('maxlength')).toBe('3')
    wrapper.unmount()
  })

  it('renders atomic radio and sets date picker modes', () => {
    const radio = mount(ProFormRadioSingle, { attrs: { fieldMode: 'field' } })
    expect(radio.find('input[type=radio]').exists()).toBe(true)
    radio.unmount()
    const picker = mount(ProFormDateQuarterPicker, { attrs: { fieldMode: 'field' } })
    expect(picker.find('input').exists()).toBe(true)
    picker.unmount()
  })

  it('preserves compact algorithms when Pro dark is set', () => {
    const Probe = defineComponent({
      setup() {
        const { token } = theme.useToken()
        return () =>
          h('output', {
            'data-height': token.value.controlHeight,
            'data-color': token.value.colorBgContainer,
          })
      },
    })
    const wrapper = mount(ConfigProvider, {
      props: { theme: { algorithm: theme.compactAlgorithm } },
      slots: { default: () => h(ProConfigProvider, { dark: true }, { default: () => h(Probe) }) },
    })
    expect(Number(wrapper.find('output').attributes('data-height'))).toBeLessThan(32)
    expect(wrapper.find('output').attributes('data-color')).not.toBe('#ffffff')
    wrapper.unmount()
  })

  it('debounces keyword requests and discards old results before the next request starts', async () => {
    vi.useFakeTimers()
    const requests: Array<(value: string[]) => void> = []
    const request = vi.fn(() => new Promise<string[]>((resolve) => requests.push(resolve)))
    const keyWords = ref('first')
    let state!: ReturnType<typeof useFieldOptions>
    const Probe = defineComponent({
      setup() {
        state = useFieldOptions({ request, keyWords, debounceTime: ref(50) })
        return () =>
          h(
            'output',
            state.options.value.map((option) => option.label),
          )
      },
    })
    const wrapper = mount(Probe)
    await vi.advanceTimersByTimeAsync(50)
    keyWords.value = 'second'
    await nextTick()
    requests[0]!(['stale'])
    await flushPromises()
    expect(wrapper.text()).not.toContain('stale')
    await vi.advanceTimersByTimeAsync(50)
    expect(request).toHaveBeenLastCalledWith({ keyWords: 'second' })
    requests[1]!(['latest'])
    await flushPromises()
    expect(wrapper.text()).toContain('latest')
    wrapper.unmount()
    vi.useRealTimers()
  })

  it('deduplicates identical scoped requests and switches contentHash cache versions reactively', async () => {
    const hash = ref('v1')
    const request = vi.fn(async () => [{ label: `Version ${hash.value}`, value: 'a' }])
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(
            ProConfigProvider,
            { contentHash: hash.value },
            {
              default: () => [
                h(ProField, { valueType: 'select', text: 'a', request }),
                h(ProField, { valueType: 'select', text: 'a', request }),
              ],
            },
          ),
      }),
    )
    await flushPromises()
    expect(request).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toBe('Version v1Version v1')
    hash.value = 'v2'
    await nextTick()
    await flushPromises()
    expect(request).toHaveBeenCalledTimes(2)
    expect(wrapper.text()).toBe('Version v2Version v2')
    hash.value = 'v1'
    await nextTick()
    await flushPromises()
    expect(request).toHaveBeenCalledTimes(2)
    expect(wrapper.text()).toBe('Version v1Version v1')
    wrapper.unmount()
  })

  it('isolates sibling Provider caches and respects cacheForSwr false', async () => {
    const request = vi.fn(async () => [{ label: 'Alpha', value: 'a' }])
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h('div', [
            ...[1, 2].map(() =>
              h(
                ProConfigProvider,
                {},
                { default: () => h(ProField, { valueType: 'select', text: 'a', request }) },
              ),
            ),
            h(
              ProConfigProvider,
              {},
              {
                default: () =>
                  [1, 2].map(() =>
                    h(ProField, { valueType: 'select', text: 'a', request, cacheForSwr: false }),
                  ),
              },
            ),
          ]),
      }),
    )
    await flushPromises()
    expect(request).toHaveBeenCalledTimes(4)
    wrapper.unmount()
  })

  it('updates public field part classes with native prefix and preserves explicit field prefixes', async () => {
    const prefix = ref('ant')
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(
            ConfigProvider,
            { prefixCls: prefix.value },
            {
              default: () => [
                h(ProField, { valueType: 'text', text: 'Read' }),
                h(ProField, {
                  valueType: 'select',
                  text: 'a',
                  options: [{ label: 'Alpha', value: 'a' }],
                }),
                ...['treeSelect', 'cascader', 'color'].map((valueType) =>
                  h(ProField, { valueType, mode: 'edit' }),
                ),
                h(ProField, {
                  valueType: 'radio',
                  mode: 'edit',
                  options: [{ label: 'Alpha', value: 'a' }],
                  fieldProps: { layout: 'vertical' },
                }),
                h(ProField, {
                  valueType: 'checkbox',
                  mode: 'edit',
                  options: [{ label: 'Alpha', value: 'a' }],
                }),
                h(ProField, { valueType: 'cascader', mode: 'edit', prefixCls: 'own-field' }),
              ],
            },
          ),
      }),
    )
    for (const name of [
      'readonly',
      'tree-select',
      'cascader',
      'color-picker',
      'radio-vertical',
      'checkbox-horizontal',
    ])
      expect(wrapper.find(`.ant-pro-field-${name}`).exists()).toBe(true)
    expect(wrapper.find('.pro-field-select-read').exists()).toBe(true)
    expect(wrapper.find('.own-field-cascader').exists()).toBe(true)
    prefix.value = 'demo'
    await nextTick()
    for (const name of [
      'readonly',
      'tree-select',
      'cascader',
      'color-picker',
      'radio-vertical',
      'checkbox-horizontal',
    ])
      expect(wrapper.find(`.demo-pro-field-${name}`).exists()).toBe(true)
    expect(wrapper.find('[class*="ant-pro-field"]').exists()).toBe(false)
    expect(wrapper.find('.own-field-cascader').exists()).toBe(true)
    wrapper.unmount()
  })

  it('inherits real FormItem error and warning classes for radio and checkbox groups', async () => {
    const status = ref<'error' | 'warning'>('error')
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(
            FormItem,
            { validateStatus: status.value },
            {
              default: () =>
                ['radio', 'checkbox'].map((valueType) =>
                  h(ProField, {
                    valueType,
                    mode: 'edit',
                    options: [{ label: 'Alpha', value: 'a' }],
                  }),
                ),
            },
          ),
      }),
    )
    for (const group of ['radio', 'checkbox'])
      expect(wrapper.find(`.ant-pro-field-${group}-error`).exists()).toBe(true)
    status.value = 'warning'
    await nextTick()
    for (const group of ['radio', 'checkbox']) {
      expect(wrapper.find(`.ant-pro-field-${group}-warning`).exists()).toBe(true)
      expect(wrapper.find(`.ant-pro-field-${group}-error`).exists()).toBe(false)
    }
    wrapper.unmount()
  })

  it('applies semantic part overrides, callback updates, legacy priority and field width', async () => {
    const color = ref('red')
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(ProFormUploadDragger, {
            fieldMode: 'field',
            width: 'md',
            classes: () => ({
              root: 'own-root',
              control: 'own-upload',
              title: 'own-title',
              description: 'own-description',
              icon: 'own-icon',
            }),
            classNames: { root: 'legacy-root', title: 'legacy-title' },
            styles: () => ({ title: { color: color.value } }),
          }),
      }),
    )
    expect(wrapper.find('.ant-upload-drag').attributes('style')).toContain('width: 328px')
    expect(wrapper.find('.legacy-root').exists()).toBe(false)
    expect(wrapper.find('.legacy-title').exists()).toBe(false)
    for (const name of ['upload', 'title', 'description', 'icon'])
      expect(wrapper.find(`.own-${name}`).exists()).toBe(true)
    expect(wrapper.find('.own-title').attributes('style')).toContain('color: red')
    color.value = 'blue'
    await nextTick()
    expect(wrapper.find('.own-title').attributes('style')).toContain('color: blue')
    expect(wrapper.find('.ant-upload-drag-icon').exists()).toBe(true)
    wrapper.unmount()
  })

  it('routes wrapper root and native control semantics through ProField in read and edit modes', async () => {
    const wrapper = mount(ProFormColorPicker, {
      props: {
        modelValue: '#1677ff',
        classes: { root: 'own-item', control: 'own-color-control' },
        styles: { control: { outline: '1px solid red' } },
      },
    })
    expect(wrapper.findAll('.own-item')).toHaveLength(1)
    expect(wrapper.find('.own-color-control').exists()).toBe(true)
    expect(wrapper.find('.own-color-control').attributes('style')).toContain(
      'outline: 1px solid red',
    )
    await wrapper.setProps({ readonly: true })
    expect(wrapper.findAll('.own-item')).toHaveLength(1)
    expect(wrapper.find('.own-color-control').exists()).toBe(true)
    expect(wrapper.find('.own-color-control').attributes('style')).toContain(
      'outline: 1px solid red',
    )
    wrapper.unmount()
  })

  it('exposes upstream index/option/SearchSelect state classes and consumes margin token', () => {
    const wrapper = mount(ProConfigProvider, {
      props: { token: { margin: 29 } },
      slots: {
        default: () => [
          h(ProField, { valueType: 'indexBorder', text: 3 }),
          h(ProField, { valueType: 'option', text: [h('a', 'Edit'), h('a', 'Delete')] }),
          h(ProFormSearchSelect, { fieldMode: 'field', disabled: true }),
        ],
      },
    })
    expect(wrapper.find('.ant-pro-field-index-column-border.top-three').text()).toBe('4')
    expect(wrapper.find('.ant-pro-field-option').attributes('style')).toContain('gap: 29px')
    expect(wrapper.find('.ant-pro-filed-search-select-disabled').exists()).toBe(true)
    expect(wrapper.findComponent(Select).props('disabled')).toBe(true)
    wrapper.unmount()
  })
})
