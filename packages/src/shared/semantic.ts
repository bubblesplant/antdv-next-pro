import { computed, toValue, type CSSProperties, type MaybeRefOrGetter } from 'vue'
import type { ProSemanticClasses, ProSemanticSource, ProSemanticStyles } from '../provider/types'

export function resolveSemantic<Value, Props>(
  source: ProSemanticSource<Value, Props> | undefined,
  props: Props,
): Value | undefined {
  return typeof source === 'function'
    ? (source as (info: { props: Props }) => Value)({ props })
    : source
}

export function useSemanticStyles<Props extends object, Key extends string = string>(
  props: Props,
  sources: {
    classes?: MaybeRefOrGetter<ProSemanticSource<ProSemanticClasses<Key>, Props> | undefined>
    classNames?: MaybeRefOrGetter<ProSemanticSource<ProSemanticClasses<Key>, Props> | undefined>
    styles?: MaybeRefOrGetter<ProSemanticSource<ProSemanticStyles<Key>, Props> | undefined>
  },
  defaults?: { classes?: ProSemanticClasses<Key>; styles?: ProSemanticStyles<Key> },
) {
  const classes = computed(() => {
    const legacy = resolveSemantic(toValue(sources.classNames), props) ?? {}
    const current = resolveSemantic(toValue(sources.classes), props) ?? {}
    const own = { ...legacy, ...current } as ProSemanticClasses<Key>
    const result: ProSemanticClasses<Key> = { ...defaults?.classes }
    for (const key of Object.keys(own) as Key[])
      result[key] = [result[key], own[key]].filter(Boolean).join(' ')
    return result
  })
  const styles = computed(() => {
    const own: ProSemanticStyles<Key> = resolveSemantic(toValue(sources.styles), props) ?? {}
    const result: ProSemanticStyles<Key> = { ...defaults?.styles }
    for (const key of Object.keys(own) as Key[])
      result[key] = { ...result[key], ...own[key] } as CSSProperties
    return result
  })
  return { classes, styles }
}
