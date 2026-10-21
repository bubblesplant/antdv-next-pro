import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const output = path.dirname(fileURLToPath(import.meta.url))
const workspace = path.resolve(output, '../../..')
const require = createRequire(path.join(workspace, 'packages/antdv-next-pro/package.json'))
const { chromium } = require('playwright')
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const report = { checkedAt: new Date().toISOString(), checks: [] }
const until = async (read, verify, message) => {
  const deadline = Date.now() + 6000
  let value
  do {
    value = await read()
    if (verify(value)) return value
    await new Promise((resolve) => setTimeout(resolve, 60))
  } while (Date.now() < deadline)
  assert.fail(`${message}: ${JSON.stringify(value)}`)
}
const requestCount = (page) =>
  page.locator('#preview-panel .request-monitor b').first().innerText().then(Number)
const params = (page) =>
  page
    .locator('#preview-panel .request-monitor code')
    .innerText()
    .then((text) => JSON.parse(text).params)

async function check(route, name, inspect) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  page.setDefaultTimeout(7000)
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  try {
    await page.goto(`${process.env.PRO_QA_URL ?? 'http://127.0.0.1:9903'}/#${route}`, {
      waitUntil: 'domcontentloaded',
    })
    await page.locator('#preview-panel [data-pro-table]').waitFor()
    await inspect(page, page.locator('#preview-panel'))
    assert.deepEqual(errors, [], '出现未被组件处理的浏览器异常')
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
    '/pro-table/search-light-filter',
    '正式 LightFilter 弹层与取消',
    async (page, preview) => {
      const light = preview.locator('[data-pro-light-container]')
      await light.waitFor()
      await light.locator('button').first().click()
      await page.locator('.ant-popover:visible input').first().waitFor()
      await page.keyboard.press('Escape')
    },
  )
  await check(
    '/pro-table/search-required-fields',
    '内建必填校验阻止请求，填值后查询一次',
    async (page, preview) => {
      const before = await requestCount(page)
      const search = preview.locator('[data-pro-table-search]')
      await search.getByRole('button', { name: /查\s*询/ }).click()
      await search.getByText('请输入负责人后再查询', { exact: true }).waitFor()
      assert.equal(await requestCount(page), before)
      await search.locator('input').nth(1).fill('林默')
      await search.getByRole('button', { name: /查\s*询/ }).click()
      await until(
        () => requestCount(page),
        (count) => count === before + 1,
        '查询次数不符',
      )
      assert.equal((await params(page)).owner, '林默')
    },
  )
  await check(
    '/pro-table/feature-batch-actions',
    '内建 tableAlert 与批量操作、受控清除',
    async (_page, preview) => {
      await preview.locator('.ant-table-tbody input[type=checkbox]').first().check()
      const alert = preview.locator('[data-pro-table-alert]')
      await alert.waitFor()
      assert.match(await alert.innerText(), /已选 1 项/)
      await alert.getByRole('button', { name: '批量标记已审阅' }).click()
      await until(
        () => alert.innerText(),
        (text) => text.includes('审阅'),
        '批量结果缺失',
      )
      await alert.getByRole('button', { name: '清空选择' }).click()
      await alert.waitFor({ state: 'hidden' })
      assert.equal(
        await preview.locator('.ant-table-tbody input[type=checkbox]:checked').count(),
        0,
      )
    },
  )
  await check(
    '/pro-table/list-toolbar-tabs',
    'toolbar.tabs 切换并提交过滤参数',
    async (page, preview) => {
      await preview.getByRole('tab', { name: '进行中', exact: true }).click()
      await until(
        () => params(page),
        (values) => values.status === 'running',
        '标签未进入请求',
      )
      assert.equal(
        await preview
          .getByRole('tab', { name: '进行中', exact: true })
          .getAttribute('aria-selected'),
        'true',
      )
    },
  )
  await check(
    '/pro-table/list-toolbar-title-menu',
    'toolbar.menu 原生下拉并提交过滤参数',
    async (page, preview) => {
      await preview.getByRole('button', { name: /全部项目/ }).click()
      await page.getByRole('menuitem', { name: '我负责的', exact: true }).click()
      await until(
        () => params(page),
        (values) => values.owner === '林默',
        '菜单未进入请求',
      )
    },
  )
  await check(
    '/pro-table/list-toolbar-multiple-line',
    '正式双行工具栏与设置回调',
    async (page, preview) => {
      await preview.locator('[data-pro-toolbar-extra-line]').waitFor()
      const before = await until(
        () => requestCount(page),
        (count) => count > 0,
        '初次请求未完成',
      )
      await preview
        .locator('[data-pro-toolbar]')
        .getByRole('button', { name: '刷新', exact: true })
        .click()
      await until(
        () => requestCount(page),
        (count) => count === before + 1,
        '工具设置未刷新',
      )
    },
  )
  await check(
    '/pro-table/toolbar-custom-table-body',
    'tableViewRender 包装与空态恢复',
    async (page, preview) => {
      await preview.locator('.custom-table-body [data-pro-part=table]').waitFor()
      await preview.getByRole('button', { name: '自定义空态', exact: true }).click()
      await preview.locator('.custom-empty-state').waitFor()
      await preview.getByRole('button', { name: '恢复演示数据', exact: true }).click()
      await preview.locator('.custom-empty-state').waitFor({ state: 'hidden' })
      await until(
        () => preview.locator('.ant-table-tbody tr[data-row-key]').count(),
        (count) => count > 0,
        '恢复后没有数据',
      )
    },
  )
  await check(
    '/pro-table/value-type-custom',
    'Provider 自定义类型的展示、编辑和保存',
    async (_page, preview) => {
      await preview.locator('.health-meter').first().waitFor()
      await preview.getByRole('button', { name: '编辑第一行健康度' }).click()
      const range = preview.locator('input[type=range]')
      await range.waitFor()
      await range.evaluate((element) => {
        element.value = '73'
        element.dispatchEvent(new Event('input', { bubbles: true }))
      })
      await preview
        .getByRole('button', { name: /保\s*存/ })
        .first()
        .click()
      await range.waitFor({ state: 'hidden' })
      await until(
        () => preview.locator('.health-meter').first().innerText(),
        (text) => text.trim() === '73',
        '自定义类型保存失败',
      )
    },
  )
  await check(
    '/pro-table/feature-date-formatter',
    'dateFormatter 对查询值执行 string/number/custom 转换',
    async (page, preview) => {
      const search = preview.locator('[data-pro-table-search]')
      const date = search.locator('.ant-picker-input input').first()
      await date.fill('2026-03-10 09:30:00')
      await date.press('Enter')
      await search.getByRole('button', { name: /查\s*询/ }).click()
      await until(
        () => params(page),
        (values) => typeof values.updatedAt === 'string' && values.updatedAt.includes('2026-03-10'),
        'string 日期格式未进入请求',
      )
      await preview.locator('.demo-control-row select').selectOption('number')
      await search.getByRole('button', { name: /查\s*询/ }).click()
      await until(
        () => params(page),
        (values) => typeof values.updatedAt === 'number',
        'number 日期格式未进入请求',
      )
      await preview.locator('.demo-control-row select').selectOption('custom')
      await search.getByRole('button', { name: /查\s*询/ }).click()
      await until(
        () => params(page),
        (values) => String(values.updatedAt).startsWith('自定义:'),
        'custom 日期格式未进入请求',
      )
    },
  )
  await check(
    '/pro-table/custom-error-boundary',
    'ProTable 自定义错误边界捕获并恢复',
    async (_page, preview) => {
      await preview.locator('.ant-table-tbody tr[data-row-key]').first().waitFor()
      await preview.getByRole('button', { name: '触发渲染异常' }).click()
      await preview.getByRole('alert').filter({ hasText: '演示异常' }).waitFor()
      await preview.getByRole('button', { name: '恢复表格', exact: true }).last().click()
      await preview.locator('.ant-table-tbody tr[data-row-key]').first().waitFor()
    },
  )
} finally {
  await browser.close()
  report.passed = report.checks.length === 10 && report.checks.every((check) => check.passed)
  if (!report.passed) process.exitCode = 1
  await writeFile(
    path.join(output, 'example-interactions.json'),
    JSON.stringify(report, null, 2) + '\n',
  )
  console.log(JSON.stringify(report, null, 2))
}
