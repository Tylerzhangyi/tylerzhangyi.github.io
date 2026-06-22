'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n'
import { computeRevealScale } from '@/lib/revealScale'
import { clearSavedHomeScroll } from '@/lib/homeScrollRestore'
import { scrollToSection } from '@/lib/scrollToSection'

const MENU_ANIM_MS = 520

export default function SiteHeader() {
  const { lang, t, toggleLanguage } = useI18n()
  const router = useRouter()
  const pathname = usePathname()
  const menuBtnRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuVisible, setMenuVisible] = useState(false)
  const [menuClosing, setMenuClosing] = useState(false)
  const [menuOriginX, setMenuOriginX] = useState(0)
  const [menuOriginY, setMenuOriginY] = useState(0)
  const [menuRevealScale, setMenuRevealScale] = useState(120)
  const menuTimerRef = useRef(null)

  const menuItems = useMemo(
    () => [
      { id: 'home', label: t('nav.home') },
      { id: 'about', label: t('nav.about') },
      { id: 'education', label: t('nav.education') },
      { id: 'projects-intro', label: t('nav.projects') },
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
    }, MENU_ANIM_MS)
  }, [menuOpen, menuVisible])

  const setMenuOriginFromButton = useCallback(() => {
    const btn = menuBtnRef.current
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    const ox = rect.left + rect.width * 0.82
    const oy = rect.top + rect.height / 2
    setMenuOriginX(ox)
    setMenuOriginY(oy)
    setMenuRevealScale(computeRevealScale(ox, oy))
  }, [])

  const toggleMenu = useCallback(() => {
    if (menuOpen) {
      closeMenu()
      return
    }
    setMenuOriginFromButton()
    setMenuClosing(false)
    setMenuVisible(true)
    document.body.style.overflow = 'hidden'
    document.body.classList.add('is-menu-open')
    requestAnimationFrame(() => setMenuOpen(true))
  }, [menuOpen, closeMenu, setMenuOriginFromButton])

  const goSection = useCallback(
    (id) => {
      closeMenu()
      clearSavedHomeScroll()

      const runScroll = () => {
        scrollToSection(id, 'smooth')
      }

      if (pathname !== '/') {
        router.push(`/#section-${id}`)
        window.setTimeout(runScroll, 280)
        return
      }

      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', `/#section-${id}`)
      }
      window.setTimeout(runScroll, MENU_ANIM_MS + 120)
    },
    [closeMenu, pathname, router]
  )

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

  return (
    <>
      <header className="site-header site-header--minimal">
        <div className="site-header__actions">
          <button
            type="button"
            className="nav-lang"
            onClick={toggleLanguage}
            aria-label={lang === 'zh' ? 'Switch to English' : '切换到中文'}
          >
            {lang === 'zh' ? '中文 / EN' : 'EN / 中文'}
          </button>
          <button
            ref={menuBtnRef}
            type="button"
            className={`nav-menu ${menuOpen ? 'is-open' : ''}`}
            aria-label="Menu"
            aria-expanded={String(menuOpen)}
            onClick={(e) => {
              e.stopPropagation()
              toggleMenu()
            }}
          >
            <span className="nav-menu__text">Menu</span>
          </button>
        </div>
      </header>

      {menuVisible && (
        <div
          className={`menu-overlay ${menuOpen ? 'is-open' : ''} ${menuClosing ? 'is-closing' : ''}`}
          style={{
            '--menu-ox': `${menuOriginX}px`,
            '--menu-oy': `${menuOriginY}px`,
            '--menu-reveal-scale': menuRevealScale
          }}
          aria-hidden={String(!menuOpen)}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeMenu()
          }}
        >
          <div className="menu-overlay__reveal" aria-hidden="true" />
          <div className="menu-overlay__content">
            <nav className="menu-overlay__nav" aria-label="全站导航">
              {menuItems.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  className="menu-overlay__link"
                  style={{ '--i': i }}
                  onClick={() => goSection(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
