import type { VNodeChild } from 'vue'
import type { PopoverProps, TooltipProps, FormItemProps } from 'antdv-next'
import type { ProSemanticClasses, ProSemanticStyles, ProSemanticSource } from '../provider/types'
import type { ProTableToolbarConfig } from '../types'

export interface AuxiliarySemanticProps<P = Record<string, unknown>> {
  prefixCls?: string
  classes?: ProSemanticSource<ProSemanticClasses, P>
  /** @deprecated Use classes. */
  classNames?: ProSemanticSource<ProSemanticClasses, P>
  styles?: ProSemanticSource<ProSemanticStyles, P>
}
export interface ListToolBarProps
  extends ProTableToolbarConfig, AuxiliarySemanticProps<ListToolBarProps> {}
export interface DropdownFooterProps extends AuxiliarySemanticProps<DropdownFooterProps> {
  disabled?: boolean
  onConfirm?: (event?: MouseEvent) => void
  onClear?: (event?: MouseEvent) => void
  confirmText?: VNodeChild
  clearText?: VNodeChild
  footerRender?:
    | false
    | ((confirm?: (event?: MouseEvent) => void, clear?: (event?: MouseEvent) => void) => VNodeChild)
}
export interface FieldLabelProps extends AuxiliarySemanticProps<FieldLabelProps> {
  label?: VNodeChild
  value?: VNodeChild
  disabled?: boolean
  expanded?: boolean
  ellipsis?: boolean
  onClear?: () => void
}
export interface LabelIconTipProps extends AuxiliarySemanticProps<LabelIconTipProps> {
  label?: VNodeChild
  tooltip?: string | TooltipProps
  subTitle?: VNodeChild
  ellipsis?: boolean
}
export interface FilterDropdownProps extends AuxiliarySemanticProps<FilterDropdownProps> {
  label?: VNodeChild
  open?: boolean
  disabled?: boolean
  placement?: PopoverProps['placement']
  popoverProps?: PopoverProps
  footer?: DropdownFooterProps
  footerRender?: DropdownFooterProps['footerRender']
  padding?: number
}
export interface LightWrapperProps extends AuxiliarySemanticProps<LightWrapperProps> {
  label?: VNodeChild
  value?: VNodeChild
  open?: boolean
  disabled?: boolean
  allowClear?: boolean
  footerRender?: DropdownFooterProps['footerRender']
  placement?: PopoverProps['placement']
}
export interface TableDropdownItem {
  key: string
  name?: VNodeChild
  label?: VNodeChild
  disabled?: boolean
  danger?: boolean
}
export interface TableDropdownProps extends AuxiliarySemanticProps<TableDropdownProps> {
  menus?: TableDropdownItem[]
  options?: TableDropdownItem[]
  onSelect?: (key: string) => void
  text?: VNodeChild
  disabled?: boolean
}
export interface InlineErrorFormItemProps
  extends
    Omit<FormItemProps, 'classes' | 'styles' | 'prefixCls'>,
    AuxiliarySemanticProps<InlineErrorFormItemProps> {
  error?: VNodeChild
  errorType?: 'popover' | 'default'
}
export interface ErrorBoundaryProps extends AuxiliarySemanticProps<ErrorBoundaryProps> {
  fallback?: VNodeChild | ((error: Error, reset: () => void) => VNodeChild)
  resetKeys?: unknown[]
  onError?: (error: Error, info: string) => void
}
