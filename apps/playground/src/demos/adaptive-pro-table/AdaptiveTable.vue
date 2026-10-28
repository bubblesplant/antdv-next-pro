<script setup lang="ts">
import { ref } from 'vue'
import { Button, Space, Switch } from 'antdv-next'
import { AdaptiveProTable, type ProColumns, type ProTableInstance } from '@bubblesjs/antdv-next-pro'

interface Project extends Record<string, unknown> {
  id: number
  name: string
  owner: string
  department: string
  status: 'running' | 'done'
}

const emit = defineEmits<{ event: [message: string] }>()
const table = ref<ProTableInstance<Project>>()
const height = ref(640)
const showSearch = ref(true)
const showPagination = ref(true)
const empty = ref(false)
const loading = ref(false)
const rows: Project[] = Array.from({ length: 64 }, (_, index) => ({
  id: index + 1,
  name: `项目 ${String(index + 1).padStart(2, '0')}`,
  owner: ['林默', '周芮', '孟晴', '方屿'][index % 4]!,
  department: ['数据产品', '用户运营', '研发平台'][index % 3]!,
  status: index % 3 === 0 ? 'done' : 'running',
}))
const columns: ProColumns<Project>[] = [
  { title: '编号', dataIndex: 'id', width: 80, search: false },
  { title: '项目名称', dataIndex: 'name', width: 260 },
  { title: '负责人', dataIndex: 'owner', width: 160 },
  { title: '所属部门', dataIndex: 'department', width: 220 },
  {
    title: '状态',
    dataIndex: 'status',
    width: 160,
    valueType: 'select',
    valueEnum: {
      running: { text: '进行中', status: 'processing' },
      done: { text: '已完成', status: 'success' },
    },
  },
]

async function reload() {
  await table.value?.reload()
  emit('event', '已通过 AdaptiveProTable ref 刷新')
}
</script>

<template>
  <div class="adaptive-demo">
    <div class="adaptive-demo-controls">
      <label class="height-control">
        容器高度 {{ height }}px
        <input
          v-model.number="height"
          aria-label="容器高度"
          type="range"
          min="480"
          max="860"
          step="20"
        />
      </label>
      <Space wrap>
        <label><Switch v-model:checked="showSearch" size="small" /> 查询区</label>
        <label><Switch v-model:checked="showPagination" size="small" /> 分页</label>
        <label><Switch v-model:checked="empty" size="small" /> 空数据</label>
        <label><Switch v-model:checked="loading" size="small" /> 加载中</label>
      </Space>
    </div>
    <p class="adaptive-demo-hint">
      拖动高度滑块或展开查询条件，表体随剩余空间变化，表头和分页保持可见。
    </p>
    <div class="adaptive-demo-container" :style="{ height: `${height}px` }">
      <AdaptiveProTable
        ref="table"
        :columns="columns"
        :data-source="empty ? [] : rows"
        :loading="loading"
        row-key="id"
        header-title="项目清单"
        :search="showSearch ? { defaultCollapsed: true, span: 8 } : false"
        :pagination="
          showPagination
            ? { defaultPageSize: 20, pageSizeOptions: [10, 20, 50], showSizeChanger: true }
            : false
        "
        :row-selection="{}"
        :scroll="{ x: 'max-content', y: '100%' }"
        @search-collapse="emit('event', $event ? '收起查询条件' : '展开查询条件')"
        @change="emit('event', '分页、排序或筛选发生变化')"
        @selection-change="(keys) => emit('event', `已选 ${keys.length} 条`)"
      >
        <template #toolbar-actions><Button @click="reload">通过 ref 刷新</Button></template>
        <template #cell-name="{ record }"
          ><strong>{{ record.name }}</strong></template
        >
      </AdaptiveProTable>
    </div>
  </div>
</template>

<style scoped>
.adaptive-demo {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 16px;
  min-width: 0;
}

.adaptive-demo-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 24px;
  align-items: center;
}

.adaptive-demo-controls label {
  display: inline-flex;
  gap: 8px;
  align-items: center;
}

.height-control {
  flex-wrap: wrap;
}

.adaptive-demo-hint {
  margin: 0;
  color: #60738a;
  font-size: 13px;
}

.adaptive-demo-container {
  min-width: 0;
  min-height: 0;
}
</style>
