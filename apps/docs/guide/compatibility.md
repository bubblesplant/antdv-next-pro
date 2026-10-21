# React Pro Components 兼容矩阵

本轮对齐参考为 `@ant-design/pro-components@3.1.15-7`，固定提交 `3bf43278d39f2d31489749132982488f57a9eb5e`。Vue 映射保留主要参数含义与业务行为，范围与默认值变化见 [v3 迁移](./pro-components-v3)。

状态说明：<span class="compat-ok">支持</span>、<span class="compat-map">Vue 映射</span>、<span class="compat-partial">首版边界</span>。

## 核心映射

| React API                       | Vue API                 | 状态                                     | 说明                                 |
| ------------------------------- | ----------------------- | ---------------------------------------- | ------------------------------------ |
| `columns`                       | `columns`               | <span class="compat-ok">支持</span>      | 三个组件共享列模型                   |
| `request(params, sort, filter)` | 同名 Promise 契约       | <span class="compat-ok">支持</span>      | 返回 `{ data, total?, success? }`    |
| `actionRef`                     | 组件 `ref`              | <span class="compat-map">Vue 映射</span> | 实例方法保持相近命名                 |
| `formRef`                       | Vue Ref / 回调          | <span class="compat-map">Vue 映射</span> | 获取对应表单实例，具体类型见组件 API |
| `editableFormRef`               | 组件 `ref`              | <span class="compat-map">Vue 映射</span> | 编辑数据与动作方法由组件实例暴露     |
| `value` / `onChange`            | `v-model`               | <span class="compat-map">Vue 映射</span> | 使用标准 `update:*` 事件             |
| `editableKeys`                  | `v-model:editable-keys` | <span class="compat-map">Vue 映射</span> | 单行和多行编辑共享状态机             |
| ReactNode Props                 | 具名插槽 / render 回调  | <span class="compat-map">Vue 映射</span> | 模板优先，回调便于复用               |
| `onRequestError`                | `request-error`         | <span class="compat-map">Vue 映射</span> | 请求失败保留当前数据                 |

## 搜索折叠

`ProTable.search` 保留 React API 的核心含义：

| 配置                       | 行为                                                     |
| -------------------------- | -------------------------------------------------------- |
| `defaultCollapsed`         | 只初始化非受控折叠状态                                   |
| `collapsed`                | 受控折叠状态；父组件负责更新                             |
| `span`                     | 数字或 Partial 断点配置；默认随容器宽度每行 1 / 2 / 3 项 |
| `labelWidth`               | 数字按 px 设置；`auto` 保持自适应                        |
| `searchText` / `resetText` | 查询与重置按钮文本                                       |
| `onCollapse(next)`         | 折叠状态变化回调                                         |

Vue 同时触发 `search-collapse` 事件，可用受控方式书写：

```vue
<ProTable :search="{ collapsed, span: 8 }" @search-collapse="collapsed = $event" />
```

折叠时只展示首行；只有字段数量超过首行容量时才显示“展开/收起”按钮。

## 命名插槽

列插槽名优先使用 `column.key`，没有 `key` 时使用 `dataIndex`；数组路径以点连接，例如 `['profile', 'name']` 对应 `profile.name`。

| 组件       | 插槽                                  | 插槽参数                                          |
| ---------- | ------------------------------------- | ------------------------------------------------- |
| ProTable   | `toolbar-title`、`toolbar-actions`    | 工具栏内容                                        |
| ProTable   | `header-${columnKey}`                 | `{ column }`                                      |
| ProTable   | `cell-${columnKey}` 或 `${columnKey}` | `{ value, record, index, column, editable }`      |
| SchemaForm | `field-${path}`、`${path}` 或列 `key` | `{ value, record, column, dependencies, update }` |
| SchemaForm | `label-${path}`                       | `{ column, record }`                              |
| SchemaForm | `submitter`                           | `{ values, current }`                             |

未被 ProTable 消费的其他插槽会继续透传给底层 Antdv Next Table。

## `valueType` 支持

| 分类     | 类型                                                                  | ProTable / EditableProTable                       | SchemaForm                            |
| -------- | --------------------------------------------------------------------- | ------------------------------------------------- | ------------------------------------- |
| 文本     | `text`、`textarea`、`password`                                        | Input、Textarea、Password 搜索/编辑与格式化只读值 | Input、Textarea、Password             |
| 数字     | `digit`、`money`、`percent`、`slider`                                 | 数字搜索、行内 InputNumber / Slider               | InputNumber、Slider 及金额/百分比装饰 |
| 选项     | `select`、`treeSelect`、`radio`、`segmented`                          | 配合 `valueEnum` 的选择类搜索和编辑               | Select、TreeSelect、Radio、Segmented  |
| 状态     | `checkbox`、`switch`                                                  | 行内 Checkbox / Switch                            | Checkbox(Group) / Switch              |
| 日期时间 | `date`、`dateTime`、`dateRange`、`dateTimeRange`、`time`、`timeRange` | 对应日期/时间控件与格式化只读值                   | 对应日期/时间控件                     |
| 表格     | `index`、`indexBorder`、`option`                                      | 序号与操作列                                      | 不生成字段                            |
| 组合     | `group`、`formList`、`formSet`、`divider`、`dependency`               | 不生成数据列                                      | 分组、动态列表、集合、分隔线和联动    |

## ProTable 能力

| 能力                                  | 状态                                       | 备注                                              |
| ------------------------------------- | ------------------------------------------ | ------------------------------------------------- |
| 本地/远程数据、搜索、分页、排序、筛选 | <span class="compat-ok">支持</span>        | 请求只接纳最后一次结果                            |
| 列显隐、顺序、固定与持久化            | <span class="compat-ok">支持</span>        | 列设置及 `columnsState` 配置，支持持久化          |
| 刷新、密度、全屏、选择                | <span class="compat-ok">支持</span>        | Options、事件与实例 API                           |
| 轮询、窗口聚焦刷新、手动首请求        | <span class="compat-ok">支持</span>        | `polling` / `revalidateOnFocus` / `manualRequest` |
| 单行、多行、创建行和树形编辑          | <span class="compat-ok">支持</span>        | 与 EditableProTable 共用内核                      |
| React 特有 DOM/portal Props           | <span class="compat-partial">不移植</span> | 使用 Vue 插槽和 Antdv Next Props                  |

## EditableProTable 映射

| React API            | Vue API                                                                      | 状态                                     |
| -------------------- | ---------------------------------------------------------------------------- | ---------------------------------------- |
| `value`              | `v-model:value`                                                              | <span class="compat-map">Vue 映射</span> |
| `controlled`         | 标准 `v-model` 约定                                                          | <span class="compat-map">Vue 映射</span> |
| `editableKeys`       | `v-model:editable-keys`                                                      | <span class="compat-map">Vue 映射</span> |
| `recordCreatorProps` | 同名 `record`、`position`、`parentKey`、`newRecordType`、`creatorButtonText` | <span class="compat-ok">支持</span>      |
| `maxLength`          | `maxLength`                                                                  | <span class="compat-ok">支持</span>      |
| `onValuesChange`     | 同名 Prop 或 `values-change` 事件                                            | <span class="compat-map">Vue 映射</span> |
| `onTableChange`      | 同名 Prop 或 `table-change` 事件                                             | <span class="compat-map">Vue 映射</span> |
| `editableFormRef`    | 组件 `ref`                                                                   | <span class="compat-map">Vue 映射</span> |
| `editable.form`      | `editable.formRef` 获取实际原生 Form 实例                                    | <span class="compat-map">Vue 映射</span> |

`value` 是完整数据的唯一受控入口，不再额外提供语义冲突的 `dataSource`。

此约定针对 `EditableProTable`。`RowEditorTable` 和 `CellEditorTable` 同时支持 `v-model:value` 与 `v-model:dataSource`；两者同时传入时 `value` 优先，建议按项目习惯选择一个模型。

`editable.formRef` 是 `Ref<FormInstance | undefined>`，随挂载、引用替换和卸载绑定当前编辑表单。原生 Vue Form 没有注入既有 React Form 实例的入口；旧 `editable.form` 仅保留弃用类型，迁移时应改为读取 `editable.formRef`，表单属性仍通过 `editable.formProps` 配置。

## SchemaForm 映射

| React SchemaForm                 | Vue SchemaForm                   | 状态                                     |
| -------------------------------- | -------------------------------- | ---------------------------------------- |
| `columns`                        | `columns`                        | <span class="compat-ok">支持</span>      |
| `layoutType`                     | `layoutType`                     | <span class="compat-ok">支持</span>      |
| `Form` / `Embed`                 | 同名布局                         | <span class="compat-ok">支持</span>      |
| `ModalForm` / `DrawerForm`       | 同名布局 + `v-model:open`        | <span class="compat-map">Vue 映射</span> |
| `QueryFilter` / `LightFilter`    | 同名布局                         | <span class="compat-ok">支持</span>      |
| `StepForm` / `StepsForm`         | 同名布局 + `v-model:current`     | <span class="compat-map">Vue 映射</span> |
| `group` / `formList` / `formSet` | 同名 `valueType`                 | <span class="compat-ok">支持</span>      |
| `dependency`                     | `dependencies` + dependency 字段 | <span class="compat-ok">支持</span>      |

`urlSync` 是 Vue 版本提供的扩展能力：`true` 将字段分别写入 query，`{ key: 'filters' }` 将完整模型 JSON 写入一个参数，`{ mode: 'hash' }` 改写 hash；浏览器前进/后退会回填表单。

普通字段与 ProTable 搜索/编辑共用字段核心。正式列编辑器入口为 `formItemRender`；旧 `renderFormItem` 保留兼容。表格列 `render` 使用 `(dom, record, index, action, schema)`，不再使用旧的二参上下文写法。

## ProFormFields 映射

独立字段使用模板友好的具名导出，例如 `ProFormText`、`ProFormSelect`、`ProFormTreeSelect`、`ProFormUploadButton`，并扩展 Cascader、ColorPicker、Rate、DigitRange、时间及日期变体。默认 `fieldMode="form-item"` 会创建 FormItem；`fieldMode="field"` 只渲染裸控件，适合表格单元格或已有 FormItem 的布局。

| React 组合命名            | Vue 模板推荐名称         | 关系                      |
| ------------------------- | ------------------------ | ------------------------- |
| `ProFormText.Password`    | `ProFormTextPassword`    | 两者引用同一组件          |
| `ProFormRadio.Group`      | `ProFormRadioGroup`      | 两者引用同一组件          |
| `ProFormCheckbox.Group`   | `ProFormCheckboxGroup`   | 两者引用同一组件          |
| `ProFormDatePicker.Month` | `ProFormDateMonthPicker` | 周/月/季度/年均有对应成员 |

所有字段对外统一使用 `v-model`。公共字段核心会把单 Checkbox/Switch 的 `checked`、Upload 的 `fileList` 和其他控件的 `value` 协议桥接到 `modelValue`。Select、TreeSelect、Checkbox 组、RadioGroup、Segmented 共用 `options` / `valueEnum` / `request` 协议。

Captcha 根据 `phoneName` 读取并校验手机号，传给 `onGetCaptcha`；业务侧提供发送操作。UploadButton 与 UploadDragger 的上传通过 `action` / `customRequest` 配置，不附带上传服务端。

## 配置与组合表单

原生 ConfigProvider 的 locale、direction、prefixCls、主题算法、全局 token 和原生组件 token 由组件继续继承。ProConfigProvider / ProProvider 提供 `token`、`intl` 与 `valueTypeMap`；Pro token 走 `ProConfigProvider.token`。`classes/styles` 为正式语义接口，`classNames` 是兼容别名；默认公开类名为 `ant-pro-*`。

`ProForm` 支持字段组合，`BetaSchemaForm/SchemaForm` 支持 schema。Group、FieldSet、List、Dependency、Item 共享表单上下文；ModalForm、DrawerForm 等待 `onFinish`，只有 `true` 关闭。可返回值的业务逻辑应使用回调 prop。

## 组件 ref 对照

| 组件             | 方法                                                                                                                                            |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| ProTable         | `reload`、`reset`、`setPageInfo`、`clearSelected`、`fullScreen`、`scrollTo`、`startEditable`、`saveEditable`、`cancelEditable`、`addEditRecord` |
| EditableProTable | ProTable 方法 + `getRowData`、`getRowsData`、`setRowData`                                                                                       |
| SchemaForm       | `validate`、`reset`、`getFieldsValue`、`setFieldsValue`、`submit`、`open`、`close`、`next`、`prev`                                              |

## Vue 渲染适配

组件通过 Vue 模板、插槽和渲染函数承载公开行为。列回调、自定义字段、组合表单和动态布局返回 Vue 节点；表单注册、校验与 ref 仍通过真实上下文连接。本轮没有启用 Vapor 编译，也不声明 Vapor 兼容性。

## 项目发布约定

Changesets 与 GitHub Actions 属于本项目工程约定，不是 React API 的一部分。npm 变更通过 `pnpm changeset` 描述；`main` CI 通过后维护版本 PR，配置 `NPM_TOKEN` 时才发布 npm，并启用 provenance。

## 明确不包含

ProCard 包含 tabs、响应式分栏、Group/Divider 等保留能力；新增 ProList、BaseProList、ProDescriptions 与表格辅助组件。

`ProList` 的 grid 条目复用现有 `ProCard`，可通过 `itemCardProps` 配置。`metas.actions.cardActionProps` 的 `extra`（默认）将操作放在卡片右上角，`actions` 放到底部操作区；这不引入 CheckCard。

本轮不新增 ProSkeleton、LoginForm/LoginFormPage、PageContainer/ProLayout、StatisticCard/CheckCard 及其组件族。网络层使用 Promise `request` 回调。
