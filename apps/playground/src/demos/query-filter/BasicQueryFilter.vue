<script setup lang="ts">
import { ref } from 'vue'
import { ProFormSelect, ProFormText, QueryFilter } from '@bubblesjs/antdv-next-pro'

const initialValues = { status: 'active' }
const model = ref<Record<string, unknown>>({ ...initialValues })
const collapsed = ref(true)
const submitted = ref('')
const count = ref(0)

function search(values: Record<string, unknown>) {
  submitted.value = JSON.stringify(values, null, 2)
  count.value++
  return true
}
</script>

<template>
  <div>
    <QueryFilter
      v-model="model"
      v-model:collapsed="collapsed"
      :initial-values="initialValues"
      :span="8"
      :label-width="80"
      :on-finish="search"
      @reset="submitted = ''"
    >
      <ProFormText name="keyword" label="项目名称" :field-props="{ placeholder: '请输入关键词' }" />
      <ProFormSelect
        name="status"
        label="项目状态"
        :options="[
          { label: '进行中', value: 'active' },
          { label: '已完成', value: 'done' },
        ]"
      />
      <ProFormText name="owner" label="负责人" :field-props="{ placeholder: '展开后填写负责人' }" />
      <ProFormSelect
        name="priority"
        label="优先级"
        :options="[
          { label: '普通', value: 'normal' },
          { label: '紧急', value: 'urgent' },
        ]"
      />
    </QueryFilter>
    <div class="filter-result" aria-live="polite">
      <p>查询区{{ collapsed ? '已收起' : '已展开' }} · 已查询 {{ count }} 次</p>
      <span>{{ submitted ? '最近一次查询参数' : '当前表单值' }}</span>
      <pre>{{ submitted || JSON.stringify(model, null, 2) }}</pre>
    </div>
  </div>
</template>

<style scoped>
.filter-result {
  margin-top: 20px;
  padding: 16px;
  border: 1px solid #e8ecf1;
  border-radius: 6px;
  background: #fafbfc;
  color: #64748b;
  font-size: 12px;
}
.filter-result p {
  margin: 0 0 12px;
}
.filter-result pre {
  margin: 8px 0 0;
  overflow: auto;
  color: #334155;
}
</style>
