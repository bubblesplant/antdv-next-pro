<script setup lang="ts">
import { computed, defineComponent, h, ref } from 'vue'
import { Button, Form, Input, Space } from 'antdv-next'
import {
  DropdownFooter,
  ErrorBoundary,
  FieldLabel,
  FilterDropdown,
  InlineErrorFormItem,
  LabelIconTip,
  LightWrapper,
  ListToolBar,
  ProForm,
  ProFormText,
  Search,
  TableDropdown,
  type ProColumns,
} from '@bubblesjs/antdv-next-pro'

const DropdownButton = TableDropdown.Button
const feedback = ref('操作工具栏、筛选标签与错误恢复，结果会显示在这里。')
const dropdownOpen = ref(false)
const filterDraft = ref('进行中')
const filterValue = ref<string>()
const name = ref('')
const inlineModel = computed(() => ({ name: name.value }))
const showError = ref(false)
const error = computed(() =>
  showError.value && name.value.trim().length < 2 ? '请至少输入两个字符' : undefined,
)
const crash = ref(false)
const CrashContent = defineComponent({
  props: { fail: Boolean },
  setup(props) {
    return () => {
      if (props.fail) throw new Error('这是用于演示恢复流程的错误。')
      return h(
        'p',
        { 'data-demo-boundary-content': '' },
        '内容正常，点击“触发错误”查看自定义降级界面。',
      )
    }
  },
})
const searchColumns: ProColumns[] = [
  { title: '项目名称', dataIndex: 'name' },
  {
    title: '状态',
    dataIndex: 'status',
    valueType: 'select',
    valueEnum: { active: '进行中', done: '已完成' },
  },
]
const filterFooter = {
  onConfirm: () => {
    filterValue.value = filterDraft.value
    feedback.value = `已应用筛选：${filterDraft.value}`
    dropdownOpen.value = false
  },
  onClear: () => {
    filterDraft.value = ''
    filterValue.value = undefined
    feedback.value = '已清除筛选'
  },
}
async function submitLight(values: Record<string, unknown>) {
  feedback.value = `轻量筛选：${JSON.stringify(values)}`
  return true
}
function validateName() {
  showError.value = true
  feedback.value = name.value.trim().length >= 2 ? '名称校验通过' : '名称校验未通过'
}
function recover(reset: () => void) {
  crash.value = false
  reset()
}
</script>

<template>
  <div class="shared-demo" data-demo="shared-components">
    <section>
      <ListToolBar
        title="独立工具栏"
        sub-title="下拉操作与搜索"
        tooltip="此处展示公开的辅助组件。"
        :search="{
          placeholder: '输入工具栏关键词',
          onSearch: (value: string) => {
            feedback = `工具栏搜索：${value}`
          },
        }"
      >
        <template #actions>
          <TableDropdown
            text="更多操作"
            :menus="[
              { key: 'export', name: '导出列表' },
              { key: 'archive', name: '归档项目' },
            ]"
            :on-select="
              (key: string) => {
                feedback = `选中菜单：${key}`
              }
            "
          />
          <DropdownButton
            text="按钮菜单"
            :menus="[{ key: 'copy', name: '复制链接' }]"
            :on-select="
              (key: string) => {
                feedback = `按钮菜单：${key}`
              }
            "
            data-demo-dropdown-button
          />
        </template>
      </ListToolBar>
      <Search
        :columns="searchColumns"
        :search="{ defaultCollapsed: false, searchText: '应用查询' }"
        @submit="feedback = `查询条件：${JSON.stringify($event)}`"
        @reset="feedback = '查询已重置'"
      />
    </section>

    <section>
      <h3>
        <LabelIconTip
          label="筛选与提示"
          sub-title="点击标签打开筛选"
          tooltip="确认应用修改，取消保留上次结果。"
        />
      </h3>
      <Space wrap>
        <FilterDropdown
          v-model:open="dropdownOpen"
          label="状态筛选"
          :footer="filterFooter"
          placement="bottomLeft"
        >
          <template #label><Button data-demo-filter-open>状态筛选</Button></template>
          <Input v-model:value="filterDraft" aria-label="筛选状态" data-demo-filter-input />
        </FilterDropdown>
        <FieldLabel
          label="已选状态"
          :value="filterValue"
          :on-clear="
            () => {
              filterValue = undefined
              feedback = '已清除标签'
            }
          "
        />
      </Space>
      <ProForm
        :submitter="false"
        :initial-values="{ keyword: '组件' }"
        :on-finish="submitLight"
        class="light-form"
      >
        <LightWrapper name="keyword" label="关键词">
          <ProFormText
            name="keyword"
            placeholder="输入关键词"
            :rules="[{ max: 12, message: '最多输入 12 个字符' }]"
          />
        </LightWrapper>
      </ProForm>
      <div class="footer-preview">
        <span>独立 DropdownFooter</span>
        <DropdownFooter
          clear-text="清除结果"
          confirm-text="确认结果"
          :on-clear="
            () => {
              feedback = '独立操作区：已清除'
            }
          "
          :on-confirm="
            () => {
              feedback = '独立操作区：已确认'
            }
          "
        />
      </div>
    </section>

    <section>
      <h3>行内校验</h3>
      <Form :model="inlineModel" layout="vertical">
        <InlineErrorFormItem label="显示名称" name="name" :error="error">
          <Input v-model:value="name" placeholder="至少两个字符" data-demo-inline-input />
        </InlineErrorFormItem>
        <Button data-demo-inline-validate @click="validateName">校验名称</Button>
      </Form>
    </section>

    <section>
      <h3>错误边界</h3>
      <Button data-demo-boundary-crash :disabled="crash" @click="crash = true">触发错误</Button>
      <ErrorBoundary
        :on-error="
          () => {
            feedback = '错误已被边界捕获，可点击恢复'
          }
        "
      >
        <CrashContent :fail="crash" />
        <template #fallback="{ error: boundaryError, reset }">
          <div role="alert" class="fallback">
            <p>{{ boundaryError.message }}</p>
            <Button data-demo-boundary-reset @click="recover(reset)">恢复内容</Button>
          </div>
        </template>
      </ErrorBoundary>
    </section>
    <p data-demo-shared-state aria-live="polite">{{ feedback }}</p>
  </div>
</template>

<style scoped>
.shared-demo {
  display: grid;
  gap: 28px;
}
h3 {
  margin-block: 0 14px;
}
p {
  margin-block: 12px;
}
.light-form {
  margin-block: 16px;
}
.footer-preview,
.fallback {
  padding: 16px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
}
.footer-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}
</style>
