import {
  computed,
  getCurrentInstance,
  onScopeDispose,
  readonly,
  ref,
  shallowRef,
  unref,
  watch,
  type ComputedRef,
  type MaybeRef,
  type Ref,
} from 'vue'
import { useProConfig } from '../provider/context'
import type { ProRequestCacheEntry } from '../provider/types'

import {
  resolveLocalFieldOptions,
  stableSerialize,
  type ResolvableProFormValueEnum,
} from './options'
import type { ProFormFieldOption, ProFormFieldRequest } from './types'

export interface UseFieldOptionsInput<
  OptionValue = unknown,
  Params extends Record<string, unknown> = Record<string, unknown>,
> {
  options?: MaybeRef<readonly unknown[] | undefined>
  fieldOptions?: MaybeRef<readonly unknown[] | undefined>
  valueEnum?: MaybeRef<ResolvableProFormValueEnum<OptionValue> | undefined>
  request?: MaybeRef<ProFormFieldRequest<OptionValue, Params> | undefined>
  params?: MaybeRef<Params | undefined>
  keyWords?: MaybeRef<string | undefined>
  debounceTime?: MaybeRef<number | undefined>
  proFieldKey?: MaybeRef<string | undefined>
  cacheForSwr?: MaybeRef<boolean | undefined>
  onRequestError?: (error: unknown) => void
}

export interface UseFieldOptionsReturn<OptionValue = unknown> {
  options: ComputedRef<Array<ProFormFieldOption<OptionValue>>>
  loading: Readonly<Ref<boolean>>
  error: Readonly<Ref<unknown>>
  refresh: () => Promise<void>
  search: (keyWords: string) => void
}

const requestIds = new WeakMap<Function, number>()
let nextRequestId = 0

export function useFieldOptions<
  OptionValue = unknown,
  Params extends Record<string, unknown> = Record<string, unknown>,
>(source: UseFieldOptionsInput<OptionValue, Params>): UseFieldOptionsReturn<OptionValue> {
  const remoteOptions = shallowRef<Array<ProFormFieldOption<OptionValue>>>([])
  const hasRemoteResult = ref(false)
  const loading = ref(false)
  const error = shallowRef<unknown>()
  let active = true
  let sequence = 0
  let debounceTimer: ReturnType<typeof setTimeout> | undefined
  const searchValue = ref<string>()
  const provider = getCurrentInstance() ? useProConfig() : undefined
  const cache = provider?.cache ?? new Map<string, ProRequestCacheEntry>()

  const localOptions = computed(() =>
    resolveLocalFieldOptions<OptionValue>({
      options: unref(source.options),
      fieldOptions: unref(source.fieldOptions),
      valueEnum: unref(source.valueEnum),
    }),
  )

  const options = computed(() => {
    const request = unref(source.request)
    return request && hasRemoteResult.value ? remoteOptions.value : localOptions.value
  })

  async function load(force = false): Promise<void> {
    if (!active) return

    const request = unref(source.request)
    const currentSequence = ++sequence

    if (!request) {
      hasRemoteResult.value = false
      remoteOptions.value = []
      error.value = undefined
      loading.value = false
      return
    }

    loading.value = true
    error.value = undefined
    try {
      if (!requestIds.has(request)) requestIds.set(request, ++nextRequestId)
      const keyWords = unref(source.keyWords) ?? searchValue.value
      const params =
        keyWords === undefined
          ? unref(source.params)
          : Object.assign({} as Params, unref(source.params), { keyWords })
      const cacheKey = `${provider?.contentHash?.value ?? ''}:${requestIds.get(request)}:${unref(source.proFieldKey) ?? ''}:${stableSerialize(params)}`
      const useCache = unref(source.cacheForSwr) !== false
      let entry = useCache && !force ? cache.get(cacheKey) : undefined
      if (!entry) {
        const promise = Promise.resolve(request(params))
        entry = { promise }
        if (useCache) cache.set(cacheKey, entry)
        promise.then(
          (value) => {
            entry!.value = value
            entry!.promise = undefined
          },
          () => {
            if (cache.get(cacheKey) === entry) cache.delete(cacheKey)
          },
        )
      }
      const result = (entry.promise ? await entry.promise : entry.value) as Awaited<
        ReturnType<typeof request>
      >
      if (!active || currentSequence !== sequence) return

      remoteOptions.value = resolveLocalFieldOptions<OptionValue>({ options: result })
      hasRemoteResult.value = true
      error.value = undefined
    } catch (requestError) {
      if (!active || currentSequence !== sequence) return

      error.value = requestError
      source.onRequestError?.(requestError)
    } finally {
      if (active && currentSequence === sequence) loading.value = false
    }
  }

  async function refresh(): Promise<void> {
    clearTimeout(debounceTimer)
    return load(true)
  }
  function schedule(): void {
    clearTimeout(debounceTimer)
    // Invalidate pending results as soon as input changes, before the debounced request starts.
    sequence += 1
    const delay = unref(source.debounceTime) ?? 0
    if (delay > 0)
      debounceTimer = setTimeout(() => {
        void load()
      }, delay)
    else void load()
  }
  function search(keyWords: string): void {
    searchValue.value = keyWords
  }

  watch(
    [
      () => unref(source.request),
      () => stableSerialize(unref(source.params)),
      () => unref(source.keyWords) ?? searchValue.value,
      () => unref(source.proFieldKey),
      () => provider?.contentHash?.value,
    ],
    schedule,
    { immediate: true },
  )

  onScopeDispose(() => {
    active = false
    sequence += 1
    clearTimeout(debounceTimer)
  })

  return {
    options,
    loading: readonly(loading),
    error: readonly(error),
    refresh,
    search,
  }
}
