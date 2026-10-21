<script setup lang="ts">
import { Input, Select } from 'antdv-next'
import { h, ref } from 'vue'
import {
  FieldMoney,
  ProConfigProvider,
  ProField,
  type ProValueTypeMap,
} from '@bubblesjs/antv-next-pro'

const mode = ref<'read' | 'edit' | 'update'>('read')
const title = ref('Hello Vue')
const amount = ref(1234.5)
const custom = ref('ABC')
const valueTypeMap: ProValueTypeMap = {
  uppercase: {
    render: (text) => String(text ?? '').toUpperCase(),
    formItemRender: (text, context) =>
      h(Input, {
        value: String(text ?? ''),
        'onUpdate:value': (value) => context.onChange(value),
      }),
  },
}
</script>

<template>
  <ProConfigProvider :value-type-map="valueTypeMap">
    <Select
      v-model:value="mode"
      :options="['read', 'edit', 'update'].map((value) => ({ label: value, value }))"
      style="width: 140px; margin-block-end: 16px"
    />
    <div style="display: grid; gap: 16px">
      <ProField v-model="title" value-type="text" :mode="mode" />
      <FieldMoney
        v-model="amount"
        locale="de-DE"
        custom-symbol="€"
        :mode="mode"
        :number-format-options="{
          currency: 'EUR',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }"
      />
      <ProField v-model="custom" value-type="uppercase" :mode="mode" />
      <ProField
        :text="false"
        :value-enum="new Map([[false, { text: 'Disabled', status: 'Danger' }]])"
      />
    </div>
  </ProConfigProvider>
</template>
