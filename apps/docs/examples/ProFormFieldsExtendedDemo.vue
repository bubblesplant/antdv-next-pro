<script setup lang="ts">
import { Switch } from 'antdv-next'
import { ref } from 'vue'
import {
  ProForm,
  ProFormCascader,
  ProFormColorPicker,
  ProFormDateMonthRangePicker,
  ProFormDatePicker,
  ProFormDigitRange,
  ProFormRadioGroup,
  ProFormRate,
  ProFormSearchSelect,
  ProFormTimePicker,
} from '@bubblesjs/antv-next-pro'

const readonly = ref(false)
const options = [
  { label: 'Alpha', value: 'a' },
  { label: 'Beta', value: 'b' },
]
</script>

<template>
  <label>Readonly <Switch v-model:checked="readonly" /></label>
  <ProForm
    :readonly="readonly"
    :submitter="false"
    :initial-values="{ path: ['a'], color: '#1677ff', rating: 3, range: [1, 5], choice: 'a' }"
  >
    <ProFormCascader name="path" label="Cascader" :options="options" />
    <ProFormColorPicker name="color" label="Color" />
    <ProFormRate name="rating" label="Rate" />
    <ProFormDigitRange name="range" label="Digit range" />
    <ProFormRadioGroup name="choice" label="Radio buttons" radio-type="button" :options="options" />
    <ProFormDatePicker.Month name="month" label="Month" />
    <ProFormDateMonthRangePicker name="months" label="Month range" />
    <ProFormTimePicker name="time" label="Time" />
    <ProFormTimePicker.RangePicker name="times" label="Time range" />
    <ProFormSearchSelect name="search" label="Search" :options="options" />
  </ProForm>
</template>
