'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useI18n } from '@/lib/i18n'
import { subscribeScroll } from '@/lib/scrollLoop'
import { resolveAssetUrl } from '@/lib/assets'
import styles from './form-studio-hero.module.css'

const clamp = (v, min, max) => Math.min(max, Math.max(min, v))
const lerp = (a, b, t) => a + (b - a) * t
const SPLIT_END = 58

function smoothstep(t) {
  return t * t * (3 - 2 * t)
}

function clearIndividualTransform(el) {
  el.style.translate = ''
  el.style.scale = ''
  el.style.rotate = ''
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

    if (window.matchMedia('(max-width: 809px)').matches) {
      clearIndividualTransform(media)
      clearIndividualTransform(show)
      clearIndividualTransform(caseLabel)
      media.style.transform = 'translate(-50%, -50%) scale(1)'
      show.style.transform = 'none'
      caseLabel.style.transform = 'none'
      show.style.opacity = '1'
      caseLabel.style.opacity = '1'
      sticky.classList.remove(styles.formStudioShowcaseStickyFull, styles.formStudioShowcaseLabelsHidden)
      return
    }

    const vh = window.innerHeight
    const rect = section.getBoundingClientRect()
    const scrollable = Math.max(section.offsetHeight - vh, 1)
    const progress = clamp(-rect.top / scrollable, 0, 1)
    const eased = smoothstep(progress)

    const scale = lerp(0.55, 1, eased)
    const splitPhase = clamp(progress / 0.72, 0, 1)
    const splitEased = smoothstep(splitPhase)
    const split = lerp(0, SPLIT_END, splitEased)

    const fadeOut = clamp((progress - 0.68) / 0.32, 0, 1)
    const labelOpacity = lerp(1, 0, fadeOut)

    clearIndividualTransform(media)
    clearIndividualTransform(show)
    clearIndividualTransform(caseLabel)

    media.style.transform = `translate(-50%, -50%) scale(${scale})`
    sticky.classList.toggle(styles.formStudioShowcaseStickyFull, progress > 0.96)
    sticky.classList.toggle(styles.formStudioShowcaseLabelsHidden, fadeOut > 0.92)
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
        data-motion="parallax"
        aria-label="About Me"
      >
        <div ref={stickyRef} className={styles.formStudioShowcaseSticky}>
          <div ref={mediaRef} className={styles.formStudioShowcaseMedia} data-parallax data-parallax-from="20" data-parallax-to="-28">
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
