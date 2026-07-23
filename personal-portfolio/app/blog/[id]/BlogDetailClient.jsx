'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeftIcon, CalendarIcon, ClockIcon } from '@heroicons/react/24/outline'
import { marked } from 'marked'
import { useI18n } from '@/lib/i18n'
import { getDetailReturnHref, usePageTransition, scrollDetailToTop } from '@/lib/pageTransition'
import { resolveAssetUrl, handleImageError } from '@/lib/assets'
import { fetchBlogPostById } from '@/lib/data'
import { useMotionMode } from '@/lib/motionSystem/MotionRoot'
import { bindMagnetic } from '@/lib/motionSystem/primitives/magnetic'
import { bindDetailPageMotion } from '@/lib/motionSystem/primitives/splitReveal'
import styles from '@/components/pages/blog-detail.module.css'

marked.setOptions({
  breaks: true,
  gfm: true
})

function formatDate(dateString, lang) {
  const date = new Date(dateString)
  const locale = lang === 'zh' ? 'zh-CN' : 'en-US'
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function formatMarkdownContent(content) {
  if (!content) return ''

  try {
    let normalized = content.replace(/\\n/g, '\n')
    let html = marked.parse(normalized)
    const base = process.env.NEXT_PUBLIC_BASE_PATH || ''

    html = html.replace(/<img([^>]*?)src="(\/[^"]+)"([^>]*?)>/g, (match, before, src, after) => {
      if (src.startsWith('/') && !src.startsWith('//')) {
        const cleanSrc = src.replace(/^\//, '')
        return `<img${before}src="${base}/${cleanSrc}"${after}>`
      }
      return match
    })

    return html
  } catch (error) {
    console.error('Markdown parsing error:', error)
    return content.replace(/\\n/g, '\n')
  }
}

function readingTime(post) {
  if (!post) return 1
  const text = `${post.title} ${post.excerpt || ''} ${post.content || ''}`
  const words = text.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 180))
}

export default function BlogDetailClient() {
  const params = useParams()
  const id = params.id
  const router = useRouter()
  const { t, lang } = useI18n()
  const motionMode = useMotionMode()
  const { navigateWithTransition, setTransitionOrigin, setTransitionOriginFromElement } =
    usePageTransition()

  const closeFabRef = useRef(null)
  const backFooterRef = useRef(null)
  const contentRef = useRef(null)

  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadPost = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchBlogPostById(id, lang)
      setPost(data)
    } catch (err) {
      setPost(null)
      setError(err.code === 'NOT_FOUND' ? t('blogDetail.notFound') : t('blogDetail.loadError'))
    } finally {
      setLoading(false)
    }
  }, [id, lang, t])

  useEffect(() => {
    scrollDetailToTop()
    loadPost()
  }, [loadPost])

  const formattedContent = useMemo(
    () => (post?.content ? formatMarkdownContent(post.content) : ''),
    [post]
  )

  useEffect(() => {
    if (loading || error || !post || !contentRef.current) return undefined

    const cleanups = [bindDetailPageMotion(contentRef.current, motionMode)]

    if (motionMode === 'desktopFull') {
      if (closeFabRef.current) cleanups.push(bindMagnetic(closeFabRef.current))
      if (backFooterRef.current) cleanups.push(bindMagnetic(backFooterRef.current))
    }

    return () => {
      cleanups.forEach((fn) => fn?.())
    }
  }, [loading, error, post, motionMode, formattedContent])

  async function goBack(event) {
    if (event?.clientX != null) setTransitionOrigin(event.clientX, event.clientY)
    else setTransitionOriginFromElement(document.querySelector(`.${styles.closeFab}`))

    await navigateWithTransition(getDetailReturnHref('blog'), (path) => router.push(path, { scroll: false }))
  }

  const contentClassName =
    motionMode === 'reduced'
      ? `${styles.blogDetailContent} ${styles.detailEnter}`
      : styles.blogDetailContent

  return (
    <div className={`page ${styles.blogDetail}`}>
      <div className="container">
        {loading && (
          <div className={`${styles.loading} ${styles.loadingShell}`}>
            <div className={styles.blogDetailContent}>
              <div className={`${styles.skeletonLine} ${styles.skeletonLineWSm}`} />
              <article className={styles.blogArticle}>
                <div className={`${styles.skeletonLine} ${styles.skeletonLineWLg}`} />
                <div className={`${styles.skeletonLine} ${styles.skeletonLineWMd}`} />
                <div className={styles.skeletonBlock} />
              </article>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className={styles.error}>
            <p>{error}</p>
            <button type="button" className="btn btn-primary" onClick={() => goBack()}>
              {t('blogDetail.back')}
            </button>
          </div>
        )}

        {!loading && !error && post && (
          <>
            <button
              ref={closeFabRef}
              type="button"
              className={styles.closeFab}
              data-motion="magnetic,cursor-target"
              data-cursor="back"
              onClick={goBack}
              aria-label="关闭详情"
            >
              <ArrowLeftIcon className={styles.closeIcon} />
              <span>{t('blogDetail.back')}</span>
            </button>

            <div ref={contentRef} className={contentClassName}>
            <article className={styles.blogArticle}>
              <header className={styles.articleHeader}>
                <div className={styles.headerCopy}>
                  <p className={styles.eyebrow}>Blog / {post.category}</p>
                  <h1 className={styles.articleTitle} data-split="words">
                    {post.title}
                  </h1>
                  {post.excerpt && <p className={styles.articleExcerpt}>{post.excerpt}</p>}
                  <div className={styles.articleMeta}>
                    <span className={styles.articleDate}>
                      <CalendarIcon className={styles.articleDateIcon} />
                      {formatDate(post.date, lang)}
                    </span>
                    <span className={styles.articleDate}>
                      <ClockIcon className={styles.articleDateIcon} />
                      {readingTime(post)} {t('blog.minRead')}
                    </span>
                    <span className={styles.articleCategory}>{post.category}</span>
                  </div>
                </div>
                <div className={styles.coverFrame} aria-hidden="true">
                  <img src={resolveAssetUrl('photos/blog.jpg')} alt="" draggable={false} onError={handleImageError} />
                </div>
              </header>

              <div
                className={styles.articleContent}
                data-motion="split"
                dangerouslySetInnerHTML={{ __html: formattedContent }}
              />

              {post.tags?.length > 0 && (
                <footer className={styles.articleFooter}>
                  <div className={styles.articleTags}>
                    {post.tags.map((tag) => (
                      <span key={tag} className={styles.tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </footer>
              )}

              <div className={styles.articleBackWrap}>
                <button
                  ref={backFooterRef}
                  type="button"
                  className={styles.backFooter}
                  data-motion="magnetic,cursor-target"
                  data-cursor="back"
                  onClick={goBack}
                >
                  <ArrowLeftIcon className={styles.footerIcon} />
                  {t('blogDetail.back')}
                </button>
              </div>
            </article>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
