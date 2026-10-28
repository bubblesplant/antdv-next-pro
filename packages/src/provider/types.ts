import type { CSSProperties, VNodeChild } from 'vue'
import type { GlobalToken } from 'antdv-next'

export interface IntlType {
  locale: string
  getMessage: (id: string, defaultMessage?: string) => string
}

export interface ProLayoutToken {
  hashId: string
  colorPrimary: string
  colorBgAppListIconHover: string
  colorTextAppListIconHover: string
  colorTextAppListIcon: string
  bgLayout: string | null
  sider: {
    colorBgCollapsedButton: string
    colorTextCollapsedButtonHover: string
    colorTextCollapsedButton: string
    colorMenuBackground: string
    menuHeight: number
    colorBgMenuItemCollapsedElevated: string
    colorMenuItemDivider: string
    colorBgMenuItemHover: string
    colorBgMenuItemActive: string
    colorBgMenuItemSelected: string
    colorTextMenuSelected: string
    colorTextMenuItemHover: string
    colorTextMenuActive: string
    colorTextMenu: string
    colorTextMenuSecondary: string
    paddingInlineLayoutMenu: number
    paddingBlockLayoutMenu: number
    colorTextMenuTitle: string
    colorTextSubMenuSelected: string
  }
  header: {
    colorBgHeader: string
    colorBgScrollHeader: string
    colorHeaderTitle: string
    colorBgMenuItemHover: string
    colorBgMenuElevated: string
    colorBgMenuItemSelected: string
    colorTextMenuSelected: string
    colorTextMenuActive: string
    colorTextMenu: string
    colorTextMenuSecondary: string
    colorBgRightActionsItemHover: string
    colorTextRightActionsItem: string
    heightLayoutHeader: number
  }
  pageContainer: {
    colorBgPageContainer: string
    paddingInlinePageContainerContent: number
    paddingBlockPageContainerContent: number
    colorBgPageContainerFixed: string
  }
}
export type DeepPartial<T> = T extends
  | string
  | number
  | boolean
  | bigint
  | symbol
  | null
  | undefined
  ? T
  : T extends (...args: never[]) => unknown
    ? T
    : T extends object
      ? { [K in keyof T]?: DeepPartial<T[K]> }
      : T
export type ProToken = Partial<GlobalToken> &
  DeepPartial<{
    layout: ProLayoutToken
    themeId: number
    proComponentsCls: string
    antCls: string
    iconCls: string
  }>

export interface ProFieldRenderContext {
  mode: 'read' | 'edit' | 'update'
  value: unknown
  onChange: (value: unknown) => void
  fieldProps: Record<string, unknown>
  defaultRender: () => VNodeChild
}

export interface ProValueTypeDefinition {
  render?: (text: unknown, props: ProFieldRenderContext, dom: VNodeChild) => VNodeChild
  formItemRender?: (text: unknown, props: ProFieldRenderContext, dom: VNodeChild) => VNodeChild
  /** @deprecated 使用 formItemRender。 */
  renderFormItem?: (text: unknown, props: ProFieldRenderContext, dom: VNodeChild) => VNodeChild
}

export type ProValueTypeMap = Record<string, ProValueTypeDefinition>
export type ProSemanticClasses<Key extends string = string> = Partial<Record<Key, string>>
export type ProSemanticStyles<Key extends string = string> = Partial<Record<Key, CSSProperties>>
export type ProSemanticSource<Value, Props = Record<string, unknown>> =
  | Value
  | ((info: { props: Props }) => Value)

export interface ProConfigProviderProps {
  intl?: IntlType
  token?: ProToken
  valueTypeMap?: ProValueTypeMap
  prefixCls?: string
  dark?: boolean
  contentHash?: string
  autoClearCache?: boolean
  hashed?: boolean
  needDeps?: boolean
}

export interface ProRequestCacheEntry {
  promise?: Promise<unknown>
  value?: unknown
  expires?: number
}
