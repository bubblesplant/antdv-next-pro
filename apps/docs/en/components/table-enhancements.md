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
import { DragSortTable, type ProColumns } from '@bubblesjs/antv-next-pro'

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

## DragSortTable

Extends [ProTable](./pro-table) props and exposes ProTableInstance. Generic parameters are record type T and request parameter type P.

| Prop/event                                   | Behavior                                                                               |
| -------------------------------------------- | -------------------------------------------------------------------------------------- |
| `dragSortKey`                                | Handle column key or dataIndex, default __dragSort; a missing column is inserted first |
| `dragSortHandlerRender`                      | `(record, index) => VNodeChild`, custom handle content                                 |
| `v-model:dataSource`                         | Controlled rows; the parent must accept the reordered array                            |
| `defaultDataSource`                          | Uncontrolled initial rows                                                              |
| `dragSortEnd(beforeIndex, afterIndex, rows)` | Reorder notification with the resulting full row array                                 |
| `dataSourceChange(rows)`                     | Data order notification                                                                |

Handles support drag and keyboard Up/Down. Event indexes refer to positions in the current data source; they are not permanent database ranks. Controlled mode waits for parent acceptance. Persist changes in your event handler; returning a Promise does not provide automatic rollback.

The default handle class is ant-pro-table-drag-icon and follows the global or component prefix.

## RowEditorTable

Extends [EditableProTable](./editable-pro-table). Double-click a row to edit it. Focus leaving the row schedules validation and save after 150ms; moving focus inside the same row does not save. Editable type defaults to single and the record creator button defaults to false; explicit settings override these defaults.

| Prop/event                    | Behavior                                                                                                |
| ----------------------------- | ------------------------------------------------------------------------------------------------------- |
| `editable`                    | Validation, onSave, onCancel, editableKeys, native formRef and other editing settings                   |
| `onRowEditStart(key, record)` | Called on entry to editing                                                                              |
| `onRowEditEnd(key, record)`   | Called after successful save, cancellation or key removal                                               |
| `onRow`                       | Native row bindings; the original double-click handler runs first, and preventDefault blocks activation |
| `v-model:editableKeys`        | Controlled editing key updates                                                                          |

False from editable.onSave or failed validation keeps the row open. Editable formRef receives the actual native FormInstance. DataSource, value and editing result conventions follow EditableProTable.

## CellEditorTable

Extends RowEditorTable configuration and callbacks. Double-click an editable cell to show its input. Focus leaving the cell saves after 150ms. Activating another cell first saves the current edit; failed validation prevents switching.

Readonly, editable=false and option columns cannot be edited. The original column.onCell double-click callback runs first and may preventDefault to block activation. Calling startEditable(key) selects the first editable field in that row.

## Slots, ref and styles

All three forward table slots and ProTableInstance methods for requests, data, pagination, selection and editing, including startEditable, saveEditable and cancelEditable. Row/Cell instance editing methods also maintain their editing lifecycle callbacks.

Column render uses `(dom, record, index, action, schema)`. Custom editing uses formItemRender(schema, context, nativeForm), with native Form validation.

PrefixCls, classes and styles follow ProTable/EditableProTable. Classes/styles accept a map or `({ props }) => map`; legacy classNames remains compatible. Locale, RTL, native theme and Pro extension tokens follow [ProConfigProvider](./pro-config-provider) conventions.

## Boundaries

Automatic Row/Cell editing relies on double-click and focus departure; use instance methods for explicit editing controls. The 150ms delay buffers focus changes, not network completion. Return the real save Promise from editable.onSave. DragSortTable reorders current data; cross-page remote ranking belongs to application logic.
