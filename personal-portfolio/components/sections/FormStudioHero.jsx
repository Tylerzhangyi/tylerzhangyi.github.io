'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { subscribeScroll } from '@/lib/scrollLoop'
import styles from './form-studio-hero.module.css'

export default function FormStudioHero() {
  const { t } = useI18n()
  const rootRef = useRef(null)
  const [pageActive, setPageActive] = useState(false)

  const updateHeroState = useCallback(() => {
    const root = rootRef.current
    if (!root) return

    const vh = window.innerHeight
    const rootRect = root.getBoundingClientRect()
    const inHome = rootRect.top < vh && rootRect.bottom > 0
    setPageActive(inHome)
    document.body.classList.toggle('is-form-studio-home-active', inHome)
  }, [])

  useEffect(() => {
    const unbindScroll = subscribeScroll(updateHeroState, {
      root: rootRef.current,
      rootMargin: '0px 0px -5% 0px'
    })

    requestAnimationFrame(() => updateHeroState())

    return () => {
      unbindScroll?.()
      document.body.classList.remove('is-form-studio-home-active')
    }
  }, [updateHeroState])

  return (
    <div
      ref={rootRef}
      className={`${styles.formStudioHome} ${pageActive ? styles.isActive : ''}`}
    >
      <div className={styles.formStudioHomeGrid} aria-hidden="true">
        <div className={styles.formStudioHomeGridLines} />
      </div>

      <section id="section-home" className="fs-hero fs-hero--static" aria-label="主视觉">
        <div className="fs-hero__grid" aria-hidden="true" />
        <div className="fs-hero__inner">
          <div className="fs-hero__titles">
            <h1 className="fs-hero__title fs-hero__title--left">{t('home.heroLeft')}</h1>
            <span className="fs-hero__title-dot" aria-hidden="true">·</span>
            <h1 className="fs-hero__title fs-hero__title--right">{t('home.heroRight')}</h1>
          </div>
        </div>
      </section>
    </div>
  )
}
