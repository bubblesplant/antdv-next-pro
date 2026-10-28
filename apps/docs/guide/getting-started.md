# 快速开始

`@bubblesjs/antdv-next-pro` 是社区维护的 Vue 3 + Antdv Next 高阶组件库，提供表格、组合与 Schema 表单、统一字段、列表、描述项和 Pro 配置。`columns` 可描述查询、展示、编辑和提交，ProForm 也支持直接组合字段。

## 环境要求

- Node.js 24.x（仓库约束为 `>=24 <25`）
- pnpm 12.4.1
- Vue 3.5+
- `antdv-next` `^1.5.2`

## 安装

```bash
pnpm add @bubblesjs/antdv-next-pro antdv-next vue
```

在应用入口安装 Vue 插件，并加载 Antdv Next reset 与组件库样式：

```ts
import { createApp } from 'vue'
import Antd from 'antdv-next'
import AntdvNextPro from '@bubblesjs/antdv-next-pro'

import 'antdv-next/dist/reset.css'
import '@bubblesjs/antdv-next-pro/style.css'

import App from './App.vue'

createApp(App).use(Antd).use(AntdvNextPro).mount('#app')
```

安装插件后，可使用 ProTable、EditableProTable、ProForm、SchemaForm、Provider、列表及字段组件等全局名称。完整字段清单见 [ProFormFields](/components/pro-form-fields)，默认值和类名变化见 [v3 迁移](./pro-components-v3)。

组件也支持具名导入，无需安装 `AntdvNextPro` 插件。样式入口仍需加载一次：

```vue
<script setup lang="ts">
import { ProTable, type ProColumns } from '@bubblesjs/antdv-next-pro'

type User = Record<string, unknown> & {
  id: number
  name: string
}

const columns: ProColumns<User>[] = [{ title: '姓名', dataIndex: 'name', valueType: 'text' }]
</script>

<template>
  <ProTable :columns="columns" :data-source="[{ id: 1, name: 'Ada' }]" row-key="id" />
</template>
```

## 从旧包迁移

如果项目已安装 `antdv-next-pro`，先替换依赖：

```bash
pnpm remove antdv-next-pro
pnpm add @bubblesjs/antdv-next-pro antdv-next vue
```

将代码中的 `from 'antdv-next-pro'` 改为 `from '@bubblesjs/antdv-next-pro'`，并将样式入口改为 `@bubblesjs/antdv-next-pro/style.css`。此次更名的组件 API 和导出保持一致。

## 从组件开始

- [ProFormFields](/components/pro-form-fields)：统一 FormItem、裸控件、选项请求、只读和 `v-model` 桥接。
- [ProTable](/components/pro-table)：本地/远程数据、搜索、分页、列状态和行编辑。
- [EditableProTable](/components/editable-pro-table)：将完整表格作为一个受控可编辑字段。
- [SchemaForm](/components/schema-form)：从 `columns` 生成普通、弹层、筛选和步骤表单。

## Vue API 约定

React Pro Components 的工作流会以 Vue 惯用方式表达：

| React 模式                                | Vue 模式                                  |
| ----------------------------------------- | ----------------------------------------- |
| `actionRef`、`formRef`、`editableFormRef` | 组件 `ref` 与实例方法                     |
| `value` + `onChange`                      | `v-model` / `v-model:value`               |
| `editableKeys`                            | `v-model:editable-keys`                   |
| ReactNode Props                           | 具名插槽，必要时使用 `render` 回调        |
| 回调事件                                  | Vue kebab-case 事件，例如 `request-error` |

## 统一列模型

三个组件共享 `ProColumns<T>`；`SchemaFormColumn<T>` 在此基础上增加表单布局字段。

| 字段                                       | 用途                           |
| ------------------------------------------ | ------------------------------ |
| `title` / `dataIndex` / `key`              | 字段标题、数据路径和稳定标识   |
| `valueType` / `valueEnum`                  | 选择只读展示、搜索项与编辑控件 |
| `search` / `hideInSearch`                  | 查询区配置和参数转换           |
| `hideInTable` / `hideInForm`               | 按使用场景控制可见性           |
| `fieldProps` / `formItemProps`             | 透传控件与校验配置             |
| `render` / `renderText` / `renderFormItem` | 自定义展示或编辑               |
| `convertValue` / `transform`               | 分别转换进入表单的值与提交结果 |

常用 `valueType` 分组如下：

| 场景        | `valueType`                                                           |
| ----------- | --------------------------------------------------------------------- |
| 文本与数字  | `text`、`textarea`、`password`、`digit`、`money`、`percent`           |
| 选择与状态  | `select`、`treeSelect`、`radio`、`checkbox`、`switch`、`segmented`    |
| 连续数值    | `slider`                                                              |
| 日期与时间  | `date`、`dateTime`、`dateRange`、`dateTimeRange`、`time`、`timeRange` |
| 表格专用    | `index`、`indexBorder`、`option`                                      |
| Schema 组合 | `group`、`formList`、`formSet`、`divider`、`dependency`               |

## 本仓库开发

```bash
pnpm install
pnpm dev          # 启动交互 Playground
pnpm docs:dev     # 启动中英文 VitePress 文档
pnpm typecheck    # 全工作区类型检查
pnpm test         # Vitest 单元测试
pnpm check        # 格式、Lint、类型、测试与构建
```

工程由 Vite+ 统一编排 Oxlint、Oxfmt、Vitest、Browser Mode 与打包任务；`@antfu/eslint-config` 只补充 Vue SFC 检查。提交信息必须符合 Conventional Commits。

## Changesets 与发布

每个会影响 npm 包的变更都应附带 changeset：

```bash
pnpm changeset
```

选择 `@bubblesjs/antdv-next-pro`、版本级别并填写面向使用者的变更说明，然后将生成的 `.changeset/*.md` 一并提交。当前仓库采用公开发布、`main` 基线、GitHub changelog 和内部依赖 patch 更新。

发布版本由组件包 `package.json` 中的当前版本与待发布 changeset 共同确定。`@bubblesjs/antdv-next-pro` 是独立的 npm 包，首次发布到此作用域时不继承旧包的 npm 发布记录。`main` 的 CI 通过后，Release 工作流会：

1. 通过 Changesets 创建或更新版本 PR。
2. 版本 PR 合并后再次构建发布产物。
3. 配置 `NPM_TOKEN` 时发布到 npm，并生成 provenance。
4. 未配置 `NPM_TOKEN` 时仍可维护版本 PR，但不会执行 npm 发布。
