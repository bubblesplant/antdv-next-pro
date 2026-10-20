# Antdv Next Pro

[![CI](https://github.com/bubblesplant/antv-next-pro/actions/workflows/ci.yml/badge.svg)](https://github.com/bubblesplant/antv-next-pro/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/%40bubblesjs%2Fantv-next-pro.svg)](https://www.npmjs.com/package/@bubblesjs/antv-next-pro)
[![license](https://img.shields.io/badge/license-MIT-1768d3.svg)](./LICENSE)

`@bubblesjs/antv-next-pro` 是社区维护的 Vue 3 与 Antdv Next 高阶数据组件库。参考 `@ant-design/pro-components@2.8.10` 的主要 Props 和工作流，以 Vue 的 `v-model`、事件、插槽和组件 `ref` 提供：

- `ProCard`：主题卡片、标题与操作区、骨架加载、受控/非受控折叠和语义样式。
- `ProTable`：搜索、分页、排序、筛选、列设置、远程请求与可编辑行。
- `EditableProTable`：整表受控编辑、新建记录、单行/多行编辑与异步保存。
- `SchemaForm`：通过 `columns` 生成普通、查询、轻量、弹层和步骤表单。
- `ProFormFields`：19 个可独立使用的字段组件，统一 FormItem/裸控件、异步选项、只读展示与 `v-model` 协议，覆盖文本、数字、日期、选择、验证码和上传等场景。

2026-10-19 已核对上游 `3.1.15-7` 及主分支更新，新增基础 ProCard，并补齐 ProTable 卡片布局、工具栏关键词搜索、响应式搜索跨度和 `getSortFilter()`；这不表示已完整实现上游 3.x。版本差异与本次同步范围见 [同步记录](./artifacts/upstream-sync-2026-10-19.md)。

[中文文档](https://bubblesplant.github.io/antv-next-pro/) · [English docs](https://bubblesplant.github.io/antv-next-pro/en/)

## 安装

```bash
pnpm add @bubblesjs/antv-next-pro antdv-next vue
```

```ts
import { createApp } from 'vue'
import Antd from 'antdv-next'
import AntdvNextPro from '@bubblesjs/antv-next-pro'

import 'antdv-next/dist/reset.css'
import '@bubblesjs/antv-next-pro/style.css'

createApp(App).use(Antd).use(AntdvNextPro).mount('#app')
```

也可以按需具名导入：

```ts
import {
  EditableProTable,
  ProCard,
  ProFormSelect,
  ProFormText,
  ProFormUploadButton,
  ProTable,
  SchemaForm,
  type ProColumns,
} from '@bubblesjs/antv-next-pro'
```

ProFormFields 默认包含 FormItem，设置 `fieldMode="field"` 可只渲染裸控件。完整 19 项导出、组合命名和 Captcha/Upload 边界见 [ProFormFields 文档](https://bubblesplant.github.io/antv-next-pro/components/pro-form-fields)。

ProTable 的查询区和表格区已统一使用 ProCard。也可独立使用 `<ProCard title="用户信息" variant="borderless">内容</ProCard>`；详细 API 与示例见 [ProCard 文档](./apps/docs/components/pro-card.md)。

19 个模板友好公开字段组件为：

- 文本与数字：`ProFormText`、`ProFormTextPassword`、`ProFormTextArea`、`ProFormDigit`、`ProFormMoney`、`ProFormCaptcha`。
- 日期时间：`ProFormDatePicker`、`ProFormDateTimePicker`、`ProFormDateRangePicker`、`ProFormDateTimeRangePicker`。
- 选择与状态：`ProFormSelect`、`ProFormTreeSelect`、`ProFormCheckbox`、`ProFormRadioGroup`、`ProFormSlider`、`ProFormSwitch`、`ProFormSegmented`。
- 上传：`ProFormUploadButton`、`ProFormUploadDragger`。

`ProTable`、`SchemaForm` 与 `EditableProTable` 共享同一字段注册表和控件核心，查询、表单及行内编辑不会维护彼此分离的字段映射。

## 快速示例

```vue
<script setup lang="ts">
import { ProTable, type ProColumns, type ProRequest } from '@bubblesjs/antv-next-pro'

type User = Record<string, unknown> & {
  id: number
  name: string
  status: 'active' | 'disabled'
}

const columns: ProColumns<User>[] = [
  { title: '姓名', dataIndex: 'name', valueType: 'text' },
  {
    title: '状态',
    dataIndex: 'status',
    valueType: 'select',
    valueEnum: { active: '启用', disabled: '停用' },
  },
]

const request: ProRequest<User, Record<string, unknown>> = async (params, sort, filter) => {
  const result = await api.users({ ...params, sort, filter })
  return { data: result.items, total: result.total, success: true }
}
</script>

<template>
  <ProTable :columns="columns" :request="request" row-key="id" />
</template>
```

请求契约不绑定特定请求库，并发请求只接纳最后一次结果：

```ts
request(params, sort, filter): Promise<{
  data: T[]
  total?: number
  success?: boolean
}>
```

## Monorepo

```text
apps/
  docs/                 中英双语 VitePress 文档
  playground/           核心组件与字段体系的交互演练场
packages/
  antdv-next-pro/       npm 组件包
```

工程固定 Node.js 24、pnpm 12.4.1，并使用 Vite+ 统一运行 Vite、Oxlint、Oxfmt、Vitest、任务编排与组件打包。Vue SFC 额外由 `@antfu/eslint-config` 检查。

```bash
pnpm install
pnpm dev                # Playground
pnpm docs:dev           # VitePress
pnpm format:check
pnpm lint:ox
pnpm lint:vue
pnpm typecheck
pnpm test:coverage
pnpm test:browser
pnpm build
```

## 发布

用户可见变更需要执行 `pnpm changeset`。合并到 `main` 后，GitHub Actions 自动维护版本 PR；版本 PR 合并且仓库已配置 `NPM_TOKEN` 时发布 npm provenance。文档独立部署到 GitHub Pages。

## 参与贡献

欢迎[报告缺陷或提出功能建议](https://github.com/bubblesplant/antv-next-pro/issues/new/choose)，也欢迎从个人 Fork 向 `main` 提交 PR。请阅读[贡献指南](./CONTRIBUTING.md)，了解本地开发、PR 标题规范、测试与 changeset 要求。PR 会自动运行标题检查、代码检查、测试和构建验证。

## Compatibility

The API follows the main workflows of Ant Design Pro Components while remaining idiomatic Vue. ReactNode and React refs map to Vue slots, events, models, and component refs. This project does not ship a React compatibility runtime.

See the full [compatibility matrix](https://bubblesplant.github.io/antv-next-pro/en/guide/compatibility).

## License

[MIT](./LICENSE) © bubblesplant
