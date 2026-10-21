import type { Ref } from 'vue'
import type { ProTableInstance } from '../types'

/** Keep every table action available on wrappers, including asynchronous return values. */
export function useTableRef<T extends Record<string, unknown>>(
  target: Ref<ProTableInstance<T> | undefined>,
): ProTableInstance<T> {
  return {
    getSortFilter: () => target.value?.getSortFilter() ?? { sort: {}, filter: {} },
    reload: async (reset) => {
      await target.value?.reload(reset)
    },
    reset: async () => {
      await target.value?.reset()
    },
    setPageInfo: (page) => target.value?.setPageInfo(page),
    clearSelected: () => target.value?.clearSelected(),
    fullScreen: async () => {
      await target.value?.fullScreen()
    },
    scrollTo: (position) => target.value?.scrollTo(position),
    startEditable: (key) => target.value?.startEditable(key) ?? false,
    saveEditable: async (key) => (await target.value?.saveEditable(key)) ?? false,
    cancelEditable: (key) => target.value?.cancelEditable(key),
    addEditRecord: (record, options) => target.value?.addEditRecord(record, options) ?? false,
    getRowData: (key) => target.value?.getRowData(key),
    getRowsData: () => target.value?.getRowsData() ?? [],
    setRowData: (key, values) => target.value?.setRowData(key, values) ?? false,
  }
}
