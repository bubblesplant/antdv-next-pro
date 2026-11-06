import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { ConfigProvider } from 'antdv-next'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import { defineComponent, h, nextTick, ref, type Component } from 'vue'
import {
  BetaSchemaForm,
  DrawerForm,
  LightFilter,
  ModalForm,
  ProForm,
  ProFormGroup,
  ProFormList,
  ProFormText,
  QueryFilter,
  StepsForm,
} from '../src'

let wrapper: VueWrapper | undefined
const tick = async () => {
  await nextTick()
  await flushPromises()
}
afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  document.body.innerHTML = ''
})
const style = (element: Element) => getComputedStyle(element)

describe('ProForm upstream layout alignment', () => {
  it('keeps ordinary submitters at the start without extra spacing and uses the theme gap', async () => {
    wrapper = mount(
      defineComponent(
        () => () =>
          h(ConfigProvider, { theme: { token: { marginXS: 11 } } }, () =>
            h(ProForm, { styles: { submitter: { color: 'rgb(1, 2, 3)' } } }),
          ),
      ),
      { attachTo: document.body },
    )
    await tick()
    const submitter = document.querySelector('[data-pro-form-submitter]')!
    expect(style(submitter).justifyContent).not.toBe('flex-end')
    expect(style(submitter).marginTop).toBe('0px')
    expect(style(submitter).color).toBe('rgb(1, 2, 3)')
    expect(style(submitter.querySelector('.ant-space')!).columnGap).toBe('11px')
  })

  it('uses QueryFilter padding and row spacing without repeating root attrs on the inner form', async () => {
    wrapper = mount(QueryFilter, {
      attachTo: document.body,
      attrs: { class: 'query-root', style: { width: '600px' } },
      props: { layout: 'vertical', defaultCollapsed: false },
      slots: { default: () => h(ProFormText, { name: 'name', label: '姓名' }) },
    })
    await tick()
    const root = document.querySelector('[data-pro-query-filter]')!
    expect(style(root).padding).toBe('24px')
    expect(style(root.querySelector('[data-pro-query-row]')!).rowGap).toBe('24px')
    expect(style(root.querySelector('.ant-form-item')!).marginBottom).toBe('0px')
    expect(root.querySelector('form')!.classList.contains('ant-form-vertical')).toBe(true)
    expect(document.querySelectorAll('.query-root')).toHaveLength(1)
  })

  it('uses group title tokens, the upstream default gap, and the twoLine content indentation', async () => {
    const labelLayout = ref<string | undefined>('twoLine')
    wrapper = mount(
      defineComponent(
        () => () =>
          h(ConfigProvider, { theme: { token: { marginXL: 40 } } }, () =>
            h(ProFormGroup, { title: '分组', labelLayout: labelLayout.value }, () =>
              h(ProFormText, { name: 'name', label: '姓名' }),
            ),
          ),
      ),
      { attachTo: document.body },
    )
    await tick()
    const title = document.querySelector('[data-pro-form-group-title]')!
    const content = document.querySelector('[data-pro-form-group-content]')!
    expect(style(title).fontWeight).toBe('700')
    expect(style(title).marginBottom).toBe('8px')
    expect(style(content).columnGap).toBe('32px')
    expect(style(content).rowGap).toBe('0px')
    expect(style(content).paddingInlineStart).toBe('16px')
    labelLayout.value = undefined
    await tick()
    expect(style(title).marginBottom).toBe('40px')
  })

  it.each(['ModalForm', 'DrawerForm'] as const)(
    '%s puts composition submitters in the native footer while retaining form validation',
    async (kind) => {
      const finish = vi.fn(() => false)
      wrapper = mount((kind === 'ModalForm' ? ModalForm : DrawerForm) as Component, {
        attachTo: document.body,
        props: { open: true, title: '编辑', onFinish: finish },
        slots: {
          default: () =>
            h(ProFormText, {
              name: 'name',
              label: '姓名',
              rules: [{ required: true, message: '请输入姓名' }],
            }),
        },
      })
      await tick()
      const footer = document.querySelector('[data-pro-overlay-footer]')!
      const submitter = footer.querySelector('[data-pro-form-submitter]')!
      expect(submitter).not.toBeNull()
      expect(style(footer).justifyContent).toBe('flex-end')
      const button = footer.querySelector<HTMLButtonElement>('button[type="submit"]')!
      const form = document.querySelector('form')!
      expect(button.form).toBe(form)
      expect(button.textContent?.replace(/\s/g, '')).toBe(kind === 'ModalForm' ? '确认' : '提交')
      const dialog = document.querySelector(
        kind === 'ModalForm' ? '.ant-modal' : '.ant-drawer-content-wrapper',
      ) as HTMLElement
      expect(dialog.style.width).toBe('800px')
      button.click()
      await tick()
      expect(finish).not.toHaveBeenCalled()
      const input = document.querySelector<HTMLInputElement>('input')!
      input.value = '张三'
      input.dispatchEvent(new Event('input', { bubbles: true }))
      await tick()
      button.click()
      await tick()
      expect(finish).toHaveBeenCalledWith({ name: '张三' })
    },
  )

  it.each(['ModalForm', 'DrawerForm'] as const)(
    '%s uses the same footer rendering and native form association for schema forms',
    async (layoutType) => {
      const finish = vi.fn(() => false)
      wrapper = mount(BetaSchemaForm, {
        attachTo: document.body,
        props: {
          layoutType,
          open: true,
          onFinish: finish,
          initialValues: { name: '李四' },
          columns: [{ title: '姓名', dataIndex: 'name', valueType: 'text' }],
          styles: { submitter: { padding: '3px' } },
        },
      })
      await tick()
      const footer = document.querySelector('[data-pro-overlay-footer]')!
      const submitter = footer.querySelector('[data-pro-form-submitter]')!
      expect(submitter).not.toBeNull()
      expect(style(submitter).padding).toBe('3px')
      const button = footer.querySelector<HTMLButtonElement>('button[type="submit"]')!
      expect(button.form).toBe(document.querySelector('form'))
      button.click()
      await tick()
      expect(finish).toHaveBeenCalledWith({ name: '李四' })
    },
  )

  it('keeps StepsForm actions in the centered content area', async () => {
    wrapper = mount(StepsForm, {
      attachTo: document.body,
      slots: {
        default: () =>
          h(StepsForm.StepForm, { name: 'basic', title: '基本信息' }, () =>
            h(ProFormText, { name: 'name', label: '姓名' }),
          ),
      },
    })
    await tick()
    const content = document.querySelector('[data-pro-steps-form-content]')!
    expect(content.querySelector('[data-pro-steps-form-submitter]')).not.toBeNull()
    expect(style(content).minWidth).toBe('min(420px, 100%)')
    expect(style(content).paddingTop).toBe('0px')
    expect(style(content.querySelector('[data-pro-steps-form-step]')!).marginTop).toBe('32px')
  })

  it('uses themed LightFilter gaps and the native small line height', async () => {
    wrapper = mount(
      defineComponent(
        () => () =>
          h(ConfigProvider, { componentSize: 'small', theme: { token: { marginXS: 13 } } }, () =>
            h(LightFilter, null, () => h(ProFormText, { name: 'name', label: '姓名' })),
          ),
      ),
      { attachTo: document.body },
    )
    await tick()
    const root = document.querySelector('[data-pro-light-filter="small"]')!
    expect(root).not.toBeNull()
    expect(style(root.querySelector('[data-pro-light-container]')!).gap).toBe('13px')
    expect(style(root).lineHeight).not.toBe('30px')
  })

  it('reserves creator spacing for the top position and hides repeated default list labels', async () => {
    const creatorPosition = ref<'top' | 'bottom'>('top')
    wrapper = mount(
      defineComponent(
        () => () =>
          h(
            ProForm,
            {
              initialValues: { people: [{ name: '甲' }, { name: '乙' }] },
            },
            {
              default: () =>
                h(
                  ProFormList,
                  { name: 'people', creatorButtonProps: { position: creatorPosition.value } },
                  () => h(ProFormText, { name: 'name', label: '姓名' }),
                ),
            },
          ),
      ),
      {
        attachTo: document.body,
      },
    )
    await tick()
    const creator = document.querySelector('[data-pro-form-list-creator]')!
    expect(style(creator).marginBottom).toBe('24px')
    const labels = document.querySelectorAll('[data-pro-form-list-item] .ant-form-item-label')
    expect(style(labels[0]!).display).not.toBe('none')
    expect(style(labels[1]!).display).toBe('none')
    creatorPosition.value = 'bottom'
    await tick()
    expect(style(document.querySelector('[data-pro-form-list-creator]')!).marginBottom).toBe('0px')
  })
})
