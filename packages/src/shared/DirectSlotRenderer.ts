import { defineComponent, h, mergeProps, type Component, type PropType, type VNodeChild } from 'vue'

// FormItem needs the real control as its direct slot result to inject id, ARIA and refs.
// Divider also distinguishes an empty slot from a wrapper component. A VNodeContent child in a
// template would change these contracts, so only this direct-slot boundary uses a render function.
// Use the same boundary for default/custom controls to retain the FormItem instance and validation
// state when a callback switches between nullish fallback and custom content.
export default defineComponent({
  name: 'AntdvNextProDirectSlotRenderer',
  inheritAttrs: false,
  props: {
    component: { type: [Object, Function] as PropType<Component>, required: true },
    componentProps: Object as PropType<Record<string, unknown>>,
    rootAttrs: Object as PropType<Record<string, unknown>>,
    content: { type: null as unknown as PropType<VNodeChild> },
    useContent: Boolean,
  },
  setup(props, { slots }) {
    return () =>
      h(props.component, mergeProps(props.componentProps ?? {}, props.rootAttrs ?? {}), {
        default: () => (props.useContent ? props.content : slots.default?.()),
      })
  },
})
