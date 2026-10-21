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
import { ProDescriptions, type ProDescriptionsColumn } from '@bubblesjs/antv-next-pro'

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

| Prop                               | Behavior                                                                                      |
| ---------------------------------- | --------------------------------------------------------------------------------------------- |
| `columns`                          | `ProDescriptionsColumn<T>[]`, one entry per field                                             |
| `dataSource`                       | A single object T                                                                             |
| `request`                          | `(params: P) => Promise<{ data: T; success?: boolean }>`; runs on mount and parameter changes |
| `params`                           | Request parameters; stale responses do not overwrite newer results                            |
| `loading`                          | Explicit override for the request loading state                                               |
| `title` / `tooltip` / `extra`      | Heading, heading tooltip and additional content                                               |
| `editable`                         | false or EditableConfig; editing defaults to one field at a time                              |
| `formProps`                        | Native editing Form props; merged with editable.formProps, which takes precedence             |
| `formRef` / `editable.formRef`     | `Ref<FormInstance \| undefined>`, the actual native editing form                              |
| `actionRef`                        | `Ref<ProDescriptionsInstance<T> \| undefined>`; component ref is also supported               |
| `emptyText`                        | Empty field placeholder                                                                       |
| Native Descriptions props          | bordered, column, size, layout and other native layout props                                  |
| `prefixCls` / `classes` / `styles` | Public prefix and semantic styles                                                             |

| Column prop                              | Behavior                                                                                  |
| ---------------------------------------- | ----------------------------------------------------------------------------------------- |
| `key` / `dataIndex`                      | Field editing identifier uses key, otherwise a derived dataIndex; nested paths use arrays |
| `title` / `label`                        | A node or `(column) => VNodeChild`; label is the fallback                                 |
| `span` / `order`                         | Native item span; higher order values come first                                          |
| `hide` / `hideInDescriptions`            | Hide a field                                                                              |
| `valueType` / `valueEnum` / `fieldProps` | Shared ProField display, editing and formatting                                           |
| `request` / `params`                     | Field option requests, separate from the record request                                   |
| `readonly` / `editable`                  | Block editing; editable also accepts `(record, index) => boolean`                         |
| `formItemProps`                          | Native validation rules and field item props                                              |
| `renderText`                             | `(value, record, index, action) => unknown`                                               |
| `render`                                 | `(dom, record, index, action, schema) => VNodeChild`                                      |
| `formItemRender`                         | `(schema, context, form) => VNodeChild`; form is the native FormInstance                  |

The custom input context contains record, index, column, editable, isEditable, recordKey, type="descriptions", dependencies, defaultRender() and update(value). Call update from custom inputs to update the draft. Legacy renderFormItem(schema, context) remains compatible.

## Editing and events

Editable type single allows one field at a time; multiple allows concurrent fields. When editableKeys is controlled, accept new keys in editable.onChange(keys, rows).

Saving validates and merges only the active field. Other field drafts are isolated. Editable onSave(key, next, origin) may return a Promise; false or validation failure keeps editing open. Cancel restores the current field and calls onCancel. Readonly or explicitly non-editable fields cannot enter editing.

| Event/callback                          | Behavior                                                                            |
| --------------------------------------- | ----------------------------------------------------------------------------------- |
| `dataSourceChange(data)`                | Full record after a successful field save; the caller persists and updates its data |
| `requestError(error)`                   | Record request failure                                                              |
| `editableError(error)`                  | Validation or editing callback errors                                               |
| `onLoadingChange(loading)`              | Record request loading changes                                                      |
| `editable.onValuesChange(record, rows)` | Draft changes                                                                       |

## Slots and ref

| Slot                 | Scope and purpose                                                |
| -------------------- | ---------------------------------------------------------------- |
| `title` / `extra`    | Replace the heading or additional content                        |
| `field-${columnKey}` | `{ record, column }`, replaces the read view of that field       |
| Default              | Append native ProDescriptions.Item / ProDescriptionsItem entries |

ProDescriptions.Item and the named ProDescriptionsItem export are native DescriptionsItem components. Native items in the default slot do not become editable schema fields automatically.

| Method                                    | Behavior                                                             |
| ----------------------------------------- | -------------------------------------------------------------------- |
| `reload(): Promise<void>`                 | Request using current params                                         |
| `getData()` / `dataSource`                | Read the current record                                              |
| `setDataSource(data)`                     | Replace internal data and draft; undefined resets to an empty object |
| `startEditable(key): boolean`             | Start field editing using the column identifier                      |
| `saveEditable(key): Promise<boolean>`     | Validate and save a field                                            |
| `cancelEditable(key)` / `isEditable(key)` | Cancel or inspect field editing                                      |

## Styling and configuration

Classes/styles accept maps or `({ props }) => map` and are forwarded to native Descriptions. Part names follow its semantic styling API. Legacy classNames is compatible; classes wins for matching parts.

The public class defaults to ant-pro-descriptions, or demo-pro-descriptions when native ConfigProvider uses prefixCls="demo". The component prefixCls overrides it. Locale, direction, theme algorithms and native component tokens follow ConfigProvider; configure extension tokens through [ProConfigProvider](./pro-config-provider).

## FieldRender

FieldRender is also available as a named export for composing a single description field. It accepts text, entity (the entire record), action (ProDescriptionsInstance), dataIndex, index, mode, valueType, valueEnum, fieldProps, request, params, dependencies and the rendering callbacks above. Form supplies the native form to custom editing; emptyText sets the placeholder.

Updates emit update:text; field option request errors call onFieldRequestError(error). FieldRender does not create a form or save records. It has no additional slots or instance methods and uses ProField for default rendering.
