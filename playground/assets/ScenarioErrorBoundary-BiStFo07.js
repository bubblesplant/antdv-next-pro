var e=`<script setup lang="ts">
import { onErrorCaptured, ref, watch } from 'vue'

const props = defineProps<{
  resetKey: number
  variant: 'custom' | 'default'
}>()

const emit = defineEmits<{
  caught: [message: string]
}>()

const failed = ref(false)
const errorMessage = ref('')

watch(
  () => props.resetKey,
  () => {
    failed.value = false
    errorMessage.value = ''
  },
)

onErrorCaptured((error) => {
  failed.value = true
  errorMessage.value = error instanceof Error ? error.message : String(error)
  emit('caught', errorMessage.value)
  return false
})
<\/script>

<template>
  <div v-if="failed" :class="['error-fallback', \`is-\${variant}\`]" role="alert">
    <template v-if="variant === 'custom'">
      <strong>这张表暂时无法渲染</strong>
      <p>自定义 Vue 错误边界已隔离单元格异常，演示目录和其它场景仍可继续使用。</p>
    </template>
    <template v-else>
      <strong>默认隔离器记录到渲染异常</strong>
      <p>本例没有提供业务自定义降级 UI，仅由 Playground 最外层安全隔离器接管。</p>
    </template>
    <code>{{ errorMessage }}</code>
  </div>
  <slot v-else />
</template>

<style scoped>
.error-fallback {
  display: grid;
  gap: 8px;
  min-height: 230px;
  place-content: center;
  padding: 28px;
  border: 1px solid #efb4b7;
  border-radius: 10px;
  background: #fff6f6;
  color: #762d32;
  text-align: center;
}

.error-fallback.is-default {
  border-style: dashed;
  border-color: #c9d3df;
  background: #f6f8fb;
  color: #44546a;
}

.error-fallback strong {
  font-size: 18px;
}

.error-fallback p {
  max-width: 580px;
  margin: 0;
  line-height: 1.7;
}

.error-fallback code {
  justify-self: center;
  padding: 5px 8px;
  border-radius: 5px;
  background: rgba(119, 45, 50, 0.08);
  font-size: 11px;
}
</style>
`;export{e as default};