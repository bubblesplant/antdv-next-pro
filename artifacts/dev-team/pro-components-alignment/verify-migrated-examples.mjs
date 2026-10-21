import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const output = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(path.resolve(output, '../../../packages/antdv-next-pro/package.json'))
const { chromium } = require('playwright')
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const report = { checkedAt: new Date().toISOString(), checks: [] }
async function until(read, predicate, message) {
  const deadline = Date.now() + 6000
  let value
  do {
    value = await read()
    if (predicate(value)) return value
    await new Promise((resolve) => setTimeout(resolve, 60))
  } while (Date.now() < deadline)
  assert.fail(`${message}: ${JSON.stringify(value)}`)
}
const requestCount = (preview) =>
  preview.locator('.request-monitor b').first().innerText().then(Number)
const params = (preview) =>
  preview
    .locator('.request-monitor code')
    .innerText()
    .then((value) => JSON.parse(value).params)
async function check(route, name, inspect) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  page.setDefaultTimeout(7000)
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  try {
    await page.goto(`${process.env.PRO_QA_URL ?? 'http://127.0.0.1:9903'}/#${route}`, {
      waitUntil: 'domcontentloaded',
    })
    const preview = page.locator('#preview-panel')
    await preview.locator('[data-pro-table]').waitFor()
    await inspect(page, preview)
    assert.deepEqual(errors, [], '出现未处理的浏览器异常')
    report.checks.push({ route, name, passed: true })
  } catch (error) {
    report.checks.push({
      route,
      name,
      passed: false,
      error: String(error?.stack ?? error),
      browserErrors: errors,
    })
  } finally {
    await page.close()
  }
}

try {
  await check(
    '/pro-table/search-bar-type-switch',
    'filterType 切换真实 QueryFilter/LightFilter 并查询',
    async (page, preview) => {
      const search = preview.locator('[data-pro-table-search]')
      await search.locator('[data-pro-query-row]').waitFor()
      await search.locator('input').first().fill('看板')
      await search.getByRole('button', { name: /查\s*询/ }).click()
      await until(
        () => params(preview),
        (value) => value.project === '看板',
        'QueryFilter 未提交',
      )
      await preview.getByRole('button', { name: 'LightFilter', exact: true }).click()
      const light = search.locator('[data-pro-light-container]')
      await light.waitFor()
      await light.locator('button').first().click()
      const popover = page.locator('.ant-popover:visible')
      await popover.locator('input').first().fill('数据')
      await popover.getByRole('button', { name: /确\s*认/ }).click()
      await until(
        () => params(preview),
        (value) => value.project === '数据',
        'LightFilter 未提交',
      )
      await preview.getByRole('button', { name: 'QueryFilter', exact: true }).click()
      await search.locator('[data-pro-query-row]').waitFor()
      assert.equal(await search.locator('input').first().inputValue(), '')
    },
  )
  await check(
    '/pro-table/custom-search-form-ref',
    '真实 formRef 写入、读取、提交和重置',
    async (_page, preview) => {
      const search = preview.locator('[data-pro-table-search]')
      const before = await until(
        () => requestCount(preview),
        (value) => value > 0,
        '初始请求缺失',
      )
      await preview.getByRole('button', { name: 'setFieldsValue', exact: true }).click()
      assert.equal(await search.locator('input').first().inputValue(), '看板')
      await preview.getByRole('button', { name: 'getFieldsValue', exact: true }).click()
      assert.equal(await requestCount(preview), before)
      await preview.getByRole('button', { name: 'submit', exact: true }).click()
      await until(
        () => requestCount(preview),
        (value) => value === before + 1,
        'ref submit 请求次数不符',
      )
      assert.deepEqual(
        { project: (await params(preview)).project, status: (await params(preview)).status },
        { project: '看板', status: 'running' },
      )
      await preview.getByRole('button', { name: 'resetFields', exact: true }).click()
      assert.equal(await search.locator('input').first().inputValue(), '')
    },
  )
  await check(
    '/pro-table/basic-card-bordered',
    'cardBordered 动态改变两个真实 Card 容器',
    async (_page, preview) => {
      const cards = preview.locator('[data-pro-table-search], [data-pro-table-container]')
      const borders = () =>
        cards.evaluateAll((elements) =>
          elements.map((element) => getComputedStyle(element).borderTopWidth),
        )
      await until(
        borders,
        (values) => values.length === 2 && values.every((value) => value === '1px'),
        '卡片未显示边框',
      )
      const before = await requestCount(preview)
      await preview.locator('.switch-label input[type=checkbox]').uncheck()
      await until(borders, (values) => values.every((value) => value === '0px'), '卡片边框未关闭')
      assert.equal(await requestCount(preview), before)
      await preview.locator('.switch-label input[type=checkbox]').check()
      await until(borders, (values) => values.every((value) => value === '1px'), '卡片边框未恢复')
    },
  )
  await check(
    '/pro-table/other-custom-setting-icon',
    'options.setting 自定义入口与真实列显隐',
    async (page, preview) => {
      const icon = preview.locator('[data-custom-setting-icon]')
      await icon.waitFor()
      const trigger = icon.locator('xpath=ancestor::button')
      assert.ok(await trigger.getAttribute('aria-label'), '列设置入口缺少可访问名称')
      await trigger.click()
      const settings = page.locator('[data-pro-table-column-settings-item]')
      const owner = settings.filter({ hasText: '负责人' })
      await owner.locator('input[type=checkbox]').uncheck()
      await until(
        () => preview.locator('th').allTextContents(),
        (values) => !values.includes('负责人'),
        '列隐藏未生效',
      )
      await owner.locator('input[type=checkbox]').check()
      await until(
        () => preview.locator('th').allTextContents(),
        (values) => values.includes('负责人'),
        '列恢复未生效',
      )
      assert.equal(
        await page
          .locator('[data-pro-table-column-settings-list]')
          .evaluate((element) => getComputedStyle(element).maxHeight),
        '260px',
      )
    },
  )
} finally {
  await browser.close()
  report.passed = report.checks.length === 4 && report.checks.every((item) => item.passed)
  if (!report.passed) process.exitCode = 1
  await writeFile(
    path.join(output, 'migrated-examples-verification.json'),
    JSON.stringify(report, null, 2) + '\n',
  )
  console.log(JSON.stringify(report, null, 2))
}
