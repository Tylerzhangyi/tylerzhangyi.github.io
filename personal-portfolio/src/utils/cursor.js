/** Custom cursor – mix-blend-mode difference, 单圆点（无外环） */

const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

let teardown = null

export function initCursor() {
  if (isTouch || prefersReducedMotion || teardown) return teardown

  document.documentElement.classList.add('has-custom-cursor')

  const dot = document.createElement('div')
  dot.className = 'cursor-dot'
  dot.setAttribute('aria-hidden', 'true')
  document.body.append(dot)

  let mx = -100
  let my = -100
  let rx = -100
  let ry = -100
  let scale = 1
  let targetScale = 1
  let rafId = 0

  const onMove = (e) => {
    mx = e.clientX
    my = e.clientY
  }

  const onOver = (e) => {
    const t = e.target
    if (!(t instanceof Element)) return
    if (t.closest('[data-cursor="view"], [data-cursor="read"]')) {
      targetScale = 2.4
    } else if (t.closest('a, button, .project-card, .blog-card')) {
      targetScale = 1.85
    } else if (t.closest('input, textarea, select, [contenteditable]')) {
      targetScale = 0.55
    } else {
      targetScale = 1
    }
  }

  const onDown = () => {
    targetScale *= 0.82
  }

  const onUp = () => {
    const el = document.elementFromPoint(mx, my)
    if (el instanceof Element) onOver({ target: el })
    else targetScale = 1
  }

  const tick = () => {
    rx = mx
    ry = my
    scale = targetScale
    dot.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%) scale(${scale})`
    rafId = requestAnimationFrame(tick)
  }

  document.addEventListener('mousemove', onMove, { passive: true })
  document.addEventListener('mouseover', onOver)
  document.addEventListener('mousedown', onDown)
  document.addEventListener('mouseup', onUp)
  rafId = requestAnimationFrame(tick)

  teardown = () => {
    cancelAnimationFrame(rafId)
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseover', onOver)
    document.removeEventListener('mousedown', onDown)
    document.removeEventListener('mouseup', onUp)
    document.documentElement.classList.remove('has-custom-cursor')
    dot.remove()
    teardown = null
  }

  return teardown
}

export function destroyCursor() {
  teardown?.()
}
