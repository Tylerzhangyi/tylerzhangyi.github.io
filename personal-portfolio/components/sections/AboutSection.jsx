'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import styles from './about.module.css'

function useSceneReveal(threshold = 0.18) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true)
      },
      { threshold, rootMargin: '0px 0px -6% 0px' }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, visible }
}

export default function AboutSection() {
  const { t, getDict, lang } = useI18n()
  const intro = useSceneReveal()
  const interests = useSceneReveal()
  const life = useSceneReveal()
  const awards = useSceneReveal()

  const interestsList = useMemo(() => getDict('about.interestsList') || [], [getDict, lang])
  const hobbiesList = useMemo(() => getDict('about.hobbiesList') || [], [getDict, lang])
  const awardsList = useMemo(() => getDict('skills.awardsList') || [], [getDict, lang])

  const titleWords = t('about.title').toLowerCase().split(/\s+/).filter(Boolean)

  return (
    <div className={styles.aboutStack}>
      {/* Page 1 — typographic opener + offset copy */}
      <section
        ref={intro.ref}
        className={`${styles.scene} ${styles.sceneIntro} ${intro.visible ? styles.sceneVisible : ''}`}
        data-scene="intro"
        aria-label={t('about.title')}
      >
        <div className={styles.sceneGrid} aria-hidden="true" />
        <div className={styles.introDecor} aria-hidden="true">
          <span className={styles.introDecorBlock} />
          <span className={styles.introDecorBar} />
        </div>

        <div className={styles.introLayout}>
          <div className={styles.introTitleCol}>
            <p className={styles.introKicker}>{t('nav.about')}</p>
            <h1 className={styles.introMegaTitle}>
              {titleWords.map((word, i) => (
                <span key={`${word}-${i}`} className={i === titleWords.length - 1 ? styles.introMegaAccent : undefined}>
                  {word}
                </span>
              ))}
            </h1>
          </div>
          <blockquote className={styles.introQuote}>
            <span className={styles.introQuoteLabel}>{t('about.intro')}</span>
            <p>{t('about.introText')}</p>
          </blockquote>
        </div>
      </section>

      {/* Page 2 — vertical rail + staggered interest strips */}
      <section
        ref={interests.ref}
        className={`${styles.scene} ${styles.sceneInterests} ${interests.visible ? styles.sceneVisible : ''}`}
        data-scene="interests"
      >
        <div className={`${styles.sceneGrid} ${styles.sceneGridDense}`} aria-hidden="true" />
        <div className={styles.interestsDecor} aria-hidden="true">
          <span className={styles.interestsDecorRail} />
          {interestsList.map((_, i) => (
            <span key={i} className={styles.interestsDecorDot} style={{ '--i': i }} />
          ))}
        </div>

        <div className={styles.interestsLayout}>
          <h2 className={styles.interestsVerticalTitle}>{t('about.interests')}</h2>
          <ol className={styles.interestStripList}>
            {interestsList.map((interest, index) => (
              <li
                key={interest}
                className={styles.interestStrip}
                data-tone={index % 3}
                style={{ '--delay': `${index * 0.09}s`, '--shift': `${(index % 3) * 6}%` }}
              >
                <span className={styles.interestStripText}>{interest}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Page 3 — hobby tiles + full-bleed goals band */}
      <section
        ref={life.ref}
        className={`${styles.scene} ${styles.sceneLife} ${life.visible ? styles.sceneVisible : ''}`}
        data-scene="life"
      >
        <div className={styles.lifeDecor} aria-hidden="true">
          <span className={styles.lifeDecorBracket} />
          <span className={styles.lifeDecorRing} />
        </div>
        <div className={styles.lifeUpper}>
          <h2 className={styles.lifeSectionTitle}>{t('about.hobbies')}</h2>
          <ul className={styles.hobbyTileGrid}>
            {hobbiesList.map((hobby, index) => (
              <li
                key={hobby}
                className={styles.hobbyTile}
                data-size={index % 2 === 0 ? 'wide' : 'tall'}
                style={{ '--delay': `${index * 0.08}s` }}
              >
                <span className={styles.hobbyTileMark} aria-hidden="true" />
                <span>{hobby}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.goalsBand}>
          <div className={styles.goalsBandInner}>
            <p className={styles.goalsBandLabel}>{t('about.goals')}</p>
            <p className={styles.goalsBandText}>{t('about.goalsText')}</p>
          </div>
        </div>
      </section>

      {/* Page 4 — alternating timeline awards */}
      <section
        ref={awards.ref}
        className={`${styles.scene} ${styles.sceneAwards} ${awards.visible ? styles.sceneVisible : ''}`}
        data-scene="awards"
      >
        <div className={styles.sceneGrid} aria-hidden="true" />
        <div className={styles.awardsDecor} aria-hidden="true">
          {awardsList.map((_, i) => (
            <span key={i} className={styles.awardsDecorStep} style={{ '--i': i }} />
          ))}
        </div>
        <div className={styles.awardsLayout}>
          <header className={styles.awardsHeader}>
            <h2 className={styles.awardsTitle}>{t('about.awards')}</h2>
          </header>
          <ul className={styles.awardsTimeline}>
            {awardsList.map((award, index) => (
              <li
                key={award}
                className={styles.awardsNode}
                data-side={index % 2 === 0 ? 'left' : 'right'}
                style={{ '--delay': `${index * 0.1}s` }}
              >
                <span className={styles.awardsNodeStem} aria-hidden="true" />
                <div className={styles.awardsNodeBody}>
                  <p>{award}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
