---
pageClass: component-doc
---

<script setup>
import BasicQueryFilter from '../../playground/src/demos/query-filter/BasicQueryFilter.vue'
import SchemaQueryFilter from '../../playground/src/demos/query-filter/SchemaQueryFilter.vue'
</script>

# QueryFilter 查询筛选

`QueryFilter` 是可独立使用的查询表单，支持响应式栅格、查询、重置及展开收起。`ProTable` 的默认搜索区域也使用这个组件。可以组合 `ProForm` 字段，也可以传入 `columns` 生成字段。

## 引入

```ts
import { QueryFilter, ProFormText, ProFormSelect } from '@bubblesjs/antdv-next-pro'
import '@bubblesjs/antdv-next-pro/style.css'
```

也可以通过 `app.use(AntdvNextPro)` 全局注册，使用 `<QueryFilter>`；配置方式见[快速开始](../guide/getting-started)。

## 组合字段与展开收起

默认插槽直接放置 `ProFormText`、`ProFormSelect` 等字段；通过 `v-model` 读取条件，使用 `:on-finish="search"` 处理校验成功后的查询。

<ClientOnly>
  <BasicQueryFilter />
</ClientOnly>

<details class="demo-source"><summary>查看完整代码</summary>

<<< ../../playground/src/demos/query-filter/BasicQueryFilter.vue

</details>

`defaultCollapsed` 默认为 `true`，`v-model:collapsed` 可受控切换。字段超过首行容量时显示折叠按钮，展开向下、收起向上，默认箭头随状态旋转；收起会隐藏字段并保留值。

`span` 使用 24 栅格，可传数字或断点对象，例如 `{ xs: 24, sm: 12, md: 8 }`。不设置时，根据容器宽度和 `defaultColsNumber` 调整列宽。

## columns 与实例方法

已有 Schema 配置时，直接传入 `columns`。通过 ref 可设置条件、提交和重置，无需依赖表格实例。

<ClientOnly>
  <SchemaQueryFilter />
</ClientOnly>

<details class="demo-source"><summary>查看完整代码</summary>

<<< ../../playground/src/demos/query-filter/SchemaQueryFilter.vue

</details>

`columns` 的字段配置见 [SchemaForm](./schema-form)。组合字段和 `columns` 是两种字段声明方式，示例中分别使用。

## API

除下表外，还支持 `ProForm` 的 `initialValues`、`request`、`params`、校验、格式转换和 URL 同步等[公共配置](./pro-form)。

| 属性                              | 类型                                                      | 默认值 / 说明                                |
| --------------------------------- | --------------------------------------------------------- | -------------------------------------------- |
| `modelValue` / `v-model`          | `Partial<T>`                                              | 当前查询条件                                 |
| `columns`                         | `SchemaFormColumn<T>[]`                                   | 可选，配置 Schema 字段                       |
| `onFinish`                        | `(values) => boolean \| void \| Promise<boolean \| void>` | 校验成功后的查询回调，使用 `:on-finish` 绑定 |
| `collapsed` / `v-model:collapsed` | `boolean`                                                 | 受控折叠状态                                 |
| `defaultCollapsed`                | `boolean`                                                 | `true`                                       |
| `defaultColsNumber`               | `number`                                                  | `3`，较宽容器的默认列数                      |
| `span`                            | `number \| Record<string, number>`                        | 24 栅格列宽，断点为 `xs/sm/md/lg/xl`         |
| `labelWidth`                      | `number \| 'auto'`                                        | 标签宽度，数字单位为 px                      |
| `split`                           | `boolean`                                                 | `false`，分隔样式                            |
| `searchText` / `resetText`        | `VNodeChild`                                              | 默认使用国际化查询 / 重置文案                |
| `optionRender`                    | `false \| (props, form, doms) => VNodeChild`              | 定制查询、重置操作；`false` 隐藏操作按钮     |
| `collapseRender`                  | `false \| (collapsed) => VNodeChild`                      | 定制折叠按钮内容；`false` 隐藏折叠按钮       |
| `submitter`                       | `false \| SubmitterProps`                                 | 配置查询、重置按钮及自定义渲染               |

`optionRender=false` 不会隐藏折叠按钮；需要隐藏折叠按钮时设置 `collapseRender=false`。自定义 `collapseRender` 会替换默认文案和箭头。

| 事件                            | 说明                                        |
| ------------------------------- | ------------------------------------------- |
| `update:modelValue` / `change`  | 查询条件变化                                |
| `update:collapsed` / `collapse` | 参数为最新的折叠状态                        |
| `submit`                        | 观察提交；需要等待业务结果时使用 `onFinish` |
| `reset`                         | 重置到初始化快照                            |
| `error` / `requestError`        | 提交错误 / 初始化请求错误                   |

默认插槽用于组合字段。ref 可使用 `SchemaFormInstance<T>`，提供 `getFieldsValue()`、`setFieldsValue()`、`validate()`、`submit()`、`reset()` 等方法，详见 [ProForm 实例](./pro-form#数据与实例)。

## 与其他组件配合

- 表格搜索使用 `ProTable` 的 `search` 配置，见 [ProTable](./pro-table)。
- 标签弹层形式的筛选使用 [LightFilter](./light-filter)。
- 国际化、主题与语义样式沿用 [ProForm](./pro-form#配置与样式)。
