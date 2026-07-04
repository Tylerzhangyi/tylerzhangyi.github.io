import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { refreshScrollLayoutNow } from '@/lib/scrollLayout'

const HEADER_OFFSET = 72

/** menu id → DOM id（与 hash 一致） */
const SECTION_ELEMENT_IDS = {
  home: 'section-home',
  about: 'section-about-showcase',
  education: 'section-education',
  'projects-intro': 'section-projects-intro',
  projects: 'section-projects',
  blog: 'section-blog',
  links: 'section-links',
  contact: 'section-contact'
}

/** 优先使用 ScrollTrigger 起点的区块 */
const SECTION_TRIGGERS = {
  projects: 'projects-horizontal-st'
}

const LAYOUT_SECTIONS = new Set([
  'about',
  'education',
  'projects-intro',
  'projects',
  'blog',
  'links',
  'contact'
])

let scrollTriggerReady = false

function ensureScrollTrigger() {
  if (!scrollTriggerReady) {
    gsap.registerPlugin(ScrollTrigger)
    scrollTriggerReady = true
  }
}

function elementScrollTop(el, offset = HEADER_OFFSET) {
  const rect = el.getBoundingClientRect()
  return Math.max(0, Math.round(rect.top + window.scrollY - offset))
}

function resolveElement(id) {
  const domId = SECTION_ELEMENT_IDS[id]
  if (!domId) return null
  return document.getElementById(domId)
}

function getBlogScrollTop() {
  const section = resolveElement('blog')
  if (!section) return 0

  const pin = section.querySelector('[data-nav-anchor="blog-pin"]')
  if (pin) return elementScrollTop(pin)

  return Math.max(0, Math.round(section.offsetTop + window.innerHeight - HEADER_OFFSET))
}

function getLinksScrollTop() {
  const section = resolveElement('links')
  if (!section) return 0

  const canvas = section.querySelector('[data-nav-anchor="links-canvas"]')
  if (canvas) return elementScrollTop(canvas)

  return elementScrollTop(section)
}

export function sectionHash(id) {
  if (id === 'home') return '/'
  const domId = SECTION_ELEMENT_IDS[id]
  return domId ? `/#${domId}` : `/#section-${id}`
}

export function menuIdFromHash(hash) {
  if (typeof hash !== 'string' || !hash.startsWith('#')) return null
  const domId = hash.slice(1)
  if (!domId) return null
  for (const [menuId, elementId] of Object.entries(SECTION_ELEMENT_IDS)) {
    if (elementId === domId) return menuId
  }
  if (domId.startsWith('section-')) return domId.replace('section-', '')
  return null
}

export function sectionIdFromHref(href) {
  if (!href || typeof href !== 'string') return null
  const hashIndex = href.indexOf('#')
  if (hashIndex < 0) return null
  return menuIdFromHash(href.slice(hashIndex))
}

export function detailReturnHref(kind) {
  if (kind === 'blog' || kind === 'projects') return sectionHash(kind)
  return '/'
}

export function getSectionScrollTop(id, { refresh = false } = {}) {
  if (typeof window === 'undefined') return 0

  if (id === 'home') return 0

  if (id === 'contact') {
    if (!resolveElement('contact')) return 0
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

  if (id === 'blog') return getBlogScrollTop()
  if (id === 'links') return getLinksScrollTop()

  const target = resolveElement(id)
  if (!target) return 0

  return elementScrollTop(target)
}

export function scrollToSection(id, behavior = 'smooth') {
  if (typeof window === 'undefined') return false

  const apply = (refresh) => {
    if (id !== 'contact' && id !== 'home' && !resolveElement(id)) {
      return false
    }

    const top = getSectionScrollTop(id, { refresh })
    window.scrollTo({ top, left: 0, behavior })
    return true
  }

  const maxAttempts = LAYOUT_SECTIONS.has(id) ? 16 : 4
  let attempts = 0

  const tryScroll = () => {
    const refresh = attempts % 3 === 0
    if (apply(refresh)) return
    attempts += 1
    if (attempts < maxAttempts) {
      window.setTimeout(tryScroll, attempts < 6 ? 120 : 200)
    }
  }

  if (apply(true)) return true

  requestAnimationFrame(() => {
    requestAnimationFrame(() => tryScroll())
  })

  return false
}
