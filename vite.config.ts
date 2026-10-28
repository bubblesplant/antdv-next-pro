import { defineConfig } from 'vite-plus'

export default defineConfig({
  staged: {
    '*.{js,jsx,ts,tsx,mjs,cjs,mts,cts,json,jsonc,yaml,yml,md,vue,css,scss}': 'vp check --fix',
    '*.vue': 'pnpm lint:vue',
  },
  fmt: {
    ignorePatterns: [
      '**/dist/**',
      '**/coverage/**',
      '**/.vitepress/cache/**',
      '**/.vitepress/dist/**',
    ],
    singleQuote: true,
    semi: false,
    experimentalSortPackageJson: true,
  },
  lint: {
    ignorePatterns: [
      '**/dist/**',
      '**/coverage/**',
      '**/.vitepress/cache/**',
      '**/.vitepress/dist/**',
      '**/*.vue',
      'packages/tests/consumer/**',
    ],
    jsPlugins: [{ name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' }],
    rules: {
      'vite-plus/prefer-vite-plus-imports': 'error',
    },
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  run: {
    cache: true,
    tasks: {
      quality: {
        command:
          'pnpm format:check && pnpm lint:ox && pnpm lint:vue && pnpm typecheck && pnpm test:coverage && pnpm test:browser && pnpm build && pnpm --filter @bubblesjs/antdv-next-pro verify:package',
        cache: {
          env: ['CI', 'NODE_ENV'],
        },
      },
    },
  },
})
