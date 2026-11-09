---
pageClass: component-doc
---

<script setup>
import CompositionForm from '../../../playground/src/demos/schema-form/CompositionForm.vue'
</script>

# ProForm composition

`ProForm` composes field components without `columns`. Use [BetaSchemaForm](./schema-form) for a schema-driven form. The default layout is `vertical`; set `layout="horizontal"` to keep the previous horizontal appearance.

Standard form actions align to the start with no additional top margin. Multiple buttons use the theme's `marginXS` gap.

<ClientOnly>
  <CompositionForm />
</ClientOnly>

<details class="demo-source"><summary>View complete code</summary>

<<< ../../../playground/src/demos/schema-form/CompositionForm.vue

</details>

```vue
<ProForm ref="form" :initial-values="{ name: 'Ada' }" :on-finish="save">
  <ProFormText name="name" label="Name" :rules="[{ required: true }]" />
</ProForm>
```

Bind the asynchronous business callback with `:on-finish="save"`. It may return boolean or void, including a Promise. The submit event is an observation hook. Submission shows loading and deduplicates concurrent `submit()` calls; validation failures and rejected callbacks reject the instance method.

## Values and instance

Initialization merges `initialValues < request(params) < URL < modelValue`. Only the latest initialization request is accepted. Re-rendering initial configuration with equivalent contents preserves drafts. `v-model`, `setFieldValue`, and `setFieldsValue` manage raw values.

Field `convertValue` processes incoming values; `transform` processes formatted output. An object returned by transform replaces the original field with root-level output properties. `dateFormatter` defaults to `string`; `number` outputs timestamps, false retains date objects, and a function customizes formatting. Formatting never mutates stored values.

| Instance member                                          | Purpose                                             |
| -------------------------------------------------------- | --------------------------------------------------- |
| `nativeForm`                                             | Underlying antdv-next Form instance                 |
| `validate` / `validateFields(names?)`                    | Validate and return raw values                      |
| `getFieldsValue()` / `getFieldValue(name)`               | Read raw values                                     |
| `getFieldsFormatValue()` / `getFieldFormatValue(name)`   | Read formatted and transformed output               |
| `validateFieldsReturnFormatValue(names?)`                | Validate and return formatted output                |
| `setFieldsValue(values)` / `setFieldValue(name,value)`   | Merge values / update one path                      |
| `submit()`                                               | Validate, format, await onFinish, and return output |
| `reset()` / `resetFields()`                              | Restore the initialization snapshot                 |
| `clearValidate(names?)` / `scrollToField(name,options?)` | Clear errors / locate a field                       |
| `loading`                                                | Readonly loading Ref                                |

Field names support strings, numbers, and path arrays such as `['profile','name']`; the form's own name is a string. `onValuesChange(changedValues,values)` receives a nested changed-values object. Named forms inside `ProForm.Provider` / `ProFormProvider` participate in `onFormChange/onFormFinish`. `ProForm.useWatch(name)` observes a field; `ProForm.useFormInstance()` returns the nearest **native FormInstance**, as described under [Hooks](#hooks).

## Structural components

| Component                                  | Configuration                                                                                                                             |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `ProForm.Group` / `ProFormGroup`           | title/tooltip/extra; direction, size, labelLayout; collapsible, collapsed/defaultCollapsed, v-model:collapsed; title/extra slots          |
| `ProForm.FieldSet` / `ProFormFieldSet`     | One named array bound to controls in order; convertValue/transform; type=space or group, space configuration                              |
| `ProForm.List` / `ProFormList`             | name/initialValue/min/max/creatorRecord; creatorButtonProps, copyIconProps/deleteIconProps accept false; nested paths and stable row keys |
| `ProForm.Dependency` / `ProFormDependency` | name lists dependency paths; scoped slot receives selected values and form; ignoreFormListField skips the current List scope              |
| `ProForm.Item` / `ProFormItem`             | FormItem plus value/onUpdate:value binding for a native control; readonly/valueType                                                       |

List's default slot receives `{field,index,action,fields,record,list}`. `actionRef` and the component ref expose `add(record?,index?)`, `remove(index | indices)`, `copy(index)`, `move(from,to)`, `get(index)`, and `getList()`. Asynchronous `actionGuard.beforeAddRow(record,index,count)` and `beforeRemoveRow(index,count)` can return false. `actionRender/itemRender` customize actions and rows. Readonly, disabled, and min/max still constrain the public actions.

Groups default to a `32px` horizontal gap and no row gap. Title spacing follows the theme's `marginXL`. With `labelLayout="twoLine"`, the title occupies a full row and the field area has `16px` of inline-start padding.

## Dialog and filter forms

`ModalForm/DrawerForm` compose children without columns and retain a schema entry when columns are provided. Use trigger slots, open/v-model:open, title/width, and native modalProps/drawerProps. The form coordinates open, business title/width, footer, and close callbacks; other native settings pass through. Uncontrolled dialogs support instance open()/close(); controlled parents must accept open updates.

Only an awaited onFinish result of **true** closes the dialog. False, undefined, and rejection preserve its values and open state. Old submissions cannot close a reopened or unmounted dialog. The default Cancel button closes the dialog, calls native onCancel/onClose, and preserves drafts; call reset() explicitly to restore initial values. Setting destroyOnHidden (or legacy destroyOnClose) to true destroys the form after the closing animation and restores initial values on the next opening. afterClose/afterOpenChange callbacks are retained.

The dialog-only submitTimeout option is measured in milliseconds. A positive value temporarily disables cancellation and ignores interactive closing from the start of business submission until the timeout or completion. It does not abort the business Promise, and an unfinished submission keeps its loading indicator. Protection is off by default; instance close() and externally controlled open remain under caller control.

[QueryFilter](./query-filter) is independently importable and provides responsive columns, collapsed/defaultCollapsed, span, defaultColsNumber, labelWidth, split, optionRender(props,form,doms), collapseRender(collapsed), and searchText/resetText. Resizing preserves values and validation.

[LightFilter](./light-filter) is independently importable and displays ordinary fields as labels that open popovers, while secondary fields live under More by default. Setting collapse=true collects every field in a single More popover. It supports collapseLabel/placement/footerRender. Confirmation validates and submits, cancellation restores the opening snapshot, and clearing removes the value and submits. More renders field rows directly and applies these actions to the group. `LightWrapper` exposes the same popover behavior and v-model:open.

Both overlays default to `800px` wide. Set `width` or native `modalProps.width/drawerProps.width` to override it; native width settings take precedence. Actions render in the native footer, align to the end, and retain form validation and submission. Modal defaults to Confirm and Drawer to Submit, following locale. Submitter text overrides these defaults; Modal also respects native `okText`.

## Steps

```vue
<StepsForm :on-finish="save" :form-props="{ layout: 'vertical' }">
  <StepForm name="basic" title="Basics">
    <ProFormText name="name" label="Name" :rules="[{ required: true }]" />
  </StepForm>
  <StepForm name="owner" title="Owner">
    <ProFormText name="owner" label="Owner" />
  </StepForm>
</StepsForm>
```

Each step owns an independent native Form with its own initialValues/request/rules/onFinish. Without step onFinish, successful validation advances; with a callback, only true advances. False, undefined, or rejection stays on the step. Going back preserves drafts. The final submission revalidates all steps and merges formatted output. Use current/v-model:current, stepsProps, formProps, and formMapRef. The root instance exposes next()/prev()/submit()/validate()/reset()/formMap(); formMap provides each instance by name. `StepsForm.StepForm` and standalone `StepForm` are available.

Step navigation has a maximum width of `1160px`. Fields and actions share a centered container sized to its contents, with a minimum width of `min(420px, 100%)` and a maximum of `100%`. Each step has `32px` of top spacing.

## Actions and URL synchronization

`submitter=false` hides actions. Its object accepts searchConfig.submitText/resetText, submitButtonProps/resetButtonProps (or false), and render({form,submit,reset},doms) (or false). The submitter slot can use the provided submit/reset to retain the standard flow.

`syncToUrl=true` synchronizes query parameters using dotted paths, preserves unrelated parameters, removes owned empty fields, and responds to popstate including deleted values. A function receives `(values,'get'|'set')` and returns the mapped object. `syncToInitialValues=false` skips initial URL hydration. SchemaForm's legacy urlSync additionally supports key/hash modes; see its documentation.

## Configuration and styling

Forms and fields inherit native ConfigProvider locale, direction, componentDisabled, componentSize, theme algorithms, and global tokens. Native Form/Input components retain theme.components.Form/Input. Pro tokens use ProConfigProvider.token; theme.components.ProForm is not a supported entry. Explicit field properties override inherited values.

Default root classes are ant-pro-form, ant-pro-query-filter, ant-pro-form-light-filter, and ant-pro-steps-form. Native prefix=demo produces demo-pro prefixes; component prefixCls accepts the complete prefix.

`class/style/id/data-*/aria-*` target the actual form or layout root. classes/styles accept an object or `({props}) => object`. Applicable semantic parts are root/form/content/submitter/title/actions/row/item/container/collapseButton/step. Legacy classNames fills missing parts; classes wins on conflicts. Dialog form attributes target the internal form; configure the dialog itself through modalProps/drawerProps.

## API ownership and entry points {#api}

The tables describe the current Vue implementation. `T` is the form record type and `NamePath = string | number | readonly (string | number)[]`. A dash means this library sets no default. `ProForm` accepts native Form props directly and has **no formProps wrapper**. Schema and StepsForm use formProps as described below.

| Entry point                      | Own API                                                                             | Native configuration and source                                                                             |
| -------------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `ProForm`                        | [Props](#props), [events](#events), [slots](#slots), [instance](#instance)          | Bind rules, labelCol and other [native Form props](#native-form-props) directly                             |
| `Form` / `Embed`                 | ProForm without columns; BetaSchemaForm with columns                                | Schema mode uses [formProps](./schema-form#form-props)                                                      |
| `ModalForm` / `DrawerForm`       | [Overlay extensions](#overlay-props), supporting both modes                         | modalProps → [Modal API][antd-modal]; drawerProps → [Drawer API][antd-drawer]                               |
| `StepsForm` / `StepForm`         | [Composition API](#steps-props); with columns see [Schema API](./schema-form#props) | Composition StepsForm.formProps shares configuration between steps; Schema formProps configures native Form |
| `QueryFilter` / `LightFilter`    | [QueryFilter](./query-filter#props) / [LightFilter](./light-filter#props)           | Common ProForm props without columns; Schema API with columns                                               |
| Fields and structural components | [Structure](#structure-props), [standalone fields](./pro-form-fields#props)         | formItemProps → [FormItem][antd-form-item]; fieldProps → [base controls](./pro-form-fields)                 |

### ProForm props {#props}

| Property                                       | Type                                                                                               | Default                             | Description / source                                                                                            |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `modelValue`                                   | `Partial<T>`                                                                                       | —                                   | Raw values, supporting v-model                                                                                  |
| `initialValues`                                | `Partial<T>`                                                                                       | —                                   | Initialization and reset snapshot source                                                                        |
| `request`                                      | `(params?: Record<string, unknown>) => Promise<Partial<T>>`                                        | —                                   | Loads initial values; does not submit                                                                           |
| `params`                                       | `Record<string, unknown>`                                                                          | —                                   | Passed to request; content changes reinitialize the form                                                        |
| `onFinish`                                     | `(values: T) => boolean \| void \| Promise<boolean \| void>`                                       | —                                   | Awaitable business callback; bind with `:on-finish`                                                             |
| `onValuesChange`                               | `(changedValues: Partial<T>, values: T) => void`                                                   | —                                   | Nested changed values and the full raw model; differs from Schema values-change                                 |
| `readonly`                                     | `boolean`                                                                                          | `false`                             | Readonly child fields and hidden default actions                                                                |
| `disabled`                                     | `boolean`                                                                                          | ConfigProvider                      | Passed to native Form and inherited by child fields                                                             |
| `name`                                         | `string`                                                                                           | —                                   | Native Form name and ProFormProvider registration key                                                           |
| `layout`                                       | `'horizontal' \| 'vertical' \| 'inline'`                                                           | `'vertical'`                        | Native [Form layout][antd-form]; QueryFilter defaults to horizontal                                             |
| `submitter`                                    | `false \| SubmitterProps`                                                                          | `{}`                                | See the [SubmitterProps table](#submitter-props)                                                                |
| `syncToUrl`                                    | `boolean \| ((values, type: 'get' \| 'set') => Record<string, unknown>)`                           | Off                                 | Synchronizes dotted query paths; a function maps incoming and outgoing values                                   |
| `syncToInitialValues`                          | `boolean`                                                                                          | `true`                              | Reads URL values during initialization                                                                          |
| `dateFormatter`                                | `'string' \| 'number' \| false \| ((value, valueType?) => unknown)`                                | `'string'`                          | Formats dates on submission/formatted reads without mutating the model                                          |
| `formRef`                                      | `Ref<ProFormInstance<T> \| undefined> \| ((instance) => void)`                                     | —                                   | Same instance as the component ref; receives undefined on unmount                                               |
| `prefixCls`                                    | `string`                                                                                           | ConfigProvider prefix + `-pro-form` | Complete ProForm prefix; differs from native Form prefixCls                                                     |
| `classes`                                      | `FormClasses \| (({ props }) => FormClasses)`                                                      | —                                   | [Semantic classes](#semantic)                                                                                   |
| `classNames`                                   | `FormClasses`                                                                                      | —                                   | Compatibility entry; classes takes precedence per part                                                          |
| `styles`                                       | `FormStyles \| (({ props }) => FormStyles)`                                                        | —                                   | [Semantic styles](#semantic)                                                                                    |
| `class` / `style` / `id` / `data-*` / `aria-*` | Vue HTML attributes                                                                                | —                                   | Actual root form; use modalProps/drawerProps for the overlay shell                                              |
| Other native Form props                        | `Omit<FormProps, 'model' \| 'onFinish' \| 'onValuesChange' \| 'onReset' \| 'classes' \| 'styles'>` | Native defaults                     | [Individual sources](#native-form-props); ProForm coordinates the model, submission, reset and semantic styling |

### Native Form props {#native-form-props}

Bind these directly on ProForm. Put them inside [formProps](./schema-form#form-props) on BetaSchemaForm. Full definitions, native defaults and version changes belong to [antdv-next FormProps][antd-form]. This library adds no default unless stated.

| Property                        | Type                                                     | Purpose / source                                                                                 |
| ------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `colon`                         | `boolean`                                                | Label colon; [FormProps][antd-form]                                                              |
| `labelAlign`                    | `'left' \| 'right'`                                      | Label alignment; [FormProps][antd-form]                                                          |
| `labelWrap`                     | `boolean`                                                | Label wrapping; [FormProps][antd-form]                                                           |
| `labelCol`                      | `ColProps`                                               | Label grid; [FormProps][antd-form], [Col API][antd-grid]                                         |
| `wrapperCol`                    | `ColProps`                                               | Control grid; [FormProps][antd-form], [Col API][antd-grid]                                       |
| `feedbackIcons`                 | `FormProps['feedbackIcons']`                             | Validation feedback icons; [FormProps][antd-form]                                                |
| `size`                          | `'small' \| 'middle' \| 'large'`                         | Child-control size; [FormProps][antd-form]                                                       |
| `scrollToFirstError`            | `boolean \| ScrollFocusOptions`                          | Scrolls to validation failure; [FormProps][antd-form]                                            |
| `requiredMark`                  | `boolean \| 'optional' \| ((label, info) => VNodeChild)` | Required mark; [FormProps][antd-form]                                                            |
| `variant`                       | `FormProps['variant']`                                   | Child-control appearance; [FormProps][antd-form]                                                 |
| `validateMessages`              | `ValidateMessages`                                       | Validation-message templates; [FormProps][antd-form]                                             |
| `rules`                         | `RulesMap`                                               | Form-level rules; [FormProps][antd-form]                                                         |
| `validateTrigger`               | `string \| string[] \| false`                            | Validation triggers; [FormProps][antd-form]                                                      |
| `preserve`                      | `boolean`                                                | Preserves values on field unmount; [FormProps][antd-form]                                        |
| `clearOnDestroy`                | `boolean`                                                | Native Form destruction behavior; [FormProps][antd-form]; use destroyOnHidden for overlay drafts |
| `validateOnRuleChange`          | `boolean`                                                | Validates on rule changes; [FormProps][antd-form]                                                |
| `autoComplete` / `autocomplete` | `string`                                                 | Browser autocomplete; [FormProps][antd-form]                                                     |
| `tooltip`                       | `FormProps['tooltip']`                                   | Global label tooltip; [FormProps][antd-form]                                                     |
| `onFinishFailed`                | `(errorInfo: ValidateErrorEntity) => void`               | Native submit-validation failure; [Form events][antd-form]                                       |
| `onValidate`                    | `(name, status, errors) => void`                         | Native field-validation notification; [Form events][antd-form]                                   |
| `onFieldsChange`                | `(changedFields, allFields) => void`                     | Native field-state changes; [Form events][antd-form]                                             |

The internal state supplies model; use modelValue. onFinish and onValuesChange are the Pro callbacks above. submit and reset are Pro events whose arguments are values rather than DOM events. Handle errors from instance submit() through its Promise or the Pro error event; native callbacks do not cover every Pro call path. The Pro meanings of name/layout/disabled/prefixCls/classes/styles are listed separately above.

### SubmitterProps {#submitter-props}

<span id="submitter"></span>

| Setting             | Type                                                                     | Default         | Description / source                                                                                                                        |
| ------------------- | ------------------------------------------------------------------------ | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `searchConfig`      | `{ submitText?: VNodeChild; resetText?: VNodeChild }`                    | Locale text     | submitText and resetText customize each button                                                                                              |
| `submitText`        | `VNodeChild`                                                             | Locale text     | Compatibility submit text; searchConfig.submitText takes precedence                                                                         |
| `resetText`         | `VNodeChild`                                                             | Locale text     | Compatibility reset text; searchConfig.resetText takes precedence                                                                           |
| `submitButtonProps` | `false \| Partial<ButtonProps>`                                          | `{}`            | false hides the button; [Button API][antd-button]. The component manages htmlType/form association and merges loading with submission state |
| `resetButtonProps`  | `false \| Partial<ButtonProps>`                                          | `{}`            | Reset button, or Cancel in overlays; [Button API][antd-button]                                                                              |
| `render`            | `false \| (({ form, submit, reset }, doms: VNodeChild[]) => VNodeChild)` | Default buttons | Replaces actions; false hides them; submitter slot takes precedence                                                                         |

### ProForm events {#events}

| Event               | Arguments        | When emitted                                                                                       |
| ------------------- | ---------------- | -------------------------------------------------------------------------------------------------- |
| `update:modelValue` | `values: T`      | Raw model changes; use v-model or `@update:model-value`                                            |
| `change`            | `values: T`      | Field-value changes                                                                                |
| `submit`            | `values: T`      | After validation, date formatting and transform, before onFinish; has no callback-return semantics |
| `reset`             | `values: T`      | Restores the initialization snapshot                                                               |
| `requestError`      | `error: unknown` | Initial-value request fails; template `@request-error`                                             |
| `error`             | `error: unknown` | Submission validation or onFinish fails                                                            |

Native finishFailed, validate and fieldsChange listeners pass through attrs to native Form; their arguments belong to the [native Form API](#native-form-props). Schema mode has a separate [event set](./schema-form#events).

### ProForm slots {#slots}

| Slot        | Scope                                                                                | Description                                                                       |
| ----------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| `default`   | `{ values: T, form: ProFormInstance<T> }`                                            | Composed fields                                                                   |
| `submitter` | `{ form, values, submit: () => Promise<T>, reset: () => void, submitting: boolean }` | Replaces actions before submitter.render; hidden when submitter=false or readonly |

### ProForm instance {#instance}

Obtain ProFormInstance through the component ref or formRef. Pro method signatures differ from [native FormInstance][antd-form-instance]. Access the full native API through nativeForm.

| Method / member                   | Arguments                                         | Returns                     | Description                                                                                      |
| --------------------------------- | ------------------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------ |
| `nativeForm`                      | —                                                 | `FormInstance \| undefined` | Native instance, available after mount                                                           |
| `validate`                        | `names?: NamePath[]`                              | `Promise<T>`                | Validates and returns raw values                                                                 |
| `validateFields`                  | `names?: NamePath[]`                              | `Promise<T>`                | Alias of validate                                                                                |
| `validateFieldsReturnFormatValue` | `names?: NamePath[]`                              | `Promise<T>`                | Validates, then returns date-formatted/transformed output                                        |
| `getFieldsValue`                  | `all?: boolean`                                   | `T`                         | Reads the raw model                                                                              |
| `getFieldValue`                   | `name: NamePath`                                  | `unknown`                   | Reads a field                                                                                    |
| `getFieldsFormatValue`            | —                                                 | `T`                         | Formats and transforms all fields                                                                |
| `getFieldFormatValue`             | `name: NamePath`                                  | `unknown`                   | Reads a path from the transformed output; use its output path after renaming through transform   |
| `setFieldsValue`                  | `values: Partial<T>`                              | `void`                      | Merges values and applies incoming convertValue                                                  |
| `setFieldValue`                   | `name: NamePath, value: unknown`                  | `void`                      | Updates one field                                                                                |
| `submit`                          | —                                                 | `Promise<T>`                | Validates, formats and awaits onFinish; rejects failures and deduplicates concurrent submissions |
| `reset`                           | —                                                 | `void`                      | Restores the initialization snapshot                                                             |
| `resetFields`                     | —                                                 | `void`                      | Alias of reset; does not accept native partial-reset arguments                                   |
| `clearValidate`                   | `names?: NamePath[]`                              | `void`                      | Clears validation errors                                                                         |
| `scrollToField`                   | `name: NamePath, options?: ScrollIntoViewOptions` | `void`                      | Scrolls to a field                                                                               |
| `loading`                         | —                                                 | `Readonly<Ref<boolean>>`    | Submission state; Vue public instances may unwrap the ref                                        |

### ModalForm / DrawerForm props, events and slots {#overlay-props}

Both inherit [ProForm props](#props), [events](#events) and [instance methods](#instance). Providing columns switches to [SchemaForm props and slots](./schema-form#props); the composition slot scopes below do not apply to Schema mode.

| Extension       | Type                    | Default                    | Description / source                                                                                                             |
| --------------- | ----------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `columns`       | `SchemaFormColumn<T>[]` | —                          | Uses Schema mode when supplied; otherwise composes child fields                                                                  |
| `open`          | `boolean`               | Uncontrolled initial false | v-model:open; controlled parents must accept updates                                                                             |
| `title`         | `VNodeChild`            | —                          | Takes precedence over the native overlay title                                                                                   |
| `width`         | `number \| string`      | `800`                      | Native modalProps.width / drawerProps.width takes precedence                                                                     |
| `trigger`       | `VNodeChild`            | —                          | Click to open; trigger slot takes precedence                                                                                     |
| `modalProps`    | `Partial<ModalProps>`   | —                          | ModalForm only; [Modal API][antd-modal]                                                                                          |
| `drawerProps`   | `Partial<DrawerProps>`  | —                          | DrawerForm only; [Drawer API][antd-drawer]                                                                                       |
| `submitTimeout` | `number`                | Protection off             | Positive values protect against interactive closing during submission for that many milliseconds; the business Promise continues |

The form manages native open/footer. onCancel/onClose and afterClose/afterOpenChange are composed with internal behavior. Interactive close callbacks do not run during protection. destroyOnHidden, or legacy destroyOnClose, controls destruction after closing. Other native settings, including overlay semantic styles, pass through the corresponding props object.

| Event extension | Arguments       | Description                                                         |
| --------------- | --------------- | ------------------------------------------------------------------- |
| `update:open`   | `open: boolean` | Open-state updates                                                  |
| `openChange`    | `open: boolean` | Composition-mode notification; Schema mode uses open / close events |

| Composition slot        | Scope                                                            | Description                                             |
| ----------------------- | ---------------------------------------------------------------- | ------------------------------------------------------- |
| `default` / `submitter` | Same as [ProForm slots](#slots)                                  | Internal fields and actions                             |
| `trigger`               | `{ open: boolean, openForm: () => void, closeForm: () => void }` | Custom opening control                                  |
| `title`                 | Native slot scope                                                | [Modal slots][antd-modal] / [Drawer slots][antd-drawer] |
| `footer`                | Native slot scope                                                | Custom overlay footer; hides the internal submitter     |
| Other overlay slots     | Native slot scope                                                | Forwarded to the native overlay; names follow its API   |

Additional instance methods are open(): void and close(): void. Public layout aliases return a SchemaFormInstance forwarder, which also contains compatibility next/prev/formMap members. Those do nothing without the corresponding layout.

### StepsForm / StepForm {#steps-props}

This section describes composition mode **without columns**. StepsForm does not inherit every ProForm prop: put shared form settings inside formProps. Each StepForm inherits [ProForm props](#props). Steps with columns use the [Schema API](./schema-form#props).

| StepsForm property | Type                                          | Default                                         | Description / source                                                                                                                                                                                                                                                      |
| ------------------ | --------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `current`          | `number`                                      | `0`                                             | Current step; supports v-model:current                                                                                                                                                                                                                                    |
| `onFinish`         | `ProFormFinish<T>`                            | —                                               | Final merged submission; true resets all steps and returns to the first                                                                                                                                                                                                   |
| `stepsProps`       | `Partial<StepsProps>`                         | —                                               | [Steps API][antd-steps]; current/items come from the child steps; onChange is composed                                                                                                                                                                                    |
| `submitter`        | `false \| SubmitterProps`                     | `{}`                                            | [Action configuration](#submitter-props)                                                                                                                                                                                                                                  |
| `formProps`        | `ProFormProps<T>`                             | —                                               | Shared [ProForm configuration](#props); native entries such as rules follow [FormProps](#native-form-props). Each step overrides onFinish/onUpdate:modelValue/onChange/onSubmit/onReset/onError/onRequestError; configure per-step business onFinish directly on StepForm |
| `formMapRef`       | `Ref<Map<string, ProFormInstance>>`           | —                                               | Synchronizes instances by StepForm.name; becomes an empty Map on unmount                                                                                                                                                                                                  |
| `prefixCls`        | `string`                                      | `ant-pro-steps-form`, following provider prefix | Root-container prefix                                                                                                                                                                                                                                                     |
| `classes`          | `FormClasses \| (({ props }) => FormClasses)` | —                                               | [Semantic styles](#semantic)                                                                                                                                                                                                                                              |
| `classNames`       | `FormClasses`                                 | —                                               | Compatibility classes                                                                                                                                                                                                                                                     |
| `styles`           | `FormStyles \| (({ props }) => FormStyles)`   | —                                               | [Semantic styles](#semantic)                                                                                                                                                                                                                                              |

| StepForm extension | Type                      | Default         | Description / source                                                                                                              |
| ------------------ | ------------------------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `name`             | `string`                  | `step-${index}` | Instance Map/navigation key; the generated default is not passed as the internal Form name. An explicit name serves both purposes |
| `title`            | `VNodeChild`              | Step number     | Step navigation title; title slot takes precedence                                                                                |
| `stepProps`        | `Record<string, unknown>` | —               | One [Steps item][antd-steps]; generated name/title key/title take precedence                                                      |
| Other common props | `ProFormProps<T>`         | Same as ProForm | [Full table](#props); explicit step settings override StepsForm.formProps                                                         |

| Component / event                            | Arguments                  | Description                                                 |
| -------------------------------------------- | -------------------------- | ----------------------------------------------------------- |
| StepsForm `update:current` / `currentChange` | `current: number`          | Step changes; template @current-change                      |
| StepsForm `finish`                           | `values: T`                | Final notification when onFinish is omitted                 |
| StepsForm `reset`                            | `values: T`                | Resets all steps                                            |
| StepsForm `error`                            | `error: unknown`           | Validation or submission fails                              |
| StepForm common events                       | Same as [ProForm](#events) | Each step has its own model/submission/reset/request errors |

| Component / slot      | Scope                                           | Purpose                                                       |
| --------------------- | ----------------------------------------------- | ------------------------------------------------------------- |
| StepsForm `default`   | None                                            | StepForm children                                             |
| StepsForm `submitter` | `{ form, current, submit, next, prev, values }` | Step actions                                                  |
| StepForm `default`    | `{ form, values }`                              | Current step fields                                           |
| StepForm `title`      | None                                            | Navigation title                                              |
| StepForm `submitter`  | Same as ProForm                                 | Available standalone; StepsForm renders shared actions itself |

| StepsForm instance extension / difference                      | Returns                              | Description                                                                                                                                                                     |
| -------------------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `next()`                                                       | `Promise<boolean>`                   | Validates and submits the current step; true after advancing                                                                                                                    |
| `prev()`                                                       | `void`                               | Goes back and preserves drafts                                                                                                                                                  |
| `formMap()`                                                    | `Map<string, ProFormInstance>`       | Step instances                                                                                                                                                                  |
| `validate()` / `validateFields()`                              | `Promise<T>`                         | Validates every step and locates the failing step; names do not filter the set                                                                                                  |
| `submit()`                                                     | `Promise<T>`                         | Submits the current step; the final step validates all and calls root onFinish                                                                                                  |
| `getFieldsValue()` / `getFieldsFormatValue()`                  | `T`                                  | Merges step results; later steps win for duplicate paths                                                                                                                        |
| `setFieldsValue(values)`                                       | `void`                               | Merges values into every step                                                                                                                                                   |
| `setFieldValue(name, value)` / `scrollToField(name, options?)` | `void`                               | Targets the current step                                                                                                                                                        |
| `reset()` / `resetFields()`                                    | `void`                               | Resets every step and returns to the first                                                                                                                                      |
| `nativeForm`                                                   | `undefined`                          | No single native Form; access each nativeForm through formMap()                                                                                                                 |
| Other common methods                                           | Same as [ProFormInstance](#instance) | clearValidate broadcasts to all steps; single-field reads return the first defined value; loading covers the complete step-submission flow, including the root onFinish Promise |

### Structural component props {#structure-props}

Use named exports or ProForm.Group/FieldSet/List/Dependency/Item. Structural components without documented methods provide no custom ref API.

#### ProFormGroup {#group-props}

| Property                                          | Type                                       | Default        | Description / source                                                       |
| ------------------------------------------------- | ------------------------------------------ | -------------- | -------------------------------------------------------------------------- |
| `title`                                           | `VNodeChild`                               | —              | Group title; title slot takes precedence                                   |
| `titleStyle`                                      | `CSSProperties`                            | —              | Merged after styles.title                                                  |
| `tooltip`                                         | `VNodeChild \| Record<string, unknown>`    | —              | A node is tooltip content; an object supplies [TooltipProps][antd-tooltip] |
| `extra`                                           | `VNodeChild`                               | —              | Extra title content; extra slot takes precedence                           |
| `collapsible`                                     | `boolean`                                  | `false`        | Displays the collapse button                                               |
| `collapsed`                                       | `boolean`                                  | —              | Controlled collapsed state; v-model:collapsed                              |
| `defaultCollapsed`                                | `boolean`                                  | `false`        | Initial uncontrolled state                                                 |
| `direction`                                       | `'horizontal' \| 'vertical'`               | `'horizontal'` | Field direction                                                            |
| `size`                                            | `number \| 'small' \| 'middle' \| 'large'` | `32`           | Horizontal gap in pixels for numbers; row gap is zero                      |
| `labelLayout`                                     | `'inline' \| 'twoLine'`                    | —              | twoLine places the title on a separate row                                 |
| `prefixCls` / `classes` / `classNames` / `styles` | Same as [common styling types](#props)     | —              | root/title/container parts                                                 |

#### ProFormFieldSet {#fieldset-props}

| Property             | Type                                                             | Default         | Description / source                                                 |
| -------------------- | ---------------------------------------------------------------- | --------------- | -------------------------------------------------------------------- |
| `name`               | `NamePath`                                                       | —               | One array field for the group                                        |
| `modelValue`         | `unknown[]`                                                      | —               | Controlled group value, overriding the form value at the same path   |
| `initialValue`       | `unknown[]`                                                      | `[]`            | Initial array                                                        |
| `transform`          | `(value: unknown[], values: Record<string, unknown>) => unknown` | —               | Submission transform                                                 |
| `convertValue`       | `(value: unknown) => unknown[]`                                  | —               | Incoming transform                                                   |
| `type`               | `'space' \| 'group'`                                             | `'space'`       | Group styling; both use Space layout                                 |
| `space`              | `Record<string, unknown>`                                        | —               | [Space API][antd-space]; the component manages class                 |
| Other FormItem props | `Omit<FormItemProps, 'name'>`                                    | Native defaults | Bind label/rules and other [FormItem props][antd-form-item] directly |

#### ProFormList {#list-props}

| Property                                          | Type                                                                                                                                                            | Default          | Description / source                                                                              |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------- |
| `name`                                            | `NamePath`                                                                                                                                                      | Required         | Array path; automatically includes the current List row scope                                     |
| `label`                                           | `VNodeChild`                                                                                                                                                    | —                | List form-item label                                                                              |
| `initialValue`                                    | `T[]`                                                                                                                                                           | —                | Used when the current path has no array; otherwise min generates initial rows                     |
| `min`                                             | `number`                                                                                                                                                        | `0`              | Minimum row count                                                                                 |
| `max`                                             | `number`                                                                                                                                                        | Unlimited        | Maximum row count                                                                                 |
| `creatorRecord`                                   | `T \| (() => T)`                                                                                                                                                | `{}`             | New-row template, cloned before insertion                                                         |
| `creatorButtonProps`                              | `false \| (Partial<ButtonProps> & { creatorButtonText?: VNodeChild; position?: 'top' \| 'bottom' })`                                                            | Add button below | [Button API][antd-button]; creatorButtonText and position are Pro extensions                      |
| `copyIconProps`                                   | `false \| { tooltipText?: VNodeChild; Icon?: Component }`                                                                                                       | Copy shown       | Icon replaces the icon; false hides it; tooltipText is not consumed by the current implementation |
| `deleteIconProps`                                 | `false \| { tooltipText?: VNodeChild; Icon?: Component }`                                                                                                       | Delete shown     | Icon replaces the icon; false hides it; tooltipText is not consumed by the current implementation |
| `actionGuard`                                     | `{ beforeAddRow?: (record, index, count) => boolean \| Promise<boolean>; beforeRemoveRow?: (index: number \| number[], count) => boolean \| Promise<boolean> }` | —                | Returning false blocks the action                                                                 |
| `actionRef`                                       | `Ref<FormListActionType<T> \| undefined> \| ((actions) => void)`                                                                                                | —                | Same list actions as the component ref                                                            |
| `actionRender`                                    | `(field, action, defaultActionDom: VNodeChild[], count: number) => VNodeChild`                                                                                  | Default actions  | Replaces per-row actions                                                                          |
| `itemRender`                                      | `({ listDom, action }, { field, index, record }) => VNodeChild`                                                                                                 | Default row      | Replaces the entire row                                                                           |
| `rules`                                           | `FormItemProps['rules']`                                                                                                                                        | —                | Validates the whole array; [FormItem API][antd-form-item]                                         |
| `alwaysShowItemLabel`                             | `boolean`                                                                                                                                                       | —                | true labels every row, false hides labels; omitted uses the default first-row label               |
| `prefixCls` / `classes` / `classNames` / `styles` | Same as [common styling types](#props)                                                                                                                          | —                | root/item/container/actions; other attrs target the root div, not FormItem                        |

#### ProFormDependency / ProFormItem {#dependency-item-props}

| Component / property             | Type                          | Default         | Description / source                                                   |
| -------------------------------- | ----------------------------- | --------------- | ---------------------------------------------------------------------- |
| Dependency `name`                | `NamePath[]`                  | Required        | Dependent field paths                                                  |
| Dependency `ignoreFormListField` | `boolean`                     | `false`         | Skips the current List row prefix                                      |
| Item `name`                      | `NamePath`                    | —               | Wraps native controls and binds the first child's value / update:value |
| Item `valueType`                 | `ProFieldValueTypeInput`      | —               | Readonly formatting through [ProField](./pro-field#props)              |
| Item `readonly`                  | `boolean`                     | Form setting    | Current item readonly mode                                             |
| Other Item props                 | `Omit<FormItemProps, 'name'>` | Native defaults | Forwarded to [FormItem][antd-form-item]                                |

### Structural events, slots and methods {#structure-events}

| Component / event                       | Arguments                   | Description                           |
| --------------------------------------- | --------------------------- | ------------------------------------- |
| Group `update:collapsed` / `collapse`   | `collapsed: boolean`        | Collapse toggles                      |
| FieldSet `update:modelValue` / `change` | `values: unknown[]`         | Child-control updates                 |
| List `change`                           | `list: T[]`                 | Array changes                         |
| List `afterAdd`                         | `record: T, index: number`  | Add or copy succeeds                  |
| List `afterRemove`                      | `index: number \| number[]` | Removal succeeds                      |
| List `error`                            | `error: unknown`            | Guard or asynchronous operation fails |

| Component / slot                      | Scope                                                                     | Purpose                                                                    |
| ------------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Group `default` / `title` / `extra`   | None                                                                      | Fields / title / extra content                                             |
| FieldSet `default`                    | None                                                                      | Controls bind array indices in order and must support modelValue           |
| FieldSet / Item native FormItem slots | [FormItem slots][antd-form-item]                                          | Forwarded label, extra, help and other native slots                        |
| List `default`                        | `{ field: { name, key, fieldKey }, index, action, fields, record, list }` | Per-row fields; name is the row index; key/fieldKey are stable identifiers |
| Dependency `default`                  | `{ ...nestedDependencyValues, form }`                                     | Rerenders on dependency changes; form is the ProForm context               |
| Item `default`                        | `{ value: unknown, form }`                                                | Native control or custom field                                             |

| List ref / actionRef method             | Returns            | Description                                |
| --------------------------------------- | ------------------ | ------------------------------------------ |
| `add(record?: T, insertIndex?: number)` | `Promise<boolean>` | Appends by default, or inserts at an index |
| `remove(index: number \| number[])`     | `Promise<boolean>` | Removes one or more rows                   |
| `copy(index: number)`                   | `Promise<boolean>` | Clones a row                               |
| `move(from: number, to: number)`        | `boolean`          | Reorders rows                              |
| `get(index: number)`                    | `T \| undefined`   | Reads a row                                |
| `getList()`                             | `T[]`              | Reads the list                             |

All List writes respect readonly, disabled and min/max. Guards apply to add/remove paths.

### ProFormProvider / ProFormErrorList {#provider-error-list}

| Component / property                            | Type                                                                                      | Default | Description / source               |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------- | ------- | ---------------------------------- |
| Provider `onFormChange`                         | `(name: string, info: { changedValues, forms: Record<string, ProFormInstance> }) => void` | —       | Named child-form changes           |
| Provider `onFormFinish`                         | `(name: string, info: { values, forms: Record<string, ProFormInstance> }) => void`        | —       | Named child-form submission        |
| ErrorList `fieldId`                             | `string`                                                                                  | —       | Native error-region association ID |
| ErrorList `help`                                | `VNodeChild`                                                                              | —       | Help content                       |
| ErrorList `helpStatus`                          | `ValidateStatus`                                                                          | —       | Help status                        |
| ErrorList `errors` / `warnings`                 | `unknown[]`                                                                               | —       | Error / warning lists              |
| ErrorList `onVisibleChanged`                    | `(visible: boolean) => void`                                                              | —       | Visibility callback                |
| ErrorList `helpItemClassName` / `helpItemStyle` | `string` / `CSSProperties`                                                                | —       | Per-message class / style          |

Provider has only a default slot without arguments, renders no container, and does not forward native FormProvider settings. ErrorList is a direct alias of native antdv-next ErrorList, whose definitions belong to [Form API][antd-form] and the [ErrorList source][antd-error-list-source]. It adds no custom slots, events or instance methods.

### Hooks {#hooks}

| Function                                      | Arguments                                                                              | Return value / source                                                                                                    |
| --------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `useWatch<T>` / `ProForm.useWatch<T>`         | `name: NamePath, form?: MaybeRef<Pick<ProFormInstance, 'getFieldValue'> \| undefined>` | `ComputedRef<T \| undefined>`; uses the nearest ProForm context when form is omitted; inside List pass the complete path |
| `useForm` / `ProForm.useForm`                 | Native hook arguments                                                                  | Direct [antdv-next useForm][antd-form] export; does not create a ProFormInstance                                         |
| `useFormInstance` / `ProForm.useFormInstance` | None                                                                                   | Nearest native FormInstance; [Form hook][antd-form]                                                                      |

### Semantic styles {#semantic}

| Component                              | Parts consumed by the current implementation                                                 | Configuration source                                                                               |
| -------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| ProForm                                | `root`, `form`, `submitter`                                                                  | classes / classNames / styles                                                                      |
| ModalForm / DrawerForm                 | Internal ProForm parts                                                                       | Use modalProps / drawerProps for the overlay itself                                                |
| Group                                  | `root`, `title`, `container`                                                                 | Same settings                                                                                      |
| List                                   | `root`, `item`, `container`, `actions`                                                       | Same settings                                                                                      |
| StepsForm                              | `root`, `container`, `submitter`                                                             | Same settings                                                                                      |
| StepForm                               | Outer prefix is fixed; classes/styles apply only to the internal ProForm root/form/submitter | Same settings                                                                                      |
| QueryFilter / LightFilter / SchemaForm | Layout-specific parts                                                                        | [QueryFilter](./query-filter), [LightFilter](./light-filter), [SchemaForm](./schema-form#semantic) |

[antd-form]: https://www.antdv-next.com/components/form#form-props
[antd-form-item]: https://www.antdv-next.com/components/form#form-item-props
[antd-form-instance]: https://www.antdv-next.com/components/form#form-methods
[antd-modal]: https://www.antdv-next.com/components/modal#api
[antd-drawer]: https://www.antdv-next.com/components/drawer#api
[antd-steps]: https://www.antdv-next.com/components/steps#api
[antd-button]: https://www.antdv-next.com/components/button#props
[antd-grid]: https://www.antdv-next.com/components/grid#col
[antd-tooltip]: https://www.antdv-next.com/components/tooltip#api
[antd-space]: https://www.antdv-next.com/components/space#api
[antd-error-list-source]: https://github.com/antdv-next/antdv-next/blob/main/packages/antdv-next/src/form/ErrorList.tsx
