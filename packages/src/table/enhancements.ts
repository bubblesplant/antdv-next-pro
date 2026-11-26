import type { VNodeChild } from 'vue'
import type { ProTableProps, EditableProTableProps, ProKey } from '../types'
import type { ProTableRecord } from './record'
export interface DragSortTableProps<
  T extends ProTableRecord = Record<string, unknown>,
  P extends ProTableRecord = Record<string, unknown>,
> extends ProTableProps<T, P> {
  dragSortKey?: string
  dragSortHandlerRender?: (record: T, index: number) => VNodeChild
  onDragSortEnd?: (beforeIndex: number, afterIndex: number, rows: T[]) => void | Promise<void>
  onDataSourceChange?: (rows: T[]) => void
}
export interface RowEditorTableProps<
  T extends ProTableRecord = Record<string, unknown>,
  P extends ProTableRecord = Record<string, unknown>,
> extends EditableProTableProps<T, P> {
  dataSource?: T[]
  defaultDataSource?: T[]
  onRowEditStart?: (key: ProKey, record: T) => void
  onRowEditEnd?: (key: ProKey, record: T) => void
}
export interface CellEditorTableProps<
  T extends ProTableRecord = Record<string, unknown>,
  P extends ProTableRecord = Record<string, unknown>,
> extends RowEditorTableProps<T, P> {}
