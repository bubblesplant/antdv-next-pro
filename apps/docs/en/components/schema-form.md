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
import { ModalForm, StepsForm } from '@bubblesjs/antv-next-pro'
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

## API

### Props

| Prop                                | Type                                                      | Description                                                                 |
| ----------------------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------- |
| `columns`                           | `SchemaFormColumn<T>[]`                                   | The single schema entry point                                               |
| `modelValue`                        | `Partial<T>`                                              | Standard `v-model` value                                                    |
| `initialValues`                     | `Partial<T>`                                              | Initialization and reset baseline                                           |
| `request`                           | `(params?) => Promise<Partial<T>>`                        | Asynchronous initial values                                                 |
| `params`                            | `Record<string, unknown>`                                 | Initialization request params                                               |
| `layoutType`                        | `SchemaFormLayoutType`                                    | Form layout; defaults to `Form`                                             |
| `open`                              | `boolean`                                                 | Modal/Drawer state; supports `v-model:open`                                 |
| `current`                           | `number`                                                  | Step index; supports `v-model:current`                                      |
| `title` / `width`                   | Text or size                                              | Overlay title and width                                                     |
| `labelCol` / `wrapperCol`           | Antdv Next Form config                                    | Label and control layout                                                    |
| `grid`                              | `boolean`                                                 | Responsive Row/Col grid                                                     |
| `readonly`                          | `boolean`                                                 | Whole-form readonly mode                                                    |
| `urlSync`                           | `boolean \| { key?, mode? }`                              | Query/hash synchronization                                                  |
| `syncToUrl` / `syncToInitialValues` | `boolean \| function` / `boolean`                         | URL mapping / initial hydration                                             |
| `dateFormatter`                     | `'string' \| 'number' \| false \| function`               | Defaults to string, runs before transform                                   |
| `onFinish`                          | `(values) => boolean \| void \| Promise<boolean \| void>` | Await business submission; true closes dialogs                              |
| `formProps`                         | `FormProps`                                               | Native form configuration                                                   |
| `submitter`                         | `false \| SubmitterProps`                                 | searchConfig/render/submitButtonProps/resetButtonProps and legacy text      |
| `submitTimeout`                     | `number`                                                  | Dialog close-protection duration in milliseconds; does not abort submission |
| `style`                             | `CSSProperties`                                           | Root style                                                                  |

Columns also accept `component`, `colProps`, `rowProps`, `tooltip`, and `extra`.

### Events

| Event                | Arguments                 | Description                                      |
| -------------------- | ------------------------- | ------------------------------------------------ |
| `update:model-value` | `values`                  | Default `v-model` update                         |
| `update:open`        | `open`                    | Overlay two-way binding                          |
| `update:current`     | `current`                 | Step two-way binding                             |
| `change`             | `values`                  | Any field change                                 |
| `values-change`      | `changedValues, values`   | Nested changed-values object                     |
| `field-change`       | `{ path, value }, values` | Raw field path and value                         |
| `submit`             | `values`                  | Validated, formatted and transformed result      |
| `finish`             | `values`                  | Compatibility notification without onFinish prop |
| `reset`              | `values`                  | Restored initialization snapshot                 |
| `open` / `close`     | none                      | Component method or overlay interaction          |
| `current-change`     | `current`                 | Active step change                               |
| `request-error`      | `error`                   | Async initial value failure                      |
| `error`              | `error`                   | Initialization or validation failure             |

### Slots

Field paths are dot-joined, so `['profile', 'name']` becomes `profile.name`.

```vue
<SchemaForm ref="formRef" v-model="form" :columns="columns">
  <template #label-project="{ column }">
    {{ column.title }} *
  </template>

  <template #field-owner="{ value, update, dependencies }">
    <OwnerPicker
      :model-value="value"
      :channel="dependencies[0]"
      @update:model-value="update"
    />
  </template>

  <template #submitter="{ current }">
    <button type="button" @click="formRef?.prev()">Previous</button>
    <button type="button" @click="formRef?.submit()">Submit step {{ current + 1 }}</button>
  </template>
</SchemaForm>
```

| Slot                                        | Props                                                                                           |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `field-${path}`, `${path}`, or column `key` | `{ value, record, column, dependencies, update }`                                               |
| `label-${path}`                             | `{ column, record }`                                                                            |
| `submitter`                                 | `{ values, current }`                                                                           |
| `trigger`                                   | `{ open, openForm, closeForm }`                                                                 |
| `title`                                     | `{ title, open, values, close }`                                                                |
| `footer`                                    | `{ values, submitting, submit, reset, close }`                                                  |
| `step-title`                                | `{ title, index, current, step, steps, values }`                                                |
| `step-content`                              | `{ current, step, steps, columns, values, content }`                                            |
| `step-actions`                              | `{ current, step, steps, values, hasPrevious, hasNext, submitting, next, prev, submit, reset }` |

`update(nextValue)` inside a field slot updates the form, `v-model`, URL, and related events.
`trigger`, `title`, and `footer` apply to `ModalForm` / `DrawerForm`. `step-title`, `step-content`, and `step-actions` apply to `StepForm` / `StepsForm`. Call `content()` from `step-content` to render the current step's default fields.

### Component instance

```ts
const formRef = ref<SchemaFormInstance<Brief>>()

formRef.value?.setFieldsValue({ owner: 'Ada' })
const raw = formRef.value?.getFieldsValue()
const output = await formRef.value?.submit()
await formRef.value?.next()
```

| Method                   | Description                                                                      |
| ------------------------ | -------------------------------------------------------------------------------- |
| `validate()`             | Validate and return raw form values without transforms                           |
| `reset()`                | Restore the initialization snapshot                                              |
| `getFieldsValue()`       | Read current raw form values                                                     |
| `setFieldsValue(values)` | Merge incoming nested values                                                     |
| `submit()`               | Validate, transform, emit `submit` / `finish`, and return the transformed result |
| `open()` / `close()`     | Control Modal/Drawer                                                             |
| `next()` / `prev()`      | Control steps; `next` returns whether it advanced                                |

### Configuration and semantic styles

Forms inherit native ConfigProvider locale, direction, componentSize/Disabled, prefixCls, theme algorithms, global tokens, and native Form/Input component tokens. Pro extensions use ProConfigProvider.token and valueTypeMap. Standard forms use ant-pro-form; query, light, and step layouts use ant-pro-query-filter, ant-pro-form-light-filter, and ant-pro-steps-form. Step navigation, content, and the active step expose -steps-container, -container, and -step-active. Native prefix demo produces demo-pro classes; explicit prefixCls overrides the layout prefix.

classes/styles accept an object or `({ props }) => object`; classes wins over legacy classNames for the same part. Schema supports root/content, step submitter, and the applicable filter parts such as row/item/actions/container/collapseButton. Configure the internal standard form through formProps classes/styles. class/style/id/data-_/aria-_ target the visible form or layout container; modalProps/drawerProps configure the overlay shell.
