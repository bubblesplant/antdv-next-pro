import type { PublicProps } from 'vue'
import { DescriptionsItem } from 'antdv-next'
import type { GenericComponentResult } from '../shared/genericComponent'
import type { ProDescriptionsInstance, ProDescriptionsProps } from './types'
import ProDescriptionsBase from './ProDescriptions.vue'

export interface ProDescriptionsComponent {
  <
    T extends Record<string, unknown> = Record<string, unknown>,
    P extends Record<string, unknown> = Record<string, unknown>,
  >(
    props: ProDescriptionsProps<T, P> & PublicProps,
  ): GenericComponentResult<ProDescriptionsProps<T, P>, ProDescriptionsInstance<T>>
  Item: typeof DescriptionsItem
}
export const ProDescriptions = Object.assign(ProDescriptionsBase, {
  Item: DescriptionsItem,
}) as unknown as ProDescriptionsComponent
export { DescriptionsItem as ProDescriptionsItem }
export { default as FieldRender } from './FieldRender.vue'
export type * from './types'
export default ProDescriptions
