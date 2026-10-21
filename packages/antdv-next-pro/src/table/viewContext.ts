import type { VNodeChild } from 'vue'
import type { ProColumns } from '../types'

export interface ProTableViewContext<T extends Record<string, unknown>> {
  renderCell: (record: T, column: ProColumns<T>, index: number) => VNodeChild
}

export const proTableViewKey = Symbol('ProTableView')
