import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'

import ProLayout from './components/ProLayout.vue'
import ProHome from './components/ProHome.vue'

import '../../../../packages/antdv-next-pro/src/style.css'
import './custom.css'
import './docs.css'

export default {
  extends: DefaultTheme,
  Layout: ProLayout,
  enhanceApp({ app }) {
    app.component('ProHome', ProHome)
  },
} satisfies Theme
