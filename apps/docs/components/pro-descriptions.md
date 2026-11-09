---
pageClass: component-doc
---

<script setup>
import ProDescriptionsDemo from '../examples/ProDescriptionsDemo.vue'
</script>

# ProDescriptions

使用与表格相同的字段 schema 展示单条记录，支持请求、格式化与逐字段编辑。排版属性沿用 antdv-next 的 Descriptions。

<ClientOnly><ProDescriptionsDemo /></ClientOnly>

<<< ../examples/ProDescriptionsDemo.vue

## 最小用法

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ProDescriptions, type ProDescriptionsColumn } from '@bubblesjs/antdv-next-pro'

type Profile = { name: string; status: string }
const profile = ref<Profile>({ name: '张三', status: 'active' })
const columns: ProDescriptionsColumn<Profile>[] = [
  { title: '姓名', dataIndex: 'name', formItemProps: { rules: [{ required: true }] } },
  {
    title: '状态',
    dataIndex: 'status',
    valueType: 'select',
    valueEnum: { active: '启用', inactive: '停用' },
  },
]
</script>

<template>
  <ProDescriptions
    title="用户信息"
    :columns="columns"
    :data-source="profile"
    :editable="{ type: 'single' }"
    @data-source-change="profile = $event"
  />
</template>
```

## API

### 属性 {#props}

| 属性                 | 类型                                                     | 默认值                 | 说明 / 来源                                                                                                                   |
| -------------------- | -------------------------------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `columns`            | `ProDescriptionsColumn<T>[]`                             | `[]`                   | 字段描述，见[字段配置](#columns)。                                                                                            |
| `dataSource`         | `T`                                                      | `{}`                   | 单条记录；通过 dataSourceChange 接收保存结果。                                                                                |
| `request`            | `(params: P) => Promise<{ data: T; success?: boolean }>` | —                      | 挂载及 request/params 变化时请求；只接纳最新响应，success=false 不更新。                                                      |
| `params`             | `P`                                                      | `{}`                   | 顶层记录请求参数。                                                                                                            |
| `loading`            | `boolean`                                                | —                      | 显式覆盖内部请求加载状态，传给 Spin。                                                                                         |
| `title`              | `VNodeChild`                                             | —                      | 标题；title 插槽优先。                                                                                                        |
| `tooltip`            | `string \| TooltipProps`                                 | —                      | 标题提示，传给原生 [Tooltip](https://www.antdv-next.com/components/tooltip-cn)。                                              |
| `extra`              | `VNodeChild`                                             | —                      | 附加区域；extra 插槽优先。                                                                                                    |
| `editable`           | `false \| EditableConfig<T>`                             | —                      | 启用逐字段编辑；本组件实际消费的子项见[编辑配置](#editable)。                                                                 |
| `formProps`          | `FormProps`                                              | —                      | 传给编辑 [Form](https://www.antdv-next.com/components/form-cn)；合并 editable.formProps，后者优先，model 最终由内部草稿覆盖。 |
| `formRef`            | `Ref<FormInstance \| undefined>`                         | —                      | 获得实际原生 [FormInstance](https://www.antdv-next.com/components/form-cn)，不是 ProFormInstance。                            |
| `actionRef`          | `Ref<ProDescriptionsInstance<T> \| undefined>`           | —                      | 接收本组件[实例](#instance)，等同组件 ref。                                                                                   |
| `emptyText`          | `VNodeChild`                                             | —                      | 传给 ProField 的空值占位。                                                                                                    |
| `prefixCls`          | `string`                                                 | `ant-pro-descriptions` | 完整公开前缀，继承 Pro 与原生配置。                                                                                           |
| `classes`            | `SemanticClasses \| ({ props }) => SemanticClasses`      | —                      | 原生 Descriptions 语义类名，优先于 classNames。                                                                               |
| `classNames`         | `SemanticClasses \| ({ props }) => SemanticClasses`      | —                      | 旧语义类名入口。                                                                                                              |
| `styles`             | `SemanticStyles \| ({ props }) => SemanticStyles`        | —                      | 原生 Descriptions 语义样式；content 默认 minWidth=0。                                                                         |
| `onLoadingChange`    | `(loading: boolean) => void`                             | —                      | 内部请求 loading 变化回调。                                                                                                   |
| `onRequestError`     | `(error: unknown) => void`                               | —                      | 顶层请求失败，对应 requestError 事件。                                                                                        |
| `onDataSourceChange` | `(data: T) => void`                                      | —                      | 字段保存后完整记录，对应 dataSourceChange。                                                                                   |
| `onEditableError`    | `(error: unknown) => void`                               | —                      | 编辑校验/保存/取消异常，对应 editableError。                                                                                  |

其他 [Descriptions 属性](https://www.antdv-next.com/components/descriptions-cn)，如 bordered、column、size、layout、colon、labelStyle/contentStyle，直接透传。公开类型替换 items/title/extra/prefixCls/classes/styles，应使用 columns 及上表入口。

### 字段配置 {#columns}

| 属性                  | 类型                                                                   | 默认值  | 说明 / 来源                                                                                                              |
| --------------------- | ---------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------ |
| `key`                 | `ProKey`                                                               | —       | 编辑标识；优先于 dataIndex 派生值。                                                                                      |
| `dataIndex`           | `ProDataIndex`                                                         | —       | 记录字段路径；嵌套字段用数组。                                                                                           |
| `title`               | `VNodeChild \| ((column) => VNodeChild)`                               | —       | 字段标签，省略时回退 label。                                                                                             |
| `label`               | `VNodeChild`                                                           | —       | title 的回退标签。                                                                                                       |
| `span`                | `DescriptionsItemProps['span']`                                        | —       | 传给原生 [Descriptions.Item](https://www.antdv-next.com/components/descriptions-cn)。                                    |
| `order`               | `number`                                                               | `0`     | 降序排列，值大者优先。                                                                                                   |
| `hide`                | `boolean`                                                              | `false` | 隐藏此字段。                                                                                                             |
| `hideInDescriptions`  | `boolean`                                                              | `false` | 隐藏此描述字段。                                                                                                         |
| `valueType`           | `ProColumnValueType<T>`                                                | `text`  | 传给 [ProField](./pro-field#props)，支持按 record/index 动态解析。                                                       |
| `valueEnum`           | `ProValueEnum \| (() => ProValueEnum)`                                 | —       | 枚举标签及选项，见 [ProField](./pro-field#props)。                                                                       |
| `fieldProps`          | `Record<string, unknown> \| ((record?: T) => Record<string, unknown>)` | —       | 传给 valueType 对应[控件](./pro-form-fields#props)，函数收到当前记录。                                                   |
| `request`             | `(params?) => Promise<Record<string, unknown>[]>`                      | —       | 字段选项请求，不替代顶层记录 request。                                                                                   |
| `onFieldRequestError` | `(error: unknown) => void`                                             | —       | 字段选项请求失败。                                                                                                       |
| `params`              | `Record<string, unknown>`                                              | `{}`    | 字段选项请求参数。                                                                                                       |
| `dependencies`        | `ProDataIndex[]`                                                       | —       | 将依赖路径值合并进字段请求 params，自定义编辑 context 同时提供依赖值。                                                   |
| `copyable`            | `boolean`                                                              | `false` | 只读值复制能力，见 ProField。                                                                                            |
| `ellipsis`            | `TableColumnType<T>['ellipsis']`                                       | —       | 只读值省略展示，见 ProField。                                                                                            |
| `readonly`            | `boolean`                                                              | `false` | 禁止进入本组件编辑流程。                                                                                                 |
| `editable`            | `boolean \| ((record: T, index: number) => boolean)`                   | `true`  | 顶层 editable 开启后决定此字段能否编辑。                                                                                 |
| `mode`                | `'read' \| 'edit' \| 'update'`                                         | `read`  | 传给 FieldRender；进入本组件编辑流程后强制 edit。                                                                        |
| `plain`               | `boolean`                                                              | `false` | 共享类型保留项，当前组件未消费。                                                                                         |
| `formItemProps`       | `Record<string, unknown> \| ((record?: T) => Record<string, unknown>)` | —       | 编辑 [FormItem](https://www.antdv-next.com/components/form-cn) 配置；函数收到草稿；name 和 marginBottom 最终由组件指定。 |
| `renderText`          | `(value, record, index, action) => unknown`                            | —       | 默认渲染前转换值。                                                                                                       |
| `render`              | `(dom, record, index, action, schema) => VNodeChild`                   | —       | 自定义只读节点，dom 为 ProField 默认节点。                                                                               |
| `formItemRender`      | `(schema, context, form: FormInstance \| undefined) => VNodeChild`     | —       | 自定义编辑；用 context.update(value) 回写草稿。                                                                          |
| `renderFormItem`      | `(schema, context) => VNodeChild`                                      | —       | 兼容回退；formItemRender 优先。                                                                                          |

类型继承 [ProColumns](./pro-table#columns)。表格专用项（width/minWidth/fixed/align/sorter/filters/hideInTable/hideInSearch/hideInForm/search/colSize）、嵌套 columns/children、initialValue、convertValue、transform 不由当前描述渲染器处理；需要时通过原生表单配置或自定义渲染实现。

编辑 context 包含 `record/index/column/editable/isEditable/recordKey/type="descriptions"/dependencies/defaultRender()/update(value)`。form 为实际原生 FormInstance。

### 编辑配置 {#editable}

| 属性             | 类型                                                                       | 默认值   | 说明 / 来源                                                                                              |
| ---------------- | -------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------- |
| `type`           | `'single' \| 'multiple'`                                                   | `single` | 同时编辑单个或多个字段。                                                                                 |
| `editableKeys`   | `ProKey[]`                                                                 | —        | 受控编辑字段 key；在 onChange 中回写。                                                                   |
| `onChange`       | `(keys: ProKey[], rows: T[]) => void`                                      | —        | 编辑 key 改变；rows 是只包含当前完整草稿的数组。                                                         |
| `onValuesChange` | `(record: T, rows: T[]) => void`                                           | —        | 草稿变化；rows=[record]。                                                                                |
| `onSave`         | `(key, next: T, origin: T) => void \| boolean \| Promise<void \| boolean>` | —        | 只校验和合并当前字段；false 或异常保留编辑。                                                             |
| `onCancel`       | `(key, draft: T, origin: T) => void \| Promise<void>`                      | —        | 取消当前字段，并恢复其原值。                                                                             |
| `formProps`      | `FormProps`                                                                | —        | 原生 [Form](https://www.antdv-next.com/components/form-cn) 配置，优先于顶层 formProps，内部 model 优先。 |
| `formRef`        | `Ref<FormInstance \| undefined>`                                           | —        | 与顶层 formRef 均能获得实际原生实例。                                                                    |

共享 EditableConfig 类型中的 onDelete/actionRender/form、操作文案及新增/单行告警选项由表格使用，ProDescriptions 不消费；本组件保存/取消按钮使用 Pro locale 文案。保存只校验当前字段，onSave=false 或校验失败继续编辑；受控 key 仍须父组件回写。

### 事件与回调 {#events}

| 事件 / 回调        | 参数                  | 说明                                         |
| ------------------ | --------------------- | -------------------------------------------- |
| `dataSourceChange` | `(data: T)`           | 保存后完整记录；调用方负责持久化并更新数据。 |
| `requestError`     | `(error: unknown)`    | 顶层请求异常。                               |
| `editableError`    | `(error: unknown)`    | 校验、保存、取消异常。                       |
| `onLoadingChange`  | `(loading: boolean)`  | 内部请求 loading 变化。                      |
| `editable` 回调    | [编辑配置](#editable) | 编辑键、草稿变化、保存和取消生命周期。       |

### 插槽 {#slots}

| 插槽                 | 参数                                              | 说明                                                  |
| -------------------- | ------------------------------------------------- | ----------------------------------------------------- |
| `title`              | —                                                 | 替换 title；tooltip 仍渲染。                          |
| `extra`              | —                                                 | 替换 extra。                                          |
| `field-${columnKey}` | `{ record: T, column: ProDescriptionsColumn<T> }` | 只读字段区域；columnKey 从 key/dataIndex 派生。       |
| `default`            | —                                                 | 追加原生 ProDescriptions.Item / ProDescriptionsItem。 |

### 实例 {#instance}

| 成员                  | 参数 / 返回值                  | 说明                                |
| --------------------- | ------------------------------ | ----------------------------------- |
| `reload()`            | `() => Promise<void>`          | 用当前 params 重新请求。            |
| `getData()`           | `() => T`                      | 读取当前完整记录。                  |
| `dataSource`          | `readonly T \| undefined`      | 当前记录 getter。                   |
| `setDataSource(data)` | `(T \| undefined) => void`     | 替换记录和草稿；undefined 置为 {}。 |
| `startEditable(key)`  | `(ProKey) => boolean`          | 允许时进入字段编辑。                |
| `saveEditable(key)`   | `(ProKey) => Promise<boolean>` | 校验保存字段；阻止或失败时 false。  |
| `cancelEditable(key)` | `(ProKey) => void`             | 恢复当前字段并结束编辑。            |
| `isEditable(key)`     | `(ProKey) => boolean`          | 检查字段编辑状态。                  |

### 原生描述项成员 {#item}

`ProDescriptions.Item` 与 `ProDescriptionsItem` 均是[原生 Descriptions.Item](https://www.antdv-next.com/components/descriptions-cn) 别名，key/label/children/span 及原生插槽遵循该 API，不新增 Pro 事件和实例方法。默认插槽原生项不自动成为可编辑 Schema 字段。

### FieldRender {#field-render}

| 属性        | 类型                         | 默认值 | 说明 / 来源                     |
| ----------- | ---------------------------- | ------ | ------------------------------- |
| `entity`    | `T`                          | `必填` | 当前完整记录。                  |
| `action`    | `ProDescriptionsInstance<T>` | `必填` | 当前描述实例，传给渲染回调。    |
| `text`      | `unknown`                    | —      | 当前字段值；支持 v-model:text。 |
| `index`     | `number`                     | `0`    | 当前字段下标。                  |
| `form`      | `FormInstance`               | —      | 传给自定义编辑回调的原生表单。  |
| `emptyText` | `VNodeChild`                 | —      | ProField 空值占位。             |

| 其余属性                                                                                                                                                                          | 类型 / 来源                                                    | 说明                                                     |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------- |
| `dataIndex / title / label`                                                                                                                                                       | [字段配置](#columns)                                           | 传入渲染回调的 schema 标识及标签。                       |
| `valueType / valueEnum / request / params / dependencies / fieldProps / renderText / render / formItemRender / renderFormItem / copyable / ellipsis / mode / onFieldRequestError` | [字段配置](#columns)                                           | 签名和默认值同上，mode 默认 read。                       |
| `formItemProps`                                                                                                                                                                   | [原生 FormItem](https://www.antdv-next.com/components/form-cn) | 包含在回调 schema 中；独立 FieldRender 不创建 FormItem。 |

| 事件 / 回调           | 参数               | 说明                       |
| --------------------- | ------------------ | -------------------------- |
| `update:text`         | `(value: unknown)` | 回传默认或自定义编辑变化。 |
| `onFieldRequestError` | `(error: unknown)` | 字段选项请求失败。         |

FieldRender 无额外插槽或实例方法，不创建表单、不负责保存。classes/styles 的部位遵循[原生 Descriptions 语义结构](https://www.antdv-next.com/components/descriptions-cn)，Pro token 见 [ProConfigProvider](./pro-config-provider#props)。
