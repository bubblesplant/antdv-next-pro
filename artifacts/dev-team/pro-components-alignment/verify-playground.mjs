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
const report = { checkedAt: new Date().toISOString(), examples: [], errors: [] }
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  page.on('pageerror', (error) => report.errors.push(error.message))
  await page.goto(process.env.PRO_QA_URL ?? 'http://127.0.0.1:9903', {
    waitUntil: 'domcontentloaded',
  })
  await page.locator('.document-heading h1').waitFor()
  const examples = await page.evaluate(async () => {
    const module = await import('/src/examples.ts')
    return module.examples.map(({ path, title, file }) => ({ path, title, file }))
  })
  for (const example of examples) {
    const errorStart = report.errors.length
    await page.evaluate((route) => {
      window.location.hash = route
    }, example.path)
    await page.waitForFunction(
      (title) => document.querySelector('.document-heading h1')?.textContent === title,
      example.title,
    )
    await page.waitForFunction(() => document.querySelector('#preview-panel')?.children.length > 0)
    // 示例请求使用 90ms 的本地延迟，等待其完成后再检查被外层边界捕获的渲染错误。
    await page.waitForTimeout(180)
    assert.equal(
      await page.locator('vite-error-overlay').count(),
      0,
      `${example.path} 出现模块编译错误`,
    )
    assert.equal(
      await page.locator('#preview-panel > .error-fallback').count(),
      0,
      `${example.path} 被外层错误边界接管`,
    )
    assert.equal(
      await page.locator('#preview-panel [data-pro-error-boundary]').count(),
      0,
      `${example.path} 初始渲染被组件错误边界接管`,
    )
    const source = await page.evaluate(async (route) => {
      const module = await import('/src/examples.ts')
      const sources = await module.examples.find((item) => item.path === route).sources()
      return sources.map(({ name, code }) => ({ name, length: code.length }))
    }, example.path)
    assert.ok(
      source.length > 0 && source.every((item) => item.length > 0),
      `${example.path} 缺少独立示例源码`,
    )
    assert.equal(report.errors.length, errorStart, `${example.path} 触发浏览器异常`)
    report.examples.push({ ...example, sources: source.map((item) => item.name), passed: true })
  }
  report.passed = true
} catch (error) {
  report.passed = false
  report.failure = String(error?.stack ?? error)
  process.exitCode = 1
} finally {
  await browser.close()
  await writeFile(
    path.join(output, 'playground-verification.json'),
    JSON.stringify(report, null, 2) + '\n',
  )
  console.log(JSON.stringify(report, null, 2))
}
