/** View / Read 按钮 – 药丸 + 圆箭头，鼠标在区域内受限跟随 */

export const CTA_ARROW_SVG =
  '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M13.7 4.355V12.459H1.4L0 1.418l12 12.256H4.1V15.7H15.7V4.355z" fill="#000"/></svg>'

const clamp = (v, min, max) => Math.min(max, Math.max(min, v))

function measureCta(scale) {
  const pill = scale.querySelector('.card-cta__pill')
  const arrow = scale.querySelector('.card-cta__arrow')
  const pillW = pill?.offsetWidth ?? 56
  const pillH = pill?.offsetHeight ?? 24
  const arrowW = arrow?.offsetWidth ?? 40
  const arrowH = arrow?.offsetHeight ?? 40
  return {
    w: pillW + 10 + arrowW,
    h: Math.max(pillH, arrowH)
  }
}

export function bindCtaFollow(wrap, options = {}) {
  const pad = options.pad ?? 24
  const scale = wrap.querySelector('.card-cta__scale')
  if (!scale) return () => {}

  const setCenter = () => {
    const rect = wrap.getBoundingClientRect()
    scale.style.left = `${rect.width / 2}px`
    scale.style.top = `${rect.height / 2}px`
  }

  setCenter()

  const onMove = (e) => {
    const rect = wrap.getBoundingClientRect()
    const { w, h } = measureCta(scale)
    const halfW = w / 2
    const halfH = h / 2

    let x = e.clientX - rect.left
    let y = e.clientY - rect.top

    x = clamp(x, pad + halfW, rect.width - pad - halfW)
    y = clamp(y, pad + halfH, rect.height - pad - halfH)

    scale.style.left = `${x}px`
    scale.style.top = `${y}px`
  }

  const onEnter = () => wrap.classList.add('is-cta-hover')
  const onLeave = () => {
    wrap.classList.remove('is-cta-hover')
    setCenter()
  }

  wrap.addEventListener('mousemove', onMove)
  wrap.addEventListener('mouseenter', onEnter)
  wrap.addEventListener('mouseleave', onLeave)

  return () => {
    wrap.removeEventListener('mousemove', onMove)
    wrap.removeEventListener('mouseenter', onEnter)
    wrap.removeEventListener('mouseleave', onLeave)
  }
}
