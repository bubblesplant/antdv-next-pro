import type { CSSProperties } from 'vue'
import { computed } from 'vue'
import { useProConfig } from '../provider/context'

// The stylesheet is static, so theming reaches it only through custom properties resolved at
// runtime. Each component root that owns themed markup must publish these, otherwise standalone
// usage falls back to the light-mode literals in the CSS.
export function useThemeVars() {
  const { token } = useProConfig()

  return computed(
    () =>
      ({
        '--antdv-next-pro-color-text': token.value.colorText,
        '--antdv-next-pro-color-text-secondary': token.value.colorTextSecondary,
        '--antdv-next-pro-color-text-heading': token.value.colorTextHeading,
        '--antdv-next-pro-color-text-placeholder': token.value.colorTextPlaceholder,
        '--antdv-next-pro-color-bg-text-hover': token.value.colorBgTextHover,
        '--antdv-next-pro-color-primary': token.value.colorPrimary,
        '--antdv-next-pro-color-primary-bg': token.value.colorPrimaryBg,
        '--antdv-next-pro-color-bg-container': token.value.colorBgContainer,
        '--antdv-next-pro-color-bg-elevated': token.value.colorBgElevated,
        '--antdv-next-pro-color-fill-alter': token.value.colorFillAlter,
        '--antdv-next-pro-color-border-secondary': token.value.colorBorderSecondary,
        '--antdv-next-pro-color-split': token.value.colorSplit,
        '--antdv-next-pro-color-error': token.value.colorError,
        '--antdv-next-pro-box-shadow-secondary': token.value.boxShadowSecondary,
        '--antdv-next-pro-padding-lg': `${token.value.paddingLG}px`,
        '--antdv-next-pro-padding': `${token.value.padding}px`,
        '--antdv-next-pro-margin': `${token.value.margin}px`,
        '--antdv-next-pro-margin-lg': `${token.value.marginLG}px`,
        '--antdv-next-pro-margin-xs': `${token.value.marginXS}px`,
        '--antdv-next-pro-margin-xxs': `${token.value.marginXXS}px`,
        '--antdv-next-pro-font-size': `${token.value.fontSize}px`,
        '--antdv-next-pro-font-size-sm': `${token.value.fontSizeSM}px`,
        '--antdv-next-pro-font-size-lg': `${token.value.fontSizeLG}px`,
        '--antdv-next-pro-font-weight-strong': token.value.fontWeightStrong,
        '--antdv-next-pro-border-radius': `${token.value.borderRadius}px`,
        '--antdv-next-pro-border-radius-lg': `${token.value.borderRadiusLG}px`,
      }) as CSSProperties,
  )
}
