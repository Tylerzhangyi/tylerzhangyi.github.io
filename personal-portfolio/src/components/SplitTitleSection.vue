<template>
  <section
    :id="sectionId"
    ref="section"
    class="split-title-section"
    :class="{
      'is-parallax': parallaxActive,
      'is-visible': entered,
      'is-active': sectionActive
    }"
    :data-scroll-section="scrollSection"
    :aria-label="ariaLabel"
  >
    <div class="split-title-section__grid" aria-hidden="true">
      <div class="split-title-section__grid-lines"></div>
    </div>

    <div ref="sticky" class="split-title-section__sticky">
      <div class="split-title-section__titles">
        <h2 ref="leftEl" class="split-title-section__title split-title-section__title--left">
          {{ left }}
        </h2>
        <h2 ref="rightEl" class="split-title-section__title split-title-section__title--right">
          {{ right }}
        </h2>
      </div>
    </div>
  </section>
</template>

<script>
import { subscribeScroll } from '../utils/scrollLoop.js'

const clamp = (v, min, max) => Math.min(max, Math.max(min, v))

export default {
  name: 'SplitTitleSection',
  props: {
    sectionId: { type: String, required: true },
    left: { type: String, required: true },
    right: { type: String, required: true },
    scrollSection: { type: String, default: '' },
    ariaLabel: { type: String, default: '' },
    scrollHeight: { type: String, default: '200vh' }
  },
  data() {
    return {
      parallaxActive: false,
      sectionActive: false,
      entered: false,
      unbindScroll: null,
      observer: null,
      prefersReducedMotion: false
    }
  },
  mounted() {
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    this.$refs.section?.style.setProperty('--split-scroll-height', this.scrollHeight)

    if (!this.prefersReducedMotion) {
      this.observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) this.entered = true
        },
        { threshold: 0.15 }
      )
      if (this.$refs.section) this.observer.observe(this.$refs.section)

      this.unbindScroll = subscribeScroll(this.updateParallax, {
        root: this.$refs.section,
        rootMargin: '20% 0px 20% 0px'
      })
    } else {
      this.entered = true
    }
  },
  beforeUnmount() {
    this.unbindScroll?.()
    this.observer?.disconnect()
    document.body.classList.remove('is-projects-intro-active')
  },
  methods: {
    updateParallax() {
      const section = this.$refs.section
      const sticky = this.$refs.sticky
      const left = this.$refs.leftEl
      const right = this.$refs.rightEl
      if (!section || !sticky || !left || !right || this.prefersReducedMotion) return

      const vh = window.innerHeight
      const rect = section.getBoundingClientRect()
      const inView = rect.top < vh * 0.92 && rect.bottom > 0
      this.sectionActive = inView
      document.body.classList.toggle('is-projects-intro-active', inView)

      const progress = clamp(-rect.top / (vh * 0.75), 0, 1)
      this.parallaxActive = progress > 0.02

      const split = progress * 20
      left.style.transform = `translateX(${-split}vw) scale(${1 - progress * 0.1})`
      right.style.transform = `translateX(${split}vw) scale(${1 - progress * 0.1})`

      const fadeStart = 0.45
      const fade = clamp((progress - fadeStart) / (1 - fadeStart), 0, 1)
      const lift = fade * 28
      sticky.style.opacity = String(1 - fade)
      sticky.style.transform = `translateY(${-lift}vh)`
    }
  }
}
</script>

<style scoped>
.split-title-section {
  min-height: var(--split-scroll-height, 200vh);
  position: relative;
  background: #fff;
  color: #000;
  z-index: 4;
}

.split-title-section__grid {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.5s var(--ease-out, cubic-bezier(0.22, 1, 0.36, 1));
}

.split-title-section.is-active .split-title-section__grid {
  opacity: 1;
}

.split-title-section__grid-lines {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.1) 1px,
    transparent 1px
  );
  background-size: 25.01% 100%;
}

.split-title-section__sticky {
  position: sticky;
  top: 0;
  z-index: 1;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: calc(var(--header-h, 72px) + 48px) var(--pad-x, 24px) 80px;
  box-sizing: border-box;
  will-change: transform, opacity;
}

.split-title-section__titles {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: baseline;
  flex-wrap: nowrap;
  gap: 0.28em;
  width: 100%;
  max-width: 100%;
  perspective: var(--perspective, 1200px);
}

.split-title-section__title {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(56px, 14vw, 160px);
  line-height: 0.85;
  letter-spacing: -0.03em;
  margin: 0;
  flex: 0 0 auto;
  white-space: nowrap;
  will-change: transform, opacity;
}

.split-title-section__title--left {
  opacity: 0;
  transform: perspective(var(--perspective, 1200px)) translateX(-14vw) scale(0.6);
}

.split-title-section__title--right {
  opacity: 0;
  transform: perspective(var(--perspective, 1200px)) translateX(14vw) scale(0.6);
}

.split-title-section.is-visible:not(.is-parallax) .split-title-section__title--left {
  animation: splitTitleJoinLeft 1.4s var(--ease-hero, cubic-bezier(0.19, 1, 0.22, 1)) forwards;
}

.split-title-section.is-visible:not(.is-parallax) .split-title-section__title--right {
  animation: splitTitleJoinRight 1.4s var(--ease-hero, cubic-bezier(0.19, 1, 0.22, 1)) forwards;
}

.split-title-section.is-parallax .split-title-section__title--left,
.split-title-section.is-parallax .split-title-section__title--right {
  animation: none;
  opacity: 1;
}

@keyframes splitTitleJoinLeft {
  to {
    opacity: 1;
    transform: perspective(var(--perspective, 1200px)) translateX(0) scale(1);
  }
}

@keyframes splitTitleJoinRight {
  to {
    opacity: 1;
    transform: perspective(var(--perspective, 1200px)) translateX(0) scale(1);
  }
}

@media (max-width: 809px) {
  .split-title-section__titles {
    flex-direction: column;
    align-items: center;
    gap: 0.08em;
  }
}

@media (prefers-reduced-motion: reduce) {
  .split-title-section__title--left,
  .split-title-section__title--right {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
  }

  .split-title-section__sticky {
    opacity: 1 !important;
    transform: none !important;
  }
}
</style>
