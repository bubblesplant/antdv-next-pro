<script setup lang="ts">
import { shallowRef, useAttrs } from 'vue'
import ProTable from '../ProTable.vue'
import type { ProTableInstance, ProTableProps } from '../types'
import { useTableRef } from '../table/useTableRef'
import './style.css'

/** 用户维护的二次封装；同步上游时请保留本目录，参见根目录 AGENTS.md。 */
defineOptions({ name: 'AdaptiveProTable', inheritAttrs: false })

const attrs = useAttrs()
const table = shallowRef<ProTableInstance>()
defineExpose(useTableRef(table))

// 保持透传；渲染时读取 attrs，使父组件替换 scroll 时继续更新。
function tableProps() {
  const scroll = attrs.scroll as ProTableProps['scroll']
  return {
    ...attrs,
    columns: attrs.columns as ProTableProps['columns'],
    class: ['adaptive-table', attrs.class],
    scroll: { ...scroll, x: scroll?.x || 'max-content', y: scroll?.y || 'auto' },
  }
}
</script>

<template>
  <ProTable ref="table" v-bind="tableProps()">
    <template v-for="(_, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps ?? {}" />
    </template>
  </ProTable>
</template>
