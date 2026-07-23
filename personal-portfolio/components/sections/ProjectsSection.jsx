'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useI18n } from '@/lib/i18n'
import { resolveAssetUrl, handleImageError } from '@/lib/assets'
import { bindCtaFollow } from '@/lib/cardCta'
import { onScrollLayoutReady } from '@/lib/scrollLayout'
import { useMotionMode } from '@/lib/motionSystem/MotionRoot'
import { bindMagnetic } from '@/lib/motionSystem/primitives/magnetic'
import {
  bindSectionEnterWake,
  bindSectionLeaveChrome
} from '@/lib/motionSystem/primitives/sectionWake'
import { bindTiltCard } from '@/lib/motionSystem/primitives/tiltCard'
import DetailLink from '@/components/DetailLink'
import CardCta from '@/components/CardCta'
import mobileStyles from './projects-section.module.css'

const COLUMN_ALIGN = ['start', 'end', 'center', 'end']

function dataUrl(path) {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
  return `${base}/${path.replace(/^\//, '')}`
}

export default function ProjectsSection() {
  const { t, lang } = useI18n()
  const motionMode = useMotionMode()
  const sectionRef = useRef(null)
  const pinRef = useRef(null)
  const trackRef = useRef(null)

  const scrollTweenRef = useRef(null)
  const gsapCtxRef = useRef(null)
  const resizeTimerRef = useRef(null)
  const layoutRetryTimerRef = useRef(null)
  const ctaCleanupsRef = useRef([])
  const motionCleanupsRef = useRef([])
  const boundWrapsRef = useRef(new Set())

  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  const columnAlign = (index) => COLUMN_ALIGN[index % COLUMN_ALIGN.length]

  const projectTag = (project) => {
    if (project.technologies?.length) return project.technologies.slice(0, 2).join(' · ')
    return project.intro || ''
  }

  const setProjectsZone = useCallback((active) => {
    document.body.classList.toggle('is-projects-active', active)
  }, [])

  const isDesktop = useCallback(() => {
    return window.matchMedia('(min-width: 993px)').matches
  }, [])

  const clearCtaCleanups = useCallback(() => {
    ctaCleanupsRef.current.forEach((fn) => fn?.())
    ctaCleanupsRef.current = []
    boundWrapsRef.current.clear()
  }, [])

  const destroyHorizontalScroll = useCallback(() => {
    if (layoutRetryTimerRef.current) {
      window.clearTimeout(layoutRetryTimerRef.current)
      layoutRetryTimerRef.current = null
    }
    gsapCtxRef.current?.revert()
    gsapCtxRef.current = null
    scrollTweenRef.current = null
  }, [])

  const setupHorizontalScroll = useCallback(() => {
    if (!isDesktop() || !projects.length) {
      destroyHorizontalScroll()
      setProjectsZone(false)
      return
    }

    const section = sectionRef.current
    const pin = pinRef.current
    const track = trackRef.current
    if (!section || !pin || !track) return

    destroyHorizontalScroll()

    const distance = () => Math.max(0, Math.round(track.scrollWidth - pin.clientWidth))

    if (distance() < 1) {
      layoutRetryTimerRef.current = window.setTimeout(() => setupHorizontalScroll(), 120)
      return
    }

    gsap.set(track, { x: 0 })

    gsapCtxRef.current = gsap.context(() => {
      scrollTweenRef.current = gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          id: 'projects-horizontal-st',
          trigger: section,
          start: 'top top',
          end: () => `+=${Math.max(distance(), 1)}`,
          scrub: 1,
          pin,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onEnter: () => setProjectsZone(true),
          onEnterBack: () => setProjectsZone(true),
          onLeave: () => setProjectsZone(false),
          onLeaveBack: () => setProjectsZone(false)
        }
      })
    }, section)
  }, [destroyHorizontalScroll, isDesktop, projects.length, setProjectsZone])

  const queueHorizontalSetup = useCallback(() => {
    requestAnimationFrame(() => setupHorizontalScroll())
  }, [setupHorizontalScroll])

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    clearCtaCleanups()
    destroyHorizontalScroll()
    try {
      let res = await fetch(dataUrl(`data/projects.${lang}.json`))
      if (!res.ok) res = await fetch(dataUrl('data/projects.json'))
      if (!res.ok) throw new Error()
      const data = await res.json()
      setProjects(data.projects || [])
    } catch {
      setProjects([])
    } finally {
      setLoading(false)
      queueHorizontalSetup()
    }
  }, [lang, clearCtaCleanups, destroyHorizontalScroll, queueHorizontalSetup])

  const onResize = useCallback(() => {
    if (resizeTimerRef.current) window.clearTimeout(resizeTimerRef.current)
    resizeTimerRef.current = window.setTimeout(() => {
      destroyHorizontalScroll()
      queueHorizontalSetup()
    }, 160)
  }, [destroyHorizontalScroll, queueHorizontalSetup])

  const clearMotionCleanups = useCallback(() => {
    motionCleanupsRef.current.forEach((fn) => fn?.())
    motionCleanupsRef.current = []
  }, [])

  const bindWrapRef = useCallback((el) => {
    if (!el || boundWrapsRef.current.has(el)) return
    boundWrapsRef.current.add(el)
    requestAnimationFrame(() => {
      const ctaCleanup = bindCtaFollow(el, { pad: 28 })
      if (ctaCleanup) {
        ctaCleanupsRef.current.push(ctaCleanup)
      }
    })
  }, [])

  const onCardEnter = useCallback((event) => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    event.currentTarget?.classList.add('is-hover')
  }, [])

  const onCardLeave = useCallback((event) => {
    event.currentTarget?.classList.remove('is-hover')
  }, [])

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    fetchProjects()
    window.addEventListener('resize', onResize, { passive: true })

    return () => {
      window.removeEventListener('resize', onResize)
      if (resizeTimerRef.current) window.clearTimeout(resizeTimerRef.current)
      clearCtaCleanups()
      clearMotionCleanups()
      setProjectsZone(false)
      destroyHorizontalScroll()
    }
  }, [fetchProjects, onResize, clearCtaCleanups, clearMotionCleanups, setProjectsZone, destroyHorizontalScroll])

  useLayoutEffect(() => {
    if (!projects.length) return undefined
    const cancelReady = onScrollLayoutReady(() => queueHorizontalSetup())
    queueHorizontalSetup()
    return () => cancelReady()
  }, [projects.length, queueHorizontalSetup])

  useEffect(() => {
    clearMotionCleanups()
    if (motionMode !== 'desktopFull' || !projects.length) return undefined

    const section = sectionRef.current
    if (!section) return undefined

    const cleanups = []
    section.querySelectorAll('.project-card').forEach((card) => {
      cleanups.push(bindTiltCard(card))
    })
    section.querySelectorAll('.project-card__media-wrap').forEach((wrap) => {
      cleanups.push(bindMagnetic(wrap, { maxPull: 18 }))
    })

    const columns = Array.from(section.querySelectorAll('.projects-column'))
    const chrome = section.querySelector('.projects-grid')
    cleanups.push(bindSectionEnterWake(section, { targets: columns, mode: motionMode }))
    if (chrome) {
      cleanups.push(bindSectionLeaveChrome(section, { chrome, mode: motionMode }))
    }

    motionCleanupsRef.current = cleanups
    return () => clearMotionCleanups()
  }, [motionMode, projects.length, clearMotionCleanups])

  return (
    <section
      ref={sectionRef}
      id="section-projects"
      data-scroll-section="projects"
      data-motion="tilt,magnetic"
      className="projects-scroll"
    >
      <div className="projects-grid" aria-hidden="true">
        <div className="projects-grid__lines" />
      </div>

      {!projects.length && !loading && (
        <p className="projects-scroll__empty">{t('projects.loadError')}</p>
      )}

      {projects.length > 0 && (
        <div className="horizontal-wrapper">
          <div ref={pinRef} className={`projects-scroll__pin ${mobileStyles.projectsScrollPin}`}>
            <div className="projects-scroll__viewport">
              <div ref={trackRef} className={`projects-scroll__track ${mobileStyles.projectsScrollTrack}`}>
                {projects.map((project, index) => (
                  <div
                    key={project.id}
                    className={`projects-column ${mobileStyles.projectsColumn}`}
                    data-align={columnAlign(index)}
                  >
                    <article
                      className="project-card"
                      onMouseEnter={onCardEnter}
                      onMouseLeave={onCardLeave}
                    >
                      <DetailLink
                        href={`/projects/${project.id}`}
                        className="project-card__link"
                        data-cursor="view"
                      >
                        <div
                          className="project-card__media-wrap"
                          ref={bindWrapRef}
                        >
                          <div className="project-card__media">
                            <img
                              src={resolveAssetUrl(project.image)}
                              alt={project.name}
                              loading="lazy"
                              draggable={false}
                              onLoad={queueHorizontalSetup}
                              onError={handleImageError}
                            />
                            <div className="project-card__tint" aria-hidden="true" />
                          </div>
                          <CardCta label={t('projects.view')} />
                        </div>
                        <div className="project-card__meta">
                          <h3 className="project-card__title">{project.name}</h3>
                          <p className="project-card__tag">{projectTag(project)}</p>
                        </div>
                      </DetailLink>
                    </article>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
