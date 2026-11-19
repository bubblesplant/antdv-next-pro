import { describe, expect, it } from 'vite-plus/test'
import {
  resolveQueryFilterGutter,
  resolveQueryFilterLayout,
} from '../src/pro-form/query-filter/layout'

const token = {
  screenXSMin: 480,
  screenSMMin: 576,
  screenMDMin: 768,
  screenLGMin: 992,
  screenXLMin: 1200,
  screenXXLMin: 1600,
}

describe('responsive QueryFilter layout', () => {
  it.each([
    [479, 24, 'vertical'],
    [480, 12, 'vertical'],
    [575, 12, 'vertical'],
    [576, 8, 'horizontal'],
    [1199, 8, 'horizontal'],
    [1200, 6, 'horizontal'],
  ])('uses the upstream defaults at a container width of %s', (width, span, layout) => {
    expect(resolveQueryFilterLayout({ width, token })).toEqual({ span, layout })
  })

  it('uses the vertical layout and theme breakpoints when configured', () => {
    const themed = { ...token, screenMDMin: 800 }
    expect(resolveQueryFilterLayout({ width: 799, layout: 'vertical', token: themed })).toEqual({
      span: 12,
      layout: 'vertical',
    })
    expect(resolveQueryFilterLayout({ width: 800, layout: 'vertical', token: themed })).toEqual({
      span: 8,
      layout: 'vertical',
    })
    expect(resolveQueryFilterLayout({ width: 1250, defaultColsNumber: 3, token }).span).toBe(8)
  })

  it('selects the first matching upper-bound breakpoint for responsive spans', () => {
    const span = { xs: 24, md: 12, xl: 8, xxl: 6 }
    expect(resolveQueryFilterLayout({ width: 575, span, token }).span).toBe(24)
    expect(resolveQueryFilterLayout({ width: 576, span, token }).span).toBe(12)
    expect(resolveQueryFilterLayout({ width: 991, span, token }).span).toBe(12)
    expect(resolveQueryFilterLayout({ width: 992, span, token }).span).toBe(8)
    expect(resolveQueryFilterLayout({ width: 1199, span, token }).span).toBe(8)
    expect(resolveQueryFilterLayout({ width: 1200, span, token }).span).toBe(6)
    expect(resolveQueryFilterLayout({ width: 1600, span, token }).span).toBe(6)
  })

  it('backfills missing smaller spans and preserves explicit layouts and numeric spans', () => {
    expect(
      resolveQueryFilterLayout({ width: 375, span: { md: 8, xl: 6 }, layout: 'vertical', token }),
    ).toEqual({
      span: 8,
      layout: 'vertical',
    })
    expect(resolveQueryFilterLayout({ width: 375, span: 8, token })).toEqual({
      span: 8,
      layout: 'horizontal',
    })
    expect(resolveQueryFilterLayout({ width: 375, span: Number.NaN, token }).span).toBe(24)
  })

  it('resolves numeric, responsive and axis-specific gutters without discarding zero', () => {
    expect(resolveQueryFilterGutter(16, {})).toEqual({ horizontal: 16, vertical: 24 })
    expect(resolveQueryFilterGutter([{ xs: 4, md: 16, lg: 24 }, { md: 0 }], { md: true })).toEqual({
      horizontal: 16,
      vertical: 0,
    })
    expect(resolveQueryFilterGutter([{ lg: 12 }, 8], { sm: true })).toEqual({
      horizontal: 0,
      vertical: 8,
    })
  })
})
