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

卡片默认无阴影，ProTable 的搜索区和表格区也沿用此行为。`boxShadow` 显式开启主题阴影，`hoverable` 在悬浮时显示阴影，`styles.root.boxShadow` 可自定义阴影。

`boxShadow` 使用 `boxShadowTertiary`，`ghost` 优先于内置阴影。Card 的 `headerPadding/headerPaddingSM` 控制标题左右间距；无分割线标题的上下留白分别使用普通 `padding` 和小尺寸 `paddingXS`。

普通卡片的默认边框、圆角、正文间距和标题字重跟随原生 Card，与 ProComponents 3.x 的普通 Card 路径一致；官网稳定 2.x 的这些默认值有所不同。

## 响应式分栏与组合

父卡片将直接子 ProCard 包装为列。`colSpan` 的数字按 24 栅格计算，字符串作为列宽，`0` 隐藏列；响应式对象使用 `xs/sm/md/lg/xl/xxl`，随窗口宽度变化。`colStyle` 配在父卡片上，应用到各子列包装节点。

```vue
<ProCard :gutter="[16, 12]" wrap>
  <ProCard title="左侧" :col-span="{ xs: 24, md: 8 }">左侧内容</ProCard>
  <ProCard title="右侧" :col-span="{ xs: 24, md: 16 }">右侧内容</ProCard>
</ProCard>
```

`direction="row"` 横向排列，`direction="column"` 纵向排列；`wrap` 允许换行。`gutter` 支持单值、响应式值与 `[横向, 纵向]` 数组。`split="vertical"` 为左右分割，`split="horizontal"` 为上下分割。`layout="center"` 居中内容。

包含子 ProCard（包括 `v-for` 产生的 Fragment）或设置 `split` 时，父卡片默认清除内容内边距；`bodyStyle/styles.body` 可显式覆盖。单独设置 `direction/gutter` 不会改变普通内容的布局。分割线遵循主题的 `lineWidth/lineType/colorSplit`。

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

标签页由导航和内容区分别管理留白，外层 Card 默认无内容内边距；`tabs.styles` 可覆盖对应部位，`tabs.cardProps.ghost` 默认清除标签内容区留白。

## 折叠、加载与选择

`collapsible` 或 `collapsible="header"` 允许点击标题区折叠；`collapsible="icon"` 只响应折叠按钮。操作区、标题内交互控件与嵌套卡片不会触发父卡折叠。按钮支持 Enter 和空格，标签跟随国际化配置。

非受控使用 `defaultCollapsed`，受控使用 `v-model:collapsed`。折叠隐藏内容并保留输入状态。`loading` 显示原生 Card 加载态，也可由 `#loading` 替换；加载期间普通正文卸载。

传入 `checked` 启用受控选择状态；点击或 Enter/空格触发 `checked` 事件，父组件更新值。`disabled` 阻止选择与折叠，未显式设置时继承原生全局禁用状态。`boxShadow` 使用当前主题阴影。

选中态使用主题的 `controlItemBgActive/controlOutline` 设置背景和边框，并显示主题色角标。

## API

### 属性 {#props}

| 属性                    | 类型                                                         | 默认值                | 说明 / 来源                                                                                                             |
| ----------------------- | ------------------------------------------------------------ | --------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `title`                 | `VNodeChild`                                                 | —                     | 标题；`title` 插槽优先。                                                                                                |
| `subTitle`              | `VNodeChild`                                                 | —                     | 副标题；`subTitle` 插槽优先。                                                                                           |
| `extra`                 | `VNodeChild`                                                 | —                     | 标题右侧内容；`extra` 插槽优先。                                                                                        |
| `tooltip`               | `string \| TooltipProps`                                     | —                     | 提示字符串或 [Tooltip 属性](https://www.antdv-next.com/components/tooltip-cn)。                                         |
| `prefixCls`             | `string`                                                     | `ant-pro-card`        | 完整前缀；继承 ProProvider / 原生前缀。                                                                                 |
| `layout`                | `'default' \| 'center'`                                      | `default`             | 正文居中布局。                                                                                                          |
| `direction`             | `'row' \| 'column'`                                          | `row`                 | 子卡片排列方向。                                                                                                        |
| `wrap`                  | `boolean`                                                    | `false`               | 子卡片允许换行。                                                                                                        |
| `colSpan`               | `ProResponsiveValue<number \| string>`                       | —                     | 在父卡中占用 24 栅格或指定宽度；0 隐藏。                                                                                |
| `colStyle`              | `CSSProperties`                                              | —                     | 父卡对子卡列包装节点应用的样式。                                                                                        |
| `gutter`                | `ProResponsiveValue<number> \| ProResponsiveValue<number>[]` | `0`                   | 横向间距或 `[横向, 纵向]`；响应式键 `xs/sm/md/lg/xl/xxl`。                                                              |
| `split`                 | `'vertical' \| 'horizontal'`                                 | —                     | 子卡之间的分割方向。                                                                                                    |
| `checked`               | `boolean`                                                    | `undefined`           | 传入即启用受控选择；通过 `checked` 事件请求变化。                                                                       |
| `disabled`              | `boolean`                                                    | `继承 ConfigProvider` | 禁用选择和折叠。                                                                                                        |
| `boxShadow`             | `boolean`                                                    | `false`               | 使用主题 `boxShadowTertiary`。                                                                                          |
| `tabs`                  | `TabsProps & { cardProps?: ProCardProps }`                   | —                     | 传给 [Tabs](https://www.antdv-next.com/components/tabs-cn)；`items` 优先于 TabPane 子节点，`cardProps` 仅消费 `ghost`。 |
| `collapsibleIconRender` | `({ collapsed: boolean }) => VNodeChild`                     | —                     | 自定义折叠图标；同名插槽优先。                                                                                          |
| `cover`                 | `CardProps['cover']`                                         | —                     | 传给 [Card](https://www.antdv-next.com/components/card-cn)；折叠时隐藏，同名插槽优先。                                  |
| `actions`               | `CardProps['actions']`                                       | —                     | 传给 [Card](https://www.antdv-next.com/components/card-cn) 底部操作区；折叠时隐藏，同名插槽优先。                       |
| `size`                  | `'default' \| 'small'`                                       | `继承 ConfigProvider` | `default` 转为原生 `medium`。                                                                                           |
| `type`                  | `'default' \| 'inner'`                                       | `default`             | 原生 [Card](https://www.antdv-next.com/components/card-cn) 类型。                                                       |
| `variant`               | `'outlined' \| 'borderless'`                                 | `继承 Card`           | 优先于 `bordered`；`ghost` 强制无边框。                                                                                 |
| `bordered`              | `boolean`                                                    | `undefined`           | 兼容边框入口；未传时跟随原生 Card。                                                                                     |
| `headerBordered`        | `boolean`                                                    | `false`               | 显示标题分割线；`type=inner` 同样显示。                                                                                 |
| `ghost`                 | `boolean`                                                    | `false`               | 透明、无边框、无阴影及零内容内边距。                                                                                    |
| `hoverable`             | `boolean`                                                    | `false`               | 传给原生 Card 的悬浮效果。                                                                                              |
| `loading`               | `boolean`                                                    | `false`               | 原生 Card 骨架；有 `loading` 插槽时渲染该插槽。                                                                         |
| `collapsible`           | `boolean \| 'header' \| 'icon'`                              | `false`               | true/header 点击标题折叠；icon 仅图标触发。                                                                             |
| `collapsed`             | `boolean`                                                    | `undefined`           | 受控折叠状态，支持 `v-model:collapsed`。                                                                                |
| `defaultCollapsed`      | `boolean`                                                    | `false`               | 非受控初始折叠状态。                                                                                                    |
| `headStyle`             | `CSSProperties`                                              | —                     | 旧标题样式，`styles.header` 优先。                                                                                      |
| `bodyStyle`             | `CSSProperties`                                              | —                     | 旧内容样式，`styles.body` 优先。                                                                                        |
| `classes`               | `SemanticClasses \| ({ props }) => SemanticClasses`          | —                     | 语义类名，优先于 `classNames`。                                                                                         |
| `classNames`            | `Partial<Record<ProCardSemanticName, string>>`               | —                     | 兼容语义类名入口。                                                                                                      |
| `styles`                | `SemanticStyles \| ({ props }) => SemanticStyles`            | —                     | 语义样式；部位见下表。                                                                                                  |

其他 attrs 透传到根 [Antdv Next Card](https://www.antdv-next.com/components/card-cn)。组件接管 title、extra、cover、actions、variant、size、type、loading、classes 和 styles，应使用本页对应入口。`class/style/id/data-*/aria-*` 作用于根节点。响应式断点为 0/576/768/992/1200/1600px。

### 事件 {#events}

| 事件               | 参数                                   | 说明                               |
| ------------------ | -------------------------------------- | ---------------------------------- |
| `update:collapsed` | `(collapsed: boolean)`                 | 折叠状态更新。                     |
| `collapse`         | `(collapsed: boolean)`                 | 用户切换折叠。                     |
| `checked`          | `(event: MouseEvent \| KeyboardEvent)` | 选择请求；父组件更新 checked。     |
| `tabChange`        | `(key: string)`                        | 活动标签变化；保留 tabs.onChange。 |

### 插槽 {#slots}

| 插槽              | 参数                     | 说明                         |
| ----------------- | ------------------------ | ---------------------------- |
| `default`         | —                        | 正文或历史 TabPane 子组件。  |
| `title`           | —                        | 覆盖 title。                 |
| `subTitle`        | —                        | 覆盖 subTitle。              |
| `extra`           | —                        | 覆盖 extra。                 |
| `cover`           | —                        | 覆盖 cover；折叠时隐藏。     |
| `actions`         | —                        | 覆盖 actions；折叠时隐藏。   |
| `loading`         | —                        | loading 时替换骨架。         |
| `collapsibleIcon` | `{ collapsed: boolean }` | 覆盖 collapsibleIconRender。 |

### 实例 {#instance}

无额外公开实例方法。通过 `v-model:collapsed` 控制折叠，通过 `tabs.activeKey` 控制标签。

### 组合成员 {#members}

| 属性                             | 类型                         | 默认值                      | 说明 / 来源                                                            |
| -------------------------------- | ---------------------------- | --------------------------- | ---------------------------------------------------------------------- |
| `ProCard.Group` / `ProCardGroup` | `ProCardProps`               | `ghost=true, direction=row` | [完整卡片属性](#props)；强制 ghost，仅显式 column 改为纵向。           |
| `ProCard.Divider.type`           | `'vertical' \| 'horizontal'` | `vertical`                  | 分割方向；其他 attrs 绑定 separator div。                              |
| `ProCard.TabPane.tab`            | `VNodeChild`                 | —                           | 父卡读取的历史标签标题。                                               |
| `ProCard.TabPane.cardProps`      | `ProCardProps`               | —                           | [面板卡片配置](#props)；同名 attrs 优先。                              |
| `ProCard.TabPane key / disabled` | `string \| number / boolean` | —                           | 父卡读取 VNode key 和 disabled attrs 生成导航；新代码推荐 tabs.items。 |

Group、TabPane 转发卡片插槽和事件；Divider 无插槽、事件或实例方法。组合成员不新增实例方法。

### 语义样式 {#styles}

| 部位      | 作用节点     |
| --------- | ------------ |
| `root`    | 根 Card      |
| `header`  | 标题区域     |
| `body`    | 正文区域     |
| `extra`   | 标题附加区域 |
| `title`   | 标题         |
| `actions` | 底部操作区   |
| `cover`   | 封面         |

`classes` 优先于旧 `classNames`；`styles.header/body` 优先于 headStyle/bodyStyle。折叠时正文 display:none 保持优先。原生主题使用 [ConfigProvider](https://www.antdv-next.com/components/config-provider-cn) 与 `theme.components.Card`；Pro token 见 [ProConfigProvider](./pro-config-provider#props)。
