import type {
  CardProps,
  InputSearchProps,
  TableProps,
  TableColumnType,
  TableRowSelection,
  PaginationProps,
  TabsProps,
  TooltipProps,
  FormInstance,
  FormProps,
  ButtonProps,
} from 'antdv-next'
import type { CSSProperties, Component, VNodeChild } from 'vue'

export type ProCardSemanticName =
  | 'root'
  | 'header'
  | 'body'
  | 'extra'
  | 'title'
  | 'actions'
  | 'cover'

export type ProResponsiveKey = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
export type ProResponsiveValue<T> = T | Partial<Record<ProResponsiveKey, T>>
export type ProSemanticClasses<N extends string, P> =
  | Partial<Record<N, string>>
  | ((context: { props: P }) => Partial<Record<N, string>>)
export type ProSemanticStyles<N extends string, P> =
  | Partial<Record<N, CSSProperties>>
  | ((context: { props: P }) => Partial<Record<N, CSSProperties>>)

export interface ProCardProps {
  title?: VNodeChild
  subTitle?: VNodeChild
  extra?: VNodeChild
  tooltip?: string | TooltipProps
  prefixCls?: string
  layout?: 'default' | 'center'
  direction?: 'column' | 'row'
  wrap?: boolean
  colSpan?: ProResponsiveValue<number | string>
  colStyle?: CSSProperties
  gutter?: ProResponsiveValue<number> | ProResponsiveValue<number>[]
  split?: 'vertical' | 'horizontal'
  checked?: boolean
  disabled?: boolean
  boxShadow?: boolean
  tabs?: TabsProps & { cardProps?: ProCardProps }
  collapsibleIconRender?: (context: { collapsed: boolean }) => VNodeChild
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
  styles?: ProSemanticStyles<ProCardSemanticName, ProCardProps>
  classes?: ProSemanticClasses<ProCardSemanticName, ProCardProps>
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
  | 'cascader'
  | 'color'
  | 'colorPicker'
  | 'rate'
  | 'digitRange'
  | 'dateWeek'
  | 'dateMonth'
  | 'dateQuarter'
  | 'dateYear'
  | 'dateWeekRange'
  | 'dateMonthRange'
  | 'dateQuarterRange'
  | 'dateYearRange'
  | 'progress'
  | 'avatar'
  | 'image'
  | 'code'
  | 'jsonCode'
  | 'fromNow'
  | 'second'
  | 'radioButton'
  | (string & {})

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

export interface ProValueTypeDefinitionValue {
  type: ProValueType
  [key: string]: unknown
}
export type ProColumnValueType<T extends Record<string, unknown> = Record<string, unknown>> =
  | ProValueType
  | ProValueTypeDefinitionValue
  | ((record: T, index: number) => ProValueType | ProValueTypeDefinitionValue)

export interface ProColumns<
  T extends Record<string, unknown> = Record<string, unknown>,
> extends Omit<
  TableColumnType<T>,
  'title' | 'dataIndex' | 'render' | 'children' | 'key' | 'filters' | 'sorter' | 'ellipsis'
> {
  key?: ProKey
  dataIndex?: ProDataIndex
  title?: VNodeChild | ((column: ProColumns<T>) => VNodeChild)
  valueType?: ProColumnValueType<T>
  valueEnum?: ProValueEnum | (() => ProValueEnum)
  request?: (params?: Record<string, unknown>) => Promise<Array<Record<string, unknown>>>
  onFieldRequestError?: (error: unknown) => void
  params?: Record<string, unknown>
  width?: number | string
  minWidth?: number
  fixed?: 'left' | 'right'
  align?: 'left' | 'center' | 'right'
  ellipsis?: TableColumnType<T>['ellipsis']
  copyable?: boolean
  sorter?: TableColumnType<T>['sorter']
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
  children?: ProColumns<T>[]
  initialValue?: unknown
  order?: number
  colSize?: number
  render?: (
    dom: VNodeChild,
    record: T,
    index: number,
    action: ProTableInstance<T>,
    schema: ProColumns<T>,
  ) => VNodeChild
  renderText?: (value: unknown, record: T, index: number, action: ProTableInstance<T>) => unknown
  formItemRender?: (
    schema: ProColumns<T>,
    config: ProRenderContext<T>,
    form: FormInstance | undefined,
  ) => VNodeChild
  renderFormItem?: (column: ProColumns<T>, context: ProRenderContext<T>) => VNodeChild
}

export type ProSort = Record<string, 'ascend' | 'descend' | null>
export type ProFilter = Record<string, Array<ProKey> | null>

export interface ProRequestResult<T> {
  nextToken?: string
  data: T[]
  total?: number
  success?: boolean
}

export type ProRequest<T, P extends Record<string, unknown>> = (
  params: P & { current?: number; pageSize?: number; nextToken?: string },
  sort: ProSort,
  filter: ProFilter,
) => Promise<ProRequestResult<T>>

export interface ProTableSearchConfig<T extends Record<string, unknown> = Record<string, unknown>> {
  labelWidth?: number | 'auto'
  span?: number | Partial<Record<'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl', number>>
  defaultCollapsed?: boolean
  collapsed?: boolean
  onCollapse?: (collapsed: boolean) => void
  searchText?: string
  resetText?: string
  filterType?: 'query' | 'light'
  optionRender?:
    | false
    | ((
        search: ProTableSearchConfig<T>,
        form: SchemaFormInstance<T> | undefined,
        dom: VNodeChild[],
      ) => VNodeChild)
  collapseRender?: false | ((collapsed: boolean) => VNodeChild)
}

export type ProTableToolbarSearchConfig = Omit<InputSearchProps, 'onSearch'> & {
  name?: string
  onSearch?: (value: string) => void | false | Promise<void | false>
}

export type ProTableSearchForm<T extends Record<string, unknown> = Record<string, unknown>> =
  FormProps & {
    initialValues?: Partial<T>
    submitter?: false | import('./pro-form/types').SubmitterProps
  }

export interface ProTableToolbarConfig {
  title?: VNodeChild
  actions?: VNodeChild | (() => VNodeChild)
  search?: boolean | ProTableToolbarSearchConfig
  onSearch?: (value: string) => void
  subTitle?: VNodeChild
  tooltip?: string | TooltipProps
  tabs?: {
    activeKey?: string
    defaultActiveKey?: string
    items?: Array<{ key: string; label: VNodeChild; disabled?: boolean }>
    onChange?: (key: string) => void
  }
  menu?: {
    type?: 'inline' | 'dropdown' | 'tab'
    activeKey?: string
    defaultActiveKey?: string
    items?: Array<{ key: string; label: VNodeChild; disabled?: boolean }>
    onChange?: (key: string) => void
  }
  filter?: VNodeChild
  settings?: VNodeChild[]
  multipleLine?: boolean
}

export interface ProTableLocaleText {
  search: string
  reset: string
  expand: string
  collapse: string
  density?: string
  densityDefault: string
  densityCompact: string
  densityLoose: string
  fullScreen: string
  reload: string
  setting: string
  columnDisplay?: string
  columnDrag?: string
}

export type ProTableScrollTarget = ProKey | { key: ProKey } | { top: number }

export interface ProTableRowSelection<
  T extends Record<string, unknown>,
> extends TableRowSelection<T> {
  alwaysShowAlert?: boolean
}

export interface ProTablePagination extends Omit<
  PaginationProps,
  'current' | 'pageSize' | 'total' | 'pageSizeOptions'
> {
  type?: 'offset' | 'cursor'
  nextToken?: string
  current?: number
  pageSize?: number
  total?: number
  defaultCurrent?: number
  defaultPageSize?: number
  showSizeChanger?: boolean
  pageSizeOptions?: Array<number | string>
}

export interface ProTableOptions<T extends Record<string, unknown> = Record<string, unknown>> {
  search?: boolean | ProTableToolbarSearchConfig
  density?: boolean
  fullScreen?: boolean | ((event: MouseEvent, action: ProTableInstance<T>) => void)
  reload?: boolean | ((event: MouseEvent, action: ProTableInstance<T>) => void)
  setting?:
    | boolean
    | {
        draggable?: boolean
        checkable?: boolean
        showListItemOption?: boolean
        checkedReset?: boolean
        listsHeight?: number
        extra?: VNodeChild
        children?: VNodeChild
        settingIcon?: VNodeChild
        listItemTitleRender?: (title: VNodeChild, column: ProColumns<T>) => VNodeChild
      }
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
  actionRender?: (
    record: T,
    config: EditableAction<T>,
    defaultDom: { save: VNodeChild; cancel: VNodeChild; delete: VNodeChild },
  ) => VNodeChild
  /** @deprecated 原生 Form 不支持注入已有实例；使用 formRef 获取实际编辑表单。 */
  form?: FormInstance
  formRef?: import('vue').Ref<FormInstance | undefined>
  formProps?: FormProps
  editableKeys?: ProKey[]
  onChange?: (keys: ProKey[], rows: T[]) => void
  onValuesChange?: (record: T, rows: T[]) => void
  onlyOneLineEditorAlertMessage?: VNodeChild
  onlyAddOneLineAlertMessage?: VNodeChild
  saveText?: VNodeChild
  cancelText?: VNodeChild
  deleteText?: VNodeChild
  deletePopconfirmMessage?: VNodeChild
}

export interface EditableAction<T extends Record<string, unknown>> {
  start: () => boolean
  save: () => Promise<boolean>
  cancel: () => void
  remove: () => Promise<boolean>
  record: T
  editing: boolean
}

export interface RecordCreatorProps<T extends Record<string, unknown>> extends Omit<
  ButtonProps,
  'onClick' | 'position'
> {
  record?: T | ((index: number, dataSource: T[]) => T)
  position?: 'top' | 'bottom'
  parentKey?: ProKey
  newRecordType?: 'cache' | 'dataSource'
  creatorButtonText?: VNodeChild
}

export interface ProTableProps<
  T extends Record<string, unknown> = Record<string, unknown>,
  P extends Record<string, unknown> = Record<string, unknown>,
> extends Omit<
  TableProps<T>,
  | 'columns'
  | 'dataSource'
  | 'rowKey'
  | 'loading'
  | 'pagination'
  | 'rowSelection'
  | 'scroll'
  | 'size'
  | 'onChange'
  | 'classes'
  | 'styles'
  | 'prefixCls'
  | 'title'
> {
  prefixCls?: string
  columns: ProColumns<T>[]
  dataSource?: T[]
  defaultDataSource?: T[]
  request?: ProRequest<T, P>
  params?: P
  postData?: (data: T[]) => T[]
  rowKey?: keyof T | string | ((record: T) => ProKey)
  loading?: TableProps<T>['loading']
  headerTitle?: VNodeChild
  tooltip?: string | TooltipProps
  form?: ProTableSearchForm<T>
  formRef?: import('vue').Ref<SchemaFormInstance<T> | undefined>
  onSubmit?: (params: P) => void
  onReset?: () => void
  onLoadingChange?: (loading: boolean) => void
  beforeSearchSubmit?: (params: Record<string, unknown>) => Record<string, unknown>
  dateFormatter?: 'string' | 'number' | false | ((value: unknown, valueType: string) => unknown)
  debounceTime?: number
  toolBarRender?: false | ((action: ProTableInstance<T>, rows: T[]) => VNodeChild)
  optionsRender?: (props: ProTableProps<T, P>, defaults: VNodeChild[]) => VNodeChild
  tableRender?: (
    props: ProTableProps<T, P>,
    dom: VNodeChild,
    domList: { toolbar: VNodeChild; alert: VNodeChild; table: VNodeChild },
  ) => VNodeChild
  tableViewRender?: (props: ProTableProps<T, P>, dom: VNodeChild) => VNodeChild
  ErrorBoundary?: false | Component
  tableExtraRender?: (props: ProTableProps<T, P>, rows: T[]) => VNodeChild
  searchFormRender?: (props: ProTableProps<T, P>, dom: VNodeChild) => VNodeChild
  tableAlertRender?:
    | false
    | ((context: {
        selectedRowKeys: ProKey[]
        selectedRows: T[]
        onCleanSelected: () => void
      }) => VNodeChild)
  tableAlertOptionRender?:
    | false
    | ((context: {
        selectedRowKeys: ProKey[]
        selectedRows: T[]
        onCleanSelected: () => void
      }) => VNodeChild)
  cardProps?: false | ProCardProps
  cardBordered?: boolean | { search?: boolean; table?: boolean }
  tableClassName?: string
  tableStyle?: CSSProperties
  classes?: TableProps<T>['classes']
  styles?: TableProps<T>['styles']
  search?: false | ProTableSearchConfig<T>
  localeText?: Partial<ProTableLocaleText>
  pagination?: false | ProTablePagination
  options?: false | ProTableOptions<T>
  toolbar?: false | ProTableToolbarConfig
  rowSelection?: false | ProTableRowSelection<T>
  polling?: number | ((data: T[]) => number | false)
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
> extends Omit<ProTableProps<T, P>, 'search' | 'pagination' | 'dataSource' | 'defaultDataSource'> {
  columns: ProColumns<T>[]
  value?: T[]
  defaultValue?: T[]
  request?: ProRequest<T, P>
  params?: P
  postData?: (data: T[]) => T[]
  rowKey?: keyof T | string | ((record: T) => ProKey)
  loading?: TableProps<T>['loading']
  toolbar?: false | ProTableToolbarConfig
  rowSelection?: false | ProTableRowSelection<T>
  polling?: number | ((data: T[]) => number | false)
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
  children?: SchemaFormColumn<T>[]
  secondary?: boolean
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
  disabled?: boolean
  layout?: FormProps['layout']
  formProps?: Omit<FormProps, 'model' | 'onFinish'>
  onFinish?: (values: Partial<T>) => boolean | void | Promise<boolean | void>
  onValuesChange?: (changed: Partial<T>, values: Partial<T>) => void
  urlSync?: boolean | { key?: string; mode?: 'query' | 'hash' }
  syncToUrl?:
    | boolean
    | ((values: Record<string, unknown>, type: 'get' | 'set') => Record<string, unknown>)
  syncToInitialValues?: boolean
  dateFormatter?: import('./pro-form/types').ProFormProps['dateFormatter']
  submitter?: false | import('./pro-form/types').SubmitterProps
  submitTimeout?: number
  modalProps?: import('antdv-next').ModalProps
  drawerProps?: import('antdv-next').DrawerProps
  prefixCls?: string
  classes?: import('./pro-form/types').SemanticValue<
    import('./pro-form/types').FormClasses,
    SchemaFormProps<T>
  >
  classNames?: import('./pro-form/types').FormClasses
  styles?: import('./pro-form/types').SemanticValue<
    import('./pro-form/types').FormStyles,
    SchemaFormProps<T>
  >
  collapsed?: boolean
  defaultCollapsed?: boolean
  defaultColsNumber?: number
  span?: number | Record<string, number>
  labelWidth?: number | 'auto'
  split?: boolean
  searchText?: VNodeChild
  resetText?: VNodeChild
  optionRender?:
    | false
    | ((
        props: import('./pro-form/types').QueryFilterProps,
        form: import('./pro-form/types').ProFormInstance,
        doms: VNodeChild[],
      ) => VNodeChild)
  collapseRender?: false | ((collapsed: boolean) => VNodeChild)
  collapse?: boolean
  collapseLabel?: VNodeChild
  placement?: import('antdv-next').PopoverProps['placement']
  footerRender?: import('./pro-form/types').LightFilterProps['footerRender']
  stepsProps?: import('antdv-next').StepsProps
  formRef?:
    | import('vue').Ref<SchemaFormInstance<T> | undefined>
    | ((instance: SchemaFormInstance<T> | undefined) => void)
  style?: CSSProperties
}

export interface SchemaFormInstance<T extends Record<string, unknown> = Record<string, unknown>> {
  readonly nativeForm?: FormInstance
  validate: () => Promise<Partial<T>>
  validateFields: (names?: ProDataIndex[]) => Promise<Partial<T>>
  validateFieldsReturnFormatValue: (names?: ProDataIndex[]) => Promise<Partial<T>>
  reset: () => void
  resetFields: () => void
  clearValidate: (names?: ProDataIndex[]) => void
  getFieldsValue: () => Partial<T>
  getFieldValue: (name: ProDataIndex) => unknown
  getFieldsFormatValue: () => Partial<T>
  getFieldFormatValue: (name: ProDataIndex) => unknown
  setFieldsValue: (values: Partial<T>) => void
  setFieldValue: (name: ProDataIndex, value: unknown) => void
  submit: () => Promise<Partial<T>>
  open: () => void
  close: () => void
  next: () => Promise<boolean>
  prev: () => void
  formMap?: () => Map<string, import('./pro-form/types').ProFormInstance>
  scrollToField: (name: ProDataIndex, options?: ScrollIntoViewOptions) => void
  loading: Readonly<import('vue').Ref<boolean>>
}

/** Layouts accept either a columns schema or ordinary composed field slots. */
export interface SchemaLayoutProps<
  T extends Record<string, unknown> = Record<string, unknown>,
> extends Omit<SchemaFormProps<T>, 'columns'> {
  'onUpdate:open'?: (open: boolean) => void
  'onUpdate:current'?: (current: number) => void
  'onUpdate:collapsed'?: (collapsed: boolean) => void
  'onUpdate:modelValue'?: (values: Partial<T>) => void
  columns?: SchemaFormColumn<T>[]
  trigger?: VNodeChild
  name?: string
  stepProps?: Record<string, unknown>
  formMapRef?: import('vue').Ref<Map<string, import('./pro-form/types').ProFormInstance>>
}
