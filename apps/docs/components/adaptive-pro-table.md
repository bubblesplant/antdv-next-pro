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

查询折叠箭头和文案由 `ProTable` 提供。`search`、`scroll` 等配置原样透传；需要固定表头和表体内部滚动时，由调用方设置 `scroll.y: '100%'`。

属性、事件、插槽及泛型与 [ProTable](./pro-table) 一致，组件 ref 使用 `ProTableInstance<T>`，支持 `reload()`、`reset()`、`setPageInfo()`、`scrollTo()` 和编辑等方法。

| 项目                                  | 行为                                                       |
| ------------------------------------- | ---------------------------------------------------------- |
| 根元素类名                            | 自动追加 `adaptive-table`，合并调用方的 `class` 与 `style` |
| `scroll.y`                            | 原样透传，由调用方配置表体滚动高度                         |
| `scroll.x`                            | 原样保留，用于横向滚动                                     |
| 查询区、工具栏、分页、选择提示        | 保留自身高度，随内容变化自动调整表体空间                   |
| `search: false` / `pagination: false` | 保持 ProTable 的原有行为                                   |

布局样式针对默认 Card、Spin 和 Table 结构。若通过 `tableRender`、`tableViewRender` 或 `searchFormRender` 新增 DOM 包裹层，需要为自定义布局接续 Flex 高度约束。原生虚拟表格需要自行提供数值类型的 `scroll.y`。

## 二次封装与同步

实现集中在 `packages/src/adaptive-pro-table/`。同步上游 pro-components 时应保留本目录、包入口导出、文档和 playground 示例；若上游 DOM 结构变化，在封装内部适配，避免向基础 ProTable 增加自适应条件。完整维护约定见仓库根目录 `AGENTS.md`。
