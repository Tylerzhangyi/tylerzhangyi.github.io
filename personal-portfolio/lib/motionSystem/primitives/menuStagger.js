import gsapDefault from 'gsap'

/** Close tween budget — must stay ≤ SiteHeader MENU_ANIM_MS (220). */
export const MENU_STAGGER_CLOSE_MS = 180

/** Stagger gap between menu link entrances (seconds). */
export const MENU_STAGGER_GAP = 0.05

/**
 * Open: cascade links from y:24 / opacity:0 with expo.out stagger.
 * @param {Iterable<HTMLElement>|HTMLElement[]} links
 * @param {{ gsap?: typeof gsapDefault, onComplete?: () => void }} [options]
 * @returns {() => void} cleanup (kills tweens)
 */
export function staggerMenuOpen(links, { gsap = gsapDefault, onComplete } = {}) {
  const targets = Array.from(links || []).filter(Boolean)
  if (!targets.length) {
    onComplete?.()
    return () => {}
  }

  const tween = gsap.fromTo(
    targets,
    { y: 24, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 0.45,
      stagger: MENU_STAGGER_GAP,
      ease: 'expo.out',
      overwrite: 'auto',
      onComplete
    }
  )

  return () => {
    if (tween?.kill) tween.kill()
    gsap.killTweensOf?.(targets)
  }
}

/**
 * Close: quick opacity / y out within ≤220ms.
 * @param {Iterable<HTMLElement>|HTMLElement[]} links
 * @param {{ gsap?: typeof gsapDefault }} [options]
 * @returns {() => void} cleanup (kills tweens)
 */
export function staggerMenuClose(links, { gsap = gsapDefault } = {}) {
  const targets = Array.from(links || []).filter(Boolean)
  if (!targets.length) return () => {}

  const tween = gsap.to(targets, {
    y: 12,
    opacity: 0,
    duration: MENU_STAGGER_CLOSE_MS / 1000,
    ease: 'power2.in',
    overwrite: 'auto'
  })

  return () => {
    if (tween?.kill) tween.kill()
    gsap.killTweensOf?.(targets)
  }
}

/**
 * Kill active menu link tweens and clear GSAP inline opacity/transform
 * so CSS fallback styles apply cleanly after leaving desktopFull.
 * @param {Iterable<HTMLElement>|HTMLElement[]} links
 * @param {{ gsap?: typeof gsapDefault }} [options]
 */
export function killMenuStagger(links, { gsap = gsapDefault } = {}) {
  const targets = Array.from(links || []).filter(Boolean)
  if (!targets.length) return

  gsap.killTweensOf?.(targets)
  gsap.set?.(targets, { clearProps: 'opacity,transform' })
}
