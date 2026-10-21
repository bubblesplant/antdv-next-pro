import { createRequire } from 'node:module'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// 只挂载独立审计实例，不修改 playground 源码、不操作示例数据的外部接口。
const root = process.cwd()
const output = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(path.join(root, 'packages/antdv-next-pro/package.json'))
const { chromium } = require('playwright')
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const result = { checkedAt: new Date().toISOString(), local: {}, official: [] }

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  const browserErrors = []
  page.on('pageerror', (error) => browserErrors.push(error.message))
  await page.goto('http://127.0.0.1:9902', { waitUntil: 'networkidle', timeout: 30000 })
  result.local = await page.evaluate(async () => {
    const entry = '/@fs/C:/malei/stu/antv-next-pro/packages/antdv-next-pro/src/'
    const source = await (await fetch(entry + 'ProCard.vue')).text()
    const vueUrl = source.match(/from "([^"]*\/vue\.js\?[^"]+)"/)[1]
    const antdUrl = source.match(/from "([^"]*\/antdv-next\.js\?[^"]+)"/)[1]
    const { createApp, h, nextTick, ref } = await import(vueUrl)
    const { ConfigProvider } = await import(antdUrl)
    const library = await import(entry + 'index.ts')
    const observations = {}
    const tick = async () => {
      await nextTick()
      await new Promise((resolve) => setTimeout(resolve, 80))
    }
    const mount = async (render, check) => {
      const host = document.createElement('div')
      host.id = 'pro-components-audit-probe'
      host.style.cssText = 'position:relative;width:1200px;background:white;'
      document.body.append(host)
      const warnings = []
      const app = createApp({ render })
      app.config.warnHandler = (message) => warnings.push(message)
      app.mount(host)
      try {
        await tick()
        return { ...(await check(host)), warnings }
      } finally {
        app.unmount()
        host.remove()
      }
    }
    const classList = (host) => [
      ...new Set(
        [...host.querySelectorAll('[class]')]
          .flatMap((node) => [...node.classList])
          .filter((name) => /^(antdv-next-pro|ant-pro|demo-pro)/.test(name)),
      ),
    ]
    observations.exports = Object.keys(library).sort()
    observations.cardGlobalPrefix = await mount(
      () =>
        h(
          ConfigProvider,
          { prefixCls: 'demo' },
          {
            default: () =>
              h(
                library.ProCard,
                { title: '审计卡片', class: 'audit-user-class' },
                { default: () => '内容' },
              ),
          },
        ),
      (host) => ({
        rootClass: host.firstElementChild.className,
        proClasses: classList(host),
        hasDemoCard: Boolean(host.querySelector('.demo-card')),
        hasOfficialProClass: Boolean(host.querySelector('.demo-pro-card')),
      }),
    )
    observations.cardCustomPrefix = await mount(
      () =>
        h(
          library.ProCard,
          { title: '审计卡片', prefixCls: 'demo-pro-card' },
          { default: () => '内容' },
        ),
      (host) => ({ rootClass: host.firstElementChild.className, proClasses: classList(host) }),
    )
    let requests = 0
    const columns = Array.from({ length: 5 }, (_, i) => ({
      title: '字段' + i,
      dataIndex: 'field' + i,
      formItemProps: i === 0 ? { rules: [{ required: true, message: '必填审计' }] } : {},
    }))
    observations.table = await mount(
      () =>
        h(library.ProTable, {
          columns,
          pagination: false,
          class: 'audit-table-class',
          rowClassName: () => 'audit-row-class',
          request: async () => {
            requests += 1
            return { data: [{ id: 1, field0: '值' }], success: true, total: 1 }
          },
        }),
      async (host) => {
        const before = requests
        const searchForm = host.querySelector('form')
        const initialSearchInputs = searchForm.querySelectorAll('input').length
        searchForm.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
        await tick()
        return {
          rootClass: host.firstElementChild.className,
          proClasses: classList(host),
          initialSearchInputs,
          defaultFullScreenButton: Boolean(host.querySelector('[aria-label="全屏"]')),
          rowClassReachedRow: Boolean(host.querySelector('tr.audit-row-class')),
          rowClassAttributeOnOuterDiv: host.firstElementChild.getAttribute('rowclassname'),
          requestsBeforeEmptyRequiredSubmit: before,
          requestsAfterEmptyRequiredSubmit: requests,
          validationErrorsAfterSubmit: host.querySelectorAll('.ant-form-item-explain-error').length,
        }
      },
    )
    for (const name of [
      'Form',
      'Embed',
      'QueryFilter',
      'LightFilter',
      'StepForm',
      'StepsForm',
      'SchemaForm',
    ]) {
      observations[name] = await mount(
        () =>
          h(library[name], {
            columns: [{ title: '名称', dataIndex: 'name' }],
            class: 'audit-form-class',
          }),
        (host) => ({
          proClasses: classList(host),
          formClass: host.querySelector('form')?.className,
          userClassAttached: Boolean(host.querySelector('.audit-form-class')),
          buttons: [...host.querySelectorAll('button')].map((button) => button.textContent.trim()),
        }),
      )
    }
    observations.fieldPublicProps = await mount(
      () =>
        h('div', [
          h(library.ProFormText, {
            name: 'audit-text',
            placeholder: '官网顶层占位符',
            width: 'md',
          }),
          h(library.ProFormDigit, { name: 'audit-digit', max: 10 }),
        ]),
      (host) => ({
        textInputPlaceholder: host
          .querySelector('input:not([role="spinbutton"])')
          ?.getAttribute('placeholder'),
        placeholderOnFormItem: host.querySelector('[placeholder="官网顶层占位符"]')?.tagName,
        digitInputMaximum: host.querySelector('[role="spinbutton"]')?.getAttribute('aria-valuemax'),
      }),
    )
    let finishState = 'not-called'
    const closeEvents = []
    observations.modalAsyncFinish = await mount(
      () =>
        h(library.ModalForm, {
          columns: [{ title: '名称', dataIndex: 'name' }],
          open: true,
          'onUpdate:open': (value) => closeEvents.push({ open: value, finishState }),
          onFinish: async () => {
            finishState = 'pending'
            await new Promise((resolve) => setTimeout(resolve, 500))
            finishState = 'resolved-false'
            return false
          },
        }),
      async () => {
        const modal = [...document.querySelectorAll('.ant-modal')].find(
          (node) => node.getBoundingClientRect().width > 0,
        )
        const modalClass = modal?.className
        modal
          .querySelector('form')
          .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
        await tick()
        const during = {
          finishState,
          modalVisible: Boolean(
            modal && getComputedStyle(modal.closest('.ant-modal-wrap')).display !== 'none',
          ),
          modalClass,
          submitLoading: Boolean(modal?.querySelector('.ant-btn-loading')),
        }
        await new Promise((resolve) => setTimeout(resolve, 550))
        return {
          duringFinishPromise: during,
          closeEvents,
          afterFinishState: finishState,
          modalVisibleAfterFalse: Boolean(
            modal && getComputedStyle(modal.closest('.ant-modal-wrap')).display !== 'none',
          ),
        }
      },
    )
    observations.readonly = await mount(
      () =>
        h(
          'div',
          ['digit', 'money', 'date', 'select', 'indexBorder'].map((valueType) =>
            h(library.ProFormField, {
              fieldMode: 'field',
              readonly: true,
              valueType,
              modelValue:
                valueType === 'date'
                  ? '2026-10-21T12:34:56.000Z'
                  : valueType === 'select'
                    ? 'ok'
                    : 12345.6,
              valueEnum:
                valueType === 'select' ? { ok: { text: '成功', status: 'Success' } } : undefined,
            }),
          ),
        ),
      (host) => ({
        text: host.textContent,
        fields: [...host.querySelectorAll('.antdv-next-pro-readonly-field')].map(
          (node) => node.textContent,
        ),
        badges: host.querySelectorAll('.ant-badge').length,
        proClasses: classList(host),
      }),
    )
    const editRef = ref()
    observations.editableDefaultMode = await mount(
      () =>
        h(library.EditableProTable, {
          ref: editRef,
          columns: [{ title: '名称', dataIndex: 'name' }],
          value: [
            { id: 1, name: 'A' },
            { id: 2, name: 'B' },
          ],
        }),
      async (host) => {
        const first = await editRef.value.startEditable(1)
        const second = await editRef.value.startEditable(2)
        await tick()
        return {
          first,
          second,
          editingInputs: host.querySelectorAll('.ant-table-tbody input').length,
          proClasses: classList(host),
        }
      },
    )
    return observations
  })
  result.local.browserErrors = browserErrors
  const urls = ['card', 'table/api', 'query-filter', 'steps-form', 'field-set']
  result.official = await Promise.all(
    urls.map(async (name) => {
      const reference = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
      try {
        const response = await reference.goto(
          `https://pro-components.antdigital.dev/components/${name}/`,
          { waitUntil: 'domcontentloaded', timeout: 45000 },
        )
        await reference.waitForTimeout(1500)
        return {
          page: name,
          url: reference.url(),
          status: response.status(),
          ...(await reference.evaluate(() => ({
            title: document.title,
            proClasses: [
              ...new Set(
                [...document.querySelectorAll('[class]')]
                  .flatMap((node) => [...node.classList])
                  .filter((name) => name.startsWith('ant-pro-')),
              ),
            ].sort(),
            formLayouts: [
              ...new Set(
                [...document.querySelectorAll('form')].map((form) =>
                  [...form.classList]
                    .filter((name) => /ant-form-(inline|horizontal|vertical)/.test(name))
                    .join(' '),
                ),
              ),
            ],
            // 类名为实际渲染 DOM 证据；不声称所有示例或交互均已验证。
          }))),
        }
      } catch (error) {
        return { page: name, error: String(error) }
      } finally {
        await reference.close()
      }
    }),
  )
  const fieldIndex = await readFile(
    path.join(root, 'packages/antdv-next-pro/src/pro-form-fields/index.ts'),
    'utf8',
  )
  const fieldNames = [...fieldIndex.matchAll(/\['(ProForm[^']+)',/g)].map((match) => match[1])
  result.fieldWrappers = await Promise.all(
    fieldNames.map(async (name) => {
      const filename = name === 'ProFormText' ? 'ProFormText.vue' : `${name}.vue`
      const source = await readFile(
        path.join(root, 'packages/antdv-next-pro/src/pro-form-fields', filename),
        'utf8',
      )
      return {
        name,
        filename,
        fieldType: source.match(/field-type="([^"]+)"/)?.[1],
        routesToProFormField: source.includes('<ProFormField'),
        sourceLines: source.split(/\r?\n/).length,
      }
    }),
  )
  await writeFile(
    path.join(output, 'runtime-evidence.json'),
    JSON.stringify(result, null, 2) + '\n',
  )
  console.log(
    JSON.stringify(
      {
        output: path.join(output, 'runtime-evidence.json'),
        localCases: Object.keys(result.local),
        official: result.official.map(({ page, status, proClasses, error }) => ({
          page,
          status,
          classCount: proClasses?.length,
          error,
        })),
        fields: result.fieldWrappers.length,
        browserErrors: result.local.browserErrors,
      },
      null,
      2,
    ),
  )
} finally {
  await browser.close()
}
