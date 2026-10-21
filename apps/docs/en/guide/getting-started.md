# Getting Started

`@bubblesjs/antv-next-pro` is a community-maintained library providing 19 `ProFormFields` plus `ProTable`, `EditableProTable`, and `SchemaForm` for Vue 3. Standalone fields and all three higher-level components share one field core, while the `columns` model spans search, display, editing, and submission.

## Requirements

- Node.js 24.x (the repository engine range is `>=24 <25`)
- pnpm 12.4.1
- Vue 3.5+
- `antdv-next` `^1.5.2`

## Install

```bash
pnpm add @bubblesjs/antv-next-pro antdv-next vue
```

Install the Vue plugins and load both the Antdv Next reset and the library stylesheet:

```ts
import { createApp } from 'vue'
import Antd from 'antdv-next'
import AntdvNextPro from '@bubblesjs/antv-next-pro'

import 'antdv-next/dist/reset.css'
import '@bubblesjs/antv-next-pro/style.css'

import App from './App.vue'

createApp(App).use(Antd).use(AntdvNextPro).mount('#app')
```

Plugin installation registers tables, ProForm, SchemaForm, providers, lists, and standalone fields such as ProFormText, ProFormSelect, and ProFormTreeSelect. See [ProFormFields](/en/components/pro-form-fields) and [v3 migration](./pro-components-v3).

Named imports work without installing the `AntdvNextPro` plugin. The stylesheet still needs to be loaded once:

```vue
<script setup lang="ts">
import { ProTable, type ProColumns } from '@bubblesjs/antv-next-pro'

type User = Record<string, unknown> & {
  id: number
  name: string
}

const columns: ProColumns<User>[] = [{ title: 'Name', dataIndex: 'name', valueType: 'text' }]
</script>

<template>
  <ProTable :columns="columns" :data-source="[{ id: 1, name: 'Ada' }]" row-key="id" />
</template>
```

## Migrate from the previous package

If your project already uses `antdv-next-pro`, replace the dependency:

```bash
pnpm remove antdv-next-pro
pnpm add @bubblesjs/antv-next-pro antdv-next vue
```

Replace `from 'antdv-next-pro'` with `from '@bubblesjs/antv-next-pro'` and change the stylesheet entry to `@bubblesjs/antv-next-pro/style.css`. The rename keeps the same component APIs and exports.

## Start with the components

- [ProFormFields](/en/components/pro-form-fields): standalone fields with shared FormItem, bare-control, option-request, readonly, and `v-model` bridge behavior.
- [ProTable](/en/components/pro-table): local/remote data, search, pagination, column state, and row editing.
- [EditableProTable](/en/components/editable-pro-table): a complete table controlled as one editable field.
- [SchemaForm](/en/components/schema-form): standard, overlay, filter, and step forms generated from `columns`.

## Vue API conventions

React Pro Components workflows are expressed through Vue conventions:

| React pattern                             | Vue pattern                                      |
| ----------------------------------------- | ------------------------------------------------ |
| `actionRef`, `formRef`, `editableFormRef` | Component `ref` and instance methods             |
| `value` + `onChange`                      | `v-model` / `v-model:value`                      |
| `editableKeys`                            | `v-model:editable-keys`                          |
| ReactNode props                           | Named slots, with `render` callbacks when useful |
| Callback events                           | Kebab-case Vue events such as `request-error`    |

## Shared column model

All three components use `ProColumns<T>`. `SchemaFormColumn<T>` adds form layout metadata.

| Field                                      | Purpose                                              |
| ------------------------------------------ | ---------------------------------------------------- |
| `title` / `dataIndex` / `key`              | Field label, data path, and stable identity          |
| `valueType` / `valueEnum`                  | Readonly display, search field, and editor selection |
| `search` / `hideInSearch`                  | Search visibility and parameter transforms           |
| `hideInTable` / `hideInForm`               | Context-specific visibility                          |
| `fieldProps` / `formItemProps`             | Control props and validation rules                   |
| `render` / `renderText` / `renderFormItem` | Custom display or editing                            |
| `convertValue` / `transform`               | Inbound conversion and submit-time output            |

Common `valueType` groups:

| Scenario           | `valueType`                                                           |
| ------------------ | --------------------------------------------------------------------- |
| Text and numeric   | `text`, `textarea`, `password`, `digit`, `money`, `percent`           |
| Choices and state  | `select`, `treeSelect`, `radio`, `checkbox`, `switch`, `segmented`    |
| Continuous values  | `slider`                                                              |
| Date and time      | `date`, `dateTime`, `dateRange`, `dateTimeRange`, `time`, `timeRange` |
| Table-only         | `index`, `indexBorder`, `option`                                      |
| Schema composition | `group`, `formList`, `formSet`, `divider`, `dependency`               |

## Repository development

```bash
pnpm install
pnpm dev          # interactive playground
pnpm docs:dev     # bilingual VitePress docs
pnpm typecheck    # workspace type checks
pnpm test         # Vitest unit tests
pnpm check        # format, lint, types, tests, and builds
```

Vite+ orchestrates Oxlint, Oxfmt, Vitest, Browser Mode, and package builds. `@antfu/eslint-config` only supplements Vue SFC linting. Commit messages must follow Conventional Commits.

## Changesets and releases

Every npm-facing change should include a changeset:

```bash
pnpm changeset
```

Select `@bubblesjs/antv-next-pro`, choose the release level, and write a user-facing summary. Commit the generated `.changeset/*.md` file with the implementation. The repository uses public access, `main` as the base branch, GitHub changelogs, and patch bumps for internal dependencies.

The release version is determined by the current version in the library's `package.json` and pending changesets. `@bubblesjs/antv-next-pro` is a separate npm package; its first scoped release does not inherit the old package's npm release history. After CI succeeds on `main`, the Release workflow:

1. Creates or updates the Changesets version PR.
2. Builds publish artifacts again after that PR is merged.
3. Publishes to npm with provenance when `NPM_TOKEN` is configured.
4. Keeps the version PR workflow working but skips npm publishing when `NPM_TOKEN` is absent.
