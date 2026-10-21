<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import PackageCommand from './PackageCommand.vue'
import '../home.css'

const { lang } = useData()
const english = computed(() => lang.value.startsWith('en'))
const localLink = (path: string) => withBase(`${english.value ? '/en' : ''}${path}`)
const features = computed(() =>
  english.value
    ? [
        {
          icon: 'bolt',
          title: 'ProTable. Ready for your data.',
          text: 'Bring search, pagination, sorting, filters, and remote requests into one predictable table workflow.',
          link: '/components/pro-table',
        },
        {
          icon: 'code',
          title: 'EditableProTable. Edit in place.',
          text: 'Create rows, edit multiple records, validate changes, and save asynchronously with a controlled table value.',
          link: '/components/editable-pro-table',
        },
        {
          icon: 'box',
          title: 'SchemaForm. Fields take shape.',
          text: 'Build standard, query, modal, drawer, and stepped forms from the same familiar field model.',
          link: '/components/schema-form',
        },
        {
          icon: 'tools',
          title: 'One model, a complete workflow',
          text: 'Define columns once to describe how fields are searched, displayed, edited, and submitted.',
          link: '/guide/getting-started',
        },
        {
          icon: 'palette',
          title: 'Made to feel at home in Vue',
          text: 'Use component refs, events, slots, and v-model to shape your interface with Vue 3 and Antdv Next.',
          link: '/guide/getting-started',
        },
        {
          icon: 'layers',
          title: 'A clear path from React to Vue',
          text: 'Check the compatibility matrix for supported props, request contracts, and their Vue equivalents.',
          link: '/guide/compatibility',
        },
      ]
    : [
        {
          icon: 'bolt',
          title: 'ProTable，把表格准备好',
          text: '搜索、分页、排序、筛选与远程请求，收束进一张表格，让数据流清晰可控。',
          link: '/components/pro-table',
        },
        {
          icon: 'code',
          title: 'EditableProTable，随手编辑',
          text: '新建行、多行编辑、字段校验与异步保存。通过受控 value，管理整张表格的数据。',
          link: '/components/editable-pro-table',
        },
        {
          icon: 'box',
          title: 'SchemaForm，让字段成形',
          text: '从同一套列模型出发，生成普通、查询、弹窗、抽屉与步骤表单，让配置自然复用。',
          link: '/components/schema-form',
        },
        {
          icon: 'tools',
          title: '一套 columns，贯穿工作流',
          text: '在一处描述字段，让查询、展示、编辑与提交连贯起来，把时间留给真正的业务。',
          link: '/guide/getting-started',
        },
        {
          icon: 'palette',
          title: '熟悉的 Vue，顺手的交互',
          text: '基于 Vue 3 与 Antdv Next，用组件 ref、事件、插槽和 v-model，表达你的界面。',
          link: '/guide/getting-started',
        },
        {
          icon: 'layers',
          title: '从 React 到 Vue，迁移有据',
          text: '对照兼容矩阵，了解主要 Props、请求契约与 Vue 写法，为已有工作流找到对应方式。',
          link: '/guide/compatibility',
        },
      ],
)
const iconPaths: Record<string, string> = {
  bolt: 'm13 2-9 12h7l-1 8 10-12h-7l1-8Z',
  code: 'm8 7-5 5 5 5m8-10 5 5-5 5m-3-13-2 16',
  box: 'm12 3 9 5v9l-9 5-9-5V8l9-5Zm0 9 9-4M12 12 3 8m9 4v10M7.5 5.5l9 5',
  tools: 'M4 7h16M4 17h16M8 4v6m8 4v6',
  palette:
    'M12 3a9 9 0 1 0 0 18h1a2 2 0 0 0 1-3.7 1.5 1.5 0 0 1 .8-2.8H17a4 4 0 0 0 4-4C21 6 17 3 12 3ZM7 10h.01M10 6.5h.01M15 6.5h.01M18 10h.01',
  layers: 'm12 3 10 5-10 5L2 8l10-5ZM2 12l10 5 10-5M2 16l10 5 10-5',
}
</script>

<template>
  <div class="bubbles-home vp-raw">
    <section class="bubbles-hero" aria-labelledby="bubbles-title">
      <div class="bubbles-copy">
        <p class="bubbles-wordmark">Antdv Next Pro</p>
        <h1 id="bubbles-title">
          <template v-if="english">Bring data<br />into flow.</template>
          <template v-else>让数据交互<br />轻盈一点。</template>
        </h1>
        <p class="bubbles-tagline">
          {{
            english
              ? 'One columns model, from search to submission.'
              : '一套 columns，从查询到展示、编辑与提交。'
          }}<br />
          {{
            english
              ? 'Tables and forms, built for Vue 3 and Antdv Next.'
              : '为 Vue 3 与 Antdv Next 准备的表格与表单。'
          }}
        </p>
        <div class="bubbles-actions">
          <a class="bubbles-button primary" :href="localLink('/guide/getting-started')">
            {{ english ? 'Get started' : '快速开始' }} <span aria-hidden="true">→</span>
          </a>
          <a class="bubbles-button secondary" :href="localLink('/components/pro-table')">{{
            english ? 'Explore components' : '探索组件'
          }}</a>
          <a
            class="bubbles-button secondary"
            :href="withBase('/playground/')"
            target="_blank"
            rel="noreferrer"
          >
            Playground <span aria-hidden="true">↗</span>
          </a>
        </div>
        <PackageCommand />
      </div>

      <div
        class="bubbles-visual"
        role="img"
        :aria-label="
          english
            ? 'A Vue preview of ProTable, EditableProTable, and SchemaForm floating among iridescent bubbles'
            : '漂浮在彩色泡泡间的 ProTable、EditableProTable 与 SchemaForm 代码预览'
        "
      >
        <div class="bubble-orbit orbit-back"></div>
        <div class="bubble bubble-top"></div>
        <div class="bubble bubble-tiny"></div>
        <div class="bubble-window">
          <div class="bubble-window-bar">
            <span class="window-brand"
              ><img :src="withBase('/mark.svg')" alt="" /> Antdv Next Pro</span
            >
            <span class="window-dots"><i></i><i></i><i></i></span>
          </div>
          <div class="bubble-window-body">
            <div class="window-sidebar">
              <span class="sidebar-active"></span><span></span><span></span><span></span
              ><span></span>
            </div>
            <div class="window-content">
              <div class="preview-title">
                <span>#</span> Hello ProTable<span class="hello-dot">.</span>
              </div>
              <div class="preview-placeholder"></div>
              <div class="preview-placeholder short"></div>
              <div class="preview-code">
                <div class="preview-filename">
                  <span class="vue-mark">V</span> App.vue <span>●</span>
                </div>
                <div class="preview-code-lines">
                  <div>
                    <span class="syntax-pink">&lt;ProTable</span> :columns=<span
                      class="syntax-green"
                      >"columns"</span
                    >
                    <span class="syntax-pink">/&gt;</span>
                  </div>
                  <div><span class="syntax-pink">&lt;EditableProTable</span></div>
                  <div>&nbsp;&nbsp;:columns=<span class="syntax-green">"columns"</span></div>
                  <div>
                    &nbsp;&nbsp;v-model:value=<span class="syntax-green">"rows"</span>
                    <span class="syntax-pink">/&gt;</span>
                  </div>
                  <div><span class="syntax-pink">&lt;SchemaForm</span></div>
                  <div>&nbsp;&nbsp;:columns=<span class="syntax-green">"columns"</span></div>
                  <div>
                    &nbsp;&nbsp;v-model=<span class="syntax-green">"form"</span>
                    <span class="syntax-pink">/&gt;</span>
                  </div>
                </div>
              </div>
              <div class="preview-status">
                <span></span>
                {{
                  english ? 'One model. Tables and forms, connected.' : '同一套模型，连起表格与表单'
                }}
              </div>
            </div>
          </div>
        </div>
        <div class="bubble bubble-main">
          <span class="bubble-face"><i></i><i></i><b></b></span>
        </div>
        <div class="bubble bubble-small"></div>
        <div class="bubble bubble-bottom"></div>
        <span class="bubble-sparkle sparkle-one">✧</span
        ><span class="bubble-sparkle sparkle-two">✧</span>
      </div>
    </section>

    <section
      class="bubbles-features"
      :aria-label="english ? 'Made for your next data workflow' : '为你的下一段数据工作流准备'"
    >
      <a
        v-for="feature in features"
        :key="feature.icon"
        :href="localLink(feature.link)"
        class="bubbles-feature"
      >
        <div class="feature-icon" :class="`icon-${feature.icon}`">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.7"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path :d="iconPaths[feature.icon]" />
          </svg>
        </div>
        <h2>{{ feature.title }}</h2>
        <p>{{ feature.text }}</p>
        <span class="feature-arrow" aria-hidden="true">↗</span>
      </a>
    </section>

    <section class="bubbles-start">
      <img :src="withBase('/mark.svg')" alt="" width="32" height="32" />
      <h2>
        {{ english ? 'Give your next workflow a lighter start.' : '让下一张表格，从容一点。' }}
      </h2>
      <a :href="localLink('/guide/getting-started')"
        >{{ english ? 'Meet Antdv Next Pro' : '认识 Antdv Next Pro' }}
        <span aria-hidden="true">→</span></a
      >
    </section>
  </div>
</template>
