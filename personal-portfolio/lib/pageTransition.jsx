'use client'

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from 'react'
import { computeRevealScale } from './revealScale'
import {
  saveHomeScroll,
  restoreHomeScroll,
  isHomePath
} from './homeScrollRestore'
import { lockBodyScroll, forceUnlockBodyScroll, getLockedScrollY, isBodyScrollLocked } from './scrollLock'

export const EXPAND_MS = 520
export const HOLD_MS = 800
export const CONTRACT_MS = 520

const SERVER_SNAPSHOT = {
  phase: 'idle',
  originX: 0,
  originY: 0,
  revealScale: 120
}

let state = { ...SERVER_SNAPSHOT }

export const lastPointer = { x: state.originX, y: state.originY }
const DETAIL_RETURN_KEY = 'portfolio:detail-return'

const listeners = new Set()

function emit() {
  listeners.forEach((fn) => fn())
}

function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

function getSnapshot() {
  return state
}

function getServerSnapshot() {
  return SERVER_SNAPSHOT
}

export function setTransitionOrigin(x, y) {
  state = {
    ...state,
    originX: x,
    originY: y,
    revealScale: computeRevealScale(x, y)
  }
  lastPointer.x = x
  lastPointer.y = y
  emit()
}

export function setTransitionOriginFromElement(el) {
  if (!el) return
  const rect = el.getBoundingClientRect()
  setTransitionOrigin(rect.left + rect.width / 2, rect.top + rect.height / 2)
}

function runExpandPhase(onExpanded) {
  state = { ...state, phase: 'primed' }
  emit()

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      state = { ...state, phase: 'expanding' }
      emit()
      if (onExpanded) {
        window.setTimeout(onExpanded, EXPAND_MS)
      }
    })
  })
}

export function playPageExit() {
  return new Promise((resolve) => {
    runExpandPhase(() => {
      state = { ...state, phase: 'holding' }
      emit()
      window.setTimeout(resolve, HOLD_MS)
    })
  })
}

/** 进入详情页：圆扩张完成后立即跳转，不再额外等待 HOLD_MS */
export function playPageExitForNavigate() {
  return new Promise((resolve) => {
    runExpandPhase(() => {
      state = { ...state, phase: 'holding' }
      emit()
      resolve()
    })
  })
}

export function playPageEnter() {
  if (state.phase === 'idle') return Promise.resolve()

  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      state = { ...state, phase: 'contracting' }
      emit()
      window.setTimeout(() => {
        state = { ...state, phase: 'idle' }
        emit()
        resolve()
      }, CONTRACT_MS)
    })
  })
}

export function scrollDetailToTop() {
  if (typeof window === 'undefined') return
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
}

export function rememberDetailReturn(href) {
  if (typeof window === 'undefined' || !href) return

  const targetPath = href.split('?')[0].split('#')[0]
  const kind = targetPath.includes('/blog/') ? 'blog' : targetPath.includes('/projects/') ? 'projects' : null
  if (!kind) return

  try {
    window.sessionStorage.setItem(
      DETAIL_RETURN_KEY,
      JSON.stringify({
        kind,
        href: `${window.location.pathname}${window.location.search}${window.location.hash}`,
        scrollY: window.scrollY,
        at: Date.now()
      })
    )
  } catch {}
}

export function getDetailReturnHref(kind) {
  if (typeof window === 'undefined') return '/'

  try {
    const raw = window.sessionStorage.getItem(DETAIL_RETURN_KEY)
    if (!raw) return kind ? `/#section-${kind}` : '/'

    const saved = JSON.parse(raw)
    const fresh = Date.now() - Number(saved.at || 0) < 1000 * 60 * 30
    if (!fresh || (kind && saved.kind !== kind)) return kind ? `/#section-${kind}` : '/'

    if (saved.href && isHomePath(saved.href.split('?')[0].split('#')[0])) {
      return saved.href
    }
  } catch {}

  return kind ? `/#section-${kind}` : '/'
}

const PageTransitionContext = createContext(null)

export function PageTransitionProvider({ children }) {
  const transition = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const navigateWithTransition = useCallback(async (href, routerPush) => {
    const targetPath = href.split('?')[0].split('#')[0]
    const goingHome = isHomePath(targetPath)
    const leavingHome = isHomePath()

    const scrollY = isBodyScrollLocked() ? getLockedScrollY() : lockBodyScroll()

    if (leavingHome && !goingHome) {
      saveHomeScroll(scrollY)
    }

    try {
      const pushPromise = routerPush(href)
      await playPageExitForNavigate()
      await pushPromise

      if (goingHome) {
        forceUnlockBodyScroll(getLockedScrollY())
        restoreHomeScroll()
      } else {
        forceUnlockBodyScroll(0)
        scrollDetailToTop()
      }

      void playPageEnter()
    } catch (error) {
      forceUnlockBodyScroll(scrollY)
      state = { ...state, phase: 'idle' }
      emit()
      throw error
    }
  }, [])

  const value = useMemo(
    () => ({
      ...transition,
      navigateWithTransition,
      setTransitionOrigin,
      setTransitionOriginFromElement,
      playPageExit,
      playPageEnter
    }),
    [transition, navigateWithTransition]
  )

  return (
    <PageTransitionContext.Provider value={value}>{children}</PageTransitionContext.Provider>
  )
}

export function usePageTransition() {
  const ctx = useContext(PageTransitionContext)
  if (!ctx) throw new Error('usePageTransition must be used within PageTransitionProvider')
  return ctx
}
