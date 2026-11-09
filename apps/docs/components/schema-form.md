---
pageClass: component-doc
---

<script setup>
import SchemaFormDemo from '../examples/SchemaFormDemo.vue'
</script>

# BetaSchemaForm

`BetaSchemaForm` 使用顶层 `columns` Schema 生成字段，并以 Vue `v-model` 管理表单模型。`SchemaForm` 保留为兼容别名。它与表格组件共享 `dataIndex`、`valueType`、`valueEnum`、校验和转换约定；无需 Schema 的字段组合使用 [ProForm](./pro-form)。

## 何时使用

当需要通过同一套 `columns` 描述普通表单、查询筛选、弹层表单或步骤表单，并统一管理初始值、校验、转换与提交时使用。

## 示例

### 异步选项、URL 同步与插槽

<ClientOnly>
  <SchemaFormDemo />
</ClientOnly>

<details class="demo-source"><summary>查看完整代码</summary>

<<< ../examples/SchemaFormDemo.vue

</details>

### 基础用法

```vue
<BetaSchemaForm ref="formRef" v-model="form" :columns="columns" :on-finish="save" />
```

`initialValues`、异步 `request(params)`、URL 与受控值会按以下优先级合并，右侧覆盖左侧：

```text
initialValues < request result < URL values < modelValue
```

合并后的快照也是 `reset()` 的目标。`params`、`request`、`initialValues` 或 `urlSync` 变化时会重新初始化；并发初始化只接纳最后一次结果。请求失败会回退到 `initialValues + modelValue`，并触发 `request-error` 与 `error`。

```ts
const loadInitialValues = async (params?: Record<string, unknown>) => {
  const project = await api.project(params?.projectId)
  return { owner: project.owner, channel: project.channel }
}
```

### `valueType` 与异步选项

| 类型                              | 生成控件/结构                    |
| --------------------------------- | -------------------------------- |
| `text` / `textarea` / `password`  | Input / Textarea / Password      |
| `digit` / `money` / `percent`     | InputNumber                      |
| `select` / `treeSelect` / `radio` | Select / TreeSelect / RadioGroup |
| `checkbox` / `switch`             | Checkbox(Group) / Switch         |
| `slider` / `segmented`            | Slider / Segmented               |
| `date` / `dateTime`               | DatePicker                       |
| `dateRange` / `dateTimeRange`     | DateRangePicker                  |
| `time` / `timeRange`              | TimePicker / TimeRangePicker     |
| `group` / `formSet`               | 字段分组                         |
| `formList`                        | 可新增、删除的动态列表           |
| `divider`                         | 分隔线                           |
| `dependency`                      | 依赖字段或自定义联动区域         |

`select`、`treeSelect`、`radio`、`checkbox` 和 `segmented` 可使用 `valueEnum`、顶层/`fieldProps` 选项，或列级异步 `request`。TreeSelect 的底层选项属性为 `treeData`：

```ts
const channelColumn: SchemaFormColumn<Brief> = {
  title: '发布渠道',
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

异步选项会在 `request` 或 `params` 变化时重载，并同样只接纳最后一次结果。

SchemaForm、ProTable 搜索/编辑与[独立 ProFormFields](./pro-form-fields)共用同一字段注册表和控件核心，因此选项请求、只读展示与 `treeSelect`、`slider`、`segmented` 的行为保持一致。`timeRange` 也可直接生成时间区间控件。Captcha、UploadButton、UploadDragger 只提供独立组件，不映射为 `valueType`。

### 布局类型

查询布局也可以独立使用，支持字段子组件及 `columns`，详见 [QueryFilter](./query-filter) 与 [LightFilter](./light-filter)。

| `layoutType`  | 场景                               |
| ------------- | ---------------------------------- |
| `Form`        | 标准表单                           |
| `Embed`       | 无额外弹层的嵌入式表单             |
| `ModalForm`   | Modal，使用 `v-model:open`         |
| `DrawerForm`  | Drawer，使用 `v-model:open`        |
| `QueryFilter` | 网格化行内查询表单                 |
| `LightFilter` | 轻量行内筛选                       |
| `StepForm`    | 单步骤视图，使用 `v-model:current` |
| `StepsForm`   | 带 Steps 导航的多步骤表单          |

既可以设置 `layout-type`，也可直接导入同名组件：

```vue
<script setup lang="ts">
import { ModalForm, StepsForm } from '@bubblesjs/antdv-next-pro'
</script>

<template>
  <ModalForm v-model="form" v-model:open="open" :columns="columns" />
  <StepsForm v-model="form" v-model:current="current" :columns="stepColumns" />
</template>
```

多步骤 Schema 要求顶层列全部是带 `children` 的 `group` 或 `formSet`；每个顶层分组成为一步，旧子级 `columns` 仍回退兼容。`next()` 会先校验当前步骤，最后一步提交完整结果。Steps 标题允许直接点击返回已访问的前序步骤；点击后续步骤只会触发一次 `next()`，校验成功后前进一步，不能绕过当前步骤校验。需要每步独立原生表单与实例时使用组合式 `StepsForm.StepForm`。

### 组合字段与动态 Schema

```ts
const columns: SchemaFormColumn<Project>[] = [
  {
    title: '基本信息',
    valueType: 'group',
    children: [
      { title: '名称', dataIndex: 'name', valueType: 'text' },
      { title: '类型', dataIndex: 'kind', valueType: 'select', valueEnum: kinds },
    ],
  },
  {
    title: '联系人',
    dataIndex: 'contacts',
    valueType: 'formList',
    fieldProps: {
      creatorButtonText: '添加联系人',
      removeText: '移除',
      initialValue: { name: '', email: '' },
    },
    children: [
      { title: '姓名', dataIndex: 'name', valueType: 'text' },
      { title: '邮箱', dataIndex: 'email', valueType: 'text' },
    ],
  },
]
```

顶层 `columns` 可以是 computed 结果；依赖外部状态增删列即可生成动态字段。分组、列表和依赖的子级正式使用 `children`，同时存在时优先于旧 `columns`。`dependencies` 会把依赖值传给字段插槽，`dependency` 搭配 `formItemRender` 可渲染联动区域。

普通字段扩展优先级为：动态字段插槽（`field-${path}`、`${path}` 或列 `key`）→ `formItemRender(schema, context, nativeForm)` → 旧 `renderFormItem(column, context)` → `column.component` → 默认控件。正式回调的 context 提供 `value/record/update/defaultRender` 等上下文；第三参为底层 Form 实例。旧回调仅作回退，不按函数参数数量猜测版本。`column.component` 由 FormItem 包裹，接收 `value/modelValue/disabled` 和更新监听器。

### 值转换

`convertValue` 处理进入表单的数据，包括初始化、外部 `v-model` 更新和 `setFieldsValue`。`submit()` 先按 `dateFormatter` 格式化，再执行 `transform`；`validate()` 返回原始值。默认 `dateFormatter="string"`，`number` 输出时间戳，`false` 保留原始日期对象，函数可自定义格式。需要在 transform 中调用 Dayjs 方法时显式保留原始对象，例如下面配置搭配 `:date-formatter="false"`。

```ts
const columns = [
  {
    title: '时间范围',
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

`transform` 返回对象时移除原字段并合并到最终结果；返回普通值时保留原 `dataIndex`。格式化和转换不会修改表单原始模型。

### 提交与弹层

普通表单默认 `layout="vertical"`，旧横向效果显式设为 horizontal。业务提交使用 `:on-finish="save"`，实例 submit 会等待 Promise；pending 时显示 loading，重复提交合并。Modal/Drawer 只有回调返回 true 才关闭；false、undefined 或 reject 保留打开状态与值，卸载或重开后旧提交不能误关闭。`submit` 事件用于观察提交，不代替可等待的回调。

弹层默认取消会关闭并调用原生关闭回调，保留草稿；reset() 恢复初始值。modalProps/drawerProps 透传原生配置，由表单协调 open、title/width、footer 和关闭回调。destroyOnHidden=true 时关闭动画结束后重置，下次打开恢复初始值。submitTimeout 为正数时暂时禁用取消和交互关闭，到期解除保护而不终止业务提交；loading 持续至 Promise 完成，具体见 [ProForm](./pro-form)。

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

### URL 同步

```vue
<!-- 每个字段写入 query -->
<SchemaForm :url-sync="true" />

<!-- 完整模型以 JSON 写入 filters 参数 -->
<SchemaForm :url-sync="{ key: 'filters' }" />

<!-- 每个字段写入 hash -->
<SchemaForm :url-sync="{ mode: 'hash' }" />
```

字段模式会删除 URL 中的空值；命名 key 模式存储完整模型。组件监听 `popstate` / `hashchange` 并回填表单，适合可分享的筛选条件。URL 值在初始化时覆盖 `request` 结果，但仍会被显式 `modelValue` 覆盖。

ModalForm / DrawerForm 默认宽度为 `800px`，提交区位于原生 footer 并右对齐；Modal 默认“确认”、Drawer 默认“提交”。`width`、原生弹层配置和 submitter 文案仍可覆盖默认值，详见 [ProForm 默认布局](./pro-form)。普通 Schema 表单的提交区默认起点对齐；group 字段复用 `ProFormGroup` 的标题、间距及语义样式。

## API

### 属性 {#props}

`T` 为记录类型；“—”表示没有组件默认值。SchemaForm 不整体继承原生 FormProps，原生配置应放在 [`formProps`](#form-props)。所有布局名称见上方 [布局类型](#布局类型)，布局别名传 `columns` 时使用本页 API，省略时使用 [ProForm 组合模式](./pro-form#api)。

| 属性                                 | 类型                                                                     | 默认值                                  | 说明 / 来源                                                                                  |
| ------------------------------------ | ------------------------------------------------------------------------ | --------------------------------------- | -------------------------------------------------------------------------------------------- |
| `columns`                            | `SchemaFormColumn<T>[]`                                                  | 必填                                    | Schema 字段，见 [列属性](#columns)                                                           |
| `modelValue`                         | `Partial<T>`                                                             | —                                       | 原始模型，使用 v-model                                                                       |
| `initialValues`                      | `Partial<T>`                                                             | —                                       | 初始化与重置基线                                                                             |
| `request`                            | `(params?: Record<string, unknown>) => Promise<Partial<T>>`              | —                                       | 异步初始值，不是提交请求                                                                     |
| `params`                             | `Record<string, unknown>`                                                | —                                       | 初始值请求参数，变化时重新初始化                                                             |
| `layoutType`                         | `SchemaFormLayoutType`                                                   | `'Form'`                                | Form / Embed / ModalForm / DrawerForm / QueryFilter / LightFilter / StepForm / StepsForm     |
| `open`                               | `boolean`                                                                | `false`                                 | 弹层状态，支持 v-model:open                                                                  |
| `current`                            | `number`                                                                 | `0`                                     | 步骤索引，支持 v-model:current                                                               |
| `title`                              | `VNodeChild`                                                             | —                                       | 弹层标题，优先于 modalProps.title / drawerProps.title；title 插槽优先                        |
| `width`                              | `number \| string`                                                       | `800`（弹层）                           | 原生 modalProps.width / drawerProps.width 优先                                               |
| `labelCol`                           | `Record<string, unknown>`                                                | —                                       | 顶层标签栅格，传入原生 [Form labelCol][antd-form]，内部字段为 [ColProps][antd-grid]          |
| `wrapperCol`                         | `Record<string, unknown>`                                                | —                                       | 顶层控件栅格，来源同上                                                                       |
| `grid`                               | `boolean`                                                                | `false`                                 | 开启 Row/Col，普通字段默认 xs=24、sm=12、lg=8                                                |
| `readonly`                           | `boolean`                                                                | `false`                                 | 全表单只读，隐藏提交区                                                                       |
| `disabled`                           | `boolean`                                                                | 继承 ConfigProvider                     | 内部原生 Form 禁用状态，优先使用顶层配置                                                     |
| `layout`                             | `FormProps['layout']`                                                    | `'vertical'`；QueryFilter 为 horizontal | 原生表单布局；与决定容器类型的 layoutType 不同                                               |
| `formProps`                          | `Omit<FormProps, 'model' \| 'onFinish'>`                                 | —                                       | 原生 Form 配置；[字段与覆盖规则](#form-props)、[官方完整 API][antd-form]                     |
| `onFinish`                           | `(values: Partial<T>) => boolean \| void \| Promise<boolean \| void>`    | —                                       | 等待业务提交；弹层只有 true 才关闭                                                           |
| `onValuesChange`                     | `(changed: Partial<T>, values: Partial<T>) => void`                      | —                                       | 嵌套变更对象及完整原始值；同 values-change 通知                                              |
| `urlSync`                            | `boolean \| { key?: string; mode?: 'query' \| 'hash' }`                  | 关闭                                    | 兼容 URL 同步，配置见 [URL 配置](#url-sync)                                                  |
| `syncToUrl`                          | `boolean \| ((values, type: 'get' \| 'set') => Record<string, unknown>)` | —                                       | 正式同步入口；显式设置时优先于 urlSync                                                       |
| `syncToInitialValues`                | `boolean`                                                                | `true`                                  | 初始化时从 URL 回填                                                                          |
| `dateFormatter`                      | `'string' \| 'number' \| false \| ((value, valueType?) => unknown)`      | `'string'`                              | 提交/格式化读取时处理日期                                                                    |
| `submitter`                          | `false \| SubmitterProps`                                                | `{}`                                    | [完整 SubmitterProps 表](./pro-form#submitter-props)，按钮配置来源 [Button API][antd-button] |
| `submitTimeout`                      | `number`                                                                 | 关闭保护                                | 弹层业务提交期间的交互关闭保护毫秒数，不终止 Promise                                         |
| `modalProps`                         | `ModalProps`                                                             | —                                       | ModalForm 的 [Modal API][antd-modal]，见 [弹层配置规则](#overlay-config)                     |
| `drawerProps`                        | `DrawerProps`                                                            | —                                       | DrawerForm 的 [Drawer API][antd-drawer]，见 [弹层配置规则](#overlay-config)                  |
| `prefixCls`                          | `string`                                                                 | 跟随原生前缀与布局                      | 完整 Pro 布局前缀                                                                            |
| `classes`                            | `FormClasses \| (({ props }) => FormClasses)`                            | —                                       | [语义部位](#semantic)                                                                        |
| `classNames`                         | `FormClasses`                                                            | —                                       | 兼容类名；classes 同部位优先                                                                 |
| `styles`                             | `FormStyles \| (({ props }) => FormStyles)`                              | —                                       | [语义部位](#semantic)                                                                        |
| `formRef`                            | `Ref<SchemaFormInstance<T> \| undefined> \| ((instance) => void)`        | —                                       | 与组件 ref 相同的实例                                                                        |
| `style`                              | `CSSProperties`                                                          | —                                       | 可见根容器样式                                                                               |
| `class` / `id` / `data-*` / `aria-*` | Vue HTML attributes                                                      | —                                       | 绑定可见表单或布局容器；弹层自身通过 modalProps/drawerProps                                  |

筛选与步骤扩展仍是 SchemaForm 的**顶层属性**，只在相应 layoutType 下生效：

| 属性                | 类型                                                                                            | 默认值          | 生效布局 / 来源                                                                             |
| ------------------- | ----------------------------------------------------------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------- |
| `collapsed`         | `boolean`                                                                                       | —               | QueryFilter 受控折叠，支持 v-model:collapsed；[查询属性](./query-filter#props)              |
| `defaultCollapsed`  | `boolean`                                                                                       | `true`          | QueryFilter 初始折叠                                                                        |
| `defaultColsNumber` | `number`                                                                                        | `3`             | QueryFilter 默认显示列数                                                                    |
| `span`              | `number \| Record<string, number>`                                                              | 响应式计算      | QueryFilter 字段栅格跨度，见 [QueryFilter](./query-filter#props)                            |
| `labelWidth`        | `number \| 'auto'`                                                                              | `80`            | QueryFilter 标签宽度                                                                        |
| `split`             | `boolean`                                                                                       | `false`         | QueryFilter 分隔样式                                                                        |
| `searchText`        | `VNodeChild`                                                                                    | locale 查询文案 | QueryFilter 查询按钮                                                                        |
| `resetText`         | `VNodeChild`                                                                                    | locale 重置文案 | QueryFilter 重置按钮                                                                        |
| `optionRender`      | `false \| ((props: QueryFilterProps, form: ProFormInstance, doms: VNodeChild[]) => VNodeChild)` | 默认操作区      | QueryFilter [操作渲染](./query-filter#props)                                                |
| `collapseRender`    | `false \| ((collapsed: boolean) => VNodeChild)`                                                 | 默认展开/收起   | QueryFilter 折叠入口                                                                        |
| `collapse`          | `boolean`                                                                                       | `false`         | LightFilter 是否将全部字段归入更多；[轻量筛选属性](./light-filter#props)                    |
| `collapseLabel`     | `VNodeChild`                                                                                    | locale 更多文案 | LightFilter 更多入口                                                                        |
| `placement`         | `PopoverProps['placement']`                                                                     | `'bottomLeft'`  | LightFilter 弹层位置，来源 [Popover API][antd-popover]                                      |
| `footerRender`      | `false \| (({ confirm, clear }, doms: VNodeChild[]) => VNodeChild)`                             | 默认底部        | LightFilter 确认/清除区域，见 [LightFilter](./light-filter#props)                           |
| `stepsProps`        | `StepsProps`                                                                                    | —               | StepsForm 的 [Steps API][antd-steps]；current/items 由 Schema 生成，onChange 受校验导航约束 |

### formProps：原生表单配置 {#form-props}

`formProps` 传给内部 Form 层，类型来自 **antdv-next** 的 [FormProps][antd-form]。常用项和每项来源如下；完整原生属性目录见 [共享 Form 属性表](./pro-form#native-form-props)。不要在这里放 columns、request、initialValues 或 Pro submitter。

| 配置项                                                          | 类型                 | 用途 / 覆盖规则                                                             |
| --------------------------------------------------------------- | -------------------- | --------------------------------------------------------------------------- |
| `name`                                                          | `string`             | 原生 Form 标识                                                              |
| `rules`                                                         | `FormProps['rules']` | 表单级规则，单字段规则可用 column.formItemProps.rules                       |
| `labelAlign` / `labelWrap` / `colon`                            | `FormProps` 对应类型 | 标签对齐、换行、冒号；[Form API][antd-form]                                 |
| `size` / `variant`                                              | `FormProps` 对应类型 | 子控件尺寸/外观；[Form API][antd-form]                                      |
| `requiredMark` / `feedbackIcons` / `tooltip`                    | `FormProps` 对应类型 | 必填标记、反馈图标、提示；[Form API][antd-form]                             |
| `validateTrigger` / `validateMessages` / `validateOnRuleChange` | `FormProps` 对应类型 | 校验时机、提示及规则更新行为；[Form API][antd-form]                         |
| `scrollToFirstError` / `preserve` / `clearOnDestroy`            | `FormProps` 对应类型 | 原生滚动与字段生命周期；[Form API][antd-form]                               |
| `autoComplete` / `autocomplete`                                 | `string`             | 自动补全；[Form API][antd-form]                                             |
| `onFinishFailed` / `onValidate` / `onFieldsChange`              | `FormProps` 对应回调 | 原生表单通知；Pro 的实例校验/提交应同时处理其 Promise 与 error 事件         |
| `layout` / `disabled` / `labelCol` / `wrapperCol`               | `FormProps` 对应类型 | 使用 SchemaForm **同名顶层属性**配置；内部显式绑定会覆盖 formProps 中这些键 |
| `classes` / `styles`                                            | 原生 Form 语义配置   | 普通表单模式参与合并；顶层 classes/styles 的 form、submitter 部位优先       |
| `model` / `onFinish`                                            | 不允许               | 从公开 formProps 类型中排除；模型与业务提交由 SchemaForm 管理               |
| `onValuesChange` / `onReset` / `onSubmit`                       | 原生回调类型         | 不用于替代 Schema 顶层回调及事件；表单封装接管相关流程                      |

```vue
<BetaSchemaForm
  :columns="columns"
  layout="horizontal"
  :label-col="{ span: 6 }"
  :form-props="{ name: 'project', size: 'small', validateTrigger: 'blur' }"
  :on-finish="save"
/>
```

### 弹层原生配置 {#overlay-config}

| 配置入口                                    | 来源                                     | 由 SchemaForm 协调的键                                                                                          |
| ------------------------------------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `modalProps`                                | [ModalProps / 事件 / 插槽][antd-modal]   | open 由 v-model:open 控制；title 用顶层/插槽；footer 由 submitter/footer 插槽管理；onCancel/afterClose 组合调用 |
| `drawerProps`                               | [DrawerProps / 事件 / 插槽][antd-drawer] | open、title、footer 同上；onClose/afterOpenChange 组合调用                                                      |
| 两者的 `width`                              | 原生宽度配置                             | 原生 props.width > 顶层 width > 800                                                                             |
| 两者的 `destroyOnHidden` / `destroyOnClose` | 原生生命周期配置                         | 关闭完成后销毁/重置；重开恢复初始快照                                                                           |

Schema 模式只提供本页列出的弹层插槽，不自动透传全部原生弹层插槽。可用字段、布局和按钮配置分别在本页、[ProForm 提交区](./pro-form#submitter-props)及原生 API 查阅。

### columns：SchemaFormColumn {#columns}

`SchemaFormColumn<T>` 继承 [`ProColumns<T>`](./pro-table#columns)。下表列出 Schema 视图使用的字段；表格专用列属性仍归属于 ProTable，不表示表单会消费它们。

| 列属性                | 类型                                                                                    | 默认值                      | 说明 / 来源                                                                                                                                                 |
| --------------------- | --------------------------------------------------------------------------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `key`                 | `string \| number`                                                                      | —                           | 稳定标识，也用作动态字段插槽名                                                                                                                              |
| `dataIndex`           | `string \| number \| readonly (string \| number)[]`                                     | —                           | 字段路径；List 子字段自动拼接行路径                                                                                                                         |
| `title`               | `VNodeChild \| ((column) => VNodeChild)`                                                | —                           | 字段标签或分组/步骤标题，label 插槽优先                                                                                                                     |
| `valueType`           | `ProColumnValueType<T>`                                                                 | `'text'`                    | [字段类型](./pro-field#props)，函数使用当前模型及索引 0；group/formSet/formList/dependency/divider 为结构类型                                               |
| `valueEnum`           | `ProValueEnum \| (() => ProValueEnum)`                                                  | —                           | 枚举选项，格式来源 [ProField](./pro-field#props)                                                                                                            |
| `fieldProps`          | `Record<string, unknown> \| ((record?: T) => Record<string, unknown>)`                  | —                           | 传给对应控件；[各 valueType 的原生 API](./pro-form-fields)。group/formSet → [Group](./pro-form#group-props)，formList → [List](./pro-form#list-props)       |
| `formItemProps`       | `Record<string, unknown> \| ((record?: T) => Record<string, unknown>)`                  | —                           | [FormItemProps][antd-form-item]，如 rules/help/required；name/label/tooltip/extra 由 Schema 随后绑定                                                        |
| `request`             | `(params?) => Promise<Record<string, unknown>[]>`                                       | —                           | 异步选项，优先于 fieldProps.request                                                                                                                         |
| `params`              | `Record<string, unknown>`                                                               | —                           | 配置列 `request` 时传给该请求；提供时覆盖 fieldProps.params。仅设置 fieldProps.request 时不读取此项                                                         |
| `onFieldRequestError` | `(error: unknown) => void`                                                              | —                           | 字段选项请求失败通知                                                                                                                                        |
| `initialValue`        | `unknown`                                                                               | —                           | 字段级初值，初始化模型优先                                                                                                                                  |
| `readonly`            | `boolean`                                                                               | `false`                     | 当前字段只读                                                                                                                                                |
| `hideInForm`          | `boolean`                                                                               | `false`                     | 所有 Schema 布局隐藏该字段                                                                                                                                  |
| `hideInSearch`        | `boolean`                                                                               | `false`                     | QueryFilter / LightFilter 隐藏该字段                                                                                                                        |
| `convertValue`        | `(value: unknown, record: Partial<T>) => unknown`                                       | —                           | 入站转换                                                                                                                                                    |
| `transform`           | `(value: unknown, record: Partial<T>) => unknown`                                       | —                           | 出站转换；对象结果合并进根提交对象                                                                                                                          |
| `dependencies`        | `NamePath[]`                                                                            | —                           | 依赖字段值按相同顺序传给插槽/回调                                                                                                                           |
| `formItemRender`      | `(schema, context: ProRenderContext<T>, form: FormInstance \| undefined) => VNodeChild` | —                           | 自定义字段，低于字段插槽、高于 component                                                                                                                    |
| `renderFormItem`      | `(column, context: ProRenderContext<T>) => VNodeChild`                                  | —                           | 兼容回调，仅 formItemRender 未提供时使用                                                                                                                    |
| `component`           | Vue `Component`                                                                         | —                           | 自定义控件；表单补 value/modelValue、disabled 及更新监听                                                                                                    |
| `colProps`            | `Record<string, unknown>`                                                               | `{ xs: 24, sm: 12, lg: 8 }` | grid=true 时传给 [Col][antd-grid]，覆盖默认列宽                                                                                                             |
| `rowProps`            | `Record<string, unknown>`                                                               | `{ gutter: 16 }`            | grid=true 的 group/formSet 内传给 [Row][antd-grid]                                                                                                          |
| `tooltip`             | `VNodeChild`                                                                            | —                           | 字段或分组提示；[FormItem][antd-form-item] / [Group](./pro-form#group-props)                                                                                |
| `extra`               | `VNodeChild`                                                                            | —                           | 字段或分组附加内容                                                                                                                                          |
| `children`            | `SchemaFormColumn<T>[]`                                                                 | —                           | group/formSet/formList/dependency 子字段                                                                                                                    |
| `columns`             | `SchemaFormColumn<T>[]`                                                                 | —                           | 兼容子字段，children 优先                                                                                                                                   |
| `secondary`           | `boolean`                                                                               | `false`                     | LightFilter 中归入更多筛选                                                                                                                                  |
| 继承的表格专用属性    | [ProColumns](./pro-table#columns)                                                       | —                           | 如 width/minWidth/fixed/align/ellipsis/copyable/sorter/filters/search/editable/hideInTable/order/colSize/render/renderText；Schema 表单不将它们传给原生控件 |

`formList.fieldProps.creatorRecord` 为新行模板，兼容 `fieldProps.initialValue`；`creatorButtonText` 为旧新增文案，正式配置使用 `creatorButtonProps.creatorButtonText`。其余列表配置见 [ProFormList](./pro-form#list-props)，不要将列 initialValue（整个字段初值）与新行模板混用。

### urlSync 配置 {#url-sync}

| 配置项 | 类型                | 默认值    | 说明                                              |
| ------ | ------------------- | --------- | ------------------------------------------------- |
| `key`  | `string`            | —         | 将表单值存入单个 URL 参数；省略时逐字段使用点路径 |
| `mode` | `'query' \| 'hash'` | `'query'` | URL search 或 hash 同步                           |

### 事件 {#events}

| 事件                 | 参数                      | 说明                              |
| -------------------- | ------------------------- | --------------------------------- |
| `update:model-value` | `values`                  | 默认 `v-model` 更新               |
| `update:open`        | `open`                    | 弹层双向绑定                      |
| `update:current`     | `current`                 | 步骤双向绑定                      |
| `change`             | `values`                  | 任意字段变化                      |
| `values-change`      | `changedValues, values`   | 首参为嵌套变更对象                |
| `field-change`       | `{ path, value }, values` | 单字段路径与原始值                |
| `submit`             | `values`                  | 校验、格式化和 transform 后的结果 |
| `finish`             | `values`                  | 无 onFinish prop 时的兼容通知     |
| `reset`              | `values`                  | 恢复初始化快照                    |
| `open` / `close`     | 无                        | 组件方法或弹层交互                |
| `current-change`     | `current`                 | 当前步骤变化                      |
| `update:collapsed`   | `collapsed: boolean`      | QueryFilter 折叠双向绑定          |
| `collapse`           | `collapsed: boolean`      | QueryFilter 折叠变化              |
| `request-error`      | `error`                   | 异步初始值失败                    |
| `error`              | `error`                   | 初始化或校验失败                  |

### 插槽 {#slots}

字段路径以点连接，例如 `['profile', 'name']` 对应 `profile.name`。

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

  <template #submitter="{ values, current }">
    <button type="button" @click="formRef?.prev()">上一步</button>
    <button type="button" @click="formRef?.submit()">提交第 {{ current + 1 }} 步</button>
  </template>
</SchemaForm>
```

| 插槽                                  | 参数                                                                                            |
| ------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `field-${path}`、`${path}` 或列 `key` | `{ value, record, column, dependencies, update }`                                               |
| `label-${path}`                       | `{ column, record }`                                                                            |
| `submitter`                           | `{ values, current }`                                                                           |
| `trigger`                             | `{ open, openForm, closeForm }`                                                                 |
| `title`                               | `{ title, open, values, close }`                                                                |
| `footer`                              | `{ values, submitting, submit, reset, close }`                                                  |
| `step-title`                          | `{ title, index, current, step, steps, values }`                                                |
| `step-content`                        | `{ current, step, steps, columns, values, content }`                                            |
| `step-actions`                        | `{ current, step, steps, values, hasPrevious, hasNext, submitting, next, prev, submit, reset }` |

字段插槽中的 `update(nextValue)` 会更新表单、`v-model`、URL 和相关事件。
`trigger`、`title`、`footer` 用于 `ModalForm` / `DrawerForm`；`step-title`、`step-content`、`step-actions` 用于 `StepForm` / `StepsForm`。`step-content` 的 `content()` 可渲染当前步骤的默认字段。

### 组件实例 {#instance}

```ts
const formRef = ref<SchemaFormInstance<Brief>>()

formRef.value?.setFieldsValue({ owner: 'Ada' })
const raw = formRef.value?.getFieldsValue()
const output = await formRef.value?.submit()
await formRef.value?.next()
```

| 方法 / 成员                       | 参数                                              | 返回值                         | 说明                                                                     |
| --------------------------------- | ------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------ |
| `nativeForm`                      | —                                                 | `FormInstance \| undefined`    | 当前表单/当前步骤的 [原生 Form 实例][antd-form-instance]                 |
| `validate`                        | 无                                                | `Promise<Partial<T>>`          | 校验当前表单或当前步骤，返回原始值                                       |
| `validateFields`                  | `names?: NamePath[]`                              | `Promise<Partial<T>>`          | 按路径校验；步骤模式限当前步骤                                           |
| `validateFieldsReturnFormatValue` | `names?: NamePath[]`                              | `Promise<Partial<T>>`          | 校验后格式化/transform                                                   |
| `reset` / `resetFields`           | 无                                                | `void`                         | 恢复初始化快照，不接受原生部分重置参数                                   |
| `clearValidate`                   | `names?: NamePath[]`                              | `void`                         | 清理校验状态                                                             |
| `getFieldsValue`                  | 无                                                | `Partial<T>`                   | 读取原始模型                                                             |
| `getFieldValue`                   | `name: NamePath`                                  | `unknown`                      | 读取单字段                                                               |
| `getFieldsFormatValue`            | 无                                                | `Partial<T>`                   | 读取日期格式化及 transform 结果                                          |
| `getFieldFormatValue`             | `name: NamePath`                                  | `unknown`                      | 从转换后的结果读取路径                                                   |
| `setFieldsValue`                  | `values: Partial<T>`                              | `void`                         | 合并值并应用入站转换                                                     |
| `setFieldValue`                   | `name: NamePath, value: unknown`                  | `void`                         | 写单字段并通知变更                                                       |
| `submit`                          | 无                                                | `Promise<Partial<T>>`          | 全表单/全部步骤校验，格式化并等待 onFinish，失败 reject                  |
| `open` / `close`                  | 无                                                | `void`                         | 控制弹层并通知状态更新                                                   |
| `next`                            | 无                                                | `Promise<boolean>`             | 校验当前步，成功前进返回 true；最后一步返回 false                        |
| `prev`                            | 无                                                | `void`                         | 返回前一步                                                               |
| `scrollToField`                   | `name: NamePath, options?: ScrollIntoViewOptions` | `void`                         | 定位当前表单/步骤字段                                                    |
| `loading`                         | —                                                 | `Readonly<Ref<boolean>>`       | 提交中状态；Vue 公开实例可能解包 ref                                     |
| `formMap?`                        | 无                                                | `Map<string, ProFormInstance>` | 可选兼容成员，仅布局别名实现转发；直接 BetaSchemaForm 未实现，见下方说明 |

`NamePath` 为字符串、数字或路径数组。直接 BetaSchemaForm 不提供 formMap；布局别名转发器具有兼容 `formMap()`，组合 StepsForm 才返回每步实例 Map，Schema 模式返回空 Map。需要每步原生表单实例时使用 [组合 StepsForm](./pro-form#steps-props)。

### 继承配置与语义样式 {#semantic}

继承原生 ConfigProvider 的 locale、direction、componentSize/Disabled、prefixCls、主题算法、全局 token 及原生 Form/Input 等组件 token。Pro 自有扩展用 `ProConfigProvider.token`，自定义字段走 valueTypeMap。普通表单根类为 ant-pro-form，查询/轻量/步骤布局分别为 ant-pro-query-filter、ant-pro-form-light-filter、ant-pro-steps-form；步骤导航、内容与当前步骤具有 -steps-container、-container、-step-active。原生前缀 demo 时变为 demo-pro；显式 prefixCls 覆盖对应布局前缀。

`classes/styles` 接受对象或 `({ props }) => object`；旧 classNames 补缺，同部位 classes 优先。Schema 外层支持 `root/content`，内部表单支持 `form`，提交区支持 `submitter`，筛选布局继续接受 `row/item/actions/container/collapseButton` 等对应部位。普通表单内部区域也可通过 formProps 的 classes/styles 定制。`class/style/id/data-*/aria-*` 路由到可见表单或布局容器；弹层外壳使用 modalProps/drawerProps。

[antd-form]: https://www.antdv-next.com/components/form-cn#form-props
[antd-form-item]: https://www.antdv-next.com/components/form-cn#form-item-props
[antd-form-instance]: https://www.antdv-next.com/components/form-cn#form-methods
[antd-grid]: https://www.antdv-next.com/components/grid-cn#api
[antd-modal]: https://www.antdv-next.com/components/modal-cn#api
[antd-drawer]: https://www.antdv-next.com/components/drawer-cn#api
[antd-button]: https://www.antdv-next.com/components/button-cn#props
[antd-popover]: https://www.antdv-next.com/components/popover-cn#api
[antd-steps]: https://www.antdv-next.com/components/steps-cn#api
