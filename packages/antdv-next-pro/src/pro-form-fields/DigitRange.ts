import { InputNumber } from 'antdv-next'
import { defineComponent, h, type PropType } from 'vue'

export default defineComponent({
  name: 'ProDigitRange',
  inheritAttrs: false,
  props: { value: Array as PropType<readonly (number | string | null)[]>, disabled: Boolean },
  emits: ['update:value', 'change'],
  setup(props, { attrs, emit }) {
    const update = (index: number, value: number | string | null) => {
      const next = [...(props.value ?? [null, null])]
      next[index] = value
      emit('update:value', next)
      emit('change', next)
    }
    return () =>
      h(
        'span',
        { style: { display: 'inline-flex', gap: '8px', alignItems: 'center', width: '100%' } },
        [
          h(InputNumber, {
            ...attrs,
            disabled: props.disabled,
            value: props.value?.[0],
            style: { width: 'calc(50% - 12px)' },
            'onUpdate:value': (value) => update(0, value),
          }),
          h('span', { 'aria-hidden': 'true' }, '~'),
          h(InputNumber, {
            ...attrs,
            disabled: props.disabled,
            value: props.value?.[1],
            style: { width: 'calc(50% - 12px)' },
            'onUpdate:value': (value) => update(1, value),
          }),
        ],
      )
  },
})
