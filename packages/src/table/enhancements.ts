import type { VNodeChild } from 'vue'
import type { ProTableProps, EditableProTableProps, ProKey } from '../types'
export interface DragSortTableProps<
  T extends Record<string, unknown> = Record<string, unknown>,
  P extends Record<string, unknown> = Record<string, unknown>,
> extends ProTableProps<T, P> {
  dragSortKey?: string
  dragSortHandlerRender?: (record: T, index: number) => VNodeChild
  onDragSortEnd?: (beforeIndex: number, afterIndex: number, rows: T[]) => void | Promise<void>
  onDataSourceChange?: (rows: T[]) => void
}
export interface RowEditorTableProps<
  T extends Record<string, unknown> = Record<string, unknown>,
  P extends Record<string, unknown> = Record<string, unknown>,
> extends EditableProTableProps<T, P> {
  dataSource?: T[]
  defaultDataSource?: T[]
  onRowEditStart?: (key: ProKey, record: T) => void
  onRowEditEnd?: (key: ProKey, record: T) => void
}
export interface CellEditorTableProps<
  T extends Record<string, unknown> = Record<string, unknown>,
  P extends Record<string, unknown> = Record<string, unknown>,
> extends RowEditorTableProps<T, P> {}
