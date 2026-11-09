---
pageClass: component-doc
---

<script setup>
import AdaptiveProTableDemo from '../../examples/AdaptiveProTableDemo.vue'
</script>

# AdaptiveProTable

`AdaptiveProTable` is a separately maintained wrapper around [ProTable](./pro-table). It only adds the `adaptive-table` class and layout styles, forwarding all other props, events, slots and instance methods. The search form, toolbar and pagination keep their natural height, while the table body fills the remaining container space.

## Example

Change the container height, expand the search form or clear the data to see the body resize without measuring the surrounding controls.

<ClientOnly><AdaptiveProTableDemo /></ClientOnly>

<<< ../../examples/AdaptiveProTableDemo.vue

## Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { AdaptiveProTable, type ProColumns, type ProTableInstance } from '@bubblesjs/antdv-next-pro'
import '@bubblesjs/antdv-next-pro/style.css'

type User = { id: number; name: string }
const table = ref<ProTableInstance<User>>()
const columns: ProColumns<User>[] = [{ title: 'Name', dataIndex: 'name' }]
const rows: User[] = [{ id: 1, name: 'Ada' }]
</script>

<template>
  <div style="height: 600px; min-height: 0">
    <AdaptiveProTable
      ref="table"
      :columns="columns"
      :data-source="rows"
      row-key="id"
      :scroll="{ y: '100%' }"
    />
  </div>
</template>
```

The component is also registered globally by `app.use(AntdvNextPro)`.

## Container height

Reserve enough height for the expanded search form, toolbar and pagination. On narrow screens, search fields stack vertically and need more space.

The parent must have a definite available height: a fixed height, `calc(100vh - 160px)`, or the remaining space in a bounded flex layout. Set `min-height: 0` on intermediate flex items so they can shrink. Use the base ProTable for pages that grow naturally with their content.

## API and forwarding

This wrapper adds no public business properties. Generic parameters, defaults, controlled behavior and precedence match ProTable; only the `adaptive-table` class and layout styles are added.

### Properties {#props}

| Property                      | Type                       | Default           | Description and source                                                                                                                                                                                                      |
| ----------------------------- | -------------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `class`                       | `ClassValue`               | —                 | Merges caller classes and adds adaptive-table.                                                                                                                                                                              |
| `style`                       | `StyleValue`               | —                 | Passed to the ProTable root.                                                                                                                                                                                                |
| `columns`                     | `ProColumns<T>[]`          | required          | Every column property is listed in [ProTable columns](./pro-table#columns).                                                                                                                                                 |
| `scroll.x`                    | `number \| string \| true` | —                 | Forwards horizontal scroll width.                                                                                                                                                                                           |
| `scroll.y`                    | `number \| string`         | —                 | Forwards scroll-body height; explicitly set it, e.g. `'100%'`, for internal scrolling.                                                                                                                                      |
| All ProTable properties       | `ProTableProps<T, P>`      | ProTable defaults | See [ProTable properties](./pro-table#props), and nested [search](./pro-table#search), [form](./pro-table#form), [toolbar](./pro-table#toolbar), [pagination](./pro-table#pagination) and [editable](./pro-table#editable). |
| Other native Table properties | `TableProps<T>`            | native defaults   | Forwarded through ProTable; see [antdv-next Table API](https://www.antdv-next.com/components/table).                                                                                                                        |

### Events {#events}

| Event                  | Arguments        | Source                                                                             |
| ---------------------- | ---------------- | ---------------------------------------------------------------------------------- |
| `update:data-source`   | `rows: T[]`      | Controlled rows; see [ProTable events](./pro-table#events).                        |
| `update:editable-keys` | `keys: ProKey[]` | Controlled editing keys; see [ProTable events](./pro-table#events).                |
| All other events       | unchanged        | [Complete ProTable events and callbacks](./pro-table#events), forwarded unchanged. |

### Slots {#slots}

| Slot              | Arguments                                            | Source                                                                                                                                      |
| ----------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `toolbar-actions` | `{ action: ProTableInstance<T>, selectedRows: T[] }` | Before toolBarRender; see [ProTable slots](./pro-table#slots).                                                                              |
| All other slots   | unchanged                                            | Includes toolbar-title, dynamic header-/cell-, before-table/after-table and native slots; see the [complete slot table](./pro-table#slots). |

### Instance {#instance}

| Instance type         | Methods and return types                                                                                                                                    |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ProTableInstance<T>` | Inherits [all ProTable methods](./pro-table#instance): reload/reset, pagination, selection, scrolling, fullscreen, editing and row access; adds no methods. |

Search, toolbar, pagination and selection alerts keep their natural heights. Styles target the default Card, Spin and Table structure; wrappers added through `tableRender/tableViewRender/searchFormRender` need matching flex height constraints. Native virtual tables require numeric `scroll.y`.

## Upstream synchronization

This is a user-maintained extension in `packages/src/adaptive-pro-table/`. Preserve this directory, package exports, documentation and playground entries when syncing upstream pro-components. If upstream DOM changes, adapt this wrapper without adding adaptive branches to the base ProTable. See the repository root `AGENTS.md` for the complete maintenance rules.
