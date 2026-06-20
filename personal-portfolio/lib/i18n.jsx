'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from 'react'

import { dict } from './i18n-dict'

const DEFAULT_LANG = 'zh'

let lang = DEFAULT_LANG

const listeners = new Set()

function emit() {
  listeners.forEach((fn) => fn())
}

function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

function getSnapshot() {
  return lang
}

function getServerSnapshot() {
  return DEFAULT_LANG
}

export function setLanguage(nextLang) {
  lang = nextLang
  if (typeof window !== 'undefined') {
    localStorage.setItem('site-language', nextLang)
    document.documentElement.setAttribute('lang', nextLang === 'zh' ? 'zh-CN' : 'en')
  }
  emit()
}

export function t(path) {
  const parts = path.split('.')
  let obj = dict[lang]
  for (const p of parts) {
    if (!obj) break
    obj = obj[p]
  }
  return obj || path
}

export function getDict(path) {
  const parts = path.split('.')
  let obj = dict[lang]
  for (const p of parts) {
    if (!obj) break
    obj = obj[p]
  }
  return obj
}

const I18nContext = createContext(null)

export function I18nProvider({ children }) {
  const currentLang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  useEffect(() => {
    document.documentElement.setAttribute('lang', currentLang === 'zh' ? 'zh-CN' : 'en')
  }, [currentLang])

  useEffect(() => {
    const stored = localStorage.getItem('site-language')
    if (stored && stored !== lang && dict[stored]) {
      setLanguage(stored)
    }
  }, [])

  const toggleLanguage = useCallback(() => {
    setLanguage(currentLang === 'zh' ? 'en' : 'zh')
  }, [currentLang])

  const value = useMemo(
    () => ({
      lang: currentLang,
      t,
      getDict,
      setLanguage,
      toggleLanguage
    }),
    [currentLang, toggleLanguage]
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
