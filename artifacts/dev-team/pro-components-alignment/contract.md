# ProComponents 保留范围对齐契约

状态：**用户确认的保留范围已实现并完成最终验收**。日期：2026-10-21。最新实施范围以 [implementation-scope.md](./implementation-scope.md) 为准；本文保留原始契约作为行为与类型参考，排除项不再建设或计为通过。最终结果和 Vue 适配边界见 [test-report.md](./test-report.md)。

需求依据：[PRD.md](C:/malei/stu/antv-next-pro/artifacts/dev-team/pro-components-alignment/PRD.md)。差异依据：[审计报告](C:/malei/stu/antv-next-pro/artifacts/pro-components-audit-2026-10-21/report.md)。本契约原覆盖 52 个差异 ID；实施时 M01/M02/M04 退出，M06 排除登录表单，其余以最新实施清单为准。

## 1. 基线与不可变规则

1. 业务能力、默认值、公开参数语义、关键 DOM 部位和状态，以当前官网及审计固定源码提交 `3bf43278d39f2d31489749132982488f57a9eb5e` 为参考。上游该提交包版本为 `3.1.15-7`，不声称官网部署就是此提交。
2. Vue 适配使用插槽、VNode、`class`、`v-model`、组件 ref 和 Vue 事件；不得利用适配之名省略业务能力或更改回调时机。
3. **语义样式入口采用 antdv-next 的 `classes` / `styles`**，不将 React `classNames` 定为正式新接口。
4. 当前实际安装 `antdv-next@1.6.0`、`vue@3.5.44`。仓库 peer/catalog 范围仍为 `antdv-next ^1.5.2`，审计旧报告记录的 1.5.2 不是当前安装版本。实现与验证先以实际安装版本为准；发包前验证所声明最低版本，不能将未经验证的版本写成已兼容。
5. 保留用户当前未提交修改及已有能力。无占位组件、空回调、仅转发名称的通用组件、宽泛 `any` 或类型断言伪装已完成。
6. 没有 `.codegraph/`，本轮依用户指令跳过 CodeGraph。未发现额外仓库规则文件；用户消息中的 AGENTS 指令继续有效。

## 2. 已核实的 antdv-next 接口

| 事项               | 已安装实现 / 类型事实                                                                                                            | 实现约束                                                                                                         |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| 完整配置上下文     | `antdv-next/config-provider` 导出的 `useConfig()` 返回响应式 `Ref<ConfigConsumerProps>`；`/config-provider/context` 也公开该函数 | 使用完整上下文读取 `getPrefixCls/locale/direction/theme/getPopupContainer` 等；不引用不存在的 `useConfigContext` |
| 根包 `useConfig()` | 根包名称指向 `useExportConfig`，返回 `componentDisabled` 与 `componentSize`                                                      | 不把此接口当完整 Provider 上下文；可用于尺寸和禁用继承                                                           |
| 主题               | 根包 `theme.useToken()` 返回 `theme/token/hashId` 的 ref；公开 `defaultAlgorithm/darkAlgorithm/compactAlgorithm`                 | 保留响应性，不在 setup 时解包成一次性快照                                                                        |
| 原生组件 token     | `ThemeConfig.components` 类型由原生 `ComponentTokenMap` 派生，含 `Card/Table/Form/Result/...`                                    | 原生组件 token 继续走原生主题链；当前没有已核实的 `ProTable/ProCard` 映射                                        |
| 原生主题嵌套       | 原生 `useTheme` 合并 token 与各原生组件配置；`inherit=false` 重新建立主题基线                                                    | Pro 层不得覆盖掉原生嵌套、算法数组、组件 algorithm、cssVar/hashed/csp 配置                                       |
| 国际化             | 原生 `useLocale` 在 `antdv-next/dist/locale/useLocale`，仅接受原生 `Locale` 键；原生 Locale 没有 Pro 文案块                      | 不能靠 `useLocale('ProTable')` 强行接入；通过原生 `locale.locale` 映射 Pro intl                                  |
| 语言码             | `zh_CN` 语言包实际 `locale='zh-cn'`；`en_US` 实际为 `'en'`                                                                       | 匹配支持大小写、下划线、连字符及语言前缀                                                                         |
| 语义样式           | 原生 Card / Table 正式 props 为 `classes/styles`；支持对象或 `({ props }) => 对象`；按语义部位合并全局和局部                     | 对齐解析时机、class 追加、style 属性覆盖与嵌套语义结构                                                           |
| 配置默认属性       | 原生组件通过 `useComponentBaseConfig` 继承 `ConfigProvider.card/table/form/...`                                                  | 不在 Pro 包装层把原生配置截断或强行用固定默认值覆盖                                                              |

本地依据：[上下文类型](C:/malei/stu/antv-next-pro/packages/antdv-next-pro/node_modules/antdv-next/dist/config-provider/context.d.ts:441)、[根包导出](C:/malei/stu/antv-next-pro/packages/antdv-next-pro/node_modules/antdv-next/dist/index.d.ts:171)、[原生主题接口](C:/malei/stu/antv-next-pro/packages/antdv-next-pro/node_modules/antdv-next/dist/theme/index.d.ts:9)、[Card classes/styles](C:/malei/stu/antv-next-pro/packages/antdv-next-pro/node_modules/antdv-next/dist/card/Card.d.ts:64)、[语义样式合并](C:/malei/stu/antv-next-pro/packages/antdv-next-pro/node_modules/antdv-next/dist/_util/hooks/useMergeSemantic.js:7)。这些是本轮核查事实，尚不是本库新增实现。

## 3. 公共 Provider 契约

### 3.1 公开入口

新增正式 `ProConfigProvider`，默认插槽承载子树；无 Provider 时，任一 Pro 组件仍应独立继承最近的原生 `ConfigProvider`。

| 接口                           | 契约                                                                                                                                                           |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `token`                        | `DeepPartial<ProAliasToken>`，采用上游 Pro token 形状：全局 alias token 与 `layout` 扩展；`layout.header/sider/pageContainer` 按实际字段类型支持局部覆盖       |
| `intl`                         | 上游兼容 `IntlType`：`locale: string`、`getMessage(id: string, defaultMessage: string): string`                                                                |
| `valueTypeMap`                 | 自定义 valueType 的具名注册表，包含只读 `render` 和编辑 `formItemRender`；VNode / scoped slot 替代 ReactNode，参数语义保持一致                                 |
| `prefixCls`                    | Pro 命名空间前缀，默认由原生 `getPrefixCls('pro')` 得到；仅影响 Pro 层                                                                                         |
| `dark`                         | 未指定则继承原生算法及父 Pro 配置；为 true 时按上游加入 darkAlgorithm，保留 compact/自定义算法；false 不强行移除调用方原生显式配置的 darkAlgorithm             |
| `hashed`                       | 遵从最近原生与 Pro 显式配置；关闭时不残留依赖 hash 类才能生效的样式                                                                                            |
| `autoClearCache`               | 与上游相同用途：为当前 Provider 建立独立请求缓存作用域，卸载仅清理该作用域拥有的缓存                                                                           |
| `needDeps`                     | 内部依赖包装兼容项；无显式配置时复用既有 Pro 上下文，不反复重建缓存或截断继承                                                                                  |
| `ProProvider` / `useProConfig` | 用 Vue 组件和只读响应式注入接口承载 React Context 的用途；`ProProvider` 是 Provider 入口别名，消费侧用 `useProConfig`，不伪造 React `.Consumer/.Provider` 对象 |
| `useIntl/createIntl/intlMap`   | 提供统一的语言消费、定制和注册语言查询；语言内容沿用基线语言包，保留来源与许可证                                                                               |

Pro 扩展配置入口是 `ProConfigProvider.token`。**不把 `ConfigProvider.theme.components.ProTable` 描述成上游既有能力，不通过类型强转假装该入口可用**。若未来要额外提供原生 components 扩展，必须作为新需求独立说明。

### 3.2 配置合并与作用域

| 数据               | 从低到高的优先级 / 规则                                                                                                                                                                             |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 原生配置           | 原生 ConfigProvider 自身的嵌套规则 → Pro 组件实例有意义的显式属性；通过原生组件渲染的区域继续由原生组件消费配置                                                                                     |
| Pro token          | 原生解析后的主题基线 / Pro 派生默认值 → 父 Pro Provider 的显式 token patch → 当前 Pro Provider 的显式 token patch → 实例样式覆盖。区分“显式 patch”和“父层派生结果”，避免全局 token 变化被旧快照锁死 |
| Pro 布局 token     | 按 `layout/header/sider/pageContainer` 等具名对象逐层合并；未提供子键继承，不用浅替换清空兄弟字段                                                                                                   |
| 原生组件 token     | 各原生组件在自己的 token 名称范围解析；Pro 自绘同一原生语义区域需消费对应 token，如 ProCard 的 Card 标题区域。不能将所有组件 token 平铺到全局导致 Card/Table 同名键相互覆盖                         |
| Pro intl           | 当前显式 intl → 父层显式 intl → 最近原生 locale.locale 映射 → zh-CN 兜底；实例明确文案覆盖 intl 的对应条目                                                                                          |
| `valueTypeMap`     | 按类型键继承父注册表；子层仅覆盖同名类型的完整定义，其他类型继续继承；父层与并列 Provider 互不污染                                                                                                  |
| Prefix / direction | 实例明确 Pro 前缀 → Pro 命名空间 → 最近原生前缀；direction 继承最近原生配置，支持组件自身原本有意义的覆盖                                                                                           |

设置 token、切换算法、语言、prefix、direction 均应在同一挂载树中响应更新。嵌套主题不能污染兄弟子树。原生 `theme.components.Result` 仅用于 Result，不能据此推导能改变 ProTable。

### 3.3 国际化清单

至少统一以下 Pro 自有文案：查询/重置/展开/收起；密度/全屏/刷新/列设置/拖拽说明；选中批量提示；编辑/保存/取消/删除/新增及限制提示；提交/上一步/下一步；字段空值与布尔文本；验证码与倒计时；上传默认标题和说明；卡片折叠的 aria 标签；布局、登录表单及新增组件的默认文案。

语言码先将 `_` 归一为 `-`，大小写不敏感匹配完整地区，再匹配语言前缀；`en` 对应 en-US，`zh` 对应 zh-CN；上游未支持语言回落 zh-CN。缺少 message 时依基线先回落中文再回落 defaultMessage，显式空字符串属于有效值。原生表单验证、日期面板、分页等仍使用原生语言包。日期格式化需使用相应 locale，但不能通过设置全局 dayjs 语言破坏并存子树。34 个语言实例完整清单见导出附件第 6 节，不将只实现中英文描述为全量语言支持。

### 3.4 实际 Pro 扩展 token 字段

完整 `token.layout/header/sider/pageContainer` 字段、数值/颜色类型及对应语义区域见 [导出附件第 7 节](C:/malei/stu/antv-next-pro/artifacts/dev-team/pro-components-alignment/export-inventory.md)。固定定义为 [layoutToken.ts](https://github.com/ant-design/pro-components/blob/3bf43278d39f2d31489749132982488f57a9eb5e/src/provider/typing/layoutToken.ts) 与 [aliasToken.ts](https://github.com/ant-design/pro-components/blob/3bf43278d39f2d31489749132982488f57a9eb5e/src/provider/typing/aliasToken.ts)。业务样式 token 与 `hashId/themeId/proComponentsCls/antCls/iconCls` 等派生元数据分开；元数据随最近主题与前缀生成，不作为推荐业务定制键。后续验收逐项给出 token 到消费部位的证据，不以类型接受但无实际变化宣称支持。

## 4. 类名、属性及 classes/styles 契约

### 4.1 Prefix 与公开 DOM

默认 Pro 根前缀为 `ant-pro`；全局原生 prefix 为 `demo` 时为 `demo-pro`。公开部位按官网同名 suffix 生成：

| 区域                      | 默认类名                                                                               | 全局 `prefixCls='demo'`                                         |
| ------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| ProCard / header / body   | `ant-pro-card` / `ant-pro-card-header` / `ant-pro-card-body`                           | `demo-pro-card` / `demo-pro-card-header` / `demo-pro-card-body` |
| ProTable                  | `ant-pro-table`                                                                        | `demo-pro-table`                                                |
| 搜索 / 工具栏 / 列设置    | `ant-pro-table-search` / `ant-pro-table-list-toolbar` / `ant-pro-table-column-setting` | 同 suffix，根前缀变为 `demo-pro`                                |
| QueryFilter / LightFilter | `ant-pro-query-filter` / `ant-pro-form-light-filter`                                   | `demo-pro-query-filter` / `demo-pro-form-light-filter`          |
| ProForm / StepsForm       | `ant-pro-form` / `ant-pro-steps-form`                                                  | `demo-pro-form` / `demo-pro-steps-form`                         |

完整部位、状态与组合组件逐项依据基线实现维护，不仅替换根类名。实例已有 `prefixCls` 若用于 Pro 组件，则代表完整 Pro 组件前缀；不得继续只修改底层 Card 而保持 Pro 内部硬编码。底层原生 Card/Table 的前缀独立继承原生 ConfigProvider，必要的原生专用 prefix 走对应的 `cardProps` 等配置。

不要求 CSS-in-JS hash、Vue scoped 标识与 React 相同；交互关联元素、公开部位、状态类、RTL 类以及位置语义必须一致。默认不并列输出整套旧 `antdv-next-pro__*` 类；这属于用户明确要求的命名修复，迁移说明列出 CSS 选择器变化。

### 4.2 class / classes / styles

| 入口              | 含义与优先级                                                                                                                             |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `class` / `style` | 根容器 class/style，明确绑定到该组件语义根；多根或弹层组件必须主动路由，不能依赖失效的 attrs fallthrough                                 |
| `classes`         | 正式语义部位 class；对象或 `({ props }) => 对象`，合并时追加 class。Card 七部位延续 root/header/body/extra/title/actions/cover           |
| `styles`          | 正式语义部位 style；对象或相同回调，按属性合并，局部显式样式优先。动态关闭折叠等必要交互状态由状态实现保证，不用用户样式重写内部状态数据 |
| 旧 `classNames`   | 保留为弃用兼容别名。classes 未传的部位使用旧值；同一部位 classes 优先。仅 classes 是文档示例与新类型推荐入口；开发环境一次性给出迁移提示 |
| 全局原生语义配置  | 原生 `ConfigProvider.card/table/...` 的 classes/styles 继续进入原生区域；不得被 Pro 包装 props 的空对象覆盖                              |
| 根 style 冲突     | 内置派生样式 → 原生全局 style / styles → Pro 兼容旧样式 → 实例 style / styles.root；新语义 styles.root 对同名属性优先                    |

Table 原生语义结构含 root/section/title/footer/content，及嵌套 body/header 的 wrapper/cell/row 和 pagination；透传时保留该结构。Pro 特有搜索、工具栏、alert 等语义入口单独命名，不把原生 `classes.body.row` 当根容器 class。

### 4.3 属性与事件路由

1. Pro 独有 props 留在 Pro 层；原生 Table props、列 props、Form props、Modal/Drawer props 进入明确目标，不用白名单丢弃已公开的原生能力，也不把对象序列化成 div attribute。
2. `rowClassName/onRow/expandable/components/summary/locale` 等进入底层 Table；`tableClassName/tableStyle` 定位原生 Table 的对应容器。外层 `class/style` 继续定位 Pro 根。
3. 字段 FormItem 配置进入 FormItem；原生控件配置进入控件。顶层便利属性按各具名字段公开类型分流；如 placeholder 到 input，max 到 InputNumber。`fieldProps` 明确覆盖同义的顶层控件便利属性。
4. 需要返回值的业务回调，如 onFinish/onSave/actionGuard/onGetCaptcha，声明为可等待 prop，不能只 emit 后忽略返回值。纯通知事件依 Vue emits，避免同一 onXXX 被 prop 调用与 emit 再调用两次。
5. 受控 open/current/collapsed/selected 等使用对应 `v-model:*`；组件不能在受控模式私自覆盖调用方状态。

## 5. 各组件族 API 映射

### 5.1 已有核心组件

| 组件族             | 正式契约与关键变更                                                                                                                                                                                                                                          | 差异    |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| ProCard            | 保留已具备基本卡片/折叠/ghost；补齐 layout/direction/wrap/colSpan/colStyle/gutter/split、tabs、Group/Divider/TabPane、checked/onChecked、boxShadow、Tooltip 对象配置；样式入口 classes/styles                                                               | C01–C04 |
| ProTable 默认      | 搜索 defaultCollapsed=true；fullScreen 默认 false；保留已经一致的默认 rowKey=id、密度、关键词名与请求竞争保护                                                                                                                                               | T01     |
| ProTable 搜索      | 使用真正 QueryFilter / LightFilter 与原生 Form 校验；支持 form/formRef、search 配置、optionRender/collapseRender、column formItemRender、submitter。验证失败不更新已提交参数、不调用 request                                                                | T02–T03 |
| Toolbar / 扩展区域 | headerTitle/tooltip、toolBarRender/optionsRender、toolbar tabs/menu/filter/settings/multipleLine；tableRender/tableViewRender/tableExtraRender/searchFormRender、tableAlert*、cardProps/cardBordered、错误边界。VNode 用 props 或精确命名 scoped slots 适配 | T04–T05 |
| Table/列原生能力   | 以原生 TableProps<T> / ColumnType<T> 的受支持项派生类型，正确过滤 Pro 独有 props 后透传；不能通过 Record<string, unknown> 吞掉类型契约                                                                                                                      | T06     |
| ProColumns         | 分组正式属性 children；render(dom, record, index, action, schema)、renderText(text, record, index, action)、formItemRender 按 v3 参数；可用 VNode                                                                                                           | T07     |
| 字段展示           | 全部表格单元格进入统一 ProField；status/color、日期/数字/金额/百分比、复制图标反馈、indexBorder、ellipsis 对象配置均生效                                                                                                                                    | T08–T09 |
| 列设置与请求       | 保留显隐/拖拽/持久化，补固定左右与对象配置；beforeSearchSubmit/dateFormatter/debounceTime、loading/分页完整类型；polling 动态间隔、请求结束后调度、最小间隔、隐藏暂停和卸载清理                                                                             | T10–T11 |
| EditableProTable   | 默认 single；已有编辑行时阻止冲突并显示官网提示，不丢弃未保存值；新增按钮进入指定表头/表体位置；完整 button props、editable form/ref、actionRender、受控行值、校验反馈；maxLength 按基线顶层 length                                                         | E01–E04 |

`copyable` 按已核实上游 boolean 契约实现，不凭空增加对象类型兼容要求。recordCreatorProps 的省略默认按固定上游实现处理，不用旧文档印象改成始终显示按钮。

### 5.2 表单组织方式

| 入口                                         | 正式职责                                                                                                                               |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `ProForm`                                    | 真正可组合字段的表单，默认 vertical；默认插槽组合字段，原生 Form 能力保留                                                              |
| `BetaSchemaForm`                             | schema 驱动入口，按 columns 渲染并选择 layoutType；不是 ProForm 的同义名字                                                             |
| `SchemaForm`                                 | 保留为 BetaSchemaForm 的历史名称/兼容入口                                                                                              |
| `Form` / `Embed`                             | 保留既有 columns 用法的兼容入口；新文档优先 ProForm/BetaSchemaForm，不将原生 Form 或 ProForm 强制要求 columns                          |
| `ModalForm` / `DrawerForm`                   | 可组合内容，完整 modalProps/drawerProps、trigger、受控 open、异步 onFinish；Schema 模式通过 BetaSchemaForm layoutType 进入同一真实布局 |
| `QueryFilter`                                | 响应式列宽、折叠/展开、默认值、操作区、真实 Form 实例与校验                                                                            |
| `LightFilter`                                | 标签/弹层式筛选；secondary/more/placement/footer/collapse/值变化提交，不能用 inline Form 代替                                          |
| `StepsForm` / `StepsForm.StepForm`           | 每步独立实例与注册，保留 store，执行每步 finish 与最终汇总；具名 StepForm 保留。最终只校验当前挂载列不满足契约                         |
| `ProFormGroup/FieldSet/List/Dependency/Item` | 真实独立组合组件，支持官网组合值、依赖、动态列表 copy/move/min/max/creatorRecord/actionGuard/actionRef、稳定 key 与嵌套路径            |
| `LoginForm/LoginFormPage`                    | **本次排除**，不新增登录族；不影响保留的 ProForm 及结构化组合表单                                                                      |

submitter 实现官网 searchConfig/render/submitButtonProps/resetButtonProps 等字段；插槽保留 equivalent 参数与默认动作。URL 正式入口为 syncToUrl/syncToInitialValues，保留 urlSync 适配，不在每次输入时错误同步提交语义。历史嵌套与转换能力应继续可用。

### 5.3 字段与 ProField

19 个现有字段全部保留并接入公共字段链路：Text、Digit、TextPassword、TextArea、Captcha、DatePicker、DateTimePicker、DateRangePicker、DateTimeRangePicker、Select、TreeSelect、Checkbox、RadioGroup、Slider、Switch、UploadButton、UploadDragger、Money、Segmented。

补齐可渲染的 ProFormRadio 及 .Group、ProFormCheckbox.Group、ProFormDatePicker.Week/Month/Quarter/Year；新增具名 Cascader/ColorPicker/Rate/DigitRange/TimePicker/TimeRangePicker 及 Month/Quarter/Week/YearRangePicker。`ProFormText.Password` 与既有独立密码名均保留。

统一 ProField 提供 read/edit/update 模式与字段类型注册；具名 Field 原子各有实际对应功能。FieldControl/ReadonlyField 作为历史辅助入口保留，内部复用统一字段逻辑，不能因存在这些名字就宣布 ProField 完成。

金额支持 locale/customSymbol/numberFormatOptions；验证码支持 phoneName 校验和手机号参数、captchaTextRender/captchaProps/onTiming 与 focus/startTiming/endTiming；旧倒计时接口可做具名别名。UploadButton/Dragger 具备官网图标/标题/描述层级与 title/icon/buttonProps/max 增强，遵循原生受控 fileList/customRequest/action 语义。

### 5.4 新增组件族与明确排除（保留 M01–M08 映射）

| 差异 | 建设或排除模块                                                                                         | 本次边界                                                                                         |
| ---- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| M01  | **本次排除**：ProLayout、PageContainer 及完整布局/导航/帮助组件族                                      | 上游导出仅保留参考，现有实现保留；不新增完整布局族                                               |
| M02  | **本次排除**：Statistic、StatisticCard、CheckCard 族                                                   | 不新增统计/选择卡；ProCard 已有布局与选择状态按 C 组修复                                         |
| M03  | ProList、BaseProList、ProDescriptions                                                                  | 列表元数据/动作/选择/展开、分页/请求与工具栏；描述布局、统一字段展示、编辑/保存/取消与校验       |
| M04  | **本次排除**：ProSkeleton 及全部骨架屏族                                                               | 不新增 page/list/table/descriptions 骨架，排除不计为通过                                         |
| M05  | ProField、Field 原子、Provider/intl/valueTypeMap                                                       | 统一只读/编辑、类型扩展、主题和语言上下文；不能仅 re-export 未增强的原生 Input                   |
| M06  | **保留** ProForm/BetaSchemaForm、Group/List/FieldSet/Dependency/Item；**排除** LoginForm/LoginFormPage | 按上节真实组合模型实现，不把组合入口全部指向 columns 必填的 SchemaForm                           |
| M07  | 所缺具名字段和日期变体                                                                                 | 底层控件配置、值类型、提交转换、只读呈现、slots/ref 与组合成员完整贯通                           |
| M08  | DragSortTable、RowEditorTable、CellEditorTable、ListToolBar、TableDropdown                             | 拖拽排序并回调新顺序；真实行/单元格编辑状态与校验；可独立使用的工具栏/下拉操作；保留底层表格能力 |

每个导出需有独立类型/行为映射和验收记录。完整组件、组合成员、34 个 intl 及固定基线根导出记录见 [export-inventory.md](C:/malei/stu/antv-next-pro/artifacts/dev-team/pro-components-alignment/export-inventory.md)。以本契约、展开导出附件及已核查的核心类型共同作为本次接口基线；本草案没有逐一验证所有边缘属性的运行结果，不能宣称已穷尽 439 个上游根导出的一切细节。实现中遇到未核查的边缘签名须回查固定提交并补充契约，不得以笼统“等”省略组件或静默降低范围。

固定提交的 `ProCard` 实际只挂载 `Group/Divider`，未挂载 `TabPane`；前文 `TabPane` 作为官网历史组合用法的兼容能力保留。`layout/index.tsx` 的 Help 组件族保留在上游参考清单，但随 M01 本次排除。

### 5.5 示例对齐（D01）

逐项更新审计所列 SearchLightFilter、SearchRequiredFields、CustomErrorBoundary、ListToolbarTabs、ListToolbarTitleMenu、ListToolbarMultipleLine、FeatureBatchActions、ToolbarCustomTableBody、ValueTypeCustom、FeatureDateFormatter：分别使用已交付 LightFilter、搜索 Form 校验、ErrorBoundary、toolbar tabs/menu/multipleLine、内建 tableAlert、表体扩展、valueType 注册和 dateFormatter。业务组合示例可以保留，但不能充当库内缺失能力的替代证据。实际示例名称与路径按仓库现有文件核对，保留用户未提交的示例修改；不在本草案中声称这些示例已经迁移或运行成功。映射 AC-D01、AC-Q03。

## 6. 提交、取消与错误语义

### 6.1 onFinish

正式返回类型为 `boolean | void | Promise<boolean | void>`。通过可等待 prop 接收；模板 `@finish` 能对应同一回调，但不再把它作为无返回值的 emit 重复触发。

| 情形                                   | 表单 / 弹层行为                                                                                                             |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| 校验失败                               | 不调用 onFinish，不发请求、不关闭；显示原生校验并使 ref.submit/validate 的失败可观察                                        |
| 回调 Promise pending                   | 提交 loading 持续，阻止重复提交；受控 loading 按组件公开契约处理                                                            |
| 回调返回 true                          | 成功；Modal/Drawer 发出 update:open=false；StepsForm 按上游成功规则推进或重置；URL 提交同步依成功语义执行                   |
| 回调返回 false                         | 留在当前表单/步骤，不关闭、不清空值                                                                                         |
| 回调返回 undefined / void 或未提供回调 | 不隐式视为成功关闭；符合基线弹层的 truthy 成功语义                                                                          |
| 回调抛出 / reject                      | 结束 loading、保留值与弹层，错误可由程序化调用或显式错误通知观察；不吞掉错误后当作成功                                      |
| 用户取消 / 外部关闭                    | 按弹层配置关闭；在制请求的结果不能稍后重复触发成功关闭/重置另一轮打开的表单；不声称能取消调用方未提供取消能力的业务 Promise |

历史调用依赖“emit finish 后总关闭”的行为会变化；迁移文档要求保存成功后显式 `return true`。本仓所有弹窗/抽屉示例和测试同步迁移；不增加一个默认保持错误行为的静默兼容开关。步骤有自己的上游默认推进规则：未提供某步 onFinish 时允许标准下一步，有回调时依其返回值，不将弹层规则机械套给每个步骤。

### 6.2 搜索与 ref

搜索执行顺序：读取当前 Form store → await 校验 → 字段转换/日期格式化 → beforeSearchSubmit → 更新已提交查询快照/页码 → request。校验失败禁止后续请求；输入值与已提交查询值分离，重载不会提交尚未确认的输入。

表单 ref 至少提供原生 validateFields/getFieldsValue/setFieldsValue/resetFields/submit/scrollToField，加 Pro 的 getFieldsFormatValue/getFieldFormatValue 等基线能力。Table action ref 保留 reload/reset/setPageInfo/clearSelected/fullScreen/startEditable 等，并正确返回可等待操作；搜索 formRef 指向真实表单。Vue expose 适配 ref，不改变参数或错误语义。

## 7. 字段转换、只读、远程数据

### 7.1 值转换与展示

输入链：外部受控值、initialValues、request 初始化、setFieldsValue → convertValue → 控件值。输出链：原始 store → transform / 格式化值 → 提交对象。转换仅在对应边界执行，不能每次 render 双重转换；范围字段映射多个提交 key、嵌套路径、数组列表和依赖都沿同一链。

`getFieldsValue` 保留原始 store 语义；`getFieldsFormatValue` 返回格式化提交语义；读取格式化值不得修改原始控件状态。field 顶层与 schema 列都接通相同边界，不能仅 schema 有效。未知 valueType 不得无提示回退 Input 并声称支持；先查注册表，缺失时给清楚的开发提示与可见可预测的兜底。

统一只读展示使用对应 ProField：日期支持基线接受的字符串/数值/日期对象，范围与无效值有明确处理；金额/数字/百分比按 locale/精度格式化；valueEnum 的 status/color 渲染 Badge；空值与布尔文案可国际化。复制与 ellipsis 使用原生 Typography 对应能力和反馈，而非固定“复制”按钮。

### 7.2 远程请求与缓存

Select/TreeSelect/相关选项字段将 params、依赖值、searchValue/keyWords 变化接入请求；请求参数使用基线上游 `keyWords` 命名。防抖优先采用字段公开 debounceTime，其次 fieldProps 配置，默认按字段类型基线值。受控 searchValue 变化同样触发；远程搜索不能又被本地过滤重复裁掉结果。

缓存同时区分请求函数身份、proFieldKey/字段身份、params、keyWords 与缓存作用域；并发相同 key 可复用，过期策略和 cacheForSwr 遵从公开配置。后发结果优先，过时响应/卸载响应不覆盖当前值，错误和 loading 独立可见；清理只触及自己作用域，不能清空其他表单。组件之间共享缓存必须是有定义的行为，不能因字符串 key 相撞造成不同接口数据串用。

轮询及防抖计时器、监听器、倒计时、请求序列在卸载后清理；开发服务与用户原有资源不受影响。

## 8. 兼容迁移

| 旧用法                                    | 正式用法 / 迁移                                                                                             |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| classNames                                | 弃用别名继续支持；新例子改 classes，同部位 classes 优先                                                     |
| SchemaForm / Form / Embed 的 columns 模式 | 继续兼容；正式 schema 文档采用 BetaSchemaForm；组合字段采用 ProForm                                         |
| columns 内的分组 columns                  | 正式 children；旧 columns 仅在 children 缺省时解析并提示                                                    |
| renderFormItem                            | 旧名称保留适配，正式 formItemRender 优先，明确各自旧/新参数，不按函数.length 猜测                           |
| render(value, context)                    | 正式切换 v3 render 参数；本仓调用逐项迁移并提供清楚对照。不能安全自动猜测同名回调的语义，不以包装返回值掩盖 |
| toolbar.title                             | 兼容回退到 headerTitle；headerTitle 明确提供时优先                                                          |
| urlSync                                   | 提供到 syncToUrl/syncToInitialValues 的明确映射，冲突时正式属性优先                                         |
| captchaText/countDownText/resetCountdown  | 保留具名旧接口适配；正式 captchaTextRender/startTiming/endTiming 优先                                       |
| 旧 DOM ant dv 自有选择器                  | 默认改为官网 Pro 命名；文档给根/部位/状态类映射，发布说明标记样式迁移                                       |
| finish 没有返回值但自动关弹层             | 保存成功返回 true；返回 false/void 不自动关闭                                                               |

与用户现有未提交示例有交集时先读内容并在其基础上改，不覆盖为上游文件。原有扩展在不冲突的情况下保留；公开语义冲突按正式契约处理，并在变更记录说明。正式类型保留泛型记录、值和请求参数，不扩大为 `any`。

## 9. 实现所有权与合并顺序

当前已经派发业务实现，实际文件所有权见 integration-notes.md。组件库没有服务端开发需求，不为满足分工制造后端。

| 所有者                | 独占源文件 / 目录                                                                             | 依赖与边界                                                                     |
| --------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Provider/字段基础角色 | 新 provider/、共享 theme/locale/prefix/semantic/request 核心、pro-form-fields/、ProField 新族 | 先交付公共类型与 hooks；供全部族使用，不改其他族入口                           |
| 表格角色              | ProTable.vue、EditableProTable.vue、table/ 及新增表格增强                                     | 依赖 Provider、真实 QueryFilter/LightFilter 和 ProField；不能另造搜索/字段实现 |
| 表单角色              | SchemaForm.vue、schema-form/ 及 ProForm/List/Group/Steps                                      | 与字段基础对接；独占提交/转换/注册模型；登录族本次排除                         |
| 卡片与其他族角色      | ProCard.vue、卡片增强、list/descriptions 等保留目录                                           | 现有布局保留；完整新布局、Skeleton、统计/选择卡本次排除                        |
| 集成所有者            | src/index.ts、src/types.ts 拆分与汇总、style.css 公共导入、包导出/全局类型、依赖和发布说明    | 多角色不得同时编辑这些共享文件；各族先提供独立 exports/style 入口由集成方汇总  |
| QA                    | 测试夹具、验收矩阵、报告                                                                      | 逐条覆盖 PRD，发现缺陷交原所有者修复；不以改测试期望绕过契约                   |

先稳定 Provider/类型/字段/表单基础，再接入 Table/Card，随后按 M 族补齐并集成。每次交付更新“API → 实现文件 → 对应验收 → 结果”矩阵；不能把一次成功构建当作全族完成。

## 10. 验证契约

1. **类型与构建**：组件泛型、slots/ref、全部正式导出、组合成员、classes/styles 回调、未知 token 键的拒绝、原生 Table/字段透传；执行适当 typecheck、package build、consumer verify 与 docs build。
2. **Provider 行为矩阵**：无 Provider、仅原生、嵌套原生、嵌套 Pro、并存兄弟子树；中英文与地区语言、RTL/LTR；default/dark/compact/自定义算法；全局 token、原生 Card/Table/Result token、Pro token、动态切换和恢复。
3. **DOM 与语义样式**：ant/demo/局部 Pro 前缀；关键根/部位/状态类；classes 对象/函数，styles 对象/函数，旧别名冲突优先级；表单 class、Table rowClassName、字段 placeholder/max、弹层 root 目标。
4. **真实交互**：搜索校验失败零请求、折叠默认、LightFilter 弹层/即时提交、工具栏各入口、选中提示、列固定/拖拽持久化；单行编辑限制、树形 maxLength；异步 true/false/void/reject、重复提交、关闭再打开；多步校验和回退保值。
5. **字段与请求**：双向转换及格式化读取不变更 store；日期和金额 locale；Badge/ellipsis/copy；验证码手机号/计时 ref、上传 max；关键字防抖、乱序、缓存隔离、卸载清理。
6. **新增族逐项**：保留的 M03/M05/M07/M08 及 M06 组合表单逐项验收；M01/M02/M04 及 M06 登录部分标本次排除。组合成员与受控事件单独计，导出存在或截图不能替代功能通过。
7. **浏览器与参考**：使用当前已安装 Playwright 和可用 Chrome，不为任务静默安装浏览器；在本地开发页检查默认/空/加载/错误及关键动作；参考站只验证可访问公开内容，遇登录、验证码/风控、不可达状态如实记录并停止相关项。
8. **测试及资源**：只为有行为风险的修改增加有效回归，不写复述实现的测试；大型一次性安装项目置于用户指定 scratch 独立目录，按 try/finally 清理且不跟随链接；证据先保存当前 artifacts；不停止用户已有服务。

验收结果区分通过、失败、无法验证、未实现、本次排除；最终保留 60 个 PRD 编号逐条映射，其中 57 条按保留范围验收、M06 仅组合表单。当前已进入实现与构建/测试，实际结果以领域 evidence 和主控报告为准，本契约不作通过声明。

## 11. 确认点与下一阶段

用户已明确的事项直接纳入，不再追问：保留范围差异均修；classes 以 antdv-next 为准；styles 保留；原生 ConfigProvider 不只支持国际化，还需完整主题/前缀/方向继承。新布局、骨架、登录、统计/选择卡按最新清单排除。

本契约将当前官网 v3 作为正式 API 基线，同时保留可无歧义适配的旧入口。用户已确认具体契约及两项行为迁移：`render` 切换 v3 参数；Modal/Drawer 的 onFinish 成功必须返回 true。当前进入实现与测试，不重复请求确认。

## 12. PRD 60 条验收的契约映射

下表保留 PRD 原始编号；“附件”指 export-inventory.md。M01/M02/M04及M06登录部分本次排除，其余按scope实现/验证；实际状态见 evidence，文档映射不计为测试通过。

| PRD 验收 | 差异映射           | 契约章节 / 完整导出附件         |
| -------- | ------------------ | ------------------------------- |
| AC-G01   | G01                | 4.1、4.2、10.3                  |
| AC-G02   | G02                | 3.2、4.1、10.2/10.3             |
| AC-G03   | G03、T06           | 4.3、5.1、10.3                  |
| AC-G04   | G04                | 2、3.1/3.2、附件7、10.2         |
| AC-G05   | G04                | 2、3.2、附件7、10.2             |
| AC-G06   | G04、T09、M05      | 3.1/3.2、5.3、附件5、10.5       |
| AC-G07   | G04、G05           | 3.2、7.2、10.2                  |
| AC-G08   | G05                | 3.2/3.3、附件6、10.2            |
| AC-G09   | G04、G05           | 3.2、4.1、10.2                  |
| AC-G10   | G06、F01、P08、M06 | 5.2/5.3、8、附件3/4、10.1       |
| AC-C01   | C01                | 4、5.1、附件1、10.4             |
| AC-C02   | C02                | 5.1/5.4、附件1、10.4            |
| AC-C03   | C03                | 5.1、附件1、10.4                |
| AC-C04   | C04                | 4.2、5.1、附件1、10.3/10.4      |
| AC-T01   | T01                | 5.1、10.4                       |
| AC-T02   | T02                | 5.1、6.2、10.4                  |
| AC-T03   | T03                | 4.3、5.1/5.2、6.2、10.4         |
| AC-T04   | T04                | 5.1、附件2、10.4                |
| AC-T05   | T05                | 5.1、附件2/6、10.4              |
| AC-T06   | T06                | 4.3、5.1、10.1/10.3             |
| AC-T07   | T07                | 5.1、8、10.1                    |
| AC-T08   | T08                | 5.1、5.3、7.1、附件5、10.5      |
| AC-T09   | T09、M05           | 3.1、5.3、7.1、附件5、10.5      |
| AC-T10   | T10                | 5.1、10.4                       |
| AC-T11   | T11                | 5.1、7.2、10.4/10.5             |
| AC-E01   | E01                | 5.1、10.4                       |
| AC-E02   | E02                | 5.1、附件2、10.4                |
| AC-E03   | E03                | 4.3、5.1、附件2、10.1/10.4      |
| AC-E04   | E04                | 5.1、附件2/6、10.4              |
| AC-F01   | F01                | 5.2、6.2、附件3、10.1/10.4      |
| AC-F02   | F02                | 4.3、5.2、8、10.3               |
| AC-F03   | F03                | 5.2、附件3、10.4                |
| AC-F04   | F04                | 5.2、附件3/4、10.4              |
| AC-F05   | F05                | 5.2、6.1/6.2、附件3、10.4       |
| AC-F06   | F06                | 4.3、5.2、6.1、10.3/10.4        |
| AC-F07   | F07                | 6.1、8、10.4                    |
| AC-F08   | F08                | 5.2、附件3、10.4                |
| AC-F09   | F09                | 5.2、6.2、7.1、8、10.4          |
| AC-F10   | F10、M06           | 5.2、7.1、附件3、10.4/10.5      |
| AC-P01   | P01                | 4.3、5.3、7.1、附件4、10.3/10.5 |
| AC-P02   | P02、T08           | 5.3、7.1、附件4/5、10.5         |
| AC-P03   | P03                | 7.2、附件4、10.5                |
| AC-P04   | P04                | 5.3、7.1、附件4、10.5           |
| AC-P05   | P05                | 5.3、附件4、10.5                |
| AC-P06   | P06                | 5.3、附件4、10.5                |
| AC-P07   | P07                | 5.3、附件4、10.5                |
| AC-P08   | P08                | 5.3、附件4、10.1/10.5           |
| AC-M01   | M01                | 5.4、附件1/6/7、10.6            |
| AC-M02   | M02                | 5.4、附件1、10.6                |
| AC-M03   | M03                | 5.4、附件1、10.6                |
| AC-M04   | M04                | 5.4、附件1、10.6                |
| AC-M05   | M05、G04、T09      | 3、5.3/5.4、附件5/6、10.6       |
| AC-M06   | M06、G06、F01、F10 | 5.2/5.4、附件3、10.6            |
| AC-M07   | M07                | 5.3/5.4、附件4、10.6            |
| AC-M08   | M08                | 5.4、附件2、10.6                |
| AC-D01   | D01                | 5.5、8、10.4/10.5               |
| AC-Q01   | G01–G04、全体组件  | 4、附件1–7、10.3                |
| AC-Q02   | 全部编号           | 9、10                           |
| AC-Q03   | 全部编号           | 8、附件1–8、10.1                |
| AC-Q04   | 全部编号           | 9、10                           |
