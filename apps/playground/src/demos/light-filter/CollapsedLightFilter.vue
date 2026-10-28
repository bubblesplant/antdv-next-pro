<script setup lang="ts">
import { ref } from 'vue'
import { Button, Space } from 'antdv-next'
import {
  LightFilter,
  ProFormSelect,
  ProFormText,
  type ProFormInstance,
} from '@bubblesjs/antdv-next-pro'

const form = ref<ProFormInstance>()
const model = ref<Record<string, unknown>>({})
const submitted = ref('')

function search(values: Record<string, unknown>) {
  submitted.value = JSON.stringify(values, null, 2)
  return true
}
</script>

<template>
  <div>
    <Space align="start" wrap>
      <LightFilter
        ref="form"
        v-model="model"
        collapse
        collapse-label="筛选项目"
        placement="bottomLeft"
        :on-finish="search"
        @reset="submitted = ''"
      >
        <ProFormText
          name="keyword"
          label="项目名称"
          :field-props="{ placeholder: '请输入项目名称' }"
        />
        <ProFormSelect
          name="status"
          label="项目状态"
          :options="[
            { label: '进行中', value: 'active' },
            { label: '已完成', value: 'done' },
          ]"
        />
        <ProFormText name="owner" label="负责人" />
      </LightFilter>
      <Button @click="form?.reset()">重置全部条件</Button>
    </Space>
    <pre class="filter-result" aria-live="polite">{{
      submitted || JSON.stringify(model, null, 2)
    }}</pre>
  </div>
</template>

<style scoped>
.filter-result {
  margin-top: 20px;
  overflow: auto;
  padding: 16px;
  border: 1px solid #e8ecf1;
  border-radius: 6px;
  background: #fafbfc;
  color: #334155;
  font-size: 12px;
}
</style>
