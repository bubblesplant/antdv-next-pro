import { flushPromises } from '@vue/test-utils'
import { effectScope, nextTick, ref } from 'vue'
import { describe, expect, it, vi } from 'vite-plus/test'

import {
  getValueEnumOptions,
  normalizeFieldOption,
  resolveLocalFieldOptions,
  stableSerialize,
} from '../src/pro-form-fields/options'
import { formatReadonlyValue } from '../src/pro-form-fields/readonly'
import { useFieldOptions } from '../src/pro-form-fields/useFieldOptions'
import type {
  ProFormBaseFieldProps,
  ProFormCheckboxProps,
  ProFormSelectProps,
  ProFormTreeSelectProps,
} from '../src/pro-form-fields/types'

describe('ProFormFields public types', () => {
  it('separates model values from individual option values', async () => {
    const select = {
      modelValue: ['first'],
      options: [{ label: 'First', value: 'first' }],
      params: { page: 1 },
      request: async (params) => [params?.page === 1 ? 'first' : 'second'],
    } satisfies ProFormSelectProps<string[], string, { page: number }>
    const checkbox = {
      modelValue: ['read'],
      options: [{ label: 'Read', value: 'read' }],
    } satisfies ProFormCheckboxProps<string[], string>
    const treeSelect = {
      modelValue: [1, 2],
      options: [{ label: 'Node', value: 1 }],
    } satisfies ProFormTreeSelectProps<number[], number>

    expect(select.modelValue).toEqual(['first'])
    await expect(select.request(select.params)).resolves.toEqual(['first'])
    expect(checkbox.options[0]?.value).toBe('read')
    expect(treeSelect.options[0]?.value).toBe(1)
  })

  it('derives an individual option type when only the model generic is provided', () => {
    const select = {
      modelValue: ['first'],
      options: [{ label: 'First', value: 'first' }],
    } satisfies ProFormSelectProps<string[]>
    const checkbox = {
      modelValue: ['read'],
      options: [{ label: 'Read', value: 'read' }],
    } satisfies ProFormCheckboxProps<string[]>
    const treeSelect = {
      modelValue: [1],
      options: [{ label: 'Node', value: 1 }],
    } satisfies ProFormTreeSelectProps<number[]>

    expect(select.options[0]?.value).toBe('first')
    expect(checkbox.options[0]?.value).toBe('read')
    expect(treeSelect.options[0]?.value).toBe(1)
  })

  it('accepts readonly field-name paths through the shared ProDataIndex type', () => {
    const name = ['users', 0, 'email'] as const
    const props = { name } satisfies ProFormBaseFieldProps

    expect(props.name).toBe(name)
  })
})

describe('ProFormFields option normalization', () => {
  it('normalizes primitive and object options while preserving extension fields', () => {
    expect(normalizeFieldOption('enabled')).toEqual({ label: 'enabled', value: 'enabled' })
    expect(normalizeFieldOption({ text: 'Disabled', key: 2, disabled: 1, tone: 'muted' })).toEqual({
      text: 'Disabled',
      key: 2,
      disabled: true,
      tone: 'muted',
      label: 'Disabled',
      value: 2,
    })
  })

  it('keeps numeric values from ReadonlyMap and explicit item.value', () => {
    const mapOptions = getValueEnumOptions(
      new Map<number, string | { text: string }>([
        [1, 'One'],
        [2, { text: 'Two' }],
      ]),
    )
    const objectOptions = getValueEnumOptions({
      first: { text: 'First', value: 1 },
      second: 'Second',
    })

    expect(mapOptions.map((item) => item.value)).toEqual([1, 2])
    expect(objectOptions).toEqual([
      { text: 'First', value: 1, label: 'First', disabled: false },
      { label: 'Second', value: 'second' },
    ])
  })

  it('uses top-level options, then field options, then valueEnum, including empty arrays', () => {
    const valueEnum = { fallback: 'Fallback' }
    expect(
      resolveLocalFieldOptions({
        options: [],
        fieldOptions: [{ label: 'Field', value: 'field' }],
        valueEnum,
      }),
    ).toEqual([])
    expect(
      resolveLocalFieldOptions({
        fieldOptions: [{ label: 'Field', value: 'field' }],
        valueEnum,
      }),
    ).toEqual([{ label: 'Field', value: 'field', disabled: false }])
    expect(resolveLocalFieldOptions({ valueEnum })).toEqual([
      { label: 'Fallback', value: 'fallback' },
    ])
  })

  it('serializes params independent of object insertion order', () => {
    expect(stableSerialize({ page: 1, filters: { b: 2, a: 1 } })).toBe(
      stableSerialize({ filters: { a: 1, b: 2 }, page: 1 }),
    )
  })
})

describe('useFieldOptions', () => {
  it('shows local fallback before the first response and treats remote empty results as authoritative', async () => {
    const pending = deferred<Array<{ label: string; value: string }>>()
    const request = vi.fn(() => pending.promise)
    const scope = effectScope()
    const state = scope.run(() =>
      useFieldOptions<string>({
        options: [{ label: 'Local', value: 'local' }],
        request,
      }),
    )!

    expect(request).toHaveBeenCalledTimes(1)
    expect(state.loading.value).toBe(true)
    expect(state.options.value).toEqual([{ label: 'Local', value: 'local', disabled: false }])

    pending.resolve([])
    await flushPromises()
    expect(state.loading.value).toBe(false)
    expect(state.options.value).toEqual([])
    scope.stop()
  })

  it('keeps the last successful result when a later request fails', async () => {
    const params = ref({ page: 1 })
    const requestError = new Error('network failed')
    const onRequestError = vi.fn()
    const request = vi
      .fn()
      .mockResolvedValueOnce([{ label: 'Remote', value: 'remote' }])
      .mockRejectedValueOnce(requestError)
    const scope = effectScope()
    const state = scope.run(() =>
      useFieldOptions<string, { page: number }>({
        options: [{ label: 'Local', value: 'local' }],
        params,
        request,
        onRequestError,
      }),
    )!

    await flushPromises()
    expect(state.options.value).toEqual([{ label: 'Remote', value: 'remote', disabled: false }])

    params.value = { page: 2 }
    await nextTick()
    await flushPromises()

    expect(state.options.value).toEqual([{ label: 'Remote', value: 'remote', disabled: false }])
    expect(state.error.value).toBe(requestError)
    expect(onRequestError).toHaveBeenCalledOnce()
    scope.stop()
  })

  it('allows only the latest request to update options and loading state', async () => {
    const first = deferred<Array<{ label: string; value: string }>>()
    const second = deferred<Array<{ label: string; value: string }>>()
    const params = ref({ page: 1 })
    const request = vi
      .fn()
      .mockImplementationOnce(() => first.promise)
      .mockImplementationOnce(() => second.promise)
    const scope = effectScope()
    const state = scope.run(() => useFieldOptions<string, { page: number }>({ request, params }))!

    params.value = { page: 2 }
    await nextTick()
    expect(request).toHaveBeenCalledTimes(2)

    second.resolve([{ label: 'Latest', value: 'latest' }])
    await flushPromises()
    expect(state.options.value).toEqual([{ label: 'Latest', value: 'latest', disabled: false }])
    expect(state.loading.value).toBe(false)

    first.resolve([{ label: 'Stale', value: 'stale' }])
    await flushPromises()
    expect(state.options.value).toEqual([{ label: 'Latest', value: 'latest', disabled: false }])
    expect(state.loading.value).toBe(false)
    scope.stop()
  })

  it('does not update state or report errors after its scope is disposed', async () => {
    const pending = deferred<Array<{ label: string; value: string }>>()
    const onRequestError = vi.fn()
    const scope = effectScope()
    const state = scope.run(() =>
      useFieldOptions<string>({
        options: [{ label: 'Local', value: 'local' }],
        request: () => pending.promise,
        onRequestError,
      }),
    )!

    scope.stop()
    pending.reject(new Error('late failure'))
    await flushPromises()

    expect(state.options.value).toEqual([{ label: 'Local', value: 'local', disabled: false }])
    expect(state.error.value).toBeUndefined()
    expect(onRequestError).not.toHaveBeenCalled()
  })

  it('does not issue requests or mutate state when refresh is called after disposal', async () => {
    const request = vi.fn().mockResolvedValue([{ label: 'Remote', value: 'remote' }])
    const scope = effectScope()
    const state = scope.run(() => useFieldOptions<string>({ request }))!

    await flushPromises()
    expect(request).toHaveBeenCalledOnce()
    expect(state.options.value).toEqual([{ label: 'Remote', value: 'remote', disabled: false }])

    scope.stop()
    const previousOptions = state.options.value
    const previousLoading = state.loading.value
    const previousError = state.error.value
    await state.refresh()

    expect(request).toHaveBeenCalledOnce()
    expect(state.options.value).toBe(previousOptions)
    expect(state.loading.value).toBe(previousLoading)
    expect(state.error.value).toBe(previousError)
  })
})

describe('readonly formatting', () => {
  it('distinguishes empty, false, zero and empty-array values', () => {
    expect(formatReadonlyValue(undefined)).toBe('-')
    expect(formatReadonlyValue('')).toBe('-')
    expect(formatReadonlyValue(false)).toBe('否')
    expect(formatReadonlyValue(0)).toBe('0')
    expect(formatReadonlyValue([])).toBe('')
  })

  it('formats option labels, ranges, passwords, money, dates and uploads', () => {
    const dateLike = { format: vi.fn(() => '2026-09-14') }
    expect(
      formatReadonlyValue(1, {
        options: [{ label: 'One', value: '1' }],
        type: 'select',
      }),
    ).toBe('One')
    expect(formatReadonlyValue(['start', 'end'], { type: 'dateRange' })).toBe('start ~ end')
    expect(formatReadonlyValue('secret', { type: 'password' })).toBe('••••••')
    expect(formatReadonlyValue(12, { type: 'money' })).toBe('¥12.00')
    expect(formatReadonlyValue(dateLike, { type: 'date' })).toBe('2026-09-14')
    expect(
      formatReadonlyValue([{ name: 'a.txt' }, { fileName: 'b.txt' }], { type: 'upload' }),
    ).toBe('a.txt, b.txt')
    expect(dateLike.format).toHaveBeenCalledWith('YYYY-MM-DD')
  })
})

function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })
  return { promise, resolve, reject }
}
