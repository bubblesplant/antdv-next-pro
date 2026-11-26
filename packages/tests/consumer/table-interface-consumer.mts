import {
  AdaptiveProTable,
  ProTable,
  type ProColumns,
  type ProTableInstance,
  type ProTableProps,
} from '@bubblesjs/antdv-next-pro'

interface UserRow {
  id: number
  name: string
}

interface UserQuery {
  keyword?: string
}

const columns: ProColumns<UserRow>[] = [
  { dataIndex: 'name', renderText: (_value, row) => row.name.toUpperCase() },
]

const tableProps = {
  columns,
  params: { keyword: 'Ada' },
  request: async ({ keyword }) => ({ data: [{ id: 1, name: keyword?.trim() ?? 'Ada' }] }),
} satisfies ProTableProps<UserRow, UserQuery>

ProTable<UserRow, UserQuery>(tableProps)
AdaptiveProTable<UserRow, UserQuery>(tableProps)

type Equal<Actual, Expected> =
  (<Value>() => Value extends Actual ? 1 : 2) extends <Value>() => Value extends Expected ? 1 : 2
    ? true
    : false
type Assert<Condition extends true> = Condition

type AdaptiveArguments = Parameters<typeof AdaptiveProTable<UserRow, UserQuery>>
type AdaptiveProps = AdaptiveArguments[0]
type AdaptiveSlots = NonNullable<AdaptiveArguments[1]>['slots']
type Request = NonNullable<AdaptiveProps['request']>
type ToolbarScope = Parameters<NonNullable<AdaptiveSlots['toolbar-actions']>>[0]

export type PlainInterfaceTableContract = [
  Assert<Equal<Parameters<NonNullable<ProColumns<UserRow>['renderText']>>[1], UserRow>>,
  Assert<
    Equal<
      Parameters<Request>[0],
      UserQuery & { current?: number; pageSize?: number; nextToken?: string }
    >
  >,
  Assert<Equal<Awaited<ReturnType<Request>>['data'], UserRow[]>>,
  Assert<Equal<Parameters<NonNullable<AdaptiveProps['onLoad']>>[0], UserRow[]>>,
  Assert<Equal<ToolbarScope['selectedRows'], UserRow[]>>,
  Assert<Equal<ReturnType<ProTableInstance<UserRow>['getRowsData']>, UserRow[]>>,
]
