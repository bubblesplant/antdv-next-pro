<script setup lang="ts">
import ProCardBase from '../ProCard.vue'

defineOptions({ name: 'ProCardGroup', inheritAttrs: false })
</script>

<template>
  <ProCardBase v-bind="$attrs" ghost :direction="$attrs.direction === 'column' ? 'column' : 'row'">
    <template v-for="(_, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps || {}" />
    </template>
  </ProCardBase>
</template>
