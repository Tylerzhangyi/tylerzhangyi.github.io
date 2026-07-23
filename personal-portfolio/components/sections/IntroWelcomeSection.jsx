'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { resolveAssetUrl } from '@/lib/assets'
import styles from './intro-welcome.module.css'

const WAVE_STRIPE_COUNT = 10
const TYPE_SPEED = 85
const DELETE_SPEED = 55
const HOLD_MS = 1000

function TypewriterText({ roles, enabled, className, fallback }) {
  const textRef = useRef(null)

  useEffect(() => {
    const el = textRef.current
    if (!el) return undefined

    if (!enabled || !roles.length) {
      el.textContent = fallback || roles[0] || ''
      el.dataset.typing = 'false'
      return undefined
    }

    let roleIndex = 0
    let deleting = false
    let current = ''
    let timer = 0
    let cancelled = false

    const write = (next) => {
      current = next
      el.textContent = next
      el.dataset.typing = next.length > 0 ? 'true' : 'false'
    }

    const schedule = (delay) => {
      window.clearTimeout(timer)
      timer = window.setTimeout(step, delay)
    }

    const step = () => {
      if (cancelled) return

      const role = roles[roleIndex] || ''

      if (!deleting) {
        if (current.length < role.length) {
          write(role.slice(0, current.length + 1))
          schedule(TYPE_SPEED)
          return
        }
        deleting = true
        schedule(HOLD_MS)
        return
      }

      if (current.length > 0) {
        write(current.slice(0, -1))
        schedule(DELETE_SPEED)
        return
      }

      deleting = false
      roleIndex = (roleIndex + 1) % roles.length
      schedule(320)
    }

    write('')
    schedule(400)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [roles, enabled, fallback])

  return <span ref={textRef} className={className} aria-live="polite" />
}

export default function IntroWelcomeSection() {
  const { t, getDict, lang } = useI18n()
  const sectionRef = useRef(null)
  const portraitImage = resolveAssetUrl('photos/welcome-graduation.png')
  const [motionEnabled, setMotionEnabled] = useState(false)
  const [revealed, setRevealed] = useState(false)

  const typewriterRoles = useMemo(
    () => getDict('home.introTypewriterRoles') || [],
    [getDict, lang]
  )

  const revealSection = useCallback(() => {
    const section = sectionRef.current
    if (!section || section.classList.contains(styles.isRevealed)) return
    section.classList.add(styles.isRevealed)
    setRevealed(true)
  }, [])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setMotionEnabled(!prefersReduced)

    if (prefersReduced) {
      revealSection()
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          revealSection()
          observer.disconnect()
        })
      },
      { threshold: 0.2, rootMargin: '0px 0px -8% 0px' }
    )

    observer.observe(section)
    return () => observer.disconnect()
  }, [revealSection])

  const staticRole = typewriterRoles[0] || ''
  const typewriterActive = motionEnabled && revealed

  return (
    <section
      ref={sectionRef}
      id="section-intro"
      className={styles.introWelcome}
      data-scroll-section="intro"
      data-motion="split,parallax"
      aria-label={t('home.introAria')}
    >
      <div className={styles.waveDecor} aria-hidden="true">
        {Array.from({ length: WAVE_STRIPE_COUNT }, (_, index) => (
          <span
            key={index}
            className={styles.waveStripe}
            style={{
              '--i': index,
              '--w': `${58 + ((index * 11) % 42)}%`
            }}
          />
        ))}
      </div>

      <div className={styles.introWelcomeInner}>
        <div className={styles.introWelcomeCopy} data-parallax data-parallax-from="24" data-parallax-to="-16">
          <h2 className={styles.introHeadline}>
            <span className={styles.introHeadlinePrefix} data-split="chars">
              {t('home.introHeadlinePrefix')}
            </span>
            <span className={styles.introHeadlineRole}>
              {typewriterActive ? (
                <TypewriterText
                  roles={typewriterRoles}
                  enabled={typewriterActive}
                  className={styles.introHeadlineDynamic}
                />
              ) : (
                <span className={styles.introHeadlineDynamic}>{staticRole}</span>
              )}
            </span>
          </h2>
          <p className={styles.introWelcomeText}>{t('home.introParagraph')}</p>
        </div>
        <div className={styles.introWelcomeMedia} data-parallax data-parallax-from="32" data-parallax-to="-24">
          <img
            src={portraitImage}
            alt={t('home.introImageAlt')}
            loading="lazy"
            draggable={false}
          />
        </div>
      </div>
    </section>
  )
}
