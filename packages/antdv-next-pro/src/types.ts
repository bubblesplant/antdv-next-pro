import type { CardProps, InputSearchProps } from 'antdv-next'
import type { CSSProperties, Component, VNodeChild } from 'vue'

export type ProCardSemanticName =
  | 'root'
  | 'header'
  | 'body'
  | 'extra'
  | 'title'
  | 'actions'
  | 'cover'

export interface ProCardProps {
  title?: VNodeChild
  subTitle?: VNodeChild
  extra?: VNodeChild
  tooltip?: string
  cover?: CardProps['cover']
  actions?: CardProps['actions']
  size?: 'default' | 'small'
  type?: 'default' | 'inner'
  variant?: 'outlined' | 'borderless'
  bordered?: boolean
  headerBordered?: boolean
  ghost?: boolean
  hoverable?: boolean
  loading?: boolean
  collapsible?: boolean | 'header' | 'icon'
  collapsed?: boolean
  defaultCollapsed?: boolean
  headStyle?: CSSProperties
  bodyStyle?: CSSProperties
  styles?: Partial<Record<ProCardSemanticName, CSSProperties>>
  classNames?: Partial<Record<ProCardSemanticName, string>>
}

export interface ProCardSlots {
  default?: () => VNodeChild
  title?: () => VNodeChild
  subTitle?: () => VNodeChild
  extra?: () => VNodeChild
  cover?: () => VNodeChild
  actions?: () => VNodeChild
  loading?: () => VNodeChild
  collapsibleIcon?: (props: { collapsed: boolean }) => VNodeChild
}

export type ProKey = string | number
export type ProDataIndex = ProKey | readonly ProKey[]
export type ProValueType =
  | 'text'
  | 'textarea'
  | 'digit'
  | 'money'
  | 'percent'
  | 'select'
  | 'treeSelect'
  | 'radio'
  | 'checkbox'
  | 'switch'
  | 'slider'
  | 'segmented'
  | 'date'
  | 'dateTime'
  | 'dateRange'
  | 'dateTimeRange'
  | 'time'
  | 'timeRange'
  | 'password'
  | 'index'
  | 'indexBorder'
  | 'option'
  | 'group'
  | 'formList'
  | 'formSet'
  | 'divider'
  | 'dependency'

export interface ProValueEnumItem<Value = unknown> {
  text: string
  color?: string
  disabled?: boolean
  status?: string
  value?: Value
}

export type ProValueEnum<Value = unknown> =
  | Record<ProKey, string | ProValueEnumItem<Value>>
  | ReadonlyMap<Value, string | ProValueEnumItem<Value>>

export interface ProRenderContext<T extends Record<string, unknown>> {
  record: T
  index: number
  column: ProColumns<T>
  editable: boolean
  dependencies?: unknown[]
  update: (value: unknown) => void
}

export interface ProColumns<T extends Record<string, unknown> = Record<string, unknown>> {
  key?: ProKey
  dataIndex?: ProDataIndex
  title?: VNodeChild | ((column: ProColumns<T>) => VNodeChild)
  valueType?: ProValueType
  valueEnum?: ProValueEnum | (() => ProValueEnum)
  request?: (params?: Record<string, unknown>) => Promise<Array<Record<string, unknown>>>
  onFieldRequestError?: (error: unknown) => void
  params?: Record<string, unknown>
  width?: number | string
  minWidth?: number
  fixed?: 'left' | 'right'
  align?: 'left' | 'center' | 'right'
  ellipsis?: boolean
  copyable?: boolean
  sorter?: boolean | ((a: T, b: T) => number)
  filters?: Array<{ text: string; value: ProKey }>
  search?: boolean | { transform?: (value: unknown) => Record<string, unknown> }
  editable?: boolean | ((record: T, index: number) => boolean)
  hideInTable?: boolean
  hideInSearch?: boolean
  hideInForm?: boolean
  readonly?: boolean
  fieldProps?: Record<string, unknown> | ((record?: T) => Record<string, unknown>)
  formItemProps?: Record<string, unknown> | ((record?: T) => Record<string, unknown>)
  convertValue?: (value: unknown, record: Partial<T>) => unknown
  transform?: (value: unknown, record: Partial<T>) => unknown
  dependencies?: ProDataIndex[]
  columns?: ProColumns<T>[]
  render?: (value: unknown, context: ProRenderContext<T>) => VNodeChild
  renderText?: (value: unknown, record: T, index: number) => unknown
  renderFormItem?: (column: ProColumns<T>, context: ProRenderContext<T>) => VNodeChild
}

export type ProSort = Record<string, 'ascend' | 'descend' | null>
export type ProFilter = Record<string, Array<ProKey> | null>

export interface ProRequestResult<T> {
  data: T[]
  total?: number
  success?: boolean
}

export type ProRequest<T, P extends Record<string, unknown>> = (
  params: P & { current?: number; pageSize?: number },
  sort: ProSort,
  filter: ProFilter,
) => Promise<ProRequestResult<T>>

export interface ProTableSearchConfig {
  labelWidth?: number | 'auto'
  span?: number | Partial<Record<'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl', number>>
  defaultCollapsed?: boolean
  collapsed?: boolean
  onCollapse?: (collapsed: boolean) => void
  searchText?: string
  resetText?: string
}

export type ProTableToolbarSearchConfig = Omit<InputSearchProps, 'onSearch'> & {
  name?: string
  onSearch?: (value: string) => void | false | Promise<void | false>
}

export interface ProTableToolbarConfig {
  title?: VNodeChild
  actions?: VNodeChild | (() => VNodeChild)
  search?: boolean | ProTableToolbarSearchConfig
  onSearch?: (value: string) => void
}

export interface ProTableLocaleText {
  search: string
  reset: string
  expand: string
  collapse: string
  densityDefault: string
  densityCompact: string
  densityLoose: string
  fullScreen: string
  reload: string
  setting: string
}

export type ProTableScrollTarget = ProKey | { key: ProKey } | { top: number }

export interface ProTablePagination {
  current?: number
  pageSize?: number
  total?: number
  defaultCurrent?: number
  defaultPageSize?: number
  showSizeChanger?: boolean
  pageSizeOptions?: Array<number | string>
}

export interface ProTableOptions {
  search?: boolean | ProTableToolbarSearchConfig
  density?: boolean
  fullScreen?: boolean
  reload?: boolean
  setting?: boolean
}

export interface ProColumnsState {
  show?: boolean
  order?: number
  fixed?: 'left' | 'right' | false
}

export interface ProColumnsStateConfig {
  persistenceKey?: string
  persistenceType?: 'localStorage' | 'sessionStorage'
  value?: Record<string, ProColumnsState>
  defaultValue?: Record<string, ProColumnsState>
  onChange?: (state: Record<string, ProColumnsState>) => void
}

export interface EditableConfig<T extends Record<string, unknown>> {
  type?: 'single' | 'multiple'
  onSave?: (key: ProKey, record: T, origin: T) => void | boolean | Promise<void | boolean>
  onCancel?: (key: ProKey, record: T, origin: T) => void | Promise<void>
  onDelete?: (key: ProKey, record: T) => void | boolean | Promise<void | boolean>
  actionRender?: (record: T, actions: EditableAction<T>) => VNodeChild
}

export interface EditableAction<T extends Record<string, unknown>> {
  start: () => boolean
  save: () => Promise<boolean>
  cancel: () => void
  remove: () => Promise<boolean>
  record: T
  editing: boolean
}

export interface RecordCreatorProps<T extends Record<string, unknown>> {
  record: T | (() => T)
  position?: 'top' | 'bottom'
  parentKey?: ProKey
  newRecordType?: 'cache' | 'dataSource'
  creatorButtonText?: string
}

export interface ProTableProps<
  T extends Record<string, unknown> = Record<string, unknown>,
  P extends Record<string, unknown> = Record<string, unknown>,
> {
  columns: ProColumns<T>[]
  dataSource?: T[]
  defaultDataSource?: T[]
  request?: ProRequest<T, P>
  params?: P
  postData?: (data: T[]) => T[]
  rowKey?: keyof T | string | ((record: T) => ProKey)
  loading?: boolean
  search?: false | ProTableSearchConfig
  localeText?: Partial<ProTableLocaleText>
  pagination?: false | ProTablePagination
  options?: false | ProTableOptions
  toolbar?: false | ProTableToolbarConfig
  rowSelection?: false | Record<string, unknown>
  polling?: number
  revalidateOnFocus?: boolean
  manualRequest?: boolean
  columnsState?: ProColumnsStateConfig
  editable?: false | EditableConfig<T>
  editableKeys?: ProKey[]
  scroll?: { x?: number | string | true; y?: number | string }
  size?: 'small' | 'middle' | 'large'
  bordered?: boolean
}

export interface ProTableInstance<T extends Record<string, unknown> = Record<string, unknown>> {
  getSortFilter: () => { sort: ProSort; filter: ProFilter }
  reload: (resetPageIndex?: boolean) => Promise<void>
  reset: () => Promise<void>
  setPageInfo: (page: Partial<ProTablePagination>) => void
  clearSelected: () => void
  fullScreen: () => Promise<void>
  scrollTo: (target: ProTableScrollTarget) => void
  startEditable: (key: ProKey) => boolean
  saveEditable: (key: ProKey) => Promise<boolean>
  cancelEditable: (key: ProKey) => void
  addEditRecord: (record: T, options?: Omit<RecordCreatorProps<T>, 'record'>) => boolean
  /** Numeric values resolve as an exact row key before falling back to a top-level row index. */
  getRowData: (indexOrKey: number | ProKey) => T | undefined
  getRowsData: () => T[]
  /** Numeric values resolve as an exact row key before falling back to a top-level row index. */
  setRowData: (indexOrKey: number | ProKey, value: Partial<T>) => boolean
}

export interface EditableProTableProps<
  T extends Record<string, unknown> = Record<string, unknown>,
  P extends Record<string, unknown> = Record<string, unknown>,
> {
  columns: ProColumns<T>[]
  value?: T[]
  defaultValue?: T[]
  request?: ProRequest<T, P>
  params?: P
  postData?: (data: T[]) => T[]
  rowKey?: keyof T | string | ((record: T) => ProKey)
  loading?: boolean
  toolbar?: false | ProTableToolbarConfig
  rowSelection?: false | Record<string, unknown>
  polling?: number
  revalidateOnFocus?: boolean
  manualRequest?: boolean
  columnsState?: ProColumnsStateConfig
  editable?: false | EditableConfig<T>
  editableKeys?: ProKey[]
  scroll?: { x?: number | string | true; y?: number | string }
  size?: 'small' | 'middle' | 'large'
  bordered?: boolean
  recordCreatorProps?: false | RecordCreatorProps<T>
  maxLength?: number
  formItemProps?: Record<string, unknown>
  onValuesChange?: (values: T[], changedRecord: T) => void
  onTableChange?: (pagination: ProTablePagination, filters: ProFilter, sorter: ProSort) => void
}

export interface EditableProTableInstance<
  T extends Record<string, unknown> = Record<string, unknown>,
> extends ProTableInstance<T> {
  /** Numeric values resolve as an exact row key before falling back to a top-level row index. */
  getRowData: (indexOrKey: number | ProKey) => T | undefined
  getRowsData: () => T[]
  /** Numeric values resolve as an exact row key before falling back to a top-level row index. */
  setRowData: (indexOrKey: number | ProKey, value: Partial<T>) => boolean
}

export type SchemaFormLayoutType =
  | 'Form'
  | 'Embed'
  | 'ModalForm'
  | 'DrawerForm'
  | 'QueryFilter'
  | 'LightFilter'
  | 'StepForm'
  | 'StepsForm'

export interface SchemaFormColumn<
  T extends Record<string, unknown> = Record<string, unknown>,
> extends ProColumns<T> {
  component?: Component
  colProps?: Record<string, unknown>
  rowProps?: Record<string, unknown>
  tooltip?: VNodeChild
  extra?: VNodeChild
  columns?: SchemaFormColumn<T>[]
}

export interface SchemaFormFieldSlotProps<T extends Record<string, unknown>> {
  value: unknown
  record: Partial<T>
  column: SchemaFormColumn<T>
  dependencies: unknown[]
  update: (value: unknown) => void
}

export interface SchemaFormLabelSlotProps<T extends Record<string, unknown>> {
  column: SchemaFormColumn<T>
  record: Partial<T>
}

export interface SchemaFormStep<T extends Record<string, unknown>> {
  title: VNodeChild
  columns: SchemaFormColumn<T>[]
}

export interface SchemaFormStepTitleSlotProps<T extends Record<string, unknown>> {
  title: VNodeChild
  index: number
  current: number
  step: SchemaFormStep<T>
  steps: SchemaFormStep<T>[]
  values: Partial<T>
}

export interface SchemaFormStepContentSlotProps<T extends Record<string, unknown>> {
  current: number
  step: SchemaFormStep<T>
  steps: SchemaFormStep<T>[]
  columns: SchemaFormColumn<T>[]
  values: Partial<T>
  content: () => VNodeChild
}

export interface SchemaFormStepActionsSlotProps<T extends Record<string, unknown>> {
  current: number
  step: SchemaFormStep<T>
  steps: SchemaFormStep<T>[]
  values: Partial<T>
  hasPrevious: boolean
  hasNext: boolean
  submitting: boolean
  next: () => void
  prev: () => void
  submit: () => void
  reset: () => void
}

export interface SchemaFormSlots<T extends Record<string, unknown>> {
  // Dynamic column path/key slots intentionally accept an open scope. Named slots below remain typed.
  [name: string]: ((props: any) => VNodeChild) | undefined
  [name: `field-${string}`]: ((props: SchemaFormFieldSlotProps<T>) => VNodeChild) | undefined
  [name: `label-${string}`]: ((props: SchemaFormLabelSlotProps<T>) => VNodeChild) | undefined
  trigger?: (props: { open: boolean; openForm: () => void; closeForm: () => void }) => VNodeChild
  title?: (props: {
    title: VNodeChild
    open: boolean
    values: Partial<T>
    close: () => void
  }) => VNodeChild
  footer?: (props: {
    values: Partial<T>
    submitting: boolean
    submit: () => Promise<void>
    reset: () => void
    close: () => void
  }) => VNodeChild
  submitter?: (props: { values: Partial<T>; current: number }) => VNodeChild
  'step-title'?: (props: SchemaFormStepTitleSlotProps<T>) => VNodeChild
  'step-content'?: (props: SchemaFormStepContentSlotProps<T>) => VNodeChild
  'step-actions'?: (props: SchemaFormStepActionsSlotProps<T>) => VNodeChild
}

export interface SchemaFormProps<T extends Record<string, unknown> = Record<string, unknown>> {
  columns: SchemaFormColumn<T>[]
  modelValue?: Partial<T>
  initialValues?: Partial<T>
  request?: (params?: Record<string, unknown>) => Promise<Partial<T>>
  params?: Record<string, unknown>
  layoutType?: SchemaFormLayoutType
  open?: boolean
  current?: number
  title?: VNodeChild
  width?: number | string
  labelCol?: Record<string, unknown>
  wrapperCol?: Record<string, unknown>
  grid?: boolean
  readonly?: boolean
  urlSync?: boolean | { key?: string; mode?: 'query' | 'hash' }
  submitter?: false | { submitText?: string; resetText?: string }
  style?: CSSProperties
}

export interface SchemaFormInstance<T extends Record<string, unknown> = Record<string, unknown>> {
  validate: () => Promise<Partial<T>>
  reset: () => void
  getFieldsValue: () => Partial<T>
  setFieldsValue: (values: Partial<T>) => void
  submit: () => Promise<Partial<T>>
  open: () => void
  close: () => void
  next: () => Promise<boolean>
  prev: () => void
}
