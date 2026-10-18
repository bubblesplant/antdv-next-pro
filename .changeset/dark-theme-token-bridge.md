---
'@bubblesjs/antv-next-pro': patch
---

修复暗色主题下的样式掉色：SchemaForm 的分组标题、表单列表标题与列表行、ProFormUploadDragger 的占位文案原先写死浅色值，现在统一由 Antdv Next 主题令牌通过 CSS 变量下发，并抽出共享的 `useThemeVars` 供 ProTable、SchemaForm 与独立字段组件复用。
