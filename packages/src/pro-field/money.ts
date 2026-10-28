import type { InputNumberProps } from 'antdv-next'
import type { VNodeChild } from 'vue'

export interface FieldMoneyOptions {
  moneySymbol?: boolean
  locale?: string
  customSymbol?: string
  numberPopoverRender?: boolean | ((props: InputNumberProps, defaultText: string) => VNodeChild)
  numberFormatOptions?: Intl.NumberFormatOptions
}

export function resolveMoneyLocale(locale?: string): string {
  try {
    const normalized = locale?.replace('_', '-') ?? 'zh-CN'
    return Intl.NumberFormat.supportedLocalesOf(normalized).length ? normalized : 'zh-CN'
  } catch {
    return 'zh-CN'
  }
}

export function moneyFormatOptions(
  locale: string,
  props: Record<string, unknown> = {},
): Intl.NumberFormatOptions {
  const currency =
    ({ en: 'USD', ru: 'RUB', sr: 'RSD', ms: 'MYR', pt: 'BRL' } as Record<string, string>)[
      locale.slice(0, 2)
    ] ?? 'CNY'
  const precision = typeof props.precision === 'number' ? props.precision : 2
  return {
    style: 'currency',
    currency: typeof props.currency === 'string' ? props.currency : currency,
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
    ...(props.numberFormatOptions as Intl.NumberFormatOptions | undefined),
  }
}

export function formatMoney(
  value: unknown,
  locale?: string,
  props: Record<string, unknown> = {},
): string {
  if (value == null || value === '') return ''
  const numeric = Number(
    typeof value === 'string' ? value.replace(/[\s,\u00a0\u202f]/g, '') : value,
  )
  if (!Number.isFinite(numeric)) return typeof value === 'string' ? value : ''
  const actual = resolveMoneyLocale(typeof props.locale === 'string' ? props.locale : locale)
  const formatter = new Intl.NumberFormat(actual, moneyFormatOptions(actual, props))
  const hasPrefix = Object.hasOwn(props, 'prefix') && props.prefix !== undefined
  const hideSymbol = props.moneySymbol === false || props.prefix === false
  const symbol = hasPrefix ? props.prefix : props.customSymbol
  const parts = formatter.formatToParts(numeric)
  if (hideSymbol)
    return parts
      .filter((part) => part.type !== 'currency' && part.type !== 'literal')
      .map((part) => part.value)
      .join('')
  if (symbol !== undefined && (typeof symbol === 'string' || typeof symbol === 'number')) {
    return parts.map((part) => (part.type === 'currency' ? String(symbol) : part.value)).join('')
  }
  return parts.map((part) => part.value).join('')
}

export function parseMoney(text: string | undefined, locale?: string): string {
  if (!text) return ''
  const parts = new Intl.NumberFormat(resolveMoneyLocale(locale)).formatToParts(1234.5)
  const group = parts.find((part) => part.type === 'group')?.value ?? ','
  const decimal = parts.find((part) => part.type === 'decimal')?.value ?? '.'
  return text
    .split(group)
    .join('')
    .split(decimal)
    .join('.')
    .replace(/[^\d.+-]/g, '')
}
