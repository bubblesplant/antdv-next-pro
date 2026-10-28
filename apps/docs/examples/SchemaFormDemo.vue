<script setup lang="ts">
import { ref } from 'vue'
import {
  SchemaForm,
  type SchemaFormColumn,
  type SchemaFormInstance,
} from '@bubblesjs/antdv-next-pro'

type Brief = Record<string, unknown> & {
  project?: string
  owner?: string
  channel?: 'web' | 'mobile' | 'both'
  enabled?: boolean
}

const formRef = ref<SchemaFormInstance<Brief>>()
const model = ref<Partial<Brief>>({ channel: 'both', enabled: true })
const submitted = ref('等待提交')

const columns: SchemaFormColumn<Brief>[] = [
  {
    title: '项目名称',
    dataIndex: 'project',
    valueType: 'text',
    formItemProps: { rules: [{ required: true, message: '请输入项目名称' }] },
  },
  {
    title: '负责人',
    dataIndex: 'owner',
    valueType: 'text',
    dependencies: ['channel'],
  },
  {
    title: '发布渠道',
    dataIndex: 'channel',
    valueType: 'select',
    request: async () => {
      await new Promise((resolve) => setTimeout(resolve, 120))
      return [
        { label: 'Web', value: 'web' },
        { label: '移动端', value: 'mobile' },
        { label: '双端同步', value: 'both' },
      ]
    },
  },
  { title: '启用监测', dataIndex: 'enabled', valueType: 'switch' },
]

const loadInitialValues = async () => {
  await new Promise((resolve) => setTimeout(resolve, 100))
  return { owner: '林默' }
}

const onOwnerInput = (update: (value: unknown) => void, event: Event) => {
  update((event.target as HTMLInputElement).value)
}

const submit = async () => {
  try {
    const values = await formRef.value?.submit()
    submitted.value = JSON.stringify(values)
  } catch {
    submitted.value = '校验未通过'
  }
}

const fillExample = () => {
  formRef.value?.setFieldsValue({ project: '秋季增长实验', owner: 'Ada' })
}
</script>

<template>
  <div class="demo-frame vp-raw">
    <p class="demo-label">LIVE · ASYNC OPTIONS + URL SYNC + SLOTS</p>
    <SchemaForm
      ref="formRef"
      v-model="model"
      :columns="columns"
      :request="loadInitialValues"
      :url-sync="{ key: 'schema-demo' }"
      :grid="true"
      @request-error="submitted = '异步初始值加载失败'"
    >
      <template #label-project="{ column }"> {{ column.title }} · 必填 </template>
      <template #field-owner="{ value, update, dependencies }">
        <label class="owner-field">
          <input
            :value="String(value ?? '')"
            placeholder="命名字段插槽"
            @input="onOwnerInput(update, $event)"
          />
          <small>依赖渠道：{{ dependencies?.[0] ?? '未选择' }}</small>
        </label>
      </template>
      <template #submitter>
        <div class="custom-submitter">
          <button type="button" @click="fillExample">ref 填充</button>
          <button type="button" @click="formRef?.reset()">重置</button>
          <button type="button" class="primary" @click="submit">ref 提交</button>
        </div>
      </template>
    </SchemaForm>
    <p class="submit-result"><strong>结果：</strong>{{ submitted }}</p>
  </div>
</template>

<style scoped>
.owner-field {
  display: grid;
  gap: 4px;
}

.owner-field input {
  width: 100%;
  padding: 6px 11px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font: inherit;
}

.owner-field small,
.submit-result {
  color: #64748b;
  font-size: 12px;
}

.custom-submitter {
  display: flex;
  gap: 8px;
}

.custom-submitter button {
  padding: 6px 11px;
  border: 1px solid #bfd2e7;
  border-radius: 6px;
  background: #fff;
  color: #1768d3;
  cursor: pointer;
}

.custom-submitter .primary {
  border-color: #1768d3;
  background: #1768d3;
  color: #fff;
}
</style>
