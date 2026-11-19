import type { GlobalToken } from 'antdv-next'
import type { QueryFilterProps } from '../types'

const breakpoints = [
  ['xs', 'screenXSMin'],
  ['sm', 'screenSMMin'],
  ['md', 'screenMDMin'],
  ['lg', 'screenLGMin'],
  ['xl', 'screenXLMin'],
  ['xxl', 'screenXXLMin'],
] as const
const gutterBreakpoints = ['xxxl', 'xxl', 'xl', 'lg', 'md', 'sm', 'xs'] as const

interface QueryFilterLayoutOptions {
  width: number
  layout?: QueryFilterProps['layout']
  span?: QueryFilterProps['span']
  defaultColsNumber?: number
  token: Pick<GlobalToken, (typeof breakpoints)[number][1]>
}

export function resolveQueryFilterLayout({
  width,
  layout,
  span,
  defaultColsNumber,
  token,
}: QueryFilterLayoutOptions) {
  let resolved = typeof span === 'number' ? span : undefined
  if (span && typeof span === 'object') {
    resolved = breakpoints.map(([name]) => span[name]).find((value) => value !== undefined)
    for (const [name, key] of breakpoints) {
      resolved = span[name] ?? resolved
      if (width < token[key]) break
    }
  }
  if (resolved !== undefined && Number.isFinite(resolved) && resolved > 0) {
    return { span: Math.min(24, Math.max(1, resolved)), layout: layout ?? 'horizontal' }
  }

  const twoColumnLimit = layout === 'vertical' ? token.screenMDMin : token.screenSMMin
  const wideColumns = defaultColsNumber || (width < token.screenXLMin ? 3 : 4)
  const columns = width < token.screenXSMin ? 1 : width < twoColumnLimit ? 2 : wideColumns
  return {
    span: 24 / Math.min(24, Math.max(1, columns)),
    layout: layout ?? (width < token.screenSMMin ? 'vertical' : 'horizontal'),
  }
}

export function resolveQueryFilterGutter(
  gutter: QueryFilterProps['searchGutter'],
  screens: Partial<Record<(typeof gutterBreakpoints)[number], boolean>> | null,
) {
  const [horizontal, vertical] = Array.isArray(gutter) ? gutter : [gutter, undefined]
  const resolve = (size: typeof horizontal, fallback: number) => {
    if (typeof size === 'number') return size
    const matching = gutterBreakpoints.find(
      (name) => (screens === null || screens[name]) && size?.[name] !== undefined,
    )
    return (matching ? size?.[matching] : undefined) ?? fallback
  }
  return { horizontal: resolve(horizontal, 0), vertical: resolve(vertical, 24) }
}
