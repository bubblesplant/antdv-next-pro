---
pageClass: component-doc
---

<script setup>
import EditableProTableDemo from '../../examples/EditableProTableDemo.vue'
</script>

# EditableProTable

`EditableProTable` reuses the `ProTable` column model, editing state machine, and validation logic for workflows where the whole table is one form field. Search, pagination, table options, and focus revalidation are disabled by default.

## When to use

- Use it when users need to add, edit, or delete multiple records continuously and submit the whole table as one controlled value.
- Use it to reuse `ProTable` columns, validation, and slots while disabling browsing-oriented features such as search and pagination by default.
- For editing a single record in a workflow that is still primarily about querying and browsing, use the built-in editing capabilities of `ProTable` instead.

## Examples

### Controlled editing, record creation, and component instance

<ClientOnly>
  <EditableProTableDemo />
</ClientOnly>

<details class="demo-source">
  <summary>View full code</summary>

<<< ../../examples/EditableProTableDemo.vue

</details>

### Controlled data and edit state

`v-model:value` is the only controlled whole-table data entry point; a conflicting `dataSource` prop is not exposed. `defaultValue` supplies uncontrolled initial rows.

```vue
<EditableProTable
  v-model:value="members"
  v-model:editable-keys="editableKeys"
  :columns="columns"
  :editable="{ type: 'multiple', onSave, onDelete }"
  :record-creator-props="recordCreatorProps"
  row-key="id"
/>
```

`editable.type` is `single` or `multiple`. `onSave`, `onCancel`, and `onDelete` may return Promises. Returning `false` from save or delete keeps the current edit/data state. Column-level `editable` can vary by record.

### Validation and lifecycle

Place validation in column `formItemProps.rules`:

```ts
const columns: ProColumns<Member>[] = [
  {
    title: 'Name',
    dataIndex: 'name',
    valueType: 'text',
    formItemProps: {
      rules: [{ required: true, message: 'Enter a name' }],
    },
  },
]

const editable: EditableConfig<Member> = {
  type: 'multiple',
  async onSave(key, record, origin) {
    await api.save(record)
  },
  async onDelete(key, record) {
    await api.remove(record.id)
    return true
  },
}
```

`saveEditable` returns `false` when validation fails. Lifecycle exceptions emit `editable-error`. The component-level `formItemProps` wraps the whole EditableProTable in an Antdv Next FormItem for outer-form integration.

### Creating records {#record-creator-example}

```ts
const recordCreatorProps: RecordCreatorProps<Member> = {
  record: () => ({
    id: crypto.randomUUID(),
    name: '',
  }),
  position: 'bottom',
  parentKey: undefined,
  newRecordType: 'dataSource',
  creatorButtonText: 'Add member',
}
```

| Field               | Description                                                             |
| ------------------- | ----------------------------------------------------------------------- |
| `record`            | Record or factory called for each creation                              |
| `position`          | `top` / `bottom`; defaults to bottom                                    |
| `parentKey`         | Parent for a new tree row                                               |
| `newRecordType`     | `dataSource` writes immediately; `cache` writes after a successful save |
| `creatorButtonText` | Creator button label                                                    |

Every new row must have a unique `rowKey`. `maxLength` counts the flattened tree, hides the button at the limit, and is also enforced by ref-based `addEditRecord`.

### Shared field core and FormItem boundary

EditableProTable does not maintain a separate field map. It reuses the bare-control core from [ProFormFields](/en/components/pro-form-fields) through ProTable. `treeSelect`, `slider`, and `segmented` work in editable columns like existing `valueType` values, while checked fields and async options share the same `v-model`, race, and error behavior.

Column `formItemProps` only provide cell validation and field configuration; they do not create a nested FormItem. Root-level `formItemProps` only wrap the complete EditableProTable in one outer FormItem. Custom editors still use column `renderFormItem` and write drafts through `context.update(value)`.

## API

### Properties {#props}

| Property             | Type                                                                            | Default              | Description and source                                                                                                                                    |
| -------------------- | ------------------------------------------------------------------------------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `value`              | `T[]`                                                                           | —                    | Controlled table rows; accept draft/save/add/delete updates with `v-model:value`.                                                                         |
| `defaultValue`       | `T[]`                                                                           | `[]`                 | Initial uncontrolled rows.                                                                                                                                |
| `recordCreatorProps` | `false \| RecordCreatorProps<T>`                                                | `{}`                 | Creator button and record options; see [record creation](#record-creator). False hides the button.                                                        |
| `maxLength`          | `number`                                                                        | —                    | Maximum rows, including tree descendants; enforced by the button and addEditRecord.                                                                       |
| `formItemProps`      | `Record<string, unknown>`                                                       | —                    | Wraps the entire table in a FormItem; see [FormItem API](https://www.antdv-next.com/components/form#form-item-props). Distinct from column formItemProps. |
| `onValuesChange`     | `(values: T[], changedRecord: T) => void`                                       | —                    | Table-values callback; the same listener channel as values-change.                                                                                        |
| `onTableChange`      | `(pagination: ProTablePagination, filters: ProFilter, sorter: ProSort) => void` | —                    | Table state callback; the same listener channel as table-change.                                                                                          |
| `columns`            | `ProColumns<T>[]`                                                               | `Required`           | See the complete [ProTable column schema](./pro-table#columns).                                                                                           |
| `editable`           | `false \| EditableConfig<T>`                                                    | `{ type: 'single' }` | See every [editable option](./pro-table#editable), including onSave/onDelete/formProps/formRef; false disables editing.                                   |
| `editableKeys`       | `ProKey[]`                                                                      | —                    | Editing row keys via `v-model:editable-keys`; overrides editable.editableKeys.                                                                            |
| `options`            | `false \| ProTableOptions<T>`                                                   | `false`              | Built-in tools are off by default; explicitly enable [ProTable options](./pro-table#options).                                                             |
| `toolbar`            | `false \| ProTableToolbarConfig`                                                | —                    | No implicit toolbar; title/actions/explicit options can show it. See [toolbar](./pro-table#toolbar).                                                      |

All remaining properties inherit the complete [ProTable properties table](./pro-table#props). See [ProColumns](./pro-table#columns) for columns and [antdv-next Table API](https://www.antdv-next.com/components/table) for native properties. Public types omit `dataSource/defaultDataSource/search/pagination`; use `value/defaultValue` for rows. Search and pagination are always disabled internally. `request/params/postData/polling/manualRequest/revalidateOnFocus/rowSelection/columnsState/scroll/size/bordered` retain their ProTable behavior.

### RecordCreatorProps {#record-creator}

| Property            | Type                                           | Default          | Description and source                                                                                                                                            |
| ------------------- | ---------------------------------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `record`            | `T \| ((index: number, dataSource: T[]) => T)` | `Generated key`  | New row or a factory called on each insertion; ensure a unique rowKey.                                                                                            |
| `position`          | `'top' \| 'bottom'`                            | `bottom`         | Creator button and new row position.                                                                                                                              |
| `parentKey`         | `ProKey`                                       | —                | Parent key for a new tree row.                                                                                                                                    |
| `newRecordType`     | `'cache' \| 'dataSource'`                      | `dataSource`     | Cache writes to the model after saving; dataSource inserts immediately.                                                                                           |
| `creatorButtonText` | `VNodeChild`                                   | `Locale`         | Creator label; defaults to localized Add row and can be replaced by the creator-button slot.                                                                      |
| `ButtonProps`       | `Omit<ButtonProps, 'onClick' \| 'position'>`   | `block + dashed` | Other properties pass to the creator [Button](https://www.antdv-next.com/components/button), including disabled/loading/icon/size; the table owns click handling. |

### Events {#events}

| Event                  | Arguments                                                             | Description                                                |
| ---------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------- |
| `update:value`         | `rows: T[]`                                                           | Full row updates, including editing drafts.                |
| `update:editable-keys` | `keys: ProKey[]`                                                      | Editing-key update.                                        |
| `values-change`        | `rows: T[], changedRecord: T`                                         | Table values changed; the same listener as onValuesChange. |
| `table-change`         | `pagination: ProTablePagination, filters: ProFilter, sorter: ProSort` | Table state changed; the same listener as onTableChange.   |
| `request-error`        | `error: unknown`                                                      | Request failed.                                            |
| `editable-error`       | `error: unknown`                                                      | An editing lifecycle callback failed.                      |

`onValuesChange` / `@values-change` and `onTableChange` / `@table-change` are two syntaxes for their respective Vue listener channels; choose one each. Other underlying notifications such as `load`, `selection-change` and `validation-error` follow [ProTable events](./pro-table#events); underlying `change` is adapted as `table-change`.

### Slots {#slots}

| Slot                   | Arguments   | Description and source                                                                                                                                                                              |
| ---------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `creator-button`       | `None`      | Replaces creator-button content.                                                                                                                                                                    |
| `before-table`         | `None`      | Preserves caller content before the optional top creator button.                                                                                                                                    |
| `after-table`          | `None`      | Content after the optional bottom creator button.                                                                                                                                                   |
| `Other ProTable slots` | `Unchanged` | Forwarded unchanged; see [ProTable slots](./pro-table#slots), including toolbar-title/toolbar-actions, dynamic headers/cells and native [Table slots](https://www.antdv-next.com/components/table). |

### EditableProTableInstance {#instance}

| Method                                                                      | Return                                 | Description                                                                             |
| --------------------------------------------------------------------------- | -------------------------------------- | --------------------------------------------------------------------------------------- |
| `getSortFilter()`                                                           | `{ sort: ProSort; filter: ProFilter }` | Reads sorting and filters.                                                              |
| `reload(resetPageIndex?: boolean)`                                          | `Promise<void>`                        | Reloads, optionally resetting the page.                                                 |
| `reset()`                                                                   | `Promise<void>`                        | Resets search, sorting and filters.                                                     |
| `setPageInfo(page: Partial<ProTablePagination>)`                            | `void`                                 | ProTable page-state setter; this component does not render pagination.                  |
| `clearSelected()`                                                           | `void`                                 | Clears selection.                                                                       |
| `fullScreen()`                                                              | `Promise<void>`                        | Toggles fullscreen.                                                                     |
| `scrollTo(target: ProKey \| { key: ProKey } \| { top: number })`            | `void`                                 | Scrolls to a row or pixel offset.                                                       |
| `startEditable(key: ProKey)`                                                | `boolean`                              | Starts row editing.                                                                     |
| `saveEditable(key: ProKey)`                                                 | `Promise<boolean>`                     | Validates and saves; returns false on failure.                                          |
| `cancelEditable(key: ProKey)`                                               | `void`                                 | Cancels and restores original values.                                                   |
| `addEditRecord(record: T, options?: Omit<RecordCreatorProps<T>, 'record'>)` | `boolean`                              | Creates an editable row, respecting maxLength; see [creation options](#record-creator). |
| `getRowData(indexOrKey: number \| ProKey)`                                  | `T \| undefined`                       | Numbers first match an exact rowKey, then a top-level index.                            |
| `getRowsData()`                                                             | `T[]`                                  | Reads all current rows.                                                                 |
| `setRowData(indexOrKey: number \| ProKey, value: Partial<T>)`               | `boolean`                              | Finds a row using the same key/index rules, shallow-merges and updates value.           |

```ts
const editableRef = ref<EditableProTableInstance<Member>>()

editableRef.value?.startEditable(memberId)
const first = editableRef.value?.getRowData(0)
const all = editableRef.value?.getRowsData()
editableRef.value?.setRowData(memberId, { allocation: 100 })
```
