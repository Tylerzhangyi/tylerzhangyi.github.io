'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { subscribeScroll } from '@/lib/scrollLoop'
import { useMotionMode } from '@/lib/motionSystem/MotionRoot'
import styles from './split-title.module.css'

const clamp = (v, min, max) => Math.min(max, Math.max(min, v))
const lerp = (a, b, t) => a + (b - a) * t
const SPLIT_END = 58

function smoothstep(t) {
  return t * t * (3 - 2 * t)
}

function applySplitFrame({ progress, leftEl, rightEl, ampEl, sticky }) {
  const splitPhase = clamp(progress / 0.72, 0, 1)
  const splitEased = smoothstep(splitPhase)
  const split = lerp(0, SPLIT_END, splitEased)
  const fadeOut = clamp((progress - 0.68) / 0.32, 0, 1)
  const opacity = lerp(1, 0, fadeOut)

  sticky.classList.toggle(styles.splitTitleSectionStickyHidden, fadeOut > 0.92)

  ;[leftEl, rightEl, ampEl].forEach((el) => {
    if (!el) return
    el.style.translate = ''
  })

  leftEl.style.transform = `translateX(${-split}vw)`
  rightEl.style.transform = `translateX(${split}vw)`
  if (ampEl) {
    ampEl.style.transform = `scale(${lerp(1, 0.55, splitEased)})`
    ampEl.style.opacity = String(lerp(1, 0, splitEased))
  }
  leftEl.style.opacity = String(opacity)
  rightEl.style.opacity = String(opacity)
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
  const ampRef = useRef(null)
  const leftRef = useRef(null)
  const rightRef = useRef(null)
  const motionMode = useMotionMode()

  const [sectionActive, setSectionActive] = useState(false)

  const resetSplitFrame = useCallback(() => {
    const sticky = stickyRef.current
    const leftEl = leftRef.current
    const rightEl = rightRef.current
    const ampEl = ampRef.current
    if (!sticky || !leftEl || !rightEl) return

    sticky.classList.remove(styles.splitTitleSectionStickyHidden)
    ;[leftEl, rightEl, ampEl].forEach((el) => {
      if (!el) return
      el.style.translate = ''
      el.style.transform = 'none'
      el.style.opacity = '1'
    })
  }, [])

  const updateScroll = useCallback(() => {
    const section = sectionRef.current
    const sticky = stickyRef.current
    const ampEl = ampRef.current
    const leftEl = leftRef.current
    const rightEl = rightRef.current
    if (!section || !sticky || !leftEl || !rightEl) return

    if (window.matchMedia('(max-width: 809px)').matches) {
      resetSplitFrame()
      return
    }

    const vh = window.innerHeight
    const rect = section.getBoundingClientRect()
    const inView = rect.top < vh * 0.92 && rect.bottom > 0
    setSectionActive(inView)
    document.body.classList.toggle('is-projects-intro-active', inView)

    const scrollable = Math.max(section.offsetHeight - vh, 1)
    const progress = clamp(-rect.top / scrollable, 0, 1)

    applySplitFrame({ progress, leftEl, rightEl, ampEl, sticky })
  }, [resetSplitFrame])

  useEffect(() => {
    const section = sectionRef.current
    if (section) section.style.setProperty('--split-scroll-height', scrollHeight)
  }, [scrollHeight])

  useLayoutEffect(() => {
    const section = sectionRef.current
    const sticky = stickyRef.current
    const leftEl = leftRef.current
    const rightEl = rightRef.current
    const ampEl = ampRef.current
    if (!section || !sticky || !leftEl || !rightEl) return undefined

    const isMobile = window.matchMedia('(max-width: 809px)').matches

    if (motionMode === 'reduced' || isMobile) {
      resetSplitFrame()
      return () => document.body.classList.remove('is-projects-intro-active')
    }

    if (motionMode === 'desktopFull') {
      gsap.registerPlugin(ScrollTrigger)
      const ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.72,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const vh = window.innerHeight
            const inView = section.getBoundingClientRect().top < vh * 0.92
            setSectionActive(inView)
            document.body.classList.toggle('is-projects-intro-active', inView)
            applySplitFrame({
              progress: self.progress,
              leftEl,
              rightEl,
              ampEl,
              sticky
            })
          }
        })
      }, section)

      requestAnimationFrame(() => ScrollTrigger.refresh())

      return () => {
        ctx.revert()
        document.body.classList.remove('is-projects-intro-active')
      }
    }

    const unbindScroll = subscribeScroll(updateScroll, {
      root: section,
      rootMargin: '0px 0px -5% 0px'
    })

    requestAnimationFrame(() => updateScroll())

    return () => {
      unbindScroll?.()
      document.body.classList.remove('is-projects-intro-active')
    }
  }, [motionMode, resetSplitFrame, updateScroll])

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
