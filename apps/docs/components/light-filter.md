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

除下表外，还支持 `ProForm` 的 `initialValues`、`request`、`params`、校验、格式转换和 URL 同步等[公共配置](./pro-form)。

| 属性                     | 类型                                                      | 默认值 / 说明                                  |
| ------------------------ | --------------------------------------------------------- | ---------------------------------------------- |
| `modelValue` / `v-model` | `Partial<T>`                                              | 当前查询条件                                   |
| `columns`                | `SchemaFormColumn<T>[]`                                   | 可选，配置 Schema 字段                         |
| `onFinish`               | `(values) => boolean \| void \| Promise<boolean \| void>` | 确认或清除后的查询回调，使用 `:on-finish` 绑定 |
| `collapse`               | `boolean`                                                 | `false`，将全部字段收进一个弹层                |
| `collapseLabel`          | `VNodeChild`                                              | 默认使用国际化“更多筛选”文案                   |
| `placement`              | `PopoverProps['placement']`                               | `'bottomLeft'`                                 |
| `footerRender`           | `false \| ({ confirm, clear }, doms) => VNodeChild`       | 定制弹层底部操作；`false` 隐藏底部操作         |

字段设置 `secondary` 可单独进入“更多筛选”；`collapse=true` 时全部字段统一收起。`collapse` 是字段分组配置，不使用 `QueryFilter` 的 `v-model:collapsed`。

| 事件                           | 说明                                        |
| ------------------------------ | ------------------------------------------- |
| `update:modelValue` / `change` | 查询条件变化，包含未确认的编辑              |
| `submit`                       | 观察提交；需要等待业务结果时使用 `onFinish` |
| `reset`                        | 通过实例重置到初始化快照                    |
| `error` / `requestError`       | 提交错误 / 初始化请求错误                   |

默认插槽用于组合字段。ref 提供 `getFieldsValue()`、`setFieldsValue()`、`validate()`、`submit()`、`reset()` 等方法；组合字段可使用 `ProFormInstance`，`columns` 用法可使用 `SchemaFormInstance<T>`。方法说明见 [ProForm 实例](./pro-form#数据与实例)。

## 与其他组件配合

- 网格形式的查询表单使用 [QueryFilter](./query-filter)。
- 表格轻量搜索使用 [ProTable](./pro-table) 的 `search.filterType='light'`。
- 国际化、主题与语义样式沿用 [ProForm](./pro-form#配置与样式)。
