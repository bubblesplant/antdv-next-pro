---
pageClass: component-doc
---

<script setup>
import SchemaFormDemo from '../../examples/SchemaFormDemo.vue'
</script>

# BetaSchemaForm

`BetaSchemaForm` generates fields from top-level `columns` and manages its model with Vue `v-model`. `SchemaForm` remains a compatibility alias. It shares field types, validation, and transforms with tables. Use [ProForm](./pro-form) to compose child fields without a schema.

## When to use

Use it when one `columns` schema should describe standard forms, query filters, overlay forms, or step forms while sharing initialization, validation, transformation, and submission behavior.

## Examples

### Async options, URL synchronization, and slots

<ClientOnly>
  <SchemaFormDemo />
</ClientOnly>

<details class="demo-source">
  <summary>View full code</summary>

<<< ../../examples/SchemaFormDemo.vue

</details>

### Basic usage

```vue
<BetaSchemaForm ref="formRef" v-model="form" :columns="columns" :on-finish="save" />
```

`initialValues`, asynchronous `request(params)`, URL values, and the controlled value merge in this precedence order, with the right side winning:

```text
initialValues < request result < URL values < modelValue
```

The merged snapshot is also the target of `reset()`. Changes to `params`, `request`, `initialValues`, or `urlSync` initialize again. Concurrent initializations use the latest request only. A failure falls back to `initialValues + modelValue` and emits both `request-error` and `error`.

```ts
const loadInitialValues = async (params?: Record<string, unknown>) => {
  const project = await api.project(params?.projectId)
  return { owner: project.owner, channel: project.channel }
}
```

### `valueType` and async options

| Type                              | Generated control/structure          |
| --------------------------------- | ------------------------------------ |
| `text` / `textarea` / `password`  | Input / Textarea / Password          |
| `digit` / `money` / `percent`     | InputNumber                          |
| `select` / `treeSelect` / `radio` | Select / TreeSelect / RadioGroup     |
| `checkbox` / `switch`             | Checkbox(Group) / Switch             |
| `slider` / `segmented`            | Slider / Segmented                   |
| `date` / `dateTime`               | DatePicker                           |
| `dateRange` / `dateTimeRange`     | DateRangePicker                      |
| `time` / `timeRange`              | TimePicker / TimeRangePicker         |
| `group` / `formSet`               | Field groups                         |
| `formList`                        | Dynamic add/remove list              |
| `divider`                         | Divider                              |
| `dependency`                      | Dependency or custom reactive region |

`select`, `treeSelect`, `radio`, `checkbox`, and `segmented` can use `valueEnum`, top-level/`fieldProps` options, or a column-level async `request`. TreeSelect uses `treeData` at the underlying control boundary:

```ts
const channelColumn: SchemaFormColumn<Brief> = {
  title: 'Channel',
  dataIndex: 'channel',
  valueType: 'select',
  params: { enabled: true },
  request: async (params) => {
    const items = await api.channels(params)
    return items.map((item) => ({
      label: item.name,
      value: item.code,
      disabled: !item.available,
    }))
  },
}
```

Options reload when `request` or `params` changes, and only the latest concurrent result is accepted.

SchemaForm, ProTable search/edit controls, and the [standalone ProFormFields](./pro-form-fields) share the same field registry and control core. Option requests, readonly output, and the `treeSelect`, `slider`, and `segmented` types therefore behave consistently. `timeRange` also generates a time-range control. Captcha, UploadButton, and UploadDragger remain standalone components and are not mapped to `valueType`.

### Layout types

Search layouts are also available as standalone components with composed fields or `columns`. See [QueryFilter](./query-filter) and [LightFilter](./light-filter).

| `layoutType`  | Scenario                                |
| ------------- | --------------------------------------- |
| `Form`        | Standard form                           |
| `Embed`       | Embedded form without an overlay        |
| `ModalForm`   | Modal with `v-model:open`               |
| `DrawerForm`  | Drawer with `v-model:open`              |
| `QueryFilter` | Grid-based inline query form            |
| `LightFilter` | Lightweight inline filter               |
| `StepForm`    | Single step view with `v-model:current` |
| `StepsForm`   | Multi-step form with Steps navigation   |

Set `layout-type` or import a named layout component:

```vue
<script setup lang="ts">
import { ModalForm, StepsForm } from '@bubblesjs/antdv-next-pro'
</script>

<template>
  <ModalForm v-model="form" v-model:open="open" :columns="columns" />
  <StepsForm v-model="form" v-model:current="current" :columns="stepColumns" />
</template>
```

Multi-step schemas use top-level group/formSet nodes with children, one per step. Legacy nested columns is a fallback. next() validates before advancing, and final submission validates and merges the steps. Returning to an earlier step retains its values. Use composed StepsForm.StepForm when every step needs its own native form and instance.

### Composition and dynamic schemas

```ts
const columns: SchemaFormColumn<Project>[] = [
  {
    title: 'Basics',
    valueType: 'group',
    children: [
      { title: 'Name', dataIndex: 'name', valueType: 'text' },
      { title: 'Kind', dataIndex: 'kind', valueType: 'select', valueEnum: kinds },
    ],
  },
  {
    title: 'Contacts',
    dataIndex: 'contacts',
    valueType: 'formList',
    fieldProps: {
      creatorButtonText: 'Add contact',
      removeText: 'Remove',
      initialValue: { name: '', email: '' },
    },
    children: [
      { title: 'Name', dataIndex: 'name', valueType: 'text' },
      { title: 'Email', dataIndex: 'email', valueType: 'text' },
    ],
  },
]
```

Top-level columns can be computed. Groups, lists, and dependencies use children; legacy nested columns is used only when children is absent. dependencies exposes dependent values to field slots, and dependency can use formItemRender for dependent content.

Regular field extension precedence is: dynamic field slot → formItemRender(schema, context, nativeForm) → legacy renderFormItem(context) → column.component → default control. The context exposes value/record/update/defaultRender; the third argument is the native Form instance. The legacy callback is a fallback, with no function-arity guessing. Custom components retain FormItem registration and value/modelValue/disabled/update bindings.

### Value transforms

convertValue handles inbound values, including initialization, external v-model updates, and setFieldsValue. submit() applies dateFormatter before transform; validate() returns raw values. dateFormatter defaults to string; number produces timestamps, false preserves date objects, and a function customizes formatting. Set :date-formatter="false" for the example below, which calls Dayjs methods inside transform.

```ts
const columns = [
  {
    title: 'Window',
    dataIndex: 'range',
    valueType: 'dateRange',
    convertValue: (value) => value?.map(dayjs),
    transform: (value) => ({
      startedAt: value?.[0]?.toISOString(),
      endedAt: value?.[1]?.toISOString(),
    }),
  },
]
```

An object returned by transform replaces the source field and merges into the submission root; a scalar remains under the original path. Formatting and transforms do not mutate the raw store.

### Submission and dialogs

Standard forms now default to vertical; set layout="horizontal" for the previous layout. Bind :on-finish="save" for an awaited business callback. Pending submissions show loading and share duplicate submit() calls. Modal/Drawer closes only for true; false, undefined, and rejection preserve open state and values. A stale submission cannot close a reopened or unmounted dialog. The submit event observes submission and does not replace the awaited callback.

The default Cancel button closes the dialog, invokes its native close callback, and preserves drafts; reset() restores initial values. modalProps/drawerProps pass native settings through while the form coordinates open, title/width, footer, and closing. destroyOnHidden=true resets after the closing animation. A positive submitTimeout temporarily disables cancellation and interactive closing. Timeout releases protection without aborting submission; loading remains until the Promise completes. See [ProForm](./pro-form).

```vue
<BetaSchemaForm
  v-model:open="open"
  layout-type="ModalForm"
  :columns="columns"
  :on-finish="
    async (values) => {
      await api.save(values)
      return true
    }
  "
/>
```

### URL synchronization

```vue
<!-- one query parameter per field -->
<SchemaForm :url-sync="true" />

<!-- complete model JSON in the filters parameter -->
<SchemaForm :url-sync="{ key: 'filters' }" />

<!-- one hash parameter per field -->
<SchemaForm :url-sync="{ mode: 'hash' }" />
```

Per-field mode removes empty URL values; named-key mode stores the complete model. The component listens to `popstate` / `hashchange` and hydrates again, which is useful for shareable filters. URL values override the request result during initialization but are still overridden by explicit `modelValue`.

ModalForm and DrawerForm default to `800px` wide, with actions aligned to the end in the native footer. Modal defaults to Confirm and Drawer to Submit. Width, native overlay options, and submitter text can override these defaults; see [ProForm layouts](./pro-form). Standard schema form actions align to the start, and group fields reuse ProFormGroup title spacing and semantic styling.

## API

### Props {#props}

`T` is the record type. “—” means no component default. SchemaForm does not inherit all native FormProps: use [`formProps`](#form-props) for native settings. Layout aliases use this API when `columns` is provided and [ProForm composition](./pro-form#api) otherwise.

| Prop                                 | Type                                                                     | Default                                  | Description / source                                                                                      |
| ------------------------------------ | ------------------------------------------------------------------------ | ---------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `columns`                            | `SchemaFormColumn<T>[]`                                                  | Required                                 | Field schema; see [column properties](#columns)                                                           |
| `modelValue`                         | `Partial<T>`                                                             | —                                        | Raw model, bound through v-model                                                                          |
| `initialValues`                      | `Partial<T>`                                                             | —                                        | Initialization and reset baseline                                                                         |
| `request`                            | `(params?: Record<string, unknown>) => Promise<Partial<T>>`              | —                                        | Loads initial values, rather than submitting data                                                         |
| `params`                             | `Record<string, unknown>`                                                | —                                        | Request parameters; changes initialize again                                                              |
| `layoutType`                         | `SchemaFormLayoutType`                                                   | `'Form'`                                 | Form / Embed / ModalForm / DrawerForm / QueryFilter / LightFilter / StepForm / StepsForm                  |
| `open`                               | `boolean`                                                                | `false`                                  | Overlay state; v-model:open                                                                               |
| `current`                            | `number`                                                                 | `0`                                      | Step index; v-model:current                                                                               |
| `title`                              | `VNodeChild`                                                             | —                                        | Overlay title; overrides modalProps.title/drawerProps.title, and the title slot takes precedence          |
| `width`                              | `number \| string`                                                       | `800` for overlays                       | Native modalProps.width/drawerProps.width takes precedence                                                |
| `labelCol`                           | `Record<string, unknown>`                                                | —                                        | Top-level native [Form labelCol][antd-form], using [ColProps][antd-grid]                                  |
| `wrapperCol`                         | `Record<string, unknown>`                                                | —                                        | Top-level control grid; same native source                                                                |
| `grid`                               | `boolean`                                                                | `false`                                  | Row/Col layout; fields default to xs=24, sm=12, lg=8                                                      |
| `readonly`                           | `boolean`                                                                | `false`                                  | Readonly fields and hidden actions                                                                        |
| `disabled`                           | `boolean`                                                                | Inherited from ConfigProvider            | Native Form disabled state; use this top-level setting                                                    |
| `layout`                             | `FormProps['layout']`                                                    | `'vertical'`; horizontal for QueryFilter | Native field layout; layoutType selects the form container                                                |
| `formProps`                          | `Omit<FormProps, 'model' \| 'onFinish'>`                                 | —                                        | [Native settings and precedence](#form-props); [complete official API][antd-form]                         |
| `onFinish`                           | `(values: Partial<T>) => boolean \| void \| Promise<boolean \| void>`    | —                                        | Awaited business callback; only true closes overlays                                                      |
| `onValuesChange`                     | `(changed: Partial<T>, values: Partial<T>) => void`                      | —                                        | Nested changed values and the full raw model; same notification as values-change                          |
| `urlSync`                            | `boolean \| { key?: string; mode?: 'query' \| 'hash' }`                  | Off                                      | Legacy URL entry; [configuration](#url-sync)                                                              |
| `syncToUrl`                          | `boolean \| ((values, type: 'get' \| 'set') => Record<string, unknown>)` | —                                        | Preferred entry; explicitly setting it overrides urlSync                                                  |
| `syncToInitialValues`                | `boolean`                                                                | `true`                                   | Hydrate initial values from the URL                                                                       |
| `dateFormatter`                      | `'string' \| 'number' \| false \| ((value, valueType?) => unknown)`      | `'string'`                               | Date formatting for submission and formatted getters                                                      |
| `submitter`                          | `false \| SubmitterProps`                                                | `{}`                                     | [Every SubmitterProps setting](./pro-form#submitter-props); native buttons use [ButtonProps][antd-button] |
| `submitTimeout`                      | `number`                                                                 | Protection off                           | Overlay close protection in milliseconds; does not abort the Promise                                      |
| `modalProps`                         | `ModalProps`                                                             | —                                        | [Modal API][antd-modal] for ModalForm; [managed settings](#overlay-config)                                |
| `drawerProps`                        | `DrawerProps`                                                            | —                                        | [Drawer API][antd-drawer] for DrawerForm; [managed settings](#overlay-config)                             |
| `prefixCls`                          | `string`                                                                 | Native prefix + layout suffix            | Complete Pro layout prefix                                                                                |
| `classes`                            | `FormClasses \| (({ props }) => FormClasses)`                            | —                                        | [Semantic parts](#semantic)                                                                               |
| `classNames`                         | `FormClasses`                                                            | —                                        | Legacy classes; classes wins for the same part                                                            |
| `styles`                             | `FormStyles \| (({ props }) => FormStyles)`                              | —                                        | [Semantic parts](#semantic)                                                                               |
| `formRef`                            | `Ref<SchemaFormInstance<T> \| undefined> \| ((instance) => void)`        | —                                        | Same instance as the component ref                                                                        |
| `style`                              | `CSSProperties`                                                          | —                                        | Visible root styles                                                                                       |
| `class` / `id` / `data-*` / `aria-*` | Vue HTML attributes                                                      | —                                        | Visible form/layout root; configure overlay shells through modalProps/drawerProps                         |

Filter and step extensions are also **top-level SchemaForm props**, active only for their corresponding layoutType:

| Prop                | Type                                                                                            | Default                | Layout / source                                                                               |
| ------------------- | ----------------------------------------------------------------------------------------------- | ---------------------- | --------------------------------------------------------------------------------------------- |
| `collapsed`         | `boolean`                                                                                       | —                      | QueryFilter controlled collapse; v-model:collapsed; [QueryFilter props](./query-filter#props) |
| `defaultCollapsed`  | `boolean`                                                                                       | `true`                 | QueryFilter initial collapse                                                                  |
| `defaultColsNumber` | `number`                                                                                        | `3`                    | QueryFilter default visible columns                                                           |
| `span`              | `number \| Record<string, number>`                                                              | Responsive calculation | QueryFilter grid span; [details](./query-filter#props)                                        |
| `labelWidth`        | `number \| 'auto'`                                                                              | `80`                   | QueryFilter label width                                                                       |
| `split`             | `boolean`                                                                                       | `false`                | QueryFilter separators                                                                        |
| `searchText`        | `VNodeChild`                                                                                    | Locale search text     | QueryFilter search button                                                                     |
| `resetText`         | `VNodeChild`                                                                                    | Locale reset text      | QueryFilter reset button                                                                      |
| `optionRender`      | `false \| ((props: QueryFilterProps, form: ProFormInstance, doms: VNodeChild[]) => VNodeChild)` | Default actions        | QueryFilter [action rendering](./query-filter#props)                                          |
| `collapseRender`    | `false \| ((collapsed: boolean) => VNodeChild)`                                                 | Default toggle         | QueryFilter collapse control                                                                  |
| `collapse`          | `boolean`                                                                                       | `false`                | LightFilter collects all fields under More; [LightFilter props](./light-filter#props)         |
| `collapseLabel`     | `VNodeChild`                                                                                    | Locale More text       | LightFilter More label                                                                        |
| `placement`         | `PopoverProps['placement']`                                                                     | `'bottomLeft'`         | LightFilter position; [Popover API][antd-popover]                                             |
| `footerRender`      | `false \| (({ confirm, clear }, doms: VNodeChild[]) => VNodeChild)`                             | Default footer         | LightFilter confirm/clear footer; [details](./light-filter#props)                             |
| `stepsProps`        | `StepsProps`                                                                                    | —                      | StepsForm [Steps API][antd-steps]; schema manages current/items and validation-aware onChange |

### formProps: native form configuration {#form-props}

`formProps` configures the internal Form layer. Its type comes from **antdv-next** [FormProps][antd-form]. The [shared native Form table](./pro-form#native-form-props) lists every inherited setting. Pro settings such as columns, request, initialValues, and submitter belong on SchemaForm itself.

| Setting                                                         | Type                            | Purpose / precedence                                                                         |
| --------------------------------------------------------------- | ------------------------------- | -------------------------------------------------------------------------------------------- |
| `name`                                                          | `string`                        | Native form identifier                                                                       |
| `rules`                                                         | `FormProps['rules']`            | Form-level validation; individual fields can use column.formItemProps.rules                  |
| `labelAlign` / `labelWrap` / `colon`                            | Corresponding `FormProps` types | Label alignment, wrapping, and colons; [Form API][antd-form]                                 |
| `size` / `variant`                                              | Corresponding `FormProps` types | Control size and appearance; [Form API][antd-form]                                           |
| `requiredMark` / `feedbackIcons` / `tooltip`                    | Corresponding `FormProps` types | Required marks, feedback, and tooltips; [Form API][antd-form]                                |
| `validateTrigger` / `validateMessages` / `validateOnRuleChange` | Corresponding `FormProps` types | Validation triggers, messages, and rule updates; [Form API][antd-form]                       |
| `scrollToFirstError` / `preserve` / `clearOnDestroy`            | Corresponding `FormProps` types | Native scrolling and field lifecycle; [Form API][antd-form]                                  |
| `autoComplete` / `autocomplete`                                 | `string`                        | Browser completion; [Form API][antd-form]                                                    |
| `onFinishFailed` / `onValidate` / `onFieldsChange`              | Corresponding native callbacks  | Native notifications; also handle the Pro validation/submission Promise and error event      |
| `layout` / `disabled` / `labelCol` / `wrapperCol`               | Corresponding `FormProps` types | Set **top-level SchemaForm props**; explicit internal bindings override these formProps keys |
| `classes` / `styles`                                            | Native Form semantic types      | Merged for standard forms; top-level form/submitter parts take precedence                    |
| `model` / `onFinish`                                            | Excluded                        | Managed by SchemaForm and omitted from its public formProps type                             |
| `onValuesChange` / `onReset` / `onSubmit`                       | Native callback types           | Do not replace SchemaForm callbacks/events; these flows are coordinated by the wrapper       |

```vue
<BetaSchemaForm
  :columns="columns"
  layout="horizontal"
  :label-col="{ span: 6 }"
  :form-props="{ name: 'project', size: 'small', validateTrigger: 'blur' }"
  :on-finish="save"
/>
```

### Native overlay configuration {#overlay-config}

| Entry                                | Source                                        | Settings coordinated by SchemaForm                                                                                                    |
| ------------------------------------ | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `modalProps`                         | [ModalProps, events, and slots][antd-modal]   | open comes from v-model:open; top-level title/title slot wins; submitter/footer slot manages footer; onCancel/afterClose are composed |
| `drawerProps`                        | [DrawerProps, events, and slots][antd-drawer] | Same open/title/footer rules; onClose/afterOpenChange are composed                                                                    |
| Native `width`                       | Native overlay width                          | Native props.width > top-level width > 800                                                                                            |
| `destroyOnHidden` / `destroyOnClose` | Native lifecycle settings                     | Destroy/reset after closing; reopening restores the initial snapshot                                                                  |

Schema mode exposes only the overlay slots listed below. It does not forward every native overlay slot. [Submitter configuration](./pro-form#submitter-props) controls its buttons.

### columns: SchemaFormColumn {#columns}

`SchemaFormColumn<T>` extends [`ProColumns<T>`](./pro-table#columns). This table lists settings consumed by Schema views. Table-only properties remain documented under ProTable and are not implicitly used by forms.

| Column prop                   | Type                                                                                    | Default                     | Description / source                                                                                                                                           |
| ----------------------------- | --------------------------------------------------------------------------------------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `key`                         | `string \| number`                                                                      | —                           | Stable identifier and dynamic field slot name                                                                                                                  |
| `dataIndex`                   | `string \| number \| readonly (string \| number)[]`                                     | —                           | Field path; nested List rows add their row prefix                                                                                                              |
| `title`                       | `VNodeChild \| ((column) => VNodeChild)`                                                | —                           | Field/group/step title; label slot wins                                                                                                                        |
| `valueType`                   | `ProColumnValueType<T>`                                                                 | `'text'`                    | [Field types](./pro-field#props); functions receive the current model and index 0; group/formSet/formList/dependency/divider are structural                    |
| `valueEnum`                   | `ProValueEnum \| (() => ProValueEnum)`                                                  | —                           | Enumeration options; [format](./pro-field#props)                                                                                                               |
| `fieldProps`                  | `Record<string, unknown> \| ((record?: T) => Record<string, unknown>)`                  | —                           | Underlying control; [native APIs by field](./pro-form-fields). group/formSet uses [Group](./pro-form#group-props); formList uses [List](./pro-form#list-props) |
| `formItemProps`               | `Record<string, unknown> \| ((record?: T) => Record<string, unknown>)`                  | —                           | [FormItemProps][antd-form-item], such as rules/help/required; Schema subsequently binds name/label/tooltip/extra                                               |
| `request`                     | `(params?) => Promise<Record<string, unknown>[]>`                                       | —                           | Loads options; takes precedence over fieldProps.request                                                                                                        |
| `params`                      | `Record<string, unknown>`                                                               | —                           | Passed to the column `request` when configured; overrides fieldProps.params when provided. Ignored when only fieldProps.request is set                         |
| `onFieldRequestError`         | `(error: unknown) => void`                                                              | —                           | Failed field-option requests                                                                                                                                   |
| `initialValue`                | `unknown`                                                                               | —                           | Field initial value; initialized model takes precedence                                                                                                        |
| `readonly`                    | `boolean`                                                                               | `false`                     | Readonly field                                                                                                                                                 |
| `hideInForm`                  | `boolean`                                                                               | `false`                     | Hide in every Schema layout                                                                                                                                    |
| `hideInSearch`                | `boolean`                                                                               | `false`                     | Hide in QueryFilter/LightFilter                                                                                                                                |
| `convertValue`                | `(value: unknown, record: Partial<T>) => unknown`                                       | —                           | Incoming conversion                                                                                                                                            |
| `transform`                   | `(value: unknown, record: Partial<T>) => unknown`                                       | —                           | Outgoing conversion; object results merge into the submission root                                                                                             |
| `dependencies`                | `NamePath[]`                                                                            | —                           | Dependency values passed to slots/callbacks in order                                                                                                           |
| `formItemRender`              | `(schema, context: ProRenderContext<T>, form: FormInstance \| undefined) => VNodeChild` | —                           | Custom field; below field slots and above component                                                                                                            |
| `renderFormItem`              | `(column, context: ProRenderContext<T>) => VNodeChild`                                  | —                           | Legacy fallback when formItemRender is absent                                                                                                                  |
| `component`                   | Vue `Component`                                                                         | —                           | Custom control; receives value/modelValue, disabled, and update handlers                                                                                       |
| `colProps`                    | `Record<string, unknown>`                                                               | `{ xs: 24, sm: 12, lg: 8 }` | [Col props][antd-grid] when grid=true; overrides default widths                                                                                                |
| `rowProps`                    | `Record<string, unknown>`                                                               | `{ gutter: 16 }`            | [Row props][antd-grid] inside grid group/formSet                                                                                                               |
| `tooltip`                     | `VNodeChild`                                                                            | —                           | Field/group tooltip; [FormItem][antd-form-item] / [Group](./pro-form#group-props)                                                                              |
| `extra`                       | `VNodeChild`                                                                            | —                           | Field/group extra content                                                                                                                                      |
| `children`                    | `SchemaFormColumn<T>[]`                                                                 | —                           | Children of group/formSet/formList/dependency                                                                                                                  |
| `columns`                     | `SchemaFormColumn<T>[]`                                                                 | —                           | Legacy children; children takes precedence                                                                                                                     |
| `secondary`                   | `boolean`                                                                               | `false`                     | Put the LightFilter field under More                                                                                                                           |
| Inherited table-only settings | [ProColumns](./pro-table#columns)                                                       | —                           | width/minWidth/fixed/align/ellipsis/copyable/sorter/filters/search/editable/hideInTable/order/colSize/render/renderText; not forwarded to native form controls |

`formList.fieldProps.creatorRecord` supplies the new-row template; fieldProps.initialValue is its legacy alias. Legacy creatorButtonText maps to creatorButtonProps.creatorButtonText. See [ProFormList](./pro-form#list-props) for remaining options. Column initialValue initializes the whole field and is distinct from the new-row template.

### urlSync options {#url-sync}

| Setting | Type                | Default   | Description                                                                                |
| ------- | ------------------- | --------- | ------------------------------------------------------------------------------------------ |
| `key`   | `string`            | —         | Store the complete model in one parameter; omitted for one dotted-path parameter per field |
| `mode`  | `'query' \| 'hash'` | `'query'` | Synchronize search or hash parameters                                                      |

### Events {#events}

| Event                           | Arguments                 | Description                                                    |
| ------------------------------- | ------------------------- | -------------------------------------------------------------- |
| `update:modelValue`             | `values: Partial<T>`      | v-model update; template listener @update:model-value          |
| `update:open`                   | `open: boolean`           | Overlay two-way binding                                        |
| `update:current`                | `current: number`         | Step two-way binding                                           |
| `change`                        | `values: Partial<T>`      | Raw model change                                               |
| `valuesChange`                  | `changedValues, values`   | Nested changed values; template @values-change                 |
| `fieldChange`                   | `{ path, value }, values` | Single field path and raw value; template @field-change        |
| `submit`                        | `values: Partial<T>`      | Validated, date-formatted, transformed values, before onFinish |
| `finish`                        | `values: Partial<T>`      | Compatibility notification when no onFinish prop is configured |
| `reset`                         | `values: Partial<T>`      | Initialization snapshot restored                               |
| `open` / `close`                | None                      | Component method or overlay interaction                        |
| `currentChange`                 | `current: number`         | Active step change; template @current-change                   |
| `update:collapsed` / `collapse` | `collapsed: boolean`      | QueryFilter collapse state                                     |
| `requestError`                  | `error: unknown`          | Failed initial-value request; template @request-error          |
| `error`                         | `error: unknown`          | Initialization, validation, or submission failure              |

### Slots {#slots}

Field paths are dot-joined: `['profile', 'name']` becomes `profile.name`. Schema slot scopes differ from [composition form scopes](./pro-form#slots).

| Slot                                        | Scope                                                                                           | Purpose                                                  |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `field-${path}`, `${path}`, or column `key` | `{ value, record, column, dependencies, update }`                                               | Custom field; update(nextValue) retains model/URL/events |
| `label-${path}`                             | `{ column, record }`                                                                            | Field label                                              |
| `submitter`                                 | `{ values, current }`                                                                           | Actions; invoke submit/reset through the component ref   |
| `trigger`                                   | `{ open, openForm, closeForm }`                                                                 | Modal/Drawer opener                                      |
| `title`                                     | `{ title, open, values, close }`                                                                | Modal/Drawer title                                       |
| `footer`                                    | `{ values, submitting, submit, reset, close }`                                                  | Modal/Drawer footer; hides the internal submitter        |
| `step-title`                                | `{ title, index, current, step, steps, values }`                                                | StepForm/StepsForm title                                 |
| `step-content`                              | `{ current, step, steps, columns, values, content }`                                            | Step content; content() renders the default fields       |
| `step-actions`                              | `{ current, step, steps, values, hasPrevious, hasNext, submitting, next, prev, submit, reset }` | Step actions                                             |

```vue
<BetaSchemaForm ref="formRef" v-model="form" :columns="columns">
  <template #field-owner="{ value, update }">
    <OwnerPicker :model-value="value" @update:model-value="update" />
  </template>
  <template #submitter="{ current }">
    <button type="button" @click="formRef?.prev()">Previous</button>
    <button type="button" @click="formRef?.submit()">Submit step {{ current + 1 }}</button>
  </template>
</BetaSchemaForm>
```

### Component instance {#instance}

Use a component ref or formRef to obtain `SchemaFormInstance<T>`. `NamePath = string | number | readonly (string | number)[]`.

| Method / member                   | Arguments                                         | Return value                   | Description                                                                                         |
| --------------------------------- | ------------------------------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------- |
| `nativeForm`                      | —                                                 | `FormInstance \| undefined`    | [Native instance][antd-form-instance] for the form/current step                                     |
| `validate`                        | None                                              | `Promise<Partial<T>>`          | Validate the form/current step; return raw values                                                   |
| `validateFields`                  | `names?: NamePath[]`                              | `Promise<Partial<T>>`          | Validate paths within the current step/form                                                         |
| `validateFieldsReturnFormatValue` | `names?: NamePath[]`                              | `Promise<Partial<T>>`          | Validate and format/transform                                                                       |
| `reset` / `resetFields`           | None                                              | `void`                         | Restore the snapshot; no native partial-reset argument                                              |
| `clearValidate`                   | `names?: NamePath[]`                              | `void`                         | Clear validation state                                                                              |
| `getFieldsValue`                  | None                                              | `Partial<T>`                   | Read the raw model                                                                                  |
| `getFieldValue`                   | `name: NamePath`                                  | `unknown`                      | Read one field                                                                                      |
| `getFieldsFormatValue`            | None                                              | `Partial<T>`                   | Date-formatted/transformed values                                                                   |
| `getFieldFormatValue`             | `name: NamePath`                                  | `unknown`                      | Read a path in the transformed result                                                               |
| `setFieldsValue`                  | `values: Partial<T>`                              | `void`                         | Merge incoming values and apply conversion                                                          |
| `setFieldValue`                   | `name: NamePath, value: unknown`                  | `void`                         | Set one field and notify listeners                                                                  |
| `submit`                          | None                                              | `Promise<Partial<T>>`          | Validate the whole form/all steps, format, and await onFinish; rejects on failure                   |
| `open` / `close`                  | None                                              | `void`                         | Change overlay state and notify listeners                                                           |
| `next`                            | None                                              | `Promise<boolean>`             | Validate and advance; false on the last step                                                        |
| `prev`                            | None                                              | `void`                         | Previous step                                                                                       |
| `scrollToField`                   | `name: NamePath, options?: ScrollIntoViewOptions` | `void`                         | Scroll to a field in the current form/step                                                          |
| `loading`                         | —                                                 | `Readonly<Ref<boolean>>`       | Submitting state; Vue public instances may unwrap refs                                              |
| `formMap?`                        | None                                              | `Map<string, ProFormInstance>` | Optional compatibility member forwarded by layout aliases; not implemented by direct BetaSchemaForm |

Direct BetaSchemaForm does not implement formMap. Layout aliases expose a compatibility formMap() forwarder; only composition StepsForm returns a populated instance map, while Schema mode returns an empty Map. Use [composition StepsForm](./pro-form#steps-props) to access independent step instances.

### Configuration and semantic styling {#semantic}

Native ConfigProvider provides locale, direction, componentSize/Disabled, prefixes, theme algorithms, global tokens, and native Form/Input component tokens. Pro extensions use [ProConfigProvider.token](./pro-config-provider#props); custom controls use valueTypeMap. Default layout classes are ant-pro-form, ant-pro-query-filter, ant-pro-form-light-filter, and ant-pro-steps-form. A native demo prefix becomes demo-pro; prefixCls overrides the complete layout prefix.

| Semantic part                                               | Target                       | Source                                                       |
| ----------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------ |
| `root` / `content`                                          | Schema outer root / content  | classes / styles                                             |
| `form` / `submitter`                                        | Internal Form / actions      | Top-level parts win over formProps parts in standard forms   |
| `row` / `item` / `actions` / `container` / `collapseButton` | Matching filter layout parts | [QueryFilter](./query-filter), [LightFilter](./light-filter) |
| `step`                                                      | Schema step container        | classes / styles                                             |

classes/styles accept an object or `({ props }) => object`. Legacy classNames fills missing parts. Attributes class/style/id/data-_/aria-_ target the visible form/layout root; modalProps/drawerProps configure the overlay shell.

[antd-form]: https://www.antdv-next.com/components/form#form-props
[antd-form-item]: https://www.antdv-next.com/components/form#form-item-props
[antd-form-instance]: https://www.antdv-next.com/components/form#form-methods
[antd-grid]: https://www.antdv-next.com/components/grid#api
[antd-modal]: https://www.antdv-next.com/components/modal#api
[antd-drawer]: https://www.antdv-next.com/components/drawer#api
[antd-button]: https://www.antdv-next.com/components/button#props
[antd-popover]: https://www.antdv-next.com/components/popover#api
[antd-steps]: https://www.antdv-next.com/components/steps#api
