# 表单最终接口与集成说明

更新日期：2026-10-21。实施范围以 implementation-scope.md 为准；验证结论见 forms-evidence.md。本文件描述当前运行接口，不以导出或类型声明代替行为证据。

## 入口与兼容

| 公开入口                                                    | 运行模型                                                             | 源码                                                                           |
| ----------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| ProForm                                                     | 默认插槽组合真实字段；默认 vertical                                  | src/pro-form/ProForm.ts、index.ts                                              |
| ProForm.Group/FieldSet/List/Dependency/Item                 | 对应独立具名组件，不是占位成员                                       | src/pro-form/structure.ts                                                      |
| ProForm.Provider/ErrorList/useForm/useFormInstance/useWatch | 表单协调、原生错误列表与 hooks                                       | src/pro-form/hooks.ts、index.ts                                                |
| BetaSchemaForm / SchemaForm                                 | 同一 schema 驱动实现；后者保留兼容名称                               | src/SchemaForm.vue、schema-form/index.ts                                       |
| Form / Embed                                                | 保留 columns 入口；没有 columns 时使用组合 ProForm                   | src/schema-form/layouts/*.vue、SchemaLayout.vue                                |
| ModalForm / DrawerForm / QueryFilter / LightFilter          | 公开包装器按 columns 是否存在选择 schema 或组合入口                  | src/schema-form/layouts/*.vue、src/pro-form/layouts.ts                         |
| StepsForm / StepsForm.StepForm / StepForm                   | 无 columns 时为独立注册步骤；有 columns 时按顶层分组生成 schema 步骤 | src/schema-form/layouts/StepsForm.vue、StepForm.vue、src/pro-form/StepsForm.ts |

正式 schema 子级为 children；旧 columns 仅在 children 缺省时回退。正式 formItemRender(schema, context, nativeForm) 优先于旧 renderFormItem(context)，不根据函数参数数量推测版本。字段基础类型及具名字段由 foundation 领域维护。

## 值、校验与实例

- 组合表单初始化优先级为 initialValues < request(params) < URL < modelValue；内容相同的初始化参数不重置草稿，异步请求只接收最新结果。
- convertValue 在值进入表单时执行；dateFormatter 默认为 string，false 保留日期对象；transform 在格式化出站值时执行，返回对象时删除源字段并合并根对象。格式化读取不修改模型。
- onFinish 是可等待 prop，类型为 boolean | void | Promise<boolean | void>；submit 事件只观察格式化结果。submit() 合并并发提交，校验或业务失败会 reject。
- ProFormInstance 提供 nativeForm、validate/validateFields、validateFieldsReturnFormatValue、getFieldsValue/getFieldValue、getFieldsFormatValue/getFieldFormatValue、setFieldsValue/setFieldValue、reset/resetFields、clearValidate、submit、scrollToField、loading Ref。SchemaFormInstance 增加 open/close/next/prev；StepsForm 根实例增加 next/prev/formMap。
- onValuesChange(changedValues, values) / schema values-change 的 changedValues 是嵌套对象；schema field-change 保留单字段 { path, value } 事件。

## 字段连接

源码 src/pro-form/context.ts 不依赖原生 Form 私有上下文。

- useProFormContext() 提供响应式 model、readonly/disabled Ref 和表单实例方法。
- useProFormNamePath(() => name) 自动补全 List/FieldSet 作用域，FormItem.name 使用绝对路径。
- 显式字段 modelValue 优先于上下文值；普通更新调用 context.setFieldValue 并保留字段自身事件。
- registerField({ path, convertValue?, transform?, valueType?, preserve? }) 返回卸载清理函数。无 name 字段不注册，preserve=false 卸载时移除值。
- useProFormListContext() 提供当前行 index/key/listName；List 使用稳定 key，move 不重建原字段 DOM。

## 结构与布局

Group 支持 title/tooltip/extra、direction/size/labelLayout、受控及非受控折叠；FieldSet 将一组子控件绑定到数组值；Dependency 读取指定路径及 List 行作用域；Item 为原生控件提供 FormItem、值绑定和只读 ProField。

List 的 actionRef/组件 ref 提供 add/remove/copy/move/get/getList；支持 min/max、creatorRecord、creatorButtonProps、copyIconProps/deleteIconProps、actionRender/itemRender 和异步增删 guard。readonly/disabled 约束公开操作。默认插槽参数为 { field, index, action, fields, record, list }。

QueryFilter 支持响应式 span、collapsed/defaultCollapsed、defaultColsNumber、labelWidth、split、optionRender/collapseRender 和 searchText/resetText；折叠以 display 隐藏字段，保留值及校验。Table 必须复用公开 QueryFilter/LightFilter，不另造搜索表单。

LightFilter 默认普通字段外置、secondary 字段进入更多；collapse=true 全部收进更多。普通字段及更多组共用 LightWrapper 的打开快照、取消恢复、确认校验提交和清除提交；更多中直接渲染真实字段行。placement/footerRender 传给对应 Popover。LightWrapper 支持受控 open。

组合 StepsForm.StepForm 各自持有原生 Form、初始值、校验和 onFinish。未设置 step onFinish 时校验成功即前进；已设置时只有 true 前进。最终提交校验所有已注册步骤并合并格式化值；返回保留草稿，动态卸载/重新注册更新 formMap。根 onFinish 返回 true 后重置步骤和值。

ModalForm/DrawerForm 的受控 open 通过 update:open 通知父层；非受控支持 trigger 与实例 open/close。modalProps/drawerProps 传原生弹层，open、业务 title/width、关闭回调和 footer 由表单管理；操作区通过 submitter/插槽配置。只有 onFinish 返回 true 才关闭；false/void/reject 保持打开。revision/alive 避免旧请求关闭已重开或已卸载的弹层。

默认取消按钮关闭并调用原生 onCancel/onClose，保留草稿；显式 reset() 恢复初始值。destroyOnHidden（回退旧 destroyOnClose）为 true 时在关闭动画结束后销毁/重置，下次打开恢复初始值；原生 afterClose/afterOpenChange 回调保留。submitTimeout 只出现在 ModalForm/DrawerForm 及 schema 的公开类型，正数以毫秒限制提交关闭保护：取消暂时禁用，交互关闭忽略；超时或完成解锁，不中止 Promise，不提前结束真正提交 loading。实例 close() 与外部 open 仍由调用者控制。

## 提交区与 URL

submitter=false 隐藏操作区。searchConfig 文案优先于兼容 submitText/resetText；submitButtonProps/resetButtonProps 可为 false，保留自定义点击回调、禁用等配置。步骤上一页使用 resetButtonProps，下一页及最终提交使用 submitButtonProps。render({ form, submit, reset }, doms) 可返回自定义节点或 false；组合 #submitter、schema #submitter/#step-actions 保留各自文档化参数。定制节点调用提供的 submit 才走标准校验。

syncToUrl 同步点路径 query 参数，函数模式为 (values, 'get' | 'set') => values；syncToInitialValues=false 跳过初始回填。URL 写入保留外部参数并删除本表单拥有的空键；popstate 回填和清除已删除的字段。schema 旧 urlSync 保留 key/hash 模式，正式入口优先。

## 前缀与语义部位

classes/styles 接受对象或 ({ props }) => object；classNames 为补缺兼容，同部位 classes 优先。原生 prefix=demo 时公开 ant-pro 前缀变为 demo-pro；prefixCls 是完整覆盖前缀。

| 组件               | 默认公开类及真实部位                                                                                                                         | 已接语义部位                                                  |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| ProForm            | ant-pro-form（原生 Form）、-submitter                                                                                                        | root/form、submitter                                          |
| QueryFilter        | ant-pro-query-filter-container 外壳；form.ant-pro-query-filter；-row/-col/-actions/-collapse-button                                          | root、row、item、actions、collapseButton；form 经内部 ProForm |
| LightFilter        | ant-pro-form-light-filter；-middle/-small/-large/-effective/-container/-item/-line/-collapse-icon                                            | root、container；内部 ProForm 消费其部位                      |
| LightWrapper       | ant-pro-field-light-wrapper-container/-footer（Popover 内容）                                                                                | 使用原生 Popover 属性及插槽                                   |
| StepsForm 组合入口 | ant-pro-steps-form；-steps-container/-container/-submitter；ant-pro-steps-form-step/-active                                                  | root、container、submitter；每步表单单独配置                  |
| ProFormGroup       | ant-pro-form-group；-title/-container/-twoLine/-collapsed                                                                                    | root、title、container                                        |
| ProFormList        | ant-pro-form-list；-item/-item-default/-item-show-label/-container/-action/-action-icon；action-copy/action-remove                           | root、item                                                    |
| FieldSet           | ant-pro-form-field-set；-space/-group                                                                                                        | 原生 FormItem 和 space 配置                                   |
| BetaSchemaForm     | 按布局使用 ant-pro-form/query-filter/form-light-filter/steps-form；-content/-steps-container/-steps/-container/-step/-step-active/-submitter | root/content；步骤 container/step/submitter；筛选转相应布局   |

SchemaForm 仍保留 antdv-next-pro-schema-* 历史内部选择器，与公开 ant-pro 类共存；当前不是 DOM 类名逐字唯一复刻。普通 schema 内层表单部位通过 formProps.classes/styles 设置。

class/style/id/data-_/aria-_ 挂到实际 Form 或布局容器；弹层外壳用 modalProps/drawerProps。locale/direction/componentDisabled/componentSize、主题算法、全局和原生 Form/Input 等组件 token 继承原生 ConfigProvider；Pro 扩展 token 使用 ProConfigProvider.token，不声明 theme.components.ProForm。

## 当前边界

运行测试与未覆盖项逐条列于 forms-evidence.md。原生弹层全部配置排列、所有筛选 placement/footer 组合及任意动态步骤重排尚未穷举；不能从代表测试推导所有排列通过。
