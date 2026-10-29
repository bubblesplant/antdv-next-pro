var e=`<script setup lang="ts">
import type {
  EditableConfig,
  EditableProTableInstance,
  ProColumns,
  ProKey,
  SchemaFormColumn,
  SchemaFormInstance,
  RecordCreatorProps,
} from '@bubblesjs/antdv-next-pro'
import { InputNumber, SpaceAddon, SpaceCompact } from 'antdv-next'
import { EditableProTable, SchemaForm } from '@bubblesjs/antdv-next-pro'
import { h, nextTick, ref } from 'vue'
const emit = defineEmits<{
  event: [message: string]
}>()
function announce(message: string) {
  emit('event', \`ProForm 内 EditableProTable（列校验）：\${message}\`)
}
interface EditableMember extends Record<string, unknown> {
  id: number
  name: string
  role: '前端' | '设计' | '测试'
  allocation: number
}
interface EditablePlan extends Record<string, unknown> {
  planName?: string
  members?: EditableMember[]
}
const editableRef = ref<EditableProTableInstance<EditableMember> | null>(null)
const editableFormRef = ref<SchemaFormInstance<EditablePlan> | null>(null)
const editableFormModel = ref<Partial<EditablePlan>>({
  planName: '秋季增长实验',
  members: [
    { id: 501, name: '林默', role: '前端', allocation: 80 },
    { id: 502, name: '周芮', role: '设计', allocation: 60 },
  ],
})
const editableKeys = ref<ProKey[]>([501])
const editableMessage = ref('第一行已进入编辑态，可先清空姓名验证列规则。')
let editableSequence = 503
function asEditableMembers(value: unknown): EditableMember[] {
  return Array.isArray(value) ? (value as EditableMember[]) : []
}
function hasValidAllocation(value: unknown): boolean {
  return typeof value === 'number' && Number.isFinite(value) && value >= 1 && value <= 100
}
function hasValidMemberName(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0
}
async function validateEditableMembers(_rule: unknown, value: unknown): Promise<void> {
  const members = asEditableMembers(value)
  if (members.length === 0) throw new Error('至少添加一位项目成员')
  if (members.some((member) => !hasValidMemberName(member?.name))) {
    throw new Error('请补全所有成员姓名')
  }
  if (members.some((member) => !hasValidAllocation(member?.allocation))) {
    throw new Error('成员投入比例必须是 1 到 100 之间的有限数字')
  }
}
const editableFormColumns: SchemaFormColumn<EditablePlan>[] = [
  {
    title: '计划名称',
    dataIndex: 'planName',
    valueType: 'text',
    formItemProps: { rules: [{ required: true, message: '请输入计划名称' }] },
  },
  {
    title: '项目成员',
    dataIndex: 'members',
    valueType: 'text',
    formItemProps: {
      rules: [{ validator: validateEditableMembers }],
    },
  },
]
const editableColumns: ProColumns<EditableMember>[] = [
  {
    title: '成员姓名',
    dataIndex: 'name',
    valueType: 'text',
    formItemProps: {
      rules: [
        { required: true, message: '成员姓名不能为空' },
        {
          validator: (_rule: unknown, value: unknown) => hasValidMemberName(value),
          message: '成员姓名不能只包含空格',
        },
      ],
    },
  },
  {
    title: '角色',
    dataIndex: 'role',
    valueType: 'select',
    valueEnum: { 前端: '前端', 设计: '设计', 测试: '测试' },
    formItemProps: { rules: [{ required: true, message: '请选择角色' }] },
  },
  {
    title: '投入比例',
    dataIndex: 'allocation',
    valueType: 'percent',
    formItemRender: (_column, { record, update }) =>
      h(
        SpaceCompact,
        {},
        {
          default: () => [
            h(InputNumber, {
              value: record.allocation,
              'onUpdate:value': update,
            }),
            h(SpaceAddon, {}, { default: () => '%' }),
          ],
        },
      ),
    formItemProps: {
      rules: [
        { required: true, message: '请输入投入比例' },
        {
          validator: (_rule: unknown, value: unknown) => hasValidAllocation(value),
          message: '投入比例必须是 1 到 100 之间的有限数字',
        },
      ],
    },
  },
  { title: '操作', valueType: 'option', width: 160, search: false },
]
const editableConfig: EditableConfig<EditableMember> = {
  type: 'multiple',
  onSave(_key, row) {
    editableMessage.value = \`已保存成员 \${row.name}\`
    announce(editableMessage.value)
  },
  onDelete(_key, row) {
    announce(\`删除成员 \${row.name}\`)
    return true
  },
}
const recordCreatorProps: RecordCreatorProps<EditableMember> = {
  record: () => ({ id: editableSequence++, name: '', role: '前端', allocation: 50 }),
  creatorButtonText: '添加成员并校验',
  position: 'bottom',
  newRecordType: 'dataSource',
}
async function submitEditableForm() {
  const table = editableRef.value
  const form = editableFormRef.value
  if (!table || !form) {
    editableMessage.value = '编辑表格尚未就绪，请稍后重试。'
    return
  }
  for (const key of [...editableKeys.value]) {
    const saved = await table.saveEditable(key)
    if (!saved) {
      editableMessage.value = '存在未通过列校验的成员，外层表单未提交。'
      announce('外层表单被列校验阻止')
      return
    }
  }
  try {
    await nextTick()
    const values = await form.submit()
    const planName = values?.planName?.trim() ?? ''
    const memberCount = table.getRowsData().length
    editableMessage.value = \`计划「\${planName}」提交成功，共 \${memberCount} 位成员。\`
    announce(editableMessage.value)
  } catch {
    editableMessage.value = '外层 SchemaForm 校验未通过，请补全计划信息。'
    announce('外层 SchemaForm 校验阻止提交')
  }
}
<\/script>

<template>
  <div
    class="scenario-demo mode-editable-pro-form-validation"
    data-scenario-mode="editable-pro-form-validation"
  >
    <div class="editable-form-demo">
      <SchemaForm
        ref="editableFormRef"
        v-model="editableFormModel"
        :columns="editableFormColumns"
        :submitter="false"
        ><template #field-members="{ value, update }"
          ><EditableProTable
            ref="editableRef"
            :value="asEditableMembers(value)"
            v-model:editable-keys="editableKeys"
            :columns="editableColumns"
            row-key="id"
            :editable="editableConfig"
            :record-creator-props="recordCreatorProps"
            :max-length="6"
            @update:value="update" /></template
      ></SchemaForm>
      <div class="outer-form-submit">
        <span>{{ editableMessage }}</span>
        <button type="button" class="primary" @click="submitEditableForm">提交外层表单</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scenario-demo {
  --demo-line: #d6e2ee;
  --demo-muted: #60738a;
  --demo-ink: #172b45;
  display: grid;
  gap: 16px;
  min-width: 0;
  color: var(--demo-ink);
}

.outer-form-submit {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border: 1px solid var(--demo-line);
  border-radius: 8px;
  background: #f6f9fd;
  color: var(--demo-muted);
  font-size: 12px;
}

button,
input,
select {
  font: inherit;
}

button {
  padding: 7px 10px;
  border: 1px solid #bacbdd;
  border-radius: 6px;
  background: white;
  color: #29445f;
  cursor: pointer;
}

button:hover,
button.primary {
  border-color: #1768d3;
  background: #1768d3;
  color: white;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

input:not([type='checkbox']):not([type='range']),
select {
  min-height: 34px;
  padding: 6px 9px;
  border: 1px solid #becfe0;
  border-radius: 6px;
  background: white;
  color: var(--demo-ink);
}

.editable-form-demo {
  display: grid;
  gap: 16px;
  padding: 18px;
  border: 1px solid var(--demo-line);
  border-radius: 10px;
  background: #fbfdff;
}

.outer-form-submit span {
  color: var(--demo-muted);
}
</style>
`;export{e as default};