import { h } from 'vue'
import {
  BetaSchemaForm,
  CellEditorTable,
  DragSortTable,
  ProCard,
  ProConfigProvider,
  ProDescriptions,
  ProField,
  ProForm,
  ProFormCheckbox,
  ProFormDatePicker,
  ProFormList,
  ProFormRadio,
  ProFormText,
  ProList,
  RowEditorTable,
  StepsForm,
  type ProCardProps,
  type ProColumns,
  type ProConfigProviderProps,
  type ProDescriptionsColumn,
  type ProFormProps,
} from '@bubblesjs/antv-next-pro'

interface Row extends Record<string, unknown> {
  id: number
  name: string
}

const columns: ProColumns<Row>[] = [
  {
    title: 'Group',
    children: [
      {
        title: 'Name',
        dataIndex: 'name',
        render: (_dom, row, index, action, schema) => {
          void action.reload()
          return h('span', `${row.name}:${index}:${String(schema.dataIndex)}`)
        },
      },
    ],
  },
]
const valueTypeColumns: ProColumns<Row>[] = [
  { dataIndex: 'balance', valueType: { type: 'money', locale: 'en-US', precision: 2 } },
  {
    dataIndex: 'name',
    valueType: (record, index) => (record.id === index ? 'text' : { type: 'textarea', rows: 2 }),
  },
]
const descriptionColumns: ProDescriptionsColumn<Row>[] = [
  { title: 'Name', dataIndex: 'name', render: (_dom, row) => h('strong', row.name) },
]

const cardProps: ProCardProps = {
  title: 'Card',
  colSpan: { xs: 24, md: 12 },
  gutter: [16, 8],
  classes: ({ props }) => ({ title: props.title ? 'has-title' : '' }),
  styles: ({ props }) => ({ body: { padding: props.ghost ? 0 : 12 } }),
}
const providerProps: ProConfigProviderProps = {
  token: {
    colorPrimary: '#1677ff',
    borderRadius: 8,
    layout: { header: { heightLayoutHeader: 56 } },
  },
  valueTypeMap: {
    custom: {
      render: (value, _props, _dom) => h('b', String(value)),
      formItemRender: (_value, props) =>
        h('input', {
          value: String(props.value ?? ''),
          onInput: (event: Event) => props.onChange((event.target as HTMLInputElement).value),
        }),
    },
  },
}
const formProps: ProFormProps<Row> = {
  initialValues: { id: 1, name: 'Ada' },
  onFinish: async (values) => values.name.length > 0,
}

h(ProConfigProvider, providerProps, {
  default: () => [
    h(ProCard, cardProps, { default: () => h(ProCard.Divider) }),
    h(ProForm, formProps, {
      default: () => [h(ProFormText, { name: 'name' }), h(ProFormList, { name: 'children' })],
    }),
    h(BetaSchemaForm<Row>, { columns }),
    h(ProField, { text: 123, valueType: 'money', mode: 'read' }),
    h(ProField, { text: 123, valueType: { type: 'money', locale: 'en-US' } }),
    h(ProFormRadio, { name: 'choice' }),
    h(ProFormRadio.Group, { name: 'choices', options: ['A', 'B'] }),
    h(ProFormCheckbox.Group, { name: 'checks', options: ['A', 'B'] }),
    h(ProFormDatePicker.Month, { name: 'month' }),
    h(StepsForm, {}, { default: () => h(StepsForm.StepForm, { name: 'one', title: 'One' }) }),
    h(ProList, {
      rowKey: 'id',
      dataSource: [{ id: 1, name: 'Ada' }],
      metas: { title: { dataIndex: 'name' } },
    }),
    h(ProDescriptions<Row>, { columns: descriptionColumns, dataSource: { id: 1, name: 'Ada' } }),
    h(DragSortTable<Row>, { columns, dataSource: [], dragSortKey: 'sort' }),
    h(RowEditorTable<Row>, { columns, value: [] }),
    h(CellEditorTable<Row>, { columns, value: [] }),
  ],
})

// @ts-expect-error 未知 token 不应静默接受。
const invalidToken: NonNullable<ProConfigProviderProps['token']> = { definitelyNotAToken: 'bad' }
// @ts-expect-error classes 仅接受公开语义部位。
const invalidCardClasses: ProCardProps['classes'] = { nonexistentPart: 'bad' }
// @ts-expect-error onFinish 的结果只接受 boolean/void 或相应 Promise。
const invalidFinish: ProFormProps<Row>['onFinish'] = () => 123
void [invalidToken, invalidCardClasses, invalidFinish]
void valueTypeColumns

// Generic components retain the supplied record shape in their public declarations.
RowEditorTable<Row>({
  columns,
  // @ts-expect-error Row.id is numeric in RowEditorTable data.
  value: [{ id: 'wrong', name: 'Ada' }],
})
CellEditorTable<Row>({
  columns,
  // @ts-expect-error CellEditorTable callbacks receive Row, whose name is a string.
  onRowEditEnd: (_key, row: { id: number; name: number }) => void row,
})
DragSortTable<Row>({
  columns,
  // @ts-expect-error DragSortTable results retain numeric Row.id.
  onDragSortEnd: (_before, _after, list: { id: string; name: string }[]) => void list,
})
ProList<Row>({
  // @ts-expect-error ProList request results must contain Row records.
  request: async () => ({ data: [{ id: 'wrong', name: 'Ada' }] }),
})
ProDescriptions<Row>({
  // @ts-expect-error ProDescriptions data must satisfy Row.
  dataSource: { id: 1, name: 42 },
})
