<template>
  <section
    id="section-projects"
    data-scroll-section="projects"
    class="projects-scroll"
  >
    <div class="projects-grid" aria-hidden="true">
      <div class="projects-grid__lines"></div>
    </div>

    <p v-if="!projects.length && !loading" class="projects-scroll__empty">
      {{ t('projects.loadError') }}
    </p>

    <div v-else ref="wrap" class="horizontal-wrapper">
      <div ref="pin" class="projects-scroll__pin">
        <div class="projects-scroll__viewport">
          <div ref="track" class="projects-scroll__track">
            <div
              v-for="(project, index) in projects"
              :key="project.id"
              class="projects-column"
              :data-align="columnAlign(index)"
            >
              <article
                class="project-card"
                @mouseenter="onCardEnter($event, project)"
                @mouseleave="onCardLeave($event, project)"
              >
                <router-link :to="`/projects/${project.id}`" class="project-card__link" data-cursor="view">
                  <div class="project-card__media-wrap" :ref="(el) => setWrapRef(el, project.id)">
                    <div class="project-card__media">
                      <img
                        :src="resolveAssetUrl(project.image)"
                        :alt="project.name"
                        loading="lazy"
                        draggable="false"
                        @load="onImageLoad"
                      />
                      <img
                        class="project-card__hover-img"
                        :src="hoverImageSrc"
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                        draggable="false"
                      />
                      <video
                        v-if="project.video"
                        class="project-card__video"
                        :src="resolveAssetUrl(project.video)"
                        muted
                        loop
                        playsinline
                        preload="none"
                        :ref="(el) => setVideoRef(el, project.id)"
                      />
                    </div>
                    <CardCta :label="t('projects.view')" />
                  </div>
                  <div class="project-card__meta">
                    <h3 class="project-card__title">{{ project.name }}</h3>
                    <p class="project-card__tag">{{ projectTag(project) }}</p>
                  </div>
                </router-link>
              </article>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { i18n, t as $t } from '../utils/i18n'
import { bindCtaFollow } from '../utils/cardCta.js'
import CardCta from '../components/CardCta.vue'

const COLUMN_ALIGN = ['start', 'end', 'center', 'end']
const HOVER_IMAGE = 'photos/article.jpg'

export default {
  name: 'ProjectsSection',
  components: { CardCta },
  data() {
    return {
      projects: [],
      loading: true,
      scrollTween: null,
      resizeTimer: null,
      layoutRetryTimer: null,
      ctaCleanups: [],
      videoRefs: new Map()
    }
  },
  computed: {
    __lang() {
      return i18n.lang
    },
    hoverImageSrc() {
      return this.resolveAssetUrl(HOVER_IMAGE)
    }
  },
  watch: {
    __lang() {
      this.fetchProjects()
    }
  },
  mounted() {
    gsap.registerPlugin(ScrollTrigger)
    this.fetchProjects()
    window.addEventListener('resize', this.onResize, { passive: true })
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.onResize)
    if (this.resizeTimer) window.clearTimeout(this.resizeTimer)
    if (this.layoutRetryTimer) window.clearTimeout(this.layoutRetryTimer)
    this.ctaCleanups.forEach((fn) => fn?.())
    this.setProjectsZone(false)
    this.destroyHorizontalScroll()
  },
  methods: {
    t(key) {
      return $t(key)
    },
    columnAlign(index) {
      return COLUMN_ALIGN[index % COLUMN_ALIGN.length]
    },
    resolveAssetUrl(path) {
      if (!path) return ''
      if (/^https?:\/\//.test(path)) return path
      const base = import.meta.env.BASE_URL || '/'
      return `${base}${path.replace(/^\//, '')}`
    },
    projectTag(project) {
      if (project.technologies?.length) return project.technologies.slice(0, 2).join(' · ')
      return project.intro || ''
    },
    setWrapRef(el, id) {
      if (!el || el.dataset.ctaBound) return
      el.dataset.ctaBound = '1'
      this.$nextTick(() => {
        const cleanup = bindCtaFollow(el, { pad: 28 })
        if (cleanup) this.ctaCleanups.push(cleanup)
      })
    },
    setVideoRef(el, id) {
      if (el) this.videoRefs.set(id, el)
      else this.videoRefs.delete(id)
    },
    setProjectsZone(active) {
      document.body.classList.toggle('is-projects-active', active)
    },
    isDesktop() {
      return window.matchMedia('(min-width: 900px)').matches
    },
    onResize() {
      if (this.resizeTimer) window.clearTimeout(this.resizeTimer)
      this.resizeTimer = window.setTimeout(() => {
        this.destroyHorizontalScroll()
        this.queueHorizontalSetup()
      }, 160)
    },
    queueHorizontalSetup() {
      this.$nextTick(() => {
        requestAnimationFrame(() => this.setupHorizontalScroll())
      })
    },
    destroyHorizontalScroll() {
      if (this.scrollTween) {
        this.scrollTween.scrollTrigger?.kill(true)
        this.scrollTween.kill()
        this.scrollTween = null
      }
      ScrollTrigger.getAll()
        .filter((st) => st.vars?.id === 'projects-horizontal-st')
        .forEach((st) => st.kill(true))
      const pin = this.$refs.pin
      const track = this.$refs.track
      if (pin) gsap.set(pin, { clearProps: 'all' })
      if (track) gsap.set(track, { clearProps: 'all' })
    },
    setupHorizontalScroll() {
      if (!this.isDesktop() || !this.projects.length) {
        this.destroyHorizontalScroll()
        this.setProjectsZone(false)
        return
      }

      const pin = this.$refs.pin
      const track = this.$refs.track
      if (!pin || !track) return

      this.destroyHorizontalScroll()

      const section = document.getElementById('section-projects')
      const distance = () => Math.max(0, Math.round(track.scrollWidth - pin.clientWidth))

      if (distance() < 1) {
        if (this.layoutRetryTimer) window.clearTimeout(this.layoutRetryTimer)
        this.layoutRetryTimer = window.setTimeout(() => this.setupHorizontalScroll(), 120)
        return
      }

      gsap.set(track, { x: 0 })

      this.scrollTween = gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          id: 'projects-horizontal-st',
          trigger: section || pin,
          start: 'top top',
          end: () => `+=${Math.max(distance(), 1)}`,
          scrub: 1,
          pin,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onEnter: () => this.setProjectsZone(true),
          onEnterBack: () => this.setProjectsZone(true),
          onLeave: () => this.setProjectsZone(false),
          onLeaveBack: () => this.setProjectsZone(false)
        }
      })

      ScrollTrigger.refresh(true)
    },
    async fetchProjects() {
      this.loading = true
      this.ctaCleanups.forEach((fn) => fn?.())
      this.ctaCleanups = []
      this.destroyHorizontalScroll()
      try {
        let res = await fetch(`${import.meta.env.BASE_URL}data/projects.${i18n.lang}.json`)
        if (!res.ok) res = await fetch(`${import.meta.env.BASE_URL}data/projects.json`)
        if (!res.ok) throw new Error()
        const data = await res.json()
        this.projects = data.projects || []
      } catch {
        this.projects = []
      } finally {
        this.loading = false
        this.queueHorizontalSetup()
      }
    },
    onImageLoad() {
      this.queueHorizontalSetup()
    },
    onCardEnter(event, project) {
      event.currentTarget?.classList.add('is-hover')
      const video = this.videoRefs.get(project.id)
      video?.play().catch(() => {})
    },
    onCardLeave(event, project) {
      event.currentTarget?.classList.remove('is-hover')
      const video = this.videoRefs.get(project.id)
      if (video) {
        video.pause()
        video.currentTime = 0
      }
    }
  }
}
</script>

<style scoped>
.horizontal-wrapper {
  position: relative;
  width: 100%;
}

@media (max-width: 992px) {
  .projects-scroll__pin {
    position: relative !important;
    height: auto !important;
    overflow: visible !important;
  }

  :deep(.projects-scroll__track) {
    flex-direction: column;
    transform: none !important;
    height: auto;
  }

  :deep(.projects-column) {
    flex: none;
    width: 100%;
    height: auto;
    padding: 32px var(--pad-x, 20px);
    align-items: center !important;
    justify-content: center !important;
  }
}
</style>
