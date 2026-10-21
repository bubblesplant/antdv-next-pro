<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { ConfigProvider, theme as antTheme } from 'antdv-next'

const { lang, frontmatter, page, isDark } = useData()
const english = computed(() => lang.value.startsWith('en'))
const isHome = computed(() => frontmatter.value.layout === 'home')
const componentTheme = computed(() => ({
  algorithm: isDark.value ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
  token: {
    colorPrimary: '#2476ed',
    fontFamily: "Inter, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif",
  },
}))
const section = computed(() => {
  const prefix = english.value ? '/en' : ''
  const key = page.value.relativePath.replace(/^en\//, '').split('/')[0]
  if (key === 'guide') {
    return { text: english.value ? 'Guide' : '指南', link: `${prefix}/guide/getting-started` }
  }
  if (key === 'components') {
    return { text: english.value ? 'Components' : '组件', link: `${prefix}/components/pro-table` }
  }
  return undefined
})
</script>

<template>
  <ConfigProvider :theme="componentTheme">
    <DefaultTheme.Layout :class="{ 'bubbles-docs': !isHome }">
      <template #layout-top>
        <a
          v-if="isHome"
          class="bubble-announcement"
          :href="withBase(english ? '/en/guide/getting-started' : '/guide/getting-started')"
        >
          <img :src="withBase('/mark.svg')" alt="" width="20" height="20" />
          {{
            english
              ? 'One columns model. Every data interaction. Get started'
              : '一套 columns，串起每一次数据交互。开始使用 Antdv Next Pro'
          }}
          <span aria-hidden="true">→</span>
        </a>
      </template>
      <template #nav-bar-title-after>
        <span v-if="!isHome" class="bubbles-docs-label">{{ english ? 'Docs' : '文档' }}</span>
      </template>
      <template #doc-before>
        <nav
          v-if="section"
          class="bubbles-breadcrumb"
          :aria-label="english ? 'Breadcrumb' : '面包屑导航'"
        >
          <a :href="withBase(section.link)">
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M10 5.2C8.3 3.8 5.7 3.4 2.8 4.1v11.4c2.9-.7 5.5-.3 7.2 1.1m0-11.4c1.7-1.4 4.3-1.8 7.2-1.1v11.4c-2.9-.7-5.5-.3-7.2 1.1m0-11.4v11.4"
                stroke="currentColor"
                stroke-width="1.3"
                stroke-linejoin="round"
              />
            </svg>
            {{ section.text }}
          </a>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{{ page.title }}</span>
        </nav>
      </template>
    </DefaultTheme.Layout>
  </ConfigProvider>
</template>
