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

### 属性 {#props}

`ProField` 不创建 FormItem。校验、标签和表单路径由上层 [ProFormField](./pro-form-fields#props) 或 [SchemaForm](./schema-form#props) 管理。

| 属性             | 类型                                 | 默认值        | 说明 / 来源                                                                                               |
| ---------------- | ------------------------------------ | ------------- | --------------------------------------------------------------------------------------------------------- |
| `text`           | `unknown`                            | —             | 只读展示值，也是未传受控值时的回退                                                                        |
| `modelValue`     | `unknown`                            | —             | `v-model` 受控值；显式绑定时优先于其他值入口                                                              |
| `value`          | `unknown`                            | —             | 兼容受控值；优先级低于显式 `modelValue`                                                                   |
| `mode`           | `'read' \| 'edit' \| 'update'`       | `'read'`      | 展示或编辑模式                                                                                            |
| `readonly`       | `boolean`                            | `false`       | 强制使用 `read` 模式                                                                                      |
| `valueType`      | `ProFieldValueTypeInput`             | `'text'`      | 类型名称或 `{ type, ...配置 }`；未显式指定且有选项源时推导为 `select`                                     |
| `fieldProps`     | `Record<string, unknown>`            | —             | 传给实际基础控件；[控件归属表](#field-props)列出各类型的原生 API。显式值覆盖 `valueType` 对象中的同名配置 |
| `options`        | `ProFormFieldOption[]`               | —             | 本地选项，结构见[选项属性](./pro-form-fields#options)                                                     |
| `valueEnum`      | `ProFormValueEnum`                   | —             | 对象或 Map；支持标签、状态与颜色，见[选项结构](./pro-form-fields#option-types)                            |
| `request`        | `(params?) => Promise<选项数组>`     | —             | 读写模式均支持的异步标签请求，见[请求规则](./pro-form-fields#options)                                     |
| `params`         | `Record<string, unknown>`            | —             | 请求参数；变化时重新加载                                                                                  |
| `debounceTime`   | `number`                             | `0`           | 请求防抖毫秒数                                                                                            |
| `proFieldKey`    | `string`                             | —             | 配置作用域内的共享请求键                                                                                  |
| `cacheForSwr`    | `boolean`                            | `true`        | 是否复用请求缓存                                                                                          |
| `onRequestError` | `(error: unknown) => void`           | —             | `requestError` 事件监听器，也可写 `@request-error`                                                        |
| `render`         | `(text, context, dom) => VNodeChild` | —             | 只读渲染扩展，优先于 Provider 注册渲染器                                                                  |
| `formItemRender` | `(text, context, dom) => VNodeChild` | —             | 编辑渲染扩展，使用 `context.onChange(value)` 回传                                                         |
| `renderFormItem` | 同 `formItemRender`                  | —             | 兼容回退；优先级低于 `formItemRender`                                                                     |
| `copyable`       | `boolean \| Record<string, unknown>` | `false`       | 只读文本的 [Typography 复制配置](https://www.antdv-next.com/components/typography-cn)                     |
| `ellipsis`       | `boolean \| Record<string, unknown>` | `false`       | 只读文本的 [Typography 省略配置](https://www.antdv-next.com/components/typography-cn)                     |
| `emptyText`      | `VNodeChild`                         | `'-'`         | 空值占位；保留 `0` 和 `false`                                                                             |
| `prefixCls`      | `string`                             | Provider 生成 | 完整字段前缀，默认 `ant-pro-field`                                                                        |
| `classes`        | `对象 \| ({ props }) => 对象`        | —             | `root/control` 部位类名                                                                                   |
| `classNames`     | 同 `classes`                         | —             | 兼容入口，仅补充 `classes` 未指定的部位                                                                   |
| `styles`         | `对象 \| ({ props }) => 对象`        | —             | `root/control` 部位样式，见 [Provider](./pro-config-provider)                                             |

值优先级为显式 `modelValue` → 显式 `value` → 编辑态 `fieldProps.value` → `text`。`class/style/id/data-*/aria-*` 作用于根 `span`；基础控件外观使用 `fieldProps` 或 `control` 语义部位。

### fieldProps 对应的原生 API {#field-props}

| valueType / 模式                                              | 接收方与配置来源                                                                                                                                                                             |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `text/password/textarea/code/jsonCode` 编辑态；`image` 编辑态 | [Input / Password / TextArea](https://www.antdv-next.com/components/input-cn)；代码编辑使用 TextArea，图片编辑使用 URL Input                                                                 |
| `digit/money/percent/second/progress` 编辑态                  | [InputNumber](https://www.antdv-next.com/components/input-number-cn)；金额额外配置见 [ProFormMoney](./pro-form-fields#proformmoney)                                                          |
| `digitRange` 编辑态                                           | 两个 [InputNumber](https://www.antdv-next.com/components/input-number-cn)；额外 `separator='~'`、`separatorWidth=30`，见[数字区间](./pro-form-fields#digit-range)                            |
| 日期、日期区间、`fromNow` 编辑态                              | [DatePicker / RangePicker](https://www.antdv-next.com/components/date-picker-cn)；支持 `format/valueFormat/picker/showTime`                                                                  |
| `time/timeRange` 编辑态                                       | [TimePicker / RangePicker](https://www.antdv-next.com/components/time-picker-cn)                                                                                                             |
| `select/treeSelect/cascader` 编辑态                           | [Select](https://www.antdv-next.com/components/select-cn)、[TreeSelect](https://www.antdv-next.com/components/tree-select-cn)、[Cascader](https://www.antdv-next.com/components/cascader-cn) |
| `checkbox/radio/radioButton/segmented` 编辑态                 | [Checkbox](https://www.antdv-next.com/components/checkbox-cn)、[Radio](https://www.antdv-next.com/components/radio-cn)、[Segmented](https://www.antdv-next.com/components/segmented-cn)      |
| `slider/switch` 编辑态                                        | [Slider](https://www.antdv-next.com/components/slider-cn)、[Switch](https://www.antdv-next.com/components/switch-cn)                                                                         |
| `rate/color`                                                  | [Rate](https://www.antdv-next.com/components/rate-cn)、[ColorPicker](https://www.antdv-next.com/components/color-picker-cn)；只读模式禁用编辑                                                |
| `image/avatar/progress` 展示态                                | [Image](https://www.antdv-next.com/components/image-cn)、[Avatar](https://www.antdv-next.com/components/avatar-cn)、[Progress](https://www.antdv-next.com/components/progress-cn)            |
| 普通文本展示态                                                | `copyable/ellipsis` 使用 [Typography](https://www.antdv-next.com/components/typography-cn)；日期/数值等先经过内部格式化                                                                      |

编辑态的值和更新监听器由字段核心协调，使用 `v-model` 管理值。其他原生属性按对应基础组件定义传入；只读类型只消费与展示有关的配置。

### 事件 {#events}

| 事件                | 参数             | 说明                                  |
| ------------------- | ---------------- | ------------------------------------- |
| `update:modelValue` | `value: unknown` | 编辑值更新，驱动 `v-model`            |
| `change`            | `value: unknown` | 同步通知编辑值变化                    |
| `requestError`      | `error: unknown` | 选项请求失败；模板写 `@request-error` |

### 插槽 {#slots}

| 插槽      | 参数                                                   | 说明                                                                       |
| --------- | ------------------------------------------------------ | -------------------------------------------------------------------------- |
| `default` | `{ mode, value, onChange, fieldProps, defaultRender }` | 自定义字段内容；存在当前模式的显式或 Provider 渲染回调时，由该回调优先渲染 |

`render/formItemRender/renderFormItem` 的第二参也是上述上下文，第三参 `dom` 为默认节点。`defaultRender()` 可重新取得默认节点；回调签名见[属性表](#props)。

### 实例方法 {#instance}

| 方法        | 返回值          | 说明                                                       |
| ----------- | --------------- | ---------------------------------------------------------- |
| `refresh()` | `Promise<void>` | 强制重新加载选项；只读态刷新标签请求，编辑态转发到内部控件 |

`FieldText` 等函数包装的原子字段转发 Props、事件和插槽，但当前不转发内部实例。需要 `refresh()` 时使用 `ProField` 本体。

## 42 个内置类型

文本：text、password、textarea、code、jsonCode。数值：money、digit、digitRange、percent、progress、second。日期：date、dateWeek、dateMonth、dateQuarter、dateYear、dateTime、fromNow 及 dateRange、dateTimeRange、dateWeekRange、dateMonthRange、dateQuarterRange、dateYearRange。时间：time、timeRange。选项：select、checkbox、radio、radioButton、cascader、treeSelect、segmented。其余：rate、slider、switch、image、color、avatar、index、indexBorder、option。

index / indexBorder、option、avatar 在三种模式下始终展示。progress / second 编辑时为数字输入，fromNow 编辑时为日期时间，image 为 URL 输入，code / jsonCode 为多行文本。Schema 的 group / formList / formSet / divider / dependency 由 BetaSchemaForm 处理，直接作为 ProField 时不会生成输入框。

只读 `code` / `jsonCode` 使用带背景的代码块，默认内边距 16px、圆角 3px，并采用主题中的代码字体和次要文本颜色。`jsonCode` 格式化有效 JSON；`fieldProps.class/style` 可定制代码块，`classes.control` / `styles.control` 的同名样式优先。

只读 `textarea` 在未启用 `copyable` / `ellipsis` 时保留换行并对长文本自动折行；`text` 也支持长文本折行。切换只读模式时仍保留 `control` 语义样式和实例前缀。

编辑态 `digitRange` 使用紧凑数字输入组合，分隔符采用主题边框、背景及次要文本颜色。通过 `fieldProps.separator` / `separatorWidth` 设置分隔符和像素宽度，默认分别为 `~` / `30`；`placeholder` 数组分别作用于两端，`fieldProps.style` 设置组合容器样式。

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

### 原子字段索引 {#atoms}

除下表后的独立展示成员外，所有 `Field*` 原子继承[本页属性](#props)、[事件](#events)和[默认插槽](#slots)，固定 `valueType`；原生配置归属见 [fieldProps](#field-props)。它们不创建 FormItem。

| 导出名称               | 固定 valueType |
| ---------------------- | -------------- |
| `FieldText`            | `text`         |
| `FieldCascader`        | `cascader`     |
| `FieldCheckbox`        | `checkbox`     |
| `FieldCode`            | `code`         |
| `FieldColorPicker`     | `color`        |
| `FieldDatePicker`      | `date`         |
| `FieldDigit`           | `digit`        |
| `FieldDigitRange`      | `digitRange`   |
| `FieldFromNow`         | `fromNow`      |
| `FieldImage`           | `image`        |
| `FieldMoney`           | `money`        |
| `FieldOptions`         | `option`       |
| `FieldPassword`        | `password`     |
| `FieldPercent`         | `percent`      |
| `FieldProgress`        | `progress`     |
| `FieldRadio`           | `radio`        |
| `FieldRangePicker`     | `dateRange`    |
| `FieldRate`            | `rate`         |
| `FieldSecond`          | `second`       |
| `FieldSegmented`       | `segmented`    |
| `FieldSelect`          | `select`       |
| `FieldSlider`          | `slider`       |
| `FieldSwitch`          | `switch`       |
| `FieldTextArea`        | `textarea`     |
| `FieldTimePicker`      | `time`         |
| `FieldTimeRangePicker` | `timeRange`    |
| `FieldTreeSelect`      | `treeSelect`   |

### FieldMoney 额外属性 {#money-props}

| 属性                  | 类型                                                                      | 默认值               | 说明 / 来源                                                                                                                                                       |
| --------------------- | ------------------------------------------------------------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `locale`              | `string`                                                                  | Provider intl locale | 金额地区；不支持的值回退 `zh-CN`                                                                                                                                  |
| `customSymbol`        | `string`                                                                  | 地区对应符号         | 自定义货币符号；`fieldProps` 同名配置优先                                                                                                                         |
| `moneySymbol`         | `boolean`                                                                 | `true`               | 显示货币符号；`fieldProps` 同名配置优先                                                                                                                           |
| `numberFormatOptions` | `Intl.NumberFormatOptions`                                                | 两位小数             | [Intl.NumberFormat 配置](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat)；同名 `fieldProps` 优先 |
| `numberPopoverRender` | `boolean \| (props: InputNumberProps, defaultText: string) => VNodeChild` | 默认金额提示         | 仅编辑态显示聚焦金额提示；`false` 关闭。参数属性见 [InputNumber](https://www.antdv-next.com/components/input-number-cn)                                           |

### 独立展示成员 {#display-atoms}

| 成员                                                   | 属性与默认值                                                                                   | 插槽、事件、方法 / 来源                                             |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `FieldIndexColumn`                                     | `text?: number`（空时无文字）、`border?: boolean=false`                                        | `default()` 替换序号；原生 HTML attrs 作用于 span；无自有事件或方法 |
| `FieldStatus.Success/Error/Processing/Default/Warning` | 其余 attrs 传给 [Badge](https://www.antdv-next.com/components/badge-cn)，内部固定对应 `status` | `default()` 为状态文字；无自有事件或方法；另提供小写同名成员        |
| `ProFieldBadgeColor`                                   | `color?: string`，其余 attrs 传给 [Badge](https://www.antdv-next.com/components/badge-cn)      | `default()` 为文字；无自有事件或方法                                |

### 工具函数 {#helpers}

| 函数                                                       | 返回值                 | 说明                                                                                                                                      |
| ---------------------------------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `createProField(renderer)`                                 | `Component`            | 创建共享 Props/插槽协议的自定义字段；renderer 为 `(value, valueType, props, valueTypeMap) => VNodeChild`，或 `{ renderRead, renderEdit }` |
| `defaultRenderText(value, valueType, props, valueTypeMap)` | `VNodeChild`           | 通过 ProField 和已注册的类型渲染器生成默认节点                                                                                            |
| `proFieldParsingValueEnumToArray(valueEnum)`               | `ProFormFieldOption[]` | 将枚举转换为选项数组                                                                                                                      |
| `preloadProFieldValueType(type)`                           | `Promise<void>`        | 预加载一个内置类型                                                                                                                        |
| `preloadAllProFieldValueTypes()`                           | `Promise<void>`        | 预加载所有内置类型                                                                                                                        |

## 自定义类型与预加载

通过 `ProConfigProvider.valueTypeMap` 注册 `render` / `formItemRender`。嵌套 Provider 按类型名继承，同名定义整体替换。示例中的 uppercase 类型可编辑并写回。

`preloadProFieldValueType(type)` 预加载内置类型，`preloadAllProFieldValueTypes()` 预加载全部内置类型；两者执行真实动态导入并复用请求 Promise，未知或自定义类型拒绝。当前根入口仍导出 ProField，预加载不代表每个 valueType 都有独立分包。
