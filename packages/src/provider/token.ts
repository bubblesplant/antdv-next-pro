import type { ProToken } from './types'

export function mergeProToken(base: ProToken, patch: ProToken): ProToken {
  const result = { ...base, ...patch }
  if (base.layout || patch.layout)
    result.layout = {
      ...base.layout,
      ...patch.layout,
      sider: { ...base.layout?.sider, ...patch.layout?.sider },
      header: { ...base.layout?.header, ...patch.layout?.header },
      pageContainer: { ...base.layout?.pageContainer, ...patch.layout?.pageContainer },
    }
  return result
}
