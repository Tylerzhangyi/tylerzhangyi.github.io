import gsapDefault from 'gsap'
import { ScrollTrigger as ScrollTriggerDefault } from 'gsap/ScrollTrigger'
import { elementHasMotionFlag, parseMotionFlags } from '../registerSection.js'

export const MOUNT_CASCADE_DURATION = 0.28
export const MOUNT_CASCADE_MAX_TOTAL_MS = 400

const HEADING_SELECTOR = 'h1, h2, h3'

/** @param {string} text */
export function tokenizeWords(text) {
  if (!text || typeof text !== 'string') return []
  return text.trim().split(/\s+/).filter(Boolean)
}

/** @param {string} text */
export function tokenizeChars(text) {
  if (!text || typeof text !== 'string') return []
  return Array.from(text)
}

/**
 * @param {ParentNode} root
 * @returns {HTMLElement[]}
 */
export function findSplitTargets(root) {
  if (!root?.querySelectorAll) return []
  const explicit = root.querySelectorAll('[data-split]')
  if (explicit.length) return Array.from(explicit)
  return Array.from(root.querySelectorAll(HEADING_SELECTOR))
}

/**
 * @param {HTMLElement} el
 * @param {{ type?: 'chars'|'words' }} [options]
 */
export function splitTextElement(el, { type = 'words' } = {}) {
  const noop = { chars: [], words: [], revert: () => {} }
  if (!el) return noop

  const originalHTML = el.innerHTML
  const text = el.textContent || ''
  const tokens = type === 'chars' ? tokenizeChars(text) : tokenizeWords(text)
  if (!tokens.length) return noop

  el.innerHTML = ''
  el.setAttribute('aria-label', text.trim())

  const nodes = tokens.map((token, index) => {
    const span = document.createElement('span')
    span.className = type === 'chars' ? 'motion-split-char' : 'motion-split-word'
    span.setAttribute('aria-hidden', 'true')
    span.textContent =
      type === 'chars' ? token : token + (index < tokens.length - 1 ? '\u00a0' : '')
    span.style.display = 'inline-block'
    el.appendChild(span)
    return span
  })

  const revert = () => {
    el.innerHTML = originalHTML
    el.removeAttribute('aria-label')
  }

  return type === 'chars' ? { chars: nodes, words: [], revert } : { words: nodes, chars: [], revert }
}

/**
 * @param {HTMLElement} el
 * @param {{ mode?: string, trigger?: Element, gsap?: typeof gsapDefault, ScrollTrigger?: typeof ScrollTriggerDefault }} [options]
 * @returns {() => void}
 */
export function bindSplitReveal(
  el,
  { mode = 'mobileLite', trigger, gsap = gsapDefault, ScrollTrigger = ScrollTriggerDefault } = {}
) {
  if (!el || mode === 'reduced') return () => {}

  const splitType = el.getAttribute('data-split') === 'chars' ? 'chars' : 'words'
  const { chars, words, revert } = splitTextElement(el, { type: splitType })
  const targets = chars.length ? chars : words
  if (!targets.length) {
    revert()
    return () => {}
  }

  gsap.registerPlugin(ScrollTrigger)
  let ctx = null

  ctx = gsap.context(() => {
    gsap.set(targets, { y: '110%', opacity: 0, rotateX: -28, transformOrigin: '50% 100%' })

    if (mode === 'desktopFull') {
      gsap.to(targets, {
        y: '0%',
        opacity: 1,
        rotateX: 0,
        stagger: 0.025,
        ease: 'none',
        scrollTrigger: {
          trigger: trigger || el,
          start: 'top 82%',
          end: 'top 38%',
          scrub: true
        }
      })
      return
    }

    gsap.to(targets, {
      y: 0,
      opacity: 1,
      rotateX: 0,
      duration: 0.55,
      stagger: 0.04,
      ease: 'expo.out',
      scrollTrigger: {
        trigger: trigger || el,
        start: 'top 88%',
        once: true
      }
    })
  }, el)

  return () => {
    ctx?.revert()
    revert()
  }
}

/**
 * Resolve stagger index for cascade children from options or CSS variable.
 * @param {HTMLElement} el
 * @param {{ index?: number }} [options]
 * @returns {number}
 */
export function resolveCascadeIndex(el, { index } = {}) {
  if (Number.isFinite(index)) return index
  const fromStyle = el?.style?.getPropertyValue?.('--motion-cascade-i')?.trim()
  const parsed = Number.parseInt(fromStyle ?? '', 10)
  return Number.isFinite(parsed) ? parsed : 0
}

/**
 * Staggered one-shot / scrub cascade for `[data-motion-cascade]` children.
 * @param {HTMLElement} el
 * @param {{ mode?: string, trigger?: Element, index?: number, gsap?: typeof gsapDefault, ScrollTrigger?: typeof ScrollTriggerDefault }} [options]
 */
export function bindCascadeReveal(
  el,
  {
    mode = 'mobileLite',
    trigger,
    index: indexOption,
    gsap = gsapDefault,
    ScrollTrigger = ScrollTriggerDefault
  } = {}
) {
  if (!el || mode === 'reduced') return () => {}

  const index = resolveCascadeIndex(el, { index: indexOption })

  gsap.registerPlugin(ScrollTrigger)
  const ctx = gsap.context(() => {
    gsap.set(el, { y: 28, opacity: 0 })

    if (mode === 'desktopFull') {
      gsap.to(el, {
        y: 0,
        opacity: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: trigger || el,
          start: `top ${Math.max(70, 88 - index * 3)}%`,
          end: `top ${Math.max(40, 55 - index * 2)}%`,
          scrub: true
        }
      })
      return
    }

    gsap.to(el, {
      y: 0,
      opacity: 1,
      duration: 0.5,
      delay: index * 0.06,
      ease: 'expo.out',
      scrollTrigger: {
        trigger: trigger || el,
        start: 'top 90%',
        once: true
      }
    })
  }, el)

  return () => ctx.revert()
}

/**
 * Delay for mount cascade children; total timeline stays within {@link MOUNT_CASCADE_MAX_TOTAL_MS}.
 * @param {number} index
 * @param {number} [duration]
 * @returns {number}
 */
export function computeMountCascadeDelay(index, duration = MOUNT_CASCADE_DURATION) {
  const idx = Number.isFinite(index) ? Math.max(0, index) : 0
  const maxDelaySec = (MOUNT_CASCADE_MAX_TOTAL_MS - duration * 1000) / 1000
  return Math.min(idx * 0.025, Math.max(0, maxDelaySec))
}

/**
 * Short split entrance on mount (detail pages).
 * @param {HTMLElement} el
 * @param {{ mode?: string, gsap?: typeof gsapDefault }} [options]
 * @returns {() => void}
 */
export function bindMountSplitReveal(el, { mode = 'mobileLite', gsap = gsapDefault } = {}) {
  if (!el || mode === 'reduced') return () => {}

  const splitType = el.getAttribute('data-split') === 'chars' ? 'chars' : 'words'
  const { chars, words, revert } = splitTextElement(el, { type: splitType })
  const targets = chars.length ? chars : words
  if (!targets.length) {
    revert()
    return () => {}
  }

  const ctx = gsap.context(() => {
    gsap.set(targets, { y: '110%', opacity: 0, rotateX: -28, transformOrigin: '50% 100%' })
    gsap.to(targets, {
      y: 0,
      opacity: 1,
      rotateX: 0,
      duration: mode === 'desktopFull' ? 0.55 : 0.45,
      stagger: mode === 'desktopFull' ? 0.025 : 0.035,
      ease: 'expo.out',
      delay: 0.04
    })
  }, el)

  return () => {
    ctx?.revert()
    revert()
  }
}

/**
 * Short one-shot cascade on mount (detail paragraphs).
 * @param {HTMLElement} el
 * @param {{ mode?: string, index?: number, gsap?: typeof gsapDefault }} [options]
 * @returns {() => void}
 */
export function bindMountCascadeReveal(
  el,
  { mode = 'mobileLite', index: indexOption, gsap = gsapDefault } = {}
) {
  if (!el || mode === 'reduced') return () => {}

  const index = resolveCascadeIndex(el, { index: indexOption })
  const delay = computeMountCascadeDelay(index)

  const ctx = gsap.context(() => {
    gsap.set(el, { y: 20, opacity: 0 })
    gsap.to(el, {
      y: 0,
      opacity: 1,
      duration: MOUNT_CASCADE_DURATION,
      delay,
      ease: 'expo.out'
    })
  }, el)

  return () => ctx.revert()
}

/**
 * Bind mount split + optional paragraph cascade for detail page content roots.
 * @param {HTMLElement|null} rootEl
 * @param {'desktopFull'|'mobileLite'|'reduced'} mode
 * @returns {() => void}
 */
export function bindDetailPageMotion(rootEl, mode) {
  if (!rootEl || typeof window === 'undefined' || mode === 'reduced') return () => {}

  /** @type {Array<() => void>} */
  const cleanups = []

  findSplitTargets(rootEl).forEach((target) => {
    cleanups.push(bindMountSplitReveal(target, { mode }))
  })

  rootEl.querySelectorAll('[data-motion]').forEach((sectionEl) => {
    const flags = parseMotionFlags(sectionEl.getAttribute('data-motion'))
    if (!flags.has('split')) return

    let cascadeTargets = Array.from(sectionEl.querySelectorAll('[data-motion-cascade]'))
    if (!cascadeTargets.length) {
      cascadeTargets = Array.from(sectionEl.querySelectorAll('p'))
    }

    cascadeTargets.forEach((child, index) => {
      cleanups.push(bindMountCascadeReveal(child, { mode, index }))
    })
  })

  return () => cleanups.forEach((fn) => fn())
}

/**
 * Skip legacy observeReveals for nodes owned by split/parallax storytelling.
 * @param {Element|null|undefined} el
 */
export function shouldSkipLegacyReveal(el) {
  if (!el) return false
  if (elementHasMotionFlag(el, 'split') || elementHasMotionFlag(el, 'parallax')) return true

  const owner = el.closest?.('[data-motion]')
  if (!owner) return false

  const ownerSplit = elementHasMotionFlag(owner, 'split')
  const ownerParallax = elementHasMotionFlag(owner, 'parallax')
  if (!ownerSplit && !ownerParallax) return false

  if (
    el === owner &&
    (el.classList?.contains('reveal-on-scroll') || el.classList?.contains('reveal-fade-only'))
  ) {
    return true
  }

  if (ownerSplit && el.matches?.('[data-split], h1, h2, h3, [data-motion-cascade]')) return true
  if (ownerParallax && el.matches?.('[data-parallax]')) return true

  return false
}
