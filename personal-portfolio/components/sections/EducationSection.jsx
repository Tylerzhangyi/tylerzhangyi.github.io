'use client'

import { useLayoutEffect, useMemo, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useI18n } from '@/lib/i18n'
import { isScrollLayoutReady, onScrollLayoutReady } from '@/lib/scrollLayout'
import styles from './education.module.css'

const TREE_WIDTH = 960
const TREE_TOP = 56
const ROW_STEP = 200

function dashLength(el) {
  if (!el) return 0
  try {
    return el.getTotalLength?.() || 0
  } catch {
    return 0
  }
}

function isMobileLayout() {
  return window.matchMedia('(max-width: 809px)').matches
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function scrollRunway(count) {
  return Math.max(window.innerHeight * 1.8, count * 320 + 900)
}

export default function EducationSection() {
  const { t, getDict, lang } = useI18n()
  const rootRef = useRef(null)
  const scrollRef = useRef(null)
  const pinRef = useRef(null)
  const trunkRef = useRef(null)
  const branchRefs = useRef([])
  const nodeRefs = useRef([])

  const educationList = useMemo(() => getDict('skills.educationList') || [], [getDict, lang])

  const treeHeight = useMemo(
    () => TREE_TOP + educationList.length * ROW_STEP + 64,
    [educationList.length]
  )

  const branchLayout = useMemo(
    () =>
      educationList.map((_, index) => {
        const y = TREE_TOP + index * ROW_STEP + ROW_STEP * 0.5
        const leftSide = index % 2 === 0
        const x = leftSide ? 88 : TREE_WIDTH - 88
        return { y, x, leftSide }
      }),
    [educationList]
  )

  useLayoutEffect(() => {
    const root = rootRef.current
    const scrollEl = scrollRef.current
    const pinEl = pinRef.current
    const trunk = trunkRef.current
    if (!root || !scrollEl || !pinEl || !trunk || !educationList.length) return undefined

    gsap.registerPlugin(ScrollTrigger)

    let ctx = null
    let resizeTimer = 0
    let cancelled = false

    const build = () => {
      ctx?.revert()
      ctx = null

      const branches = branchRefs.current.filter(Boolean)
      const nodes = nodeRefs.current.filter(Boolean)
      const count = branches.length
      if (!count) return

      if (isMobileLayout() || prefersReducedMotion()) {
        gsap.set(nodes, { clearProps: 'opacity,transform,visibility,scale' })
        gsap.set([trunk, ...branches], { clearProps: 'strokeDashoffset,strokeDasharray' })
        return
      }

      const runway = scrollRunway(count)

      ctx = gsap.context(() => {
        const trunkLen = dashLength(trunk) || treeHeight - TREE_TOP - 40
        gsap.set(trunk, { strokeDasharray: trunkLen, strokeDashoffset: trunkLen })

        branches.forEach((branch) => {
          const len = dashLength(branch) || 200
          gsap.set(branch, { strokeDasharray: len, strokeDashoffset: len })
        })
        gsap.set(nodes, { opacity: 0, scale: 0.92, visibility: 'hidden' })

        const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } })
        const trunkSlot = 0.16
        const branchSlot = (1 - trunkSlot) / Math.max(count, 1)

        tl.to(trunk, { strokeDashoffset: 0, duration: trunkSlot }, 0)

        branches.forEach((branch, index) => {
          const start = trunkSlot + index * branchSlot
          tl.to(branch, { strokeDashoffset: 0, duration: branchSlot * 0.5 }, start)
          if (nodes[index]) {
            tl.set(nodes[index], { visibility: 'visible' }, start + branchSlot * 0.42)
            tl.to(
              nodes[index],
              { opacity: 1, scale: 1, duration: branchSlot * 0.32, ease: 'power2.out' },
              start + branchSlot * 0.42
            )
          }
        })

        ScrollTrigger.create({
          id: 'education-tree-st',
          trigger: scrollEl,
          start: 'top 12%',
          end: `+=${runway}`,
          pin: pinEl,
          scrub: 0.85,
          animation: tl,
          anticipatePin: 0,
          pinSpacing: true,
          invalidateOnRefresh: true
        })

        tl.progress(0)
        ScrollTrigger.refresh()
      }, root)
    }

    const start = () => {
      if (cancelled) return
      requestAnimationFrame(() => {
        if (cancelled) return
        build()
        ScrollTrigger.refresh()
      })
    }

    let cancelReady = () => {}
    if (isScrollLayoutReady()) start()
    else cancelReady = onScrollLayoutReady(start)

    const onResize = () => {
      if (resizeTimer) window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(() => {
        start()
      }, 200)
    }

    window.addEventListener('resize', onResize, { passive: true })

    return () => {
      cancelled = true
      cancelReady()
      if (resizeTimer) window.clearTimeout(resizeTimer)
      window.removeEventListener('resize', onResize)
      ctx?.revert()
    }
  }, [educationList, treeHeight])

  return (
    <div ref={rootRef} className={styles.edu}>
      <div className="container">
        <div className={styles.head}>
          <div className={styles.kicker}>{t('nav.education')}</div>
          <h2 className={styles.title}>{t('about.education')}</h2>
        </div>
      </div>

      <div ref={scrollRef} className={styles.treeScroll} data-edu-scroll>
        <div ref={pinRef} className={styles.treePin}>
          <div className="container">
            <div className={styles.treeStage} style={{ minHeight: `${treeHeight}px` }}>
              <svg
                className={styles.treeSvg}
                viewBox={`0 0 ${TREE_WIDTH} ${treeHeight}`}
                preserveAspectRatio="xMidYMin meet"
                aria-hidden="true"
              >
                <circle className={styles.treeRoot} cx={TREE_WIDTH / 2} cy={18} r={8} />
                <line
                  ref={trunkRef}
                  className={styles.treeTrunk}
                  x1={TREE_WIDTH / 2}
                  y1={TREE_TOP}
                  x2={TREE_WIDTH / 2}
                  y2={treeHeight - 32}
                />
                {branchLayout.map((branch, index) => (
                  <line
                    key={`branch-${index}`}
                    ref={(el) => {
                      branchRefs.current[index] = el
                    }}
                    className={styles.treeBranch}
                    x1={TREE_WIDTH / 2}
                    y1={branch.y}
                    x2={branch.x}
                    y2={branch.y}
                  />
                ))}
              </svg>

              <div className={styles.treeNodes}>
                {educationList.map((edu, index) => {
                  const branch = branchLayout[index]
                  return (
                    <div
                      key={`${edu.institution}-${index}`}
                      className={`${styles.nodeRow} ${branch.leftSide ? styles.nodeRowLeft : styles.nodeRowRight}`}
                    >
                      <article
                        ref={(el) => {
                          nodeRefs.current[index] = el
                        }}
                        className={styles.nodeCard}
                      >
                        <div className={styles.row}>
                          <div className={styles.degree}>{edu.degree}</div>
                          <div className={styles.period}>{edu.period}</div>
                        </div>
                        <div className={styles.institution}>{edu.institution}</div>
                        <div className={styles.desc}>
                          {edu.link ? (
                            <a href={edu.link} target="_blank" rel="noopener noreferrer">
                              {edu.description}
                            </a>
                          ) : (
                            edu.description
                          )}
                        </div>
                      </article>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
