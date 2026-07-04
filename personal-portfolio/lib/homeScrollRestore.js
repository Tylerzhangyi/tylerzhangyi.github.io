import { menuIdFromHash } from '@/lib/scrollToSection'

const STORAGE_KEY = 'portfolio:home-scroll'
const PENDING_SECTION_KEY = 'portfolio:pending-section'

let savedY = 0

export function setPendingSection(id) {
  if (typeof window === 'undefined' || !id) return
  try {
    sessionStorage.setItem(PENDING_SECTION_KEY, id)
  } catch {
    /* ignore */
  }
}

export function consumePendingSection() {
  if (typeof window === 'undefined') return null
  try {
    const id = sessionStorage.getItem(PENDING_SECTION_KEY)
    sessionStorage.removeItem(PENDING_SECTION_KEY)
    return id || null
  } catch {
    return null
  }
}

export function getHashSection() {
  if (typeof window === 'undefined') return null
  return menuIdFromHash(window.location.hash)
}

export function isHomePath(pathname) {
  if (typeof pathname === 'undefined') {
    if (typeof window === 'undefined') return false
    pathname = window.location.pathname
  }
  const normalized = pathname.replace(/\/$/, '') || '/'
  return normalized === '/'
}

export function saveHomeScroll(explicitY) {
  if (typeof window === 'undefined') return
  const y = typeof explicitY === 'number' ? explicitY : window.scrollY
  if (!isHomePath() && typeof explicitY !== 'number') return
  savedY = y
  try {
    sessionStorage.setItem(STORAGE_KEY, String(savedY))
  } catch {
    /* ignore */
  }
}

export function getSavedHomeScroll() {
  if (savedY > 0) return savedY
  if (typeof window === 'undefined') return 0
  try {
    return Number(sessionStorage.getItem(STORAGE_KEY) || 0)
  } catch {
    return 0
  }
}

export function shouldSkipHomeScrollRestore() {
  if (typeof window === 'undefined') return false
  const hash = window.location.hash
  return Boolean(hash && hash.startsWith('#section-'))
}

export function restoreHomeScroll() {
  if (typeof window === 'undefined') return
  if (shouldSkipHomeScrollRestore()) {
    clearSavedHomeScroll()
    return
  }

  const y = getSavedHomeScroll()
  if (y <= 0) return

  const apply = () => {
    window.scrollTo({ top: y, left: 0, behavior: 'auto' })
    document.documentElement.scrollTop = y
    document.body.scrollTop = y
  }

  apply()
  requestAnimationFrame(() => {
    apply()
    requestAnimationFrame(apply)
  })
  window.setTimeout(apply, 80)
  window.setTimeout(apply, 240)

  savedY = 0
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

export function clearSavedHomeScroll() {
  savedY = 0
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}
