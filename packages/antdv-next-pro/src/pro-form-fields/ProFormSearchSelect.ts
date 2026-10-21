import { defineComponent, h } from 'vue'
import ProFormSelect from './ProFormSelect.vue'
import type { ProFormSearchSelectProps } from './types'
import { useProPrefix } from '../provider/context'

/** SearchSelect keeps selected labels and defaults to a searchable multiple selector. */
export const ProFormSearchSelect = defineComponent(
  (props: ProFormSearchSelectProps, { attrs, slots }) => {
    const prefix = useProPrefix('filed-search-select', () => props.prefixCls)
    return () => {
      const input = { ...props, ...attrs } as ProFormSearchSelectProps
      const mode = input.fieldProps?.mode ?? input.mode ?? 'multiple'
      const fieldProps = {
        labelInValue: true,
        showSearch: true,
        suffixIcon: null,
        autoClearSearchValue: true,
        optionLabelProp: 'label',
        ...input.fieldProps,
        mode: mode === 'single' ? undefined : mode,
        class: [
          prefix.value,
          (input.fieldProps?.disabled ?? input.disabled) && `${prefix.value}-disabled`,
          (input.fieldProps as { class?: unknown } | undefined)?.class,
        ],
      }
      return h(
        ProFormSelect,
        {
          ...input,
          fieldProps,
        },
        slots,
      )
    }
  },
  { name: 'ProFormSearchSelect', inheritAttrs: false },
)

export default ProFormSearchSelect
