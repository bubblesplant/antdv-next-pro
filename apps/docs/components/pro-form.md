---
pageClass: component-doc
---

<script setup>
import CompositionForm from '../../playground/src/demos/schema-form/CompositionForm.vue'
</script>

# ProForm 组合表单

`ProForm` 通过字段子组件组合表单，无需 `columns`。需要使用 Schema 描述字段时，请使用 [BetaSchemaForm](./schema-form)。普通表单默认 `layout="vertical"`；原有横向布局可显式设置 `layout="horizontal"`。

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

`name` 支持字符串、数字或路径数组，如 `['profile', 'name']`。`onValuesChange(changedValues, values)` 的首参是嵌套变更对象。`ProForm.Provider` / `ProFormProvider` 通过表单 `name` 聚合 `onFormChange` 与 `onFormFinish`；`ProForm.useWatch(name)` 和 `ProForm.useFormInstance()` 在子组件中读取最近表单。

## 结构化字段

| 组件                                       | 配置与插槽                                                                                                                                                     |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ProForm.Group` / `ProFormGroup`           | `title/tooltip/extra`、`direction`、`size`、`labelLayout`；`collapsible`、`collapsed/defaultCollapsed` 与 `v-model:collapsed`；默认字段插槽及 title/extra 插槽 |
| `ProForm.FieldSet` / `ProFormFieldSet`     | 一个 `name` 存储数组，子控件按顺序绑定；支持 convertValue/transform；`type="space\|group"`、`space` 配置                                                       |
| `ProForm.List` / `ProFormList`             | `name/initialValue/min/max/creatorRecord`；`creatorButtonProps`、`copyIconProps/deleteIconProps` 可设 false；支持嵌套字段和稳定行 key                          |
| `ProForm.Dependency` / `ProFormDependency` | `name` 为依赖路径数组；作用域插槽得到依赖对象与表单实例；默认补上当前 List 行路径，`ignoreFormListField` 可忽略该作用域                                        |
| `ProForm.Item` / `ProFormItem`             | 给原生控件提供 FormItem、name、value/onUpdate:value 绑定；支持 readonly/valueType                                                                              |

List 默认插槽提供 `{ field, index, action, fields, record, list }`。`actionRef` 或组件 ref 提供 `add(record?, index?)`、`remove(index \| indices)`、`copy(index)`、`move(from,to)`、`get(index)`、`getList()`。新增/删除 guard 支持 Promise：`actionGuard.beforeAddRow(record,index,count)`、`beforeRemoveRow(index,count)` 返回 false 可阻止操作。`actionRender` 和 `itemRender` 可定制操作及整行内容；只读、禁用和 min/max 仍约束公开操作。

## 弹层与筛选

`ModalForm` / `DrawerForm` 不传 columns 时渲染组合字段，传 columns 时兼容 Schema 入口。支持 `trigger` 插槽、`open/v-model:open`、`title/width` 和原生 `modalProps/drawerProps`。open、业务 title/width、footer 和关闭回调由表单协调，其余原生配置透传。非受控时由触发器和实例 `open()/close()` 管理；受控时父组件须接收 open 更新。

只有 `await onFinish(values)` 返回 **true** 才关闭弹层。false、undefined、拒绝 Promise 均保留值及打开状态；关闭后重开、组件卸载时，旧提交不会关闭新弹层。默认取消按钮关闭弹层并调用原生 onCancel/onClose，保留草稿；显式调用 reset() 才恢复初始值。`destroyOnHidden`（或旧 destroyOnClose）为 true 时，关闭动画结束后销毁表单，下次打开恢复初始值；afterClose/afterOpenChange 回调保留。

`submitTimeout` 仅用于弹层，单位毫秒：设为正数时，从业务提交开始暂时禁用取消并忽略交互关闭；超时或提交结束解除保护。它不会终止业务 Promise，未完成提交的按钮仍显示 loading。默认不设关闭保护，实例 close() 和外部 open 状态仍由调用者控制。

[QueryFilter](./query-filter) 可独立导入，提供响应式栅格、折叠及操作区：`collapsed/defaultCollapsed`、`span`、`defaultColsNumber`、`labelWidth`、`split`、`optionRender(props, form, doms)`、`collapseRender(collapsed)`、`searchText/resetText`。宽度变化会调整列宽，字段值和校验继续保留。

[LightFilter](./light-filter) 可独立导入，将普通字段显示为标签和弹层，`secondary` 字段默认进入更多筛选；`collapse=true` 将全部字段收进同一个更多弹层。支持 `collapseLabel/placement/footerRender`。确认先校验再提交；取消恢复打开时的值，清除移除值后提交。更多弹层内直接展示字段行，并对该组字段统一确认、取消和清除。`LightWrapper` 提供同一弹层行为和 `v-model:open`。

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

## 提交区与 URL

`submitter=false` 隐藏操作区；对象支持 `searchConfig.submitText/resetText`、`submitButtonProps/resetButtonProps`（可 false）与 `render({form,submit,reset}, doms)`（可 false）。`#submitter` 可定制节点，调用提供的 submit/reset 继续经过标准流程。

`syncToUrl=true` 以点路径同步查询参数，忽略无关参数，清空字段时删除自己拥有的参数，监听 popstate 回填或删除字段。函数模式为 `(values, 'get' | 'set') => values`；`syncToInitialValues=false` 跳过初始化 URL 回填。SchemaForm 的旧 `urlSync` 另有 key/hash 扩展，见 [Schema 文档](./schema-form)。

## 配置与样式

表单和字段继承原生 ConfigProvider 的 locale、direction、componentDisabled、componentSize、主题算法及全局 token；原生 Form/Input 等继续消费 `theme.components.Form/Input`。Pro 扩展 token 使用 `ProConfigProvider.token`，不使用 `theme.components.ProForm`。显式字段配置优先于继承值。

默认公开根类为 `ant-pro-form`，查询/轻量/步骤表单分别为 `ant-pro-query-filter`、`ant-pro-form-light-filter`、`ant-pro-steps-form`。原生 prefix=demo 时自动变为 demo-pro；组件 prefixCls 接收完整前缀。

`class/style/id/data-*/aria-*` 绑定实际根表单或布局容器。`classes/styles` 支持对象或 `({ props }) => object`，可用部位按组件为 `root/form/content/submitter/title/actions/row/item/container/collapseButton/step`；旧 `classNames` 补缺，同部位以 classes 优先。弹层组件的这些属性作用于内部表单，弹层本身用 modalProps/drawerProps 配置。
