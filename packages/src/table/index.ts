import type { PublicProps } from 'vue'
import type { ProTableInstance } from '../types'
import type { GenericComponentResult } from '../shared/genericComponent'
import type { DragSortTableProps, RowEditorTableProps, CellEditorTableProps } from './enhancements'
import DragSortTableBase from './DragSortTable.vue'
import RowEditorTableBase from './RowEditorTable.vue'
import CellEditorTableBase from './CellEditorTable.vue'

export interface DragSortTableComponent {
  <
    T extends Record<string, unknown> = Record<string, unknown>,
    P extends Record<string, unknown> = Record<string, unknown>,
  >(
    props: DragSortTableProps<T, P> & PublicProps,
  ): GenericComponentResult<DragSortTableProps<T, P>, ProTableInstance<T>>
}
export interface RowEditorTableComponent {
  <
    T extends Record<string, unknown> = Record<string, unknown>,
    P extends Record<string, unknown> = Record<string, unknown>,
  >(
    props: RowEditorTableProps<T, P> & PublicProps,
  ): GenericComponentResult<RowEditorTableProps<T, P>, ProTableInstance<T>>
}
export interface CellEditorTableComponent {
  <
    T extends Record<string, unknown> = Record<string, unknown>,
    P extends Record<string, unknown> = Record<string, unknown>,
  >(
    props: CellEditorTableProps<T, P> & PublicProps,
  ): GenericComponentResult<CellEditorTableProps<T, P>, ProTableInstance<T>>
}
export const DragSortTable = DragSortTableBase as unknown as DragSortTableComponent
export const RowEditorTable = RowEditorTableBase as unknown as RowEditorTableComponent
export const CellEditorTable = CellEditorTableBase as unknown as CellEditorTableComponent
export type * from './enhancements'
export { resolveColumnValueType } from './valueType'
