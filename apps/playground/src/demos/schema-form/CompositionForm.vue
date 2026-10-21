<script setup lang="ts">
import { ref } from 'vue'
import { Button } from 'antdv-next'
import {
  ProForm,
  ProFormDependency,
  ProFormFieldSet,
  ProFormGroup,
  ProFormList,
  ProFormSelect,
  ProFormText,
  StepsForm,
  StepForm,
} from '@bubblesjs/antv-next-pro'

const submitted = ref('')
const initialValues = {
  team: '平台组',
  fullName: ['Ada', 'Lovelace'],
  contacts: [{ name: 'Grace', channel: 'email' }],
}
async function save(values: Record<string, unknown>) {
  submitted.value = JSON.stringify(values, null, 2)
  return true
}
function splitName(value: unknown) {
  const names = Array.isArray(value) ? value : []
  return { firstName: names[0], lastName: names[1] }
}
</script>

<template>
  <div class="composition-example">
    <ProForm :initial-values="initialValues" :on-finish="save">
      <ProFormGroup title="团队信息" collapsible size="middle">
        <ProFormText name="team" label="团队" :rules="[{ required: true }]" />
        <ProFormFieldSet name="fullName" label="姓名" :transform="splitName">
          <ProFormText placeholder="名" />
          <ProFormText placeholder="姓" />
        </ProFormFieldSet>
      </ProFormGroup>
      <ProFormDependency :name="['team']">
        <template #default="{ team }">
          <p>
            正在编辑 {{ team || '未命名团队' }} 的联系人；姓名组合在提交时拆成 firstName /
            lastName。
          </p>
        </template>
      </ProFormDependency>
      <ProFormList
        name="contacts"
        label="联系人"
        :min="1"
        :max="3"
        :creator-record="{ name: '', channel: 'email' }"
      >
        <template #default="{ index, action }">
          <ProFormGroup size="small">
            <ProFormText
              name="name"
              label="姓名"
              :rules="[{ required: true, message: '请输入联系人姓名' }]"
            />
            <ProFormSelect
              name="channel"
              label="通知方式"
              :options="[
                { label: '邮件', value: 'email' },
                { label: '站内信', value: 'inbox' },
              ]"
            />
            <Button :disabled="index === 0" @click="action.move(index, index - 1)"> 上移 </Button>
          </ProFormGroup>
        </template>
      </ProFormList>
    </ProForm>

    <StepsForm :on-finish="save">
      <StepForm name="project" title="项目" :initial-values="{ project: '组件对齐' }">
        <ProFormText name="project" label="项目名称" :rules="[{ required: true }]" />
      </StepForm>
      <StepForm name="owner" title="负责人">
        <ProFormText name="owner" label="负责人" :rules="[{ required: true }]" />
      </StepForm>
    </StepsForm>

    <pre aria-live="polite">{{ submitted || '提交后在这里查看格式化结果。' }}</pre>
  </div>
</template>

<style scoped>
.composition-example {
  display: grid;
  gap: 32px;
}
pre {
  overflow: auto;
  padding: 16px;
  background: var(--pro-demo-result-bg, #f5f5f5);
}
</style>
