<template>
  <section
    ref="section"
    id="section-tbi"
    data-scroll-section="tbi"
    class="tbi"
  >
    <div ref="bg" class="tbi__bg">
      <video
        ref="video"
        class="tbi__video"
        :src="videoSrc"
        :poster="posterSrc"
        muted
        loop
        playsinline
        autoplay
        preload="auto"
      />
      <img class="tbi__poster" :src="posterSrc" alt="" />
    </div>
    <div ref="content" class="tbi__content" :class="{ 'is-visible': contentVisible }">
      <div class="tbi__label">{{ t('tbi.label') }}</div>
      <p class="tbi__text">
        {{ t('tbi.line1') }}<br />
        {{ t('tbi.line2') }}
      </p>
      <div class="tbi__links">
        <a
          v-for="link in tbiLinks"
          :key="link.href"
          :href="link.href"
          class="tbi__link"
          :target="link.external ? '_blank' : undefined"
          :rel="link.external ? 'noopener noreferrer' : undefined"
        >
          {{ link.label }}
        </a>
      </div>
    </div>
  </section>
</template>

<script>
import { i18n, t as $t } from '../utils/i18n'
import { subscribeScroll } from '../utils/scrollLoop.js'

const clamp = (v, min, max) => Math.min(max, Math.max(min, v))

export default {
  name: 'TbiSection',
  data() {
    return {
      contentVisible: false,
      prefersReducedMotion: false,
      unbindLoop: null,
      contentObserver: null
    }
  },
  computed: {
    __lang() {
      return i18n.lang
    },
    videoSrc() {
      return `${import.meta.env.BASE_URL}videos/tbi-bg.mp4`
    },
    posterSrc() {
      return `${import.meta.env.BASE_URL}photos/tbi-poster.jpg`
    },
    tbiLinks() {
      return [
        { label: this.t('tbi.discover'), href: '#section-contact', external: false },
        { label: this.t('tbi.email'), href: 'mailto:Tyler.zhang.cn@hotmail.com', external: false },
        { label: this.t('tbi.github'), href: 'https://github.com/Tylerzhangyi', external: true }
      ]
    }
  },
  mounted() {
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    this.$nextTick(() => {
      this.unbindLoop = subscribeScroll(this.updateParallax, { root: this.$refs.section })
    })
    this.setupContentObserver()
    this.$refs.video?.play().catch(() => {
      const video = this.$refs.video
      if (video) video.style.display = 'none'
      const poster = this.$el?.querySelector('.tbi__poster')
      if (poster) poster.style.display = 'block'
    })
    if (this.prefersReducedMotion) {
      this.contentVisible = true
    }
  },
  beforeUnmount() {
    this.unbindLoop?.()
    this.contentObserver?.disconnect()
  },
  methods: {
    t(key) {
      return $t(key)
    },
    setupContentObserver() {
      const content = this.$refs.content
      if (!content || this.prefersReducedMotion) return

      this.contentObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.contentVisible = true
              this.contentObserver?.unobserve(entry.target)
            }
          })
        },
        { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
      )
      this.contentObserver.observe(content)
    },
    updateParallax() {
      const section = this.$refs.section
      const bg = this.$refs.bg
      if (!section || !bg) return

      const vh = window.innerHeight
      const rect = section.getBoundingClientRect()
      const inTbi = rect.top < vh * 0.92 && rect.bottom > 0
      if (inTbi) {
        document.body.classList.remove('is-blog-active')
        document.body.classList.remove('is-projects-active')
      }

      if (this.prefersReducedMotion) return
      const sectionCenter = rect.top + rect.height / 2
      const viewportCenter = window.innerHeight / 2
      const offset = (sectionCenter - viewportCenter) / window.innerHeight
      const scale = 1 + Math.abs(offset) * 0.08
      bg.style.transform = `scale(${scale}) translateY(${offset * -30}px)`
    }
  }
}
</script>
