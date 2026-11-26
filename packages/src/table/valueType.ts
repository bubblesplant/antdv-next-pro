import type { ProColumnValueType, ProValueTypeDefinitionValue } from '../types'
import type { ProTableRecord } from './record'

export function resolveColumnValueType<T extends ProTableRecord>(
  valueType: ProColumnValueType<T> | undefined,
  record: T,
  index: number,
): ProValueTypeDefinitionValue {
  const resolved = typeof valueType === 'function' ? valueType(record, index) : valueType
  return typeof resolved === 'object' && resolved ? resolved : { type: resolved ?? 'text' }
}
