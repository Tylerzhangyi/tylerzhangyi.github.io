/** Blog 区块：BLOG 大字 scale/opacity + 卡片叠入（对齐镜像站 Form Studio） */

const SHRINK_SCALE = 0.82
const ENTER_PORTION = 0.72
const ENTER_TRAVEL = 0.34
const SMOOTH = 0.16
const SMOOTH_FAST = 0.28

const clamp = (v, min, max) => Math.min(max, Math.max(min, v))
const lerp = (a, b, t) => a + (b - a) * t
const easeInOut = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

function damp(current, target, rate = SMOOTH) {
  const d = target - current
  if (Math.abs(d) < 0.001) return target
  return current + d * rate
}

/**
 * @param {{
 *   getSection: () => HTMLElement | null | undefined
 *   getTitleEl: () => HTMLElement | null | undefined
 *   getRunway: () => HTMLElement | null | undefined
 *   getCount: () => number
 *   getCardEl: (index: number) => HTMLElement | null | undefined
 *   getInnerEl: (index: number) => HTMLElement | null | undefined
 *   onActiveChange?: (active: boolean) => void
 *   prefersReducedMotion?: boolean
 * }} options
 */
export function createBlogScroll(options) {
  const cardMotion = []
  let rafId = 0
  let running = false

  function layoutRunway() {
    const runway = options.getRunway()
    const count = options.getCount()
    if (runway && count > 0) {
      runway.style.height = `${count * 100}vh`
    }
  }

  function applyCardTransform(inner, yPx, scale) {
    inner.style.transform = `translate3d(0, ${yPx}px, 0) scale(${scale})`
  }

  function initMotion(vh, count) {
    if (cardMotion.length === count) return
    cardMotion.length = 0
    for (let i = 0; i < count; i += 1) {
      cardMotion.push({ y: vh * 0.5, scale: 1 })
    }
  }

  function resetTitle(titleEl) {
    if (!titleEl) return
    titleEl.style.opacity = '0'
    titleEl.style.transform = 'translate(-50%, -50%) scale(0.6)'
  }

  function tick() {
    if (!running) return

    const section = options.getSection()
    const titleEl = options.getTitleEl()
    const count = options.getCount()

    if (!section || count < 1) {
      options.onActiveChange?.(false)
      rafId = requestAnimationFrame(tick)
      return
    }

    const isMobile = window.matchMedia('(max-width: 809px)').matches
    const reduced = options.prefersReducedMotion ?? false
    const vh = window.innerHeight
    const rect = section.getBoundingClientRect()
    const inBlog = rect.top < vh * 0.92 && rect.bottom > 0
    const nearBlog = rect.top < vh * 1.15 && rect.bottom > -vh * 0.25

    options.onActiveChange?.(inBlog)

    if (!nearBlog) {
      resetTitle(titleEl)
      rafId = requestAnimationFrame(tick)
      return
    }

    initMotion(vh, count)
    const scrolled = clamp(-rect.top, 0, section.offsetHeight - vh)

    if (reduced || isMobile) {
      if (titleEl) {
        titleEl.style.opacity = '1'
        titleEl.style.transform = 'translate(-50%, -50%) scale(1)'
      }
      for (let i = 0; i < count; i += 1) {
        const card = options.getCardEl(i)
        const inner = options.getInnerEl(i)
        if (!card || !inner) continue
        applyCardTransform(inner, 0, 1)
        card.style.visibility = 'visible'
        card.style.pointerEvents = 'auto'
        card.style.zIndex = String(10 + i)
      }
      rafId = requestAnimationFrame(tick)
      return
    }

    const titleTargetP = easeInOut(
      Math.max(clamp(1 - rect.top / vh, 0, 1), clamp(scrolled / vh, 0, 1))
    )
    const titleScale = lerp(0.6, 1, titleTargetP)

    if (titleEl) {
      titleEl.style.opacity = String(titleTargetP)
      titleEl.style.transform = `translate(-50%, -50%) scale(${titleScale})`
    }

    const cardScroll = scrolled - vh

    for (let i = 0; i < count; i += 1) {
      const card = options.getCardEl(i)
      const inner = options.getInnerEl(i)
      const state = cardMotion[i]
      if (!card || !inner || !state) continue

      let targetY = vh * 0.5
      let targetScale = 1
      let visible = false
      let rate = SMOOTH

      inner.style.opacity = '1'
      card.style.zIndex = String(10 + i)

      if (cardScroll >= 0) {
        const start = i * vh
        const local = (cardScroll - start) / vh

        if (local >= 0) {
          visible = true

          if (local >= 1) {
            targetY = 0
            targetScale = SHRINK_SCALE
          } else if (local < ENTER_PORTION) {
            const enterT = easeInOut(local / ENTER_PORTION)
            targetY = lerp(vh * ENTER_TRAVEL, 0, enterT)
            targetScale = 1
          } else {
            const shrinkT = easeInOut((local - ENTER_PORTION) / (1 - ENTER_PORTION))
            targetY = 0
            targetScale = i < count - 1 ? lerp(1, SHRINK_SCALE, shrinkT) : 1
          }
        }
      }

      if (!visible) {
        card.style.visibility = 'hidden'
        card.style.pointerEvents = 'none'
        targetY = vh * 0.55
        targetScale = 1
        rate = SMOOTH_FAST
      } else {
        card.style.visibility = 'visible'
        card.style.pointerEvents = 'auto'
      }

      state.y = damp(state.y, targetY, rate)
      state.scale = damp(state.scale, targetScale, rate)
      applyCardTransform(inner, state.y, state.scale)
    }

    rafId = requestAnimationFrame(tick)
  }

  function start() {
    if (running) return
    running = true
    layoutRunway()
    rafId = requestAnimationFrame(tick)
  }

  function stop() {
    running = false
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = 0
    }
    resetTitle(options.getTitleEl())
  }

  function refresh() {
    cardMotion.length = 0
    layoutRunway()
  }

  return { start, stop, refresh, layoutRunway }
}
