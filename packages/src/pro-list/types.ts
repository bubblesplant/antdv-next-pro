import type { VNodeChild, HTMLAttributes } from 'vue'
import type { ProSemanticSource, ProSemanticClasses, ProSemanticStyles } from '../provider/types'
import type {
  ProCardProps,
  ProColumns,
  ProRequest,
  ProTableProps,
  ProTableInstance,
} from '../types'
export interface ProListColumn<
  T extends Record<string, unknown> = Record<string, unknown>,
> extends ProColumns<T> {
  listSlot?: 'title' | 'subTitle' | 'description' | 'avatar' | 'content' | 'actions' | 'extra'
  cardActionProps?: 'extra' | 'actions'
}
export type ProListMeta<T extends Record<string, unknown> = Record<string, unknown>> =
  ProListColumn<T>
export type BaseProListMetas<T extends Record<string, unknown> = Record<string, unknown>> = Partial<
  Record<
    'title' | 'subTitle' | 'description' | 'avatar' | 'content' | 'actions' | 'extra',
    ProListMeta<T>
  >
>
export type ProListMetas<T extends Record<string, unknown> = Record<string, unknown>> =
  BaseProListMetas<T> & Record<string, ProListMeta<T> | undefined>
export type ProListItemRender<T> = (item: T, index: number, defaultDom: VNodeChild) => VNodeChild
export interface ProListProps<
  T extends Record<string, unknown> = Record<string, unknown>,
  P extends Record<string, unknown> = Record<string, unknown>,
> extends Omit<ProTableProps<T, P>, 'columns' | 'rowClassName' | 'onRow' | 'classes' | 'styles'> {
  request?: ProRequest<T, P>
  classes?: ProSemanticSource<ProSemanticClasses, ProListProps<T, P>>
  classNames?: ProSemanticSource<ProSemanticClasses, ProListProps<T, P>>
  styles?: ProSemanticSource<ProSemanticStyles, ProListProps<T, P>>
  columns?: ProListColumn<T>[]
  metas?: ProListMetas<T>
  grid?: {
    gutter?: number
    column?: number
    xs?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
    xxl?: number
  }
  itemCardProps?: ProCardProps
  itemLayout?: 'horizontal' | 'vertical'
  split?: boolean
  showActions?: 'hover' | 'always'
  showExtra?: 'hover' | 'always'
  itemRender?: ProListItemRender<T>
  itemTitleRender?: false | ProListItemRender<T>
  itemHeaderRender?: false | ProListItemRender<T>
  onItem?: (item: T, index: number) => HTMLAttributes
  onRow?: (item: T, index: number) => HTMLAttributes
  rowClassName?: string | ((item: T, index: number) => string)
}
export type BaseProListProps<
  T extends Record<string, unknown> = Record<string, unknown>,
  P extends Record<string, unknown> = Record<string, unknown>,
> = ProListProps<T, P>
export interface ProListViewProps<T extends Record<string, unknown> = Record<string, unknown>> {
  columns?: ProListColumn<T>[]
  dataSource?: T[]
  loading?: ProTableProps<T>['loading']
  rowKey?: ProTableProps<T>['rowKey']
  rowSelection?: ProTableProps<T>['rowSelection']
  expandable?: ProTableProps<T>['expandable']
  grid?: ProListProps<T>['grid']
  itemCardProps?: ProCardProps
  itemLayout?: 'horizontal' | 'vertical'
  split?: boolean
  showActions?: 'hover' | 'always'
  showExtra?: 'hover' | 'always'
  itemRender?: ProListItemRender<T>
  itemTitleRender?: false | ProListItemRender<T>
  itemHeaderRender?: false | ProListItemRender<T>
  onItem?: (item: T, index: number) => HTMLAttributes
  onRow?: (item: T, index: number) => HTMLAttributes
  rowClassName?: string | ((item: T, index: number) => string)
  prefixCls?: string
  action?: ProTableInstance<T>
  classes?: ProSemanticClasses
  styles?: ProSemanticStyles
}
