'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useI18n } from '@/lib/i18n'
import { resolveAssetUrl } from '@/lib/assets'
import { bindCtaFollow } from '@/lib/cardCta'
import { onScrollLayoutReady } from '@/lib/scrollLayout'
import DetailLink from '@/components/DetailLink'
import CardCta from '@/components/CardCta'
import mobileStyles from './projects-section.module.css'

const COLUMN_ALIGN = ['start', 'end', 'center', 'end']
const HOVER_IMAGE = 'photos/article.jpg'

function dataUrl(path) {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
  return `${base}/${path.replace(/^\//, '')}`
}

export default function ProjectsSection() {
  const { t, lang } = useI18n()
  const sectionRef = useRef(null)
  const pinRef = useRef(null)
  const trackRef = useRef(null)

  const scrollTweenRef = useRef(null)
  const gsapCtxRef = useRef(null)
  const resizeTimerRef = useRef(null)
  const layoutRetryTimerRef = useRef(null)
  const ctaCleanupsRef = useRef([])
  const boundWrapsRef = useRef(new Set())
  const videoRefsRef = useRef(new Map())

  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  const hoverImageSrc = resolveAssetUrl(HOVER_IMAGE)

  const columnAlign = (index) => COLUMN_ALIGN[index % COLUMN_ALIGN.length]

  const projectTag = (project) => {
    if (project.technologies?.length) return project.technologies.slice(0, 2).join(' · ')
    return project.intro || ''
  }

  const setProjectsZone = useCallback((active) => {
    document.body.classList.toggle('is-projects-active', active)
  }, [])

  const isDesktop = useCallback(() => {
    return window.matchMedia('(min-width: 900px)').matches
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

  const bindWrapRef = useCallback((el) => {
    if (!el || boundWrapsRef.current.has(el)) return
    boundWrapsRef.current.add(el)
    requestAnimationFrame(() => {
      const cleanup = bindCtaFollow(el, { pad: 28 })
      if (cleanup) ctaCleanupsRef.current.push(cleanup)
    })
  }, [])

  const setVideoRef = useCallback((id, el) => {
    if (el) videoRefsRef.current.set(id, el)
    else videoRefsRef.current.delete(id)
  }, [])

  const onCardEnter = useCallback((event, project) => {
    event.currentTarget?.classList.add('is-hover')
    const video = videoRefsRef.current.get(project.id)
    video?.play().catch(() => {})
  }, [])

  const onCardLeave = useCallback((event, project) => {
    event.currentTarget?.classList.remove('is-hover')
    const video = videoRefsRef.current.get(project.id)
    if (video) {
      video.pause()
      video.currentTime = 0
    }
  }, [])

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    fetchProjects()
    window.addEventListener('resize', onResize, { passive: true })

    return () => {
      window.removeEventListener('resize', onResize)
      if (resizeTimerRef.current) window.clearTimeout(resizeTimerRef.current)
      clearCtaCleanups()
      setProjectsZone(false)
      destroyHorizontalScroll()
    }
  }, [fetchProjects, onResize, clearCtaCleanups, setProjectsZone, destroyHorizontalScroll])

  useLayoutEffect(() => {
    if (!projects.length) return undefined
    const cancelReady = onScrollLayoutReady(() => queueHorizontalSetup())
    queueHorizontalSetup()
    return () => cancelReady()
  }, [projects.length, queueHorizontalSetup])

  return (
    <section
      ref={sectionRef}
      id="section-projects"
      data-scroll-section="projects"
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
                      onMouseEnter={(e) => onCardEnter(e, project)}
                      onMouseLeave={(e) => onCardLeave(e, project)}
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
                            />
                            <img
                              className="project-card__hover-img"
                              src={hoverImageSrc}
                              alt=""
                              aria-hidden="true"
                              loading="lazy"
                              draggable={false}
                            />
                            {project.video && (
                              <video
                                className="project-card__video"
                                src={resolveAssetUrl(project.video)}
                                muted
                                loop
                                playsInline
                                preload="none"
                                ref={(el) => setVideoRef(project.id, el)}
                              />
                            )}
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
