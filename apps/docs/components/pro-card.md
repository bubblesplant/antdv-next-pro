---
pageClass: component-doc
---

<script setup>
import ProCardDemo from '../examples/ProCardDemo.vue'
</script>

# ProCard

`ProCard` 基于 Antdv Next Card，提供主题容器、折叠、响应式分栏、分割线、选择状态与标签页。行为参考 ProComponents `3.1.15-7`，固定提交为 `3bf43278d39f2d31489749132982488f57a9eb5e`。

## 示例

<ClientOnly>
  <ProCardDemo />
</ClientOnly>

<details class="demo-source">
<summary>查看完整代码</summary>

<<< ../examples/ProCardDemo.vue

</details>

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ProCard } from '@bubblesjs/antdv-next-pro'
import '@bubblesjs/antdv-next-pro/style.css'

const collapsed = ref(false)
</script>

<template>
  <ProCard v-model:collapsed="collapsed" title="用户信息" variant="borderless" collapsible>
    <template #extra>操作区</template>
    卡片内容
  </ProCard>
</template>
```

## 主题与前缀

原生 Card 继续读取 `ConfigProvider.theme` 的算法、全局 token 与 `theme.components.Card`。背景、圆角、内容间距及大小随配置变化；未设置 `size` 时继承 ConfigProvider。Pro 扩展通过 [ProConfigProvider.token](./pro-config-provider) 配置，不能把 `theme.components.ProCard` 当作本库入口。

默认 Pro 类名前缀为 `ant-pro-card`；原生 ConfigProvider 的 `prefixCls="demo"` 对应 `demo-pro-card`。组件显式 `prefixCls` 是完整前缀，例如 `prefixCls="business-card"`。根节点同时保留原生 Card 类名，传入的 `class` 追加到根节点。

标题默认没有分割线；`headerBordered` 显示分割线。`variant="borderless"` 移除边框。`ghost` 提供透明背景、无边框、无阴影与零内容内边距。普通卡片边框遵从底层 Card 配置。

## 响应式分栏与组合

父卡片将直接子 ProCard 包装为列。`colSpan` 的数字按 24 栅格计算，字符串作为列宽，`0` 隐藏列；响应式对象使用 `xs/sm/md/lg/xl/xxl`，随窗口宽度变化。`colStyle` 配在父卡片上，应用到各子列包装节点。

```vue
<ProCard :gutter="[16, 12]" wrap>
  <ProCard title="左侧" :col-span="{ xs: 24, md: 8 }">左侧内容</ProCard>
  <ProCard title="右侧" :col-span="{ xs: 24, md: 16 }">右侧内容</ProCard>
</ProCard>
```

`direction="row"` 横向排列，`direction="column"` 纵向排列；`wrap` 允许换行。`gutter` 支持单值、响应式值与 `[横向, 纵向]` 数组。`split="vertical"` 为左右分割，`split="horizontal"` 为上下分割。`layout="center"` 居中内容。

`ProCard.Group` / 具名 `ProCardGroup` 使用透明父卡片，默认横向排列。`ProCard.Divider` / `ProCardDivider` 提供独立分割线，`type` 默认为 `vertical`，也可设为 `horizontal`。

## 标签页

`tabs` 继承 Antdv Next Tabs 的配置，包括 `items`、`defaultActiveKey`、受控 `activeKey`、`onChange` 与条目 `disabled`。条目正文使用 Antdv Next 的 `content`：

```vue
<ProCard
  title="详情"
  :tabs="{
    defaultActiveKey: 'overview',
    items: [
      { key: 'overview', label: '概览', content: '概览内容' },
      { key: 'history', label: '记录', content: '记录内容' },
      { key: 'disabled', label: '未开放', disabled: true, content: '未开放内容' },
    ],
    cardProps: { ghost: true },
  }"
  @tab-change="(key) => console.log(key)"
/>
```

`tabs.cardProps.ghost` 控制标签内容的透明紧凑状态；此对象不作为完整卡片配置传给每个面板，这与固定上游实际使用范围一致。`ProCard.TabPane` / `ProCardTabPane` 是官网历史用法的兼容入口，支持 `key`、`tab`、`disabled` 和配置自身卡片的 `cardProps`；新用法优先使用 `tabs.items`。TabPane 不属于本次固定提交的现有导出。

## 折叠、加载与选择

`collapsible` 或 `collapsible="header"` 允许点击标题区折叠；`collapsible="icon"` 只响应折叠按钮。操作区、标题内交互控件与嵌套卡片不会触发父卡折叠。按钮支持 Enter 和空格，标签跟随国际化配置。

非受控使用 `defaultCollapsed`，受控使用 `v-model:collapsed`。折叠隐藏内容并保留输入状态。`loading` 显示原生 Card 加载态，也可由 `#loading` 替换；加载期间普通正文卸载。

传入 `checked` 启用受控选择状态；点击或 Enter/空格触发 `checked` 事件，父组件更新值。`disabled` 阻止选择与折叠，未显式设置时继承原生全局禁用状态。`boxShadow` 使用当前主题阴影。

## API

| 属性                         | 类型                                       | 说明                           |
| ---------------------------- | ------------------------------------------ | ------------------------------ |
| `title/subTitle/extra`       | `VNodeChild`                               | 同名插槽优先                   |
| `tooltip`                    | `string \| TooltipProps`                   | 对象配置传给实际 Tooltip       |
| `prefixCls`                  | `string`                                   | 完整 Pro 卡片前缀              |
| `layout`                     | `'default' \| 'center'`                    | 内容布局                       |
| `direction`                  | `'row' \| 'column'`                        | 子卡排列方向                   |
| `wrap`                       | `boolean`                                  | 允许子卡换行                   |
| `colSpan`                    | `number \| string \| 响应式对象`           | 子列栅格或宽度                 |
| `colStyle`                   | `CSSProperties`                            | 父卡对子列包装节点的样式       |
| `gutter`                     | `响应式数字 \| 响应式数字[]`               | 横向间距或两轴间距             |
| `split`                      | `'vertical' \| 'horizontal'`               | 分割方向                       |
| `checked/disabled/boxShadow` | `boolean`                                  | 选择、禁用与阴影               |
| `tabs`                       | `TabsProps & { cardProps?: ProCardProps }` | 标签页；cardProps 仅使用 ghost |
| `size`                       | `'default' \| 'small'`                     | 默认继承 ConfigProvider        |
| `type`                       | `'default' \| 'inner'`                     | 普通或内嵌样式                 |
| `variant`                    | `'outlined' \| 'borderless'`               | 优先于兼容属性 bordered        |
| `bordered/headerBordered`    | `boolean`                                  | 卡片边框与标题分割线           |
| `ghost/hoverable/loading`    | `boolean`                                  | 透明、悬浮与加载状态           |
| `collapsible`                | `boolean \| 'header' \| 'icon'`            | 折叠触发方式                   |
| `collapsed/defaultCollapsed` | `boolean`                                  | 受控状态或非受控初值           |
| `collapsibleIconRender`      | `({ collapsed }) => VNodeChild`            | 自定义折叠图标                 |
| `cover/actions`              | 对应 `CardProps` 类型                      | 封面与底部操作，支持同名插槽   |
| `classes/styles`             | 语义对象或 `({ props }) => 语义对象`       | 类名与样式                     |
| `classNames`                 | 语义类名对象                               | 旧入口；同部位 classes 优先    |
| `headStyle/bodyStyle`        | `CSSProperties`                            | 旧入口；同部位 styles 优先     |

语义位置为 `root/header/body/extra/title/actions/cover`。内层结构使用对应前缀的 `title-heading/content/sub-title/collapsible-icon` 等类名。根 `class` 独立追加；折叠时内容 `display:none` 优先于自定义样式。

```vue
<ProCard
  title="紧凑内容"
  class="business-card"
  :classes="({ props }) => ({ body: props.loading ? 'body-loading' : 'body-ready' })"
  :styles="{ body: { padding: '16px' } }"
/>
```

| 事件               | 参数                                                     |
| ------------------ | -------------------------------------------------------- |
| `update:collapsed` | `(collapsed: boolean)`                                   |
| `collapse`         | `(collapsed: boolean)`，用户切换折叠                     |
| `checked`          | `(event: MouseEvent \| KeyboardEvent)`，请求更新受控选择 |
| `tabChange`        | `(key: string)`                                          |

插槽：`default/title/subTitle/extra/cover/actions/loading/collapsibleIcon`。`collapsibleIcon` 接收 `{ collapsed: boolean }`，优先于 `collapsibleIconRender`。

导出包括 `ProCard/ProCardGroup/ProCardDivider/ProCardTabPane`，以及 `ProCardProps/ProCardSlots/ProCardSemanticName`。默认插件注册对应组件。
