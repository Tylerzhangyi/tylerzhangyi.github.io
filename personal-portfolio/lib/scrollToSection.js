import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { refreshScrollLayoutNow } from '@/lib/scrollLayout'

const HEADER_OFFSET = 72

/** menu id → DOM id（与 hash 一致） */
const SECTION_ELEMENT_IDS = {
  home: 'section-home',
  about: 'section-about',
  education: 'section-education',
  'projects-intro': 'section-projects-intro',
  projects: 'section-projects-intro',
  blog: 'section-blog',
  links: 'section-links',
  contact: 'section-contact'
}

/** 优先使用 ScrollTrigger 起点的区块 */
const SECTION_TRIGGERS = {
  education: 'education-tree-st',
  projects: 'projects-horizontal-st'
}

let scrollTriggerReady = false
let activeTween = null

function ensureScrollTrigger() {
  if (!scrollTriggerReady) {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)
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

  return elementScrollTop(section)
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

  // Menu "projects" should open on My & Project intro, not mid horizontal track.
  if (id === 'projects' || id === 'projects-intro') {
    const intro = resolveElement('projects-intro')
    if (intro) return elementScrollTop(intro)
  }

  const triggerId = SECTION_TRIGGERS[id]
  if (triggerId) {
    ensureScrollTrigger()
    const st = ScrollTrigger.getById(triggerId)
    if (st) return Math.max(0, Math.round(st.start))
  }

  if (id === 'blog') return getBlogScrollTop()
  if (id === 'links') return getLinksScrollTop()

  const target = resolveElement(id)
  if (!target) return 0

  return elementScrollTop(target)
}

/**
 * Smooth-scroll with GSAP ScrollTo (pin-aware). Avoid native behavior:'smooth'
 * — it fights ScrollTrigger and feels stuttery.
 */
export function scrollToSection(id, behavior = 'smooth') {
  if (typeof window === 'undefined') return false

  if (id !== 'contact' && id !== 'home' && !resolveElement(id) && id !== 'projects') {
    return false
  }

  ensureScrollTrigger()
  const top = getSectionScrollTop(id, { refresh: false })
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  activeTween?.kill()
  activeTween = null

  if (behavior === 'auto' || reduce) {
    window.scrollTo({ top, left: 0, behavior: 'auto' })
    return true
  }

  const distance = Math.abs(top - window.scrollY)
  const duration = Math.min(1.05, Math.max(0.42, distance / 2800))

  activeTween = gsap.to(window, {
    duration,
    scrollTo: { y: top, autoKill: true },
    ease: 'power3.inOut',
    overwrite: true,
    onComplete: () => {
      activeTween = null
    }
  })

  return true
}
