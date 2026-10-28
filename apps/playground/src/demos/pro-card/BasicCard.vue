<script setup lang="ts">
import { ref } from 'vue'
import { Button } from 'antdv-next'
import { ProCard } from '@bubblesjs/antdv-next-pro'

const feedback = ref('项目信息已同步')
</script>

<template>
  <ProCard title="项目概览" sub-title="官网升级" :header-bordered="true">
    <template #extra
      ><Button type="link" size="small" @click="feedback = '项目信息已刷新'">刷新</Button></template
    >
    <dl class="project-details">
      <div>
        <dt>负责人</dt>
        <dd>林默</dd>
      </div>
      <div>
        <dt>项目状态</dt>
        <dd>进行中</dd>
      </div>
      <div>
        <dt>计划发布</dt>
        <dd>2026-11-06</dd>
      </div>
    </dl>
    <p class="project-description">统一设计规范与交互体验，完成产品官网和文档站点升级。</p>
    <p class="project-description" role="status">{{ feedback }}</p>
  </ProCard>
</template>

<style scoped>
.project-details {
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
  margin: 0;
}
.project-details dt {
  margin-bottom: 8px;
  color: #64748b;
  font-size: 12px;
}
.project-details dd {
  margin: 0;
  color: #1e293b;
  font-size: 14px;
}
.project-description {
  margin: 24px 0 0;
  color: #64748b;
  line-height: 1.8;
}
</style>
