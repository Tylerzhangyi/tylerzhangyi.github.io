import gsapDefault from 'gsap'
import { ScrollTrigger as ScrollTriggerDefault } from 'gsap/ScrollTrigger'
import { elementHasMotionFlag } from '../registerSection.js'

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
