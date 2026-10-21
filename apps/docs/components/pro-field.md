---
pageClass: component-doc
---

<script setup>
import ProFieldDemo from '../examples/ProFieldDemo.vue'
</script>

# ProField

ProTable、ProDescriptions、表单字段共用的字段渲染器。`mode="read"` 展示值，`edit` / `update` 提供受控输入；Vue 通过 `v-model` 回传。

<ClientOnly><ProFieldDemo /></ClientOnly>

<<< ../examples/ProFieldDemo.vue

## API

| 属性                                           | 说明                                                                                              |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `text` / `modelValue` / `value`                | 展示或受控值；显式 modelValue 优先，其次 value、text                                              |
| `mode`                                         | `read`（默认）、`edit`、`update`                                                                  |
| `readonly`                                     | 强制只读                                                                                          |
| `valueType`                                    | 类型名称，或 `{ type, ...字段配置 }`；显式 fieldProps 覆盖同义配置                                |
| `fieldProps`                                   | 原生控件配置；日期支持 format / valueFormat，金额支持 locale / customSymbol / numberFormatOptions |
| `options` / `valueEnum`                        | 标签与状态；支持 Map、状态 Success/Danger/Processing/Default/Warning 与颜色                       |
| `request` / `params`                           | 异步标签请求，读写模式均支持；不重复发送读写请求                                                  |
| `debounceTime` / `proFieldKey` / `cacheForSwr` | 请求防抖、共享键与缓存策略                                                                        |
| `render`                                       | `(text, context, dom) => VNodeChild`，只读扩展                                                    |
| `formItemRender`                               | 同参数，编辑扩展；`context.onChange(value)` 回传受控值                                            |
| `copyable` / `ellipsis`                        | 只读文本复制与省略配置                                                                            |
| `emptyText`                                    | 空值占位，默认 `-`，0 / false 保留                                                                |
| `prefixCls` / `classes` / `styles`             | 实例前缀与 root/control 语义样式，支持对象和回调                                                  |

公开 `update:modelValue`、`change`、`requestError` 事件，ref 的 `refresh()` 可重新加载选项。旧 `renderFormItem` 保留兼容，推荐 `formItemRender`。

## 42 个内置类型

文本：text、password、textarea、code、jsonCode。数值：money、digit、digitRange、percent、progress、second。日期：date、dateWeek、dateMonth、dateQuarter、dateYear、dateTime、fromNow 及 dateRange、dateTimeRange、dateWeekRange、dateMonthRange、dateQuarterRange、dateYearRange。时间：time、timeRange。选项：select、checkbox、radio、radioButton、cascader、treeSelect、segmented。其余：rate、slider、switch、image、color、avatar、index、indexBorder、option。

index / indexBorder、option、avatar 在三种模式下始终展示。progress / second 编辑时为数字输入，fromNow 编辑时为日期时间，image 为 URL 输入，code / jsonCode 为多行文本。Schema 的 group / formList / formSet / divider / dependency 由 BetaSchemaForm 处理，直接作为 ProField 时不会生成输入框。

## 原子字段与金额

`FieldText`、`FieldSelect`、`FieldMoney`、`FieldDatePicker` 等具名原子复用相同协议。`FieldMoney` 另外公开 `locale`、`customSymbol`、`moneySymbol`、`numberFormatOptions`、`numberPopoverRender`；默认两位小数，遵循 locale 的分组、小数符号和货币位置。`numberPopoverRender=false` 关闭编辑态金额提示。

```vue
<FieldMoney
  :text="1234.5"
  locale="de-DE"
  custom-symbol="€"
  :number-format-options="{ currency: 'EUR' }"
/>
```

## 自定义类型与预加载

通过 `ProConfigProvider.valueTypeMap` 注册 `render` / `formItemRender`。嵌套 Provider 按类型名继承，同名定义整体替换。示例中的 uppercase 类型可编辑并写回。

`preloadProFieldValueType(type)` 预加载内置类型，`preloadAllProFieldValueTypes()` 预加载全部内置类型；两者执行真实动态导入并复用请求 Promise，未知或自定义类型拒绝。当前根入口仍导出 ProField，预加载不代表每个 valueType 都有独立分包。
