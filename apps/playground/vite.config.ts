import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite-plus'

export default defineConfig(({ command, isPreview }) => ({
  base: command === 'build' || isPreview ? '/antdv-next-pro/playground/' : '/',
  plugins: [vue()],
  server: {
    port: 9902,
    strictPort: false,
  },
  resolve: {
    alias: {
      '@bubblesjs/antdv-next-pro': fileURLToPath(
        new URL('../../packages/src/index.ts', import.meta.url),
      ),
    },
  },
}))
