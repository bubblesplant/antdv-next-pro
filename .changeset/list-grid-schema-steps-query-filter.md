---
'@bubblesjs/antdv-next-pro': minor
---

对齐 ProComponents 的列表网格、Schema 步骤表单与查询区。`ProList` 网格使用内置 `CheckCard`，卡片样式前缀从 `ant-pro-card` 改为 `ant-pro-checkcard`；Schema 支持二维 `columns` 和 `steps`，保留旧式分组；`QueryFilter` 新增 `searchGutter`、`ignoreRules`，响应式 `span` 按容器宽度匹配上界断点。`ProTable` 标准搜索区默认忽略字段级校验，如需保留请设置 `search.ignoreRules: false` 或 `form.ignoreRules: false`。
