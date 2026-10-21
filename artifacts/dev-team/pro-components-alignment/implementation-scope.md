# 本次实施范围（2026-10-21）

用户已在审阅保留清单后回复“开始吧”，保留范围现已完成实现与最终验收，结果见 [test-report.md](./test-report.md)。本文优先于 PRD、contract、export-inventory 中原始全量范围描述；原始导出清单保留为上游参考，不表示全部移植。

## 保留建设

- 现有 ProCard、ProTable、EditableProTable、SchemaForm、布局及 19 个字段的差异修复。
- Card Group/Divider/tabs、响应式布局、选择状态等。
- ProForm、BetaSchemaForm、Group/FieldSet/List/Dependency/Item；ModalForm、DrawerForm、QueryFilter、LightFilter、StepsForm/StepForm。
- Cascader、ColorPicker、Rate、DigitRange、TimePicker、TimeRangePicker；Radio/Checkbox.Group、日期及范围变体。
- ProList、BaseProList、ProDescriptions。
- DragSortTable、RowEditorTable、CellEditorTable、ListToolBar、TableDropdown、Search。
- ProField 与字段展示/编辑体系、valueTypeMap、格式化、只读、自定义类型。
- ProConfigProvider/ProProvider、国际化、主题、原生 ConfigProvider 配置继承。
- LightWrapper、ErrorBoundary、DropdownFooter、FieldLabel、FilterDropdown、InlineErrorFormItem、LabelIconTip。
- classes/styles、公开类名和动态前缀、属性路由、类型、文档、示例和有效测试。

## 不新增

ProSkeleton 及骨架屏族、LoginForm/LoginFormPage、PageContainer、ProLayout、StatisticCard、CheckCard；不附带建设新的布局、导航、统计卡、选择卡完整组件族。现有实现保留。

不影响保留组件所依赖的轻量内部布局或辅助行为；不将不存在的 React 上下文或工具函数机械导出。

## 固定约定

- classes/styles 遵从 antdv-next，对象或 ({ props }) 回调；旧 classNames 兼容，同部位 classes 优先。
- 默认公开前缀 ant-pro，原生 prefix=demo 时使用 demo-pro；原生 locale、direction、算法、全局/原生组件 token 均继承。
- Pro 扩展 token 走 ProConfigProvider.token，不虚构 theme.components.ProTable。
- v3 render 参数与真实可组合表单语义按已确认契约；弹层 onFinish 返回 true 才关闭。
- 保留用户未提交修改，不自动提交、发包或部署。

## 验收影响

AC-M01（新布局族）、AC-M02（统计/选择卡族）、AC-M04（骨架屏族）退出实施验收。AC-M06、AC-F 系列中 LoginForm/LoginFormPage 部分退出。其余标准仅覆盖上述保留范围；不能将排除项记为通过。

实现结果按实际证据记录“通过 / 失败 / 无法验证 / 未实现 / 本次排除”，不预先声称通过。
