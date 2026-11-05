---
pageClass: component-doc
---

<script setup>
import ProFormFieldsDemo from '../examples/ProFormFieldsDemo.vue'
import ProFormFieldsExtendedDemo from '../examples/ProFormFieldsExtendedDemo.vue'
</script>

# ProFormFields

独立字段组件为普通表单、自定义布局、ProTable 搜索与行内编辑、SchemaForm 提供同一套值绑定、选项请求和只读展示协议。原有 19 个字段保持公开，并增加日期变体、时间、级联、颜色、评分、数字区间等字段。默认组件自带 Antdv Next `FormItem`；只渲染控件使用 `fieldMode="field"` 或 `ignoreFormItem`。

## 完整字段示例

下面的 Vue SFC 示例实际渲染原有 19 个字段，并演示只读态、异步选项、验证码回调、上传入口和裸控件模式。

<ClientOnly>
  <ProFormFieldsDemo />
</ClientOnly>

<details class="demo-source">
<summary>查看完整代码</summary>

<<< ../examples/ProFormFieldsDemo.vue

</details>

## 导入与命名

原有 19 个模板友好名称均支持具名导入；安装默认插件后也会注册为同名全局组件。

```ts
import {
  ProFormCaptcha,
  ProFormCheckbox,
  ProFormDatePicker,
  ProFormDateRangePicker,
  ProFormDateTimePicker,
  ProFormDateTimeRangePicker,
  ProFormDigit,
  ProFormMoney,
  ProFormRadioGroup,
  ProFormSegmented,
  ProFormSelect,
  ProFormSlider,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
  ProFormTextPassword,
  ProFormTreeSelect,
  ProFormUploadButton,
  ProFormUploadDragger,
} from '@bubblesjs/antdv-next-pro'
```

为对应 Ant Design Pro Components 的组合命名，同时提供：

```ts
ProFormText.Password === ProFormTextPassword
ProFormRadio.Group === ProFormRadioGroup
ProFormCheckbox.Group === ProFormCheckboxGroup
ProFormDatePicker.Week === ProFormDateWeekPicker
ProFormDatePicker.Month === ProFormDateMonthPicker
ProFormDatePicker.Quarter === ProFormDateQuarterPicker
ProFormDatePicker.Year === ProFormDateYearPicker
ProFormTimePicker.RangePicker === ProFormTimeRangePicker
ProFormSelect.SearchSelect === ProFormSearchSelect
```

Vue 模板也可直接使用具名组件。`ProFormRadio` 本身是可渲染的原子 Radio，支持布尔 `v-model`；`.Group` 是单选组，`.Button` 是原生 RadioButton。插件注册具名组件，不注册带点名称。

## 通用 API

### 公共 Props

每个字段默认由 FormItem 和 Input、Select 等基础控件组成。公共属性分为字段能力、表单项属性和基础控件属性：`label`、`rules` 等配置表单项，`fieldProps` 配置基础控件。

以下属性适用于所有字段包装组件。`ProFormRadio.Button` 是原生 RadioButton，使用 [Radio 属性][antd-radio]，不套用此表。

| Prop             | 类型                                                | 默认值                     | 说明                                                                          |
| ---------------- | --------------------------------------------------- | -------------------------- | ----------------------------------------------------------------------------- |
| `modelValue`     | 由组件决定                                          | `undefined`                | 标准 `v-model` 值；在 ProForm 内未显式绑定时从 `name` 对应的表单 store 取值   |
| `name`           | `string \| number \| readonly (string \| number)[]` | —                          | FormItem 字段名，支持嵌套路径；在 ProForm 内同时连接表单 store                |
| `label`          | `VNodeChild`                                        | —                          | FormItem 标签，支持文本、VNode；也可用 `#label` 插槽自定义，插槽优先          |
| `rules`          | `FormItemProps['rules']`                            | —                          | 校验规则，参见 [FormItem 属性][antd-form-item]                                |
| `fieldMode`      | `'form-item' \| 'field'`                            | `'form-item'`              | 渲染表单项或裸控件                                                            |
| `ignoreFormItem` | `boolean`                                           | `false`                    | 为 `true` 时强制使用裸控件模式，优先于 `fieldMode`                            |
| `fieldProps`     | `Partial<基础控件 Props> & { class?, style? }`      | —                          | 传给 Input、Select 等基础控件；各字段下方提供对应的 antdv-next 属性链接       |
| `formItemProps`  | `Partial<FormItemProps>`                            | —                          | 只传给 FormItem，参见 [FormItem 属性][antd-form-item]                         |
| `placeholder`    | 对应基础控件的 `placeholder` 类型                   | —                          | 当前顶层值尚未透传，请使用 `fieldProps.placeholder`；范围字段可使用字符串数组 |
| `disabled`       | `boolean`                                           | 继承上层配置，否则 `false` | 保持控件外观并禁止交互；可继承 ProForm / ConfigProvider                       |
| `readonly`       | `boolean`                                           | 继承 ProForm，否则 `false` | 改用统一只读展示                                                              |
| `emptyText`      | `VNodeChild`                                        | `'-'`                      | `undefined`、`null`、空字符串的占位                                           |
| `readonlyRender` | `(value) => VNodeChild`                             | —                          | 自定义只读输出；返回 `null` / `undefined` 时回退默认格式化                    |
| `width`          | `number \| 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'`    | —                          | 数字为像素；预设宽度依次为 104 / 216 / 328 / 440 / 552px，最大不超过容器      |
| `prefixCls`      | `string`                                            | 由 ProConfigProvider 生成  | 自定义字段样式前缀                                                            |
| `classes`        | `ProSemanticSource<ProSemanticClasses>`             | —                          | 各语义部位的类名，支持对象或 `({ props }) => 对象`，见下方样式说明            |
| `classNames`     | `ProSemanticSource<ProSemanticClasses>`             | —                          | 兼容旧语义类名；仅补充 `classes` 未指定的部位                                 |
| `styles`         | `ProSemanticSource<ProSemanticStyles>`              | —                          | 各语义部位的样式，支持对象或 `({ props }) => 对象`                            |
| `convertValue`   | `(value, values) => unknown`                        | —                          | 在 ProForm 初始化、同步外部值或注册字段时转换传入值                           |
| `transform`      | `(value, values) => unknown`                        | —                          | 在 ProForm 格式化取值或提交时转换值；返回普通对象会移除原字段并合并到提交结果 |
| `preserve`       | `boolean`                                           | 保留                       | 在 ProForm 中设为 `false` 时，字段卸载后移除对应 store 值                     |
| `proFieldProps`  | `Record<string, unknown>`                           | —                          | ProField 配置；`mode: 'read'` 或 `readonly: true` 可指定只读                  |

### 表单项公共属性

除上表中的 `name`、`label`、`rules`，以下属性同样作用于字段内部的 FormItem，适用于全部字段包装组件。它们均可通过 `formItemProps` 配置，完整原生定义见 [antdv-next FormItem 属性][antd-form-item]。

| 属性               | 类型                                                      | 默认值                       | 说明                                                                         |
| ------------------ | --------------------------------------------------------- | ---------------------------- | ---------------------------------------------------------------------------- |
| `tooltip`          | `FormItemProps['tooltip']`                                | —                            | 标签旁的提示，支持内容节点或 Tooltip 配置对象（含 `icon`）；没有标签时不显示 |
| `extra`            | `FormItemProps['extra']`                                  | —                            | 控件下方的补充说明，可与校验消息同时显示                                     |
| `help`             | `FormItemProps['help']`                                   | 校验消息                     | 自定义帮助或错误内容；提供内容时替换自动生成的校验消息                       |
| `required`         | `boolean`                                                 | 由 `rules` 推导              | 控制必填标记；实际必填校验需配置 `rules`                                     |
| `validateStatus`   | `'success' \| 'warning' \| 'error' \| 'validating' \| ''` | 自动计算                     | 手动指定校验展示状态                                                         |
| `hasFeedback`      | `FormItemProps['hasFeedback']`                            | `false`                      | 显示校验反馈图标，也可通过 `{ icons }` 定制图标                              |
| `labelCol`         | `ColProps`                                                | 继承 Form                    | 标签区域的栅格布局，如 `{ span: 6 }`，支持响应式配置                         |
| `wrapperCol`       | `ColProps`                                                | 继承 Form                    | 控件区域的栅格布局，如 `{ span: 18 }`，支持响应式配置                        |
| `labelAlign`       | `'left' \| 'right'`                                       | 继承 Form                    | 标签对齐方式                                                                 |
| `colon`            | `boolean`                                                 | 继承 Form，通常为 `true`     | 是否显示标签后的冒号；纵向布局不显示                                         |
| `htmlFor`          | `string`                                                  | 自动关联字段 ID              | 标签关联的控件 ID；自定义控件 ID 使用 `fieldProps.id`                        |
| `validateFirst`    | `boolean \| 'parallel'`                                   | `false`                      | `true` 时首个失败规则后停止；`'parallel'` 时并行校验并采用首个失败结果       |
| `validateTrigger`  | `'change' \| 'blur' \| 'focus' \| TriggerType[] \| false` | 继承 Form，最终为 `'change'` | 触发校验的事件，可配置数组；`false` 关闭事件触发校验                         |
| `validateDebounce` | `number`                                                  | 无延迟                       | 事件触发校验的防抖时间，单位毫秒                                             |
| `class`            | `HTMLAttributes['class']`                                 | —                            | FormItem 根元素类名                                                          |
| `style`            | `HTMLAttributes['style']`                                 | —                            | FormItem 根元素样式                                                          |

这张表中的属性也支持顶层透传。多词属性在顶层需使用表中的驼峰键名，例如 `:labelCol="{ span: 6 }"`；当前 `:label-col` 这类未声明的连字符 attrs 不会映射到 FormItem，推荐统一使用 `:form-item-props="{ labelCol: { span: 6 } }"`。已声明的 `name`、`label`、`rules`、`form-item-props` 等组件 Props 不受此限制。

#### 需放入 `formItemProps` 的属性

以下原生表单项配置不属于字段的顶层 FormItem 透传属性，需要显式放入 `formItemProps`。

| 属性               | 类型                                             | 默认值                     | 说明                                                                                          |
| ------------------ | ------------------------------------------------ | -------------------------- | --------------------------------------------------------------------------------------------- |
| `layout`           | `'horizontal' \| 'vertical'`                     | 继承 Form                  | 当前 FormItem 的布局；字段顶层 `layout` 用于 Checkbox / Radio 的选项排列                      |
| `hidden`           | `boolean`                                        | `false`                    | 隐藏表单项，仍保留字段及校验                                                                  |
| `noStyle`          | `boolean`                                        | `false`                    | 不渲染 FormItem 外层布局，仍保留表单项能力；与完全不创建 FormItem 的 `fieldMode="field"` 不同 |
| `messageVariables` | `Record<string, string>`                         | 自动生成标签变量           | 自定义校验消息模板变量，可覆盖默认的 `label` 变量                                             |
| `trigger`          | `'change' \| 'blur' \| 'focus' \| TriggerType[]` | —                          | 未设置 `validateTrigger` 时，作为校验触发事件的兼容回退；字段值绑定仍使用 `v-model`           |
| `rootClass`        | `string`                                         | —                          | FormItem 根元素的额外类名                                                                     |
| `prefixCls`        | `string`                                         | 继承 Form / ConfigProvider | FormItem 样式前缀；字段顶层 `prefixCls` 配置的是 Pro 字段样式前缀                             |

在 ProForm 中请将 `name` 写在字段顶层，以便连接表单 store；仅设置 `formItemProps.name` 不会注册 ProForm 字段。标签换行通过父级 `<ProForm label-wrap>` 配置，当前不支持单个字段的 `labelWrap`。

### `fieldProps` 与基础组件属性

各字段专属的原生属性通过 `fieldProps` 配置，例如 Input 的 `allowClear`、Select 的 `mode`、日期控件的 `disabledDate`。下方每个字段的「fieldProps 属性」链接直接指向 antdv-next 对应基础组件的 API；字段额外提供的 Pro 属性则在本页列出。

```vue
<ProFormText
  name="title"
  label="标题"
  tooltip="用于列表展示的标题"
  :rules="[{ required: true, message: '请输入标题' }]"
  :form-item-props="{
    extra: '最多 30 个字',
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
    validateTrigger: 'blur',
  }"
  :field-props="{ allowClear: true, maxLength: 30, showCount: true }"
/>
<ProFormSelect
  name="tags"
  :options="tagOptions"
  :field-props="{ mode: 'multiple', allowClear: true }"
/>
```

`formItemProps` 控制标签、校验和提示等表单项能力，`fieldProps` 控制输入控件本身。字段值统一用 `v-model`，不在 `fieldProps` 中另设 `value`、`checked` 或 `fileList`。

### 布局与其他透传属性

- `width` 是字段自身的宽度配置，见公共 Props；标签与控件的宽度比例使用 `formItemProps.labelCol` / `wrapperCol`。
- `allowClear` 属于基础控件属性，使用 `fieldProps.allowClear`；仅对支持清除的控件生效，默认值遵循对应基础组件。
- `secondary` 仅由 LightFilter 读取，设为 `true` 时将该字段放入「更多筛选」，默认不折叠。详见 [QueryFilter / LightFilter](./query-filter)。
- 独立字段不提供通用的 `rowProps` / `colProps` 网格布局协议；自定义布局可组合 Row / Col，[SchemaForm](./schema-form) 的网格配置以其文档为准。

### 表单项与裸控件

`fieldMode="form-item"` 是默认模式，`name`、`label`、`rules` 和 `formItemProps` 作用于组件创建的 FormItem。

```vue
<ProFormText
  v-model="form.title"
  name="title"
  label="标题"
  :rules="[{ required: true, message: '请输入标题' }]"
/>
```

当父级已经提供 FormItem，或字段位于表格单元格、自定义网格中时使用裸控件模式。此时不会创建 FormItem，`label`、`rules`、`formItemProps` 也不参与渲染；`name` 仍可用于连接 ProForm store。

```vue
<ProFormText v-model="keyword" field-mode="field" :field-props="{ placeholder: '只渲染 Input' }" />
```

### 属性优先级与 attrs

同名普通属性按以下顺序取值：

1. 控件属性优先使用 `fieldProps` 中的显式配置。
2. 组件顶层便利控件属性。
3. 组件默认值。

因此 `fieldProps.disabled`、`fieldProps.min` 等优先于顶层同义配置。FormItem 的顶层 `name` / `label` / `rules` 及上表支持透传的同名属性优先于 `formItemProps`，`class` / `style` 按 Vue 规则合并。内部受控值与更新监听器始终由字段核心写入，使用者回调会被组合，不会覆盖 `v-model` 更新。

`fieldProps.class/style` 作用于基础控件，`formItemProps.class/style` 作用于 FormItem。普通 `class`、`style` 和上表列出的顶层表单项属性落到 FormItem；`max`、`data-*`、`aria-*` 等控件属性进入基础控件。其他原生 FormItem 属性请显式放入 `formItemProps`。`field` 模式下 class/style 也进入控件。

`classes` / `styles` 支持对象或 `({ props }) => ({ root: ... })`；`root` 定制当前模式的根，`control` 定制基础控件。UploadButton 还提供 `button`，UploadDragger 提供 `icon`、`title`、`description`。旧 `classNames` 补充 classes 未指定的部位；同部位以 classes 为准。原生 Upload 将 class 放在包装层、style 放在上传触发区，`field` 模式下也保留该原生行为。

`width` 接受像素数字及 xs/sm/md/lg/xl（104/216/328/440/552px）。在 ProForm 内，`name` 连接表单 store，`convertValue` 转换初始化和回填值，`transform` 处理格式化提交；`proFieldProps.mode='read'` 可指定只读。

### `v-model` 桥接

所有字段包装组件对外都使用 `modelValue / update:modelValue`，字段核心会适配基础控件的不同协议：

| 组件类型                                                                                          | 基础控件协议                 | ProFormFields 对外协议 |
| ------------------------------------------------------------------------------------------------- | ---------------------------- | ---------------------- |
| Input、InputNumber、日期/时间、Select、RadioGroup、Slider、Segmented、Cascader、ColorPicker、Rate | `value / update:value`       | `v-model`              |
| 单 Checkbox、单 Radio、Switch                                                                     | `checked / update:checked`   | `v-model`              |
| Upload、UploadDragger                                                                             | `fileList / update:fileList` | `v-model`              |

`fieldProps['onUpdate:value']`、`fieldProps['onUpdate:checked']` 或 `fieldProps['onUpdate:fileList']` 可与组件 `v-model` 同时使用，每次更新各调用一次。

### 事件

| 事件                | 适用组件                  | 说明                                                 |
| ------------------- | ------------------------- | ---------------------------------------------------- |
| `update:modelValue` | 全部                      | 规范化后的字段值                                     |
| `change`            | 全部                      | 原样转发基础控件的 change 参数                       |
| `requestError`      | 使用 `request` 的选项字段 | 选项请求失败；已有选项不会被清空                     |
| `captchaError`      | Captcha                   | 回调 reject 或返回 `false`；`false` 原样作为取消结果 |
| `drop`              | 两个 Upload               | 原样转发拖拽事件                                     |

基础控件更新值后，字段核心先调用 `fieldProps` 中对应的更新处理器，再触发包装组件的 `update:modelValue`。`change`、`drop` 也先调用 `fieldProps` 处理器，再 emit 同名事件。

### 插槽与实例方法

`label`、`extra`、`help`、`tooltip` 是 FormItem 插槽；其他具名插槽和默认插槽会转发给基础控件。`fieldMode="field"` 时不渲染 FormItem 专属插槽。

`#label`、`#extra`、`#help` 优先于同名属性。需要自定义标签内容时可以直接使用插槽；没有可渲染的标签时，不显示标签及其 tooltip。

```vue
<ProFormText name="title" :rules="[{ required: true, message: '请输入标题' }]">
  <template #label>
    <span>标题 <small>（用于列表展示）</small></span>
  </template>
  <template #extra>最多 30 个字</template>
</ProFormText>
```

- Captcha 增加 `captcha` 插槽，参数为 `{ seconds }`。
- UploadButton 的默认插槽替换上传按钮内容。
- UploadDragger 的默认插槽替换拖拽区内容。
- ProFormSelect、ProFormTreeSelect、ProFormCheckbox、ProFormRadioGroup、ProFormSegmented 及选项类型的 ProFormField 通过 ref 暴露 `refresh(): Promise<void>`，强制重新请求选项并跳过缓存。
- Captcha 通过 ref 暴露 `resetCountdown(): void`。
- Captcha 同时提供 `focus()`、`startTiming()`、`endTiming()`；旧 resetCountdown 为停止倒计时的兼容入口。

## 选项、请求与只读

### `options`、`valueEnum`、`request`

ProFormSelect / ProFormSearchSelect、ProFormTreeSelect、ProFormCheckbox / ProFormCheckboxGroup、ProFormRadioGroup、ProFormSegmented、ProFormCascader 使用相同协议；动态 ProFormField 的选项类型也适用：

| Prop           | 类型                                                                      | 默认值 | 说明                                                                                                                     |
| -------------- | ------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------ |
| `options`      | `ProFormFieldOption[]`                                                    | —      | 本地选项，通常为 `{ label, value, disabled?, ... }`；树和级联可包含 `children`，Checkbox / RadioGroup 也接受原生 options |
| `valueEnum`    | `Record<string \| number, string \| ProFormValueEnumItem> \| ReadonlyMap` | —      | 从枚举生成选项，枚举项支持 `text`、`value`、`disabled` 等                                                                |
| `request`      | `(params?) => Promise<选项数组>`                                          | —      | 异步获取选项；返回数组本身，无需包装为 `{ data }`                                                                        |
| `params`       | `Record<string, unknown>`                                                 | —      | 请求参数，变化时重新请求                                                                                                 |
| `debounceTime` | `number`                                                                  | `0`    | 参数或关键词变化后发起请求的防抖时间，单位毫秒                                                                           |
| `proFieldKey`  | `string`                                                                  | —      | 请求缓存的区分键，同时结合 request、params 与配置上下文生成缓存键                                                        |
| `cacheForSwr`  | `boolean`                                                                 | `true` | 是否复用当前配置作用域中的请求缓存；设为 `false` 关闭复用                                                                |
| `searchValue`  | `string`                                                                  | —      | 受控搜索关键词；远程搜索以 `keyWords` 合并进请求参数                                                                     |

```vue
<ProFormSelect
  ref="selectRef"
  v-model="owner"
  :options="fallbackOptions"
  :params="{ teamId }"
  :request="loadOwners"
  @request-error="reportError"
/>
```

- 存在 `request` 时立即请求；第一次成功前可以显示本地回退选项。
- 远程请求成功后结果成为权威来源，`[]` 也是有效结果，不会回退到本地选项。
- 没有 `request` 时，优先级为顶层 `options` → `fieldProps.options`（TreeSelect 为 `treeData`）→ `valueEnum`。
- 请求失败保留最后一次成功结果；从未成功时保留本地回退，并触发 `requestError`。
- `request` 或 `params` 变化会刷新；并发时只有最后一次请求可以更新状态。
- 原生远程搜索传入 `{ ...params, keyWords }`；`searchValue`、`debounceTime`、`proFieldKey`、`cacheForSwr` 控制受控关键词、防抖与作用域缓存，卸载或过期响应不会覆盖新状态。

选项会按 `label ?? text ?? title ?? name ?? value` 解析标签，按 `value ?? key ?? id` 解析值。若 `valueEnum` 需要严格保留数值 key，请使用 `ReadonlyMap`，或在枚举项中显式写 `value`：

```ts
const levels = new Map([
  [1, { text: '一级' }],
  [2, { text: '二级' }],
])

const alternate = {
  1: { text: '一级', value: 1 },
}
```

### 只读与重置

`readonly` 使用统一的 `ReadonlyField`，不会依赖各基础控件不同的只读实现。选项显示 label，数组使用逗号连接，日期区间使用 `~`，密码显示掩码，金额保留前缀，上传显示文件名。`0` 和 `false` 不会被当作空值。

只读切换会保留实例 `prefixCls` 及 `classes.control` / `styles.control`；动态字段的 `code` / `jsonCode` 使用主题代码块，支持通过 `fieldProps.class/style` 覆盖外观，详见 [ProField](./pro-field.md)。

字段都是受控组件：父级重置并传入新的 `modelValue` 后会立即更新。选项缓存不会因值重置而清空；Captcha 的倒计时需调用 `resetCountdown()` 显式取消。

## ProFormField 动态字段

`ProFormField` 用于按 `valueType` 动态选择控件，支持上面的公共属性与选项属性。具体类型和格式化行为见 [ProField](./pro-field.md)。

| Prop        | 类型                     | 默认值   | 说明                                                                                                             |
| ----------- | ------------------------ | -------- | ---------------------------------------------------------------------------------------------------------------- |
| `valueType` | `ProFieldValueTypeInput` | `'text'` | 类型名称或 `{ type, ...字段配置 }`，例如 `'select'`、`{ type: 'digit', min: 0 }`；显式 `fieldProps` 覆盖同义配置 |

`fieldProps` 的基础组件由 `valueType` 决定，可查阅下方对应字段的链接。例如 `valueType="select"` 对应 [Select 属性][antd-select]。

## 19 个组件

以下各项都可以在[完整字段示例](#完整字段示例)中直接操作。

### ProFormText

**fieldProps 属性：** [InputProps][antd-input]。

单行文本字段，`modelValue` 为 `string | undefined`，基础控件是 Input。无额外 Pro 默认值；`allowClear`、`prefix`、`suffix`、`maxLength` 等通过 `fieldProps` 传入。

### ProFormDigit

**fieldProps 属性：** [InputNumberProps][antd-input-number]。

数值字段，`modelValue` 为 `number | string | null`。默认 `min=0`，不指定精度；`fieldProps.min` / `fieldProps.precision` 优先于顶层同义配置，传 `false` 可不向 InputNumber 下发对应限制。顶层 `max` 也会进入控件。

```vue
<ProFormDigit v-model="count" :min="false" :precision="0" />
```

| Prop        | 类型                        | 默认值 | 说明                             |
| ----------- | --------------------------- | ------ | -------------------------------- |
| `min`       | `number \| string \| false` | `0`    | 最小值；`false` 表示不下发限制   |
| `precision` | `number \| false`           | —      | 小数精度；`false` 表示不下发限制 |

### ProFormTextPassword

**fieldProps 属性：** [InputPasswordProps][antd-input-password]。

密码输入，`modelValue` 为 `string | undefined`，基础控件是 InputPassword。只读非空值固定显示 `••••••`。可使用模板友好名称 `ProFormTextPassword`，也可在脚本或模板中使用 `ProFormText.Password`。

### ProFormTextArea

**fieldProps 属性：** [TextAreaProps][antd-textarea]。

多行文本，`modelValue` 为 `string | undefined`。`rows`、`autoSize`、`maxLength` 等 TextArea 属性通过 `fieldProps` 传入。

只读时保留换行并自动折行，继续应用 `fieldProps.class/style` 与 `control` 语义样式。

### ProFormCaptcha

**fieldProps 属性：** [InputProps][antd-input]；发送按钮使用 [ButtonProps][antd-button]。

验证码输入由 Input 与发送按钮组成。`onGetCaptcha(phone)` 必填；`countDown` 默认 60 秒，按钮文案读取 intl。指定 `phoneName` 时先校验 ProForm 对应字段，再取手机号传入回调；失败不发送。回调 resolve 且结果不为 `false` 时开始倒计时，reject 或 `false` 会恢复按钮并触发 `captchaError`。

`captchaTextRender(timing, count)` 定制按钮文案，`captchaProps` 配置按钮，`onTiming(count)` 接收倒计时。业务侧提供网络请求；loading、倒计时、disabled、readonly 任一成立时阻止重复点击，卸载会清理计时器。

| Prop                | 类型                                                             | 默认值    | 说明                                                                          |
| ------------------- | ---------------------------------------------------------------- | --------- | ----------------------------------------------------------------------------- |
| `onGetCaptcha`      | `(phone: string) => void \| boolean \| Promise<void \| boolean>` | 必填      | 发送验证码；返回 `false` 或 reject 会触发 `captchaError`，不开始倒计时        |
| `phoneName`         | `ProFormFieldName`                                               | —         | ProForm 中的手机号字段路径；未配置时回调接收空字符串                          |
| `countDown`         | `number`                                                         | `60`      | 倒计时秒数，向下取整且不小于 0                                                |
| `captchaTextRender` | `(timing: boolean, count: number) => VNodeChild`                 | —         | 自定义所有状态的按钮文案，优先于 `captchaText` / `countDownText`              |
| `captchaText`       | `VNodeChild`                                                     | intl 文案 | 空闲时的按钮文案                                                              |
| `countDownText`     | `(seconds: number) => VNodeChild`                                | intl 文案 | 倒计时按钮文案                                                                |
| `captchaProps`      | `Partial<ButtonProps>`                                           | —         | 发送按钮属性；同名配置优先于 `buttonProps`，loading / disabled 由内部状态控制 |
| `buttonProps`       | `Partial<ButtonProps>`                                           | —         | 兼容的发送按钮属性入口                                                        |
| `onTiming`          | `(count: number) => void`                                        | —         | 开始计时和每次倒计时时接收剩余秒数                                            |

### ProFormDatePicker

**fieldProps 属性：** [DatePickerProps][antd-date-picker]（同时支持[日期控件公共属性][antd-date-common]）。

日期选择器接受 Dayjs、日期字符串、数值时间戳和 Date 输入，未配置 `valueFormat` 时内部转为 Dayjs；配置后保留原生字符串协议。输出遵循原生组件协议，提交格式转换由 ProForm 的 dateFormatter/transform 控制。格式、禁用日期、面板等属性通过 `fieldProps` 传入。

### ProFormDateTimePicker

**fieldProps 属性：** [DatePickerProps][antd-date-picker]。

日期时间选择器使用相同日期值协议；默认 `showTime=true`，`fieldProps.showTime` 优先于顶层 `showTime`。

| Prop       | 类型                          | 默认值 | 说明                                   |
| ---------- | ----------------------------- | ------ | -------------------------------------- |
| `showTime` | `DatePickerProps['showTime']` | `true` | 是否显示时间选择，可传原生时间配置对象 |

### ProFormDateRangePicker

**fieldProps 属性：** [RangePickerProps][antd-date-range]（同时支持[日期控件公共属性][antd-date-common]）。

日期区间选择器使用相同日期值协议，支持区间数组或 `null`；清空时不会合成空字符串。范围预设、禁用日期等通过 `fieldProps` 传入。

### ProFormDateTimeRangePicker

**fieldProps 属性：** [RangePickerProps][antd-date-range]。

日期时间区间选择器，值遵循日期区间协议；配置 `valueFormat` 时使用原生字符串协议。

| Prop       | 类型                           | 默认值 | 说明                                   |
| ---------- | ------------------------------ | ------ | -------------------------------------- |
| `showTime` | `RangePickerProps['showTime']` | `true` | 是否显示时间选择，可传原生时间配置对象 |

### ProFormSelect

**fieldProps 属性：** [SelectProps][antd-select]。

选择字段，支持 `options`、`valueEnum`、`request`、`params` 与 `requestError`；`mode="multiple"` / `"tags"` 等能力通过 `fieldProps` 使用。ref 暴露 `refresh()`。

### ProFormTreeSelect

**fieldProps 属性：** [TreeSelectProps][antd-tree-select]。

树选择字段，共用选项请求协议。标准 option 会映射为带 `title`、`label`、`value`、`disabled`、`children` 的树节点；调用者提供的 `treeData`、`fieldNames` 等仍可通过 `fieldProps` 使用。

### ProFormCheckbox

**fieldProps 属性：** 单选框使用 [CheckboxProps][antd-checkbox]，选项组使用 [CheckboxGroupProps][antd-checkbox-group]。

没有选项来源时渲染单 Checkbox，内部 `checked` 自动桥接到 `v-model`；存在 `options`、`valueEnum`、`request` 或 `fieldProps.options` 时渲染 CheckboxGroup。`layout` 默认为 `horizontal`，也可设为 `vertical`。

| Prop     | 类型                         | 默认值         | 说明                                                                      |
| -------- | ---------------------------- | -------------- | ------------------------------------------------------------------------- |
| `layout` | `'horizontal' \| 'vertical'` | `'horizontal'` | 选项组排列方向，`fieldProps.layout` 优先；同样适用于 ProFormCheckboxGroup |

### ProFormRadioGroup

**fieldProps 属性：** [RadioGroupProps][antd-radio-group]。

单选组，共用选项请求协议；`radioType="button"` 使用按钮样式，`layout="vertical"` 垂直排列，`fieldProps` 同义配置优先。模板可用 `ProFormRadioGroup` 或 `ProFormRadio.Group`。

| Prop        | 类型                         | 默认值         | 说明                                                  |
| ----------- | ---------------------------- | -------------- | ----------------------------------------------------- |
| `radioType` | `'button' \| 'radio'`        | `'radio'`      | 选项外观；原生 `fieldProps.optionType` 可直接指定样式 |
| `layout`    | `'horizontal' \| 'vertical'` | `'horizontal'` | 选项排列方向                                          |

### ProFormSlider

**fieldProps 属性：** [SliderProps][antd-slider]。

滑块字段，`modelValue` 为 `number | number[] | undefined`。`range`、`marks`、`min`、`max`、`step`、`tooltip` 均通过 `fieldProps` 透传。

### ProFormSwitch

**fieldProps 属性：** [SwitchProps][antd-switch]。

开关字段对外使用 `v-model`，内部使用 `checked / update:checked`。`checkedValue` 与 `unCheckedValue` 原样保留，不会强制把自定义值转换为 Boolean。

### ProFormUploadButton

**fieldProps 属性：** [UploadProps][antd-upload]；触发按钮使用 [ButtonProps][antd-button]，图片预览使用 [ImageProps][antd-image]。

按钮式上传入口，`modelValue` 为 `UploadFile[]`，内部桥接 `fileList`。默认槽可替换按钮内容；`action`、`customRequest`、`beforeUpload`、`headers`、`data`、`multiple`、`accept`、`maxCount`、`itemRender` 等通过 `fieldProps` 传入。

组件库不提供上传后端。没有 `action` 或 `customRequest` 时，内部 `beforeUpload` 返回 `false` 以阻止向未知地址发送，但仍执行使用者提供的 `beforeUpload`。

| Prop          | 类型                      | 默认值           | 说明                                                       |
| ------------- | ------------------------- | ---------------- | ---------------------------------------------------------- |
| `icon`        | `VNodeChild`              | `UploadOutlined` | 上传入口图标                                               |
| `title`       | `VNodeChild`              | intl 文案        | 上传入口文案                                               |
| `max`         | `number`                  | 不限制           | 最大文件数，达到后隐藏上传入口；`fieldProps.maxCount` 优先 |
| `buttonProps` | `Partial<ButtonProps>`    | —                | 仅传给上传触发按钮                                         |
| `action`      | `UploadProps['action']`   | —                | 上传地址的顶层便利入口，`fieldProps.action` 优先           |
| `accept`      | `UploadProps['accept']`   | —                | 接受的文件类型，`fieldProps.accept` 优先                   |
| `listType`    | `UploadProps['listType']` | `'picture'`      | 文件列表样式，`fieldProps.listType` 优先                   |
| `imageProps`  | `Omit<ImageProps, 'src'>` | —                | 内置图片预览配置                                           |

### ProFormUploadDragger

**fieldProps 属性：** [UploadDraggerProps / UploadProps][antd-upload]。

拖拽式上传入口，与 UploadButton 使用同一个 `UploadFile[]`、`fileList` 和无后端协议。默认槽替换整个拖拽区，`drop` 事件原样转发。

| Prop          | 类型                    | 默认值          | 说明                                                       |
| ------------- | ----------------------- | --------------- | ---------------------------------------------------------- |
| `icon`        | `VNodeChild`            | `InboxOutlined` | 拖拽区图标                                                 |
| `title`       | `VNodeChild`            | intl 文案       | 拖拽区标题                                                 |
| `description` | `VNodeChild`            | intl 文案       | 拖拽区说明                                                 |
| `max`         | `number`                | 不限制          | 最大文件数，达到后隐藏上传入口；`fieldProps.maxCount` 优先 |
| `action`      | `UploadProps['action']` | —               | 上传地址，`fieldProps.action` 优先                         |
| `accept`      | `UploadProps['accept']` | —               | 接受的文件类型，`fieldProps.accept` 优先                   |

### ProFormMoney

**fieldProps 属性：** [InputNumberProps][antd-input-number]，另支持下表中的金额格式配置。

金额字段，`modelValue` 为 `number | string | null`。默认两位小数并读取 intl 的 locale；`locale`、`customSymbol`、`moneySymbol`、`numberFormatOptions` 控制分隔符、符号和精度。`moneySymbol=false` 关闭符号，`prefix=false` 关闭默认前缀；同义 `fieldProps` 配置优先。原始受控数值不被格式化污染，原生 `formatter`、`parser`、`stringMode` 仍可定制。

| Prop                  | 类型                                                                        | 默认值         | 说明                                                      |
| --------------------- | --------------------------------------------------------------------------- | -------------- | --------------------------------------------------------- |
| `locale`              | `string`                                                                    | intl 的 locale | 金额格式地区；不支持的 locale 回退 `zh-CN`                |
| `moneySymbol`         | `boolean`                                                                   | `true`         | 是否显示货币符号                                          |
| `customSymbol`        | `string`                                                                    | 由 locale 决定 | 自定义货币符号                                            |
| `prefix`              | `InputNumberProps['prefix'] \| false`                                       | 由 locale 决定 | 自定义前缀；传 `false` 关闭默认前缀                       |
| `numberFormatOptions` | `Intl.NumberFormatOptions`                                                  | 默认两位小数   | 传给 `Intl.NumberFormat`，可配置 currency、小数位与分组等 |
| `numberPopoverRender` | `boolean \| ((props: InputNumberProps, defaultText: string) => VNodeChild)` | —              | 类型兼容项；当前 ProFormMoney 不渲染数字提示浮层          |

### ProFormSegmented

**fieldProps 属性：** [SegmentedProps][antd-segmented]。

分段选择字段，共用选项请求协议，值为 `string | number`。没有选项来源时向基础控件传入空数组；选项的 `disabled` 与其他扩展字段会被保留。

## 与上层组件共用字段核心

独立字段与上层组件使用同一注册表和 FieldControl：

- ProTable 搜索项使用表单项模式，可编辑单元格使用裸控件模式。
- SchemaForm 保留自己的 FormItem、嵌套路径、动态插槽和组合字段，仅默认控件分支复用裸控件核心。
- EditableProTable 通过 ProTable 间接复用，不创建第三套字段映射。

ProField 的 42 个内置类型和三种模式见 [ProField](./pro-field.md)。Captcha、UploadButton、UploadDragger 只作为独立组件提供，不映射为 `valueType`，也不内置后端。

## 增强字段与组合成员

<ClientOnly><ProFormFieldsExtendedDemo /></ClientOnly>

<<< ../examples/ProFormFieldsExtendedDemo.vue

下列组件同样支持公共 Props；有选项能力的字段还支持选项与请求属性。组件专属的原生配置见最后一列。

| 字段                                                                                                                          | 值与行为                                                                                                            | fieldProps 属性                                                                   |
| ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `ProFormCascader`                                                                                                             | 级联路径数组；支持 options/request、清空与只读标签                                                                  | [CascaderProps][antd-cascader]                                                    |
| `ProFormColorPicker`                                                                                                          | 原生颜色值；只读使用原生颜色触发器并保持弹层关闭                                                                    | [ColorPickerProps][antd-color-picker]                                             |
| `ProFormRate`                                                                                                                 | 原生评分数值；只读禁用评分展示                                                                                      | [RateProps][antd-rate]                                                            |
| `ProFormDigitRange`                                                                                                           | `[number \| null, number \| null]`；两个数字输入共享 fieldProps，单端清空保留另一端；placeholder 可分别指定两端文案 | [InputNumberProps][antd-input-number]                                             |
| `ProFormTimePicker` / `ProFormTimePicker.RangePicker` / `ProFormTimeRangePicker`                                              | 原生时间及区间协议；字符串输入转换与 valueFormat 同日期字段                                                         | [TimePickerProps][antd-time-picker] / [时间 RangePicker 属性][antd-time-range]    |
| `ProFormDateWeekPicker` / `ProFormDateMonthPicker` / `ProFormDateQuarterPicker` / `ProFormDateYearPicker`                     | 日期值协议，分别默认 `picker='week' / 'month' / 'quarter' / 'year'`，fieldProps.picker 可覆盖                       | [DatePickerProps][antd-date-picker]                                               |
| `ProFormDateWeekRangePicker` / `ProFormDateMonthRangePicker` / `ProFormDateQuarterRangePicker` / `ProFormDateYearRangePicker` | 日期区间协议，分别默认对应 picker，fieldProps.picker 可覆盖                                                         | [RangePickerProps][antd-date-range]                                               |
| `ProFormRadio`                                                                                                                | 单 Radio 使用布尔 v-model；`ProFormRadio.Group` 为上方的 ProFormRadioGroup，`.Button` 是原生 RadioButton            | [RadioProps / RadioButton 属性][antd-radio] / [RadioGroupProps][antd-radio-group] |
| `ProFormCheckboxGroup` / `ProFormCheckbox.Group`                                                                              | 始终渲染 CheckboxGroup，支持 `layout='horizontal' / 'vertical'`，默认 horizontal                                    | [CheckboxGroupProps][antd-checkbox-group]                                         |
| `ProFormSearchSelect` / `ProFormSelect.SearchSelect`                                                                          | 默认 multiple、labelInValue、showSearch；同义 fieldProps 优先                                                       | [SelectProps][antd-select]                                                        |

`ProFormDigitRange` 使用紧凑数字输入组合，通过 `fieldProps.separator` / `separatorWidth` 设置分隔符和像素宽度，默认分别为 `~` / `30`；`fieldProps.style` 设置组合容器样式。

### ProFormSearchSelect 专属属性

| Prop   | 类型                               | 默认值       | 说明                                      |
| ------ | ---------------------------------- | ------------ | ----------------------------------------- |
| `mode` | `'multiple' \| 'tags' \| 'single'` | `'multiple'` | `single` 切为单选；`fieldProps.mode` 优先 |

其 `fieldProps` 还默认设置 `labelInValue: true`、`showSearch: true`、`suffixIcon: null`、`autoClearSearchValue: true`、`optionLabelProp: 'label'`，可逐项覆盖。默认多选模式选中后返回带 `label` / `value` 的选中项数组；切为单选时返回单项。

[antd-form-item]: https://www.antdv-next.com/components/form-cn#form-item-props
[antd-input]: https://www.antdv-next.com/components/input-cn#input-props
[antd-input-password]: https://www.antdv-next.com/components/input-cn#input-password-props
[antd-textarea]: https://www.antdv-next.com/components/input-cn#input-textarea-props
[antd-input-number]: https://www.antdv-next.com/components/input-number-cn#props
[antd-date-common]: https://www.antdv-next.com/components/date-picker-cn#common-api
[antd-date-picker]: https://www.antdv-next.com/components/date-picker-cn#datepicker
[antd-date-range]: https://www.antdv-next.com/components/date-picker-cn#rangepicker
[antd-time-picker]: https://www.antdv-next.com/components/time-picker-cn#timepicker
[antd-time-range]: https://www.antdv-next.com/components/time-picker-cn#rangepicker
[antd-select]: https://www.antdv-next.com/components/select-cn#property
[antd-tree-select]: https://www.antdv-next.com/components/tree-select-cn#props
[antd-checkbox]: https://www.antdv-next.com/components/checkbox-cn#checkbox-props
[antd-checkbox-group]: https://www.antdv-next.com/components/checkbox-cn#checkboxgroup-props
[antd-radio]: https://www.antdv-next.com/components/radio-cn#radio-props
[antd-radio-group]: https://www.antdv-next.com/components/radio-cn#radiogroup-props
[antd-slider]: https://www.antdv-next.com/components/slider-cn#props
[antd-switch]: https://www.antdv-next.com/components/switch-cn#props
[antd-upload]: https://www.antdv-next.com/components/upload-cn#props
[antd-segmented]: https://www.antdv-next.com/components/segmented-cn#props
[antd-cascader]: https://www.antdv-next.com/components/cascader-cn#props
[antd-color-picker]: https://www.antdv-next.com/components/color-picker-cn#props
[antd-rate]: https://www.antdv-next.com/components/rate-cn#props
[antd-button]: https://www.antdv-next.com/components/button-cn#props
[antd-image]: https://www.antdv-next.com/components/image-cn#props
