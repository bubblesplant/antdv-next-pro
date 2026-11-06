import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { ConfigProvider, theme } from 'antdv-next'
import { afterEach, describe, expect, it } from 'vite-plus/test'
import { defineComponent, h, nextTick, ref } from 'vue'
import { ProConfigProvider, ProField, ProFormText, ProFormTextArea, useProConfig } from '../src'

let wrapper: VueWrapper | undefined

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  document.body.innerHTML = ''
})

function resolvedColor(color: string) {
  const probe = document.createElement('span')
  probe.style.color = color
  document.body.append(probe)
  const result = getComputedStyle(probe).color
  probe.remove()
  return result
}

describe('field styles against the fixed ProComponents baseline', () => {
  it('renders readonly code with the baseline layout and reactive theme tokens', async () => {
    const dark = ref(false)
    let expectedColor = ''
    let expectedFont = ''
    const Probe = defineComponent({
      setup() {
        const { token } = useProConfig()
        return () => {
          expectedColor = token.value.colorTextSecondary
          expectedFont = token.value.fontFamilyCode
          return h(ProField, { text: 'const value = 1', valueType: 'code' })
        }
      },
    })
    wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(
            ConfigProvider,
            { theme: { algorithm: dark.value ? theme.darkAlgorithm : theme.defaultAlgorithm } },
            { default: () => h(Probe) },
          ),
      }),
      { attachTo: document.body },
    )
    await flushPromises()
    const pre = wrapper.get('pre').element as HTMLElement
    const normal = getComputedStyle(pre)
    expect(normal.padding).toBe('16px')
    expect(normal.overflow).toBe('auto')
    expect(pre.style.fontSize).toBe('85%')
    expect(pre.style.lineHeight).toBe('1.45')
    expect(normal.borderRadius).toBe('3px')
    expect(normal.backgroundColor).toBe('rgba(150, 150, 150, 0.1)')
    expect(pre.style.width).toBe('min-content')
    expect(normal.color).toBe(resolvedColor(expectedColor))
    const fontProbe = document.createElement('span')
    fontProbe.style.fontFamily = expectedFont
    expect(pre.style.fontFamily).toBe(fontProbe.style.fontFamily)
    const lightColor = normal.color
    dark.value = true
    await nextTick()
    await flushPromises()
    expect(getComputedStyle(pre).color).toBe(resolvedColor(expectedColor))
    expect(getComputedStyle(pre).color).not.toBe(lightColor)
  })

  it('preserves code fieldProps and lets control semantic styles override defaults', () => {
    wrapper = mount(ProField, {
      props: {
        valueType: 'jsonCode',
        text: { value: 1 },
        fieldProps: {
          class: 'field-code',
          'data-code': 'custom',
          style: { padding: '4px', width: '100%', whiteSpace: 'pre-wrap' },
        },
        classes: { control: 'semantic-code' },
        styles: { control: { padding: '6px 8px', borderRadius: '9px', color: '#234567' } },
      },
      attachTo: document.body,
    })
    const pre = wrapper.get('pre')
    expect(pre.classes()).toEqual(expect.arrayContaining(['field-code', 'semantic-code']))
    expect(pre.attributes('data-code')).toBe('custom')
    const style = getComputedStyle(pre.element)
    expect(style.padding).toBe('6px 8px')
    expect(style.borderRadius).toBe('9px')
    expect(style.color).toBe('rgb(35, 69, 103)')
    expect(style.whiteSpace).toBe('pre-wrap')
    expect((pre.element as HTMLElement).style.width).toBe('100%')
    expect(wrapper.get('code').text()).toBe('{\n  "value": 1\n}')
  })

  it('keeps textarea line breaks and readonly control styling through the form wrapper', () => {
    const fieldProps = { class: 'field-textarea', style: { padding: '3px' } }
    wrapper = mount(ProFormTextArea, {
      props: {
        fieldMode: 'field',
        readonly: true,
        modelValue: 'First line\nSecond line',
        prefixCls: 'demo-pro-field',
        fieldProps,
        classes: { root: 'field-root', control: 'semantic-textarea' },
        styles: { control: { color: '#123456' } },
      },
      attachTo: document.body,
    })
    expect(wrapper.find('.demo-pro-field.demo-pro-field-read').exists()).toBe(true)
    expect(wrapper.classes()).toContain('field-root')
    const textarea = wrapper.get('.demo-pro-field-readonly-textarea')
    expect(textarea.classes()).toEqual(
      expect.arrayContaining(['field-textarea', 'semantic-textarea']),
    )
    expect(textarea.element.textContent).toBe('First line\nSecond line')
    const style = getComputedStyle(textarea.element)
    expect(style.whiteSpace).toBe('pre-wrap')
    expect(style.display).toBe('inline-block')
    expect(style.overflowWrap).toBe('anywhere')
    expect(style.maxWidth).toBe('100%')
    expect(style.padding).toBe('3px')
    expect(style.color).toBe('rgb(18, 52, 86)')
  })

  it('retains text control semantics when a field switches to readonly', async () => {
    wrapper = mount(ProFormText, {
      props: {
        fieldMode: 'field',
        modelValue: 'LongText',
        prefixCls: 'demo-pro-field',
        classes: { control: 'semantic-text' },
        styles: { control: { color: '#345678' } },
      },
      attachTo: document.body,
    })
    expect(wrapper.get('.semantic-text').element.tagName).toBe('INPUT')
    await wrapper.setProps({ readonly: true })
    const text = wrapper.get('.semantic-text')
    expect(text.text()).toBe('LongText')
    expect(getComputedStyle(text.element).color).toBe('rgb(52, 86, 120)')
    const root = wrapper.get('.demo-pro-field-read')
    expect(getComputedStyle(root.element).overflowWrap).toBe('anywhere')
  })

  it('uses a themed compact numeric range and preserves size, disabled and separator options', async () => {
    const fieldProps = ref<Record<string, unknown>>({
      style: { width: '320px' },
      size: 'small',
      disabled: true,
      placeholder: ['Minimum', 'Maximum'],
    })
    wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(
            ProConfigProvider,
            {
              token: {
                colorBorder: '#123456',
                colorBgContainer: '#e1e2e3',
                colorTextSecondary: '#345678',
              },
            },
            {
              default: () =>
                h(ProField, {
                  valueType: 'digitRange',
                  mode: 'edit',
                  modelValue: [1, 9],
                  fieldProps: fieldProps.value,
                }),
            },
          ),
      }),
      { attachTo: document.body },
    )
    const compact = wrapper.get('.ant-space-compact-block')
    expect(getComputedStyle(compact.element).width).toBe('320px')
    const controls = wrapper.findAll('.ant-input-number')
    expect(controls).toHaveLength(2)
    const widthProbe = document.createElement('span')
    widthProbe.style.width = 'calc((100% - 30px) / 2)'
    for (const control of controls) {
      expect(control.classes()).toEqual(
        expect.arrayContaining(['ant-input-number-sm', 'ant-input-number-disabled']),
      )
      expect((control.element as HTMLElement).style.width).toBe(widthProbe.style.width)
    }
    const inputs = wrapper.findAll('input')
    expect(inputs.map((input) => input.attributes('placeholder'))).toEqual(['Minimum', 'Maximum'])
    expect(inputs.every((input) => (input.element as HTMLInputElement).disabled)).toBe(true)
    const separator = compact.get(':scope > span[aria-hidden="true"]')
    const style = getComputedStyle(separator.element)
    expect(style.width).toBe('30px')
    expect(style.flexShrink).toBe('0')
    expect(style.borderTopWidth).toBe('1px')
    expect(style.borderTopColor).toBe('rgb(18, 52, 86)')
    expect(style.backgroundColor).toBe('rgb(225, 226, 227)')
    expect(style.color).toBe('rgb(52, 86, 120)')
    fieldProps.value = { ...fieldProps.value, separator: '至', separatorWidth: 44 }
    await nextTick()
    expect(separator.text()).toBe('至')
    expect(getComputedStyle(separator.element).width).toBe('44px')
  })
})
