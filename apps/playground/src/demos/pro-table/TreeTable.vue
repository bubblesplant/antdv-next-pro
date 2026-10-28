<script setup lang="ts">
import { ref } from 'vue'
import { ProTable, type ProColumns, type ProKey } from '@bubblesjs/antdv-next-pro'

interface Task extends Record<string, unknown> {
  id: string
  name: string
  owner: string
  status: 'processing' | 'success' | 'default'
  progress: number
  children?: Task[]
}

const rows: Task[] = [
  {
    id: 'website',
    name: '官网升级',
    owner: '林默',
    status: 'processing',
    progress: 72,
    children: [
      {
        id: 'design',
        name: '设计与体验',
        owner: '周芮',
        status: 'success',
        progress: 100,
        children: [
          { id: 'tokens', name: '设计规范', owner: '周芮', status: 'success', progress: 100 },
          { id: 'prototype', name: '交互原型', owner: '唐可', status: 'success', progress: 100 },
        ],
      },
      { id: 'frontend', name: '前端开发', owner: '林默', status: 'processing', progress: 65 },
      { id: 'testing', name: '集成测试', owner: '孟晴', status: 'default', progress: 0 },
    ],
  },
  {
    id: 'platform',
    name: '数据平台',
    owner: '程一',
    status: 'processing',
    progress: 48,
    children: [
      { id: 'pipeline', name: '数据接入', owner: '程一', status: 'success', progress: 100 },
      { id: 'dashboard', name: '分析看板', owner: '庄言', status: 'processing', progress: 35 },
    ],
  },
  { id: 'release', name: '发布准备', owner: '孟晴', status: 'default', progress: 0 },
]

const columns: ProColumns<Task>[] = [
  { title: '任务名称', dataIndex: 'name', width: 300 },
  { title: '负责人', dataIndex: 'owner', width: 120 },
  {
    title: '状态',
    dataIndex: 'status',
    valueType: 'select',
    width: 140,
    valueEnum: {
      processing: { text: '进行中', status: 'processing' },
      success: { text: '已完成', status: 'success' },
      default: { text: '未开始', status: 'default' },
    },
  },
  { title: '完成进度', dataIndex: 'progress', valueType: 'percent', width: 120 },
]

const selectedKeys = ref<ProKey[]>([])
</script>

<template>
  <div>
    <p class="tree-hint">点击任务名称前的展开按钮查看子任务，支持三级嵌套与独立勾选。</p>
    <ProTable
      :columns="columns"
      :data-source="rows"
      row-key="id"
      :search="false"
      :pagination="false"
      :toolbar="{ title: '项目任务' }"
      :row-selection="{ checkStrictly: true, selectedRowKeys: selectedKeys }"
      :scroll="{ x: 680 }"
      @selection-change="(keys) => (selectedKeys = keys)"
    />
    <p class="tree-hint">
      已选择 {{ selectedKeys.length }} 项：{{ selectedKeys.join('、') || '暂无' }}
    </p>
  </div>
</template>

<style scoped>
.tree-hint {
  margin: 0 0 16px;
  color: #64748b;
  font-size: 13px;
  line-height: 1.8;
}
.tree-hint:last-child {
  margin: 16px 0 0;
}
</style>
