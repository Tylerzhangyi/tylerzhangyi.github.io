'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CheckIcon } from '@heroicons/react/24/solid'
import {
  UserCircleIcon,
  AcademicCapIcon,
  PaintBrushIcon,
  RocketLaunchIcon,
  SparklesIcon,
  TrophyIcon
} from '@heroicons/react/24/outline'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useI18n } from '@/lib/i18n'
import styles from './about.module.css'

const PANEL_COUNT = 2

export default function AboutSection() {
  const { t, getDict, lang } = useI18n()
  const aboutRootRef = useRef(null)
  const wrapRef = useRef(null)
  const pinRef = useRef(null)
  const trackRef = useRef(null)

  const scrollTweenRef = useRef(null)
  const resizeTimerRef = useRef(null)
  const layoutRetryTimerRef = useRef(null)
  const revealObserverRef = useRef(null)

  const [displayIndex, setDisplayIndex] = useState(1)

  const interestsList = useMemo(() => getDict('about.interestsList') || [], [getDict, lang])
  const hobbiesList = useMemo(() => getDict('about.hobbiesList') || [], [getDict, lang])
  const awardsList = useMemo(() => getDict('skills.awardsList') || [], [getDict, lang])

  const isDesktop = useCallback(() => {
    return window.matchMedia('(min-width: 900px)').matches
  }, [])

  const destroyHorizontalScroll = useCallback(() => {
    if (scrollTweenRef.current) {
      scrollTweenRef.current.scrollTrigger?.kill(true)
      scrollTweenRef.current.kill()
      scrollTweenRef.current = null
    }
    ScrollTrigger.getAll()
      .filter((st) => st.vars?.id === 'about-horizontal-st')
      .forEach((st) => st.kill(true))

    const pin = pinRef.current
    const track = trackRef.current
    if (pin) gsap.set(pin, { clearProps: 'all' })
    if (track) gsap.set(track, { clearProps: 'all' })
  }, [])

  const setupHorizontalScroll = useCallback(() => {
    if (!isDesktop()) {
      destroyHorizontalScroll()
      return
    }

    const wrap = wrapRef.current
    const pin = pinRef.current
    const track = trackRef.current
    if (!wrap || !pin || !track) return

    destroyHorizontalScroll()

    const distance = () => Math.max(0, Math.round(track.scrollWidth - pin.clientWidth))

    if (distance() < 1) {
      if (layoutRetryTimerRef.current) window.clearTimeout(layoutRetryTimerRef.current)
      layoutRetryTimerRef.current = window.setTimeout(() => setupHorizontalScroll(), 120)
      return
    }

    scrollTweenRef.current = gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        id: 'about-horizontal-st',
        trigger: wrap,
        start: 'top top+=48',
        end: () => `+=${Math.max(distance(), 1)}`,
        scrub: 1,
        pin,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const idx = Math.max(
            1,
            Math.min(PANEL_COUNT, Math.floor(self.progress * (PANEL_COUNT - 1) + 0.5) + 1)
          )
          setDisplayIndex(idx)
        }
      }
    })
    ScrollTrigger.refresh(true)
  }, [destroyHorizontalScroll, isDesktop])

  const watchAboutSectionReveal = useCallback(() => {
    const section = document.getElementById('section-about')
    if (!section || section.classList.contains('is-revealed')) return

    revealObserverRef.current = new MutationObserver(() => {
      if (!section.classList.contains('is-revealed')) return
      ScrollTrigger.refresh(true)
      revealObserverRef.current?.disconnect()
      revealObserverRef.current = null
    })
    revealObserverRef.current.observe(section, { attributes: true, attributeFilter: ['class'] })
  }, [])

  const queueHorizontalSetup = useCallback(() => {
    requestAnimationFrame(() => {
      setupHorizontalScroll()
      watchAboutSectionReveal()
    })
  }, [setupHorizontalScroll, watchAboutSectionReveal])

  const onResize = useCallback(() => {
    if (resizeTimerRef.current) window.clearTimeout(resizeTimerRef.current)
    resizeTimerRef.current = window.setTimeout(() => {
      destroyHorizontalScroll()
      queueHorizontalSetup()
    }, 160)
  }, [destroyHorizontalScroll, queueHorizontalSetup])

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    queueHorizontalSetup()
    window.addEventListener('resize', onResize, { passive: true })

    return () => {
      window.removeEventListener('resize', onResize)
      if (resizeTimerRef.current) window.clearTimeout(resizeTimerRef.current)
      if (layoutRetryTimerRef.current) window.clearTimeout(layoutRetryTimerRef.current)
      revealObserverRef.current?.disconnect()
      destroyHorizontalScroll()
    }
  }, [queueHorizontalSetup, onResize, destroyHorizontalScroll])

  return (
    <div ref={aboutRootRef} className={`${styles.aboutPage} page`}>
      <div ref={wrapRef} className={styles.horizontalWrapper}>
        <div ref={pinRef} className={`${styles.horizontalPin} ${styles.aboutStage}`}>
          <div ref={trackRef} className={`${styles.aboutTrack} horizontal`}>
            <section className={styles.aboutPanel}>
              <div className={`container ${styles.panelInner}`}>
                <h1 className={styles.pageTitle}>{t('about.title')}</h1>
                <div className={styles.aboutGrid}>
                  <div className={styles.aboutSection}>
                    <div className={styles.sectionHeader}>
                      <UserCircleIcon className={styles.sectionIcon} />
                      <h2>{t('about.intro')}</h2>
                    </div>
                    <p>{t('about.introText')}</p>
                  </div>
                  <div className={styles.aboutSection}>
                    <div className={styles.sectionHeader}>
                      <AcademicCapIcon className={styles.sectionIcon} />
                      <h2>{t('about.interests')}</h2>
                    </div>
                    <ul className={styles.interestList}>
                      {interestsList.map((interest, index) => (
                        <li
                          key={`i-${index}`}
                          className={styles.interestItem}
                          style={{ animationDelay: `${index * 0.08}s` }}
                        >
                          <CheckIcon className={styles.checkIcon} />
                          <span>{interest}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className={`${styles.aboutGrid} ${styles.aboutGridCompact}`}>
                  <div className={styles.aboutCard}>
                    <div className={styles.cardHeader}>
                      <PaintBrushIcon className={styles.cardIcon} />
                      <h3>{t('about.hobbies')}</h3>
                    </div>
                    <div className={styles.hobbiesContent}>
                      {hobbiesList.map((hobby, index) => (
                        <div key={`h-${index}`} className={styles.hobbyItem}>
                          <SparklesIcon className={styles.hobbyIcon} />
                          <span>{hobby}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className={styles.aboutCard}>
                    <div className={styles.cardHeader}>
                      <RocketLaunchIcon className={styles.cardIcon} />
                      <h3>{t('about.goals')}</h3>
                    </div>
                    <p className={styles.goalsText}>{t('about.goalsText')}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className={`${styles.aboutPanel} secondary`}>
              <div className={`container ${styles.panelInner} ${styles.panelInnerSecondary}`}>
                <div className={`${styles.aboutCard} ${styles.singleCard}`}>
                  <div className={styles.cardHeader}>
                    <TrophyIcon className={styles.cardIcon} />
                    <h3>{t('about.awards')}</h3>
                  </div>
                  <ul className={styles.awardsList}>
                    {awardsList.map((award) => (
                      <li key={award}>
                        <TrophyIcon className={styles.awardIcon} />
                        <span>{award}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <div className={styles.panelProgress} aria-hidden="true">
        <span>{String(displayIndex).padStart(2, '0')}</span>
        <span className={styles.panelProgressSep}>/</span>
        <span>{String(PANEL_COUNT).padStart(2, '0')}</span>
      </div>
    </div>
  )
}
