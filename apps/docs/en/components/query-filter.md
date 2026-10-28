---
pageClass: component-doc
---

<script setup>
import BasicQueryFilter from '../../../playground/src/demos/query-filter/BasicQueryFilter.vue'
import SchemaQueryFilter from '../../../playground/src/demos/query-filter/SchemaQueryFilter.vue'
</script>

# QueryFilter

`QueryFilter` is a standalone search form with responsive columns, search and reset actions, and expandable fields. `ProTable` uses the same component for its default search area. Compose `ProForm` fields or pass `columns` to generate fields from a schema.

## Import

```ts
import { QueryFilter, ProFormText, ProFormSelect } from '@bubblesjs/antdv-next-pro'
import '@bubblesjs/antdv-next-pro/style.css'
```

You can also register `<QueryFilter>` globally with `app.use(AntdvNextPro)`. See [Getting started](../guide/getting-started).

## Fields and expansion

Place `ProFormText`, `ProFormSelect`, and other fields in the default slot. Bind values with `v-model` and handle validated searches through `:on-finish="search"`.

<ClientOnly>
  <BasicQueryFilter />
</ClientOnly>

<details class="demo-source"><summary>View full source</summary>

<<< ../../../playground/src/demos/query-filter/BasicQueryFilter.vue

</details>

`defaultCollapsed` defaults to `true`. Use `v-model:collapsed` for controlled expansion. When fields exceed the first row's capacity, the collapse action appears with a down arrow to expand and an up arrow to collapse. Hidden fields retain their values.

`span` uses a 24-column grid and accepts a number or breakpoint map, for example `{ xs: 24, sm: 12, md: 8 }`. Without an explicit span, column widths follow the container width and `defaultColsNumber`.

## Schema fields and instance methods

Pass existing schema `columns` directly. A component ref can set values, submit, and reset independently of a table.

<ClientOnly>
  <SchemaQueryFilter />
</ClientOnly>

<details class="demo-source"><summary>View full source</summary>

<<< ../../../playground/src/demos/query-filter/SchemaQueryFilter.vue

</details>

See [SchemaForm](./schema-form) for column configuration. These examples demonstrate composition and schema fields separately.

## API

The component also supports the [shared ProForm options](./pro-form), including `initialValues`, `request`, `params`, validation, value formatting, and URL synchronization.

| Property                          | Type                                                      | Default / description                                         |
| --------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------- |
| `modelValue` / `v-model`          | `Partial<T>`                                              | Current search values                                         |
| `columns`                         | `SchemaFormColumn<T>[]`                                   | Optional schema fields                                        |
| `onFinish`                        | `(values) => boolean \| void \| Promise<boolean \| void>` | Validated search callback; bind with `:on-finish`             |
| `collapsed` / `v-model:collapsed` | `boolean`                                                 | Controlled collapsed state                                    |
| `defaultCollapsed`                | `boolean`                                                 | `true`                                                        |
| `defaultColsNumber`               | `number`                                                  | `3`; default column count in wider containers                 |
| `span`                            | `number \| Record<string, number>`                        | Grid span with `xs/sm/md/lg/xl` breakpoints                   |
| `labelWidth`                      | `number \| 'auto'`                                        | Label width; numbers use px                                   |
| `split`                           | `boolean`                                                 | `false`; separator styling                                    |
| `searchText` / `resetText`        | `VNodeChild`                                              | Localized search / reset labels                               |
| `optionRender`                    | `false \| (props, form, doms) => VNodeChild`              | Customize search and reset actions; `false` hides them        |
| `collapseRender`                  | `false \| (collapsed) => VNodeChild`                      | Customize collapse content; `false` hides the collapse action |
| `submitter`                       | `false \| SubmitterProps`                                 | Configure search and reset actions and rendering              |

`optionRender=false` keeps the collapse action. Set `collapseRender=false` to hide it. A custom `collapseRender` replaces the default text and arrow.

| Event                           | Description                                                  |
| ------------------------------- | ------------------------------------------------------------ |
| `update:modelValue` / `change`  | Search values changed                                        |
| `update:collapsed` / `collapse` | Receives the new collapsed state                             |
| `submit`                        | Observe submission; use `onFinish` to await business results |
| `reset`                         | Restore the initialization snapshot                          |
| `error` / `requestError`        | Submission error / initialization request error              |

The default slot composes fields. Type the component ref as `SchemaFormInstance<T>` to access `getFieldsValue()`, `setFieldsValue()`, `validate()`, `submit()`, `reset()`, and other [ProForm instance methods](./pro-form#values-and-instance).

## Related components

- Configure table search through [ProTable](./pro-table)'s `search` option.
- Use [LightFilter](./light-filter) for filter labels with popovers.
- Localization, theme, and semantic styling follow [ProForm](./pro-form#configuration-and-styling).
