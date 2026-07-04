'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { bindCtaFollow } from '@/lib/cardCta'
import { createBlogScroll } from '@/lib/blogScroll'
import DetailLink from '@/components/DetailLink'
import styles from './blog.module.css'

function dataUrl(path) {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
  return `${base}/${path.replace(/^\//, '')}`
}

export default function BlogSection({ embedded = true }) {
  const { t, lang } = useI18n()
  const sectionRef = useRef(null)
  const titleRef = useRef(null)
  const runwayRef = useRef(null)
  const cardRefsRef = useRef([])
  const innerRefsRef = useRef([])

  const blogScrollRef = useRef(null)
  const ctaCleanupsRef = useRef([])
  const boundWrapsRef = useRef(new Set())

  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const readingTime = useCallback((post) => {
    if (!post) return 1
    const text = `${post.title} ${post.excerpt || ''} ${post.content || ''}`
    const words = text.split(/\s+/).filter(Boolean).length
    return Math.max(1, Math.ceil(words / 180))
  }, [])

  const setBlogTheme = useCallback((active) => {
    document.body.classList.toggle('is-blog-active', active)
    if (active) {
      document.body.classList.remove('is-projects-active')
      document.body.classList.remove('is-links-active')
      document.body.classList.remove('is-links-entering')
      document.body.classList.remove('is-links-section')
    }
  }, [])

  const clearCtaCleanups = useCallback(() => {
    ctaCleanupsRef.current.forEach((fn) => fn?.())
    ctaCleanupsRef.current = []
    boundWrapsRef.current.clear()
  }, [])

  const destroyBlogScroll = useCallback(() => {
    blogScrollRef.current?.stop()
    blogScrollRef.current = null
  }, [])

  const setupBlogScroll = useCallback(() => {
    destroyBlogScroll()
    if (!posts.length) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    blogScrollRef.current = createBlogScroll({
      getSection: () => sectionRef.current,
      getTitleEl: () => titleRef.current,
      getRunway: () => runwayRef.current,
      getCount: () => posts.length,
      getCardEl: (index) => cardRefsRef.current[index],
      getInnerEl: (index) => innerRefsRef.current[index],
      onActiveChange: (active) => setBlogTheme(active),
      prefersReducedMotion
    })

    blogScrollRef.current.start()
  }, [destroyBlogScroll, posts.length, setBlogTheme])

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    setError(null)
    destroyBlogScroll()
    try {
      let res = await fetch(dataUrl(`data/blog.${lang}.json`))
      if (!res.ok) res = await fetch(dataUrl('data/blog.json'))
      if (!res.ok) throw new Error(t('blog.loadError'))
      const data = await res.json()
      setPosts(data.posts || [])
      cardRefsRef.current = []
      innerRefsRef.current = []
    } catch (err) {
      setError(err.message)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }, [lang, t, destroyBlogScroll])

  const bindWrapRef = useCallback((el) => {
    if (!el || boundWrapsRef.current.has(el)) return
    boundWrapsRef.current.add(el)
    requestAnimationFrame(() => {
      const cleanup = bindCtaFollow(el, { pad: 28 })
      if (cleanup) ctaCleanupsRef.current.push(cleanup)
    })
  }, [])

  const setCardRef = useCallback((el, index) => {
    if (el) cardRefsRef.current[index] = el
  }, [])

  const setInnerRef = useCallback((el, index) => {
    if (el) innerRefsRef.current[index] = el
  }, [])

  useEffect(() => {
    const onResize = () => blogScrollRef.current?.refresh()
    window.addEventListener('resize', onResize, { passive: true })
    fetchPosts()

    return () => {
      window.removeEventListener('resize', onResize)
      destroyBlogScroll()
      clearCtaCleanups()
      setBlogTheme(false)
    }
  }, [fetchPosts, destroyBlogScroll, clearCtaCleanups, setBlogTheme])

  useEffect(() => {
    if (!loading && posts.length) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setupBlogScroll())
      })
    }
  }, [loading, posts, setupBlogScroll])

  return (
    <section
      ref={sectionRef}
      id={embedded ? 'section-blog' : undefined}
      data-scroll-section="blog"
      className={`blog-scroll ${styles.blogSection}`}
      style={{
        '--blog-count': String(posts.length),
        ...(!embedded ? { minHeight: '100vh' } : {})
      }}
    >
      <div className={styles.blogGrid} aria-hidden="true">
        <div className={styles.blogGridLines} />
      </div>

      {(loading || error) && (
        <div className={styles.blogState}>
          {loading ? t('blog.loading') : error}
        </div>
      )}

      {!loading && !error && posts.length > 0 && (
        <>
          <div className={styles.blogTitleRow} aria-hidden="true" />

          <div className={styles.blogPin} data-nav-anchor="blog-pin">
            <div className={styles.blogStage}>
              <header ref={titleRef} className={styles.blogHeader}>
                <h2 className={styles.blogTitle}>{t('nav.blog')}</h2>
              </header>

              <div className={styles.blogDeck}>
                {posts.map((post, index) => (
                  <article
                    key={post.id}
                    className={styles.blogCard}
                    ref={(el) => setCardRef(el, index)}
                  >
                    <div
                      className={styles.blogCardInner}
                      ref={(el) => setInnerRef(el, index)}
                    >
                      <DetailLink
                        href={`/blog/${post.id}`}
                        className={`blog-card__link ${styles.blogCardLink}`}
                        data-cursor="read"
                      >
                        <div className={styles.blogPoster} ref={bindWrapRef}>
                          <div className={styles.blogPosterMedia} aria-hidden="true" />
                          <div className={styles.blogPosterShade} aria-hidden="true" />
                          <div className={styles.blogPosterBody}>
                            <span className={styles.blogPosterIndex}>
                              {String(index + 1).padStart(2, '0')}
                            </span>
                            <h3 className={styles.blogPosterTitle}>{post.title}</h3>
                            {post.excerpt ? (
                              <p className={styles.blogPosterExcerpt}>{post.excerpt}</p>
                            ) : null}
                            <div className={styles.blogPosterMeta}>
                              <span className={styles.blogPosterTime}>
                                {readingTime(post)} {t('blog.minRead')}
                              </span>
                              {post.category ? (
                                <span className={styles.blogPosterTag}>{post.category}</span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </DetailLink>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div ref={runwayRef} className={styles.blogRunway} aria-hidden="true" />
        </>
      )}
    </section>
  )
}
