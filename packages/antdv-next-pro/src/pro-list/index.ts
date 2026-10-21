import type { PublicProps } from 'vue'
import type { ProTableInstance } from '../types'
import type { GenericComponentResult } from '../shared/genericComponent'
import type { ProListProps } from './types'
import ProListBase from './ProList.vue'
import BaseProListBase from './BaseProList.vue'

export interface ProListComponent {
  <
    T extends Record<string, unknown> = Record<string, unknown>,
    P extends Record<string, unknown> = Record<string, unknown>,
  >(
    props: ProListProps<T, P> & PublicProps,
  ): GenericComponentResult<ProListProps<T, P>, ProTableInstance<T>>
}
export const ProList = ProListBase as unknown as ProListComponent
export const BaseProList = BaseProListBase as unknown as ProListComponent
export type * from './types'
