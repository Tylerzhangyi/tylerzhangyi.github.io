/** 滚动更新合并到 requestAnimationFrame，避免一帧内多次 layout */

export function bindScrollRaf(fn) {
  let ticking = false
  let rafId = 0

  const run = () => {
    ticking = false
    rafId = 0
    fn()
  }

  const onScroll = () => {
    if (ticking) return
    ticking = true
    rafId = requestAnimationFrame(run)
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })

  return () => {
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onScroll)
    if (rafId) cancelAnimationFrame(rafId)
  }
}
