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

| 属性                               | 说明                                                                           |
| ---------------------------------- | ------------------------------------------------------------------------------ |
| `columns`                          | `ProDescriptionsColumn<T>[]`，每项描述一个字段                                 |
| `dataSource`                       | 单个对象 `T`，不是数组                                                         |
| `request`                          | `(params: P) => Promise<{ data: T; success?: boolean }>`；挂载及参数变化时请求 |
| `params`                           | 请求参数；较旧的响应不会覆盖较新的结果                                         |
| `loading`                          | 显式覆盖内部请求加载状态                                                       |
| `title` / `tooltip` / `extra`      | 标题、标题提示、附加区域                                                       |
| `editable`                         | `false` 或 `EditableConfig<T>`；配置后允许逐字段编辑，默认单字段               |
| `formProps`                        | 原生编辑 Form 属性，与 `editable.formProps` 合并，后者优先                     |
| `formRef` / `editable.formRef`     | `Ref<FormInstance \| undefined>`，获得实际原生表单                             |
| `actionRef`                        | `Ref<ProDescriptionsInstance<T> \| undefined>`，也可用组件 `ref`               |
| `emptyText`                        | 空字段展示值                                                                   |
| 原生 Descriptions 属性             | `bordered`、`column`、`size`、`layout` 等直接使用                              |
| `prefixCls` / `classes` / `styles` | 公开前缀与语义样式                                                             |

| 字段属性                                 | 说明                                                              |
| ---------------------------------------- | ----------------------------------------------------------------- |
| `key` / `dataIndex`                      | 编辑标识优先取 `key`，否则从 `dataIndex` 派生；嵌套路径使用数组   |
| `title` / `label`                        | 标题支持节点或 `(column) => VNodeChild`；省略 title 时使用 label  |
| `span` / `order`                         | 原生描述项跨度；order 较大者优先                                  |
| `hide` / `hideInDescriptions`            | 隐藏字段                                                          |
| `valueType` / `valueEnum` / `fieldProps` | 与 ProField 共用展示、输入和格式化能力                            |
| `request` / `params`                     | 字段选项请求，不替代顶层记录请求                                  |
| `readonly` / `editable`                  | 禁止该字段编辑；editable 也可为 `(record, index) => boolean`      |
| `formItemProps`                          | 原生校验规则等属性，对应当前字段路径                              |
| `renderText`                             | `(value, record, index, action) => unknown`，先转换展示值         |
| `render`                                 | `(dom, record, index, action, schema) => VNodeChild`              |
| `formItemRender`                         | `(schema, context, form) => VNodeChild`；form 为原生 FormInstance |

`formItemRender` 的 context 提供 `record`、`index`、`column`、`editable`、`isEditable`、`recordKey`、`type="descriptions"`、`dependencies`、`defaultRender()`、`update(value)`。自定义输入应调用 update 回写草稿。旧 `renderFormItem(schema, context)` 兼容。

## 编辑与事件

`editable.type="single"` 同时只允许一个字段；`multiple` 允许多个字段。`editable.editableKeys` 受控时，需要在 `editable.onChange(keys, rows)` 中更新配置。

保存只校验并合入当前字段，其他编辑中的草稿不会被一并提交。`editable.onSave(key, next, origin)` 可返回 Promise；返回 `false` 或校验失败时继续编辑。取消恢复当前字段，并调用 `editable.onCancel`。`readonly` 或 `editable=false` 的字段不会进入编辑。

| 事件/回调                               | 说明                                                     |
| --------------------------------------- | -------------------------------------------------------- |
| `dataSourceChange(data)`                | 字段保存成功后回传完整记录；调用方决定持久化及更新数据源 |
| `requestError(error)`                   | 顶层记录请求失败                                         |
| `editableError(error)`                  | 编辑校验或回调异常                                       |
| `onLoadingChange(loading)`              | 请求加载状态变化                                         |
| `editable.onValuesChange(record, rows)` | 编辑草稿变化                                             |

## 插槽与实例

| 插槽                 | 参数与用途                                              |
| -------------------- | ------------------------------------------------------- |
| `title` / `extra`    | 替换标题、附加区域                                      |
| `field-${columnKey}` | `{ record, column }`，替换该字段的只读内容              |
| 默认插槽             | 追加原生 `ProDescriptions.Item` / `ProDescriptionsItem` |

`ProDescriptions.Item` 与具名 `ProDescriptionsItem` 均为原生 DescriptionsItem；默认插槽中的原生项不会自动成为可编辑 schema 字段。

| 实例方法                                  | 说明                                     |
| ----------------------------------------- | ---------------------------------------- |
| `reload(): Promise<void>`                 | 用当前 params 重新请求                   |
| `getData()` / `dataSource`                | 获取当前记录                             |
| `setDataSource(data)`                     | 替换内部记录及草稿；undefined 置为空对象 |
| `startEditable(key): boolean`             | 进入字段编辑；key 为字段标识             |
| `saveEditable(key): Promise<boolean>`     | 校验并保存字段                           |
| `cancelEditable(key)` / `isEditable(key)` | 取消编辑、检查字段状态                   |

## 样式与配置

`classes` / `styles` 支持对象或 `({ props }) => map`，直接传给原生 Descriptions，部位名遵从其语义样式 API。旧 `classNames` 兼容，同部位 `classes` 优先。

外层公开类名默认 `ant-pro-descriptions`；原生 ConfigProvider 的前缀为 `demo` 时使用 `demo-pro-descriptions`，也可通过 `prefixCls` 覆盖。语言、方向、主题算法与原生组件 token 跟随 ConfigProvider；扩展 token 通过 [ProConfigProvider](./pro-config-provider) 配置。

## FieldRender

`FieldRender` 也可具名导入，用于组合单个描述字段。它接收 `text`、`entity`（整条记录）、`action`（ProDescriptionsInstance），以及 `dataIndex`、`index`、`mode`、`valueType`、`valueEnum`、`fieldProps`、`request`、`params`、`dependencies` 和上述自定义渲染回调。`form` 为自定义编辑传入原生表单，`emptyText` 为展示占位。

编辑变化通过 `update:text` 回传；字段请求失败通过 `onFieldRequestError(error)` 通知。该组件不创建独立表单、不负责保存，也没有额外插槽或实例方法；默认渲染使用 ProField。
