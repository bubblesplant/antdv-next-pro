import { defineComponent, h, shallowRef } from 'vue'
import ProTable from '../ProTable.vue'
import type { ProTableInstance, ProTableProps } from '../types'
import { useTableRef } from '../table/useTableRef'
import './style.css'

/** 用户维护的二次封装；同步上游时请保留本目录，参见根目录 AGENTS.md。 */
const AdaptiveProTable = defineComponent({
  name: 'AdaptiveProTable',
  inheritAttrs: false,
  setup(_props, { attrs, slots, expose }) {
    const table = shallowRef<ProTableInstance>()
    expose(useTableRef(table))

    // 不声明运行时 props，直接转发，保留 ProTable 自身的默认值和事件处理。
    return () =>
      h(
        ProTable,
        {
          ...attrs,
          columns: attrs.columns as ProTableProps['columns'],
          ref: table,
          class: ['adaptive-table', attrs.class],
        },
        slots,
      )
  },
})

// 复用基础组件的泛型、事件、插槽和 ref 类型，避免维护一份重复的 API。
export default AdaptiveProTable as unknown as typeof ProTable
