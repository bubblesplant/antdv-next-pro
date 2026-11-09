---
pageClass: component-doc
---

<script setup>
import SharedComponentsDemo from '../examples/SharedComponentsDemo.vue'
</script>

# 工具栏与辅助组件

可独立组合的工具栏、操作菜单、查询表单、筛选浮层、字段标签与错误展示组件。全部从 `@bubblesjs/antdv-next-pro` 公开导出。

<ClientOnly><SharedComponentsDemo /></ClientOnly>

<<< ../examples/SharedComponentsDemo.vue

## 最小用法

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Button } from 'antdv-next'
import {
  LightWrapper,
  ListToolBar,
  ProForm,
  ProFormText,
  TableDropdown,
} from '@bubblesjs/antdv-next-pro'

const open = ref(false)
const filters = ref({ keyword: '' })
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
  <ProForm v-model="filters" :submitter="false">
    <LightWrapper v-model:open="open" name="keyword" label="关键字">
      <ProFormText name="keyword" />
    </LightWrapper>
  </ProForm>
  <p>菜单选择：{{ selected }}</p>
</template>
```

## 共享属性 {#props}

除 Search 与 LightWrapper 外，下列辅助组件均提供这组属性。Search 通过 form 配置样式；LightWrapper 的额外属性传给原生 Popover，自身前缀由 ConfigProvider 决定。各组件专属表格在此基础上追加。

| 属性         | 类型                                                  | 默认值 | 说明 / 来源                          |
| ------------ | ----------------------------------------------------- | ------ | ------------------------------------ |
| `prefixCls`  | `string`                                              | —      | 完整组件前缀；默认值见文末表格。     |
| `classes`    | `SemanticMap \| ({ props }) => SemanticMap`           | —      | 语义类名；可用部位见各组件说明。     |
| `classNames` | `SemanticMap \| ({ props }) => SemanticMap`           | —      | 兼容类名入口，同部位 classes 优先。  |
| `styles`     | `SemanticStyleMap \| ({ props }) => SemanticStyleMap` | —      | 语义样式；Map 的值为 CSSProperties。 |

## ListToolBar {#list-tool-bar}

| 属性           | 类型                                                          | 默认值  | 说明 / 来源                                                                                                |
| -------------- | ------------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------- |
| `title`        | `VNodeChild`                                                  | —       | 标题；title 插槽优先。                                                                                     |
| `subTitle`     | `VNodeChild`                                                  | —       | 副标题。                                                                                                   |
| `tooltip`      | `string \| TooltipProps`                                      | —       | 传给原生 [Tooltip](https://www.antdv-next.com/components/tooltip-cn)。                                     |
| `actions`      | `VNodeChild \| (() => VNodeChild)`                            | —       | 操作节点；actions 插槽优先。                                                                               |
| `settings`     | `VNodeChild[]`                                                | `[]`    | 设置节点；settings 插槽优先。                                                                              |
| `search`       | `boolean \| ProTableToolbarSearchConfig`                      | `false` | true 启用输入框，对象传给 [Input.Search](https://www.antdv-next.com/components/input-cn)；增强配置见下表。 |
| `onSearch`     | `(value: string) => void`                                     | —       | 对应 search 事件监听。                                                                                     |
| `menu`         | `{ type?, items?, activeKey?, defaultActiveKey?, onChange? }` | —       | 主操作行的导航菜单，见下表。                                                                               |
| `tabs`         | `{ items?, activeKey?, defaultActiveKey?, onChange? }`        | —       | multipleLine=true 时额外行 [Tabs](https://www.antdv-next.com/components/tabs-cn)。                         |
| `filter`       | `VNodeChild`                                                  | —       | 过滤节点；filter 插槽优先。                                                                                |
| `multipleLine` | `boolean`                                                     | `false` | 把 filter 与 tabs 放到额外一行。                                                                           |

| 嵌套配置                                        | 类型 / 默认值                                                      | 实际去处 / 说明                                                       |
| ----------------------------------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------- |
| `search`                                        | [Input.Search API](https://www.antdv-next.com/components/input-cn) | onSearch 之外的原生输入配置；默认使用本地化 placeholder，宽度 200px。 |
| `search.name`                                   | `string / —`                                                       | 共享工具栏搜索元数据；独立工具栏不据此绑定模型。                      |
| `search.onSearch`                               | `(value: string) => void \| false \| Promise<void \| false>`       | 返回 false 阻止外层 search 事件。                                     |
| `menu.type`                                     | `'inline' \| 'dropdown' \| 'tab' / tab`                            | 菜单展示方式。                                                        |
| `menu.items / tabs.items`                       | `{ key: string; label: VNodeChild; disabled?: boolean }[] / []`    | 导航条目。                                                            |
| `menu.activeKey / tabs.activeKey`               | `string / —`                                                       | 受控活动项，调用方更新。                                              |
| `menu.defaultActiveKey / tabs.defaultActiveKey` | `string / —`                                                       | 非受控初始活动项。                                                    |
| `menu.onChange / tabs.onChange`                 | `(key: string) => void`                                            | 活动项变化回调。                                                      |

| 事件 / 回调 | 参数 / 返回值             | 说明                                          |
| ----------- | ------------------------- | --------------------------------------------- |
| `search`    | `(value: string) => void` | 通过输入框搜索，等待 search.onSearch 后触发。 |

| 插槽       | 参数 | 说明           |
| ---------- | ---- | -------------- |
| `title`    | —    | 覆盖标题。     |
| `actions`  | —    | 覆盖操作节点。 |
| `settings` | —    | 覆盖设置节点。 |
| `filter`   | —    | 覆盖过滤区域。 |

无公开实例方法。部位：root/container/left/right/title/subTitle/extraLine。有标题/菜单时搜索框放右侧，否则放左侧；空工具栏不保留操作行。内边距和间距分别使用 Pro padding/marginXS token。

## TableDropdown / TableDropdown.Button {#table-dropdown}

| 属性       | 类型                    | 默认值  | 说明 / 来源                                    |
| ---------- | ----------------------- | ------- | ---------------------------------------------- |
| `menus`    | `TableDropdownItem[]`   | —       | 菜单列表，优先于 options；结构见下表。         |
| `options`  | `TableDropdownItem[]`   | `[]`    | menus 的兼容回退。                             |
| `text`     | `VNodeChild`            | —       | 触发文案；默认插槽优先。                       |
| `disabled` | `boolean`               | `false` | 禁用原生 Dropdown，Button 版本也禁用触发按钮。 |
| `onSelect` | `(key: string) => void` | —       | 菜单项选择回调，也可写 @select。               |

| 菜单项属性 | 类型         | 默认值  | 说明                    |
| ---------- | ------------ | ------- | ----------------------- |
| `key`      | `string`     | 必填    | onSelect 回传的唯一键。 |
| `label`    | `VNodeChild` | —       | 显示内容，优先于 name。 |
| `name`     | `VNodeChild` | —       | label 的回退文案。      |
| `disabled` | `boolean`    | `false` | 禁用此项。              |
| `danger`   | `boolean`    | `false` | 危险菜单样式。          |

| 事件 / 回调 | 参数 / 返回值           | 说明                               |
| ----------- | ----------------------- | ---------------------------------- |
| `select`    | `(key: string) => void` | 等同 onSelect 回调，不应重复绑定。 |

| 插槽      | 参数 | 说明           |
| --------- | ---- | -------------- |
| `default` | —    | 替换触发内容。 |

`TableDropdown.Button` 也可具名导入 TableDropdownButton。额外 attrs 传给原生 [Button](https://www.antdv-next.com/components/button-cn)，包括 type/size/loading；disabled 和语义样式由包装组件管理。普通 TableDropdown attrs 绑定 span，不是原生 Dropdown 配置。两者均不转发任意 Dropdown 属性，均无公开实例方法。部位：root。

## Search {#search}

| 属性      | 类型                                      | 默认值  | 说明 / 来源                                                                                                          |
| --------- | ----------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------- |
| `columns` | `ProColumns<T>[]`                         | 必填    | [共享列 API](./pro-table#columns)；过滤 hideInSearch=true 与 search=false。                                          |
| `search`  | `ProTableSearchConfig<T>`                 | —       | [搜索配置](./pro-table#search)；实际传递项见下方说明。                                                               |
| `form`    | `ProTableSearchForm<T>`                   | —       | 原生 [Form 属性](https://www.antdv-next.com/components/form-cn)及 initialValues、[submitter](./pro-form#submitter)。 |
| `loading` | `boolean`                                 | `false` | 默认提交按钮加载状态；form.submitter.submitButtonProps.loading 优先。                                                |
| `formRef` | `Ref<SchemaFormInstance<T> \| undefined>` | —       | 获取 [SchemaForm 实例](./schema-form#instance)，与组件 ref 相同。                                                    |

search.filterType=light 使用 [LightFilter](./light-filter#props)，否则使用 [QueryFilter](./query-filter#props)。实际传递 span/labelWidth/defaultCollapsed/collapsed/searchText/resetText/optionRender/collapseRender，defaultCollapsed 默认 true。独立 Search 用 @collapse 通知变化，不直接调用共享 search.onCollapse。form.initialValues 和 submitter 从原生 formProps 分离，form 的 onSubmit/onReset 不透传。dateFormatter 固定 false；submitter=false 或 submitButtonProps=false 仍隐藏对应操作。

| 事件 / 回调 | 参数 / 返回值                               | 说明                                           |
| ----------- | ------------------------------------------- | ---------------------------------------------- |
| `submit`    | `(values: Record<string, unknown>) => void` | 校验通过后通知查询条件，数据请求由调用方处理。 |
| `reset`     | `() => void`                                | 查询重置。                                     |
| `collapse`  | `(collapsed: boolean) => void`              | 折叠变化。                                     |

无额外业务插槽。组件 ref 完整转发 [SchemaForm 实例](./schema-form#instance)，无新增实例方法。

## FilterDropdown {#filter-dropdown}

| 属性           | 类型                                          | 默认值      | 说明 / 来源                                                                             |
| -------------- | --------------------------------------------- | ----------- | --------------------------------------------------------------------------------------- |
| `label`        | `VNodeChild`                                  | —           | 触发内容，label 插槽优先。                                                              |
| `open`         | `boolean`                                     | `undefined` | 受控打开状态；不传时内部控制。                                                          |
| `disabled`     | `boolean`                                     | `false`     | 禁用打开；已打开的面板也隐藏。                                                          |
| `placement`    | `PopoverProps['placement']`                   | —           | 优先于 popoverProps.placement。                                                         |
| `popoverProps` | `PopoverProps`                                | —           | 原生 [Popover 属性](https://www.antdv-next.com/components/popover-cn)；覆盖规则见下方。 |
| `footer`       | `DropdownFooterProps`                         | —           | 传入时渲染 [DropdownFooter](#dropdown-footer)。                                         |
| `footerRender` | `false \| ((confirm?, clear?) => VNodeChild)` | —           | false 隐藏底部，函数替换 footer；此顶层入口覆盖 footer.footerRender。                   |
| `padding`      | `number`                                      | `16`        | 内容内边距，单位像素；styles.content 可覆盖。                                           |

| 事件 / 回调   | 参数 / 返回值             | 说明                                               |
| ------------- | ------------------------- | -------------------------------------------------- |
| `update:open` | `(open: boolean) => void` | 支持 v-model:open。                                |
| `openChange`  | `(open: boolean) => void` | 打开状态请求；合并调用 popoverProps.onOpenChange。 |

| 插槽      | 参数 | 说明                          |
| --------- | ---- | ----------------------------- |
| `default` | —    | 面板内容。                    |
| `label`   | —    | 触发内容，优先于 label 属性。 |

组件接管 open、trigger=click 和 content。placement 优先于 popoverProps.placement；classes 与浮层根类合并；styles.container 在 padding=0/minWidth=200px/主题阴影默认值之后合并。部位：root（触发节点）、content（内容），内容 padding 默认 16px。底部回调自行管理数据修改与关闭，无公开实例方法。

## LightWrapper {#light-wrapper}

完整属性、事件、插槽表统一维护在 [LightWrapper API](./light-filter#light-wrapper)。它组合 FieldLabel 与原生 Popover，从 ProForm 上下文读取字段值，支持 v-model:open，无公开实例方法。

## DropdownFooter {#dropdown-footer}

| 属性           | 类型                                          | 默认值   | 说明 / 来源                                               |
| -------------- | --------------------------------------------- | -------- | --------------------------------------------------------- |
| `disabled`     | `boolean`                                     | `false`  | 禁用默认清空和确认按钮。                                  |
| `confirmText`  | `VNodeChild`                                  | `locale` | 确认按钮文字，默认“确认”。                                |
| `clearText`    | `VNodeChild`                                  | `locale` | 清空按钮文字，默认“清空”。                                |
| `onConfirm`    | `(event?: MouseEvent) => void`                | —        | 确认回调；不自动等待异步结果或关闭容器。                  |
| `onClear`      | `(event?: MouseEvent) => void`                | —        | 清空回调；未提供时保留空位并隐藏清空按钮。                |
| `footerRender` | `false \| ((confirm?, clear?) => VNodeChild)` | —        | false 或回调返回 false 时隐藏底部；函数接收上述两个回调。 |

| 事件 / 回调           | 参数 / 返回值                  | 说明                           |
| --------------------- | ------------------------------ | ------------------------------ |
| `onConfirm / onClear` | `(event?: MouseEvent) => void` | 操作通知，签名及职责见属性表。 |

无插槽或实例方法。部位：root/clear/confirm。自定义 footerRender 替换默认按钮后，按钮部位不再生效。默认 padding=8px，两个按钮分居两侧。

## FieldLabel {#field-label}

| 属性       | 类型         | 默认值  | 说明 / 来源                          |
| ---------- | ------------ | ------- | ------------------------------------ |
| `label`    | `VNodeChild` | —       | 字段标签。                           |
| `value`    | `VNodeChild` | —       | 非 null/undefined 时显示值。         |
| `disabled` | `boolean`    | `false` | 禁用触发按钮和清空。                 |
| `expanded` | `boolean`    | `false` | 映射 aria-expanded，父组件控制浮层。 |
| `ellipsis` | `boolean`    | `false` | 省略标签区域。                       |
| `onClear`  | `() => void` | —       | 有值时显示清除入口；清除阻止冒泡。   |

| 事件 / 回调 | 参数 / 返回值 | 说明                            |
| ----------- | ------------- | ------------------------------- |
| `onClear`   | `() => void`  | 鼠标或 Enter/空格清除入口通知。 |

无插槽或实例方法。部位：root/label/value。使用可聚焦按钮，默认高度 30px，继承原生 small 时 24px。

## LabelIconTip {#label-icon-tip}

| 属性       | 类型                     | 默认值  | 说明 / 来源                                                                              |
| ---------- | ------------------------ | ------- | ---------------------------------------------------------------------------------------- |
| `label`    | `VNodeChild`             | —       | 标签，默认插槽优先。                                                                     |
| `tooltip`  | `string \| TooltipProps` | —       | 字符串转为 title，对象传给 [Tooltip](https://www.antdv-next.com/components/tooltip-cn)。 |
| `subTitle` | `VNodeChild`             | —       | 副标题。                                                                                 |
| `ellipsis` | `boolean`                | `false` | 仅 label 区域省略。                                                                      |

| 插槽      | 参数 | 说明                               |
| --------- | ---- | ---------------------------------- |
| `default` | —    | 替换 label；副标题与提示图标保留。 |

无组件事件或实例方法。部位：root/label/subTitle/tooltip。

## InlineErrorFormItem {#inline-error-form-item}

| 属性             | 类型                                                  | 默认值    | 说明 / 来源                                                                                                                           |
| ---------------- | ----------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `error`          | `VNodeChild`                                          | —         | 错误内容；真值时强制 validateStatus=error。                                                                                           |
| `errorType`      | `'default' \| 'popover'`                              | `default` | popover 使用 Popover 显示错误，并清空原生 help。                                                                                      |
| `FormItem props` | `Omit<FormItemProps, classes \| styles \| prefixCls>` | `native`  | 其余属性传给 [FormItem](https://www.antdv-next.com/components/form-cn)，如 name/rules/label/help/validateStatus；错误覆盖规则见下文。 |

| 插槽      | 参数 | 说明                                     |
| --------- | ---- | ---------------------------------------- |
| `default` | —    | 输入控件。                               |
| `error`   | —    | 替换内联或浮层错误；不独立控制浮层开关。 |

无新增事件或实例方法。原生校验仍由 Form/FormItem 执行。error 真值时覆盖 validateStatus；default 模式在 error 已定义或有 error 插槽时替换 help。popover 模式清空 help，仅 error 真值时打开浮层。额外 attrs 绑定外层 div。部位：root/field。

## ErrorBoundary {#error-boundary}

| 属性        | 类型                                                              | 默认值 | 说明 / 来源                                               |
| ----------- | ----------------------------------------------------------------- | ------ | --------------------------------------------------------- |
| `fallback`  | `VNodeChild \| ((error: Error, reset: () => void) => VNodeChild)` | —      | 降级内容；fallback 插槽优先，否则原生 Result 加重试按钮。 |
| `resetKeys` | `unknown[]`                                                       | —      | 深度监听，变化时重置错误。                                |
| `onError`   | `(error: Error, info: string) => void`                            | —      | 捕获后代错误的通知。                                      |

| 事件 / 回调 | 参数 / 返回值                          | 说明                             |
| ----------- | -------------------------------------- | -------------------------------- |
| `onError`   | `(error: Error, info: string) => void` | 后代 Vue 渲染/生命周期错误通知。 |

| 插槽       | 参数                                  | 说明                             |
| ---------- | ------------------------------------- | -------------------------------- |
| `default`  | —                                     | 正常内容。                       |
| `fallback` | `{ error: Error, reset: () => void }` | 降级内容，优先于 fallback 属性。 |

| 方法      | 签名         | 说明                     |
| --------- | ------------ | ------------------------ |
| `reset()` | `() => void` | 清除错误并重新渲染后代。 |

root 部位仅在降级状态存在；正常时无包裹节点。脱离后代组件链的网络失败等由调用方处理。

## 事件、插槽与方法索引 {#events}

| 组件                   | 事件 / 回调                                               | 插槽                                         | 实例                                 |
| ---------------------- | --------------------------------------------------------- | -------------------------------------------- | ------------------------------------ |
| ListToolBar            | [search](#list-tool-bar)                                  | title/actions/settings/filter                | —                                    |
| TableDropdown / Button | [onSelect](#table-dropdown)                               | default                                      | —                                    |
| Search                 | [submit/reset/collapse](#search)                          | —                                            | [SchemaForm](./schema-form#instance) |
| FilterDropdown         | [update:open/openChange](#filter-dropdown)                | default/label                                | —                                    |
| LightWrapper           | [update:open/clear/confirm](./light-filter#light-wrapper) | [LightWrapper](./light-filter#light-wrapper) | —                                    |
| DropdownFooter         | [onConfirm/onClear](#dropdown-footer)                     | —                                            | —                                    |
| FieldLabel             | [onClear](#field-label)                                   | —                                            | —                                    |
| LabelIconTip           | —                                                         | default                                      | —                                    |
| InlineErrorFormItem    | —                                                         | default/error                                | —                                    |
| ErrorBoundary          | [onError](#error-boundary)                                | default/fallback                             | reset()                              |

<span id="slots"></span>
<span id="instance"></span>

## 前缀与继承配置 {#styles}

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

原生 [ConfigProvider](https://www.antdv-next.com/components/config-provider-cn) 管理语言、方向、原生组件 token 与前缀；原生 prefix=demo 时 ant-pro 变为 demo-pro。Pro 扩展使用 [ProConfigProvider.token](./pro-config-provider#props)。ErrorBoundary 默认 Result 的样式使用 theme.components.Result，辅助组件没有 theme.components.ProX 入口。
