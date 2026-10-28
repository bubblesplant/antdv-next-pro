import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'

import type { ProColumns, ProColumnsState } from '../src/types'
import {
  applyLocalQuery,
  buildSearchParams,
  cloneRecord,
  columnKey,
  findRecord,
  flattenColumns,
  getValue,
  getValueEnumItem,
  getValueEnumOptions,
  insertRecord,
  loadColumnsState,
  persistColumnsState,
  recordsInTree,
  removeRecord,
  replaceRecord,
  resolveRowKey,
  setValue,
  toPath,
} from '../src/table/utils'

interface Row extends Record<string, unknown> {
  id: number
  name: string
  status: string
  score: number
  profile?: { city?: string }
  children?: Row[]
}

const columns: ProColumns<Row>[] = [
  { dataIndex: 'name', search: true },
  { dataIndex: 'status', filters: [{ text: '启用', value: 'active' }] },
  { dataIndex: 'score', sorter: true },
]

function createMemoryStorage(): Storage {
  const values = new Map<string, string>()
  return {
    get length() {
      return values.size
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, String(value)),
  }
}

beforeEach(() => {
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: createMemoryStorage(),
  })
  Object.defineProperty(window, 'sessionStorage', {
    configurable: true,
    value: createMemoryStorage(),
  })
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('table utilities', () => {
  it('normalizes paths, keys, nested values and row keys', () => {
    expect(toPath()).toEqual([])
    expect(toPath('name')).toEqual(['name'])
    expect(toPath(['profile', 'city'])).toEqual(['profile', 'city'])
    expect(columnKey({ key: 0 }, 'fallback')).toBe('0')
    expect(columnKey({ dataIndex: ['profile', 'city'] })).toBe('profile.city')
    expect(columnKey({}, 'fallback')).toBe('fallback')

    const unchanged = { name: 'Ada' }
    expect(setValue(unchanged, undefined, 'ignored')).toBe(unchanged)
    expect(getValue({ profile: null }, ['profile', 'city'])).toBeUndefined()
    const replacedNested = setValue({ profile: { city: 'Paris' } }, ['profile', 'city'], 'London')
    expect(replacedNested).toEqual({ profile: { city: 'London' } })
    expect(setValue({ profile: 'unknown' }, ['profile', 'city'], 'London')).toEqual({
      profile: { city: 'London' },
    })

    expect(resolveRowKey({ id: 1 }, 'id')).toBe(1)
    expect(resolveRowKey({ slug: 'ada' }, (record) => record.slug as string)).toBe('ada')
    expect(resolveRowKey({ id: true }, 'id')).toBeUndefined()
  })

  it('flattens columns and resolves value enums in object and factory forms', () => {
    const nested: ProColumns<Row>[] = [
      {
        title: 'Group',
        columns: [{ dataIndex: 'name' }, { dataIndex: 'status' }],
      },
      { dataIndex: 'score' },
    ]
    expect(flattenColumns(nested).map((column) => column.dataIndex)).toEqual([
      'name',
      'status',
      'score',
    ])
    expect(getValueEnumOptions()).toEqual([])
    expect(
      getValueEnumOptions(() => ({
        active: 'Active',
        disabled: { text: 'Disabled', disabled: true },
      })),
    ).toEqual([
      { label: 'Active', value: 'active', disabled: undefined },
      { label: 'Disabled', value: 'disabled', disabled: true },
    ])
    expect(getValueEnumItem({ active: 'Active' }, 'active')).toEqual({ text: 'Active' })
    expect(getValueEnumItem(() => ({ active: { text: 'Active' } }), 'missing')).toBeUndefined()
    expect(getValueEnumItem({ active: 'Active' }, {})).toBeUndefined()

    const numericMap = new Map<number, string | { text: string }>([
      [1, 'One'],
      [2, { text: 'Two' }],
    ])
    expect(getValueEnumOptions(numericMap).map((item) => item.value)).toEqual([1, 2])
    expect(getValueEnumItem(numericMap, 2)).toEqual({ text: 'Two' })
    expect(getValueEnumItem(numericMap, '1')).toEqual({ text: 'One' })
    expect(getValueEnumOptions({ first: { text: 'First', value: 1 }, second: 'Second' })).toEqual([
      { label: 'First', value: 1, disabled: undefined },
      { label: 'Second', value: 'second', disabled: undefined },
    ])
    expect(getValueEnumItem({ first: { text: 'First', value: 1 } }, 1)).toEqual({
      text: 'First',
      value: 1,
    })
  })

  it('applies local search, filters and sorting in a deterministic order', () => {
    const rows: Row[] = [
      { id: 1, name: 'Ada', status: 'active', score: 80 },
      { id: 2, name: 'Grace', status: 'disabled', score: 99 },
      { id: 3, name: 'Adam', status: 'active', score: 95 },
    ]

    expect(
      applyLocalQuery(
        rows,
        columns,
        { name: 'ad' },
        { score: 'descend' },
        { status: ['active'] },
      ).map((row) => row.id),
    ).toEqual([3, 1])
  })

  it('covers empty searches, array matching, custom sorters and comparison edge cases', () => {
    const rows: Row[] = [
      { id: 1, name: 'Ada', status: 'active', score: 80 },
      { id: 2, name: 'Grace', status: 'disabled', score: 99 },
      { id: 3, name: 'Lin', status: 'active', score: 80 },
    ]
    const searchable: ProColumns<Row>[] = [
      { key: 'name', dataIndex: 'name' },
      { key: 'status', dataIndex: 'status', search: false },
      { key: 'score', dataIndex: 'score', sorter: (left, right) => left.id - right.id },
      { key: 'hidden', dataIndex: 'profile', hideInSearch: true },
      { key: 'virtual' },
    ]

    expect(
      buildSearchParams(searchable, {
        name: '',
        status: null,
        score: [],
        hidden: undefined,
      }),
    ).toEqual({})
    expect(
      applyLocalQuery(rows, searchable, { name: ['ada', 'grace'] }, {}, {}).map(
        (record) => record.id,
      ),
    ).toEqual([1, 2])
    expect(applyLocalQuery(rows, searchable, { score: 80 }, {}, {})).toHaveLength(2)
    expect(applyLocalQuery(rows, searchable, { name: 'missing' }, {}, {})).toEqual([])
    expect(
      applyLocalQuery(rows, searchable, {}, { missing: 'ascend', score: 'descend' }, {}).map(
        (record) => record.id,
      ),
    ).toEqual([3, 2, 1])
    expect(applyLocalQuery(rows, searchable, {}, {}, { missing: ['x'], name: null })).toEqual(rows)

    const comparableRows = [
      { id: 1, value: null },
      { id: 2, value: 2 },
      { id: 3, value: undefined },
      { id: 4, value: 1 },
    ]
    expect(
      applyLocalQuery(
        comparableRows,
        [{ dataIndex: 'value', sorter: true }],
        {},
        { value: 'ascend' },
        {},
      ).map((record) => record.id),
    ).toEqual([1, 3, 4, 2])

    const firstCircular: Record<string, unknown> = {}
    const secondCircular: Record<string, unknown> = {}
    firstCircular.self = firstCircular
    secondCircular.self = secondCircular
    expect(
      applyLocalQuery(
        [
          { id: 1, value: firstCircular },
          { id: 2, value: secondCircular },
        ],
        [{ dataIndex: 'value', sorter: true }],
        {},
        { value: 'ascend' },
        {},
      ),
    ).toHaveLength(2)
  })

  it('supports nested paths without mutating the source record', () => {
    const source: Row = { id: 1, name: 'Ada', status: 'active', score: 80 }
    const changed = setValue(source, ['profile', 'city'], 'London')

    expect(getValue(changed, ['profile', 'city'])).toBe('London')
    expect(source.profile).toBeUndefined()
    expect(
      buildSearchParams(
        [
          { dataIndex: ['profile', 'city'] },
          { dataIndex: 'score', search: { transform: (value) => ({ minimum: value }) } },
        ],
        { 'profile.city': 'London', score: 80 },
      ),
    ).toEqual({ profile: { city: 'London' }, minimum: 80 })
  })

  it('inserts, locates and removes tree records by the configured key', () => {
    const root: Row = { id: 1, name: 'Root', status: 'active', score: 0 }
    const child: Row = { id: 2, name: 'Child', status: 'active', score: 1 }
    const inserted = insertRecord([root], child, 'bottom', 1, 'id')

    expect(inserted.inserted).toBe(true)
    expect(findRecord(inserted.rows, 2, 'id')).toEqual(child)
    expect(removeRecord(inserted.rows, 2, 'id')).toEqual([root])
  })

  it('replaces, inserts and removes records across root and nested positions', () => {
    const child: Row = { id: 2, name: 'Child', status: 'active', score: 1 }
    const sibling: Row = { id: 3, name: 'Sibling', status: 'active', score: 2 }
    const root: Row = {
      id: 1,
      name: 'Root',
      status: 'active',
      score: 0,
      children: [child, sibling],
    }
    const replacement = { ...child, name: 'Updated' }

    expect(recordsInTree([root]).map((record) => record.id)).toEqual([1, 2, 3])
    expect(cloneRecord(root)).not.toBe(root)
    expect(replaceRecord([root], 2, replacement, 'id')[0]?.children?.[0]).toEqual(replacement)
    expect(replaceRecord([root], 1, { ...root, name: 'New root' }, 'id')[0]?.name).toBe('New root')
    expect(insertRecord([root], replacement, 'top').rows[0]).toEqual(replacement)
    expect(insertRecord([root], replacement, 'bottom').rows.at(-1)).toEqual(replacement)
    expect(
      insertRecord([root], { ...replacement, id: 4 }, 'top', 1, 'id').rows[0]?.children?.[0]?.id,
    ).toBe(4)
    expect(insertRecord([root], { ...replacement, id: 4 }, 'bottom', 2, 'id').inserted).toBe(true)
    expect(insertRecord([root], { ...replacement, id: 4 }, 'bottom', 99, 'id').inserted).toBe(false)
    expect(removeRecord([root], 2, 'id')[0]?.children).toEqual([sibling])
    expect(removeRecord([{ ...root, children: [child] }], 2, 'id')[0]).not.toHaveProperty(
      'children',
    )
    expect(removeRecord([root], 1, 'id')).toEqual([])
  })

  it('loads and persists cloned column state through local and session storage', () => {
    const state: Record<string, ProColumnsState> = { name: { show: true, order: 1 } }
    const onChange = vi.fn()
    const controlled = loadColumnsState({ value: state })
    expect(controlled).toEqual(state)
    expect(controlled).not.toBe(state)
    expect(controlled.name).not.toBe(state.name)

    expect(loadColumnsState({ defaultValue: state })).toEqual(state)
    window.localStorage.setItem('columns', JSON.stringify({ score: { fixed: 'right' } }))
    expect(loadColumnsState({ persistenceKey: 'columns' })).toEqual({
      score: { fixed: 'right' },
    })
    window.sessionStorage.setItem('session-columns', JSON.stringify({ name: { show: false } }))
    expect(
      loadColumnsState({
        persistenceKey: 'session-columns',
        persistenceType: 'sessionStorage',
      }),
    ).toEqual({ name: { show: false } })

    window.localStorage.setItem('broken-columns', '{')
    expect(loadColumnsState({ persistenceKey: 'broken-columns', defaultValue: state })).toEqual(
      state,
    )

    persistColumnsState(state, { persistenceKey: 'saved-columns', onChange })
    expect(onChange).toHaveBeenCalledWith(state)
    expect(JSON.parse(window.localStorage.getItem('saved-columns') ?? '{}')).toEqual(state)
    persistColumnsState(state, undefined)
    persistColumnsState(state, { onChange })

    vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
      throw new Error('storage unavailable')
    })
    expect(() => persistColumnsState(state, { persistenceKey: 'blocked' })).not.toThrow()
  })
})
