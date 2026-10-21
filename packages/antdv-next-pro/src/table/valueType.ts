import type { ProColumnValueType, ProValueTypeDefinitionValue } from '../types'
export function resolveColumnValueType<T extends Record<string, unknown>>(
  valueType: ProColumnValueType<T> | undefined,
  record: T,
  index: number,
): ProValueTypeDefinitionValue {
  const resolved = typeof valueType === 'function' ? valueType(record, index) : valueType
  return typeof resolved === 'object' && resolved ? resolved : { type: resolved ?? 'text' }
}
