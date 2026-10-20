import type { App, Component, Plugin } from 'vue'

import EditableProTable from './EditableProTable.vue'
import ProCard from './ProCard.vue'
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
import { proFormFieldComponents } from './pro-form-fields'
import './style.css'

const components: Array<readonly [publicName: string, component: Component]> = [
  ['ProCard', ProCard],
  ['ProTable', ProTable],
  ['EditableProTable', EditableProTable],
  ['SchemaForm', SchemaForm],
  ['Form', Form],
  ['Embed', Embed],
  ['ModalForm', ModalForm],
  ['DrawerForm', DrawerForm],
  ['QueryFilter', QueryFilter],
  ['LightFilter', LightFilter],
  ['StepForm', StepForm],
  ['StepsForm', StepsForm],
  ...proFormFieldComponents,
]

export const AntdvNextPro: Plugin = {
  install(app: App) {
    for (const [publicName, component] of components) {
      app.component(publicName, component)
      if (component.name && component.name !== publicName) app.component(component.name, component)
    }
  },
}

export {
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
}
export * from './pro-form-fields'
export type * from './types'

export default AntdvNextPro
