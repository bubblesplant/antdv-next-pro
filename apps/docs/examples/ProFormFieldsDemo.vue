<script setup lang="ts">
import type { UploadFile } from 'antdv-next'

import { Form } from 'antdv-next'
import { computed, reactive, ref } from 'vue'
import { useData } from 'vitepress'
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
  type ProFormDateRangeValue,
  type ProFormDateValue,
} from '@bubblesjs/antdv-next-pro'

interface DemoModel {
  text?: string
  digit?: number | string | null
  password?: string
  textarea?: string
  captcha?: string
  date?: ProFormDateValue
  dateTime?: ProFormDateValue
  dateRange?: ProFormDateRangeValue
  dateTimeRange?: ProFormDateRangeValue
  select?: string
  treeSelect?: string
  checkbox?: string[]
  radio?: string
  slider?: number | number[]
  switch?: boolean
  uploadButton: UploadFile[]
  uploadDragger: UploadFile[]
  money?: number | string | null
  segmented?: string | number
  bareText?: string
  bareChecked?: boolean
}

const { lang } = useData()
const english = computed(() => lang.value.startsWith('en'))
const readonly = ref(false)
const captchaStatus = ref('')
const model = reactive<DemoModel>({
  text: 'Antdv Next Pro',
  digit: 2,
  password: 'vue-vapor',
  textarea: 'One field core for forms, tables, and editable cells.',
  select: 'vue',
  treeSelect: 'pro-form-fields',
  checkbox: ['docs', 'tests'],
  radio: 'named',
  slider: 68,
  switch: true,
  uploadButton: [],
  uploadDragger: [],
  money: 128,
  segmented: 'preview',
  bareText: 'fieldMode="field"',
  bareChecked: true,
})

const tr = (zh: string, en: string) => (english.value ? en : zh)
const selectOptions = computed(() => [
  { label: 'Vue 3', value: 'vue' },
  { label: 'Antdv Next', value: 'antdv-next' },
])
const treeOptions = computed(() => [
  {
    label: tr('字段体系', 'Field system'),
    value: 'fields',
    children: [
      { label: 'ProFormFields', value: 'pro-form-fields' },
      { label: 'SchemaForm', value: 'schema-form' },
    ],
  },
])
const checkboxOptions = computed(() => [
  { label: tr('文档', 'Docs'), value: 'docs' },
  { label: tr('测试', 'Tests'), value: 'tests' },
  { label: tr('构建', 'Build'), value: 'build' },
])
const radioOptions = computed(() => [
  { label: tr('具名导入', 'Named import'), value: 'named' },
  { label: tr('全局注册', 'Global registration'), value: 'global' },
])
const segmentedOptions = computed(() => [
  { label: tr('编辑', 'Edit'), value: 'edit' },
  { label: tr('预览', 'Preview'), value: 'preview' },
])

async function requestSelectOptions() {
  await Promise.resolve()
  return selectOptions.value
}

async function getCaptcha() {
  await Promise.resolve()
  captchaStatus.value = tr('发送逻辑由当前示例提供', 'The demo supplied the send callback')
}
</script>

<template>
  <div class="demo-frame pro-form-fields-demo vp-raw">
    <div class="demo-heading">
      <div>
        <p class="demo-label">LIVE · 19 PRO FORM FIELDS</p>
        <p class="demo-note">
          {{
            tr(
              '所有字段共享相同的表单项、裸控件、只读与选项协议。',
              'Every field shares the same form-item, bare-control, readonly, and option protocols.',
            )
          }}
        </p>
      </div>
      <button type="button" @click="readonly = !readonly">
        {{ readonly ? tr('返回编辑', 'Edit values') : tr('查看只读', 'Readonly view') }}
      </button>
    </div>

    <Form :model="model" layout="vertical">
      <div class="field-grid">
        <ProFormText
          v-model="model.text"
          :label="tr('文本', 'Text')"
          :readonly="readonly"
          :field-props="{ allowClear: true }"
        >
          <template #extra>
            {{ tr('默认包含 FormItem', 'FormItem is included by default') }}
          </template>
        </ProFormText>

        <ProFormDigit v-model="model.digit" :label="tr('数字', 'Digit')" :readonly="readonly" />

        <ProFormTextPassword
          v-model="model.password"
          :label="tr('密码', 'Password')"
          :readonly="readonly"
        />

        <ProFormTextArea
          v-model="model.textarea"
          class="span-2"
          :label="tr('多行文本', 'Text area')"
          :readonly="readonly"
          :field-props="{ rows: 3 }"
        />

        <ProFormCaptcha
          v-model="model.captcha"
          class="span-2"
          :label="tr('验证码', 'Captcha')"
          :readonly="readonly"
          :on-get-captcha="getCaptcha"
          :count-down="5"
          :captcha-text="tr('发送演示验证码', 'Send demo code')"
        />

        <ProFormDatePicker v-model="model.date" :label="tr('日期', 'Date')" :readonly="readonly" />

        <ProFormDateTimePicker
          v-model="model.dateTime"
          :label="tr('日期时间', 'Date time')"
          :readonly="readonly"
        />

        <ProFormDateRangePicker
          v-model="model.dateRange"
          :label="tr('日期区间', 'Date range')"
          :readonly="readonly"
        />

        <ProFormDateTimeRangePicker
          v-model="model.dateTimeRange"
          :label="tr('日期时间区间', 'Date-time range')"
          :readonly="readonly"
        />

        <ProFormSelect
          v-model="model.select"
          :label="tr('异步选择', 'Async select')"
          :readonly="readonly"
          :request="requestSelectOptions"
        />

        <ProFormTreeSelect
          v-model="model.treeSelect"
          :label="tr('树选择', 'Tree select')"
          :readonly="readonly"
          :options="treeOptions"
        />

        <ProFormCheckbox
          v-model="model.checkbox"
          :label="tr('复选组', 'Checkbox group')"
          :readonly="readonly"
          :options="checkboxOptions"
          layout="vertical"
        />

        <ProFormRadioGroup
          v-model="model.radio"
          :label="tr('单选组', 'Radio group')"
          :readonly="readonly"
          :options="radioOptions"
        />

        <ProFormSlider
          v-model="model.slider"
          :label="tr('滑块', 'Slider')"
          :readonly="readonly"
          :field-props="{ min: 0, max: 100 }"
        />

        <ProFormSwitch v-model="model.switch" :label="tr('开关', 'Switch')" :readonly="readonly" />

        <ProFormMoney v-model="model.money" :label="tr('金额', 'Money')" :readonly="readonly" />

        <ProFormSegmented
          v-model="model.segmented"
          :label="tr('分段选择', 'Segmented')"
          :readonly="readonly"
          :options="segmentedOptions"
        />

        <ProFormUploadButton
          v-model="model.uploadButton"
          :label="tr('按钮上传', 'Upload button')"
          :readonly="readonly"
          :field-props="{ maxCount: 1 }"
        />

        <ProFormUploadDragger
          v-model="model.uploadDragger"
          class="span-2"
          :label="tr('拖拽上传', 'Upload dragger')"
          :readonly="readonly"
          :field-props="{ multiple: true }"
        />
      </div>
    </Form>

    <div class="bare-fields">
      <strong>{{ tr('裸控件模式', 'Bare-control mode') }}</strong>
      <ProFormText
        v-model="model.bareText"
        field-mode="field"
        :readonly="readonly"
        :placeholder="tr('不会生成 FormItem', 'No FormItem is rendered')"
      />
      <ProFormCheckbox v-model="model.bareChecked" field-mode="field" :readonly="readonly">
        {{
          tr(
            'checked / update:checked 已桥接到 v-model',
            'checked / update:checked bridged to v-model',
          )
        }}
      </ProFormCheckbox>
    </div>

    <p v-if="captchaStatus" class="demo-status">{{ captchaStatus }}</p>
  </div>
</template>

<style scoped>
.demo-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.demo-heading .demo-label,
.demo-note {
  margin: 0;
}

.demo-note {
  margin-top: 5px;
  color: var(--vp-c-text-2);
  font-size: 13px;
}

.demo-heading button {
  flex: none;
  padding: 6px 12px;
  border: 1px solid var(--bubbles-border);
  border-radius: 7px;
  background: var(--vp-c-bg);
  color: var(--vp-c-brand-1);
  cursor: pointer;
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 20px;
}

.span-2 {
  grid-column: span 2;
}

.bare-fields {
  display: grid;
  grid-template-columns: minmax(120px, 0.45fr) minmax(220px, 1fr) minmax(220px, 1fr);
  align-items: center;
  gap: 14px;
  margin-top: 4px;
  padding-top: 18px;
  border-top: 1px solid var(--bubbles-border);
}

.demo-status {
  margin: 14px 0 0;
  color: var(--vp-c-text-2);
  font-size: 12px;
}

@media (max-width: 720px) {
  .field-grid,
  .bare-fields {
    grid-template-columns: 1fr;
  }

  .span-2 {
    grid-column: auto;
  }

  .demo-heading {
    flex-direction: column;
  }
}
</style>
