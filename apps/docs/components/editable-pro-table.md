---
pageClass: component-doc
---

<script setup>
import EditableProTableDemo from '../examples/EditableProTableDemo.vue'
</script>

# EditableProTable

`EditableProTable` 复用 `ProTable` 的列模型、编辑状态机和校验逻辑，面向“整张表就是一个表单字段”的场景。它默认关闭搜索、分页、工具选项和窗口聚焦刷新。

## 何时使用

- 需要在表格中连续新增、修改或删除多条记录，并把整张表作为一个受控值提交。
- 需要复用 `ProTable` 的列配置、校验和插槽，同时默认关闭查询、分页等浏览型能力。
- 只编辑单条记录、且仍以查询浏览为主时，可以直接使用 `ProTable` 的内建编辑能力。

## 示例

### 受控编辑、新建记录与组件实例

<ClientOnly>
  <EditableProTableDemo />
</ClientOnly>

<details class="demo-source">
  <summary>查看完整代码</summary>

<<< ../examples/EditableProTableDemo.vue

</details>

### 受控数据与编辑状态

`v-model:value` 是完整数据的唯一受控入口，不再提供语义冲突的 `dataSource`。`defaultValue` 可提供非受控初始值。

```vue
<EditableProTable
  v-model:value="members"
  v-model:editable-keys="editableKeys"
  :columns="columns"
  :editable="{ type: 'multiple', onSave, onDelete }"
  :record-creator-props="recordCreatorProps"
  row-key="id"
/>
```

`editable.type` 可设为 `single` 或 `multiple`。`onSave`、`onCancel`、`onDelete` 支持 Promise；保存或删除返回 `false` 时保持当前编辑/数据状态。列级 `editable` 可根据记录决定是否允许编辑。

### 校验与生命周期

校验规则放在列的 `formItemProps.rules`：

```ts
const columns: ProColumns<Member>[] = [
  {
    title: '姓名',
    dataIndex: 'name',
    valueType: 'text',
    formItemProps: {
      rules: [{ required: true, message: '请输入姓名' }],
    },
  },
]

const editable: EditableConfig<Member> = {
  type: 'multiple',
  async onSave(key, record, origin) {
    await api.save(record)
  },
  async onDelete(key, record) {
    await api.remove(record.id)
    return true
  },
}
```

校验不通过时 `saveEditable` 返回 `false`；生命周期抛错会触发 `editable-error`。`formItemProps` Prop 则用于将整个 EditableProTable 包装为一个 Antdv Next FormItem，方便嵌入外层表单。

### 新建记录

```ts
const recordCreatorProps: RecordCreatorProps<Member> = {
  record: () => ({
    id: crypto.randomUUID(),
    name: '',
  }),
  position: 'bottom',
  parentKey: undefined,
  newRecordType: 'dataSource',
  creatorButtonText: '添加成员',
}
```

| 字段                | 说明                                              |
| ------------------- | ------------------------------------------------- |
| `record`            | 记录对象或每次创建时执行的工厂函数                |
| `position`          | `top` / `bottom`，默认底部                        |
| `parentKey`         | 树形数据的新记录父节点                            |
| `newRecordType`     | `dataSource` 立即写入模型；`cache` 保存成功后写入 |
| `creatorButtonText` | 创建按钮文本                                      |

每条新记录必须产生唯一 `rowKey`。`maxLength` 按展开后的树形记录总数计算；达到上限后隐藏创建按钮，通过 ref 调用 `addEditRecord` 时也会遵守该限制。

### 共用字段核心与 FormItem 边界

EditableProTable 不维护单独的字段映射，而是通过 ProTable 复用 [ProFormFields](/components/pro-form-fields) 的裸控件核心。`treeSelect`、`slider`、`segmented` 可和既有 `valueType` 一样用于可编辑列；checked 型字段和异步选项也使用同一套 `v-model`、竞态与错误处理。

列级 `formItemProps` 只提供单元格校验和字段配置，不创建嵌套 FormItem。组件根级的 `formItemProps` 则只负责把整张 EditableProTable 包装为一个外层 FormItem，二者职责不会交叉。自定义编辑器仍使用列级 `renderFormItem`，并通过 `context.update(value)` 写回草稿。

## API

### 属性 {#props}

| 属性                 | 类型                                                                            | 默认值               | 说明与来源                                                                                                                                                 |
| -------------------- | ------------------------------------------------------------------------------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `value`              | `T[]`                                                                           | —                    | 整表受控数据；使用 `v-model:value` 接收草稿、保存、新增和删除的更新。                                                                                      |
| `defaultValue`       | `T[]`                                                                           | `[]`                 | 非受控初始数据。                                                                                                                                           |
| `recordCreatorProps` | `false \| RecordCreatorProps<T>`                                                | `{}`                 | 创建按钮及新记录配置，见[创建行配置](#record-creator)；false 隐藏按钮。                                                                                    |
| `maxLength`          | `number`                                                                        | —                    | 最大记录数，包括树形子节点；同时约束创建按钮和 addEditRecord。                                                                                             |
| `formItemProps`      | `Record<string, unknown>`                                                       | —                    | 将整张表包成外层 FormItem；详细属性、事件与插槽见 [FormItem API](https://www.antdv-next.com/components/form-cn#form-item-props)，与列 formItemProps 不同。 |
| `onValuesChange`     | `(values: T[], changedRecord: T) => void`                                       | —                    | 整表变化回调，与 values-change 为同一监听通道。                                                                                                            |
| `onTableChange`      | `(pagination: ProTablePagination, filters: ProFilter, sorter: ProSort) => void` | —                    | 表格状态回调，与 table-change 为同一监听通道。                                                                                                             |
| `columns`            | `ProColumns<T>[]`                                                               | `必填`               | 完整字段见 [ProTable 列属性](./pro-table#columns)。                                                                                                        |
| `editable`           | `false \| EditableConfig<T>`                                                    | `{ type: 'single' }` | 见 [editable 全部配置](./pro-table#editable)，包括 onSave/onDelete/formProps/formRef；false 关闭编辑。                                                     |
| `editableKeys`       | `ProKey[]`                                                                      | —                    | 编辑行 key，使用 `v-model:editable-keys`；优先于 editable.editableKeys。                                                                                   |
| `options`            | `false \| ProTableOptions<T>`                                                   | `false`              | 默认关闭内置工具，可显式开启，完整配置见 [ProTable options](./pro-table#options)。                                                                         |
| `toolbar`            | `false \| ProTableToolbarConfig`                                                | —                    | 默认不主动开启工具栏；有标题/操作/显式配置时显示，见 [toolbar](./pro-table#toolbar)。                                                                      |

其余属性完整继承 [ProTable 属性表](./pro-table#props)，列配置见 [ProColumns](./pro-table#columns)，底层 Table 属性见 [antdv-next Table API](https://www.antdv-next.com/components/table-cn)。`dataSource/defaultDataSource/search/pagination` 被公开类型移除；数据使用 `value/defaultValue`，搜索和分页在实现中固定关闭。`request/params/postData/polling/manualRequest/revalidateOnFocus/rowSelection/columnsState/scroll/size/bordered` 等继续按 ProTable 约定工作。

### 创建行 RecordCreatorProps {#record-creator}

| 属性                | 类型                                           | 默认值           | 说明与来源                                                                                                                                  |
| ------------------- | ---------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `record`            | `T \| ((index: number, dataSource: T[]) => T)` | `自动生成 key`   | 新行对象或每次新增时执行的工厂；应产生唯一 rowKey。                                                                                         |
| `position`          | `'top' \| 'bottom'`                            | `bottom`         | 创建按钮和新记录位置。                                                                                                                      |
| `parentKey`         | `ProKey`                                       | —                | 树形新记录的父节点 key。                                                                                                                    |
| `newRecordType`     | `'cache' \| 'dataSource'`                      | `dataSource`     | cache 在保存成功后写入模型；dataSource 立即加入模型。                                                                                       |
| `creatorButtonText` | `VNodeChild`                                   | `语言配置`       | 默认“添加一行数据”，可由 creator-button 插槽替换。                                                                                          |
| `ButtonProps`       | `Omit<ButtonProps, 'onClick' \| 'position'>`   | `block + dashed` | 其他属性传给创建按钮，见 [Button API](https://www.antdv-next.com/components/button-cn)，如 disabled/loading/icon/size；点击逻辑由表格管理。 |

### 事件 {#events}

| 事件                   | 参数                                                                  | 说明                                        |
| ---------------------- | --------------------------------------------------------------------- | ------------------------------------------- |
| `update:value`         | `rows: T[]`                                                           | 完整数据更新（包含编辑草稿）。              |
| `update:editable-keys` | `keys: ProKey[]`                                                      | 编辑 key 更新。                             |
| `values-change`        | `rows: T[], changedRecord: T`                                         | 整表值变化，与 onValuesChange 是同一监听。  |
| `table-change`         | `pagination: ProTablePagination, filters: ProFilter, sorter: ProSort` | 表格状态变化，与 onTableChange 是同一监听。 |
| `request-error`        | `error: unknown`                                                      | 请求失败。                                  |
| `editable-error`       | `error: unknown`                                                      | 编辑生命周期抛错。                          |

`onValuesChange` / `@values-change`、`onTableChange` / `@table-change` 各自是同一条 Vue 监听通道，请各选一种写法。其余底层通知（如 `load`、`selection-change`、`validation-error`）见 [ProTable 事件](./pro-table#events)；底层 `change` 在此被适配为 `table-change`。

### 插槽 {#slots}

| 插槽                 | 参数         | 说明与来源                                                                                                                                                                       |
| -------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `creator-button`     | `无`         | 替换新增按钮内容。                                                                                                                                                               |
| `before-table`       | `无`         | 保留调用方前置内容，随后渲染顶部创建按钮。                                                                                                                                       |
| `after-table`        | `无`         | 底部创建按钮之后追加内容。                                                                                                                                                       |
| `其他 ProTable 插槽` | `保持原参数` | 全部透传，见 [ProTable 插槽表](./pro-table#slots)，包括 toolbar-title/toolbar-actions、动态表头与单元格，以及原生 [Table 插槽](https://www.antdv-next.com/components/table-cn)。 |

### 组件实例 EditableProTableInstance {#instance}

| 方法                                                                        | 返回值                                 | 说明                                                                      |
| --------------------------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------- |
| `getSortFilter()`                                                           | `{ sort: ProSort; filter: ProFilter }` | 读取排序和筛选。                                                          |
| `reload(resetPageIndex?: boolean)`                                          | `Promise<void>`                        | 重新请求，可选重置页码。                                                  |
| `reset()`                                                                   | `Promise<void>`                        | 重置查询、排序、筛选。                                                    |
| `setPageInfo(page: Partial<ProTablePagination>)`                            | `void`                                 | 透传 ProTable 分页状态设置；本组件不显示分页。                            |
| `clearSelected()`                                                           | `void`                                 | 清空选择。                                                                |
| `fullScreen()`                                                              | `Promise<void>`                        | 切换全屏。                                                                |
| `scrollTo(target: ProKey \| { key: ProKey } \| { top: number })`            | `void`                                 | 定位行或滚动像素。                                                        |
| `startEditable(key: ProKey)`                                                | `boolean`                              | 进入行编辑。                                                              |
| `saveEditable(key: ProKey)`                                                 | `Promise<boolean>`                     | 校验并保存，失败返回 false。                                              |
| `cancelEditable(key: ProKey)`                                               | `void`                                 | 取消并恢复原值。                                                          |
| `addEditRecord(record: T, options?: Omit<RecordCreatorProps<T>, 'record'>)` | `boolean`                              | 创建并进入编辑，遵循 maxLength，options 见[创建行配置](#record-creator)。 |
| `getRowData(indexOrKey: number \| ProKey)`                                  | `T \| undefined`                       | 数字先按精确 rowKey 查找，再回退为顶层索引。                              |
| `getRowsData()`                                                             | `T[]`                                  | 读取当前完整数据。                                                        |
| `setRowData(indexOrKey: number \| ProKey, value: Partial<T>)`               | `boolean`                              | 按同样 key/索引规则找到记录后浅合并，并更新 value。                       |

```ts
const editableRef = ref<EditableProTableInstance<Member>>()

editableRef.value?.startEditable(memberId)
const first = editableRef.value?.getRowData(0)
const all = editableRef.value?.getRowsData()
editableRef.value?.setRowData(memberId, { allocation: 100 })
```
