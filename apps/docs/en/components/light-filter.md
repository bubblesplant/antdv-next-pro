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

### Props {#props}

Without columns this composes fields; with columns it uses BetaSchemaForm.

| Entry                                 | Type                 | Owner and documentation                                                                                                                                                                    |
| ------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Shared ProForm props                  | `ProFormProps<T>`    | initialValues/request/params/readonly/disabled/dateFormatter/syncToUrl/syncToInitialValues/onValuesChange/formRef/prefixCls/classes/classNames/styles: [ProForm props](./pro-form#props)   |
| Native Form props in composition mode | `FormProps`          | Put these directly on LightFilter; [Form API](https://www.antdv-next.com/components/form)                                                                                                  |
| `formProps` with columns              | `Partial<FormProps>` | Inner [native Form](https://www.antdv-next.com/components/form); see [SchemaForm props](./schema-form#props). Model, submission, readonly and filter layout are coordinated by the wrapper |
| Other schema configuration            | `SchemaFormProps<T>` | [SchemaForm props](./schema-form#props); fieldProps/formItemProps recipients follow [field API](./pro-form-fields#props)                                                                   |

| Prop              | Type                                                         | Default               | Description / source                                               |
| ----------------- | ------------------------------------------------------------ | --------------------- | ------------------------------------------------------------------ |
| `modelValue`      | `Partial<T>`                                                 | —                     | Current v-model values                                             |
| `columns`         | `SchemaFormColumn<T>[]`                                      | —                     | Enables schema mode; [columns](./schema-form#columns)              |
| `onFinish`        | `(values: T) => boolean \| void \| Promise<boolean \| void>` | —                     | Awaitable query on confirm/clear; use :on-finish                   |
| `collapse`        | `boolean`                                                    | `false`               | Collect every field in More                                        |
| `collapseLabel`   | `VNodeChild`                                                 | Localized More        | More entry label                                                   |
| `placement`       | `PopoverProps['placement']`                                  | `'bottomLeft'`        | [Popover placement](https://www.antdv-next.com/components/popover) |
| `footerRender`    | `false \| ({ confirm, clear }, doms) => VNodeChild`          | Confirm/clear buttons | Customize popover actions; false hides them                        |
| Field `secondary` | `boolean`                                                    | `false`               | Set on a child or schema column to put it under More               |

collapse groups fields, independently of QueryFilter's v-model:collapsed. Confirm validates and submits, cancel restores the opening snapshot, and clear removes conditions before submitting. Values change during editing; queries run on confirm/clear. LightFilter uses footerRender for popover actions. Shared [submitter configuration](./pro-form#submitter) does not replace those actions.

### Events {#events}

| Event               | Arguments                                 | Description                                                           |
| ------------------- | ----------------------------------------- | --------------------------------------------------------------------- |
| `update:modelValue` | `values: Partial<T>`                      | Controlled values, including unconfirmed edits                        |
| `change`            | `values: Partial<T>`                      | Conditions changed                                                    |
| `submit`            | `values: Partial<T>`                      | Notification; use onFinish to await results                           |
| `reset`             | `values: Partial<T>`                      | Initial snapshot restored                                             |
| `error`             | `error: unknown`                          | Validation/submission failure                                         |
| `requestError`      | `error: unknown`                          | Initialization request failed                                         |
| Schema-only events  | [SchemaForm events](./schema-form#events) | With columns, valuesChange/fieldChange/finish follow SchemaForm rules |

### Slots {#slots}

| Slot                        | Scope                                   | Description                                    |
| --------------------------- | --------------------------------------- | ---------------------------------------------- |
| `default`                   | None                                    | Composition fields                             |
| Dynamic fields with columns | [SchemaForm scope](./schema-form#slots) | field-path, path and column-key render entries |

Use footerRender for popover actions; LightFilter does not render a submitter-slot action area. See [LightWrapper](#light-wrapper) for the individual popover label slot.

### Instance methods {#instance}

The exported ref is SchemaFormInstance. Complete signatures follow [SchemaForm](./schema-form#instance) and [ProForm](./pro-form#instance).

| Member                                                    | Returns                     | Description                                                        |
| --------------------------------------------------------- | --------------------------- | ------------------------------------------------------------------ |
| `nativeForm`                                              | `FormInstance \| undefined` | [Native Form instance](https://www.antdv-next.com/components/form) |
| `validate()` / `validateFields(names?)`                   | `Promise<Partial<T>>`       | Validate raw values                                                |
| `validateFieldsReturnFormatValue(names?)`                 | `Promise<Partial<T>>`       | Validate formatted values                                          |
| `getFieldsValue()` / `getFieldValue(name)`                | `Partial<T>` / `unknown`    | Raw values                                                         |
| `getFieldsFormatValue()` / `getFieldFormatValue(name)`    | `Partial<T>` / `unknown`    | Formatted/transformed output                                       |
| `setFieldsValue(values)` / `setFieldValue(name, value)`   | `void`                      | Update values                                                      |
| `submit()`                                                | `Promise<Partial<T>>`       | Validate and await the query                                       |
| `reset()` / `resetFields()`                               | `void`                      | Restore all initial conditions                                     |
| `clearValidate(names?)` / `scrollToField(name, options?)` | `void`                      | Clear errors / locate a field                                      |
| `loading`                                                 | `Readonly<Ref<boolean>>`    | Submission state                                                   |

The unified ref also contains open/close/next/prev/formMap for other layouts. Individual filter popovers use LightWrapper.open instead.

## LightWrapper {#light-wrapper}

The root export is a filter popover using the nearest ProForm context. It reads name/fieldNames, captures an opening snapshot and restores it on cancel. Place standalone usage inside ProForm.

### Props

| Prop           | Type                               | Default        | Description / source                                                                                                                               |
| -------------- | ---------------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`         | `ProDataIndex`                     | —              | Single form path                                                                                                                                   |
| `fieldNames`   | `ProDataIndex[]`                   | —              | Group paths; takes precedence over name                                                                                                            |
| `label`        | `VNodeChild`                       | Empty          | Trigger label; label slot wins                                                                                                                     |
| `disabled`     | `boolean`                          | `false`        | Disable trigger; also inherits form disabled                                                                                                       |
| `open`         | `boolean`                          | Uncontrolled   | v-model:open state                                                                                                                                 |
| `placement`    | `PopoverProps['placement']`        | `'bottomLeft'` | [Popover position](https://www.antdv-next.com/components/popover)                                                                                  |
| `footerRender` | [LightFilter.footerRender](#props) | Confirm/clear  | Footer customization                                                                                                                               |
| Other attrs    | `PopoverProps` / HTML attrs        | Native         | Forwarded to [Popover](https://www.antdv-next.com/components/popover); trigger/open/placement and opening listeners are coordinated by the wrapper |

### Events and slots

| Kind  | Name          | Arguments / purpose                                                                         |
| ----- | ------------- | ------------------------------------------------------------------------------------------- |
| Event | `update:open` | `(open: boolean)` controlled update                                                         |
| Event | `confirm`     | `(value: unknown)` after successful validation/submission; grouped fields produce an object |
| Event | `clear`       | No arguments; fields cleared, then query submitted                                          |
| Slot  | `default`     | No scope; popover fields                                                                    |
| Slot  | `label`       | `{ value }` custom trigger label                                                            |

LightWrapper exposes no instance methods. Use footerRender for confirm/clear and v-model:open for visibility. Its displayed value comes from form context; it has no standalone value/allowClear props.

## Related components

- Use [QueryFilter](./query-filter) for a grid search form.
- Configure table filters with [ProTable](./pro-table)'s `search.filterType='light'`.
- Localization, theme, and semantic styling follow [ProForm](./pro-form#configuration-and-styling).
