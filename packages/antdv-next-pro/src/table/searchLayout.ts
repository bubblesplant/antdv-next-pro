import type { ProTableSearchConfig } from '../types'

const breakpoints = [
  ['xs', 0],
  ['sm', 576],
  ['md', 768],
  ['lg', 992],
  ['xl', 1200],
  ['xxl', 1600],
] as const

export function getSearchColumns(span: ProTableSearchConfig['span'], width: number): number {
  let resolved = typeof span === 'number' ? span : 24
  if (span && typeof span === 'object') {
    // Ant Design Col carries the last configured breakpoint forward.
    for (const [name, minWidth] of breakpoints) {
      if (width < minWidth) break
      resolved = span[name] ?? resolved
    }
  } else if (span === undefined) {
    resolved = width < 576 ? 24 : width < 992 ? 12 : 8
  }
  if (!Number.isFinite(resolved)) resolved = 8
  return Math.max(1, Math.floor(24 / Math.min(24, Math.max(1, Math.floor(resolved)))))
}
