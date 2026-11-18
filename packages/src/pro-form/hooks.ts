import type { ProDataIndex } from '../types'
import type { ProFormInstance } from './types'
import { computed, unref } from 'vue'
import type { MaybeRef } from 'vue'
import { useProFormContext } from './context'

export { useForm, useFormInstance } from 'antdv-next'

export { default as ProFormProvider } from './ProFormProvider.vue'
export { formProviderKey } from './providerContext'

export function useWatch<T = unknown>(
  name: ProDataIndex,
  form?: MaybeRef<Pick<ProFormInstance, 'getFieldValue'> | undefined>,
) {
  const context = form === undefined ? useProFormContext() : undefined
  return computed(() => (unref(form) ?? context)?.getFieldValue(name) as T | undefined)
}
