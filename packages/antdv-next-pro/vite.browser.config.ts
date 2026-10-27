import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite-plus'

export default defineConfig({
  plugins: [vue()],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    outDir: 'dist/browser',
    target: 'es2022',
    cssCodeSplit: false,
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: () => 'antdv-next-pro.esm.js',
      cssFileName: 'style',
    },
    rolldownOptions: {
      external: ['vue'],
      output: {
        codeSplitting: false,
      },
    },
  },
})
