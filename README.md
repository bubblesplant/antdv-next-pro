# Antdv Next Pro

[![CI](https://github.com/bubblesplant/antv-next-pro/actions/workflows/ci.yml/badge.svg)](https://github.com/bubblesplant/antv-next-pro/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/%40bubblesjs%2Fantv-next-pro.svg)](https://www.npmjs.com/package/@bubblesjs/antv-next-pro)
[![license](https://img.shields.io/badge/license-MIT-1768d3.svg)](./LICENSE)

`@bubblesjs/antv-next-pro` 是社区维护的 Vue 3 与 Antdv Next 高阶组件库。本轮以 `@ant-design/pro-components@3.1.15-7` 为行为参考，以 Vue 的 `v-model`、事件、插槽和组件 `ref` 提供：

- `ProCard`：主题卡片、标题与操作区、骨架加载、受控/非受控折叠和语义样式。
- `ProTable`：搜索、分页、排序、筛选、列设置、远程请求与可编辑行。
- `EditableProTable`：整表受控编辑、新建记录、单行/多行编辑与异步保存。
- `SchemaForm`：通过 `columns` 生成 `Form`、`Embed`、`QueryFilter`、`LightFilter`、`ModalForm`、`DrawerForm`、`StepForm`、`StepsForm` 等布局表单。
- `ProForm`：组合字段，配合 `ProFormGroup`、`ProFormFieldSet`、`ProFormList`、`ProFormDependency`、`ProFormItem` 等结构组件，并支持查询、轻量、弹层和步骤布局；`BetaSchemaForm` 保留 schema 入口。
- `ProFormFields` / `ProField`：统一输入、只读展示、异步选项与自定义 valueType，覆盖文本、数字、日期、选择、验证码和上传等场景。
- `ProList` / `ProDescriptions`：列表 meta、请求、选择、描述项及字段展示。
- `ProConfigProvider`：继承原生 ConfigProvider 的语言、方向、前缀和主题，提供 Pro token、intl 与 valueType 注册。

本轮固定源码参考为 `3bf43278d39f2d31489749132982488f57a9eb5e`。公开类名、列回调和部分默认行为有调整，见 [迁移说明](https://bubblesplant.github.io/antv-next-pro/guide/pro-components-v3)。本轮不新增 ProSkeleton、LoginForm/LoginFormPage、PageContainer/ProLayout、StatisticCard/CheckCard 及其组件族。

[中文文档](https://bubblesplant.github.io/antv-next-pro/) · [English docs](https://bubblesplant.github.io/antv-next-pro/en/) · [Playground](https://bubblesplant.github.io/antv-next-pro/playground/)

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

ProFormFields 默认包含 FormItem，设置 `fieldMode="field"` 可只渲染裸控件。字段导出、组合命名和 Captcha/Upload 边界见 [ProFormFields 文档](https://bubblesplant.github.io/antv-next-pro/components/pro-form-fields)。

ProTable 的查询区和表格区已统一使用 ProCard。也可独立使用 `<ProCard title="用户信息" variant="borderless">内容</ProCard>`；详细 API 与示例见 [ProCard 文档](https://bubblesplant.github.io/antv-next-pro/components/pro-card)。

原有字段包括：

- 文本与数字：`ProFormText`、`ProFormTextPassword`、`ProFormTextArea`、`ProFormDigit`、`ProFormMoney`、`ProFormCaptcha`。
- 日期时间：`ProFormDatePicker`、`ProFormDateTimePicker`、`ProFormDateRangePicker`、`ProFormDateTimeRangePicker`。
- 选择与状态：`ProFormSelect`、`ProFormTreeSelect`、`ProFormCheckbox`、`ProFormRadioGroup`、`ProFormSlider`、`ProFormSwitch`、`ProFormSegmented`。
- 上传：`ProFormUploadButton`、`ProFormUploadDragger`。

扩展字段包括 Cascader、ColorPicker、Rate、DigitRange、TimePicker/TimeRangePicker，以及周、月、季度、年和对应范围。`ProFormRadio` 本身可以渲染，并提供 `.Group`；Checkbox 和 DatePicker 同样提供组合成员。

语义样式使用 `classes` / `styles`，接受对象或 `({ props }) => 对象`；`classNames` 保留兼容。原生 `ConfigProvider.theme.components` 继续定制原生组件，Pro 扩展 token 使用 `ProConfigProvider.token`。

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

用户可见变更需要执行 `pnpm changeset`。合并到 `main` 后，GitHub Actions 自动维护版本 PR；版本 PR 合并且仓库已配置 `NPM_TOKEN` 时发布 npm provenance。文档与 Playground 一起部署到 GitHub Pages。

### GitHub Pages 设置

仓库的 `Docs and Playground` 工作流会构建两个应用，将文档放在站点根目录、Playground 放在 `playground/` 子目录，并统一发布到 `gh-pages` 分支。Playground 使用 hash 路由，每个示例的链接都可以直接打开和刷新。

1. 将本次修改合并或推送到 `main`。
2. 打开仓库的 [Settings → Pages](https://github.com/bubblesplant/antv-next-pro/settings/pages)。在 **Build and deployment** 中将 **Source** 设置为 **Deploy from a branch**，**Branch** 选择 `gh-pages`，目录选择 **/ (root)**，保存。已经这样配置的仓库保持原设置即可。
3. 打开 [Actions → Docs and Playground](https://github.com/bubblesplant/antv-next-pro/actions/workflows/docs.yml)，等待自动部署。需要手动部署时选择 **Run workflow**，分支选 `main`。如果还没有 `gh-pages` 分支，先运行一次工作流，成功后再回到 Pages 选择该分支。
4. 工作流与 Pages 发布完成后，访问 [文档](https://bubblesplant.github.io/antv-next-pro/) 或 [Playground](https://bubblesplant.github.io/antv-next-pro/playground/)。中英文文档导航和首页都有 Playground 入口。

无需新增 Secret，发布使用 GitHub 自动提供的 `GITHUB_TOKEN`，工作流已声明 `contents: write` 权限。若推送 `gh-pages` 时返回 403，请检查仓库或组织是否限制了 Actions 的写入权限，以及 `gh-pages` 的分支规则是否允许该工作流发布。

后续修改文档、Playground 或组件源码并推送到 `main`，会自动更新整个站点。

## 参与贡献

欢迎[报告缺陷或提出功能建议](https://github.com/bubblesplant/antv-next-pro/issues/new/choose)，也欢迎从个人 Fork 向 `main` 提交 PR。请阅读[贡献指南](./CONTRIBUTING.md)，了解本地开发、PR 标题规范、测试与 changeset 要求。PR 会自动运行标题检查、代码检查、测试和构建验证。

## Compatibility

The API follows the main workflows of Ant Design Pro Components while remaining idiomatic Vue. ReactNode and React refs map to Vue slots, events, models, and component refs. This project does not ship a React compatibility runtime.

See the full [compatibility matrix](https://bubblesplant.github.io/antv-next-pro/en/guide/compatibility).

## License

[MIT](./LICENSE) © bubblesplant
