const ALLOWED = new Set(['split', 'parallax', 'tilt', 'magnetic', 'cursor-target'])

export function parseMotionFlags(value) {
  const flags = new Set()
  if (!value || typeof value !== 'string') return flags
  for (const part of value.split(',')) {
    const key = part.trim()
    if (ALLOWED.has(key)) flags.add(key)
  }
  return flags
}

export function elementHasMotionFlag(el, flag) {
  if (!el?.getAttribute) return false
  return parseMotionFlags(el.getAttribute('data-motion')).has(flag)
}
