export const DESKTOP_MIN_WIDTH = 993

export function resolveMotionMode({
  reducedMotion,
  finePointer,
  hoverHover,
  width
}) {
  if (reducedMotion) return 'reduced'
  if (finePointer && hoverHover && width >= DESKTOP_MIN_WIDTH) return 'desktopFull'
  return 'mobileLite'
}

export function readMotionEnvironment(win = window) {
  return {
    reducedMotion: win.matchMedia('(prefers-reduced-motion: reduce)').matches,
    finePointer: win.matchMedia('(pointer: fine)').matches,
    hoverHover: win.matchMedia('(hover: hover)').matches,
    width: win.innerWidth
  }
}

let cachedMode = 'mobileLite'
const listeners = new Set()

export function getMotionMode() {
  return cachedMode
}

export function subscribeMotionMode(cb) {
  if (typeof window === 'undefined') return () => {}
  const emit = () => {
    cachedMode = resolveMotionMode(readMotionEnvironment())
    listeners.forEach((fn) => fn(cachedMode))
  }
  listeners.add(cb)
  const mq = [
    window.matchMedia('(prefers-reduced-motion: reduce)'),
    window.matchMedia('(pointer: fine)'),
    window.matchMedia('(hover: hover)')
  ]
  mq.forEach((m) => m.addEventListener?.('change', emit))
  window.addEventListener('resize', emit, { passive: true })
  emit()
  cb(cachedMode)
  return () => {
    listeners.delete(cb)
    mq.forEach((m) => m.removeEventListener?.('change', emit))
    window.removeEventListener('resize', emit)
  }
}
