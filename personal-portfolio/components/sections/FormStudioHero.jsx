'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { subscribeScroll } from '@/lib/scrollLoop'
import { NeoHomeHero } from '@/components/neo/NeoBrutalScene'
import styles from './form-studio-hero.module.css'

export default function FormStudioHero() {
  const { t } = useI18n()
  const rootRef = useRef(null)
  const [inView, setInView] = useState(true)

  const updateHeroState = useCallback(() => {
    const root = rootRef.current
    if (!root) return

    const vh = window.innerHeight
    const rootRect = root.getBoundingClientRect()
    const inHome = rootRect.top < vh && rootRect.bottom > 0
    setInView(inHome)
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
      className={styles.formStudioHome}
      id="section-home"
      data-scroll-section="home"
      data-motion="parallax"
    >
      <section className={styles.heroSection} aria-label="主视觉">
        <div className={styles.heroCanvas} data-parallax data-parallax-from="18" data-parallax-to="-36">
          <NeoHomeHero
            left={t('home.heroLeft').toLowerCase()}
            right={t('home.heroRight').toLowerCase()}
            kicker={t('home.eyebrow').toLowerCase()}
            inView={inView}
            fill
          />
        </div>
      </section>
    </div>
  )
}
