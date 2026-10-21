import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { writeFile, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const output = path.dirname(fileURLToPath(import.meta.url))
const workspace = path.resolve(output, '../../..')
const testRoot = process.argv[2]
assert.ok(testRoot, '需要本次最低 peer 测试目录')
const require = createRequire(path.join(workspace, 'packages/antdv-next-pro/package.json'))
const { createServer } = require('vite')
const { chromium } = require('playwright')
await writeFile(
  path.join(testRoot, 'index.html'),
  '<!doctype html><html><head><meta charset="utf-8"></head><body><div id="app"></div><script type="module" src="/probe.mjs"></script></body></html>',
)
await writeFile(
  path.join(testRoot, 'probe.mjs'),
  `
import { createApp, h, nextTick, ref } from 'vue'
import { ConfigProvider, theme } from 'antdv-next'
import enUS from 'antdv-next/locale/en_US'
import zhCN from 'antdv-next/locale/zh_CN'
import * as lib from '@bubblesjs/antv-next-pro'
import '@bubblesjs/antv-next-pro/style.css'
const locale = ref(enUS)
const prefix = ref('ant')
const dark = ref(false)
window.minimumPeerState = { locale, prefix, dark, enUS, zhCN, nextTick }
createApp({render: () => h(ConfigProvider, {
  locale: locale.value, prefixCls: prefix.value,
  theme: { algorithm: dark.value ? theme.darkAlgorithm : theme.defaultAlgorithm },
}, {default: () => h(lib.ProConfigProvider, { token: { colorText: '#123456' } }, {default: () => h('main', [
  h(lib.ProCard, {title: 'Minimum peers', 'data-minimum-card': true}, {default: () => 'Content'}),
  h(lib.ProForm, null, {default: () => h(lib.ProFormText, { name: 'name' })}),
  h(lib.ProTable, { columns: [{title: 'Name',dataIndex: 'name'}], dataSource: [{id: 1,name: 'Ada'}],pagination: false }),
  h(lib.ProField, {valueType: 'money',text: 12.5}),
  h(lib.ProList, {metas: {title: {dataIndex: 'name'}},dataSource: [{id: 1,name: 'Grace'}],search: false,pagination: false}),
])})})}).mount('#app')
window.minimumPeerReady = true
`,
)
const server = await createServer({
  root: testRoot,
  configFile: false,
  cacheDir: path.join(testRoot, '.vite'),
  server: { host: '127.0.0.1', port: 0, strictPort: false },
  optimizeDeps: {
    include: ['vue', 'antdv-next', 'antdv-next/config-provider', '@bubblesjs/antv-next-pro'],
  },
})
let browser
const errors = []
const result = { checkedAt: new Date().toISOString(), checks: [], errors }
try {
  await server.listen()
  const address = server.httpServer.address()
  browser = await chromium.launch({ channel: 'chrome', headless: true })
  const page = await browser.newPage()
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('http://127.0.0.1:' + address.port, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => window.minimumPeerReady, undefined, { timeout: 30000 })
  await page.locator('[data-minimum-card].ant-pro-card').waitFor()
  assert.ok(
    await page
      .locator('#app')
      .innerText()
      .then((text) => text.includes('Ada') && text.includes('Grace') && text.includes('Submit')),
  )
  result.checks.push('打包产物在 antdv-next@1.5.2 / vue@3.5.0 下渲染 Card/Form/Table/List/Field')
  const before = await page
    .locator('[data-minimum-card]')
    .evaluate((node) => getComputedStyle(node).backgroundColor)
  await page.evaluate(async () => {
    const state = window.minimumPeerState
    state.prefix.value = 'demo'
    state.locale.value = state.zhCN
    state.dark.value = true
    await state.nextTick()
  })
  await page.locator('[data-minimum-card].demo-pro-card').waitFor()
  assert.equal(await page.locator('#app [class*="ant-pro-"]').count(), 0)
  await page.waitForFunction(() =>
    document.querySelector('#app').textContent.replace(/\s/g, '').includes('提交'),
  )
  const after = await page
    .locator('[data-minimum-card]')
    .evaluate((node) => getComputedStyle(node).backgroundColor)
  assert.notEqual(before, after)
  assert.deepEqual(errors, [])
  result.checks.push('原生 ConfigProvider 的动态 prefix/locale/主题算法生效，无浏览器异常')
  const scratchRequire = createRequire(path.join(testRoot, 'package.json'))
  result.versions = Object.fromEntries(
    await Promise.all(
      ['vue', 'antdv-next'].map(async (name) => [
        name,
        JSON.parse(await readFile(scratchRequire.resolve(name + '/package.json'), 'utf8')).version,
      ]),
    ),
  )
  result.passed = true
} catch (error) {
  result.passed = false
  result.failure = String(error?.stack ?? error)
  process.exitCode = 1
} finally {
  await browser?.close()
  await server.close()
  await writeFile(
    path.join(output, 'minimum-peers-verification.json'),
    JSON.stringify(result, null, 2) + '\n',
  )
  console.log(JSON.stringify(result, null, 2))
}
