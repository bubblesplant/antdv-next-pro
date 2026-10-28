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

## API

ProTable provides the collapse arrows and labels. Options such as `search` and `scroll` are passed through unchanged. Set `scroll.y: '100%'` explicitly for a fixed header and internal body scrolling.

Props, events, slots and generic parameters match [ProTable](./pro-table). Refs use `ProTableInstance<T>` and retain methods such as `reload()`, `reset()`, `setPageInfo()`, `scrollTo()` and editing actions.

| Setting                                         | Behavior                                                             |
| ----------------------------------------------- | -------------------------------------------------------------------- |
| Root class                                      | Adds `adaptive-table` and preserves the caller's `class` and `style` |
| `scroll.y`                                      | Passed through; the caller configures the body scroll height         |
| `scroll.x`                                      | Passed through for horizontal scrolling                              |
| Search, toolbar, pagination and selection alert | Keep their natural height                                            |
| `search: false` / `pagination: false`           | Retain the base behavior                                             |

Styles target the default Card, Spin and Table structure. Additional wrappers introduced by `tableRender`, `tableViewRender` or `searchFormRender` need matching flex height constraints. Native virtual tables require an explicit numeric `scroll.y`.

## Upstream synchronization

This is a user-maintained extension in `packages/src/adaptive-pro-table/`. Preserve this directory, package exports, documentation and playground entries when syncing upstream pro-components. If upstream DOM changes, adapt this wrapper without adding adaptive branches to the base ProTable. See the repository root `AGENTS.md` for the complete maintenance rules.
