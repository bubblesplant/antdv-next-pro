import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite-plus'
import { playwright } from 'vite-plus/test/browser-playwright'

export default defineConfig({
  plugins: [vue()],
  pack: {
    entry: ['src/index.ts'],
    dts: { sourcemap: true, vue: true },
    deps: {
      neverBundle: ['vue', 'antdv-next', '@antdv-next/icons'],
    },
    format: ['esm'],
    fromVite: true,
    platform: 'neutral',
    sourcemap: true,
    outputOptions: {
      preserveModules: true,
      preserveModulesRoot: 'packages/antdv-next-pro',
      entryFileNames: '[name].mjs',
      chunkFileNames: 'chunks/[name].mjs',
    },
  },
  test: {
    coverage: {
      include: [
        'src/table/**/*.ts',
        'src/schema-form/utils.ts',
        'src/pro-form-fields/**/*.ts',
        'src/pro-form-fields/FieldControl.vue',
        'src/pro-form-fields/ProFormField.vue',
        'src/pro-form-fields/ReadonlyField.vue',
      ],
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },
    projects: [
      {
        extends: false,
        plugins: [vue()],
        test: {
          name: 'unit',
          environment: 'jsdom',
          include: ['tests/**/*.test.ts'],
          exclude: ['tests/**/*.browser.test.ts'],
          server: {
            deps: {
              inline: true,
            },
          },
        },
      },
      {
        extends: false,
        plugins: [vue()],
        resolve: { dedupe: ['vue'] },
        optimizeDeps: {
          include: [
            'vue',
            'antdv-next',
            'antdv-next/config-provider',
            '@antdv-next/icons',
            'dayjs',
            'dayjs/plugin/advancedFormat',
            'dayjs/plugin/customParseFormat',
            'dayjs/plugin/weekOfYear',
            'dayjs/plugin/weekYear',
          ],
        },
        test: {
          name: 'browser',
          include: ['tests/**/*.browser.test.ts'],
          browser: {
            enabled: true,
            provider: playwright({
              launchOptions: {
                channel: process.env.PRO_BROWSER_CHANNEL === 'chrome' ? 'chrome' : undefined,
              },
            }),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
})
