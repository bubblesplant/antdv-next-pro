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
import { ProCard } from '@bubblesjs/antdv-next-pro'
import '@bubblesjs/antdv-next-pro/style.css'

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

Cards have no shadow by default. ProTable uses this behavior for both its search and table cards. Enable `boxShadow` for a theme shadow, use `hoverable` for a shadow on hover, or customize it through `styles.root.boxShadow`.

`boxShadow` uses `boxShadowTertiary`; `ghost` takes precedence over the built-in shadow. Card's `headerPadding/headerPaddingSM` control horizontal header spacing. Headers without a separator use `padding` vertically, or `paddingXS` for small cards.

Regular cards inherit native Card borders, radius, body spacing, and title weight, following the ProComponents 3.x regular Card path. These defaults differ from the stable 2.x website.

## Responsive columns and members

The parent wraps direct child ProCards in columns. Numeric `colSpan` values use a 24-column grid; strings set the width and `0` hides a column. Responsive maps use `xs/sm/md/lg/xl/xxl` and update with the window width. Set `colStyle` on the parent to style each child column wrapper.

```vue
<ProCard :gutter="[16, 12]" wrap>
  <ProCard title="Left" :col-span="{ xs: 24, md: 8 }">Left content</ProCard>
  <ProCard title="Right" :col-span="{ xs: 24, md: 16 }">Right content</ProCard>
</ProCard>
```

`direction="row"` arranges cards horizontally; `direction="column"` arranges them vertically. `wrap` allows wrapping. `gutter` accepts a number, a responsive map, or a `[horizontal, vertical]` array. `split="vertical"` separates side-by-side cards, while `split="horizontal"` separates stacked cards. `layout="center"` centers content.

Cards containing child ProCards, including fragments produced by `v-for`, and cards with `split` default to zero body padding. Explicit `bodyStyle/styles.body` can override it. Setting only `direction/gutter` leaves ordinary content layout unchanged. Separators follow the theme's `lineWidth/lineType/colorSplit`.

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

Tabs manage navigation and content spacing separately, with zero outer Card body padding by default. Override semantic parts through `tabs.styles`; `tabs.cardProps.ghost` defaults tab content padding to zero.

## Collapse, loading, and checked state

`collapsible` and `collapsible="header"` toggle from the title area. `collapsible="icon"` toggles only from the collapse button. Extra actions, interactive title controls, and nested cards do not collapse the parent. The button supports Enter and Space, with localized labels.

Use `defaultCollapsed` for an uncontrolled initial value or `v-model:collapsed` for controlled state. Collapsing hides content and preserves input state. `loading` uses the native Card loading state, replaceable through `#loading`. Ordinary content unmounts while loading.

Providing `checked` enables controlled selection. Click, Enter, and Space emit `checked`; the parent updates the value. `disabled` prevents selection and collapse and inherits native global disabled state when omitted. `boxShadow` uses the active theme shadow.

Checked cards use the theme's `controlItemBgActive/controlOutline` for their background and border, with a primary-colored corner marker.

## API

### Props {#props}

| Property                | Type                                                         | Default                       | Description / source                                                                                                                         |
| ----------------------- | ------------------------------------------------------------ | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`                 | `VNodeChild`                                                 | —                             | Heading; the title slot takes precedence.                                                                                                    |
| `subTitle`              | `VNodeChild`                                                 | —                             | Subtitle; the subTitle slot takes precedence.                                                                                                |
| `extra`                 | `VNodeChild`                                                 | —                             | Header actions; the extra slot takes precedence.                                                                                             |
| `tooltip`               | `string \| TooltipProps`                                     | —                             | Tooltip text or [Tooltip props](https://www.antdv-next.com/components/tooltip).                                                              |
| `prefixCls`             | `string`                                                     | `ant-pro-card`                | Full prefix, inherited from the Pro/native provider.                                                                                         |
| `layout`                | `'default' \| 'center'`                                      | `default`                     | Centers ordinary content when set to center.                                                                                                 |
| `direction`             | `'row' \| 'column'`                                          | `row`                         | Direction of child cards.                                                                                                                    |
| `wrap`                  | `boolean`                                                    | `false`                       | Allows child cards to wrap.                                                                                                                  |
| `colSpan`               | `ProResponsiveValue<number \| string>`                       | —                             | 24-column span or CSS width inside a parent card; 0 hides the column.                                                                        |
| `colStyle`              | `CSSProperties`                                              | —                             | Style applied by the parent to child column wrappers.                                                                                        |
| `gutter`                | `ProResponsiveValue<number> \| ProResponsiveValue<number>[]` | `0`                           | Horizontal gap or [horizontal, vertical]; responsive keys: xs/sm/md/lg/xl/xxl.                                                               |
| `split`                 | `'vertical' \| 'horizontal'`                                 | —                             | Divider direction between child cards.                                                                                                       |
| `checked`               | `boolean`                                                    | `undefined`                   | Enables controlled selection; handle the checked event to update it.                                                                         |
| `disabled`              | `boolean`                                                    | Inherited from ConfigProvider | Disables selection and collapse; inherits ConfigProvider when omitted.                                                                       |
| `boxShadow`             | `boolean`                                                    | `false`                       | Enables the theme boxShadowTertiary shadow.                                                                                                  |
| `tabs`                  | `TabsProps & { cardProps?: ProCardProps }`                   | —                             | Passes to [Tabs](https://www.antdv-next.com/components/tabs); items take precedence over TabPane children; only cardProps.ghost is consumed. |
| `collapsibleIconRender` | `({ collapsed: boolean }) => VNodeChild`                     | —                             | Custom collapse icon; the collapsibleIcon slot takes precedence.                                                                             |
| `cover`                 | `CardProps['cover']`                                         | —                             | Native [Card cover](https://www.antdv-next.com/components/card); hidden when collapsed; the slot takes precedence.                           |
| `actions`               | `CardProps['actions']`                                       | —                             | Native [Card actions](https://www.antdv-next.com/components/card); hidden when collapsed; the slot takes precedence.                         |
| `size`                  | `'default' \| 'small'`                                       | Inherited from ConfigProvider | Inherits ConfigProvider; default maps to native medium.                                                                                      |
| `type`                  | `'default' \| 'inner'`                                       | `default`                     | Native [Card type](https://www.antdv-next.com/components/card).                                                                              |
| `variant`               | `'outlined' \| 'borderless'`                                 | Inherited from Card           | Overrides bordered; ghost forces borderless.                                                                                                 |
| `bordered`              | `boolean`                                                    | `undefined`                   | Legacy border setting; omitted values follow native Card.                                                                                    |
| `headerBordered`        | `boolean`                                                    | `false`                       | Shows a header divider; inner cards also show it.                                                                                            |
| `ghost`                 | `boolean`                                                    | `false`                       | Transparent background with no border, shadow or body padding.                                                                               |
| `hoverable`             | `boolean`                                                    | `false`                       | Enables native Card hover styling.                                                                                                           |
| `loading`               | `boolean`                                                    | `false`                       | Native Card skeleton, replaced by the loading slot when present.                                                                             |
| `collapsible`           | `boolean \| 'header' \| 'icon'`                              | `false`                       | true/header uses the header; icon restricts toggling to the icon.                                                                            |
| `collapsed`             | `boolean`                                                    | `undefined`                   | Controlled collapsed state; supports v-model:collapsed.                                                                                      |
| `defaultCollapsed`      | `boolean`                                                    | `false`                       | Initial uncontrolled collapsed state.                                                                                                        |
| `headStyle`             | `CSSProperties`                                              | —                             | Legacy header styles; styles.header takes precedence.                                                                                        |
| `bodyStyle`             | `CSSProperties`                                              | —                             | Legacy body styles; styles.body takes precedence.                                                                                            |
| `classes`               | `SemanticClasses \| ({ props }) => SemanticClasses`          | —                             | Semantic class names, overriding classNames.                                                                                                 |
| `classNames`            | `Partial<Record<ProCardSemanticName, string>>`               | —                             | Legacy semantic class-name map.                                                                                                              |
| `styles`                | `SemanticStyles \| ({ props }) => SemanticStyles`            | —                             | Semantic styles; see supported parts below.                                                                                                  |

Other attributes pass through to the root [Antdv Next Card](https://www.antdv-next.com/components/card). The component owns title, extra, cover, actions, variant, size, type, loading, classes and styles; use the documented Pro properties for these entries. `class/style/id/data-*/aria-*` target the root. Responsive breakpoints are 0/576/768/992/1200/1600px.

### Events {#events}

| Event              | Parameters                             | Description                                           |
| ------------------ | -------------------------------------- | ----------------------------------------------------- |
| `update:collapsed` | `(collapsed: boolean)`                 | Controlled collapse update.                           |
| `collapse`         | `(collapsed: boolean)`                 | User collapse toggle.                                 |
| `checked`          | `(event: MouseEvent \| KeyboardEvent)` | Selection request; update checked in the parent.      |
| `tabChange`        | `(key: string)`                        | Active tab changed; native tabs.onChange is retained. |

### Slots {#slots}

| Slot              | Scope                    | Description                                |
| ----------------- | ------------------------ | ------------------------------------------ |
| `default`         | —                        | Card body or legacy TabPane children.      |
| `title`           | —                        | Overrides title.                           |
| `subTitle`        | —                        | Overrides subTitle.                        |
| `extra`           | —                        | Overrides extra.                           |
| `cover`           | —                        | Overrides cover; hidden while collapsed.   |
| `actions`         | —                        | Overrides actions; hidden while collapsed. |
| `loading`         | —                        | Replaces the skeleton when loading.        |
| `collapsibleIcon` | `{ collapsed: boolean }` | Overrides collapsibleIconRender.           |

### Instance {#instance}

No component-specific instance methods are exposed. Control collapse with `v-model:collapsed` and tabs through `tabs.activeKey`.

### Composition members {#members}

| Property                         | Type                         | Default                     | Description / source                                                                       |
| -------------------------------- | ---------------------------- | --------------------------- | ------------------------------------------------------------------------------------------ |
| `ProCard.Group` / `ProCardGroup` | `ProCardProps`               | `ghost=true, direction=row` | [Card props](#props); ghost is always enabled; direction only preserves column explicitly. |
| `ProCard.Divider.type`           | `'vertical' \| 'horizontal'` | `vertical`                  | Divider orientation; other attrs target the separator div.                                 |
| `ProCard.TabPane.tab`            | `VNodeChild`                 | —                           | Legacy tab label read by the parent.                                                       |
| `ProCard.TabPane.cardProps`      | `ProCardProps`               | —                           | [Panel card props](#props); explicit attrs override matching cardProps.                    |
| `ProCard.TabPane key / disabled` | `string \| number / boolean` | —                           | VNode key and attrs read by parent tab navigation; prefer tabs.items.                      |

Group and TabPane forward Card slots and events; Divider has no slots, events or methods. None adds instance methods.

### Semantic styles {#styles}

| Part      | Target         |
| --------- | -------------- |
| `root`    | Root Card      |
| `header`  | Header         |
| `body`    | Body           |
| `extra`   | Header extra   |
| `title`   | Title          |
| `actions` | Footer actions |
| `cover`   | Cover          |

`classes` overrides legacy `classNames`; `styles.header/body` overrides headStyle/bodyStyle. Collapsed body display remains hidden. Native theme configuration uses [ConfigProvider](https://www.antdv-next.com/components/config-provider) and `theme.components.Card`; Pro tokens use [ProConfigProvider](./pro-config-provider#props).
