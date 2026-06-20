'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useI18n } from '@/lib/i18n'
import { subscribeScroll } from '@/lib/scrollLoop'
import { resolveAssetUrl } from '@/lib/assets'
import styles from './form-studio-hero.module.css'

const clamp = (v, min, max) => Math.min(max, Math.max(min, v))
const lerp = (a, b, t) => a + (b - a) * t
const SPLIT_START = 42

function smoothstep(t) {
  return t * t * (3 - 2 * t)
}

export default function AboutMeShowcase() {
  const { t } = useI18n()
  const rootRef = useRef(null)
  const showcaseSectionRef = useRef(null)
  const stickyRef = useRef(null)
  const mediaRef = useRef(null)
  const showRef = useRef(null)
  const caseRef = useRef(null)

  const showcaseImage = resolveAssetUrl('photos/about-ship.png')

  const updateShowcase = useCallback(() => {
    const section = showcaseSectionRef.current
    const sticky = stickyRef.current
    const media = mediaRef.current
    const show = showRef.current
    const caseLabel = caseRef.current
    if (!section || !sticky || !media || !show || !caseLabel) return

    const vh = window.innerHeight
    const rect = section.getBoundingClientRect()
    const scrollable = Math.max(section.offsetHeight - vh, 1)
    const progress = clamp(-rect.top / scrollable, 0, 1)
    const eased = smoothstep(progress)

    const scale = lerp(0.55, 1, eased)
    const split = lerp(SPLIT_START, 0, eased)
    const labelOpacity = lerp(0.35, 1, eased)

    media.style.transform = `translate(-50%, -50%) scale(${scale})`
    sticky.classList.toggle(styles.formStudioShowcaseStickyFull, progress > 0.96)
    show.style.transform = `translateX(${-split}vw)`
    caseLabel.style.transform = `translateX(${split}vw)`
    show.style.opacity = String(labelOpacity)
    caseLabel.style.opacity = String(labelOpacity)
  }, [])

  useEffect(() => {
    const unbindScroll = subscribeScroll(updateShowcase, {
      root: rootRef.current,
      rootMargin: '0px 0px -5% 0px'
    })

    requestAnimationFrame(() => updateShowcase())
    return () => unbindScroll?.()
  }, [updateShowcase])

  return (
    <div ref={rootRef} className={styles.aboutMeShowcaseRoot}>
      <section
        id="section-about-showcase"
        ref={showcaseSectionRef}
        className={styles.formStudioShowcase}
        aria-label="About Me"
      >
        <div ref={stickyRef} className={styles.formStudioShowcaseSticky}>
          <div ref={mediaRef} className={styles.formStudioShowcaseMedia}>
            <img
              src={showcaseImage}
              alt={t('home.showcaseAlt')}
              loading="lazy"
              draggable={false}
            />
          </div>
          <div className={styles.formStudioShowcaseLabels}>
            <h2
              ref={showRef}
              className={`${styles.formStudioShowcaseLabel} ${styles.formStudioShowcaseLabelLeft}`}
            >
              {t('home.showCaseLeft')}
            </h2>
            <h2
              ref={caseRef}
              className={`${styles.formStudioShowcaseLabel} ${styles.formStudioShowcaseLabelRight}`}
            >
              {t('home.showCaseRight')}
            </h2>
          </div>
        </div>
        <div className={styles.formStudioShowcaseTail} aria-hidden="true" />
      </section>
    </div>
  )
}
