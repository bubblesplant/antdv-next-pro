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
const report = {
  checkedAt: new Date().toISOString(),
  baseURL: process.env.PRO_QA_URL ?? 'http://127.0.0.1:9903',
  checks: [],
}
const until = async (read, verify, message) => {
  const deadline = Date.now() + 7000
  let value
  do {
    value = await read()
    if (verify(value)) return value
    await new Promise((resolve) => setTimeout(resolve, 60))
  } while (Date.now() < deadline)
  assert.fail(`${message}: ${JSON.stringify(value)}`)
}

async function check(route, demo, inspect) {
  if (process.env.PRO_QA_DEMOS && !process.env.PRO_QA_DEMOS.split(',').includes(demo)) return
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  page.setDefaultTimeout(7000)
  const browserErrors = []
  const consoleMessages = []
  const steps = []
  page.on('pageerror', (error) => browserErrors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'warning' || message.type() === 'error')
      consoleMessages.push({ type: message.type(), text: message.text() })
  })
  const step = async (name, work) => {
    try {
      await work()
      steps.push({ name, passed: true })
    } catch (error) {
      steps.push({ name, passed: false, error: String(error?.stack ?? error) })
      throw error
    }
  }
  try {
    await page.goto(`${report.baseURL}/#${route}`, { waitUntil: 'domcontentloaded' })
    const root = page.locator(`#preview-panel [data-demo="${demo}"]`)
    await root.waitFor()
    await inspect(page, root, step)
    assert.equal(
      await page.locator('vite-error-overlay').count(),
      0,
      '页面出现开发服务编译错误覆盖层',
    )
    assert.deepEqual(browserErrors, [], '出现未处理的浏览器异常')
    report.checks.push({ route, demo, passed: true, steps, browserErrors, consoleMessages })
  } catch (error) {
    report.checks.push({
      route,
      demo,
      passed: false,
      error: String(error?.stack ?? error),
      steps,
      browserErrors,
      consoleMessages,
      overlays: await page
        .locator('vite-error-overlay')
        .evaluateAll((elements) => elements.map((element) => element.shadowRoot?.textContent)),
      visibleText: await page
        .locator('body')
        .innerText()
        .catch(() => ''),
    })
  } finally {
    await page.close()
  }
}

try {
  await check('/pro-list/projects', 'pro-list', async (page, root, step) => {
    const list = root.locator('[data-pro-list]').first()
    const rows = list.locator('[data-pro-list-row]')
    const state = root.locator('[data-demo-list-state]')
    await step('初次请求与两条分页', async () => {
      await until(
        () => rows.count(),
        (count) => count === 2,
        '首屏记录数错误',
      )
      assert.match(await rows.first().innerText(), /组件文档/)
      assert.match(await state.innerText(), /请求 1 次/)
    })
    await step('受控勾选与清空', async () => {
      await rows.first().locator('input[type=checkbox]').check()
      await until(
        () => state.innerText(),
        (text) => text.includes('已选 1 项'),
        '勾选未同步',
      )
      await root.getByRole('button', { name: '清除选择', exact: true }).click()
      await until(
        () => list.locator('input[type=checkbox]:checked').count(),
        (count) => count === 0,
        '受控选择未清空',
      )
      assert.match(await state.innerText(), /已选 0 项/)
    })
    await step('翻页并展开记录', async () => {
      await root.locator('.ant-pagination-item-2').click()
      await rows.first().getByText('发布准备', { exact: true }).waitFor()
      await rows.first().locator('button[aria-expanded="false"]').click()
      await rows
        .first()
        .getByText('负责人：周宁。核对类型声明与迁移说明。', { exact: true })
        .waitFor()
      assert.equal(
        await rows.first().locator('button[aria-expanded]').getAttribute('aria-expanded'),
        'true',
      )
      await rows.first().locator('button[aria-expanded="true"]').click()
      assert.equal(
        await rows
          .first()
          .getByText('负责人：周宁。核对类型声明与迁移说明。', { exact: true })
          .count(),
        0,
      )
    })
    await step('查询、重置与重新加载', async () => {
      await root.locator('.ant-pagination-item-1').click()
      const search = root.locator('[data-pro-table-search]')
      await search.locator('input').first().fill('主题')
      await search.getByRole('button', { name: '搜索项目', exact: true }).click()
      await until(
        () => rows.count(),
        (count) => count === 1,
        '筛选未生效',
      )
      assert.match(await rows.first().innerText(), /主题配置/)
      await search.getByRole('button', { name: /^重\s*置$/ }).click()
      await until(
        () => rows.count(),
        (count) => count === 2,
        '重置未恢复',
      )
      const count = Number((await state.innerText()).match(/请求 (\d+) 次/)?.[1])
      await root.locator('[data-demo-list-reload]').click()
      await until(
        () => state.innerText(),
        (text) => Number(text.match(/请求 (\d+) 次/)?.[1]) === count + 1,
        '重新加载未发送请求',
      )
    })
    await step('详情操作与基础卡片键盘交互', async () => {
      await root.locator('[data-demo-list-details="1"]').click()
      assert.match(await state.innerText(), /组件文档 · 负责人：林晓/)
      await root.locator('[data-demo-list-card="1"]').click()
      assert.match(await state.innerText(), /当前卡片：组件文档/)
      await root.locator('[data-demo-list-card="2"]').press('Enter')
      assert.match(await state.innerText(), /当前卡片：主题配置/)
      const columns = await root
        .locator('[data-pro-list]')
        .nth(1)
        .locator('[data-pro-list-container]')
        .evaluate((element) => getComputedStyle(element).gridTemplateColumns)
      assert.equal(columns.split(' ').length, 2, '宽屏基础列表应显示两列')
    })
  })

  await check('/pro-descriptions/editable', 'pro-descriptions', async (_page, root, step) => {
    const data = async () =>
      JSON.parse(await root.locator('[data-demo-descriptions-data]').innerText())
    const state = root.locator('[data-demo-descriptions-state]')
    const input = root.locator('input').first()
    await step('详情请求与只读格式', async () => {
      await root.getByText('组件升级计划', { exact: true }).waitFor()
      assert.match(await state.innerText(), /已加载 1 次/)
      assert.match(await root.locator('[data-pro-descriptions]').innerText(), /16,800/)
    })
    await step('必填校验阻止保存', async () => {
      await root.locator('[data-demo-descriptions-edit]').click()
      await input.fill('')
      await root.getByRole('button', { name: /^保\s*存$/ }).click()
      await root.getByText('请输入项目名称', { exact: true }).waitFor()
      assert.equal((await data()).name, '组件升级计划')
      assert.equal(await input.count(), 1)
    })
    await step('保存编辑并重新请求', async () => {
      await input.fill('文档验收计划')
      await root.getByRole('button', { name: /^保\s*存$/ }).click()
      await until(data, (value) => value.name === '文档验收计划', '名称未保存')
      await input.waitFor({ state: 'hidden' })
      await root.locator('[data-demo-descriptions-reload]').click()
      await until(
        () => state.innerText(),
        (text) => text.includes('已加载 2 次'),
        '详情未重新加载',
      )
      assert.match(await root.locator('[data-pro-descriptions]').innerText(), /文档验收计划/)
    })
    await step('取消编辑后恢复原值', async () => {
      await root.locator('[data-demo-descriptions-edit]').click()
      await input.fill('应当丢弃的草稿')
      await root.getByRole('button', { name: /^取\s*消$/ }).click()
      await input.waitFor({ state: 'hidden' })
      assert.equal((await data()).name, '文档验收计划')
      await root.locator('[data-demo-descriptions-edit]').click()
      assert.equal(await input.inputValue(), '文档验收计划')
      await root.getByRole('button', { name: /^取\s*消$/ }).click()
    })
  })

  await check(
    '/table-enhancements/edit-and-sort',
    'table-enhancements',
    async (page, root, step) => {
      const drag = root.locator('[data-demo-drag-table]')
      const row = root.locator('[data-demo-row-table]')
      const cell = root.locator('[data-demo-cell-table]')
      const rowInputs = row.locator('.ant-table-tbody input')
      const cellInputs = cell.locator('.ant-table-tbody input')
      await step('键盘调整排序与排序回调', async () => {
        await drag.locator('[data-pro-table-drag-handle]').first().press('ArrowDown')
        await until(
          () => drag.locator('.ant-table-tbody tr').first().innerText(),
          (text) => text.includes('交互验收'),
          '键盘排序未更新',
        )
        assert.match(
          await root.locator('[data-demo-enhanced-state]').innerText(),
          /第 1 项移至第 2 项/,
        )
      })
      await step('行编辑公开方法、必填校验与保存', async () => {
        await row.locator('[data-demo-row-start]').click()
        await rowInputs.first().fill('')
        await row.locator('[data-demo-row-save]').click()
        await row
          .locator('[data-pro-table-validation-error]')
          .filter({ hasText: '请输入任务名称' })
          .waitFor()
        assert.equal(await rowInputs.count(), 2, '无效行不应退出编辑')
        await rowInputs.first().fill('行修改已保存')
        assert.equal(await rowInputs.count(), 2)
        await row.locator('[data-demo-row-save]').click()
        await until(
          () => rowInputs.count(),
          (count) => count === 0,
          '行保存后仍为编辑态',
        )
        assert.match(await row.locator('.ant-table-tbody tr').first().innerText(), /行修改已保存/)
      })
      await step('行编辑取消丢弃草稿', async () => {
        await row.locator('[data-demo-row-start]').click()
        await rowInputs.first().fill('应当丢弃的行草稿')
        await row.locator('[data-demo-row-cancel]').click()
        await until(
          () => rowInputs.count(),
          (count) => count === 0,
          '取消行编辑未退出',
        )
        await page.waitForTimeout(250)
        assert.match(await row.locator('.ant-table-tbody tr').first().innerText(), /行修改已保存/)
        assert.doesNotMatch(
          await row.locator('.ant-table-tbody tr').first().innerText(),
          /应当丢弃/,
        )
      })
      await step('双击行后离开焦点自动保存', async () => {
        await row.locator('.ant-table-tbody tr').nth(1).dblclick()
        await rowInputs.first().fill('失焦保存任务')
        await root.locator('[data-demo-enhanced-state]').click()
        await until(
          () => rowInputs.count(),
          (count) => count === 0,
          '离开行未自动保存',
        )
        assert.match(await row.locator('.ant-table-tbody tr').nth(1).innerText(), /失焦保存任务/)
      })
      await step('单元格编辑仅开放当前字段、校验并保存', async () => {
        await cell.locator('[data-demo-cell-start]').click()
        await cellInputs.first().fill('')
        await cell.locator('[data-demo-cell-save]').click()
        await cell
          .locator('[data-pro-table-validation-error]')
          .filter({ hasText: '请输入任务名称' })
          .waitFor()
        assert.equal(await cellInputs.count(), 1, '无效单元格不应退出编辑')
        await cellInputs.first().fill('单元格修改已保存')
        assert.equal(await cellInputs.count(), 1, '单元格模式不应编辑整个行')
        await cell.locator('[data-demo-cell-save]').click()
        await until(
          () => cellInputs.count(),
          (count) => count === 0,
          '单元格保存未退出',
        )
        assert.match(
          await cell.locator('.ant-table-tbody tr').first().innerText(),
          /单元格修改已保存/,
        )
      })
      await step('单元格取消与双击切换', async () => {
        await cell.locator('[data-demo-cell-start]').click()
        await cellInputs.first().fill('应当丢弃的单元格草稿')
        await cell.locator('[data-demo-cell-cancel]').click()
        await until(
          () => cellInputs.count(),
          (count) => count === 0,
          '单元格取消未退出',
        )
        await page.waitForTimeout(250)
        assert.match(
          await cell.locator('.ant-table-tbody tr').first().innerText(),
          /单元格修改已保存/,
        )
        const secondRow = cell.locator('.ant-table-tbody tr').nth(1)
        await secondRow.locator('td').first().dblclick()
        await cellInputs.first().fill('')
        await secondRow.locator('td').nth(1).dblclick()
        await cell
          .locator('[data-pro-table-validation-error]')
          .filter({ hasText: '请输入任务名称' })
          .waitFor()
        assert.notEqual(
          await cellInputs.first().getAttribute('role'),
          'spinbutton',
          '校验失败时不应切换字段',
        )
        await cellInputs.first().fill('切换前保存名称')
        await secondRow.locator('td').nth(1).dblclick()
        await until(
          () => cellInputs.first().getAttribute('role'),
          (role) => role === 'spinbutton',
          '双击没有切换到优先级',
        )
        assert.match(await secondRow.locator('td').first().innerText(), /切换前保存名称/)
        await root.locator('[data-demo-enhanced-state]').click()
        await until(
          () => cellInputs.count(),
          (count) => count === 0,
          '切换字段后失焦未退出',
        )
      })
    },
  )

  await check('/shared-components/interactions', 'shared-components', async (page, root, step) => {
    const state = root.locator('[data-demo-shared-state]')
    await step('工具栏搜索与两个下拉菜单', async () => {
      await root.getByPlaceholder('输入工具栏关键词').fill('组件')
      await root.getByPlaceholder('输入工具栏关键词').press('Enter')
      await until(
        () => state.innerText(),
        (text) => text.includes('工具栏搜索：组件'),
        '工具栏搜索未触发',
      )
      await root.getByText('更多操作', { exact: true }).hover()
      await page.getByRole('menuitem', { name: '导出列表' }).click()
      await until(
        () => state.innerText(),
        (text) => text.includes('选中菜单：export'),
        '下拉操作未触发',
      )
      await root.locator('[data-demo-dropdown-button]').hover()
      await page.getByRole('menuitem', { name: '复制链接' }).click()
      await until(
        () => state.innerText(),
        (text) => text.includes('按钮菜单：copy'),
        '按钮下拉操作未触发',
      )
    })
    await step('独立 Search 提交与重置', async () => {
      const search = root.locator('form').first()
      await search.locator('input').first().fill('发布准备')
      await search.getByRole('button', { name: '应用查询', exact: true }).click()
      await until(
        () => state.innerText(),
        (text) => text.includes('"name":"发布准备"'),
        '独立查询未提交',
      )
      await search.getByRole('button', { name: /^重\s*置$/ }).click()
      await until(
        () => state.innerText(),
        (text) => text.includes('查询已重置'),
        '独立查询未重置',
      )
      assert.equal(await search.locator('input').first().inputValue(), '')
    })
    await step('FilterDropdown 确认及 FieldLabel 清空', async () => {
      await root.locator('[data-demo-filter-open]').click()
      await page.locator('[data-demo-filter-input]:visible').fill('已完成')
      await page
        .locator('.ant-popover:visible')
        .getByRole('button', { name: /^确\s*认$/ })
        .click()
      await until(
        () => state.innerText(),
        (text) => text.includes('已应用筛选：已完成'),
        '筛选未应用',
      )
      const label = root.locator('[data-pro-field-label]').filter({ hasText: '已选状态' })
      assert.match(await label.innerText(), /已完成/)
      await label.getByRole('button', { name: /^清[空除]$/ }).click()
      await until(
        () => state.innerText(),
        (text) => text.includes('已清除标签'),
        '筛选标签未清空',
      )
      assert.doesNotMatch(await label.innerText(), /已完成/)
    })
    await step('LightWrapper 提交与关闭恢复草稿', async () => {
      const label = root.locator('[data-pro-field-label]').filter({ hasText: '关键词' })
      await label.click()
      const popup = page.locator('[data-pro-light-popover]:visible')
      await popup.locator('input').fill('主题')
      await popup.getByRole('button', { name: /^确\s*认$/ }).click()
      await until(
        () => state.innerText(),
        (text) => text.includes('轻量筛选：{"keyword":"主题"}'),
        '轻量筛选未提交',
      )
      await label.click()
      await popup.locator('input').fill('未提交草稿')
      await root.locator('h3').first().click()
      await popup.waitFor({ state: 'hidden' })
      await label.click()
      assert.equal(await popup.locator('input').inputValue(), '主题')
      await root.locator('h3').first().click()
    })
    await step('独立 footer 与行内校验', async () => {
      await root.getByRole('button', { name: '确认结果', exact: true }).click()
      assert.match(await state.innerText(), /独立操作区：已确认/)
      await root.getByRole('button', { name: '清除结果', exact: true }).click()
      assert.match(await state.innerText(), /独立操作区：已清除/)
      await root.locator('[data-demo-inline-validate]').click()
      await root.getByText('请至少输入两个字符', { exact: true }).waitFor()
      await root.locator('[data-demo-inline-input]').fill('组件')
      await root.locator('[data-demo-inline-validate]').click()
      await until(
        () => state.innerText(),
        (text) => text.includes('名称校验通过'),
        '有效名称未通过校验',
      )
      await root.getByText('请至少输入两个字符', { exact: true }).waitFor({ state: 'hidden' })
    })
    await step('ErrorBoundary 捕获并恢复', async () => {
      await root.locator('[data-demo-boundary-content]').waitFor()
      await root.locator('[data-demo-boundary-crash]').click()
      await root.locator('[data-demo-boundary-reset]').waitFor()
      assert.match(await state.innerText(), /错误已被边界捕获/)
      await root.locator('[data-demo-boundary-reset]').click()
      await root.locator('[data-demo-boundary-content]').waitFor()
      assert.equal(await root.locator('[data-demo-boundary-reset]').count(), 0)
    })
  })
} finally {
  await browser.close()
  report.passed = report.checks.every((check) => check.passed)
  report.stepCount = report.checks.reduce((count, check) => count + check.steps.length, 0)
  report.passedStepCount = report.checks.reduce(
    (count, check) => count + check.steps.filter((step) => step.passed).length,
    0,
  )
  await writeFile(
    path.join(output, 'new-family-demo-verification.json'),
    `${JSON.stringify(report, null, 2)}\n`,
  )
  console.log(JSON.stringify(report, null, 2))
  if (!report.passed) process.exitCode = 1
}
