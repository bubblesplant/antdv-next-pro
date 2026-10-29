var e=`<script setup lang="ts">
import { ref } from 'vue'
import { SchemaForm, type SchemaFormColumn } from '@bubblesjs/antdv-next-pro'
type Brief = Record<string, unknown> & {
  project?: string
  owner?: string
  channel?: string
  budget?: number
  enabled?: boolean
}
const model = ref<Partial<Brief>>({ channel: 'web', budget: 30, enabled: true })
const current = ref(0)
const submitted = ref('')
const fields: SchemaFormColumn<Brief>[] = [
  {
    title: '项目名称',
    dataIndex: 'project',
    valueType: 'text',
    fieldProps: { placeholder: '例如：官网升级' },
    formItemProps: { rules: [{ required: true, message: '请输入项目名称' }] },
  },
  {
    title: '负责人',
    dataIndex: 'owner',
    valueType: 'text',
    formItemProps: { rules: [{ required: true, message: '请输入负责人' }] },
  },
  {
    title: '发布渠道',
    dataIndex: 'channel',
    valueType: 'select',
    valueEnum: { web: 'Web', mobile: '移动端', both: '双端同步' },
  },
  { title: '预算（万元）', dataIndex: 'budget', valueType: 'digit' },
  { title: '启用监测', dataIndex: 'enabled', valueType: 'switch' },
]
const columns: SchemaFormColumn<Brief>[] = [
  { title: '基本信息', valueType: 'group', columns: fields.slice(0, 2) },
  { title: '发布设置', valueType: 'group', columns: fields.slice(2) },
]
function onFinish(values: Partial<Brief>) {
  submitted.value = JSON.stringify(values, null, 2)
}
<\/script>

<template>
  <div>
    <SchemaForm
      v-model="model"
      v-model:current="current"
      :columns="columns"
      layout-type="StepsForm"
      title="创建发布计划"
      :grid="true"
      :submitter="{ submitText: '保存计划', resetText: '重置' }"
      @finish="onFinish"
    />
    <div class="form-result" aria-live="polite">
      <span>{{ submitted ? '最近一次提交' : '当前表单值' }}</span>
      <pre>{{ submitted || JSON.stringify(model, null, 2) }}</pre>
    </div>
  </div>
</template>

<style scoped>
.form-result {
  margin-top: 24px;
  padding: 16px;
  border: 1px solid #e8ecf1;
  border-radius: 6px;
  background: #fafbfc;
  color: #64748b;
  font-size: 12px;
}
.form-result pre {
  margin: 10px 0 0;
  overflow: auto;
  color: #334155;
  font:
    12px/1.8 Consolas,
    monospace;
}
</style>
`;export{e as default};