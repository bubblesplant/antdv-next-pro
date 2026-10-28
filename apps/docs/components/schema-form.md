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

普通字段扩展优先级为：动态字段插槽（`field-${path}`、`${path}` 或列 `key`）→ `formItemRender(schema, context, nativeForm)` → 旧 `renderFormItem(context)` → `column.component` → 默认控件。正式回调的 context 提供 `value/record/update/defaultRender` 等上下文；第三参为底层 Form 实例。旧回调仅作回退，不按函数参数数量猜测版本。`column.component` 由 FormItem 包裹，接收 `value/modelValue/disabled` 和更新监听器。

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

## API

### 属性

| Prop                                | 类型                                                      | 说明                                                                         |
| ----------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `columns`                           | `SchemaFormColumn<T>[]`                                   | 唯一 Schema 入口                                                             |
| `modelValue`                        | `Partial<T>`                                              | 标准 `v-model` 值                                                            |
| `initialValues`                     | `Partial<T>`                                              | 初始化与重置基线                                                             |
| `request`                           | `(params?) => Promise<Partial<T>>`                        | 异步初始值                                                                   |
| `params`                            | `Record<string, unknown>`                                 | 初始化请求参数                                                               |
| `layoutType`                        | `SchemaFormLayoutType`                                    | 表单布局，默认 `Form`                                                        |
| `open`                              | `boolean`                                                 | Modal/Drawer 打开状态，支持 `v-model:open`                                   |
| `current`                           | `number`                                                  | 步骤索引，支持 `v-model:current`                                             |
| `title` / `width`                   | 文本或尺寸                                                | 弹层标题和宽度                                                               |
| `labelCol` / `wrapperCol`           | Antdv Next Form 配置                                      | 标签与控件布局                                                               |
| `grid`                              | `boolean`                                                 | 使用响应式 Row/Col 网格                                                      |
| `readonly`                          | `boolean`                                                 | 全表单只读                                                                   |
| `urlSync`                           | `boolean \| { key?, mode? }`                              | query/hash 同步                                                              |
| `syncToUrl` / `syncToInitialValues` | `boolean \| function` / `boolean`                         | 正式 URL 入口 / 是否初始回填                                                 |
| `dateFormatter`                     | `'string' \| 'number' \| false \| function`               | 默认 string，提交前格式化                                                    |
| `onFinish`                          | `(values) => boolean \| void \| Promise<boolean \| void>` | 等待业务提交，true 关闭弹层                                                  |
| `formProps`                         | `FormProps`                                               | 底层原生 Form 配置                                                           |
| `submitter`                         | `false \| SubmitterProps`                                 | searchConfig、render、submitButtonProps/resetButtonProps（可 false）及旧文案 |
| `submitTimeout`                     | `number`                                                  | 弹层关闭保护时长（毫秒），不终止提交                                         |
| `style`                             | `CSSProperties`                                           | 根容器样式                                                                   |

列还支持 `component`、`colProps`、`rowProps`、`tooltip` 和 `extra`。

### 事件

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
| `request-error`      | `error`                   | 异步初始值失败                    |
| `error`              | `error`                   | 初始化或校验失败                  |

### 插槽

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

### 组件实例

```ts
const formRef = ref<SchemaFormInstance<Brief>>()

formRef.value?.setFieldsValue({ owner: 'Ada' })
const raw = formRef.value?.getFieldsValue()
const output = await formRef.value?.submit()
await formRef.value?.next()
```

| 方法                     | 说明                                                         |
| ------------------------ | ------------------------------------------------------------ |
| `validate()`             | 校验并返回原始表单值，不执行 transform                       |
| `reset()`                | 恢复初始化快照                                               |
| `getFieldsValue()`       | 获取当前表单原始值                                           |
| `setFieldsValue(values)` | 浅层/嵌套合并传入字段                                        |
| `submit()`               | 校验、执行 transform，触发 `submit`、`finish` 并返回转换结果 |
| `open()` / `close()`     | 控制 Modal/Drawer                                            |
| `next()` / `prev()`      | 控制步骤；`next` 返回是否成功前进                            |

### 继承配置与语义样式

继承原生 ConfigProvider 的 locale、direction、componentSize/Disabled、prefixCls、主题算法、全局 token 及原生 Form/Input 等组件 token。Pro 自有扩展用 `ProConfigProvider.token`，自定义字段走 valueTypeMap。普通表单根类为 ant-pro-form，查询/轻量/步骤布局分别为 ant-pro-query-filter、ant-pro-form-light-filter、ant-pro-steps-form；步骤导航、内容与当前步骤具有 -steps-container、-container、-step-active。原生前缀 demo 时变为 demo-pro；显式 prefixCls 覆盖对应布局前缀。

`classes/styles` 接受对象或 `({ props }) => object`；旧 classNames 补缺，同部位 classes 优先。Schema 外层支持 `root/content`，步骤操作区支持 `submitter`，筛选布局继续接受 `row/item/actions/container/collapseButton` 等对应部位。普通表单内部区域可通过 formProps 的 classes/styles 定制。`class/style/id/data-*/aria-*` 路由到可见表单或布局容器；弹层外壳使用 modalProps/drawerProps。
