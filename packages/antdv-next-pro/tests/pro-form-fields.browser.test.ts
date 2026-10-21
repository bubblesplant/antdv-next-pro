import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { ConfigProvider, theme, type UploadFile, type UploadProps } from 'antdv-next'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import { defineComponent, h, nextTick, ref } from 'vue'

import { ProFormUploadButton, ProFormUploadDragger } from '../src'

let wrapper: VueWrapper | undefined
type RequestOptions = Parameters<NonNullable<UploadProps['customRequest']>>[0]

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  document.body.innerHTML = ''
})

function transferFiles(...names: string[]) {
  const transfer = new DataTransfer()
  for (const name of names) transfer.items.add(new File(['test'], name, { type: 'text/plain' }))
  return transfer
}

describe('ProFormFields browser theming and upload paths', () => {
  it('uses the native dragger structure and follows runtime dark tokens', async () => {
    const dark = ref(false)
    const expected = ref('')
    const Probe = defineComponent({
      setup() {
        const { token } = theme.useToken()
        return () => {
          expected.value = token.value.colorTextDescription
          return h(ProFormUploadDragger, { fieldMode: 'field', modelValue: [] })
        }
      },
    })
    wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(
            ConfigProvider,
            {
              theme: { algorithm: dark.value ? theme.darkAlgorithm : theme.defaultAlgorithm },
            },
            { default: () => h(Probe) },
          ),
      }),
      { attachTo: document.body },
    )
    await flushPromises()
    const hint = wrapper.get('p.ant-upload-hint').element
    const normal = getComputedStyle(hint).color
    expect(wrapper.find('p.ant-upload-drag-icon').exists()).toBe(true)
    expect(wrapper.find('p.ant-upload-text').exists()).toBe(true)
    const probe = document.createElement('span')
    document.body.append(probe)
    try {
      probe.style.color = expected.value
      expect(normal).toBe(getComputedStyle(probe).color)
      dark.value = true
      await nextTick()
      await flushPromises()
      probe.style.color = expected.value
      expect(getComputedStyle(hint).color).toBe(getComputedStyle(probe).color)
      expect(getComputedStyle(hint).color).not.toBe(normal)
    } finally {
      probe.remove()
    }
  })

  it('routes a DOM file-input selection through customRequest, progress, failure and removal', async () => {
    const files = ref<UploadFile[]>([])
    let pending: RequestOptions | undefined
    const request = vi.fn((options: RequestOptions) => {
      pending = options
    })
    wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(ProFormUploadButton, {
            fieldMode: 'field',
            modelValue: files.value,
            max: 1,
            title: 'Select file',
            'onUpdate:modelValue': (value: UploadFile[] | undefined) => {
              files.value = value ?? []
            },
            fieldProps: { customRequest: request },
          }),
      }),
      { attachTo: document.body },
    )
    const input = wrapper.get('input[type=file]').element as HTMLInputElement
    Object.defineProperty(input, 'files', {
      configurable: true,
      value: transferFiles('selected.txt').files,
    })
    input.dispatchEvent(new Event('change', { bubbles: true }))
    await expect.poll(() => request.mock.calls.length).toBe(1)
    expect(files.value[0]?.name).toBe('selected.txt')
    expect(wrapper.text()).not.toContain('Select file')
    pending!.onProgress?.({ percent: 50 })
    await flushPromises()
    expect(files.value[0]?.percent).toBe(50)
    pending!.onError?.(new Error('upload failed'))
    await flushPromises()
    expect(files.value[0]?.status).toBe('error')
    await wrapper.get('button.ant-upload-list-item-action').trigger('click')
    await flushPromises()
    expect(files.value).toEqual([])
    expect(wrapper.text()).toContain('Select file')
  })

  it('processes real DOM drop events with multiple files and blocks disabled drops', async () => {
    const files = ref<UploadFile[]>([])
    const disabled = ref(false)
    const pending: RequestOptions[] = []
    const request = vi.fn((options: RequestOptions) => {
      pending.push(options)
    })
    const drop = vi.fn()
    wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(ProFormUploadDragger, {
            fieldMode: 'field',
            modelValue: files.value,
            max: 2,
            title: 'Drop files',
            disabled: disabled.value,
            'onUpdate:modelValue': (value: UploadFile[] | undefined) => {
              files.value = value ?? []
            },
            onDrop: drop,
            fieldProps: { multiple: true, customRequest: request },
          }),
      }),
      { attachTo: document.body },
    )
    const target = wrapper.get('.ant-upload-drag .ant-upload-btn').element
    target.dispatchEvent(
      new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        dataTransfer: transferFiles('first.txt', 'second.txt'),
      }),
    )
    await expect.poll(() => request.mock.calls.length).toBe(2)
    await flushPromises()
    expect(files.value.map((file) => file.name)).toEqual(['first.txt', 'second.txt'])
    for (const options of pending) {
      options.onSuccess?.({ ok: true })
      await flushPromises()
    }
    expect(files.value.every((file) => file.status === 'done')).toBe(true)
    expect(drop).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).not.toContain('Drop files')
    files.value = []
    disabled.value = true
    await nextTick()
    wrapper.get('.ant-upload-drag .ant-upload-btn').element.dispatchEvent(
      new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        dataTransfer: transferFiles('blocked.txt'),
      }),
    )
    await flushPromises()
    expect(request).toHaveBeenCalledTimes(2)
    expect(files.value).toEqual([])
  })
})
