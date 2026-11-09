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

Pagination defaults to `small` and shows the current range and total, such as “1-3 of 6 items”, using the active locale. Pass a `pagination.showTotal` function to customize the text, or explicitly pass `{ showTotal: undefined }` to hide it. Cursor pagination does not show totals.

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

`cardProps` configures the table card. Its `styles` accepts a semantic object or `({ props }) => semantic styles`, receiving the actual ProCard props. Body styles merge default spacing, `bodyStyle`, then `styles.body`. `variant` takes precedence over the legacy `bordered` prop; an explicit `cardBordered.table` or boolean `cardBordered` overrides both. With `options: false` and no title or actions, no empty toolbar is rendered. Hidden toolbars default to zero card body padding.

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

Prefer the `#toolbar-actions="{ action, selectedRows }"` scoped slot for custom action buttons. `action` exposes table methods such as `reload()`, `reset()` and `clearSelected()`; `selectedRows` contains the current selection. The `toolBarRender(action, rows)` callback is also supported, with precedence: slot, `toolBarRender`, then `toolbar.actions`. Custom actions retain the built-in tool buttons. Set `toolbar=false` or `toolBarRender=false` to hide the entire toolbar.

The action area uses flex layout with vertical centering, right alignment, an `8px` gap, and wrapping when space is limited. Place multiple buttons directly in the slot; if you add a wrapper, manage its internal layout yourself.

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

`T` is the row type, `P` the request parameter type, `ProKey = string | number`, and `ProDataIndex = ProKey | readonly ProKey[]`. Defaults describe runtime fallbacks; `—` means unset.

### Properties {#props}

| Property                 | Type                                                               | Default                       | Description and source                                                                                                                     |
| ------------------------ | ------------------------------------------------------------------ | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `columns`                | `ProColumns<T>[]`                                                  | `Required`                    | Shared [column schema](#columns) for display, search and editing.                                                                          |
| `dataSource`             | `T[]`                                                              | —                             | Controlled rows; accept updates with `v-model:data-source`.                                                                                |
| `defaultDataSource`      | `T[]`                                                              | `[]`                          | Initial rows in uncontrolled mode.                                                                                                         |
| `request`                | `ProRequest<T, P>`                                                 | —                             | Async data source; see the [request contract](#request).                                                                                   |
| `params`                 | `P`                                                                | —                             | Extra request parameters; changes reset the page and reload.                                                                               |
| `postData`               | `(data: T[]) => T[]`                                               | —                             | Synchronous transformation of accepted rows.                                                                                               |
| `rowKey`                 | `keyof T \| string \| ((record: T) => ProKey)`                     | `id`                          | Unique row key, including every level of tree data.                                                                                        |
| `loading`                | `TableProps<T>['loading']`                                         | `false`                       | External loading merged with request state; accepts [Spin options](https://www.antdv-next.com/components/spin).                            |
| `headerTitle`            | `VNodeChild`                                                       | —                             | Toolbar title; `toolbar.title` takes precedence.                                                                                           |
| `tooltip`                | `string \| TooltipProps`                                           | —                             | ListToolBar title tooltip; top-level `tooltip` overrides it in ProTable. See [Tooltip API](https://www.antdv-next.com/components/tooltip). |
| `form`                   | `ProTableSearchForm<T>`                                            | —                             | Native search-form properties and extensions; see [search form](#form).                                                                    |
| `formRef`                | `Ref<SchemaFormInstance<T> \| undefined>`                          | —                             | Actual search-form instance; see [SchemaForm methods](./schema-form#instance).                                                             |
| `onSubmit`               | `(params: P) => void`                                              | —                             | Search submission callback with formatted parameters.                                                                                      |
| `onReset`                | `() => void`                                                       | —                             | Called when search is reset.                                                                                                               |
| `onLoadingChange`        | `(loading: boolean) => void`                                       | —                             | Receives changes to the combined loading state.                                                                                            |
| `beforeSearchSubmit`     | `(params: Record<string, unknown>) => Record<string, unknown>`     | —                             | Transforms search parameters before submission.                                                                                            |
| `dateFormatter`          | `'string' \| 'number' \| false \| ((value, valueType) => unknown)` | `string`                      | Search date formatting; `false` preserves date objects.                                                                                    |
| `debounceTime`           | `number`                                                           | `10`                          | Search submission debounce in milliseconds.                                                                                                |
| `search`                 | `false \| ProTableSearchConfig<T>`                                 | `{}`                          | Search area; `false` hides it. See [search](#search).                                                                                      |
| `pagination`             | `false \| ProTablePagination`                                      | `{}`                          | Pagination settings; see [pagination](#pagination).                                                                                        |
| `options`                | `false \| ProTableOptions<T>`                                      | `{}`                          | Built-in tools; see [options](#options).                                                                                                   |
| `toolbar`                | `false \| ProTableToolbarConfig`                                   | —                             | Toolbar configuration; see [toolbar](#toolbar). `false` hides the entire toolbar.                                                          |
| `toolBarRender`          | `false \| ((action, rows) => VNodeChild)`                          | —                             | Renders toolbar actions for selected rows; `false` hides the entire toolbar.                                                               |
| `optionsRender`          | `(props, defaults: VNodeChild[]) => VNodeChild`                    | —                             | Customizes built-in tool nodes.                                                                                                            |
| `tableRender`            | `(props, dom, domList) => VNodeChild`                              | —                             | Wraps toolbar, selection alert and table; `domList={ toolbar, alert, table }`.                                                             |
| `tableViewRender`        | `(props, dom: VNodeChild) => VNodeChild`                           | —                             | Replaces the table view; props include displayed rows and effective configuration.                                                         |
| `ErrorBoundary`          | `false \| Component`                                               | `Built-in`                    | Table-area error boundary; `false` disables it or pass a custom component.                                                                 |
| `tableExtraRender`       | `(props, rows: T[]) => VNodeChild`                                 | —                             | Content after search and before the table card.                                                                                            |
| `searchFormRender`       | `(props, dom: VNodeChild) => VNodeChild`                           | —                             | Wraps or replaces the search area.                                                                                                         |
| `tableAlertRender`       | `false \| ((context) => VNodeChild)`                               | `Built-in`                    | Selection alert with `{ selectedRowKeys, selectedRows, onCleanSelected }`.                                                                 |
| `tableAlertOptionRender` | `false \| ((context) => VNodeChild)`                               | `Built-in clear action`       | Selection-alert actions with the same context as `tableAlertRender`.                                                                       |
| `cardProps`              | `false \| ProCardProps`                                            | —                             | Outer [ProCard properties](./pro-card#props); `false` removes card styling.                                                                |
| `cardBordered`           | `boolean \| { search?: boolean; table?: boolean }`                 | `false`                       | Search/table card borders; an explicit table value overrides `cardProps.variant/bordered`.                                                 |
| `tableClassName`         | `string`                                                           | —                             | Class on the native Table; component `class` targets the outer root.                                                                       |
| `tableStyle`             | `CSSProperties`                                                    | —                             | Style on the native Table; component `style` targets the outer root.                                                                       |
| `classes`                | `TableProps<T>['classes']`                                         | —                             | Native Table semantic classes; see [Table API](https://www.antdv-next.com/components/table).                                               |
| `styles`                 | `TableProps<T>['styles']`                                          | —                             | Native Table semantic styles, including callback form; see [Table API](https://www.antdv-next.com/components/table).                       |
| `localeText`             | `Partial<ProTableLocaleText>`                                      | `Inherited locale`            | Overrides tool and search labels; see [localeText](#locale-text).                                                                          |
| `rowSelection`           | `false \| ProTableRowSelection<T>`                                 | —                             | Row selection; see [selection and scrolling](#selection).                                                                                  |
| `polling`                | `number \| ((data: T[]) => number \| false)`                       | —                             | Polling interval in milliseconds, with a 2000ms minimum; a function can return `false` to pause. Pauses while hidden.                      |
| `revalidateOnFocus`      | `boolean`                                                          | `false`                       | Reloads when the window gains focus.                                                                                                       |
| `manualRequest`          | `boolean`                                                          | `false`                       | Skips the initial automatic request; call `reload()`.                                                                                      |
| `columnsState`           | `ProColumnsStateConfig`                                            | —                             | Column visibility, order, pinning and persistence; see [columnsState](#columns-state).                                                     |
| `editable`               | `false \| EditableConfig<T>`                                       | —                             | Editing state and lifecycle; see [editable](#editable).                                                                                    |
| `editableKeys`           | `ProKey[]`                                                         | —                             | Controlled editing keys; supports `v-model:editable-keys`, overriding `editable.editableKeys`.                                             |
| `scroll`                 | `{ x?: number \| string \| true; y?: number \| string }`           | —                             | Native [Table scroll options](https://www.antdv-next.com/components/table); see [selection and scrolling](#selection).                     |
| `size`                   | `'small' \| 'middle' \| 'large'`                                   | `Inherited, otherwise middle` | Table density, also adjustable through toolbar controls.                                                                                   |
| `bordered`               | `boolean`                                                          | `false`                       | Native Table border; use `cardBordered` for card borders.                                                                                  |
| `prefixCls`              | `string`                                                           | `ant-pro-table`               | Complete ProTable prefix; the default follows ConfigProvider.                                                                              |

Properties not managed above inherit [antdv-next Table API](https://www.antdv-next.com/components/table), including `onRow`, `onHeaderRow`, `expandable`, `components`, `summary`, `sticky`, `virtual`, and `locale`. ProTable redefines `columns/dataSource/rowKey/loading/pagination/rowSelection/scroll/size/onChange/classes/styles/prefixCls/title`; use `headerTitle` for toolbar headings. Pagination is rendered separately. `class/style/id/data-*/aria-*` target the ProTable root; use `tableClassName/tableStyle` for the native Table.

### Request contract {#request}

```ts
request(params: P & { current?: number; pageSize?: number; nextToken?: string },
        sort: Record<string, "ascend" | "descend" | null>,
        filter: Record<string, Array<string | number> | null>)
  : Promise<{ data: T[]; total?: number; success?: boolean; nextToken?: string }>
```

The response uses the exported [`ProRequestResult<T>`](https://github.com/bubblesplant/antv-next-pro/blob/main/packages/src/types.ts#L223) type:

| Field       | Type      | Required | Description                                                                                                                                        |
| ----------- | --------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data`      | `T[]`     | Yes      | Rows returned by this request. Accepted data updates the table; postData then transforms it for display.                                           |
| `total`     | `number`  | No       | Total record count. If omitted, pagination.total takes precedence over the current row count. Cursor pagination infers later pages from nextToken. |
| `success`   | `boolean` | No       | Only false rejects the result, preserves existing rows, and emits request-error. An omitted value is accepted.                                     |
| `nextToken` | `string`  | No       | Next token for [cursor pagination](#pagination), passed to the following request as params.nextToken. Omit it when no later cursor exists.         |

### Column properties: ProColumns {#columns}

| Property              | Type                                                                | Default          | Description and source                                                                                                                              |
| --------------------- | ------------------------------------------------------------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `key`                 | `ProKey`                                                            | `dataIndex path` | Column identifier used by state and dynamic slots.                                                                                                  |
| `dataIndex`           | `ProDataIndex`                                                      | —                | Field path: string, number or readonly path array.                                                                                                  |
| `title`               | `VNodeChild \| ((column) => VNodeChild)`                            | —                | Table heading and form label.                                                                                                                       |
| `valueType`           | `ProColumnValueType<T>`                                             | `text`           | Type string, `{ type, ...options }` or a record-based callback; see [ProField](./pro-field).                                                        |
| `valueEnum`           | `ProValueEnum \| (() => ProValueEnum)`                              | —                | Enum object or Map; items support `text/color/disabled/status/value`.                                                                               |
| `request`             | `(params?) => Promise<Record<string, unknown>[]>`                   | —                | Option request; see [field options](./pro-form-fields).                                                                                             |
| `onFieldRequestError` | `(error: unknown) => void`                                          | —                | Option request failure callback.                                                                                                                    |
| `params`              | `Record<string, unknown>`                                           | —                | Parameters for the option request.                                                                                                                  |
| `width`               | `number \| string`                                                  | —                | Native [Column width](https://www.antdv-next.com/components/table).                                                                                 |
| `minWidth`            | `number`                                                            | —                | Native Column minimum width.                                                                                                                        |
| `fixed`               | `'left' \| 'right'`                                                 | —                | Column pinning; column state can override it.                                                                                                       |
| `align`               | `'left' \| 'center' \| 'right'`                                     | `left`           | Cell alignment.                                                                                                                                     |
| `ellipsis`            | `TableColumnType<T>['ellipsis']`                                    | —                | Native Column ellipsis configuration.                                                                                                               |
| `copyable`            | `boolean`                                                           | `false`          | Enables text copying.                                                                                                                               |
| `sorter`              | `TableColumnType<T>['sorter']`                                      | —                | Native Column sorting; collected as request `sort`.                                                                                                 |
| `filters`             | `{ text: string; value: ProKey }[]`                                 | —                | Native Column filter menu.                                                                                                                          |
| `search`              | `boolean \| { transform?: (value) => Record<string, unknown> }`     | `true`           | `false` excludes the search item; transform maps its value into request parameters.                                                                 |
| `editable`            | `boolean \| ((record: T, index: number) => boolean)`                | `true`           | Whether a field can be edited.                                                                                                                      |
| `hideInTable`         | `boolean`                                                           | `false`          | Hides the column from the table.                                                                                                                    |
| `hideInSearch`        | `boolean`                                                           | `false`          | Hides the search field.                                                                                                                             |
| `hideInForm`          | `boolean`                                                           | `false`          | Hides the Schema form field; see [SchemaForm](./schema-form).                                                                                       |
| `readonly`            | `boolean`                                                           | `false`          | Readonly search/editing field.                                                                                                                      |
| `fieldProps`          | `Record<string, unknown> \| ((record?) => Record<string, unknown>)` | —                | Properties for the control selected by `valueType`; follow the [native field APIs](./pro-form-fields), such as SelectProps/InputProps.              |
| `formItemProps`       | `Record<string, unknown> \| ((record?) => Record<string, unknown>)` | —                | Search/edit-cell [FormItem API](https://www.antdv-next.com/components/form#form-item-props), including rules; generated name/label take precedence. |
| `convertValue`        | `(value, record: Partial<T>) => unknown`                            | —                | Inbound form conversion; see [SchemaForm](./schema-form).                                                                                           |
| `transform`           | `(value, record: Partial<T>) => unknown`                            | —                | Outbound form conversion; see [SchemaForm](./schema-form).                                                                                          |
| `dependencies`        | `ProDataIndex[]`                                                    | —                | Dependent field paths supplied to the editing context.                                                                                              |
| `columns`             | `ProColumns<T>[]`                                                   | —                | Legacy structural children; prefer children.                                                                                                        |
| `children`            | `ProColumns<T>[]`                                                   | —                | Grouped column or structural field children.                                                                                                        |
| `initialValue`        | `unknown`                                                           | —                | Initial search/form field value.                                                                                                                    |
| `order`               | `number`                                                            | —                | Search-field ordering weight.                                                                                                                       |
| `colSize`             | `number`                                                            | `1`              | Number of logical search columns occupied.                                                                                                          |
| `render`              | `(dom, record, index, action, schema) => VNodeChild`                | —                | Custom cell rendering; action is [ProTableInstance](#instance).                                                                                     |
| `renderText`          | `(value, record, index, action) => unknown`                         | —                | Transforms display text without mutating records.                                                                                                   |
| `formItemRender`      | `(schema, context, nativeForm) => VNodeChild`                       | —                | Preferred custom-field callback; context is `{ record,index,column,editable,dependencies,update }`.                                                 |
| `renderFormItem`      | `(column, context) => VNodeChild`                                   | —                | Legacy field callback; ignored when formItemRender is provided.                                                                                     |

### search {#search}

| Property           | Type                                            | Default      | Description and source                                                            |
| ------------------ | ----------------------------------------------- | ------------ | --------------------------------------------------------------------------------- |
| `labelWidth`       | `number \| 'auto'`                              | `80`         | Query label width.                                                                |
| `span`             | `number \| Partial<Record<Breakpoint, number>>` | `Responsive` | Grid span with xs/sm/md/lg/xl/xxl breakpoints; see [QueryFilter](./query-filter). |
| `defaultCollapsed` | `boolean`                                       | `true`       | Initial uncontrolled collapse state.                                              |
| `collapsed`        | `boolean`                                       | —            | Controlled collapse state.                                                        |
| `onCollapse`       | `(collapsed: boolean) => void`                  | —            | Collapse change callback.                                                         |
| `searchText`       | `string`                                        | `Locale`     | Search button label.                                                              |
| `resetText`        | `string`                                        | `Locale`     | Reset button label.                                                               |
| `filterType`       | `'query' \| 'light'`                            | `query`      | Uses [QueryFilter](./query-filter) or [LightFilter](./light-filter).              |
| `optionRender`     | `false \| ((search, form, doms) => VNodeChild)` | —            | Customizes/hides actions; form is the SchemaForm instance.                        |
| `collapseRender`   | `false \| ((collapsed: boolean) => VNodeChild)` | —            | Customizes/hides the collapse control.                                            |

### form search configuration {#form}

| Property        | Type                      | Default | Description and source                                                                                                                                                                 |
| --------------- | ------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `initialValues` | `Partial<T>`              | —       | Initial search values.                                                                                                                                                                 |
| `submitter`     | `false \| SubmitterProps` | —       | Search actions; see [ProForm submitter](./pro-form#submitter-props).                                                                                                                   |
| `FormProps`     | `FormProps`               | —       | Remaining properties target the native search Form, including layout/rules/labelCol/wrapperCol/validateTrigger; see [Form API](https://www.antdv-next.com/components/form#form-props). |

`form.initialValues/submitter` are handled by the search adapter; other fields become SchemaForm `formProps`. The search area owns model, fields, submit and reset; observe queries through top-level `onSubmit/onReset`.

Remaining column properties inherit [Table Column API](https://www.antdv-next.com/components/table), including `onCell/onHeaderCell/defaultSortOrder/filterMultiple`. Pro definitions replace `title/dataIndex/render/children/key/filters/sorter/ellipsis`.

### pagination {#pagination}

| Property          | Type                   | Default          | Description and source                                                                                                                                                                                             |
| ----------------- | ---------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `type`            | `'offset' \| 'cursor'` | `offset`         | Offset or cursor pagination.                                                                                                                                                                                       |
| `nextToken`       | `string`               | —                | Initial cursor token.                                                                                                                                                                                              |
| `current`         | `number`               | —                | Controlled page index.                                                                                                                                                                                             |
| `pageSize`        | `number`               | —                | Controlled page size.                                                                                                                                                                                              |
| `total`           | `number`               | `Row count`      | Total records; a remote response total takes precedence.                                                                                                                                                           |
| `defaultCurrent`  | `number`               | `1`              | Initial uncontrolled page.                                                                                                                                                                                         |
| `defaultPageSize` | `number`               | `10`             | Initial uncontrolled page size.                                                                                                                                                                                    |
| `showSizeChanger` | `boolean`              | `true`           | Page-size control; forced to false for cursor pagination.                                                                                                                                                          |
| `pageSizeOptions` | `(number \| string)[]` | `[10,20,50,100]` | Available page sizes.                                                                                                                                                                                              |
| `PaginationProps` | `PaginationProps`      | —                | Other [Pagination options](https://www.antdv-next.com/components/pagination), including size/showTotal/itemRender/onChange; size defaults to small, and cursor mode hides quick jumping, size changing and totals. |

### options {#options}

| Property     | Type                                               | Default | Description and source                                                      |
| ------------ | -------------------------------------------------- | ------- | --------------------------------------------------------------------------- |
| `search`     | `boolean \| ProTableToolbarSearchConfig`           | `false` | Keyword search; see [toolbar search](#toolbar-search). toolbar.search wins. |
| `density`    | `boolean`                                          | `true`  | Density control.                                                            |
| `fullScreen` | `boolean \| ((event: MouseEvent, action) => void)` | `true`  | Fullscreen tool; a callback replaces default handling.                      |
| `reload`     | `boolean \| ((event: MouseEvent, action) => void)` | `true`  | Reload tool; a callback replaces default handling.                          |
| `setting`    | `boolean \| SettingConfig`                         | `true`  | Column settings; nested properties follow.                                  |

### options.setting {#setting}

| Property              | Type                                                       | Default | Description and source              |
| --------------------- | ---------------------------------------------------------- | ------- | ----------------------------------- |
| `draggable`           | `boolean`                                                  | `true`  | Enables column dragging.            |
| `checkable`           | `boolean`                                                  | `true`  | Shows visibility checkboxes.        |
| `showListItemOption`  | `boolean`                                                  | `true`  | Shows pinning controls.             |
| `checkedReset`        | `boolean`                                                  | `true`  | Shows the reset control.            |
| `listsHeight`         | `number`                                                   | —       | Maximum list height in pixels.      |
| `extra`               | `VNodeChild`                                               | —       | Extra content below the list.       |
| `children`            | `VNodeChild`                                               | —       | Replaces the default settings list. |
| `settingIcon`         | `VNodeChild`                                               | —       | Settings button icon.               |
| `listItemTitleRender` | `(title: VNodeChild, column: ProColumns<T>) => VNodeChild` | —       | Customizes a settings-item title.   |

### toolbar {#toolbar}

| Property       | Type                                                             | Default       | Description and source                                                                                                                     |
| -------------- | ---------------------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `title`        | `VNodeChild`                                                     | `headerTitle` | Toolbar title.                                                                                                                             |
| `actions`      | `VNodeChild \| (() => VNodeChild)`                               | —             | Action nodes; precedence is toolbar-actions slot, toolBarRender, then actions.                                                             |
| `search`       | `boolean \| ProTableToolbarSearchConfig`                         | `false`       | Search input, overriding options.search; see [toolbar search](#toolbar-search).                                                            |
| `onSearch`     | `(value: string) => void`                                        | —             | Keyword search notification.                                                                                                               |
| `subTitle`     | `VNodeChild`                                                     | —             | Subtitle.                                                                                                                                  |
| `tooltip`      | `string \| TooltipProps`                                         | —             | ListToolBar title tooltip; top-level `tooltip` overrides it in ProTable. See [Tooltip API](https://www.antdv-next.com/components/tooltip). |
| `tabs`         | `ToolbarNavigation`                                              | —             | Tab navigation, shown when `multipleLine=true`; nested properties follow.                                                                  |
| `menu`         | `ToolbarNavigation & { type?: 'inline' \| 'dropdown' \| 'tab' }` | —             | Menu navigation; nested properties follow.                                                                                                 |
| `filter`       | `VNodeChild`                                                     | —             | Additional filter nodes.                                                                                                                   |
| `settings`     | `VNodeChild[]`                                                   | —             | Additional settings nodes.                                                                                                                 |
| `multipleLine` | `boolean`                                                        | `false`       | Allows multiple toolbar lines.                                                                                                             |

### toolbar.tabs / toolbar.menu {#toolbar-navigation}

| Property           | Type                                                       | Default | Description and source                               |
| ------------------ | ---------------------------------------------------------- | ------- | ---------------------------------------------------- |
| `activeKey`        | `string`                                                   | —       | Controlled active key.                               |
| `defaultActiveKey` | `string`                                                   | —       | Initial uncontrolled key.                            |
| `items`            | `{ key: string; label: VNodeChild; disabled?: boolean }[]` | `[]`    | Navigation items.                                    |
| `onChange`         | `(key: string) => void`                                    | —       | Change callback.                                     |
| `type (menu only)` | `'inline' \| 'dropdown' \| 'tab'`                          | `tab`   | Menu presentation; omitting type falls back to Tabs. |

### toolbar.search / options.search {#toolbar-search}

| Property           | Type                                                         | Default   | Description and source                                                                                                                                     |
| ------------------ | ------------------------------------------------------------ | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`             | `string`                                                     | `keyword` | Request parameter name.                                                                                                                                    |
| `onSearch`         | `(value: string) => void \| false \| Promise<void \| false>` | —         | Return false to cancel this search.                                                                                                                        |
| `InputSearchProps` | `Omit<InputSearchProps, 'onSearch'>`                         | —         | Remaining properties pass to [Input.Search](https://www.antdv-next.com/components/input#input-search-props), including placeholder/allowClear/enterButton. |

### columnsState {#columns-state}

| Property                                     | Type                                               | Default                | Description and source                                      |
| -------------------------------------------- | -------------------------------------------------- | ---------------------- | ----------------------------------------------------------- |
| `persistenceKey`                             | `string`                                           | —                      | Storage key; omit to disable persistence.                   |
| `persistenceType`                            | `'localStorage' \| 'sessionStorage'`               | `localStorage`         | Browser storage type.                                       |
| `value`                                      | `Record<string, ProColumnsState>`                  | —                      | Controlled state keyed by column.key or the dataIndex path. |
| `defaultValue`                               | `Record<string, ProColumnsState>`                  | —                      | Initial uncontrolled state.                                 |
| `onChange`                                   | `(state: Record<string, ProColumnsState>) => void` | —                      | Change callback.                                            |
| `value[key].show / defaultValue[key].show`   | `boolean`                                          | `true`                 | Column visibility.                                          |
| `value[key].order / defaultValue[key].order` | `number`                                           | `Original order`       | Column order.                                               |
| `value[key].fixed / defaultValue[key].fixed` | `'left' \| 'right' \| false`                       | `Column configuration` | Column pinning.                                             |

### editable {#editable}

| Property                        | Type                                                                                 | Default  | Description and source                                                                                                                                                                          |
| ------------------------------- | ------------------------------------------------------------------------------------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`                          | `'single' \| 'multiple'`                                                             | `single` | Single-row or multi-row editing.                                                                                                                                                                |
| `onSave`                        | `(key: ProKey, record: T, origin: T) => void \| boolean \| Promise<void \| boolean>` | —        | Saves after validation; false retains editing, rejection emits editable-error.                                                                                                                  |
| `onCancel`                      | `(key: ProKey, record: T, origin: T) => void \| Promise<void>`                       | —        | Called when cancelling and restoring the original record.                                                                                                                                       |
| `onDelete`                      | `(key: ProKey, record: T) => void \| boolean \| Promise<void \| boolean>`            | —        | Called before deletion; false prevents it.                                                                                                                                                      |
| `actionRender`                  | `(record, action: EditableAction<T>, defaultDom) => VNodeChild`                      | —        | Custom actions; defaultDom contains save/cancel/delete; action members follow.                                                                                                                  |
| `form`                          | `FormInstance`                                                                       | —        | Deprecated: injecting a native Form instance is unsupported; use formRef instead.                                                                                                               |
| `formRef`                       | `Ref<FormInstance \| undefined>`                                                     | —        | Actual internal editing Form instance; see [Form methods](https://www.antdv-next.com/components/form).                                                                                          |
| `formProps`                     | `FormProps`                                                                          | —        | Internal editing [Form properties](https://www.antdv-next.com/components/form#form-props), including rules/validateTrigger/disabled; the table owns model and intercepts submit for row saving. |
| `editableKeys`                  | `ProKey[]`                                                                           | `[]`     | Controlled editing keys; top-level editableKeys takes precedence.                                                                                                                               |
| `onChange`                      | `(keys: ProKey[], rows: T[]) => void`                                                | —        | Editing-key change callback.                                                                                                                                                                    |
| `onValuesChange`                | `(record: T, rows: T[]) => void`                                                     | —        | Draft value change callback.                                                                                                                                                                    |
| `onlyOneLineEditorAlertMessage` | `VNodeChild`                                                                         | `Locale` | Conflict message in single editing mode.                                                                                                                                                        |
| `onlyAddOneLineAlertMessage`    | `VNodeChild`                                                                         | `Locale` | Message when only one new row is allowed.                                                                                                                                                       |
| `saveText`                      | `VNodeChild`                                                                         | `Locale` | Save label.                                                                                                                                                                                     |
| `cancelText`                    | `VNodeChild`                                                                         | `Locale` | Cancel label.                                                                                                                                                                                   |
| `deleteText`                    | `VNodeChild`                                                                         | `Locale` | Delete label.                                                                                                                                                                                   |
| `deletePopconfirmMessage`       | `VNodeChild`                                                                         | `Locale` | Delete confirmation text.                                                                                                                                                                       |

#### EditableAction

| Member     | Signature / type   | Description                       |
| ---------- | ------------------ | --------------------------------- |
| `start()`  | `boolean`          | Starts editing this row.          |
| `save()`   | `Promise<boolean>` | Validates and saves.              |
| `cancel()` | `void`             | Cancels and restores.             |
| `remove()` | `Promise<boolean>` | Deletes the row.                  |
| `record`   | `T`                | Current record.                   |
| `editing`  | `boolean`          | Whether this row is being edited. |

### Selection and scrolling {#selection}

| Property                       | Type                       | Default | Description and source                                                                                                                                    |
| ------------------------------ | -------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `rowSelection.alwaysShowAlert` | `boolean`                  | `false` | Shows selection alerts even with no selected rows.                                                                                                        |
| `rowSelection.*`               | `TableRowSelection<T>`     | —       | Other selection properties (selectedRowKeys/type/onChange/getCheckboxProps) follow [Table rowSelection API](https://www.antdv-next.com/components/table). |
| `scroll.x`                     | `number \| string \| true` | —       | Horizontal scrolling width.                                                                                                                               |
| `scroll.y`                     | `number \| string`         | —       | Scrollable table-body height.                                                                                                                             |

### Labels localeText {#locale-text}

| Property         | Type     | Default | Description and source |
| ---------------- | -------- | ------- | ---------------------- |
| `search`         | `string` | locale  | Search                 |
| `reset`          | `string` | locale  | Reset                  |
| `expand`         | `string` | locale  | Expand                 |
| `collapse`       | `string` | locale  | Collapse               |
| `density`        | `string` | locale  | Density                |
| `densityDefault` | `string` | locale  | Default density        |
| `densityCompact` | `string` | locale  | Compact density        |
| `densityLoose`   | `string` | locale  | Loose density          |
| `fullScreen`     | `string` | locale  | Fullscreen             |
| `reload`         | `string` | locale  | Reload                 |
| `setting`        | `string` | locale  | Column settings        |
| `columnDisplay`  | `string` | locale  | Column visibility      |
| `columnDrag`     | `string` | locale  | Column dragging        |

### Events {#events}

| Event                   | Arguments                                                             | Description                                                            |
| ----------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `update:data-source`    | `rows: T[]`                                                           | Controlled row update.                                                 |
| `update:editable-keys`  | `keys: ProKey[]`                                                      | Controlled editing-key update.                                         |
| `data-source-change`    | `rows: T[], changedRecord?: T`                                        | Rows changed after editing, adding or deleting.                        |
| `editable-draft-change` | `rows: T[], changedRecord: T, reason: 'change' \| 'cancel'`           | Draft change/cancellation notification, separate from save completion. |
| `request-error`         | `error: unknown`                                                      | Remote request failed.                                                 |
| `editable-error`        | `error: unknown`                                                      | An editing lifecycle callback failed.                                  |
| `validation-error`      | `key: ProKey, errors: Record<string, string>`                         | Row validation failed.                                                 |
| `search-collapse`       | `collapsed: boolean`                                                  | Search collapse state changed.                                         |
| `change`                | `pagination: ProTablePagination, filters: ProFilter, sorter: ProSort` | Pagination, filters or sorting changed.                                |
| `selection-change`      | `keys: ProKey[], rows: T[]`                                           | Selection changed.                                                     |
| `load`                  | `rows: T[], total: number`                                            | Remote response accepted.                                              |

`onSubmit/onReset/onLoadingChange` are callback properties documented above. Events support Vue kebab-case names such as `@request-error`.

### Slots {#slots}

| Slot                               | Arguments                                                        | Description and source                                                                         |
| ---------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `toolbar-title`                    | `None`                                                           | Toolbar title, taking precedence over title properties.                                        |
| `toolbar-actions`                  | `{ action: ProTableInstance<T>, selectedRows: T[] }`             | Toolbar actions, before toolBarRender and toolbar.actions.                                     |
| `header-${columnKey}`              | `{ column: ProColumns<T> }`                                      | Header for this column.                                                                        |
| `cell-${columnKey} / ${columnKey}` | `{ value, record: T, index: number, column, editable: boolean }` | Cell content; the cell- form wins and replaces default display/editing.                        |
| `before-table`                     | `None`                                                           | Content before the table, after selection alerts.                                              |
| `after-table`                      | `None`                                                           | Content after the table, before pagination.                                                    |
| `Native Table slots`               | `Native Table arguments`                                         | Other slots are forwarded; see [Table slots API](https://www.antdv-next.com/components/table). |

`columnKey` uses `column.key`, then the dot-joined `dataIndex`. Cell slots replace default readonly rendering and editing controls.

```vue
<ProTable :columns="columns" :row-selection="{}">
  <template #toolbar-title>Projects</template>
  <template #toolbar-actions="{ action, selectedRows }">
    <button @click="action.reload()">Sync</button>
    <button :disabled="!selectedRows.length" @click="action.clearSelected()">
      Clear selection ({{ selectedRows.length }})
    </button>
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

### ProTableInstance {#instance}

| Method                                                                      | Return                                 | Description                                                                                                         |
| --------------------------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `getSortFilter()`                                                           | `{ sort: ProSort; filter: ProFilter }` | Reads current sort and filters.                                                                                     |
| `reload(resetPageIndex?: boolean)`                                          | `Promise<void>`                        | Reloads; true resets to page one.                                                                                   |
| `reset()`                                                                   | `Promise<void>`                        | Clears search, sort and filters and restores initial pagination.                                                    |
| `setPageInfo(page: Partial<ProTablePagination>)`                            | `void`                                 | Updates page index/size.                                                                                            |
| `clearSelected()`                                                           | `void`                                 | Clears selection.                                                                                                   |
| `fullScreen()`                                                              | `Promise<void>`                        | Toggles fullscreen.                                                                                                 |
| `scrollTo(target: ProKey \| { key: ProKey } \| { top: number })`            | `void`                                 | Scrolls by row key or pixel offset; a bare number matches an exact rowKey first, then falls back to a pixel offset. |
| `startEditable(key: ProKey)`                                                | `boolean`                              | Starts editing and returns success.                                                                                 |
| `saveEditable(key: ProKey)`                                                 | `Promise<boolean>`                     | Validates and saves, returning success.                                                                             |
| `cancelEditable(key: ProKey)`                                               | `void`                                 | Cancels and restores the record.                                                                                    |
| `addEditRecord(record: T, options?: Omit<RecordCreatorProps<T>, 'record'>)` | `boolean`                              | Creates an editable row; see [RecordCreatorProps](./editable-pro-table#record-creator).                             |
| `getRowData(indexOrKey: number \| ProKey)`                                  | `T \| undefined`                       | Numbers first match an exact rowKey, then fall back to a top-level index.                                           |
| `getRowsData()`                                                             | `T[]`                                  | Reads all rows.                                                                                                     |
| `setRowData(indexOrKey: number \| ProKey, value: Partial<T>)`               | `boolean`                              | Resolves the same key/index rules and shallow-merges the update.                                                    |

```ts
import type { ProTableInstance } from '@bubblesjs/antdv-next-pro'

const tableRef = ref<ProTableInstance<User>>()

await tableRef.value?.reload(true)
tableRef.value?.setPageInfo({ current: 2, pageSize: 50 })
tableRef.value?.clearSelected()
tableRef.value?.startEditable(userId)
await tableRef.value?.saveEditable(userId)
```
