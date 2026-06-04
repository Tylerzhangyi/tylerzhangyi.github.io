/** 圆形 reveal 的基础直径（px），最终 scale 由 computeRevealScale 动态计算 */
export const REVEAL_BASE_PX = 48

/** 从 (x,y) 扩散时，scale(1) 需覆盖到视口最远角的倍数 */
export function computeRevealScale(x, y, basePx = REVEAL_BASE_PX) {
  if (typeof window === 'undefined') return 120

  const w = window.innerWidth
  const h = window.innerHeight
  const maxRadius = Math.max(
    Math.hypot(x, y),
    Math.hypot(w - x, y),
    Math.hypot(x, h - y),
    Math.hypot(w - x, h - y)
  )

  return ((maxRadius * 2) / basePx) * 1.06
}
