# @bubblesjs/antv-next-pro

Community-maintained Vue 3 ProCard, ProTable, EditableProTable, SchemaForm, and ProFormFields powered by Antdv Next.

The API follows the major workflows of `@ant-design/pro-components@2.8.10`, expressed through idiomatic Vue `v-model`, events, slots, and component refs.

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

ProCard follows the basic card in ProComponents `3.1.15-7`, using native Card theme tokens, title/action slots, loading skeletons, controlled/uncontrolled collapse, ghost mode, and semantic `styles` / `classNames`. ProTable reuses it for both its query form and table container. Tabs, split grids, StatisticCard, and CheckCard are outside this implementation's scope. See the [ProCard docs](https://bubblesplant.github.io/antv-next-pro/en/components/pro-card).

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

The 19 template-friendly field exports are:

- Text and numeric: `ProFormText`, `ProFormTextPassword`, `ProFormTextArea`, `ProFormDigit`, `ProFormMoney`, `ProFormCaptcha`.
- Date/time: `ProFormDatePicker`, `ProFormDateTimePicker`, `ProFormDateRangePicker`, `ProFormDateTimeRangePicker`.
- Choice and state: `ProFormSelect`, `ProFormTreeSelect`, `ProFormCheckbox`, `ProFormRadioGroup`, `ProFormSlider`, `ProFormSwitch`, `ProFormSegmented`.
- Upload: `ProFormUploadButton`, `ProFormUploadDragger`.

`ProFormText.Password` aliases `ProFormTextPassword`, and `ProFormRadio.Group` aliases `ProFormRadioGroup`. Captcha only manages callback/loading/countdown state and never sends a code by itself. Upload fields bridge `fileList` to `v-model` but do not provide an upload backend; configure `action` or `customRequest` in `fieldProps`. Captcha and both Upload fields are standalone components rather than Schema/table `valueType` values.

## 中文简介

`@bubblesjs/antv-next-pro` 是社区维护的组件库，为 Vue 3 + Antdv Next 提供高阶表格、Schema 表单和 19 个独立 ProFormFields。表格与表单共享字段核心，支持通用 Promise 请求、受控双向绑定、异步选项/编辑以及普通、查询、弹层和步骤表单。

- [完整中文文档](https://bubblesplant.github.io/antv-next-pro/)
- [English documentation](https://bubblesplant.github.io/antv-next-pro/en/)
- [GitHub](https://github.com/bubblesplant/antv-next-pro)

## License

MIT
