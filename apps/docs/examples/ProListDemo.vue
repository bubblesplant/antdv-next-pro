<script setup lang="ts">
import { computed, h, ref } from 'vue'
import { Button, Space } from 'antdv-next'
import {
  BaseProList,
  ProList,
  type ProKey,
  type ProListMetas,
  type ProTableInstance,
} from '@bubblesjs/antdv-next-pro'

interface Project extends Record<string, unknown> {
  id: number
  name: string
  description: string
  owner: string
  status: string
}

const projects: Project[] = [
  {
    id: 1,
    name: '组件文档',
    description: '整理组件用法与可运行示例。',
    owner: '林晓',
    status: 'active',
  },
  {
    id: 2,
    name: '主题配置',
    description: '统一颜色、间距与深色主题。',
    owner: '陈雨',
    status: 'active',
  },
  {
    id: 3,
    name: '发布准备',
    description: '核对类型声明与迁移说明。',
    owner: '周宁',
    status: 'done',
  },
  {
    id: 4,
    name: '交互验收',
    description: '验证搜索、选择和展开行为。',
    owner: '许舟',
    status: 'pending',
  },
]
const action = ref<ProTableInstance<Project>>()
const selectedKeys = ref<ProKey[]>([])
const requestCount = ref(0)
const feedback = ref('点击详情、勾选项目，或展开一条记录。')
const selection = computed(() => ({
  selectedRowKeys: selectedKeys.value,
  onChange: (keys: ProKey[]) => {
    selectedKeys.value = keys
  },
}))
const metas: ProListMetas<Project> = {
  title: { title: '项目名称', dataIndex: 'name' },
  subTitle: {
    dataIndex: 'status',
    search: false,
    valueEnum: {
      active: { text: '进行中', status: 'Processing' },
      done: { text: '已完成', status: 'Success' },
      pending: { text: '待开始', status: 'Default' },
    },
  },
  description: { dataIndex: 'description', search: false },
  actions: {
    search: false,
    render: (_dom, record) =>
      h(
        Button,
        {
          type: 'link',
          'data-demo-list-details': String(record.id),
          onClick: () => {
            feedback.value = `${record.name} · 负责人：${record.owner}`
          },
        },
        () => '查看详情',
      ),
  },
}

async function request(params: Record<string, unknown>) {
  requestCount.value++
  const keyword = typeof params.name === 'string' ? params.name.trim() : ''
  const filtered = projects.filter((item) => item.name.includes(keyword))
  const current = Number(params.current ?? 1)
  const pageSize = Number(params.pageSize ?? 2)
  return {
    data: filtered.slice((current - 1) * pageSize, current * pageSize),
    total: filtered.length,
    success: true,
  }
}
</script>

<template>
  <div class="list-demo" data-demo="pro-list">
    <ProList
      ref="action"
      header-title="项目列表"
      row-key="id"
      :metas="metas"
      :request="request"
      :search="{ defaultCollapsed: false, searchText: '搜索项目' }"
      :pagination="{ defaultPageSize: 2, showSizeChanger: false }"
      :row-selection="selection"
      :expandable="{
        expandedRowRender: (record: Project) => `负责人：${record.owner}。${record.description}`,
      }"
      :classes="{ title: 'project-title' }"
    >
      <template #toolbar-actions>
        <Space>
          <Button data-demo-list-reload @click="action?.reload()">重新加载</Button>
          <Button :disabled="!selectedKeys.length" @click="selectedKeys = []">清除选择</Button>
        </Space>
      </template>
    </ProList>
    <p data-demo-list-state aria-live="polite">
      已选 {{ selectedKeys.length }} 项 · 请求 {{ requestCount }} 次。{{ feedback }}
    </p>

    <section aria-label="基础卡片列表">
      <h3>BaseProList：独立卡片列表</h3>
      <p>复用相同的字段映射，按屏幕宽度显示一列或两列。</p>
      <BaseProList
        row-key="id"
        :data-source="projects.slice(0, 2)"
        :metas="{ title: metas.title, subTitle: metas.subTitle, description: metas.description }"
        :grid="{ gutter: 20, xs: 1, md: 2 }"
        :split="false"
        :on-item="
          (record: Project) => ({
            tabindex: 0,
            'data-demo-list-card': record.id,
            onClick: () => {
              feedback = `当前卡片：${record.name}`
            },
            onKeydown: (event: KeyboardEvent) => {
              if (event.key === 'Enter') feedback = `当前卡片：${record.name}`
            },
          })
        "
        :styles="{
          row: {
            padding: '20px',
            border: '1px solid #d9d9d9',
            borderRadius: '8px',
            cursor: 'pointer',
          },
        }"
      />
    </section>
  </div>
</template>

<style scoped>
.list-demo {
  display: grid;
  gap: 20px;
}
h3 {
  margin-block: 0 8px;
}
p {
  margin: 0;
  color: inherit;
}
:deep(.project-title) {
  font-weight: 600;
}
</style>
