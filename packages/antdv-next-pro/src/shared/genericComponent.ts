import type { PublicProps, Slots, VNode } from 'vue'

/** Keeps row/params inference and exposed refs available to both TS and Vue consumers. */
export type GenericComponentResult<Props, Exposed> = VNode & {
  __ctx?: {
    props: Props & PublicProps
    attrs: Record<string, unknown>
    slots: Slots
    emit: (event: string, ...args: unknown[]) => void
    expose: (exposed: Exposed) => void
  }
}
