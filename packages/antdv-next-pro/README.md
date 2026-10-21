# @bubblesjs/antv-next-pro

Community-maintained Vue 3 ProCard, ProTable, EditableProTable, ProForm, SchemaForm, fields, lists, and descriptions powered by Antdv Next.

The current alignment references `@ant-design/pro-components@3.1.15-7` at commit `3bf43278d39f2d31489749132982488f57a9eb5e`, expressed through Vue `v-model`, events, slots, and component refs. See the [v3 migration guide](https://bubblesplant.github.io/antv-next-pro/en/guide/pro-components-v3) for changed defaults, classes, and callbacks.

## Install

```bash
pnpm add @bubblesjs/antv-next-pro antdv-next vue
```

```ts
import AntdvNextPro from '@bubblesjs/antv-next-pro'
import '@bubblesjs/antv-next-pro/style.css'

app.use(AntdvNextPro)
```

Named imports are available:

```ts
import {
  EditableProTable,
  ProCard,
  ProFormSelect,
  ProFormText,
  ProFormUploadButton,
  ProTable,
  SchemaForm,
  type EditableProTableInstance,
  type ProColumns,
  type ProTableInstance,
  type SchemaFormColumn,
  type SchemaFormInstance,
} from '@bubblesjs/antv-next-pro'
```

## ProCard

```vue
<ProCard v-model:collapsed="collapsed" title="User details" variant="borderless" collapsible>
  <template #extra>Actions</template>
  Content
</ProCard>
```

ProCard uses native Card theme tokens, title/action slots, loading, collapse, ghost mode, semantic `classes` / `styles`, responsive columns, split layout, tabs, Group, and Divider. ProTable reuses it for query and table containers. See the [ProCard docs](https://bubblesplant.github.io/antv-next-pro/en/components/pro-card).

## ProTable

```vue
<ProTable
  ref="tableRef"
  v-model:editable-keys="editableKeys"
  :columns="columns"
  :request="request"
  row-key="id"
/>
```

The request contract is independent of your HTTP client:

```ts
request(params, sort, filter): Promise<{
  data: T[]
  total?: number
  success?: boolean
}>
```

ProTable coordinates search, pagination, sorting, filters, selection, column persistence, polling, focus revalidation, and optional row editing.

## EditableProTable

```vue
<EditableProTable
  v-model:value="rows"
  v-model:editable-keys="editableKeys"
  :columns="columns"
  :editable="{ type: 'multiple', onSave, onDelete }"
  :record-creator-props="{
    record: () => ({ id: crypto.randomUUID(), name: '' }),
    newRecordType: 'dataSource',
  }"
  row-key="id"
/>
```

EditableProTable treats the complete table as a controlled value. It supports cached or immediate row creation, maximum row counts, tree parent keys, and async edit callbacks.

## SchemaForm

```vue
<SchemaForm ref="formRef" v-model="form" :columns="columns" @finish="save" />
```

Available layouts are `Form`, `Embed`, `ModalForm`, `DrawerForm`, `QueryFilter`, `LightFilter`, `StepForm`, and `StepsForm`. Composition value types include `group`, `formList`, `formSet`, `divider`, and `dependency`.

`convertValue` transforms inbound values; `transform` shapes submitted values.

Use `ProForm` to compose field children without columns; `BetaSchemaForm` is the schema entry. Structure components include Group, FieldSet, List, Dependency, and Item. ModalForm and DrawerForm await `onFinish` and close only when it returns `true`; `false`, `undefined`, and rejection preserve the popup and values. Pass `:on-finish="save"` when its return value matters.

SchemaForm and the table search/edit controls share the same field registry. In addition to the existing types, `treeSelect`, `slider`, and `segmented` are available across these consumers; SchemaForm also supports `timeRange`.

## ProFormFields

Each field is independently importable, uses standard Vue `v-model`, and includes an Antdv Next FormItem by default. Set `fieldMode="field"` when a table cell, custom grid, or parent component already owns the FormItem.

```vue
<script setup lang="ts">
import { Form } from 'antdv-next'
import { reactive } from 'vue'
import { ProFormSelect, ProFormText } from '@bubblesjs/antv-next-pro'

const form = reactive({ title: '', owner: undefined as string | undefined })

async function loadOwners() {
  return [
    { label: 'Ada', value: 'ada' },
    { label: 'Lin', value: 'lin' },
  ]
}
</script>

<template>
  <Form :model="form" layout="vertical">
    <ProFormText v-model="form.title" name="title" label="Title" />
    <ProFormSelect v-model="form.owner" name="owner" label="Owner" :request="loadOwners" />
  </Form>
</template>
```

The original template-friendly fields include:

- Text and numeric: `ProFormText`, `ProFormTextPassword`, `ProFormTextArea`, `ProFormDigit`, `ProFormMoney`, `ProFormCaptcha`.
- Date/time: `ProFormDatePicker`, `ProFormDateTimePicker`, `ProFormDateRangePicker`, `ProFormDateTimeRangePicker`.
- Choice and state: `ProFormSelect`, `ProFormTreeSelect`, `ProFormCheckbox`, `ProFormRadioGroup`, `ProFormSlider`, `ProFormSwitch`, `ProFormSegmented`.
- Upload: `ProFormUploadButton`, `ProFormUploadDragger`.

Additional fields include Cascader, ColorPicker, Rate, DigitRange, TimePicker/TimeRangePicker, and week/month/quarter/year date and range variants. `ProFormText.Password` aliases `ProFormTextPassword`; the renderable ProFormRadio provides `.Group`, as does ProFormCheckbox. DatePicker exposes Week/Month/Quarter/Year members.

Captcha validates `phoneName` and passes the phone number to `onGetCaptcha`; applications provide the sending operation. Upload fields bridge `fileList` to `v-model`; configure `action` or `customRequest` in `fieldProps`.

## Configuration and display

ProConfigProvider / ProProvider inherit native ConfigProvider locale, direction, prefix, theme algorithms, global tokens, and native component tokens. Pro extensions use `ProConfigProvider.token`; native `theme.components.Card` continues to customize Card. Register custom field display/edit behavior with `valueTypeMap.render` / `formItemRender`.

Public classes use `ant-pro-*` and follow the native prefix dynamically. Prefer `classes` / `styles` with objects or `({ props }) => object`; `classNames` is a compatibility alias. Column callbacks use `render(dom, record, index, action, schema)`.

ProList/BaseProList, ProDescriptions, DragSortTable, RowEditorTable, CellEditorTable, and table helpers provide additional display workflows. This alignment excludes ProSkeleton, LoginForm/LoginFormPage, PageContainer/ProLayout, StatisticCard/CheckCard and their new component families.

## 中文简介

`@bubblesjs/antv-next-pro` 是社区维护的 Vue 3 + Antdv Next 高阶组件库，提供表格、组合与 Schema 表单、统一字段、列表、描述项和 Pro 配置。表格与表单共享字段核心，支持 Promise 请求、双向绑定、异步提交与原生 ConfigProvider 配置继承。

- [完整中文文档](https://bubblesplant.github.io/antv-next-pro/)
- [English documentation](https://bubblesplant.github.io/antv-next-pro/en/)
- [GitHub](https://github.com/bubblesplant/antv-next-pro)

## License

MIT
