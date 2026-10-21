---
'@bubblesjs/antv-next-pro': minor
---

按 ProComponents 3.1.15-7 对齐保留组件：新增 ProConfigProvider/ProProvider、统一 ProField、组合 ProForm 与结构组件、扩展字段、ProList/ProDescriptions、增强表格和辅助组件。

继承 antdv-next ConfigProvider 的 locale、direction、prefixCls、主题算法及全局/原生组件 token，Pro 扩展 token 使用 ProConfigProvider.token。语义样式推荐 classes/styles，兼容 classNames。

迁移注意：公开类名改为 ant-pro-* 并跟随原生动态前缀；列 render 改为 render(dom, record, index, action, schema)；搜索默认折叠、全屏默认隐藏、EditableProTable 默认 single 且保留现有草稿。ModalForm/DrawerForm 等待 onFinish 且仅 true 关闭。详见文档中的 ProComponents v3 对齐迁移。
