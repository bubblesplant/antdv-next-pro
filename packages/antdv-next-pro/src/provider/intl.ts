import zhCN from './locale/zh_CN'
import type { IntlType } from './types'

export function getMessageByPath(messages: object, id: string): string | undefined {
  let current: unknown = messages
  for (const part of id.replace(/\[(\d+)\]/g, '.$1').split('.')) {
    if (typeof current !== 'object' || current === null) return undefined
    current = (current as Record<string, unknown>)[part]
  }
  return typeof current === 'string' ? current : undefined
}

export function createIntl(locale: string, messages: object): IntlType {
  return {
    locale,
    getMessage(id, defaultMessage = '') {
      return getMessageByPath(messages, id) ?? getMessageByPath(zhCN, id) ?? defaultMessage
    },
  }
}

export type { IntlType } from './types'
