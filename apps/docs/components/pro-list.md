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
import { ProList, type ProListMetas } from '@bubblesjs/antv-next-pro'

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

| 属性                                                      | 说明                                                                            |
| --------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `dataSource` / `defaultDataSource` / `request` / `params` | 继承 ProTable 的受控、本地和远程数据方式；请求返回 `{ data, total?, success? }` |
| `rowKey`                                                  | 唯一记录标识，推荐显式设置                                                      |
| `columns` / `metas`                                       | `ProListColumn<T>[]` / `ProListMetas<T>`                                        |
| `grid`                                                    | `{ gutter?, column?, xs?, sm?, md?, lg?, xl?, xxl? }`；数字表示每行项数         |
| `itemLayout`                                              | `horizontal` / `vertical`                                                       |
| `split`                                                   | 是否显示分隔线，默认显示                                                        |
| `showActions` / `showExtra`                               | `always` / `hover`；悬停模式也在键盘焦点进入行时显示                            |
| `itemRender`                                              | `(record, index, defaultDom) => VNodeChild`，替换整项                           |
| `itemTitleRender` / `itemHeaderRender`                    | 同上，分别替换标题、头部；`false` 隐藏该区域                                    |
| `onItem` / `onRow`                                        | `(record, index) => HTMLAttributes`，合并绑定到列表行                           |
| `rowClassName`                                            | 字符串或 `(record, index) => string`                                            |
| `rowSelection`                                            | 继承 ProTable 的选择配置，支持受控 key、单选/多选和禁用项                       |
| `expandable`                                              | 展开配置，支持受控 key、展开事件及 `expandedRowRender`                          |
| `prefixCls` / `classes` / `styles`                        | 前缀与语义样式，见下文                                                          |

`ProList` 默认关闭 `search`、`options`、`pagination`，可显式开启；其他工具栏、请求和编辑属性参见 ProTable。`BaseProList` 在此基础上默认设置 `cardProps=false`、`search=false`、`toolBarRender=false`，这些默认值均可覆盖。

启用 `grid` 时，每项使用现有 ProCard 呈现，`itemCardProps` 传入卡片属性。操作 schema（如 `metas.actions`）的 `cardActionProps="actions"` 将操作放在卡片底部；`extra` 或省略时放在卡片头部附加区域。`grid` 的断点数值决定每行卡片数。

## 事件、插槽与实例

数据、分页、选择、编辑事件沿用 ProTable；受控 `dataSource` 的回传使用 `v-model:dataSource`。选择变化通过 `rowSelection.onChange` 接收，展开变化通过 `expandable` 的回调接收。

| 插槽                                                      | 参数                                                                   |
| --------------------------------------------------------- | ---------------------------------------------------------------------- |
| `title` / `description` / `content` / `extra` / `actions` | `{ record, index }`，替换对应列表区域                                  |
| `expandedRowRender`                                       | `{ record, index }`，替换展开正文                                      |
| ProTable 插槽                                             | 同时转发给外层表格框架；名称可能与列表区域重合，作用域需按实际位置处理 |

组件 `ref` 为 `ProTableInstance<T>`：支持 `reload`、`reset`、`setPageInfo`、`clearSelected`、`getRowData`、`getRowsData`、`setRowData`，以及 `startEditable`、`saveEditable`、`cancelEditable` 等方法。`BaseProList` 转发同一实例能力。

## 样式与配置

`classes` / `styles` 支持对象或 `({ props }) => map`。列表消费的部位为 `root`、`container`、`row`、`header`、`title`、`subTitle`、`description`、`content`、`extra`、`actions`、`expanded`。旧 `classNames` 兼容，同名部位 `classes` 优先。

默认公开前缀为 `ant-pro-list`；原生 ConfigProvider 设置 `prefixCls="demo"` 后为 `demo-pro-list`。`prefixCls` 可覆盖当前列表前缀。语言、方向、主题算法、全局及原生组件 token 继承原生 ConfigProvider，Pro 扩展 token 使用 [ProConfigProvider](./pro-config-provider) 的 `token`。

## 使用边界

列表呈现 `listSlot` 对应的区域；任意其他 schema 键不会自动生成独立区域。`itemCardProps` 与 `cardActionProps` 用于网格卡片布局，普通列表使用自身操作区域。`fullScreen`、`scrollTo` 等继承方法的实际作用范围由外层 ProTable 决定。
