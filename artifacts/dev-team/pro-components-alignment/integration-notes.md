# 实施与集成记录

2026-10-21，用户确认“开始吧”。实际范围见 implementation-scope.md。

## 实施前基线

- 包 typecheck 通过。
- 9 个单元测试文件、128 条测试通过（32.45 秒）。
- 6 个浏览器测试文件、50 条测试通过（7.36 秒，PRO_BROWSER_CHANNEL=chrome）。
- 已有 Playwright 可使用本机 Chrome，最小浏览器烟测通过（155.0.8059.85）。不安装浏览器、不停止用户 9902 服务。
- 浏览器测试配置增加可选环境变量 PRO_BROWSER_CHANNEL=chrome；不设置时仍使用原配置浏览器。
- 用户原有大量未提交变更保留。本轮不自动提交、发包或部署。

## 所有权

- alignment_contract：Provider/shared/ProField/ProForm 字段与 root index/style 汇总，types 仅字段联合及导出。
- alignment_prd：schema-form/ProForm/布局/表单结构与表单类型分区、PRD 范围修订。
- alignment_core：Card/Table/Editable/List/Descriptions/辅助组件及对应类型分区。
- 主控：范围与接口协调、测试设施、独立回归与验收记录。

保留范围已完成实现及最终验收，结果见 test-report.md。用户后来明确排除的组件以 implementation-scope.md 为准。

## 集成回流记录

1. 首轮类型检查回流 Search 的原生提交事件、组合表单 VNode/弹层联合类型、List 泛型与 Table 原生泛型；后续检查这些问题已消失。SchemaForm 的值变化通知统一为 `onValuesChange(changedValues, values)`，原 `{ path, value }` 扩展迁移到 `fieldChange`，避免重复通知。
2. 17:20 单元检查 10 文件、135 条，115 通过、20 失败。失败涉及旧默认值/旧选择器、搜索浅挂载策略、编辑保存与校验；已交对应实现者，行为覆盖不能仅通过改期望移除。
3. 17:31 首轮浏览器检查受新增依赖预构建重载影响，6 文件中只有 1 文件完成：22 条中 9 通过、13 失败；另有 iframe 初始化超时。此轮不能用于推断其余文件通过。浏览器配置已显式预构建新 Provider/dayjs 依赖并去重 Vue，等待稳定复验；表单 ref 警告同时回流。
4. 主控追加独立浏览器探针：嵌套 token/valueType 合并与并列缓存隔离、dark 保留 compact/自定义算法并恢复、Card 受控选择与键盘禁用、List 嵌套注册/move/copy/guard/min/max、Steps 每步等待及值保留。探针通过与完整 AC 通过须分别记录。
5. 本轮检查暴露并修复方向：ProTable 只透传显式原生 boolean，保留原生默认表头；ProCard 未设置 checked 使用 undefined；Provider valueTypeMap 按字段继承；ProField 对象 valueType 配置与显式 fieldProps 优先级统一。
6. 第二轮真实入口回流：ListView/FieldRender 的 SFC 泛型 props 不能从复杂类型推导运行时 props，改独立显式接口；FieldControl 的 FormItem 状态 hook 改用原生公开 dist 路径；dayjs/plugin 外部 ESM 导入补 .js。重启主控专用 9903 服务清除失败类型缓存后，独立浏览器 21/21 通过。
7. 公开 DOM 复核回流：Table column-setting 单数、Alert 各部位、Card 布局/折叠/状态类、QueryFilter 容器与 Form 根、Steps 容器、LightWrapper 的 field 前缀，以及字段只读/校验/方向类；保留 data-pro-* 测试锚点。
8. 表单边界回流：LightFilter collapse=true 收纳全部字段，默认仅 secondary 进入更多；确认校验、取消恢复、清除与提交分别覆盖；Steps submitter render/按钮 props、URL popstate 删除字段、相同 initialValues 对象重建和卸载中的异步提交补回归。
9. 新增强后的包验证实际加载 ESM/CJS，核对组合成员引用、34 语言、全局注册与打包清单；原 AST 检查补识别 CJS getter re-export。18:16 的构建产物两种模块各有 186 个运行时导出，真实加载成功。
10. 最低 peer 独立测试安装工作区 tgz + antdv-next@1.5.2/vue@3.5.0；完整 consumer 类型与 Card/Form/Table/List/Field 浏览器渲染、动态前缀/locale/暗色均通过。第 1 轮探针选择器命中多个 Card，经唯一标记修正后第 2 轮通过；两轮测试目录均经原生 PowerShell 路径核验并清理。证据 minimum-peers-*.log / minimum-peers-verification.json。
11. Playground 逐页渲染与独立源码加载检查已首次全过，证据 playground-verification.json；此检查不替代各示例的交互验收。核心新增示例落盘后再验证最终路由集。
12. 响应式与方向检查回流 Card 分栏 wrapper 的 box-sizing 与实际宽度、RTL 公开部位及方向继承。补充真实 1440→390→1200 视口变化及嵌套比例断言；不以修改 viewport 模拟属性代替浏览器布局。
13. 十项 D01 演示统一迁到正式 API；自定义 valueType 同时用于展示/搜索/编辑，ErrorBoundary 实际捕获单元格渲染异常并恢复。类型驱动运行时 props 更新曾被旧 Vite 缓存遮蔽，重启专用 9903 后十项全部通过，24 项独立集成探针全部通过。
14. T11 回流请求快照、日期格式化→transform→beforeSearchSubmit 顺序、防抖/重置去重、loading 对象、分页配置变化及游标历史。轮询采用完成后调度，最小间隔 2000ms，慢请求不重叠，隐藏暂停及卸载清理；新增六条请求契约单元断言。
15. 表单提交回流 submitTimeout 只解除关闭保护的语义、默认取消保稿与 destroyOnHidden 销毁恢复初值、真实 history.back/forward 和 pending 卸载保护。表单两个浏览器文件共 43 条全部通过；表单字段级与未穷举组合边界写入 forms-evidence.md。
16. 新增真实旧示例回归发现 cardBordered 的 bordered=true 被固定 borderless variant 覆盖，修复为按 cardBordered 选择真实 Card variant；实际两个 Card 均通过 1px→0px→1px。OtherCustomSettingIcon 移除外部模拟面板后，通过正式 options.setting 入口、列显隐与浮层高度断言。四项补充迁移交互全部通过。
17. ProList/BaseProList、ProDescriptions、表格增强、辅助组件各补独立 Playground 与双语文档演示。公开泛型消费者除正例外补负例，英语编辑校验 fallback 通过 Provider 消息注入，防止仅正常 Form 路径国际化而即时 ref 保存遗漏。
18. 新示例完整交互复核：辅助示例两处模板多语句绑定无法编译，抽为具名函数后文档/演示构建恢复；另回流 Search.loading、ProList cardActionProps 的声明未消费问题。ProDescriptions 请求、必填校验、保存重载、取消恢复四项首轮通过；Row/CellEditorTable 的 dataSource 路径显示空数据被单独回流，不能由 DragSort 或默认 value 路径的通过推断。

19. 收尾回流 Row/CellEditorTable 的 dataSource/defaultDataSource 与 v-model:dataSource 真实映射、Search.loading 到默认查询按钮、ProList grid 的 cardActionProps/元信息/插槽/语义部位。类型导入变化后旧开发服务仍缓存旧 runtime props，冷启动后四族 21 项交互全部通过。随后移除 FieldRender 的 Vue 保留 key 普通属性，并通过 VNode key 保留 schema/render 参数；详情示例修正非法 span，两个运行警告均消失。
20. 最终第一轮全量单元 396/396 通过，浏览器 112/113；远程查询测试在 flushPromises 后过早检查默认防抖请求，改为等待真实请求及结果呈现，不修改业务时序。真实打包消费者负例发现 ProList<Row> 的 request 返回值未保持 Row 约束，显式绑定 ProRequest<T,P> 后全部五项负例有效。保留首次失败日志 final-browser-attempt1.log、final-package-attempt1.log。最后全量浏览器 115/115 通过，真实包及最低 peer 的全部消费者类型通过。
21. 补充 Card 受控/禁用 tabs、ghost 和对象 tooltip 两项回归后共 12/12。全库格式检查发现 78 个本轮文件需格式化，定向修复时暴露模板多语句 click 被去除分号、consumer 负例注释不再紧邻错误属性两项回归。分别提取具名点击函数、将五项指令放到实际错误属性前，保留全部行为与泛型负例；43 个本轮 Vue 模板真实编译通过。最终单元 396/396、浏览器 115/115、三项目类型、lint、构建、包和最低 peer 均通过；独立 24/10/4/21 组交互及全部 60 路由再次复验通过。包格式回归失败日志保留为 final-package-attempt2.log。

## 运行与临时目录

- 主控本轮创建的 9903 验证服务已停止；用户 9902 服务未操作。
- 上游只读源码目录 pro-components-audit-20261021-01a15d5a 的历史清理曾被自动审核拒绝，按约束保留，不以其他方式重试。
- 最低 peer 测试使用本次独有的 scratch-tests/pro-minimum-peers-* 子目录，脚本 try/finally 先校验解析绝对路径与链接属性，再清理；没有把用户原有文件或成果当临时测试删除。

以上是实施中记录，不代表最终验证结论；最终结果以 test-report.md 与留存证据为准。
