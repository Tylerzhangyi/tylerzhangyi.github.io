import gsap from 'gsap'

const HOVER_SELECTOR = '[data-cursor], a, button'

/**
 * @param {HTMLElement} rootEl host element for the custom cursor
 * @returns {{ destroy: () => void, setEnabled: (enabled: boolean) => void }}
 */
export function createCursorController(rootEl) {
  if (!rootEl) {
    return { destroy() {}, setEnabled() {} }
  }

  rootEl.style.pointerEvents = 'none'
  rootEl.setAttribute('aria-hidden', 'true')

  const cursor = document.createElement('div')
  cursor.className = 'motion-cursor'
  const label = document.createElement('div')
  label.className = 'motion-cursor__label'
  cursor.appendChild(label)
  rootEl.appendChild(cursor)

  let enabled = false
  let expanded = false

  const xTo = gsap.quickTo(cursor, 'x', { duration: 0.35, ease: 'power3.out' })
  const yTo = gsap.quickTo(cursor, 'y', { duration: 0.35, ease: 'power3.out' })

  const setLabel = (text) => {
    const value = text?.trim?.() || ''
    label.textContent = value
    label.hidden = !value
    cursor.classList.toggle('motion-cursor--labeled', Boolean(value))
  }

  const setExpanded = (next) => {
    expanded = next
    cursor.classList.toggle('motion-cursor--expanded', expanded)
  }

  const syncHoverTarget = (target) => {
    if (!enabled || !target || typeof target.closest !== 'function') {
      setExpanded(false)
      setLabel('')
      return
    }
    const hit = target.closest(HOVER_SELECTOR)
    if (!hit) {
      setExpanded(false)
      setLabel('')
      return
    }
    setExpanded(true)
    setLabel(hit.getAttribute('data-cursor') || '')
  }

  const onPointerMove = (event) => {
    if (!enabled) return
    xTo(event.clientX)
    yTo(event.clientY)
    syncHoverTarget(event.target)
  }

  const onPointerOver = (event) => {
    if (!enabled) return
    syncHoverTarget(event.target)
  }

  const applyVisibility = () => {
    cursor.classList.toggle('motion-cursor--active', enabled)
    if (!enabled) {
      setExpanded(false)
      setLabel('')
    }
  }

  document.addEventListener('pointermove', onPointerMove, { passive: true })
  document.addEventListener('pointerover', onPointerOver, { passive: true })
  applyVisibility()

  return {
    setEnabled(next) {
      enabled = Boolean(next)
      applyVisibility()
    },
    destroy() {
      document.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('pointerover', onPointerOver)
      gsap.killTweensOf(cursor)
      cursor.remove()
    }
  }
}
