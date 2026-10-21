---
pageClass: component-doc
---

<script setup>
import ProCardDemo from '../../examples/ProCardDemo.vue'
</script>

# ProCard

`ProCard` builds on Antdv Next Card with theme containers, collapse, responsive columns, separators, checked state, and tabs. It follows ProComponents `3.1.15-7`, pinned to `3bf43278d39f2d31489749132982488f57a9eb5e`.

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
import { ref } from 'vue'
import { ProCard } from '@bubblesjs/antv-next-pro'
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

## Theme and prefixes

The native Card retains ConfigProvider theme algorithms, global tokens, and `theme.components.Card`. Backgrounds, radius, body spacing, and sizing follow that configuration. An omitted `size` inherits ConfigProvider. Configure Pro extensions through [ProConfigProvider.token](./pro-config-provider); `theme.components.ProCard` is not a library configuration entry.

Pro classes default to `ant-pro-card`. Native `prefixCls="demo"` produces `demo-pro-card`. An explicit component prefix is complete, such as `prefixCls="business-card"`. Native Card classes remain on the root, and the regular `class` is appended independently.

Headers have no separator by default; enable `headerBordered` to show it. `variant="borderless"` removes the border. `ghost` provides a transparent background without borders, shadows, or body padding. Regular borders follow the native Card configuration.

## Responsive columns and members

The parent wraps direct child ProCards in columns. Numeric `colSpan` values use a 24-column grid; strings set the width and `0` hides a column. Responsive maps use `xs/sm/md/lg/xl/xxl` and update with the window width. Set `colStyle` on the parent to style each child column wrapper.

```vue
<ProCard :gutter="[16, 12]" wrap>
  <ProCard title="Left" :col-span="{ xs: 24, md: 8 }">Left content</ProCard>
  <ProCard title="Right" :col-span="{ xs: 24, md: 16 }">Right content</ProCard>
</ProCard>
```

`direction="row"` arranges cards horizontally; `direction="column"` arranges them vertically. `wrap` allows wrapping. `gutter` accepts a number, a responsive map, or a `[horizontal, vertical]` array. `split="vertical"` separates side-by-side cards, while `split="horizontal"` separates stacked cards. `layout="center"` centers content.

`ProCard.Group` / named `ProCardGroup` uses a transparent parent card and defaults to a row. `ProCard.Divider` / `ProCardDivider` renders a separator with `type="vertical"` by default, or `horizontal`.

## Tabs

`tabs` accepts native Antdv Next Tabs configuration, including `items`, `defaultActiveKey`, controlled `activeKey`, `onChange`, and item `disabled`. Use the native `content` property for each panel:

```vue
<ProCard
  title="Details"
  :tabs="{
    defaultActiveKey: 'overview',
    items: [
      { key: 'overview', label: 'Overview', content: 'Overview content' },
      { key: 'history', label: 'History', content: 'History content' },
      { key: 'disabled', label: 'Unavailable', disabled: true, content: 'Unavailable content' },
    ],
    cardProps: { ghost: true },
  }"
  @tab-change="(key) => console.log(key)"
/>
```

`tabs.cardProps.ghost` controls the compact transparent tab-content state. The entire object is not forwarded as a card configuration to every panel; this matches the pinned upstream usage. `ProCard.TabPane` / `ProCardTabPane` preserves historical website usage with `key`, `tab`, `disabled`, and a `cardProps` object configuring that pane's own card. Prefer `tabs.items` for new usage. TabPane is a compatibility member rather than an export present in the pinned upstream commit.

## Collapse, loading, and checked state

`collapsible` and `collapsible="header"` toggle from the title area. `collapsible="icon"` toggles only from the collapse button. Extra actions, interactive title controls, and nested cards do not collapse the parent. The button supports Enter and Space, with localized labels.

Use `defaultCollapsed` for an uncontrolled initial value or `v-model:collapsed` for controlled state. Collapsing hides content and preserves input state. `loading` uses the native Card loading state, replaceable through `#loading`. Ordinary content unmounts while loading.

Providing `checked` enables controlled selection. Click, Enter, and Space emit `checked`; the parent updates the value. `disabled` prevents selection and collapse and inherits native global disabled state when omitted. `boxShadow` uses the active theme shadow.

## API

| Prop                         | Type                                                | Behavior                                          |
| ---------------------------- | --------------------------------------------------- | ------------------------------------------------- |
| `title/subTitle/extra`       | `VNodeChild`                                        | Named slots take precedence                       |
| `tooltip`                    | `string \| TooltipProps`                            | Object options reach the actual Tooltip           |
| `prefixCls`                  | `string`                                            | Complete Pro card prefix                          |
| `layout`                     | `'default' \| 'center'`                             | Content alignment                                 |
| `direction`                  | `'row' \| 'column'`                                 | Child-card direction                              |
| `wrap`                       | `boolean`                                           | Allows wrapping                                   |
| `colSpan`                    | `number \| string \| responsive map`                | Grid span or column width                         |
| `colStyle`                   | `CSSProperties`                                     | Parent styles applied to child column wrappers    |
| `gutter`                     | `responsive number \| responsive number[]`          | Horizontal or two-axis spacing                    |
| `split`                      | `'vertical' \| 'horizontal'`                        | Separator direction                               |
| `checked/disabled/boxShadow` | `boolean`                                           | Controlled selection, disabled state, shadow      |
| `tabs`                       | `TabsProps & { cardProps?: ProCardProps }`          | Tabs; cardProps uses ghost only                   |
| `size`                       | `'default' \| 'small'`                              | Inherits ConfigProvider by default                |
| `type`                       | `'default' \| 'inner'`                              | Regular or inner card                             |
| `variant`                    | `'outlined' \| 'borderless'`                        | Takes precedence over legacy bordered             |
| `bordered/headerBordered`    | `boolean`                                           | Card border and header separator                  |
| `ghost/hoverable/loading`    | `boolean`                                           | Transparent, hover, and loading states            |
| `collapsible`                | `boolean \| 'header' \| 'icon'`                     | Collapse trigger                                  |
| `collapsed/defaultCollapsed` | `boolean`                                           | Controlled state or uncontrolled initial value    |
| `collapsibleIconRender`      | `({ collapsed }) => VNodeChild`                     | Custom collapse icon                              |
| `cover/actions`              | Corresponding `CardProps` types                     | Cover and bottom actions, also available as slots |
| `classes/styles`             | Semantic object or `({ props }) => semantic object` | Semantic classes and styles                       |
| `classNames`                 | Semantic class object                               | Legacy entry; classes wins for the same part      |
| `headStyle/bodyStyle`        | `CSSProperties`                                     | Legacy entry; styles wins for the same part       |

Semantic parts are `root/header/body/extra/title/actions/cover`. Inner structure uses prefixed `title-heading/content/sub-title/collapsible-icon` classes. Root `class` remains independent. A collapsed body's `display:none` overrides custom styles.

```vue
<ProCard
  title="Compact content"
  class="business-card"
  :classes="({ props }) => ({ body: props.loading ? 'body-loading' : 'body-ready' })"
  :styles="{ body: { padding: '16px' } }"
/>
```

| Event              | Payload                                                               |
| ------------------ | --------------------------------------------------------------------- |
| `update:collapsed` | `(collapsed: boolean)`                                                |
| `collapse`         | `(collapsed: boolean)` on user toggle                                 |
| `checked`          | `(event: MouseEvent \| KeyboardEvent)` requesting a controlled update |
| `tabChange`        | `(key: string)`                                                       |

Slots: `default/title/subTitle/extra/cover/actions/loading/collapsibleIcon`. `collapsibleIcon` receives `{ collapsed: boolean }` and takes precedence over `collapsibleIconRender`.

Exports include `ProCard/ProCardGroup/ProCardDivider/ProCardTabPane` and `ProCardProps/ProCardSlots/ProCardSemanticName`. The default plugin registers the components.
