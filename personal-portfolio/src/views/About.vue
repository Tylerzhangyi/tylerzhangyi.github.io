<template>
  <div ref="aboutRoot" class="about page">
    <!-- ScrollTrigger: 在这段滚动区内 pin 住视口，把纵向滚动映射为横向位移 -->
    <div ref="wrap" class="horizontal-wrapper">
      <div ref="pin" class="horizontal-pin about-stage">
        <div ref="track" class="about-track horizontal">
        <section class="about-panel">
          <div class="container panel-inner">
            <h1 class="page-title">{{ t('about.title') }}</h1>
            <!-- 面板 1：前四块（Intro / Interests / Hobbies / Goals） -->
            <div class="about-grid">
              <div class="about-section intro-section">
                <div class="section-header">
                  <UserCircleIcon class="section-icon" />
                  <h2>{{ t('about.intro') }}</h2>
                </div>
                <p>{{ t('about.introText') }}</p>
              </div>
              <div class="about-section interests-section">
                <div class="section-header">
                  <AcademicCapIcon class="section-icon" />
                  <h2>{{ t('about.interests') }}</h2>
                </div>
                <ul class="interest-list">
                  <li v-for="(interest, index) in interestsList" :key="`i-${index}`" class="interest-item" :style="{ animationDelay: `${index * 0.08}s` }">
                    <CheckIcon class="check-icon" />
                    <span>{{ interest }}</span>
                  </li>
                </ul>
              </div>
            </div>

            <div class="about-grid compact">
              <div class="about-card hobbies-card">
                <div class="card-header">
                  <PaintBrushIcon class="card-icon" />
                  <h3>{{ t('about.hobbies') }}</h3>
                </div>
                <div class="hobbies-content">
                  <div v-for="(hobby, index) in hobbiesList" :key="`h-${index}`" class="hobby-item">
                    <SparklesIcon class="hobby-icon" />
                    <span>{{ hobby }}</span>
                  </div>
                </div>
              </div>
              <div class="about-card goals-card">
                <div class="card-header">
                  <RocketLaunchIcon class="card-icon" />
                  <h3>{{ t('about.goals') }}</h3>
                </div>
                <p class="goals-text">{{ t('about.goalsText') }}</p>
              </div>
            </div>
          </div>
        </section>

        <section class="about-panel secondary">
          <div class="container panel-inner panel-inner-secondary">
            <!-- 面板 2：Featured（Courses） + Honor（Awards） -->
            <div class="about-card courses-card single-card">
              <div class="card-header">
                <BookOpenIcon class="card-icon" />
                <h3>{{ t('about.courses') }}</h3>
              </div>
              <div class="courses-grid">
                <div v-for="course in coursesList" :key="course" class="course-tag">{{ course }}</div>
              </div>
            </div>
            <div class="about-card awards-card single-card">
              <div class="card-header">
                <TrophyIcon class="card-icon" />
                <h3>{{ t('about.awards') }}</h3>
              </div>
              <ul class="awards-list">
                <li v-for="award in awardsList" :key="award">
                  <TrophyIcon class="award-icon" />
                  <span>{{ award }}</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
        </div>
      </div>
    </div>

    <div class="panel-progress" aria-hidden="true">
      <span>{{ String(displayIndex).padStart(2, '0') }}</span>
      <span class="sep">/</span>
      <span>{{ String(panelCount).padStart(2, '0') }}</span>
    </div>
  </div>
</template>

<script>
import { CheckIcon } from '@heroicons/vue/24/solid'
import { UserCircleIcon, AcademicCapIcon, PaintBrushIcon, RocketLaunchIcon, SparklesIcon, BookOpenIcon, TrophyIcon } from '@heroicons/vue/24/outline'
import { i18n, t as $t, getDict } from '../utils/i18n'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default {
  name: 'About',
  components: {
    CheckIcon,
    UserCircleIcon,
    AcademicCapIcon,
    PaintBrushIcon,
    RocketLaunchIcon,
    SparklesIcon,
    BookOpenIcon,
    TrophyIcon
  },
  data() {
    return {
      panelCount: 2,
      displayIndex: 1,
      scrollTween: null,
      resizeTimer: null,
      layoutRetryTimer: null,
      revealObserver: null
    }
  },
  computed: {
    currentLang() {
      return i18n.lang
    },
    interestsList() {
      return getDict('about.interestsList') || []
    },
    hobbiesList() {
      const hobbiesText = this.t('about.hobbiesText')
      // 处理中英文格式：中文用逗号，英文可能用逗号+空格
      return hobbiesText.split(/[,，]/).map(h => h.trim()).filter(h => h && h !== ',')
    },
    coursesList() {
      return getDict('skills.coursesList') || []
    },
    awardsList() {
      return getDict('skills.awardsList') || []
    }
  },
  mounted() {
    gsap.registerPlugin(ScrollTrigger)
    this.queueHorizontalSetup()
    window.addEventListener('resize', this.onResize, { passive: true })
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.onResize)
    if (this.resizeTimer) window.clearTimeout(this.resizeTimer)
    if (this.layoutRetryTimer) window.clearTimeout(this.layoutRetryTimer)
    if (this.revealObserver) this.revealObserver.disconnect()
    this.destroyHorizontalScroll()
  },
  methods: {
    t(key) {
      return $t(key)
    },
    isDesktop() {
      return window.matchMedia('(min-width: 900px)').matches
    },
    queueHorizontalSetup() {
      this.$nextTick(() => {
        requestAnimationFrame(() => {
          this.setupHorizontalScroll()
          this.watchAboutSectionReveal()
        })
      })
    },
    onResize() {
      if (this.resizeTimer) window.clearTimeout(this.resizeTimer)
      this.resizeTimer = window.setTimeout(() => {
        this.destroyHorizontalScroll()
        this.queueHorizontalSetup()
      }, 160)
    },
    destroyHorizontalScroll() {
      if (this.scrollTween) {
        this.scrollTween.scrollTrigger?.kill(true)
        this.scrollTween.kill()
        this.scrollTween = null
      }
      ScrollTrigger.getAll()
        .filter((st) => st.vars?.id === 'about-horizontal-st')
        .forEach((st) => st.kill(true))
      const pin = this.$refs.pin
      const track = this.$refs.track
      if (pin) gsap.set(pin, { clearProps: 'all' })
      if (track) gsap.set(track, { clearProps: 'all' })
    },
    watchAboutSectionReveal() {
      const section = document.getElementById('section-about')
      if (!section || section.classList.contains('is-revealed')) return
      this.revealObserver = new MutationObserver(() => {
        if (!section.classList.contains('is-revealed')) return
        ScrollTrigger.refresh(true)
        this.revealObserver?.disconnect()
        this.revealObserver = null
      })
      this.revealObserver.observe(section, { attributes: true, attributeFilter: ['class'] })
    },
    setupHorizontalScroll() {
      if (!this.isDesktop()) {
        this.destroyHorizontalScroll()
        return
      }

      const wrap = this.$refs.wrap
      const pin = this.$refs.pin
      const track = this.$refs.track
      if (!wrap || !pin || !track) return

      this.destroyHorizontalScroll()

      const section = document.getElementById('section-about') || wrap
      const distance = () => Math.max(0, Math.round(track.scrollWidth - pin.clientWidth))

      if (distance() < 1) {
        if (this.layoutRetryTimer) window.clearTimeout(this.layoutRetryTimer)
        this.layoutRetryTimer = window.setTimeout(() => this.setupHorizontalScroll(), 120)
        return
      }

      // pin + scrub：纵向滚动映射为横向位移
      this.scrollTween = gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          id: 'about-horizontal-st',
          trigger: section,
          start: 'top top',
          end: () => `+=${Math.max(distance(), 1)}`,
          scrub: 1,
          pin,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const idx = Math.max(
              1,
              Math.min(this.panelCount, Math.floor(self.progress * (this.panelCount - 1) + 0.5) + 1)
            )
            this.displayIndex = idx
          }
        }
      })
      ScrollTrigger.refresh(true)
    }
  }
}
</script>

<style scoped>
.about.page {
  position: relative;
  padding: 0;
  overflow: visible;
  overscroll-behavior: none;
}

.horizontal-wrapper {
  position: relative;
  width: 100%;
}

.horizontal-pin {
  position: relative;
  width: 100%;
  height: 100vh; /* pin 住一整屏视口 */
}
.about-stage {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.about-track {
  height: 100%;
  display: flex;
  transition: none;
  will-change: transform;
}
.about-panel {
  flex: 0 0 100%;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
}
.panel-inner {
  width: 100%;
}
.panel-inner-secondary {
  padding-top: clamp(28px, 6.5vh, 76px);
  padding-bottom: clamp(20px, 5vh, 56px);
}
.panel-progress {
  position: absolute;
  right: 28px;
  bottom: 18px;
  z-index: 3;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: rgba(0, 0, 0, 0.58);
}
.panel-progress .sep {
  opacity: 0.5;
}
.awards-card {
  margin-top: 2rem;
}

.page-title {
  font-size: 2.5rem;
  margin-bottom: 3rem;
  color: var(--brand);
  text-align: center;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.about-content {
  max-width: 1200px;
  margin: 0 auto;
}

.about-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  margin-bottom: 2rem;
}
.about-grid.compact {
  margin-bottom: 0;
}

.about-section {
  background: var(--color-surface);
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.section-icon {
  width: 1.75rem;
  height: 1.75rem;
  color: var(--accent);
  flex-shrink: 0;
}

.about-section h2 {
  color: var(--brand);
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  margin: 0;
}

.about-section p {
  color: var(--color-muted);
  line-height: 1.8;
  font-size: 1rem;
  margin: 0;
}

.interest-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.interest-item {
  padding: 0.85rem 0;
  color: var(--color-text);
  border-bottom: 1px solid var(--border);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  opacity: 0;
  transform: translateY(10px);
  animation: fadeInUp 0.6s ease forwards;
}

.interest-item:last-child {
  border-bottom: none;
}

.interest-item:hover {
  padding-left: 0.5rem;
  color: var(--accent);
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.interest-list li span {
  flex: 1;
}

.check-icon {
  width: 1.2rem;
  height: 1.2rem;
  color: var(--accent);
  flex-shrink: 0;
  opacity: 0;
  transform: scale(0);
  animation: scaleIn 0.4s ease forwards;
  animation-delay: inherit;
}

@keyframes scaleIn {
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.about-card {
  background: var(--color-surface);
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.single-card {
  margin-bottom: 2rem;
}

.about-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.card-icon {
  width: 1.75rem;
  height: 1.75rem;
  color: var(--accent);
  flex-shrink: 0;
}

.about-card h3 {
  color: var(--brand);
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  margin: 0;
}

.hobbies-content {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.hobby-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(38,58,82,0.05);
  border-radius: 8px;
  transition: all 0.2s ease;
  opacity: 0;
  transform: translateX(-10px);
  animation: fadeInLeft 0.5s ease forwards;
}

.hobby-item:nth-child(1) { animation-delay: 0.1s; }
.hobby-item:nth-child(2) { animation-delay: 0.2s; }
.hobby-item:nth-child(3) { animation-delay: 0.3s; }
.hobby-item:nth-child(4) { animation-delay: 0.4s; }

@keyframes fadeInLeft {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.hobby-item:hover {
  background: rgba(38,58,82,0.12);
  transform: translateX(4px);
}

.hobby-icon {
  width: 1.2rem;
  height: 1.2rem;
  color: var(--accent);
  flex-shrink: 0;
  opacity: 0;
  transform: scale(0) rotate(-180deg);
  animation: iconPop 0.5s ease forwards;
}

.hobby-item:nth-child(1) .hobby-icon { animation-delay: 0.15s; }
.hobby-item:nth-child(2) .hobby-icon { animation-delay: 0.25s; }
.hobby-item:nth-child(3) .hobby-icon { animation-delay: 0.35s; }
.hobby-item:nth-child(4) .hobby-icon { animation-delay: 0.45s; }

@keyframes iconPop {
  to {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

.hobby-item span {
  color: var(--color-text);
  font-weight: 500;
}

.goals-text {
  color: var(--color-muted);
  line-height: 1.8;
  font-size: 1rem;
  margin: 0;
}

.timeline {
  position: relative;
}

.timeline-item {
  padding-left: 2rem;
  position: relative;
  margin-bottom: 1.75rem;
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: -1.75rem;
  width: 2px;
  background: var(--accent);
  opacity: 0.25;
}

.timeline-item::after {
  content: '';
  position: absolute;
  left: -5px;
  top: 6px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--accent);
  border: 2px solid var(--color-surface);
  box-shadow: 0 0 0 2px rgba(255, 45, 117, 0.25);
}

.timeline-item:last-child {
  margin-bottom: 0;
}

.timeline-item:last-child::before {
  display: none;
}

.timeline-content h4 {
  color: var(--brand);
  margin-bottom: 0.4rem;
  font-weight: 600;
  font-size: 1.1rem;
}

.timeline-institution {
  font-weight: 600;
  color: var(--accent);
  margin-bottom: 0.2rem;
}

.timeline-period {
  color: var(--color-muted);
  font-size: 0.9rem;
  margin-bottom: 0.6rem;
}

.timeline-description {
  color: var(--color-muted);
  line-height: 1.7;
  font-size: 0.95rem;
}

.timeline-description a {
  color: var(--accent);
  font-weight: 600;
  text-decoration: none;
}

.timeline-description a:hover {
  text-decoration: underline;
}

.courses-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.course-tag {
  background: rgba(38,58,82,0.06);
  padding: 0.65rem 1.2rem;
  border-radius: 8px;
  color: var(--color-text);
  font-weight: 500;
  font-size: 0.9rem;
  white-space: nowrap;
  border: 1px solid var(--border);
  transition: all 0.2s ease;
}

.course-tag:hover {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.awards-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 1rem;
}

.awards-list li {
  padding: 1.1rem 1.4rem;
  background: rgba(38,58,82,0.04);
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 1rem;
  color: var(--color-text);
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.awards-list li:hover {
  border-color: var(--accent);
  background: rgba(255,45,117,0.06);
  transform: translateX(4px);
}

.award-icon {
  width: 1.35rem;
  height: 1.35rem;
  color: var(--accent);
  flex-shrink: 0;
}

@media (max-width: 992px) {
  .about.page {
    height: auto;
    min-height: 100vh;
  }
  .horizontal-wrapper {
    height: auto;
  }
  .horizontal-pin.about-stage {
    height: auto;
  }
  .about-stage {
    overflow: visible;
    height: auto;
  }
  .about-track {
    display: block;
    transform: none !important;
  }
  .about-panel {
    width: auto;
    height: auto;
    display: block;
    padding: 26px 0;
  }
  .panel-progress {
    display: none;
  }
  .about-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }

  .about-section,
  .about-card {
    padding: 1.5rem;
  }

  .hobbies-content {
    grid-template-columns: 1fr;
  }

  .section-header,
  .card-header {
    margin-bottom: 1rem;
  }

  .courses-grid {
    gap: 0.5rem;
  }

  .course-tag {
    font-size: 0.85rem;
  }
}
</style>

