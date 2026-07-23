import gsapDefault from 'gsap'
import { ScrollTrigger as ScrollTriggerDefault } from 'gsap/ScrollTrigger'

/**
 * Bind scroll-scrubbed vertical parallax (desktopFull) or one-shot enter (mobileLite).
 * @param {HTMLElement} el
 * @param {{ yFrom?: number, yTo?: number, trigger?: Element, mode?: string, gsap?: typeof gsapDefault, ScrollTrigger?: typeof ScrollTriggerDefault }} [options]
 * @returns {() => void}
 */
export function bindScrubParallax(
  el,
  {
    yFrom = 32,
    yTo = -32,
    trigger,
    mode = 'mobileLite',
    gsap = gsapDefault,
    ScrollTrigger = ScrollTriggerDefault
  } = {}
) {
  if (!el || mode === 'reduced') return () => {}

  gsap.registerPlugin(ScrollTrigger)
  const ctx = gsap.context(() => {
    if (mode === 'desktopFull') {
      gsap.fromTo(
        el,
        { y: yFrom },
        {
          y: yTo,
          ease: 'none',
          scrollTrigger: {
            trigger: trigger || el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        }
      )
      return
    }

    gsap.fromTo(
      el,
      { y: yFrom * 0.45, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: trigger || el,
          start: 'top 88%',
          once: true
        }
      }
    )
  }, el)

  return () => ctx.revert()
}
