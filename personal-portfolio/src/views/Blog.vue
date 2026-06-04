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
import { createBlogScroll } from '../utils/blogScroll.js'
import CardCta from '../components/CardCta.vue'

const BLOG_CARD_IMAGE = 'photos/blog.jpg'

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
      ctaCleanups: [],
      blogScroll: null,
      prefersReducedMotion: false
    }
  },
  computed: {
    __lang() {
      return i18n.lang
    }
  },
  watch: {
    __lang() {
      this.fetchPosts()
    }
  },
  mounted() {
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    this.onResize = () => this.blogScroll?.refresh()
    window.addEventListener('resize', this.onResize, { passive: true })
    this.fetchPosts()
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.onResize)
    this.destroyBlogScroll()
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
    destroyBlogScroll() {
      this.blogScroll?.stop()
      this.blogScroll = null
    },
    setupBlogScroll() {
      this.destroyBlogScroll()
      if (!this.posts.length) return

      this.blogScroll = createBlogScroll({
        getSection: () => this.$refs.section,
        getTitleEl: () => this.$refs.titleEl,
        getRunway: () => this.$refs.runway,
        getCount: () => this.posts.length,
        getCardEl: (index) => this.cardRefs[index],
        getInnerEl: (index) => this.innerRefs[index],
        onActiveChange: (active) => this.setBlogTheme(active),
        prefersReducedMotion: this.prefersReducedMotion
      })

      this.blogScroll.start()
    },
    async fetchPosts() {
      this.loading = true
      this.error = null
      this.destroyBlogScroll()
      try {
        let res = await fetch(`${import.meta.env.BASE_URL}data/blog.${i18n.lang}.json`)
        if (!res.ok) res = await fetch(`${import.meta.env.BASE_URL}data/blog.json`)
        if (!res.ok) throw new Error($t('blog.loadError'))
        const data = await res.json()
        this.posts = data.posts || []
        this.cardRefs = []
        this.innerRefs = []
      } catch (err) {
        this.error = err.message
        this.posts = []
      } finally {
        this.loading = false
        this.$nextTick(() => {
          this.$nextTick(() => this.setupBlogScroll())
        })
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
