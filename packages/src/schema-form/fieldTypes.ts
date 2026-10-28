import type { Component, VNodeChild } from 'vue'
import type { SchemaFormColumn, SchemaFormLayoutType, SchemaFormSlots } from '../types'
import type { FormRecord } from './utils'

type SchemaSlot = NonNullable<SchemaFormSlots<FormRecord>[string]>

export interface FieldProps {
  column: SchemaFormColumn<FormRecord>
  model: FormRecord
  prefix?: Array<string | number>
  readonly?: boolean
  grid?: boolean
  layoutType?: SchemaFormLayoutType
  schemaSlots?: Record<string, SchemaSlot | undefined>
  onValueChange: (path: Array<string | number>, value: unknown) => void
}

export interface DefaultControlState {
  disabled: boolean
  component?: Component
  componentProps?: Record<string, unknown>
  readonlyValue?: VNodeChild
}

export interface FormListState {
  rows: unknown[]
  fieldProps: Record<string, unknown>
  creatorText: string
  path: Array<string | number>
  title: VNodeChild
}

export interface CompositeState {
  content: VNodeChild
  hasContent: boolean
  title: VNodeChild
}

export interface FormItemState {
  content: VNodeChild
  defaultControl?: DefaultControlState
  hasContent: boolean
  formItemProps: Record<string, unknown>
}
