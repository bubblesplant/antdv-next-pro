---
pageClass: component-doc
---

<script setup>
import SharedComponentsDemo from '../examples/SharedComponentsDemo.vue'
</script>

# 工具栏与辅助组件

可独立组合的工具栏、操作菜单、查询表单、筛选浮层、字段标签与错误展示组件。全部从 `@bubblesjs/antv-next-pro` 公开导出。

<ClientOnly><SharedComponentsDemo /></ClientOnly>

<<< ../examples/SharedComponentsDemo.vue

## 最小用法

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Button, Input } from 'antdv-next'
import { LightWrapper, ListToolBar, TableDropdown } from '@bubblesjs/antv-next-pro'

const open = ref(false)
const keyword = ref('')
const selected = ref('')
const menus = [
  { key: 'export', name: '导出' },
  { key: 'archive', name: '归档' },
]
</script>

<template>
  <ListToolBar title="项目">
    <template #actions>
      <TableDropdown :menus="menus" @select="selected = $event" />
      <Button type="primary">新建</Button>
    </template>
  </ListToolBar>
  <LightWrapper
    v-model:open="open"
    label="关键字"
    :value="keyword"
    allow-clear
    @clear="keyword = ''"
  >
    <Input v-model:value="keyword" />
  </LightWrapper>
  <p>菜单选择：{{ selected }}</p>
</template>
```

## ListToolBar

| 属性                             | 说明                                                                                           |
| -------------------------------- | ---------------------------------------------------------------------------------------------- |
| `title` / `subTitle` / `tooltip` | 标题、副标题与提示                                                                             |
| `actions` / `settings`           | 操作节点或 actions()、设置节点数组                                                             |
| `search`                         | boolean 或原生 InputSearch 配置；支持异步 `onSearch(value)`                                    |
| `menu`                           | `{ type?, items?, activeKey?, defaultActiveKey?, onChange? }`；type 为 inline、tab 或 dropdown |
| `tabs`                           | `{ items?, activeKey?, defaultActiveKey?, onChange? }`，额外一行的标签页                       |
| `filter` / `multipleLine`        | 过滤节点、多行样式                                                                             |

`search.onSearch` 返回 `false` 时不再发出组件 `search(value)` 事件。`menu.onChange(key)`、`tabs.onChange(key)` 提供选择变化通知；受控 activeKey 由调用方更新。

插槽：`title`、`actions`、`settings`、`filter`。语义部位：`root`、`container`、`left`、`right`、`title`、`subTitle`、`extraLine`。无独立实例方法。

## TableDropdown / TableDropdown.Button

| 属性                        | 说明                                                               |
| --------------------------- | ------------------------------------------------------------------ |
| `menus` / `options`         | `{ key: string, name?, label?, disabled?, danger? }[]`；menus 优先 |
| `text`                      | 触发文案                                                           |
| `disabled`                  | 禁用菜单                                                           |
| `onSelect(key)` / `@select` | 选择可用菜单项时回传字符串 key                                     |

`label` 优先于 `name`。默认插槽替换普通 TableDropdown 的触发内容；未提供时使用省略号图标。`TableDropdown.Button` 是真实组件成员，也可具名导入 `TableDropdownButton`；它使用原生 Button 作为触发器，额外原生 Button 属性通过 attrs 传入。语义部位为 `root`；无独立实例方法。

## Search

独立 schema 查询区，`search.filterType="light"` 使用 LightFilter，否则使用 QueryFilter。

| 属性/事件                                            | 说明                                                                                                                     |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `columns`                                            | `ProColumns<T>[]`；排除 hideInSearch=true 或 search=false 的列                                                           |
| `search`                                             | ProTable 查询配置：span、labelWidth、collapsed、defaultCollapsed、searchText、resetText、optionRender、collapseRender 等 |
| `form`                                               | 原生表单配置，以及 initialValues、submitter；classes/styles 定制筛选表单                                                 |
| `formRef`                                            | `Ref<SchemaFormInstance<T> \| undefined>`                                                                                |
| `submit(values)` / `reset()` / `collapse(collapsed)` | 提交、重置、折叠通知                                                                                                     |

`loading` 控制默认提交按钮的加载状态；ProTable 内嵌的 Search 自动接收表格请求状态。显式 `form.submitter.submitButtonProps.loading` 优先，`submitter=false` 或 `submitButtonProps=false` 仍会隐藏对应操作。

组件 ref 转发 `SchemaFormInstance`。Search 只收集并校验查询条件，请求由调用方处理。未额外定义业务插槽或独立语义部位。

## FilterDropdown

| 属性/事件                          | 说明                                                |
| ---------------------------------- | --------------------------------------------------- |
| `label` / `disabled` / `placement` | 触发内容、禁用与浮层位置                            |
| `open` / `v-model:open`            | 不传时组件内部控制；传入时由调用方接受 update:open  |
| `popoverProps`                     | 原生 Popover 属性，原生 onOpenChange 与组件事件合并 |
| `footer`                           | DropdownFooter 配置；传入时显示操作区               |
| `footerRender`                     | false 隐藏底部，或替换底部内容的函数                |
| `padding`                          | 内容内边距                                          |
| `openChange(open)`                 | 打开状态请求变化通知                                |

默认插槽为面板内容，`label` 插槽为触发内容。语义部位是 `root`（触发节点）、`content`（浮层内容）；浮层容器可通过 `popoverProps.styles.container` 定制。footer 回调负责清空数据与关闭面板，组件不自动执行业务修改。无独立实例方法。

## LightWrapper

组合 FieldLabel 与 FilterDropdown。属性：`label`、`value`、`open`、`disabled`、`allowClear`、`footerRender`、`placement`。默认插槽为面板内容，语义部位为 `root`、`content`。

事件：`update:open`、`clear`、`confirm`。确认发出 confirm 并请求关闭；清除只发出 clear，由调用方修改 value。`open` 未传时内部控制，可用 `v-model:open` 受控。无独立实例方法。

## DropdownFooter

属性：`disabled`、`confirmText`、`clearText`、`onConfirm(event?)`、`onClear(event?)`、`footerRender`。不提供业务插槽或实例方法。

`footerRender=false` 不渲染；函数签名为 `(confirm?, clear?) => VNodeChild`。回调只通知操作，不负责异步等待、清空数据或关闭外层容器。语义部位：`root`、`clear`、`confirm`；自定义 footerRender 替换默认按钮后，按钮部位不再生效。

## FieldLabel / LabelIconTip

| 组件           | 属性与行为                                                                                                     | 插槽               | 语义部位                       |
| -------------- | -------------------------------------------------------------------------------------------------------------- | ------------------ | ------------------------------ |
| `FieldLabel`   | label、value、disabled、expanded、ellipsis、onClear；值非 null 时展示；expanded 提供展开语义，由父组件控制面板 | 无                 | root、label、value             |
| `LabelIconTip` | label、tooltip（字符串或原生 TooltipProps）、subTitle、ellipsis                                                | 默认插槽替换 label | root、label、subTitle、tooltip |

FieldLabel 使用可聚焦按钮；有值且提供 onClear 时显示清除入口，清除阻止冒泡，否则显示箭头。两者无独立实例方法。

## InlineErrorFormItem

继承原生 FormItem 属性，增加 `error`、`errorType="default" | "popover"`。默认显示内联错误；popover 模式根据 error 的真值展示浮层，并隐藏内联 help。

默认插槽放输入控件，`error` 插槽自定义内联或浮层错误内容；单独提供 error 插槽不会使空 error 自动打开浮层。语义部位为 `root`、`field`（原生 FormItem）。它提供错误展示，校验规则仍由原生 Form/FormItem 执行，无独立实例方法。

## ErrorBoundary

捕获后代 Vue 组件渲染和生命周期中的错误，展示降级内容。

| API                    | 说明                                     |
| ---------------------- | ---------------------------------------- |
| `fallback`             | 节点或 `(error, reset) => VNodeChild`    |
| `resetKeys`            | 数组元素变化时重置错误状态               |
| `onError(error, info)` | 错误通知                                 |
| 默认插槽               | 正常内容                                 |
| `fallback` 插槽        | `{ error, reset }`，优先于 fallback 属性 |
| `ref.reset()`          | 清除错误，重新渲染后代                   |

默认降级内容使用原生 Result 与重试按钮。语义部位 `root` 只在降级状态存在；正常状态直接渲染默认插槽。自身错误及脱离组件链的异步 Promise、网络失败应由调用方处理。

## 统一样式与配置

除 Search 使用其表单配置外，上述组件提供 `prefixCls`、`classes`、`styles`；后两者支持对象或 `({ props }) => map`。旧 `classNames` 兼容，同名部位 classes 优先。仅文档列出的部位有实际消费。

| 组件                                 | 默认公开前缀                          |
| ------------------------------------ | ------------------------------------- |
| ListToolBar                          | `ant-pro-table-list-toolbar`          |
| TableDropdown / TableDropdown.Button | `ant-pro-table-dropdown`              |
| LightWrapper                         | `ant-pro-field-light-wrapper`         |
| FilterDropdown                       | `ant-pro-core-field-dropdown`         |
| DropdownFooter                       | `ant-pro-core-field-dropdown-footer`  |
| FieldLabel                           | `ant-pro-core-field-label`            |
| LabelIconTip                         | `ant-pro-core-label-tip`              |
| InlineErrorFormItem                  | `ant-pro-form-inline-error-form-item` |
| ErrorBoundary                        | `ant-pro-error-boundary`              |

原生 ConfigProvider 设置 `prefixCls="demo"` 后，以上 `ant-pro` 部分变为 `demo-pro`，也可用组件 prefixCls 覆盖。

语言、方向、主题算法及原生组件 token 继承 ConfigProvider；Pro 扩展 token 使用 [ProConfigProvider.token](./pro-config-provider)。原生 Result 的定制使用 `theme.components.Result`，辅助组件没有独立注册 `theme.components.ProX` 入口。
