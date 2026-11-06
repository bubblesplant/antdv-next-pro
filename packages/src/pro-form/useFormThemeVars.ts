import type { CSSProperties } from 'vue'
import { computed } from 'vue'
import { useProConfig } from '../provider'
import { useThemeVars } from '../shared/useThemeVars'

export function useFormThemeVars() {
  const themeVars = useThemeVars()
  const { token } = useProConfig()
  return computed(
    () =>
      ({
        ...themeVars.value,
        '--pro-form-margin-xl': `${token.value.marginXL}px`,
        '--pro-form-margin-lg': `${token.value.marginLG}px`,
        '--pro-form-control-height': `${token.value.controlHeight}px`,
        '--pro-form-control-height-sm': `${token.value.controlHeightSM}px`,
        '--pro-form-line-height': token.value.lineHeight,
        '--pro-form-space-small': `${token.value.paddingXS}px`,
      }) as CSSProperties,
  )
}
