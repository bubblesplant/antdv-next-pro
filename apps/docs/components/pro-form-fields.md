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

### Props

| Prop             | 类型                                                | 默认值        | 说明                                     |
| ---------------- | --------------------------------------------------- | ------------- | ---------------------------------------- |
| `modelValue`     | 由组件决定                                          | `undefined`   | 标准 `v-model` 值                        |
| `name`           | `string \| number \| readonly (string \| number)[]` | —             | FormItem 字段名，支持嵌套路径            |
| `label`          | `VNodeChild`                                        | —             | FormItem 标签                            |
| `rules`          | Antdv Next FormItem rules                           | —             | 校验规则                                 |
| `fieldMode`      | `'form-item' \| 'field'`                            | `'form-item'` | 渲染表单项或裸控件                       |
| `fieldProps`     | 对应基础控件 Props                                  | —             | 传给 Input、Select 等基础控件            |
| `formItemProps`  | Antdv Next FormItem Props                           | —             | 只传给 FormItem                          |
| `disabled`       | `boolean`                                           | `false`       | 保持控件外观并禁止交互                   |
| `readonly`       | `boolean`                                           | `false`       | 改用统一只读展示                         |
| `emptyText`      | `VNodeChild`                                        | `'-'`         | `undefined`、`null`、空字符串的占位      |
| `readonlyRender` | `(value) => VNodeChild`                             | —             | 自定义只读输出；返回空值时回退默认格式化 |

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

当父级已经提供 FormItem，或字段位于表格单元格、自定义网格中时使用裸控件模式。此时不会创建 FormItem，`name`、`label`、`rules`、`formItemProps` 也不参与渲染。

```vue
<ProFormText v-model="keyword" field-mode="field" placeholder="只渲染 Input" />
```

### 属性优先级与 attrs

同名普通属性按以下顺序取值：

1. 控件属性优先使用 `fieldProps` 中的显式配置。
2. 组件顶层便利控件属性。
3. 组件默认值。

因此 `fieldProps.disabled`、`fieldProps.placeholder`、`fieldProps.min` 等优先于顶层同义配置。FormItem 的顶层 `name` / `label` / `rules` 优先于 `formItemProps`。内部受控值与更新监听器始终由字段核心写入，使用者回调会被组合，不会覆盖 `v-model` 更新。

`fieldProps.class/style` 作用于基础控件，`formItemProps.class/style` 作用于 FormItem。普通 `class`、`style` 和表单项属性落到 FormItem；`placeholder`、`max`、`data-*`、`aria-*` 等控件属性进入基础控件。`field` 模式下 class/style 也进入控件。

`classes` / `styles` 支持对象或 `({ props }) => ({ root: ... })`；`root` 定制当前模式的根，`control` 定制基础控件。UploadButton 还提供 `button`，UploadDragger 提供 `icon`、`title`、`description`。旧 `classNames` 补充 classes 未指定的部位；同部位以 classes 为准。原生 Upload 将 class 放在包装层、style 放在上传触发区，`field` 模式下也保留该原生行为。

`width` 接受像素数字及 xs/sm/md/lg/xl（104/216/328/440/552px）。在 ProForm 内，`name` 连接表单 store，`convertValue` 处理输入，`transform` 处理格式化提交；`proFieldProps.mode='read'` 可指定只读。

### `v-model` 桥接

所有公开组件对外都使用 `modelValue / update:modelValue`，字段核心会适配基础控件的不同协议：

| 组件类型                                                   | 基础控件协议                 | ProFormFields 对外协议 |
| ---------------------------------------------------------- | ---------------------------- | ---------------------- |
| Input、InputNumber、日期、Select、Radio、Slider、Segmented | `value / update:value`       | `v-model`              |
| 单 Checkbox、Switch                                        | `checked / update:checked`   | `v-model`              |
| Upload、UploadDragger                                      | `fileList / update:fileList` | `v-model`              |

`fieldProps['onUpdate:value']`、`fieldProps['onUpdate:checked']` 或 `fieldProps['onUpdate:fileList']` 可与组件 `v-model` 同时使用，每次更新各调用一次。

### 事件

| 事件                | 适用组件                                               | 说明                                                 |
| ------------------- | ------------------------------------------------------ | ---------------------------------------------------- |
| `update:modelValue` | 全部                                                   | 规范化后的字段值                                     |
| `change`            | 全部                                                   | 原样转发基础控件的 change 参数                       |
| `requestError`      | Select、TreeSelect、Checkbox 组、RadioGroup、Segmented | 选项请求失败；已有选项不会被清空                     |
| `captchaError`      | Captcha                                                | 回调 reject 或返回 `false`；`false` 原样作为取消结果 |
| `drop`              | 两个 Upload                                            | 原样转发拖拽事件                                     |

底层事件顺序为：内部模型更新 → `fieldProps` 处理器 → 包装组件 emit。

### 插槽与实例方法

`label`、`extra`、`help`、`tooltip` 是 FormItem 插槽；其他具名插槽和默认插槽会转发给基础控件。`fieldMode="field"` 时不渲染 FormItem 专属插槽。

- Captcha 增加 `captcha` 插槽，参数为 `{ seconds }`。
- UploadButton 的默认插槽替换上传按钮内容。
- UploadDragger 的默认插槽替换拖拽区内容。
- 选项类组件通过 ref 暴露 `refresh(): Promise<void>`。
- Captcha 通过 ref 暴露 `resetCountdown(): void`。
- Captcha 同时提供 `focus()`、`startTiming()`、`endTiming()`；旧 resetCountdown 为停止倒计时的兼容入口。

## 选项、请求与只读

### `options`、`valueEnum`、`request`

Select、TreeSelect、Checkbox 组、RadioGroup 与 Segmented 使用相同协议：

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

字段都是受控组件：父级重置并传入新的 `modelValue` 后会立即更新。选项缓存不会因值重置而清空；Captcha 的倒计时需调用 `resetCountdown()` 显式取消。

## 19 个组件

以下各项都可以在[完整字段示例](#完整字段示例)中直接操作。

### ProFormText

单行文本字段，`modelValue` 为 `string | undefined`，基础控件是 Input。无额外 Pro 默认值；`allowClear`、`prefix`、`suffix`、`maxlength` 等通过 `fieldProps` 传入。

### ProFormDigit

数值字段，`modelValue` 为 `number | string | null`。默认 `min=0`，不指定精度；`fieldProps.min` / `fieldProps.precision` 优先于顶层同义配置，传 `false` 可不向 InputNumber 下发对应限制。顶层 `max` 也会进入控件。

```vue
<ProFormDigit v-model="count" :min="false" :precision="0" />
```

### ProFormTextPassword

密码输入，`modelValue` 为 `string | undefined`，基础控件是 InputPassword。只读非空值固定显示 `••••••`。可使用模板友好名称 `ProFormTextPassword`，也可在脚本或模板中使用 `ProFormText.Password`。

### ProFormTextArea

多行文本，`modelValue` 为 `string | undefined`。`rows`、`autoSize`、`maxlength` 等 TextArea 属性通过 `fieldProps` 传入。

### ProFormCaptcha

验证码输入由 Input 与发送按钮组成。`onGetCaptcha(phone)` 必填；`countDown` 默认 60 秒，按钮文案读取 intl。指定 `phoneName` 时先校验 ProForm 对应字段，再取手机号传入回调；失败不发送。回调 resolve 且结果不为 `false` 时开始倒计时，reject 或 `false` 会恢复按钮并触发 `captchaError`。

`captchaTextRender(timing, count)` 定制按钮文案，`captchaProps` 配置按钮，`onTiming(count)` 接收倒计时。业务侧提供网络请求；loading、倒计时、disabled、readonly 任一成立时阻止重复点击，卸载会清理计时器。

### ProFormDatePicker

日期选择器接受 Dayjs、日期字符串、数值时间戳和 Date 输入，未配置 `valueFormat` 时内部转为 Dayjs；配置后保留原生字符串协议。输出遵循原生组件协议，提交格式转换由 ProForm 的 dateFormatter/transform 控制。格式、禁用日期、面板等属性通过 `fieldProps` 传入。

### ProFormDateTimePicker

日期时间选择器使用相同日期值协议；默认 `showTime=true`，`fieldProps.showTime` 优先于顶层 `showTime`。

### ProFormDateRangePicker

日期区间选择器使用相同日期值协议，支持区间数组或 `null`；清空时不会合成空字符串。范围预设、禁用日期等通过 `fieldProps` 传入。

### ProFormDateTimeRangePicker

日期时间区间选择器，值保持 Dayjs 区间，默认 `showTime=true`。

### ProFormSelect

选择字段，支持 `options`、`valueEnum`、`request`、`params` 与 `requestError`；`mode="multiple"` / `"tags"` 等能力通过 `fieldProps` 使用。ref 暴露 `refresh()`。

### ProFormTreeSelect

树选择字段，共用选项请求协议。标准 option 会映射为带 `title`、`label`、`value`、`disabled`、`children` 的树节点；调用者提供的 `treeData`、`fieldNames` 等仍可通过 `fieldProps` 使用。

### ProFormCheckbox

没有选项来源时渲染单 Checkbox，内部 `checked` 自动桥接到 `v-model`；存在 `options`、`valueEnum`、`request` 或 `fieldProps.options` 时渲染 CheckboxGroup。`layout` 默认为 `horizontal`，也可设为 `vertical`。

### ProFormRadioGroup

单选组，共用选项请求协议；`radioType="button"` 使用按钮样式，`layout="vertical"` 垂直排列，`fieldProps` 同义配置优先。模板可用 `ProFormRadioGroup` 或 `ProFormRadio.Group`。

### ProFormSlider

滑块字段，`modelValue` 为 `number | number[] | undefined`。`range`、`marks`、`min`、`max`、`step`、`tooltip` 均通过 `fieldProps` 透传。

### ProFormSwitch

开关字段对外使用 `v-model`，内部使用 `checked / update:checked`。`checkedValue` 与 `unCheckedValue` 原样保留，不会强制把自定义值转换为 Boolean。

### ProFormUploadButton

按钮式上传入口，`modelValue` 为 `UploadFile[]`，内部桥接 `fileList`。默认槽可替换按钮内容；`action`、`customRequest`、`beforeUpload`、`headers`、`data`、`multiple`、`accept`、`maxCount`、`itemRender` 等通过 `fieldProps` 传入。

组件库不提供上传后端。没有 `action` 或 `customRequest` 时，内部 `beforeUpload` 返回 `false` 以阻止向未知地址发送，但仍执行使用者提供的 `beforeUpload`。

### ProFormUploadDragger

拖拽式上传入口，与 UploadButton 使用同一个 `UploadFile[]`、`fileList` 和无后端协议。默认槽替换整个拖拽区，`drop` 事件原样转发。

### ProFormMoney

金额字段，`modelValue` 为 `number | string | null`。默认两位小数并读取 intl 的 locale；`locale`、`customSymbol`、`moneySymbol`、`numberFormatOptions` 控制分隔符、符号和精度。`prefix=false` 或 `moneySymbol=false` 关闭符号；同义 `fieldProps` 配置优先。原始受控数值不被格式化污染，原生 `formatter`、`parser`、`stringMode` 仍可定制。

### ProFormSegmented

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

| 字段                                          | 值与行为                                                                                |
| --------------------------------------------- | --------------------------------------------------------------------------------------- |
| ProFormCascader                               | 级联路径数组；支持 options/request、清空与只读标签                                      |
| ProFormColorPicker                            | 原生颜色值；只读使用原生颜色触发器并保持弹层关闭                                        |
| ProFormRate                                   | 原生评分数值；只读禁用评分展示                                                          |
| ProFormDigitRange                             | `[number \| null, number \| null]`；两个独立数字输入，单端清空保留另一端                |
| ProFormTimePicker / ProFormTimeRangePicker    | 原生时间及区间协议；字符串输入转换与 valueFormat 同日期字段                             |
| ProFormDateWeek/Month/Quarter/YearPicker      | 日期值协议，默认设置对应 picker                                                         |
| ProFormDateWeek/Month/Quarter/YearRangePicker | 日期区间协议，默认设置对应 picker                                                       |
| ProFormCheckboxGroup                          | 始终渲染 CheckboxGroup，`ProFormCheckbox.Group` 指向同一组件                            |
| ProFormSearchSelect                           | 默认 multiple、labelInValue、showSearch；`mode="single"` 切为单选，同义 fieldProps 优先 |
