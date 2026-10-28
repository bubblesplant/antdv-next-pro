---
pageClass: component-doc
---

<script setup>
import TableEnhancementsDemo from '../examples/TableEnhancementsDemo.vue'
</script>

# 表格增强

`DragSortTable`、`RowEditorTable`、`CellEditorTable` 复用 ProTable 的 schema、数据请求、原生配置与语义样式，分别提供拖拽排序、整行编辑、单元格编辑。

<ClientOnly><TableEnhancementsDemo /></ClientOnly>

<<< ../examples/TableEnhancementsDemo.vue

## 最小用法

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { DragSortTable, type ProColumns } from '@bubblesjs/antdv-next-pro'

type Task = { id: number; title: string }
const rows = ref<Task[]>([
  { id: 1, title: '整理需求' },
  { id: 2, title: '验证实现' },
])
const columns: ProColumns<Task>[] = [{ title: '任务', dataIndex: 'title' }]
</script>

<template>
  <DragSortTable
    v-model:dataSource="rows"
    row-key="id"
    :columns="columns"
    :search="false"
    :pagination="false"
  />
</template>
```

## DragSortTable

继承 [ProTable](./pro-table) 属性与 `ProTableInstance<T>`。泛型为记录类型 `T` 与请求参数类型 `P`。

| 属性/事件                                    | 说明                                                                     |
| -------------------------------------------- | ------------------------------------------------------------------------ |
| `dragSortKey`                                | 排序列 key 或 dataIndex，默认 `__dragSort`；不存在该列时在开头插入手柄列 |
| `dragSortHandlerRender`                      | `(record, index) => VNodeChild`，定制手柄内部内容                        |
| `v-model:dataSource`                         | 受控数据；调用方接收新数组后完成排序                                     |
| `defaultDataSource`                          | 非受控初始数据                                                           |
| `dragSortEnd(beforeIndex, afterIndex, rows)` | 排序完成通知，携带调整后的完整记录数组                                   |
| `dataSourceChange(rows)`                     | 数据顺序变化通知                                                         |

手柄支持拖拽和键盘上下方向键。排序事件中的下标指向当前数据源中的位置；通过分页展示时不要将其当成数据库的永久排序编号。受控模式不会绕过父组件更新数据；异步持久化由调用方在事件中处理，返回 Promise 不代表组件自动回滚。

手柄默认类名为 `ant-pro-table-drag-icon`，随原生全局前缀和组件前缀变化。

## RowEditorTable

继承 [EditableProTable](./editable-pro-table)，双击行进入编辑，焦点离开该行后等待 150ms 再校验并保存。焦点仍在同一行内移动时不会触发保存。默认 `editable.type="single"`，默认关闭新建行按钮；可用显式配置覆盖。

| 属性/事件                     | 说明                                                                       |
| ----------------------------- | -------------------------------------------------------------------------- |
| `editable`                    | 继承编辑配置：校验、onSave、onCancel、editableKeys、formRef 等             |
| `onRowEditStart(key, record)` | 进入编辑时调用                                                             |
| `onRowEditEnd(key, record)`   | 保存成功、取消或编辑 key 移除时调用                                        |
| `onRow`                       | 原生行绑定；原有双击回调先执行，调用 event.preventDefault() 可阻止自动进入 |
| `v-model:editableKeys`        | 继承受控编辑 key 回传                                                      |

`editable.onSave` 返回 `false` 或字段校验失败时保留编辑状态。`editable.formRef` 提供实际原生 `FormInstance`。`dataSource`、`value`、编辑结果回传等数据约定见 EditableProTable。

## CellEditorTable

继承 RowEditorTable 的配置和回调。双击可编辑单元格，只将当前单元格切换为输入；焦点离开单元格 150ms 后保存。双击其他单元格时先保存当前编辑，校验失败会阻止切换。

`readonly`、`editable=false`、`valueType="option"` 列不能进入单元格编辑。`column.onCell` 的原有双击回调先执行，可使用 `event.preventDefault()` 阻止激活。程序调用 `startEditable(key)` 时选择该行第一个允许编辑的字段。

## 插槽、实例与样式

三个组件转发底层表格插槽及 `ProTableInstance<T>`：请求刷新、数据读写、分页、选择，以及 `startEditable(key)`、`saveEditable(key)`、`cancelEditable(key)` 等。Row/Cell 的实例编辑方法同时维护各自的编辑生命周期回调。

列 `render` 统一为 `(dom, record, index, action, schema)`，自定义编辑使用 `formItemRender(schema, context, nativeForm)`。字段规则由原生 Form 验证。

`prefixCls`、`classes`、`styles` 沿用底层 ProTable/EditableProTable；`classes` / `styles` 接受对象或 `({ props }) => map`，旧 `classNames` 兼容。语言、RTL、原生 theme 及 Pro 扩展 token 沿用 [ProConfigProvider](./pro-config-provider) 约定。

## 使用边界

Row/Cell 自动保存依赖双击和焦点离开，可用实例方法提供显式编辑入口。150ms 是焦点缓冲时间，不是网络保存完成时间；应在 `editable.onSave` 中返回实际保存 Promise。DragSortTable 调整当前数据顺序；跨页远程排序和服务端排名由业务维护。
