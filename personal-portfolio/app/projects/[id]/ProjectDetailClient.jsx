'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeftIcon, CubeIcon, RocketLaunchIcon } from '@heroicons/react/24/outline'
import { useI18n } from '@/lib/i18n'
import { usePageTransition, scrollDetailToTop } from '@/lib/pageTransition'
import { resolveAssetUrl, handleImageError as onImageError } from '@/lib/assets'
import { fetchProjectById } from '@/lib/data'
import { useMotionMode } from '@/lib/motionSystem/MotionRoot'
import styles from '@/components/pages/project-detail.module.css'

function homeHref() {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
  return base ? `${base}/` : '/'
}

export default function ProjectDetailClient() {
  const params = useParams()
  const id = params.id
  const router = useRouter()
  const { t, lang } = useI18n()
  const motionMode = useMotionMode()
  const { navigateWithTransition, setTransitionOrigin, setTransitionOriginFromElement } =
    usePageTransition()

  const closeFabRef = useRef(null)

  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadProject = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchProjectById(id, lang)
      setProject(data)
    } catch (err) {
      setProject(null)
      setError(err.code === 'NOT_FOUND' ? t('projectDetail.notFound') : t('projectDetail.loadError'))
    } finally {
      setLoading(false)
    }
  }, [id, lang, t])

  useEffect(() => {
    scrollDetailToTop()
    loadProject()
  }, [loadProject])

  async function goBack(event) {
    if (event?.clientX != null) setTransitionOrigin(event.clientX, event.clientY)
    else setTransitionOriginFromElement(closeFabRef.current)

    const target = homeHref()
    try {
      await navigateWithTransition(target, (path) => router.push(path, { scroll: false }), {
        preferSection: 'projects'
      })
    } catch {
      window.location.assign(target)
      return
    }

    // Soft nav can leave URL/view out of sync — hard-exit if still on a detail path.
    if (typeof window !== 'undefined' && /\/projects\/[^/]+/.test(window.location.pathname)) {
      window.location.assign(target)
    }
  }

  const contentClassName =
    motionMode === 'reduced'
      ? `${styles.projectDetailContent} detail-enter`
      : styles.projectDetailContent

  return (
    <div className={`page ${styles.projectDetail}`}>
      <div className="container">
        {loading && (
          <div className={styles.loading}>
            <p>{t('projectDetail.loading')}</p>
          </div>
        )}

        {!loading && error && (
          <div className={styles.error}>
            <p>{error}</p>
            <button type="button" className="btn btn-primary" onClick={() => goBack()}>
              {t('projectDetail.back')}
            </button>
          </div>
        )}

        {!loading && !error && project && (
          <>
            <button
              ref={closeFabRef}
              type="button"
              className={styles.closeFab}
              onClick={goBack}
              aria-label="关闭详情"
            >
              <ArrowLeftIcon className={styles.closeIcon} />
              <span>{t('projectDetail.back')}</span>
            </button>

            <div className={contentClassName}>
              <header className={styles.projectHero}>
                <div className={styles.heroCopy}>
                  <p className={styles.eyebrow}>Project / {String(project.id).padStart(2, '0')}</p>
                  <h1 className={styles.projectTitle}>{project.name}</h1>
                  <p className={styles.heroIntro}>{project.intro}</p>
                  <div className={styles.heroActions}>
                    {project.demo && (
                      <a
                        href={project.demo}
                        target="_blank"
                        rel="noreferrer"
                        className={`${styles.projectLink} ${styles.projectLinkDemo}`}
                      >
                        <RocketLaunchIcon className={styles.iconInline} />
                        {t('projectDetail.demo')}
                      </a>
                    )}
                    {project.github && (
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noreferrer"
                        className={`${styles.projectLink} ${styles.projectLinkGithub}`}
                      >
                        <CubeIcon className={styles.iconInline} />
                        {t('projectDetail.github')}
                      </a>
                    )}
                  </div>
                </div>

                <div className={styles.projectImageLarge}>
                  <img
                    src={resolveAssetUrl(project.image) || '/photos/placeholder.jpg'}
                    alt={project.name}
                    onError={onImageError}
                  />
                </div>
              </header>

              <div className={styles.detailGrid}>
                <aside className={styles.sidePanel}>
                  <div className={styles.panelBlock}>
                    <p className={styles.panelLabel}>{t('projectDetail.tech')}</p>
                    <div className={styles.techList}>
                      {project.technologies?.map((tech) => (
                        <span key={tech} className={styles.techTagLarge}>
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className={styles.panelBlock}>
                    <p className={styles.panelLabel}>{t('projectDetail.links')}</p>
                    <div className={styles.projectLinks}>
                      {project.demo && (
                        <a href={project.demo} target="_blank" rel="noreferrer" className={styles.panelLink}>
                          <RocketLaunchIcon className={styles.iconInline} />
                          {t('projectDetail.demo')}
                        </a>
                      )}
                      {project.github && (
                        <a href={project.github} target="_blank" rel="noreferrer" className={styles.panelLink}>
                          <CubeIcon className={styles.iconInline} />
                          {t('projectDetail.github')}
                        </a>
                      )}
                    </div>
                  </div>
                </aside>

                <div className={styles.mainColumn}>
                  <section className={styles.contentSection}>
                    <h2 className={styles.sectionHeading}>{t('projectDetail.intro')}</h2>
                    <p className={styles.introText}>{project.intro}</p>
                  </section>

                  {project.description && (
                    <section className={styles.contentSection}>
                      <h2 className={styles.sectionHeading}>{t('projectDetail.description')}</h2>
                      <p className={styles.descriptionText}>{project.description}</p>
                    </section>
                  )}
                </div>
              </div>

              {project.screenshots?.length > 0 && (
                <section className={`${styles.contentSection} ${styles.screenshotSection}`}>
                  <h2 className={styles.sectionHeading}>{t('projectDetail.screenshots')}</h2>
                  <div className={styles.screenshotsGrid}>
                    {project.screenshots.map((screenshot, index) => (
                      <img
                        key={screenshot}
                        src={resolveAssetUrl(screenshot)}
                        alt={`${t('projectDetail.screenshot')} ${index + 1}`}
                        onError={onImageError}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
