# @bubblesjs/antv-next-pro

## 0.2.0

### Minor Changes

- [#7](https://github.com/bubblesplant/antv-next-pro/pull/7) [`ab604a1`](https://github.com/bubblesplant/antv-next-pro/commit/ab604a15513574f43a03a88430b1b8e17f6ff12d) Thanks [@bubblesplant](https://github.com/bubblesplant)! - 新增基于 Antdv Next Card 的 ProCard，提供主题容器、标题和操作插槽、骨架加载、受控/非受控折叠、幽灵模式及语义样式配置。ProTable 查询区与表格区统一使用 ProCard，支持独立导入与插件全局注册。

- [#7](https://github.com/bubblesplant/antv-next-pro/pull/7) [`ab604a1`](https://github.com/bubblesplant/antv-next-pro/commit/ab604a15513574f43a03a88430b1b8e17f6ff12d) Thanks [@bubblesplant](https://github.com/bubblesplant)! - 对照 ProComponents 3.1.15-7 和最新主分支修正 ProTable 卡片布局：搜索区位于工具栏上方，查询区与表格卡片使用主题容器背景，分页保留在卡片内。增加 options.search / toolbar.search 关键词搜索、可省略断点的响应式 search.span，以及 ProTable / EditableProTable 的 getSortFilter() 方法。

### Patch Changes

- [#7](https://github.com/bubblesplant/antv-next-pro/pull/7) [`e593428`](https://github.com/bubblesplant/antv-next-pro/commit/e593428562a043ae0b4fc5ffb95d97e597640047) Thanks [@bubblesplant](https://github.com/bubblesplant)! - 修复暗色主题下的样式掉色：SchemaForm 的分组标题、表单列表标题与列表行、ProFormUploadDragger 的占位文案原先写死浅色值，现在统一由 Antdv Next 主题令牌通过 CSS 变量下发，并抽出共享的 `useThemeVars` 供 ProTable、SchemaForm 与独立字段组件复用。

## 0.1.4

### Patch Changes

- [`c134e18`](https://github.com/bubblesplant/antv-next-pro/commit/c134e1830c883f7d1b0e9e0a86eb59dc23b73e66) Thanks [@bubblesplant](https://github.com/bubblesplant)! - 修改包名

## 0.1.3

### Patch Changes

- [`781f9bc`](https://github.com/bubblesplant/antv-next-pro/commit/781f9bc248d3b6e9007884791f4a8abcf9446a7d) Thanks [@bubblesplant](https://github.com/bubblesplant)! - 增加proformField 和 docs 以及 protable 和 editprotable schemaForm 基于 proformfiled 的重构

## 0.1.2

### Patch Changes

- [`8a97e86`](https://github.com/bubblesplant/antv-next-pro/commit/8a97e867255152467a474e9f18d7af83471263bd) Thanks [@bubblesplant](https://github.com/bubblesplant)! - docs 美化 vp stage 关闭颜色

## 0.1.1

### Patch Changes

- [`9098473`](https://github.com/bubblesplant/antv-next-pro/commit/9098473d6821a7226dcecc1f099744b3f9353341) Thanks [@bubblesplant](https://github.com/bubblesplant)! - 修改 protable 工具栏样式

## 0.1.0

### Minor Changes

- [`72c07d2`](https://github.com/bubblesplant/antv-next-pro/commit/72c07d2d6987d7541a71639a2848459dacba3068) Thanks [@bubblesplant](https://github.com/bubblesplant)! - 首次发布 Antdv Next Pro，提供面向 Vue 3 的 ProTable、EditableProTable 与 SchemaForm。

### Patch Changes

- [`1deca8b`](https://github.com/bubblesplant/antv-next-pro/commit/1deca8bdaf8e21880818d1f54175c43c652b0712) Thanks [@bubblesplant](https://github.com/bubblesplant)! - 打包流程优化

- [`1deca8b`](https://github.com/bubblesplant/antv-next-pro/commit/1deca8bdaf8e21880818d1f54175c43c652b0712) Thanks [@bubblesplant](https://github.com/bubblesplant)! - vite 配置优化

- [`1deca8b`](https://github.com/bubblesplant/antv-next-pro/commit/1deca8bdaf8e21880818d1f54175c43c652b0712) Thanks [@bubblesplant](https://github.com/bubblesplant)! - 打包错误
