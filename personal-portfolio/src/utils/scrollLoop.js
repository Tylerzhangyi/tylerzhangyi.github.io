/** 全局 scroll RAF：多区块共享一帧，可选视口门控 */

const subscribers = new Map()
let rafId = 0
let listening = false

function tick() {
  subscribers.forEach((entry) => {
    if (entry.active) entry.fn()
  })
  rafId = requestAnimationFrame(tick)
}

function ensureLoop() {
  if (listening) return
  listening = true
  rafId = requestAnimationFrame(tick)
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
}

function stopLoopIfEmpty() {
  if (subscribers.size || !listening) return
  cancelAnimationFrame(rafId)
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
  listening = false
}

function onScroll() {
  subscribers.forEach((entry) => {
    if (entry.active) entry.fn()
  })
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
        if (entry.active) fn()
      },
      { root: null, rootMargin: options.rootMargin ?? '15% 0px 15% 0px', threshold: 0 }
    )
    observer.observe(options.root)
    entry.observer = observer
  }

  subscribers.set(id, entry)
  fn()
  ensureLoop()

  return () => {
    entry.observer?.disconnect()
    subscribers.delete(id)
    stopLoopIfEmpty()
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
