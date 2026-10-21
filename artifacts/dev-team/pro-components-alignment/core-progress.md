# 核心组件实施进度

日期：2026-10-21。归属 `/root/alignment_core`。本域源码与测试已冻结，逐 AC 证据见 [core-evidence.md](./core-evidence.md)。本文是领域交接，不替代整库最终报告。

## 已完成

- Card：响应式列包装、两轴 gutter、split/direction/wrap/center、Group/Divider、历史 TabPane、受控 tabs/禁用/ghost、选中/键盘/禁用、原生 Card token、Tooltip 对象真实浮层及七部位语义样式；中英文文档已核对。
- Table：搜索复用 SchemaForm/LightFilter、完整工具栏、selection alert、真实 cardBordered、渲染扩展与 ErrorBoundary、原生属性/列透传、v3 渲染参数、统一 Field valueType、列设置/持久化、日期转换/防抖/loading/轮询/cursor/请求竞态。
- Editable：single/multiple、受控 keys/ref、缓存/树形 creator、校验与异步保存、顶层 maxLength、原生 formRef、国际化 fallback；保留 Vue 事件与模型契约。
- ProList/BaseProList：复用 Table 请求/分页/选择/编辑，metas/展开/语义与 slots；grid 使用已有 ProCard，操作真实进入 extra/footer，支持 itemCardProps。
- ProDescriptions：真实 Field 与 Form、单字段保存/独立草稿、受控 keys/自定义依赖、请求竞态；特殊 schema key 从 VNode 读取，消除 Vue reserved-prop 警告。
- DragSort/RowEditor/CellEditor 与公开辅助组件：拖拽/键盘、行/格独立生命周期与校验、双击/150ms blur、双模型、受控 popover/回调去重、prefix/locale/RTL/Pro token/classes/styles。
- D01：十个原审计例与四个补充例迁到真实公共契约，主控真实交互 10/10、4/4。
- 发布类型：五个泛型组件记录/回调/ref 约束保留；ProList request 在发布 DTS 中显式保留泛型；五个消费者负例均保留且已改成格式稳定的实际错误属性前注释。

## 最后验证与回流修复

| 项目                      | 结果                                                                  |
| ------------------------- | --------------------------------------------------------------------- |
| 主控最终全 browser        | 8 文件115/115，通过                                                   |
| 主控全量 unit+coverage    | 13 文件396/396，通过；语句90.06%/分支82.51%/函数82.78%/行92.46%       |
| 主控三项目类型、两项 lint | 通过                                                                  |
| 主控生产构建与页面验收    | playground/docs build、60路由、24集成、10D01、4补充、四族21交互，通过 |
| 最后 verify:package       | consumer 注释回流后，通过；最低 peer 由主控串行复核                   |
| Card 最后定向浏览器       | 12/12，通过；包括新增受控/禁用/ghost 与真实对象 Tooltip               |
| 新族+QA 最后合跑          | 32/32，通过；core-new 20、QA 12                                       |
| 本域较早单元快照          | 4 文件41/41，通过；后续全量以主控日志为准                             |
| 格式化                    | 只处理 final-static 指定的72个本域文件                                |
| 同批 Vue 模板编译         | 43/43，通过                                                           |
| 包 vue-tsc                | 格式化后通过                                                          |
| 发布消费者 tsc            | 基于主控最新 dist，通过；五泛型负例均有效                             |
| consumer 格式检查         | 通过                                                                  |

格式化阶段发现并已修复两项问题：ProCard 模板中的多语句 @click 被移除分号，现提到具名函数；consumer 多行调用使错误注释位置偏移，现统一放在实际错误属性前。两个问题均保留原行为与负例强度，没有删除失败断言。

此前回流还修复了 Descriptions 声明保留 key、ProList 发布声明 request 泛型、QA 对默认 debounce 的错误即时断言。后者改为等待一次真实请求及返回行，不修改业务防抖。

## 主控接续与边界

主控已收到源码/测试冻结通知，最终全量 browser、静态检查、生产 build、verify:package 均已通过，正在统一完成最终 tgz 与最低 peer。最终结果以主控最新日志为准，早期成功构建不冒充最后源码构建。Card 与兼容说明仅后续文档修订，业务源码保持冻结。

AC-T02/T03 的共享表单行为、T09 的全 valueType 模式、Q01 的全组件语义需要与 forms/foundation 证据联合。轮询的隐藏标签页暂停/恢复和卸载取消有定向单元断言，但使用 getter mock 与 fake timer，没有独立切换真实后台标签页；完整原生 API、全浏览器/OS/时区和逐像素相等均不作额外保证。editable.form 的 React 实例注入不能原样移植，已文档化为真实 Vue formRef；这不是静默忽略后宣称支持。

排除族没有新增。没有提交、发布、部署、回滚用户改动；本域没有待清理的大型一次性安装项目。上游审计 checkout 清理被策略拒绝的情况由主控统一报告。
