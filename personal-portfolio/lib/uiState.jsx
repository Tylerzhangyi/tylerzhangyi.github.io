'use client'

import { createContext, useContext, useEffect, useMemo, useSyncExternalStore } from 'react'

let state = {
  bootLoading: true,
  routeLoading: false,
  loadingText: 'LOADING',
  progress: 0
}

const SERVER_SNAPSHOT = {
  bootLoading: true,
  routeLoading: false,
  loadingText: 'LOADING',
  progress: 0
}

let bootSession = 0
let bootRaf = 0
let finishTimer = null
let routeTimer = null
let bootFinished = false

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

function setState(patch) {
  state = { ...state, ...patch }
  emit()
}

function setBodyLoading(on) {
  try {
    document.documentElement.classList.toggle('is-boot-loading', !!on)
  } catch {
    // ignore
  }
}

function wait(ms) {
  return new Promise((r) => window.setTimeout(r, ms))
}

function preloadImage(src) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = src
  })
}

async function preloadCriticalAssets() {
  const assets = [
    '/photos/tyler.png',
    '/photos/circuit.svg',
    '/photos/boot/pacman-sheet.png',
    '/photos/welcome-graduation.png'
  ]
  await Promise.allSettled(assets.map((asset) => preloadImage(asset)))
}

function clearBootTimers() {
  if (bootRaf) {
    window.cancelAnimationFrame(bootRaf)
    bootRaf = 0
  }
  if (finishTimer) {
    window.clearTimeout(finishTimer)
    finishTimer = null
  }
}

function finishBoot(force = false) {
  if (bootFinished && !force) return
  bootFinished = true
  clearBootTimers()
  setState({ bootLoading: false, progress: 100, loadingText: 'READY' })
  setBodyLoading(false)
}

function scheduleBootFinish(session) {
  if (session !== bootSession || bootFinished) return

  setState({ loadingText: 'SYNC', progress: 100 })

  finishTimer = window.setTimeout(() => {
    if (session !== bootSession || bootFinished) return
    finishBoot()
  }, 420)
}

export function startBootLoading() {
  bootFinished = false
  const session = ++bootSession
  clearBootTimers()

  setState({
    bootLoading: true,
    loadingText: 'LOADING',
    progress: 0
  })
  setBodyLoading(true)

  const durationMs = 1200
  const startAt = performance.now()

  const tick = (now) => {
    if (session !== bootSession || bootFinished) return
    const t = Math.min(1, Math.max(0, (now - startAt) / durationMs))
    setState({ progress: Math.round(t * 100) })
    if (t < 1) bootRaf = window.requestAnimationFrame(tick)
  }

  bootRaf = window.requestAnimationFrame(tick)

  ;(async () => {
    try {
      await Promise.race([
        Promise.allSettled([wait(800), preloadCriticalAssets()]),
        wait(2200)
      ])
    } finally {
      scheduleBootFinish(session)
    }
  })()
}

export function finishBootLoading() {
  finishBoot(true)
}

export function startRouteLoading(label = 'LOADING') {
  setState({ routeLoading: true, loadingText: label, progress: 25 })

  if (routeTimer) window.clearInterval(routeTimer)
  routeTimer = window.setInterval(() => {
    const next = state.progress + 7
    setState({ progress: next >= 85 ? 35 : next })
  }, 90)
}

export function finishRouteLoading() {
  if (routeTimer) window.clearInterval(routeTimer)
  routeTimer = null
  setState({ progress: 100 })
  window.setTimeout(() => {
    setState({ routeLoading: false })
  }, 200)
}

if (typeof window !== 'undefined') {
  window.setTimeout(() => finishBoot(true), 3500)
}

const UiStateContext = createContext(null)

export function UiStateProvider({ children }) {
  const ui = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  useEffect(() => {
    startBootLoading()
  }, [])

  useEffect(() => {
    if (!ui.bootLoading) {
      document.body.classList.add('is-ready')
      window.requestAnimationFrame(() => {
        import('gsap/ScrollTrigger')
          .then(({ ScrollTrigger }) => ScrollTrigger.refresh(true))
          .catch(() => {})
      })
    }
  }, [ui.bootLoading])

  const value = useMemo(() => ui, [ui])

  return <UiStateContext.Provider value={value}>{children}</UiStateContext.Provider>
}

export function useUiState() {
  const ctx = useContext(UiStateContext)
  if (!ctx) throw new Error('useUiState must be used within UiStateProvider')
  return ctx
}
