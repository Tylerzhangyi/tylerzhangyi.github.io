'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n'
import { clearSavedHomeScroll, isHomePath, setPendingSection } from '@/lib/homeScrollRestore'
import { scrollToSection, sectionHash } from '@/lib/scrollToSection'
import { refreshScrollLayoutNow } from '@/lib/scrollLayout'
import { useMotionMode } from '@/lib/motionSystem/MotionRoot'
import { bindMagnetic } from '@/lib/motionSystem/primitives/magnetic'
import {
  staggerMenuClose,
  staggerMenuOpen
} from '@/lib/motionSystem/primitives/menuStagger'

const MENU_ANIM_MS = 220

export default function SiteHeader() {
  const { lang, t, toggleLanguage } = useI18n()
  const motionMode = useMotionMode()
  const router = useRouter()
  const pathname = usePathname()
  const brandRef = useRef(null)
  const langRef = useRef(null)
  const menuBtnRef = useRef(null)
  const menuNavRef = useRef(null)
  const menuStaggerCleanupRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuVisible, setMenuVisible] = useState(false)
  const [menuClosing, setMenuClosing] = useState(false)
  const menuTimerRef = useRef(null)

  const useGsapMenu = motionMode === 'desktopFull'

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

  const killMenuStagger = useCallback(() => {
    if (menuStaggerCleanupRef.current) {
      menuStaggerCleanupRef.current()
      menuStaggerCleanupRef.current = null
    }
  }, [])

  const collectMenuLinks = useCallback(() => {
    const nav = menuNavRef.current
    if (!nav) return []
    return Array.from(nav.querySelectorAll('.menu-overlay__link'))
  }, [])

  const closeMenu = useCallback(() => {
    if (!menuOpen && !menuVisible) return
    setMenuClosing(true)
    setMenuOpen(false)
    document.body.style.overflow = ''
    document.body.classList.remove('is-menu-open')

    if (useGsapMenu) {
      killMenuStagger()
      menuStaggerCleanupRef.current = staggerMenuClose(collectMenuLinks())
    }

    if (menuTimerRef.current) window.clearTimeout(menuTimerRef.current)
    menuTimerRef.current = window.setTimeout(() => {
      killMenuStagger()
      setMenuVisible(false)
      setMenuClosing(false)
      refreshScrollLayoutNow()
      window.dispatchEvent(new Event('scroll'))
    }, MENU_ANIM_MS)
  }, [menuOpen, menuVisible, useGsapMenu, killMenuStagger, collectMenuLinks])

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

      const runScroll = () => {
        refreshScrollLayoutNow()
        scrollToSection(id, 'smooth')
        window.dispatchEvent(new Event('scroll'))
      }

      if (!isHomePath(pathname)) {
        setPendingSection(id)
        router.push('/')
        return
      }

      const hash = sectionHash(id)
      window.history.replaceState(null, '', hash)

      requestAnimationFrame(() => {
        runScroll()
        window.setTimeout(runScroll, MENU_ANIM_MS + 80)
        window.setTimeout(runScroll, MENU_ANIM_MS + 320)
        window.setTimeout(runScroll, MENU_ANIM_MS + 720)
      })
    },
    [closeMenu, pathname, router]
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
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
    refreshScrollLayoutNow()
    window.dispatchEvent(new Event('scroll'))
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
      killMenuStagger()
      document.body.style.overflow = ''
      document.body.classList.remove('is-menu-open')
    }
  }, [closeMenu, killMenuStagger])

  // Desktop-full: magnetic on brand / lang / menu button
  useEffect(() => {
    if (motionMode !== 'desktopFull') return undefined

    const cleanups = [brandRef.current, langRef.current, menuBtnRef.current]
      .filter(Boolean)
      .map((el) => bindMagnetic(el))

    return () => {
      cleanups.forEach((fn) => fn())
    }
  }, [motionMode])

  // Desktop-full: GSAP menu link stagger on open, then magnetic on links
  useEffect(() => {
    if (!useGsapMenu || !menuOpen || !menuVisible || menuClosing) return undefined

    let linkMagnetCleanups = []
    const frame = requestAnimationFrame(() => {
      killMenuStagger()
      const links = collectMenuLinks()
      menuStaggerCleanupRef.current = staggerMenuOpen(links, {
        onComplete: () => {
          linkMagnetCleanups = links.map((el) => bindMagnetic(el))
        }
      })
    })

    return () => {
      cancelAnimationFrame(frame)
      linkMagnetCleanups.forEach((fn) => fn())
    }
  }, [useGsapMenu, menuOpen, menuVisible, menuClosing, killMenuStagger, collectMenuLinks])

  return (
    <>
      <header className="site-header site-header--minimal">
        <button
          ref={brandRef}
          type="button"
          className="site-header__brand"
          data-motion="magnetic,cursor-target"
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
            data-motion="magnetic,cursor-target"
            onClick={toggleLanguage}
            aria-label={lang === 'zh' ? 'Switch to English' : '切换到中文'}
          >
            {lang === 'zh' ? '中文 / en' : 'en / 中文'}
          </button>
          <button
            ref={menuBtnRef}
            type="button"
            className={`nav-menu ${menuOpen ? 'is-open' : ''}`}
            data-motion="magnetic,cursor-target"
            data-cursor="menu"
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
          className={`menu-overlay ${menuOpen ? 'is-open' : ''} ${menuClosing ? 'is-closing' : ''} ${useGsapMenu ? 'menu-overlay--gsap' : ''}`}
          aria-hidden={String(!menuOpen)}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeMenu()
          }}
        >
          <div className="menu-overlay__panel" onClick={(e) => e.stopPropagation()}>
            <div className="menu-overlay__head">
              <h2 className="menu-overlay__title">navigation</h2>
              <button
                type="button"
                className="menu-overlay__close"
                data-motion="magnetic,cursor-target"
                aria-label="Close menu"
                onClick={closeMenu}
              >
                ×
              </button>
            </div>

            <nav ref={menuNavRef} className="menu-overlay__nav" aria-label="全站导航">
              {menuItems.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  className="menu-overlay__link"
                  data-motion="magnetic,cursor-target"
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
