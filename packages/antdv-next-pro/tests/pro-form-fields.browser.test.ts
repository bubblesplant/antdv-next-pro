import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { ConfigProvider, theme } from 'antdv-next'
import { afterEach, describe, expect, it } from 'vite-plus/test'
import { defineComponent, h } from 'vue'

import { ProFormUploadDragger } from '../src'
import { resolveCssVariableColor } from './helpers/themeProbe'

let wrapper: VueWrapper | undefined

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  document.body.innerHTML = ''
})

describe('ProFormFields browser theming', () => {
  it('themes the standalone upload dragger placeholder from Antdv dark tokens', async () => {
    const DarkThemeHost = defineComponent({
      setup() {
        return () =>
          h(
            ConfigProvider,
            { theme: { algorithm: theme.darkAlgorithm } },
            {
              default: () => h(ProFormUploadDragger, { fieldMode: 'field', modelValue: [] }),
            },
          )
      },
    })

    wrapper = mount(DarkThemeHost, { attachTo: document.body })
    await flushPromises()

    const placeholder = wrapper.get('.antdv-next-pro-upload-dragger-placeholder')
      .element as HTMLElement

    expect(placeholder.style.getPropertyValue('--antdv-next-pro-color-text-secondary')).not.toBe('')
    expect(getComputedStyle(placeholder).color).toBe(
      resolveCssVariableColor(placeholder, '--antdv-next-pro-color-text-secondary'),
    )
  })
})
