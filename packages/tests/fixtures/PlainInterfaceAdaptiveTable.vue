<script setup lang="ts">
import { ref } from 'vue'
import AdaptiveProTable from '../../src/adaptive-pro-table/AdaptiveProTable'
import type { ProColumns, ProRequest, ProTableInstance } from '../../src/types'

interface UserRow {
  id: number
  name: string
}

interface UserQuery {
  keyword?: string
}

const table = ref<ProTableInstance<UserRow>>()
const loadedName = ref('')
const query: UserQuery = { keyword: 'Ada' }
const columns: ProColumns<UserRow>[] = [{ title: 'Name', dataIndex: 'name' }]
const request: ProRequest<UserRow, UserQuery> = async ({ keyword }) => ({
  data: [{ id: 1, name: keyword?.trim() ?? 'Unknown' }],
})

function handleLoad(rows: UserRow[]) {
  loadedName.value = rows[0]?.name ?? ''
}
</script>

<template>
  <div style="height: 600px; width: 900px">
    <output data-testid="loaded-name">{{ loadedName }}</output>
    <!-- @vue-generic {UserRow, UserQuery} -->
    <AdaptiveProTable
      ref="table"
      :columns="columns"
      :params="query"
      :request="request"
      :search="false"
      :pagination="false"
      :row-selection="{}"
      header-title="Users"
      row-key="id"
      @load="handleLoad"
    >
      <template #toolbar-actions="{ selectedRows }">
        <span data-testid="selected-names">
          {{ selectedRows.map((row) => row.name.toUpperCase()).join(', ') }}
        </span>
      </template>
    </AdaptiveProTable>
  </div>
</template>
