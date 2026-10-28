export function toDisplayText(value: unknown): string {
  if (value === undefined || value === null) return ''
  if (typeof value === 'string') return value
  if (
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint' ||
    typeof value === 'symbol'
  ) {
    return String(value)
  }
  if (value instanceof Date) return value.toLocaleString()
  try {
    return JSON.stringify(value) ?? ''
  } catch {
    return '[unserializable]'
  }
}
