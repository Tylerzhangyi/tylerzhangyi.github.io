<template>
  <section
    ref="section"
    :id="embedded ? 'section-blog' : undefined"
    data-scroll-section="blog"
    class="blog-scroll"
    :class="{ 'blog-scroll--standalone': !embedded }"
    :style="{ '--blog-count': String(posts.length) }"
  >
    <div class="blog-grid" aria-hidden="true">
      <div class="blog-grid__lines"></div>
    </div>

    <div v-if="loading || error" class="blog-scroll__state">
      {{ loading ? t('blog.loading') : error }}
    </div>

    <template v-else-if="posts.length">
      <div class="blog-scroll__title-row" aria-hidden="true"></div>

      <div class="blog-scroll__pin">
        <div class="blog-scroll__stage">
          <h2 ref="titleEl" class="blog-scroll__title">BLOG</h2>
          <div class="blog-scroll__layers">
            <article
              v-for="(post, index) in posts"
              :key="post.id"
              class="blog-card"
              :ref="(el) => setCardRef(el, index)"
            >
              <div class="blog-card__inner" :ref="(el) => setInnerRef(el, index)">
                <router-link :to="`/blog/${post.id}`" class="blog-card__link" data-cursor="read">
                  <div class="blog-card__media-wrap" :ref="(el) => setWrapRef(el, post.id)">
                    <div class="blog-card__media">
                      <img
                        :src="postImage(post)"
                        :alt="post.title"
                        loading="lazy"
                        draggable="false"
                      />
                    </div>
                    <CardCta :label="t('blog.readMore')" />
                  </div>
                  <div class="blog-card__meta">
                    <h3 class="blog-card__title">{{ post.title }}</h3>
                    <p class="blog-card__time">{{ readingTime(post) }} {{ t('blog.minRead') }}</p>
                  </div>
                </router-link>
              </div>
            </article>
          </div>
        </div>
      </div>

      <div ref="runway" class="blog-scroll__runway" aria-hidden="true"></div>
    </template>
  </section>
</template>

<script>
import { i18n, t as $t } from '../utils/i18n'
import { bindCtaFollow } from '../utils/cardCta.js'
import { bindScrollRaf } from '../utils/scrollRaf.js'
import CardCta from '../components/CardCta.vue'

const SHRINK_SCALE = 0.82
const ENTER_PORTION = 0.72
const ENTER_TRAVEL = 0.34
const SMOOTH = 0.16
const SMOOTH_FAST = 0.28
const BLOG_CARD_IMAGE = 'photos/blog.jpg'

const clamp = (v, min, max) => Math.min(max, Math.max(min, v))
const lerp = (a, b, t) => a + (b - a) * t
const easeInOut = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

function damp(current, target, rate = SMOOTH) {
  const d = target - current
  if (Math.abs(d) < 0.05) return target
  return current + d * rate
}

function pickFirstAndLast(posts) {
  if (!posts.length) return []
  if (posts.length === 1) return [posts[0]]
  return [posts[0], posts[posts.length - 1]]
}

export default {
  name: 'Blog',
  components: { CardCta },
  props: {
    embedded: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      posts: [],
      loading: true,
      error: null,
      cardRefs: [],
      innerRefs: [],
      cardMotion: [],
      titleMotion: { scale: 0.6, opacity: 0 },
      ctaCleanups: [],
      prefersReducedMotion: false,
      isMobile: false,
      unbindScroll: null
    }
  },
  computed: {
    __lang() {
      return i18n.lang
    },
    postIconSrc() {
      const base = import.meta.env.BASE_URL || '/'
      return `${base}${BLOG_CARD_IMAGE}`
    }
  },
  watch: {
    __lang() {
      this.fetchPosts()
    }
  },
  mounted() {
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    this.isMobile = window.matchMedia('(max-width: 809px)').matches
    this.onResize = () => {
      this.isMobile = window.matchMedia('(max-width: 809px)').matches
      this.cardMotion = []
      this.layoutRunway()
    }
    window.addEventListener('resize', this.onResize, { passive: true })
    this.unbindScroll = bindScrollRaf(this.update)
    this.fetchPosts()
  },
  beforeUnmount() {
    this.unbindScroll?.()
    window.removeEventListener('resize', this.onResize)
    this.ctaCleanups.forEach((fn) => fn?.())
    this.setBlogTheme(false)
  },
  methods: {
    t(key) {
      return $t(key)
    },
    setCardRef(el, index) {
      if (el) this.cardRefs[index] = el
    },
    setInnerRef(el, index) {
      if (el) this.innerRefs[index] = el
    },
    setWrapRef(el, id) {
      if (!el || el.dataset.ctaBound) return
      el.dataset.ctaBound = '1'
      this.$nextTick(() => {
        const cleanup = bindCtaFollow(el, { pad: 28 })
        if (cleanup) this.ctaCleanups.push(cleanup)
      })
    },
    hasPostImage() {
      return true
    },
    postImage() {
      const base = import.meta.env.BASE_URL || '/'
      return `${base}${BLOG_CARD_IMAGE}`
    },
    readingTime(post) {
      if (!post) return 1
      const text = `${post.title} ${post.excerpt || ''} ${post.content || ''}`
      const words = text.split(/\s+/).filter(Boolean).length
      return Math.max(1, Math.ceil(words / 180))
    },
    setBlogTheme(active) {
      document.body.classList.toggle('is-blog-active', active)
      if (active) {
        document.body.classList.remove('is-projects-active')
        document.body.classList.remove('is-links-active')
        document.body.classList.remove('is-links-entering')
        document.body.classList.remove('is-links-section')
      }
    },
    layoutRunway() {
      const runway = this.$refs.runway
      if (runway) runway.style.height = `${this.posts.length * 100}vh`
    },
    async fetchPosts() {
      this.loading = true
      this.error = null
      try {
        let res = await fetch(`${import.meta.env.BASE_URL}data/blog.${i18n.lang}.json`)
        if (!res.ok) res = await fetch(`${import.meta.env.BASE_URL}data/blog.json`)
        if (!res.ok) throw new Error($t('blog.loadError'))
        const data = await res.json()
        this.posts = pickFirstAndLast(data.posts || [])
        this.cardMotion = []
        this.titleMotion = { scale: 0.6, opacity: 0 }
      } catch (err) {
        this.error = err.message
        this.posts = []
      } finally {
        this.loading = false
        this.$nextTick(() => {
          this.layoutRunway()
          this.update()
        })
      }
    },
    initMotion(vh) {
      if (this.cardMotion.length === this.posts.length) return
      this.cardMotion = this.posts.map(() => ({ y: vh * 0.5, scale: 1 }))
    },
    applyCardTransform(inner, yPx, scale) {
      inner.style.transform = `translate3d(0, ${yPx}px, 0) scale(${scale})`
    },
    updateStack(vh, sectionRect) {
      const section = this.$refs.section
      const titleEl = this.$refs.titleEl
      if (!section) return

      this.initMotion(vh)
      const scrolled = clamp(-sectionRect.top, 0, section.offsetHeight - vh)

      if (this.prefersReducedMotion || this.isMobile) {
        if (titleEl) {
          titleEl.style.opacity = '1'
          titleEl.style.transform = 'translate(-50%, -50%) scale(1)'
        }
        this.innerRefs.forEach((inner, i) => {
          const card = this.cardRefs[i]
          if (!inner || !card) return
          this.applyCardTransform(inner, 0, 1)
          card.style.visibility = 'visible'
          card.style.pointerEvents = 'auto'
          card.style.zIndex = String(10 + i)
        })
        return
      }

      const titleTargetP = easeInOut(
        Math.max(clamp(1 - sectionRect.top / vh, 0, 1), clamp(scrolled / vh, 0, 1))
      )
      const titleTargetScale = lerp(0.6, 1, titleTargetP)
      this.titleMotion.opacity = damp(this.titleMotion.opacity, titleTargetP, SMOOTH)
      this.titleMotion.scale = damp(this.titleMotion.scale, titleTargetScale, SMOOTH)

      if (titleEl) {
        titleEl.style.opacity = String(this.titleMotion.opacity)
        titleEl.style.transform = `translate(-50%, -50%) scale(${this.titleMotion.scale})`
      }

      const cardScroll = scrolled - vh
      const count = this.posts.length

      this.posts.forEach((_, i) => {
        const card = this.cardRefs[i]
        const inner = this.innerRefs[i]
        const state = this.cardMotion[i]
        if (!card || !inner || !state) return

        let targetY = vh * 0.5
        let targetScale = 1
        let visible = false
        let rate = SMOOTH

        inner.style.opacity = '1'
        card.style.zIndex = String(10 + i)

        if (cardScroll >= 0) {
          const start = i * vh
          const local = (cardScroll - start) / vh

          if (local >= 0) {
            visible = true

            if (local >= 1) {
              targetY = 0
              targetScale = SHRINK_SCALE
            } else if (local < ENTER_PORTION) {
              const enterT = easeInOut(local / ENTER_PORTION)
              targetY = lerp(vh * ENTER_TRAVEL, 0, enterT)
              targetScale = 1
            } else {
              const shrinkT = easeInOut((local - ENTER_PORTION) / (1 - ENTER_PORTION))
              targetY = 0
              targetScale = i < count - 1 ? lerp(1, SHRINK_SCALE, shrinkT) : 1
            }
          }
        }

        if (!visible) {
          card.style.visibility = 'hidden'
          card.style.pointerEvents = 'none'
          targetY = vh * 0.55
          targetScale = 1
          rate = SMOOTH_FAST
        } else {
          card.style.visibility = 'visible'
          card.style.pointerEvents = 'auto'
        }

        state.y = damp(state.y, targetY, rate)
        state.scale = damp(state.scale, targetScale, rate)
        this.applyCardTransform(inner, state.y, state.scale)
      })
    },
    update() {
      const section = this.$refs.section
      if (!section || !this.posts.length) {
        this.setBlogTheme(false)
        return
      }

      this.isMobile = window.matchMedia('(max-width: 809px)').matches
      const vh = window.innerHeight
      const rect = section.getBoundingClientRect()
      const inBlog = rect.top < vh * 0.92 && rect.bottom > 0
      const nearBlog = rect.top < vh * 1.08 && rect.bottom > -vh * 0.08

      this.setBlogTheme(inBlog)
      if (nearBlog) {
        this.updateStack(vh, rect)
      } else if (this.titleMotion.opacity > 0.01 || this.titleMotion.scale > 0.61) {
        this.titleMotion = { scale: 0.6, opacity: 0 }
        const titleEl = this.$refs.titleEl
        if (titleEl) {
          titleEl.style.opacity = '0'
          titleEl.style.transform = 'translate(-50%, -50%) scale(0.6)'
        }
      }
    }
  }
}
</script>

<style scoped>
.blog-scroll--standalone {
  min-height: 100vh;
}
</style>
