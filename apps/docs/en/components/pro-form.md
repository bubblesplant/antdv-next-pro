---
pageClass: component-doc
---

<script setup>
import CompositionForm from '../../../playground/src/demos/schema-form/CompositionForm.vue'
</script>

# ProForm composition

`ProForm` composes field components without `columns`. Use [BetaSchemaForm](./schema-form) for a schema-driven form. The default layout is `vertical`; set `layout="horizontal"` to keep the previous horizontal appearance.

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

Names support strings, numbers, and path arrays such as `['profile','name']`. `onValuesChange(changedValues,values)` receives a nested changed-values object. Named forms inside `ProForm.Provider` / `ProFormProvider` participate in `onFormChange/onFormFinish`. Child components can use `ProForm.useWatch(name)` and `ProForm.useFormInstance()`.

## Structural components

| Component                                  | Configuration                                                                                                                             |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `ProForm.Group` / `ProFormGroup`           | title/tooltip/extra; direction, size, labelLayout; collapsible, collapsed/defaultCollapsed, v-model:collapsed; title/extra slots          |
| `ProForm.FieldSet` / `ProFormFieldSet`     | One named array bound to controls in order; convertValue/transform; type=space or group, space configuration                              |
| `ProForm.List` / `ProFormList`             | name/initialValue/min/max/creatorRecord; creatorButtonProps, copyIconProps/deleteIconProps accept false; nested paths and stable row keys |
| `ProForm.Dependency` / `ProFormDependency` | name lists dependency paths; scoped slot receives selected values and form; ignoreFormListField skips the current List scope              |
| `ProForm.Item` / `ProFormItem`             | FormItem plus value/onUpdate:value binding for a native control; readonly/valueType                                                       |

List's default slot receives `{field,index,action,fields,record,list}`. `actionRef` and the component ref expose `add(record?,index?)`, `remove(index | indices)`, `copy(index)`, `move(from,to)`, `get(index)`, and `getList()`. Asynchronous `actionGuard.beforeAddRow(record,index,count)` and `beforeRemoveRow(index,count)` can return false. `actionRender/itemRender` customize actions and rows. Readonly, disabled, and min/max still constrain the public actions.

## Dialog and filter forms

`ModalForm/DrawerForm` compose children without columns and retain a schema entry when columns are provided. Use trigger slots, open/v-model:open, title/width, and native modalProps/drawerProps. The form coordinates open, business title/width, footer, and close callbacks; other native settings pass through. Uncontrolled dialogs support instance open()/close(); controlled parents must accept open updates.

Only an awaited onFinish result of **true** closes the dialog. False, undefined, and rejection preserve its values and open state. Old submissions cannot close a reopened or unmounted dialog. The default Cancel button closes the dialog, calls native onCancel/onClose, and preserves drafts; call reset() explicitly to restore initial values. Setting destroyOnHidden (or legacy destroyOnClose) to true destroys the form after the closing animation and restores initial values on the next opening. afterClose/afterOpenChange callbacks are retained.

The dialog-only submitTimeout option is measured in milliseconds. A positive value temporarily disables cancellation and ignores interactive closing from the start of business submission until the timeout or completion. It does not abort the business Promise, and an unfinished submission keeps its loading indicator. Protection is off by default; instance close() and externally controlled open remain under caller control.

[QueryFilter](./query-filter) is independently importable and provides responsive columns, collapsed/defaultCollapsed, span, defaultColsNumber, labelWidth, split, optionRender(props,form,doms), collapseRender(collapsed), and searchText/resetText. Resizing preserves values and validation.

[LightFilter](./light-filter) is independently importable and displays ordinary fields as labels that open popovers, while secondary fields live under More by default. Setting collapse=true collects every field in a single More popover. It supports collapseLabel/placement/footerRender. Confirmation validates and submits, cancellation restores the opening snapshot, and clearing removes the value and submits. More renders field rows directly and applies these actions to the group. `LightWrapper` exposes the same popover behavior and v-model:open.

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

## Actions and URL synchronization

`submitter=false` hides actions. Its object accepts searchConfig.submitText/resetText, submitButtonProps/resetButtonProps (or false), and render({form,submit,reset},doms) (or false). The submitter slot can use the provided submit/reset to retain the standard flow.

`syncToUrl=true` synchronizes query parameters using dotted paths, preserves unrelated parameters, removes owned empty fields, and responds to popstate including deleted values. A function receives `(values,'get'|'set')` and returns the mapped object. `syncToInitialValues=false` skips initial URL hydration. SchemaForm's legacy urlSync additionally supports key/hash modes; see its documentation.

## Configuration and styling

Forms and fields inherit native ConfigProvider locale, direction, componentDisabled, componentSize, theme algorithms, and global tokens. Native Form/Input components retain theme.components.Form/Input. Pro tokens use ProConfigProvider.token; theme.components.ProForm is not a supported entry. Explicit field properties override inherited values.

Default root classes are ant-pro-form, ant-pro-query-filter, ant-pro-form-light-filter, and ant-pro-steps-form. Native prefix=demo produces demo-pro prefixes; component prefixCls accepts the complete prefix.

class/style/id/data-_/aria-_ target the actual form or layout root. classes/styles accept an object or `({props}) => object`. Applicable semantic parts are root/form/content/submitter/title/actions/row/item/container/collapseButton/step. Legacy classNames fills missing parts; classes wins on conflicts. Dialog form attributes target the internal form; configure the dialog itself through modalProps/drawerProps.
