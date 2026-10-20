---
pageClass: component-doc
---

<script setup>
import ProCardDemo from '../../examples/ProCardDemo.vue'
</script>

# ProCard

`ProCard` builds on Antdv Next Card to share theme backgrounds, rounded corners, spacing, and collapse behavior across standalone content, query forms, and tables. The basic card follows ProComponents `3.1.15-7`.

## Example

<ClientOnly>
  <ProCardDemo />
</ClientOnly>

<details class="demo-source">
<summary>View source</summary>

<<< ../../examples/ProCardDemo.vue

</details>

```vue
<script setup lang="ts">
import { ProCard } from '@bubblesjs/antv-next-pro'
import { ref } from 'vue'
import '@bubblesjs/antv-next-pro/style.css'

const collapsed = ref(false)
</script>

<template>
  <ProCard v-model:collapsed="collapsed" title="User details" variant="borderless" collapsible>
    <template #extra>Actions</template>
    Card content
  </ProCard>
</template>
```

## Theme and layout

The native Card owns the background and radius, including ConfigProvider dark algorithms and `theme.components.Card` overrides. Body padding defaults to 24px, or 12px for small cards. An omitted `size` inherits ConfigProvider. Headers have no separator by default; enable `headerBordered` to show it.

Use `variant="borderless"` for a borderless card. `ghost` makes the background transparent and removes borders, shadows, and body padding. Normal borders follow the underlying Card configuration.

ProTable already uses two borderless ProCards: a query card above a card containing the toolbar, table, and pagination. An additional outer card is unnecessary.

## Collapse and loading

`collapsible` and `collapsible="header"` toggle from the title area. `collapsible="icon"` only toggles from the collapse button. Extra actions and interactive title content do not toggle the card. The button supports Enter and Space.

Use `defaultCollapsed` for uncontrolled state or `v-model:collapsed` for controlled state. Collapsing hides the body while preserving its components and inputs. `loading` shows the native skeleton; `#loading` replaces it. Normal content unmounts while loading.

## API

| Prop                              | Type                                                  | Default / behavior                                       |
| --------------------------------- | ----------------------------------------------------- | -------------------------------------------------------- |
| `title` / `subTitle` / `extra`    | `VNodeChild`                                          | Named slots take precedence                              |
| `tooltip`                         | `string`                                              | Title hint                                               |
| `size`                            | `'default' \| 'small'`                                | Inherits ConfigProvider                                  |
| `type`                            | `'default' \| 'inner'`                                | Normal or inner card                                     |
| `variant`                         | `'outlined' \| 'borderless'`                          | Inherits Card configuration                              |
| `bordered`                        | `boolean`                                             | Legacy alias; `variant` wins                             |
| `headerBordered`                  | `boolean`                                             | `false`; inner cards retain native inner header styles   |
| `ghost` / `hoverable` / `loading` | `boolean`                                             | `false`                                                  |
| `collapsible`                     | `boolean \| 'header' \| 'icon'`                       | `false`                                                  |
| `collapsed`                       | `boolean`                                             | Controlled; supports `v-model:collapsed`                 |
| `defaultCollapsed`                | `boolean`                                             | `false`; initial uncontrolled state only                 |
| `cover` / `actions`               | Corresponding native `CardProps` types                | Cover and bottom actions; also available as slots        |
| `styles`                          | `Partial<Record<ProCardSemanticName, CSSProperties>>` | Semantic styles; use CSS length strings such as `'16px'` |
| `classNames`                      | `Partial<Record<ProCardSemanticName, string>>`        | Semantic class names                                     |
| `headStyle` / `bodyStyle`         | `CSSProperties`                                       | Legacy aliases; semantic styles take precedence          |

Semantic positions: `root`, `header`, `body`, `extra`, `title`, `actions`, and `cover`. A collapsed body's `display: none` takes precedence over custom styles.

```vue
<ProCard
  title="Compact content"
  :styles="{ body: { padding: '16px' } }"
  :class-names="{ body: 'my-card-body' }"
/>
```

| Event              | Payload                                               |
| ------------------ | ----------------------------------------------------- |
| `update:collapsed` | `(collapsed: boolean)` requests a parent state update |
| `collapse`         | `(collapsed: boolean)` fires on user toggle           |

Slots: `default`, `title`, `subTitle`, `extra`, `cover`, `actions`, `loading`, and `collapsibleIcon`. The icon slot receives `{ collapsed: boolean }`.

Named exports: `ProCard`, `ProCardProps`, `ProCardSlots`, and `ProCardSemanticName`. The default plugin registers ProCard globally.

This implementation covers the basic card. Tabs, split grids, `ProCard.Group`, `ProCard.Divider`, StatisticCard, and CheckCard are outside its current scope.
