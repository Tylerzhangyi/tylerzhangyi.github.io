import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { refreshScrollLayoutNow } from '@/lib/scrollLayout'

const HEADER_OFFSET = 72

/** 有 ScrollTrigger 的区块：导航到 trigger 起点 */
const SECTION_TRIGGERS = {
  about: 'about-horizontal-st',
  projects: 'projects-horizontal-st'
}

const LAYOUT_SECTIONS = new Set(['education', 'projects-intro', 'projects', 'blog', 'links', 'about'])

let scrollTriggerReady = false

function ensureScrollTrigger() {
  if (!scrollTriggerReady) {
    gsap.registerPlugin(ScrollTrigger)
    scrollTriggerReady = true
  }
}

export function getSectionScrollTop(id, { refresh = false } = {}) {
  if (typeof window === 'undefined') return 0

  if (id === 'home') return 0

  if (id === 'contact') {
    if (!document.getElementById('section-contact')) return 0
    return Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
  }

  if (refresh) {
    ensureScrollTrigger()
    refreshScrollLayoutNow()
  }

  const triggerId = SECTION_TRIGGERS[id]
  if (triggerId) {
    const st = ScrollTrigger.getById(triggerId)
    if (st) return Math.max(0, Math.round(st.start) - HEADER_OFFSET)
  }

  const target = document.getElementById(`section-${id}`)
  if (!target) return 0

  return Math.max(0, Math.round(target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET))
}

export function scrollToSection(id, behavior = 'smooth') {
  if (typeof window === 'undefined') return false

  const apply = (refresh) => {
    if (id !== 'contact' && id !== 'home' && !document.getElementById(`section-${id}`)) {
      return false
    }

    const top = getSectionScrollTop(id, { refresh })
    window.scrollTo({ top, left: 0, behavior })
    return true
  }

  const maxAttempts = LAYOUT_SECTIONS.has(id) ? 12 : 3
  let attempts = 0

  const tryScroll = () => {
    const refresh = attempts === 0
    if (apply(refresh)) return
    attempts += 1
    if (attempts < maxAttempts) {
      window.setTimeout(tryScroll, attempts < 5 ? 100 : 160)
    }
  }

  if (apply(true)) return true

  requestAnimationFrame(() => {
    requestAnimationFrame(() => tryScroll())
  })

  return false
}
