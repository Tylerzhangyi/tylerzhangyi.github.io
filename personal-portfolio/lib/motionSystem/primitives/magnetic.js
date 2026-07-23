/**
 * Clamp a 2D pull vector to maxPull length.
 * @param {number} dx
 * @param {number} dy
 * @param {number} maxPull
 * @returns {{ x: number, y: number }}
 */
export function clampPull(dx, dy, maxPull) {
  const len = Math.hypot(dx, dy)
  if (len === 0 || len <= maxPull) return { x: dx, y: dy }
  const scale = maxPull / len
  return { x: dx * scale, y: dy * scale }
}

/**
 * Bind magnetic pull toward pointer within element bounds.
 * Caller should only enable for desktopFull mode.
 * @param {HTMLElement} el
 * @param {{ maxPull?: number }} [options]
 * @returns {() => void} cleanup
 */
export function bindMagnetic(el, { maxPull = 18 } = {}) {
  if (!el || typeof el.addEventListener !== 'function') return () => {}

  const pull = Math.min(maxPull, 18)

  const onMove = (event) => {
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const { x, y } = clampPull(event.clientX - cx, event.clientY - cy, pull)
    el.style.transform = `translate3d(${x}px, ${y}px, 0)`
  }

  const onLeave = () => {
    el.style.transform = 'translate3d(0px, 0px, 0)'
  }

  el.addEventListener('pointermove', onMove)
  el.addEventListener('pointerleave', onLeave)

  return () => {
    el.removeEventListener('pointermove', onMove)
    el.removeEventListener('pointerleave', onLeave)
    el.style.transform = ''
  }
}
