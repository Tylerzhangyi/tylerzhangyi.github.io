import { parseMotionFlags } from './registerSection.js'
import {
  bindCascadeReveal,
  bindSplitReveal,
  findSplitTargets
} from './primitives/splitReveal.js'
import { bindScrubParallax } from './primitives/scrubParallax.js'

/**
 * Bind split / parallax storytelling for a flagged section root.
 * @param {HTMLElement|null} sectionEl
 * @param {'desktopFull'|'mobileLite'|'reduced'} mode
 * @returns {() => void}
 */
export function bindSectionMotion(sectionEl, mode) {
  if (!sectionEl || typeof window === 'undefined') return () => {}

  const flags = parseMotionFlags(sectionEl.getAttribute('data-motion'))
  if (!flags.size || mode === 'reduced') return () => {}

  /** @type {Array<() => void>} */
  const cleanups = []

  if (flags.has('split')) {
    findSplitTargets(sectionEl).forEach((target) => {
      cleanups.push(bindSplitReveal(target, { mode, trigger: sectionEl }))
    })

    sectionEl.querySelectorAll('[data-motion-cascade]').forEach((child, index) => {
      child.style.setProperty('--motion-cascade-i', String(index))
      cleanups.push(bindCascadeReveal(child, { mode, trigger: sectionEl }))
    })
  }

  if (flags.has('parallax')) {
    sectionEl.querySelectorAll('[data-parallax]').forEach((el) => {
      const yFrom = Number.parseFloat(el.getAttribute('data-parallax-from') ?? '28')
      const yTo = Number.parseFloat(el.getAttribute('data-parallax-to') ?? '-28')
      cleanups.push(
        bindScrubParallax(el, {
          yFrom: Number.isFinite(yFrom) ? yFrom : 28,
          yTo: Number.isFinite(yTo) ? yTo : -28,
          trigger: sectionEl,
          mode
        })
      )
    })
  }

  return () => cleanups.forEach((fn) => fn())
}
