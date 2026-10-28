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

| Prop                                                      | Behavior                                                                                       |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `dataSource` / `defaultDataSource` / `request` / `params` | ProTable controlled, local and remote data; request returns `{ data, total?, success? }`       |
| `rowKey`                                                  | Stable record identifier; set it explicitly                                                    |
| `columns` / `metas`                                       | `ProListColumn<T>[]` / `ProListMetas<T>`                                                       |
| `grid`                                                    | `{ gutter?, column?, xs?, sm?, md?, lg?, xl?, xxl? }`; numbers specify items per row           |
| `itemLayout`                                              | horizontal or vertical                                                                         |
| `split`                                                   | Dividers, enabled by default                                                                   |
| `showActions` / `showExtra`                               | always or hover; hover content also appears on keyboard focus within the row                   |
| `itemRender`                                              | `(record, index, defaultDom) => VNodeChild`, replaces the entire item                          |
| `itemTitleRender` / `itemHeaderRender`                    | The same signature for the title or header; false hides that region                            |
| `onItem` / `onRow`                                        | `(record, index) => HTMLAttributes`, merged onto the list row                                  |
| `rowClassName`                                            | String or `(record, index) => string`                                                          |
| `rowSelection`                                            | ProTable selection configuration, including controlled keys, radio/checkbox and disabled items |
| `expandable`                                              | Controlled expansion, callbacks and expandedRowRender                                          |
| `prefixCls` / `classes` / `styles`                        | Prefix and semantic styles                                                                     |

ProList disables search, options and pagination by default; pass explicit configurations to enable them. Other request, toolbar and editing props follow ProTable. BaseProList additionally defaults cardProps, search and toolBarRender to false; each default can be overridden.

With grid enabled, each item uses the existing ProCard. Pass card props through itemCardProps. Set cardActionProps="actions" on the actions schema, such as metas.actions, to place actions in the card footer; extra or an omitted value places them in the header extra region. Grid breakpoint numbers specify cards per row.

## Events, slots and ref

Data, pagination and editing events follow ProTable. Use `v-model:dataSource` for controlled data, `rowSelection.onChange` for selection, and expandable callbacks for expansion.

| Slot                                                      | Scope                                                                                                      |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `title` / `description` / `content` / `extra` / `actions` | `{ record, index }`, replaces that list region                                                             |
| `expandedRowRender`                                       | `{ record, index }`, replaces expanded content                                                             |
| ProTable slots                                            | Also forwarded to the outer table framework; shared names may receive scopes from both rendering positions |

The component ref exposes `ProTableInstance<T>`, including reload, reset, setPageInfo, clearSelected, getRowData, getRowsData, setRowData, startEditable, saveEditable and cancelEditable. BaseProList forwards the same instance API.

## Styling and configuration

Classes/styles accept a map or `({ props }) => map`. Consumed list parts are root, container, row, header, title, subTitle, description, content, extra, actions and expanded. Legacy classNames remains compatible; classes wins for matching parts.

The default public prefix is ant-pro-list. A native ConfigProvider with prefixCls="demo" produces demo-pro-list; the list prefixCls can override it. Locale, direction, theme algorithms, global tokens and native component tokens follow ConfigProvider. Configure Pro extension tokens through [ProConfigProvider.token](./pro-config-provider).

## Boundaries

Only supported listSlot regions are rendered; arbitrary schema keys do not create extra regions. ItemCardProps and cardActionProps target grid cards; regular lists use their own action region. Inherited methods such as fullScreen and scrollTo act through the surrounding ProTable.
