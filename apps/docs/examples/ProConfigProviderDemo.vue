<script setup lang="ts">
import { ConfigProvider, Switch, theme } from 'antdv-next'
import enUS from 'antdv-next/locale/en_US'
import zhCN from 'antdv-next/locale/zh_CN'
import { computed, ref } from 'vue'
import {
  ProCard,
  ProConfigProvider,
  ProField,
  ProForm,
  ProFormText,
} from '@bubblesjs/antv-next-pro'

const english = ref(false)
const dark = ref(false)
const accent = ref(false)
const nativeTheme = computed(() => ({
  algorithm: [theme.compactAlgorithm, dark.value ? theme.darkAlgorithm : theme.defaultAlgorithm],
  token: { colorPrimary: accent.value ? '#722ed1' : '#1677ff' },
  components: { Card: { headerFontSize: 20 } },
}))
</script>

<template>
  <div style="display: flex; gap: 16px; margin-block-end: 16px; flex-wrap: wrap">
    <label>English <Switch v-model:checked="english" /></label>
    <label>Dark <Switch v-model:checked="dark" /></label>
    <label>Purple <Switch v-model:checked="accent" /></label>
  </div>
  <ConfigProvider :locale="english ? enUS : zhCN" :theme="nativeTheme" prefix-cls="demo">
    <ProConfigProvider :token="{ colorTextSecondary: '#9254de' }">
      <ProCard title="ConfigProvider → ProConfigProvider">
        <p><ProField value-type="switch" :text="true" /></p>
        <ProForm>
          <ProFormText name="title" :label="english ? 'Title' : '标题'" />
        </ProForm>
      </ProCard>
    </ProConfigProvider>
  </ConfigProvider>
</template>
