import { fileURLToPath, URL } from 'node:url'

import { defineConfig, postcssIsolateStyles } from 'vitepress'

const zhGuide = [
  { text: '开始', items: [{ text: '快速开始', link: '/guide/getting-started' }] },
  {
    text: '迁移与约定',
    items: [
      { text: '兼容矩阵', link: '/guide/compatibility' },
      { text: 'ProComponents v3 迁移', link: '/guide/pro-components-v3' },
    ],
  },
]

const zhComponents = [
  {
    text: '数据展示',
    items: [
      { text: 'ProCard', link: '/components/pro-card' },
      { text: 'ProTable', link: '/components/pro-table' },
      { text: 'EditableProTable', link: '/components/editable-pro-table' },
      { text: 'ProList / BaseProList', link: '/components/pro-list' },
      { text: 'ProDescriptions', link: '/components/pro-descriptions' },
      { text: '排序与编辑增强', link: '/components/table-enhancements' },
    ],
  },
  {
    text: '数据录入',
    items: [
      { text: 'ProFormFields', link: '/components/pro-form-fields' },
      { text: 'SchemaForm', link: '/components/schema-form' },
      { text: 'ProForm 与组合布局', link: '/components/pro-form' },
    ],
  },
  {
    text: '全局与辅助',
    items: [
      { text: 'ProConfigProvider', link: '/components/pro-config-provider' },
      { text: 'ProField', link: '/components/pro-field' },
      { text: '工具栏与辅助组件', link: '/components/components' },
    ],
  },
]

const enGuide = [
  { text: 'Start', items: [{ text: 'Getting Started', link: '/en/guide/getting-started' }] },
  {
    text: 'Migration',
    items: [
      { text: 'Compatibility Matrix', link: '/en/guide/compatibility' },
      { text: 'ProComponents v3 migration', link: '/en/guide/pro-components-v3' },
    ],
  },
]

const enComponents = [
  {
    text: 'Data Display',
    items: [
      { text: 'ProCard', link: '/en/components/pro-card' },
      { text: 'ProTable', link: '/en/components/pro-table' },
      { text: 'EditableProTable', link: '/en/components/editable-pro-table' },
      { text: 'ProList / BaseProList', link: '/en/components/pro-list' },
      { text: 'ProDescriptions', link: '/en/components/pro-descriptions' },
      { text: 'Sort and edit enhancements', link: '/en/components/table-enhancements' },
    ],
  },
  {
    text: 'Data Entry',
    items: [
      { text: 'ProFormFields', link: '/en/components/pro-form-fields' },
      { text: 'SchemaForm', link: '/en/components/schema-form' },
      { text: 'ProForm and layouts', link: '/en/components/pro-form' },
    ],
  },
  {
    text: 'Configuration and helpers',
    items: [
      { text: 'ProConfigProvider', link: '/en/components/pro-config-provider' },
      { text: 'ProField', link: '/en/components/pro-field' },
      { text: 'Toolbar and helpers', link: '/en/components/components' },
    ],
  },
]

export default defineConfig({
  title: 'Antdv Next Pro',
  description: 'Vue 3 ProCard, ProTable, EditableProTable and SchemaForm powered by Antdv Next',
  base: '/antv-next-pro/',
  cleanUrls: true,
  lastUpdated: true,
  head: [
    ['link', { rel: 'icon', href: '/antv-next-pro/mark.svg', type: 'image/svg+xml' }],
    ['meta', { name: 'theme-color', content: '#f6f7ff' }],
  ],
  markdown: {
    theme: { light: 'github-light', dark: 'github-dark' },
  },
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      title: 'Antdv Next Pro',
      description: '面向 Vue 3 的高阶表格与 Schema 表单',
      themeConfig: {
        nav: [
          { text: '指南', link: '/guide/getting-started', activeMatch: '/guide/getting-started' },
          { text: '组件', link: '/components/pro-table', activeMatch: '/components/' },
          { text: 'Playground', link: '/playground/', target: '_blank', rel: 'noreferrer' },
          { text: '兼容矩阵', link: '/guide/compatibility' },
        ],
        sidebar: {
          '/guide/': [...zhGuide.slice(0, 1), ...zhComponents, ...zhGuide.slice(1)],
          '/components/': [...zhGuide.slice(0, 1), ...zhComponents, ...zhGuide.slice(1)],
        },
        outline: { label: '本页目录', level: [2, 3] },
        docFooter: { prev: '上一篇', next: '下一篇' },
        lastUpdated: { text: '最后更新于' },
        returnToTopLabel: '返回顶部',
        sidebarMenuLabel: '菜单',
        darkModeSwitchLabel: '主题',
        lightModeSwitchTitle: '切换到浅色模式',
        darkModeSwitchTitle: '切换到深色模式',
        langMenuLabel: '切换语言',
        skipToContentLabel: '跳转到内容',
        footer: {
          message: '基于 MIT 许可发布',
          copyright: 'Antdv Next Pro · 让数据交互轻盈一点',
        },
      },
    },
    en: {
      label: 'English',
      lang: 'en-US',
      link: '/en/',
      title: 'Antdv Next Pro',
      description: 'Pro tables and schema forms for Vue 3',
      themeConfig: {
        nav: [
          {
            text: 'Guide',
            link: '/en/guide/getting-started',
            activeMatch: '/guide/getting-started',
          },
          { text: 'Components', link: '/en/components/pro-table', activeMatch: '/components/' },
          { text: 'Playground', link: '/playground/', target: '_blank', rel: 'noreferrer' },
          { text: 'Compatibility', link: '/en/guide/compatibility' },
        ],
        sidebar: {
          '/en/guide/': [...enGuide.slice(0, 1), ...enComponents, ...enGuide.slice(1)],
          '/en/components/': [...enGuide.slice(0, 1), ...enComponents, ...enGuide.slice(1)],
        },
        outline: { label: 'On this page', level: [2, 3] },
        docFooter: { prev: 'Previous page', next: 'Next page' },
        lastUpdated: { text: 'Last updated' },
        returnToTopLabel: 'Return to top',
        sidebarMenuLabel: 'Menu',
        footer: {
          message: 'Released under the MIT License',
          copyright: 'Antdv Next Pro · Make data interactions feel lighter',
        },
      },
    },
  },
  vite: {
    server: {
      port: 9901,
      strictPort: false,
    },
    css: {
      postcss: {
        plugins: [postcssIsolateStyles({ includeFiles: [/vp-doc\.css$/] })],
      },
    },
    resolve: {
      alias: [
        {
          find: /^.*\/VPDocAsideOutline\.vue$/,
          replacement: fileURLToPath(new URL('./theme/components/ProOutline.vue', import.meta.url)),
        },
        {
          find: /^@bubblesjs\/antv-next-pro$/,
          replacement: fileURLToPath(
            new URL('../../../packages/antdv-next-pro/src/index.ts', import.meta.url),
          ),
        },
      ],
    },
    ssr: {
      noExternal: ['antdv-next', /^@v-c\//, /^dayjs(?:\/|$)/],
    },
  },
  themeConfig: {
    logo: { src: '/mark.svg', alt: 'Antdv Next Pro' },
    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
              modal: {
                displayDetails: '显示详细列表',
                resetButtonTitle: '清除搜索',
                backButtonTitle: '返回',
                noResultsText: '没有找到相关结果',
                footer: {
                  selectText: '选择',
                  selectKeyAriaLabel: '回车键',
                  navigateText: '切换',
                  navigateUpKeyAriaLabel: '向上方向键',
                  navigateDownKeyAriaLabel: '向下方向键',
                  closeText: '关闭',
                  closeKeyAriaLabel: 'Esc 键',
                },
              },
            },
          },
        },
      },
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/bubblesplant/antv-next-pro' }],
  },
})
