'use client'

import { useEffect, useRef, useState } from 'react'
import { useUiState } from '@/lib/uiState'
import styles from './neo-brutal-scene.module.css'

export function NeoDecorLayer({ active = false }) {
  return (
    <div
      className={`${styles.neoDecorLayer} ${active ? styles.neoDecorLayerActive : ''}`}
      aria-hidden="true"
    >
      <div className={`${styles.neoDecor} ${styles.neoDecorA}`} />
      <div className={`${styles.neoDecor} ${styles.neoDecorB}`} />
      <div className={`${styles.neoDecor} ${styles.neoDecorC}`} />
      <div className={`${styles.neoDecor} ${styles.neoDecorD}`} />
    </div>
  )
}

export function NeoMorphBackdrop({ active = false }) {
  return (
    <div
      className={`${styles.neoMorph} ${active ? styles.neoMorphActive : ''}`}
      aria-hidden="true"
    >
      <div className={`${styles.neoMorphShape} ${styles.neoMorphRed}`} />
      <div className={`${styles.neoMorphShape} ${styles.neoMorphWhite}`} />
      <div className={`${styles.neoMorphShape} ${styles.neoMorphBlack}`} />
      <div className={`${styles.neoMorphShape} ${styles.neoMorphRing}`} />
    </div>
  )
}

export function NeoHomeHero({ left, right, inView = true, fill = false }) {
  const { bootLoading, bootHandoff } = useUiState()
  const ref = useRef(null)
  const [active, setActive] = useState(false)
  const [settled, setSettled] = useState(false)
  const leftLetters = left.toLowerCase().split('')
  const rightLetters = right.toLowerCase().split('')
  const handoff = bootHandoff
  const bootDone = !bootLoading && !bootHandoff

  useEffect(() => {
    if (handoff) {
      setActive(true)
      setSettled(true)
      return undefined
    }

    if (!bootDone) {
      setActive(false)
      return undefined
    }

    const timer = window.setTimeout(() => setActive(true), 60)
    return () => window.clearTimeout(timer)
  }, [handoff, bootDone])

  useEffect(() => {
    if (!inView || !bootDone) return undefined

    const node = ref.current
    if (!node) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setActive(true)
      },
      { threshold: 0.2 }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [inView, bootDone])

  const sceneActive = active || handoff

  return (
    <div
      ref={ref}
      className={`${styles.neoScene} ${fill ? styles.neoSceneFill : ''} ${fill ? styles.neoSceneViewport : ''} ${sceneActive ? styles.neoSceneActive : ''} ${handoff || settled ? styles.neoSceneSettled : ''}`}
    >
      <div className={styles.neoGrid} aria-hidden="true" />
      <NeoMorphBackdrop active={active} />

      <div className={styles.neoContent}>
        <div className={styles.neoHeroTitle} aria-label={`${left} ${right}`}>
          <div className={styles.neoHeroWord}>
            {leftLetters.map((char, index) => (
              <span
                key={`left-${char}-${index}`}
                className={`${styles.neoHeroLetter} ${styles.neoHeroLetterWhite}`}
                style={{ '--i': index }}
                aria-hidden="true"
              >
                {char}
              </span>
            ))}
          </div>
          <span className={styles.neoDot} aria-hidden="true">
            ·
          </span>
          <div className={styles.neoHeroWord}>
            {rightLetters.map((char, index) => (
              <span
                key={`right-${char}-${index}`}
                className={`${styles.neoHeroLetter} ${styles.neoHeroLetterRed}`}
                style={{ '--i': leftLetters.length + 1 + index }}
                aria-hidden="true"
              >
                {char}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function NeoContactTitle({ title, inView, fill = false, minimal = false }) {
  const ref = useRef(null)
  const [active, setActive] = useState(false)
  const letters = title.toLowerCase().split('')

  useEffect(() => {
    const node = ref.current
    if (!node) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setActive(true)
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (inView) setActive(true)
  }, [inView])

  return (
    <div
      ref={ref}
      className={`${styles.neoScene} ${minimal ? styles.neoSceneMinimal : ''} ${fill ? styles.neoSceneFill : ''} ${fill ? styles.neoSceneViewport : ''} ${active ? styles.neoSceneActive : ''}`}
    >
      {!minimal ? (
        <>
          <div className={styles.neoGrid} aria-hidden="true" />
          <NeoDecorLayer active={active} />
        </>
      ) : null}

      <div className={styles.neoContent}>
        <div className={styles.neoLetters} aria-label={title}>
          {letters.map((char, index) => {
            if (char === ' ') {
              return <span key={`space-${index}`} style={{ width: '0.28em' }} />
            }

            return (
              <span
                key={`${char}-${index}`}
                className={styles.neoLetter}
                style={{ '--i': index }}
                aria-hidden="true"
              >
                {char}
              </span>
            )
          })}
        </div>
        <div className={styles.neoBar} aria-hidden="true" />
      </div>
    </div>
  )
}
