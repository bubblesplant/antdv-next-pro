<script lang="ts">
import { defineComponent, type PropType, type VNodeChild } from 'vue'
export default defineComponent({
  name: 'ProRenderView',
  props: { render: Function as PropType<(dom: VNodeChild) => VNodeChild> },
  setup(props, { slots }) {
    return () => {
      const dom = slots.default?.()
      return props.render ? props.render(dom) : dom
    }
  },
})
</script>
