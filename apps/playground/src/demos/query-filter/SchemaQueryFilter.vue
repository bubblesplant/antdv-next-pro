<script setup lang="ts">
import { ref } from 'vue'
import { Button, Space } from 'antdv-next'
import {
  QueryFilter,
  type SchemaFormColumn,
  type SchemaFormInstance,
} from '@bubblesjs/antdv-next-pro'

type Filters = Record<string, unknown> & { keyword?: string; owner?: string; status?: string }
const form = ref<SchemaFormInstance<Filters>>()
const model = ref<Partial<Filters>>({})
const submitted = ref('')
const columns: SchemaFormColumn<Filters>[] = [
  { title: '项目名称', dataIndex: 'keyword', fieldProps: { placeholder: '请输入项目名称' } },
  {
    title: '项目状态',
    dataIndex: 'status',
    valueType: 'select',
    valueEnum: { active: '进行中', done: '已完成' },
  },
  { title: '负责人', dataIndex: 'owner', fieldProps: { placeholder: '请输入负责人' } },
]

function search(values: Partial<Filters>) {
  submitted.value = JSON.stringify(values, null, 2)
  return true
}
</script>

<template>
  <div>
    <Space style="margin-bottom: 16px" wrap>
      <Button @click="form?.setFieldsValue({ keyword: '组件升级', status: 'active' })">
        填入示例条件
      </Button>
      <Button @click="form?.submit()">通过 ref 查询</Button>
      <Button @click="form?.reset()">通过 ref 重置</Button>
    </Space>
    <QueryFilter
      ref="form"
      v-model="model"
      :columns="columns"
      :default-collapsed="false"
      :on-finish="search"
      @reset="submitted = ''"
    />
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
