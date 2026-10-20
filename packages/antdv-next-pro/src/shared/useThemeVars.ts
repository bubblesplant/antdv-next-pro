import type { CSSProperties } from 'vue'
import { theme } from 'antdv-next'
import { computed } from 'vue'

// The stylesheet is static, so theming reaches it only through custom properties resolved at
// runtime. Each component root that owns themed markup must publish these, otherwise standalone
// usage falls back to the light-mode literals in the CSS.
export function useThemeVars() {
  const { token } = theme.useToken()

  return computed(
    () =>
      ({
        '--antdv-next-pro-color-text': token.value.colorText,
        '--antdv-next-pro-color-text-secondary': token.value.colorTextSecondary,
        '--antdv-next-pro-color-bg-container': token.value.colorBgContainer,
        '--antdv-next-pro-color-bg-elevated': token.value.colorBgElevated,
        '--antdv-next-pro-color-fill-alter': token.value.colorFillAlter,
        '--antdv-next-pro-color-border-secondary': token.value.colorBorderSecondary,
        '--antdv-next-pro-color-error': token.value.colorError,
        '--antdv-next-pro-box-shadow-secondary': token.value.boxShadowSecondary,
        '--antdv-next-pro-padding-lg': `${token.value.paddingLG}px`,
        '--antdv-next-pro-border-radius-lg': `${token.value.borderRadiusLG}px`,
      }) as CSSProperties,
  )
}
