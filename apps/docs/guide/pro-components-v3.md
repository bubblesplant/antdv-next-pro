# ProComponents v3 对齐迁移

本轮行为参考 `@ant-design/pro-components@3.1.15-7`，固定源码提交为 `3bf43278d39f2d31489749132982488f57a9eb5e`。Vue 继续使用插槽、`class`、`v-model` 和组件 ref。各组件实际支持的属性见对应 API 页。

## 类名与语义样式

默认公开类名使用 `ant-pro-*`，例如 `ant-pro-card`、`ant-pro-table`、`ant-pro-form`。原生 ConfigProvider 的 `prefixCls="demo"` 会生成 `demo-pro-*`；组件自身的 `prefixCls` 是完整组件前缀。

原来依赖 `.antdv-next-pro__*` 的业务样式需要迁移到公开类名，或者使用 `classes`。

```vue
<ProCard
  title="用户"
  class="user-card"
  :classes="({ props }) => ({ title: props.title ? 'user-card-title' : '' })"
  :styles="{ body: { padding: '12px' } }"
/>
```

`classes` 和 `styles` 接受对象或 `({ props }) => 对象`。旧 `classNames` 为兼容别名；同一部位同时设置时 `classes` 优先。根 `class` 仍用于容器，表格行类名使用原生 `rowClassName`。

## ConfigProvider 与 ProConfigProvider

原生 ConfigProvider 控制语言、方向、前缀、主题算法、全局 token 和原生组件 token；ProConfigProvider 提供 Pro token、显式 intl 和自定义 valueType。

```vue
<a-config-provider
  :locale="locale"
  :theme="{
    token: { colorPrimary: '#1677ff' },
    components: { Card: { bodyPadding: 12 } },
  }"
>
  <ProConfigProvider :token="{ boxShadow: '0 8px 24px #0002' }">
    <ProCard title="主题卡片" box-shadow>内容</ProCard>
  </ProConfigProvider>
</a-config-provider>
```

`theme.components.Result` 定制原生 Result。Pro 扩展 token 使用 `ProConfigProvider.token`，不使用 `theme.components.ProTable` 等不存在的原生配置键。仅设置原生 `locale` 即可选择对应的 Pro 内置语言；显式 `ProConfigProvider.intl` 优先。

自定义字段注册使用 `valueTypeMap` 的 `render` 和 `formItemRender`。旧 `renderFormItem` 注册键仅作兼容；列属性的迁移规则见下文。

## 列回调

表格列的 `render` 使用 v3 参数：

```ts
const columns: ProColumns<User>[] = [
  {
    title: '姓名',
    dataIndex: 'name',
    render: (dom, record, index, action, schema) => {
      return h('a', { onClick: () => action.reload() }, record.name)
    },
  },
]
```

原来的 `render(value, { record })` 需要改写。第一个参数为已格式化的显示节点；原始值可通过 `record` 和 `schema.dataIndex` 读取。分组列使用 `children`。回调不会根据函数参数数量自动切换语义。

## 默认行为

| 项目             | 对齐后的行为                            | 保留旧页面表现的显式配置              |
| ---------------- | --------------------------------------- | ------------------------------------- |
| 表格搜索         | 默认折叠                                | `search: { defaultCollapsed: false }` |
| 全屏工具         | 默认隐藏                                | `options: { fullScreen: true }`       |
| EditableProTable | 默认 single，已有编辑行时拒绝开启另一行 | `editable: { type: 'multiple' }`      |
| 组合 ProForm     | 默认 vertical                           | `layout="horizontal"`                 |

搜索提交先走表单校验；校验失败不调用数据请求。single 模式会保留当前草稿，应用应先保存或取消当前行。

## 组合表单与 schema 表单

`ProForm` 使用字段子组件，`BetaSchemaForm` / `SchemaForm` 使用 `columns`。ModalForm、DrawerForm、QueryFilter、LightFilter 继续接收 schema 配置，也可组合字段。

```vue
<ProForm :initial-values="{ name: 'Ada' }" :on-finish="save">
  <ProFormText name="name" label="姓名" :rules="[{ required: true }]" />
</ProForm>
```

需要等待业务结果的提交必须使用可返回结果的 `onFinish` 回调。ModalForm 和 DrawerForm 等待回调完成：只有 `true` 关闭；`false`、无返回值或抛错保留弹层和值。

```ts
async function save(values: Record<string, unknown>) {
  await api.save(values)
  return true
}
```

```vue
<ModalForm v-model:open="open" :on-finish="save">
  <ProFormText name="name" label="姓名" />
</ModalForm>
```

不要用没有返回值的通知事件承担关闭判断。步骤表单同样等待每一步的回调结果，具体前进与最终提交规则见 ProForm 文档。

## 范围

本轮包括 Provider、字段体系、组合表单、ProList、ProDescriptions 和表格辅助组件。ProSkeleton、LoginForm/LoginFormPage、PageContainer/ProLayout、StatisticCard/CheckCard 及其新组件族不在本轮建设范围。
