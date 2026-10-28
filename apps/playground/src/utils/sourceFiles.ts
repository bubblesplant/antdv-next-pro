import type { SourceFile } from '../examples'
import { strToU8, zipSync } from 'fflate'

export async function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  const previousFocus = document.activeElement
  document.body.append(textarea)
  try {
    textarea.select()
    if (!document.execCommand('copy')) throw new Error('浏览器未允许复制，请选中代码手动复制。')
  } finally {
    textarea.remove()
    if (previousFocus instanceof HTMLElement) previousFocus.focus()
  }
}

export function downloadSources(files: SourceFile[], name: string): void {
  const readme = `# ${name}\n\n保留文件目录结构，通过 ${files[0]?.name ?? '示例组件'} 引入示例。\n\n依赖：Vue 3.5+、antdv-next 1.5+、@bubblesjs/antdv-next-pro。\n\n在应用入口全局引入：\n\nimport 'antdv-next/dist/reset.css'\nimport '@bubblesjs/antdv-next-pro/style.css'\n`
  const entries = Object.fromEntries(
    [...files, { name: 'README.md', code: readme }].map((file) => [file.name, strToU8(file.code)]),
  )
  const archive = zipSync(entries)
  const url = URL.createObjectURL(new Blob([new Uint8Array(archive)], { type: 'application/zip' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${name}.zip`
  anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
