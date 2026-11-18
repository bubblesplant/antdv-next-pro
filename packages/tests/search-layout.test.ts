import { describe, expect, it } from 'vite-plus/test'
import { resolveQueryFilterLayout } from '../src/pro-form/query-filter/layout'

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

  it('keeps numeric spans and carries partial spans forward through xxl', () => {
    const span = { xs: 24, md: 12, xl: 8, xxl: 6 }
    expect(resolveQueryFilterLayout({ width: 700, span, token }).span).toBe(24)
    expect(resolveQueryFilterLayout({ width: 1100, span, token }).span).toBe(12)
    expect(resolveQueryFilterLayout({ width: 1400, span, token }).span).toBe(8)
    expect(resolveQueryFilterLayout({ width: 1600, span, token }).span).toBe(6)
    expect(resolveQueryFilterLayout({ width: 375, span: 8, token })).toEqual({
      span: 8,
      layout: 'horizontal',
    })
    expect(resolveQueryFilterLayout({ width: 375, span: Number.NaN, token }).span).toBe(24)
  })
})
