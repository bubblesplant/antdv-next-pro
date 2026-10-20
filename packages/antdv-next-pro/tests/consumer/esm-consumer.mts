import { h, type Component, type Plugin } from 'vue'

import AntdvNextPro, {
  AntdvNextPro as NamedPlugin,
  EditableProTable,
  Form,
  ModalForm,
  ProCard,
  ProFormCaptcha,
  ProFormCheckbox,
  ProFormDatePicker,
  ProFormDateRangePicker,
  ProFormDateTimePicker,
  ProFormDateTimeRangePicker,
  ProFormDigit,
  ProFormField,
  ProFormMoney,
  ProFormRadio,
  ProFormRadioGroup,
  ProFormSegmented,
  ProFormSelect,
  ProFormSlider,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
  ProFormTextPassword,
  ProFormTreeSelect,
  ProFormUploadButton,
  ProFormUploadDragger,
  ProTable,
  QueryFilter,
  SchemaForm,
  type EditableAction,
  type EditableProTableInstance,
  type EditableProTableProps,
  type ProColumns,
  type ProCardProps,
  type ProFormCaptchaProps,
  type ProFormCheckboxProps,
  type ProFormDatePickerProps,
  type ProFormDateRangePickerProps,
  type ProFormDateTimePickerProps,
  type ProFormDateTimeRangePickerProps,
  type ProFormDigitProps,
  type ProFormFieldProps,
  type ProFormMoneyProps,
  type ProFormRadioGroupProps,
  type ProFormSegmentedProps,
  type ProFormSelectProps,
  type ProFormSliderProps,
  type ProFormSwitchProps,
  type ProFormTextAreaProps,
  type ProFormTextPasswordProps,
  type ProFormTextProps,
  type ProFormTreeSelectProps,
  type ProFormUploadButtonProps,
  type ProFormUploadDraggerProps,
  type ProTableInstance,
  type ProTableProps,
  type SchemaFormColumn,
  type SchemaFormInstance,
  type SchemaFormProps,
  type SchemaFormSlots,
} from '@bubblesjs/antv-next-pro'

interface UserRow extends Record<string, unknown> {
  id: number
  name: string
  enabled: boolean
}

interface UserQuery extends Record<string, unknown> {
  keyword: string
}

const columns: ProColumns<UserRow>[] = [
  {
    dataIndex: 'name',
    title: 'Name',
    search: true,
    renderFormItem: (_column, context) => {
      context.update('Grace')
      return null
    },
  },
  { dataIndex: 'enabled', title: 'Enabled', valueType: 'switch' },
]

const schemaColumns: SchemaFormColumn<UserRow>[] = [
  {
    title: 'Account',
    valueType: 'group',
    columns: [
      {
        dataIndex: 'name',
        component: () => null,
        colProps: { span: 12 },
        tooltip: 'Public display name',
        extra: 'Shown on the profile',
      },
      {
        valueType: 'dependency',
        dependencies: ['enabled'],
        renderFormItem: (_column, context) => {
          const dependencies: unknown[] | undefined = context.dependencies
          void dependencies
          return null
        },
      },
    ],
  },
]

const tableProps = {
  columns,
  params: { keyword: 'Ada' },
  request: async (params, sort, filter) => {
    const keyword: string = params.keyword
    const order = sort.name
    const acceptedIds = filter.id
    void [keyword, order, acceptedIds]
    return {
      data: [{ id: 1, name: 'Ada', enabled: true }],
      success: true,
      total: 1,
    }
  },
} satisfies ProTableProps<UserRow, UserQuery>

const editableProps = {
  columns,
  params: { keyword: '' },
  value: [{ id: 1, name: 'Ada', enabled: true }],
  recordCreatorProps: {
    record: () => ({ id: 2, name: 'Grace', enabled: false }),
  },
  editable: {
    actionRender: (_record, actions) => {
      const editing: boolean = actions.editing
      const started: boolean = actions.start()
      void [editing, started, actions.record, actions.save, actions.cancel, actions.remove]
      return null
    },
  },
  onValuesChange: (values, changedRecord) => void [values, changedRecord],
  onTableChange: (pagination, filters, sorter) => void [pagination, filters, sorter],
} satisfies EditableProTableProps<UserRow, UserQuery>

const editableAction: EditableAction<UserRow> = {
  start: () => true,
  save: async () => true,
  cancel: () => undefined,
  remove: async () => true,
  record: { id: 1, name: 'Ada', enabled: true },
  editing: false,
}

const schemaFormProps = {
  columns: schemaColumns,
  modelValue: { id: 1, name: 'Ada' },
} satisfies SchemaFormProps<UserRow>

const schemaFormSlots = {
  'field-name': ({ value, record, column, dependencies, update }) => {
    void [value, record.name, column.dataIndex, dependencies]
    update('Grace')
    return null
  },
  name: ({ value, record, column, dependencies, update }) => {
    void [value, record, column, dependencies, update]
    return null
  },
  'step-title': ({ title, index, current, step, steps, values }) => {
    void [index, current, step.columns, steps.length, values.name]
    return title
  },
  'step-content': ({ current, step, steps, columns, values, content }) => {
    void [current, step.title, steps.length, columns.length, values.name]
    return content()
  },
  'step-actions': ({
    current,
    step,
    steps,
    values,
    hasPrevious,
    hasNext,
    submitting,
    next,
    prev,
    submit,
    reset,
  }) => {
    void [current, step, steps, values, hasPrevious, hasNext, submitting]
    void [next, prev, submit, reset]
    return null
  },
} satisfies SchemaFormSlots<UserRow>

const fieldComponents: Component[] = [
  ProFormText,
  ProFormDigit,
  ProFormTextPassword,
  ProFormTextArea,
  ProFormCaptcha,
  ProFormDatePicker,
  ProFormDateTimePicker,
  ProFormDateRangePicker,
  ProFormDateTimeRangePicker,
  ProFormSelect,
  ProFormTreeSelect,
  ProFormCheckbox,
  ProFormRadioGroup,
  ProFormSlider,
  ProFormSwitch,
  ProFormUploadButton,
  ProFormUploadDragger,
  ProFormMoney,
  ProFormSegmented,
]
const passwordAlias: Component = ProFormText.Password
const radioAlias: Component = ProFormRadio.Group

const genericFieldProps = {
  modelValue: 'active',
  options: [{ label: 'Active', value: 'active' }],
  params: { scope: 'users' },
  request: async ({ scope } = { scope: 'users' }) => [{ label: scope, value: scope }],
  fieldProps: { placeholder: 'Status' },
  readonlyRender: (value) => value.toUpperCase(),
} satisfies ProFormFieldProps<string, string, { placeholder?: string }, { scope: string }>

const specializedFieldProps = [
  { modelValue: 'Ada' } satisfies ProFormTextProps,
  { modelValue: 'secret' } satisfies ProFormTextPasswordProps,
  { modelValue: 'Biography' } satisfies ProFormTextAreaProps,
  { modelValue: 12, precision: 2, min: 0 } satisfies ProFormDigitProps,
  { modelValue: '12.00', prefix: '¥' } satisfies ProFormMoneyProps,
  { readonly: true } satisfies ProFormDatePickerProps,
  { showTime: true } satisfies ProFormDateTimePickerProps,
  { readonly: true } satisfies ProFormDateRangePickerProps,
  { showTime: true } satisfies ProFormDateTimeRangePickerProps,
  {
    modelValue: ['read'],
    options: [{ label: 'Read', value: 'read' }],
  } satisfies ProFormCheckboxProps<string[], string>,
  {
    modelValue: 1,
    request: async () => [{ label: 'One', value: 1 }],
  } satisfies ProFormRadioGroupProps<number, number>,
  {
    modelValue: ['admin'],
    options: [{ label: 'Admin', value: 'admin' }],
  } satisfies ProFormSelectProps<string[], string>,
  {
    modelValue: [2],
    options: [{ label: 'Root', value: 1, children: [{ label: 'Child', value: 2 }] }],
  } satisfies ProFormTreeSelectProps<number[], number>,
  { modelValue: [10, 20], fieldProps: { range: true } } satisfies ProFormSliderProps,
  { modelValue: false } satisfies ProFormSwitchProps,
  {
    modelValue: 'list',
    options: [{ label: 'List', value: 'list' }],
  } satisfies ProFormSegmentedProps<string, string>,
  { modelValue: [] } satisfies ProFormUploadButtonProps,
  { modelValue: [] } satisfies ProFormUploadDraggerProps,
  { onGetCaptcha: async () => true, countDown: 60 } satisfies ProFormCaptchaProps,
]

const tableVNode = ProTable<UserRow, UserQuery>(tableProps)
const cardVNode = h(ProCard, {
  title: 'Users',
  variant: 'borderless',
  collapsible: 'icon',
  styles: { body: { padding: 0 } },
  'onUpdate:collapsed': (collapsed: boolean) => void collapsed,
} satisfies ProCardProps & { 'onUpdate:collapsed': (collapsed: boolean) => void })
const editableVNode = EditableProTable<UserRow, UserQuery>(editableProps)
const schemaFormVNode = SchemaForm<UserRow>(schemaFormProps)
const formVNode = Form<UserRow>(schemaFormProps)
const modalFormVNode = ModalForm<UserRow>({
  ...schemaFormProps,
  open: false,
  'onUpdate:open': (open: boolean) => void open,
})
const queryFilterVNode = QueryFilter<UserRow>(schemaFormProps)
const proFormFieldVNode = h(ProFormField, genericFieldProps)

declare const table: ProTableInstance<UserRow>
declare const editableTable: EditableProTableInstance<UserRow>
declare const schemaForm: SchemaFormInstance<UserRow>

table.addEditRecord({ id: 3, name: 'Lin', enabled: true })
editableTable.setRowData(1, { enabled: false })
schemaForm.setFieldsValue({ name: 'Grace' })

const plugins: Plugin[] = [AntdvNextPro, NamedPlugin]
void [
  plugins,
  tableVNode,
  cardVNode,
  editableVNode,
  schemaFormVNode,
  formVNode,
  modalFormVNode,
  queryFilterVNode,
  schemaFormSlots,
  editableAction,
  fieldComponents,
  passwordAlias,
  radioAlias,
  genericFieldProps,
  specializedFieldProps,
  proFormFieldVNode,
]
