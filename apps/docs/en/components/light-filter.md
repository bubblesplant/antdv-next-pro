---
pageClass: component-doc
---

<script setup>
import BasicLightFilter from '../../../playground/src/demos/light-filter/BasicLightFilter.vue'
import CollapsedLightFilter from '../../../playground/src/demos/light-filter/CollapsedLightFilter.vue'
</script>

# LightFilter

`LightFilter` is a standalone form that presents fields as filter labels. Click a label to open a popover and confirm to submit. `ProTable` uses the same component when `search.filterType='light'`.

## Import

```ts
import { LightFilter, ProFormText, ProFormSelect } from '@bubblesjs/antdv-next-pro'
import '@bubblesjs/antdv-next-pro/style.css'
```

You can also register `<LightFilter>` globally with `app.use(AntdvNextPro)`. See [Getting started](../guide/getting-started).

## Filter labels and secondary fields

Compose `ProForm` fields in the default slot. Ordinary fields have their own filter labels, while fields with `secondary` appear under More. Bind values with `v-model` and handle searches with `:on-finish="search"`.

<ClientOnly>
  <BasicLightFilter />
</ClientOnly>

<details class="demo-source"><summary>View full source</summary>

<<< ../../../playground/src/demos/light-filter/BasicLightFilter.vue

</details>

Confirmation validates and submits. Closing a popover without confirmation restores its opening snapshot. Clearing removes the current field or group's values and submits again. Editing updates `v-model`; searches run on confirmation or clearing.

## Collect every field

Set `collapse=true` to collect all fields in one popover, and customize its label with `collapseLabel`. Call `reset()` through the component ref to restore all initial values.

<ClientOnly>
  <CollapsedLightFilter />
</ClientOnly>

<details class="demo-source"><summary>View full source</summary>

<<< ../../../playground/src/demos/light-filter/CollapsedLightFilter.vue

</details>

## Schema fields

As with `QueryFilter`, you can pass [SchemaForm columns](./schema-form) instead of composing field children:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { LightFilter, type SchemaFormColumn } from '@bubblesjs/antdv-next-pro'

const filters = ref<Record<string, unknown>>({})
const columns: SchemaFormColumn[] = [
  { title: 'Project', dataIndex: 'keyword' },
  {
    title: 'Status',
    dataIndex: 'status',
    valueType: 'select',
    valueEnum: { active: 'Active', done: 'Done' },
  },
]

function search(values: Record<string, unknown>) {
  console.log(values)
  return true
}
</script>

<template>
  <LightFilter v-model="filters" :columns="columns" :on-finish="search" />
</template>
```

## API

The component also supports the [shared ProForm options](./pro-form), including `initialValues`, `request`, `params`, validation, value formatting, and URL synchronization.

| Property                 | Type                                                      | Default / description                                               |
| ------------------------ | --------------------------------------------------------- | ------------------------------------------------------------------- |
| `modelValue` / `v-model` | `Partial<T>`                                              | Current filter values                                               |
| `columns`                | `SchemaFormColumn<T>[]`                                   | Optional schema fields                                              |
| `onFinish`               | `(values) => boolean \| void \| Promise<boolean \| void>` | Search callback on confirmation or clearing; bind with `:on-finish` |
| `collapse`               | `boolean`                                                 | `false`; collect all fields in one popover                          |
| `collapseLabel`          | `VNodeChild`                                              | Localized More label                                                |
| `placement`              | `PopoverProps['placement']`                               | `'bottomLeft'`                                                      |
| `footerRender`           | `false \| ({ confirm, clear }, doms) => VNodeChild`       | Customize popover actions; `false` hides the footer                 |

Set a field's `secondary` property to place it under More. With `collapse=true`, all fields share one popover. This grouping option is separate from `QueryFilter`'s `v-model:collapsed` state.

| Event                          | Description                                                  |
| ------------------------------ | ------------------------------------------------------------ |
| `update:modelValue` / `change` | Values changed, including unconfirmed edits                  |
| `submit`                       | Observe submission; use `onFinish` to await business results |
| `reset`                        | Restore the initialization snapshot through the instance     |
| `error` / `requestError`       | Submission error / initialization request error              |

The default slot composes fields. The component ref exposes `getFieldsValue()`, `setFieldsValue()`, `validate()`, `submit()`, and `reset()`. Use `ProFormInstance` for composed fields or `SchemaFormInstance<T>` for schema fields. See [ProForm instance methods](./pro-form#values-and-instance).

## Related components

- Use [QueryFilter](./query-filter) for a grid search form.
- Configure table filters with [ProTable](./pro-table)'s `search.filterType='light'`.
- Localization, theme, and semantic styling follow [ProForm](./pro-form#configuration-and-styling).
