# 字段逐项验证矩阵

日期：2026-10-21。固定上游：`3bf43278d39f2d31489749132982488f57a9eb5e`，包版本 `3.1.15-7`。实施边界以 [implementation-scope.md](./implementation-scope.md) 为准。

本报告区分直接组件行为、真实 ProForm 注册和浏览器上传链路。表中“通过”只代表列出的断言，不等于所有控件属性、键盘操作或全部 CSS 像素均已穷尽。单元测试中通过原生组件事件驱动的断言不称为操作系统交互。

## 1. ProField 42 种内置类型

独立枚举来源：`tests/pro-field-modes.test.ts`，不是从实现注册表生成预期。每种类型分别执行 read、edit、update；读模式检查没有可编辑输入框，编辑模式检查对应原生控件、初值和 update:modelValue 回传。`index/indexBorder/option/avatar` 按固定上游在全部模式保持展示，不虚构编辑控件。

| valueType        | read                                  | edit                          | update           | 结果 |
| ---------------- | ------------------------------------- | ----------------------------- | ---------------- | ---- |
| text             | 文本                                  | Input                         | Input            | 通过 |
| password         | 六个掩码字符                          | InputPassword                 | InputPassword    | 通过 |
| money            | locale/币种/精度格式化                | InputNumber，formatter/parser | 同 edit          | 通过 |
| index            | 值 + 1                                | 保持序号展示                  | 保持序号展示     | 通过 |
| indexBorder      | 带边框序号/排名状态                   | 保持序号展示                  | 保持序号展示     | 通过 |
| option           | 操作 VNode/文本，margin 间距          | 保持展示                      | 保持展示         | 通过 |
| textarea         | 文本                                  | TextArea                      | TextArea         | 通过 |
| date             | YYYY-MM-DD                            | DatePicker                    | DatePicker       | 通过 |
| dateWeek         | 周格式                                | DatePicker，week              | 同 edit          | 通过 |
| dateMonth        | YYYY-MM                               | DatePicker，month             | 同 edit          | 通过 |
| dateQuarter      | YYYY-Qn                               | DatePicker，quarter           | 同 edit          | 通过 |
| dateYear         | YYYY                                  | DatePicker，year              | 同 edit          | 通过 |
| dateTime         | 日期时间                              | DatePicker，showTime          | 同 edit          | 通过 |
| fromNow          | Intl.RelativeTimeFormat               | DatePicker，showTime          | 同 edit          | 通过 |
| dateRange        | 日期范围，~ 分隔                      | DateRangePicker               | DateRangePicker  | 通过 |
| dateTimeRange    | 日期时间范围                          | DateRangePicker，showTime     | 同 edit          | 通过 |
| dateWeekRange    | 周范围                                | DateRangePicker，week         | 同 edit          | 通过 |
| dateMonthRange   | 月范围                                | DateRangePicker，month        | 同 edit          | 通过 |
| dateQuarterRange | 季度范围                              | DateRangePicker，quarter      | 同 edit          | 通过 |
| dateYearRange    | 年范围                                | DateRangePicker，year         | 同 edit          | 通过 |
| time             | HH:mm:ss                              | TimePicker                    | TimePicker       | 通过 |
| timeRange        | 时间范围                              | TimeRangePicker               | TimeRangePicker  | 通过 |
| select           | option label，status/color 使用 Badge | Select                        | Select           | 通过 |
| checkbox         | 选项 label 列表                       | CheckboxGroup                 | CheckboxGroup    | 通过 |
| rate             | disabled Rate                         | Rate                          | Rate             | 通过 |
| slider           | 数字                                  | Slider                        | Slider           | 通过 |
| radio            | 布尔/选项展示                         | Radio，checked                | Radio，checked   | 通过 |
| radioButton      | 选项 label                            | RadioGroup，button            | 同 edit          | 通过 |
| progress         | Progress，percent                     | InputNumber                   | InputNumber      | 通过 |
| percent          | 数字 + %                              | InputNumber                   | InputNumber      | 通过 |
| digit            | Intl.NumberFormat                     | InputNumber                   | InputNumber      | 通过 |
| digitRange       | 本地化数字范围                        | 两个 InputNumber              | 两个 InputNumber | 通过 |
| second           | 按 locale 显示时长单位                | InputNumber                   | InputNumber      | 通过 |
| code             | pre/code                              | TextArea                      | TextArea         | 通过 |
| jsonCode         | 格式化 JSON，非法内容保留             | TextArea                      | TextArea         | 通过 |
| avatar           | Avatar，src                           | 保持 Avatar 展示              | 保持 Avatar 展示 | 通过 |
| switch           | 国际化布尔文案                        | Switch，checked               | Switch，checked  | 通过 |
| image            | Image，src                            | Input URL                     | Input URL        | 通过 |
| cascader         | 选项路径，/ 分隔                      | Cascader                      | Cascader         | 通过 |
| treeSelect       | 树选项 label                          | TreeSelect                    | TreeSelect       | 通过 |
| color            | 原生 ColorPicker，open=false          | ColorPicker                   | ColorPicker      | 通过 |
| segmented        | 选项 label                            | Segmented                     | Segmented        | 通过 |

额外的 `group/formList/formSet/divider/dependency` 是 schema 容器，不计入上述 42 类型；直接交给 ProField 时三模式都为空且不回落 Input，由 BetaSchemaForm/组合表单处理。五项均有独立断言。`colorPicker` 是本地控件兼容名，不冒充固定上游第 43 种类型。

补充边界：read 模式对每种类型验证可用展示，但不是对所有输入值逐项锁定格式；金额另有精确字符串矩阵，状态 Badge 有 Success/Danger 归一、运行时更新断言；所有日期格式分支同时通过源码核对，不把一个日期样例外推为时区/夏令时全覆盖。

## 2. 原有 19 个具名字段

证据：`tests/field-wrapper-contract.test.ts` 中 `originalFields` 的三组逐项测试。每行均验证独立公开导出、受控初值→原生 update 事件→modelValue 回传→父值回填、只读展示、真实 ProForm 中 name 注册并进入 store。全局插件注册另见 `tests/pro-form-fields.test.ts` 的 public surface 测试及主控包消费者验证。

| 公开组件                   | 原生协议               | 受控 | 只读             | ProForm name/store | 导出/注册 |
| -------------------------- | ---------------------- | ---- | ---------------- | ------------------ | --------- |
| ProFormText                | Input.value            | 通过 | 通过             | 通过               | 通过      |
| ProFormDigit               | InputNumber.value      | 通过 | 通过             | 通过               | 通过      |
| ProFormTextPassword        | InputPassword.value    | 通过 | 掩码，通过       | 通过               | 通过      |
| ProFormTextArea            | TextArea.value         | 通过 | 通过             | 通过               | 通过      |
| ProFormCaptcha             | Input.value            | 通过 | 通过             | 通过               | 通过      |
| ProFormDatePicker          | DatePicker.value       | 通过 | 通过             | 通过               | 通过      |
| ProFormDateTimePicker      | DatePicker.value       | 通过 | 通过             | 通过               | 通过      |
| ProFormDateRangePicker     | DateRangePicker.value  | 通过 | 通过             | 通过               | 通过      |
| ProFormDateTimeRangePicker | DateRangePicker.value  | 通过 | 通过             | 通过               | 通过      |
| ProFormSelect              | Select.value           | 通过 | 选项 label，通过 | 通过               | 通过      |
| ProFormTreeSelect          | TreeSelect.value       | 通过 | 树 label，通过   | 通过               | 通过      |
| ProFormCheckbox            | Checkbox.checked       | 通过 | 通过             | 通过               | 通过      |
| ProFormRadioGroup          | RadioGroup.value       | 通过 | 通过             | 通过               | 通过      |
| ProFormSlider              | Slider.value           | 通过 | 通过             | 通过               | 通过      |
| ProFormSwitch              | Switch.checked         | 通过 | 通过             | 通过               | 通过      |
| ProFormUploadButton        | Upload.fileList        | 通过 | 文件名，通过     | 通过               | 通过      |
| ProFormUploadDragger       | UploadDragger.fileList | 通过 | 文件名，通过     | 通过               | 通过      |
| ProFormMoney               | InputNumber.value      | 通过 | 通过             | 通过               | 通过      |
| ProFormSegmented           | Segmented.value        | 通过 | 通过             | 通过               | 通过      |

## 3. 新增/增强 16 个具名字段

证据：同文件 `extraFields` 的三组逐项测试。每行验证受控初值、原生清空事件及其原始值、父值回填、只读展示、真实 ProForm 注册和 store 变化。ColorPicker 只读检查 open=false，Rate 只读检查 disabled=true，日期变体同时检查 picker 属性。

| 公开组件                      | 原生/清空值                    | 受控与清空 | 只读 | ProForm name/store | 导出/注册 |
| ----------------------------- | ------------------------------ | ---------- | ---- | ------------------ | --------- |
| ProFormCascader               | Cascader / []                  | 通过       | 通过 | 通过               | 通过      |
| ProFormColorPicker            | ColorPicker / ''               | 通过       | 通过 | 通过               | 通过      |
| ProFormRate                   | Rate / 0                       | 通过       | 通过 | 通过               | 通过      |
| ProFormDigitRange             | 双 InputNumber / [null,null]   | 通过       | 通过 | 通过               | 通过      |
| ProFormTimePicker             | TimePicker / null              | 通过       | 通过 | 通过               | 通过      |
| ProFormTimeRangePicker        | TimeRangePicker / null         | 通过       | 通过 | 通过               | 通过      |
| ProFormRadio                  | Radio.checked / false          | 通过       | 通过 | 通过               | 通过      |
| ProFormCheckboxGroup          | CheckboxGroup / []             | 通过       | 通过 | 通过               | 通过      |
| ProFormDateWeekPicker         | DatePicker week / null         | 通过       | 通过 | 通过               | 通过      |
| ProFormDateWeekRangePicker    | DateRangePicker week / null    | 通过       | 通过 | 通过               | 通过      |
| ProFormDateMonthPicker        | DatePicker month / null        | 通过       | 通过 | 通过               | 通过      |
| ProFormDateMonthRangePicker   | DateRangePicker month / null   | 通过       | 通过 | 通过               | 通过      |
| ProFormDateQuarterPicker      | DatePicker quarter / null      | 通过       | 通过 | 通过               | 通过      |
| ProFormDateQuarterRangePicker | DateRangePicker quarter / null | 通过       | 通过 | 通过               | 通过      |
| ProFormDateYearPicker         | DatePicker year / null         | 通过       | 通过 | 通过               | 通过      |
| ProFormDateYearRangePicker    | DateRangePicker year / null    | 通过       | 通过 | 通过               | 通过      |

`ProFormSearchSelect` 另有默认 searchable/multiple/labelInValue、mode=single 覆盖、动态前缀和 disabled 类断言。不是这 16 项之一。组合成员 `.Text.Password/.Radio.Group/.Radio.Button/.Checkbox.Group/.DatePicker.Week/Month/Quarter/Year/.TimePicker.RangePicker/.Select.SearchSelect` 已验证成员映射；原生 RadioButton 作为 `.Button`，不是会独立注册 name 的 ProForm 字段包装。

## 4. 专用协议和原子字段

- Money：精确验证 en-US、zh-CN、de-DE/EUR、负数、0、小数精度、自定义符号、隐藏符号、禁用千分位、大数，以及编辑 formatter/parser；原始受控值和 Form store 值不被显示格式替换。
- Captcha：真实 ProForm 手机字段校验失败不调用发送；通过时收到手机号。false/reject 不开始倒计时；自定义 captchaTextRender、onTiming、startTiming/endTiming/resetCountdown、重复点击拦截和卸载清理有断言。
- UploadButton：单元验证 maxCount/图片卡/预览/受控 fileList/default slot；Chromium DOM file input change 经 customRequest，观察进度 50%、error、真实删除按钮和入口恢复。
- UploadDragger：Chromium 检查原生 p.ant-upload-drag-icon/text/hint 结构及默认→深色颜色；DataTransfer 多文件 drop 经原生内部 upload-btn 后进入 customRequest，完成回调更新 done；满额隐藏入口；清空列表后单独验证 disabled 阻止上传。未打开操作系统文件对话框，未执行操作系统拖拽或真实服务器上传。
- 公开 Field 原子：FieldText、FieldCascader、FieldCheckbox、FieldCode、FieldColorPicker、FieldDatePicker、FieldDigit、FieldDigitRange、FieldFromNow、FieldImage、FieldMoney、FieldOptions、FieldPassword、FieldPercent、FieldProgress、FieldRadio、FieldRangePicker、FieldRate、FieldSecond、FieldSegmented、FieldSelect、FieldSlider、FieldSwitch、FieldTextArea、FieldTimePicker、FieldTimeRangePicker、FieldTreeSelect；共享 ProField。FieldIndexColumn/FieldStatus 各状态/ProFieldBadgeColor 为专用展示成员；`createProField/defaultRenderText` 为可调用工具。FieldMoney 有单独精确行为测试，其余原子通过源码映射与根导出/消费者检查核对，不宣称每个别名都有独立三模式测试。
- preloadProFieldValueType/preloadAllProFieldValueTypes 执行真实 import 并共享 promise；根入口同时 eager export 所有原子，因此不保证打包后按每种 valueType 产生独立分包。分包粒度取决于消费者和构建器。

## 5. 日志与边界

本域测试结果见 [foundation-evidence.md](./foundation-evidence.md) 和 [foundation-unit.log](./foundation-unit.log)、[foundation-browser.log](./foundation-browser.log)。跨 Table、Schema、组合表单的自定义字段、主题和国际化集成见 [runtime-verification.json](./runtime-verification.json)。最低 peer 版本见 [minimum-peers-verification.json](./minimum-peers-verification.json)。这些历史运行结果不替代主控对最终整包的重新构建与消费者校验。

尚未覆盖：全部控件的完整原生 API、所有语言人工审校、OS 上传对话框、真实服务端上传、全平台浏览器、全 CSS 像素相等，以及日期所有时区边界。上述范围不能从通过的测试数量推导。
