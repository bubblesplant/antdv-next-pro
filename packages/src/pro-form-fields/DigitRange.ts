import { InputNumber, SpaceCompact } from 'antdv-next'
import { defineComponent, h, type PropType } from 'vue'
import { useProConfig } from '../provider/context'

export default defineComponent({
  name: 'ProDigitRange',
  inheritAttrs: false,
  props: {
    value: Array as PropType<readonly (number | string | null)[]>,
    disabled: Boolean,
    separator: { type: String, default: '~' },
    separatorWidth: { type: Number, default: 30 },
  },
  emits: ['update:value', 'change'],
  setup(props, { attrs, emit }) {
    const { token } = useProConfig()
    const update = (index: number, value: number | string | null) => {
      const next = [...(props.value ?? [null, null])]
      next[index] = value
      emit('update:value', next)
      emit('change', next)
    }
    return () => {
      const { class: className, style, ...inputAttrs } = attrs
      const width = `calc((100% - ${props.separatorWidth}px) / 2)`
      const placeholder = (index: number) =>
        Array.isArray(inputAttrs.placeholder)
          ? inputAttrs.placeholder[index]
          : inputAttrs.placeholder
      return h(
        SpaceCompact,
        { block: true, class: className, style },
        {
          default: () => [
            h(InputNumber, {
              ...inputAttrs,
              disabled: props.disabled,
              value: props.value?.[0],
              placeholder: placeholder(0),
              style: { width },
              'onUpdate:value': (value) => update(0, value),
            }),
            h(
              'span',
              {
                'aria-hidden': 'true',
                style: {
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: `${props.separatorWidth}px`,
                  flexShrink: 0,
                  boxSizing: 'border-box',
                  border: `1px solid ${token.value.colorBorder}`,
                  backgroundColor: token.value.colorBgContainer,
                  color: token.value.colorTextSecondary,
                  pointerEvents: 'none',
                  userSelect: 'none',
                },
              },
              props.separator,
            ),
            h(InputNumber, {
              ...inputAttrs,
              disabled: props.disabled,
              value: props.value?.[1],
              placeholder: placeholder(1),
              style: { width, borderInlineStart: 0 },
              'onUpdate:value': (value) => update(1, value),
            }),
          ],
        },
      )
    }
  },
})
