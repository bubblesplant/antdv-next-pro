# ProComponents 更新核对与同步记录

核对日期：2026-10-19（北京时间）。

## 上游版本

- npm `latest`：`2.8.10`，发布于 2025-07-17；本项目原有参考版本未落后于正式版。
- npm `beta`：`3.1.15-7`，发布于 2026-10-10。
- 主分支最新提交：`3bf43278d3`，2026-10-17（北京时间），修复表单校验弹层造成的输入焦点丢失。

来源：[npm 元数据](https://registry.npmjs.org/@ant-design%2fpro-components)、[官方更新日志](https://github.com/ant-design/pro-components/blob/master/site/zh-CN/changelog/index.mdx)、[最新提交](https://github.com/ant-design/pro-components/commits/master/)。实现对照 `3.1.15-7` 发布包，并核对主分支源码；上游文件仅作参考，未运行其脚本或自动化。

## 最近更新内容

| 上游变化                                                                    | 当前 Vue 项目的处理                                                                                |
| --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| ProTable 搜索区位于表格卡片上方，工具栏与分页位于卡片内部                   | 已同步 DOM 结构、主题背景、圆角与内边距                                                            |
| 工具栏关键词搜索，支持参数名及搜索回调                                      | 已增加 `options.search` / `toolbar.search`；支持本地、远程及异步取消                               |
| QueryFilter 的 `span` 支持 Partial 响应式配置（#9750，尚未发布）            | 已同步到 ProTable 搜索区，以容器宽度计算，缺省断点继承前值                                         |
| 表格 ref 暴露当前排序与筛选状态（#9728）                                    | 已同步 `getSortFilter()`，返回防御性副本；EditableProTable 同步透传                                |
| 3.1.15-7 修复 ProCard 标题间距、加载骨架内边距；字段按需分包和 tree shaking | 已新增基于 Antdv Next Card 的基础 ProCard，对齐标题间距并使用原生骨架屏；未声明同步 React 分包优化 |
| 编辑错误提示及弹层焦点修复（#9761 等）                                      | 本项目编辑校验使用行内提示，不采用该 React 弹层实现                                                |
| LightFilter 在工具栏保持扁平布局（主分支）                                  | 本项目尚无 ProTable `search.filterType: 'light'`，未新增这一组合能力                               |
| 游标分页（#9731）、可编辑行拖拽（#9732）、可配置编辑校验提示（#9729）       | 属于上游新增 API，本次未移植；不能据此认定已完整兼容 3.x                                           |
| 表单布局公开类型、移除 `warpField`、文档迁移至 Rspress                      | 本项目使用 Vue 表单壳与 VitePress，未复制 React 专用 API 或替换文档工程                            |

`SchemaForm` 独立 QueryFilter 的布局接口仍沿用现有实现；本次响应式 `span` 明确只覆盖 ProTable 搜索配置。

## 新增 ProCard

背景颜色来自 Card 的主题 token，ProCard 负责统一承载背景、圆角、内边距和标题等结构。查询区和表格区已分别复用一张 `variant="borderless"` 的 ProCard，无需在业务页面再套外层卡片。

- 独立具名导入和插件全局注册，导出 `ProCardProps`、`ProCardSlots`、`ProCardSemanticName`。
- 标题、副标题、提示、右侧操作区、封面及底部操作，支持对应插槽。
- `loading` 原生骨架及自定义加载插槽；`size`、`variant`、`headerBordered`、`ghost`、`hoverable`、`type="inner"`。
- `v-model:collapsed` 受控折叠或 `defaultCollapsed` 初始折叠；标题/按钮两种触发方式，支持键盘操作，折叠保留内容实例。加载期间普通内容会卸载。
- `styles` / `classNames` 语义样式，兼容 `headStyle` / `bodyStyle` / `bordered`；支持深色主题及 `theme.components.Card` 自定义 token。
- 未传标题时不创建标题区域，避免 Vue 对包含布尔值的节点属性进行转换后产生额外空白。

本次只实现基础卡片，未实现 tabs、栅格拆分、ProCard.Group / Divider、StatisticCard、CheckCard。使用方式见 [中文文档](../apps/docs/components/pro-card.md) 与 [英文文档](../apps/docs/en/components/pro-card.md)。

## CRUD 示例修复

`C:/malei/job/bee/bee-charger-admin/apps/web/src/views/example/crud.vue`：

- 姓名和状态用于条件查询，ID 与年龄保留为表格字段。
- 工具栏增加姓名、年龄或状态关键词搜索。
- 请求函数实际处理搜索参数，并按筛选后的总数与分页返回结果。
- 示例不覆盖组件库背景样式，由组件主题统一提供。

## 兼容范围

继续使用 Vue 3 / Antdv Next，不直接引入依赖 React 18 / Ant Design 6 的上游测试版。现有 `search: false`、`options: false` 保持各自关闭查询表单与内建工具的语义；`toolbar: false` 会隐藏整条工具栏。

## 业务项目接入

业务示例已使用本次构建的本地包，无需等待 npm 发布：

- 归档：`C:/malei/job/bee/bee-charger-admin/packages/vendor/antv-next-pro-0.1.4-procard-20261019-r2.tgz`。
- `apps/web/package.json` 的组件库依赖指向 `file:../../packages/vendor/antv-next-pro-0.1.4-procard-20261019-r2.tgz`；根目录及 `apps/web` 的锁文件均已更新。
- 将业务项目的 `vite-plus` 固定为 `1.2.0`，与其现有 `@voidzero-dev/vite-plus-core@1.2.0` 对齐，修复安装解析到 `1.3.0` 后无法启动和构建的问题。
- 组件库版本仍为 `0.1.4`，已补充 minor changeset；尚未发布 npm。

## 验证结果

- 组件库单元测试：9 个文件、128 项通过。
- 浏览器测试：6 个文件、48 项通过；其中 ProCard 新增 10 项，覆盖默认无空标题、深色主题、原生 Card token 覆盖、小尺寸继承、语义样式优先级、节点/插槽、受控/非受控折叠、键盘、嵌套与操作区、加载及 ghost；其余覆盖表格布局、查询、排序筛选及编辑能力。
- 仓库类型检查、文档构建及 ESM / CJS / 类型 / 样式 / 打包清单验证通过。
- 业务完整构建（含 Vue 类型检查）及本次 CRUD 文件的 ESLint 检查通过；业务目前没有测试文件。
- 实际加载业务 `crud.vue` 与已安装的本地包完成 10 项交互验证：姓名/状态查询、关键词查询及清空、新增/编辑/删除、浅色/深色背景、390px 窄屏布局。确认使用两张 ProCard、间隔 16px、内容区左右间距 24px、无空标题，桌面查询卡片高度 80px。页面无横向溢出，表格可内部横向滚动；页面及控制台错误均为 0。
- 交互测量与结果：[crud-sync-validation.json](./crud-sync-validation.json)。截图：[浅色](./crud-pro-components-light.png)、[深色](./crud-pro-components-dark.png)、[窄屏](./crud-pro-components-mobile.png)。截图使用隔离预览容器直接加载业务真实组件，未包含业务导航壳。

已知检查输出：业务全量 `vp check` 发现 20 个原有文件格式问题，本次 CRUD 文件格式已通过，未批量改动其他业务文件。组件库 lint 有 3 条原有警告；浏览器并行测试输出过 ResizeObserver 通知告警及 Drawer 旧属性弃用提示，实际业务交互验证未复现页面或控制台错误。业务构建仍有单个资源包超过 500kB 的体积提示。

## 临时文件清理状态

本次启动的隔离预览服务已停止。本轮中间 ProCard 归档 `antv-next-pro-0.1.4-procard-20261019.tgz` 已用原生 PowerShell 删除并确认不存在。上轮清理命令被工具策略拒绝（`blocked by policy`），这些目标的删除未执行，本轮未尝试绕过或重试。以下本次生成的路径经复查仍然存在：

- `C:/Users/Administrator/Documents/Codex/scratch-tests/antv-pro-sync-20261019`：临时上游参考包、测试与预览配置。
- `C:/malei/stu/antv-next-pro/packages/antdv-next-pro/.vitest-attachments`：早期失败测试附件。
- `C:/malei/stu/antv-next-pro/packages/antdv-next-pro/tests/__screenshots__`：早期失败截图。
- `C:/malei/stu/antv-next-pro/artifacts/crud-sync-debug.png`：早期调试截图。
- `C:/malei/job/bee/bee-charger-admin/packages/vendor/antv-next-pro-0.1.4-sync-20261019.tgz`：上轮已被替代的旧本地归档，本轮未重试删除。

浅色、深色、窄屏正式截图、验证 JSON 和当前使用的 `procard-20261019-r2` 归档属于交付成果，予以保留；上轮 `sync-20261019-r2` 归档也保留为先前成果，当前依赖已不再引用它。
