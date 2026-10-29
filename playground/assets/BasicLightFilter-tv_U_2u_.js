var e=`<script setup lang="ts">
import { ref } from 'vue'
import { LightFilter, ProFormSelect, ProFormText } from '@bubblesjs/antdv-next-pro'

const model = ref<Record<string, unknown>>({})
const submitted = ref('')
const count = ref(0)

function search(values: Record<string, unknown>) {
  submitted.value = JSON.stringify(values, null, 2)
  count.value++
  return true
}
<\/script>

<template>
  <div>
    <LightFilter v-model="model" :on-finish="search">
      <ProFormText
        name="keyword"
        label="项目名称"
        :field-props="{ placeholder: '输入后点击确认' }"
      />
      <ProFormSelect
        name="status"
        label="项目状态"
        :options="[
          { label: '进行中', value: 'active' },
          { label: '已完成', value: 'done' },
        ]"
      />
      <ProFormText
        name="owner"
        label="负责人"
        secondary
        :field-props="{ placeholder: '在更多筛选中填写' }"
      />
    </LightFilter>
    <div class="filter-result" aria-live="polite">
      <p>已查询 {{ count }} 次 · 确认应用条件，关闭弹层取消本次编辑，清除后重新查询。</p>
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
`;export{e as default};