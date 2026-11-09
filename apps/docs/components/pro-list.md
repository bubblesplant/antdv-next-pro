---
pageClass: component-doc
---

<script setup>
import ProListDemo from '../examples/ProListDemo.vue'
</script>

# ProList / BaseProList

用列表展示 schema 数据，复用 [ProTable](./pro-table) 的请求、查询、分页、工具栏、选择和编辑能力。`BaseProList` 提供更轻的默认外观。

<ClientOnly><ProListDemo /></ClientOnly>

<<< ../examples/ProListDemo.vue

## 最小用法

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ProList, type ProListMetas } from '@bubblesjs/antdv-next-pro'

type Project = { id: number; name: string; description: string }
const rows = ref<Project[]>([
  { id: 1, name: '组件库', description: '统一业务组件与主题' },
  { id: 2, name: '工作台', description: '整理日常工作' },
])
const metas: ProListMetas<Project> = {
  title: { dataIndex: 'name', title: '名称' },
  description: { dataIndex: 'description' },
}
</script>

<template>
  <ProList row-key="id" :data-source="rows" :metas="metas" />
</template>
```

## 数据与 schema

`columns` 与 `metas` 选择一种即可，显式 `columns` 优先。`metas` 使用区域名组织字段；对应的 `columns` 通过 `listSlot` 指定区域。

| 区域                      | 用途                            |
| ------------------------- | ------------------------------- |
| `title` / `subTitle`      | 标题、副标题                    |
| `avatar`                  | 头像，默认 `valueType="avatar"` |
| `description` / `content` | 描述、正文                      |
| `actions`                 | 操作，默认 `valueType="option"` |
| `extra`                   | 右侧附加内容                    |

各项继承 `ProColumns<T>`，支持 `valueType`、`valueEnum`、`fieldProps`、远程选项和字段格式化。省略 `dataIndex` 时使用区域名；其他区域默认 `valueType="text"`。

`render` 使用 v3 签名 `(dom, record, index, action, schema)`，首参是默认渲染节点。需要原始字段值时使用 `record` 或先在 `renderText(value, record, index, action)` 中处理。

## API

### 属性 {#props}

两个组件继承 [ProTable 属性](./pro-table#props)、[列配置](./pro-table#columns)、[事件](./pro-table#events)和[实例方法](./pro-table#instance)。表格正文替换为列表，原生表格单元格排版属性不会自动成为列表排版配置。以下是新增或语义不同的属性。

| 属性               | 类型                                                               | 默认值         | 说明 / 来源                                                                                                        |
| ------------------ | ------------------------------------------------------------------ | -------------- | ------------------------------------------------------------------------------------------------------------------ |
| `columns`          | `ProListColumn<T>[]`                                               | —              | 列表字段 Schema；优先于 metas，字段扩展见[下表](#columns)。                                                        |
| `metas`            | `ProListMetas<T>`                                                  | —              | 按 title/subTitle/avatar/description/content/actions/extra 组织 Schema。                                           |
| `grid`             | `{ gutter?, column?, xs?, sm?, md?, lg?, xl?, xxl? }`              | —              | 启用网格卡片，断点配置见下表。                                                                                     |
| `itemCardProps`    | `ProCardProps`                                                     | —              | 传给每个网格项 [ProCard](./pro-card#props)；内部区域插槽和根 class 由列表生成，启用选择后 checked 由选择状态覆盖。 |
| `itemLayout`       | `'horizontal' \| 'vertical'`                                       | `horizontal`   | 普通列表正文排列。                                                                                                 |
| `split`            | `boolean`                                                          | `undefined`    | 未传：无分隔线、无行圆角；false：无分隔线、主题圆角；true：分隔线、无圆角。                                        |
| `showActions`      | `'hover' \| 'always'`                                              | `always`       | hover 时鼠标悬浮或键盘焦点进入行才显示。                                                                           |
| `showExtra`        | `'hover' \| 'always'`                                              | `always`       | 附加区显示时机，与 showActions 同规则。                                                                            |
| `itemRender`       | `(record: T, index: number, defaultDom: VNodeChild) => VNodeChild` | —              | 替换整个列表项正文。                                                                                               |
| `itemTitleRender`  | `false \| ProListItemRender<T>`                                    | —              | 替换标题或以 false 隐藏标题。                                                                                      |
| `itemHeaderRender` | `false \| ProListItemRender<T>`                                    | —              | 替换头部或以 false 隐藏头部。                                                                                      |
| `onItem`           | `(record: T, index: number) => HTMLAttributes`                     | —              | 返回列表行 attrs；在 onRow 之后合并。                                                                              |
| `onRow`            | `(record: T, index: number) => HTMLAttributes`                     | —              | 返回列表行 attrs，支持事件处理器。                                                                                 |
| `rowClassName`     | `string \| ((record: T, index: number) => string)`                 | —              | 追加到每个列表行。                                                                                                 |
| `prefixCls`        | `string`                                                           | `ant-pro-list` | 完整列表前缀；继承原生与 ProProvider 前缀。                                                                        |
| `classes`          | `SemanticClasses \| ({ props }) => SemanticClasses`                | —              | 列表语义类名，见[样式](#styles)。                                                                                  |
| `classNames`       | `SemanticClasses \| ({ props }) => SemanticClasses`                | —              | 兼容入口；同部位 classes 优先。                                                                                    |
| `styles`           | `SemanticStyles \| ({ props }) => SemanticStyles`                  | —              | 列表语义样式，见[样式](#styles)。                                                                                  |

### 共享属性及默认值

| 配置项                                                       | 默认值                        | 实际去处 / 来源                                                                                                                                                                                                     |
| ------------------------------------------------------------ | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dataSource / defaultDataSource / request / params / rowKey` | [ProTable](./pro-table#props) | 同一数据引擎；request 返回 { data, total?, success?, nextToken? }。                                                                                                                                                 |
| `search / options / pagination`                              | `false`                       | [ProTable 属性](./pro-table#props)，显式传入开启。                                                                                                                                                                  |
| `cardProps`                                                  | `false`                       | 外层 [ProCard](./pro-card#props)，区别于 itemCardProps。                                                                                                                                                            |
| `BaseProList.toolBarRender`                                  | `false`                       | 默认隐藏整个工具栏，可覆盖。                                                                                                                                                                                        |
| `form`                                                       | —                             | 原生 [Form 属性](https://www.antdv-next.com/components/form-cn)及 [submitter](./pro-form#submitter)，详见 ProTable。                                                                                                |
| `editable`                                                   | —                             | [编辑配置](./pro-table#editable)，使用共享字段渲染器。                                                                                                                                                              |
| `rowSelection`                                               | —                             | 共享 [Table rowSelection API](https://www.antdv-next.com/components/table-cn)；列表消费 type、selectedRowKeys、defaultSelectedRowKeys、getCheckboxProps、onSelect、onChange。                                       |
| `expandable`                                                 | —                             | 共享 [Table expandable API](https://www.antdv-next.com/components/table-cn)；列表消费 defaultExpandedRowKeys、expandedRowKeys、rowExpandable、expandRowByClick、expandedRowRender、onExpand、onExpandedRowsChange。 |

### 列与 metas {#columns}

| 属性                                                                              | 类型                                                                                      | 默认值                   | 说明 / 来源                                                                                                                                                                              |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `listSlot`                                                                        | `'title' \| 'subTitle' \| 'description' \| 'avatar' \| 'content' \| 'actions' \| 'extra'` | —                        | 列表区域；省略时按 dataIndex 匹配区域名。                                                                                                                                                |
| `cardActionProps`                                                                 | `'extra' \| 'actions'`                                                                    | `extra`                  | 网格操作区放在卡片头部 extra 或底部 actions。                                                                                                                                            |
| `dataIndex`                                                                       | `ProDataIndex`                                                                            | metas 区域键             | 字段路径；metas 未显式提供时使用区域键。                                                                                                                                                 |
| `valueType`                                                                       | `ProColumnValueType<T>`                                                                   | `avatar / option / text` | metas.avatar 默认为 avatar，actions 为 option，其余为 text。                                                                                                                             |
| `valueEnum / fieldProps / formItemProps / request / params / render / renderText` | [ProColumns](./pro-table#columns)                                                         | —                        | 完整[共享列 API](./pro-table#columns)；fieldProps 交给 [valueType 对应控件](./pro-form-fields#props)，formItemProps 交给原生 [FormItem](https://www.antdv-next.com/components/form-cn)。 |

### grid 配置 {#grid}

| 属性                           | 类型     | 默认值   | 说明                                         |
| ------------------------------ | -------- | -------- | -------------------------------------------- |
| `gutter`                       | `number` | `16`     | 卡片间距，像素。                             |
| `column`                       | `number` | `1`      | 初始每行卡片数。                             |
| `xs / sm / md / lg / xl / xxl` | `number` | 前一断点 | 对应断点的每行卡片数；未设置时沿用前一断点。 |

### 事件 {#events}

| 事件 / 回调                       | 参数                                      | 说明 / 来源                                        |
| --------------------------------- | ----------------------------------------- | -------------------------------------------------- |
| ProTable 事件                     | [完整事件表](./pro-table#events)          | 两个组件完整转发，包括数据、加载、分页和编辑事件。 |
| `update:dataSource`               | `(rows: T[])`                             | 受控数据更新，使用 v-model:dataSource。            |
| `rowSelection.onChange`           | `(keys, rows, { type: 'single' })`        | 选择变化；受控 selectedRowKeys 由调用方更新。      |
| `rowSelection.onSelect`           | `(record, selected, selectedRows, event)` | 单项选择。                                         |
| `expandable.onExpand`             | `(expanded: boolean, record: T)`          | 展开请求。                                         |
| `expandable.onExpandedRowsChange` | `(keys: ProKey[])`                        | 展开键变化；受控键由调用方更新。                   |

### 插槽 {#slots}

| 插槽                                              | 参数                            | 说明 / 来源                                                      |
| ------------------------------------------------- | ------------------------------- | ---------------------------------------------------------------- |
| `title / description / content / extra / actions` | `{ record: T, index: number }`  | 替换列表区域；普通列表 description/content/extra 需有对应 meta。 |
| `avatar / subTitle`                               | `{ record: T, index: number }`  | 网格模式的区域插槽；普通列表使用对应列 render 回调。             |
| `expandedRowRender`                               | `{ record: T, index: number }`  | 展开内容，优先于 expandable.expandedRowRender。                  |
| ProTable 插槽                                     | [完整插槽表](./pro-table#slots) | 同时转发外层表格框架；同名插槽在不同位置可能收到不同作用域。     |

### 实例 {#instance}

两个组件 ref 均暴露完整 [ProTableInstance 方法表](./pro-table#instance)，涵盖 reload/reset、数据读写、分页、选择和编辑。全屏、scrollTo 的作用范围由外层 ProTable 决定。

### 语义样式 {#styles}

| 部位                                                                                                      | 说明                                                                            |
| --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `root / container / row / header / title / subTitle / description / content / extra / actions / expanded` | 列表渲染节点；classes 优先于 classNames，styles 接受对象或 ({ props }) => map。 |

列表根背景透明。网格卡片保留自身背景和内边距，itemCardProps 与 cardActionProps 只用于网格卡片。语言、方向和原生 token 继承 [ConfigProvider](https://www.antdv-next.com/components/config-provider-cn)，Pro token 见 [ProConfigProvider](./pro-config-provider#props)。
