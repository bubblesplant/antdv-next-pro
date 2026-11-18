<script setup lang="ts">
import { ErrorBoundary } from '@bubblesjs/antdv-next-pro'

const { resetKey } = defineProps<{ resetKey: number }>()
const emit = defineEmits<{ caught: [error: Error]; recover: [] }>()

function recover(reset: () => void) {
  emit('recover')
  reset()
}
</script>

<template>
  <ErrorBoundary :reset-keys="[resetKey]" @error="emit('caught', $event)">
    <slot />
    <template #fallback="{ error, reset }">
      <div class="inline-error" role="alert">
        <strong>{{ error.message }}</strong>
        <button type="button" @click="recover(reset)">恢复表格</button>
      </div>
    </template>
  </ErrorBoundary>
</template>

<style scoped>
.inline-error {
  padding: 8px 10px;
  border-radius: 6px;
  background: #fff1f0;
  color: #b4232d;
  font-size: 12px;
}

button {
  padding: 7px 10px;
  border: 1px solid #bacbdd;
  border-radius: 6px;
  background: white;
  color: #29445f;
  font: inherit;
  cursor: pointer;
}

button:hover {
  border-color: #1768d3;
  background: #1768d3;
  color: white;
}
</style>
