import { useProPrefix, useIntl, useProConfig } from '../provider'
import { useSemanticStyles } from '../shared/semantic'
import { useThemeVars } from '../shared/useThemeVars'
import type { AuxiliarySemanticProps } from './types'

export function useAuxiliaryStyle<P extends AuxiliarySemanticProps<P>>(props: P, suffix: string) {
  const { direction } = useProConfig()
  return {
    direction,
    prefix: useProPrefix(suffix, () => props.prefixCls),
    intl: useIntl(),
    themeVars: useThemeVars(),
    ...useSemanticStyles(props, {
      classes: () => props.classes,
      classNames: () => props.classNames,
      styles: () => props.styles,
    }),
  }
}
