# React Pro Components Compatibility

The compatibility baseline is `@ant-design/pro-components@2.8.10`. The goal is a near-complete Vue 3 mapping of the core types and workflows, not React runtime compatibility.

Status: <span class="compat-ok">supported</span>, <span class="compat-map">Vue mapping</span>, <span class="compat-partial">initial boundary</span>.

## Core mapping

| React API                       | Vue API                        | Status                                      | Notes                                    |
| ------------------------------- | ------------------------------ | ------------------------------------------- | ---------------------------------------- |
| `columns`                       | `columns`                      | <span class="compat-ok">supported</span>    | Shared by all three components           |
| `request(params, sort, filter)` | Same Promise contract          | <span class="compat-ok">supported</span>    | Returns `{ data, total?, success? }`     |
| `actionRef`                     | Component `ref`                | <span class="compat-map">Vue mapping</span> | Similar instance method names            |
| `formRef` / `editableFormRef`   | Component `ref`                | <span class="compat-map">Vue mapping</span> | React ref props are not retained         |
| `value` / `onChange`            | `v-model`                      | <span class="compat-map">Vue mapping</span> | Standard `update:*` events               |
| `editableKeys`                  | `v-model:editable-keys`        | <span class="compat-map">Vue mapping</span> | Shared single/multiple edit state        |
| ReactNode props                 | Named slots / render callbacks | <span class="compat-map">Vue mapping</span> | Templates first, callbacks when reusable |
| `onRequestError`                | `request-error`                | <span class="compat-map">Vue mapping</span> | Existing rows are preserved              |

## Search collapse

`ProTable.search` keeps the core React semantics:

| Option                     | Behavior                                                                                 |
| -------------------------- | ---------------------------------------------------------------------------------------- |
| `defaultCollapsed`         | Initializes uncontrolled collapse state only                                             |
| `collapsed`                | Controlled state; the parent updates it                                                  |
| `span`                     | Number or partial breakpoint map; defaults to 1 / 2 / 3 items per row by container width |
| `labelWidth`               | Numbers are pixels; `auto` keeps intrinsic sizing                                        |
| `searchText` / `resetText` | Search and reset labels                                                                  |
| `onCollapse(next)`         | Collapse-state callback                                                                  |

Vue also emits `search-collapse`:

```vue
<ProTable :search="{ collapsed, span: 8 }" @search-collapse="collapsed = $event" />
```

Collapsed mode renders the first row only. The expand/collapse control appears only when more fields exist.

## Named slots

Column slot names use `column.key` first and `dataIndex` otherwise. Array paths are dot-joined, so `['profile', 'name']` becomes `profile.name`.

| Component  | Slot                                            | Slot props                                        |
| ---------- | ----------------------------------------------- | ------------------------------------------------- |
| ProTable   | `toolbar-title`, `toolbar-actions`              | Toolbar content                                   |
| ProTable   | `header-${columnKey}`                           | `{ column }`                                      |
| ProTable   | `cell-${columnKey}` or `${columnKey}`           | `{ value, record, index, column, editable }`      |
| SchemaForm | `field-${path}`, `${path}`, or the column `key` | `{ value, record, column, dependencies, update }` |
| SchemaForm | `label-${path}`                                 | `{ column, record }`                              |
| SchemaForm | `submitter`                                     | `{ values, current }`                             |

Other slots not consumed by ProTable are forwarded to the underlying Antdv Next Table.

## `valueType` support

| Category    | Types                                                                 | ProTable / EditableProTable                                          | SchemaForm                                              |
| ----------- | --------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------- |
| Text        | `text`, `textarea`, `password`                                        | Input, Textarea, Password search/edit controls and formatted display | Input, Textarea, Password                               |
| Numeric     | `digit`, `money`, `percent`, `slider`                                 | Numeric search and inline InputNumber / Slider                       | InputNumber, Slider, and money/percent affordances      |
| Choices     | `select`, `treeSelect`, `radio`, `segmented`                          | Choice search/edit controls with `valueEnum`                         | Select, TreeSelect, Radio, and Segmented                |
| State       | `checkbox`, `switch`                                                  | Inline Checkbox / Switch                                             | Checkbox(Group) / Switch                                |
| Date/time   | `date`, `dateTime`, `dateRange`, `dateTimeRange`, `time`, `timeRange` | Matching date/time controls and formatted display                    | Matching date/time controls                             |
| Table       | `index`, `indexBorder`, `option`                                      | Index and action columns                                             | No field generated                                      |
| Composition | `group`, `formList`, `formSet`, `divider`, `dependency`               | No data column generated                                             | Groups, dynamic lists, sets, dividers, and dependencies |

## ProTable capabilities

| Capability                                           | Status                                         | Notes                                                                                                            |
| ---------------------------------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Local/remote data, search, pagination, sort, filters | <span class="compat-ok">supported</span>       | Last request wins                                                                                                |
| Column visibility, order, fixed state, persistence   | <span class="compat-ok">supported</span>       | The built-in panel controls visibility only; programmatic `columnsState` controls and persists `order` / `fixed` |
| Reload, density, fullscreen, row selection           | <span class="compat-ok">supported</span>       | Options, events, and instance API                                                                                |
| Polling, focus revalidation, manual initial request  | <span class="compat-ok">supported</span>       | `polling` / `revalidateOnFocus` / `manualRequest`                                                                |
| Single, multiple, creator, and tree editing          | <span class="compat-ok">supported</span>       | Shared with EditableProTable                                                                                     |
| React-only DOM and portal props                      | <span class="compat-partial">not ported</span> | Use Vue slots and Antdv Next props                                                                               |

## EditableProTable mapping

| React API            | Vue API                                                                 | Status                                      |
| -------------------- | ----------------------------------------------------------------------- | ------------------------------------------- |
| `value`              | `v-model:value`                                                         | <span class="compat-map">Vue mapping</span> |
| `controlled`         | Standard `v-model` semantics                                            | <span class="compat-map">Vue mapping</span> |
| `editableKeys`       | `v-model:editable-keys`                                                 | <span class="compat-map">Vue mapping</span> |
| `recordCreatorProps` | `record`, `position`, `parentKey`, `newRecordType`, `creatorButtonText` | <span class="compat-ok">supported</span>    |
| `maxLength`          | `maxLength`                                                             | <span class="compat-ok">supported</span>    |
| `onValuesChange`     | Same prop or `values-change` event                                      | <span class="compat-map">Vue mapping</span> |
| `onTableChange`      | Same prop or `table-change` event                                       | <span class="compat-map">Vue mapping</span> |
| `editableFormRef`    | Component `ref`                                                         | <span class="compat-map">Vue mapping</span> |

`value` is the only controlled whole-table data entry point; a conflicting `dataSource` prop is intentionally not exposed.

## SchemaForm mapping

| React SchemaForm                 | Vue SchemaForm                          | Status                                      |
| -------------------------------- | --------------------------------------- | ------------------------------------------- |
| `columns`                        | `columns`                               | <span class="compat-ok">supported</span>    |
| `layoutType`                     | `layoutType`                            | <span class="compat-ok">supported</span>    |
| `Form` / `Embed`                 | Same layouts                            | <span class="compat-ok">supported</span>    |
| `ModalForm` / `DrawerForm`       | Same layouts + `v-model:open`           | <span class="compat-map">Vue mapping</span> |
| `QueryFilter` / `LightFilter`    | Same layouts                            | <span class="compat-ok">supported</span>    |
| `StepForm` / `StepsForm`         | Same layouts + `v-model:current`        | <span class="compat-map">Vue mapping</span> |
| `group` / `formList` / `formSet` | Same `valueType` values                 | <span class="compat-ok">supported</span>    |
| `dependency`                     | `dependencies` plus a dependency column | <span class="compat-ok">supported</span>    |

`urlSync` is a Vue-side extension. `true` writes fields into query parameters, `{ key: 'filters' }` stores the complete model as JSON in one parameter, and `{ mode: 'hash' }` targets the hash. Browser history navigation hydrates the form again.

Regular fields share the ProFormFields core with ProTable search/edit controls. SchemaForm customization precedence is field slot → `renderFormItem` → `column.component` → default `valueType` control, preserving all three extension points.

## ProFormFields mapping

The 19 standalone fields use template-friendly named exports such as `ProFormText`, `ProFormSelect`, `ProFormTreeSelect`, and `ProFormUploadButton`. The default `fieldMode="form-item"` creates a FormItem; `fieldMode="field"` renders only the bare control for table cells or layouts that already own a FormItem.

| React compound name    | Recommended Vue template name | Relationship                      |
| ---------------------- | ----------------------------- | --------------------------------- |
| `ProFormText.Password` | `ProFormTextPassword`         | Both reference the same component |
| `ProFormRadio.Group`   | `ProFormRadioGroup`           | Both reference the same component |

Every field exposes standard `v-model`. The shared core bridges single Checkbox/Switch `checked`, Upload `fileList`, and other controls' `value` contracts to `modelValue`. Select, TreeSelect, Checkbox Group, RadioGroup, and Segmented share the `options` / `valueEnum` / `request` protocol.

Captcha does not read a phone number or send codes on its own, while UploadButton and UploadDragger do not provide an upload server. These components are not mapped to `valueType`; applications must provide the captcha callback and upload `action` / `customRequest` backend contract.

## Component refs

| Component        | Methods                                                                                                                                         |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| ProTable         | `reload`, `reset`, `setPageInfo`, `clearSelected`, `fullScreen`, `scrollTo`, `startEditable`, `saveEditable`, `cancelEditable`, `addEditRecord` |
| EditableProTable | ProTable methods + `getRowData`, `getRowsData`, `setRowData`                                                                                    |
| SchemaForm       | `validate`, `reset`, `getFieldsValue`, `setFieldsValue`, `submit`, `open`, `close`, `next`, `prev`                                              |

## Project release convention

Changesets and GitHub Actions are project conventions, not React APIs. Describe npm-facing changes with `pnpm changeset`. Successful CI on `main` maintains the version PR; npm publishing only runs when `NPM_TOKEN` exists, with provenance enabled.

## Explicitly out of scope

[Basic ProCard](../components/pro-card) now covers theme containers, title/actions, loading, collapse, and semantic styles. Tabs, split grids, StatisticCard, and CheckCard remain outside its scope.

ProLayout, ProList, and ProDescriptions are not included. The project does not depend on a request library; its network boundary is the generic Promise `request` callback.
