import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

let registered = false
let layoutReady = false
let refreshTimer = 0
const readyListeners = new Set()

export function ensureScrollTrigger() {
  if (!registered) {
    gsap.registerPlugin(ScrollTrigger)
    registered = true
  }
  return ScrollTrigger
}

export function scheduleScrollLayoutRefresh() {
  if (typeof window === 'undefined') return
  if (refreshTimer) window.clearTimeout(refreshTimer)
  refreshTimer = window.setTimeout(() => {
    refreshTimer = 0
    ensureScrollTrigger()
    ScrollTrigger.refresh()
  }, 120)
}

export function refreshScrollLayoutNow() {
  if (typeof window === 'undefined') return
  if (refreshTimer) {
    window.clearTimeout(refreshTimer)
    refreshTimer = 0
  }
  ensureScrollTrigger()
  ScrollTrigger.refresh()
}

export function isScrollLayoutReady() {
  return layoutReady
}

export function onScrollLayoutReady(fn) {
  if (layoutReady) {
    fn()
    return () => {}
  }
  readyListeners.add(fn)
  return () => readyListeners.delete(fn)
}

export function markScrollLayoutReady() {
  if (layoutReady) return

  layoutReady = true
  readyListeners.forEach((fn) => fn())
  readyListeners.clear()

  requestAnimationFrame(() => {
    refreshScrollLayoutNow()
  })
}

/** 首页：资源加载完成后再校准一次 pin 布局 */
export function initHomeScrollLayout() {
  if (typeof window === 'undefined') return () => {}

  const onLoad = () => {
    window.setTimeout(() => scheduleScrollLayoutRefresh(), 200)
  }

  if (document.readyState === 'complete') onLoad()
  else window.addEventListener('load', onLoad, { once: true })

  return () => window.removeEventListener('load', onLoad)
}
