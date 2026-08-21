const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

/**
 * @param {{ px: number, py: number, width: number, height: number, maxDeg?: number, maxShift?: number }}
 * @returns {{ rotateX: number, rotateY: number, x: number, y: number }}
 */
export function computeTilt({
  px,
  py,
  width,
  height,
  maxDeg = 10,
  maxShift = 12
}) {
  const safeW = Math.max(width, 1)
  const safeH = Math.max(height, 1)
  const nx = clamp((px - safeW / 2) / (safeW / 2), -1, 1)
  const ny = clamp((py - safeH / 2) / (safeH / 2), -1, 1)

  return {
    rotateY: clamp(nx * maxDeg, -maxDeg, maxDeg),
    rotateX: clamp(-ny * maxDeg, -maxDeg, maxDeg),
    x: clamp(nx * maxShift, -maxShift, maxShift),
    y: clamp(ny * maxShift, -maxShift, maxShift)
  }
}

/**
 * @param {HTMLElement} el
 * @param {{ maxDeg?: number, maxShift?: number, perspective?: number }} [options]
 * @returns {() => void}
 */
export function bindTiltCard(el, { maxDeg = 10, maxShift = 12, perspective = 900 } = {}) {
  if (!el || typeof el.addEventListener !== 'function') return () => {}

  const parent = el.parentElement
  if (parent) parent.style.perspective = `${perspective}px`
  el.style.transformStyle = 'preserve-3d'

  const onMove = (event) => {
    const rect = el.getBoundingClientRect()
    const { rotateX, rotateY, x, y } = computeTilt({
      px: event.clientX - rect.left,
      py: event.clientY - rect.top,
      width: rect.width,
      height: rect.height,
      maxDeg: Math.min(maxDeg, 10),
      maxShift: Math.min(maxShift, 12)
    })
    el.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate3d(${x}px, ${y}px, 0)`
    el.style.willChange = 'transform'
  }

  const onLeave = () => {
    el.style.transform = ''
    el.style.willChange = ''
    el.style.transformStyle = ''
  }

  el.addEventListener('pointermove', onMove)
  el.addEventListener('pointerleave', onLeave)

  return () => {
    el.removeEventListener('pointermove', onMove)
    el.removeEventListener('pointerleave', onLeave)
    el.style.transform = ''
    el.style.willChange = ''
    el.style.transformStyle = ''
    if (parent) parent.style.perspective = ''
  }
}
