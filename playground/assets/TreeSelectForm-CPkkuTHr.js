var e=`<script setup lang="ts">
import { ref } from 'vue'
import { SchemaForm, type SchemaFormColumn } from '@bubblesjs/antdv-next-pro'

type Values = Record<string, unknown> & { name?: string; department?: string }
const model = ref<Partial<Values>>({ name: '官网升级' })
const submitted = ref('')
const columns: SchemaFormColumn<Values>[] = [
  {
    title: '项目名称',
    dataIndex: 'name',
    formItemProps: { rules: [{ required: true, message: '请输入项目名称' }] },
  },
  {
    title: '所属部门',
    dataIndex: 'department',
    valueType: 'treeSelect',
    fieldProps: {
      placeholder: '选择负责部门',
      allowClear: true,
      treeDefaultExpandAll: true,
      treeData: [
        {
          title: '产品研发中心',
          value: 'product',
          children: [
            { title: '前端团队', value: 'frontend' },
            { title: '后端团队', value: 'backend' },
            { title: '质量保障', value: 'qa' },
          ],
        },
        {
          title: '设计中心',
          value: 'design',
          children: [
            { title: '体验设计', value: 'experience' },
            { title: '品牌设计', value: 'brand' },
          ],
        },
      ],
    },
    formItemProps: { rules: [{ required: true, message: '请选择部门' }] },
  },
]
<\/script>

<template>
  <div style="max-width: 640px">
    <SchemaForm
      v-model="model"
      :columns="columns"
      :submitter="{ submitText: '提交', resetText: '重置' }"
      @finish="
        (values) => {
          submitted = JSON.stringify(values, null, 2)
        }
      "
    />
    <pre class="tree-result" aria-live="polite">{{
      submitted || JSON.stringify(model, null, 2)
    }}</pre>
  </div>
</template>

<style scoped>
.tree-result {
  margin: 24px 0 0;
  padding: 16px;
  overflow: auto;
  border: 1px solid #e8ecf1;
  border-radius: 6px;
  background: #fafbfc;
  color: #475569;
  font:
    12px/1.8 Consolas,
    monospace;
}
</style>
`;export{e as default};