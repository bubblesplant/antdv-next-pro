import type { InjectionKey, PropType } from 'vue'
import type { ProDataIndex } from '../types'
import type { ProFormInstance } from './types'
import type { FormRecord } from '../schema-form/utils'
import { computed, defineComponent, provide, unref } from 'vue'
import type { MaybeRef } from 'vue'
import { useProFormContext } from './context'

export { useForm, useFormInstance } from 'antdv-next'

interface FormProviderContext {
  register: (name: string, form: ProFormInstance) => () => void
  change: (name: string, changedValues: FormRecord) => void
  finish: (name: string, values: FormRecord) => void
}

export const formProviderKey: InjectionKey<FormProviderContext> = Symbol('ProFormProvider')

export const ProFormProvider = defineComponent({
  name: 'ProFormProvider',
  props: {
    onFormChange: Function as PropType<
      (
        name: string,
        info: { changedValues: FormRecord; forms: Record<string, ProFormInstance> },
      ) => void
    >,
    onFormFinish: Function as PropType<
      (name: string, info: { values: FormRecord; forms: Record<string, ProFormInstance> }) => void
    >,
  },
  setup(props, { slots }) {
    const forms: Record<string, ProFormInstance> = {}
    provide(formProviderKey, {
      register(name, form) {
        forms[name] = form
        return () => {
          if (forms[name] === form) delete forms[name]
        }
      },
      change(name, changedValues) {
        props.onFormChange?.(name, { changedValues, forms: { ...forms } })
      },
      finish(name, values) {
        props.onFormFinish?.(name, { values, forms: { ...forms } })
      },
    })
    return () => slots.default?.()
  },
})

export function useWatch<T = unknown>(
  name: ProDataIndex,
  form?: MaybeRef<Pick<ProFormInstance, 'getFieldValue'> | undefined>,
) {
  const context = form === undefined ? useProFormContext() : undefined
  return computed(() => (unref(form) ?? context)?.getFieldValue(name) as T | undefined)
}
