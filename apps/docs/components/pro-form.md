---
pageClass: component-doc
---

<script setup>
import CompositionForm from '../../playground/src/demos/schema-form/CompositionForm.vue'
</script>

# ProForm 组合表单

`ProForm` 通过字段子组件组合表单，无需 `columns`。需要使用 Schema 描述字段时，请使用 [BetaSchemaForm](./schema-form)。普通表单默认 `layout="vertical"`；原有横向布局可显式设置 `layout="horizontal"`。

普通表单的提交区默认在起点对齐，不额外增加顶部间距；多个按钮的间距使用主题 `marginXS`。

<ClientOnly>
  <CompositionForm />
</ClientOnly>

<details class="demo-source"><summary>查看完整代码</summary>

<<< ../../playground/src/demos/schema-form/CompositionForm.vue

</details>

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ProForm, ProFormText, type ProFormInstance } from '@bubblesjs/antdv-next-pro'

const form = ref<ProFormInstance>()
async function save(values: Record<string, unknown>) {
  await api.save(values)
  return true
}
</script>

<template>
  <ProForm ref="form" :initial-values="{ name: 'Ada' }" :on-finish="save">
    <ProFormText name="name" label="姓名" :rules="[{ required: true }]" />
  </ProForm>
</template>
```

`onFinish` 是可等待且有返回值的属性，应绑定 `:on-finish="save"`。`submit` 事件用于观察提交，不代替业务回调返回值。异步提交期间显示 loading，并合并重复的 `submit()` 调用；校验失败或回调抛错时，实例 `submit()` 会 reject。

## 数据与实例

初始化顺序为 `initialValues < request(params) < URL < modelValue`，右侧覆盖左侧。并发初始化只接纳最后一次结果；相同内容的初始配置重新渲染不会清空草稿。`v-model`、`setFieldValue` 和 `setFieldsValue` 管理原始模型。

字段 `convertValue` 处理入站值；`transform` 处理格式化后的出站值。`transform` 返回对象时移除原字段并合并到提交根对象。默认 `dateFormatter="string"`；设为 `number` 输出时间戳，`false` 保留原始日期对象，也可提供格式化函数。格式化不会修改模型。

| 实例方法 / 属性                                           | 用途                                  |
| --------------------------------------------------------- | ------------------------------------- |
| `nativeForm`                                              | 底层 antdv-next Form 实例             |
| `validate` / `validateFields(names?)`                     | 校验并返回原始值                      |
| `getFieldsValue()` / `getFieldValue(name)`                | 读取原始值                            |
| `getFieldsFormatValue()` / `getFieldFormatValue(name)`    | 读取格式化及 transform 后的值         |
| `validateFieldsReturnFormatValue(names?)`                 | 校验后读取格式化结果                  |
| `setFieldsValue(values)` / `setFieldValue(name, value)`   | 合并对象 / 更新单个路径               |
| `submit()`                                                | 校验、格式化、等待 onFinish，返回结果 |
| `reset()` / `resetFields()`                               | 恢复初始化快照                        |
| `clearValidate(names?)` / `scrollToField(name, options?)` | 清理错误 / 定位字段                   |
| `loading`                                                 | 只读提交状态 Ref                      |

字段 `name` 支持字符串、数字或路径数组，如 `['profile', 'name']`，表单自身的 `name` 为字符串。`onValuesChange(changedValues, values)` 的首参是嵌套变更对象。`ProForm.Provider` / `ProFormProvider` 通过表单 `name` 聚合 `onFormChange` 与 `onFormFinish`；`ProForm.useWatch(name)` 读取字段，`ProForm.useFormInstance()` 返回最近的**原生** Form 实例，详见 [Hooks](#hooks)。

## 结构化字段

| 组件                                       | 配置与插槽                                                                                                                                                     |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ProForm.Group` / `ProFormGroup`           | `title/tooltip/extra`、`direction`、`size`、`labelLayout`；`collapsible`、`collapsed/defaultCollapsed` 与 `v-model:collapsed`；默认字段插槽及 title/extra 插槽 |
| `ProForm.FieldSet` / `ProFormFieldSet`     | 一个 `name` 存储数组，子控件按顺序绑定；支持 convertValue/transform；`type="space\|group"`、`space` 配置                                                       |
| `ProForm.List` / `ProFormList`             | `name/initialValue/min/max/creatorRecord`；`creatorButtonProps`、`copyIconProps/deleteIconProps` 可设 false；支持嵌套字段和稳定行 key                          |
| `ProForm.Dependency` / `ProFormDependency` | `name` 为依赖路径数组；作用域插槽得到依赖对象与表单实例；默认补上当前 List 行路径，`ignoreFormListField` 可忽略该作用域                                        |
| `ProForm.Item` / `ProFormItem`             | 给原生控件提供 FormItem、name、value/onUpdate:value 绑定；支持 readonly/valueType                                                                              |

List 默认插槽提供 `{ field, index, action, fields, record, list }`。`actionRef` 或组件 ref 提供 `add(record?, index?)`、`remove(index \| indices)`、`copy(index)`、`move(from,to)`、`get(index)`、`getList()`。新增/删除 guard 支持 Promise：`actionGuard.beforeAddRow(record,index,count)`、`beforeRemoveRow(index,count)` 返回 false 可阻止操作。`actionRender` 和 `itemRender` 可定制操作及整行内容；只读、禁用和 min/max 仍约束公开操作。

`ProFormGroup` 默认横向间距为 `32px`、换行间距为 `0`，标题下方间距使用主题 `marginXL`。`labelLayout="twoLine"` 让标题独占一行，字段区域左侧缩进 `16px`。

## 弹层与筛选

`ModalForm` / `DrawerForm` 不传 columns 时渲染组合字段，传 columns 时兼容 Schema 入口。支持 `trigger` 插槽、`open/v-model:open`、`title/width` 和原生 `modalProps/drawerProps`。open、业务 title/width、footer 和关闭回调由表单协调，其余原生配置透传。非受控时由触发器和实例 `open()/close()` 管理；受控时父组件须接收 open 更新。

只有 `await onFinish(values)` 返回 **true** 才关闭弹层。false、undefined、拒绝 Promise 均保留值及打开状态；关闭后重开、组件卸载时，旧提交不会关闭新弹层。默认取消按钮关闭弹层并调用原生 onCancel/onClose，保留草稿；显式调用 reset() 才恢复初始值。`destroyOnHidden`（或旧 destroyOnClose）为 true 时，关闭动画结束后销毁表单，下次打开恢复初始值；afterClose/afterOpenChange 回调保留。

`submitTimeout` 仅用于弹层，单位毫秒：设为正数时，从业务提交开始暂时禁用取消并忽略交互关闭；超时或提交结束解除保护。它不会终止业务 Promise，未完成提交的按钮仍显示 loading。默认不设关闭保护，实例 close() 和外部 open 状态仍由调用者控制。

[QueryFilter](./query-filter) 可独立导入，提供响应式栅格、折叠及操作区：`collapsed/defaultCollapsed`、`span`、`defaultColsNumber`、`labelWidth`、`split`、`optionRender(props, form, doms)`、`collapseRender(collapsed)`、`searchText/resetText`。宽度变化会调整列宽，字段值和校验继续保留。

[LightFilter](./light-filter) 可独立导入，将普通字段显示为标签和弹层，`secondary` 字段默认进入更多筛选；`collapse=true` 将全部字段收进同一个更多弹层。支持 `collapseLabel/placement/footerRender`。确认先校验再提交；取消恢复打开时的值，清除移除值后提交。更多弹层内直接展示字段行，并对该组字段统一确认、取消和清除。`LightWrapper` 提供同一弹层行为和 `v-model:open`。

弹层默认宽度为 `800px`；可通过 `width` 或原生 `modalProps.width/drawerProps.width` 覆盖，原生宽度配置优先。提交区位于原生弹层的 footer 并右对齐，保留内部表单的校验和提交行为。Modal 默认提交文案为“确认”，Drawer 为“提交”，均可通过 submitter 配置覆盖；Modal 也遵循原生 `okText` 与 locale。

## 多步骤

```vue
<StepsForm :on-finish="save" :form-props="{ layout: 'vertical' }">
  <StepForm name="basic" title="基本信息">
    <ProFormText name="name" label="名称" :rules="[{ required: true }]" />
  </StepForm>
  <StepForm name="owner" title="负责人">
    <ProFormText name="owner" label="负责人" />
  </StepForm>
</StepsForm>
```

每步是独立原生 Form，支持自身 initialValues/request/rules/onFinish。没有 step onFinish 时校验成功即前进；配置回调后只有返回 true 才前进。false、undefined、reject 不前进，回退保留草稿。最后一步重新校验各步并合并提交值。`current/v-model:current`、`stepsProps`、`formProps`、`formMapRef` 可配置；实例提供 `next()/prev()/submit()/validate()/reset()/formMap()`，按 name 获取每步实例。`StepsForm.StepForm` 为组合成员，独立 `StepForm` 亦可导入。

步骤导航最大宽度为 `1160px`，表单和提交区位于同一个居中容器。容器按内容撑开，最小宽度为 `min(420px, 100%)`，最大宽度不超过父容器；每步顶部间距为 `32px`。

## 提交区与 URL

`submitter=false` 隐藏操作区；对象支持 `searchConfig.submitText/resetText`、`submitButtonProps/resetButtonProps`（可 false）与 `render({form,submit,reset}, doms)`（可 false）。`#submitter` 可定制节点，调用提供的 submit/reset 继续经过标准流程。

`syncToUrl=true` 以点路径同步查询参数，忽略无关参数，清空字段时删除自己拥有的参数，监听 popstate 回填或删除字段。函数模式为 `(values, 'get' | 'set') => values`；`syncToInitialValues=false` 跳过初始化 URL 回填。SchemaForm 的旧 `urlSync` 另有 key/hash 扩展，见 [Schema 文档](./schema-form)。

## 配置与样式

表单和字段继承原生 ConfigProvider 的 locale、direction、componentDisabled、componentSize、主题算法及全局 token；原生 Form/Input 等继续消费 `theme.components.Form/Input`。Pro 扩展 token 使用 `ProConfigProvider.token`，不使用 `theme.components.ProForm`。显式字段配置优先于继承值。

默认公开根类为 `ant-pro-form`，查询/轻量/步骤表单分别为 `ant-pro-query-filter`、`ant-pro-form-light-filter`、`ant-pro-steps-form`。原生 prefix=demo 时自动变为 demo-pro；组件 prefixCls 接收完整前缀。

`class/style/id/data-*/aria-*` 绑定实际根表单或布局容器。`classes/styles` 支持对象或 `({ props }) => object`，可用部位按组件为 `root/form/content/submitter/title/actions/row/item/container/collapseButton/step`；旧 `classNames` 补缺，同部位以 classes 优先。弹层组件的这些属性作用于内部表单，弹层本身用 modalProps/drawerProps 配置。

## API 归属与入口 {#api}

以下表格以当前 Vue 实现为准。`T` 为表单记录类型，`NamePath = string | number | readonly (string | number)[]`；“—”表示组件不设置默认值。`ProForm` 自身直接接收原生 Form 属性，**没有 `formProps` 包装层**；Schema 模式和 StepsForm 的 `formProps` 含义见下表。

| 入口                          | 自身 API                                                                            | 原生配置的入口与来源                                                                          |
| ----------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `ProForm`                     | [公共属性](#props)、[事件](#events)、[插槽](#slots)、[实例](#instance)              | `rules`、`labelCol` 等直接绑定，见 [原生 Form 属性表](#native-form-props)                     |
| `Form` / `Embed`              | 不传 `columns` 时使用 ProForm；传入时使用 BetaSchemaForm                            | Schema 模式使用 [`formProps`](./schema-form#form-props)                                       |
| `ModalForm` / `DrawerForm`    | [弹层扩展](#overlay-props)，支持两种模式                                            | `modalProps` → [Modal API][antd-modal]；`drawerProps` → [Drawer API][antd-drawer]             |
| `StepsForm` / `StepForm`      | [组合式步骤 API](#steps-props)；传 `columns` 时见 [Schema API](./schema-form#props) | 组合式 `StepsForm.formProps` 是每步公共配置；Schema 模式是原生 Form 配置                      |
| `QueryFilter` / `LightFilter` | [查询筛选](./query-filter#props) / [轻量筛选](./light-filter#props)                 | 不传 `columns` 时沿用公共 ProForm 属性；传入时沿用 Schema API                                 |
| 字段与结构组件                | [结构组件](#structure-props)、[独立字段](./pro-form-fields#props)                   | 字段 `formItemProps` → [FormItem][antd-form-item]，`fieldProps` → [各控件](./pro-form-fields) |

### ProForm 属性 {#props}

| 属性                                           | 类型                                                                                               | 默认值                            | 说明 / 来源                                                               |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------- |
| `modelValue`                                   | `Partial<T>`                                                                                       | —                                 | 原始表单值，配合 `v-model`                                                |
| `initialValues`                                | `Partial<T>`                                                                                       | —                                 | 初始化及 `reset()` 的快照来源                                             |
| `request`                                      | `(params?: Record<string, unknown>) => Promise<Partial<T>>`                                        | —                                 | 请求初始值；不是提交接口                                                  |
| `params`                                       | `Record<string, unknown>`                                                                          | —                                 | 传给 `request`，内容变化重新初始化                                        |
| `onFinish`                                     | `(values: T) => boolean \| void \| Promise<boolean \| void>`                                       | —                                 | 可等待的业务提交回调；绑定 `:on-finish`                                   |
| `onValuesChange`                               | `(changedValues: Partial<T>, values: T) => void`                                                   | —                                 | 嵌套变更对象与完整原始值；不同于 Schema 的 `values-change` 事件           |
| `readonly`                                     | `boolean`                                                                                          | `false`                           | 子字段只读，隐藏默认提交区                                                |
| `disabled`                                     | `boolean`                                                                                          | 继承 ConfigProvider               | 传给原生 Form，并由子字段继承                                             |
| `name`                                         | `string`                                                                                           | —                                 | 原生 Form 名称，也用作 ProFormProvider 的注册键                           |
| `layout`                                       | `'horizontal' \| 'vertical' \| 'inline'`                                                           | `'vertical'`                      | 原生 [Form 布局][antd-form]，QueryFilter 默认 horizontal                  |
| `submitter`                                    | `false \| SubmitterProps`                                                                          | `{}`                              | 提交区；配置逐项见 [SubmitterProps](#submitter-props)                     |
| `syncToUrl`                                    | `boolean \| ((values, type: 'get' \| 'set') => Record<string, unknown>)`                           | 关闭                              | 点路径 URL query 同步；函数映射入站/出站值                                |
| `syncToInitialValues`                          | `boolean`                                                                                          | `true`                            | 是否在初始化时读取 URL                                                    |
| `dateFormatter`                                | `'string' \| 'number' \| false \| ((value, valueType?) => unknown)`                                | `'string'`                        | 提交/格式化读取时处理日期，不修改模型                                     |
| `formRef`                                      | `Ref<ProFormInstance<T> \| undefined> \| ((instance) => void)`                                     | —                                 | 与组件 ref 相同的实例；卸载回传 undefined                                 |
| `prefixCls`                                    | `string`                                                                                           | ConfigProvider 前缀 + `-pro-form` | 完整 ProForm 样式前缀；不是原生 Form 的 prefixCls                         |
| `classes`                                      | `FormClasses \| (({ props }) => FormClasses)`                                                      | —                                 | 语义类名，部位见 [语义样式](#semantic)                                    |
| `classNames`                                   | `FormClasses`                                                                                      | —                                 | 兼容入口，`classes` 同部位优先                                            |
| `styles`                                       | `FormStyles \| (({ props }) => FormStyles)`                                                        | —                                 | 语义样式，部位见 [语义样式](#semantic)                                    |
| `class` / `style` / `id` / `data-*` / `aria-*` | Vue HTML attributes                                                                                | —                                 | 绑定实际根表单；弹层外壳用 modalProps/drawerProps                         |
| 其余原生 Form 属性                             | `Omit<FormProps, 'model' \| 'onFinish' \| 'onValuesChange' \| 'onReset' \| 'classes' \| 'styles'>` | 原生默认值                        | [逐项来源](#native-form-props)；模型、提交、重置和语义样式由 ProForm 协调 |

### 原生 Form 属性 {#native-form-props}

`ProForm` 中直接绑定下列属性；`BetaSchemaForm` 中放入 [`formProps`](./schema-form#form-props)。属性完整定义、原生默认值与版本变化见 [antdv-next FormProps][antd-form]。表内未列默认值时表示本库不另设默认值。

| 属性                            | 类型                                                     | 用途 / 来源                                                                |
| ------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------- |
| `colon`                         | `boolean`                                                | 标签冒号；[FormProps][antd-form]                                           |
| `labelAlign`                    | `'left' \| 'right'`                                      | 标签对齐；[FormProps][antd-form]                                           |
| `labelWrap`                     | `boolean`                                                | 标签换行；[FormProps][antd-form]                                           |
| `labelCol`                      | `ColProps`                                               | 标签栅格；[FormProps][antd-form]、[Col API][antd-grid]                     |
| `wrapperCol`                    | `ColProps`                                               | 控件栅格；[FormProps][antd-form]、[Col API][antd-grid]                     |
| `feedbackIcons`                 | `FormProps['feedbackIcons']`                             | 校验反馈图标；[FormProps][antd-form]                                       |
| `size`                          | `'small' \| 'middle' \| 'large'`                         | 子控件尺寸；[FormProps][antd-form]                                         |
| `scrollToFirstError`            | `boolean \| ScrollFocusOptions`                          | 提交失败自动定位；[FormProps][antd-form]                                   |
| `requiredMark`                  | `boolean \| 'optional' \| ((label, info) => VNodeChild)` | 必填标记；[FormProps][antd-form]                                           |
| `variant`                       | `FormProps['variant']`                                   | 子控件外观；[FormProps][antd-form]                                         |
| `validateMessages`              | `ValidateMessages`                                       | 校验提示模板；[FormProps][antd-form]                                       |
| `rules`                         | `RulesMap`                                               | 表单级校验；[FormProps][antd-form]                                         |
| `validateTrigger`               | `string \| string[] \| false`                            | 校验触发时机；[FormProps][antd-form]                                       |
| `preserve`                      | `boolean`                                                | 字段卸载时保留值；[FormProps][antd-form]                                   |
| `clearOnDestroy`                | `boolean`                                                | 原生 Form 卸载行为；[FormProps][antd-form]；弹层草稿销毁用 destroyOnHidden |
| `validateOnRuleChange`          | `boolean`                                                | 规则变化时校验；[FormProps][antd-form]                                     |
| `autoComplete` / `autocomplete` | `string`                                                 | 浏览器自动补全；[FormProps][antd-form]                                     |
| `tooltip`                       | `FormProps['tooltip']`                                   | 全局标签提示；[FormProps][antd-form]                                       |
| `onFinishFailed`                | `(errorInfo: ValidateErrorEntity) => void`               | 原生提交校验失败通知；[Form 事件][antd-form]                               |
| `onValidate`                    | `(name, status, errors) => void`                         | 原生字段校验通知；[Form 事件][antd-form]                                   |
| `onFieldsChange`                | `(changedFields, allFields) => void`                     | 原生字段状态变化；[Form 事件][antd-form]                                   |

`model` 由内部状态提供，使用 `modelValue`；`onFinish`、`onValuesChange` 使用上方 Pro 回调；`submit`、`reset` 是 Pro 事件，不能按原生 DOM Event 接收。程序调用实例 `submit()` 的异常应通过 Promise / Pro `error` 处理；原生回调不保证覆盖 Pro 的全部调用路径。`name/layout/disabled/prefixCls/classes/styles` 的 Pro 含义已在上表单独列出。

<span id="submitter"></span>

### SubmitterProps {#submitter-props}

| 配置项              | 类型                                                                     | 默认值      | 说明 / 来源                                                                                            |
| ------------------- | ------------------------------------------------------------------------ | ----------- | ------------------------------------------------------------------------------------------------------ |
| `searchConfig`      | `{ submitText?: VNodeChild; resetText?: VNodeChild }`                    | locale 文案 | `searchConfig.submitText/resetText` 分别配置提交/重置文案                                              |
| `submitText`        | `VNodeChild`                                                             | locale 文案 | 兼容提交文案；`searchConfig.submitText` 优先                                                           |
| `resetText`         | `VNodeChild`                                                             | locale 文案 | 兼容重置文案；`searchConfig.resetText` 优先                                                            |
| `submitButtonProps` | `false \| Partial<ButtonProps>`                                          | `{}`        | 提交按钮，false 隐藏；[Button API][antd-button]。htmlType 和表单关联由组件管理，loading 与提交状态合并 |
| `resetButtonProps`  | `false \| Partial<ButtonProps>`                                          | `{}`        | 重置按钮；弹层中为取消按钮；[Button API][antd-button]                                                  |
| `render`            | `false \| (({ form, submit, reset }, doms: VNodeChild[]) => VNodeChild)` | 默认按钮    | 替换提交区；false 隐藏；`#submitter` 优先                                                              |

### ProForm 事件 {#events}

| 事件                | 参数             | 触发时机                                                             |
| ------------------- | ---------------- | -------------------------------------------------------------------- |
| `update:modelValue` | `values: T`      | 原始模型更新，模板使用 `@update:model-value` 或 `v-model`            |
| `change`            | `values: T`      | 字段值更新                                                           |
| `submit`            | `values: T`      | 校验、日期格式化、transform 后，调用 onFinish 前；没有回调返回值语义 |
| `reset`             | `values: T`      | 恢复初始化快照                                                       |
| `requestError`      | `error: unknown` | 初始值请求失败；模板 `@request-error`                                |
| `error`             | `error: unknown` | 提交校验或 onFinish 失败                                             |

原生 `finishFailed`、`validate`、`fieldsChange` 监听沿 attrs 传给原生 Form，参数来源见 [原生 Form 属性表](#native-form-props)。Schema 模式另有 [Schema 事件](./schema-form#events)，不能用两种模式的事件集合互相替代。

### ProForm 插槽 {#slots}

| 插槽        | 参数                                                                                 | 说明                                                                      |
| ----------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| `default`   | `{ values: T, form: ProFormInstance<T> }`                                            | 组合字段内容                                                              |
| `submitter` | `{ form, values, submit: () => Promise<T>, reset: () => void, submitting: boolean }` | 替换提交区，优先于 submitter.render；submitter=false 或 readonly 时不显示 |

### ProForm 实例 {#instance}

以下为 `ProFormInstance<T>`，通过组件 ref 或 `formRef` 获取。Pro 暴露方法与 [原生 FormInstance][antd-form-instance] 的签名不同；原生完整能力通过 `nativeForm` 访问。

| 方法 / 成员                       | 参数                                              | 返回值                      | 说明                                                   |
| --------------------------------- | ------------------------------------------------- | --------------------------- | ------------------------------------------------------ |
| `nativeForm`                      | —                                                 | `FormInstance \| undefined` | 原生实例，挂载后可用                                   |
| `validate`                        | `names?: NamePath[]`                              | `Promise<T>`                | 校验并返回原始值                                       |
| `validateFields`                  | `names?: NamePath[]`                              | `Promise<T>`                | 同 validate                                            |
| `validateFieldsReturnFormatValue` | `names?: NamePath[]`                              | `Promise<T>`                | 校验后返回日期格式化/transform 结果                    |
| `getFieldsValue`                  | `all?: boolean`                                   | `T`                         | 读取原始模型                                           |
| `getFieldValue`                   | `name: NamePath`                                  | `unknown`                   | 读取单字段                                             |
| `getFieldsFormatValue`            | —                                                 | `T`                         | 格式化并转换所有字段                                   |
| `getFieldFormatValue`             | `name: NamePath`                                  | `unknown`                   | 从转换后的对象取路径；transform 改名后须使用输出路径   |
| `setFieldsValue`                  | `values: Partial<T>`                              | `void`                      | 合并模型，执行入站 convertValue                        |
| `setFieldValue`                   | `name: NamePath, value: unknown`                  | `void`                      | 写入单字段                                             |
| `submit`                          | —                                                 | `Promise<T>`                | 校验、格式化、等待 onFinish；失败 reject；并发提交合并 |
| `reset`                           | —                                                 | `void`                      | 恢复初始化快照                                         |
| `resetFields`                     | —                                                 | `void`                      | 同 reset，不接受原生的部分重置参数                     |
| `clearValidate`                   | `names?: NamePath[]`                              | `void`                      | 清理校验错误                                           |
| `scrollToField`                   | `name: NamePath, options?: ScrollIntoViewOptions` | `void`                      | 定位字段                                               |
| `loading`                         | —                                                 | `Readonly<Ref<boolean>>`    | 当前提交状态；Vue 公开实例可能自动解包 ref             |

### ModalForm / DrawerForm 属性、事件与插槽 {#overlay-props}

两者继承 [ProForm 属性](#props)、[事件](#events)与[实例](#instance)。传 `columns` 时改用 [SchemaForm 属性与插槽](./schema-form#props)，下方组合模式插槽参数不适用于 Schema 模式。

| 扩展属性        | 类型                    | 默认值           | 说明 / 来源                                    |
| --------------- | ----------------------- | ---------------- | ---------------------------------------------- |
| `columns`       | `SchemaFormColumn<T>[]` | —                | 提供时进入 Schema 模式；省略时组合子字段       |
| `open`          | `boolean`               | 非受控初值 false | `v-model:open`；受控时父组件须响应更新         |
| `title`         | `VNodeChild`            | —                | 优先于原生弹层配置 title                       |
| `width`         | `number \| string`      | `800`            | 原生 modalProps.width / drawerProps.width 优先 |
| `trigger`       | `VNodeChild`            | —                | 点击打开；`#trigger` 优先                      |
| `modalProps`    | `Partial<ModalProps>`   | —                | ModalForm 专用；[Modal API][antd-modal]        |
| `drawerProps`   | `Partial<DrawerProps>`  | —                | DrawerForm 专用；[Drawer API][antd-drawer]     |
| `submitTimeout` | `number`                | 关闭保护         | 正数为提交关闭保护毫秒数；不取消业务 Promise   |

原生 `open/footer` 由表单管理；onCancel/onClose、afterClose/afterOpenChange 会组合调用，关闭保护时交互关闭回调不执行。`destroyOnHidden`（兼容 destroyOnClose）控制关闭后销毁。其他原生配置在对应 props 对象内透传，弹层自身语义样式也写在该对象中。

| 扩展事件      | 参数            | 说明                                                |
| ------------- | --------------- | --------------------------------------------------- |
| `update:open` | `open: boolean` | 打开状态更新                                        |
| `openChange`  | `open: boolean` | 组合模式状态通知；Schema 模式使用 open / close 事件 |

| 组合模式插槽            | 参数                                                             | 说明                                                              |
| ----------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------- |
| `default` / `submitter` | 同 [ProForm 插槽](#slots)                                        | 内部表单内容与提交区                                              |
| `trigger`               | `{ open: boolean, openForm: () => void, closeForm: () => void }` | 自定义打开入口                                                    |
| `title`                 | 原生插槽参数                                                     | [Modal slots][antd-modal] / [Drawer slots][antd-drawer]，覆盖标题 |
| `footer`                | 原生插槽参数                                                     | 自定义弹层底部，同时隐藏内部 submitter                            |
| 其他弹层插槽            | 原生插槽参数                                                     | 透传原生弹层；可用名称见对应原生 API                              |

额外实例方法：`open(): void`、`close(): void`。公共布局别名返回 `SchemaFormInstance` 转发器，因此也存在 next/prev/formMap 等兼容成员；没有对应布局时不执行操作，不代表弹层提供步骤能力。

### StepsForm / StepForm {#steps-props}

本节为**省略 columns** 的组合模式。`StepsForm` 并不整体继承 ProFormProps，公共表单配置放在 `formProps`，每个 `StepForm` 再继承 [ProForm 属性](#props)。传 columns 的 Schema 步骤使用 [Schema 属性](./schema-form#props)。

| StepsForm 属性 | 类型                                          | 默认值                         | 说明 / 来源                                                                                                                                                                                                                                           |
| -------------- | --------------------------------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `current`      | `number`                                      | `0`                            | 当前步骤，支持 v-model:current                                                                                                                                                                                                                        |
| `onFinish`     | `ProFormFinish<T>`                            | —                              | 最后一步的合并提交，返回 true 后重置各步并回到第一步                                                                                                                                                                                                  |
| `stepsProps`   | `Partial<StepsProps>`                         | —                              | [Steps API][antd-steps]；current/items 由各步生成，onChange 会组合调用                                                                                                                                                                                |
| `submitter`    | `false \| SubmitterProps`                     | `{}`                           | [提交区配置](#submitter-props)                                                                                                                                                                                                                        |
| `formProps`    | `ProFormProps<T>`                             | —                              | 各步公共配置；来源为 [ProForm](#props)，其中 rules 等原生项见 [FormProps](#native-form-props)。`onFinish`、`onUpdate:modelValue`、`onChange`、`onSubmit`、`onReset`、`onError`、`onRequestError` 由每步处理器覆盖；每步业务回调在 StepForm 上显式配置 |
| `formMapRef`   | `Ref<Map<string, ProFormInstance>>`           | —                              | 以 StepForm.name 为键同步每步实例；卸载置空 Map                                                                                                                                                                                                       |
| `prefixCls`    | `string`                                      | `ant-pro-steps-form`，跟随前缀 | 根容器前缀                                                                                                                                                                                                                                            |
| `classes`      | `FormClasses \| (({ props }) => FormClasses)` | —                              | [语义样式](#semantic)                                                                                                                                                                                                                                 |
| `classNames`   | `FormClasses`                                 | —                              | 兼容类名                                                                                                                                                                                                                                              |
| `styles`       | `FormStyles \| (({ props }) => FormStyles)`   | —                              | [语义样式](#semantic)                                                                                                                                                                                                                                 |

| StepForm 扩展属性 | 类型                      | 默认值     | 说明 / 来源                                                                                              |
| ----------------- | ------------------------- | ---------- | -------------------------------------------------------------------------------------------------------- |
| `name`            | `string`                  | —          | 实例 Map 与导航的键，省略时内部键为 `step-${index}`；显式提供时也作为原生表单名，缺省键不会传给原生 Form |
| `title`           | `VNodeChild`              | 步骤序号   | 步骤导航标题，`#title` 优先                                                                              |
| `stepProps`       | `Record<string, unknown>` | —          | 单个 [Steps item][antd-steps] 配置；name/title 生成的 key/title 优先                                     |
| 其余公共属性      | `ProFormProps<T>`         | 同 ProForm | [完整属性表](#props)；步骤自身显式公共配置优先于 StepsForm.formProps                                     |

| 组件 / 事件                                  | 参数                  | 说明                             |
| -------------------------------------------- | --------------------- | -------------------------------- |
| StepsForm `update:current` / `currentChange` | `current: number`     | 步骤切换；模板 @current-change   |
| StepsForm `finish`                           | `values: T`           | 未配置 onFinish 时的最终提交通知 |
| StepsForm `reset`                            | `values: T`           | 重置所有步骤                     |
| StepsForm `error`                            | `error: unknown`      | 校验或提交失败                   |
| StepForm 公共事件                            | 同 [ProForm](#events) | 每步独立模型/提交/重置/请求错误  |

| 组件 / 插槽           | 参数                                            | 用途                                                 |
| --------------------- | ----------------------------------------------- | ---------------------------------------------------- |
| StepsForm `default`   | 无                                              | 放置 StepForm 子组件                                 |
| StepsForm `submitter` | `{ form, current, submit, next, prev, values }` | 步骤操作区                                           |
| StepForm `default`    | `{ form, values }`                              | 当前步骤字段                                         |
| StepForm `title`      | 无                                              | 步骤导航标题                                         |
| StepForm `submitter`  | 同 ProForm                                      | 独立 StepForm 可用；StepsForm 内由父级统一渲染提交区 |

| StepsForm 实例扩展 / 差异                                      | 返回值                          | 说明                                                                                                        |
| -------------------------------------------------------------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `next()`                                                       | `Promise<boolean>`              | 校验并提交当前步，成功前进返回 true                                                                         |
| `prev()`                                                       | `void`                          | 返回前一步，保留草稿                                                                                        |
| `formMap()`                                                    | `Map<string, ProFormInstance>`  | 每步实例                                                                                                    |
| `validate()` / `validateFields()`                              | `Promise<T>`                    | 校验所有步骤，失败定位对应步；不按 names 筛选                                                               |
| `submit()`                                                     | `Promise<T>`                    | 提交当前步；最后一步校验全部并调用根 onFinish                                                               |
| `getFieldsValue()` / `getFieldsFormatValue()`                  | `T`                             | 合并各步结果，同名路径后步覆盖前步                                                                          |
| `setFieldsValue(values)`                                       | `void`                          | 向每一步合并值                                                                                              |
| `setFieldValue(name, value)` / `scrollToField(name, options?)` | `void`                          | 作用于当前步                                                                                                |
| `reset()` / `resetFields()`                                    | `void`                          | 重置全部步骤并返回第一步                                                                                    |
| `nativeForm`                                                   | `undefined`                     | 多步没有单一原生 Form，使用 formMap() 获取各步 nativeForm                                                   |
| 其余公共方法                                                   | 同 [ProFormInstance](#instance) | clearValidate 广播各步；单字段读取取首个非 undefined 值；loading 为整次步骤提交状态，包含根 onFinish 的等待 |

### 结构组件属性 {#structure-props}

结构组件可使用具名导出或 `ProForm.Group/FieldSet/List/Dependency/Item`。未标出实例方法的结构组件不提供自定义 ref API。

#### ProFormGroup {#group-props}

| 属性                                              | 类型                                       | 默认值         | 说明 / 来源                                         |
| ------------------------------------------------- | ------------------------------------------ | -------------- | --------------------------------------------------- |
| `title`                                           | `VNodeChild`                               | —              | 分组标题，title 插槽优先                            |
| `titleStyle`                                      | `CSSProperties`                            | —              | 标题样式，styles.title 后合并                       |
| `tooltip`                                         | `VNodeChild \| Record<string, unknown>`    | —              | 节点作提示内容，对象作 [TooltipProps][antd-tooltip] |
| `extra`                                           | `VNodeChild`                               | —              | 标题附加内容，extra 插槽优先                        |
| `collapsible`                                     | `boolean`                                  | `false`        | 显示折叠按钮                                        |
| `collapsed`                                       | `boolean`                                  | —              | 受控折叠状态，v-model:collapsed                     |
| `defaultCollapsed`                                | `boolean`                                  | `false`        | 非受控初始状态                                      |
| `direction`                                       | `'horizontal' \| 'vertical'`               | `'horizontal'` | 字段排列方向                                        |
| `size`                                            | `number \| 'small' \| 'middle' \| 'large'` | `32`           | 横向间距，数字单位 px；行间距为 0                   |
| `labelLayout`                                     | `'inline' \| 'twoLine'`                    | —              | twoLine 使标题独占一行                              |
| `prefixCls` / `classes` / `classNames` / `styles` | 同 [公共样式类型](#props)                  | —              | 生效部位 root/title/container                       |

#### ProFormFieldSet {#fieldset-props}

| 属性               | 类型                                                             | 默认值     | 说明 / 来源                                                   |
| ------------------ | ---------------------------------------------------------------- | ---------- | ------------------------------------------------------------- |
| `name`             | `NamePath`                                                       | —          | 整组对应一个数组字段                                          |
| `modelValue`       | `unknown[]`                                                      | —          | 整组受控值，优先于所在表单的同路径值                          |
| `initialValue`     | `unknown[]`                                                      | `[]`       | 初值                                                          |
| `transform`        | `(value: unknown[], values: Record<string, unknown>) => unknown` | —          | 提交时转换                                                    |
| `convertValue`     | `(value: unknown) => unknown[]`                                  | —          | 入站转换                                                      |
| `type`             | `'space' \| 'group'`                                             | `'space'`  | 分组样式，均由 Space 排列                                     |
| `space`            | `Record<string, unknown>`                                        | —          | 透传 [Space API][antd-space]；class 由组件管理                |
| 其余 FormItem 属性 | `Omit<FormItemProps, 'name'>`                                    | 原生默认值 | 直接绑定，如 label/rules，来源 [FormItem API][antd-form-item] |

#### ProFormList {#list-props}

| 属性                                              | 类型                                                                                                                                                            | 默认值       | 说明 / 来源                                                                 |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | --------------------------------------------------------------------------- |
| `name`                                            | `NamePath`                                                                                                                                                      | 必填         | 数组字段路径，自动拼接当前 List 行作用域                                    |
| `label`                                           | `VNodeChild`                                                                                                                                                    | —            | 列表表单项标题                                                              |
| `initialValue`                                    | `T[]`                                                                                                                                                           | —            | 当前路径无数组时使用；否则按 min 生成初始行                                 |
| `min`                                             | `number`                                                                                                                                                        | `0`          | 最少行数                                                                    |
| `max`                                             | `number`                                                                                                                                                        | 无上限       | 最大行数                                                                    |
| `creatorRecord`                                   | `T \| (() => T)`                                                                                                                                                | `{}`         | 新建行模板，插入前克隆                                                      |
| `creatorButtonProps`                              | `false \| (Partial<ButtonProps> & { creatorButtonText?: VNodeChild; position?: 'top' \| 'bottom' })`                                                            | 底部新增按钮 | [Button API][antd-button]；creatorButtonText 文案、position 位置是 Pro 扩展 |
| `copyIconProps`                                   | `false \| { tooltipText?: VNodeChild; Icon?: Component }`                                                                                                       | 显示复制按钮 | Icon 替换图标，false 隐藏；当前实现未消费 tooltipText                       |
| `deleteIconProps`                                 | `false \| { tooltipText?: VNodeChild; Icon?: Component }`                                                                                                       | 显示删除按钮 | Icon 替换图标，false 隐藏；当前实现未消费 tooltipText                       |
| `actionGuard`                                     | `{ beforeAddRow?: (record, index, count) => boolean \| Promise<boolean>; beforeRemoveRow?: (index: number \| number[], count) => boolean \| Promise<boolean> }` | —            | 返回 false 阻止操作                                                         |
| `actionRef`                                       | `Ref<FormListActionType<T> \| undefined> \| ((actions) => void)`                                                                                                | —            | 与组件 ref 相同的列表操作                                                   |
| `actionRender`                                    | `(field, action, defaultActionDom: VNodeChild[], count: number) => VNodeChild`                                                                                  | 默认操作按钮 | 替换每行操作                                                                |
| `itemRender`                                      | `({ listDom, action }, { field, index, record }) => VNodeChild`                                                                                                 | 默认行布局   | 替换整行                                                                    |
| `rules`                                           | `FormItemProps['rules']`                                                                                                                                        | —            | 整个数组字段校验；[FormItem API][antd-form-item]                            |
| `alwaysShowItemLabel`                             | `boolean`                                                                                                                                                       | —            | true 每行显示标签，false 隐藏；未设置时采用默认首行标签布局                 |
| `prefixCls` / `classes` / `classNames` / `styles` | 同 [公共样式类型](#props)                                                                                                                                       | —            | root/item/container/actions 部位；其他 attrs 在根 div，不透传给 FormItem    |

#### ProFormDependency / ProFormItem {#dependency-item-props}

| 组件 / 属性                      | 类型                          | 默认值     | 说明 / 来源                                           |
| -------------------------------- | ----------------------------- | ---------- | ----------------------------------------------------- |
| Dependency `name`                | `NamePath[]`                  | 必填       | 依赖字段路径数组                                      |
| Dependency `ignoreFormListField` | `boolean`                     | `false`    | 跳过当前 List 行前缀                                  |
| Item `name`                      | `NamePath`                    | —          | 包装原生控件并绑定第一个子节点的 value / update:value |
| Item `valueType`                 | `ProFieldValueTypeInput`      | —          | 只读时使用 [ProField](./pro-field#props) 格式化       |
| Item `readonly`                  | `boolean`                     | 继承表单   | 当前项只读                                            |
| Item 其余属性                    | `Omit<FormItemProps, 'name'>` | 原生默认值 | 直接透传 [FormItem API][antd-form-item]               |

### 结构组件事件、插槽与方法 {#structure-events}

| 组件 / 事件                             | 参数                        | 说明                 |
| --------------------------------------- | --------------------------- | -------------------- |
| Group `update:collapsed` / `collapse`   | `collapsed: boolean`        | 折叠切换             |
| FieldSet `update:modelValue` / `change` | `values: unknown[]`         | 子控件更新           |
| List `change`                           | `list: T[]`                 | 数组内容变化         |
| List `afterAdd`                         | `record: T, index: number`  | 添加或复制成功       |
| List `afterRemove`                      | `index: number \| number[]` | 删除成功             |
| List `error`                            | `error: unknown`            | guard 或异步操作失败 |

| 组件 / 插槽                         | 参数                                                                      | 用途                                                       |
| ----------------------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Group `default` / `title` / `extra` | 无                                                                        | 字段 / 标题 / 附加内容                                     |
| FieldSet `default`                  | 无                                                                        | 控件按顺序绑定数组索引，控件须支持 modelValue 协议         |
| FieldSet / Item 原生 FormItem 插槽  | [FormItem slots][antd-form-item]                                          | 如 label、extra、help 等，透传原生 FormItem                |
| List `default`                      | `{ field: { name, key, fieldKey }, index, action, fields, record, list }` | 渲染每行字段；field.name 是行下标，key/fieldKey 为稳定标识 |
| Dependency `default`                | `{ ...依赖路径组成的嵌套值对象, form }`                                   | 依赖更新时重新渲染；form 为 ProForm 上下文                 |
| Item `default`                      | `{ value: unknown, form }`                                                | 原生控件或自定义字段                                       |

| List ref / actionRef 方法               | 返回值             | 说明                     |
| --------------------------------------- | ------------------ | ------------------------ |
| `add(record?: T, insertIndex?: number)` | `Promise<boolean>` | 默认追加，或指定位置插入 |
| `remove(index: number \| number[])`     | `Promise<boolean>` | 删除一行或多行           |
| `copy(index: number)`                   | `Promise<boolean>` | 克隆当前行               |
| `move(from: number, to: number)`        | `boolean`          | 调整顺序                 |
| `get(index: number)`                    | `T \| undefined`   | 读取行                   |
| `getList()`                             | `T[]`              | 读取列表                 |

List 所有写操作同时受 readonly、disabled、min/max 约束；guard 仅适用于新增/删除路径。

### ProFormProvider / ProFormErrorList {#provider-error-list}

| 组件 / 属性                                     | 类型                                                                                      | 默认值 | 说明 / 来源                     |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------- | ------ | ------------------------------- |
| Provider `onFormChange`                         | `(name: string, info: { changedValues, forms: Record<string, ProFormInstance> }) => void` | —      | 命名子表单变化回调              |
| Provider `onFormFinish`                         | `(name: string, info: { values, forms: Record<string, ProFormInstance> }) => void`        | —      | 命名子表单提交回调              |
| ErrorList `fieldId`                             | `string`                                                                                  | —      | 错误区域关联 id，原生 ErrorList |
| ErrorList `help`                                | `VNodeChild`                                                                              | —      | 帮助内容                        |
| ErrorList `helpStatus`                          | `ValidateStatus`                                                                          | —      | 帮助状态                        |
| ErrorList `errors` / `warnings`                 | `unknown[]`                                                                               | —      | 错误 / 警告列表                 |
| ErrorList `onVisibleChanged`                    | `(visible: boolean) => void`                                                              | —      | 可见性回调                      |
| ErrorList `helpItemClassName` / `helpItemStyle` | `string` / `CSSProperties`                                                                | —      | 单条提示的类名 / 样式           |

Provider 只有无参数 `default` 插槽，不渲染容器，不透传原生 FormProvider 的配置。ErrorList 是 antdv-next 原生 ErrorList 的直接别名；定义归属于 [Form API][antd-form] 和 [Form 错误列表源码][antd-error-list-source]，没有自有插槽、事件或实例方法。

### Hooks {#hooks}

| 函数                                          | 参数                                                                                   | 返回值 / 来源                                                                           |
| --------------------------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `useWatch<T>` / `ProForm.useWatch<T>`         | `name: NamePath, form?: MaybeRef<Pick<ProFormInstance, 'getFieldValue'> \| undefined>` | `ComputedRef<T \| undefined>`；省略 form 时读取最近 ProForm 上下文，List 内需传完整路径 |
| `useForm` / `ProForm.useForm`                 | 原生 hook 参数                                                                         | 直接导出 [antdv-next useForm][antd-form]，不创建 ProFormInstance                        |
| `useFormInstance` / `ProForm.useFormInstance` | 无                                                                                     | 最近的原生 `FormInstance`，来源 [Form hook][antd-form]                                  |

### 语义样式 {#semantic}

| 组件                                   | 当前实现消费的部位                                                  | 配置来源                                                                                           |
| -------------------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| ProForm                                | `root`、`form`、`submitter`                                         | classes / classNames / styles                                                                      |
| ModalForm / DrawerForm                 | 内部 ProForm 的部位                                                 | 弹层本身的部位请放 modalProps / drawerProps                                                        |
| Group                                  | `root`、`title`、`container`                                        | 同上                                                                                               |
| List                                   | `root`、`item`、`container`、`actions`                              | 同上                                                                                               |
| StepsForm                              | `root`、`container`、`submitter`                                    | 同上                                                                                               |
| StepForm                               | 内部 ProForm 的 `root`、`form`、`submitter`；步骤外层使用固定前缀类 | 同上                                                                                               |
| QueryFilter / LightFilter / SchemaForm | 各布局支持的部位                                                    | [QueryFilter](./query-filter)、[LightFilter](./light-filter)、[SchemaForm](./schema-form#semantic) |

[antd-form]: https://www.antdv-next.com/components/form-cn#form-props
[antd-form-item]: https://www.antdv-next.com/components/form-cn#form-item-props
[antd-form-instance]: https://www.antdv-next.com/components/form-cn#form-methods
[antd-modal]: https://www.antdv-next.com/components/modal-cn#api
[antd-drawer]: https://www.antdv-next.com/components/drawer-cn#api
[antd-steps]: https://www.antdv-next.com/components/steps-cn#api
[antd-button]: https://www.antdv-next.com/components/button-cn#props
[antd-grid]: https://www.antdv-next.com/components/grid-cn#col
[antd-tooltip]: https://www.antdv-next.com/components/tooltip-cn#api
[antd-space]: https://www.antdv-next.com/components/space-cn#api
[antd-error-list-source]: https://github.com/antdv-next/antdv-next/blob/main/packages/antdv-next/src/form/ErrorList.tsx
