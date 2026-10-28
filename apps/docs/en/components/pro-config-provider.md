---
pageClass: component-doc
---

<script setup>
import ProConfigProviderDemo from '../../examples/ProConfigProviderDemo.vue'
</script>

# ProConfigProvider

Every Pro component inherits its nearest Antdv Next `ConfigProvider`: locale, theme algorithms, global tokens, native component tokens, prefix, direction, size, disabled state and popup container. `ProConfigProvider` adds Pro translations, custom value types and local Pro token overrides.

<ClientOnly><ProConfigProviderDemo /></ClientOnly>

<<< ../../examples/ProConfigProviderDemo.vue

## Configuration

| Target                       | Entry                                             |
| ---------------------------- | ------------------------------------------------- |
| Global tokens and algorithms | `ConfigProvider.theme.token` / `algorithm`        |
| Native component tokens      | `ConfigProvider.theme.components.Card/Result/...` |
| Pro custom areas             | `ProConfigProvider.token`                         |
| Pro translations             | `ProConfigProvider.intl`                          |
| Custom value types           | `ProConfigProvider.valueTypeMap`                  |

`theme.components.Result` customizes native Result. The native components map does not add `ProTable` or `ProCard` keys; use the Pro provider for Pro token overrides.

## Props

| Prop             | Type / default    | Behavior                                                                      |
| ---------------- | ----------------- | ----------------------------------------------------------------------------- |
| `token`          | `ProToken`        | Local patch over resolved native tokens and ancestor Pro patches              |
| `intl`           | `IntlType`        | Explicit local → explicit ancestor → nearest native locale → Chinese          |
| `valueTypeMap`   | `ProValueTypeMap` | Inherit by name; replace the entire matching definition; preserve other names |
| `prefixCls`      | string            | Pro namespace; `ant-pro` by default or `demo-pro` under native prefix `demo`  |
| `dark`           | optional boolean  | Add dark algorithm while preserving compact; inherit when omitted             |
| `hashed`         | optional boolean  | Inherit or override native hash class configuration                           |
| `contentHash`    | string            | Version component of request cache keys                                       |
| `autoClearCache` | false             | Clear only this provider's owned cache on unmount                             |
| `needDeps`       | false             | Reuse the parent cache when no explicit overrides are supplied                |

`ProProvider` aliases the Vue provider component. `useProConfig()`, `useIntl()` and `useProPrefix()` expose reactive refs for setup consumers.

## Internationalization

All 34 baseline locale packs are exported through `intlMap`, `intlMapKeys` and named entries such as `enUSIntl`. Native locale matching accepts case variants, underscores, hyphens and language prefixes. Missing messages fall back to Chinese, then the caller's default. An explicit empty string remains empty.

```ts
import { createIntl } from '@bubblesjs/antdv-next-pro'
const intl = createIntl('en-US', { tableForm: { search: 'Find', reset: 'Clear' } })
```

Pro search/edit/form actions, boolean fields, captcha and upload text use this context. Native date panels, pagination and validation use Antdv Next locale packs. Newly added upload translations are supplied in Chinese and English; missing entries in other baseline languages use the documented fallback.

## Tokens consumed by rendered components

The following Pro tokens have rendered consumers. Native components separately resolve their own component tokens. Inheriting the GlobalToken type does not imply that every native token controls a Pro custom area.

| Token                   | Rendered consumers                                                                                      |
| ----------------------- | ------------------------------------------------------------------------------------------------------- |
| `colorText`             | Field root, Table, forms, List, FieldLabel, DropdownFooter                                              |
| `colorTextSecondary`    | Card subtitle/tooltip, Table secondary text, LabelIconTip                                               |
| `colorPrimary`          | Card selection outline, selected Table column settings                                                  |
| `colorPrimaryBg`        | Table selection/alert area                                                                              |
| `colorBgContainer`      | Fullscreen Table, List background                                                                       |
| `colorBgElevated`       | Table column-settings popup, DropdownFooter                                                             |
| `colorFillAlter`        | Table column-settings drag hover, SchemaForm list                                                       |
| `colorBorderSecondary`  | Card/List dividers, DropdownFooter, Table alert                                                         |
| `colorError`            | Table edit errors                                                                                       |
| `boxShadowSecondary`    | FilterDropdown popup                                                                                    |
| `paddingLG`             | Form Group gap, QueryFilter columns, Steps content, List rows, ListToolBar, FilterDropdown              |
| `borderRadiusLG`        | Table popups/alert                                                                                      |
| `margin`                | Field option action gap                                                                                 |
| `boxShadow`             | Card with boxShadow enabled                                                                             |
| `padding` / `paddingXS` | Card regular/small header padding fallback; explicit native Card headerPadding settings take precedence |

Use `classes` / `styles` for local semantic styling.

`token.layout.header/sider/pageContainer` retains its types and nested merge rules. ProLayout/PageContainer are outside this implementation, so these layout fields do not currently control a rendered layout component.
