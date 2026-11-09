---
pageClass: component-doc
---

<script setup>
import BasicQueryFilter from '../../../playground/src/demos/query-filter/BasicQueryFilter.vue'
import SchemaQueryFilter from '../../../playground/src/demos/query-filter/SchemaQueryFilter.vue'
</script>

# QueryFilter

`QueryFilter` is a standalone search form with responsive columns, search and reset actions, and expandable fields. `ProTable` uses the same component for its default search area. Compose `ProForm` fields or pass `columns` to generate fields from a schema.

The default form layout is horizontal. Root padding and row gaps are both `24px`, without additional Form.Item bottom margins. Set `layout="vertical"` explicitly or customize the corresponding areas through `styles.root/row/item/actions`.

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

### Props {#props}

Without columns this renders composition ProForm; with columns it renders BetaSchemaForm. Every shared configuration has a documented destination:

| Entry                                 | Type / owner         | Documentation                                                                                                                                                                                                                                          |
| ------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Shared ProForm props                  | `ProFormProps<T>`    | All initialValues/request/params/readonly/disabled/dateFormatter/syncToUrl/syncToInitialValues/onValuesChange/formRef/prefixCls/classes/classNames/styles definitions: [ProForm props](./pro-form#props)                                               |
| Native form props in composition mode | `FormProps`          | Put layout/rules/labelCol/wrapperCol/labelAlign/labelWrap/colon/validateTrigger directly on QueryFilter; [native Form API](https://www.antdv-next.com/components/form)                                                                                 |
| `formProps` with columns              | `Partial<FormProps>` | Inner native Form options: [SchemaForm props](./schema-form#props), [Form API](https://www.antdv-next.com/components/form). Model, submission, readonly and filter layout are coordinated by the wrapper; dedicated top-level settings take precedence |
| Other schema configuration            | `SchemaFormProps<T>` | [SchemaForm props](./schema-form#props); fieldProps/formItemProps recipients follow [field API](./pro-form-fields#props)                                                                                                                               |

| Prop                | Type                                                         | Default          | Description / source                                                            |
| ------------------- | ------------------------------------------------------------ | ---------------- | ------------------------------------------------------------------------------- |
| `modelValue`        | `Partial<T>`                                                 | —                | Current v-model search values                                                   |
| `columns`           | `SchemaFormColumn<T>[]`                                      | —                | Enables schema mode; [column options](./schema-form#columns)                    |
| `onFinish`          | `(values: T) => boolean \| void \| Promise<boolean \| void>` | —                | Awaitable search callback; bind with :on-finish                                 |
| `layout`            | `FormProps['layout']`                                        | `'horizontal'`   | [Native layout](https://www.antdv-next.com/components/form), including vertical |
| `collapsed`         | `boolean`                                                    | Uncontrolled     | Controlled v-model:collapsed state                                              |
| `defaultCollapsed`  | `boolean`                                                    | `true`           | Initial uncontrolled state                                                      |
| `defaultColsNumber` | `number`                                                     | `3`              | Default column count in wide containers                                         |
| `span`              | `number \| Record<string, number>`                           | Responsive       | 24-column spans; xs/sm/md/lg/xl breakpoints                                     |
| `labelWidth`        | `number \| 'auto'`                                           | `80`             | Label width in pixels                                                           |
| `split`             | `boolean`                                                    | `false`          | Field separators                                                                |
| `searchText`        | `VNodeChild`                                                 | Localized Search | Overrides submitter text                                                        |
| `resetText`         | `VNodeChild`                                                 | Localized Reset  | Overrides submitter text                                                        |
| `optionRender`      | `false \| (props, form, doms) => VNodeChild`                 | Default actions  | ProFormInstance and default button VNode array                                  |
| `collapseRender`    | `false \| (collapsed: boolean) => VNodeChild`                | Label and arrow  | Collapse button content; false hides it                                         |
| `submitter`         | `false \| SubmitterProps`                                    | Default actions  | [Submitter options](./pro-form#submitter), including ButtonProps links          |

optionRender=false preserves the collapse button. collapseRender=false hides it. Action precedence is optionRender → submitter.render → submitter slot → defaults. Top-level labels override submitter labels.

### Events {#events}

| Event               | Arguments                                 | Description                                                               |
| ------------------- | ----------------------------------------- | ------------------------------------------------------------------------- |
| `update:modelValue` | `values: Partial<T>`                      | Controlled value update                                                   |
| `change`            | `values: Partial<T>`                      | Search values changed                                                     |
| `update:collapsed`  | `collapsed: boolean`                      | Controlled collapse update                                                |
| `collapse`          | `collapsed: boolean`                      | User toggled collapse                                                     |
| `submit`            | `values: Partial<T>`                      | Observe submission; onFinish awaits business results                      |
| `reset`             | `values: Partial<T>`                      | Initialization snapshot restored                                          |
| `error`             | `error: unknown`                          | Validation/submission failure                                             |
| `requestError`      | `error: unknown`                          | Initialization request failed                                             |
| Schema-only events  | [SchemaForm events](./schema-form#events) | With columns, valuesChange/fieldChange/finish follow SchemaForm semantics |

### Slots {#slots}

| Slot                            | Scope                                   | Description                                      |
| ------------------------------- | --------------------------------------- | ------------------------------------------------ |
| `default`                       | None                                    | Composition fields                               |
| `submitter` in composition mode | `{ form, values, submit, reset }`       | Standard form actions remain available           |
| `submitter` with columns        | `{ values, current }`                   | Schema context; no composition form/submit/reset |
| Dynamic fields with columns     | [SchemaForm slots](./schema-form#slots) | field-path, path and column-key render entries   |

### Instance methods {#instance}

The exported layout ref uses SchemaFormInstance. Complete signatures are documented by [SchemaForm](./schema-form#instance) and [ProForm](./pro-form#instance).

| Member                                                    | Arguments / return          | Description                                                        |
| --------------------------------------------------------- | --------------------------- | ------------------------------------------------------------------ |
| `nativeForm`                                              | `FormInstance \| undefined` | [Native Form instance](https://www.antdv-next.com/components/form) |
| `validate()` / `validateFields(names?)`                   | `Promise<Partial<T>>`       | Validate raw values                                                |
| `validateFieldsReturnFormatValue(names?)`                 | `Promise<Partial<T>>`       | Validate formatted values                                          |
| `getFieldsValue()` / `getFieldValue(name)`                | `Partial<T>` / `unknown`    | Read raw values                                                    |
| `getFieldsFormatValue()` / `getFieldFormatValue(name)`    | `Partial<T>` / `unknown`    | Read formatted/transformed values                                  |
| `setFieldsValue(values)` / `setFieldValue(name, value)`   | `void`                      | Merge values / update one path                                     |
| `submit()`                                                | `Promise<Partial<T>>`       | Validate and await onFinish                                        |
| `reset()` / `resetFields()`                               | `void`                      | Restore initial snapshot                                           |
| `clearValidate(names?)` / `scrollToField(name, options?)` | `void`                      | Clear errors / locate a field                                      |
| `loading`                                                 | `Readonly<Ref<boolean>>`    | Submission state                                                   |

The unified ref also contains open/close/next/prev/formMap forwarding for other layouts. They do not perform layout actions in QueryFilter.

## Related components

- Configure table search through [ProTable](./pro-table)'s `search` option.
- Use [LightFilter](./light-filter) for filter labels with popovers.
- Localization, theme, and semantic styling follow [ProForm](./pro-form#configuration-and-styling).
