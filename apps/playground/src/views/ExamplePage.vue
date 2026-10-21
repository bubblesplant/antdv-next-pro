<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import UiIcon from '../components/UiIcon.vue'
import ScenarioErrorBoundary from '../demos/pro-table/ScenarioErrorBoundary.vue'
import { exampleComponents, examples, type PlaygroundExample, type SourceFile } from '../examples'
import { copyText, downloadSources } from '../utils/sourceFiles'

const props = defineProps<{ example: PlaygroundExample }>()
const activeTab = ref<'preview' | 'code'>('preview')
const revision = ref(0)
const sources = ref<SourceFile[]>([])
const sourceIndex = ref(0)
const sourceLoading = ref(false)
const sourceError = ref('')
const toast = ref('')
const copied = ref(false)
const events = ref<string[]>([])
let toastTimer: ReturnType<typeof setTimeout> | undefined
let sourceRequest: Promise<void> | undefined
let disposed = false

const componentMeta = computed(() =>
  exampleComponents.find((item) => item.id === props.example.componentId)!,
)
const currentSource = computed(() => sources.value[sourceIndex.value])
const currentIndex = computed(() => examples.findIndex((item) => item.path === props.example.path))
const previous = computed(() => examples[currentIndex.value - 1])
const next = computed(() => examples[currentIndex.value + 1])
const componentFirstPath = computed(
  () => examples.find((item) => item.componentId === props.example.componentId)?.path ?? '/',
)

function notify(message: string) {
  toast.value = message
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toast.value = ''
    copied.value = false
  }, 2600)
}

function logEvent(message: string) {
  events.value = [message, ...events.value].slice(0, 8)
}

async function loadSources() {
  if (sources.value.length) return
  if (sourceRequest) return sourceRequest
  sourceLoading.value = true
  sourceError.value = ''
  sourceRequest = (async () => {
    try {
      const files = await props.example.sources()
      if (!disposed) sources.value = files
    } catch {
      if (!disposed) sourceError.value = '示例代码加载失败，请重试。'
    } finally {
      sourceRequest = undefined
      if (!disposed) sourceLoading.value = false
    }
  })()
  return sourceRequest
}

watch(activeTab, (tab) => {
  if (tab === 'code') void loadSources()
})

async function switchTab(tab: 'preview' | 'code') {
  activeTab.value = tab
  await nextTick()
  document.getElementById(`${tab}-tab`)?.focus()
}

async function copyCode() {
  await loadSources()
  if (!currentSource.value) return
  try {
    await copyText(currentSource.value.code)
    copied.value = true
    notify(`已复制 ${currentSource.value.name}`)
  } catch {
    notify('浏览器未允许复制，请选中代码手动复制。')
  }
}

async function copyLink() {
  try {
    await copyText(window.location.href)
    notify('示例链接已复制，可直接打开或分享。')
  } catch {
    notify('浏览器未允许复制，请复制地址栏中的链接。')
  }
}

async function downloadExample() {
  await loadSources()
  if (sources.value.length)
    downloadSources(
      sources.value,
      `${props.example.componentId}-${props.example.path.split('/').at(-1)}`,
    )
  else notify(sourceError.value || '代码正在加载，请稍后重试。')
}

function resetExample() {
  revision.value += 1
  events.value = []
  notify('示例已重置')
}

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
onBeforeUnmount(() => {
  disposed = true
  clearTimeout(toastTimer)
})
</script>

<template>
  <div class="document-layout">
    <article class="example-document" :data-active-demo="example.path.split('/').at(-1)">
      <nav class="breadcrumbs" aria-label="当前位置">
        <span>组件</span><UiIcon name="chevron" :size="12" />
        <RouterLink :to="componentFirstPath">{{ componentMeta.name }}</RouterLink
        ><UiIcon name="chevron" :size="12" />
        <span>{{ example.title }}</span>
      </nav>

      <header class="document-heading">
        <div class="heading-title">
          <h1>{{ example.title }}</h1>
          <span class="component-tag">{{ componentMeta.name }}</span>
        </div>
        <p>{{ example.description }}</p>
      </header>

      <section id="example-preview" class="example-section" aria-labelledby="preview-title">
        <div class="section-heading">
          <h2 id="preview-title">代码演示</h2>
          <span>每个示例都可以单独访问和测试</span>
        </div>
        <div class="example-workbench">
          <div class="workbench-toolbar">
            <div class="preview-tabs" role="tablist" aria-label="示例视图">
              <button
                id="preview-tab"
                type="button"
                role="tab"
                :aria-selected="activeTab === 'preview'"
                aria-controls="preview-panel"
                :tabindex="activeTab === 'preview' ? 0 : -1"
                :class="{ active: activeTab === 'preview' }"
                @click="activeTab = 'preview'"
                @keydown.right.prevent="switchTab('code')"
                @keydown.left.prevent="switchTab('code')"
              >
                <UiIcon name="grid" />预览
              </button>
              <button
                id="code-tab"
                type="button"
                role="tab"
                :aria-selected="activeTab === 'code'"
                aria-controls="code-panel"
                :tabindex="activeTab === 'code' ? 0 : -1"
                :class="{ active: activeTab === 'code' }"
                @click="activeTab = 'code'"
                @keydown.left.prevent="switchTab('preview')"
                @keydown.right.prevent="switchTab('preview')"
              >
                <UiIcon name="code" />代码
              </button>
            </div>
            <div class="workbench-actions">
              <button type="button" class="text-button" title="重置当前示例" @click="resetExample">
                <UiIcon name="reset" /><span>重置</span>
              </button>
              <button
                type="button"
                class="text-button"
                title="复制当前示例的独立链接"
                @click="copyLink"
              >
                <UiIcon name="link" /><span>复制链接</span>
              </button>
            </div>
          </div>

          <div
            v-show="activeTab === 'preview'"
            id="preview-panel"
            class="preview-panel"
            role="tabpanel"
            aria-labelledby="preview-tab"
            tabindex="0"
          >
            <ScenarioErrorBoundary :reset-key="revision" variant="custom" @caught="logEvent">
              <RouterView v-slot="{ Component }">
                <component :is="Component" :key="revision" @event="logEvent" />
              </RouterView>
            </ScenarioErrorBoundary>
          </div>

          <div
            v-if="activeTab === 'code'"
            id="code-panel"
            class="code-panel"
            role="tabpanel"
            aria-labelledby="code-tab"
            tabindex="0"
          >
            <div v-if="sourceLoading" class="source-message" role="status">正在加载示例代码…</div>
            <div v-else-if="sourceError" class="source-message" role="alert">
              {{ sourceError
              }}<button type="button" class="text-button" @click="loadSources">重新加载</button>
            </div>
            <template v-else>
              <div class="source-toolbar">
                <div class="source-files" aria-label="示例文件">
                  <button
                    v-for="(file, index) in sources"
                    :key="file.name"
                    type="button"
                    :class="{ active: sourceIndex === index }"
                    :aria-pressed="sourceIndex === index"
                    @click="sourceIndex = index"
                  >
                    {{ file.name }}
                  </button>
                </div>
                <button type="button" class="text-button copy-code-button" @click="copyCode">
                  <UiIcon :name="copied ? 'check' : 'copy'" />{{ copied ? '已复制' : '复制代码' }}
                </button>
              </div>
              <p v-if="sources.length > 1" class="source-note">
                本例包含 {{ sources.length }} 个文件。可分别复制，或下载完整示例并保留目录结构使用。
              </p>
              <pre class="source-code"><code>{{ currentSource?.code }}</code></pre>
            </template>
          </div>

          <div class="workbench-footer">
            <span><i class="preview-dot"></i>可交互的 Vue 示例</span
            ><button type="button" class="text-button" @click="downloadExample">
              <UiIcon name="download" />下载完整示例
            </button>
          </div>
        </div>
      </section>

      <section
        id="example-checks"
        class="example-section checks-section"
        aria-labelledby="checks-title"
      >
        <div class="section-heading">
          <h2 id="checks-title">试一试</h2>
          <span>建议验证以下交互</span>
        </div>
        <ul class="check-list">
          <li v-for="check in example.checks" :key="check">
            <UiIcon name="check" :size="15" />{{ check }}
          </li>
        </ul>
        <details v-if="events.length" class="event-log">
          <summary>
            交互记录 <span>{{ events.length }}</span>
          </summary>
          <ol>
            <li v-for="(event, index) in events" :key="index">{{ event }}</li>
          </ol>
        </details>
      </section>

      <nav class="example-pagination" aria-label="相邻示例">
        <RouterLink v-if="previous" :to="previous.path" class="previous-example"
          ><span><UiIcon name="arrow" :size="14" />上一个示例</span
          ><strong>{{ previous.title }}</strong></RouterLink
        >
        <RouterLink v-if="next" :to="next.path" class="next-example"
          ><span>下一个示例<UiIcon name="arrow" :size="14" /></span
          ><strong>{{ next.title }}</strong></RouterLink
        >
      </nav>
      <footer class="document-footer">Antdv Next Pro <span>面向 Vue 的表格与表单组件</span></footer>
    </article>

    <aside class="page-outline" aria-label="当前页目录">
      <p>本页内容</p>
      <button type="button" class="active" @click="scrollToSection('example-preview')">
        代码演示
      </button>
      <button type="button" @click="scrollToSection('example-checks')">试一试</button>
      <div class="outline-actions">
        <button type="button" @click="copyLink">
          <UiIcon name="link" :size="14" />复制页面链接</button
        ><button type="button" @click="downloadExample">
          <UiIcon name="download" :size="14" />下载示例
        </button>
      </div>
    </aside>
    <div v-if="toast" class="toast" role="status"><UiIcon name="check" />{{ toast }}</div>
  </div>
</template>
