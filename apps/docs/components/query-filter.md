---
pageClass: component-doc
---

<script setup>
import BasicQueryFilter from '../../playground/src/demos/query-filter/BasicQueryFilter.vue'
import SchemaQueryFilter from '../../playground/src/demos/query-filter/SchemaQueryFilter.vue'
</script>

# QueryFilter 查询筛选

`QueryFilter` 是可独立使用的查询表单，支持响应式栅格、查询、重置及展开收起。`ProTable` 的默认搜索区域也使用这个组件。可以组合 `ProForm` 字段，也可以传入 `columns` 生成字段。

默认使用横向表单布局，根容器内边距和字段行间距均为 `24px`，字段不额外叠加 Form.Item 的底部间距。可显式设置 `layout="vertical"`；`styles.root/row/item/actions` 可定制对应区域。

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

### 属性 {#props}

`columns` 未传时使用组合式 ProForm，传入时使用 BetaSchemaForm。下表列出查询专属配置；公共配置各有明确来源：

| 配置入口                    | 类型 / 归属          | 说明与文档                                                                                                                                                                                            |
| --------------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ProForm 公共属性            | `ProFormProps<T>`    | `initialValues/request/params/readonly/disabled/dateFormatter/syncToUrl/syncToInitialValues/onValuesChange/formRef/prefixCls/classes/classNames/styles` 等完整定义见 [ProForm 属性](./pro-form#props) |
| 组合模式的原生表单属性      | `FormProps`          | `layout/rules/labelCol/wrapperCol/labelAlign/labelWrap/colon/validateTrigger` 等直接写在 QueryFilter；完整 [antdv-next Form API](https://www.antdv-next.com/components/form-cn)                       |
| `formProps`（columns 模式） | `Partial<FormProps>` | 配置 Schema 内部原生 Form；见 [SchemaForm 属性](./schema-form#props)及 [Form API](https://www.antdv-next.com/components/form-cn)。模型、提交、readonly 和筛选布局由上层协调，顶层专属设置优先         |
| `columns` 模式的其余配置    | `SchemaFormProps<T>` | 列、校验、栅格、旧 URL 配置等见 [SchemaForm 属性](./schema-form#props)；字段 `fieldProps/formItemProps` 的来源见 [字段公共 API](./pro-form-fields#props)                                              |

| 属性                | 类型                                                         | 默认值         | 说明 / 来源                                                                    |
| ------------------- | ------------------------------------------------------------ | -------------- | ------------------------------------------------------------------------------ |
| `modelValue`        | `Partial<T>`                                                 | —              | `v-model` 当前查询条件                                                         |
| `columns`           | `SchemaFormColumn<T>[]`                                      | —              | 传入时进入 Schema 模式；[列属性](./schema-form#columns)                        |
| `onFinish`          | `(values: T) => boolean \| void \| Promise<boolean \| void>` | —              | 可等待业务查询回调，使用 `:on-finish`                                          |
| `layout`            | `FormProps['layout']`                                        | `'horizontal'` | [原生 Form 布局](https://www.antdv-next.com/components/form-cn)，可设 vertical |
| `collapsed`         | `boolean`                                                    | 非受控         | 受控折叠状态，支持 `v-model:collapsed`                                         |
| `defaultCollapsed`  | `boolean`                                                    | `true`         | 非受控初始状态                                                                 |
| `defaultColsNumber` | `number`                                                     | `3`            | 较宽容器的默认列数                                                             |
| `span`              | `number \| Record<string, number>`                           | 响应容器宽度   | 24 栅格列宽；支持 `xs/sm/md/lg/xl` 断点                                        |
| `labelWidth`        | `number \| 'auto'`                                           | `80`           | 标签宽度，数字单位 px                                                          |
| `split`             | `boolean`                                                    | `false`        | 字段分隔样式                                                                   |
| `searchText`        | `VNodeChild`                                                 | 国际化“查询”   | 优先于 submitter 内的提交文案                                                  |
| `resetText`         | `VNodeChild`                                                 | 国际化“重置”   | 优先于 submitter 内的重置文案                                                  |
| `optionRender`      | `false \| (props, form, doms) => VNodeChild`                 | 默认按钮       | 定制操作区，form 为 ProFormInstance，doms 为默认按钮数组                       |
| `collapseRender`    | `false \| (collapsed: boolean) => VNodeChild`                | 默认文案及箭头 | 折叠按钮内容；false 隐藏                                                       |
| `submitter`         | `false \| SubmitterProps`                                    | 默认按钮       | [提交区配置](./pro-form#submitter)，含 ButtonProps 来源链接                    |

`optionRender=false` 保留折叠按钮；`collapseRender=false` 隐藏折叠按钮。操作区优先使用 optionRender，其次 submitter.render，最后 submitter 插槽与默认按钮；顶层查询文案优先于 submitter 文案。

### 事件 {#events}

| 事件                | 参数                                       | 说明                                                                           |
| ------------------- | ------------------------------------------ | ------------------------------------------------------------------------------ |
| `update:modelValue` | `values: Partial<T>`                       | 受控值更新                                                                     |
| `change`            | `values: Partial<T>`                       | 查询值变化                                                                     |
| `update:collapsed`  | `collapsed: boolean`                       | 驱动受控折叠状态                                                               |
| `collapse`          | `collapsed: boolean`                       | 用户切换折叠                                                                   |
| `submit`            | `values: Partial<T>`                       | 提交通知；等待业务结果使用 onFinish                                            |
| `reset`             | `values: Partial<T>`                       | 恢复初始化快照                                                                 |
| `error`             | `error: unknown`                           | 校验或提交异常                                                                 |
| `requestError`      | `error: unknown`                           | 初始化请求失败                                                                 |
| Schema 专属事件     | 见 [SchemaForm 事件](./schema-form#events) | columns 模式另有 valuesChange、fieldChange、finish 等，触发条件遵循 SchemaForm |

### 插槽 {#slots}

| 插槽                         | 参数                                      | 说明                                                    |
| ---------------------------- | ----------------------------------------- | ------------------------------------------------------- |
| `default`                    | 无                                        | 组合模式放置字段子组件                                  |
| `submitter`（组合模式）      | `{ form, values, submit, reset }`         | 定制操作区，仍可调用标准提交/重置                       |
| `submitter`（columns 模式）  | `{ values, current }`                     | Schema 提交区上下文；不提供组合模式的 form/submit/reset |
| 动态字段插槽（columns 模式） | 见 [SchemaForm 插槽](./schema-form#slots) | `field-${path}`、路径名、列 key 对应的字段渲染入口      |

### 实例方法 {#instance}

公开布局入口的 ref 类型为 `SchemaFormInstance<T>`。常用方法在两种模式下均可用，全部参数与返回值见 [SchemaForm 实例](./schema-form#instance)和 [ProForm 实例](./pro-form#instance)。

| 方法 / 属性                                               | 参数与返回值                | 说明                                                            |
| --------------------------------------------------------- | --------------------------- | --------------------------------------------------------------- |
| `nativeForm`                                              | `FormInstance \| undefined` | 底层 [Form 实例](https://www.antdv-next.com/components/form-cn) |
| `validate()` / `validateFields(names?)`                   | `Promise<Partial<T>>`       | 校验并返回原始值                                                |
| `validateFieldsReturnFormatValue(names?)`                 | `Promise<Partial<T>>`       | 校验并返回格式化值                                              |
| `getFieldsValue()` / `getFieldValue(name)`                | `Partial<T>` / `unknown`    | 读取原始值                                                      |
| `getFieldsFormatValue()` / `getFieldFormatValue(name)`    | `Partial<T>` / `unknown`    | 读取格式化与 transform 后结果                                   |
| `setFieldsValue(values)` / `setFieldValue(name, value)`   | `void`                      | 合并对象 / 写单个路径                                           |
| `submit()`                                                | `Promise<Partial<T>>`       | 校验并等待 onFinish                                             |
| `reset()` / `resetFields()`                               | `void`                      | 恢复初始化快照                                                  |
| `clearValidate(names?)` / `scrollToField(name, options?)` | `void`                      | 清除错误 / 定位字段                                             |
| `loading`                                                 | `Readonly<Ref<boolean>>`    | 提交状态                                                        |

统一 ref 还包含 open/close/next/prev/formMap 的兼容转发；它们服务于弹层或步骤布局，在 QueryFilter 中不执行布局操作。

## 与其他组件配合

- 表格搜索使用 `ProTable` 的 `search` 配置，见 [ProTable](./pro-table)。
- 标签弹层形式的筛选使用 [LightFilter](./light-filter)。
- 国际化、主题与语义样式沿用 [ProForm](./pro-form#配置与样式)。
