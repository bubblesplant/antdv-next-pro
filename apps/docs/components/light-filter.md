---
pageClass: component-doc
---

<script setup>
import BasicLightFilter from '../../playground/src/demos/light-filter/BasicLightFilter.vue'
import CollapsedLightFilter from '../../playground/src/demos/light-filter/CollapsedLightFilter.vue'
</script>

# LightFilter 轻量筛选

`LightFilter` 是可独立使用的标签式筛选表单，点击字段标签打开弹层，确认后提交查询。`ProTable` 设置 `search.filterType='light'` 时也使用这个组件。

## 引入

```ts
import { LightFilter, ProFormText, ProFormSelect } from '@bubblesjs/antdv-next-pro'
import '@bubblesjs/antdv-next-pro/style.css'
```

也可以通过 `app.use(AntdvNextPro)` 全局注册，使用 `<LightFilter>`；配置方式见[快速开始](../guide/getting-started)。

## 标签筛选与更多条件

默认插槽组合 `ProForm` 字段，普通字段分别显示筛选标签；字段设置 `secondary` 后进入“更多筛选”。通过 `v-model` 读取条件，使用 `:on-finish="search"` 处理查询。

<ClientOnly>
  <BasicLightFilter />
</ClientOnly>

<details class="demo-source"><summary>查看完整代码</summary>

<<< ../../playground/src/demos/light-filter/BasicLightFilter.vue

</details>

弹层中确认会先校验，再提交查询；未确认就关闭弹层会恢复打开时的值。清除会移除当前字段或分组的条件并重新提交。输入过程中 `v-model` 会变化，查询在确认或清除时触发。

## 收起全部条件

`collapse=true` 将全部字段收进同一个弹层，`collapseLabel` 设置入口文案。需要恢复所有初始条件时，可通过 ref 调用 `reset()`。

<ClientOnly>
  <CollapsedLightFilter />
</ClientOnly>

<details class="demo-source"><summary>查看完整代码</summary>

<<< ../../playground/src/demos/light-filter/CollapsedLightFilter.vue

</details>

## 使用 columns

与 `QueryFilter` 一样，可以直接传入 [SchemaForm columns](./schema-form)，无需声明字段子组件：

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { LightFilter, type SchemaFormColumn } from '@bubblesjs/antdv-next-pro'

const filters = ref<Record<string, unknown>>({})
const columns: SchemaFormColumn[] = [
  { title: '项目名称', dataIndex: 'keyword' },
  {
    title: '项目状态',
    dataIndex: 'status',
    valueType: 'select',
    valueEnum: { active: '进行中', done: '已完成' },
  },
]

function search(values: Record<string, unknown>) {
  console.log(values)
  return true
}
</script>

<template>
  <LightFilter v-model="filters" :columns="columns" :on-finish="search" />
</template>
```

## API

### 属性 {#props}

未传 `columns` 时组合字段，传入时走 BetaSchemaForm。公共配置及透传入口如下：

| 配置入口                    | 类型                 | 归属与完整文档                                                                                                                                                                              |
| --------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ProForm 公共属性            | `ProFormProps<T>`    | initialValues/request/params/readonly/disabled/dateFormatter/syncToUrl/syncToInitialValues/onValuesChange/formRef/prefixCls/classes/classNames/styles 等见 [ProForm 属性](./pro-form#props) |
| 组合模式的原生 Form 属性    | `FormProps`          | 直接写在 LightFilter；校验/标签/布局属性见 [antdv-next Form API](https://www.antdv-next.com/components/form-cn)                                                                             |
| `formProps`（columns 模式） | `Partial<FormProps>` | 传给 Schema 内部原生 Form；[Form API](https://www.antdv-next.com/components/form-cn)及 [SchemaForm 属性](./schema-form#props)。模型、提交、readonly 与筛选布局由上层协调                    |
| columns 模式其余配置        | `SchemaFormProps<T>` | 见 [SchemaForm 属性](./schema-form#props)；fieldProps/formItemProps 的基础组件归属见[字段 API](./pro-form-fields#props)                                                                     |

| 属性             | 类型                                                         | 默认值            | 说明 / 来源                                                             |
| ---------------- | ------------------------------------------------------------ | ----------------- | ----------------------------------------------------------------------- |
| `modelValue`     | `Partial<T>`                                                 | —                 | 当前查询值，支持 v-model                                                |
| `columns`        | `SchemaFormColumn<T>[]`                                      | —                 | 启用 Schema 模式；[列配置](./schema-form#columns)                       |
| `onFinish`       | `(values: T) => boolean \| void \| Promise<boolean \| void>` | —                 | 确认或清除后的业务查询；使用 :on-finish                                 |
| `collapse`       | `boolean`                                                    | `false`           | 所有字段收入同一个“更多筛选”弹层                                        |
| `collapseLabel`  | `VNodeChild`                                                 | 国际化“更多筛选”  | 收起入口文案                                                            |
| `placement`      | `PopoverProps['placement']`                                  | `'bottomLeft'`    | [Popover 位置](https://www.antdv-next.com/components/popover-cn)        |
| `footerRender`   | `false \| ({ confirm, clear }, doms) => VNodeChild`          | 默认确认/清除按钮 | 定制弹层底部；false 隐藏；回调中的 confirm/clear 执行标准流程           |
| 字段 `secondary` | `boolean`                                                    | `false`           | 写在字段子组件或 Schema 列上，由 LightFilter 读取；将该字段放入更多筛选 |

`collapse` 为分组配置，不使用 QueryFilter 的 v-model:collapsed。confirm 先校验再提交；取消恢复打开时的值；clear 清除字段后提交。输入过程中 v-model 变化，查询在确认/清除时发生。LightFilter 使用弹层 footerRender 管理操作区；submitter 的公共配置定义见 [ProForm](./pro-form#submitter)，它不替代这里的弹层底部。

### 事件 {#events}

| 事件                | 参数                                       | 说明                                                                      |
| ------------------- | ------------------------------------------ | ------------------------------------------------------------------------- |
| `update:modelValue` | `values: Partial<T>`                       | 受控值变化，包括尚未确认的编辑                                            |
| `change`            | `values: Partial<T>`                       | 条件变化                                                                  |
| `submit`            | `values: Partial<T>`                       | 提交通知；业务等待通过 onFinish                                           |
| `reset`             | `values: Partial<T>`                       | 实例重置为初始化快照                                                      |
| `error`             | `error: unknown`                           | 校验或提交异常                                                            |
| `requestError`      | `error: unknown`                           | 初始化请求失败                                                            |
| Schema 专属事件     | 见 [SchemaForm 事件](./schema-form#events) | columns 模式支持 valuesChange、fieldChange、finish 等，触发规则见来源文档 |

### 插槽 {#slots}

| 插槽                         | 参数                                         | 说明                                             |
| ---------------------------- | -------------------------------------------- | ------------------------------------------------ |
| `default`                    | 无                                           | 组合模式的字段子组件                             |
| 动态字段插槽（columns 模式） | [SchemaForm 插槽上下文](./schema-form#slots) | `field-${path}`、字段路径与列 key 对应的渲染入口 |

LightFilter 弹层操作通过 footerRender 定制，不提供 submitter 插槽操作区。单字段弹层的标签插槽见 [LightWrapper](#light-wrapper)。

### 实例方法 {#instance}

公开布局 ref 类型为 `SchemaFormInstance<T>`；完整签名与行为见 [SchemaForm 实例](./schema-form#instance)和 [ProForm 实例](./pro-form#instance)。

| 方法 / 属性                                               | 返回值                      | 说明                                                            |
| --------------------------------------------------------- | --------------------------- | --------------------------------------------------------------- |
| `nativeForm`                                              | `FormInstance \| undefined` | 底层 [Form 实例](https://www.antdv-next.com/components/form-cn) |
| `validate()` / `validateFields(names?)`                   | `Promise<Partial<T>>`       | 校验原始值                                                      |
| `validateFieldsReturnFormatValue(names?)`                 | `Promise<Partial<T>>`       | 校验格式化值                                                    |
| `getFieldsValue()` / `getFieldValue(name)`                | `Partial<T>` / `unknown`    | 读取原始值                                                      |
| `getFieldsFormatValue()` / `getFieldFormatValue(name)`    | `Partial<T>` / `unknown`    | 格式化与 transform 后结果                                       |
| `setFieldsValue(values)` / `setFieldValue(name, value)`   | `void`                      | 更新值                                                          |
| `submit()`                                                | `Promise<Partial<T>>`       | 校验并等待查询回调                                              |
| `reset()` / `resetFields()`                               | `void`                      | 恢复所有初始条件                                                |
| `clearValidate(names?)` / `scrollToField(name, options?)` | `void`                      | 清除错误 / 定位                                                 |
| `loading`                                                 | `Readonly<Ref<boolean>>`    | 提交状态                                                        |

统一 ref 还有服务其他布局的 open/close/next/prev/formMap；它们不用于控制筛选弹层，单个弹层通过 LightWrapper 的 open 控制。

## LightWrapper {#light-wrapper}

根入口导出的 LightWrapper 是与 ProForm 上下文协作的筛选弹层。它读取 name/fieldNames 对应的表单值，保存打开快照，并在取消时恢复；独立使用时请放入 ProForm。

### 属性

| 属性           | 类型                                  | 默认值         | 说明 / 来源                                                                                                     |
| -------------- | ------------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------- |
| `name`         | `ProDataIndex`                        | —              | 单字段表单路径                                                                                                  |
| `fieldNames`   | `ProDataIndex[]`                      | —              | 一组字段路径；配置后优先于 name，统一确认/清除                                                                  |
| `label`        | `VNodeChild`                          | 空             | 入口标签；label 插槽优先                                                                                        |
| `disabled`     | `boolean`                             | `false`        | 禁用入口，亦继承当前表单禁用状态                                                                                |
| `open`         | `boolean`                             | 非受控         | 弹层显示，支持 v-model:open                                                                                     |
| `placement`    | `PopoverProps['placement']`           | `'bottomLeft'` | [Popover](https://www.antdv-next.com/components/popover-cn) 位置                                                |
| `footerRender` | 同 [LightFilter.footerRender](#props) | 确认/清除按钮  | 自定义底部                                                                                                      |
| 其余 attrs     | `PopoverProps` / HTML attrs           | 原生值         | 传给 [Popover](https://www.antdv-next.com/components/popover-cn)，trigger/open/placement 及打开监听由包装器协调 |

### 事件与插槽

| 类别 | 名称          | 参数 / 用途                                                        |
| ---- | ------------- | ------------------------------------------------------------------ |
| 事件 | `update:open` | `(open: boolean)`，受控打开状态更新                                |
| 事件 | `confirm`     | `(value: unknown)`，校验提交成功后通知；分组时为所选字段组成的对象 |
| 事件 | `clear`       | 无参数，字段已清除，随后触发查询                                   |
| 插槽 | `default`     | 无参数，弹层内部字段                                               |
| 插槽 | `label`       | `{ value }`，自定义入口标签                                        |

LightWrapper 没有公开实例方法。确认/清除入口由 footerRender 提供；打开状态通过 v-model:open 控制。它不提供独立 value/allowClear 属性，展示值来自表单上下文。

## 与其他组件配合

- 网格形式的查询表单使用 [QueryFilter](./query-filter)。
- 表格轻量搜索使用 [ProTable](./pro-table) 的 `search.filterType='light'`。
- 国际化、主题与语义样式沿用 [ProForm](./pro-form#配置与样式)。
