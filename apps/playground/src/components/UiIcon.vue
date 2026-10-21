<script setup lang="ts">
defineProps<{ name: string; size?: number }>()

const paths: Record<string, string> = {
  search: 'm21 21-4.5-4.5M19 10.5a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0',
  chevron: 'm9 5 7 7-7 7',
  menu: 'M4 6h16M4 12h16M4 18h16',
  close: 'm6 6 12 12M6 18 18 6',
  copy: 'M9 9h11v12H9zM15 9V3H3v12h6',
  link: 'm10 13 4-4M8 16l-1 1a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0M16 8l1-1a4 4 0 0 1 6 6l-5 5a4 4 0 0 1-6 0',
  reset: 'M3 10a9 9 0 1 1 2.8 8.5M3 3v7h7',
  code: 'm8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18',
  download: 'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',
  arrow: 'M5 12h14m-6-6 6 6-6 6',
  external: 'M14 3h7v7m0-7L10 14M10 3H3v18h18v-7',
  check: 'm5 12 4 4L19 6',
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
}
</script>

<template>
  <svg
    :width="size ?? 16"
    :height="size ?? 16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.65"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path :d="paths[name] ?? paths.grid" />
  </svg>
</template>
