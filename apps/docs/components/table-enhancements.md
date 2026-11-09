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

## DragSortTable {#drag-sort-table}

复用 ProTable 的记录类型 `T` 与请求参数类型 `P`。手柄支持拖拽和键盘上下方向键；受控模式由父组件接收新数组后完成重排。

### 属性 {#drag-props}

| 属性                    | 类型                                                                            | 默认值            | 说明与来源                                                                                                                                                |
| ----------------------- | ------------------------------------------------------------------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dragSortKey`           | `string`                                                                        | `__dragSort`      | 排序列 key 或 dataIndex；列不存在时在最前插入手柄列。                                                                                                     |
| `dragSortHandlerRender` | `(record: T, index: number) => VNodeChild`                                      | `默认拖拽图标`    | 自定义手柄内部内容，拖拽与键盘行为仍由外层手柄提供。                                                                                                      |
| `onDragSortEnd`         | `(beforeIndex: number, afterIndex: number, rows: T[]) => void \| Promise<void>` | —                 | 排序完成回调；与 drag-sort-end 为同一监听通道。                                                                                                           |
| `onDataSourceChange`    | `(rows: T[]) => void`                                                           | —                 | 顺序变化通知；与 data-source-change 为同一监听通道。                                                                                                      |
| `dataSource`            | `T[]`                                                                           | —                 | 受控数据，使用 v-model:data-source 接收重新排序后的完整数组。                                                                                             |
| `defaultDataSource`     | `T[]`                                                                           | `[]`              | 非受控初始数据。                                                                                                                                          |
| `其余属性`              | `ProTableProps<T, P>`                                                           | `ProTable 默认值` | 全部继承 [ProTable 属性表](./pro-table#props) 与[列属性](./pro-table#columns)，原生透传项见 [Table API](https://www.antdv-next.com/components/table-cn)。 |

### 事件 {#drag-events}

| 事件 / 回调          | 参数                                                 | 说明与来源                                       |
| -------------------- | ---------------------------------------------------- | ------------------------------------------------ |
| `update:data-source` | `rows: T[]`                                          | 重排数据双向绑定更新。                           |
| `drag-sort-end`      | `beforeIndex: number, afterIndex: number, rows: T[]` | 对应 onDragSortEnd，索引为当前完整数据源的位置。 |
| `data-source-change` | `rows: T[]`                                          | 对应 onDataSourceChange，重排后的完整数据。      |
| `其他 ProTable 事件` | `保持参数`                                           | 转发 [ProTable 事件](./pro-table#events)。       |

事件索引是当前数据源位置，分页后不可视为数据库永久排序编号。异步持久化在业务回调中处理，返回 Promise 不会自动回滚。默认手柄类名 `ant-pro-table-drag-icon` 随全局或组件前缀变化。

## RowEditorTable {#row-editor-table}

双击行进入编辑，焦点离开该行 150ms 后校验并保存；行内移动焦点不保存。`editable.onSave` 返回 false 或校验失败时保留编辑。

### 属性 {#row-props}

| 属性                 | 类型                               | 默认值               | 说明与来源                                                                                                                                                    |
| -------------------- | ---------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dataSource`         | `T[]`                              | —                    | value 的别名，支持 v-model:data-source；value 同时存在时优先。                                                                                                |
| `defaultDataSource`  | `T[]`                              | `[]`                 | defaultValue 的别名；defaultValue 优先。                                                                                                                      |
| `onRowEditStart`     | `(key: ProKey, record: T) => void` | —                    | 进入编辑通知，可用 @row-edit-start 监听。                                                                                                                     |
| `onRowEditEnd`       | `(key: ProKey, record: T) => void` | —                    | 成功保存、取消或移除编辑 key 后通知，可用 @row-edit-end。                                                                                                     |
| `editable`           | `false \| EditableConfig<T>`       | `{ type: 'single' }` | 全部配置见 [editable](./pro-table#editable)，包括 onSave/onCancel/formProps/formRef。                                                                         |
| `recordCreatorProps` | `false \| RecordCreatorProps<T>`   | `false`              | 默认隐藏创建按钮，可显式开启，见[创建行配置](./editable-pro-table#record-creator)。                                                                           |
| `onRow`              | `TableProps<T>['onRow']`           | —                    | 原生 [Table 行绑定](https://www.antdv-next.com/components/table-cn)；原回调先执行，可 preventDefault 阻止自动激活。                                           |
| `其余属性`           | `EditableProTableProps<T, P>`      | `继承`               | 全部 [EditableProTable 属性](./editable-pro-table#props) 继续有效，包括 value/defaultValue/editableKeys/maxLength/formItemProps；search/pagination 固定关闭。 |

### 事件与回调 {#row-events}

| 事件 / 回调                       | 参数                     | 说明与来源                                                  |
| --------------------------------- | ------------------------ | ----------------------------------------------------------- |
| `update:data-source`              | `rows: T[]`              | 表格值变化，支持数据别名双向绑定。                          |
| `update:editable-keys`            | `keys: ProKey[]`         | 编辑 key 回传。                                             |
| `row-edit-start / onRowEditStart` | `key: ProKey, record: T` | 自动或实例方法进入编辑。                                    |
| `row-edit-end / onRowEditEnd`     | `key: ProKey, record: T` | 成功保存、取消或编辑 key 移除。                             |
| `其他 EditableProTable 事件`      | `保持参数`               | 见 [EditableProTable 事件表](./editable-pro-table#events)。 |

`onRowEditStart` 与 `@row-edit-start`（以及 end 对应写法）各是同一条 Vue 监听，任选一种。

## CellEditorTable {#cell-editor-table}

双击可编辑单元格，只将当前单元格切换为输入；焦点离开单元格 150ms 后保存。切换单元格前先保存当前项，校验失败会阻止切换。

### 属性 {#cell-props}

| 属性               | 类型                                                     | 默认值              | 说明与来源                                                                                                         |
| ------------------ | -------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------ |
| 全部属性           | `CellEditorTableProps<T, P> = RowEditorTableProps<T, P>` | 继承 RowEditorTable | 没有新增属性；逐项见 [RowEditorTable 属性](#row-props) 和 [EditableProTable 属性](./editable-pro-table#props)。    |
| `columns[].onCell` | `TableColumnType<T>['onCell']`                           | —                   | 原生 [Column 绑定](https://www.antdv-next.com/components/table-cn)，原双击回调先执行，可 preventDefault 阻止激活。 |

### 事件与回调 {#cell-events}

| 事件 / 回调                       | 参数                     | 说明与来源                                                  |
| --------------------------------- | ------------------------ | ----------------------------------------------------------- |
| `update:data-source`              | `rows: T[]`              | 表格值变化，支持数据别名双向绑定。                          |
| `update:editable-keys`            | `keys: ProKey[]`         | 编辑 key 回传。                                             |
| `row-edit-start / onRowEditStart` | `key: ProKey, record: T` | 自动或实例方法进入编辑。                                    |
| `row-edit-end / onRowEditEnd`     | `key: ProKey, record: T` | 成功保存、取消或编辑 key 移除。                             |
| `其他 EditableProTable 事件`      | `保持参数`               | 见 [EditableProTable 事件表](./editable-pro-table#events)。 |

`readonly`、`editable=false` 或 `valueType="option"` 的列不可编辑。实例 `startEditable(key)` 选择该行第一个允许编辑的字段。

## 插槽 {#slots}

| 组件                                 | 插槽与参数来源                                                                                                                                   |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `DragSortTable`                      | 全部透传 [ProTable 插槽表](./pro-table#slots)，包括 toolbar-actions、动态表头/单元格、before-table/after-table 和原生 Table 插槽；没有新增插槽。 |
| `RowEditorTable` / `CellEditorTable` | 全部透传 [EditableProTable 插槽表](./editable-pro-table#slots)，包括 creator-button 和所有 ProTable 插槽；没有新增插槽。                         |

## 组件实例 {#instance}

| 组件 / 方法                          | 返回值                | 行为与来源                                                                       |
| ------------------------------------ | --------------------- | -------------------------------------------------------------------------------- |
| `DragSortTable`                      | `ProTableInstance<T>` | 完整继承 [ProTable 实例方法表](./pro-table#instance)，没有新增方法。             |
| `RowEditorTable` / `CellEditorTable` | `ProTableInstance<T>` | 完整方法及参数见 [ProTable 实例表](./pro-table#instance)，以下三项协调编辑通知。 |
| `startEditable(key: ProKey)`         | `boolean`             | 进入整行/首个可编辑单元格并通知 onRowEditStart。                                 |
| `saveEditable(key: ProKey)`          | `Promise<boolean>`    | 校验保存；成功时通知 onRowEditEnd，失败保留编辑。                                |
| `cancelEditable(key: ProKey)`        | `void`                | 取消恢复并通知 onRowEditEnd。                                                    |

## 配置与样式

`prefixCls/classes/styles` 与原生主题均继承 [ProTable](./pro-table#props)；扩展 token、语言和 RTL 见 [ProConfigProvider](./pro-config-provider)。列 render、formItemRender、fieldProps、formItemProps 的完整签名和原生属性链接见 [ProColumns](./pro-table#columns)。

自动保存的 150ms 为焦点缓冲时间。网络保存应在 `editable.onSave` 中返回实际 Promise；跨页排序和服务端排名由业务维护。
