import { shouldSkipLegacyReveal } from '@/lib/motionSystem/primitives/splitReveal'

/** 滚动进入视口时触发 .reveal-on-scroll → .is-revealed */
export function observeReveals(rootEl, selector = '.reveal-on-scroll, .reveal-fade-only') {
  if (typeof window === 'undefined') return () => {}
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const scope = rootEl || document
  const nodes = Array.from(scope.querySelectorAll(selector)).filter(
    (el) => !shouldSkipLegacyReveal(el)
  )
  if (!nodes.length) return () => {}

  if (prefersReduced) {
    nodes.forEach((el) => el.classList.add('is-revealed'))
    return () => {}
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-revealed')
        observer.unobserve(entry.target)
      })
    },
    { threshold: 0.08, rootMargin: '0px 0px -6% 0px' }
  )

  nodes.forEach((el) => observer.observe(el))
  return () => observer.disconnect()
}
