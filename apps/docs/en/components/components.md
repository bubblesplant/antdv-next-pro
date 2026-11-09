---
pageClass: component-doc
---

<script setup>
import SharedComponentsDemo from '../../examples/SharedComponentsDemo.vue'
</script>

# Toolbar and helper components

Composable toolbar, action menu, search form, filter popup, field label and error components. All are exported from `@bubblesjs/antdv-next-pro`.

<ClientOnly><SharedComponentsDemo /></ClientOnly>

<<< ../../examples/SharedComponentsDemo.vue

## Minimal usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Button } from 'antdv-next'
import {
  LightWrapper,
  ListToolBar,
  ProForm,
  ProFormText,
  TableDropdown,
} from '@bubblesjs/antdv-next-pro'

const open = ref(false)
const filters = ref({ keyword: '' })
const selected = ref('')
const menus = [
  { key: 'export', name: 'Export' },
  { key: 'archive', name: 'Archive' },
]
</script>

<template>
  <ListToolBar title="Projects">
    <template #actions>
      <TableDropdown :menus="menus" @select="selected = $event" />
      <Button type="primary">Create</Button>
    </template>
  </ListToolBar>
  <ProForm v-model="filters" :submitter="false">
    <LightWrapper v-model:open="open" name="keyword" label="Keyword">
      <ProFormText name="keyword" />
    </LightWrapper>
  </ProForm>
  <p>Selected menu: {{ selected }}</p>
</template>
```

## Shared properties {#props}

All auxiliary components below except Search and LightWrapper inherit these entries. Search configures semantic styles through form. LightWrapper forwards extra attributes to native Popover, while its own prefix follows ConfigProvider. Every component-specific table is additive.

| Property     | Type                                                  | Default | Description / source                                         |
| ------------ | ----------------------------------------------------- | ------- | ------------------------------------------------------------ |
| `prefixCls`  | `string`                                              | —       | Full component prefix; defaults are listed below.            |
| `classes`    | `SemanticMap \| ({ props }) => SemanticMap`           | —       | Semantic classes; supported parts are listed per component.  |
| `classNames` | `SemanticMap \| ({ props }) => SemanticMap`           | —       | Legacy classes; classes takes precedence for matching parts. |
| `styles`     | `SemanticStyleMap \| ({ props }) => SemanticStyleMap` | —       | Semantic styles; each map value is CSSProperties.            |

## ListToolBar {#list-tool-bar}

| Property       | Type                                                          | Default | Description / source                                                                                                            |
| -------------- | ------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `title`        | `VNodeChild`                                                  | —       | Heading; title slot takes precedence.                                                                                           |
| `subTitle`     | `VNodeChild`                                                  | —       | Subtitle.                                                                                                                       |
| `tooltip`      | `string \| TooltipProps`                                      | —       | Native [Tooltip props](https://www.antdv-next.com/components/tooltip).                                                          |
| `actions`      | `VNodeChild \| (() => VNodeChild)`                            | —       | Action nodes; actions slot takes precedence.                                                                                    |
| `settings`     | `VNodeChild[]`                                                | `[]`    | Setting nodes; settings slot takes precedence.                                                                                  |
| `search`       | `boolean \| ProTableToolbarSearchConfig`                      | `false` | true enables input; object forwards to [Input.Search](https://www.antdv-next.com/components/input); see enhanced options below. |
| `onSearch`     | `(value: string) => void`                                     | —       | The search event listener.                                                                                                      |
| `menu`         | `{ type?, items?, activeKey?, defaultActiveKey?, onChange? }` | —       | Navigation in the main row; see below.                                                                                          |
| `tabs`         | `{ items?, activeKey?, defaultActiveKey?, onChange? }`        | —       | Extra-row [Tabs](https://www.antdv-next.com/components/tabs) when multipleLine=true.                                            |
| `filter`       | `VNodeChild`                                                  | —       | Filter nodes; filter slot takes precedence.                                                                                     |
| `multipleLine` | `boolean`                                                     | `false` | Moves filter and tabs into an extra row.                                                                                        |

| Nested property                                 | Type / default                                                  | Destination / behavior                                                                           |
| ----------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `search`                                        | [Input.Search API](https://www.antdv-next.com/components/input) | Native input options except onSearch; localized placeholder by default; width defaults to 200px. |
| `search.name`                                   | `string / —`                                                    | Shared toolbar-search metadata; standalone toolbar does not bind it to a model.                  |
| `search.onSearch`                               | `(value: string) => void \| false \| Promise<void \| false>`    | false suppresses the outer search event.                                                         |
| `menu.type`                                     | `'inline' \| 'dropdown' \| 'tab' / tab`                         | Menu rendering mode.                                                                             |
| `menu.items / tabs.items`                       | `{ key: string; label: VNodeChild; disabled?: boolean }[] / []` | Navigation items.                                                                                |
| `menu.activeKey / tabs.activeKey`               | `string / —`                                                    | Controlled active key; update it in the caller.                                                  |
| `menu.defaultActiveKey / tabs.defaultActiveKey` | `string / —`                                                    | Uncontrolled initial key.                                                                        |
| `menu.onChange / tabs.onChange`                 | `(key: string) => void`                                         | Active-key change callback.                                                                      |

| Event / callback | Parameters / return       | Behavior                                                          |
| ---------------- | ------------------------- | ----------------------------------------------------------------- |
| `search`         | `(value: string) => void` | Triggered after the input search callback resolves without false. |

| Slot       | Scope | Behavior            |
| ---------- | ----- | ------------------- |
| `title`    | —     | Overrides title.    |
| `actions`  | —     | Overrides actions.  |
| `settings` | —     | Overrides settings. |
| `filter`   | —     | Overrides filter.   |

No exposed instance methods. Parts: root/container/left/right/title/subTitle/extraLine. A title/menu moves search to the right; otherwise it stays left. Empty toolbars do not retain an action row. Padding and gaps follow the Pro padding/marginXS tokens.

## TableDropdown / TableDropdown.Button {#table-dropdown}

| Property   | Type                    | Default | Description / source                                       |
| ---------- | ----------------------- | ------- | ---------------------------------------------------------- |
| `menus`    | `TableDropdownItem[]`   | —       | Menu items, overriding options; see the item type below.   |
| `options`  | `TableDropdownItem[]`   | `[]`    | Fallback alias for menus.                                  |
| `text`     | `VNodeChild`            | —       | Trigger text; default slot takes precedence.               |
| `disabled` | `boolean`               | `false` | Disables Dropdown and the Button trigger where applicable. |
| `onSelect` | `(key: string) => void` | —       | Item selection callback; can also be written as @select.   |

| Item property | Type         | Default  | Behavior                         |
| ------------- | ------------ | -------- | -------------------------------- |
| `key`         | `string`     | required | Unique key returned by onSelect. |
| `label`       | `VNodeChild` | —        | Label, overriding name.          |
| `name`        | `VNodeChild` | —        | Fallback label.                  |
| `disabled`    | `boolean`    | `false`  | Disables the item.               |
| `danger`      | `boolean`    | `false`  | Danger menu styling.             |

| Event / callback | Parameters / return     | Behavior                                         |
| ---------------- | ----------------------- | ------------------------------------------------ |
| `select`         | `(key: string) => void` | Equivalent to onSelect; avoid duplicate binding. |

| Slot      | Scope | Behavior                  |
| --------- | ----- | ------------------------- |
| `default` | —     | Replaces trigger content. |

`TableDropdown.Button` also exports as TableDropdownButton. Its extra attrs target the native [Button](https://www.antdv-next.com/components/button), including type/size/loading; disabled and semantic styling are owned by the wrapper. Ordinary TableDropdown attrs target a span. Neither forwards arbitrary Dropdown props; neither exposes methods. Part: root.

## Search {#search}

| Property  | Type                                      | Default    | Description / source                                                                                                      |
| --------- | ----------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------- |
| `columns` | `ProColumns<T>[]`                         | `required` | [Shared column API](./pro-table#columns); excludes hideInSearch=true or search=false.                                     |
| `search`  | `ProTableSearchConfig<T>`                 | —          | [Search settings](./pro-table#search); actual forwarded options are noted below.                                          |
| `form`    | `ProTableSearchForm<T>`                   | —          | Native [Form props](https://www.antdv-next.com/components/form) plus initialValues and [submitter](./pro-form#submitter). |
| `loading` | `boolean`                                 | `false`    | Default submit-button loading; form.submitter.submitButtonProps.loading overrides it.                                     |
| `formRef` | `Ref<SchemaFormInstance<T> \| undefined>` | —          | Receives the [SchemaForm instance](./schema-form#instance), also exposed through ref.                                     |

search.filterType=light chooses [LightFilter](./light-filter#props), otherwise [QueryFilter](./query-filter#props). Search forwards span/labelWidth/defaultCollapsed/collapsed/searchText/resetText/optionRender/collapseRender; defaultCollapsed defaults to true. Standalone Search reports collapse through @collapse; the shared search.onCollapse field is not invoked here. form.initialValues and submitter are separated from native formProps; form onSubmit/onReset are not forwarded. dateFormatter is false. submitter=false or submitButtonProps=false keeps the respective actions hidden.

| Event / callback | Parameters / return                         | Behavior                                                   |
| ---------------- | ------------------------------------------- | ---------------------------------------------------------- |
| `submit`         | `(values: Record<string, unknown>) => void` | Validated query values; the caller performs data requests. |
| `reset`          | `() => void`                                | Search reset.                                              |
| `collapse`       | `(collapsed: boolean) => void`              | Collapse change.                                           |

No additional business slots. The component ref forwards the full [SchemaForm instance](./schema-form#instance); there are no extra instance methods.

## FilterDropdown {#filter-dropdown}

| Property       | Type                                          | Default     | Description / source                                                                         |
| -------------- | --------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------- |
| `label`        | `VNodeChild`                                  | —           | Trigger content; label slot takes precedence.                                                |
| `open`         | `boolean`                                     | `undefined` | Controlled open state; internally managed when omitted.                                      |
| `disabled`     | `boolean`                                     | `false`     | Prevents opening and hides an open panel.                                                    |
| `placement`    | `PopoverProps['placement']`                   | —           | Overrides popoverProps.placement.                                                            |
| `popoverProps` | `PopoverProps`                                | —           | Native [Popover props](https://www.antdv-next.com/components/popover); see precedence below. |
| `footer`       | `DropdownFooterProps`                         | —           | Renders [DropdownFooter](#dropdown-footer) when supplied.                                    |
| `footerRender` | `false \| ((confirm?, clear?) => VNodeChild)` | —           | false hides the footer; a function replaces it; overrides footer.footerRender.               |
| `padding`      | `number`                                      | `16`        | Content padding in pixels; styles.content can override it.                                   |

| Event / callback | Parameters / return       | Behavior                                                  |
| ---------------- | ------------------------- | --------------------------------------------------------- |
| `update:open`    | `(open: boolean) => void` | Supports v-model:open.                                    |
| `openChange`     | `(open: boolean) => void` | Open-state request; also calls popoverProps.onOpenChange. |

| Slot      | Scope | Behavior                           |
| --------- | ----- | ---------------------------------- |
| `default` | —     | Panel content.                     |
| `label`   | —     | Trigger content, overriding label. |

The wrapper owns open, trigger=click and content. placement overrides popoverProps.placement; classes merge with the overlay root class; styles.container merges after padding=0/minWidth=200px/shadow defaults. Parts: root (trigger) and content (panel); panel padding defaults to 16px. Footer callbacks own data changes and closing; there are no exposed instance methods.

## LightWrapper {#light-wrapper}

The complete property, event and slot tables are maintained in [LightWrapper API](./light-filter#light-wrapper). It composes FieldLabel and native Popover, reads field values from ProForm context, supports v-model:open and exposes no methods.

## DropdownFooter {#dropdown-footer}

| Property       | Type                                          | Default  | Description / source                                                         |
| -------------- | --------------------------------------------- | -------- | ---------------------------------------------------------------------------- |
| `disabled`     | `boolean`                                     | `false`  | Disables the default clear/confirm buttons.                                  |
| `confirmText`  | `VNodeChild`                                  | `locale` | Confirm label, defaulting to the localized Confirm message.                  |
| `clearText`    | `VNodeChild`                                  | `locale` | Clear label, defaulting to the localized Clear message.                      |
| `onConfirm`    | `(event?: MouseEvent) => void`                | —        | Confirm callback; does not await results or close a parent.                  |
| `onClear`      | `(event?: MouseEvent) => void`                | —        | Clear callback; omitted callbacks hide the button while retaining its space. |
| `footerRender` | `false \| ((confirm?, clear?) => VNodeChild)` | —        | false or a false return hides the footer; receives the two callbacks above.  |

| Event / callback      | Parameters / return            | Behavior                                            |
| --------------------- | ------------------------------ | --------------------------------------------------- |
| `onConfirm / onClear` | `(event?: MouseEvent) => void` | Action notifications; see properties for semantics. |

No slots or methods. Parts: root/clear/confirm. A custom footerRender replaces both default buttons, so button-specific parts no longer apply. Default padding is 8px; the two buttons occupy opposite sides.

## FieldLabel {#field-label}

| Property   | Type         | Default | Description / source                                                   |
| ---------- | ------------ | ------- | ---------------------------------------------------------------------- |
| `label`    | `VNodeChild` | —       | Field label.                                                           |
| `value`    | `VNodeChild` | —       | Shown when not null/undefined.                                         |
| `disabled` | `boolean`    | `false` | Disables the trigger and clearing.                                     |
| `expanded` | `boolean`    | `false` | Maps to aria-expanded; the parent controls the popup.                  |
| `ellipsis` | `boolean`    | `false` | Truncates the label region.                                            |
| `onClear`  | `() => void` | —       | Shows a clear trigger when a value exists; clearing stops propagation. |

| Event / callback | Parameters / return | Behavior                           |
| ---------------- | ------------------- | ---------------------------------- |
| `onClear`        | `() => void`        | Mouse or Enter/Space clear action. |

No slots or methods. Parts: root/label/value. A focusable button is used; height is 30px, or 24px under native small size.

## LabelIconTip {#label-icon-tip}

| Property   | Type                     | Default | Description / source                                                                               |
| ---------- | ------------------------ | ------- | -------------------------------------------------------------------------------------------------- |
| `label`    | `VNodeChild`             | —       | Label; default slot takes precedence.                                                              |
| `tooltip`  | `string \| TooltipProps` | —       | Strings map to title; objects forward to [Tooltip](https://www.antdv-next.com/components/tooltip). |
| `subTitle` | `VNodeChild`             | —       | Subtitle.                                                                                          |
| `ellipsis` | `boolean`                | `false` | Truncates only the label region.                                                                   |

| Slot      | Scope | Behavior                                             |
| --------- | ----- | ---------------------------------------------------- |
| `default` | —     | Replaces label while retaining subtitle and tooltip. |

No component events or methods. Parts: root/label/subTitle/tooltip.

## InlineErrorFormItem {#inline-error-form-item}

| Property         | Type                                                  | Default   | Description / source                                                                                                                            |
| ---------------- | ----------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `error`          | `VNodeChild`                                          | —         | Error content; truthy values force validateStatus=error.                                                                                        |
| `errorType`      | `'default' \| 'popover'`                              | `default` | popover shows errors in a Popover and clears native help.                                                                                       |
| `FormItem props` | `Omit<FormItemProps, classes \| styles \| prefixCls>` | `native`  | Other [FormItem props](https://www.antdv-next.com/components/form), including name/rules/label/help/validateStatus; see error precedence below. |

| Slot      | Scope | Behavior                                                             |
| --------- | ----- | -------------------------------------------------------------------- |
| `default` | —     | Input control.                                                       |
| `error`   | —     | Replaces inline/popover errors without controlling popup visibility. |

No additional events or methods. Native validation remains the responsibility of Form/FormItem. error overrides validateStatus only when truthy; default mode replaces help when error is defined or an error slot exists. Popover mode clears help and opens only for a truthy error. Extra attrs target the wrapper div. Parts: root/field.

## ErrorBoundary {#error-boundary}

| Property    | Type                                                              | Default | Description / source                                                                      |
| ----------- | ----------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------- |
| `fallback`  | `VNodeChild \| ((error: Error, reset: () => void) => VNodeChild)` | —       | Fallback; the fallback slot takes precedence, otherwise Result and a retry button render. |
| `resetKeys` | `unknown[]`                                                       | —       | Deeply watched; changes reset captured errors.                                            |
| `onError`   | `(error: Error, info: string) => void`                            | —       | Notification for captured descendant errors.                                              |

| Event / callback | Parameters / return                    | Behavior                                         |
| ---------------- | -------------------------------------- | ------------------------------------------------ |
| `onError`        | `(error: Error, info: string) => void` | Captured descendant Vue render/lifecycle errors. |

| Slot       | Scope                                 | Behavior                                    |
| ---------- | ------------------------------------- | ------------------------------------------- |
| `default`  | —                                     | Normal content.                             |
| `fallback` | `{ error: Error, reset: () => void }` | Fallback, overriding the fallback property. |

| Method    | Signature    | Behavior                                        |
| --------- | ------------ | ----------------------------------------------- |
| `reset()` | `() => void` | Clears the error and renders descendants again. |

The root semantic part exists only while showing fallback content. Normal rendering adds no wrapper. Errors outside the descendant component chain, such as standalone network failures, must be handled by the caller.

## Event, slot and method index {#events}

| Component              | Events / callbacks                                        | Slots                                        | Instance                             |
| ---------------------- | --------------------------------------------------------- | -------------------------------------------- | ------------------------------------ |
| ListToolBar            | [search](#list-tool-bar)                                  | title/actions/settings/filter                | —                                    |
| TableDropdown / Button | [onSelect](#table-dropdown)                               | default                                      | —                                    |
| Search                 | [submit/reset/collapse](#search)                          | —                                            | [SchemaForm](./schema-form#instance) |
| FilterDropdown         | [update:open/openChange](#filter-dropdown)                | default/label                                | —                                    |
| LightWrapper           | [update:open/clear/confirm](./light-filter#light-wrapper) | [LightWrapper](./light-filter#light-wrapper) | —                                    |
| DropdownFooter         | [onConfirm/onClear](#dropdown-footer)                     | —                                            | —                                    |
| FieldLabel             | [onClear](#field-label)                                   | —                                            | —                                    |
| LabelIconTip           | —                                                         | default                                      | —                                    |
| InlineErrorFormItem    | —                                                         | default/error                                | —                                    |
| ErrorBoundary          | [onError](#error-boundary)                                | default/fallback                             | reset()                              |

<span id="slots"></span>
<span id="instance"></span>

## Prefix and inherited configuration {#styles}

| Component                            | Default prefix                        |
| ------------------------------------ | ------------------------------------- |
| ListToolBar                          | `ant-pro-table-list-toolbar`          |
| TableDropdown / TableDropdown.Button | `ant-pro-table-dropdown`              |
| LightWrapper                         | `ant-pro-field-light-wrapper`         |
| FilterDropdown                       | `ant-pro-core-field-dropdown`         |
| DropdownFooter                       | `ant-pro-core-field-dropdown-footer`  |
| FieldLabel                           | `ant-pro-core-field-label`            |
| LabelIconTip                         | `ant-pro-core-label-tip`              |
| InlineErrorFormItem                  | `ant-pro-form-inline-error-form-item` |
| ErrorBoundary                        | `ant-pro-error-boundary`              |

Native [ConfigProvider](https://www.antdv-next.com/components/config-provider) controls locale, direction, native component tokens and prefix; native prefix demo changes ant-pro to demo-pro. Pro extensions use [ProConfigProvider.token](./pro-config-provider#props). Default ErrorBoundary Result styling uses theme.components.Result. These helpers do not register theme.components.ProX entries.
