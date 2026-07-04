/** Blog — deck stack: 01 on top, hold in place, then peel top card away */

const PIN_ALIGN_VH = 1.0
const SETTLE_VH = 0.9
const HOLD_VH = 0.45
const PEEL_VH = 0.8
const SMOOTH = 0.22

const clamp = (v, min, max) => Math.min(max, Math.max(min, v))
const easeInOut = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

function damp(current, target, rate = SMOOTH) {
  const d = target - current
  if (Math.abs(d) < 0.001) return target
  return current + d * rate
}

function clearIndividualTransform(el) {
  el.style.translate = ''
  el.style.scale = ''
  el.style.rotate = ''
}

function applyTransform(inner, { y, rotate, scale, opacity }) {
  clearIndividualTransform(inner)
  inner.style.opacity = String(opacity)
  inner.style.transform = `translate3d(0, ${y}px, 0) rotate(${rotate}deg) scale(${scale})`
}

function stackPose(depth) {
  return {
    y: depth * 16,
    rotate: depth * -1.4,
    scale: 1 - depth * 0.032,
    opacity: 1
  }
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
  const motion = []
  let rafId = 0
  let running = false
  let scrollBound = false

  function segmentVh() {
    return HOLD_VH + PEEL_VH
  }

  function layoutRunway() {
    const runway = options.getRunway()
    const count = options.getCount()
    if (runway && count > 0) {
      const total = PIN_ALIGN_VH + SETTLE_VH + count * segmentVh()
      runway.style.height = `${total * 100}vh`
    }
  }

  function initMotion(count) {
    if (motion.length === count) return
    motion.length = 0
    for (let i = 0; i < count; i += 1) {
      const pose = stackPose(i)
      motion.push({
        y: pose.y,
        rotate: pose.rotate,
        scale: pose.scale,
        opacity: 1
      })
    }
  }

  function resetTitle(titleEl) {
    if (!titleEl) return
    titleEl.style.opacity = '0'
    titleEl.style.transform = 'translateY(18px)'
  }

  function scheduleTick() {
    if (!running || rafId) return
    rafId = requestAnimationFrame(tick)
  }

  function onScrollWake() {
    if (!running) return
    scheduleTick()
  }

  function bindScrollWake() {
    if (scrollBound) return
    scrollBound = true
    window.addEventListener('scroll', onScrollWake, { passive: true })
    window.addEventListener('resize', onScrollWake, { passive: true })
  }

  function unbindScrollWake() {
    if (!scrollBound) return
    scrollBound = false
    window.removeEventListener('scroll', onScrollWake)
    window.removeEventListener('resize', onScrollWake)
  }

  function tick() {
    rafId = 0
    if (!running) return

    const section = options.getSection()
    const titleEl = options.getTitleEl()
    const count = options.getCount()

    if (!section || count < 1) {
      options.onActiveChange?.(false)
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
      return
    }

    initMotion(count)
    const scrolled = clamp(-rect.top, 0, section.offsetHeight - vh)

    if (reduced || isMobile) {
      if (titleEl) {
        titleEl.style.opacity = '1'
        titleEl.style.transform = 'none'
      }
      for (let i = 0; i < count; i += 1) {
        const inner = options.getInnerEl(i)
        const card = options.getCardEl(i)
        if (!inner || !card) continue
        applyTransform(inner, { y: 0, rotate: 0, scale: 1, opacity: 1 })
        card.style.visibility = 'visible'
        card.style.pointerEvents = 'auto'
        card.style.zIndex = String(100 - i)
      }
      scheduleTick()
      return
    }

    const settleStart = vh * PIN_ALIGN_VH
    const peelStart = vh * (PIN_ALIGN_VH + SETTLE_VH)
    const stackScroll = scrolled - peelStart

    if (titleEl) {
      titleEl.style.opacity = nearBlog ? '1' : '0'
      titleEl.style.transform = nearBlog ? 'none' : 'translateY(18px)'
    }

    let topIndex = 0
    let peelT = 0

    if (stackScroll > 0) {
      const segLen = vh * segmentVh()
      topIndex = Math.min(count - 1, Math.floor(stackScroll / segLen))
      const segLocalVh = (stackScroll - topIndex * segLen) / vh

      if (segLocalVh < HOLD_VH) {
        peelT = 0
      } else {
        peelT = easeInOut(clamp((segLocalVh - HOLD_VH) / PEEL_VH, 0, 1))
      }
    }

    const stackVisible = nearBlog
    const inSettle = scrolled < peelStart

    for (let i = 0; i < count; i += 1) {
      const card = options.getCardEl(i)
      const inner = options.getInnerEl(i)
      const state = motion[i]
      if (!card || !inner || !state) continue

      let target = { y: 0, rotate: 0, scale: 1, opacity: 1 }
      let zIndex = 10 + i

      if (!stackVisible) {
        target = { y: 48, rotate: 0, scale: 0.94, opacity: 0 }
      } else if (inSettle) {
        const pose = stackPose(i)
        target = {
          y: pose.y,
          rotate: pose.rotate,
          scale: pose.scale,
          opacity: 1
        }
        zIndex = 100 - i
      } else if (i < topIndex) {
        target = { y: -vh * 0.82, rotate: -8, scale: 0.94, opacity: 0 }
        zIndex = 5 + i
      } else if (i === topIndex) {
        if (peelT <= 0) {
          target = { y: 0, rotate: 0, scale: 1, opacity: 1 }
        } else {
          target = {
            y: -peelT * vh * 0.68,
            rotate: -peelT * 7,
            scale: 1 - peelT * 0.035,
            opacity: 1 - peelT * 0.96
          }
        }
        zIndex = 100
      } else {
        const depth = i - topIndex
        target = stackPose(depth)
        zIndex = 100 - depth
      }

      const visible = target.opacity > 0.03
      card.style.visibility = visible ? 'visible' : 'hidden'
      card.style.pointerEvents =
        visible && !inSettle && i === topIndex && peelT < 0.85 ? 'auto' : 'none'
      card.style.zIndex = String(zIndex)

      state.y = damp(state.y, target.y)
      state.rotate = damp(state.rotate, target.rotate)
      state.scale = damp(state.scale, target.scale)
      state.opacity = damp(state.opacity, target.opacity, 0.26)

      applyTransform(inner, state)
    }

    scheduleTick()
  }

  function start() {
    if (running) return
    running = true
    layoutRunway()
    bindScrollWake()
    scheduleTick()
  }

  function stop() {
    running = false
    unbindScrollWake()
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = 0
    }
    resetTitle(options.getTitleEl())
  }

  function refresh() {
    motion.length = 0
    layoutRunway()
  }

  return { start, stop, refresh, layoutRunway }
}
