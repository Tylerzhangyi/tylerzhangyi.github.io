let lockCount = 0
let lockedY = 0

export function lockBodyScroll() {
  if (typeof window === 'undefined') return 0

  if (lockCount === 0) {
    lockedY = window.scrollY
    document.body.style.position = 'fixed'
    document.body.style.top = `-${lockedY}px`
    document.body.style.left = '0'
    document.body.style.right = '0'
    document.body.style.width = '100%'
    document.body.style.overflow = 'hidden'
  }

  lockCount += 1
  return lockedY
}

export function unlockBodyScroll(restoreY) {
  if (typeof window === 'undefined') return

  lockCount = Math.max(0, lockCount - 1)
  if (lockCount > 0) return

  const y = restoreY ?? lockedY
  document.body.style.position = ''
  document.body.style.top = ''
  document.body.style.left = ''
  document.body.style.right = ''
  document.body.style.width = ''
  document.body.style.overflow = ''
  window.scrollTo({ top: y, left: 0, behavior: 'auto' })
  lockedY = 0
}

export function isBodyScrollLocked() {
  return lockCount > 0
}

export function getLockedScrollY() {
  return lockedY
}

export function forceUnlockBodyScroll(restoreY) {
  lockCount = 0
  unlockBodyScroll(restoreY)
}
