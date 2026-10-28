<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { ConfigProvider } from 'antdv-next'
import zhCN from 'antdv-next/locale/zh_CN'
import UiIcon from './components/UiIcon.vue'
import { defaultExamplePath, exampleComponents, examples } from './examples'

const route = useRoute()
const keyword = ref('')
const mobileMenuOpen = ref(false)
const searchInput = ref<HTMLInputElement>()
const openedComponents = ref(new Set<string>())
const openedSections = ref(new Set<string>())
const normalizedKeyword = computed(() => keyword.value.trim().toLowerCase())

const navigation = computed(() =>
  exampleComponents
    .map((component) => {
      const componentExamples = examples.filter((example) => example.componentId === component.id)
      const matching = componentExamples.filter((example) =>
        `${component.name} ${component.label} ${example.title} ${example.section} ${example.description}`
          .toLowerCase()
          .includes(normalizedKeyword.value),
      )
      return {
        ...component,
        total: componentExamples.length,
        sections: [...new Set(matching.map((example) => example.section))].map((title) => ({
          title,
          key: `${component.id}/${title}`,
          examples: matching.filter((example) => example.section === title),
        })),
      }
    })
    .filter((component) => component.sections.length > 0),
)

function toggle(set: Set<string>, key: string) {
  if (set.has(key)) set.delete(key)
  else set.add(key)
}

watch(
  () => route.path,
  async (path) => {
    mobileMenuOpen.value = false
    const example = examples.find((item) => item.path === path)
    if (!example) return
    openedComponents.value.add(example.componentId)
    openedSections.value.add(`${example.componentId}/${example.section}`)
    await nextTick()
    document
      .querySelector('.example-link[aria-current="page"]')
      ?.scrollIntoView({ block: 'nearest' })
  },
  { immediate: true },
)

watch(mobileMenuOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})

function onKeydown(event: KeyboardEvent) {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    if (window.matchMedia('(max-width: 800px)').matches) mobileMenuOpen.value = true
    void nextTick(() => searchInput.value?.focus())
  }
  if (event.key === 'Escape') mobileMenuOpen.value = false
}

function focusContent() {
  const content = document.getElementById('main-content')
  content?.focus()
  content?.scrollIntoView({ block: 'start' })
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <ConfigProvider :locale="zhCN" :theme="{ token: { colorPrimary: '#2563eb' } }">
    <a class="skip-link" href="#main-content" @click.prevent="focusContent">跳到示例内容</a>
    <div class="docs-shell">
      <header class="site-header">
        <div class="header-brand">
          <button
            class="icon-button mobile-menu-button"
            type="button"
            :aria-expanded="mobileMenuOpen"
            aria-controls="example-navigation"
            :aria-label="mobileMenuOpen ? '关闭示例目录' : '打开示例目录'"
            @click="mobileMenuOpen = !mobileMenuOpen"
          >
            <UiIcon :name="mobileMenuOpen ? 'close' : 'menu'" :size="20" />
          </button>
          <RouterLink :to="defaultExamplePath" class="brand" aria-label="Antdv Next Pro 示例首页">
            <span class="brand-mark" aria-hidden="true"
              ><span></span><span></span><span></span><span></span
            ></span>
            <strong>Antdv Next Pro</strong>
          </RouterLink>
          <span class="header-divider"></span>
          <span class="playground-label">Playground</span>
        </div>
        <nav class="header-links" aria-label="站点导航">
          <span class="header-current">组件示例</span>
          <a href="https://bubblesplant.github.io/antdv-next-pro/" target="_blank" rel="noreferrer"
            >使用文档 <UiIcon name="external" :size="13"
          /></a>
          <a href="https://github.com/bubblesplant/antdv-next-pro" target="_blank" rel="noreferrer"
            >GitHub <UiIcon name="external" :size="13"
          /></a>
        </nav>
      </header>

      <button
        v-if="mobileMenuOpen"
        type="button"
        class="sidebar-backdrop"
        aria-label="关闭示例目录"
        @click="mobileMenuOpen = false"
      ></button>

      <aside
        id="example-navigation"
        :class="['docs-sidebar', { 'is-open': mobileMenuOpen }]"
        aria-label="组件示例目录"
      >
        <div class="sidebar-search">
          <label class="search-box">
            <UiIcon name="search" />
            <input
              ref="searchInput"
              v-model="keyword"
              type="search"
              placeholder="搜索组件或示例..."
              aria-label="搜索组件或示例"
            />
            <kbd v-if="!keyword">⌃ K</kbd>
          </label>
        </div>
        <div class="sidebar-caption">
          <span>组件与示例</span><span>{{ examples.length }}</span>
        </div>
        <nav class="example-navigation" aria-label="选择测试场景">
          <div v-for="component in navigation" :key="component.id" class="component-group">
            <button
              type="button"
              class="component-toggle"
              :aria-expanded="Boolean(normalizedKeyword) || openedComponents.has(component.id)"
              :aria-controls="`nav-${component.id}`"
              @click="toggle(openedComponents, component.id)"
            >
              <UiIcon
                name="chevron"
                :size="13"
                :class="{ rotated: normalizedKeyword || openedComponents.has(component.id) }"
              />
              <span class="component-name"
                >{{ component.name }}<small>{{ component.label }}</small></span
              >
              <span class="component-count">{{ component.total }}</span>
            </button>
            <div
              v-if="normalizedKeyword || openedComponents.has(component.id)"
              :id="`nav-${component.id}`"
              class="component-sections"
            >
              <section
                v-for="(section, sectionIndex) in component.sections"
                :key="section.key"
                class="nav-section"
              >
                <button
                  type="button"
                  class="section-toggle"
                  :aria-expanded="Boolean(normalizedKeyword) || openedSections.has(section.key)"
                  :aria-controls="`section-${component.id}-${sectionIndex}`"
                  @click="toggle(openedSections, section.key)"
                >
                  <UiIcon
                    name="chevron"
                    :size="11"
                    :class="{ rotated: normalizedKeyword || openedSections.has(section.key) }"
                  />
                  {{ section.title }}
                </button>
                <div
                  v-if="normalizedKeyword || openedSections.has(section.key)"
                  :id="`section-${component.id}-${sectionIndex}`"
                  class="section-examples"
                >
                  <RouterLink
                    v-for="example in section.examples"
                    :key="example.path"
                    :to="example.path"
                    class="example-link"
                    :data-demo-id="example.path.split('/').at(-1)"
                    :aria-current="route.path === example.path ? 'page' : undefined"
                    :title="example.title"
                  >
                    <span>{{ example.title }}</span>
                    <span
                      v-if="
                        example.path.endsWith('/tree-data') || example.path.endsWith('/tree-select')
                      "
                      class="tree-marker"
                      >树形</span
                    >
                  </RouterLink>
                </div>
              </section>
            </div>
          </div>
          <div v-if="navigation.length === 0" class="search-empty">
            <p>没有找到相关示例</p>
            <button type="button" @click="keyword = ''">清空搜索</button>
          </div>
        </nav>
        <div class="sidebar-footer">
          <span class="version-dot"></span>Vue 3 · Antdv Next<span>MIT</span>
        </div>
      </aside>

      <main id="main-content" class="docs-main" tabindex="-1">
        <RouterView v-slot="{ Component }"
          ><component :is="Component" :key="route.path"
        /></RouterView>
      </main>
    </div>
  </ConfigProvider>
</template>
