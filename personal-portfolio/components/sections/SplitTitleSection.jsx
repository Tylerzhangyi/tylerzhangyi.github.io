'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { subscribeScroll } from '@/lib/scrollLoop'
import styles from './split-title.module.css'

const clamp = (v, min, max) => Math.min(max, Math.max(min, v))
const lerp = (a, b, t) => a + (b - a) * t
const SPLIT_END = 52

function smoothstep(t) {
  return t * t * (3 - 2 * t)
}

export default function SplitTitleSection({
  sectionId,
  left,
  right,
  scrollSection = '',
  ariaLabel = '',
  scrollHeight = '128vh'
}) {
  const sectionRef = useRef(null)
  const stickyRef = useRef(null)
  const leftRef = useRef(null)
  const rightRef = useRef(null)

  const [sectionActive, setSectionActive] = useState(false)

  const updateScroll = useCallback(() => {
    const section = sectionRef.current
    const sticky = stickyRef.current
    const leftEl = leftRef.current
    const rightEl = rightRef.current
    if (!section || !sticky || !leftEl || !rightEl) return

    const vh = window.innerHeight
    const rect = section.getBoundingClientRect()
    const inView = rect.top < vh * 0.92 && rect.bottom > 0
    setSectionActive(inView)
    document.body.classList.toggle('is-projects-intro-active', inView)

    const scrollable = Math.max(section.offsetHeight - vh, 1)
    const progress = clamp(-rect.top / scrollable, 0, 1)
    const eased = smoothstep(progress)

    const splitPhase = clamp(progress / 0.72, 0, 1)
    const splitEased = smoothstep(splitPhase)
    const split = lerp(0, SPLIT_END, splitEased)

    const fadeOut = clamp((progress - 0.68) / 0.32, 0, 1)
    const opacity = lerp(1, 0, fadeOut)

    sticky.classList.toggle(styles.splitTitleSectionStickyHidden, fadeOut > 0.92)

    leftEl.style.transform = `translateX(${-split}vw)`
    rightEl.style.transform = `translateX(${split}vw)`
    leftEl.style.opacity = String(opacity)
    rightEl.style.opacity = String(opacity)
  }, [])

  useEffect(() => {
    const section = sectionRef.current
    if (section) section.style.setProperty('--split-scroll-height', scrollHeight)

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      if (leftRef.current) {
        leftRef.current.style.opacity = '1'
        leftRef.current.style.transform = 'none'
      }
      if (rightRef.current) {
        rightRef.current.style.opacity = '1'
        rightRef.current.style.transform = 'none'
      }
      return () => document.body.classList.remove('is-projects-intro-active')
    }

    const unbindScroll = subscribeScroll(updateScroll, {
      root: sectionRef.current,
      rootMargin: '0px 0px -5% 0px'
    })

    requestAnimationFrame(() => updateScroll())

    return () => {
      unbindScroll?.()
      document.body.classList.remove('is-projects-intro-active')
    }
  }, [scrollHeight, updateScroll])

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

      <div ref={stickyRef} className={styles.splitTitleSectionSticky}>
        <div className={styles.splitTitleSectionTitles}>
          <h2
            ref={leftRef}
            className={styles.splitTitleSectionTitle}
          >
            {left}
          </h2>
          <h2
            ref={rightRef}
            className={styles.splitTitleSectionTitle}
          >
            {right}
          </h2>
        </div>
      </div>
    </section>
  )
}
