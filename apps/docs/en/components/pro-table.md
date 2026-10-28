---
pageClass: component-doc
---

<script setup>
import ProTableDemo from '../../examples/ProTableDemo.vue'
</script>

# ProTable

`ProTable` targets search and browsing workflows while coordinating local/remote data, search, pagination, sorting, filters, column state, selection, and row editing.

## When to use

Use it when a page needs to organize querying, data loading, pagination, column settings, selection, or row editing around a table.

## Examples

### Request, editing, and slots

<ClientOnly>
  <ProTableDemo />
</ClientOnly>

<details class="demo-source">
<summary>View source</summary>

<<< ../../examples/ProTableDemo.vue

</details>

### Data modes

Pass `dataSource` or `defaultDataSource` for local mode. Search, sorting, filters, and pagination operate on the local rows:

```vue
<ProTable
  v-model:data-source="rows"
  :columns="columns"
  row-key="id"
  :pagination="{ defaultPageSize: 20 }"
/>
```

Remote mode uses one fixed request contract:

```ts
import type { ProRequest } from '@bubblesjs/antdv-next-pro'

const request: ProRequest<User, Query> = async (params, sort, filter) => {
  const result = await api.list({ ...params, sort, filter })
  return {
    data: result.items,
    total: result.total,
    success: true,
  }
}
```

Search, pagination, sorting, filters, and external `params` all feed this request. Only the most recently started concurrent request may update the table. A thrown error preserves current rows, ends loading, and emits `request-error`. A result with `success: false` is ignored.

`manualRequest` skips the initial request; call `reload()` through the component ref later. `postData` synchronously transforms successful data before display.

### Search and collapse

The default collapse button follows ProComponents: it reuses a single down arrow, rotating it half a turn when expanded with a 0.3-second transition. Labels come from the locale or `localeText`. Use `search.collapseRender` to customize its content, or set it to `false` to hide the button.

`search: false` disables the search area. A column with `dataIndex` becomes searchable unless `hideInSearch` or `search: false` is set. `search.transform` can map one field to different request parameters.

```ts
const columns = [
  {
    title: 'Minimum score',
    dataIndex: 'score',
    valueType: 'digit',
    search: {
      transform: (value) => ({ minScore: value }),
    },
  },
]
```

Use `defaultCollapsed` for uncontrolled initial state:

```vue
<ProTable :search="{ defaultCollapsed: true, span: 8, labelWidth: 'auto' }" />
```

Use `collapsed` and `search-collapse` for controlled state:

```vue
<ProTable
  :search="{ collapsed, span: 8, searchText: 'Filter', resetText: 'Clear' }"
  @search-collapse="collapsed = $event"
/>
```

Without `span`, the query form uses one, two or three columns according to its container width. A numeric span fixes the column count. Responsive objects such as `{ xs: 24, md: 12, xl: 8 }` carry the last configured value forward across omitted breakpoints, following Ant Design Col. Collapsed mode renders the first row only. `search.onCollapse(next)` is also available.

### Toolbar search and card layout

The query form appears above a card containing the toolbar, table and pagination. Both areas reuse [ProCard](./pro-card), inheriting native Card backgrounds, padding, border radius, dark themes, and component token overrides. Set `toolbar: false` to hide the toolbar.

Enable keyword search with `options.search`, including when the query form is disabled:

```vue
<ProTable
  :columns="columns"
  :request="request"
  :search="false"
  :options="{ search: { name: 'keyword', placeholder: 'Search users' } }"
/>
```

Remote requests receive the submitted keyword under `keyword` (or the configured `name`) and reset to page one. Clearing or resetting removes that parameter. Local data is matched against raw column values. Remote request handlers must implement filtering and pagination.

`toolbar.search` accepts the same configuration and takes precedence over `options.search`. Use `true` for defaults or pass Antdv Next `InputSearch` props. An `onSearch(value)` callback returning `false` or `Promise<false>` cancels submission. Search appears in the right action area when a title exists, or on the left otherwise.

The component ref exposes `getSortFilter()` to read a defensive copy of the current `{ sort, filter }`. The same method is available on `EditableProTable`.

### Column state and settings

Column settings use the native `Popover` and support visibility (including action columns), select all, reset, and drag sorting within the same column group. Focus a drag handle and use the up/down arrow keys to reorder with the keyboard. Reset restores `columnsState.defaultValue`, or the column definitions when no defaults are configured. The density `Popover` offers loose, middle, and compact options and highlights the current selection.

Control visibility, order, and fixed placement programmatically with `show`, `order`, and `fixed` under each column key in `columnsState` (the column `key` takes precedence, otherwise `dataIndex` is used):

```ts
const columnsState = ref<Record<string, ProColumnsState>>({
  name: { show: true, order: 10, fixed: 'left' },
  status: { show: true, order: 20 },
  actions: { show: true, order: 30, fixed: 'right' },
})

const tableColumnsState = computed<ProColumnsStateConfig>(() => ({
  value: columnsState.value,
  onChange: (next) => {
    columnsState.value = next
  },
  persistenceKey: 'users-table-columns',
  persistenceType: 'localStorage',
}))
```

```vue
<ProTable :columns-state="tableColumnsState" />
```

Pair `value` with `onChange` for fully controlled state, or use `defaultValue` for an uncontrolled initial state. With `persistenceKey`, the state can be stored in `localStorage` or `sessionStorage`, including `show` / `order` changes made by the panel and programmatic `fixed` values.

### Built-in editing

`ProTable` uses the same editing state machine as `EditableProTable`:

```vue
<ProTable
  v-model:data-source="rows"
  v-model:editable-keys="editableKeys"
  :columns="columns"
  :editable="{
    type: 'multiple',
    onSave: saveRow,
    onCancel: cancelRow,
    onDelete: deleteRow,
  }"
/>
```

Column `editable` can vary by row. `formItemProps.rules` provides sync/async validation. A custom `renderFormItem(column, context)` editor writes through `context.update(nextValue)`, updating the shared editing state and EditableProTable's live `v-model:value`. ProTable adds an action column when no `valueType: 'option'` column exists.

`editable.actionRender(record, actions)` replaces the complete default action area. Check `actions.editing`, call `actions.start()` for a read-only row, and use `save()`, `cancel()`, or `remove()` while editing.

`addEditRecord(record, { position, parentKey, newRecordType })` supports top/bottom insertion, tree parents, and cache/dataSource creator modes. Every new record must have a unique `rowKey`.

### Shared field core

Search fields, editable cells, and standalone [ProFormFields](/en/components/pro-form-fields) use the same field registry, option-request behavior, and readonly formatting:

- Search items use form-item mode. `name` / `label` generated from column `dataIndex` / `title` override the same keys in `formItemProps`.
- Editable cells use the bare-control behavior behind `fieldMode="field"`. Column `formItemProps.rules` still perform validation without creating a nested FormItem.
- Async options for `select`, `treeSelect`, `radio`, `checkbox`, and `segmented` only accept the newest request. Empty remote results are valid; failures call `onFieldRequestError(error)` and preserve current options.

`valueType` now includes `treeSelect`, `slider`, and `segmented`. Captcha and both Upload fields are standalone ProFormFields and have no column `valueType` mapping.

Continue using `renderFormItem(column, context)` for a fully custom search field or editor, and a column slot or `render` for custom readonly cells. Their priority and `context.update(value)` protocol are unchanged.

## API

### Props

| Prop                           | Type                                      | Description                                            |
| ------------------------------ | ----------------------------------------- | ------------------------------------------------------ |
| `columns`                      | `ProColumns<T>[]`                         | Shared table, search, and editor description           |
| `dataSource`                   | `T[]`                                     | Controlled local rows; supports `v-model:data-source`  |
| `defaultDataSource`            | `T[]`                                     | Uncontrolled initial rows                              |
| `request`                      | `ProRequest<T, P>`                        | Remote Promise request                                 |
| `params`                       | `P`                                       | Extra params; changes reset the page and reload        |
| `postData`                     | `(data: T[]) => T[]`                      | Synchronous display transform                          |
| `rowKey`                       | `keyof T \| string \| (record) => ProKey` | Unique row identity, defaults to `id`                  |
| `loading`                      | `boolean`                                 | External loading state                                 |
| `search`                       | `false \| ProTableSearchConfig`           | Search and collapse options                            |
| `pagination`                   | `false \| ProTablePagination`             | Page state and options                                 |
| `options`                      | `false \| ProTableOptions`                | Keyword search, density, fullscreen, reload, settings  |
| `toolbar`                      | `false \| ProTableToolbarConfig`          | Title, actions and search; slots are also available    |
| `rowSelection`                 | `false \| Record<string, unknown>`        | Antdv Next row-selection config                        |
| `columnsState`                 | `ProColumnsStateConfig`                   | Visibility, order, fixed-state, and persistence config |
| `editable`                     | `false \| EditableConfig<T>`              | Single/multiple row editing lifecycle                  |
| `editableKeys`                 | `ProKey[]`                                | Editing keys; supports `v-model:editable-keys`         |
| `polling`                      | `number`                                  | Poll interval in milliseconds; pauses when hidden      |
| `revalidateOnFocus`            | `boolean`                                 | Reload on window focus                                 |
| `manualRequest`                | `boolean`                                 | Skip the initial automatic request                     |
| `scroll` / `size` / `bordered` | Matching Antdv Next values                | Scrolling, density, and borders                        |

### Events

| Event                  | Arguments                     | Description                       |
| ---------------------- | ----------------------------- | --------------------------------- |
| `update:data-source`   | `rows`                        | `v-model:data-source` update      |
| `update:editable-keys` | `keys`                        | `v-model:editable-keys` update    |
| `data-source-change`   | `rows, changedRecord?`        | Edit, creator, or delete mutation |
| `request-error`        | `error`                       | Remote request failure            |
| `editable-error`       | `error`                       | Save/delete lifecycle failure     |
| `validation-error`     | `key, errors`                 | Row validation failure            |
| `search-collapse`      | `collapsed`                   | Search collapse change            |
| `change`               | `pagination, filters, sorter` | Page, filter, or sort change      |
| `selection-change`     | `keys, rows`                  | Row selection change              |
| `load`                 | `rows, total`                 | Accepted remote result            |

### Slots

The column key is `column.key` or the dot-joined `dataIndex`.

```vue
<ProTable :columns="columns">
  <template #toolbar-title>Projects</template>
  <template #toolbar-actions>
    <button @click="tableRef?.reload()">Sync</button>
  </template>
  <template #header-name="{ column }">
    {{ column.title }} · custom header
  </template>
  <template #cell-name="{ value, editable }">
    <strong>{{ value }}</strong>
    <small v-if="editable">editing</small>
  </template>
</ProTable>
```

- `header-${columnKey}` receives `{ column }`.
- `cell-${columnKey}` or `${columnKey}` receives `{ value, record, index, column, editable }`.
- Other slots are forwarded to the underlying Antdv Next Table.

A cell slot takes precedence over the default display and editor. Prefer a header-only slot for editable columns unless the slot handles editing itself.

### Component ref

```ts
import type { ProTableInstance } from '@bubblesjs/antdv-next-pro'

const tableRef = ref<ProTableInstance<User>>()

await tableRef.value?.reload(true)
tableRef.value?.setPageInfo({ current: 2, pageSize: 50 })
tableRef.value?.clearSelected()
tableRef.value?.startEditable(userId)
await tableRef.value?.saveEditable(userId)
```

| Method                            | Description                                                                   |
| --------------------------------- | ----------------------------------------------------------------------------- |
| `reload(resetPageIndex?)`         | Reload, optionally from page one                                              |
| `reset()`                         | Clear search/sort/filters and restore initial pagination                      |
| `setPageInfo(page)`               | Set current page or page size                                                 |
| `clearSelected()`                 | Clear row selection                                                           |
| `fullScreen()`                    | Enter or exit fullscreen                                                      |
| `scrollTo(target)`                | `{ key }` scrolls to a row key, `{ top }` scrolls by pixels; strings are keys |
| `startEditable(key)`              | Start editing                                                                 |
| `saveEditable(key)`               | Validate and save; returns success                                            |
| `cancelEditable(key)`             | Cancel and restore the original row                                           |
| `addEditRecord(record, options?)` | Create a row and enter edit mode                                              |
