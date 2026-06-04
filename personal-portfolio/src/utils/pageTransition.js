import { reactive } from 'vue'
import { computeRevealScale } from './revealScale'

export const pageTransition = reactive({
  phase: 'idle',
  originX: typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
  originY: typeof window !== 'undefined' ? window.innerHeight / 2 : 0,
  revealScale: 120
})

export const lastPointer = reactive({
  x: pageTransition.originX,
  y: pageTransition.originY
})

export const EXPAND_MS = 520
export const HOLD_MS = 800
export const CONTRACT_MS = 520

export function setTransitionOrigin(x, y) {
  pageTransition.originX = x
  pageTransition.originY = y
  pageTransition.revealScale = computeRevealScale(x, y)
  lastPointer.x = x
  lastPointer.y = y
}

export function setTransitionOriginFromElement(el) {
  if (!el) return
  const rect = el.getBoundingClientRect()
  setTransitionOrigin(rect.left + rect.width / 2, rect.top + rect.height / 2)
}

/** 先挂载 overlay（圆 scale 0），下一帧再触发 CSS transition */
function runExpandPhase(onExpanded) {
  pageTransition.phase = 'primed'

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      pageTransition.phase = 'expanding'
      if (onExpanded) {
        window.setTimeout(onExpanded, EXPAND_MS)
      }
    })
  })
}

export function playPageExit() {
  return new Promise((resolve) => {
    runExpandPhase(() => {
      pageTransition.phase = 'holding'
      window.setTimeout(resolve, HOLD_MS)
    })
  })
}

export function playPageEnter() {
  if (pageTransition.phase === 'idle') return Promise.resolve()

  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      pageTransition.phase = 'contracting'
      window.setTimeout(() => {
        pageTransition.phase = 'idle'
        resolve()
      }, CONTRACT_MS)
    })
  })
}

export function scrollDetailToTop() {
  if (typeof window === 'undefined') return
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
}

export function pageTransitionClasses() {
  const p = pageTransition.phase
  return {
    'page-transition': true,
    'is-primed': p === 'primed',
    'is-expanding': p === 'expanding',
    'is-holding': p === 'holding',
    'is-contracting': p === 'contracting'
  }
}
