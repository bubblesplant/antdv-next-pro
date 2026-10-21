<script
  setup
  lang="ts"
  generic="
    T extends Record<string, unknown> = Record<string, unknown>,
    P extends Record<string, unknown> = Record<string, unknown>
  "
>
import type { BaseProListProps } from './types'
import type { ProTableInstance } from '../types'
import { computed, getCurrentInstance, ref } from 'vue'
import ProList from './ProList.vue'
import { useTableRef } from '../table/useTableRef'
defineOptions({ inheritAttrs: false })
const props = defineProps<BaseProListProps<T, P>>()
const target = ref<ProTableInstance<T>>()
const instance = getCurrentInstance()
const bindings = computed(() => {
  Object.values(props)
  return Object.fromEntries(
    Object.entries(instance?.vnode.props ?? {}).filter(([key]) => key !== 'ref'),
  )
})
defineExpose<ProTableInstance<T>>(useTableRef(target))
</script>
<template>
  <!-- @vue-generic {T,P} --><ProList
    ref="target"
    v-bind="{ ...bindings, ...$attrs }"
    :card-props="props.cardProps ?? false"
    :search="props.search ?? false"
    :tool-bar-render="props.toolBarRender ?? false"
    ><template v-for="(_, name) in $slots" #[name]="scope"
      ><slot :name="name" v-bind="scope ?? {}" /></template
  ></ProList>
</template>
