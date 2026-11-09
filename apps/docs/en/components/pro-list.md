---
pageClass: component-doc
---

<script setup>
import ProListDemo from '../../examples/ProListDemo.vue'
</script>

# ProList / BaseProList

A schema-driven list that shares [ProTable](./pro-table) requests, search, pagination, toolbar, selection and editing. `BaseProList` provides lighter presentation defaults.

<ClientOnly><ProListDemo /></ClientOnly>

<<< ../../examples/ProListDemo.vue

## Minimal usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ProList, type ProListMetas } from '@bubblesjs/antdv-next-pro'

type Project = { id: number; name: string; description: string }
const rows = ref<Project[]>([
  { id: 1, name: 'Components', description: 'Shared components and themes' },
  { id: 2, name: 'Workspace', description: 'Organize daily work' },
])
const metas: ProListMetas<Project> = {
  title: { dataIndex: 'name', title: 'Name' },
  description: { dataIndex: 'description' },
}
</script>

<template>
  <ProList row-key="id" :data-source="rows" :metas="metas" />
</template>
```

## Data and schema

Choose `columns` or `metas`; explicit columns take precedence. Metas map region names to schemas. Columns use `listSlot` to select a region.

| Region                    | Purpose                              |
| ------------------------- | ------------------------------------ |
| `title` / `subTitle`      | Title and subtitle                   |
| `avatar`                  | Avatar, default valueType is avatar  |
| `description` / `content` | Description and main content         |
| `actions`                 | Actions, default valueType is option |
| `extra`                   | Additional content on the side       |

Each entry extends `ProColumns<T>` and supports valueType, valueEnum, fieldProps, remote options and field formatting. The region name is the default dataIndex. Other regions default to text.

The v3 renderer is `(dom, record, index, action, schema)`: the first argument is the default node. Read raw values from record or transform them in `renderText(value, record, index, action)`.

## API

### Props {#props}

Both components inherit [ProTable props](./pro-table#props), [column settings](./pro-table#columns), [events](./pro-table#events), and [instance methods](./pro-table#instance). The table body is replaced by a list; native table-cell layout properties do not automatically become list layout options. The properties below are added or handled differently.

| Property           | Type                                                               | Default        | Description / source                                                                                                                |
| ------------------ | ------------------------------------------------------------------ | -------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `columns`          | `ProListColumn<T>[]`                                               | —              | List schema; overrides metas; see [list columns](#columns).                                                                         |
| `metas`            | `ProListMetas<T>`                                                  | —              | Schema keyed by title/subTitle/avatar/description/content/actions/extra.                                                            |
| `grid`             | `{ gutter?, column?, xs?, sm?, md?, lg?, xl?, xxl? }`              | —              | Enables grid cards; see grid options below.                                                                                         |
| `itemCardProps`    | `ProCardProps`                                                     | —              | Per-grid-item [ProCard props](./pro-card#props); generated slots and root class are owned by the list; selection overrides checked. |
| `itemLayout`       | `'horizontal' \| 'vertical'`                                       | `horizontal`   | Ordinary list item layout.                                                                                                          |
| `split`            | `boolean`                                                          | `undefined`    | Omitted: no divider/radius; false: theme radius without divider; true: divider without radius.                                      |
| `showActions`      | `'hover' \| 'always'`                                              | `always`       | hover reveals actions on hover or keyboard focus within the row.                                                                    |
| `showExtra`        | `'hover' \| 'always'`                                              | `always`       | Extra-region visibility, using the same rule as showActions.                                                                        |
| `itemRender`       | `(record: T, index: number, defaultDom: VNodeChild) => VNodeChild` | —              | Replaces an entire list item body.                                                                                                  |
| `itemTitleRender`  | `false \| ProListItemRender<T>`                                    | —              | Replaces or hides the title.                                                                                                        |
| `itemHeaderRender` | `false \| ProListItemRender<T>`                                    | —              | Replaces or hides the header.                                                                                                       |
| `onItem`           | `(record: T, index: number) => HTMLAttributes`                     | —              | Returns row attributes, merged after onRow.                                                                                         |
| `onRow`            | `(record: T, index: number) => HTMLAttributes`                     | —              | Returns list-row attributes, including event handlers.                                                                              |
| `rowClassName`     | `string \| ((record: T, index: number) => string)`                 | —              | Appends a class to every list row.                                                                                                  |
| `prefixCls`        | `string`                                                           | `ant-pro-list` | Full list prefix, inherited from native/Pro configuration.                                                                          |
| `classes`          | `SemanticClasses \| ({ props }) => SemanticClasses`                | —              | List semantic classes; see [styles](#styles).                                                                                       |
| `classNames`       | `SemanticClasses \| ({ props }) => SemanticClasses`                | —              | Legacy entry; classes takes precedence.                                                                                             |
| `styles`           | `SemanticStyles \| ({ props }) => SemanticStyles`                  | —              | List semantic styles; see [styles](#styles).                                                                                        |

### Shared properties and defaults

| Entry                                                        | Default                       | Destination / source                                                                                                                                                                                                      |
| ------------------------------------------------------------ | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dataSource / defaultDataSource / request / params / rowKey` | [ProTable](./pro-table#props) | Same data engine; request returns { data, total?, success?, nextToken? }.                                                                                                                                                 |
| `search / options / pagination`                              | `false`                       | [ProTable props](./pro-table#props); enable explicitly.                                                                                                                                                                   |
| `cardProps`                                                  | `false`                       | Outer [ProCard](./pro-card#props), not itemCardProps.                                                                                                                                                                     |
| `BaseProList.toolBarRender`                                  | `false`                       | Hides the whole toolbar by default; can be overridden.                                                                                                                                                                    |
| `form`                                                       | —                             | Native [Form props](https://www.antdv-next.com/components/form) plus [submitter](./pro-form#submitter); see ProTable.                                                                                                     |
| `editable`                                                   | —                             | [Editable configuration](./pro-table#editable), using the shared field renderer.                                                                                                                                          |
| `rowSelection`                                               | —                             | Shared [Table rowSelection API](https://www.antdv-next.com/components/table); list consumes type, selectedRowKeys, defaultSelectedRowKeys, getCheckboxProps, onSelect and onChange.                                       |
| `expandable`                                                 | —                             | Shared [Table expandable API](https://www.antdv-next.com/components/table); list consumes defaultExpandedRowKeys, expandedRowKeys, rowExpandable, expandRowByClick, expandedRowRender, onExpand and onExpandedRowsChange. |

### List columns and metas {#columns}

| Property                                                                          | Type                                                                                      | Default                  | Description / source                                                                                                                                                                              |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `listSlot`                                                                        | `'title' \| 'subTitle' \| 'description' \| 'avatar' \| 'content' \| 'actions' \| 'extra'` | —                        | Target list region; falls back to dataIndex.                                                                                                                                                      |
| `cardActionProps`                                                                 | `'extra' \| 'actions'`                                                                    | `extra`                  | Grid action placement: header extra or card footer.                                                                                                                                               |
| `dataIndex`                                                                       | `ProDataIndex`                                                                            | metas key                | Field path; metas key is used only when not explicitly supplied.                                                                                                                                  |
| `valueType`                                                                       | `ProColumnValueType<T>`                                                                   | `avatar / option / text` | metas.avatar defaults to avatar, actions to option, and other regions to text.                                                                                                                    |
| `valueEnum / fieldProps / formItemProps / request / params / render / renderText` | [ProColumns](./pro-table#columns)                                                         | —                        | Shared [column API](./pro-table#columns); fieldProps targets the [valueType input](./pro-form-fields#props); formItemProps targets native [FormItem](https://www.antdv-next.com/components/form). |

### Grid configuration {#grid}

| Property                       | Type     | Default             | Description                                                                  |
| ------------------------------ | -------- | ------------------- | ---------------------------------------------------------------------------- |
| `gutter`                       | `number` | `16`                | Gap in pixels.                                                               |
| `column`                       | `number` | `1`                 | Initial cards per row.                                                       |
| `xs / sm / md / lg / xl / xxl` | `number` | previous breakpoint | Cards per row at each breakpoint; omitted values inherit the previous count. |

### Events {#events}

| Event / callback                  | Parameters                                | Description / source                                                              |
| --------------------------------- | ----------------------------------------- | --------------------------------------------------------------------------------- |
| ProTable events                   | [Full event table](./pro-table#events)    | Forwarded by both components, including data, loading, paging and editing events. |
| `update:dataSource`               | `(rows: T[])`                             | Controlled data update; use v-model:dataSource.                                   |
| `rowSelection.onChange`           | `(keys, rows, { type: 'single' })`        | Selection request; update controlled selectedRowKeys in the caller.               |
| `rowSelection.onSelect`           | `(record, selected, selectedRows, event)` | Individual selection.                                                             |
| `expandable.onExpand`             | `(expanded: boolean, record: T)`          | Expand request.                                                                   |
| `expandable.onExpandedRowsChange` | `(keys: ProKey[])`                        | Expanded-key request; update controlled keys in the caller.                       |

### Slots {#slots}

| Slot                                              | Scope                                | Description / source                                                                             |
| ------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------ |
| `title / description / content / extra / actions` | `{ record: T, index: number }`       | Replaces a list region; ordinary description/content/extra require the matching meta.            |
| `avatar / subTitle`                               | `{ record: T, index: number }`       | Grid-only region slots; ordinary lists use corresponding column render functions.                |
| `expandedRowRender`                               | `{ record: T, index: number }`       | Expanded content, overriding expandable.expandedRowRender.                                       |
| ProTable slots                                    | [Full slot table](./pro-table#slots) | Forwarded to the outer table frame as well; overlapping slot names may receive different scopes. |

### Instance {#instance}

Both refs expose the complete [ProTableInstance method table](./pro-table#instance), including reload/reset, data access, paging, selection and editing. The outer ProTable determines the target of fullscreen and scrollTo.

### Semantic styles {#styles}

| Parts                                                                                                     | Behavior                                                                                       |
| --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `root / container / row / header / title / subTitle / description / content / extra / actions / expanded` | List-renderer nodes. classes overrides classNames; styles accepts a map or ({ props }) => map. |

The list root is transparent. Grid cards retain their own background and padding; itemCardProps and cardActionProps apply to grid cards. Language, direction and native tokens inherit [ConfigProvider](https://www.antdv-next.com/components/config-provider); Pro tokens use [ProConfigProvider](./pro-config-provider#props).
