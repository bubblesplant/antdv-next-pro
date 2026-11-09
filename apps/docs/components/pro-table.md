---
pageClass: component-doc
---

<script setup>
import ProTableDemo from '../examples/ProTableDemo.vue'
</script>

# ProTable

`ProTable` 面向查询和浏览场景，统一管理本地/远程数据、搜索、分页、排序、筛选、列状态、选择和行编辑。

## 何时使用

当页面需要围绕表格统一组织查询、数据加载、分页、列设置、选择或行编辑时使用。

## 示例

### 综合示例

<ClientOnly>
  <ProTableDemo />
</ClientOnly>

<details class="demo-source">
<summary>查看完整代码</summary>

<<< ../examples/ProTableDemo.vue

</details>

### 数据模式

本地模式传入 `dataSource` 或 `defaultDataSource`。搜索、排序、筛选和分页会直接作用于本地数据：

```vue
<ProTable
  v-model:data-source="rows"
  :columns="columns"
  row-key="id"
  :pagination="{ defaultPageSize: 20 }"
/>
```

远程模式使用固定请求契约：

```ts
import type { ProRequest } from '@bubblesjs/antdv-next-pro'

const request: ProRequest<User, Query> = async (params, sort, filter) => {
  const result = await api.list({ ...params, sort, filter })
  return {
    data: result.items,
    total: result.total,
    success: true,
  }
}
```

搜索、分页、排序、筛选和外部 `params` 变化都会进入同一请求。并发请求只接纳最后发起的结果；请求抛错时保留当前数据、结束 loading，并触发 `request-error`。返回 `success: false` 的结果不会覆盖数据。

`manualRequest` 可阻止首次自动请求，之后通过组件 ref 的 `reload()` 发起。`postData` 在展示前同步转换成功数据。

分页器默认使用 `small` 尺寸，并显示当前范围和总条数，例如“第 1-3 条/总共 6 条”，文案跟随国际化配置。传入 `pagination.showTotal` 函数可自定义文案，显式传入 `{ showTotal: undefined }` 可隐藏统计文案。游标分页不展示总条数。

### 搜索区与折叠

默认折叠按钮沿用 ProComponents 的实现：复用同一个向下箭头，展开时旋转半圈，并以 0.3 秒过渡切换方向。文案遵循国际化及 `localeText`。`search.collapseRender` 可自定义按钮内容，设为 `false` 可隐藏按钮。

`search: false` 关闭查询区。默认情况下，包含 `dataIndex` 且没有 `hideInSearch` / `search: false` 的列会生成搜索项；`search.transform` 可将一个字段转换为多个请求参数。

```ts
const columns = [
  {
    title: '最低分',
    dataIndex: 'score',
    valueType: 'digit',
    search: {
      transform: (value) => ({ minScore: value }),
    },
  },
]
```

非受控折叠只需设置初始值：

```vue
<ProTable :search="{ defaultCollapsed: true, span: 8, labelWidth: 'auto' }" />
```

受控折叠使用 `collapsed` 和 `search-collapse`：

```vue
<ProTable
  :search="{ collapsed, span: 8, searchText: '筛选', resetText: '清空' }"
  @search-collapse="collapsed = $event"
/>
```

未设置 `span` 时，查询区随容器宽度展示 1、2 或 3 列。数字跨度保持固定列数；也支持 `{ xs: 24, md: 12, xl: 8 }` 这类响应式配置，省略的断点沿用前一个已配置值，与 Ant Design Col 一致。折叠时仅保留首行。也可通过 `search.onCollapse(next)` 接收状态变化。

### 工具栏搜索与卡片布局

查询区位于表格卡片上方；工具栏、表格和分页共享同一张卡片。两个区域都复用 [ProCard](./pro-card)，背景、圆角与内边距沿用 Card 主题，支持深色主题及 Card token 覆盖。`toolbar: false` 隐藏工具栏。

`cardProps` 配置表格卡片，`styles` 支持语义对象及 `({ props }) => 语义对象`，函数接收实际 ProCard 属性。内容样式按默认留白、`bodyStyle`、`styles.body` 的顺序合并。`variant` 优先于兼容属性 `bordered`；显式 `cardBordered.table`（或布尔 `cardBordered`）优先于这两项。`options: false` 且没有标题或操作时不显示空工具栏；关闭工具栏时默认清除表格卡片内容留白。

设置 `options.search` 可在工具栏开启关键词搜索；即使 `search: false` 关闭查询表单，关键词搜索仍然可用：

```vue
<ProTable
  :columns="columns"
  :request="request"
  :search="false"
  :options="{ search: { name: 'keyword', placeholder: '搜索用户' } }"
/>
```

远程模式把关键词写入 `request` 的第一个参数，默认参数名为 `keyword`，提交后回到第一页；清空搜索或重置会移除参数。本地模式按列的原始字段值匹配关键词。远程模式下，后端或示例请求函数需要实现实际筛选和分页。

`toolbar.search` 支持同样配置，并优先于 `options.search`；可传入 Antdv Next `InputSearch` 的属性，或用 `true` 开启默认搜索。`onSearch(value)` 可以返回 `false` 或 `Promise<false>` 阻止本次搜索。标题存在时搜索框位于右侧操作区，否则位于工具栏左侧。

自定义操作按钮推荐使用 `#toolbar-actions="{ action, selectedRows }"` 作用域插槽：`action` 提供 `reload()`、`reset()`、`clearSelected()` 等表格方法，`selectedRows` 为当前选中行。也支持 `toolBarRender(action, rows)` 回调，优先级为插槽、`toolBarRender`、`toolbar.actions`。自定义按钮不会覆盖内置工具按钮；`toolbar=false` 或 `toolBarRender=false` 会隐藏整个工具栏。

操作区默认使用 Flex 布局，垂直居中、右对齐，按钮间距为 `8px`，空间不足时自动换行。插槽内可直接放多个按钮；自行添加包裹容器时，其内部布局由调用方控制。

组件 ref 的 `getSortFilter()` 返回当前 `{ sort, filter }` 的副本；修改返回值不会影响内部状态。`EditableProTable` 也提供同名方法。

### 列状态与列设置

工具栏的列设置使用原生 `Popover`，支持列显隐（含操作列）、全选、重置和同一分组内拖动排序；聚焦拖动手柄后也可用上下方向键调整顺序。重置会恢复 `columnsState.defaultValue`，未配置时恢复列定义。密度按钮通过 `Popover` 提供“宽松 / 中等 / 紧凑”选项，并标记当前选项。

列状态也可由 `columnsState` 中每个列 key（优先使用列 `key`，否则使用 `dataIndex`）对应的 `show`、`order`、`fixed` 编程控制：

```ts
const columnsState = ref<Record<string, ProColumnsState>>({
  name: { show: true, order: 10, fixed: 'left' },
  status: { show: true, order: 20 },
  actions: { show: true, order: 30, fixed: 'right' },
})

const tableColumnsState = computed<ProColumnsStateConfig>(() => ({
  value: columnsState.value,
  onChange: (next) => {
    columnsState.value = next
  },
  persistenceKey: 'users-table-columns',
  persistenceType: 'localStorage',
}))
```

```vue
<ProTable :columns-state="tableColumnsState" />
```

完全受控时将 `value` 与 `onChange` 配对；非受控初值使用 `defaultValue`。设置 `persistenceKey` 后，状态可写入 `localStorage` 或 `sessionStorage`，包括面板产生的 `show`、`order` 变化以及编程设置的 `fixed`。

### ProTable 内建编辑

`ProTable` 自身即可使用与 `EditableProTable` 相同的编辑状态机：

```vue
<ProTable
  v-model:data-source="rows"
  v-model:editable-keys="editableKeys"
  :columns="columns"
  :editable="{
    type: 'multiple',
    onSave: saveRow,
    onCancel: cancelRow,
    onDelete: deleteRow,
  }"
/>
```

列上的 `editable` 可按记录控制；`formItemProps.rules` 提供异步或同步校验；`renderFormItem(column, context)` 可自定义编辑器，并通过 `context.update(nextValue)` 写入共享编辑状态、触发 EditableProTable 的实时 `v-model:value`。没有 `valueType: 'option'` 列时，组件会自动补充操作列。

`editable.actionRender(record, actions)` 可完全替换默认操作区。`actions.editing` 表示当前行状态；未编辑时调用 `actions.start()`，编辑中可使用 `save()`、`cancel()` 和 `remove()`。

`addEditRecord(record, { position, parentKey, newRecordType })` 支持顶部/底部创建、树形 `parentKey` 以及 cache/dataSource 两种新记录策略。新记录必须具有唯一 `rowKey`。

### 共用字段核心

搜索区、可编辑单元格和独立 [ProFormFields](/components/pro-form-fields) 使用同一字段注册表、选项请求和只读格式化逻辑：

- 搜索项使用表单项模式，列级 `dataIndex` / `title` 生成的 `name` / `label` 会覆盖 `formItemProps` 中的同名值。
- 可编辑单元格使用 `fieldMode="field"` 对应的裸控件能力，校验仍由列级 `formItemProps.rules` 执行，不会嵌套第二个 FormItem。
- `select`、`treeSelect`、`radio`、`checkbox`、`segmented` 的异步选项只接纳最后一次请求；空远程结果有效，失败时调用 `onFieldRequestError(error)` 并保留现有选项。

`valueType` 现支持 `treeSelect`、`slider`、`segmented`。Captcha 与两个 Upload 是独立 ProFormFields，不提供列 `valueType` 映射。

需要完全自定义搜索项或编辑器时继续使用 `renderFormItem(column, context)`；需要自定义只读单元格时使用列插槽或 `render`。这些入口的优先级和 `context.update(value)` 协议不变。

## API

`T` 为记录类型，`P` 为请求参数类型，`ProKey = string | number`，`ProDataIndex = ProKey | readonly ProKey[]`。表内默认值为组件的实际回退值，`—` 表示未设置。

### 属性 {#props}

| 属性                     | 类型                                                               | 默认值              | 说明与来源                                                                                            |
| ------------------------ | ------------------------------------------------------------------ | ------------------- | ----------------------------------------------------------------------------------------------------- |
| `columns`                | `ProColumns<T>[]`                                                  | `必填`              | 表格、搜索和编辑共用的[列配置](#columns)。                                                            |
| `dataSource`             | `T[]`                                                              | —                   | 受控数据，使用 `v-model:data-source` 接收更新。                                                       |
| `defaultDataSource`      | `T[]`                                                              | `[]`                | 非受控初始数据。                                                                                      |
| `request`                | `ProRequest<T, P>`                                                 | —                   | 异步数据源，签名与结果见[请求协议](#request)。                                                        |
| `params`                 | `P`                                                                | —                   | 额外请求参数；变化后重置页码并重新请求。                                                              |
| `postData`               | `(data: T[]) => T[]`                                               | —                   | 接纳数据后的同步加工函数。                                                                            |
| `rowKey`                 | `keyof T \| string \| ((record: T) => ProKey)`                     | `id`                | 唯一行标识，树形数据每一层均须唯一。                                                                  |
| `loading`                | `TableProps<T>['loading']`                                         | `false`             | 外部加载状态，与请求状态合并；支持 [Spin 配置](https://www.antdv-next.com/components/spin-cn)。       |
| `headerTitle`            | `VNodeChild`                                                       | —                   | 工具栏标题，`toolbar.title` 优先。                                                                    |
| `tooltip`                | `string \| TooltipProps`                                           | —                   | 标题提示，配置见 [Tooltip API](https://www.antdv-next.com/components/tooltip-cn)。                    |
| `form`                   | `ProTableSearchForm<T>`                                            | —                   | 搜索表单原生属性及扩展，见[搜索表单](#form)。                                                         |
| `formRef`                | `Ref<SchemaFormInstance<T> \| undefined>`                          | —                   | 取得实际搜索表单实例，方法见 [SchemaForm](./schema-form#instance)。                                   |
| `onSubmit`               | `(params: P) => void`                                              | —                   | 搜索提交回调，得到格式化后的参数。                                                                    |
| `onReset`                | `() => void`                                                       | —                   | 重置查询时调用。                                                                                      |
| `onLoadingChange`        | `(loading: boolean) => void`                                       | —                   | 合并后的 loading 布尔状态变化回调。                                                                   |
| `beforeSearchSubmit`     | `(params: Record<string, unknown>) => Record<string, unknown>`     | —                   | 搜索参数发出前转换。                                                                                  |
| `dateFormatter`          | `'string' \| 'number' \| false \| ((value, valueType) => unknown)` | `string`            | 控制搜索参数中的日期格式；`false` 保留日期对象。                                                      |
| `debounceTime`           | `number`                                                           | `10`                | 搜索提交防抖，单位毫秒。                                                                              |
| `search`                 | `false \| ProTableSearchConfig<T>`                                 | `{}`                | 查询区配置；`false` 关闭，详见[search](#search)。                                                     |
| `pagination`             | `false \| ProTablePagination`                                      | `{}`                | 分页配置，详见[pagination](#pagination)。                                                             |
| `options`                | `false \| ProTableOptions<T>`                                      | `{}`                | 内置工具配置，详见[options](#options)。                                                               |
| `toolbar`                | `false \| ProTableToolbarConfig`                                   | —                   | 工具栏配置，详见[toolbar](#toolbar)；`false` 隐藏整个工具栏。                                         |
| `toolBarRender`          | `false \| ((action, rows) => VNodeChild)`                          | —                   | 替换操作按钮，`rows` 为选中行；`false` 隐藏整个工具栏。                                               |
| `optionsRender`          | `(props, defaults: VNodeChild[]) => VNodeChild`                    | —                   | 定制内置工具节点。                                                                                    |
| `tableRender`            | `(props, dom, domList) => VNodeChild`                              | —                   | 包裹工具栏、选择提示和表格；`domList={ toolbar, alert, table }`。                                     |
| `tableViewRender`        | `(props, dom: VNodeChild) => VNodeChild`                           | —                   | 替换纯表格视图；`props` 包含当前显示数据与有效配置。                                                  |
| `ErrorBoundary`          | `false \| Component`                                               | `内置`              | 表格区错误边界；`false` 关闭，可传自定义组件。                                                        |
| `tableExtraRender`       | `(props, rows: T[]) => VNodeChild`                                 | —                   | 搜索区之后、表格卡片之前追加内容。                                                                    |
| `searchFormRender`       | `(props, dom: VNodeChild) => VNodeChild`                           | —                   | 包裹或替换搜索区。                                                                                    |
| `tableAlertRender`       | `false \| ((context) => VNodeChild)`                               | `内置`              | 选择提示；context 为 `{ selectedRowKeys, selectedRows, onCleanSelected }`。                           |
| `tableAlertOptionRender` | `false \| ((context) => VNodeChild)`                               | `内置清除`          | 选择提示操作，与 `tableAlertRender` 使用相同 context。                                                |
| `cardProps`              | `false \| ProCardProps`                                            | —                   | 表格外层 [ProCard 属性](./pro-card#props)，`false` 使用无卡片视觉。                                   |
| `cardBordered`           | `boolean \| { search?: boolean; table?: boolean }`                 | `false`             | 分别控制搜索/表格卡片边框；显式 table 配置优先于 `cardProps.variant/bordered`。                       |
| `tableClassName`         | `string`                                                           | —                   | 底层 Table 的 class，外层 class 用组件 `class`。                                                      |
| `tableStyle`             | `CSSProperties`                                                    | —                   | 底层 Table 的 style，外层样式用组件 `style`。                                                         |
| `classes`                | `TableProps<T>['classes']`                                         | —                   | 原生 Table 语义 class，见 [Table API](https://www.antdv-next.com/components/table-cn)。               |
| `styles`                 | `TableProps<T>['styles']`                                          | —                   | 原生 Table 语义样式，支持对象及回调，见 [Table API](https://www.antdv-next.com/components/table-cn)。 |
| `localeText`             | `Partial<ProTableLocaleText>`                                      | `继承语言`          | 覆盖内置工具及搜索文案，详见[localeText](#locale-text)。                                              |
| `rowSelection`           | `false \| ProTableRowSelection<T>`                                 | —                   | 行选择，详见[选择与滚动](#selection)。                                                                |
| `polling`                | `number \| ((data: T[]) => number \| false)`                       | —                   | 轮询毫秒间隔，实际最小为 2000ms；函数可返回 `false` 暂停，页面隐藏时暂停。                            |
| `revalidateOnFocus`      | `boolean`                                                          | `false`             | 窗口重新聚焦时重新请求。                                                                              |
| `manualRequest`          | `boolean`                                                          | `false`             | 跳过首次自动请求，使用实例 `reload()` 触发。                                                          |
| `columnsState`           | `ProColumnsStateConfig`                                            | —                   | 列显隐、排序、固定与持久化，见[columnsState](#columns-state)。                                        |
| `editable`               | `false \| EditableConfig<T>`                                       | —                   | 编辑状态及生命周期，详见[editable](#editable)。                                                       |
| `editableKeys`           | `ProKey[]`                                                         | —                   | 受控编辑行，支持 `v-model:editable-keys`，优先于 `editable.editableKeys`。                            |
| `scroll`                 | `{ x?: number \| string \| true; y?: number \| string }`           | —                   | 原生 [Table 滚动配置](https://www.antdv-next.com/components/table-cn)，见[选择与滚动](#selection)。   |
| `size`                   | `'small' \| 'middle' \| 'large'`                                   | `继承，否则 middle` | 表格密度，可通过工具栏切换。                                                                          |
| `bordered`               | `boolean`                                                          | `false`             | 底层 Table 边框，卡片边框使用 `cardBordered`。                                                        |
| `prefixCls`              | `string`                                                           | `ant-pro-table`     | 完整 ProTable 前缀；默认随 ConfigProvider 前缀变化。                                                  |

未被上表接管的属性继承 [antdv-next Table API](https://www.antdv-next.com/components/table-cn)，如 `onRow`、`onHeaderRow`、`expandable`、`components`、`summary`、`sticky`、`virtual`、`locale`。`columns/dataSource/rowKey/loading/pagination/rowSelection/scroll/size/onChange/classes/styles/prefixCls/title` 由 ProTable 重新定义；工具栏标题用 `headerTitle`，分页由外部分页组件管理。`class/style/id/data-*/aria-*` 作用于 ProTable 外层，原生 Table 样式用 `tableClassName/tableStyle`。

### 请求协议 {#request}

```ts
request(params: P & { current?: number; pageSize?: number; nextToken?: string },
        sort: Record<string, "ascend" | "descend" | null>,
        filter: Record<string, Array<string | number> | null>)
  : Promise<{ data: T[]; total?: number; success?: boolean; nextToken?: string }>
```

返回值类型为本库导出的 [`ProRequestResult<T>`](https://github.com/bubblesplant/antv-next-pro/blob/main/packages/src/types.ts#L223)，各字段含义如下：

| 字段        | 类型      | 必填 | 说明                                                                                                   |
| ----------- | --------- | ---- | ------------------------------------------------------------------------------------------------------ |
| `data`      | `T[]`     | 是   | 本次请求的数据；成功接纳后更新表格，随后由 postData 处理展示。                                         |
| `total`     | `number`  | 否   | 总记录数；省略时回退到 pagination.total，再回退到当前数据条数。游标分页根据 nextToken 推断后续页。     |
| `success`   | `boolean` | 否   | 仅 false 表示拒绝本次结果：保留已有数据并触发 request-error；省略视为成功。                            |
| `nextToken` | `string`  | 否   | [游标分页](#pagination)的下一页 token，下次 request 通过 params.nextToken 接收；省略表示没有后续游标。 |

### 列属性 ProColumns {#columns}

| 属性                  | 类型                                                                | 默认值           | 说明与来源                                                                                                                              |
| --------------------- | ------------------------------------------------------------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `key`                 | `ProKey`                                                            | `dataIndex 路径` | 列标识，也是列状态及插槽 key。                                                                                                          |
| `dataIndex`           | `ProDataIndex`                                                      | —                | 字段路径，字符串、数字或只读路径数组。                                                                                                  |
| `title`               | `VNodeChild \| ((column) => VNodeChild)`                            | —                | 表头与表单标签。                                                                                                                        |
| `valueType`           | `ProColumnValueType<T>`                                             | `text`           | 类型字符串、`{ type, ...options }` 或 `(record,index) => 类型`，见 [ProField](./pro-field)。                                            |
| `valueEnum`           | `ProValueEnum \| (() => ProValueEnum)`                              | —                | 枚举对象或 Map，条目支持 `text/color/disabled/status/value`。                                                                           |
| `request`             | `(params?) => Promise<Record<string, unknown>[]>`                   | —                | 选项请求，见[字段选项](./pro-form-fields)。                                                                                             |
| `onFieldRequestError` | `(error: unknown) => void`                                          | —                | 选项请求失败通知。                                                                                                                      |
| `params`              | `Record<string, unknown>`                                           | —                | 选项请求参数。                                                                                                                          |
| `width`               | `number \| string`                                                  | —                | 原生 [Column 宽度](https://www.antdv-next.com/components/table-cn)。                                                                    |
| `minWidth`            | `number`                                                            | —                | 原生 Column 最小宽度。                                                                                                                  |
| `fixed`               | `'left' \| 'right'`                                                 | —                | 固定列，可被列状态覆盖。                                                                                                                |
| `align`               | `'left' \| 'center' \| 'right'`                                     | `left`           | 单元格对齐。                                                                                                                            |
| `ellipsis`            | `TableColumnType<T>['ellipsis']`                                    | —                | 原生 Column 省略配置。                                                                                                                  |
| `copyable`            | `boolean`                                                           | `false`          | 开启文本复制。                                                                                                                          |
| `sorter`              | `TableColumnType<T>['sorter']`                                      | —                | 原生 Column 排序，汇总为请求 `sort`。                                                                                                   |
| `filters`             | `{ text: string; value: ProKey }[]`                                 | —                | 原生 Column 筛选菜单。                                                                                                                  |
| `search`              | `boolean \| { transform?: (value) => Record<string, unknown> }`     | `true`           | `false` 排除搜索；对象 transform 将搜索值映射为请求参数。                                                                               |
| `editable`            | `boolean \| ((record: T, index: number) => boolean)`                | `true`           | 字段是否允许编辑。                                                                                                                      |
| `hideInTable`         | `boolean`                                                           | `false`          | 隐藏表格列。                                                                                                                            |
| `hideInSearch`        | `boolean`                                                           | `false`          | 隐藏搜索字段。                                                                                                                          |
| `hideInForm`          | `boolean`                                                           | `false`          | 隐藏 Schema 表单字段，见 [SchemaForm](./schema-form)。                                                                                  |
| `readonly`            | `boolean`                                                           | `false`          | 搜索/编辑字段只读。                                                                                                                     |
| `fieldProps`          | `Record<string, unknown> \| ((record?) => Record<string, unknown>)` | —                | 传给 `valueType` 对应控件；按控件查 [字段原生属性](./pro-form-fields)，如 SelectProps/InputProps。                                      |
| `formItemProps`       | `Record<string, unknown> \| ((record?) => Record<string, unknown>)` | —                | 搜索/编辑单元格的 [FormItem API](https://www.antdv-next.com/components/form-cn#form-item-props)，可设置 rules；生成的 name/label 优先。 |
| `convertValue`        | `(value, record: Partial<T>) => unknown`                            | —                | 表单入站转换，见 [SchemaForm](./schema-form)。                                                                                          |
| `transform`           | `(value, record: Partial<T>) => unknown`                            | —                | 表单出站转换，见 [SchemaForm](./schema-form)。                                                                                          |
| `dependencies`        | `ProDataIndex[]`                                                    | —                | 字段依赖路径，传给编辑上下文。                                                                                                          |
| `columns`             | `ProColumns<T>[]`                                                   | —                | 旧组合字段子列，推荐使用 children。                                                                                                     |
| `children`            | `ProColumns<T>[]`                                                   | —                | 分组列/组合字段子级。                                                                                                                   |
| `initialValue`        | `unknown`                                                           | —                | 搜索/表单字段初始值。                                                                                                                   |
| `order`               | `number`                                                            | —                | 搜索项排序权重。                                                                                                                        |
| `colSize`             | `number`                                                            | `1`              | 搜索项占用的逻辑列数。                                                                                                                  |
| `render`              | `(dom, record, index, action, schema) => VNodeChild`                | —                | 定制展示内容；action 为 [ProTableInstance](#instance)。                                                                                 |
| `renderText`          | `(value, record, index, action) => unknown`                         | —                | 展示前转换文本，不修改记录。                                                                                                            |
| `formItemRender`      | `(schema, context, nativeForm) => VNodeChild`                       | —                | 正式自定义字段回调；context 为 `{ record,index,column,editable,dependencies,update }`。                                                 |
| `renderFormItem`      | `(column, context) => VNodeChild`                                   | —                | 旧字段回调；有 formItemRender 时不调用。                                                                                                |

### search {#search}

| 属性               | 类型                                            | 默认值     | 说明与来源                                                              |
| ------------------ | ----------------------------------------------- | ---------- | ----------------------------------------------------------------------- |
| `labelWidth`       | `number \| 'auto'`                              | `80`       | 查询标签宽度。                                                          |
| `span`             | `number \| Partial<Record<Breakpoint, number>>` | `响应式`   | 栅格占位，断点 xs/sm/md/lg/xl/xxl；详见 [QueryFilter](./query-filter)。 |
| `defaultCollapsed` | `boolean`                                       | `true`     | 非受控折叠初值。                                                        |
| `collapsed`        | `boolean`                                       | —          | 受控折叠状态。                                                          |
| `onCollapse`       | `(collapsed: boolean) => void`                  | —          | 折叠变化回调。                                                          |
| `searchText`       | `string`                                        | `语言配置` | 查询按钮文案。                                                          |
| `resetText`        | `string`                                        | `语言配置` | 重置按钮文案。                                                          |
| `filterType`       | `'query' \| 'light'`                            | `query`    | 使用 [QueryFilter](./query-filter) 或 [LightFilter](./light-filter)。   |
| `optionRender`     | `false \| ((search, form, doms) => VNodeChild)` | —          | 定制/关闭操作区，form 为 SchemaForm 实例。                              |
| `collapseRender`   | `false \| ((collapsed: boolean) => VNodeChild)` | —          | 定制/关闭折叠入口。                                                     |

### form 搜索表单 {#form}

| 属性            | 类型                      | 默认值 | 说明与来源                                                                                                                                                        |
| --------------- | ------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `initialValues` | `Partial<T>`              | —      | 搜索初始值。                                                                                                                                                      |
| `submitter`     | `false \| SubmitterProps` | —      | 查询操作区，详见 [ProForm 提交区](./pro-form#submitter-props)。                                                                                                   |
| `FormProps`     | `FormProps`               | —      | 其余属性传给搜索的原生 Form，如 layout/rules/labelCol/wrapperCol/validateTrigger；完整表见 [Form API](https://www.antdv-next.com/components/form-cn#form-props)。 |

`form` 的 `initialValues/submitter` 由搜索适配层使用，其余属性进入 SchemaForm 的 `formProps`；`model`、字段、提交/重置流程由搜索区管理，请用顶层 `onSubmit/onReset` 观察查询。

其他列属性继承 [Table Column API](https://www.antdv-next.com/components/table-cn)，如 `onCell/onHeaderCell/defaultSortOrder/filterMultiple`；`title/dataIndex/render/children/key/filters/sorter/ellipsis` 使用上表的 Pro 定义。

### pagination {#pagination}

| 属性              | 类型                   | 默认值           | 说明与来源                                                                                                                                                                   |
| ----------------- | ---------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`            | `'offset' \| 'cursor'` | `offset`         | 页码/游标分页。                                                                                                                                                              |
| `nextToken`       | `string`               | —                | 游标分页初始 token。                                                                                                                                                         |
| `current`         | `number`               | —                | 受控页码。                                                                                                                                                                   |
| `pageSize`        | `number`               | —                | 受控页大小。                                                                                                                                                                 |
| `total`           | `number`               | `数据总数`       | 总记录数，远程优先使用请求结果 total。                                                                                                                                       |
| `defaultCurrent`  | `number`               | `1`              | 非受控初始页。                                                                                                                                                               |
| `defaultPageSize` | `number`               | `10`             | 非受控初始页大小。                                                                                                                                                           |
| `showSizeChanger` | `boolean`              | `true`           | 页大小切换；游标分页强制 false。                                                                                                                                             |
| `pageSizeOptions` | `(number \| string)[]` | `[10,20,50,100]` | 可选页大小。                                                                                                                                                                 |
| `PaginationProps` | `PaginationProps`      | —                | 其余透传 [Pagination API](https://www.antdv-next.com/components/pagination-cn)，如 size/showTotal/itemRender/onChange；默认 size=small，游标模式关闭快速跳页、页大小和总数。 |

### options {#options}

| 属性         | 类型                                               | 默认值  | 说明与来源                                                         |
| ------------ | -------------------------------------------------- | ------- | ------------------------------------------------------------------ |
| `search`     | `boolean \| ProTableToolbarSearchConfig`           | `false` | 关键词搜索，见[工具栏搜索](#toolbar-search)；toolbar.search 优先。 |
| `density`    | `boolean`                                          | `true`  | 密度工具。                                                         |
| `fullScreen` | `boolean \| ((event: MouseEvent, action) => void)` | `true`  | 全屏工具，自定义回调替代默认行为。                                 |
| `reload`     | `boolean \| ((event: MouseEvent, action) => void)` | `true`  | 刷新工具，自定义回调替代默认行为。                                 |
| `setting`    | `boolean \| SettingConfig`                         | `true`  | 列设置，嵌套字段见下表。                                           |

### options.setting {#setting}

| 属性                  | 类型                                                       | 默认值 | 说明与来源           |
| --------------------- | ---------------------------------------------------------- | ------ | -------------------- |
| `draggable`           | `boolean`                                                  | `true` | 允许拖拽排列。       |
| `checkable`           | `boolean`                                                  | `true` | 显示显隐复选框。     |
| `showListItemOption`  | `boolean`                                                  | `true` | 显示固定列选项。     |
| `checkedReset`        | `boolean`                                                  | `true` | 显示重置入口。       |
| `listsHeight`         | `number`                                                   | —      | 列表最大高度，像素。 |
| `extra`               | `VNodeChild`                                               | —      | 列表底部附加内容。   |
| `children`            | `VNodeChild`                                               | —      | 替换默认设置列表。   |
| `settingIcon`         | `VNodeChild`                                               | —      | 列设置按钮图标。     |
| `listItemTitleRender` | `(title: VNodeChild, column: ProColumns<T>) => VNodeChild` | —      | 定制设置项标题。     |

### toolbar {#toolbar}

| 属性           | 类型                                                             | 默认值        | 说明与来源                                                                                                                            |
| -------------- | ---------------------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `title`        | `VNodeChild`                                                     | `headerTitle` | 工具栏标题。                                                                                                                          |
| `actions`      | `VNodeChild \| (() => VNodeChild)`                               | —             | 操作节点；优先级为 toolbar-actions 插槽、toolBarRender、actions。                                                                     |
| `search`       | `boolean \| ProTableToolbarSearchConfig`                         | `false`       | 搜索框，优先于 options.search；见[工具栏搜索](#toolbar-search)。                                                                      |
| `onSearch`     | `(value: string) => void`                                        | —             | 关键词搜索后通知。                                                                                                                    |
| `subTitle`     | `VNodeChild`                                                     | —             | 副标题。                                                                                                                              |
| `tooltip`      | `string \| TooltipProps`                                         | —             | ListToolBar 的标题提示配置；在 ProTable 中由顶层 `tooltip` 覆盖，见 [Tooltip API](https://www.antdv-next.com/components/tooltip-cn)。 |
| `tabs`         | `ToolbarNavigation`                                              | —             | 标签导航，`multipleLine=true` 时显示，嵌套字段见下表。                                                                                |
| `menu`         | `ToolbarNavigation & { type?: 'inline' \| 'dropdown' \| 'tab' }` | —             | 菜单导航，嵌套字段见下表。                                                                                                            |
| `filter`       | `VNodeChild`                                                     | —             | 附加筛选节点。                                                                                                                        |
| `settings`     | `VNodeChild[]`                                                   | —             | 附加设置节点。                                                                                                                        |
| `multipleLine` | `boolean`                                                        | `false`       | 允许工具栏分行。                                                                                                                      |

### toolbar.tabs / toolbar.menu {#toolbar-navigation}

| 属性               | 类型                                                       | 默认值 | 说明与来源                              |
| ------------------ | ---------------------------------------------------------- | ------ | --------------------------------------- |
| `activeKey`        | `string`                                                   | —      | 受控选中 key。                          |
| `defaultActiveKey` | `string`                                                   | —      | 非受控初始 key。                        |
| `items`            | `{ key: string; label: VNodeChild; disabled?: boolean }[]` | `[]`   | 导航项。                                |
| `onChange`         | `(key: string) => void`                                    | —      | 切换通知。                              |
| `type (仅 menu)`   | `'inline' \| 'dropdown' \| 'tab'`                          | `tab`  | 菜单展示方式，省略 type 时回退为 Tabs。 |

### toolbar.search / options.search {#toolbar-search}

| 属性               | 类型                                                         | 默认值    | 说明与来源                                                                                                                                  |
| ------------------ | ------------------------------------------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`             | `string`                                                     | `keyword` | 写入请求参数的字段名。                                                                                                                      |
| `onSearch`         | `(value: string) => void \| false \| Promise<void \| false>` | —         | 返回 false 可阻止本次搜索。                                                                                                                 |
| `InputSearchProps` | `Omit<InputSearchProps, 'onSearch'>`                         | —         | 其余属性透传 [Input.Search API](https://www.antdv-next.com/components/input-cn#input-search-props)，如 placeholder/allowClear/enterButton。 |

### columnsState {#columns-state}

| 属性                                         | 类型                                               | 默认值         | 说明与来源                                      |
| -------------------------------------------- | -------------------------------------------------- | -------------- | ----------------------------------------------- |
| `persistenceKey`                             | `string`                                           | —              | 持久化 storage key，不配置则不持久化。          |
| `persistenceType`                            | `'localStorage' \| 'sessionStorage'`               | `localStorage` | 浏览器存储类型。                                |
| `value`                                      | `Record<string, ProColumnsState>`                  | —              | 受控状态，key 为 column.key 或 dataIndex 路径。 |
| `defaultValue`                               | `Record<string, ProColumnsState>`                  | —              | 非受控初始状态。                                |
| `onChange`                                   | `(state: Record<string, ProColumnsState>) => void` | —              | 变更通知。                                      |
| `value[key].show / defaultValue[key].show`   | `boolean`                                          | `true`         | 列是否可见。                                    |
| `value[key].order / defaultValue[key].order` | `number`                                           | `原列顺序`     | 列顺序。                                        |
| `value[key].fixed / defaultValue[key].fixed` | `'left' \| 'right' \| false`                       | `列配置`       | 固定状态。                                      |

### editable {#editable}

| 属性                            | 类型                                                                                 | 默认值     | 说明与来源                                                                                                                                                        |
| ------------------------------- | ------------------------------------------------------------------------------------ | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`                          | `'single' \| 'multiple'`                                                             | `single`   | 同时编辑一行或多行。                                                                                                                                              |
| `onSave`                        | `(key: ProKey, record: T, origin: T) => void \| boolean \| Promise<void \| boolean>` | —          | 校验后保存；false 保留编辑状态，抛错触发 editable-error。                                                                                                         |
| `onCancel`                      | `(key: ProKey, record: T, origin: T) => void \| Promise<void>`                       | —          | 取消并恢复原记录时通知。                                                                                                                                          |
| `onDelete`                      | `(key: ProKey, record: T) => void \| boolean \| Promise<void \| boolean>`            | —          | 删除前回调，false 阻止删除。                                                                                                                                      |
| `actionRender`                  | `(record, action: EditableAction<T>, defaultDom) => VNodeChild`                      | —          | 定制操作；defaultDom 包含 save/cancel/delete；action 方法见下表。                                                                                                 |
| `form`                          | `FormInstance`                                                                       | —          | 已废弃：不能注入已有原生 Form 实例，改用 formRef 获取实际实例。                                                                                                   |
| `formRef`                       | `Ref<FormInstance \| undefined>`                                                     | —          | 取得内部实际编辑 Form 实例，见 [Form 方法](https://www.antdv-next.com/components/form-cn)。                                                                       |
| `formProps`                     | `FormProps`                                                                          | —          | 透传内部编辑 [Form API](https://www.antdv-next.com/components/form-cn#form-props)，如 rules/validateTrigger/disabled；model 由表格维护，submit 被阻止以走行保存。 |
| `editableKeys`                  | `ProKey[]`                                                                           | `[]`       | 受控编辑 key，顶层 editableKeys 优先。                                                                                                                            |
| `onChange`                      | `(keys: ProKey[], rows: T[]) => void`                                                | —          | 编辑 key 更新。                                                                                                                                                   |
| `onValuesChange`                | `(record: T, rows: T[]) => void`                                                     | —          | 草稿字段变化。                                                                                                                                                    |
| `onlyOneLineEditorAlertMessage` | `VNodeChild`                                                                         | `语言配置` | 单行模式冲突提示。                                                                                                                                                |
| `onlyAddOneLineAlertMessage`    | `VNodeChild`                                                                         | `语言配置` | 只能新增一行时的提示。                                                                                                                                            |
| `saveText`                      | `VNodeChild`                                                                         | `语言配置` | 保存文案。                                                                                                                                                        |
| `cancelText`                    | `VNodeChild`                                                                         | `语言配置` | 取消文案。                                                                                                                                                        |
| `deleteText`                    | `VNodeChild`                                                                         | `语言配置` | 删除文案。                                                                                                                                                        |
| `deletePopconfirmMessage`       | `VNodeChild`                                                                         | `语言配置` | 删除确认提示。                                                                                                                                                    |

#### EditableAction

| 成员       | 签名 / 类型        | 说明             |
| ---------- | ------------------ | ---------------- |
| `start()`  | `boolean`          | 进入当前行编辑。 |
| `save()`   | `Promise<boolean>` | 校验并保存。     |
| `cancel()` | `void`             | 取消并恢复。     |
| `remove()` | `Promise<boolean>` | 执行删除。       |
| `record`   | `T`                | 当前记录。       |
| `editing`  | `boolean`          | 是否处于编辑态。 |

### 选择与滚动 {#selection}

| 属性                           | 类型                       | 默认值  | 说明与来源                                                                                                                                       |
| ------------------------------ | -------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `rowSelection.alwaysShowAlert` | `boolean`                  | `false` | 没有选中行也显示选择提示。                                                                                                                       |
| `rowSelection.*`               | `TableRowSelection<T>`     | —       | 其余行选择属性（selectedRowKeys/type/onChange/getCheckboxProps 等）见 [Table rowSelection API](https://www.antdv-next.com/components/table-cn)。 |
| `scroll.x`                     | `number \| string \| true` | —       | 横向滚动宽度。                                                                                                                                   |
| `scroll.y`                     | `number \| string`         | —       | 表体滚动高度。                                                                                                                                   |

### 文案 localeText {#locale-text}

| 属性             | 类型     | 默认值   | 说明与来源 |
| ---------------- | -------- | -------- | ---------- |
| `search`         | `string` | 语言配置 | 查询       |
| `reset`          | `string` | 语言配置 | 重置       |
| `expand`         | `string` | 语言配置 | 展开       |
| `collapse`       | `string` | 语言配置 | 收起       |
| `density`        | `string` | 语言配置 | 密度       |
| `densityDefault` | `string` | 语言配置 | 默认密度   |
| `densityCompact` | `string` | 语言配置 | 紧凑密度   |
| `densityLoose`   | `string` | 语言配置 | 宽松密度   |
| `fullScreen`     | `string` | 语言配置 | 全屏       |
| `reload`         | `string` | 语言配置 | 刷新       |
| `setting`        | `string` | 语言配置 | 列设置     |
| `columnDisplay`  | `string` | 语言配置 | 列展示     |
| `columnDrag`     | `string` | 语言配置 | 拖动排序   |

### 事件 {#events}

| 事件                    | 参数                                                                  | 说明                                  |
| ----------------------- | --------------------------------------------------------------------- | ------------------------------------- |
| `update:data-source`    | `rows: T[]`                                                           | 受控数据更新。                        |
| `update:editable-keys`  | `keys: ProKey[]`                                                      | 受控编辑 key 更新。                   |
| `data-source-change`    | `rows: T[], changedRecord?: T`                                        | 编辑、新增或删除导致数据变化。        |
| `editable-draft-change` | `rows: T[], changedRecord: T, reason: 'change' \| 'cancel'`           | 草稿更新/撤销通知，不等同于保存完成。 |
| `request-error`         | `error: unknown`                                                      | 远程请求失败。                        |
| `editable-error`        | `error: unknown`                                                      | 保存/删除生命周期抛错。               |
| `validation-error`      | `key: ProKey, errors: Record<string, string>`                         | 行编辑校验失败。                      |
| `search-collapse`       | `collapsed: boolean`                                                  | 搜索区折叠状态变化。                  |
| `change`                | `pagination: ProTablePagination, filters: ProFilter, sorter: ProSort` | 分页、筛选或排序变化。                |
| `selection-change`      | `keys: ProKey[], rows: T[]`                                           | 行选择变化。                          |
| `load`                  | `rows: T[], total: number`                                            | 成功接纳远程结果。                    |

`onSubmit/onReset/onLoadingChange` 为上方属性表中的回调。事件可按 Vue 约定使用 `@request-error` 等短横线名称。

### 插槽 {#slots}

| 插槽                               | 参数                                                             | 说明与来源                                                                              |
| ---------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `toolbar-title`                    | `无`                                                             | 工具栏标题，优先于标题属性。                                                            |
| `toolbar-actions`                  | `{ action: ProTableInstance<T>, selectedRows: T[] }`             | 操作按钮，优先于 toolBarRender 和 toolbar.actions。                                     |
| `header-${columnKey}`              | `{ column: ProColumns<T> }`                                      | 对应列的表头。                                                                          |
| `cell-${columnKey} / ${columnKey}` | `{ value, record: T, index: number, column, editable: boolean }` | 单元格；cell- 前缀优先，覆盖默认展示和编辑器。                                          |
| `before-table`                     | `无`                                                             | 表格前置内容，位于选择提示之后。                                                        |
| `after-table`                      | `无`                                                             | 表格后置内容，位于分页之前。                                                            |
| `原生 Table 插槽`                  | `Table 对应参数`                                                 | 其他插槽原样转发，见 [Table 插槽 API](https://www.antdv-next.com/components/table-cn)。 |

`columnKey` 优先取 `column.key`，否则为点连接的 `dataIndex`。字段插槽优先于默认只读展示与编辑器。

```vue
<ProTable :columns="columns" :row-selection="{}">
  <template #toolbar-title>项目列表</template>
  <template #toolbar-actions="{ action, selectedRows }">
    <button @click="action.reload()">同步</button>
    <button :disabled="!selectedRows.length" @click="action.clearSelected()">
      取消选择（{{ selectedRows.length }}）
    </button>
  </template>
  <template #header-name="{ column }">
    {{ column.title }} · 自定义表头
  </template>
  <template #cell-name="{ value, record, editable }">
    <strong>{{ value }}</strong>
    <small v-if="editable">编辑中</small>
  </template>
</ProTable>
```

### 组件实例 ProTableInstance {#instance}

| 方法                                                                        | 返回值                                 | 说明                                                                               |
| --------------------------------------------------------------------------- | -------------------------------------- | ---------------------------------------------------------------------------------- |
| `getSortFilter()`                                                           | `{ sort: ProSort; filter: ProFilter }` | 读取当前排序和筛选。                                                               |
| `reload(resetPageIndex?: boolean)`                                          | `Promise<void>`                        | 重新请求；true 回到第一页。                                                        |
| `reset()`                                                                   | `Promise<void>`                        | 清空查询、排序和筛选，并恢复初始分页。                                             |
| `setPageInfo(page: Partial<ProTablePagination>)`                            | `void`                                 | 更新页码/页大小。                                                                  |
| `clearSelected()`                                                           | `void`                                 | 清空选中行。                                                                       |
| `fullScreen()`                                                              | `Promise<void>`                        | 进入或退出全屏。                                                                   |
| `scrollTo(target: ProKey \| { key: ProKey } \| { top: number })`            | `void`                                 | 按 rowKey 或像素定位；直接传数字时先匹配 rowKey，找不到则按像素滚动。              |
| `startEditable(key: ProKey)`                                                | `boolean`                              | 进入编辑，返回是否成功。                                                           |
| `saveEditable(key: ProKey)`                                                 | `Promise<boolean>`                     | 校验并保存，返回是否成功。                                                         |
| `cancelEditable(key: ProKey)`                                               | `void`                                 | 取消并恢复记录。                                                                   |
| `addEditRecord(record: T, options?: Omit<RecordCreatorProps<T>, 'record'>)` | `boolean`                              | 创建并进入编辑，配置见 [RecordCreatorProps](./editable-pro-table#record-creator)。 |
| `getRowData(indexOrKey: number \| ProKey)`                                  | `T \| undefined`                       | 数字先按精确 rowKey 查找，再回退为顶层索引。                                       |
| `getRowsData()`                                                             | `T[]`                                  | 读取完整数据。                                                                     |
| `setRowData(indexOrKey: number \| ProKey, value: Partial<T>)`               | `boolean`                              | 以同一 key/索引规则查找并浅合并更新。                                              |

```ts
import type { ProTableInstance } from '@bubblesjs/antdv-next-pro'

const tableRef = ref<ProTableInstance<User>>()

await tableRef.value?.reload(true)
tableRef.value?.setPageInfo({ current: 2, pageSize: 50 })
tableRef.value?.clearSelected()
tableRef.value?.startEditable(userId)
await tableRef.value?.saveEditable(userId)
```
