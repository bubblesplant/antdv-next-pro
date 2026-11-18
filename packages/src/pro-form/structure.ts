import type { DefineComponent } from 'vue'
import type { ProFormFieldSetProps } from './types'
import ProFormFieldSetComponent from './ProFormFieldSet.vue'

export { default as ProFormGroup } from './ProFormGroup.vue'
export { default as ProFormList } from './ProFormList.vue'
export { default as ProFormDependency } from './ProFormDependency.vue'
export const ProFormFieldSet =
  ProFormFieldSetComponent as unknown as DefineComponent<ProFormFieldSetProps>
export { default as ProFormItem } from './ProFormItem.vue'
