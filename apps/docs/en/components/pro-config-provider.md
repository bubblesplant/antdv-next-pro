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

## Props {#props}

| Property         | Type              | Default     | Description / source                                                                                           |
| ---------------- | ----------------- | ----------- | -------------------------------------------------------------------------------------------------------------- |
| `intl`           | `IntlType`        | —           | Pro language: local explicit → ancestor explicit → nearest native locale → Chinese.                            |
| `token`          | `ProToken`        | `{}`        | Local patch over native tokens; ancestor and local patches merge; see [configuration types](#config-types).    |
| `valueTypeMap`   | `ProValueTypeMap` | `{}`        | Inherits by type name; matching definitions are entirely replaced; see below.                                  |
| `prefixCls`      | `string`          | `ant-pro`   | Pro namespace; defaults to demo-pro under native prefix demo.                                                  |
| `dark`           | `boolean`         | `undefined` | true appends dark while retaining existing algorithms; false retains native algorithms.                        |
| `hashed`         | `boolean`         | `undefined` | Inherits or overrides native theme.hashed.                                                                     |
| `contentHash`    | `string`          | —           | Request cache-key content version; inherits from the parent when omitted.                                      |
| `autoClearCache` | `boolean`         | `false`     | Clears only this provider’s owned cache on unmount.                                                            |
| `needDeps`       | `boolean`         | `false`     | Reuses parent cache when a parent exists and intl/token/valueTypeMap/prefixCls/dark/hashed are not overridden. |

`ProProvider` is an alias. This provider does not forward arbitrary native ConfigProvider attributes: wrap it in [Antdv Next ConfigProvider](https://www.antdv-next.com/components/config-provider) for locale, theme, direction, componentSize, componentDisabled or getPopupContainer.

### Configuration types {#config-types}

| Entry                                                 | Type                                                               | Behavior / source                                                                                                                                                                                             |
| ----------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `intl.locale`                                         | `string`                                                           | Locale identifier.                                                                                                                                                                                            |
| `intl.getMessage`                                     | `(id: string, defaultMessage?: string) => string`                  | Resolves a dotted message path.                                                                                                                                                                               |
| `token`                                               | `Partial<GlobalToken>`                                             | Native [ConfigProvider theme tokens](https://www.antdv-next.com/components/config-provider).                                                                                                                  |
| `token.layout`                                        | `DeepPartial<ProLayoutToken>`                                      | Reserved layout data; header/sider/pageContainer merge one level deeper; there is no ProLayout renderer. [Full type](https://github.com/bubblesplant/antv-next-pro/blob/main/packages/src/provider/types.ts). |
| `token.themeId / proComponentsCls / antCls / iconCls` | `number / string / string / string`                                | Reserved metadata; not native component configuration entries.                                                                                                                                                |
| `valueTypeMap[type].render`                           | `(text, context, defaultDom) => VNodeChild`                        | Custom read view; see [ProField](./pro-field#props).                                                                                                                                                          |
| `valueTypeMap[type].formItemRender`                   | `(text, context, defaultDom) => VNodeChild`                        | Custom edit/update view.                                                                                                                                                                                      |
| `valueTypeMap[type].renderFormItem`                   | `(text, context, defaultDom) => VNodeChild`                        | Legacy fallback; formItemRender takes precedence.                                                                                                                                                             |
| `context.mode / value / fieldProps`                   | `'read' \| 'edit' \| 'update' / unknown / Record<string, unknown>` | Current field mode, value and input properties.                                                                                                                                                               |
| `context.onChange / defaultRender`                    | `(value: unknown) => void / () => VNodeChild`                      | Writes back a field value / renders the built-in control.                                                                                                                                                     |

### Slots {#slots}

| Slot      | Scope | Behavior                                                   |
| --------- | ----- | ---------------------------------------------------------- |
| `default` | —     | Descendants receiving configuration; no extra DOM wrapper. |

### Events {#events}

No component events are emitted.

### Instance and helpers {#instance}

No component instance methods are exposed. Call these exported helpers in setup:

| Helper                               | Signature / return                                                        | Description                                   |
| ------------------------------------ | ------------------------------------------------------------------------- | --------------------------------------------- |
| `useProConfig()`                     | `ProConfigContext`                                                        | Reactive resolved context; entries below.     |
| `useIntl()`                          | `ComputedRef<IntlType>`                                                   | Current resolved language.                    |
| `useProPrefix(suffix, custom?)`      | `(string, MaybeRefOrGetter<string \| undefined>?) => ComputedRef<string>` | Custom full prefix, or namespace + suffix.    |
| `createIntl(locale, messages)`       | `(string, object) => IntlType`                                            | Messages → Chinese baseline → defaultMessage. |
| `findIntlKeyByAntdLocaleKey(locale)` | `(string \| undefined) => string`                                         | Resolves the closest built-in locale key.     |

| Context entry           | Type / purpose                                      |
| ----------------------- | --------------------------------------------------- |
| `intl`                  | `ComputedRef<IntlType>`                             |
| `token`                 | `ComputedRef<GlobalToken & ProToken>`               |
| `nativeToken / hashId`  | Native theme token/hash refs.                       |
| `nativeConfig`          | Native configuration plus resolved disabled/size.   |
| `prefixCls / direction` | `ComputedRef<string> / ComputedRef<'ltr' \| 'rtl'>` |
| `valueTypeMap`          | `ComputedRef<ProValueTypeMap>`                      |
| `cache`                 | `Map<string, ProRequestCacheEntry> \| undefined`    |
| `contentHash`           | `ComputedRef<string \| undefined> \| undefined`     |

## Internationalization

All 34 baseline locale packs are exported through `intlMap`, `intlMapKeys` and named entries such as `enUSIntl`. Native locale matching accepts case variants, underscores, hyphens and language prefixes. Missing messages fall back to Chinese, then the caller's default. An explicit empty string remains empty.

```ts
import { createIntl } from '@bubblesjs/antdv-next-pro'
const intl = createIntl('en-US', { tableForm: { search: 'Find', reset: 'Clear' } })
```

Pro search/edit/form actions, boolean fields, captcha and upload text use this context. Native date panels, pagination and validation use Antdv Next locale packs. Newly added upload translations are supplied in Chinese and English; missing entries in other baseline languages use the documented fallback.

## Tokens consumed by rendered components

The following Pro tokens have rendered consumers. Native components separately resolve their own component tokens. Inheriting the GlobalToken type does not imply that every native token controls a Pro custom area.

| Token                                                         | Rendered consumers                                                                                                 |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `colorText`                                                   | Field root, Table, forms, List, FieldLabel, DropdownFooter                                                         |
| `colorTextSecondary`                                          | Card subtitle/tooltip, Table secondary text, toolbar subtitle, LabelIconTip, code fields and digit-range separator |
| `colorTextHeading`                                            | ListToolBar heading                                                                                                |
| `colorTextPlaceholder` / `colorBgTextHover`                   | FieldLabel disabled text and hover background                                                                      |
| `colorPrimary`                                                | Selected Table column settings                                                                                     |
| `controlItemBgActive` / `controlOutline`                      | Card selection background and border                                                                               |
| `colorPrimaryBg`                                              | Table selection/alert area                                                                                         |
| `colorBgContainer`                                            | Fullscreen Table, digit-range separator; regular List roots are transparent                                        |
| `colorBgElevated`                                             | Table column-settings popup, DropdownFooter                                                                        |
| `colorFillAlter`                                              | Table column-settings drag hover                                                                                   |
| `colorBorderSecondary`                                        | Table alert                                                                                                        |
| `colorSplit` / `lineWidth` / `lineType`                       | Card/List dividers; DropdownFooter uses colorSplit                                                                 |
| `colorBorder`                                                 | Digit-range separator border                                                                                       |
| `colorError`                                                  | Table edit errors                                                                                                  |
| `boxShadowSecondary`                                          | FilterDropdown popup                                                                                               |
| `paddingLG`                                                   | QueryFilter column gap, Card tab content                                                                           |
| `paddingXS`                                                   | List row padding, small Card vertical header padding, small Group gap                                              |
| `marginXS` / `marginXXS`                                      | Submitter and toolbar gaps / FieldLabel icon gap                                                                   |
| `marginLG` / `marginXL`                                       | FormList action bottom spacing and inline toolbar menu gap / Group heading bottom spacing                          |
| `marginSM`                                                    | List content/action gaps, drag-handle spacing                                                                      |
| `borderRadiusLG`                                              | Table popups/alert                                                                                                 |
| `margin`                                                      | Field option action gap, ListToolBar extra-line bottom spacing                                                     |
| `boxShadowTertiary`                                           | Card with boxShadow explicitly enabled                                                                             |
| `padding`                                                     | ListToolBar vertical padding, regular Card headers without separators, vertical Card tab navigation                |
| `fontSize` / `fontSizeSM` / `fontSizeLG` / `fontWeightStrong` | Toolbar and FieldLabel font sizes, toolbar heading weight                                                          |
| `fontFamilyCode`                                              | Read-only code/jsonCode fields                                                                                     |
| `controlHeight` / `controlHeightSM`                           | FormList action height / small actions and drag-handle height                                                      |

Explicit native Card `headerPadding/headerPaddingSM` take precedence for horizontal header spacing; otherwise Pro `padding/paddingXS` provide the fallback. These native Card settings do not control vertical header spacing. FilterDropdown content padding defaults to a fixed 16px and can be overridden through its prop.

Use `classes` / `styles` for local semantic styling.

`token.layout.header/sider/pageContainer` retains its types and nested merge rules. ProLayout/PageContainer are outside this implementation, so these layout fields do not currently control a rendered layout component.
