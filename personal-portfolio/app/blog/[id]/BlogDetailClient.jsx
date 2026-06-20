'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CalendarIcon } from '@heroicons/react/24/outline'
import { marked } from 'marked'
import { useI18n } from '@/lib/i18n'
import { usePageTransition, scrollDetailToTop } from '@/lib/pageTransition'
import { fetchBlogPostById } from '@/lib/data'
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

export default function BlogDetailClient() {
  const params = useParams()
  const id = params.id
  const router = useRouter()
  const { t, lang } = useI18n()
  const { navigateWithTransition, setTransitionOrigin, setTransitionOriginFromElement } =
    usePageTransition()

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

  async function goBack(event) {
    if (event?.clientX != null) setTransitionOrigin(event.clientX, event.clientY)
    else setTransitionOriginFromElement(document.querySelector(`.${styles.closeFab}`))

    await navigateWithTransition('/', (path) => router.push(path, { scroll: false }))
  }

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
          <div className={`${styles.blogDetailContent} ${styles.detailEnter}`}>
            <button
              type="button"
              className={styles.closeFab}
              onClick={goBack}
              aria-label="关闭详情"
            >
              CLOSE
            </button>

            <article className={styles.blogArticle}>
              <header className={styles.articleHeader}>
                <h1 className={styles.articleTitle}>{post.title}</h1>
                <div className={styles.articleMeta}>
                  <span className={styles.articleDate}>
                    <CalendarIcon className={styles.articleDateIcon} />
                    {formatDate(post.date, lang)}
                  </span>
                  <span className={styles.articleCategory}>{post.category}</span>
                </div>
              </header>

              <div
                className={styles.articleContent}
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
                <button type="button" className={styles.backFooter} onClick={goBack}>
                  ← {t('blogDetail.back')}
                </button>
              </div>
            </article>
          </div>
        )}
      </div>
    </div>
  )
}
