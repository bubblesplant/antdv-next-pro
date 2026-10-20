---
pageClass: component-doc
---

<script setup>
import ProCardDemo from '../examples/ProCardDemo.vue'
</script>

# ProCard

`ProCard` 基于 Antdv Next Card，为独立内容区、查询区和表格区提供统一的主题背景、圆角、间距和折叠行为。实现参考 ProComponents `3.1.15-7` 的基础卡片。

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
import { ProCard } from '@bubblesjs/antv-next-pro'
import { ref } from 'vue'
import '@bubblesjs/antv-next-pro/style.css'

const collapsed = ref(false)
</script>

<template>
  <ProCard v-model:collapsed="collapsed" title="用户信息" variant="borderless" collapsible>
    <template #extra>操作区</template>
    卡片内容
  </ProCard>
</template>
```

## 主题与布局

背景与圆角沿用 Antdv Next Card，支持 ConfigProvider 深色算法及 `theme.components.Card` 的 token 覆盖。默认内容间距为 24px，小尺寸为 12px；未设置 `size` 时继承 ConfigProvider 的尺寸。标题默认不带分割线，设置 `headerBordered` 可显示。

`variant="borderless"` 表示无边框卡片。`ghost` 会使背景透明、移除边框和阴影，并清除内容区内边距。普通卡片的边框遵循底层 Card 的默认配置。

ProTable 内部已使用两张无边框 ProCard：上方查询区，下方工具栏、表格和分页；无需给整个 ProTable 再套卡片。

## 折叠与加载

`collapsible` 或 `collapsible="header"` 允许点击标题区域折叠；`collapsible="icon"` 只响应折叠按钮。操作区及标题内的链接、按钮不会触发折叠。折叠按钮支持键盘 Enter 和空格。

非受控使用 `defaultCollapsed`，受控使用 `v-model:collapsed`。折叠仅隐藏内容区，保留其中的组件和输入状态。`loading` 使用原生骨架屏，也可通过 `#loading` 替换；加载期间普通内容会卸载。

## API

| 属性                              | 类型                                                  | 默认值 / 说明                             |
| --------------------------------- | ----------------------------------------------------- | ----------------------------------------- |
| `title` / `subTitle` / `extra`    | `VNodeChild`                                          | 标题、副标题、右侧操作区；同名插槽优先    |
| `tooltip`                         | `string`                                              | 标题提示                                  |
| `size`                            | `'default' \| 'small'`                                | 继承 ConfigProvider                       |
| `type`                            | `'default' \| 'inner'`                                | 普通或内嵌样式                            |
| `variant`                         | `'outlined' \| 'borderless'`                          | 继承 Card 配置                            |
| `bordered`                        | `boolean`                                             | 兼容旧属性，`variant` 优先                |
| `headerBordered`                  | `boolean`                                             | `false`；`inner` 始终使用内嵌标题样式     |
| `ghost` / `hoverable` / `loading` | `boolean`                                             | `false`                                   |
| `collapsible`                     | `boolean \| 'header' \| 'icon'`                       | `false`                                   |
| `collapsed`                       | `boolean`                                             | 受控状态，支持 `v-model:collapsed`        |
| `defaultCollapsed`                | `boolean`                                             | `false`，只初始化非受控状态               |
| `cover` / `actions`               | 底层 `CardProps` 的对应类型                           | 封面与底部操作；支持同名插槽              |
| `styles`                          | `Partial<Record<ProCardSemanticName, CSSProperties>>` | 语义样式，长度使用 `'16px'` 等 CSS 字符串 |
| `classNames`                      | `Partial<Record<ProCardSemanticName, string>>`        | 语义类名                                  |
| `headStyle` / `bodyStyle`         | `CSSProperties`                                       | 兼容旧属性，同位置的 `styles` 优先        |

语义位置：`root`、`header`、`body`、`extra`、`title`、`actions`、`cover`。折叠期间内容区的 `display: none` 优先于自定义样式。

```vue
<ProCard
  title="紧凑内容"
  :styles="{ body: { padding: '16px' } }"
  :class-names="{ body: 'my-card-body' }"
/>
```

| 事件               | 参数                                       |
| ------------------ | ------------------------------------------ |
| `update:collapsed` | `(collapsed: boolean)`，请求父组件更新状态 |
| `collapse`         | `(collapsed: boolean)`，用户切换折叠时触发 |

插槽：`default`、`title`、`subTitle`、`extra`、`cover`、`actions`、`loading`、`collapsibleIcon`。`collapsibleIcon` 接收 `{ collapsed: boolean }`。

具名导出 `ProCard`、`ProCardProps`、`ProCardSlots`、`ProCardSemanticName`；默认插件自动注册 `ProCard`。

本次覆盖基础卡片，暂不提供上游的 tabs、栅格拆分、`ProCard.Group`、`ProCard.Divider`、StatisticCard 和 CheckCard。
