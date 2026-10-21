# ProComponents 保留范围验收报告

状态：保留范围已实现并完成最终验收。日期：2026-10-21。

范围以 [implementation-scope.md](./implementation-scope.md) 为准。上游固定提交 `3bf43278d39f2d31489749132982488f57a9eb5e`，版本 `3.1.15-7`。本轮保留 Vue 的插槽、事件、ref 和 `classes/styles` 设计，不要求框架内部节点或哈希逐字相同。

## 验证结果

全部 60 条验收编号中，保留范围 **57 条通过、0 条失败、0 条无法验证、0 条未实现**；AC-M01/M02/M04 共 3 条整项排除，AC-M06 另排除登录表单部分。没有已知严重缺陷。通过范围以逐项证据和本文边界为准，不表示全部框架内部节点或 CSS 像素相同。

| 最终检查                                       | 结果                                          | 证据                                                                                                                       |
| ---------------------------------------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| 单元测试及现有覆盖率门槛                       | 13 文件，396/396，无跳过                      | [final-unit-coverage.log](./final-unit-coverage.log)                                                                       |
| Chrome 浏览器测试                              | 8 文件，115/115，无跳过                       | [final-browser.log](./final-browser.log)                                                                                   |
| 独立集成探针                                   | 24/24                                         | [runtime-verification.json](./runtime-verification.json)                                                                   |
| D01 演示实际交互                               | 10/10                                         | [example-interactions.json](./example-interactions.json)                                                                   |
| 补充迁移演示交互                               | 4/4                                           | [migrated-examples-verification.json](./migrated-examples-verification.json)                                               |
| 新增四组件族交互                               | 21/21                                         | [new-family-demo-verification.json](./new-family-demo-verification.json)                                                   |
| Playground 页面及独立源码                      | 60/60，pageerror 采集及编译错误覆盖层检查通过 | [playground-verification.json](./playground-verification.json)                                                             |
| 包、Playground、文档类型；两项 lint            | 全部通过                                      | [final-static.log](./final-static.log)                                                                                     |
| 包构建、真实 ESM/CJS、DTS 消费者、样式、包清单 | 全部通过，5 项泛型负例全部有效                | [final-package.log](./final-package.log)                                                                                   |
| Playground、文档生产构建                       | 全部通过                                      | [final-production-build.log](./final-production-build.log)、[final-docs-build.log](./final-docs-build.log)                 |
| 最低 peer 真实包安装、类型及浏览器             | antdv-next 1.5.2 / Vue 3.5.0 全部通过         | [minimum-peers-verification.json](./minimum-peers-verification.json)、[minimum-peers-types.log](./minimum-peers-types.log) |
| 全库格式、差异空白检查                         | 通过                                          | [final-format.log](./final-format.log)、[final-diff-check.log](./final-diff-check.log)                                     |

覆盖率在现有 include 范围内：语句 90.06%（1305/1449）、分支 82.51%（1109/1344）、函数 82.78%（279/337）、行 92.16%（1118/1213）。它不代表全部新增源码覆盖率。各组浏览器探针与测试可能覆盖同一行为，不将这些数字相加声称为独立功能数量。

本轮共 21 条集成记录，其中 17 批缺陷回流为记录 1、2、3、5、6、7、8、10、12、13、14、15、16、18、19、20、21；全部闭环。历史失败保留在对应日志和 [integration-notes.md](./integration-notes.md)，不作为最终失败数。实现细节分别见 [core-evidence.md](./core-evidence.md)、[forms-evidence.md](./forms-evidence.md)、[foundation-evidence.md](./foundation-evidence.md)。

最终运行命令：

```powershell
pnpm --filter @bubblesjs/antv-next-pro test:coverage
$env:PRO_BROWSER_CHANNEL='chrome'
pnpm --filter @bubblesjs/antv-next-pro test:browser
pnpm --filter @bubblesjs/antv-next-pro exec vue-tsc -p tsconfig.json --noEmit
pnpm --filter playground exec vue-tsc -p tsconfig.json --noEmit
pnpm --filter docs exec vue-tsc -p tsconfig.json --noEmit
pnpm run lint:ox
pnpm run lint:vue
pnpm run format:check
git diff --check
pnpm --filter @bubblesjs/antv-next-pro verify:package
pnpm --filter playground build
pnpm --filter docs build
pnpm --filter @bubblesjs/antv-next-pro pack --out C:/malei/stu/antv-next-pro/artifacts/dev-team/pro-components-alignment/antv-next-pro-peer-check.tgz
& artifacts/dev-team/pro-components-alignment/verify-minimum-peers.ps1 -PackageArchive C:/malei/stu/antv-next-pro/artifacts/dev-team/pro-components-alignment/antv-next-pro-peer-check.tgz
```

独立交互脚本为 verify-alignment、verify-example-interactions、verify-migrated-examples、verify-new-family-demos、verify-playground（均为同目录 .mjs）。最后全部针对本次专用 9903 服务复验通过。

## 60 条逐项验收

下表保留全部编号，AC-M01/M02/M04 三条及 AC-M06 的登录族明确排除。其余 57 条按已授权范围验收；单个代表性烟测不能代替整条验收。

| 编号   | 结果     | 实现和验证证据                                                                                                                                           |
| ------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-G01 | 通过     | Field/控件/状态公开类，Card/Table/工具栏/Schema/组合布局部位；foundation-evidence、core-evidence、forms-evidence，动态浏览器探针。                       |
| AC-G02 | 通过     | ant→demo 动态前缀、完整实例前缀、嵌套和局部覆盖；Provider 单元、布局浏览器、runtime-verification。                                                       |
| AC-G03 | 通过     | attrs 到真实根/Form/弹层；原生 Table、列、事件、汇总和 Editable 透传；表单及 Table 浏览器用例。                                                          |
| AC-G04 | 通过     | 运行时全局 token/默认/暗色/compact/自定义算法、嵌套与恢复；Provider 单元及独立浏览器探针。                                                               |
| AC-G05 | 通过     | 原生 Card/Table/Form token 与 Pro token 各有真实消费断言；本报告列出消费清单，不把仅有类型视为生效。                                                     |
| AC-G06 | 通过     | 同一注册类型用于 Table 展示/搜索/编辑、Schema 和组合表单；读写/只读、嵌套与动态更新。                                                                    |
| AC-G07 | 通过     | token 深合并、intl 显式替换及消息回退、valueType 按键继承/同名替换、并列缓存隔离。                                                                       |
| AC-G08 | 通过     | 原生 locale 动态切换简中/英文；查询/工具栏/编辑/提交/步骤/字段/验证码/上传/aria 自带文案。                                                               |
| AC-G09 | 通过     | 运行时 LTR/RTL、Card 嵌套、Table 根及操作区、表单/筛选/步骤/上传；公开部位与键盘交互按领域浏览器验证。                                                   |
| AC-G10 | 通过     | 真 ProForm 与 BetaSchemaForm；旧 SchemaForm/Form/Embed 保留；Radio/Checkbox/DatePicker 等组合成员，ESM/CJS/consumer。                                    |
| AC-C01 | 通过     | colSpan/colStyle/gutter/split/wrap/direction/center；真实 1440→390→1200 视口及嵌套分栏比例与换行。                                                       |
| AC-C02 | 通过     | tabs 受控/默认/禁用/事件；Group/Divider 和旧 TabPane 兼容，组合成员包验证。                                                                              |
| AC-C03 | 通过     | checked/onChecked 受控、鼠标/键盘/禁用；boxShadow 真 token 消费。                                                                                        |
| AC-C04 | 通过     | tooltip 配置、title/extra/heading/body/collapse、loading 与现有 cover/actions/ghost/classes/styles。                                                     |
| AC-T01 | 通过     | 搜索默认折叠、全屏默认隐藏；middle、id、keyword、revalidateOnFocus 默认值及显式配置；Table 单元与浏览器。                                                |
| AC-T02 | 通过     | 必填/异步搜索校验、点击/Enter/ref 统一提交和页码重置；校验失败零请求、成功一次请求；Table 浏览器与必填示例交互。                                         |
| AC-T03 | 通过     | 真实 QueryFilter/LightFilter、form/formRef、optionRender/collapseRender、字段依赖及转换；Table 浏览器与筛选示例交互。                                    |
| AC-T04 | 通过     | ListToolBar title/menu/tabs/multipleLine/settings/filter 与插槽；新族浏览器和 D01 真实交互。                                                             |
| AC-T05 | 通过     | tableRender/view/extra/search 扩展、Alert、Card 与可替换 ErrorBoundary；渲染异常捕获及恢复。                                                             |
| AC-T06 | 通过     | Table/Column 原生属性、展开/事件/组件/summary/locale/tableClassName/tableStyle，Editable 同链路。                                                        |
| AC-T07 | 通过     | children 分组、v3 render(dom, record, index, action, schema)、renderText/formItemRender；迁移文档和真实类型消费者。                                      |
| AC-T08 | 通过     | 状态/颜色、日期数值、indexBorder、copyable、ellipsis、空/0/false/非法日期；Field 与 Table 回归。                                                         |
| AC-T09 | 通过     | 42 个内置 valueType，字符串/对象/函数与 Provider 扩展；field-mode-matrix、Table/Schema 浏览器和 consumer。                                               |
| AC-T10 | 通过     | 列显隐/排序/固定/持久化/重置、自定义设置、鼠标和键盘拖动；Table 浏览器用例。                                                                             |
| AC-T11 | 通过     | beforeSearchSubmit/dateFormatter/debounce、提交/重置/loading 回调、loading 对象、分页/游标；polling 完成后调度、2000ms 下限、慢请求/隐藏/卸载。          |
| AC-E01 | 通过     | 默认 single 保留草稿、显式 multiple、controlled keys 与实例动作；editable 单元及浏览器。                                                                 |
| AC-E02 | 通过     | 表内 top/bottom creator、按钮及 parentKey/newRecordType、添加/取消/保存。                                                                                |
| AC-E03 | 通过     | Vue editable.formRef 绑定真实原生 Form、换 ref/卸载清理、formProps、editableFormRef 数据动作、回调/树/表单联动。旧 React form 实例入口的迁移边界见下文。 |
| AC-E04 | 通过     | 原生 Form/Popover 校验、异步保存、失败不保存、顶层 maxLength 与树子项边界。                                                                              |
| AC-F01 | 通过     | 无 columns 的组合字段注册/依赖/校验/ref/提交，与 BetaSchemaForm 共用布局能力。                                                                           |
| AC-F02 | 通过     | 默认 vertical、原生 Form props/布局、外部 attrs；旧默认变化有迁移说明。                                                                                  |
| AC-F03 | 通过     | QueryFilter 容器、折叠/列宽/labelWidth/操作区，桌面窄屏与值/校验保留。                                                                                   |
| AC-F04 | 通过     | LightFilter 标签和真实浮层、更多/secondary/collapse/placement/footer；确认校验、取消恢复和清除提交。                                                     |
| AC-F05 | 通过     | 独立步骤实例、每步等待/拒绝/false、回退草稿、聚合校验、formMap/formRef、动态步骤。                                                                       |
| AC-F06 | 通过     | Modal/Drawer 真实 props、trigger/open/事件、受控/非受控、销毁和保值两套入口。                                                                            |
| AC-F07 | 通过     | pending loading/防重复、仅 true 关闭、false/void/reject 保留、卸载保护；submitTimeout 到期只解除关闭保护。                                               |
| AC-F08 | 通过     | submitter false/render/slots/searchConfig/button props；默认、loading/disabled、绑定、步骤推进与重置。                                                   |
| AC-F09 | 通过     | URL/initialValues 优先级、转换、popstate 删除/前进后退、嵌套和等价对象不重置草稿；旧 urlSync 扩展。                                                      |
| AC-F10 | 通过     | Group/FieldSet/List/Dependency/Item、List copy/move/guard/min/max/key/嵌套、convertValue/transform 顺序。                                                |
| AC-P01 | 通过     | 19 原字段与 16 新字段公共 props 路由、width、注册/转换；field-wrapper-contract 和布局回归。                                                              |
| AC-P02 | 通过     | 42 valueType 的 read/edit/update，19 字段只读、空值/0/false/locale；LightFilter 显示和宽度。                                                             |
| AC-P03 | 通过     | 关键字/参数/debounce/缓存/最新请求、失效/并列/错误/卸载；pro-form-fields-options 单元。                                                                  |
| AC-P04 | 通过     | Money locale/符号/精度/分组，负/0/小数/大数及受控原始值；金额精确字符串矩阵。                                                                            |
| AC-P05 | 通过     | Captcha 手机校验/传参、失败不计时、按钮文案/ref/倒计时/卸载和防重复。                                                                                    |
| AC-P06 | 通过     | UploadButton 图标/结构/props/max/受控；Chrome 文件选择→进度→失败→删除→入口恢复。                                                                         |
| AC-P07 | 通过     | UploadDragger 原生层级、slots/语义样式；真实 DOM 多文件 drop、成功/max/清空后禁用独立断言。                                                              |
| AC-P08 | 通过     | Radio/Checkbox.Group、DatePicker/TimePicker/Select/Text 组合成员；逐项受控/只读/注册与包类型。                                                           |
| AC-M01 | 本次排除 | 不新增 ProLayout/PageContainer 及完整布局族。                                                                                                            |
| AC-M02 | 本次排除 | 不新增 StatisticCard/CheckCard 及统计/选择卡族；保留 ProCard 修复。                                                                                      |
| AC-M03 | 通过     | ProList/BaseProList/Descriptions 的请求/分页/受控选择/展开/meta/Field/编辑；core-new-families 浏览器。                                                   |
| AC-M04 | 本次排除 | 不新增 ProSkeleton 及骨架屏族。                                                                                                                          |
| AC-M05 | 通过     | ProField/29 原子入口/Provider/34 intl 与模式矩阵；FieldStatus 是组合对象，非伪造可渲染组件。                                                             |
| AC-M06 | 通过     | 组合 ProForm/BetaSchemaForm/Group/FieldSet/List/Dependency/Item 等真实交付；LoginForm/LoginFormPage 部分排除。                                           |
| AC-M07 | 通过     | 16 新增字段及组合成员逐项类型、清空、受控、只读和真 Form 注册；field-mode-matrix。                                                                       |
| AC-M08 | 通过     | DragSort/RowEditor/CellEditor/ListToolBar/TableDropdown.Button 与具名入口，拖拽/编辑/校验/菜单/键盘。                                                    |
| AC-D01 | 通过     | 十项审计演示迁到正式 API，逐项点击验证；附加旧替代示例同步更新，页面与源码可独立加载。                                                                   |
| AC-Q01 | 通过     | classes/styles 对象与 ({props}) 回调；部位/动态更新/基础类保留/classes 优先 classNames，token 局部覆盖。                                                 |
| AC-Q02 | 通过     | 全单元/浏览器/consumer/包/最低 peer/构建和静态检查，见最终命令和日志表。                                                                                 |
| AC-Q03 | 通过     | 中英文 API/示例/导航/迁移/changeset；保留新增族各有可运行演示。                                                                                          |
| AC-Q04 | 通过     | 本报告全部 60 编号、保留导出与 token 消费展开，临时目录/未提交工作区处理记录。                                                                           |

## 保留 M 组交付展开

- M03：ProList、BaseProList、ProDescriptions、ProDescriptions.Item/ProDescriptionsItem。
- M05：ProConfigProvider/ProProvider，useProConfig/useIntl/useProPrefix/createIntl、intlMap 与 34 个语言实例；ProField 及 Text、Cascader、Checkbox、Code、ColorPicker、DatePicker、Digit、DigitRange、FromNow、Image、Money、Options、Password、Percent、Progress、Radio、RangePicker、Rate、Second、Segmented、Select、Slider、Switch、TextArea、TimePicker、TimeRangePicker、TreeSelect、IndexColumn、Status 共 29 个 Field 入口；FieldStatus 的五种状态成员、BadgeColor 与字段创建/预加载辅助入口。
- M06：ProForm、BetaSchemaForm、Group、FieldSet、List、Dependency、Item、ErrorList、Provider、useForm/useFormInstance/useWatch；Modal/Drawer/Query/Light/Steps/Step 布局以及旧 SchemaForm/Form/Embed 兼容入口。
- M07：Cascader、ColorPicker、Rate、DigitRange、TimePicker、TimeRangePicker、DateWeek/Month/Quarter/YearPicker、DateWeek/Month/Quarter/YearRangePicker、CheckboxGroup、SearchSelect；Radio.Group/Button、Checkbox.Group、DatePicker.Week/Month/Quarter/Year、TimePicker.RangePicker、Select.SearchSelect 和 Text.Password。
- M08：DragSortTable、RowEditorTable、CellEditorTable、ListToolBar、TableDropdown、TableDropdown.Button/TableDropdownButton、Search。保留辅助组件：LightWrapper、ErrorBoundary、DropdownFooter、FieldLabel、FilterDropdown、InlineErrorFormItem、LabelIconTip。
- Card 额外组合：Group/Divider/TabPane 及其具名入口。TabPane 是旧官网用法的兼容入口，不宣称为固定 v3 提交的现有导出。

完整字段逐项断言和适用边界见 [field-mode-matrix.md](./field-mode-matrix.md)。固定上游原始全部导出仅作为参考，见 export-inventory.md，不将已排除组件算入交付。

## 主题入口和实际 token 消费

`ConfigProvider.theme` 控制原生算法/全局 token；`theme.components.Card/Table/Form/Result` 控制原生组件；`ProConfigProvider.token` 覆盖 Pro 自有区域。没有引入虚构的 `theme.components.ProTable` 键。

| Pro token                             | 实际消费                                                                  |
| ------------------------------------- | ------------------------------------------------------------------------- |
| colorText / colorTextSecondary        | Field、Table/Form/List、Card 副标题和辅助文字                             |
| colorPrimary / colorPrimaryBg         | Card 选中轮廓、Table 列设置选中项及选择提示                               |
| colorBgContainer / colorBgElevated    | Table 全屏/List、列设置浮层及 DropdownFooter                              |
| colorFillAlter / colorBorderSecondary | Table 拖拽悬停、Schema 列表、Card/List/Alert/Footer 分隔                  |
| colorError / boxShadowSecondary       | 编辑错误、FilterDropdown 浮层                                             |
| paddingLG / borderRadiusLG / margin   | Group/Query/Steps/List/工具栏/浮层间距、Table 提示圆角、Field option 间距 |
| boxShadow / padding / paddingXS       | Card 阴影和标题内边距回退；显式原生 headerPadding 配置优先                |

`layout.*` 只有类型和嵌套合并协议，本轮排除布局族，没有新增对应页面外观消费者。继承 GlobalToken 类型不等于所有 token 都有独立 Pro 消费部位。详细清单见 foundation-evidence.md 和双语 Provider 文档。

## 明确的适配及验证边界

- Vue `editable.formRef` 读取/绑定组件内部真实的原生 Form。React 外部 form 实例无法注入 Vue 原生 Form；旧 `editable.form` 仅弃用兼容类型，实际迁到 `formRef`/`formProps`，不宣称行为等同注入。
- 34 语言有基线数据及回退规则，主要动态交互验证简中与英文；未逐字人工审校全部语言。用户自定义业务标题、字段值和节点由业务翻译。
- 上传使用浏览器真实 DOM input/drop 与模拟 transport，不称为 OS 对话框/系统拖拽或真实服务器验证。无 transport 的默认本地选择策略有文档说明。
- 兼容验收覆盖公开语义和适用交互，不声称全浏览器/时区/原生 API 的穷尽测试或全部 CSS 像素相等。
- 覆盖率遵守已有 include 范围，仅覆盖 Table TS、Schema utils 与部分字段，不能外推为全部新增源码覆盖率。
- 开发服务在批量切换示例时曾输出原生 InputNumber 的 addonAfter 弃用提示和 ResizeObserver 通知延迟；最终探针的 pageerror 采集为空，功能断言通过，不将其表述为整个开发控制台没有任何提示。生产构建仍有大 chunk 和预加载模块同时被静态引用的提示，不承诺本轮完成体积优化。

## 工作区与临时资源

保留用户原有未提交修改；本轮没有提交、发布或部署。主控专用验证服务 9903 已停止，用户既有 9902 服务未操作。

最低 peer 安装测试使用 `C:\Users\Administrator\Documents\Codex\scratch-tests\pro-minimum-peers-*` 独有子目录，脚本 try/finally 核验解析后的绝对路径及目录链接属性后清理。最终清理结果以 minimum-peers-run.log 为准。

历史上游只读目录 `C:\Users\Administrator\Documents\Codex\scratch-tests\pro-components-audit-20261021-01a15d5a` 的清理曾被自动审批拒绝，按约束保留，未绕过限制重试；现有记录未保留拒绝理由原文。

使用的协作技能：[dev-team-orchestration](C:/Users/Administrator/.codex/skills/dev-team-orchestration/SKILL.md)。用户已确认范围并授权实现，本轮没有再要求范围确认。实现与缺陷回流见 [integration-notes.md](./integration-notes.md)。
