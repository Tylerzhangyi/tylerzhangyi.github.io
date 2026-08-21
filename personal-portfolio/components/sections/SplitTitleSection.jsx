'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { subscribeScroll } from '@/lib/scrollLoop'
import styles from './split-title.module.css'

const clamp = (v, min, max) => Math.min(max, Math.max(min, v))
const lerp = (a, b, t) => a + (b - a) * t
const SPLIT_END = 56

function smoothstep(t) {
  return t * t * (3 - 2 * t)
}

function clearIndividualTransform(el) {
  if (!el) return
  el.style.translate = ''
  el.style.scale = ''
  el.style.rotate = ''
}

/**
 * My & Project — same sticky-split pattern as AboutMeShowcase.
 * Pure scroll math (no GSAP ScrollTrigger) so it never fights the education pin.
 */
export default function SplitTitleSection({
  sectionId,
  left,
  right,
  scrollSection = '',
  ariaLabel = '',
  scrollHeight = '200vh'
}) {
  const sectionRef = useRef(null)
  const stickyRef = useRef(null)
  const ampRef = useRef(null)
  const leftRef = useRef(null)
  const rightRef = useRef(null)
  const [sectionActive, setSectionActive] = useState(false)

  const updateScroll = useCallback(() => {
    const section = sectionRef.current
    const sticky = stickyRef.current
    const leftEl = leftRef.current
    const rightEl = rightRef.current
    const ampEl = ampRef.current
    if (!section || !sticky || !leftEl || !rightEl) return

    if (window.matchMedia('(max-width: 809px)').matches) {
      clearIndividualTransform(leftEl)
      clearIndividualTransform(rightEl)
      clearIndividualTransform(ampEl)
      leftEl.style.transform = 'none'
      rightEl.style.transform = 'none'
      leftEl.style.opacity = '1'
      rightEl.style.opacity = '1'
      if (ampEl) {
        ampEl.style.transform = 'none'
        ampEl.style.opacity = '1'
      }
      sticky.classList.remove(styles.splitTitleSectionStickyHidden)
      setSectionActive(true)
      document.body.classList.remove('is-projects-intro-active')
      return
    }

    const vh = window.innerHeight
    const rect = section.getBoundingClientRect()
    const inView = rect.top < vh * 0.98 && rect.bottom > vh * 0.02
    setSectionActive(inView)
    document.body.classList.toggle('is-projects-intro-active', inView)

    const scrollable = Math.max(section.offsetHeight - vh, 1)
    const progress = clamp(-rect.top / scrollable, 0, 1)

    const splitPhase = clamp(progress / 0.7, 0, 1)
    const splitEased = smoothstep(splitPhase)
    const split = lerp(0, SPLIT_END, splitEased)
    const fadeOut = clamp((progress - 0.72) / 0.28, 0, 1)
    const opacity = lerp(1, 0, fadeOut)

    sticky.classList.toggle(styles.splitTitleSectionStickyHidden, fadeOut > 0.92)

    clearIndividualTransform(leftEl)
    clearIndividualTransform(rightEl)
    clearIndividualTransform(ampEl)

    leftEl.style.transform = `translateX(${-split}vw)`
    rightEl.style.transform = `translateX(${split}vw)`
    leftEl.style.opacity = String(opacity)
    rightEl.style.opacity = String(opacity)

    if (ampEl) {
      ampEl.style.transform = `scale(${lerp(1, 0.5, splitEased)})`
      ampEl.style.opacity = String(lerp(1, 0, splitEased))
    }
  }, [])

  useEffect(() => {
    const section = sectionRef.current
    if (section) section.style.setProperty('--split-scroll-height', scrollHeight)
  }, [scrollHeight])

  useEffect(() => {
    // Always listen — IO gating was skipping updates near section edges.
    const unbindScroll = subscribeScroll(updateScroll)
    requestAnimationFrame(() => updateScroll())
    return () => {
      unbindScroll?.()
      document.body.classList.remove('is-projects-intro-active')
    }
  }, [updateScroll])

  return (
    <section
      id={sectionId}
      ref={sectionRef}
      className={`${styles.splitTitleSection} ${sectionActive ? styles.isActive : ''}`}
      data-scroll-section={scrollSection}
      aria-label={ariaLabel}
    >
      <div className={styles.splitTitleSectionGrid} aria-hidden="true">
        <div className={styles.splitTitleSectionGridLines} />
      </div>

      <div className={styles.splitDecor} aria-hidden="true">
        <span className={styles.splitDecorBlock} />
        <span className={styles.splitDecorBar} />
      </div>

      <div ref={stickyRef} className={styles.splitTitleSectionSticky}>
        <div className={styles.splitTitleSectionTitles}>
          <h2 ref={leftRef} className={styles.splitTitleSectionTitle}>
            {left}
          </h2>
          <span ref={ampRef} className={styles.splitAmpersand} aria-hidden="true">
            &
          </span>
          <h2
            ref={rightRef}
            className={`${styles.splitTitleSectionTitle} ${styles.splitTitleSectionTitleAccent}`}
          >
            {right}
          </h2>
        </div>
      </div>
    </section>
  )
}
