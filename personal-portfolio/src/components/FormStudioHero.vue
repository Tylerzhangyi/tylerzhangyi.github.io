<template>
  <div
    ref="root"
    class="form-studio-home"
    :class="{ 'is-active': pageActive }"
  >
    <div class="form-studio-home__grid" aria-hidden="true">
      <div class="form-studio-home__grid-lines"></div>
    </div>

    <!-- Title：居中名字（Form Studio #title） -->
    <section id="section-home" class="form-studio-title" aria-label="主视觉">
      <div class="form-studio-title__inner">
        <h1
          ref="nameEl"
          class="form-studio-title__name"
          :class="{ 'is-visible': nameVisible }"
        >
          {{ t('home.heroName') }}
        </h1>
      </div>
    </section>

    <!-- Intro：居中简介（Form Studio #intro） -->
    <section class="form-studio-intro" aria-label="简介">
      <p ref="introEl" class="form-studio-intro__text" :class="{ 'is-visible': introVisible }">
        {{ t('home.introParagraph') }}
      </p>
    </section>

    <!-- About Me：图片 + About / Me 大字 -->
    <section
      ref="showcaseSection"
      class="form-studio-showcase"
      aria-label="About Me"
    >
      <div ref="showcaseSticky" class="form-studio-showcase__sticky">
        <div ref="mediaEl" class="form-studio-showcase__media">
          <img
            :src="showcaseImage"
            :alt="t('home.showcaseAlt')"
            loading="eager"
            draggable="false"
          />
        </div>
        <div class="form-studio-showcase__labels">
          <h2 ref="showEl" class="form-studio-showcase__label form-studio-showcase__label--left">
            {{ t('home.showCaseLeft') }}
          </h2>
          <h2 ref="caseEl" class="form-studio-showcase__label form-studio-showcase__label--right">
            {{ t('home.showCaseRight') }}
          </h2>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { t as $t } from '../utils/i18n'
import { subscribeScroll } from '../utils/scrollLoop.js'

const clamp = (v, min, max) => Math.min(max, Math.max(min, v))
const lerp = (a, b, t) => a + (b - a) * t

export default {
  name: 'FormStudioHero',
  data() {
    return {
      pageActive: false,
      nameVisible: false,
      introVisible: false,
      unbindScroll: null,
      introObserver: null,
      prefersReducedMotion: false
    }
  },
  computed: {
    showcaseImage() {
      const base = import.meta.env.BASE_URL || '/'
      return `${base}photos/home-hero.JPG`
    }
  },
  mounted() {
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (this.prefersReducedMotion) {
      this.nameVisible = true
      this.introVisible = true
      this.pageActive = true
      return
    }

    requestAnimationFrame(() => {
      this.nameVisible = true
    })

    this.introObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) this.introVisible = true
      },
      { threshold: 0.35 }
    )
    if (this.$refs.introEl) this.introObserver.observe(this.$refs.introEl)

    this.unbindScroll = subscribeScroll(this.updateShowcase, {
      root: this.$refs.root,
      rootMargin: '0px 0px -5% 0px'
    })

    this.$nextTick(() => this.updateShowcase())
  },
  beforeUnmount() {
    this.unbindScroll?.()
    this.introObserver?.disconnect()
    document.body.classList.remove('is-form-studio-home-active')
  },
  methods: {
    t(key) {
      return $t(key)
    },
    updateShowcase() {
      const root = this.$refs.root
      const section = this.$refs.showcaseSection
      const media = this.$refs.mediaEl
      const show = this.$refs.showEl
      const caseLabel = this.$refs.caseEl
      if (!root || !section || !media || !show || !caseLabel) return

      const vh = window.innerHeight
      const rootRect = root.getBoundingClientRect()
      const inHome = rootRect.top < vh && rootRect.bottom > 0
      this.pageActive = inHome
      document.body.classList.toggle('is-form-studio-home-active', inHome)

      const rect = section.getBoundingClientRect()
      const scrollable = Math.max(section.offsetHeight - vh, 1)
      const progress = clamp(-rect.top / scrollable, 0, 1)
      const eased = progress * progress * (3 - 2 * progress)

      const scale = lerp(0.6, 1, eased)
      const split = lerp(42, 0, eased)
      media.style.transform = `perspective(1200px) scale(${scale})`
      show.style.transform = `translateX(${-split}vw)`
      caseLabel.style.transform = `translateX(${split}vw)`
      show.style.opacity = String(lerp(0.35, 1, eased))
      caseLabel.style.opacity = String(lerp(0.35, 1, eased))
    }
  }
}
</script>

<style scoped>
.form-studio-home {
  position: relative;
  background: var(--fs-bg, #fff);
  color: var(--fs-fg, #000);
}

.form-studio-home__grid {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.45s var(--ease-out, cubic-bezier(0.22, 1, 0.36, 1));
}

.form-studio-home.is-active .form-studio-home__grid {
  opacity: 1;
}

.form-studio-home__grid-lines {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(90deg, rgba(0, 0, 0, 0.12) 1px, transparent 1px);
  background-size: 25.01% 100%;
  opacity: 0.15;
}

.form-studio-title,
.form-studio-intro,
.form-studio-showcase {
  position: relative;
  z-index: 1;
}

.form-studio-title {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: calc(var(--header-h, 72px) + 48px) var(--pad-x, 24px) 80px;
  box-sizing: border-box;
}

.form-studio-title__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.form-studio-title__name {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(56px, 14vw, 168px);
  line-height: 0.88;
  letter-spacing: -0.03em;
  text-align: center;
  margin: 0;
  opacity: 0;
  transform: translateY(24px);
  transition:
    opacity 1.2s var(--ease-hero, cubic-bezier(0.19, 1, 0.22, 1)),
    transform 1.2s var(--ease-hero, cubic-bezier(0.19, 1, 0.22, 1));
}

.form-studio-title__name.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.form-studio-intro {
  min-height: min(72vh, 640px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px var(--pad-x, 24px) 96px;
  box-sizing: border-box;
}

.form-studio-intro__text {
  max-width: 720px;
  margin: 0;
  font-family: var(--font-body);
  font-size: clamp(15px, 1.6vw, 18px);
  line-height: 1.65;
  text-align: center;
  opacity: 0;
  transform: perspective(1200px) translateY(28px);
  transition:
    opacity 1s var(--ease-hero, cubic-bezier(0.19, 1, 0.22, 1)),
    transform 1s var(--ease-hero, cubic-bezier(0.19, 1, 0.22, 1));
}

.form-studio-intro__text.is-visible {
  opacity: 1;
  transform: perspective(1200px) translateY(0);
}

.form-studio-showcase {
  min-height: 200vh;
  position: relative;
}

.form-studio-showcase__sticky {
  position: sticky;
  top: 0;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: calc(var(--header-h, 72px) + 24px) var(--pad-x, 24px) 48px;
  box-sizing: border-box;
}

.form-studio-showcase__media {
  position: absolute;
  width: min(92vw, 960px);
  aspect-ratio: 16 / 9;
  transform: perspective(1200px) scale(0.6);
  will-change: transform;
  z-index: 0;
}

.form-studio-showcase__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.form-studio-showcase__labels {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: min(1200px, 100%);
  pointer-events: none;
}

.form-studio-showcase__label {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(48px, 12vw, 140px);
  line-height: 0.85;
  letter-spacing: -0.03em;
  margin: 0;
  will-change: transform, opacity;
}

.form-studio-showcase__label--left {
  transform: translateX(-42vw);
  opacity: 0.35;
}

.form-studio-showcase__label--right {
  transform: translateX(42vw);
  opacity: 0.35;
}

@media (max-width: 809px) {
  .form-studio-showcase__labels {
    flex-direction: column;
    gap: 0.12em;
    align-items: center;
    justify-content: center;
  }

  .form-studio-showcase__label {
    font-size: clamp(40px, 16vw, 72px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .form-studio-title__name,
  .form-studio-intro__text {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }

  .form-studio-showcase__media,
  .form-studio-showcase__label {
    transform: none !important;
    opacity: 1 !important;
  }
}
</style>
