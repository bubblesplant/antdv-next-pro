# Provider 与字段公共接口

以下接口已落盘，其他领域可以立即接入。实现仍在补齐测试，不代表整个范围验收完成。

## Provider

源码入口 `src/provider/index.ts`：

- `ProConfigProvider` / `ProProvider`：Vue 组件；props 为 `intl`、`token`、`valueTypeMap`、`prefixCls`、`dark`、`contentHash`、`autoClearCache`、`hashed`、`needDeps`。
- `useProConfig()`：返回 `{ intl, token, nativeToken, nativeConfig, hashId, prefixCls, direction, valueTypeMap, cache, contentHash }`。除 cache 外均为 computed/ref。`token.value` 合并当前原生全局 token 与 Pro 扩展 token；不要通过它读取其他原生组件的专属 token。原生 Card/Table 的 `theme.components` 仍由原生组件消费。
- `useIntl(): ComputedRef<IntlType>`；调用 `intl.value.getMessage('tableForm.search', '查询')`。
- `useProPrefix(suffix: string, customizePrefixCls?: MaybeRefOrGetter<string | undefined>): ComputedRef<string>`。`useProPrefix('card', () => props.prefixCls)` 默认输出 `ant-pro-card`；原生 prefixCls=demo 时为 `demo-pro-card`；实例 prefixCls 为完整前缀。
- 34 个 `xxYYIntl`、`intlMap`、`intlMapKeys`、`createIntl(locale,messages)`、`findIntlKeyByAntdLocaleKey(locale)`。
- `ProSemanticClasses<K>`、`ProSemanticStyles<K>`、`ProSemanticSource<Value,Props>` 类型可从 provider 导入。

`useProConfig().intl` 优先显式 Pro intl → 祖先显式 Pro intl → 当前最近原生 ConfigProvider.locale → 中文；嵌套原生 locale 可覆盖外层原生 locale。所有值响应式。

## 语义样式

源码 `src/shared/semantic.ts`：

```ts
const { classes, styles } = useSemanticStyles(props, {
  classes: () => props.classes,
  classNames: () => props.classNames,
  styles: () => props.styles,
})
```

两者为 computed；支持 `({ props }) => ({ root: ... })`。同部位 classes 优先旧 classNames；classNames 仅补缺失部位。可传第三参数 `{ classes, styles }` 作为默认值，同部位 class 追加，style 属性后者覆盖。

## ProField

源码入口 `src/pro-field/index.ts`：默认具名导出 `ProField`。props：`text`/`modelValue`、字符串或对象 `valueType`、`mode: read|edit|update`、`fieldProps`、`valueEnum`、`options`、`request`、`params`、`emptyText`、`render`、`formItemRender`、`copyable`、`ellipsis`、`prefixCls`、`classes`、`styles`；回调 `update:modelValue` / `change`。

自定义 valueTypeMap 项签名见 `src/provider/types.ts`：`render(text, context, dom)`、`formItemRender(text, context, dom)`；context `{ mode,value,onChange,fieldProps,defaultRender }`。局部 render/formItemRender → Provider valueTypeMap → 内置字段。`renderFormItem` 仅作为 deprecated 兼容别名；正式 `formItemRender` 优先。

嵌套 valueTypeMap 按类型键继承，内层同名项覆盖整个定义，兄弟 Provider 互不影响。显式 intl 为完整 IntlType 对象替换，不进行父子消息深合并；createIntl 的缺失消息先回退内置中文，再回退调用方 defaultMessage，空字符串保留。

字段读取表单上下文协议以 `forms-api.md` 为准；顶层便利控件属性路由到控件，fieldProps 对同义属性优先。
