import packageExports = require('@bubblesjs/antv-next-pro')
import type {
  EditableAction,
  EditableProTableProps,
  ProColumns,
  ProCardProps,
  ProFormCaptchaProps,
  ProFormCheckboxProps,
  ProFormFieldProps,
  ProFormMoneyProps,
  ProFormTreeSelectProps,
  ProTableProps,
  SchemaFormColumn,
  SchemaFormProps,
} from '@bubblesjs/antv-next-pro'
import type { Component, Plugin } from 'vue'

interface CjsRow extends Record<string, unknown> {
  key: string
  count: number
}

interface CjsQuery extends Record<string, unknown> {
  scope: string
}

const columns: ProColumns<CjsRow>[] = [
  { dataIndex: 'key', title: 'Key' },
  {
    dataIndex: 'count',
    title: 'Count',
    valueType: 'digit',
    renderFormItem: (_column, context) => {
      context.update(2)
      return null
    },
  },
]

const schemaColumns: SchemaFormColumn<CjsRow>[] = [
  {
    valueType: 'formList',
    dataIndex: 'rows',
    columns: [
      {
        dataIndex: 'count',
        component: () => null,
        colProps: { span: 8 },
        tooltip: 'Count',
        extra: 'Nested schema field',
      },
    ],
  },
]

const tableProps: ProTableProps<CjsRow, CjsQuery> = {
  columns,
  params: { scope: 'all' },
  request: async ({ scope }) => ({
    data: [{ key: scope, count: 1 }],
    total: 1,
  }),
}

const editableProps: EditableProTableProps<CjsRow, CjsQuery> = {
  columns,
  value: [{ key: 'first', count: 1 }],
  rowKey: 'key',
  editable: {
    actionRender: (_record, actions) => {
      void [actions.start(), actions.editing, actions.record]
      return null
    },
  },
}

const editableAction: EditableAction<CjsRow> = {
  start: () => true,
  save: async () => true,
  cancel: () => undefined,
  remove: async () => true,
  record: { key: 'first', count: 1 },
  editing: false,
}

const schemaProps: SchemaFormProps<CjsRow> = {
  columns: schemaColumns,
  modelValue: { key: 'first', count: 1 },
}

const fieldComponents: Component[] = [
  packageExports.ProFormText,
  packageExports.ProFormDigit,
  packageExports.ProFormTextPassword,
  packageExports.ProFormTextArea,
  packageExports.ProFormCaptcha,
  packageExports.ProFormDatePicker,
  packageExports.ProFormDateTimePicker,
  packageExports.ProFormDateRangePicker,
  packageExports.ProFormDateTimeRangePicker,
  packageExports.ProFormSelect,
  packageExports.ProFormTreeSelect,
  packageExports.ProFormCheckbox,
  packageExports.ProFormRadioGroup,
  packageExports.ProFormSlider,
  packageExports.ProFormSwitch,
  packageExports.ProFormUploadButton,
  packageExports.ProFormUploadDragger,
  packageExports.ProFormMoney,
  packageExports.ProFormSegmented,
]
const passwordAlias: Component = packageExports.ProFormText.Password
const radioAlias: Component = packageExports.ProFormRadio.Group

const genericFieldProps = {
  modelValue: 1,
  options: [{ label: 'One', value: 1 }],
  readonlyRender: (value) => `#${value}`,
} satisfies ProFormFieldProps<number, number>
const treeSelectProps = {
  modelValue: [2],
  options: [{ label: 'Root', value: 1, children: [{ label: 'Child', value: 2 }] }],
} satisfies ProFormTreeSelectProps<number[], number>
const checkboxProps = {
  modelValue: ['read'],
  options: [{ label: 'Read', value: 'read' }],
  layout: 'vertical',
} satisfies ProFormCheckboxProps<string[], string>
const moneyProps = {
  modelValue: '12.00',
  prefix: false,
} satisfies ProFormMoneyProps
const captchaProps = {
  onGetCaptcha: () => true,
} satisfies ProFormCaptchaProps

const tableVNode = packageExports.ProTable<CjsRow, CjsQuery>(tableProps)
const cardProps: ProCardProps = { title: 'Users', ghost: true }
const cardComponent: Component = packageExports.ProCard
const editableVNode = packageExports.EditableProTable<CjsRow, CjsQuery>(editableProps)
const schemaVNode = packageExports.SchemaForm<CjsRow>(schemaProps)
const drawerVNode = packageExports.DrawerForm<CjsRow>({
  ...schemaProps,
  open: true,
  'onUpdate:open': (open: boolean) => void open,
})
const plugin: Plugin = packageExports.default

void [
  plugin,
  tableVNode,
  cardProps,
  cardComponent,
  editableVNode,
  schemaVNode,
  drawerVNode,
  editableAction,
  fieldComponents,
  passwordAlias,
  radioAlias,
  genericFieldProps,
  treeSelectProps,
  checkboxProps,
  moneyProps,
  captchaProps,
]
