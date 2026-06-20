/** 全局 scroll：仅在 scroll/resize 时通知订阅者（空闲时不占用 RAF） */

const subscribers = new Map()
let listening = false
let rafPending = false

function flush() {
  rafPending = false
  subscribers.forEach((entry) => {
    if (entry.active) entry.fn()
  })
}

function scheduleFlush() {
  if (rafPending) return
  rafPending = true
  requestAnimationFrame(flush)
}

function ensureListening() {
  if (listening) return
  listening = true
  window.addEventListener('scroll', scheduleFlush, { passive: true })
  window.addEventListener('resize', scheduleFlush, { passive: true })
}

function stopListeningIfEmpty() {
  if (subscribers.size || !listening) return
  window.removeEventListener('scroll', scheduleFlush)
  window.removeEventListener('resize', scheduleFlush)
  listening = false
  rafPending = false
}

let nextId = 0

/**
 * @param {() => void} fn
 * @param {{ root?: Element | null, rootMargin?: string }} [options]
 */
export function subscribeScroll(fn, options = {}) {
  const id = ++nextId
  const entry = { fn, active: true }

  if (options.root instanceof Element) {
    const observer = new IntersectionObserver(
      ([observed]) => {
        entry.active = observed.isIntersecting
        if (entry.active) scheduleFlush()
      },
      { root: null, rootMargin: options.rootMargin ?? '15% 0px 15% 0px', threshold: 0 }
    )
    observer.observe(options.root)
    entry.observer = observer
  }

  subscribers.set(id, entry)
  scheduleFlush()
  ensureListening()

  return () => {
    entry.observer?.disconnect()
    subscribers.delete(id)
    stopListeningIfEmpty()
  }
}

/** @deprecated 使用 subscribeScroll */
export function bindScrollLoop(fn, options) {
  return subscribeScroll(fn, options)
}

export function damp(current, target, rate = 0.16) {
  const d = target - current
  if (Math.abs(d) < 0.5) return target
  return current + d * rate
}
