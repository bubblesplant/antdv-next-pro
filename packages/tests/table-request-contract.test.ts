import type { VueWrapper } from '@vue/test-utils'
import type { ProColumns, ProTableInstance } from '../src/types'
import { config, flushPromises, shallowMount } from '@vue/test-utils'
import { Pagination, Table } from 'antdv-next'
import dayjs from 'dayjs'
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vite-plus/test'
import { defineComponent, h, nextTick } from 'vue'
import ProTable from '../src/ProTable.vue'

interface Row extends Record<string, unknown> {
  id: number
  name: string
}
let wrapper: VueWrapper | undefined
const defaultSlot = config.global.renderStubDefaultSlot
const SearchStub = defineComponent({
  name: 'Search',
  emits: ['submit', 'reset'],
  setup(_props, { emit, expose }) {
    expose({ reset: () => emit('reset') })
    return () => h('div', { 'data-search-stub': '' })
  },
})
const base = { columns: [{ dataIndex: 'name' }], toolbar: false as const }
const global = { stubs: { Search: SearchStub } }
const action = () => wrapper!.vm as unknown as ProTableInstance<Row>
const submit = (values: Record<string, unknown>) =>
  wrapper!.findComponent(SearchStub).vm.$emit('submit', values)

beforeAll(() => {
  config.global.renderStubDefaultSlot = true
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: false,
      media: query,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  )
})
afterAll(() => {
  config.global.renderStubDefaultSlot = defaultSlot
})
beforeEach(() => {
  vi.useFakeTimers()
})
afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('table request contract', () => {
  it('formats dates before search transform, snapshots beforeSearchSubmit and debounces only the last query', async () => {
    const order: string[] = []
    const transform = vi.fn((value) => {
      order.push('transform')
      expect(typeof value).toBe('number')
      return { since: value }
    })
    const before = vi.fn((values) => {
      order.push('before')
      return { ...values, accepted: true }
    })
    const request = vi.fn(async (_params: Record<string, unknown>) => ({ data: [] }))
    const onSubmit = vi.fn()
    const columns: ProColumns[] = [
      { dataIndex: 'date', valueType: 'dateTime', search: { transform } },
    ]
    wrapper = shallowMount(ProTable, {
      props: {
        ...base,
        columns,
        request,
        dateFormatter: 'number',
        beforeSearchSubmit: before,
        onSubmit,
        debounceTime: 30,
      },
      global,
    })
    await flushPromises()
    order.length = 0
    before.mockClear()
    request.mockClear()
    submit({ date: dayjs('2026-01-01') })
    submit({ date: dayjs('2026-02-01') })
    expect(order).toEqual(['transform', 'before', 'transform', 'before'])
    expect(onSubmit).toHaveBeenCalledTimes(2)
    await vi.advanceTimersByTimeAsync(29)
    expect(request).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(1)
    await flushPromises()
    expect(request.mock.calls.at(-1)?.[0]).toMatchObject({
      since: dayjs('2026-02-01').valueOf(),
      accepted: true,
      current: 1,
    })
    await action().reload()
    action().setPageInfo({ current: 2 })
    await flushPromises()
    expect(before).toHaveBeenCalledTimes(2)
    expect(request.mock.calls.at(-1)?.[0]).toMatchObject({ current: 2 })
  })

  it('preserves unformatted values, gives explicit params precedence and reports beforeSearchSubmit errors without changing the query', async () => {
    const date = dayjs('2026-03-01')
    const request = vi.fn(async (_params: Record<string, unknown>) => ({
      data: [{ id: 1, name: 'kept' }],
    }))
    const before = vi.fn((values) => {
      if (values.name === 'reject') throw new Error('invalid query')
      return values
    })
    wrapper = shallowMount(ProTable, {
      props: {
        ...base,
        columns: [{ dataIndex: 'date', valueType: 'date' }, { dataIndex: 'name' }],
        request,
        params: { name: 'explicit' },
        dateFormatter: false,
        beforeSearchSubmit: before,
        debounceTime: 0,
      },
      global,
    })
    await flushPromises()
    submit({ date, name: 'accepted' })
    await vi.advanceTimersByTimeAsync(1)
    await flushPromises()
    expect(request.mock.calls.at(-1)?.[0].date).toBe(date)
    expect(request.mock.calls.at(-1)?.[0].name).toBe('explicit')
    const count = request.mock.calls.length
    submit({ name: 'reject' })
    await vi.advanceTimersByTimeAsync(100)
    await flushPromises()
    expect(request).toHaveBeenCalledTimes(count)
    expect(wrapper.emitted('requestError')?.at(-1)?.[0]).toBeInstanceOf(Error)
    expect(action().getRowsData()[0]?.name).toBe('kept')
    await action().reload()
    expect(request.mock.calls.at(-1)?.[0].date).toBe(date)
  })

  it('cancels pending search on reset and calls reset/loading callbacks once with native loading options intact', async () => {
    const request = vi.fn(async (_params: Record<string, unknown>) => ({ data: [] }))
    const onReset = vi.fn()
    const onLoadingChange = vi.fn()
    wrapper = shallowMount(ProTable, {
      props: {
        ...base,
        request,
        debounceTime: 100,
        loading: { delay: 75, tip: 'Loading' },
        onReset,
        onLoadingChange,
      },
      global,
    })
    await flushPromises()
    expect(onLoadingChange.mock.calls.map((call) => call[0])).toEqual([true, false])
    expect(wrapper.findComponent(Table).props('loading')).toMatchObject({
      delay: 75,
      tip: 'Loading',
      spinning: false,
    })
    request.mockClear()
    onLoadingChange.mockClear()
    submit({ name: 'pending' })
    await action().reset()
    await vi.advanceTimersByTimeAsync(150)
    await flushPromises()
    expect(request).toHaveBeenCalledTimes(1)
    expect(onReset).toHaveBeenCalledTimes(1)
    expect(onLoadingChange.mock.calls.map((call) => call[0])).toEqual([true, false])
    wrapper.findComponent(SearchStub).vm.$emit('reset')
    await flushPromises()
    expect(onReset).toHaveBeenCalledTimes(2)
    expect(request).toHaveBeenCalledTimes(2)
  })

  it('uses the latest rows for polling, applies a 2000 ms minimum and schedules only after slow requests finish', async () => {
    const pending: Array<(value: { data: Row[] }) => void> = []
    const request = vi.fn(() => new Promise<{ data: Row[] }>((resolve) => pending.push(resolve)))
    const polling = vi.fn((_rows: Record<string, unknown>[]) => 10)
    wrapper = shallowMount(ProTable, {
      props: { ...base, search: false, request, polling },
      global,
    })
    await nextTick()
    await vi.advanceTimersByTimeAsync(6000)
    expect(request).toHaveBeenCalledTimes(1)
    pending[0]!({ data: [{ id: 1, name: 'latest' }] })
    await flushPromises()
    expect(polling.mock.calls.at(-1)?.[0]).toEqual([{ id: 1, name: 'latest' }])
    await vi.advanceTimersByTimeAsync(1999)
    expect(request).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(1)
    expect(request).toHaveBeenCalledTimes(2)
    await vi.advanceTimersByTimeAsync(6000)
    expect(request).toHaveBeenCalledTimes(2)
    pending[1]!({ data: [] })
    await flushPromises()
    const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(true)
    await vi.advanceTimersByTimeAsync(4000)
    expect(request).toHaveBeenCalledTimes(2)
    hidden.mockReturnValue(false)
    await vi.advanceTimersByTimeAsync(2000)
    expect(request).toHaveBeenCalledTimes(3)
    pending[2]!({ data: [] })
    await flushPromises()
    wrapper.unmount()
    wrapper = undefined
    await vi.advanceTimersByTimeAsync(6000)
    expect(request).toHaveBeenCalledTimes(3)
  })

  it('keeps cursor history, sends no current, refuses unknown pages and resets cursor once on size/type/search changes', async () => {
    const request = vi.fn(async (params: Record<string, unknown>) => ({
      data: [{ id: params.nextToken ? 2 : 1, name: 'row' }],
      nextToken: params.nextToken ? undefined : 'second',
    }))
    const changed = vi.fn()
    wrapper = shallowMount(ProTable, {
      props: {
        ...base,
        request,
        pagination: { type: 'cursor', pageSize: 1, onChange: changed },
        debounceTime: 0,
      },
      global,
    })
    await flushPromises()
    expect(request.mock.calls[0]?.[0]).toEqual({ pageSize: 1 })
    action().setPageInfo({ current: 2 })
    await flushPromises()
    expect(request.mock.calls.at(-1)?.[0]).toEqual({ pageSize: 1, nextToken: 'second' })
    action().setPageInfo({ current: 3 })
    await flushPromises()
    expect(request).toHaveBeenCalledTimes(2)
    action().setPageInfo({ current: 1 })
    await flushPromises()
    expect(request.mock.calls.at(-1)?.[0]).toEqual({ pageSize: 1 })
    await wrapper.setProps({ pagination: { type: 'cursor', pageSize: 2, onChange: changed } })
    await flushPromises()
    expect(request).toHaveBeenCalledTimes(4)
    expect(request.mock.calls.at(-1)?.[0]).toEqual({ pageSize: 2 })
    wrapper.findComponent(Pagination).vm.$emit('change', 2, 2)
    await flushPromises()
    expect(changed).toHaveBeenCalledTimes(1)
    expect(request.mock.calls.at(-1)?.[0].nextToken).toBe('second')
    submit({ name: 'new' })
    await vi.advanceTimersByTimeAsync(1)
    await flushPromises()
    expect(request.mock.calls.at(-1)?.[0]).toEqual({ pageSize: 2, name: 'new' })
    await wrapper.setProps({ pagination: { type: 'offset', current: 1, pageSize: 3 } })
    await flushPromises()
    expect(request).toHaveBeenCalledTimes(7)
    expect(request.mock.calls.at(-1)?.[0]).toMatchObject({ pageSize: 3, current: 1 })
  })

  it('preserves successful data when success=false and ignores stale responses', async () => {
    const pending: Array<(value: { data: Row[]; success?: boolean }) => void> = []
    const request = vi.fn(
      () => new Promise<{ data: Row[]; success?: boolean }>((resolve) => pending.push(resolve)),
    )
    wrapper = shallowMount(ProTable, {
      props: {
        ...base,
        request,
        search: false,
        defaultDataSource: [{ id: 0, name: 'initial' }],
        params: { id: 1 },
      },
      global,
    })
    await wrapper.setProps({ params: { id: 2 } })
    pending[1]!({ data: [{ id: 2, name: 'latest' }] })
    await flushPromises()
    pending[0]!({ data: [{ id: 1, name: 'stale' }] })
    await flushPromises()
    expect(action().getRowsData()[0]?.name).toBe('latest')
    const refreshing = action().reload()
    pending[2]!({ data: [], success: false })
    await refreshing
    expect(action().getRowsData()[0]?.name).toBe('latest')
    expect(wrapper.emitted('requestError')).toHaveLength(1)
  })
})
