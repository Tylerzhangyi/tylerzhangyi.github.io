/** Normalize pathname for comparison (trailing slash / empty → `/`). */
export function normalizePathname(pathname) {
  if (!pathname || typeof pathname !== 'string') return '/'
  const path = pathname.split('?')[0].split('#')[0]
  const trimmed = path.replace(/\/+$/, '')
  return trimmed || '/'
}

/**
 * Wait until window location matches target, or timeout.
 * @returns {Promise<boolean>} true if path matched
 */
export function waitForPathname(targetHref, options = {}) {
  const timeoutMs = options.timeoutMs ?? 2500
  const getPathname = options.getPathname ?? (() => window.location.pathname)
  const now = options.now ?? (() => performance.now())
  const schedule = options.schedule ?? ((fn) => requestAnimationFrame(fn))

  const target = normalizePathname(String(targetHref || '').split('?')[0].split('#')[0])

  return new Promise((resolve) => {
    const start = now()
    const check = () => {
      if (normalizePathname(getPathname()) === target) {
        resolve(true)
        return
      }
      if (now() - start >= timeoutMs) {
        resolve(false)
        return
      }
      schedule(check)
    }
    check()
  })
}

/**
 * Soft-navigate via routerPush, then hard-assign if path never commits.
 * Returns 'soft' | 'hard' | 'noop'
 */
export async function commitClientNavigation(href, routerPush, options = {}) {
  const target = normalizePathname(String(href || '').split('?')[0].split('#')[0])
  const getPathname = options.getPathname ?? (() => window.location.pathname)
  const assign = options.assign ?? ((url) => {
    window.location.assign(url)
  })

  if (normalizePathname(getPathname()) === target) return 'noop'

  routerPush(href)

  const committed = await waitForPathname(href, options)
  if (committed) return 'soft'

  assign(href)
  return 'hard'
}
