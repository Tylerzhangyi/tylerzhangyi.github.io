import { damp } from './scrollLoop'

const lerp = (a, b, t) => a + (b - a) * t

/** 与 blogScroll 相同的 easeInOut，滚动/入场节奏一致 */
export const easeInOut = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

/**
 * Blog 同款「从地面长出来」：scale 0.6→1 + 自下方升起 + damp 惯性
 *
 * @param {Array<{ el: HTMLElement, origin?: string, scaleFrom?: number, yFromRatio?: number }>} items
 * @param {{ durationMs?: number, smooth?: number, delayMs?: number, onComplete?: () => void }} [options]
 * @returns {() => void}
 */
export function playGrowFromGround(items, options = {}) {
  const {
    durationMs = 2400,
    smooth = 0.1,
    delayMs = 0,
    scaleFrom: defaultScaleFrom = 0.6,
    yFromRatio: defaultYFromRatio = 0.28,
    onComplete
  } = options

  let running = true
  let rafId = 0
  let startTime = 0
  let currentP = 0
  let delayTimer = 0

  function apply(p) {
    items.forEach(({ el, origin, scaleFrom, yFromRatio }) => {
      if (!el) return
      const o = origin || 'center bottom'
      const s0 = scaleFrom ?? defaultScaleFrom
      const yRatio = yFromRatio ?? defaultYFromRatio
      const h = el.offsetHeight || parseFloat(getComputedStyle(el).fontSize) * 2 || 80

      el.style.transformOrigin = o
      el.style.willChange = 'transform, opacity'

      const scale = lerp(s0, 1, p)
      const y = lerp(h * yRatio, 0, p)
      el.style.opacity = String(Math.min(1, Math.max(0, p)))
      el.style.transform = `translate3d(0, ${y}px, 0) scale(${scale})`
    })
  }

  function prime() {
    apply(0)
  }

  function tick(now) {
    if (!running) return
    if (!startTime) startTime = now

    const rawT = Math.min(1, (now - startTime) / durationMs)
    const targetP = easeInOut(rawT)
    currentP = damp(currentP, targetP, smooth)
    apply(currentP)

    if (rawT < 1 || Math.abs(currentP - targetP) > 0.002) {
      rafId = requestAnimationFrame(tick)
      return
    }

    apply(1)
    onComplete?.()
  }

  function start() {
    prime()
    startTime = 0
    currentP = 0
    rafId = requestAnimationFrame(tick)
  }

  if (delayMs > 0) {
    prime()
    delayTimer = window.setTimeout(start, delayMs)
  } else {
    start()
  }

  return () => {
    running = false
    if (delayTimer) window.clearTimeout(delayTimer)
    if (rafId) cancelAnimationFrame(rafId)
  }
}

/**
 * 纯文字段落：只做 y 升起 + 淡入（不缩放）
 */
export function playRiseFade(el, options = {}) {
  return playGrowFromGround(
    [{ el, origin: 'left bottom', scaleFrom: 1, yFromRatio: options.yFromRatio ?? 0.35 }],
    {
      durationMs: options.durationMs ?? 2000,
      smooth: options.smooth ?? 0.11,
      delayMs: options.delayMs ?? 0,
      onComplete: options.onComplete
    }
  )
}
