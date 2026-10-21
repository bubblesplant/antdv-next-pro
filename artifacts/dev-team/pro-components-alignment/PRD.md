# ProComponents 保留范围对齐 PRD

状态：用户确认的保留范围已实现并完成最终验收，57 条通过、3 条整项排除，登录表单部分另排除。范围以 [implementation-scope.md](./implementation-scope.md) 为唯一权威；本文保留原始差异与 60 个验收编号，排除项不计为通过。逐项结果和验证边界见 [test-report.md](./test-report.md)。

日期：2026-10-21。范围依据：用户要求修复上一轮审计的全部差异，保留 Vue 合理适配；语义样式接口以 antdv-next 的 `classes` 为准，保留 `styles`；ConfigProvider 支持涵盖国际化、前缀、方向与完整主题继承。

## 1. 输入、目标与基线

- 审计输入：[report.md](../../pro-components-audit-2026-10-21/report.md)，共 **52 个差异编号**：G01–G06、C01–C04、T01–T11、E01–E04、F01–F10、P01–P08、M01–M08、D01。
- 原始证据：[runtime-evidence.json](../../pro-components-audit-2026-10-21/runtime-evidence.json) 与 [verify.mjs](../../pro-components-audit-2026-10-21/verify.mjs)。原有探针用于保留审计证据，新的兼容验收应另行编写，避免覆盖历史结果。
- 行为与公开能力基线：[ProComponents 官网](https://pro-components.antdigital.dev/)，源码固定为 [3bf43278d39f2d31489749132982488f57a9eb5e](https://github.com/ant-design/pro-components/tree/3bf43278d39f2d31489749132982488f57a9eb5e)，对应包版本 `3.1.15-7`。固定源码不等于已经证明官网部署采用该提交；发生不一致时记录两者和取舍，不凭印象替换行为。
- Vue 组件与基础设计基线：[antdv-next](https://www.antdv-next.com/)，本工作区实际安装 `antdv-next 1.6.0`、`vue 3.5.44`；组件包声明的 peer 最低范围为 `antdv-next ^1.5.2`、`vue ^3.5.0`。本地包为 `@bubblesjs/antv-next-pro@0.1.4`，README 曾主要参考 ProComponents `2.8.10`，本次以当前审计的 v3 基线更新。实际安装版本与声明兼容范围需要分别验证，不能相互替代。
- 实现边界：Vue 组件库、导出与类型、文档、示例和测试；不建设后端服务，不依赖真实业务数据，不自动发布包或部署站点。

目标是让用户把保留范围内的官方示例改成 Vue 语法后，获得对应的组件能力、默认行为、公开语义区域和配置继承。M03/M05/M07/M08 及 M06 的组合表单部分纳入；M01 新布局族、M02 统计/选择卡族、M04 骨架屏族及 M06 登录族本次排除。现有实现保留，保留组件依赖的轻量内部布局或辅助行为仍可建设。占位组件或仅转发默认插槽不视为已完成。

## 2. 已确认约定与兼容边界

| 事项           | 约定                                                                                                                                                                                             |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Vue 适配       | 允许 `className → class`、ReactNode/render node → VNode/插槽、受控值 → `v-model`、事件 → Vue 事件、`actionRef/formRef →` 组件 ref；参数含义、传递目标、执行时机和业务结果须一致                  |
| 语义类名 API   | 主入口使用 **`classes`**，按 antdv-next 的语义区域约定；`styles` 保留。同一部位同时给出旧 `classNames` 与 `classes` 时以 `classes` 为准；旧名可保留兼容别名并标记迁移，不要求用户改用 React 命名 |
| 内置 DOM 类名  | 默认使用官网相应 `ant-pro-*` 根、部位、布局与状态类；全局 `prefixCls="demo"` 时变为对应 `demo-pro-*`，单组件显式前缀优先；不是仅替换根节点字符串                                                 |
| 框架内部差异   | 不要求 Vue scoped 标记、React CSS 哈希、框架内部辅助节点逐字一致；公开选择器、语义区域、状态与必要布局结构需要对应                                                                               |
| ConfigProvider | 直接继承 antdv-next 的 locale、prefixCls、direction、主题算法、全局 token、原生组件 token；仅有 `theme.useToken()` 或暗色背景不算完整支持                                                        |
| Pro 全局配置   | 提供 ProProvider/ProConfigProvider 对应上下文，支持 Pro 扩展 token、intl、自定义 valueType；`ProConfigProvider.token` 对标官方入口，不宣称官方已支持 `ConfigProvider.theme.components.ProTable`  |
| 原生组件 token | `theme.components.Result` 作用于原生 Result；Card/Table/Form 等已有原生 token 应通过包装层保留相应语义。Pro 自有部位通过继承的全局 token 与 Pro 扩展 token 定制                                  |
| 局部配置       | 嵌套 Provider 继承父级，最近的显式配置优先；按字段合并，不因局部覆盖一个 token/文案而丢失其他父级配置                                                                                            |
| 文案与 RTL     | 组件自带文案随配置统一切换；用户提供的标题、字段值、按钮节点不被擅自翻译；自有方向相关布局与底层组件一起响应 RTL                                                                                 |
| 既有使用者     | 现有公开扩展能无冲突保留的保留；官网名称为兼容主入口。默认值、回调或类名的变更必须提供明确迁移说明与版本变更记录，不靠运行时猜测回调参数数量兼容                                                 |
| 用户工作区     | 保留现有未提交修改；不回滚、不覆盖审计前修改，不把原有示例或源码当临时文件清理                                                                                                                   |

本需求未要求所有官网内部 hook、非公开工具函数逐一移植。M 组保留范围内的公开 UI 族及其组合成员需要真实实现；export-inventory.md 保留固定上游参考，具体建设仍受 implementation-scope.md 约束。上游 React 专属内部实现使用 Vue 等价机制替代，不机械导出不存在的上下文或工具函数。

## 3. 用户故事

| 编号 | 用户故事                                                                                                                                  | 对应验收                                        |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| US01 | 作为使用组件库的开发者，我在外层放置一个 antdv-next ConfigProvider，就能统一控制所有 Pro 与原生组件的语言、方向、前缀和主题，并能局部覆盖 | AC-G01–AC-G09、AC-Q01                           |
| US02 | 作为迁移官方示例的开发者，我主要修改框架语法即可复用公开组件、属性、列配置及交互约定                                                      | AC-G10、C/T/E/F/P/M 全部、AC-D01                |
| US03 | 作为表格使用者，我能获得一致的搜索校验、请求时序、工具栏、单元格展示和行编辑体验                                                          | AC-T01–AC-T11、AC-E01–AC-E04                    |
| US04 | 作为表单使用者，我能组合字段与布局，安全等待异步提交，并得到跨步校验、动态列表和筛选交互                                                  | AC-F01–AC-F10、AC-P01–AC-P08                    |
| US05 | 作为项目维护者，我能通过 classes/styles 和 token 定制外观，而不必依赖失效的属性或硬编码选择器                                             | AC-G01–AC-G07、AC-C01–AC-C04、AC-P01、AC-Q01    |
| US06 | 作为组件库使用者，我能使用真实的列表、描述、统一 Field/Provider、组合表单、新增字段与增强表格                                             | AC-M03、AC-M05、AC-M06 保留部分、AC-M07、AC-M08 |
| US07 | 作为既有用户，我能识别变更、按迁移文档升级，并看到真实组件能力的示例和逐项验证结果                                                        | AC-D01、AC-Q02–AC-Q04                           |

## 4. 可检验验收标准与完整差异映射

本节保留原始 **60 个验收编号**，其中 AC-M01/M02/M04 本次排除，其余 57 条按保留范围验收，AC-M06 只验收组合表单部分。一个编号内保留的断言均需通过；不能只验证一个例子就标记整条完成。结果使用“通过 / 失败 / 无法验证 / 未实现 / 本次排除”并关联证据；后三者均不计为通过。

### 4.1 全局能力：10 条，覆盖 G01–G06

| 验收编号 | 差异映射           | 可检验标准                                                                                                                                                                                                                                   |
| -------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-G01   | G01                | 默认 Card、Table、工具栏、列设置、Form、QueryFilter、LightFilter、StepsForm、List、Field 等根/部位/状态类按固定基线对应 `ant-pro-*`；新建组件也遵守同一规则。默认、加载、禁用、选中、折叠、错误等适用状态均验证；用户 classes 与基础类可共存 |
| AC-G02   | G02                | ConfigProvider 的全局前缀从 `ant` 动态改为 `demo` 后，所有 Pro 根、部位、状态类与基础组件同步更新，无遗留硬编码 Pro 前缀；单组件 prefixCls 优先且正确影响该组件内部；嵌套 Provider 的其他区域不被改变                                        |
| AC-G03   | G03、T06           | SchemaForm 及所有布局的 `class/style/id/data-*/aria-*` 到达契约指定的可见目标，无 fragment fallthrough 警告；Table 的 rowClassName 到达 tr，expandable/components/onRow/summary/locale 等到达对应底层能力而非外层 div；Editable 同样有效     |
| AC-G04   | G04                | ConfigProvider 修改全局颜色、圆角、间距 token 或切换默认/暗色等主题算法后，原生与 Pro 自有部位响应更新；运行时切换、局部嵌套和卸载后恢复均正确，不依赖刷新页面                                                                               |
| AC-G05   | G04                | 配置原生 `theme.components.Card/Table/Form` 等代表性 token 时，相应底层组件能力保留；配置 ProConfigProvider.token 时 Pro 自有语义部位响应。给出实际生效的 token 清单和类型；不把未知 token 静默接收后不使用视为支持                          |
| AC-G06   | G04、T09、M05      | ProProvider/ProConfigProvider 的 valueType 注册能让同一自定义字段在 Table 展示/搜索、Schema 表单和组合表单按注册定义工作，具备读取、编辑、只读能力；嵌套覆盖只影响本区域，运行时注册变化可响应                                               |
| AC-G07   | G04、G05           | 基础 ConfigProvider、父/子 ProProvider、组件显式配置的优先级在契约中固定；用只覆盖一个 token/一条文案的用例证明其余父配置保留；两个并列 Provider 不串语言、主题、缓存配置或自定义字段                                                        |
| AC-G08   | G05                | 仅切换 ConfigProvider.locale，即可统一切换 Table 搜索/工具/列设置/选择提示、编辑操作、表单提交/步骤、金额/布尔、验证码/上传及无障碍文案；至少验证简中与英文，无组件自带文案混用。ProConfigProvider.intl 可显式覆盖并按稳定规则回退           |
| AC-G09   | G04、G05           | ConfigProvider.direction 运行时切换 LTR/RTL，Card 嵌套、Table 工具栏/搜索/固定操作、表单、筛选弹层、步骤、上传、布局等方向敏感区域响应；逻辑顺序、键盘操作及浮层定位保持可用                                                                 |
| AC-G10   | G06、F01、P08、M06 | 正式导出 ProForm、BetaSchemaForm 和对应组合成员，组件可直接渲染而非仅占位对象；SchemaForm、Form、Embed 等旧公开入口有明确兼容映射。ProFormRadio 本身可渲染，Checkbox/Radio/DatePicker 等组合成员可用，导出及实例类型与运行行为一致           |

### 4.2 ProCard：4 条，覆盖 C01–C04

| 验收编号 | 差异映射 | 可检验标准                                                                                                                                                                                                        |
| -------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-C01   | C01      | layout=center、direction、wrap、colSpan/colStyle、gutter、split 均提供对应布局；通过桌面/窄屏和嵌套卡片验证响应式分栏、间距、分割线和换行，变更配置可响应                                                         |
| AC-C02   | C02      | tabs 及固定基线现有 ProCard.Group/Divider 可组合使用；TabPane 作为官网旧用法的兼容入口保留，不声称是固定提交 `3bf43278` 的现有导出。默认/受控切换、回调、禁用和相应公开配置按契约有效，类名与语义区域对应         |
| AC-C03   | C03      | checked/onChecked、boxShadow 与相关状态样式生效；受控值更新、鼠标/键盘触发和禁用约束按契约执行，不只增加 CSS 类而缺少交互                                                                                         |
| AC-C04   | C04      | tooltip 对象配置到达实际浮层，title/extra/heading/content/collapse 等语义结构和适用状态类对应；loading 允许 Vue 插槽/节点等价实现。现有 title/subTitle/cover/actions/ghost/折叠及七个 styles/classes 区域保持可用 |

### 4.3 ProTable：11 条，覆盖 T01–T11

| 验收编号 | 差异映射 | 可检验标准                                                                                                                                                                                                                                              |
| -------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-T01   | T01      | 未显式配置时搜索默认折叠、全屏按钮默认隐藏；显式展开/全屏选项与受控更新有效。size=middle、rowKey=id、keyword 参数名、revalidateOnFocus=false 等已对齐默认值保持                                                                                         |
| AC-T02   | T02      | 必填搜索项为空或异步校验失败时不增加请求次数，显示对应错误；通过校验后提交一次、页码按契约重置。触发查询、Enter 和通过 ref 提交都走同一校验流程                                                                                                         |
| AC-T03   | T03      | 搜索使用与独立表单一致的能力，支持 filterType=light、form/formRef、optionRender、collapseRender、完整 search 配置及列自定义搜索编辑器；字段校验/依赖/值转换有效，而非仅在外部拼装筛选条                                                                 |
| AC-T04   | T04      | headerTitle/tooltip、toolBarRender/optionsRender 和 toolbar.subTitle/tooltip/settings/multipleLine/filter/tabs/menu 均按契约实现；标题内容、设置项和工具入口的默认/隐藏/自定义/切换与回调可独立验证，插槽可作为渲染载体                                 |
| AC-T05   | T05      | tableRender/tableViewRender/tableExtraRender/searchFormRender 具有对应扩展位置；选中行后显示内建 tableAlert 及其自定义/关闭/操作能力；cardProps/cardBordered 生效；ErrorBoundary 可捕获适用渲染异常并显示可定制降级内容，不依赖业务示例外包             |
| AC-T06   | T06      | 受支持的底层 Table/Column props 保留传递，不再只白名单丢弃；以展开行、行事件、自定义组件、汇总、列 cell 配置、tableClassName/tableStyle、locale 等代表性能力验证目标与行为，透传与 Pro 自有属性有明确边界                                               |
| AC-T07   | T07      | 分组列接受 children；render/renderText/formItemRender 的参数含义按当前 v3 契约，Vue ref/VNode/插槽适配明确；旧 columns/renderFormItem 等入口具备文档化迁移，不通过错误参数顺序静默执行                                                                  |
| AC-T08   | T08      | valueEnum 的 status/color 渲染对应状态，日期字符串/数值等按 valueType 格式化；indexBorder 显示对应视觉；copyable 提供对应图标/反馈/复制结果；ellipsis 的 boolean/对象配置生效；空值、0、false、非法日期等边界不误显示                                   |
| AC-T09   | T09、M05 | 固定基线公开 valueType 全量覆盖适用的展示/编辑/搜索模式，支持字符串、对象、函数及 Provider 扩展；未知类型的处理有明确约定；不能以普通 Input 回退冒充已支持该类型                                                                                        |
| AC-T10   | T10      | 列设置支持显隐、顺序、固定左/右及对应持久化；对象型设置、自定义图标/回调和完整 setting 配置有效；现有鼠标/键盘拖拽不回归，重置和存储恢复正确                                                                                                            |
| AC-T11   | T11      | beforeSearchSubmit/dateFormatter/debounceTime、onSubmit/onReset/onLoadingChange、loading 对象及完整分页/适用游标能力按契约生效；polling 支持函数、完成后再调度及基线最小间隔，慢请求不重叠、隐藏页暂停、卸载取消；最新请求保护和 success=false 处理保持 |

### 4.4 EditableProTable：4 条，覆盖 E01–E04

| 验收编号 | 差异映射 | 可检验标准                                                                                                                                                                                       |
| -------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| AC-E01   | E01      | editable.type 未配置时默认 single；已有编辑行时尝试编辑另一行，按基线限制/提示，不能无提示取消既有草稿；显式 multiple 支持多行并行，controlled editableKeys 与 ref 操作一致                      |
| AC-E02   | E02      | RecordCreator 的 top/bottom 位置落在对应表格内部位置；按钮 props/icon/style/节点文案、parentKey/newRecordType 等有效，新增/取消/保存回调正确。不擅自新增“省略配置必须显示按钮”的非基线默认行为   |
| AC-E03   | E03      | editable.form/formProps、editableFormRef 的公开方法、onChange/onValuesChange、操作文案/提示、name 表单联动、actionRender 参数按契约有效；受控/非受控与树形数据用例均验证，Vue 事件只触发约定次数 |
| AC-E04   | E04      | 行编辑校验通过对应 Form/Popover 展示且失败不保存；异步校验/保存期间状态正确；maxLength 按基线顶层 value.length 判断，树形子节点不会被额外累计限制新增                                            |

### 4.5 表单与布局：10 条，覆盖 F01–F10

| 验收编号 | 差异映射 | 可检验标准                                                                                                                                                                                                                              |
| -------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-F01   | F01      | ProForm 与各布局无需 columns 即可组合字段子组件，字段注册、校验、依赖、ref 与提交有效；BetaSchemaForm 保留 schema 入口且可选择对应布局；两套入口共用能力，不以别名伪装不同组件模型                                                      |
| AC-F02   | F02      | 普通 ProForm 默认 vertical，Form 布局/label/control 配置和适用底层 Form props 有效；外部 class/style 正确挂载。旧 Schema/Form 默认布局变化明确迁移，保留显式 horizontal 的能力                                                          |
| AC-F03   | F03      | QueryFilter 的折叠/展开、响应式列宽、labelWidth、默认列数/展示数量、操作区与配置按固定基线实现；在约定桌面/窄屏尺寸验证，切换宽度不会丢值或绕过校验                                                                                     |
| AC-F04   | F04      | LightFilter 为对应标签/弹层筛选，具备更多筛选、secondary/collapse、placement/footer、有效值展示和约定的值变化提交流程；清除/取消/确认行为分别验证，不保留“普通 inline 表单”作为等价实现                                                 |
| AC-F05   | F05      | StepsForm.StepForm 为独立注册实例，保留每步值、校验与 onFinish；返回 false/拒绝 Promise 时不前进；回退不丢草稿，最后提交按基线合并并校验适用各步；formMap/formRef 与动态步骤增删可用                                                    |
| AC-F06   | F06      | ModalForm/DrawerForm 接收完整 modalProps/drawerProps、trigger、open/v-model 和弹层事件配置，属性传到正确目标；受控/非受控开关、取消、销毁/保留值等适用行为按基线执行                                                                    |
| AC-F07   | F07      | Modal/Drawer 等提交等待 async onFinish；Promise pending 时 loading 持续，重复提交受控；onFinish 的返回类型为 boolean \| void，返回 true 才关闭；false/undefined 或抛错保持打开并保留值；异常完成后 loading 能结束，卸载后不错误发出关闭 |
| AC-F08   | F08      | submitter 的 false、searchConfig、render、submitButtonProps/resetButtonProps 等及对应 Vue 插槽生效；默认文案、loading、禁用、表单绑定、步骤按钮和重置行为可验证，定制节点不绕过标准提交                                                 |
| AC-F09   | F09      | syncToUrl/syncToInitialValues、初始化优先级、转换/格式化和 URL 往返同步按契约实现；刷新、前进/后退、空值和嵌套值有用例；旧 urlSync 的 key/hash 扩展有显式兼容或迁移说明                                                                 |
| AC-F10   | F10、M06 | Group/FieldSet/List/Dependency/Item 可独立组合；List 的 copy/move/min/max/creatorRecord/actionGuard/actionRef、稳定行 key 和嵌套字段有效；分组布局/折叠、依赖更新与 convertValue/transform 的读写顺序有验证，不仅实现增删按钮           |

### 4.6 字段：8 条，覆盖 P01–P08

| 验收编号 | 差异映射 | 可检验标准                                                                                                                                                                                                                                              |
| -------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-P01   | P01      | 全部字段的公共 props、width 枚举、placeholder、fieldProps、formItemProps、proFieldProps、ignoreFormItem、convertValue/transform 等有明确目标；顶层 placeholder 实际进入 Input、Digit max 实际限制控件；field/form-item/readonly 模式均无错误 attrs 路由 |
| AC-P02   | P02、T08 | 统一只读/展示体系覆盖数字、金额、百分比、日期与范围、布尔、选项状态、上传等，默认占位/宽度与 LightFilter 模式对应；0/false/空数组等不被误判为空，格式化跟随 locale。所有现有 19 字段逐项有结果                                                          |
| AC-P03   | P03      | Select/TreeSelect 的关键字远程搜索、params、debounceTime、缓存配置和最新请求保护有效；快速输入、参数切换、并列实例、缓存命中/失效和错误重试有用例，不复用错误关键词结果                                                                                 |
| AC-P04   | P04      | Money 的 locale/customSymbol/numberFormatOptions 与输入/展示格式化有效；简中/英文、负数/0/小数/大数、受控更新均验证，格式化不污染提交原始值                                                                                                             |
| AC-P05   | P05      | Captcha 根据 phoneName 校验并向 onGetCaptcha 传正确手机号；校验失败不发送，发送失败按契约处理；captchaTextRender、startTiming/endTiming/ref 与倒计时/重置/卸载正确，文案受 intl 控制                                                                    |
| AC-P06   | P06      | UploadButton 默认图标/文案/结构对应，title/icon/buttonProps/max 等生效；达到 max 后对应入口隐藏或按基线表现，删除后恢复；fileList/v-model、失败/进度/自定义上传通路保持，额外本地策略有明确说明                                                         |
| AC-P07   | P07      | UploadDragger 默认图标、说明文本层级和自定义内容对应；共享上传增强、禁用、多文件、满额限制、拖拽与点击上传路径均验证，classes/styles 可作用对应语义区域                                                                                                 |
| AC-P08   | P08      | ProFormRadio 与 .Group、ProFormCheckbox.Group、ProFormDatePicker.Week/Month/Quarter/Year 等公开成员可导入、可渲染且类型可用；Radio 的 radioType/layout 等顶层契约有效；已有 ProFormText.Password 与独立 Password 别名保持                               |

### 4.7 新组件族：8 条，覆盖 M01–M08

下列每条都须先建立固定基线的公开组件/组合成员清单，再逐项覆盖 API、默认/空/加载/错误等适用状态、主题/国际化/前缀、关键交互和示例。仅导出同名 div、原生组件别名、空渲染或静态截图均不通过。

| 验收编号 | 差异映射           | 必须交付的组件族与关键验证                                                                                                                                                                                                                                                      |
| -------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-M01   | M01                | **本次排除**：不新增 ProLayout、PageContainer 及完整布局/导航/帮助组件族；固定上游导出仅作参考，现有实现保留                                                                                                                                                                    |
| AC-M02   | M02                | **本次排除**：不新增 Statistic/StatisticCard/CheckCard 及统计/选择卡完整组件族；ProCard 已有选择状态和布局修复仍按 C 组验收                                                                                                                                                     |
| AC-M03   | M03                | ProList、BaseProList、ProDescriptions；验证 request/dataSource、分页、选择/展开、meta/列配置、响应式展示、只读格式化及适用编辑/联动能力，复用标准 Field 和请求链路，不能仅把数组循环渲染                                                                                        |
| AC-M04   | M04                | **本次排除**：不新增 ProSkeleton 及 page/list/table/descriptions 骨架屏族，不能将排除记为通过                                                                                                                                                                                   |
| AC-M05   | M05、G04、T09      | ProField、FieldText/FieldMoney/FieldStatus 等固定基线公开原子字段，ProProvider/ProConfigProvider、intl 与自定义 valueType 注册；验证各公开类型的 read/edit 模式、数据转换、状态/格式和 Provider 继承。与 AC-G04–AC-G09 共享成果但单独核对导出及覆盖完整性                       |
| AC-M06   | M06、G06、F01、F10 | **保留组合表单，排除登录族**：交付独立 ProForm、BetaSchemaForm、ProFormGroup/List/FieldSet/Dependency/Item 及组合成员，按 F 组验证真实注册、校验、依赖、转换、动态列表、布局和提交；不新增 LoginForm/LoginFormPage                                                              |
| AC-M07   | M07                | ProFormCascader、ProFormColorPicker、ProFormRate、ProFormDigitRange、具名 ProFormTimePicker/ProFormTimeRangePicker、DateMonth/Quarter/Week/YearRangePicker 等固定基线公开字段；逐项验证值类型、选择/清空、只读、受控、Form 注册和类型导出，已有 time/timeRange 的底层能力应复用 |
| AC-M08   | M08                | DragSortTable、RowEditorTable、CellEditorTable、ListToolBar、TableDropdown 等固定基线公开表格增强；验证拖拽顺序与回调、行/单元格编辑生命周期和校验、工具栏结构/菜单/设置、下拉操作及键盘可达性，复用 Table 契约而非独立简化示例                                                 |

### 4.8 示例、质量与交付：5 条，覆盖 D01 及横向质量

| 验收编号 | 差异映射          | 可检验标准                                                                                                                                                                                                                                                                                            |
| -------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-D01   | D01               | SearchLightFilter、SearchRequiredFields、CustomErrorBoundary、ListToolbarTabs/TitleMenu/MultipleLine、FeatureBatchActions、ToolbarCustomTableBody、ValueTypeCustom、FeatureDateFormatter 等审计示例改用已交付的真实组件契约；保留有教学价值的业务扩展示例时明确其用途，不能作为缺失组件能力的通过证据 |
| AC-Q01   | G01–G04、全体组件 | classes/styles 的部位、参数与优先级在契约中统一；至少验证 root 和每类特有部位覆盖/动态更新/嵌套局部主题；旧 classNames 兼容与 classes 冲突时结果固定，根 class 不与语义 classes 混淆                                                                                                                  |
| AC-Q02   | 全部编号          | 相应单元、组件/浏览器、消费者类型与包构建检查通过；为校验/异步提交/请求竞争/Provider 继承等真实行为建立回归，不为低风险代码逐行镜像写测试；不因已有测试通过就推导未覆盖 API 已完成                                                                                                                    |
| AC-Q03   | 全部编号          | 公开组件/属性/事件/插槽/ref/token/locale key、classes/styles 与迁移文档齐备；示例能独立运行，README 不再声称仅以 2.8.10 为主基线；每个新增组件族具备实际演示和最小用法，变更记录明确默认值和破坏性变化                                                                                                |
| AC-Q04   | 全部编号          | 最终报告逐条列出本 PRD 的 60 条结果、M 组展开清单及尚存问题，不用总体百分比代替缺项；各批次可独立验收，但整体只有在全部已授权项完成且无严重缺陷时标记完成。用户原有工作区变更保留，临时测试目录按仓库规则清理                                                                                         |

## 5. 组件覆盖清单

以下是现有 31 个注册项的最低覆盖，新增族按 M 组展开。所有组件同时执行适用的 G/Q 验收，未列出的独有能力应按固定基线清单补齐到契约，不能因此默认为无需支持。

| 分类              | 组件                                                                                          | 重点验收                                                                |
| ----------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| 现有核心 4 项     | ProCard；ProTable；EditableProTable；SchemaForm                                               | C；T；T+E；F+P                                                          |
| 现有布局 8 项     | Form、Embed；ModalForm、DrawerForm；QueryFilter；LightFilter；StepForm、StepsForm             | F01/F02/F08/F09/F10；F01/F06/F07/F08/F09；F01/F03；F01/F04；F01/F05/F08 |
| 现有通用字段 6 项 | ProFormText、ProFormDigit、ProFormTextPassword、ProFormTextArea、ProFormSlider、ProFormSwitch | P01/P02，Password 组合名保持                                            |
| 现有日期字段 4 项 | ProFormDatePicker、ProFormDateTimePicker、ProFormDateRangePicker、ProFormDateTimeRangePicker  | P01/P02/P08，格式化/提交/只读模式                                       |
| 现有选项字段 5 项 | ProFormSelect、ProFormTreeSelect、ProFormCheckbox、ProFormRadioGroup、ProFormSegmented        | P01/P02/P03/P08 中适用项，Segmented 已有请求能力保持                    |
| 现有专用字段 4 项 | ProFormCaptcha、ProFormUploadButton、ProFormUploadDragger、ProFormMoney                       | P01/P02 及分别 P05/P06/P07/P04                                          |
| 额外公开层        | ProFormField、FieldControl、ReadonlyField、ProFormRadio、ProFormText.Password                 | P01/P02/P08、M05；原有辅助层不能被错误宣传为完整 ProField 替代          |

## 6. 接口与数据契约草案

PRD 确定保留范围的能力和语义；`contract.md` 固定实现接口，涉及范围时始终以 implementation-scope.md 为准。实际实现与验证证据持续记录在领域报告中。

| 契约对象      | 必须明确的内容                                                                                                                                                                 |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Provider 配置 | 读取 antdv-next ConfigProvider 的公开上下文方式，locale/prefixCls/direction/theme 响应性；Pro token、intl、valueTypeMap 的类型、默认值、合并和优先级；避免依赖不可用的私有结构 |
| 主题数据      | 全局 token、原生组件 token 与 Pro 自有 token 的归属、生效部位、默认值、深色派生、嵌套覆盖；若基础框架类型不能直接接受 Pro token，使用有类型的 ProConfigProvider 入口           |
| 组件共同协议  | class/attrs 目标；classes/styles 部位与参数；slots 与 render 回调对应关系；v-model 属性/事件；受控/非受控默认；refs 的方法和异步返回                                           |
| Form 数据     | 字段路径、注册/注销、依赖、初始值、校验、转换顺序、日期处理、提交返回值；StepsForm 每步实例与聚合数据；列表稳定 key 与嵌套路径                                                 |
| Table 数据    | request 的 params/sort/filter/result/error、分页/游标、请求取消与竞争、polling 时序；Column children/render/formItemRender；选中/编辑/创建状态和回调签名                       |
| 完整导出      | 展开固定基线 UI 导出、组合成员、props/事件/ref/类型与对应验收，记录 Vue 合理适配和与旧本地入口的迁移映射，不保留笼统“基本支持”描述                                             |

本项目是组件库，不需要为满足流程虚构 HTTP 后端。开发与验证中 request/onFinish/onGetCaptcha 等使用可控模拟函数；真实网络/上传的接入方式遵循公开契约，演示不得触发真实外部消息或业务写入。

## 7. 迁移策略

1. **基线显式更新**：文档声明对齐的上游版本与允许的 Vue 适配，提供从现有 0.1.x 用法升级的对照。当前官网 `formItemRender` 与旧 `renderFormItem`、children 与本地 columns 等分别说明。
2. **导出先补齐，冲突明确处理**：增加 ProForm/BetaSchemaForm 及独立布局；现有 SchemaForm/Form/Embed 等合理扩展保留，不能以同名别名继续掩盖 columns 必填与组合模型的差别。Form 同名冲突由契约给出无歧义的兼容入口。
3. **classes 主入口**：现有 classNames 如保留则作为旧兼容名，类型和文档说明弃用方向；classes 优先，styles 持续支持，不再要求 Vue 用户学习 React 的类名属性。
4. **回调不猜测**：对参数语义不兼容的 render/renderText/formItemRender/actionRender 等，以正式契约为主，必要时提供明确的旧版适配器或独立兼容入口；禁止通过函数 length 或调用结果猜版本。
5. **默认行为有变更记录**：搜索折叠、全屏、默认单行编辑、普通表单 vertical、异步关闭等按官网修正，文档给出保持旧效果所需的显式选项。历史错误行为不作为永久兼容要求。
6. **CSS 迁移**：新的内置 Pro 类及动态前缀为正式契约；文档列旧 `antdv-next-pro*` 到 `ant-pro-*` 的映射，不承诺永久默认附加双套旧类。自定义样式推荐 classes/styles 或 token。
7. **版本与交付**：准备 changeset/版本说明，发布前验证 ESM/CJS/types/style.css 及全局注册/按需导入；不在本轮需求中默认执行发布、部署或覆盖用户原有成果。

## 8. 分阶段交付与依赖

既有审计、PRD 和契约已经由用户确认并授权进入开发。下列批次按已确认范围执行，不要求再次确认既有授权；每个领域负责实现、文档与真实验证，主控整合跨领域证据。

| 批次                      | 目标与范围                                                                                                              | 必须可独立演示的成果                                                                                                                            |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| B1 配置与共用展示基础     | G01–G06、P01/P02、M05 中 Provider/Field 基础、Q01；先确定可被所有后续组件复用的配置、主题、国际化、前缀、方向、字段体系 | ConfigProvider 单独控制简中/英文、LTR/RTL、默认/暗色、全局/组件 token；Pro token 局部覆盖；classes/styles；动态 prefixCls；真实自定义 valueType |
| B2 修复现有核心与表单模型 | C01–C04、T01–T11、E01–E04、F01–F10、P03–P08，补齐相关 G/M06 重叠导出                                                    | Card 高级布局、标准 Table 搜索/工具栏/编辑、组合与 schema 表单、真 LightFilter/StepsForm、异步弹层提交、19 字段增强；重用 B1                    |
| B3 字段与组合表单补齐     | M05 原子字段、M06 保留部分、M07                                                                                         | 结构化表单组合与新增字段具备真实交互和文档；不建设统计/选择卡及登录族                                                                           |
| B4 数据展示与表格增强     | M03、M08                                                                                                                | List/Descriptions/增强表格复用标准 Field、请求、工具栏及编辑能力；不建设 Skeleton 族                                                            |
| B5 完整应用布局           | M01                                                                                                                     | **本次排除**，保留历史批次编号，不执行新增完整应用布局族                                                                                        |
| B6 示例与总体验收         | D01、Q02–Q04 以及全部保留项的集成回归                                                                                   | 组件契约示例、迁移文档、包验证、60 编号结果矩阵及保留 M 清单；排除项明确标记，遗留问题逐项说明                                                  |

各批次都应包含相应文档与测试，而不是全部推迟到 B6。共享文件由架构阶段分配所有权，开发者先合并接口再并行处理，避免多个角色同时改写同一大型组件。验收发现问题按来源回流到实现者，直到相应批次无严重缺陷。批次次序可在依赖允许时调整，范围不得静默减少；是否分批发版由用户在具体可发布成果出现后决定。

## 9. 验证方案与退出条件

- 类型与包：验证公开导入、全局注册、组合成员、组件 refs、ESM/CJS 与声明文件；执行项目现有 typecheck、构建和消费者检查。
- 单元/组件：优先覆盖 Provider 合并、locale 回退、字段转换、搜索校验、请求时序、编辑状态、StepsForm 生命周期、异步提交等具有独立行为价值的场景。
- 浏览器：使用现有 Playwright 能力验证真实交互与 DOM，重点覆盖审计已实测失败项；至少覆盖默认/窄屏、LTR/RTL、简中/英文、默认/暗色及 token 覆盖。组合矩阵按风险取代表用例，不能省略某个验收条目的关键断言。
- 视觉：按组件语义与关键布局比较，覆盖折叠/选中/加载/错误/空态等适用状态；不以单张截图或未经定义的相似度百分比替代公开能力验收。
- 参考站：沿用现有官网与固定源码证据，需要时仅做补充侦察；若遇登录/验证码/权限/页面不可达，不绕过，记录阻塞及受影响项，按技能规定交由用户处理。
- 环境：不停止用户已运行服务；新建大型临时测试项目仅放在本次任务独有 scratch-tests 子目录，结束前保存交付材料并按路径核验清理，清理失败如实说明。

退出条件：保留范围对应的 57 条验收全部通过（AC-M06 只覆盖组合表单），保留 M 组清单无遗漏且无严重缺陷；AC-M01/M02/M04 及 M06 登录部分明确标记“本次排除”。未验证或未实现的保留断言如实列出，不能用通过的 smoke 推导整条通过，也不能把排除项计入通过数量。

## 10. 已确认事项与执行状态

用户已经确认保留范围、classes/styles、ConfigProvider 及 Pro token 入口，并授权开始实现。当前处于实现与集成验证，具体接口见 contract.md，范围以 implementation-scope.md 为准。验证出现的问题由对应领域继续修复；需要用户决策的实质性范围变化单独提出，不重复请求已有授权。

本轮已有源码、类型、文档、示例和测试变更。本文记录需求与验收边界，不作为完成声明；各 AC 的实际结果、失败及未覆盖边界见领域 evidence 和主控最终报告。
