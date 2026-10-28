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
import { Button, Input } from 'antdv-next'
import { LightWrapper, ListToolBar, TableDropdown } from '@bubblesjs/antdv-next-pro'

const open = ref(false)
const keyword = ref('')
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
  <LightWrapper
    v-model:open="open"
    label="Keyword"
    :value="keyword"
    allow-clear
    @clear="keyword = ''"
  >
    <Input v-model:value="keyword" />
  </LightWrapper>
  <p>Selected menu: {{ selected }}</p>
</template>
```

## ListToolBar

| Prop                             | Behavior                                                                               |
| -------------------------------- | -------------------------------------------------------------------------------------- |
| `title` / `subTitle` / `tooltip` | Heading, subtitle and tooltip                                                          |
| `actions` / `settings`           | Nodes or actions(), and an array of settings nodes                                     |
| `search`                         | Boolean or native InputSearch props; supports asynchronous onSearch(value)             |
| `menu`                           | `{ type?, items?, activeKey?, defaultActiveKey?, onChange? }`; inline, tab or dropdown |
| `tabs`                           | `{ items?, activeKey?, defaultActiveKey?, onChange? }` on an extra line                |
| `filter` / `multipleLine`        | Filter content and multiline styling                                                   |

Returning false from search.onSearch suppresses the component search(value) event. Menu/tabs onChange(key) notify selection changes; accept controlled activeKey updates in the parent.

Slots: title, actions, settings, filter. Semantic parts: root, container, left, right, title, subTitle, extraLine. No separate instance methods.

## TableDropdown / TableDropdown.Button

| Prop                        | Behavior                                                                       |
| --------------------------- | ------------------------------------------------------------------------------ |
| `menus` / `options`         | `{ key: string, name?, label?, disabled?, danger? }[]`; menus takes precedence |
| `text`                      | Trigger text                                                                   |
| `disabled`                  | Disable the menu                                                               |
| `onSelect(key)` / `@select` | String key of an enabled menu item                                             |

Label takes precedence over name. The default slot replaces the regular TableDropdown trigger; otherwise it uses an ellipsis icon. TableDropdown.Button is a real component member, also exported as TableDropdownButton. It uses a native Button trigger and forwards additional Button attrs. Semantic part: root. No separate instance methods.

## Search

A standalone schema search form. Search filterType light uses LightFilter; otherwise QueryFilter is used.

| Prop/event                                           | Behavior                                                                                                                             |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `columns`                                            | ProColumns; excludes hideInSearch=true and search=false entries                                                                      |
| `search`                                             | ProTable search configuration: span, labelWidth, collapsed, defaultCollapsed, searchText, resetText, optionRender and collapseRender |
| `form`                                               | Native Form props plus initialValues and submitter; classes/styles customize the filter form                                         |
| `formRef`                                            | `Ref<SchemaFormInstance<T> \| undefined>`                                                                                            |
| `submit(values)` / `reset()` / `collapse(collapsed)` | Submit, reset and collapse notifications                                                                                             |

Loading controls the default submit button. Search embedded in ProTable receives table request loading automatically. Explicit form.submitter.submitButtonProps.loading takes precedence; submitter=false and submitButtonProps=false still hide the corresponding actions.

The component ref forwards SchemaFormInstance. Search collects and validates values; the caller performs requests. There are no extra business slots or a separate semantic part map.

## FilterDropdown

| Prop/event                         | Behavior                                                                |
| ---------------------------------- | ----------------------------------------------------------------------- |
| `label` / `disabled` / `placement` | Trigger, disabled state and popup position                              |
| `open` / `v-model:open`            | Internal state when omitted; otherwise accept update:open in the parent |
| `popoverProps`                     | Native Popover props; onOpenChange is merged with component behavior    |
| `footer`                           | DropdownFooter configuration; passing it enables the action area        |
| `footerRender`                     | False hides the footer; a function replaces its content                 |
| `padding`                          | Content padding                                                         |
| `openChange(open)`                 | Requested open-state changes                                            |

The default slot contains the panel, and label replaces the trigger. Semantic parts are root for the trigger and content for the panel. Customize the popup container with popoverProps.styles.container. Footer callbacks own clearing and closing behavior; no data changes happen automatically. No separate instance methods.

## LightWrapper

Combines FieldLabel and FilterDropdown. Props: label, value, open, disabled, allowClear, footerRender, placement. The default slot is panel content. Semantic parts: root, content.

Events: update:open, clear, confirm. Confirm emits and requests closing; clear only notifies the parent, which updates value. Open is internal when omitted and controlled with v-model:open. No separate instance methods.

## DropdownFooter

Props: disabled, confirmText, clearText, onConfirm(event?), onClear(event?), footerRender. No business slots or instance methods.

FooterRender false renders nothing. A function receives `(confirm?, clear?)` and returns VNodeChild. Callbacks only notify; they do not wait for asynchronous operations, clear data or close a parent. Semantic parts: root, clear, confirm. Custom footerRender replaces the default buttons, so their parts no longer apply.

## FieldLabel / LabelIconTip

| Component      | Props and behavior                                                                                                        | Slots                  | Semantic parts                 |
| -------------- | ------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ------------------------------ |
| `FieldLabel`   | label, value, disabled, expanded, ellipsis, onClear; non-null values are displayed; expanded supplies accessibility state | None                   | root, label, value             |
| `LabelIconTip` | label, tooltip (string or TooltipProps), subTitle, ellipsis                                                               | Default replaces label | root, label, subTitle, tooltip |

FieldLabel uses a focusable button. A value with onClear shows a clear control that stops propagation; otherwise an arrow is shown. Panel state belongs to the caller. Neither exposes separate instance methods.

## InlineErrorFormItem

Extends native FormItem props with error and errorType default or popover. Default mode shows inline errors. Popover mode uses the truthiness of error to open the popup and hides inline help.

The default slot contains the control; error customizes inline or popup error content. An error slot alone does not open a popup when error is empty. Semantic parts: root, field (native FormItem). Native Form/FormItem still owns validation rules. No separate instance methods.

## ErrorBoundary

Catches rendering and lifecycle errors in descendant Vue components and shows fallback content.

| API                    | Behavior                                           |
| ---------------------- | -------------------------------------------------- |
| `fallback`             | A node or `(error, reset) => VNodeChild`           |
| `resetKeys`            | Reset when array elements change                   |
| `onError(error, info)` | Error notification                                 |
| Default slot           | Normal content                                     |
| `fallback` slot        | `{ error, reset }`, takes precedence over the prop |
| `ref.reset()`          | Clear the error and render descendants again       |

The default fallback uses native Result and a retry button. The root semantic part exists only in the fallback state; normal rendering directly returns the default slot. Handle errors in the boundary itself, detached asynchronous Promises and network operations at their source.

## Shared styling and configuration

Except Search, which uses its form configuration, these components provide prefixCls, classes and styles. Classes/styles accept a map or `({ props }) => map`. Legacy classNames remains compatible; classes wins for matching parts. Only documented parts are consumed.

| Component                            | Default public prefix                 |
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

Native ConfigProvider prefixCls="demo" replaces ant-pro with demo-pro in these prefixes. The component prefixCls can override it.

Locale, direction, theme algorithms and native tokens follow ConfigProvider. Configure Pro tokens through [ProConfigProvider.token](./pro-config-provider). Native Result tokens use theme.components.Result; helpers do not register independent theme.components.ProX entries.
