# 新增组件族独立示例与交互验证

最终验证于 2026-10-21 19:30（Asia/Shanghai），针对最后源码和格式修复后的 `http://127.0.0.1:9903` 执行。四页共 **21/21** 组实际交互通过，所有页面均无未处理的浏览器异常、无开发服务编译错误覆盖层。

## 独立示例交付

| 组件族          | Playground                                                            | 文档示例                                       | 路由                                | 通过组数 |
| --------------- | --------------------------------------------------------------------- | ---------------------------------------------- | ----------------------------------- | -------- |
| ProList         | `apps/playground/src/demos/pro-list/ProjectList.vue`                  | `apps/docs/examples/ProListDemo.vue`           | `/pro-list/projects`                | 5        |
| ProDescriptions | `apps/playground/src/demos/pro-descriptions/EditableDescriptions.vue` | `apps/docs/examples/ProDescriptionsDemo.vue`   | `/pro-descriptions/editable`        | 4        |
| 表格增强        | `apps/playground/src/demos/table-enhancements/EnhancedTables.vue`     | `apps/docs/examples/TableEnhancementsDemo.vue` | `/table-enhancements/edit-and-sort` | 6        |
| 辅助组件        | `apps/playground/src/demos/shared-components/SharedComponents.vue`    | `apps/docs/examples/SharedComponentsDemo.vue`  | `/shared-components/interactions`   | 6        |

四对示例的文件哈希一致。文档示例均为完整独立副本，仅引用公开组件包、Vue 和 antdv-next，无跨应用私有导入。八个示例已冻结，导航、路由与业务源码由主控和对应负责人维护。

## 交互覆盖

- ProList：初始请求与分页；受控勾选和清空；翻页与展开；查询、重置、刷新；详情动作、卡片键盘操作与宽屏两列。
- ProDescriptions：请求与只读格式；必填校验阻止保存；保存和重新请求；取消编辑恢复原值。
- 表格增强：键盘排序；行编辑 API、必填校验、保存和取消；双击及失焦保存；单元格校验和保存；取消编辑以及校验失败阻止切换。
- 辅助组件：工具栏搜索和下拉菜单；Search 提交与重置；FilterDropdown 确认和 FieldLabel 清除；LightWrapper 提交及关闭回滚；DropdownFooter 与行内校验；ErrorBoundary 捕获和恢复。

测试锚点统一位于 `#preview-panel` 内，各示例根节点分别使用 `data-demo="pro-list"`、`data-demo="pro-descriptions"`、`data-demo="table-enhancements"` 和 `data-demo="shared-components"`。

## 最终证据

- 脚本：`verify-new-family-demos.mjs`，使用现有 Playwright 与 Chrome，无安装额外依赖或浏览器。
- 完整结果：`new-family-demo-verification.json`，包含四页、21 组及每组结果，`passed=true`、`passedStepCount=21`。
- 完整运行日志：`new-family-demo-browser.log`。
- 详情页 `consoleMessages=[]`：保留属性 `key` 和字段 span 总数的两类警告均已消失。
- 其他页面的组件警告亦为空；首个页面唯一的资源 404 已单独定位为开发站缺少 `/favicon.ico`，见 `new-family-resource-check.json`，不影响组件交互。
- 静态验证记录：`new-family-demo-typecheck.log`、`new-family-docs-typecheck.log`、`new-family-demo-eslint.log`、`new-family-demo-format.log`。主控在最终源码冻结后统一执行全量检查。

## 验证边界

本轮验证覆盖四组新示例在上述路由中的真实交互；不把它作为所有公开 API、全部响应式断点或参考站逐像素一致性的证明。示例的详情字段已采用原生响应式排版，移除了不合理的 `span: 2`；未另造排版算法。

未提交或发布，未创建临时依赖项目，无需清理的临时项目遗留。
