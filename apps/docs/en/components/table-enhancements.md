---
pageClass: component-doc
---

<script setup>
import TableEnhancementsDemo from '../../examples/TableEnhancementsDemo.vue'
</script>

# Table enhancements

DragSortTable, RowEditorTable and CellEditorTable share ProTable schemas, requests, native configuration and semantic styles. They add reordering, row editing and cell editing respectively.

<ClientOnly><TableEnhancementsDemo /></ClientOnly>

<<< ../../examples/TableEnhancementsDemo.vue

## Minimal usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { DragSortTable, type ProColumns } from '@bubblesjs/antdv-next-pro'

type Task = { id: number; title: string }
const rows = ref<Task[]>([
  { id: 1, title: 'Plan work' },
  { id: 2, title: 'Verify changes' },
])
const columns: ProColumns<Task>[] = [{ title: 'Task', dataIndex: 'title' }]
</script>

<template>
  <DragSortTable
    v-model:dataSource="rows"
    row-key="id"
    :columns="columns"
    :search="false"
    :pagination="false"
  />
</template>
```

## DragSortTable {#drag-sort-table}

Uses ProTable record type `T` and request parameter type `P`. Handles support dragging and keyboard Up/Down; controlled parents must accept the reordered array.

### Properties {#drag-props}

| Property                | Type                                                                            | Default             | Description and source                                                                                                                                                     |
| ----------------------- | ------------------------------------------------------------------------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dragSortKey`           | `string`                                                                        | `__dragSort`        | Handle column key or dataIndex; inserts a leading column if missing.                                                                                                       |
| `dragSortHandlerRender` | `(record: T, index: number) => VNodeChild`                                      | `Default drag icon` | Custom handle contents; the outer handle retains drag and keyboard handling.                                                                                               |
| `onDragSortEnd`         | `(beforeIndex: number, afterIndex: number, rows: T[]) => void \| Promise<void>` | —                   | Reorder callback; the same listener channel as drag-sort-end.                                                                                                              |
| `onDataSourceChange`    | `(rows: T[]) => void`                                                           | —                   | Order-change callback; the same listener channel as data-source-change.                                                                                                    |
| `dataSource`            | `T[]`                                                                           | —                   | Controlled rows; accept the reordered full array with v-model:data-source.                                                                                                 |
| `defaultDataSource`     | `T[]`                                                                           | `[]`                | Initial uncontrolled rows.                                                                                                                                                 |
| `Remaining properties`  | `ProTableProps<T, P>`                                                           | `ProTable defaults` | Inherits all [ProTable properties](./pro-table#props) and [columns](./pro-table#columns); see [Table API](https://www.antdv-next.com/components/table) for native options. |

### Events {#drag-events}

| Event / callback        | Arguments                                            | Description and source                                                          |
| ----------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------- |
| `update:data-source`    | `rows: T[]`                                          | Reordered rows for two-way binding.                                             |
| `drag-sort-end`         | `beforeIndex: number, afterIndex: number, rows: T[]` | Same listener as onDragSortEnd; indexes refer to current full-source positions. |
| `data-source-change`    | `rows: T[]`                                          | Same listener as onDataSourceChange; the reordered full array.                  |
| `Other ProTable events` | `Unchanged`                                          | Forwards [ProTable events](./pro-table#events).                                 |

Event indexes are positions in the current source, not permanent database ranks after pagination. Persist changes in the callback; returning a Promise does not enable rollback. The default handle class `ant-pro-table-drag-icon` follows global/component prefixes.

## RowEditorTable {#row-editor-table}

Double-click a row to edit; focus leaving the row triggers validation and save after 150ms. Moving focus within the row does not save. False from editable.onSave or failed validation retains editing.

### Properties {#row-props}

| Property               | Type                               | Default              | Description and source                                                                                                                                                    |
| ---------------------- | ---------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dataSource`           | `T[]`                              | —                    | Alias for value; supports v-model:data-source. Value takes precedence.                                                                                                    |
| `defaultDataSource`    | `T[]`                              | `[]`                 | Alias for defaultValue; defaultValue takes precedence.                                                                                                                    |
| `onRowEditStart`       | `(key: ProKey, record: T) => void` | —                    | Called when editing starts; also accepted as @row-edit-start.                                                                                                             |
| `onRowEditEnd`         | `(key: ProKey, record: T) => void` | —                    | Called after successful save, cancellation or key removal; also @row-edit-end.                                                                                            |
| `editable`             | `false \| EditableConfig<T>`       | `{ type: 'single' }` | All options, including onSave/onCancel/formProps/formRef, follow [editable](./pro-table#editable).                                                                        |
| `recordCreatorProps`   | `false \| RecordCreatorProps<T>`   | `false`              | Creator button is hidden by default; explicitly enable [record creation](./editable-pro-table#record-creator).                                                            |
| `onRow`                | `TableProps<T>['onRow']`           | —                    | Native [Table row bindings](https://www.antdv-next.com/components/table); original handlers run first and may preventDefault to block activation.                         |
| `Remaining properties` | `EditableProTableProps<T, P>`      | `Inherited`          | Inherits [EditableProTable properties](./editable-pro-table#props), including value/defaultValue/editableKeys/maxLength/formItemProps; search/pagination remain disabled. |

### Events and callbacks {#row-events}

| Event / callback                  | Arguments                | Description and source                                      |
| --------------------------------- | ------------------------ | ----------------------------------------------------------- |
| `update:data-source`              | `rows: T[]`              | Row-value changes for the dataSource alias.                 |
| `update:editable-keys`            | `keys: ProKey[]`         | Controlled editing-key updates.                             |
| `row-edit-start / onRowEditStart` | `key: ProKey, record: T` | Entered editing automatically or through a ref method.      |
| `row-edit-end / onRowEditEnd`     | `key: ProKey, record: T` | Successful save, cancellation or editing-key removal.       |
| `Other EditableProTable events`   | `Unchanged`              | See [EditableProTable events](./editable-pro-table#events). |

`onRowEditStart` and `@row-edit-start` (and the corresponding end forms) are the same Vue listener; choose one syntax.

## CellEditorTable {#cell-editor-table}

Double-click an editable cell to show its input; leaving the cell saves after 150ms. Switching first saves the current cell, and failed validation blocks switching.

### Properties {#cell-props}

| Property           | Type                                                     | Default                 | Description and source                                                                                                                                          |
| ------------------ | -------------------------------------------------------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| All properties     | `CellEditorTableProps<T, P> = RowEditorTableProps<T, P>` | RowEditorTable defaults | Adds no properties; see [RowEditorTable properties](#row-props) and [EditableProTable properties](./editable-pro-table#props).                                  |
| `columns[].onCell` | `TableColumnType<T>['onCell']`                           | —                       | Native [Column bindings](https://www.antdv-next.com/components/table); the original double-click handler runs first and may preventDefault to block activation. |

### Events and callbacks {#cell-events}

| Event / callback                  | Arguments                | Description and source                                      |
| --------------------------------- | ------------------------ | ----------------------------------------------------------- |
| `update:data-source`              | `rows: T[]`              | Row-value changes for the dataSource alias.                 |
| `update:editable-keys`            | `keys: ProKey[]`         | Controlled editing-key updates.                             |
| `row-edit-start / onRowEditStart` | `key: ProKey, record: T` | Entered editing automatically or through a ref method.      |
| `row-edit-end / onRowEditEnd`     | `key: ProKey, record: T` | Successful save, cancellation or editing-key removal.       |
| `Other EditableProTable events`   | `Unchanged`              | See [EditableProTable events](./editable-pro-table#events). |

`readonly`, `editable=false`, and `valueType="option"` columns cannot be edited. Ref method `startEditable(key)` selects the first editable field in the row.

## Slots {#slots}

| Component                            | Slots and arguments                                                                                                                                           |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DragSortTable`                      | Forwards [all ProTable slots](./pro-table#slots), including toolbar-actions, dynamic headers/cells, before-table/after-table and native slots; adds no slots. |
| `RowEditorTable` / `CellEditorTable` | Forwards [all EditableProTable slots](./editable-pro-table#slots), including creator-button and all ProTable slots; adds no slots.                            |

## Instance {#instance}

| Component / method                   | Return                | Behavior and source                                                                                                            |
| ------------------------------------ | --------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `DragSortTable`                      | `ProTableInstance<T>` | Inherits [all ProTable methods](./pro-table#instance); adds no methods.                                                        |
| `RowEditorTable` / `CellEditorTable` | `ProTableInstance<T>` | See [all ProTable methods and arguments](./pro-table#instance); the three methods below also coordinate editing notifications. |
| `startEditable(key: ProKey)`         | `boolean`             | Starts row/first-cell editing and calls onRowEditStart.                                                                        |
| `saveEditable(key: ProKey)`          | `Promise<boolean>`    | Validates and saves; success calls onRowEditEnd, failure retains editing.                                                      |
| `cancelEditable(key: ProKey)`        | `void`                | Cancels, restores and calls onRowEditEnd.                                                                                      |

## Configuration and styling

`prefixCls/classes/styles` and native theme follow [ProTable](./pro-table#props); see [ProConfigProvider](./pro-config-provider) for extension tokens, locale and RTL. Full signatures and native property links for render/formItemRender/fieldProps/formItemProps are listed in [ProColumns](./pro-table#columns).

The 150ms delay buffers focus changes. Return the real network Promise from `editable.onSave`. Cross-page sorting and server ranks remain application responsibilities.
