# Provider、字段与语义样式验收证据

日期：2026-10-21。范围以 [implementation-scope.md](./implementation-scope.md) 为准；固定上游提交 `3bf43278d39f2d31489749132982488f57a9eb5e`，版本 `3.1.15-7`。本文件只给本域判断；涉及 Card/Table/Form 等跨域断言的整条 AC，由主控结合其他领域及最终包验证判断，不把本域通过外推到全部组件。

最终验证状态：各领域冻结后的全库单元测试 13 文件 **396/396**、真实 Chrome 浏览器测试 8 文件 **115/115**，均无跳过。最终日志为 [final-unit-coverage.log](./final-unit-coverage.log)、[final-browser.log](./final-browser.log)，覆盖本域 Provider、字段及上传链路。早先 18:36 跨域编辑造成的导入/编译失败已修复；foundation-unit.log 与 foundation-browser.log 保留的是当时定向运行历史，不作为最终失败结论。

包、演示站、文档站类型及两项 lint 已通过，见 [final-static.log](./final-static.log)。真实打包、ESM/CJS、全部 consumer 类型负例，以及最低 antdv-next 1.5.2 / Vue 3.5.0 的安装/类型/浏览器均通过，见 [test-report.md](./test-report.md)。上传测试 modelValue 更新回调按 UploadFile[] | undefined 接收并归一为空列表，没有缩减上传行为断言。

## 1. 实现及验证入口

- Provider：`src/provider/ProConfigProvider.ts`、`context.ts`、`types.ts`、`locales/`。
- 统一 Field：`src/pro-field/ProField.ts`、`atoms.ts`、`valueType.ts`、`money.ts`、`preload.ts`。
- 字段：`src/pro-form-fields/`；共享语义样式：`src/shared/semantic.ts`；主题桥接：`src/shared/useThemeVars.ts`。
- 根导出/插件：`src/index.ts`。sharedComponents 的具名组件自动导出/注册，包括 TableDropdownButton；FieldStatus 为组合状态对象，使用其成员，不把对象注册成可渲染组件。
- 单元日志：[foundation-unit.log](./foundation-unit.log)。五文件覆盖 ProField 模式、逐字段注册、Provider/语义样式、字段专用协议、远程选项。
- 真实 Chromium 日志：[foundation-browser.log](./foundation-browser.log)。三场景：运行时深色与原生上传 DOM；文件选择→上传进度/失败/删除；多文件拖放→成功及禁用。
- 逐项字段矩阵：[field-mode-matrix.md](./field-mode-matrix.md)。42 类型、19 原字段、16 新字段与组合成员分别列明。
- 主控运行结果：[runtime-verification.json](./runtime-verification.json)；最低 peer 真实包运行：[minimum-peers-verification.json](./minimum-peers-verification.json)。后者使用 antdv-next 1.5.2 / Vue 3.5.0，验证 Card/Form/Table/List/Field 的 prefix、locale、主题。

## 2. 按验收编号记录

| AC     | 本域结论                              | 真实证据与适用边界                                                                                                                                                                                                                                                                                                       |
| ------ | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| AC-G01 | 本域通过，整条见总报告                | 默认 Field/控件部位/组状态与固定源码核对；readonly、error、warning、disabled、indexBorder、option、上传原生层级有断言。Card/Table/Form 类名由各领域验证。                                                                                                                                                                |
| AC-G02 | 本域通过，整条见总报告                | `provider-fields-alignment` 运行时 ant→demo，检查 Cascader/TreeSelect/Color、组方向/状态；显式字段前缀不随全局覆盖。ProField 根、读模式、SearchSelect 部位随前缀更新。例外 `pro-field-select-read` 是上游固定类，不替换。                                                                                                |
| AC-G03 | 字段部分通过，其余跨域                | field/form-item 的 class/style/id/data/aria 路由及 FormItem slots 有直接断言；placeholder/max/fieldProps 分流及 proFieldProps 合并。Schema/布局/Table attrs 由对应领域证据覆盖。                                                                                                                                         |
| AC-G04 | Provider/字段通过，整条见总报告       | 原生 theme.useToken 响应全局算法和 token；显式 Pro token 覆盖不修改原生 token。测试覆盖 reactive color、compact+dark 同时保留；Chromium 验证上传 hint 在运行时暗色后等于原生 colorTextDescription。跨域 runtime 文件检查嵌套/切换/卸载恢复。                                                                             |
| AC-G05 | 本域入口通过，实际消费者如下          | 原生组件 token 仍由原生 Card/Table/Form 消费；Pro 自有 token 只经 ProConfigProvider.token。Card 阴影/默认标题间距已改用 Pro token，显式原生 Card headerPadding 仍优先。layout token 没有本轮布局消费者，不作为外观支持证据。                                                                                             |
| AC-G06 | Provider/ProField 通过，整条跨域      | 注册 render/formItemRender、只读和受控回传；按类型键继承，内层同名完整定义替换，兄弟隔离，运行时注册在主控集成验证。Table 展示/搜索、Schema/组合表单的同类型使用见 runtime-verification。                                                                                                                                |
| AC-G07 | 本域通过，遵循明确契约                | native locale→显式 Pro intl；parent/child Pro token 按字段保留，layout 子对象逐层合并；valueTypeMap 按类型键合并。兄弟请求缓存不串、contentHash 切换、cacheForSwr=false 和 autoClearCache 清理有断言。IntlType 是完整对象替换；createIntl 缺 key 先回内置中文，再 defaultMessage，显式空串保留；不宣称自定义消息深合并。 |
| AC-G08 | 字段/Provider 通过，整条跨域          | 34 个 intl 实例及映射存在；仅 native locale 改动即可使 Provider 消费者、Money、布尔、Captcha、上传及 aria 文案更新。中英文的 Table/编辑/表单/步骤等见主控 runtime。34 语言有数据和回退，不等于全部人工审校。                                                                                                             |
| AC-G09 | 继承和字段方向通过，整条跨域          | native direction 来自最近原生上下文，Field 根 dir 与原生控件、上传原生 RTL 一起更新。Card/浮层定位/固定操作/步骤键盘序列等由其他领域验证，不从一个 dir 属性推断全部可用。                                                                                                                                                |
| AC-G10 | 字段组合成员/根出口通过，表单主体跨域 | Radio 可直接渲染、Group/Button；Checkbox.Group；Text.Password；DatePicker.Week/Month/Quarter/Year；TimePicker.RangePicker；Select.SearchSelect。真实字段在 ProForm 中注册，不是 Schema 别名。ProForm/BetaSchemaForm/各布局语义由 forms 领域覆盖。                                                                        |
| AC-P01 | 字段部分通过，转换顺序与布局跨域      | 顶层 placeholder/max 等到控件，fieldProps 优先；formItemProps 到 FormItem，proFieldProps 到 ProField。width 的 xs/sm/md/lg/xl/数字（含 0）及 field/form-item 路由有效；ignoreFormItem 和 attrs/slots 有断言。convertValue/transform 注册进入 ProForm，但完整读写顺序由 forms 领域证明。                                  |
| AC-P02 | 本域通过，LightFilter 集成跨域        | 42 类型 read/edit/update、19 字段只读逐项矩阵；0/false/[] 区分空值；status/color Badge、Money、日期范围、文件名均走统一 ProField。LightFilter 宽度/弹层/值展示由 forms 领域验证。                                                                                                                                        |
| AC-P03 | 本域通过                              | keyword debounce、请求尚未发出前即失效旧结果、只接受最新响应、params stable serialize、空响应权威值、错误保留成功结果、卸载不回写/不报错。Provider 范围去重/缓存、contentHash 失效、cacheForSwr=false、兄弟隔离均有独立断言。                                                                                            |
| AC-P04 | 本域通过                              | FieldMoney 精确 en-US/zh-CN/de-DE、EUR、自定义符号、隐藏符号、0/负数/大数/小数、分组/精度；编辑 formatter/parser 与字符串值不污染；原字段 controlled+ProForm store。                                                                                                                                                     |
| AC-P05 | 本域通过                              | ProForm 真实手机校验通过才调用 onGetCaptcha(phone)；无效电话不调用；false/reject 不计时；onTiming、自定义文字、startTiming/endTiming/resetCountdown、阻止重复、卸载清理。                                                                                                                                                |
| AC-P06 | 本域通过，OS/服务器边界明确           | 默认/自定义 Button 图标文字、buttonProps、maxCount 和 picture-card、默认 slot、受控 fileList、图片预览；Chromium input change→customRequest→50%→error→真实删除按钮→入口恢复。无 transport 默认 beforeUpload=false，保留本地选择策略，文档已说明。                                                                        |
| AC-P07 | 本域通过，OS/服务器边界明确           | 原生 p 层级、title/description/icon 和 slots；control/icon/title/description 语义样式；多文件 DOM drop 进入真实原生链路，成功 done、满额隐藏；清空列表后 disabled 独立阻止 drop。通过 DOM DataTransfer 测试，不称为 OS 拖拽。                                                                                            |
| AC-P08 | 本域通过                              | 所列组合成员实际映射、单 Radio、radioType=button/layout=vertical、picker 模式和类型；19 原字段及16 新字段受控/只读/真实 Form 注册。根插件注册和包声明由最终包检查复核。                                                                                                                                                  |
| AC-M05 | 本域通过，跨域使用见总报告            | Provider/intl/ProField 和原子具名出口，42 类型逐项模式矩阵；FieldStatus/Badge/Index、对象 valueType、custom render/createProField、动态预加载已实现。原子别名多数通过源码映射和消费者核对，不冒充全部独立三模式断言。                                                                                                    |
| AC-M07 | 本域通过                              | 16 新字段按类型逐项 controlled/clear/readonly/真实 ProForm name/store；日期变体 picker、DigitRange 两端、Color/Rate 只读使用原生能力；具名 Time 和范围入口/类型导出。                                                                                                                                                    |
| AC-Q01 | 本域通过，其他组件跨域                | 共享 classes/styles 接受对象与 ({props}) 回调，运行时回调更新；相同部位 classes 优先 classNames，基础类保留；root 与 control 分离，ProField 路径的 Color/Rate 不丢部位样式。UploadButton.button、Dragger.icon/title/description 有明确目标；styles.root 晚于普通 style。                                                 |

## 3. Token → 实际消费

`ProToken` 接受 Partial<GlobalToken> 与有限 Pro 扩展；接受类型不等于每个字段都在所有组件产生独立视觉效果。下表为本次源码中已核对的消费者，运行时代表性断言见主控 runtime 与各领域测试。

| token                                   | 实际部位                                                                         |
| --------------------------------------- | -------------------------------------------------------------------------------- |
| colorText                               | ProField 根、Table/Form/List、FieldLabel/Footer 文本                             |
| colorTextSecondary                      | Card 副标题/提示、Table 次要文本、LabelIconTip                                   |
| colorPrimary                            | Card 选中 outline、Table 列设置选中状态                                          |
| colorPrimaryBg                          | Table 选择及 alert 区域                                                          |
| colorBgContainer                        | Table 全屏、List 背景                                                            |
| colorBgElevated                         | Table 列设置浮层、DropdownFooter                                                 |
| colorFillAlter                          | Table 拖拽 hover、SchemaForm list                                                |
| colorBorderSecondary                    | Card/List 分隔、Footer、Table alert                                              |
| colorError                              | Table 编辑错误                                                                   |
| boxShadowSecondary                      | FilterDropdown 浮层                                                              |
| paddingLG                               | Form Group、QueryFilter、Steps、List、ListToolBar、FilterDropdown                |
| borderRadiusLG                          | Table 浮层/alert                                                                 |
| margin                                  | Field option 操作间距                                                            |
| boxShadow                               | Card boxShadow                                                                   |
| padding/paddingXS                       | Card 标题默认间距，原生组件显式 headerPadding/headerPaddingSM 优先               |
| layout.*                                | 提供类型与嵌套合并；本轮排除新布局族，没有新增布局消费者，不能称为已验证外观定制 |
| themeId/proComponentsCls/antCls/iconCls | 派生/兼容元数据，不是推荐的业务外观开关                                          |

原生主题全局 token、原生 theme.components 与 Pro token 分属不同入口。没有新增 theme.components.ProCard/ProTable 这类虚构原生能力。Upload 自有说明直接使用原生 DOM，因此继承原生 Upload token；字段 wrapper 的 Pro token 只影响其自己实际消费的部位。

## 4. 公开类名逐项核对

| 目标               | 固定基线与当前公开类                                                                   | 动态/状态验证                                                        |
| ------------------ | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| ProField 根        | ant-pro-field                                                                          | demo-pro-field、实例完整 prefixCls                                   |
| 模式               | -read/-edit/-update                                                                    | 三模式矩阵，readonly 强制 read                                       |
| Text/Textarea 只读 | ant-pro-field-readonly                                                                 | 随全局前缀；旧 ReadonlyField 也进入统一 Field                        |
| Select read        | pro-field-select-read                                                                  | 上游原本没有 ant，刻意保留，不机械改前缀                             |
| Index              | ant-pro-field-index-column / -border / top-three                                       | index/indexBorder 与排名状态                                         |
| 操作               | ant-pro-field-option                                                                   | Pro margin 影响 gap                                                  |
| Cascader           | ant-pro-field-cascader                                                                 | 全局/实例前缀                                                        |
| TreeSelect         | ant-pro-field-tree-select                                                              | 全局/实例前缀                                                        |
| Color              | ant-pro-field-color-picker                                                             | 原生只读触发器及编辑控件                                             |
| Radio Group        | ant-pro-field-radio-horizontal/vertical/error/warning                                  | 真实 FormItem 错误/警告；原生 ConfigProvider size/disabled 继续继承  |
| Checkbox Group     | ant-pro-field-checkbox-group，ant-pro-field-checkbox-horizontal/vertical/error/warning | 组容器与控件部位，真实 FormItem 状态                                 |
| SearchSelect       | ant-pro-filed-search-select / -disabled                                                | 上游 filed 拼写保留；原生全局 demo 后为 demo-pro-filed-search-select |
| Captcha            | ant-pro-field-captcha                                                                  | 输入和计时按钮使用原生组件；动态前缀                                 |
| UploadDragger 部位 | ant-upload-drag-icon / ant-upload-text / ant-upload-hint                               | 属原生 Upload 前缀，demo-upload-*，不强改为 Pro 字段类               |

`hashId`、Vue 内部标记和 React CSS 哈希不要求逐字一致。Checkbox 的包装容器属于 Vue 适配的布局承载，已保留对应公共部位/状态，不承诺全部内部 DOM 与 React 相同。

## 5. 文档及限制

已更新中英文 Provider、ProField、ProFormFields 文档及示例，解释三层主题入口、国际化优先级、token 消费、classes/styles 部位、受控/只读/上传策略、预加载分包边界。根入口通过现有 export * 与 sharedComponents 自动整合 core 的 TableDropdown.Button / TableDropdownButton。

本域不创建大型临时安装项目，不删除上游审计 clone，由主控最终统一清理。未提交、未发布、未部署。没有改用户既有工作区内容以撤销其变更。

未覆盖边界：34 语言人工逐字审校；所有原生控件完整 API；操作系统文件对话框/拖拽和真实服务端；所有日期时区；全平台浏览器；全部 CSS 像素相等。本域单元在 jsdom 有原生 getComputedStyle pseudo-elements 提示，未作为浏览器视觉证据；真实样式变化在 Chromium 单独验证。

最终类型、构建、ESM/CJS、全局注册、整包消费者和跨域全回归由主控统一执行；本报告不是整库已完成声明。
