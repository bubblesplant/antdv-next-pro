<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { defaultExamplePath } from '../examples'
</script>

<template>
  <div class="not-found-page">
    <span>404</span>
    <h1>没有找到这个示例</h1>
    <p>请从左侧目录选择一个场景，或返回第一个示例。</p>
    <RouterLink :to="defaultExamplePath">返回组件示例</RouterLink>
  </div>
</template>
