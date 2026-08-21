import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * One-shot enter wake for section cards/columns — does not touch pin scrub tweens.
 * @param {HTMLElement|null} triggerEl
 * @param {{ targets: Element[], mode?: string, stagger?: number, y?: number, duration?: number }} options
 * @returns {() => void}
 */
export function bindSectionEnterWake(
  triggerEl,
  { targets = [], mode = 'mobileLite', stagger = 0.08, y = 28, duration = 0.55 } = {}
) {
  if (!triggerEl || mode !== 'desktopFull' || !targets.length) return () => {}

  gsap.registerPlugin(ScrollTrigger)

  const nodes = targets.filter(Boolean)
  if (!nodes.length) return () => {}

  gsap.set(nodes, { opacity: 0, y })

  let played = false
  const play = () => {
    if (played) return
    played = true
    gsap.to(nodes, {
      opacity: 1,
      y: 0,
      duration,
      stagger,
      ease: 'expo.out',
      overwrite: 'auto'
    })
  }

  const st = ScrollTrigger.create({
    trigger: triggerEl,
    start: 'top 90%',
    once: true,
    onEnter: play,
    onEnterBack: play
  })

  // If already in/past the trigger zone (common after remount), play immediately.
  requestAnimationFrame(() => {
    if (played) return
    const rect = triggerEl.getBoundingClientRect()
    if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) play()
  })

  return () => {
    st.kill()
    gsap.killTweensOf(nodes)
    gsap.set(nodes, { clearProps: 'opacity,transform' })
  }
}

/**
 * Soft fade on section chrome when leaving — does not alter scroll/scrub progress.
 * @param {HTMLElement|null} triggerEl
 * @param {{ chrome?: Element|null, mode?: string }} options
 * @returns {() => void}
 */
export function bindSectionLeaveChrome(triggerEl, { chrome, mode = 'mobileLite' } = {}) {
  if (!triggerEl || !chrome || mode !== 'desktopFull') return () => {}

  gsap.registerPlugin(ScrollTrigger)

  const st = ScrollTrigger.create({
    trigger: triggerEl,
    start: 'bottom top',
    onLeave: () => {
      gsap.to(chrome, { opacity: 0.55, duration: 0.35, ease: 'power2.out', overwrite: 'auto' })
    },
    onEnterBack: () => {
      gsap.to(chrome, { opacity: 1, duration: 0.35, ease: 'power2.out', overwrite: 'auto' })
    }
  })

  return () => {
    st.kill()
    gsap.killTweensOf(chrome)
    gsap.set(chrome, { clearProps: 'opacity' })
  }
}
