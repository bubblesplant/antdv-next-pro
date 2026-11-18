import type { DefineComponent } from 'vue'
import type { ProConfigProviderProps } from './types'
import ProConfigProviderComponent from './ProConfigProvider.vue'

export const ProConfigProvider =
  ProConfigProviderComponent as DefineComponent<ProConfigProviderProps>
export const ProProvider = ProConfigProvider
export type { ProConfigProviderProps } from './types'
export { mergeProToken } from './token'
