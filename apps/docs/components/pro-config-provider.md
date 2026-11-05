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

## Props

| 属性             | 类型 / 默认值      | 说明                                                                |
| ---------------- | ------------------ | ------------------------------------------------------------------- |
| `token`          | `ProToken`         | 基于原生解析 token 的局部覆盖，嵌套 Provider 合并显式覆盖           |
| `intl`           | `IntlType`         | 当前显式值 → 祖先显式值 → 最近原生 locale → 中文                    |
| `valueTypeMap`   | `ProValueTypeMap`  | 按类型名继承；同名类型的整个定义替换，其他类型继续继承              |
| `prefixCls`      | `string`           | Pro 命名空间；默认 `ant-pro`，原生 prefix 为 `demo` 时为 `demo-pro` |
| `dark`           | `boolean` / 未指定 | true 追加深色算法，保留 compact；未指定继承原生配置                 |
| `hashed`         | `boolean` / 未指定 | 继承或覆盖原生 hash 类配置                                          |
| `contentHash`    | `string`           | 当前请求缓存键的内容版本                                            |
| `autoClearCache` | `boolean` / false  | 卸载仅清理当前 Provider 拥有的缓存                                  |
| `needDeps`       | `boolean` / false  | 无覆盖配置时复用父 Provider 的缓存作用域                            |

`ProProvider` 是 Vue Provider 组件别名。`useProConfig()` / `useIntl()` / `useProPrefix()` 返回响应式上下文；在 setup 中读取其 ref，渲染时使用 `.value`。

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

`token.layout.header/sider/pageContainer` 保留类型和嵌套合并协议。本轮未建设 ProLayout/PageContainer，因此这些布局字段没有对应可渲染组件，不能据类型接受推断页面外观已改变。
