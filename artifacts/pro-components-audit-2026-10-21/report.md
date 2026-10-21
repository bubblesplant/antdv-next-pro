# ProComponents 对齐检查与待决定差异

检查日期：2026-10-21。结论：本地具备表格、Schema 表单和常用字段的基础能力，但与当前官网的公开 API、默认行为、DOM 类名及增强交互仍有明显差距。不能据此认定为完整兼容实现。

本轮仅检查并保存审计材料，没有修改组件、示例或样式。下面的编号供你选择后续处理范围，优先级只是影响程度的建议。

## 1. 基线、范围与判断方式

| 项目     | 本轮使用的基线                                                                                                                                                                                  |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 官网     | [ProComponents](https://pro-components.antdigital.dev/) 当前页面，实际打开并抽查 Card、Table、Query/LightFilter、StepsForm、Fields 五组页面                                                     |
| 上游源码 | [ant-design/pro-components](https://github.com/ant-design/pro-components/tree/3bf43278d39f2d31489749132982488f57a9eb5e)，固定提交 `3bf43278d39f2d31489749132982488f57a9eb5e`，包版本 `3.1.15-7` |
| 本地     | 当前工作区内容，包 `@bubblesjs/antv-next-pro@0.1.4`，Vue 3 / antdv-next 1.5.2；包含你已有的未提交修改                                                                                           |
| 版本差异 | 本地 [README](C:/malei/stu/antv-next-pro/README.md:7) 声明主要参考 `@ant-design/pro-components@2.8.10`，与当前官网 v3 基线存在代际差异                                                          |
| 覆盖     | 全部 31 个全局注册项：4 个核心组件、8 个表单布局、19 个字段；另检查公开辅助组件、组合名和官网整族缺项                                                                                           |
| 方法     | 导出与类型逐项扫描、实现路径核对、官网 DOM 抽查、本地关键交互探针；证据见文末                                                                                                                   |

固定提交用于让源码结论可复查，不表示官网部署提交已经被证明与其完全一致。未做所有示例、所有尺寸和状态的逐像素比对，因此不提供缺乏统一权重的“相似度百分比”。表中的“缺少”指组件公开契约或内建实现没有对应能力，业务代码另行拼装不计为兼容。

接受的 Vue 适配：`className` → `class`、ReactNode → VNode/插槽、受控值 → `v-model`、事件 → Vue 事件、`actionRef/formRef` → 组件 ref。前提是传递目标、参数含义、执行时机和业务行为一致。Vue 的 scoped 标记、框架内部节点、CSS 哈希无需与 React 逐字相同；公开的 Pro 类名、前缀规则和语义区域应单独对齐。

## 2. 全局差异 G

| 编号 | 官网                                                                      | 本地                                                                                                              | 影响 / 建议优先级                                      |
| ---- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| G01  | 默认 `ant-pro-*` 命名，组件/部位/状态类有固定结构                         | 使用 `antdv-next-pro*`、`__*` 等自有体系，部位和状态类也不一致                                                    | 官网样式覆盖、选择器和结构无法直接沿用；高             |
| G02  | Pro 类前缀通过配置上下文的 `getPrefixCls` 计算，可随全局前缀变化          | Pro 自有类硬编码；全局 `prefixCls="demo"` 只改变基础组件类名                                                      | 自定义全局前缀时 Pro 层不跟随；高，已实测              |
| G03  | 容器 `class`、基础组件属性传给相应目标                                    | SchemaForm 及布局别名的 `class` 没有落到 DOM；Table 的 `rowClassName` 落为外层 div 属性，未传到行                 | 外部样式与基础配置失效；高，已实测。字段属性另见 P01   |
| G04  | ProProvider/ProConfigProvider 提供 Pro token、intl、valueTypeMap 等上下文 | 有底层 token → CSS 变量桥接与深色支持，但没有对应 Pro 全局配置层                                                  | 组件 token、全局字段扩展、默认行为配置未完整对齐；中   |
| G05  | 默认文案受统一国际化配置控制                                              | Schema 按钮硬编码 `Search/Submit/Reset/Previous/Next`，其他组件又有硬编码中文                                     | 中英文及 RTL 场景不统一；中                            |
| G06  | 正式导出 `ProForm`、`BetaSchemaForm`，保留相应组合组件                    | 无 `ProForm` / `BetaSchemaForm`；`Form` 是 columns 驱动的 SchemaForm 别名。Radio/Checkbox/DatePicker 组合名不完整 | 现有官网用法不能只替换框架语法后复用；中，详见 F01/P08 |

### G01：主要 DOM 类名对照

| 区域            | 官网默认类名                                                                        | 本地类名 / 结构                                                          |
| --------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| 表格根          | `ant-pro-table`                                                                     | `antdv-next-pro`                                                         |
| 表格搜索区      | `ant-pro-table-search`、`ant-pro-table-search-query-filter`、`ant-pro-query-filter` | `antdv-next-pro__search`，内部自建原生 form                              |
| 工具栏          | `ant-pro-table-list-toolbar` 及 `-container/-left/-right/-title/-setting-items` 等  | `antdv-next-pro__toolbar` 及 `__toolbar-title/__toolbar-actions` 等      |
| 列设置          | `ant-pro-table-column-setting` 等                                                   | `antdv-next-pro__column-settings` 等                                     |
| 卡片            | `ant-pro-card`、`ant-pro-card-header/body/title/extra` 等                           | `antdv-next-pro-card`、`antdv-next-pro-card__header/body/title/extra` 等 |
| 卡片状态与布局  | `ant-pro-card-border/ghost/col/split/tabs` 等                                       | 部分依靠基础 Card 样式；没有完整对应的 Pro 状态与布局类                  |
| 普通 Pro 表单   | `ant-pro-form`                                                                      | `antdv-next-pro-schema-form` / `antdv-next-pro-schema-body`              |
| QueryFilter     | `ant-pro-query-filter` 及 `-row/-actions/-collapse-button` 等                       | schema-body + `is-queryfilter`，内部通用栅格                             |
| LightFilter     | `ant-pro-form-light-filter` 及 `-container/-item/-effective` 等                     | schema-body + `is-lightfilter`，普通 inline 控件                         |
| 分步表单        | `ant-pro-steps-form` 及 `-container/-step/-step-active` 等                          | `antdv-next-pro-schema-steps` 等 schema 结构                             |
| 动态列表 / 字段 | `ant-pro-form-list*`、`ant-pro-field-*` 等                                          | `antdv-next-pro-form-list*`、统一 readonly span 等                       |

G02 的具体实测：全局前缀为 `demo` 时，Card 根包含 `demo-card`，仍包含 `antdv-next-pro-card`；单独传 `prefixCls="demo-pro-card"` 会改基础 Card 类，但 Pro 内部类仍为 `antdv-next-pro-card__*`。因此仅替换根类名不足以完成对齐。

本地依据：[ProCard](C:/malei/stu/antv-next-pro/packages/antdv-next-pro/src/ProCard.vue:65)、[ProTable](C:/malei/stu/antv-next-pro/packages/antdv-next-pro/src/ProTable.vue:1233)、[SchemaForm](C:/malei/stu/antv-next-pro/packages/antdv-next-pro/src/SchemaForm.vue:451)、[主题桥接](C:/malei/stu/antv-next-pro/packages/antdv-next-pro/src/shared/useThemeVars.ts)。

## 3. ProCard 差异 C

| 编号 | 官网能力                                                                                     | 本地情况                                                                                                                  | 建议优先级                        |
| ---- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| C01  | `layout="center"`、`direction`、`wrap`、`colSpan`、`colStyle`、响应式分栏、`gutter`、`split` | 缺少这套容器布局与嵌套分栏 API                                                                                            | 中                                |
| C02  | `tabs` 与 `ProCard.Group/Divider/TabPane` 等组合能力                                         | 未提供                                                                                                                    | 中                                |
| C03  | `checked/onChecked`、`boxShadow` 及对应状态外观                                              | 未实现相同契约                                                                                                            | 中                                |
| C04  | tooltip 支持对象配置，loading 可使用自定义节点，状态类与 DOM 有对应语义                      | tooltip 仅 string，对象配置缺失；loading 自定义内容已有插槽，属于可接受适配；状态类与 heading/content/collapse 结构仍不同 | 中；不把 loading 插槽本身判为问题 |

已具备：title/subTitle/extra/cover/actions、ghost、基本折叠、size/type/variant、`styles/classNames` 的 root/header/body/extra/title/actions/cover 七个语义区域。不能将这些列为缺失。

依据：[本地类型](C:/malei/stu/antv-next-pro/packages/antdv-next-pro/src/types.ts:13)、[本地实现](C:/malei/stu/antv-next-pro/packages/antdv-next-pro/src/ProCard.vue:137)、[上游 Card](https://github.com/ant-design/pro-components/tree/3bf43278d39f2d31489749132982488f57a9eb5e/src/card)。

## 4. ProTable 差异 T

| 编号 | 官网行为 / 契约                                                                                                                                          | 本地情况                                                                                                                        | 影响 / 建议优先级                                            |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| T01  | 搜索默认折叠；全屏工具默认不显示                                                                                                                         | `defaultCollapsed=false`；fullScreen 默认显示                                                                                   | 初始外观与操作入口不同；中，已实测                           |
| T02  | 搜索表单按规则校验，验证通过后才提交                                                                                                                     | 使用原生 form，没有对应 Form 实例校验；必填为空仍触发 request                                                                   | 行为错误；高，已实测                                         |
| T03  | `filterType="light"`、form/formRef、optionRender、collapseRender、完整搜索配置和自定义字段渲染                                                           | 搜索区是独立简化实现；未接入同等能力，也没有完整使用列自定义搜索编辑器                                                          | 官网搜索用法与效果不等价；高                                 |
| T04  | `headerTitle/tooltip`、`toolBarRender/optionsRender`；toolbar 的 subTitle/tooltip/settings/multipleLine/filter/tabs/menu                                 | 标题采用自有 `toolbar.title`；有 toolbar 插槽和基础搜索，但上述公开能力未完整覆盖                                               | API 改名和交互缺项；中。插槽代替渲染节点可接受，但须保留语义 |
| T05  | `tableRender/tableViewRender/tableExtraRender/searchFormRender`、`tableAlertRender/tableAlertOptionRender`、`cardProps/cardBordered`、内建 ErrorBoundary | 缺少对应契约；无内建选中批量提示条，示例外包不能替代                                                                            | 结构、扩展位置和默认 UI 不同；中                             |
| T06  | 基础 Table props/列 props 传给底层；支持 tableClassName/tableStyle 等                                                                                    | 组件与 decorateColumns 仅选取部分字段；rowClassName、expandable、components、onRow、summary、locale 等未正确进入底层 Table      | 基础表格能力不可直接沿用；高，rowClassName 已实测            |
| T07  | 分组列 `children`；`render(dom, record, index, action, schema)`；当前 v3 使用 `formItemRender`                                                           | 分组名为 `columns`；render 使用 `(value, context)`；renderText 无 action；仍用 `renderFormItem(column, context)`                | 现有列配置需重写，部分来自版本差异；中                       |
| T08  | 完整 ProField 展示：状态/颜色、格式化、indexBorder、复制图标和反馈、ellipsis 对象配置                                                                    | valueEnum 只显示文字；indexBorder 与 index 均为普通序号；copyable 是文字“复制”；ellipsis 仅 boolean；数值和日期字符串格式化不足 | 常见单元格外观与内容不同；中                                 |
| T09  | 多种 valueType，支持对象/函数形式及 Provider 自定义注册                                                                                                  | 本地为有限字符串联合；未知控件类型回退普通输入，缺完整扩展体系                                                                  | 同样 schema 无法保证同样显示/编辑；中                        |
| T10  | 列设置含固定左/右操作及完整 setting 配置；工具项可对象配置/自定义图标或回调                                                                              | 已有显隐、鼠标/键盘拖拽与顺序/固定状态持久化，但面板无固定左/右操作；options 多数只接 boolean                                   | 部分操作和配置缺失；中                                       |
| T11  | `beforeSearchSubmit/dateFormatter/debounceTime` 及对应 onSubmit/onReset/onLoadingChange 等契约；polling 支持函数与完成后调度                             | 缺对应完整流程；polling 仅 number + setInterval，未完整对齐最小间隔和动态周期；分页与 loading 类型也较精简                      | 请求时序、提交数据与配置能力不同；中                         |

T02 实测：配置必填规则，空值点击查询后，请求次数 `1 → 2`，没有校验错误提示。

T08 实测：只读金额 `12345.6` 显示 `¥12345.6`；日期字符串保留 `2026-10-21T12:34:56.000Z`；含 success 状态的枚举仅显示“成功”，没有 Badge。Date 对象及带 format 方法的对象已有格式化，不能说所有日期均无处理。

T07 中 renderFormItem/formItemRender 需要作为 v2 → 当前 v3 的基线选择讨论；不应直接把历史命名认定为 Vue 适配。`copyable` 本轮上游公开类型也是 boolean，其差异在显示和交互，不在是否支持对象。

本地依据：[公开类型](C:/malei/stu/antv-next-pro/packages/antdv-next-pro/src/types.ts:100)、[默认搜索](C:/malei/stu/antv-next-pro/packages/antdv-next-pro/src/ProTable.vue:122)、[搜索提交](C:/malei/stu/antv-next-pro/packages/antdv-next-pro/src/ProTable.vue:687)、[列转换](C:/malei/stu/antv-next-pro/packages/antdv-next-pro/src/ProTable.vue:765)、[工具项](C:/malei/stu/antv-next-pro/packages/antdv-next-pro/src/ProTable.vue:1110)。上游依据：[类型](https://github.com/ant-design/pro-components/blob/3bf43278d39f2d31489749132982488f57a9eb5e/src/table/typing.ts)、[Toolbar](https://github.com/ant-design/pro-components/blob/3bf43278d39f2d31489749132982488f57a9eb5e/src/table/components/ToolBar/index.tsx)、[Table API 文档](https://pro-components.antdigital.dev/components/table.html)。

## 5. EditableProTable 差异 E

除以下差异，还继承 G/T 中适用的类名、属性透传、列与单元格呈现差异。

| 编号 | 官网行为 / 契约                                                                                                             | 本地情况                                                                                       | 影响 / 建议优先级              |
| ---- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------ |
| E01  | 未指定 editable.type 时默认为 single；已有编辑行时按提示/限制机制处理                                                       | 默认 multiple，实测两行可同时进入编辑；本地 single 开新行会取消已有行                          | 默认编辑流程不同；高           |
| E02  | 新建行按钮按 Table 表头/表体扩展位置组织；支持完整按钮属性、图标、节点文案等                                                | 新建按钮位于整个 ProTable 卡片外；RecordCreatorProps 只有少量字段，creatorButtonText 仅 string | 位置、外观、配置不同；中       |
| E03  | editable 的 form/formProps、完整 editableFormRef、onChange/onValuesChange、操作文案/提示、name 联动、标准 actionRender 参数 | 编辑状态与回调契约为简化实现，缺少上述完整配置和表单联动                                       | 复杂编辑表单难以直接迁移；中   |
| E04  | 表单校验和错误交互按上游 Form/Popover 组织；maxLength 按 value.length 判断                                                  | 手写行内错误；树形数据 maxLength 统计全部树节点                                                | 错误布局、树形新增限制不同；中 |

不列为差异：本轮固定上游与本地均不能据“省略 recordCreatorProps”推导默认就应显示新增按钮；不以旧文档印象报错。Vue emit 可以触发对应 onXXX 监听，不因为未直接调用 props.onValuesChange 就认定事件失效。

依据：[本地 EditableProTable](C:/malei/stu/antv-next-pro/packages/antdv-next-pro/src/EditableProTable.vue:28)、[编辑类型](C:/malei/stu/antv-next-pro/packages/antdv-next-pro/src/types.ts:221)、[上游 useEditableArray 默认 single](https://github.com/ant-design/pro-components/blob/3bf43278d39f2d31489749132982488f57a9eb5e/src/utils/useEditableArray/index.tsx#L933)、[上游 EditableTable](https://github.com/ant-design/pro-components/tree/3bf43278d39f2d31489749132982488f57a9eb5e/src/table/components/EditableTable)。

## 6. SchemaForm 与布局差异 F

| 编号 | 官网行为 / 契约                                                                                                            | 本地情况                                                                                                             | 影响 / 建议优先级                                                   |
| ---- | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| F01  | ProForm 和各布局可组合字段子组件；BetaSchemaForm 提供 schema 驱动入口                                                      | 各布局统一包装 SchemaForm，columns 必填；没有对应的独立 ProForm 组合能力                                             | 布局名相近，使用模型不同；高                                        |
| F02  | 普通 ProForm 默认 vertical，可配置完整 Form 布局和属性                                                                     | Form/Embed/SchemaForm 默认 horizontal，Form 属性路由较有限，class 丢失见 G03                                         | 默认标签与控件位置不同；中                                          |
| F03  | QueryFilter 有专门的折叠/展开、响应式布局、列宽与操作区配置                                                                | 通用 inline + 栅格，无完整 QueryFilter 组件契约                                                                      | 不同宽度下布局与折叠行为不同；中                                    |
| F04  | LightFilter 是标签和弹层筛选，支持更多筛选、secondary、placement、footer、值变化提交等                                     | 普通 inline 输入 + Search/Reset 按钮                                                                                 | 核心形态与交互不同；高                                              |
| F05  | StepsForm 管理多个 StepForm 实例、注册、每步 onFinish、formMap 与最终提交                                                  | 单个 formRef 按当前 columns 渲染；最终 submit 只校验当前挂载步骤；StepForm 是独立别名                                | 每步生命周期、跨步校验和组合结构不同；高                            |
| F06  | ModalForm/DrawerForm 接收完整 modalProps/drawerProps、触发器及弹层配置                                                     | 仅覆盖有限的 schema 弹层属性/插槽，缺对应完整配置通路                                                                | 弹层布局和行为配置不足；中                                          |
| F07  | await onFinish；提交期间保持 loading，根据返回值决定关闭                                                                   | emit finish 后即结束 loading 并关闭，不等待监听器返回的 Promise                                                      | 异步保存未完成/返回 false 仍关闭；高，Modal 已实测，Drawer 共用实现 |
| F08  | submitter 的 searchConfig/render/submitButtonProps/resetButtonProps 等标准配置                                             | 仅 false 或 submitText/resetText，加自有插槽                                                                         | 按钮外观、loading 与自定义操作契约不完整；中                        |
| F09  | syncToUrl/syncToInitialValues 等 URL 初始化与同步契约                                                                      | 自有 urlSync true/key/hash 设计                                                                                      | 接口与同步语义需重新映射；中                                        |
| F10  | Group/FieldSet/List/Dependency/Item 为可独立组合的组件；List 支持 copy/move/min/max/creatorRecord/actionGuard/actionRef 等 | group/formSet 主要共用 fieldset/legend；formList 仅基础增删，使用 rowIndex key；有基础 dependencies 但无完整组合体系 | 复杂分组与动态列表能力不同；中                                      |

F07 实测：onFinish 约 500ms 后返回 false，但 `update:open=false` 发出时 Promise 仍 pending；提交按钮无等待状态，最终弹窗仍关闭。Vue 可通过异步 prop 等方式等待结果，这项不是框架必然差异。

已具备：基础依赖字段、convertValue/transform、嵌套路径、grid、表单 ref 方法、基础弹窗和分步切换。上述缺项不等于本地完全没有表单校验或分步能力。

依据：[SchemaForm 类型](C:/malei/stu/antv-next-pro/packages/antdv-next-pro/src/types.ts:430)、[布局导出](C:/malei/stu/antv-next-pro/packages/antdv-next-pro/src/schema-form/layouts.ts)、[提交逻辑](C:/malei/stu/antv-next-pro/packages/antdv-next-pro/src/SchemaForm.vue:192)、[表单主体](C:/malei/stu/antv-next-pro/packages/antdv-next-pro/src/schema-form/SchemaFormBody.vue)、[上游布局](https://github.com/ant-design/pro-components/tree/3bf43278d39f2d31489749132982488f57a9eb5e/src/form/layouts)。

## 7. 字段公共差异与增强差异 P

19 个字段包装最终均进入 ProFormField / FieldControl，因此公共问题会同时影响多项，逐组件覆盖见下一节。

| 编号 | 官网行为 / 契约                                                                                            | 本地情况                                                                                                                                     | 影响 / 建议优先级                                                    |
| ---- | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| P01  | 顶层公共属性与控件属性按各组件约定传给目标；支持 width 枚举、placeholder、proFieldProps、ignoreFormItem 等 | 公共 props 较少，未声明 attrs 在 form-item 模式进入 FormItem；实测顶层 placeholder 到 DIV、input 无 placeholder，Digit 顶层 max 未到输入控件 | API 看似可传但不生效；高。部分可通过 fieldProps 绕行，但不算契约相同 |
| P02  | 统一只读展示、状态 Badge、数字/金额/百分比/日期格式化、默认占位符与宽度、LightFilter 适配                  | 只读主要是统一 span；状态颜色丢失；字符串日期和数字格式化不足；布尔文案硬编码                                                                | 显示结果与布局不同；中                                               |
| P03  | Select/TreeSelect 的远程关键字搜索、防抖、缓存和相关请求参数契约                                           | 已有 options/valueEnum/request/params 与最新请求保护，但没有对应完整关键字联动、debounceTime、共享缓存配置                                   | 基础远程选项可用，搜索行为未对齐；中                                 |
| P04  | Money 的 locale/customSymbol/numberFormatOptions 等金额增强与格式化                                        | 主要为 InputNumber + ¥ 前缀，公开增强项缺失                                                                                                  | 金额输入和展示不同；中                                               |
| P05  | Captcha 的 phoneName 校验/传参、captchaTextRender、startTiming/endTiming 等                                | onGetCaptcha 无参；不处理 phoneName；自有 captchaText/countDownText；ref 主要是 resetCountdown                                               | 手机号联动、计时与文案 API 不同；中                                  |
| P06  | UploadButton 的 title/icon/buttonProps/max 等增强；默认图标与按钮结构                                      | 默认普通“点击上传”按钮无图标，缺对应完整增强 API                                                                                             | 默认外观、满额隐藏和按钮配置不同；中                                 |
| P07  | UploadDragger 默认图标、说明文本层级和上传增强配置                                                         | 默认纯文字占位区，缺官网默认图标及说明结构                                                                                                   | 默认视觉差异明显；中                                                 |
| P08  | 可渲染的 ProFormRadio 及 .Group、ProFormCheckbox.Group、ProFormDatePicker.Week/Month/Quarter/Year 等       | ProFormRadio 只是冻结的 { Group } 对象；Checkbox.Group 和日期组合成员缺少；RadioGroup 顶层 radioType/layout 契约不完整                       | 组合组件与公开使用方式不同；中                                       |

字段层没有独立完整接入官网的 convertValue/transform 等公共链路；Schema 列已经有部分转换支持，这两层不能混为一谈。Segmented 已有选项与 request/params 通路，不将其基础请求能力列为缺失。Digit 的 precision/min 默认值不作为本轮确认差异，避免将文档和不同版本实现混用。

依据：[字段公共类型](C:/malei/stu/antv-next-pro/packages/antdv-next-pro/src/pro-form-fields/types.ts:63)、[属性路由](C:/malei/stu/antv-next-pro/packages/antdv-next-pro/src/pro-form-fields/ProFormField.vue:99)、[控件实现](C:/malei/stu/antv-next-pro/packages/antdv-next-pro/src/pro-form-fields/FieldControl.vue:152)、[只读格式化](C:/malei/stu/antv-next-pro/packages/antdv-next-pro/src/pro-form-fields/readonly.ts:48)、[组合名导出](C:/malei/stu/antv-next-pro/packages/antdv-next-pro/src/pro-form-fields/index.ts:27)、[官网字段文档](https://pro-components.antdigital.dev/components/field-set.html)、[上游字段](https://github.com/ant-design/pro-components/tree/3bf43278d39f2d31489749132982488f57a9eb5e/src/form/components)。

## 8. 全部本地组件逐项覆盖

“基础已具备”不代表全量兼容。全部组件还受适用的 G01/G02/G04/G05 影响。

### 核心组件：4 项

| 组件             | 核对结果                                                                             | 差异编号                            |
| ---------------- | ------------------------------------------------------------------------------------ | ----------------------------------- |
| ProCard          | 基础卡片和语义区域已具备；高级布局、组合成员、状态不全                               | G01–G02，C01–C04                    |
| ProTable         | 基础请求/分页/搜索/列设置/工具栏已具备；公开 API、校验、默认行为、展示不全           | G01–G05，T01–T11                    |
| EditableProTable | 行编辑、树形编辑、基础规则与新增行已具备；默认模式和增强契约不同                     | G01–G05，适用 T 项，E01–E04         |
| SchemaForm       | schema、依赖、转换、嵌套、基础校验已具备；与 BetaSchemaForm 的布局/组合/提交契约不同 | G03/G06，F01–F10 中适用项，P 公共项 |

### 表单布局：8 项

| 组件        | 本地形态与主要不同点                                                            | 差异编号                     |
| ----------- | ------------------------------------------------------------------------------- | ---------------------------- |
| Form        | SchemaForm 的 Form 布局别名，columns 必填，默认 horizontal，无独立 ProForm 导出 | G03/G06，F01/F02/F08/F09/F10 |
| Embed       | SchemaForm 的 Embed 布局别名，属于 schema 布局选择，不等同独立 ProForm          | G03，F01/F02/F08/F09/F10     |
| ModalForm   | 基础弹窗表单；异步 finish 不等待，完整 modalProps 等配置缺少                    | G03，F01/F06/F07/F08/F09     |
| DrawerForm  | 基础抽屉表单；与 Modal 共用不等待 finish 的提交逻辑，drawerProps 不完整         | G03，F01/F06/F07/F08/F09     |
| QueryFilter | inline + 栅格；折叠、响应式、操作区配置不完整                                   | G01/G03，F01/F03/F08/F09     |
| LightFilter | inline 常规控件；缺官网标签/弹层式筛选形态                                      | G01/G03，F01/F04/F08/F09     |
| StepForm    | SchemaForm 独立别名，非 StepsForm.StepForm 的注册实例模型                       | G03/G06，F01/F05/F08         |
| StepsForm   | 当前步骤列渲染，单 Form 实例；每步生命周期与最终校验范围不同                    | G01/G03，F01/F05/F08         |

### 字段组件：19 项

| 组件                       | 已有基础能力                                  | 主要差异编号 / 个别说明                                      |
| -------------------------- | --------------------------------------------- | ------------------------------------------------------------ |
| ProFormText                | Input、v-model、FormItem                      | P01/P02；默认占位符、宽度与公共属性链路                      |
| ProFormDigit               | InputNumber、precision/min                    | P01/P02；顶层 max 路由、只读数字格式化                       |
| ProFormTextPassword        | Password、掩码只读；已有 ProFormText.Password | P01/P02；独立别名本身可保留为扩展                            |
| ProFormTextArea            | TextArea                                      | P01/P02；公共 API 与只读/默认布局                            |
| ProFormCaptcha             | 验证码输入、按钮、倒计时                      | P01/P02/P05；手机号、计时 ref 与回调契约                     |
| ProFormDatePicker          | 基础日期选择                                  | P01/P02/P08；Week/Month/Quarter/Year 组合成员缺少            |
| ProFormDateTimePicker      | 日期时间选择                                  | P01/P02；公共配置、字符串日期只读及提交格式体系              |
| ProFormDateRangePicker     | 日期范围选择                                  | P01/P02；公共配置、范围展示与格式体系                        |
| ProFormDateTimeRangePicker | 日期时间范围选择                              | P01/P02；公共配置、范围展示与格式体系                        |
| ProFormSelect              | options/valueEnum/request/params              | P01/P02/P03；远程关键字联动和缓存配置                        |
| ProFormTreeSelect          | treeData/选项、远程请求                       | P01/P02/P03；远程关键字联动和缓存配置                        |
| ProFormCheckbox            | 单选框或按 options 渲染 Group；已有 layout    | P01/P02/P08；缺 .Group 公开成员，类名/只读呈现不同           |
| ProFormRadioGroup          | 分组选项、请求通路                            | P01/P02/P08；缺可渲染的独立 Radio，radioType/layout 顶层契约 |
| ProFormSlider              | Slider                                        | P01/P02；公共 API、只读呈现与默认布局                        |
| ProFormSwitch              | Switch、checked 映射                          | P01/P02；公共 API、只读布尔文案与布局                        |
| ProFormUploadButton        | Upload、fileList、上传回调                    | P01/P02/P06；默认图标、title/icon/buttonProps/max 等增强     |
| ProFormUploadDragger       | Dragger、fileList、拖拽回调                   | P01/P02/P07；默认图标/说明结构与上传增强                     |
| ProFormMoney               | InputNumber、货币前缀                         | P01/P02/P04；国际化金额输入和格式化                          |
| ProFormSegmented           | Segmented、选项/request/params                | P01/P02；公共 API、只读与模式适配                            |

### 额外公开 UI 与组合对象

| 导出                 | 核对结论                                                                           |
| -------------------- | ---------------------------------------------------------------------------------- |
| ProFormField         | 19 字段的公共包装；重点见 P01/P02，不能视为官网完整 ProFormField/ProField 等价实现 |
| FieldControl         | 本地直接控件适配层；不是官网 ProField 公共兼容替代，缺完整类型/只读/模式/注册体系  |
| ReadonlyField        | 本地统一只读 span，格式化差异见 P02/T08                                            |
| ProFormRadio         | { Group } 对象，不能作为独立单选组件渲染，见 P08                                   |
| ProFormText.Password | 已提供，属于已对齐组合名                                                           |

## 9. 官网整族缺项 M：需单独决定是否纳入建设范围

这些是“当前库没有提供”，与“已有组件实现不一致”分开统计；不能自动推导全部都要新增。以下为公开 UI 族与主要成员，不把每个类型、hook、工具函数算成组件。

| 编号 | 缺少的组件族 / 主要导出                                                                                                                                                                                                                     |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M01  | 布局：ProLayout、PageContainer、PageHeader/ProPageHeader、ProBreadcrumb、FooterToolbar、GridContent、SettingDrawer、PageLoading、DefaultHeader、DefaultFooter、TopNavHeader 等                                                              |
| M02  | 卡片增强：Statistic、StatisticCard、CheckCard 及其组合能力                                                                                                                                                                                  |
| M03  | ProList、BaseProList；ProDescriptions                                                                                                                                                                                                       |
| M04  | ProSkeleton、DescriptionsSkeleton、ListPageSkeleton、ListSkeleton、ListSkeletonItem、ListToolbarSkeleton、PageHeaderSkeleton、TableItemSkeleton、TableSkeleton                                                                              |
| M05  | ProField 及 FieldText/FieldMoney/FieldStatus 等原子字段；ProProvider/ProConfigProvider、完整 intl 与自定义 valueType 注册                                                                                                                   |
| M06  | LoginForm、LoginFormPage；独立 ProForm、BetaSchemaForm、ProFormGroup、ProFormList、ProFormFieldSet、ProFormDependency、ProFormItem 及组合成员                                                                                               |
| M07  | 字段：ProFormCascader、ProFormColorPicker、ProFormRate、ProFormDigitRange、具名 ProFormTimePicker/ProFormTimeRangePicker、DateMonth/Quarter/Week/YearRangePicker 等。time/timeRange 在本地 valueType 中已有基础路径，不计为底层能力完全缺失 |
| M08  | 表格增强：DragSortTable、RowEditorTable、CellEditorTable、ListToolBar、TableDropdown 等                                                                                                                                                     |

上游导出依据：[根入口](https://github.com/ant-design/pro-components/blob/3bf43278d39f2d31489749132982488f57a9eb5e/src/index.ts)、[Layout](https://github.com/ant-design/pro-components/blob/3bf43278d39f2d31489749132982488f57a9eb5e/src/layout/index.tsx)、[Form](https://github.com/ant-design/pro-components/blob/3bf43278d39f2d31489749132982488f57a9eb5e/src/form/index.tsx)、[Card](https://github.com/ant-design/pro-components/blob/3bf43278d39f2d31489749132982488f57a9eb5e/src/card/index.tsx)、[Table](https://github.com/ant-design/pro-components/blob/3bf43278d39f2d31489749132982488f57a9eb5e/src/table/index.tsx)、[Skeleton](https://github.com/ant-design/pro-components/blob/3bf43278d39f2d31489749132982488f57a9eb5e/src/skeleton/index.tsx)。

## 10. 示例效果与组件能力的区别 D01

部分本地示例可展示类似效果，但通过业务代码补齐，不代表对应公共 API 已实现。这些示例可保留，检查组件能力时应分开判断。

| 示例                                       | 实际实现方式                       | 尚未证明对齐的组件能力              |
| ------------------------------------------ | ---------------------------------- | ----------------------------------- |
| SearchLightFilter                          | 关闭组件搜索，外部普通按钮拼筛选条 | filterType=light / 真正 LightFilter |
| SearchRequiredFields                       | 示例外部手动验证                   | ProTable 搜索校验，见 T02           |
| CustomErrorBoundary                        | 示例外部包错误边界                 | ProTable 内建 ErrorBoundary         |
| ListToolbarTabs / TitleMenu / MultipleLine | title 节点内自制按钮、菜单或样式   | toolbar.tabs/menu/multipleLine      |
| FeatureBatchActions                        | 组件外放置 batch-bar               | 内建 tableAlert 与操作区            |
| ToolbarCustomTableBody                     | 外部 custom-table-body             | tableViewRender 等扩展契约          |
| ValueTypeCustom                            | 列 render/renderFormItem           | Provider valueTypeMap 注册          |
| FeatureDateFormatter                       | 业务侧 format/postData             | 组件 dateFormatter                  |

示例目录：[ProTable 示例](C:/malei/stu/antv-next-pro/apps/playground/src/demos/pro-table)。

## 11. 已有能力与本轮实测证据

本轮明确保留为已具备的能力：Card 七个语义区域的 styles/classNames、基础折叠与 ghost；列设置显隐、鼠标/键盘拖拽与持久化；最新请求保护、success=false 错误处理、聚焦刷新、页面隐藏时跳过轮询；树形编辑、基础规则；Schema 依赖、转换、嵌套字段；基础 options/valueEnum/request/params；Vue 事件和插槽适配。

默认 size=middle、rowKey=id、工具栏关键字参数名 keyword，以及 revalidateOnFocus 默认 false，不列为本轮差异。

| 实测项                     | 保存的结果                                                                                                                 |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| 全局 prefixCls             | 基础 Card 跟随，Pro 自有类未跟随                                                                                           |
| ProCard 单独 prefixCls     | 改变基础 Card 前缀，Pro 内部硬编码类未变化                                                                                 |
| Table class / rowClassName | 外层 class 正常；rowClassName 未到 tr                                                                                      |
| 搜索必填规则               | 空提交仍请求，次数 1 → 2，错误提示 0                                                                                       |
| 搜索 / 全屏默认值          | 搜索显示全部探针字段；默认全屏按钮存在                                                                                     |
| Schema 与布局 class        | 普通 SchemaForm、Form、Embed、QueryFilter、LightFilter、StepForm、StepsForm 均未挂载外部 class，并有 fragment 属性透传警告 |
| 字段顶层 placeholder / max | placeholder 落 DIV，input 无占位；Digit 输入未接收到 max                                                                   |
| 异步 finish                | 返回 false 之前已经发出关闭事件，最终弹窗关闭                                                                              |
| Editable 默认模式          | 两行均 startEditable 成功，页面同时 2 个编辑输入                                                                           |
| 只读展示                   | 金额无千分位/固定小数处理；日期字符串原样；枚举无 Badge                                                                    |
| 浏览器异常                 | 探针 browserErrors=[]；上述属性透传警告单独记录                                                                            |
| 官网抽查                   | card、table/api、query-filter、steps-form、field-set 页面均 HTTP 200，已保存实际 Pro 类名列表                              |

证据文件：[运行时结果](C:/malei/stu/antv-next-pro/artifacts/pro-components-audit-2026-10-21/runtime-evidence.json)、[可复现检查脚本](C:/malei/stu/antv-next-pro/artifacts/pro-components-audit-2026-10-21/verify.mjs)、[检查前工作区状态](C:/malei/stu/antv-next-pro/artifacts/pro-components-audit-2026-10-21/initial-status.txt)。本轮无组件实现变更，因此未额外运行构建及全量测试。

## 12. 待你决定的范围

你可以直接指定编号或整组，例如：`先对齐 G01–G03、T01–T03、F07，其余先不动`。

其中 G/C/T/E/F/P 是现有组件的对齐问题；M 是新增组件范围；D01 是示例与组件契约的对应关系。当前没有开始修改其中任何一项。

## 13. 交付与清理记录

开始和结束的 Git 状态对比：除本次新增审计目录外，无状态差异；本轮没有修改已有源码。报告本地链接检查通过，19 个字段包装均有逐项覆盖，结果保存在同目录 final-checks.json；上游提交和版本记录在 reference-baseline.json。

自动审批审查拒绝了临时参考源码的递归删除命令，返回原因是工具策略拦截；未重试或绕过。遗留目录：`C:\Users\Administrator\Documents\Codex\scratch-tests\pro-components-audit-20261021-01a15d5a`。该目录未安装依赖，本轮未创建需要停用的开发服务。
