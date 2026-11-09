---
pageClass: component-doc
---

<script setup>
import ProDescriptionsDemo from '../../examples/ProDescriptionsDemo.vue'
</script>

# ProDescriptions

Display a single record with table-compatible field schemas, formatting, requests and field editing. Layout props follow the native antdv-next Descriptions component.

<ClientOnly><ProDescriptionsDemo /></ClientOnly>

<<< ../../examples/ProDescriptionsDemo.vue

## Minimal usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ProDescriptions, type ProDescriptionsColumn } from '@bubblesjs/antdv-next-pro'

type Profile = { name: string; status: string }
const profile = ref<Profile>({ name: 'Alex', status: 'active' })
const columns: ProDescriptionsColumn<Profile>[] = [
  { title: 'Name', dataIndex: 'name', formItemProps: { rules: [{ required: true }] } },
  {
    title: 'Status',
    dataIndex: 'status',
    valueType: 'select',
    valueEnum: { active: 'Active', inactive: 'Inactive' },
  },
]
</script>

<template>
  <ProDescriptions
    title="Profile"
    :columns="columns"
    :data-source="profile"
    :editable="{ type: 'single' }"
    @data-source-change="profile = $event"
  />
</template>
```

## API

### Props {#props}

| Property             | Type                                                     | Default                | Description / source                                                                                                                                |
| -------------------- | -------------------------------------------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `columns`            | `ProDescriptionsColumn<T>[]`                             | `[]`                   | Field schemas; see [columns](#columns).                                                                                                             |
| `dataSource`         | `T`                                                      | `{}`                   | One record; saved values are reported through dataSourceChange.                                                                                     |
| `request`            | `(params: P) => Promise<{ data: T; success?: boolean }>` | —                      | Runs on mount and request/params changes; latest response wins; success=false retains data.                                                         |
| `params`             | `P`                                                      | `{}`                   | Top-level record request parameters.                                                                                                                |
| `loading`            | `boolean`                                                | —                      | Explicit override for the internal request-loading state passed to Spin.                                                                            |
| `title`              | `VNodeChild`                                             | —                      | Heading; the title slot takes precedence.                                                                                                           |
| `tooltip`            | `string \| TooltipProps`                                 | —                      | Title tooltip; native [Tooltip props](https://www.antdv-next.com/components/tooltip).                                                               |
| `extra`              | `VNodeChild`                                             | —                      | Extra region; the extra slot takes precedence.                                                                                                      |
| `editable`           | `false \| EditableConfig<T>`                             | —                      | Enables per-field editing; see the [consumed editable options](#editable).                                                                          |
| `formProps`          | `FormProps`                                              | —                      | Native editing [Form props](https://www.antdv-next.com/components/form); editable.formProps overrides matching keys; the internal draft owns model. |
| `formRef`            | `Ref<FormInstance \| undefined>`                         | —                      | Receives the actual native [FormInstance](https://www.antdv-next.com/components/form), not ProFormInstance.                                         |
| `actionRef`          | `Ref<ProDescriptionsInstance<T> \| undefined>`           | —                      | Receives this component’s [instance](#instance), also available through ref.                                                                        |
| `emptyText`          | `VNodeChild`                                             | —                      | Empty-value placeholder passed to ProField.                                                                                                         |
| `prefixCls`          | `string`                                                 | `ant-pro-descriptions` | Full public prefix, inherited from Pro/native configuration.                                                                                        |
| `classes`            | `SemanticClasses \| ({ props }) => SemanticClasses`      | —                      | Native Descriptions semantic classes, overriding classNames.                                                                                        |
| `classNames`         | `SemanticClasses \| ({ props }) => SemanticClasses`      | —                      | Legacy semantic classes.                                                                                                                            |
| `styles`             | `SemanticStyles \| ({ props }) => SemanticStyles`        | —                      | Native Descriptions semantic styles; content defaults to minWidth=0.                                                                                |
| `onLoadingChange`    | `(loading: boolean) => void`                             | —                      | Internal request loading callback.                                                                                                                  |
| `onRequestError`     | `(error: unknown) => void`                               | —                      | Top-level request failure; equivalent to the requestError listener.                                                                                 |
| `onDataSourceChange` | `(data: T) => void`                                      | —                      | Full record after a field saves; equivalent to dataSourceChange.                                                                                    |
| `onEditableError`    | `(error: unknown) => void`                               | —                      | Validation/save/cancel errors; equivalent to editableError.                                                                                         |

Other [Descriptions props](https://www.antdv-next.com/components/descriptions), such as bordered, column, size, layout, colon and labelStyle/contentStyle, are forwarded. The public type replaces items/title/extra/prefixCls/classes/styles; use columns and the entries above.

### Columns {#columns}

| Property              | Type                                                                   | Default | Description / source                                                                                                                         |
| --------------------- | ---------------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `key`                 | `ProKey`                                                               | —       | Editing identity; overrides the identity derived from dataIndex.                                                                             |
| `dataIndex`           | `ProDataIndex`                                                         | —       | Record field path; use arrays for nested fields.                                                                                             |
| `title`               | `VNodeChild \| ((column) => VNodeChild)`                               | —       | Field label; falls back to label.                                                                                                            |
| `label`               | `VNodeChild`                                                           | —       | Fallback for title.                                                                                                                          |
| `span`                | `DescriptionsItemProps['span']`                                        | —       | Native [Descriptions.Item span](https://www.antdv-next.com/components/descriptions).                                                         |
| `order`               | `number`                                                               | `0`     | Descending sort; larger values appear first.                                                                                                 |
| `hide`                | `boolean`                                                              | `false` | Hides the field.                                                                                                                             |
| `hideInDescriptions`  | `boolean`                                                              | `false` | Hides the description item.                                                                                                                  |
| `valueType`           | `ProColumnValueType<T>`                                                | `text`  | Passed to [ProField](./pro-field#props); supports dynamic record/index resolution.                                                           |
| `valueEnum`           | `ProValueEnum \| (() => ProValueEnum)`                                 | —       | Enumeration labels and options; see [ProField](./pro-field#props).                                                                           |
| `fieldProps`          | `Record<string, unknown> \| ((record?: T) => Record<string, unknown>)` | —       | Passed to the [valueType input](./pro-form-fields#props); functions receive the current record.                                              |
| `request`             | `(params?) => Promise<Record<string, unknown>[]>`                      | —       | Field-option request, distinct from the top-level record request.                                                                            |
| `onFieldRequestError` | `(error: unknown) => void`                                             | —       | Field-option request failure.                                                                                                                |
| `params`              | `Record<string, unknown>`                                              | `{}`    | Field-option request parameters.                                                                                                             |
| `dependencies`        | `ProDataIndex[]`                                                       | —       | Merges dependency values into option-request params; custom edit context also receives dependency values.                                    |
| `copyable`            | `boolean`                                                              | `false` | Read-view copy behavior from ProField.                                                                                                       |
| `ellipsis`            | `TableColumnType<T>['ellipsis']`                                       | —       | Read-view ellipsis behavior from ProField.                                                                                                   |
| `readonly`            | `boolean`                                                              | `false` | Prevents entering the editing workflow.                                                                                                      |
| `editable`            | `boolean \| ((record: T, index: number) => boolean)`                   | `true`  | Field-level permission when top-level editable is enabled.                                                                                   |
| `mode`                | `'read' \| 'edit' \| 'update'`                                         | `read`  | Passed to FieldRender; the editing workflow overrides it with edit.                                                                          |
| `plain`               | `boolean`                                                              | `false` | Retained shared-type field; not consumed by this component.                                                                                  |
| `formItemProps`       | `Record<string, unknown> \| ((record?: T) => Record<string, unknown>)` | —       | Editing [FormItem props](https://www.antdv-next.com/components/form); functions receive the draft; the component owns name and marginBottom. |
| `renderText`          | `(value, record, index, action) => unknown`                            | —       | Transforms the value before default rendering.                                                                                               |
| `render`              | `(dom, record, index, action, schema) => VNodeChild`                   | —       | Custom read view; dom is the default ProField node.                                                                                          |
| `formItemRender`      | `(schema, context, form: FormInstance \| undefined) => VNodeChild`     | —       | Custom edit view; call context.update(value) to update the draft.                                                                            |
| `renderFormItem`      | `(schema, context) => VNodeChild`                                      | —       | Legacy fallback; formItemRender takes precedence.                                                                                            |

The type inherits [ProColumns](./pro-table#columns). Table-only entries (width/minWidth/fixed/align/sorter/filters/hideInTable/hideInSearch/hideInForm/search/colSize), nested columns/children, initialValue, convertValue and transform are not processed by this description renderer. Configure the native form or a custom renderer when needed.

The edit context contains `record/index/column/editable/isEditable/recordKey/type="descriptions"/dependencies/defaultRender()/update(value)`. `form` is the actual native FormInstance.

### Editable configuration {#editable}

| Property         | Type                                                                       | Default  | Description / source                                                                                                  |
| ---------------- | -------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------- |
| `type`           | `'single' \| 'multiple'`                                                   | `single` | Allows one or multiple fields to be edited.                                                                           |
| `editableKeys`   | `ProKey[]`                                                                 | —        | Controlled editing keys; update them in onChange.                                                                     |
| `onChange`       | `(keys: ProKey[], rows: T[]) => void`                                      | —        | Editing keys changed; rows contains the single full draft.                                                            |
| `onValuesChange` | `(record: T, rows: T[]) => void`                                           | —        | Draft update; rows=[record].                                                                                          |
| `onSave`         | `(key, next: T, origin: T) => void \| boolean \| Promise<void \| boolean>` | —        | Validates and merges only this field; false or errors retain editing.                                                 |
| `onCancel`       | `(key, draft: T, origin: T) => void \| Promise<void>`                      | —        | Cancels a field and restores its original value.                                                                      |
| `formProps`      | `FormProps`                                                                | —        | Native [Form](https://www.antdv-next.com/components/form) props, overriding top-level formProps; internal model wins. |
| `formRef`        | `Ref<FormInstance \| undefined>`                                           | —        | Receives the actual native form, like top-level formRef.                                                              |

The shared EditableConfig type also contains table-only onDelete/actionRender/form and action-text/alert options. ProDescriptions does not consume them; its save/cancel buttons use Pro locale text. Save validates only the current field. onSave=false or validation errors keep editing active; controlled keys still require parent updates.

### Events and callbacks {#events}

| Event / callback     | Parameters                  | Description                                            |
| -------------------- | --------------------------- | ------------------------------------------------------ |
| `dataSourceChange`   | `(data: T)`                 | Saved full record; persist/update it in the caller.    |
| `requestError`       | `(error: unknown)`          | Top-level request error.                               |
| `editableError`      | `(error: unknown)`          | Validation/save/cancel errors.                         |
| `onLoadingChange`    | `(loading: boolean)`        | Internal request loading transition.                   |
| `editable` callbacks | [Editable table](#editable) | Editing keys, draft changes and save/cancel lifecycle. |

### Slots {#slots}

| Slot                 | Scope                                             | Description                                                |
| -------------------- | ------------------------------------------------- | ---------------------------------------------------------- |
| `title`              | —                                                 | Overrides title; tooltip still renders.                    |
| `extra`              | —                                                 | Overrides extra.                                           |
| `field-${columnKey}` | `{ record: T, column: ProDescriptionsColumn<T> }` | Read-only region; key derives from key/dataIndex.          |
| `default`            | —                                                 | Appends native ProDescriptions.Item / ProDescriptionsItem. |

### Instance {#instance}

| Member                | Parameters / return            | Description                                              |
| --------------------- | ------------------------------ | -------------------------------------------------------- |
| `reload()`            | `() => Promise<void>`          | Requests using current params.                           |
| `getData()`           | `() => T`                      | Current full record.                                     |
| `dataSource`          | `readonly T \| undefined`      | Current record getter.                                   |
| `setDataSource(data)` | `(T \| undefined) => void`     | Replaces record and draft; undefined becomes {}.         |
| `startEditable(key)`  | `(ProKey) => boolean`          | Starts editing when permitted.                           |
| `saveEditable(key)`   | `(ProKey) => Promise<boolean>` | Validates/saves the field; false when blocked or failed. |
| `cancelEditable(key)` | `(ProKey) => void`             | Restores this field and exits editing.                   |
| `isEditable(key)`     | `(ProKey) => boolean`          | Tests editing state.                                     |

### Native item member {#item}

`ProDescriptions.Item` and `ProDescriptionsItem` alias [native Descriptions.Item](https://www.antdv-next.com/components/descriptions). Its key/label/children/span and native slots follow that API; it adds no Pro-specific events or instance methods. Default-slot native items do not become editable schema fields.

### FieldRender {#field-render}

| Property    | Type                         | Default    | Description / source                             |
| ----------- | ---------------------------- | ---------- | ------------------------------------------------ |
| `entity`    | `T`                          | `required` | Current complete record.                         |
| `action`    | `ProDescriptionsInstance<T>` | `required` | Description instance passed to render callbacks. |
| `text`      | `unknown`                    | —          | Current field value; supports v-model:text.      |
| `index`     | `number`                     | `0`        | Current field index.                             |
| `form`      | `FormInstance`               | —          | Native form passed to a custom edit renderer.    |
| `emptyText` | `VNodeChild`                 | —          | Empty-value placeholder for ProField.            |

| Forwarded property                                                                                                                                                                | Type / source                                                 | Behavior                                                                        |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `dataIndex / title / label`                                                                                                                                                       | [Column definitions](#columns)                                | Schema identity/labels passed to render callbacks.                              |
| `valueType / valueEnum / request / params / dependencies / fieldProps / renderText / render / formItemRender / renderFormItem / copyable / ellipsis / mode / onFieldRequestError` | [Column definitions](#columns)                                | Same signatures and defaults as above; mode defaults to read.                   |
| `formItemProps`                                                                                                                                                                   | [Native FormItem](https://www.antdv-next.com/components/form) | Included in callback schema; standalone FieldRender does not create a FormItem. |

| Event / callback      | Parameters         | Behavior                                    |
| --------------------- | ------------------ | ------------------------------------------- |
| `update:text`         | `(value: unknown)` | Writes back custom/default editing changes. |
| `onFieldRequestError` | `(error: unknown)` | Option-request failure.                     |

FieldRender exposes no slots or instance methods. It does not create a form or save data. Native [Descriptions semantic parts](https://www.antdv-next.com/components/descriptions) define classes/styles; Pro tokens use [ProConfigProvider](./pro-config-provider#props).
