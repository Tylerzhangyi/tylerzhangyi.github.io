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

export function clearPendingSection() {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem(PENDING_SECTION_KEY)
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

export function clearHomeHash() {
  if (typeof window === 'undefined') return
  if (!window.location.hash) return
  window.history.replaceState(null, '', window.location.pathname + window.location.search)
}

export function isHomePath(pathname) {
  if (typeof pathname === 'undefined') {
    if (typeof window === 'undefined') return false
    pathname = window.location.pathname
  }
  const normalized = pathname.replace(/\/$/, '') || '/'
  const base = (process.env.NEXT_PUBLIC_BASE_PATH || '').replace(/\/$/, '')
  if (base && (normalized === base || normalized === `${base}/`)) return true
  return normalized === '/'
}

export function saveHomeScroll(explicitY) {
  if (typeof window === 'undefined') return
  const y = typeof explicitY === 'number' ? explicitY : window.scrollY
  if (!isHomePath() && typeof explicitY !== 'number') return
  savedY = Math.max(0, Math.round(y))
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

export function restoreHomeScroll() {
  if (typeof window === 'undefined') return

  // Detail returns must win over leftover menu hashes.
  clearHomeHash()

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
  window.setTimeout(apply, 600)
  window.setTimeout(apply, 1100)

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
