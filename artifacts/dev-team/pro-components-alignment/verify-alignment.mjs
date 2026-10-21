import { createRequire } from 'node:module'
import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// 独立验收探针：复用已存在的开发服务，只挂载本地模拟数据，不请求外部业务接口。
const root = process.cwd()
const output = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(path.join(root, 'packages/antdv-next-pro/package.json'))
const { chromium } = require('playwright')
const localeUrls = ['en_US', 'zh_CN'].map(
  (name) => '/@fs/' + require.resolve(`antdv-next/locale/${name}`).replaceAll('\\', '/'),
)
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const errors = []
const result = { checkedAt: new Date().toISOString(), checks: [], browserErrors: errors }

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  page.on('pageerror', (error) => errors.push(error.message))
  const qaUrl = new URL('/__pro_alignment_qa__', process.env.PRO_QA_URL ?? 'http://127.0.0.1:9902')
    .href
  await page.route(qaUrl, (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><html><head><meta charset="utf-8"></head><body></body></html>',
    }),
  )
  await page.goto(qaUrl, {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  })
  Object.assign(
    result,
    await page.evaluate(
      async ({ localeUrls }) => {
        const entry = '/@fs/C:/malei/stu/antv-next-pro/packages/antdv-next-pro/src/'
        const source = await (await fetch(entry + 'ProCard.vue')).text()
        const vueUrl = source.match(/from ["']([^"']*\/vue\.js\?[^"']+)["']/)?.[1]
        const antUrl = source.match(/from ["']([^"']*\/antdv-next\.js\?[^"']+)["']/)?.[1]
        if (!vueUrl || !antUrl) throw new Error('无法从现有开发服务解析 Vue/antdv-next 入口')
        const { createApp, defineComponent, h, nextTick, ref } = await import(vueUrl)
        const { ConfigProvider, theme, Input } = await import(antUrl)
        const [{ default: enUS }, { default: zhCN }] = await Promise.all([
          import(localeUrls[0]),
          import(localeUrls[1]),
        ])
        const lib = await import(entry + 'index.ts')
        await import(entry + 'style.css')
        const checks = []
        const tick = async (ms = 80) => {
          await nextTick()
          await new Promise((resolve) => setTimeout(resolve, ms))
        }
        const assert = (condition, message) => {
          if (!condition) throw new Error(message)
        }
        const fixture = async (render, inspect) => {
          const host = document.createElement('div')
          host.style.cssText = 'width:1200px;position:relative;'
          host.dataset.alignmentProbe = 'true'
          document.body.append(host)
          const warnings = []
          const app = createApp({ render })
          app.config.warnHandler = (message) => warnings.push(message)
          try {
            app.mount(host)
            await tick()
            return { ...(await inspect(host)), warnings }
          } finally {
            app.unmount()
            host.remove()
          }
        }
        const run = async (name, covers, callback) => {
          try {
            checks.push({ name, covers, passed: true, details: await callback() })
          } catch (error) {
            checks.push({ name, covers, passed: false, error: String(error?.stack ?? error) })
          }
        }
        const columns = [{ title: 'Name', dataIndex: 'name' }]

        await run(
          '保留新增组件与组合成员可公开导入',
          ['G06', 'M03', 'M05', 'M06', 'M07', 'M08'],
          async () => {
            const names = [
              'ProConfigProvider',
              'ProProvider',
              'ProField',
              'ProForm',
              'BetaSchemaForm',
              'ProFormGroup',
              'ProFormFieldSet',
              'ProFormList',
              'ProFormDependency',
              'ProFormItem',
              'ProFormCascader',
              'ProFormColorPicker',
              'ProFormRate',
              'ProFormDigitRange',
              'ProFormTimePicker',
              'ProFormTimeRangePicker',
              'ProList',
              'BaseProList',
              'ProDescriptions',
              'DragSortTable',
              'RowEditorTable',
              'CellEditorTable',
              'ListToolBar',
              'TableDropdown',
              'Search',
              'LightWrapper',
              'ErrorBoundary',
              'DropdownFooter',
              'FieldLabel',
              'FilterDropdown',
              'InlineErrorFormItem',
              'LabelIconTip',
            ]
            const missing = names.filter((name) => !lib[name])
            assert(missing.length === 0, `缺少导出：${missing.join(', ')}`)
            for (const [component, member] of [
              ['ProCard', 'Group'],
              ['ProCard', 'Divider'],
              ['ProFormRadio', 'Group'],
              ['ProFormCheckbox', 'Group'],
              ['ProFormDatePicker', 'Week'],
              ['ProFormDatePicker', 'Month'],
              ['ProFormDatePicker', 'Quarter'],
              ['ProFormDatePicker', 'Year'],
              ['StepsForm', 'StepForm'],
            ])
              assert(lib[component]?.[member], `缺少组合成员：${component}.${member}`)
            return {
              names,
              excludedExportsPresent: [
                'ProSkeleton',
                'LoginForm',
                'LoginFormPage',
                'PageContainer',
                'ProLayout',
                'StatisticCard',
                'CheckCard',
              ].filter((name) => lib[name]),
            }
          },
        )

        await run('原生前缀和方向在挂载树中更新', ['G01', 'G02', 'G09'], async () => {
          const prefix = ref('ant')
          const direction = ref('ltr')
          return fixture(
            () =>
              h(
                ConfigProvider,
                { prefixCls: prefix.value, direction: direction.value },
                {
                  default: () =>
                    h('div', [
                      h(lib.ProCard, { title: 'Card' }, { default: () => 'Body' }),
                      h(lib.ProTable, {
                        columns,
                        dataSource: [{ id: 1, name: 'Ada' }],
                        pagination: false,
                      }),
                      h(
                        lib.ProForm,
                        { submitter: false },
                        { default: () => h(lib.ProFormText, { name: 'name' }) },
                      ),
                    ]),
                },
              ),
            async (host) => {
              assert(host.querySelector('.ant-pro-card'), '默认卡片类名不符')
              assert(host.querySelector('.ant-pro-table'), '默认表格类名不符')
              assert(host.querySelector('.ant-pro-form'), '默认组合表单类名不符')
              prefix.value = 'demo'
              direction.value = 'rtl'
              await tick()
              assert(host.querySelector('.demo-pro-card'), '卡片没有动态更新前缀')
              assert(host.querySelector('.demo-pro-table'), '表格没有动态更新前缀')
              assert(host.querySelector('.demo-pro-form'), '表单没有动态更新前缀')
              const stale = [...host.querySelectorAll('[class]')]
                .flatMap((node) => [...node.classList])
                .filter((name) => name.startsWith('ant-pro-'))
              assert(stale.length === 0, `残留旧前缀：${stale.join(',')}`)
              for (const selector of ['.demo-pro-card', '.demo-pro-table', '.demo-pro-form'])
                assert(
                  getComputedStyle(host.querySelector(selector)).direction === 'rtl',
                  `${selector} 没有响应 RTL`,
                )
              return { direction: getComputedStyle(host.querySelector('.demo-pro-card')).direction }
            },
          )
        })

        await run('classes/styles 回调与旧别名优先级', ['G01', 'Q01', 'C04'], () =>
          fixture(
            () =>
              h(
                lib.ProCard,
                {
                  title: 'Title',
                  class: 'qa-user-root',
                  classNames: { title: 'qa-legacy-title' },
                  classes: ({ props }) => ({
                    title: props.title === 'Title' ? 'qa-new-title' : 'qa-wrong',
                  }),
                  styles: () => ({ title: { color: 'rgb(12, 34, 56)' } }),
                },
                { default: () => 'Body' },
              ),
            async (host) => {
              const title = host.querySelector('.qa-new-title')
              assert(title, 'classes 回调未生效')
              assert(!title.classList.contains('qa-legacy-title'), 'classes 没有覆盖同部位旧别名')
              assert(host.querySelector('.qa-user-root'), '容器 class 丢失')
              assert(getComputedStyle(title).color === 'rgb(12, 34, 56)', 'styles 回调未作用标题')
              return { titleClass: title.className }
            },
          ),
        )

        await run('原生 locale 统一切换 Pro 文案并保留实例覆盖', ['G05', 'G08'], async () => {
          const language = ref('en')
          return fixture(
            () =>
              h(
                ConfigProvider,
                { locale: language.value === 'en' ? enUS : zhCN },
                {
                  default: () =>
                    h('div', [
                      h(lib.ProTable, { columns, dataSource: [], pagination: false }),
                      h(lib.ProForm, null, { default: () => h(lib.ProFormText, { name: 'name' }) }),
                      h(lib.ProFormField, {
                        fieldMode: 'field',
                        readonly: true,
                        valueType: 'switch',
                        modelValue: true,
                      }),
                    ]),
                },
              ),
            async (host) => {
              const english = host.textContent
              assert(
                /Query|Search/i.test(english) && /Reset/i.test(english),
                '表格没有继承原生英文 locale',
              )
              assert(/Submit/i.test(english), '组合表单没有继承英文 locale')
              assert(!/查询|重置|提交|开启/.test(english), '内置文案存在中英混用')
              language.value = 'zh_CN'
              await tick()
              const chinese = host.textContent.replace(/\s/g, '')
              assert(
                chinese.includes('查询') && chinese.includes('提交'),
                `locale 更新后没有恢复中文：${host.textContent}`,
              )
              return { english, chinese: host.textContent }
            },
          )
        })

        await run('原生主题与原生 Card token 生效', ['G04', 'G05'], async () => {
          const dark = ref(false)
          return fixture(
            () =>
              h(
                ConfigProvider,
                {
                  theme: {
                    algorithm: dark.value ? theme.darkAlgorithm : theme.defaultAlgorithm,
                    components: { Card: { bodyPadding: 7, headerBg: '#123456' } },
                  },
                },
                { default: () => h(lib.ProCard, { title: 'Theme' }, { default: () => 'Body' }) },
              ),
            async (host) => {
              const body = host.querySelector('.ant-pro-card-body')
              assert(body, '缺少公开 card-body')
              const padding = getComputedStyle(body).paddingInlineStart
              assert(padding === '7px', `原生 Card.bodyPadding 未继承：${padding}`)
              const before = getComputedStyle(host.querySelector('.ant-pro-card')).backgroundColor
              dark.value = true
              await tick()
              const after = getComputedStyle(host.querySelector('.ant-pro-card')).backgroundColor
              assert(before !== after, '算法切换后背景未响应')
              return { padding, before, after }
            },
          )
        })

        await run(
          '嵌套 Provider 合并、并列隔离与卸载恢复',
          ['G02', 'G04', 'G06', 'G07'],
          async () => {
            const showChild = ref(true)
            const childColor = ref('#2468ac')
            const caches = new Map()
            const Probe = defineComponent({
              props: { id: String },
              setup(props) {
                const config = lib.useProConfig()
                return () => {
                  caches.set(props.id, config.cache)
                  return h(
                    'output',
                    { 'data-config-probe': props.id },
                    JSON.stringify({
                      primary: config.token.value.colorPrimary,
                      text: config.token.value.colorText,
                      height: config.token.value.layout?.header?.heightLayoutHeader,
                      header: config.token.value.layout?.header?.colorBgHeader,
                      prefix: config.prefixCls.value,
                      search: config.intl.value.getMessage('tableForm.search'),
                      fields: Object.keys(config.valueTypeMap.value).sort(),
                    }),
                  )
                }
              },
            })
            return fixture(
              () =>
                h(
                  ConfigProvider,
                  { prefixCls: 'outer', locale: { locale: 'en' } },
                  {
                    default: () =>
                      h('div', [
                        h(
                          lib.ProConfigProvider,
                          {
                            token: {
                              colorPrimary: '#135790',
                              layout: { header: { heightLayoutHeader: 61 } },
                            },
                            valueTypeMap: { parentField: { render: (value) => String(value) } },
                          },
                          {
                            default: () => [
                              h(Probe, { id: 'parent' }),
                              showChild.value &&
                                h(
                                  lib.ProConfigProvider,
                                  {
                                    token: {
                                      colorText: childColor.value,
                                      layout: { header: { colorBgHeader: '#abcdef' } },
                                    },
                                    valueTypeMap: {
                                      childField: { render: (value) => String(value) },
                                    },
                                  },
                                  {
                                    default: () =>
                                      h(
                                        ConfigProvider,
                                        { prefixCls: 'inner', locale: { locale: 'zh_CN' } },
                                        {
                                          default: () => h(Probe, { id: 'child' }),
                                        },
                                      ),
                                  },
                                ),
                            ],
                          },
                        ),
                        h(
                          lib.ProConfigProvider,
                          { token: { colorPrimary: '#bada55' } },
                          { default: () => h(Probe, { id: 'sibling' }) },
                        ),
                      ]),
                  },
                ),
              async (host) => {
                const read = (id) =>
                  JSON.parse(host.querySelector(`[data-config-probe="${id}"]`).textContent)
                const parent = read('parent'),
                  child = read('child'),
                  sibling = read('sibling')
                assert(
                  child.primary === '#135790' && child.text === '#2468ac',
                  '子 Provider 没有合并父全局 token',
                )
                assert(
                  child.height === 61 && child.header === '#abcdef',
                  '嵌套 layout token 未按字段合并',
                )
                assert(
                  child.fields.includes('parentField') && child.fields.includes('childField'),
                  '子 valueTypeMap 丢失父注册',
                )
                assert(
                  parent.fields.length === 1 && sibling.fields.length === 0,
                  'valueTypeMap 污染父或并列 Provider',
                )
                assert(
                  child.prefix === 'inner-pro' && parent.prefix === 'outer-pro',
                  '内层原生 prefix 作用域错误',
                )
                assert(
                  child.search === '查询' && /Query|Search/.test(parent.search),
                  '原生 locale 嵌套作用域错误',
                )
                assert(
                  sibling.primary === '#bada55' && parent.primary === '#135790',
                  '并列 token 串用',
                )
                assert(
                  caches.get('parent') !== caches.get('child') &&
                    caches.get('parent') !== caches.get('sibling'),
                  '独立 Provider 意外共享缓存',
                )
                childColor.value = '#654321'
                await tick()
                assert(
                  read('child').text === '#654321' && read('parent').text !== '#654321',
                  '运行时 token 未更新或影响父区域',
                )
                showChild.value = false
                await tick()
                assert(!host.querySelector('[data-config-probe="child"]'), '子 Provider 没有卸载')
                assert(
                  JSON.stringify(read('parent')) === JSON.stringify(parent),
                  '子卸载后父配置受到污染',
                )
                return { parent, child, sibling }
              },
            )
          },
        )

        await run('Pro dark 保留 compact 与自定义算法，动态恢复', ['G04', 'G07'], async () => {
          const dark = ref(false)
          const custom = (_seed, map) => ({ ...map, borderRadius: 13 })
          const Probe = defineComponent({
            setup() {
              const { token } = theme.useToken()
              return () =>
                h(
                  'output',
                  { 'data-theme-probe': true },
                  JSON.stringify({
                    height: token.value.controlHeight,
                    radius: token.value.borderRadius,
                    background: token.value.colorBgContainer,
                  }),
                )
            },
          })
          return fixture(
            () =>
              h(
                ConfigProvider,
                { theme: { algorithm: [theme.compactAlgorithm, custom] } },
                {
                  default: () =>
                    h(lib.ProConfigProvider, { dark: dark.value }, { default: () => h(Probe) }),
                },
              ),
            async (host) => {
              const read = () => JSON.parse(host.querySelector('[data-theme-probe]').textContent)
              const before = read()
              dark.value = true
              await tick()
              const during = read()
              assert(during.height === before.height && during.height < 32, 'Pro dark 丢失 compact')
              assert(during.radius === 13, 'Pro dark 丢失自定义算法')
              assert(during.background !== before.background, 'Pro dark 未改变配色')
              dark.value = false
              await tick()
              assert(
                JSON.stringify(read()) === JSON.stringify(before),
                '关闭 Pro dark 没有恢复父主题',
              )
              return { before, during, after: read() }
            },
          )
        })

        await run('Card 受控选中、键盘和禁用约束', ['C03'], async () => {
          const checked = ref(false)
          const disabled = ref(false)
          let changes = 0
          return fixture(
            () =>
              h('div', [
                h(lib.ProCard, { title: 'Plain' }, { default: () => 'plain' }),
                h(
                  lib.ProCard,
                  {
                    title: 'Selectable',
                    checked: checked.value,
                    disabled: disabled.value,
                    onChecked: () => {
                      changes++
                      checked.value = !checked.value
                    },
                  },
                  { default: () => 'selectable' },
                ),
              ]),
            async (host) => {
              const plain = [...host.querySelectorAll('.ant-pro-card')][0]
              const target = [...host.querySelectorAll('.ant-pro-card')][1]
              assert(
                !plain.hasAttribute('aria-checked') && plain.getAttribute('role') !== 'checkbox',
                '普通 Card 被误判可选',
              )
              target.dispatchEvent(
                new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }),
              )
              await tick()
              assert(
                changes === 1 && target.getAttribute('aria-checked') === 'true',
                '空格未更新受控选中',
              )
              target.dispatchEvent(
                new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }),
              )
              await tick()
              assert(
                changes === 2 && target.getAttribute('aria-checked') === 'false',
                'Enter 未更新受控选中',
              )
              disabled.value = true
              await tick()
              target.click()
              target.dispatchEvent(
                new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }),
              )
              await tick()
              assert(
                changes === 2 && target.getAttribute('tabindex') === '-1',
                'disabled 仍可变更选择',
              )
              return { changes, checked: checked.value, disabled: disabled.value }
            },
          )
        })

        await run('必填搜索拒绝请求且基础 rowClassName 透传', ['T01', 'T02', 'T06'], async () => {
          let calls = 0
          return fixture(
            () =>
              h(lib.ProTable, {
                columns: [
                  {
                    title: 'Name',
                    dataIndex: 'name',
                    formItemProps: {
                      rules: [{ required: true, message: 'QA required' }],
                    },
                  },
                ],
                pagination: false,
                rowClassName: () => 'qa-native-row',
                request: async () => {
                  calls++
                  return { data: [{ id: 1, name: 'Ada' }], total: 1, success: true }
                },
              }),
            async (host) => {
              assert(host.querySelector('tr.qa-native-row'), 'rowClassName 没有到达 tr')
              assert(!host.querySelector('[aria-label="全屏"]'), '默认全屏按钮应隐藏')
              const before = calls
              const form = host.querySelector('form')
              assert(form, '没有真实搜索表单')
              form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
              await tick(180)
              assert(calls === before, '校验失败仍发出请求')
              assert(host.textContent.includes('QA required'), '未显示原生表单校验错误')
              return { before, after: calls }
            },
          )
        })

        await run('分组列 children 与 v3 render 参数', ['T06', 'T07'], () =>
          fixture(
            () =>
              h(lib.ProTable, {
                search: false,
                pagination: false,
                dataSource: [{ id: 1, name: 'Ada' }],
                columns: [
                  {
                    title: 'Group',
                    children: [
                      {
                        title: 'Name',
                        dataIndex: 'name',
                        render: (_dom, record, index, action, schema) =>
                          h(
                            'strong',
                            {
                              'data-qa-render': 'true',
                            },
                            `${record.name}:${index}:${typeof action.reload}:${schema.dataIndex}`,
                          ),
                      },
                    ],
                  },
                ],
              }),
            async (host) => {
              const cell = host.querySelector('[data-qa-render]')
              assert(
                cell?.textContent === 'Ada:0:function:name',
                `v3 render 结果异常：${cell?.textContent}`,
              )
              return { text: cell.textContent }
            },
          ),
        )

        await run('Editable 默认 single 保留现有草稿', ['E01'], async () => {
          const instance = ref()
          return fixture(
            () =>
              h(lib.EditableProTable, {
                ref: instance,
                columns,
                value: [
                  { id: 1, name: 'Ada' },
                  { id: 2, name: 'Grace' },
                ],
                search: false,
                pagination: false,
              }),
            async (host) => {
              assert(instance.value, '没有公开组件实例')
              assert(await instance.value.startEditable(1), '第一行无法编辑')
              const second = await instance.value.startEditable(2)
              await tick()
              assert(second === false, '默认 single 允许同时编辑另一行')
              const values = [...host.querySelectorAll('tbody input')].map((node) => node.value)
              assert(
                values.includes('Ada') && !values.includes('Grace'),
                '已有草稿被取消或第二行进入编辑',
              )
              return { second, values }
            },
          )
        })

        await run(
          '组合 ProForm 自动注册并执行 transform',
          ['F01', 'F02', 'F10', 'P01'],
          async () => {
            const instance = ref()
            let submitted
            return fixture(
              () =>
                h(
                  lib.ProForm,
                  {
                    ref: instance,
                    initialValues: { name: 'Ada', code: '7' },
                    class: 'qa-form-attrs',
                    onFinish: (values) => {
                      submitted = values
                      return true
                    },
                  },
                  {
                    default: () => [
                      h(lib.ProFormText, { name: 'name', label: 'Name' }),
                      h(lib.ProFormText, {
                        name: 'code',
                        label: 'Code',
                        transform: (value) => ({ serial: Number(value) }),
                      }),
                    ],
                  },
                ),
              async (host) => {
                assert(host.querySelector('input').value === 'Ada', '组合字段没有自动读取初始值')
                assert(host.querySelector('form.qa-form-attrs'), '表单 class 未到达可见 form')
                await instance.value.submit()
                await tick()
                assert(
                  submitted?.name === 'Ada' && submitted.serial === 7 && !('code' in submitted),
                  `组合字段 transform 结果异常：${JSON.stringify(submitted)}`,
                )
                return { submitted }
              },
            )
          },
        )

        await run('ProFormList 嵌套注册、稳定移动与异步守卫', ['F10', 'M06'], async () => {
          const form = ref(),
            list = ref()
          let guardCalls = 0
          return fixture(
            () =>
              h(
                lib.ProForm,
                {
                  ref: form,
                  submitter: false,
                  initialValues: { people: [{ name: 'Ada' }, { name: 'Grace' }] },
                },
                {
                  default: () =>
                    h(
                      lib.ProFormList,
                      {
                        ref: list,
                        name: 'people',
                        min: 2,
                        max: 3,
                        actionGuard: {
                          beforeAddRow: async (record) => {
                            guardCalls++
                            return record.name !== 'blocked'
                          },
                        },
                      },
                      { default: () => h(lib.ProFormText, { name: 'name' }) },
                    ),
                },
              ),
            async (host) => {
              const inputs = () => [...host.querySelectorAll('.ant-pro-form-list input')]
              assert(
                inputs()
                  .map((node) => node.value)
                  .join(',') === 'Ada,Grace',
                '列表字段路径或初始值错误',
              )
              const ada = inputs()[0]
              assert(list.value.move(0, 1) === true, 'move 拒绝合法索引')
              await tick()
              assert(
                inputs()[1] === ada && inputs()[0].value === 'Grace',
                `move 没有保留行节点或字段路径：${inputs()
                  .map((node) => node.value)
                  .join(',')}，节点相同=${inputs()[1] === ada}`,
              )
              assert((await list.value.remove(0)) === false, 'min 限制失效')
              assert(
                (await list.value.add({ name: 'blocked' })) === false,
                'beforeAddRow=false 没有阻止添加',
              )
              assert((await list.value.copy(0)) === true, 'copy 未复制合法行')
              await tick()
              assert(
                inputs()
                  .map((node) => node.value)
                  .join(',') === 'Grace,Grace,Ada',
                'copy 后字段数据错位',
              )
              assert((await list.value.add({ name: 'extra' })) === false, 'max 限制失效')
              assert((await list.value.remove(1)) === true, 'remove 拒绝合法删除')
              await tick()
              assert(
                form.value
                  .getFieldsValue()
                  .people.map((row) => row.name)
                  .join(',') === 'Grace,Ada',
                '列表操作没有同步表单',
              )
              return { guardCalls, values: form.value.getFieldsValue() }
            },
          )
        })

        await run('StepsForm 每步等待、拒绝推进与返回保留草稿', ['F05', 'M06'], async () => {
          const steps = ref()
          let decision = false
          let finished
          return fixture(
            () =>
              h(
                lib.StepsForm,
                {
                  ref: steps,
                  onFinish: (values) => {
                    finished = values
                    return false
                  },
                },
                {
                  default: () => [
                    h(
                      lib.StepsForm.StepForm,
                      {
                        name: 'first',
                        title: 'First',
                        initialValues: { name: 'Ada' },
                        onFinish: async () => decision,
                      },
                      {
                        default: () =>
                          h(lib.ProFormText, { name: 'name', rules: [{ required: true }] }),
                      },
                    ),
                    h(
                      lib.StepsForm.StepForm,
                      { name: 'second', title: 'Second', initialValues: { code: '7' } },
                      {
                        default: () => h(lib.ProFormText, { name: 'code' }),
                      },
                    ),
                  ],
                },
              ),
            async (host) => {
              assert(steps.value.formMap().size === 2, 'StepForm 没有分别注册')
              assert((await steps.value.next()) === false, '每步 onFinish=false 仍推进')
              decision = true
              assert((await steps.value.next()) === true, '每步 onFinish=true 没有推进')
              await tick()
              assert(
                host.querySelector('.ant-pro-steps-form-step-active input')?.value === '7',
                '第二步实例或初始值错误',
              )
              steps.value.prev()
              await tick()
              assert(
                host.querySelector('.ant-pro-steps-form-step-active input')?.value === 'Ada',
                '返回丢失第一步草稿',
              )
              await steps.value.next()
              await steps.value.submit()
              assert(finished?.name === 'Ada' && finished.code === '7', '最终提交没有合并各步值')
              return { finished, forms: [...steps.value.formMap().keys()] }
            },
          )
        })

        for (const name of ['ModalForm', 'DrawerForm']) {
          await run(`${name} 等待 onFinish，false/true 控制关闭`, ['F06', 'F07'], async () => {
            const events = []
            let release
            let result = false
            const pending = () =>
              new Promise((resolve) => {
                release = () => resolve(result)
              })
            return fixture(
              () =>
                h(lib[name], {
                  open: true,
                  columns,
                  initialValues: { name: 'Ada' },
                  onFinish: pending,
                  'onUpdate:open': (value) => events.push(value),
                }),
              async () => {
                const popup = document.querySelector(
                  name === 'ModalForm' ? '.ant-modal' : '.ant-drawer',
                )
                assert(popup, `${name} 没有打开`)
                popup
                  .querySelector('form')
                  .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
                await tick()
                assert(release, '没有执行 onFinish')
                assert(events.length === 0, 'Promise pending 已发出关闭')
                await tick(300)
                assert(popup.querySelector('.ant-btn-loading'), '等待期间没有 loading')
                release()
                await tick()
                assert(events.length === 0, 'onFinish=false 仍关闭')
                result = true
                popup
                  .querySelector('form')
                  .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
                await tick()
                release()
                await tick()
                assert(events.includes(false), 'onFinish=true 没有发出关闭')
                return { events }
              },
            )
          })
        }

        await run('ProList meta 与 ProDescriptions 状态字段实际显示', ['M03', 'P02'], () =>
          fixture(
            () =>
              h('div', [
                h(lib.ProList, {
                  dataSource: [{ id: 1, name: 'Ada', description: 'Engineer' }],
                  rowKey: 'id',
                  pagination: false,
                  metas: {
                    title: { dataIndex: 'name' },
                    description: { dataIndex: 'description' },
                  },
                }),
                h(lib.ProDescriptions, {
                  dataSource: { status: 'ok' },
                  columns: [
                    {
                      title: 'Status',
                      dataIndex: 'status',
                      valueEnum: { ok: { text: 'Ready', status: 'Success' } },
                    },
                  ],
                }),
              ]),
            async (host) => {
              assert(
                host.querySelector('.ant-pro-list')?.textContent.includes('Ada'),
                'ProList 未按 meta 显示标题',
              )
              assert(
                host.querySelector('.ant-pro-list')?.textContent.includes('Engineer'),
                'ProList 未显示 description',
              )
              assert(
                host.querySelector('.ant-pro-descriptions')?.textContent.includes('Ready'),
                '描述字段没有解析枚举',
              )
              assert(host.querySelector('.ant-pro-descriptions .ant-badge'), '描述字段状态颜色丢失')
              return { text: host.textContent }
            },
          ),
        )

        await run(
          '自定义 valueType 同时进入表格展示和组合表单',
          ['G06', 'T09', 'M05'],
          async () => {
            const fieldMap = {
              qaCustom: {
                render: (value) => h('b', { 'data-qa-custom': 'read' }, `read:${value}`),
                formItemRender: (_value, props) =>
                  h(Input, { ...props.fieldProps, 'data-qa-custom': 'edit' }),
              },
            }
            return fixture(
              () =>
                h(
                  lib.ProConfigProvider,
                  { valueTypeMap: fieldMap },
                  {
                    default: () =>
                      h('div', [
                        h(lib.ProTable, {
                          search: false,
                          pagination: false,
                          dataSource: [{ id: 1, name: 'Ada' }],
                          columns: [{ title: 'Name', dataIndex: 'name', valueType: 'qaCustom' }],
                        }),
                        h(
                          lib.ProForm,
                          { submitter: false, initialValues: { name: 'Grace' } },
                          {
                            default: () =>
                              h(lib.ProFormField, { name: 'name', valueType: 'qaCustom' }),
                          },
                        ),
                      ]),
                  },
                ),
              async (host) => {
                assert(
                  host.querySelector('[data-qa-custom="read"]')?.textContent === 'read:Ada',
                  'Table 未消费 valueTypeMap.render',
                )
                assert(
                  host.querySelector('[data-qa-custom="edit"]'),
                  '组合表单未消费 valueTypeMap.formItemRender',
                )
                return { text: host.textContent }
              },
            )
          },
        )

        await run(
          '原生表格展开、行事件、汇总及列单元格配置到达真实目标',
          ['G03', 'T06'],
          async () => {
            let rowClicks = 0
            return fixture(
              () =>
                h(lib.ProTable, {
                  search: false,
                  options: false,
                  pagination: false,
                  dataSource: [{ id: 1, name: 'Ada' }],
                  columns: [
                    {
                      title: 'Name',
                      dataIndex: 'name',
                      onCell: () => ({ 'data-qa-native-cell': 'true' }),
                    },
                  ],
                  expandable: {
                    defaultExpandAllRows: true,
                    expandedRowRender: (record) =>
                      h('p', { 'data-qa-native-expanded': '' }, record.name),
                  },
                  onRow: () => ({ 'data-qa-native-row': '', onClick: () => rowClicks++ }),
                  summary: () => h('tr', [h('td', { 'data-qa-native-summary': '' }, 'Summary')]),
                  tableClassName: 'qa-native-table',
                  tableStyle: { borderTop: '3px solid rgb(11, 22, 33)' },
                }),
              async (host) => {
                const row = host.querySelector('tr[data-qa-native-row]')
                assert(row, 'onRow attrs 未到达 tr')
                row.click()
                assert(rowClicks === 1, '原生行事件未触发或触发多次')
                assert(host.querySelector('td[data-qa-native-cell]'), 'onCell 未到达 td')
                assert(
                  host.querySelector('[data-qa-native-expanded]')?.textContent === 'Ada',
                  'expandable 配置丢失',
                )
                assert(
                  host.querySelector('[data-qa-native-summary]')?.textContent === 'Summary',
                  'summary 配置丢失',
                )
                assert(
                  host.querySelector('.qa-native-table')?.style.borderTopWidth === '3px',
                  'tableClassName/tableStyle 目标错误',
                )
                return { rowClicks }
              },
            )
          },
        )

        await run(
          '辅助组件跟随原生语言、动态前缀、方向和语义样式',
          ['G01', 'G02', 'G08', 'G09', 'Q01'],
          async () => {
            const prefix = ref('ant')
            const locale = ref(zhCN)
            const direction = ref('ltr')
            let clear = 0
            let confirm = 0
            const clearAction = () => clear++
            return fixture(
              () =>
                h(
                  ConfigProvider,
                  { prefixCls: prefix.value, locale: locale.value, direction: direction.value },
                  {
                    default: () =>
                      h('div', [
                        h(lib.DropdownFooter, {
                          classes: ({ props }) => ({
                            root: props.disabled ? 'disabled-footer' : 'qa-footer',
                            confirm: 'qa-confirm',
                          }),
                          styles: { root: { paddingInline: '31px' } },
                          onClear: clearAction,
                          onConfirm: () => confirm++,
                        }),
                        h(lib.FieldLabel, {
                          label: 'Name',
                          value: 'Ada',
                          onClear: clearAction,
                          classes: { root: 'qa-field-label' },
                        }),
                        h(lib.LabelIconTip, {
                          label: 'Help',
                          subTitle: 'Details',
                          tooltip: 'Tip',
                          classes: { label: 'qa-label-part' },
                        }),
                      ]),
                  },
                ),
              async (host) => {
                assert(
                  host.querySelector('.ant-pro-core-field-dropdown-footer.qa-footer'),
                  '辅助组件默认前缀/语义类错误',
                )
                assert(
                  getComputedStyle(host.querySelector('.qa-footer')).paddingInlineStart === '31px',
                  '辅助组件 styles 未生效',
                )
                prefix.value = 'demo'
                locale.value = enUS
                direction.value = 'rtl'
                await tick()
                const footer = host.querySelector('.demo-pro-core-field-dropdown-footer')
                const label = host.querySelector('.demo-pro-core-field-label')
                assert(
                  footer && label && host.querySelector('.demo-pro-core-label-tip .qa-label-part'),
                  '辅助组件未动态更新公开前缀',
                )
                assert(
                  ![...host.querySelectorAll('[class]')].some((node) =>
                    [...node.classList].some((name) => name.startsWith('ant-pro-')),
                  ),
                  '辅助组件遗留旧前缀',
                )
                assert(
                  getComputedStyle(footer).direction === 'rtl' &&
                    getComputedStyle(label).direction === 'rtl',
                  '辅助组件方向未跟随 ConfigProvider',
                )
                assert(!/[\u4e00-\u9fff]/.test(footer.textContent), '英文辅助组件仍含内置中文')
                footer.querySelector('.qa-confirm').click()
                footer.querySelector('button').click()
                const clearButton = label.querySelector('[role="button"]')
                assert(
                  clearButton && !/[\u4e00-\u9fff]/.test(clearButton.getAttribute('aria-label')),
                  '辅助组件无障碍文案未国际化',
                )
                clearButton.dispatchEvent(
                  new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
                )
                assert(clear === 2 && confirm === 1, '辅助组件点击或键盘清空没有正确触发')
                return { clear, confirm }
              },
            )
          },
        )

        await run('ErrorBoundary 捕获子级错误并可重置恢复', ['T05', 'M08'], async () => {
          const fail = ref(true)
          const resetKey = ref(0)
          const caught = []
          const Child = defineComponent({
            setup: () => () => {
              if (fail.value) throw new Error('qa-render-failure')
              return h('span', { 'data-qa-boundary-recovered': '' }, 'Recovered')
            },
          })
          return fixture(
            () =>
              h(
                lib.ErrorBoundary,
                {
                  resetKeys: [resetKey.value],
                  onError: (error) => caught.push(error.message),
                  fallback: (error) =>
                    h('strong', { 'data-qa-boundary-fallback': '' }, error.message),
                },
                { default: () => h(Child) },
              ),
            async (host) => {
              assert(
                host.querySelector('[data-qa-boundary-fallback]')?.textContent ===
                  'qa-render-failure',
                '错误降级内容没有渲染',
              )
              assert(caught.length === 1, '错误回调次数不正确')
              fail.value = false
              resetKey.value++
              await tick()
              assert(
                host.querySelector('[data-qa-boundary-recovered]'),
                'resetKeys 更新未恢复子组件',
              )
              return { caught }
            },
          )
        })

        return { checks, exports: Object.keys(lib).sort() }
      },
      { localeUrls },
    ),
  )
  // 在真实浏览器宽度变化中复核嵌套卡片，避免仅检查类名而遗漏实际分栏和换行。
  await page.evaluate(async () => {
    const entry = '/@fs/C:/malei/stu/antv-next-pro/packages/antdv-next-pro/src/'
    const source = await (await fetch(entry + 'ProCard.vue')).text()
    const vueUrl = source.match(/from ["']([^"']*\/vue\.js\?[^"']+)["']/)?.[1]
    const antUrl = source.match(/from ["']([^"']*\/antdv-next\.js\?[^"']+)["']/)?.[1]
    const { createApp, h, ref } = await import(vueUrl)
    const { ConfigProvider } = await import(antUrl)
    const lib = await import(entry + 'index.ts')
    const host = document.createElement('div')
    host.style.width = '100%'
    document.body.append(host)
    const direction = ref('ltr')
    const padding = ref(19)
    const app = createApp({
      render: () =>
        h(ConfigProvider, { direction: direction.value }, () =>
          h(
            lib.ProConfigProvider,
            { token: { padding: padding.value, boxShadow: 'rgb(1, 2, 3) 0px 2px 7px 0px' } },
            () =>
              h(lib.ProCard.Group, { gutter: 16, wrap: true, split: 'vertical' }, () => [
                h(
                  lib.ProCard,
                  {
                    colSpan: { xs: 24, md: 12 },
                    title: 'First',
                    boxShadow: true,
                    'data-qa-responsive-card': '',
                  },
                  () => 'First body',
                ),
                h(
                  lib.ProCard,
                  { colSpan: { xs: 24, md: 12 }, title: 'Second' },
                  () => 'Second body',
                ),
              ]),
          ),
        ),
    })
    app.mount(host)
    window.__alignmentCardFixture = { host, app, direction, padding }
  })
  try {
    for (const width of [1440, 390, 1200]) {
      await page.setViewportSize({ width, height: 1000 })
      await page.waitForTimeout(100)
      const details = await page.evaluate((width) => {
        const { host, direction, padding } = window.__alignmentCardFixture
        direction.value = width === 390 ? 'rtl' : 'ltr'
        padding.value = width === 390 ? 27 : 19
        const columns = [...host.querySelectorAll('[data-pro-card-col]')]
        const first = columns[0].getBoundingClientRect()
        const second = columns[1].getBoundingClientRect()
        const card = host.querySelector('[data-qa-responsive-card]')
        const totalWidth = columns[0].parentElement.getBoundingClientRect().width
        const narrow = width < 768
        const ratio = first.width / totalWidth
        if (narrow ? Math.abs(ratio - 1) > 0.03 : Math.abs(ratio - 0.5) > 0.03)
          throw new Error(`卡片分栏错误: viewport=${width}, ratio=${ratio}`)
        if (narrow ? second.top <= first.top : Math.abs(second.top - first.top) > 2)
          throw new Error(
            `卡片换行错误: viewport=${width}, first=${JSON.stringify(first)}, second=${JSON.stringify(second)}, total=${totalWidth}`,
          )
        if (!columns[0].classList.contains(`ant-pro-card-col-${narrow ? 24 : 12}`))
          throw new Error(`响应式公开类未更新: ${columns[0].className}`)
        return {
          width,
          ratio,
          first: { x: first.x, y: first.y, width: first.width },
          second: { x: second.x, y: second.y, width: second.width },
          shadow: getComputedStyle(card).boxShadow,
        }
      }, width)
      await page.waitForTimeout(60)
      Object.assign(
        details,
        await page.evaluate(() => {
          const { host, direction, padding } = window.__alignmentCardFixture
          const card = host.querySelector('[data-qa-responsive-card]')
          const computedDirection = getComputedStyle(card).direction
          const headerPadding = getComputedStyle(
            card.querySelector('.ant-pro-card-header'),
          ).paddingTop
          if (computedDirection !== direction.value) throw new Error('嵌套卡片方向没有实时更新')
          if (headerPadding !== `${padding.value}px`)
            throw new Error(`Pro padding token 未消费: ${headerPadding}`)
          if (!getComputedStyle(card).boxShadow.includes('rgb(1, 2, 3)'))
            throw new Error('Pro boxShadow token 未消费')
          return { direction: computedDirection, headerPadding }
        }),
      )
      result.checks.push({
        name: `嵌套卡片真实视口 ${width}px 分栏/换行/方向/Pro token`,
        covers: ['C01', 'G05', 'G09'],
        passed: true,
        details,
      })
    }
  } finally {
    await page.evaluate(() => {
      const { app, host } = window.__alignmentCardFixture
      app.unmount()
      host.remove()
      delete window.__alignmentCardFixture
    })
  }
} catch (error) {
  result.fatalError = String(error?.stack ?? error)
} finally {
  await browser.close()
  result.passed = result.checks.filter((check) => check.passed).length
  result.failed = result.checks.filter((check) => !check.passed).length
  await writeFile(
    path.join(output, 'runtime-verification.json'),
    JSON.stringify(result, null, 2) + '\n',
  )
  process.stdout.write(JSON.stringify(result, null, 2) + '\n')
  if (result.fatalError || result.failed || errors.length) process.exitCode = 1
}
