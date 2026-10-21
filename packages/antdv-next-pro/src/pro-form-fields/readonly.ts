import type { VNodeChild } from 'vue'
import dayjs from 'dayjs'
import advancedFormat from 'dayjs/plugin/advancedFormat.js'
import weekOfYear from 'dayjs/plugin/weekOfYear.js'
import weekYear from 'dayjs/plugin/weekYear.js'

dayjs.extend(advancedFormat)
dayjs.extend(weekOfYear)
dayjs.extend(weekYear)

import type { ProValueType } from '../types'
import { formatMoney } from '../pro-field/money'
import { normalizeFieldOption } from './options'
import type { ProFormFieldOption } from './types'

export type ProReadonlyValueType = ProValueType | 'upload'

export interface FormatReadonlyValueOptions<Value = unknown> {
  options?: readonly ProFormFieldOption<Value>[]
  type?: ProReadonlyValueType
  emptyText?: VNodeChild
  moneyPrefix?: VNodeChild | false
  locale?: string
  fieldProps?: Record<string, unknown>
}

export function findFieldOption<Value = unknown>(
  value: unknown,
  options: readonly ProFormFieldOption<Value>[] = [],
): ProFormFieldOption<Value> | undefined {
  const exactMatch = findNestedFieldOption<Value>(options, (item) => Object.is(item.value, value))
  if (exactMatch) return exactMatch

  const valueText = toComparableText(value)
  if (valueText === undefined) return undefined
  return findNestedFieldOption<Value>(options, (item) => toComparableText(item.value) === valueText)
}

function findNestedFieldOption<Value>(
  options: readonly unknown[],
  predicate: (item: ProFormFieldOption<Value>) => boolean,
): ProFormFieldOption<Value> | undefined {
  for (const rawOption of options) {
    const option = normalizeFieldOption<Value>(rawOption)
    if (predicate(option)) return option
    if (!Array.isArray(option.children)) continue
    const nested = findNestedFieldOption<Value>(option.children, predicate)
    if (nested) return nested
  }
  return undefined
}

export function formatReadonlyValue<Value = unknown>(
  value: unknown,
  {
    options = [],
    type,
    emptyText = '-',
    moneyPrefix,
    locale,
    fieldProps = {},
  }: FormatReadonlyValueOptions<Value> = {},
): VNodeChild {
  if (isEmptyReadonlyValue(value)) return emptyText
  if (type === 'password') return '••••••'
  if (type === 'money')
    return formatMoney(value, locale, {
      ...fieldProps,
      ...(moneyPrefix === undefined ? {} : { prefix: moneyPrefix }),
    })
  if (type === 'digit' && locale && !Number.isNaN(Number(value)))
    return new Intl.NumberFormat(locale.replace('_', '-'), {
      maximumFractionDigits: typeof fieldProps.precision === 'number' ? fieldProps.precision : 20,
    }).format(Number(value))
  if (type === 'second') return formatDuration(Number(value), locale)

  if (type === 'upload' && Array.isArray(value)) {
    return joinReadonlyParts(
      value.map((item) => formatUploadFile(item, emptyText)),
      ', ',
    )
  }

  if (Array.isArray(value)) {
    const separator = isRangeValueType(type) ? ' ~ ' : type === 'cascader' ? ' / ' : ', '
    return joinReadonlyParts(
      value.map((item) => formatReadonlyScalar(item, options, type, emptyText, fieldProps, locale)),
      separator,
    )
  }

  const formatted = formatReadonlyScalar(value, options, type, emptyText, fieldProps, locale)
  if (type === 'percent') return appendReadonlyPart(formatted, '%')
  return formatted
}

function formatReadonlyScalar<Value>(
  value: unknown,
  options: readonly ProFormFieldOption<Value>[],
  type: ProReadonlyValueType | undefined,
  emptyText: VNodeChild,
  fieldProps: Record<string, unknown> = {},
  locale?: string,
): VNodeChild {
  const option = findFieldOption(value, options)
  if (option && option.label !== undefined && option.label !== null) return option.label

  if (typeof fieldProps.format === 'string' && type && /^(date|time|fromNow)/.test(type)) {
    const parsed = dayjs(value as string | number | Date)
    if (parsed.isValid()) return parsed.format(fieldProps.format)
  }
  if ((type === 'digitRange' || type === 'percent') && locale && !Number.isNaN(Number(value))) {
    return new Intl.NumberFormat(locale.replace('_', '-'), {
      maximumFractionDigits:
        typeof fieldProps.precision === 'number'
          ? fieldProps.precision
          : type === 'percent'
            ? 0
            : 20,
    }).format(Number(value))
  }
  if (value instanceof Date) return formatDate(value, type)
  if (
    type &&
    /^(date|fromNow)/.test(type) &&
    (typeof value === 'string' || typeof value === 'number')
  ) {
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) return formatDate(parsed, type)
  }
  if (isRecord(value) && typeof value.format === 'function') {
    return (value.format as (template?: string) => string)(dateTemplate(type))
  }
  if (typeof value === 'boolean') return value ? '是' : '否'

  return toDisplayText(value) ?? emptyText
}

export function formatDuration(value: number, locale = 'zh-CN'): string {
  if (!Number.isFinite(value)) return '-'
  let remaining = Math.floor(Math.abs(value))
  const parts: string[] = []
  const chinese = locale.toLowerCase().startsWith('zh')
  for (const [seconds, unit, label] of [
    [86400, 'day', '天'],
    [3600, 'hour', '小时'],
    [60, 'minute', '分钟'],
    [1, 'second', '秒'],
  ] as const) {
    const count = Math.floor(remaining / seconds)
    remaining %= seconds
    if (!count && (seconds !== 1 || parts.length)) continue
    parts.push(
      chinese
        ? `${count}${label}`
        : new Intl.NumberFormat(locale.replace('_', '-'), {
            style: 'unit',
            unit,
            unitDisplay: 'long',
          }).format(count),
    )
  }
  const text = parts.join(chinese ? '' : ' ')
  return value < 0 ? (chinese ? `${text}前` : `−${text}`) : text
}

function formatUploadFile(value: unknown, emptyText: VNodeChild): VNodeChild {
  if (!isRecord(value)) return toDisplayText(value) ?? emptyText
  return (
    toDisplayText(value.name) ??
    toDisplayText(value.fileName) ??
    toDisplayText(value.url) ??
    emptyText
  )
}

function joinReadonlyParts(parts: VNodeChild[], separator: string): VNodeChild {
  if (parts.length === 0) return ''
  if (parts.every(isTextPart)) return parts.map((part) => `${part}`).join(separator)

  return parts.flatMap((part, index) => (index === 0 ? [part] : [separator, part]))
}

function appendReadonlyPart(value: VNodeChild, suffix: string): VNodeChild {
  if (isTextPart(value)) return `${value}${suffix}`
  return [value, suffix]
}

function isTextPart(value: VNodeChild): value is string | number {
  return typeof value === 'string' || typeof value === 'number'
}

function isEmptyReadonlyValue(value: unknown): boolean {
  return value === undefined || value === null || value === ''
}

function isRangeValueType(type: ProReadonlyValueType | undefined): boolean {
  return Boolean(type?.endsWith('Range'))
}

function dateTemplate(type: ProReadonlyValueType | undefined): string {
  if (type?.startsWith('dateMonth')) return 'YYYY-MM'
  if (type?.startsWith('dateYear')) return 'YYYY'
  if (type?.startsWith('dateQuarter')) return 'YYYY-[Q]Q'
  if (type?.startsWith('dateWeek')) return 'YYYY-wo'
  if (type === 'date' || type === 'dateRange') return 'YYYY-MM-DD'
  if (type === 'time' || type === 'timeRange') return 'HH:mm:ss'
  return 'YYYY-MM-DD HH:mm:ss'
}

function formatDate(value: Date, type: ProReadonlyValueType | undefined): string {
  const date = [value.getFullYear(), pad(value.getMonth() + 1), pad(value.getDate())].join('-')
  const time = [pad(value.getHours()), pad(value.getMinutes()), pad(value.getSeconds())].join(':')
  if (type?.startsWith('dateYear')) return String(value.getFullYear())
  if (type?.startsWith('dateMonth')) return date.slice(0, 7)
  if (type?.startsWith('dateQuarter'))
    return `${value.getFullYear()}-Q${Math.floor(value.getMonth() / 3) + 1}`
  if (type?.startsWith('dateWeek')) {
    const thursday = new Date(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()))
    thursday.setUTCDate(thursday.getUTCDate() + 4 - (thursday.getUTCDay() || 7))
    const yearStart = new Date(Date.UTC(thursday.getUTCFullYear(), 0, 1))
    return `${thursday.getUTCFullYear()}-${pad(Math.ceil(((thursday.getTime() - yearStart.getTime()) / 86400000 + 1) / 7))}`
  }
  if (type === 'date' || type === 'dateRange') return date
  if (type === 'time' || type === 'timeRange') return time
  return `${date} ${time}`
}

function pad(value: number): string {
  return `${value}`.padStart(2, '0')
}

function toDisplayText(value: unknown): string | undefined {
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'bigint') return `${value}`
  return undefined
}

function toComparableText(value: unknown): string | undefined {
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  return toDisplayText(value)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
