---
pageClass: component-doc
---

<script setup>
import ProConfigProviderDemo from '../examples/ProConfigProviderDemo.vue'
</script>

# ProConfigProvider

Pro 组件可独立继承最近的 Antdv Next `ConfigProvider`，包括语言、主题算法、全局 token、原生组件 token、前缀、RTL、尺寸、禁用与弹层容器。`ProConfigProvider` 增加 Pro 文案、自定义字段类型和 Pro token 的局部覆盖。

<ClientOnly><ProConfigProviderDemo /></ClientOnly>

<<< ../examples/ProConfigProviderDemo.vue

## 配置入口

| 定制对象           | 入口                              | 示例                                                      |
| ------------------ | --------------------------------- | --------------------------------------------------------- |
| 全局主题与算法     | `ConfigProvider.theme`            | `token.colorPrimary`、`darkAlgorithm`、`compactAlgorithm` |
| 原生组件 token     | `ConfigProvider.theme.components` | `Card.headerFontSize`、`Result.iconFontSize`              |
| Pro 自绘区域的主题 | `ProConfigProvider.token`         | `colorText`、`colorTextSecondary`、`colorBgContainer`     |
| Pro 文案           | `ProConfigProvider.intl`          | `createIntl('custom', messages)`                          |
| 扩展 valueType     | `ProConfigProvider.valueTypeMap`  | `render` / `formItemRender`                               |

`theme.components.Result` 作用于原生 Result。ProTable、ProCard 的扩展 token 通过 `ProConfigProvider.token` 配置；原生 `components` 中没有新增同名 Pro 组件键。

## 属性 {#props}

| 属性             | 类型              | 默认值      | 说明 / 来源                                                                 |
| ---------------- | ----------------- | ----------- | --------------------------------------------------------------------------- |
| `intl`           | `IntlType`        | —           | Pro 语言；当前显式值 → 祖先显式值 → 最近原生 locale → 中文。                |
| `token`          | `ProToken`        | `{}`        | 在原生 token 上局部覆盖；祖先与当前覆盖合并，见[配置结构](#config-types)。  |
| `valueTypeMap`   | `ProValueTypeMap` | `{}`        | 按类型名继承，同名定义整体替换；定义见下表。                                |
| `prefixCls`      | `string`          | `ant-pro`   | Pro 命名空间；原生 prefix 为 demo 时默认 demo-pro。                         |
| `dark`           | `boolean`         | `undefined` | true 追加深色算法且保留已有算法；false 保留原生算法，不强制浅色。           |
| `hashed`         | `boolean`         | `undefined` | 继承或覆盖原生 theme.hashed。                                               |
| `contentHash`    | `string`          | —           | 请求缓存键的内容版本，省略继承祖先。                                        |
| `autoClearCache` | `boolean`         | `false`     | 卸载仅清理当前 Provider 自有缓存。                                          |
| `needDeps`       | `boolean`         | `false`     | 有祖先且无 intl/token/valueTypeMap/prefixCls/dark/hashed 覆盖时复用父缓存。 |

`ProProvider` 是同一组件的别名。本组件不透传任意原生 ConfigProvider 属性：locale、theme、direction、componentSize、componentDisabled、getPopupContainer 等应在外层 [Antdv Next ConfigProvider](https://www.antdv-next.com/components/config-provider-cn) 设置。

### 配置结构 {#config-types}

| 配置项                                                | 类型                                                               | 说明 / 来源                                                                                                                                                                              |
| ----------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `intl.locale`                                         | `string`                                                           | 语言标识。                                                                                                                                                                               |
| `intl.getMessage`                                     | `(id: string, defaultMessage?: string) => string`                  | 按点路径读取消息。                                                                                                                                                                       |
| `token`                                               | `Partial<GlobalToken>`                                             | 原生 [ConfigProvider 主题 token](https://www.antdv-next.com/components/config-provider-cn)。                                                                                             |
| `token.layout`                                        | `DeepPartial<ProLayoutToken>`                                      | 保留布局数据；header/sider/pageContainer 再做一层合并，当前无 ProLayout 渲染消费者。[完整类型](https://github.com/bubblesplant/antv-next-pro/blob/main/packages/src/provider/types.ts)。 |
| `token.themeId / proComponentsCls / antCls / iconCls` | `number / string / string / string`                                | 保留元数据，不是原生组件配置入口。                                                                                                                                                       |
| `valueTypeMap[type].render`                           | `(text, context, defaultDom) => VNodeChild`                        | 自定义只读视图，见 [ProField](./pro-field#props)。                                                                                                                                       |
| `valueTypeMap[type].formItemRender`                   | `(text, context, defaultDom) => VNodeChild`                        | 自定义 edit/update 控件。                                                                                                                                                                |
| `valueTypeMap[type].renderFormItem`                   | `(text, context, defaultDom) => VNodeChild`                        | 兼容回退；formItemRender 优先。                                                                                                                                                          |
| `context.mode / value / fieldProps`                   | `'read' \| 'edit' \| 'update' / unknown / Record<string, unknown>` | 当前字段模式、值与控件配置。                                                                                                                                                             |
| `context.onChange / defaultRender`                    | `(value: unknown) => void / () => VNodeChild`                      | 回写字段值 / 渲染内置控件。                                                                                                                                                              |

### 插槽 {#slots}

| 插槽      | 参数 | 说明                                  |
| --------- | ---- | ------------------------------------- |
| `default` | —    | 接收配置的后代组件；无额外 DOM 包裹。 |

### 事件 {#events}

无组件事件。

### 实例与辅助函数 {#instance}

无额外公开实例方法。在 setup 中使用以下导出函数：

| 函数                                 | 签名 / 返回值                                                             | 说明                                         |
| ------------------------------------ | ------------------------------------------------------------------------- | -------------------------------------------- |
| `useProConfig()`                     | `ProConfigContext`                                                        | 响应式解析上下文，成员见下表。               |
| `useIntl()`                          | `ComputedRef<IntlType>`                                                   | 当前解析后的语言。                           |
| `useProPrefix(suffix, custom?)`      | `(string, MaybeRefOrGetter<string \| undefined>?) => ComputedRef<string>` | 自定义完整前缀，否则 Pro 命名空间加 suffix。 |
| `createIntl(locale, messages)`       | `(string, object) => IntlType`                                            | 消息包 → 中文基线 → defaultMessage。         |
| `findIntlKeyByAntdLocaleKey(locale)` | `(string \| undefined) => string`                                         | 解析为最接近的内置语言键。                   |

| 上下文成员              | 类型 / 用途                                         |
| ----------------------- | --------------------------------------------------- |
| `intl`                  | `ComputedRef<IntlType>`                             |
| `token`                 | `ComputedRef<GlobalToken & ProToken>`               |
| `nativeToken / hashId`  | 原生主题 token/hash 响应式引用。                    |
| `nativeConfig`          | 原生配置及解析后的 disabled/size。                  |
| `prefixCls / direction` | `ComputedRef<string> / ComputedRef<'ltr' \| 'rtl'>` |
| `valueTypeMap`          | `ComputedRef<ProValueTypeMap>`                      |
| `cache`                 | `Map<string, ProRequestCacheEntry> \| undefined`    |
| `contentHash`           | `ComputedRef<string \| undefined> \| undefined`     |

## 国际化

内置 34 个基线语言包，`intlMap`、`intlMapKeys` 以及 `enUSIntl`、`zhCNIntl` 等均可导入。原生 `locale.locale` 支持大小写、下划线、连字符和语言前缀匹配。缺失消息依次回退中文与调用方默认文案，显式空字符串保留。

```ts
import { createIntl } from '@bubblesjs/antdv-next-pro'

const intl = createIntl('en-US', {
  tableForm: { search: 'Find', reset: 'Clear' },
})
```

查询、编辑、表单操作、字段布尔值、验证码和上传等 Pro 自有文案读取统一 intl；日期面板、分页、原生校验信息读取 Antdv Next 的语言包。新增上传提示在中英文包中提供翻译，其余基线语言未新增的消息按上述规则回退。

## token 的实际消费范围

以下为当前已有渲染消费者的 Pro token；原生组件另行消费自身 `theme.components` token。类型继承 GlobalToken 不表示每个原生 token 都有对应的 Pro 自绘部位。

| token                                                         | 实际生效部位                                                                           |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `colorText`                                                   | Field 根、Table、表单、List、FieldLabel、DropdownFooter                                |
| `colorTextSecondary`                                          | Card 副标题/提示、Table 次要文本、工具栏副标题、LabelIconTip、代码字段与数字范围分隔符 |
| `colorTextHeading`                                            | ListToolBar 标题                                                                       |
| `colorTextPlaceholder` / `colorBgTextHover`                   | FieldLabel 禁用文字与悬停背景                                                          |
| `colorPrimary`                                                | Table 列设置选中项                                                                     |
| `controlItemBgActive` / `controlOutline`                      | Card 选中背景与边框                                                                    |
| `colorPrimaryBg`                                              | Table 选择/提示区                                                                      |
| `colorBgContainer`                                            | Table 全屏、数字范围分隔符；普通 List 根背景透明                                       |
| `colorBgElevated`                                             | Table 列设置弹层、DropdownFooter                                                       |
| `colorFillAlter`                                              | Table 列设置拖拽项悬停                                                                 |
| `colorBorderSecondary`                                        | Table 提示区                                                                           |
| `colorSplit` / `lineWidth` / `lineType`                       | Card/List 分隔线；DropdownFooter 使用 colorSplit                                       |
| `colorBorder`                                                 | 数字范围分隔符边框                                                                     |
| `colorError`                                                  | Table 编辑错误提示                                                                     |
| `boxShadowSecondary`                                          | FilterDropdown 弹层                                                                    |
| `paddingLG`                                                   | QueryFilter 列间距、Card 标签页内容                                                    |
| `paddingXS`                                                   | List 行内边距、小号 Card 标题上下间距、Group 小号间距                                  |
| `marginXS` / `marginXXS`                                      | 提交操作与工具栏间距 / FieldLabel 图标间距                                             |
| `marginLG` / `marginXL`                                       | FormList 操作下间距、工具栏 inline 菜单间距 / Group 标题下间距                         |
| `marginSM`                                                    | List 内容/操作间距、拖拽手柄间距                                                       |
| `borderRadiusLG`                                              | Table 弹层/提示区                                                                      |
| `margin`                                                      | Field option 操作间距、ListToolBar 额外行下间距                                        |
| `boxShadowTertiary`                                           | 显式启用 boxShadow 的 Card                                                             |
| `padding`                                                     | ListToolBar 操作行上下间距、普通 Card 无分割线标题上下间距、纵向标签页导航留白         |
| `fontSize` / `fontSizeSM` / `fontSizeLG` / `fontWeightStrong` | 工具栏与字段标签字号、工具栏标题字重                                                   |
| `fontFamilyCode`                                              | 只读 code/jsonCode 字段                                                                |
| `controlHeight` / `controlHeightSM`                           | FormList 操作高度 / 小号操作与拖拽手柄高度                                             |

Card 标题左右间距优先使用显式原生 `headerPadding/headerPaddingSM`；未配置时使用 Pro 的 `padding/paddingXS`。这两个原生 Card 配置不控制标题上下间距。FilterDropdown 内容 padding 默认固定为 16px，可用组件属性覆盖。

具体组件样式可再通过 `classes` / `styles` 覆盖。

`token.layout.header/sider/pageContainer` 保留类型和嵌套合并协议。本库未提供 ProLayout/PageContainer 渲染组件，因此这些布局字段当前不会改变页面外观。
