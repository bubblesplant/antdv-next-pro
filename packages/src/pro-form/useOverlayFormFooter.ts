import type { ComputedRef, InjectionKey, ShallowRef } from 'vue'
import { inject, provide, shallowRef } from 'vue'

interface OverlayFormFooter {
  enabled: ComputedRef<boolean>
  target: ShallowRef<HTMLElement | undefined>
}

const overlayFormFooterKey: InjectionKey<OverlayFormFooter> = Symbol('overlay-form-footer')

export function provideOverlayFormFooter(enabled: ComputedRef<boolean>) {
  const footer = { enabled, target: shallowRef<HTMLElement>() }
  provide(overlayFormFooterKey, footer)
  return footer
}

export function useOverlayFormFooter() {
  return inject(overlayFormFooterKey, undefined)
}
