const HEADER_OFFSET = 72

export function getSectionScrollTop(id) {
  if (typeof window === 'undefined') return 0

  if (id === 'contact') {
    if (!document.getElementById('section-contact')) return 0
    return Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
  }

  const target = document.getElementById(`section-${id}`)
  if (!target) return 0

  return Math.max(0, target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET)
}

export function scrollToSection(id, behavior = 'smooth') {
  if (typeof window === 'undefined') return false

  const apply = () => {
    if (id !== 'contact' && !document.getElementById(`section-${id}`)) {
      return false
    }

    const top = getSectionScrollTop(id)
    window.scrollTo({ top, left: 0, behavior })
    return true
  }

  if (apply()) return true

  requestAnimationFrame(() => {
    requestAnimationFrame(() => apply())
  })

  return false
}
