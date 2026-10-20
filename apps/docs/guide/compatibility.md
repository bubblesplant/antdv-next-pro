# React Pro Components 兼容矩阵

兼容基线为 `@ant-design/pro-components@2.8.10`。目标是在 Vue 3 中近全量映射核心类型和工作流，而不是提供 React 运行时兼容层。

状态说明：<span class="compat-ok">支持</span>、<span class="compat-map">Vue 映射</span>、<span class="compat-partial">首版边界</span>。

## 核心映射

| React API                       | Vue API                 | 状态                                     | 说明                              |
| ------------------------------- | ----------------------- | ---------------------------------------- | --------------------------------- |
| `columns`                       | `columns`               | <span class="compat-ok">支持</span>      | 三个组件共享列模型                |
| `request(params, sort, filter)` | 同名 Promise 契约       | <span class="compat-ok">支持</span>      | 返回 `{ data, total?, success? }` |
| `actionRef`                     | 组件 `ref`              | <span class="compat-map">Vue 映射</span> | 实例方法保持相近命名              |
| `formRef` / `editableFormRef`   | 组件 `ref`              | <span class="compat-map">Vue 映射</span> | 不保留 React ref Props            |
| `value` / `onChange`            | `v-model`               | <span class="compat-map">Vue 映射</span> | 使用标准 `update:*` 事件          |
| `editableKeys`                  | `v-model:editable-keys` | <span class="compat-map">Vue 映射</span> | 单行和多行编辑共享状态机          |
| ReactNode Props                 | 具名插槽 / render 回调  | <span class="compat-map">Vue 映射</span> | 模板优先，回调便于复用            |
| `onRequestError`                | `request-error`         | <span class="compat-map">Vue 映射</span> | 请求失败保留当前数据              |

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

| 能力                                  | 状态                                       | 备注                                                                         |
| ------------------------------------- | ------------------------------------------ | ---------------------------------------------------------------------------- |
| 本地/远程数据、搜索、分页、排序、筛选 | <span class="compat-ok">支持</span>        | 请求只接纳最后一次结果                                                       |
| 列显隐、顺序、固定与持久化            | <span class="compat-ok">支持</span>        | 内建面板仅控制显隐；`order` / `fixed` 通过 `columnsState` 编程控制，可持久化 |
| 刷新、密度、全屏、选择                | <span class="compat-ok">支持</span>        | Options、事件与实例 API                                                      |
| 轮询、窗口聚焦刷新、手动首请求        | <span class="compat-ok">支持</span>        | `polling` / `revalidateOnFocus` / `manualRequest`                            |
| 单行、多行、创建行和树形编辑          | <span class="compat-ok">支持</span>        | 与 EditableProTable 共用内核                                                 |
| React 特有 DOM/portal Props           | <span class="compat-partial">不移植</span> | 使用 Vue 插槽和 Antdv Next Props                                             |

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

`value` 是完整数据的唯一受控入口，不再额外提供语义冲突的 `dataSource`。

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

普通字段与 ProTable 搜索/编辑共用 ProFormFields 字段核心。SchemaForm 的自定义渲染优先级为字段插槽 → `renderFormItem` → `column.component` → 默认 `valueType` 控件；前三种扩展入口均保留。

## ProFormFields 映射

公开的 19 个独立字段使用模板友好的具名导出，例如 `ProFormText`、`ProFormSelect`、`ProFormTreeSelect`、`ProFormUploadButton`。默认 `fieldMode="form-item"` 会创建 FormItem；`fieldMode="field"` 只渲染裸控件，适合表格单元格或已有 FormItem 的布局。

| React 组合命名         | Vue 模板推荐名称      | 关系             |
| ---------------------- | --------------------- | ---------------- |
| `ProFormText.Password` | `ProFormTextPassword` | 两者引用同一组件 |
| `ProFormRadio.Group`   | `ProFormRadioGroup`   | 两者引用同一组件 |

所有字段对外统一使用 `v-model`。公共字段核心会把单 Checkbox/Switch 的 `checked`、Upload 的 `fileList` 和其他控件的 `value` 协议桥接到 `modelValue`。Select、TreeSelect、Checkbox 组、RadioGroup、Segmented 共用 `options` / `valueEnum` / `request` 协议。

Captcha 不读取手机号，也不会自行发送验证码；UploadButton 与 UploadDragger 不提供上传服务端。这三类组件不映射为 `valueType`，业务侧必须提供验证码回调以及上传 `action` / `customRequest` 等后端契约。

## 组件 ref 对照

| 组件             | 方法                                                                                                                                            |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| ProTable         | `reload`、`reset`、`setPageInfo`、`clearSelected`、`fullScreen`、`scrollTo`、`startEditable`、`saveEditable`、`cancelEditable`、`addEditRecord` |
| EditableProTable | ProTable 方法 + `getRowData`、`getRowsData`、`setRowData`                                                                                       |
| SchemaForm       | `validate`、`reset`、`getFieldsValue`、`setFieldsValue`、`submit`、`open`、`close`、`next`、`prev`                                              |

## 模板优先与 Vue Vapor 准备

组件视图优先使用 Vue SFC 的 `<template>` 和 `<script setup lang="ts">`，条件、列表、动态组件及插槽转发使用模板语法，不用 JSX / TSX。SchemaForm 的普通字段、组合字段、动态列表和布局别名分别由模板组件承载；对标 pro-components 的职责和公开行为，不照搬 React 渲染实现。

目前仅保留以下 VNode 兼容边界，并在源码中注明原因：

- `shared/VNodeContent.ts`：挂载既有 `render`、标题等回调返回的任意 `VNodeChild`，包括节点数组。
- `shared/DirectSlotRenderer.ts`：让 FormItem 直接接收自定义控件节点，以保持 id、ARIA、ref 注入和校验状态；同时保留 Divider 的空插槽语义。
- `SchemaFormBody.vue`：`step-content` 的 `content()` 仍需同步返回 VNode；步骤标题数组需适配底层 Steps 的单节点接口。

这次调整是迁移准备，**不表示已经支持 Vue Vapor**，也没有启用 Vapor 编译。后续需结合 Vue 与 `antdv-next` 的实际版本验证组件互操作、动态插槽、表单校验/ref、受控事件及上述 VNode 边界。新增可模板化的视图不应继续扩展这些兼容层。

## 项目发布约定

Changesets 与 GitHub Actions 属于本项目工程约定，不是 React API 的一部分。npm 变更通过 `pnpm changeset` 描述；`main` CI 通过后维护版本 PR，配置 `NPM_TOKEN` 时才发布 npm，并启用 provenance。

## 明确不包含

已新增 [基础 ProCard](../components/pro-card)，覆盖主题容器、标题与操作区、加载、折叠及语义样式；未提供其 tabs、栅格拆分、StatisticCard 和 CheckCard 扩展。

当前不提供 ProLayout、ProList、ProDescriptions，也不依赖特定请求库。网络层只需实现通用 Promise `request` 回调。
