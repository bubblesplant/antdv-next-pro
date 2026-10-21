# ProComponents v3 migration

This alignment references `@ant-design/pro-components@3.1.15-7`, pinned to `3bf43278d39f2d31489749132982488f57a9eb5e`. Vue APIs continue to use slots, `class`, `v-model`, and component refs. Consult each component page for its supported API.

## Classes and styles

Public classes use `ant-pro-*`. A native ConfigProvider with `prefixCls="demo"` produces `demo-pro-*`; a component's explicit `prefixCls` is its complete prefix. Migrate selectors based on `.antdv-next-pro__*` to public selectors or `classes`.

`classes` and `styles` accept an object or `({ props }) => object`. The legacy `classNames` alias fills missing parts; `classes` wins for the same part. Root `class` belongs to the container; native table row classes use `rowClassName`.

```vue
<ProCard title="Users" :classes="{ title: 'user-title' }" :styles="{ body: { padding: '12px' } }" />
```

## Providers

Native ConfigProvider controls locale, direction, prefixes, algorithms, global tokens, and native component tokens. ProConfigProvider adds Pro tokens, explicit intl, and custom value types.

```vue
<a-config-provider :theme="{ components: { Card: { bodyPadding: 12 } } }" :locale="locale">
  <ProConfigProvider :token="{ boxShadow: '0 8px 24px #0002' }">
    <ProCard title="Theme" box-shadow>Content</ProCard>
  </ProConfigProvider>
</a-config-provider>
```

Use `ProConfigProvider.token` for Pro extensions. `theme.components.Result` affects native Result; `theme.components.ProTable` is not a native configuration key. Native locale selects Pro messages unless explicit Pro intl overrides it. Custom value types register `render` and `formItemRender` in `valueTypeMap`; `renderFormItem` remains a deprecated registration alias.

## Column callbacks

`render(dom, record, index, action, schema)` follows the v3 contract. Rewrite old `render(value, { record })` callbacks. The first argument is the formatted display node; read raw values from the record. Grouped columns use `children`. Callback arity does not switch behavior.

```ts
const columns: ProColumns<User>[] = [
  {
    title: 'Name',
    dataIndex: 'name',
    render: (dom, record, index, action, schema) => h('b', record.name),
  },
]
```

## Defaults

| Area             | New default                                              | Explicit override                     |
| ---------------- | -------------------------------------------------------- | ------------------------------------- |
| Table search     | Collapsed                                                | `search: { defaultCollapsed: false }` |
| Fullscreen tool  | Hidden                                                   | `options: { fullScreen: true }`       |
| EditableProTable | Single; preserve the active draft and reject another row | `editable: { type: 'multiple' }`      |
| Composed ProForm | Vertical                                                 | `layout="horizontal"`                 |

Search validates before requesting. Save or cancel an active row before editing another in single mode.

## Forms and asynchronous submission

Compose fields inside ProForm. Use BetaSchemaForm / SchemaForm for `columns`. ModalForm, DrawerForm, QueryFilter, and LightFilter accept schema and composition modes.

```vue
<ModalForm v-model:open="open" :on-finish="save">
  <ProFormText name="name" label="Name" />
</ModalForm>
```

```ts
async function save(values: Record<string, unknown>) {
  await api.save(values)
  return true
}
```

ModalForm and DrawerForm await `onFinish`. Only `true` closes the popup; `false`, `undefined`, and rejection keep it open with its values. Use the callback prop when the return value matters. Step forms also await their callbacks; see the form API for navigation and final submission.

## Scope

Provider, fields, composed forms, ProList, ProDescriptions, and table helpers are included. ProSkeleton, LoginForm/LoginFormPage, PageContainer/ProLayout, StatisticCard/CheckCard, and their new component families are excluded from this implementation.
