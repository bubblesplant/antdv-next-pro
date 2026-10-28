import type { App, Component, Plugin } from 'vue'

import EditableProTable from './EditableProTable.vue'
import AdaptiveProTable from './adaptive-pro-table/AdaptiveProTable'
import ProCard, { ProCardGroup, ProCardDivider, ProCardTabPane } from './pro-card'
import { ProConfigProvider, ProProvider } from './provider'
import { ProField } from './pro-field'
import * as fieldAtoms from './pro-field/atoms'
import {
  ProForm,
  ProFormGroup,
  ProFormFieldSet,
  ProFormList,
  ProFormDependency,
  ProFormItem,
  ProFormErrorList,
  ProFormProvider,
  LightWrapper,
} from './pro-form'
import { ProDescriptions, ProDescriptionsItem } from './pro-descriptions'
import { ProList, BaseProList } from './pro-list'
import { DragSortTable, RowEditorTable, CellEditorTable } from './table'
import * as sharedComponents from './components'
import ProTable from './ProTable.vue'
import SchemaForm from './SchemaForm.vue'
import {
  DrawerForm,
  Embed,
  Form,
  LightFilter,
  ModalForm,
  QueryFilter,
  StepForm,
  StepsForm,
} from './schema-form'
import { proFormFieldComponents, ProFormField } from './pro-form-fields'
import './style.css'

const components = [
  ['ProCard', ProCard],
  ['ProCardGroup', ProCardGroup],
  ['ProCardDivider', ProCardDivider],
  ['ProCardTabPane', ProCardTabPane],
  ['ProTable', ProTable],
  ['AdaptiveProTable', AdaptiveProTable],
  ['EditableProTable', EditableProTable],
  ['SchemaForm', SchemaForm],
  ['BetaSchemaForm', SchemaForm],
  ['ProForm', ProForm],
  ['ProFormGroup', ProFormGroup],
  ['ProFormFieldSet', ProFormFieldSet],
  ['ProFormList', ProFormList],
  ['ProFormDependency', ProFormDependency],
  ['ProFormItem', ProFormItem],
  ['ProFormErrorList', ProFormErrorList],
  ['ProFormProvider', ProFormProvider],
  ['ProFormField', ProFormField],
  ['ProDescriptions', ProDescriptions],
  ['ProDescriptionsItem', ProDescriptionsItem],
  ['ProList', ProList],
  ['BaseProList', BaseProList],
  ['DragSortTable', DragSortTable],
  ['RowEditorTable', RowEditorTable],
  ['CellEditorTable', CellEditorTable],
  ['Form', Form],
  ['Embed', Embed],
  ['ModalForm', ModalForm],
  ['DrawerForm', DrawerForm],
  ['QueryFilter', QueryFilter],
  ['LightFilter', LightFilter],
  ['StepForm', StepForm],
  ['StepsForm', StepsForm],
  ['ProConfigProvider', ProConfigProvider],
  ['ProProvider', ProProvider],
  ['ProField', ProField],
  ...Object.entries(sharedComponents).filter(([name]) => name !== 'LightWrapper'),
  ['LightWrapper', LightWrapper],
  ...Object.entries(fieldAtoms).filter(
    ([, component]) => typeof component === 'object' && component !== null && 'setup' in component,
  ),
  ...proFormFieldComponents,
] as const

export const AntdvNextPro: Plugin = {
  install(app: App) {
    for (const [publicName, component] of components) {
      // Vue's global registry erases generic SFC props; public named exports retain their types.
      const runtimeComponent = component as Component
      app.component(publicName, runtimeComponent)
      if (runtimeComponent.name && runtimeComponent.name !== publicName)
        app.component(runtimeComponent.name, runtimeComponent)
    }
    // Preserve the original template aliases even when a layout delegates to a composition form.
    for (const [name, component] of Object.entries({
      Form,
      Embed,
      ModalForm,
      DrawerForm,
      QueryFilter,
      LightFilter,
      StepForm,
      StepsForm,
    })) {
      app.component(`AntdvNextPro${name}`, component as Component)
    }
  },
}

export {
  AdaptiveProTable,
  DrawerForm,
  EditableProTable,
  Embed,
  Form,
  LightFilter,
  ModalForm,
  ProCard,
  ProTable,
  QueryFilter,
  SchemaForm,
  StepForm,
  StepsForm,
  LightWrapper,
}
export { SchemaForm as BetaSchemaForm }
export * from './pro-form'
export * from './pro-descriptions'
export * from './pro-list'
export * from './table'
export * from './pro-form-fields'
export * from './pro-field'
export * from './pro-card'
export * from './components'
export {
  ProConfigProvider,
  ProProvider,
  useProConfig,
  useIntl,
  useProPrefix,
  createIntl,
  intlMap,
  intlMapKeys,
  findIntlKeyByAntdLocaleKey,
} from './provider'
export * from './provider/locales'
export type {
  IntlType,
  ProConfigProviderProps,
  ProValueTypeMap,
  ProValueTypeDefinition,
  ProFieldRenderContext,
  ProToken,
  ProLayoutToken,
  DeepPartial,
} from './provider/types'
export type * from './types'

export default AntdvNextPro
