---
pageClass: component-doc
---

<script setup>
import AdaptiveProTableDemo from '../examples/AdaptiveProTableDemo.vue'
</script>

# AdaptiveProTable 自适应表格

`AdaptiveProTable` 是本项目在 [ProTable](./pro-table) 之上维护的独立二次封装，只追加 `adaptive-table` 类名和布局样式，其余属性、事件、插槽和实例方法均透传。查询区、工具栏和分页保留自身高度，表体占满容器的剩余空间。

## 示例

调整容器高度、展开查询条件或切换空数据，观察表体高度变化。无需监听窗口尺寸或手动计算查询区、工具栏和分页高度。

<ClientOnly><AdaptiveProTableDemo /></ClientOnly>

<details class="demo-source">
<summary>查看完整代码</summary>

<<< ../examples/AdaptiveProTableDemo.vue

</details>

## 基本使用

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { AdaptiveProTable, type ProColumns, type ProTableInstance } from '@bubblesjs/antdv-next-pro'
import '@bubblesjs/antdv-next-pro/style.css'

type User = { id: number; name: string }
const table = ref<ProTableInstance<User>>()
const columns: ProColumns<User>[] = [{ title: '姓名', dataIndex: 'name' }]
const rows: User[] = [{ id: 1, name: '林默' }]
</script>

<template>
  <div style="height: 600px; min-height: 0">
    <AdaptiveProTable
      ref="table"
      :columns="columns"
      :data-source="rows"
      row-key="id"
      :scroll="{ x: 1000, y: '100%' }"
    />
  </div>
</template>
```

也支持通过 `app.use(AntdvNextPro)` 全局注册。

## 容器高度

父容器需要有明确的可用高度，例如固定高度、`calc(100vh - 160px)`，或来自上层 Flex 布局的剩余高度。多层 Flex 布局中，相关伸缩层应设置 `min-height: 0`。

容器高度也需要足以容纳展开后的查询区、工具栏和分页。窄屏上查询字段会纵向排列，应预留相应高度。

```css
.page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 160px);
  min-height: 0;
}

.table-container {
  flex: 1;
  min-height: 0;
}
```

没有确定高度的普通文档流页面，继续使用 `ProTable`。

## API 与透传

本组件没有新增公开业务属性；全部泛型、默认值、受控行为及覆盖优先级与 ProTable 一致。只追加 `adaptive-table` 类名及布局样式。

### 属性 {#props}

| 属性                | 类型                       | 默认值           | 说明与来源                                                                                                                                                                                                               |
| ------------------- | -------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `class`             | `ClassValue`               | —                | 合并调用方 class 并追加 adaptive-table。                                                                                                                                                                                 |
| `style`             | `StyleValue`               | —                | 原样传给 ProTable 外层根节点。                                                                                                                                                                                           |
| `columns`           | `ProColumns<T>[]`          | 必填             | 列属性逐项见 [ProTable 列表](./pro-table#columns)。                                                                                                                                                                      |
| `scroll.x`          | `number \| string \| true` | —                | 透传横向滚动宽度。                                                                                                                                                                                                       |
| `scroll.y`          | `number \| string`         | —                | 透传表体滚动高度；固定表头和内部滚动需显式设置，例如 `'100%'`。                                                                                                                                                          |
| 全部 ProTable 属性  | `ProTableProps<T, P>`      | 与 ProTable 一致 | 逐项见 [ProTable 属性表](./pro-table#props)，嵌套配置见 [search](./pro-table#search)、[form](./pro-table#form)、[toolbar](./pro-table#toolbar)、[pagination](./pro-table#pagination)、[editable](./pro-table#editable)。 |
| 其他原生 Table 属性 | `TableProps<T>`            | 原生默认值       | 经 ProTable 透传，完整来源为 [antdv-next Table API](https://www.antdv-next.com/components/table-cn)。                                                                                                                    |

### 事件 {#events}

| 事件                   | 参数             | 来源                                                       |
| ---------------------- | ---------------- | ---------------------------------------------------------- |
| `update:data-source`   | `rows: T[]`      | 受控数据回传；见 [ProTable 事件表](./pro-table#events)。   |
| `update:editable-keys` | `keys: ProKey[]` | 受控编辑 key；见 [ProTable 事件表](./pro-table#events)。   |
| 全部其他事件           | 保持原参数       | [完整 ProTable 事件及回调](./pro-table#events)，原样转发。 |

### 插槽 {#slots}

| 插槽              | 参数                                                 | 来源                                                                                                           |
| ----------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `toolbar-actions` | `{ action: ProTableInstance<T>, selectedRows: T[] }` | 优先于 toolBarRender，见 [ProTable 插槽表](./pro-table#slots)。                                                |
| 其他全部插槽      | 保持原参数                                           | 包括 toolbar-title、动态 header-/cell-、before-table/after-table 及原生插槽；[完整插槽表](./pro-table#slots)。 |

### 组件实例 {#instance}

| 实例类型              | 方法与返回值来源                                                                                                                |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `ProTableInstance<T>` | 完整继承 [ProTable 实例表](./pro-table#instance)，包括 reload/reset、分页、选择、滚动、全屏、编辑和数据读写方法；没有新增方法。 |

查询区、工具栏、分页和选择提示保留自身高度。样式针对默认 Card、Spin 和 Table 结构；通过 `tableRender/tableViewRender/searchFormRender` 新增包裹层时，需要接续 Flex 高度约束。原生虚拟表格需提供数值类型的 `scroll.y`。

## 二次封装与同步

实现集中在 `packages/src/adaptive-pro-table/`。同步上游 pro-components 时应保留本目录、包入口导出、文档和 playground 示例；若上游 DOM 结构变化，在封装内部适配，避免向基础 ProTable 增加自适应条件。完整维护约定见仓库根目录 `AGENTS.md`。
