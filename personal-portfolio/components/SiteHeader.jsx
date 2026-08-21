'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n'
import { clearSavedHomeScroll, isHomePath, setPendingSection } from '@/lib/homeScrollRestore'
import { scrollToSection, sectionHash } from '@/lib/scrollToSection'
import { useMotionMode } from '@/lib/motionSystem/MotionRoot'
import { bindMagnetic } from '@/lib/motionSystem/primitives/magnetic'

const MENU_LINK_STAGGER_MS = 55
const MENU_LINK_MOVE_MS = 260
const MENU_PANEL_MS = 320

function menuCloseDuration(itemCount) {
  const n = Math.max(itemCount, 1)
  // Links leave in sequence, then panel slides away.
  return (n - 1) * MENU_LINK_STAGGER_MS + MENU_LINK_MOVE_MS + MENU_PANEL_MS
}

export default function SiteHeader() {
  const { lang, t, toggleLanguage } = useI18n()
  const motionMode = useMotionMode()
  const router = useRouter()
  const pathname = usePathname()
  const brandRef = useRef(null)
  const langRef = useRef(null)
  const menuBtnRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuVisible, setMenuVisible] = useState(false)
  const [menuClosing, setMenuClosing] = useState(false)
  const menuTimerRef = useRef(null)

  const menuItems = useMemo(
    () => [
      { id: 'home', label: t('nav.home') },
      { id: 'about', label: t('nav.about') },
      { id: 'education', label: t('nav.education') },
      { id: 'projects', label: t('nav.projects') },
      { id: 'blog', label: t('nav.blog') },
      { id: 'links', label: t('nav.links') },
      { id: 'contact', label: t('nav.contact') }
    ],
    [lang, t]
  )

  const closeMenu = useCallback(() => {
    if (!menuOpen && !menuVisible) return
    setMenuClosing(true)
    setMenuOpen(false)
    document.body.style.overflow = ''
    document.body.classList.remove('is-menu-open')

    if (menuTimerRef.current) window.clearTimeout(menuTimerRef.current)
    menuTimerRef.current = window.setTimeout(() => {
      setMenuVisible(false)
      setMenuClosing(false)
      window.dispatchEvent(new Event('scroll'))
    }, menuCloseDuration(menuItems.length))
  }, [menuOpen, menuVisible, menuItems.length])

  const toggleMenu = useCallback(() => {
    if (menuOpen) {
      closeMenu()
      return
    }
    setMenuClosing(false)
    setMenuVisible(true)
    document.body.style.overflow = 'hidden'
    document.body.classList.add('is-menu-open')
    requestAnimationFrame(() => setMenuOpen(true))
  }, [menuOpen, closeMenu])

  const goSection = useCallback(
    (id) => {
      closeMenu()
      clearSavedHomeScroll()

      if (!isHomePath(pathname)) {
        setPendingSection(id)
        router.push('/')
        return
      }

      window.history.replaceState(null, '', sectionHash(id))

      window.setTimeout(() => {
        scrollToSection(id, 'smooth')
      }, menuCloseDuration(menuItems.length) + 30)
    },
    [closeMenu, pathname, router, menuItems.length]
  )

  const goHome = useCallback(() => {
    closeMenu()
    clearSavedHomeScroll()

    if (!isHomePath(pathname)) {
      setPendingSection('home')
      router.push('/')
      return
    }

    window.history.replaceState(null, '', '/')
    scrollToSection('home', 'smooth')
  }, [closeMenu, pathname, router])

  useEffect(() => {
    document.body.style.overflow = ''
    document.body.classList.remove('is-menu-open')

    const onKeydown = (e) => {
      if (e.key === 'Escape') closeMenu()
    }
    document.addEventListener('keydown', onKeydown)
    return () => {
      document.removeEventListener('keydown', onKeydown)
      if (menuTimerRef.current) window.clearTimeout(menuTimerRef.current)
      document.body.style.overflow = ''
      document.body.classList.remove('is-menu-open')
    }
  }, [closeMenu])

  useEffect(() => {
    if (motionMode !== 'desktopFull') return undefined

    const cleanups = [brandRef.current, langRef.current, menuBtnRef.current]
      .filter(Boolean)
      .map((el) => bindMagnetic(el))

    return () => {
      cleanups.forEach((fn) => fn())
    }
  }, [motionMode])

  return (
    <>
      <header className="site-header site-header--minimal">
        <button
          ref={brandRef}
          type="button"
          className="site-header__brand"
          data-motion="magnetic"
          onClick={goHome}
        >
          <span className="site-header__brandMark" aria-hidden="true" />
          tyler zhang
        </button>

        <div className="site-header__actions">
          <button
            ref={langRef}
            type="button"
            className="nav-lang"
            data-motion="magnetic"
            onClick={toggleLanguage}
            aria-label={lang === 'zh' ? 'Switch to English' : '切换到中文'}
          >
            {lang === 'zh' ? '中文 / en' : 'en / 中文'}
          </button>
          <button
            ref={menuBtnRef}
            type="button"
            className={`nav-menu ${menuOpen ? 'is-open' : ''}`}
            data-motion="magnetic"
            aria-label="Menu"
            aria-expanded={String(menuOpen)}
            onClick={(e) => {
              e.stopPropagation()
              toggleMenu()
            }}
          >
            <span className="nav-menu__text">{menuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </header>

      {menuVisible && (
        <div
          className={`menu-overlay ${menuOpen ? 'is-open' : ''} ${menuClosing ? 'is-closing' : ''}`}
          style={{ '--n': menuItems.length }}
          aria-hidden={String(!menuOpen)}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeMenu()
          }}
        >
          <div className="menu-overlay__panel" onClick={(e) => e.stopPropagation()}>
            <div className="menu-overlay__kicker">menu</div>
            <nav className="menu-overlay__nav" aria-label="全站导航">
              {menuItems.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  className="menu-overlay__link"
                  style={{ '--i': i }}
                  onClick={() => goSection(item.id)}
                >
                  <span>{item.label}</span>
                  <span className="menu-overlay__linkIndex">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
