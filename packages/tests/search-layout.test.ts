import { describe, expect, it } from 'vite-plus/test'
import { getSearchColumns } from '../src/table/searchLayout'

describe('responsive table search layout', () => {
  it('carries partial span settings forward across missing breakpoints', () => {
    const span = { xs: 24, md: 12, xl: 8 }
    expect(getSearchColumns(span, 375)).toBe(1)
    expect(getSearchColumns(span, 700)).toBe(1)
    expect(getSearchColumns(span, 800)).toBe(2)
    expect(getSearchColumns(span, 1100)).toBe(2)
    expect(getSearchColumns(span, 1400)).toBe(3)
    expect(getSearchColumns(span, 1800)).toBe(3)
  })

  it('keeps numeric spans and clamps invalid spans to a usable grid', () => {
    expect(getSearchColumns(6, 1200)).toBe(4)
    expect(getSearchColumns(0, 1200)).toBe(24)
    expect(getSearchColumns(48, 1200)).toBe(1)
    expect(getSearchColumns(Number.NaN, 1200)).toBe(3)
    expect(getSearchColumns(undefined, 375)).toBe(1)
    expect(getSearchColumns(undefined, 800)).toBe(2)
    expect(getSearchColumns(undefined, 1200)).toBe(3)
  })
})
