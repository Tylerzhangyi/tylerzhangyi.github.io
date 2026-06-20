'use client'

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { subscribeScroll } from '@/lib/scrollLoop'
import styles from './contact.module.css'

const clamp = (v, min, max) => Math.min(max, Math.max(min, v))
const lerp = (a, b, t) => a + (b - a) * t

const BG_START = [255, 255, 255]
const BG_END = [255, 224, 54]

function WaveHeroText({ text, active }) {
  const wrapRef = useRef(null)
  const heroRef = useRef(null)

  const chars = useMemo(
    () =>
      text.split('').map((char, index) => ({
        char,
        index,
        isSpace: char === ' '
      })),
    [text]
  )

  useLayoutEffect(() => {
    const wrap = wrapRef.current
    const hero = heroRef.current
    if (!wrap || !hero) return undefined

    const fitText = () => {
      hero.style.fontSize = ''
      let size = parseFloat(window.getComputedStyle(hero).fontSize)
      const minSize = 28
      const available = wrap.clientWidth

      while (hero.scrollWidth > available && size > minSize) {
        size -= 1
        hero.style.fontSize = `${size}px`
      }
    }

    fitText()
    const observer = new ResizeObserver(fitText)
    observer.observe(wrap)
    window.addEventListener('resize', fitText, { passive: true })

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', fitText)
    }
  }, [text])

  return (
    <div ref={wrapRef} className={styles.contactHeroWrap}>
      <div
        ref={heroRef}
        className={`${styles.contactHero} ${active ? styles.contactHeroActive : ''}`}
      >
        {chars.map((item) => {
          if (item.isSpace) {
            return (
              <span key={`space-${item.index}`} className={styles.heroSpace}>
                &nbsp;
              </span>
            )
          }

          return (
            <span key={`char-${item.index}`} className={styles.heroChar}>
              {item.char}
            </span>
          )
        })}
      </div>
    </div>
  )
}

export default function ContactSection() {
  const { t } = useI18n()
  const scrollRef = useRef(null)
  const pinRef = useRef(null)
  const stackRef = useRef(null)
  const [optionsOpen, setOptionsOpen] = useState(false)

  const toggleOptions = useCallback((event) => {
    event.stopPropagation()
    setOptionsOpen((open) => !open)
  }, [])

  const closeOptions = useCallback((event) => {
    event?.stopPropagation()
    setOptionsOpen(false)
  }, [])

  useEffect(() => {
    if (!optionsOpen) return undefined

    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeOptions()
    }

    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [closeOptions, optionsOpen])

  const updateContactBg = useCallback(() => {
    const scrollEl = scrollRef.current
    const pin = pinRef.current
    if (!scrollEl?.isConnected || !pin?.isConnected) return

    const vh = window.innerHeight
    const scrollable = Math.max(scrollEl.offsetHeight - vh, 1)
    const rect = scrollEl.getBoundingClientRect()
    const progress = clamp(-rect.top / scrollable, 0, 1)
    const eased = progress * progress * (3 - 2 * progress)

    const r = Math.round(lerp(BG_START[0], BG_END[0], eased))
    const g = Math.round(lerp(BG_START[1], BG_END[1], eased))
    const b = Math.round(lerp(BG_START[2], BG_END[2], eased))
    pin.style.backgroundColor = `rgb(${r}, ${g}, ${b})`
  }, [])

  useEffect(() => {
    const scrollEl = scrollRef.current
    if (!scrollEl) return undefined

    let alive = true
    const tick = () => {
      if (alive) updateContactBg()
    }

    const unbind = subscribeScroll(tick, {
      root: scrollEl,
      rootMargin: '0px 0px -5% 0px'
    })
    requestAnimationFrame(tick)

    return () => {
      alive = false
      unbind?.()
    }
  }, [updateContactBg])

  return (
    <div
      ref={scrollRef}
      id="section-contact"
      className={styles.contactScroll}
      data-scroll-section="contact"
      aria-label={t('contact.title')}
    >
      <div ref={pinRef} className={styles.contactPin}>
        <div className={styles.contactInner}>
          <div
            ref={stackRef}
            className={`${styles.contactStack} ${optionsOpen ? styles.contactStackOpen : ''}`}
          >
            <button
              type="button"
              className={styles.contactHeroButton}
              aria-expanded={optionsOpen}
              aria-controls="contact-options"
              aria-label={t('contact.openOptions')}
              onClick={toggleOptions}
            >
              <WaveHeroText text={t('contact.hero')} active={optionsOpen} />
            </button>

            <div
              id="contact-options"
              className={`${styles.contactOptions} ${optionsOpen ? styles.contactOptionsOpen : ''}`}
              aria-hidden={!optionsOpen}
            >
              <a className={styles.contactOption} href="mailto:Tyler.zhang.cn@hotmail.com">
                {t('contact.email')}
              </a>
              <a
                className={styles.contactOption}
                href="https://github.com/Tylerzhangyi"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('contact.github')}
              </a>
              <span className={styles.contactOption}>{t('contact.gameAccount')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
