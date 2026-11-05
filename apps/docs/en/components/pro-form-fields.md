---
pageClass: component-doc
---

<script setup>
import ProFormFieldsDemo from '../../examples/ProFormFieldsDemo.vue'
import ProFormFieldsExtendedDemo from '../../examples/ProFormFieldsExtendedDemo.vue'
</script>

# ProFormFields

Standalone fields give regular forms, custom layouts, ProTable search and inline editing, and SchemaForm one value-binding, option-request and readonly-display protocol. The original 19 fields remain available, alongside new date/time variants, cascader, color, rate and numeric-range fields. A field includes an Antdv Next `FormItem` by default; use `fieldMode="field"` or `ignoreFormItem` for a bare control.

## Complete field demo

This Vue SFC renders the original 19 fields and demonstrates readonly state, async options, the captcha callback, upload entry points, and bare-control mode.

<ClientOnly>
  <ProFormFieldsDemo />
</ClientOnly>

<details class="demo-source">
<summary>View complete source</summary>

<<< ../../examples/ProFormFieldsDemo.vue

</details>

## Imports and names

All 19 template-friendly names support named imports. Installing the default plugin also registers them globally under the same names.

```ts
import {
  ProFormCaptcha,
  ProFormCheckbox,
  ProFormDatePicker,
  ProFormDateRangePicker,
  ProFormDateTimePicker,
  ProFormDateTimeRangePicker,
  ProFormDigit,
  ProFormMoney,
  ProFormRadioGroup,
  ProFormSegmented,
  ProFormSelect,
  ProFormSlider,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
  ProFormTextPassword,
  ProFormTreeSelect,
  ProFormUploadButton,
  ProFormUploadDragger,
} from '@bubblesjs/antdv-next-pro'
```

The package also provides names matching the composed Ant Design Pro Components API:

```ts
ProFormText.Password === ProFormTextPassword
ProFormRadio.Group === ProFormRadioGroup
ProFormCheckbox.Group === ProFormCheckboxGroup
ProFormDatePicker.Week === ProFormDateWeekPicker
ProFormDatePicker.Month === ProFormDateMonthPicker
ProFormDatePicker.Quarter === ProFormDateQuarterPicker
ProFormDatePicker.Year === ProFormDateYearPicker
ProFormTimePicker.RangePicker === ProFormTimeRangePicker
ProFormSelect.SearchSelect === ProFormSearchSelect
```

Named components work directly in Vue templates. `ProFormRadio` is a renderable atomic Radio with boolean `v-model`; `.Group` is a group and `.Button` exposes the native RadioButton. The plugin registers named components, without dotted global names.

## Common API

### Common props

Each field combines a FormItem with a base control such as Input or Select by default. Common props cover field features, form-item settings and base-control settings: `label` and `rules` configure the form item, while `fieldProps` configures the base control.

These props apply to all field wrappers. `ProFormRadio.Button` is a native RadioButton and follows [Radio props][antd-radio] instead of this table.

| Prop             | Type                                                | Default                                   | Description                                                                                                                                           |
| ---------------- | --------------------------------------------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `modelValue`     | Component-specific                                  | `undefined`                               | Standard `v-model` value; within ProForm, falls back to the store value at `name` when no explicit binding is supplied                                |
| `name`           | `string \| number \| readonly (string \| number)[]` | —                                         | FormItem name, including nested paths; also connects to the ProForm store                                                                             |
| `label`          | `VNodeChild`                                        | —                                         | FormItem label; accepts text or VNodes, or use the `#label` slot, which takes precedence                                                              |
| `rules`          | `FormItemProps['rules']`                            | —                                         | Validation rules; see [FormItem props][antd-form-item]                                                                                                |
| `fieldMode`      | `'form-item' \| 'field'`                            | `'form-item'`                             | Render a form item or a bare control                                                                                                                  |
| `ignoreFormItem` | `boolean`                                           | `false`                                   | Forces bare-control mode when `true`, taking precedence over `fieldMode`                                                                              |
| `fieldProps`     | `Partial<BaseControlProps> & { class?, style? }`    | —                                         | Passed to Input, Select and other base controls; each field below links to the matching antdv-next props                                              |
| `formItemProps`  | `Partial<FormItemProps>`                            | —                                         | Passed only to FormItem; see [FormItem props][antd-form-item]                                                                                         |
| `placeholder`    | The base control's `placeholder` type               | —                                         | The top-level value is currently not forwarded; use `fieldProps.placeholder`; range fields accept string arrays                                       |
| `disabled`       | `boolean`                                           | Inherited, otherwise `false`              | Preserve the control shape while disabling interaction; inherits ProForm / ConfigProvider settings                                                    |
| `readonly`       | `boolean`                                           | Inherited from ProForm, otherwise `false` | Use the shared readonly renderer                                                                                                                      |
| `emptyText`      | `VNodeChild`                                        | `'-'`                                     | Placeholder for `undefined`, `null` and empty strings                                                                                                 |
| `readonlyRender` | `(value) => VNodeChild`                             | —                                         | Custom readonly output; `null` / `undefined` falls back to default formatting                                                                         |
| `width`          | `number \| 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'`    | —                                         | Numbers are pixels; presets are 104 / 216 / 328 / 440 / 552px, limited to the container width                                                         |
| `prefixCls`      | `string`                                            | Generated by ProConfigProvider            | Custom field style prefix                                                                                                                             |
| `classes`        | `ProSemanticSource<ProSemanticClasses>`             | —                                         | Semantic-part class names; accepts an object or `({ props }) => object`; see the styling notes below                                                  |
| `classNames`     | `ProSemanticSource<ProSemanticClasses>`             | —                                         | Legacy semantic classes; fills parts not specified by `classes`                                                                                       |
| `styles`         | `ProSemanticSource<ProSemanticStyles>`              | —                                         | Semantic-part styles; accepts an object or `({ props }) => object`                                                                                    |
| `convertValue`   | `(value, values) => unknown`                        | —                                         | Converts incoming values when ProForm initializes, synchronizes external values or registers a field                                                  |
| `transform`      | `(value, values) => unknown`                        | —                                         | Converts values for ProForm formatted reads or submission; returning a plain object removes the original field and merges that object into the output |
| `preserve`       | `boolean`                                           | Preserved                                 | Within ProForm, `false` removes the field's store value when it unmounts                                                                              |
| `proFieldProps`  | `Record<string, unknown>`                           | —                                         | ProField configuration; `mode: 'read'` or `readonly: true` selects readonly display                                                                   |

### Common form-item props

In addition to `name`, `label` and `rules` above, the following props configure the FormItem inside every field wrapper. All can be set through `formItemProps`; see [antdv-next FormItem props][antd-form-item] for the complete native definitions.

| Prop               | Type                                                      | Default                                    | Description                                                                                                               |
| ------------------ | --------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `tooltip`          | `FormItemProps['tooltip']`                                | —                                          | Hint beside the label; accepts content or a Tooltip configuration object, including `icon`; hidden when there is no label |
| `extra`            | `FormItemProps['extra']`                                  | —                                          | Additional information below the control; can appear alongside validation messages                                        |
| `help`             | `FormItemProps['help']`                                   | Validation messages                        | Custom help or error content; supplied content replaces automatically generated validation messages                       |
| `required`         | `boolean`                                                 | Derived from `rules`                       | Controls the required mark; configure `rules` for actual required validation                                              |
| `validateStatus`   | `'success' \| 'warning' \| 'error' \| 'validating' \| ''` | Automatically computed                     | Manually sets the displayed validation status                                                                             |
| `hasFeedback`      | `FormItemProps['hasFeedback']`                            | `false`                                    | Displays validation feedback icons; customize them with `{ icons }`                                                       |
| `labelCol`         | `ColProps`                                                | Inherited from Form                        | Label grid layout, such as `{ span: 6 }`; supports responsive settings                                                    |
| `wrapperCol`       | `ColProps`                                                | Inherited from Form                        | Control grid layout, such as `{ span: 18 }`; supports responsive settings                                                 |
| `labelAlign`       | `'left' \| 'right'`                                       | Inherited from Form                        | Label alignment                                                                                                           |
| `colon`            | `boolean`                                                 | Inherited from Form, usually `true`        | Whether to display a colon after the label; hidden in vertical layout                                                     |
| `htmlFor`          | `string`                                                  | Automatically linked field ID              | Control ID associated with the label; set a custom control ID through `fieldProps.id`                                     |
| `validateFirst`    | `boolean \| 'parallel'`                                   | `false`                                    | `true` stops after the first failing rule; `'parallel'` validates in parallel and uses the first failure                  |
| `validateTrigger`  | `'change' \| 'blur' \| 'focus' \| TriggerType[] \| false` | Inherited from Form, ultimately `'change'` | Validation trigger events; accepts an array; `false` disables event-triggered validation                                  |
| `validateDebounce` | `number`                                                  | No delay                                   | Debounce time in milliseconds for event-triggered validation                                                              |
| `class`            | `HTMLAttributes['class']`                                 | —                                          | FormItem root class                                                                                                       |
| `style`            | `HTMLAttributes['style']`                                 | —                                          | FormItem root styles                                                                                                      |

These props also support top-level forwarding. Multiword props must use the camelCase keys shown above, such as `:labelCol="{ span: 6 }"`; undeclared kebab-case attrs such as `:label-col` are currently not mapped to FormItem. Prefer `:form-item-props="{ labelCol: { span: 6 } }"` for consistent configuration. Declared component props such as `name`, `label`, `rules` and `form-item-props` are not affected by this limitation.

#### Props that require `formItemProps`

The following native form-item settings are not included in the field's top-level FormItem forwarding and must be supplied explicitly through `formItemProps`.

| Prop               | Type                                             | Default                                | Description                                                                                                                       |
| ------------------ | ------------------------------------------------ | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `layout`           | `'horizontal' \| 'vertical'`                     | Inherited from Form                    | Layout of this FormItem; the field's top-level `layout` controls Checkbox / Radio option arrangement                              |
| `hidden`           | `boolean`                                        | `false`                                | Hides the form item while retaining the field and validation                                                                      |
| `noStyle`          | `boolean`                                        | `false`                                | Omits the FormItem layout wrapper while retaining form-item features; differs from `fieldMode="field"`, which creates no FormItem |
| `messageVariables` | `Record<string, string>`                         | Automatically generated label variable | Custom validation-message template variables; can override the default `label` variable                                           |
| `trigger`          | `'change' \| 'blur' \| 'focus' \| TriggerType[]` | —                                      | Compatibility fallback for validation events when `validateTrigger` is not set; field values still bind through `v-model`         |
| `rootClass`        | `string`                                         | —                                      | Additional class for the FormItem root                                                                                            |
| `prefixCls`        | `string`                                         | Inherited from Form / ConfigProvider   | FormItem style prefix; the field's top-level `prefixCls` configures the Pro field style prefix                                    |

Within ProForm, set `name` on the field itself to connect to the form store; setting only `formItemProps.name` does not register a ProForm field. Configure label wrapping on the parent with `<ProForm label-wrap>`; per-field `labelWrap` is currently unsupported.

### `fieldProps` and base-component props

Configure native field-specific props through `fieldProps`, such as Input's `allowClear`, Select's `mode` and a date picker's `disabledDate`. Each field's **fieldProps API** link below points directly to its matching antdv-next base-component API. Additional Pro props are documented on this page.

```vue
<ProFormText
  name="title"
  label="Title"
  tooltip="Title shown in the list"
  :rules="[{ required: true, message: 'Enter a title' }]"
  :form-item-props="{
    extra: 'Up to 30 characters',
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
    validateTrigger: 'blur',
  }"
  :field-props="{ allowClear: true, maxLength: 30, showCount: true }"
/>
<ProFormSelect
  name="tags"
  :options="tagOptions"
  :field-props="{ mode: 'multiple', allowClear: true }"
/>
```

`formItemProps` controls the label, validation and hints around a field; `fieldProps` controls the input itself. Bind field values with `v-model` rather than supplying a separate `value`, `checked` or `fileList` in `fieldProps`.

### Layout and other forwarded props

- `width` sets the field's own width; see the common props above. Use `formItemProps.labelCol` / `wrapperCol` for the width ratio between the label and control.
- `allowClear` is a base-control prop; set it through `fieldProps.allowClear`. It applies only to controls that support clearing, and its default follows the corresponding base component.
- `secondary` is read only by LightFilter; `true` places the field under “More filters”. Fields are not collapsed by default. See [QueryFilter / LightFilter](./query-filter).
- Standalone fields do not provide a shared `rowProps` / `colProps` grid-layout protocol. Compose Row / Col for custom layouts, or follow [SchemaForm](./schema-form) for its grid settings.

### Form-item and bare-control modes

`fieldMode="form-item"` is the default. `name`, `label`, `rules`, and `formItemProps` apply to the FormItem created by the component.

```vue
<ProFormText
  v-model="form.title"
  name="title"
  label="Title"
  :rules="[{ required: true, message: 'Enter a title' }]"
/>
```

Use bare-control mode when a parent already owns the FormItem, or when the field lives in a table cell or custom grid. It creates no FormItem, and `label`, `rules`, and `formItemProps` do not participate in rendering; `name` can still connect to the ProForm store.

```vue
<ProFormText
  v-model="keyword"
  field-mode="field"
  :field-props="{ placeholder: 'Only Input is rendered' }"
/>
```

### Prop precedence and attrs

Ordinary properties resolve in this order:

1. Explicit control configuration in `fieldProps`.
2. Top-level convenience control props.
3. Component default.

For example, `fieldProps.disabled` and `fieldProps.min` win over matching convenience props. Top-level FormItem `name` / `label` / `rules` and the supported forwarded props in the table above win over matching `formItemProps`; `class` / `style` merge according to Vue's rules. The field core owns controlled value props and update listeners; consumer handlers are composed with `v-model` updates.

`fieldProps.class/style` targets the control and `formItemProps.class/style` targets FormItem. Plain `class`, `style` and the top-level form-item props listed above target FormItem; control props such as `max`, `data-*` and `aria-*` reach the base control. Supply other native FormItem props explicitly through `formItemProps`. In bare mode class/style also reach the control.

`classes` / `styles` accept objects or `({ props }) => ({ root: ... })`. `root` styles the current mode's root, and `control` styles the native control. UploadButton also exposes `button`; UploadDragger exposes `icon`, `title` and `description`. Legacy `classNames` fills parts missing from classes; classes wins for matching parts. Native Upload puts class on its wrapper and style on its upload trigger; bare mode preserves this native behavior.

`width` accepts pixel numbers or xs/sm/md/lg/xl (104/216/328/440/552px). Within ProForm, `name` connects to the form store, `convertValue` converts values during initialization or external-value synchronization, and `transform` handles formatted submission. `proFieldProps.mode='read'` selects readonly mode.

### `v-model` bridges

Every field wrapper exposes `modelValue / update:modelValue`. The field core adapts the base-control protocol:

| Field kind                                                                                                | Base-control protocol        | Public protocol |
| --------------------------------------------------------------------------------------------------------- | ---------------------------- | --------------- |
| Input, InputNumber, date/time pickers, Select, RadioGroup, Slider, Segmented, Cascader, ColorPicker, Rate | `value / update:value`       | `v-model`       |
| Single Checkbox, single Radio, Switch                                                                     | `checked / update:checked`   | `v-model`       |
| Upload, UploadDragger                                                                                     | `fileList / update:fileList` | `v-model`       |

`fieldProps['onUpdate:value']`, `fieldProps['onUpdate:checked']`, or `fieldProps['onUpdate:fileList']` can coexist with component `v-model` and are each called once per update.

### Events

| Event               | Components                    | Description                                                                          |
| ------------------- | ----------------------------- | ------------------------------------------------------------------------------------ |
| `update:modelValue` | All                           | Normalized field value                                                               |
| `change`            | All                           | Original base-control change arguments                                               |
| `requestError`      | Option fields using `request` | Option request failed; valid existing options remain                                 |
| `captchaError`      | Captcha                       | Callback rejected or returned `false`; `false` stays an explicit cancellation result |
| `drop`              | Both Upload fields            | Original drop event                                                                  |

For model updates and forwarded events, the `fieldProps` handler runs before the wrapper emits the corresponding event.

### Slots and instance methods

`label`, `extra`, `help`, and `tooltip` are FormItem slots. Other named slots and the default slot are forwarded to the base control. FormItem-only slots are not rendered in `fieldMode="field"`.

`#label`, `#extra` and `#help` take precedence over matching props. Use a slot to customize label content; when no renderable label is provided, neither the label nor its tooltip is displayed.

```vue
<ProFormText name="title" :rules="[{ required: true, message: 'Enter a title' }]">
  <template #label>
    <span>Title <small>(shown in the list)</small></span>
  </template>
  <template #extra>Up to 30 characters</template>
</ProFormText>
```

- Captcha adds a `captcha` slot with `{ seconds }`.
- UploadButton's default slot replaces the upload-button content.
- UploadDragger's default slot replaces the drag area.
- ProFormSelect, ProFormTreeSelect, ProFormCheckbox, ProFormRadioGroup, ProFormSegmented and option types rendered by ProFormField expose `refresh(): Promise<void>` through a component ref. It forces a new option request and bypasses the cache.
- Captcha exposes `resetCountdown(): void`.
- Captcha also exposes `focus()`, `startTiming()` and `endTiming()`; resetCountdown remains a compatibility stop/reset method.

## Options, requests, and readonly display

### `options`, `valueEnum`, and `request`

ProFormSelect / ProFormSearchSelect, ProFormTreeSelect, ProFormCheckbox / ProFormCheckboxGroup, ProFormRadioGroup, ProFormSegmented and ProFormCascader share one protocol. It also applies to option types rendered by dynamic ProFormField:

| Prop           | Type                                                                      | Default | Description                                                                                                                                                   |
| -------------- | ------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`      | `ProFormFieldOption[]`                                                    | —       | Local options, usually `{ label, value, disabled?, ... }`; tree and cascader options may contain `children`; Checkbox / RadioGroup also accept native options |
| `valueEnum`    | `Record<string \| number, string \| ProFormValueEnumItem> \| ReadonlyMap` | —       | Generates options from an enum; entries support `text`, `value`, `disabled` and other metadata                                                                |
| `request`      | `(params?) => Promise<Option[]>`                                          | —       | Fetches options asynchronously; return the array directly, without a `{ data }` wrapper                                                                       |
| `params`       | `Record<string, unknown>`                                                 | —       | Request parameters; changes trigger a new request                                                                                                             |
| `debounceTime` | `number`                                                                  | `0`     | Debounce delay in milliseconds after parameters or search keywords change                                                                                     |
| `proFieldKey`  | `string`                                                                  | —       | Cache discriminator, combined with request, params and provider context to form the cache key                                                                 |
| `cacheForSwr`  | `boolean`                                                                 | `true`  | Reuses the request cache in the current configuration scope; set `false` to disable reuse                                                                     |
| `searchValue`  | `string`                                                                  | —       | Controlled search keyword; remote search merges it into request parameters as `keyWords`                                                                      |

```vue
<ProFormSelect
  ref="selectRef"
  v-model="owner"
  :options="fallbackOptions"
  :params="{ teamId }"
  :request="loadOwners"
  @request-error="reportError"
/>
```

- When `request` exists, it starts immediately. Local options may be shown before its first success.
- After a successful request, the remote result is authoritative. An empty array is valid and does not fall back.
- Without `request`, precedence is top-level `options` → `fieldProps.options` (or `treeData` for TreeSelect) → `valueEnum`.
- A failure preserves the last successful result. Before any success, it preserves the local fallback and emits `requestError`.
- Changing `request` or `params` refreshes options. Only the newest concurrent request may update state.
- Remote search passes `{ ...params, keyWords }`. `searchValue`, `debounceTime`, `proFieldKey` and `cacheForSwr` control keywords, debounce and scoped caching. Stale or unmounted requests cannot overwrite current state.

Options use `label ?? text ?? title ?? name ?? value` as the label and `value ?? key ?? id` as the value. To preserve numeric `valueEnum` keys strictly, use a `ReadonlyMap` or set `value` explicitly:

```ts
const levels = new Map([
  [1, { text: 'Level 1' }],
  [2, { text: 'Level 2' }],
])

const alternate = {
  1: { text: 'Level 1', value: 1 },
}
```

### Readonly and reset

`readonly` uses one `ReadonlyField` instead of relying on inconsistent native readonly support. Choice fields show labels, arrays use commas, date ranges use `~`, passwords are masked, money keeps its prefix, and uploads show file names. `0` and `false` are not considered empty.

Switching to readonly preserves the instance `prefixCls` and `classes.control` / `styles.control`. Dynamic `code` / `jsonCode` fields use themed code blocks with `fieldProps.class/style` overrides; see [ProField](./pro-field.md).

Fields are controlled: when the parent resets and passes a new `modelValue`, the display updates immediately. Resetting the value does not clear the option cache. Captcha countdowns are cancelled explicitly with `resetCountdown()`.

## Dynamic ProFormField

`ProFormField` selects a control through `valueType` and supports the common and option props above. See [ProField](./pro-field.md) for supported types and formatting behavior.

| Prop        | Type                     | Default  | Description                                                                                                                                                 |
| ----------- | ------------------------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `valueType` | `ProFieldValueTypeInput` | `'text'` | A type name or `{ type, ...fieldConfiguration }`, such as `'select'` or `{ type: 'digit', min: 0 }`; explicit `fieldProps` overrides matching configuration |

The base component for `fieldProps` depends on `valueType`. Follow the links for the matching fields below; for example, `valueType="select"` uses [Select props][antd-select].

## The 19 components

Every component below is interactive in the [complete field demo](#complete-field-demo).

### ProFormText

**fieldProps API:** [InputProps][antd-input].

A single-line text field with `string | undefined` model values and an Input base control. It adds no Pro-specific default. Pass `allowClear`, `prefix`, `suffix`, `maxLength`, and other Input props through `fieldProps`.

### ProFormDigit

**fieldProps API:** [InputNumberProps][antd-input-number].

A numeric field with `number | string | null` values. It defaults to `min=0` with no fixed precision. Matching `fieldProps.min` / `fieldProps.precision` win over convenience props; pass `false` to omit either constraint. Top-level max also reaches InputNumber.

```vue
<ProFormDigit v-model="count" :min="false" :precision="0" />
```

| Prop        | Type                        | Default | Description                                      |
| ----------- | --------------------------- | ------- | ------------------------------------------------ |
| `min`       | `number \| string \| false` | `0`     | Minimum value; `false` omits this constraint     |
| `precision` | `number \| false`           | —       | Decimal precision; `false` omits this constraint |

### ProFormTextPassword

**fieldProps API:** [InputPasswordProps][antd-input-password].

A password field with `string | undefined` values and InputPassword underneath. Non-empty readonly values render as `••••••`. Use template-friendly `ProFormTextPassword` or the composed `ProFormText.Password` name.

### ProFormTextArea

**fieldProps API:** [TextAreaProps][antd-textarea].

A multiline `string | undefined` field. Pass `rows`, `autoSize`, `maxLength`, and other TextArea props through `fieldProps`.

Readonly display preserves line breaks, wraps long text, and retains `fieldProps.class/style` and `control` semantic styling.

### ProFormCaptcha

**fieldProps API:** [InputProps][antd-input]; the send button uses [ButtonProps][antd-button].

An Input and send-button composition. `onGetCaptcha(phone)` is required and countDown defaults to 60 seconds. Button text follows intl. With phoneName, the field first validates that ProForm path, then passes its phone value; failed validation prevents sending. A resolved result other than false starts the countdown; rejection or false restores the button and emits captchaError.

`captchaTextRender(timing, count)` customizes text, captchaProps configures the button and onTiming receives countdown values. The consumer implements the network request. Loading, countdown, disabled and readonly prevent repeated sends; unmount cleans the timer.

| Prop                | Type                                                             | Default      | Description                                                                                         |
| ------------------- | ---------------------------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------- |
| `onGetCaptcha`      | `(phone: string) => void \| boolean \| Promise<void \| boolean>` | Required     | Sends a captcha; returning `false` or rejecting emits `captchaError` without starting the countdown |
| `phoneName`         | `ProFormFieldName`                                               | —            | Phone-field path in ProForm; the callback receives an empty string when omitted                     |
| `countDown`         | `number`                                                         | `60`         | Countdown duration in seconds, rounded down and clamped to zero or above                            |
| `captchaTextRender` | `(timing: boolean, count: number) => VNodeChild`                 | —            | Button text for every state; takes precedence over `captchaText` / `countDownText`                  |
| `captchaText`       | `VNodeChild`                                                     | intl message | Button text while idle                                                                              |
| `countDownText`     | `(seconds: number) => VNodeChild`                                | intl message | Button text during the countdown                                                                    |
| `captchaProps`      | `Partial<ButtonProps>`                                           | —            | Send-button props; matching values override `buttonProps`; loading / disabled follow internal state |
| `buttonProps`       | `Partial<ButtonProps>`                                           | —            | Compatibility entry point for send-button props                                                     |
| `onTiming`          | `(count: number) => void`                                        | —            | Receives remaining seconds when timing starts and on each countdown tick                            |

### ProFormDatePicker

**fieldProps API:** [DatePickerProps][antd-date-picker], together with [common date-picker props][antd-date-common].

A date picker accepting Dayjs, string, timestamp and Date inputs. Without valueFormat it converts control input to Dayjs; with valueFormat it retains the native string protocol. Output follows the native picker; ProForm dateFormatter/transform controls submission conversion. Pass formatting, disabled dates and panel props through fieldProps.

### ProFormDateTimePicker

**fieldProps API:** [DatePickerProps][antd-date-picker].

A date-time picker using the same date-value protocol, with showTime=true by default. fieldProps.showTime wins over top-level showTime.

| Prop       | Type                          | Default | Description                                                             |
| ---------- | ----------------------------- | ------- | ----------------------------------------------------------------------- |
| `showTime` | `DatePickerProps['showTime']` | `true`  | Shows time selection; also accepts the native time-configuration object |

### ProFormDateRangePicker

**fieldProps API:** [RangePickerProps][antd-date-range], together with [common date-picker props][antd-date-common].

The same date-value protocol applied to a range array or null. Clearing does not synthesize an empty string. Range presets and disabled dates pass through fieldProps.

### ProFormDateTimeRangePicker

**fieldProps API:** [RangePickerProps][antd-date-range].

A date-time range following the date-range value protocol; when `valueFormat` is configured, it follows the native string protocol.

| Prop       | Type                           | Default | Description                                                             |
| ---------- | ------------------------------ | ------- | ----------------------------------------------------------------------- |
| `showTime` | `RangePickerProps['showTime']` | `true`  | Shows time selection; also accepts the native time-configuration object |

### ProFormSelect

**fieldProps API:** [SelectProps][antd-select].

Supports `options`, `valueEnum`, `request`, `params`, and `requestError`. Use `fieldProps` for `mode="multiple"` / `"tags"` and other Select capabilities. Its ref exposes `refresh()`.

### ProFormTreeSelect

**fieldProps API:** [TreeSelectProps][antd-tree-select].

Uses the shared option-request protocol. Standard options map to tree nodes with `title`, `label`, `value`, `disabled`, and `children`. Consumer-supplied `treeData`, `fieldNames`, and related props remain available through `fieldProps`.

### ProFormCheckbox

**fieldProps API:** [CheckboxProps][antd-checkbox] for a single checkbox; [CheckboxGroupProps][antd-checkbox-group] for a group.

Without an option source, it renders a single Checkbox and bridges native `checked` to `v-model`. With `options`, `valueEnum`, `request`, or `fieldProps.options`, it renders CheckboxGroup. `layout` defaults to `horizontal` and also accepts `vertical`.

| Prop     | Type                         | Default        | Description                                                                              |
| -------- | ---------------------------- | -------------- | ---------------------------------------------------------------------------------------- |
| `layout` | `'horizontal' \| 'vertical'` | `'horizontal'` | Group layout; `fieldProps.layout` takes precedence; also applies to ProFormCheckboxGroup |

### ProFormRadioGroup

**fieldProps API:** [RadioGroupProps][antd-radio-group].

A RadioGroup using the shared option-request protocol. radioType="button" selects button options; layout="vertical" stacks options. Matching fieldProps settings take precedence. Both ProFormRadioGroup and ProFormRadio.Group are available.

| Prop        | Type                         | Default        | Description                                                                          |
| ----------- | ---------------------------- | -------------- | ------------------------------------------------------------------------------------ |
| `radioType` | `'button' \| 'radio'`        | `'radio'`      | Option appearance; native `fieldProps.optionType` can select the appearance directly |
| `layout`    | `'horizontal' \| 'vertical'` | `'horizontal'` | Option layout                                                                        |

### ProFormSlider

**fieldProps API:** [SliderProps][antd-slider].

Uses `number | number[] | undefined` model values. `range`, `marks`, `min`, `max`, `step`, and `tooltip` pass through `fieldProps`.

### ProFormSwitch

**fieldProps API:** [SwitchProps][antd-switch].

Exposes `v-model` while bridging to native `checked / update:checked`. `checkedValue` and `unCheckedValue` are preserved instead of being forced to Boolean.

### ProFormUploadButton

**fieldProps API:** [UploadProps][antd-upload]; the trigger button uses [ButtonProps][antd-button], and image previews use [ImageProps][antd-image].

A button upload entry point with an `UploadFile[]` model bridged to `fileList`. Its default slot replaces the button content. Pass `action`, `customRequest`, `beforeUpload`, `headers`, `data`, `multiple`, `accept`, `maxCount`, `itemRender`, and other Upload props through `fieldProps`.

The library supplies no upload backend. Without `action` or `customRequest`, its internal `beforeUpload` returns `false` to prevent requests to an unknown destination, while still running a consumer `beforeUpload` handler.

| Prop          | Type                      | Default          | Description                                                                                |
| ------------- | ------------------------- | ---------------- | ------------------------------------------------------------------------------------------ |
| `icon`        | `VNodeChild`              | `UploadOutlined` | Upload-trigger icon                                                                        |
| `title`       | `VNodeChild`              | intl message     | Upload-trigger text                                                                        |
| `max`         | `number`                  | Unlimited        | Maximum file count; hides the trigger when reached; `fieldProps.maxCount` takes precedence |
| `buttonProps` | `Partial<ButtonProps>`    | —                | Passed only to the upload trigger button                                                   |
| `action`      | `UploadProps['action']`   | —                | Top-level convenience prop for the upload URL; `fieldProps.action` takes precedence        |
| `accept`      | `UploadProps['accept']`   | —                | Accepted file types; `fieldProps.accept` takes precedence                                  |
| `listType`    | `UploadProps['listType']` | `'picture'`      | File-list appearance; `fieldProps.listType` takes precedence                               |
| `imageProps`  | `Omit<ImageProps, 'src'>` | —                | Built-in image-preview configuration                                                       |

### ProFormUploadDragger

**fieldProps API:** [UploadDraggerProps / UploadProps][antd-upload].

A drag-and-drop upload entry point with the same `UploadFile[]`, `fileList`, and no-backend contract as UploadButton. Its default slot replaces the drag area and `drop` forwards the native event.

| Prop          | Type                    | Default         | Description                                                                                |
| ------------- | ----------------------- | --------------- | ------------------------------------------------------------------------------------------ |
| `icon`        | `VNodeChild`            | `InboxOutlined` | Drag-area icon                                                                             |
| `title`       | `VNodeChild`            | intl message    | Drag-area title                                                                            |
| `description` | `VNodeChild`            | intl message    | Drag-area description                                                                      |
| `max`         | `number`                | Unlimited       | Maximum file count; hides the trigger when reached; `fieldProps.maxCount` takes precedence |
| `action`      | `UploadProps['action']` | —               | Upload URL; `fieldProps.action` takes precedence                                           |
| `accept`      | `UploadProps['accept']` | —               | Accepted file types; `fieldProps.accept` takes precedence                                  |

### ProFormMoney

**fieldProps API:** [InputNumberProps][antd-input-number], with the amount-formatting options below.

A number/string/null amount field with two decimal places by default and locale inherited from intl. locale, customSymbol, moneySymbol and numberFormatOptions control separators, symbols and precision. `moneySymbol=false` hides the currency symbol; `prefix=false` disables the default prefix. fieldProps wins on matching settings. Formatting preserves the raw controlled value; native formatter, parser and stringMode remain customizable.

| Prop                  | Type                                                                        | Default              | Description                                                                              |
| --------------------- | --------------------------------------------------------------------------- | -------------------- | ---------------------------------------------------------------------------------------- |
| `locale`              | `string`                                                                    | intl locale          | Amount-formatting locale; unsupported locales fall back to `zh-CN`                       |
| `moneySymbol`         | `boolean`                                                                   | `true`               | Shows the currency symbol                                                                |
| `customSymbol`        | `string`                                                                    | Determined by locale | Custom currency symbol                                                                   |
| `prefix`              | `InputNumberProps['prefix'] \| false`                                       | Determined by locale | Custom prefix; `false` disables the default prefix                                       |
| `numberFormatOptions` | `Intl.NumberFormatOptions`                                                  | Two decimal places   | Options for `Intl.NumberFormat`, including currency, fraction digits and grouping        |
| `numberPopoverRender` | `boolean \| ((props: InputNumberProps, defaultText: string) => VNodeChild)` | —                    | Type-compatibility option; ProFormMoney currently does not render a numeric-hint popover |

### ProFormSegmented

**fieldProps API:** [SegmentedProps][antd-segmented].

A segmented `string | number` field using the shared option-request protocol. It supplies an empty options array when no source exists, and preserves `disabled` plus other option metadata.

## Shared field core in higher-level components

Standalone fields and higher-level components use the same registry and FieldControl:

- ProTable search items use form-item mode; editable cells use bare-control mode.
- SchemaForm keeps its own FormItem, nested paths, dynamic slots, and composition fields while its default-control branch uses the bare field core.
- EditableProTable reuses the core through ProTable instead of maintaining a third field map.

See [ProField](./pro-field.md) for 42 built-in valueTypes and their three modes. Captcha, UploadButton and UploadDragger remain standalone-only fields without a valueType mapping or built-in backend.

## Additional fields and composed members

`ProFormDigitRange` uses a compact numeric-input group. Set `fieldProps.separator` / `separatorWidth` to customize its separator and width in pixels (default `~` / `30`); a placeholder array configures each endpoint independently, and `fieldProps.style` styles the group container.

<ClientOnly><ProFormFieldsExtendedDemo /></ClientOnly>

<<< ../../examples/ProFormFieldsExtendedDemo.vue

These components also support common props. Option-capable fields additionally support option and request props. The final column links to each component's native configuration.

| Field                                                                                                                         | Values and behavior                                                                                                                                       | fieldProps API                                                                     |
| ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `ProFormCascader`                                                                                                             | Cascaded path arrays; options/request, clearing and readonly labels                                                                                       | [CascaderProps][antd-cascader]                                                     |
| `ProFormColorPicker`                                                                                                          | Native color values; the readonly native color trigger keeps its popup closed                                                                             | [ColorPickerProps][antd-color-picker]                                              |
| `ProFormRate`                                                                                                                 | Numeric ratings; disabled rating display in read mode                                                                                                     | [RateProps][antd-rate]                                                             |
| `ProFormDigitRange`                                                                                                           | `[number \| null, number \| null]`; two numeric inputs share fieldProps; clearing one preserves the other; placeholder can specify text for each endpoint | [InputNumberProps][antd-input-number]                                              |
| `ProFormTimePicker` / `ProFormTimePicker.RangePicker` / `ProFormTimeRangePicker`                                              | Native time/range protocol; string normalization and valueFormat follow date fields                                                                       | [TimePickerProps][antd-time-picker] / [time RangePicker props][antd-time-range]    |
| `ProFormDateWeekPicker` / `ProFormDateMonthPicker` / `ProFormDateQuarterPicker` / `ProFormDateYearPicker`                     | Date values; default `picker='week' / 'month' / 'quarter' / 'year'` respectively; fieldProps.picker can override it                                       | [DatePickerProps][antd-date-picker]                                                |
| `ProFormDateWeekRangePicker` / `ProFormDateMonthRangePicker` / `ProFormDateQuarterRangePicker` / `ProFormDateYearRangePicker` | Range values with the corresponding picker default; fieldProps.picker can override it                                                                     | [RangePickerProps][antd-date-range]                                                |
| `ProFormRadio`                                                                                                                | A single Radio uses boolean v-model; `ProFormRadio.Group` is ProFormRadioGroup above; `.Button` is a native RadioButton                                   | [RadioProps / RadioButton props][antd-radio] / [RadioGroupProps][antd-radio-group] |
| `ProFormCheckboxGroup` / `ProFormCheckbox.Group`                                                                              | Always renders CheckboxGroup; supports `layout='horizontal' / 'vertical'`, defaulting to horizontal                                                       | [CheckboxGroupProps][antd-checkbox-group]                                          |
| `ProFormSearchSelect` / `ProFormSelect.SearchSelect`                                                                          | Defaults to multiple, labelInValue and showSearch; matching fieldProps take precedence                                                                    | [SelectProps][antd-select]                                                         |

### ProFormSearchSelect-specific props

| Prop   | Type                               | Default      | Description                                                               |
| ------ | ---------------------------------- | ------------ | ------------------------------------------------------------------------- |
| `mode` | `'multiple' \| 'tags' \| 'single'` | `'multiple'` | `single` switches to single selection; `fieldProps.mode` takes precedence |

Its `fieldProps` also defaults to `labelInValue: true`, `showSearch: true`, `suffixIcon: null`, `autoClearSearchValue: true` and `optionLabelProp: 'label'`; each can be overridden. In the default multiple mode, selecting options returns an array of selected items with `label` / `value`; single mode returns one item.

[antd-form-item]: https://www.antdv-next.com/components/form#form-item-props
[antd-input]: https://www.antdv-next.com/components/input#input-props
[antd-input-password]: https://www.antdv-next.com/components/input#input-password-props
[antd-textarea]: https://www.antdv-next.com/components/input#input-textarea-props
[antd-input-number]: https://www.antdv-next.com/components/input-number#props
[antd-date-common]: https://www.antdv-next.com/components/date-picker#common-api
[antd-date-picker]: https://www.antdv-next.com/components/date-picker#datepicker
[antd-date-range]: https://www.antdv-next.com/components/date-picker#rangepicker
[antd-time-picker]: https://www.antdv-next.com/components/time-picker#timepicker
[antd-time-range]: https://www.antdv-next.com/components/time-picker#rangepicker
[antd-select]: https://www.antdv-next.com/components/select#property
[antd-tree-select]: https://www.antdv-next.com/components/tree-select#props
[antd-checkbox]: https://www.antdv-next.com/components/checkbox#checkbox-props
[antd-checkbox-group]: https://www.antdv-next.com/components/checkbox#checkboxgroup-props
[antd-radio]: https://www.antdv-next.com/components/radio#radio-props
[antd-radio-group]: https://www.antdv-next.com/components/radio#radiogroup-props
[antd-slider]: https://www.antdv-next.com/components/slider#props
[antd-switch]: https://www.antdv-next.com/components/switch#props
[antd-upload]: https://www.antdv-next.com/components/upload#props
[antd-segmented]: https://www.antdv-next.com/components/segmented#props
[antd-cascader]: https://www.antdv-next.com/components/cascader#props
[antd-color-picker]: https://www.antdv-next.com/components/color-picker#props
[antd-rate]: https://www.antdv-next.com/components/rate#props
[antd-button]: https://www.antdv-next.com/components/button#props
[antd-image]: https://www.antdv-next.com/components/image#props
