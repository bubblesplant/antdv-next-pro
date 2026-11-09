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

### Props {#props}

ProField does not create a FormItem. Field names, labels and validation belong to [ProFormField](./pro-form-fields#props) or [SchemaForm](./schema-form#props).

| Prop             | Type                                 | Default            | Description / source                                                                            |
| ---------------- | ------------------------------------ | ------------------ | ----------------------------------------------------------------------------------------------- |
| `text`           | `unknown`                            | —                  | Display value and fallback for controlled values                                                |
| `modelValue`     | `unknown`                            | —                  | Explicit `v-model` value takes precedence                                                       |
| `value`          | `unknown`                            | —                  | Compatibility value, below explicit `modelValue`                                                |
| `mode`           | `'read' \| 'edit' \| 'update'`       | `'read'`           | Display or editing mode                                                                         |
| `readonly`       | `boolean`                            | `false`            | Forces read mode                                                                                |
| `valueType`      | `ProFieldValueTypeInput`             | `'text'`           | Name or `{ type, ...configuration }`; inferred as select with option sources when omitted       |
| `fieldProps`     | `Record<string, unknown>`            | —                  | Passed to the actual [base control](#field-props); overrides matching valueType object options  |
| `options`        | `ProFormFieldOption[]`               | —                  | Local [options](./pro-form-fields#options)                                                      |
| `valueEnum`      | `ProFormValueEnum`                   | —                  | Object or Map of [labels, statuses and colors](./pro-form-fields#option-types)                  |
| `request`        | `(params?) => Promise<Option[]>`     | —                  | Remote labels in both modes; [request rules](./pro-form-fields#options)                         |
| `params`         | `Record<string, unknown>`            | —                  | Changing parameters reloads options                                                             |
| `debounceTime`   | `number`                             | `0`                | Request debounce in milliseconds                                                                |
| `proFieldKey`    | `string`                             | —                  | Shared request key within the configuration scope                                               |
| `cacheForSwr`    | `boolean`                            | `true`             | Reuse scoped request cache                                                                      |
| `onRequestError` | `(error: unknown) => void`           | —                  | Listener for `requestError`; templates may use `@request-error`                                 |
| `render`         | `(text, context, dom) => VNodeChild` | —                  | Read renderer; overrides the provider renderer                                                  |
| `formItemRender` | `(text, context, dom) => VNodeChild` | —                  | Edit renderer; call `context.onChange(value)`                                                   |
| `renderFormItem` | Same as `formItemRender`             | —                  | Compatibility fallback below `formItemRender`                                                   |
| `copyable`       | `boolean \| Record<string, unknown>` | `false`            | Read text [Typography copy configuration](https://www.antdv-next.com/components/typography)     |
| `ellipsis`       | `boolean \| Record<string, unknown>` | `false`            | Read text [Typography ellipsis configuration](https://www.antdv-next.com/components/typography) |
| `emptyText`      | `VNodeChild`                         | `'-'`              | Placeholder; zero and false remain valid                                                        |
| `prefixCls`      | `string`                             | Provider generated | Complete prefix, normally `ant-pro-field`                                                       |
| `classes`        | `object \| ({ props }) => object`    | —                  | `root/control` semantic classes                                                                 |
| `classNames`     | Same as `classes`                    | —                  | Legacy classes, filling missing parts                                                           |
| `styles`         | `object \| ({ props }) => object`    | —                  | `root/control` semantic styles; see [Provider](./pro-config-provider)                           |

Value precedence: explicit `modelValue` → explicit `value` → edit-mode `fieldProps.value` → `text`. Root `class/style/id/data-*/aria-*` apply to the outer span. Style the base control through fieldProps or the control semantic part.

### Native fieldProps API {#field-props}

| valueType / mode                                          | Recipient and native API                                                                                                                                                            |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `text/password/textarea/code/jsonCode`, edit-mode `image` | [Input / Password / TextArea](https://www.antdv-next.com/components/input); code uses TextArea, image uses a URL Input                                                              |
| Edit-mode `digit/money/percent/second/progress`           | [InputNumber](https://www.antdv-next.com/components/input-number); [money extensions](./pro-form-fields#proformmoney)                                                               |
| Edit-mode `digitRange`                                    | Two [InputNumber](https://www.antdv-next.com/components/input-number) controls; [separator extensions](./pro-form-fields#digit-range)                                               |
| Dates, date ranges, edit-mode `fromNow`                   | [DatePicker / RangePicker](https://www.antdv-next.com/components/date-picker), including format/valueFormat/picker/showTime                                                         |
| Edit-mode `time/timeRange`                                | [TimePicker / RangePicker](https://www.antdv-next.com/components/time-picker)                                                                                                       |
| Edit-mode `select/treeSelect/cascader`                    | [Select](https://www.antdv-next.com/components/select), [TreeSelect](https://www.antdv-next.com/components/tree-select), [Cascader](https://www.antdv-next.com/components/cascader) |
| Edit-mode `checkbox/radio/radioButton/segmented`          | [Checkbox](https://www.antdv-next.com/components/checkbox), [Radio](https://www.antdv-next.com/components/radio), [Segmented](https://www.antdv-next.com/components/segmented)      |
| Edit-mode `slider/switch`                                 | [Slider](https://www.antdv-next.com/components/slider), [Switch](https://www.antdv-next.com/components/switch)                                                                      |
| `rate/color`                                              | [Rate](https://www.antdv-next.com/components/rate), [ColorPicker](https://www.antdv-next.com/components/color-picker); readonly disables editing                                    |
| Read-mode `image/avatar/progress`                         | [Image](https://www.antdv-next.com/components/image), [Avatar](https://www.antdv-next.com/components/avatar), [Progress](https://www.antdv-next.com/components/progress)            |
| Read-mode text                                            | [Typography](https://www.antdv-next.com/components/typography) for copyable/ellipsis; date and numeric display also uses internal formatting                                        |

The field core coordinates controlled values and update listeners. Manage values through v-model; other options follow the recipient's native API. Read modes consume display-related options only.

### Events {#events}

| Event               | Arguments        | Description            |
| ------------------- | ---------------- | ---------------------- |
| `update:modelValue` | `value: unknown` | Controlled edit update |
| `change`            | `value: unknown` | Edit notification      |
| `requestError`      | `error: unknown` | Failed option request  |

### Slots {#slots}

| Slot      | Scope                                                  | Description                                                               |
| --------- | ------------------------------------------------------ | ------------------------------------------------------------------------- |
| `default` | `{ mode, value, onChange, fieldProps, defaultRender }` | Custom content; a matching explicit or provider renderer takes precedence |

Render callbacks receive this scope as their second argument and the default VNode as the third argument. `defaultRender()` also returns the default content.

### Instance methods {#instance}

| Method      | Returns         | Description                                            |
| ----------- | --------------- | ------------------------------------------------------ |
| `refresh()` | `Promise<void>` | Reload read-mode labels or forward to the edit control |

Function-wrapped atoms such as FieldText forward props, events and slots, but currently do not expose the inner ref. Use ProField itself when refresh is required.

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

### Atom index {#atoms}

The following atoms inherit [props](#props), [events](#events) and the [default slot](#slots), with a fixed valueType. Native options follow [fieldProps](#field-props). They do not create FormItems.

| Export                 | Fixed valueType |
| ---------------------- | --------------- |
| `FieldText`            | `text`          |
| `FieldCascader`        | `cascader`      |
| `FieldCheckbox`        | `checkbox`      |
| `FieldCode`            | `code`          |
| `FieldColorPicker`     | `color`         |
| `FieldDatePicker`      | `date`          |
| `FieldDigit`           | `digit`         |
| `FieldDigitRange`      | `digitRange`    |
| `FieldFromNow`         | `fromNow`       |
| `FieldImage`           | `image`         |
| `FieldMoney`           | `money`         |
| `FieldOptions`         | `option`        |
| `FieldPassword`        | `password`      |
| `FieldPercent`         | `percent`       |
| `FieldProgress`        | `progress`      |
| `FieldRadio`           | `radio`         |
| `FieldRangePicker`     | `dateRange`     |
| `FieldRate`            | `rate`          |
| `FieldSecond`          | `second`        |
| `FieldSegmented`       | `segmented`     |
| `FieldSelect`          | `select`        |
| `FieldSlider`          | `slider`        |
| `FieldSwitch`          | `switch`        |
| `FieldTextArea`        | `textarea`      |
| `FieldTimePicker`      | `time`          |
| `FieldTimeRangePicker` | `timeRange`     |
| `FieldTreeSelect`      | `treeSelect`    |

### FieldMoney additional props {#money-props}

| Prop                  | Type                                                                      | Default                | Description / source                                                                                                                                                               |
| --------------------- | ------------------------------------------------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `locale`              | `string`                                                                  | Provider intl locale   | Unsupported locales fall back to zh-CN                                                                                                                                             |
| `customSymbol`        | `string`                                                                  | Locale currency symbol | Custom symbol; matching fieldProps takes precedence                                                                                                                                |
| `moneySymbol`         | `boolean`                                                                 | `true`                 | Show currency symbol; matching fieldProps takes precedence                                                                                                                         |
| `numberFormatOptions` | `Intl.NumberFormatOptions`                                                | Two decimals           | [Intl.NumberFormat options](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat); matching fieldProps takes precedence |
| `numberPopoverRender` | `boolean \| (props: InputNumberProps, defaultText: string) => VNodeChild` | Amount hint            | Focus hint in edit mode; false disables it. Callback props follow [InputNumber](https://www.antdv-next.com/components/input-number)                                                |

### Standalone display members {#display-atoms}

| Member                                                 | Props and defaults                                                                         | Slots, events, methods / source                                                               |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| `FieldIndexColumn`                                     | `text?: number` (empty text when omitted), `border?: boolean=false`                        | `default()` replaces the index; HTML attrs target span; no custom events or methods           |
| `FieldStatus.Success/Error/Processing/Default/Warning` | Other attrs go to [Badge](https://www.antdv-next.com/components/badge) with a fixed status | `default()` is status text; no custom events or methods; lowercase aliases are also available |
| `ProFieldBadgeColor`                                   | `color?: string`; other attrs go to [Badge](https://www.antdv-next.com/components/badge)   | `default()` is text; no custom events or methods                                              |

### Helpers {#helpers}

| Function                                                   | Returns                | Description                                                                                                                           |
| ---------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `createProField(renderer)`                                 | `Component`            | Custom field sharing props/slots; renderer is `(value, valueType, props, valueTypeMap) => VNodeChild` or `{ renderRead, renderEdit }` |
| `defaultRenderText(value, valueType, props, valueTypeMap)` | `VNodeChild`           | Default ProField VNode using registered renderers                                                                                     |
| `proFieldParsingValueEnumToArray(valueEnum)`               | `ProFormFieldOption[]` | Convert enums to option arrays                                                                                                        |
| `preloadProFieldValueType(type)`                           | `Promise<void>`        | Preload one built-in type                                                                                                             |
| `preloadAllProFieldValueTypes()`                           | `Promise<void>`        | Preload all built-in types                                                                                                            |

## Custom types and preloading

Register `render` / `formItemRender` through `ProConfigProvider.valueTypeMap`. Nested providers inherit by type name and replace a matching definition as a whole. The live uppercase example writes edits back to its model.

`preloadProFieldValueType(type)` preloads a built-in type; `preloadAllProFieldValueTypes()` preloads all built-in types. They perform real dynamic imports and share the loading Promise. Unknown/custom types reject. The root entry still exports ProField; preloading does not imply a separate bundle per valueType.
