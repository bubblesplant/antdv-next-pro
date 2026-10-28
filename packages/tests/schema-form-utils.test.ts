import { beforeEach, describe, expect, it } from 'vite-plus/test'

import type { SchemaFormColumn } from '../src/types'
import {
  buildSchemaSteps,
  buildSubmitValues,
  cloneValue,
  convertInboundValues,
  getValue,
  mergeValues,
  normalizePath,
  readUrlValues,
  reconcileUrlValues,
  recordsEqual,
  replaceRecord,
  schemaFieldNames,
  setValue,
  writeUrlValues,
  type FormRecord,
} from '../src/schema-form/utils'

describe('schema form value utilities', () => {
  it('reads and writes nested paths without mutating unrelated values', () => {
    const values: FormRecord = { profile: { name: 'Ada' } }

    setValue(values, ['profile', 'age'], 36)
    setValue(values, ['tags', 0], 'vue')

    expect(getValue(values, ['profile', 'name'])).toBe('Ada')
    expect(getValue(values, ['profile', 'age'])).toBe(36)
    expect(getValue(values, ['tags', 0])).toBe('vue')
  })

  it('normalizes paths and clones, merges and replaces values deeply', () => {
    const path = ['profile', 0] as const
    expect(normalizePath()).toEqual([])
    expect(normalizePath('name')).toEqual(['name'])
    expect(normalizePath(0)).toEqual([0])
    expect(normalizePath(path)).toEqual(path)

    const empty: FormRecord = {}
    setValue(empty, [], 'ignored')
    setValue(empty, ['members', 0, 'name'], 'Ada')
    expect(empty).toEqual({ members: [{ name: 'Ada' }] })
    expect(getValue(null, ['name'])).toBeUndefined()

    const createdAt = new Date('2026-08-23T00:00:00.000Z')
    const source = { nested: { left: 1 }, list: [{ createdAt }] }
    const cloned = cloneValue(source)
    expect(cloned).toEqual(source)
    expect(cloned).not.toBe(source)
    expect(cloned.list[0]?.createdAt).not.toBe(createdAt)

    expect(
      mergeValues({ nested: { left: 1 }, keep: true }, null, {
        nested: { right: 2 },
        list: [1, 2],
      }),
    ).toEqual({ nested: { left: 1, right: 2 }, keep: true, list: [1, 2] })

    const target = { old: true, nested: { value: 1 } }
    replaceRecord(target, { next: true, nested: { value: 2 } })
    expect(target).toEqual({ next: true, nested: { value: 2 } })
  })

  it('only recursively clones arrays and plain objects while preserving value objects', () => {
    class ValueObject {
      constructor(readonly value: string) {}
    }

    const valueObject = new ValueObject('immutable')
    const nullPrototype = Object.assign(Object.create(null) as FormRecord, {
      nested: { enabled: true },
    })
    const cloned = cloneValue({ valueObject, nullPrototype })

    expect(cloned.valueObject).toBe(valueObject)
    expect(cloned.valueObject).toBeInstanceOf(ValueObject)
    expect(cloned.nullPrototype).not.toBe(nullPrototype)
    expect(Object.getPrototypeOf(cloned.nullPrototype)).toBeNull()
    expect(cloned.nullPrototype.nested).toEqual({ enabled: true })
    expect(cloned.nullPrototype.nested).not.toBe(nullPrototype.nested)
  })

  it('reconciles URL-owned fields without removing unrelated form state', () => {
    const fieldNames = ['name', 'age', 'profile.city']
    const current = {
      name: 'Ada',
      age: 36,
      localOnly: true,
      profile: { city: 'London', timezone: 'UTC' },
    }

    expect(
      reconcileUrlValues(current, { name: 'Grace', profile: { city: 'Paris' } }, fieldNames),
    ).toEqual({
      name: 'Grace',
      localOnly: true,
      profile: { city: 'Paris', timezone: 'UTC' },
    })
    expect(reconcileUrlValues(current, {}, fieldNames)).toEqual({
      localOnly: true,
      profile: { timezone: 'UTC' },
    })
  })

  it('runs convertValue only while values enter the form', () => {
    const columns: SchemaFormColumn<FormRecord>[] = [
      {
        dataIndex: 'amount',
        convertValue: (value) => Number(value),
      },
      {
        valueType: 'group',
        columns: [
          {
            dataIndex: ['profile', 'name'],
            convertValue: (value) => String(value).trim(),
          },
        ],
      },
    ]
    const source = { amount: '42', profile: { name: ' Ada ' } }

    const converted = convertInboundValues(columns, source)

    expect(converted).toEqual({ amount: 42, profile: { name: 'Ada' } })
    expect(source).toEqual({ amount: '42', profile: { name: ' Ada ' } })
  })

  it('converts form-list records and safely normalizes invalid list entries', () => {
    const columns: SchemaFormColumn<FormRecord>[] = [
      {
        dataIndex: 'members',
        valueType: 'formList',
        columns: [
          {
            dataIndex: 'name',
            convertValue: (value) => String(value).trim(),
          },
        ],
      },
      { dataIndex: 'missing', convertValue: () => 'ignored' },
    ]

    expect(
      convertInboundValues(columns, {
        members: [{ name: ' Ada ' }, 'invalid'],
      }),
    ).toEqual({ members: [{ name: 'Ada' }, {}] })
  })

  it('runs transform only while building submitted values, including form lists', () => {
    const columns: SchemaFormColumn<FormRecord>[] = [
      {
        dataIndex: 'password',
        transform: (value) => ({ passwordHash: `hash:${String(value)}` }),
      },
      {
        dataIndex: 'price',
        transform: (value) => Number(value) * 100,
      },
      {
        dataIndex: 'members',
        valueType: 'formList',
        columns: [
          { dataIndex: 'name' },
          {
            dataIndex: 'role',
            transform: (value) => ({ normalizedRole: String(value).toUpperCase() }),
          },
        ],
      },
    ]

    expect(
      buildSubmitValues(columns, {
        password: 'secret',
        price: '12.50',
        ignored: true,
        members: [{ name: 'Ada', role: 'owner' }],
      }),
    ).toEqual({
      passwordHash: 'hash:secret',
      price: 1250,
      members: [{ name: 'Ada', normalizedRole: 'OWNER' }],
    })
  })

  it('skips non-fields and preserves non-array form-list values and primitive rows', () => {
    const columns: SchemaFormColumn<FormRecord>[] = [
      { dataIndex: 'hidden', hideInForm: true },
      { valueType: 'divider' },
      { valueType: 'option' },
      { valueType: 'index' },
      { valueType: 'indexBorder' },
      { dataIndex: 'plain' },
      { dataIndex: 'missing' },
      { dataIndex: 'invalidList', valueType: 'formList', columns: [{ dataIndex: 'name' }] },
      { dataIndex: 'members', valueType: 'formList', columns: [{ dataIndex: 'name' }] },
      {
        valueType: 'group',
        columns: [
          {
            dataIndex: 'profile',
            transform: () => ({ account: { active: true } }),
          },
          {
            dataIndex: 'role',
            transform: () => ({ account: { role: 'owner' } }),
          },
        ],
      },
    ]

    expect(
      buildSubmitValues(columns, {
        hidden: 'secret',
        plain: 'value',
        invalidList: 'legacy',
        members: ['raw', { name: 'Ada' }],
        profile: true,
        role: 'admin',
      }),
    ).toEqual({
      plain: 'value',
      invalidList: 'legacy',
      members: ['raw', { name: 'Ada' }],
      account: { active: true, role: 'owner' },
    })
  })

  it('derives steps from top-level groups and falls back to one step', () => {
    const grouped: SchemaFormColumn<FormRecord>[] = [
      { title: 'Account', valueType: 'group', columns: [{ dataIndex: 'name' }] },
      { title: 'Profile', valueType: 'formSet', columns: [{ dataIndex: 'bio' }] },
    ]

    expect(buildSchemaSteps(grouped)).toEqual([
      { title: 'Account', columns: [{ dataIndex: 'name' }] },
      { title: 'Profile', columns: [{ dataIndex: 'bio' }] },
    ])
    expect(buildSchemaSteps([{ dataIndex: 'name' }])).toHaveLength(1)
  })

  it('resolves functional and fallback step titles and derives field names', () => {
    const grouped: SchemaFormColumn<FormRecord>[] = [
      {
        title: (column) =>
          `Dynamic ${typeof column.valueType === 'string' ? column.valueType : 'custom'}`,
        valueType: 'group',
        columns: [{ dataIndex: ['profile', 'name'] }],
      },
      {
        valueType: 'formSet',
        columns: [{ dataIndex: 'status' }],
      },
      { dataIndex: 'hidden', hideInForm: true },
    ]

    expect(buildSchemaSteps(grouped).map((step) => step.title)).toEqual(['Dynamic group', 'Step 2'])
    expect(
      schemaFieldNames([
        { dataIndex: 'members', valueType: 'formList', columns: [{ dataIndex: 'name' }] },
        {
          valueType: 'group',
          columns: [{ dataIndex: ['profile', 'name'] }, { valueType: 'divider' }],
        },
      ]),
    ).toEqual(['members', 'profile.name'])
  })

  it('compares serializable and cyclic records safely', () => {
    expect(recordsEqual({ name: 'Ada' }, { name: 'Ada' })).toBe(true)
    expect(recordsEqual({ name: 'Ada' }, { name: 'Grace' })).toBe(false)
    const circular: FormRecord = {}
    circular.self = circular
    expect(recordsEqual(circular, {})).toBe(false)
  })
})

describe('schema form URL synchronization', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/schema-form?preserved=yes')
  })

  it('keeps unrelated query parameters and synchronizes configured fields', () => {
    writeUrlValues(true, { keyword: 'vite', page: 2 }, ['keyword', 'page', 'empty'])

    expect(new URLSearchParams(window.location.search).get('preserved')).toBe('yes')
    expect(readUrlValues(true, ['keyword', 'page'])).toEqual({ keyword: 'vite', page: 2 })
  })

  it('supports a namespaced query value and hash mode', () => {
    writeUrlValues({ key: 'filters' }, { keyword: 'vue' }, ['keyword'])
    expect(readUrlValues({ key: 'filters' }, ['keyword'])).toEqual({ keyword: 'vue' })

    writeUrlValues({ mode: 'hash' }, { status: ['open'] }, ['status'])
    expect(readUrlValues({ mode: 'hash' }, ['status'])).toEqual({ status: ['open'] })
  })

  it('handles disabled, missing, invalid and cleared URL values', () => {
    expect(readUrlValues(false, ['keyword'])).toEqual({})
    expect(readUrlValues({ key: 'missing' }, ['keyword'])).toEqual({})

    window.history.replaceState({}, '', '/schema-form?filters=1&keyword=plain')
    expect(readUrlValues({ key: 'filters' }, ['keyword'])).toEqual({})
    expect(readUrlValues(true, ['keyword'])).toEqual({ keyword: 'plain' })

    writeUrlValues(true, { keyword: '', page: null }, ['keyword', 'page'])
    const params = new URLSearchParams(window.location.search)
    expect(params.has('keyword')).toBe(false)
    expect(params.has('page')).toBe(false)
  })
})
