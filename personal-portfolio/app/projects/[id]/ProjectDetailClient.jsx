'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CubeIcon, RocketLaunchIcon } from '@heroicons/react/24/outline'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)
import { useI18n } from '@/lib/i18n'
import { usePageTransition, scrollDetailToTop } from '@/lib/pageTransition'
import { resolveAssetUrl } from '@/lib/assets'
import { fetchProjectById } from '@/lib/data'
import styles from '@/components/pages/project-detail.module.css'

const PLACEHOLDER_SVG =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400"%3E%3Crect fill="%23e0e0e0" width="800" height="400"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="24" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E暂无图片%3C/text%3E%3C/svg%3E'

export default function ProjectDetailClient() {
  const params = useParams()
  const id = params.id
  const router = useRouter()
  const { t, lang } = useI18n()
  const { navigateWithTransition, setTransitionOrigin, setTransitionOriginFromElement } =
    usePageTransition()

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
    else setTransitionOriginFromElement(document.querySelector(`.${styles.closeFab}`))

    await navigateWithTransition('/', (path) => router.push(path, { scroll: false }))

    window.setTimeout(() => {
      ScrollTrigger.refresh()
    }, 200)
  }

  function handleImageError(event) {
    event.currentTarget.src = PLACEHOLDER_SVG
  }

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
          <div className={`${styles.projectDetailContent} detail-enter`}>
            <button
              type="button"
              className={styles.closeFab}
              onClick={goBack}
              aria-label="关闭详情"
            >
              CLOSE
            </button>

            <h1 className={styles.projectTitle}>{project.name}</h1>

            <div className={styles.projectHeader}>
              <div className={styles.projectImageLarge}>
                <img
                  src={resolveAssetUrl(project.image) || '/photos/placeholder.jpg'}
                  alt={project.name}
                  onError={handleImageError}
                />
              </div>
            </div>

            <div className={styles.contentSection}>
              <h2 className={styles.sectionHeading}>{t('projectDetail.intro')}</h2>
              <p className={styles.introText}>{project.intro}</p>
            </div>

            <div className={styles.contentSection}>
              <h2 className={styles.sectionHeading}>{t('projectDetail.tech')}</h2>
              <div className={styles.techList}>
                {project.technologies?.map((tech) => (
                  <span key={tech} className={styles.techTagLarge}>
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {project.description && (
              <div className={styles.contentSection}>
                <h2 className={styles.sectionHeading}>{t('projectDetail.description')}</h2>
                <p className={styles.descriptionText}>{project.description}</p>
              </div>
            )}

            <div className={styles.contentSection}>
              <h2 className={styles.sectionHeading}>{t('projectDetail.links')}</h2>
              <div className={styles.projectLinks}>
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
              </div>
            </div>

            {project.screenshots?.length > 0 && (
              <div className={styles.contentSection}>
                <h2 className={styles.sectionHeading}>{t('projectDetail.screenshots')}</h2>
                <div className={styles.screenshotsGrid}>
                  {project.screenshots.map((screenshot, index) => (
                    <img
                      key={screenshot}
                      src={resolveAssetUrl(screenshot)}
                      alt={`${t('projectDetail.screenshot')} ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
