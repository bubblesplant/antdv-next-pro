---
pageClass: component-doc
---

<script setup>
import ProFieldDemo from '../../examples/ProFieldDemo.vue'
</script>

# ProField

The shared renderer for ProTable, ProDescriptions and form fields. `read` displays a value; `edit` and `update` provide controlled inputs through Vue `v-model`.

<ClientOnly><ProFieldDemo /></ClientOnly>

<<< ../../examples/ProFieldDemo.vue

## API

| Prop                                           | Behavior                                                                  |
| ---------------------------------------------- | ------------------------------------------------------------------------- |
| `text` / `modelValue` / `value`                | Explicit modelValue wins, then value and text                             |
| `mode` / `readonly`                            | read (default), edit, update; readonly forces read                        |
| `valueType`                                    | A type name or `{ type, ...configuration }`; fieldProps wins on conflicts |
| `fieldProps`                                   | Native props; date format/valueFormat and money formatting options        |
| `options` / `valueEnum`                        | Labels, Map keys, status badges and colors                                |
| `request` / `params`                           | Remote labels in read and edit modes, without duplicate requests          |
| `debounceTime` / `proFieldKey` / `cacheForSwr` | Request debounce, shared key and cache policy                             |
| `render`                                       | `(text, context, dom) => VNodeChild` for read mode                        |
| `formItemRender`                               | Edit renderer; call `context.onChange(value)` to update the model         |
| `copyable` / `ellipsis`                        | Read text copying and ellipsis                                            |
| `emptyText`                                    | Defaults to `-`; zero and false remain valid values                       |
| `prefixCls` / `classes` / `styles`             | Instance prefix and root/control semantic styling; objects or callbacks   |

Events are `update:modelValue`, `change` and `requestError`. The component ref exposes `refresh()`. `renderFormItem` remains a deprecated alias of `formItemRender`.

## Built-in types

There are 42 types: text, password, money, index, indexBorder, option, textarea; date, dateWeek, dateMonth, dateQuarter, dateYear, dateTime, fromNow; dateRange, dateTimeRange, dateWeekRange, dateMonthRange, dateQuarterRange, dateYearRange; time, timeRange; select, checkbox, rate, slider, radio, radioButton; progress, percent, digit, digitRange, second; code, jsonCode, avatar, switch, image, cascader, treeSelect, color and segmented.

index/indexBorder, option and avatar remain display fields in all three modes. progress/second use numeric input; fromNow uses a date-time picker; image uses a URL input; code/jsonCode use text areas. Schema containers group/formList/formSet/divider/dependency are handled by BetaSchemaForm and never fall back to an Input.

Readonly `code` / `jsonCode` render in a shaded code block with 16px padding, a 3px radius, and the theme's code font and secondary text color. `jsonCode` formats valid JSON. Customize the block with `fieldProps.class/style`; matching `classes.control` / `styles.control` settings take precedence.

Readonly `textarea` preserves line breaks and wraps long text when `copyable` / `ellipsis` are disabled. Readonly `text` also wraps long text. Switching to readonly preserves `control` semantic styling and the instance prefix.

Editable `digitRange` uses a compact numeric-input group with themed separator borders, background, and secondary text color. Set `fieldProps.separator` / `separatorWidth` to customize the separator and its width in pixels; defaults are `~` / `30`. A `placeholder` array targets each endpoint, and `fieldProps.style` styles the group container.

## Field atoms and money

Named atoms such as `FieldText`, `FieldSelect`, `FieldMoney` and `FieldDatePicker` share this protocol. `FieldMoney` also accepts `locale`, `customSymbol`, `moneySymbol`, `numberFormatOptions` and `numberPopoverRender`. Formatting defaults to two decimal places and follows locale separators and currency placement. Set `numberPopoverRender=false` to disable the editing amount hint.

```vue
<FieldMoney
  :text="1234.5"
  locale="de-DE"
  custom-symbol="€"
  :number-format-options="{ currency: 'EUR' }"
/>
```

## Custom types and preloading

Register `render` / `formItemRender` through `ProConfigProvider.valueTypeMap`. Nested providers inherit by type name and replace a matching definition as a whole. The live uppercase example writes edits back to its model.

`preloadProFieldValueType(type)` preloads a built-in type; `preloadAllProFieldValueTypes()` preloads all built-in types. They perform real dynamic imports and share the loading Promise. Unknown/custom types reject. The root entry still exports ProField; preloading does not imply a separate bundle per valueType.
