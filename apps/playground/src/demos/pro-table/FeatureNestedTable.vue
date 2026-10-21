<script setup lang="ts">
import type { ProColumns } from '@bubblesjs/antv-next-pro'
import { ProTable } from '@bubblesjs/antv-next-pro'
import { computed, ref } from 'vue'
import { demoRows, type DemoRow } from './demoData'
const expandedParent = ref<string | null>('数据产品')
const departments = computed(() => {
  const names = [...new Set(demoRows.map((row) => row.department))].slice(0, 4)
  return names.map((name) => ({ name, rows: demoRows.filter((row) => row.department === name) }))
})
const nestedColumns: ProColumns<DemoRow>[] = [
  { title: '项目', dataIndex: 'project', valueType: 'text' },
  { title: '负责人', dataIndex: 'owner', valueType: 'text', width: 110 },
  { title: '进度', dataIndex: 'progress', valueType: 'percent', width: 110 },
]
</script>

<template>
  <div class="scenario-demo mode-nested-table" data-scenario-mode="nested-table">
    <div class="nested-demo">
      <article v-for="department in departments" :key="department.name">
        <button
          type="button"
          class="nested-parent"
          :aria-expanded="expandedParent === department.name"
          @click="expandedParent = expandedParent === department.name ? null : department.name"
        >
          <span>{{ expandedParent === department.name ? '−' : '+' }}</span>
          <strong>{{ department.name }}</strong>
          <small>{{ department.rows.length }} 个项目</small>
        </button>
        <div v-if="expandedParent === department.name" class="nested-child">
          <ProTable
            :columns="nestedColumns"
            :data-source="department.rows"
            row-key="id"
            :search="false"
            :pagination="false"
            :options="false"
            :toolbar="false"
            size="small"
          />
        </div>
      </article>
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

button:hover {
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

.nested-demo {
  overflow: hidden;
  border: 1px solid var(--demo-line);
  border-radius: 8px;
}

.nested-demo article + article {
  border-top: 1px solid var(--demo-line);
}

.nested-parent {
  width: 100%;
  display: grid;
  grid-template-columns: 24px 1fr auto;
  gap: 10px;
  align-items: center;
  padding: 13px 15px;
  border: 0;
  border-radius: 0;
  text-align: left;
}

.nested-parent small {
  color: var(--demo-muted);
}

.nested-child {
  padding: 14px 20px 18px 48px;
  background: #f7faff;
}

@media (width <= 760px) {
  .nested-child {
    padding-left: 14px;
  }
}
</style>
