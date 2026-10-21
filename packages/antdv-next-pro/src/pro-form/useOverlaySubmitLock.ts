import { onBeforeUnmount, ref } from 'vue'

/** submitTimeout limits the close protection; it does not abort the submission. */
export function useOverlaySubmitLock(timeout: () => number | undefined) {
  const locked = ref(false)
  let timer: ReturnType<typeof setTimeout> | undefined
  function stop() {
    if (timer !== undefined) clearTimeout(timer)
    timer = undefined
    locked.value = false
  }
  function start() {
    stop()
    const duration = timeout()
    if (!duration || duration <= 0) return
    locked.value = true
    timer = setTimeout(stop, duration)
  }
  onBeforeUnmount(stop)
  return { locked, start, stop }
}
