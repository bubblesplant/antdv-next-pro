import type { CSSProperties, VNodeChild } from 'vue'
import { Fragment, isVNode } from 'vue'
import { useProConfig, useProPrefix } from '../provider'
import { resolveSemantic as resolveSource } from '../shared/semantic'
import type { FormClasses, FormStyles, SemanticValue } from './types'

export function useFormPrefix(suffix: string, explicit: () => string | undefined) {
  const context = useProConfig()
  return {
    prefix: useProPrefix(suffix, explicit),
    direction: context.direction,
    config: context.nativeConfig,
    intl: context.intl,
    t: (key: string, fallback: string) => context.intl.value.getMessage(key, fallback),
  }
}

export function resolveSemantic<P extends object>(
  props: P & {
    classes?: SemanticValue<FormClasses, P>
    classNames?: FormClasses
    styles?: SemanticValue<FormStyles, P>
  },
) {
  return {
    classes: { ...props.classNames, ...resolveSource(props.classes, props) },
    styles: resolveSource(props.styles, props) ?? {},
  }
}

export function flattenChildren(children: VNodeChild): import('vue').VNode[] {
  const result: import('vue').VNode[] = []
  for (const child of Array.isArray(children) ? children : [children]) {
    if (Array.isArray(child)) result.push(...flattenChildren(child))
    else if (isVNode(child)) {
      if (child.type === Fragment) result.push(...flattenChildren(child.children as VNodeChild))
      else if (typeof child.type !== 'symbol') result.push(child)
    }
  }
  return result
}

export function deletePath(
  target: Record<string, unknown>,
  path: readonly (string | number)[],
): void {
  let parent: unknown = target
  for (const key of path.slice(0, -1)) {
    if (!parent || typeof parent !== 'object') return
    parent = (parent as Record<string | number, unknown>)[key]
  }
  if (parent && typeof parent === 'object')
    delete (parent as Record<string | number, unknown>)[path.at(-1)!]
}

export function formatDates(
  value: unknown,
  formatter: import('./types').ProFormProps['dateFormatter'],
  valueType?: unknown,
): unknown {
  if (formatter === false) return value
  if (Array.isArray(value)) return value.map((item) => formatDates(item, formatter, valueType))
  if (typeof formatter === 'function') return formatter(value, valueType)
  if (value instanceof Date) return formatter === 'number' ? value.getTime() : value.toISOString()
  if (
    value &&
    typeof value === 'object' &&
    'format' in value &&
    typeof value.format === 'function'
  ) {
    if (formatter === 'number' && 'valueOf' in value) return value.valueOf()
    const type = typeof valueType === 'string' ? valueType : 'date'
    const format =
      type.includes('Time') || type === 'dateTime'
        ? 'YYYY-MM-DD HH:mm:ss'
        : type.startsWith('time')
          ? 'HH:mm:ss'
          : type.includes('Month')
            ? 'YYYY-MM'
            : type.includes('Year')
              ? 'YYYY'
              : 'YYYY-MM-DD'
    return value.format(format)
  }
  return value
}

export function assignRef<T>(
  target: import('vue').Ref<T | undefined> | ((instance: T | undefined) => void) | undefined,
  value: T | undefined,
): void {
  if (typeof target === 'function') target(value)
  else if (target) target.value = value
}

export function logicalRootStyle(direction: string): CSSProperties {
  return { direction: direction === 'rtl' ? 'rtl' : 'ltr' }
}
