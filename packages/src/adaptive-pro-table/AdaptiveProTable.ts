import ProTable from '../ProTable.vue'
import AdaptiveProTable from './AdaptiveProTable.vue'

// 复用基础组件的泛型、事件、插槽和 ref 类型，避免维护一份重复的 API。
export default AdaptiveProTable as unknown as typeof ProTable
