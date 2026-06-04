<template>
  <div class="onepage">
    <section id="section-home" data-scroll-section="home" class="hero" aria-label="主视觉">
      <div class="hero-media">
        <img
          v-if="hasHeroImage"
          class="hero-img"
          :src="heroImageSrc"
          alt=""
          @error="hasHeroImage = false"
        />
        <div v-else class="hero-fallback" aria-hidden="true"></div>
        <div class="hero-overlay" aria-hidden="true"></div>
      </div>

      <div class="hero-ui hero-reveal">
        <div class="hero-title">
          <div class="line hero-line" style="--i: 0">{{ t('home.greeting') }}</div>
          <div class="line accent hero-line" style="--i: 1">Zhang Yi</div>
          <div class="line hero-line" style="--i: 2">{{ t('home.role') }}</div>
        </div>
        <div class="hero-actions hero-line" style="--i: 3">
          <button type="button" class="btn btn-primary" @click="scrollToSection('projects')">{{ t('home.ctaProjects') }}</button>
          <button type="button" class="btn btn-secondary" @click="scrollToSection('contact')">{{ t('nav.contact') }}</button>
        </div>
      </div>
    </section>

    <!-- About 含横向 pin：父级不能用 translate 入场，否则 ScrollTrigger 锁定失效 -->
    <section id="section-about" data-scroll-section="about" class="stack-section reveal-fade-only">
      <AboutSection />
    </section>
    <section id="section-education" data-scroll-section="education" class="stack-section reveal-on-scroll" data-reveal-delay="2">
      <EducationSection />
    </section>
    <ProjectsSection />
    <BlogSection embedded />
    <LinksSection />
    <section id="section-contact" data-scroll-section="contact" class="stack-section reveal-on-scroll" data-reveal-delay="1">
      <ContactSection />
    </section>
  </div>
</template>

<script>
import { i18n, t as $t } from '../utils/i18n'
import AboutSection from './About.vue'
import EducationSection from './Education.vue'
import ProjectsSection from './ProjectsSection.vue'
import BlogSection from './Blog.vue'
import LinksSection from './Links.vue'
import ContactSection from './Contact.vue'
import { observeReveals } from '../utils/motion'

export default {
  name: 'Home',
  components: {
    AboutSection,
    EducationSection,
    ProjectsSection,
    BlogSection,
    LinksSection,
    ContactSection  
  },
  data() {
    return {
      hasHeroImage: true,
      teardownReveals: null
    }
  },
  computed: {
    currentLang() {
      return i18n.lang
    },
    /** public 目录资源：勿写静态 src，否则 Vite 会当成模块 import */
    heroImageSrc() {
      return `${import.meta.env.BASE_URL}photos/home-hero.JPG`
    }
  },
  methods: {
    t(key) {
      return $t(key)
    },
    scrollToSection(id) {
      const section = document.getElementById(`section-${id}`)
      if (!section) return
      const top = section.getBoundingClientRect().top + window.scrollY - 72
      window.scrollTo({ top, behavior: 'smooth' })
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.teardownReveals = observeReveals(this.$el)
    })
  },
  beforeUnmount() {
    this.teardownReveals?.()
  }
}
</script>

<style scoped>
.onepage {
  width: 100%;
  background: #f2f2f3;
  /* 单页正文统一用深色文字，避免白字看不见 */
  --brand: #16181d;
  --color-text: #252a33;
  --color-muted: #5d6674;
  --color-surface: rgba(255,255,255,0.82);
  --border: rgba(0,0,0,0.12);
  --accent: #1a1d23;
  --accent-600: #0f1116;
}

.stack-section {
  scroll-margin-top: 0;
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: stretch;
  background-image: var(--contour-light-bg);
  background-size: 56px 56px, 56px 56px, 100% 100%;
}
.stack-section > * {
  flex: 1 1 auto;
  min-width: 0;
}
/* 项目区背景由 ProjectsSection 自行绘制，避免父级白底网格盖住黄底黑网格 */
.stack-section--projects,
.stack-section--blog {
  background: transparent;
  background-image: none;
  overflow: visible;
}

.stack-section--projects::after {
  display: none;
}
.stack-section--links {
  overflow: visible;
  background: #fff;
  background-image: none;
  min-height: max(100vh, 1120px);
}
.blog-wrap {
  width: 100%;
  display: grid;
  grid-template-rows: 160px 1fr;
  background-image: var(--contour-light-bg);
  background-size: 56px 56px, 56px 56px, 100% 100%;
  height: 100vh;
  position: relative;
  z-index: 3;
}
.skills-wrap {
  width: 100%;
  display: grid;
  grid-template-rows: 160px 1fr;
  background-image: var(--contour-light-bg);
  background-size: 56px 56px, 56px 56px, 100% 100%;
  height: 100vh;
  position: relative;
  z-index: 3;
}
.skills-pane {
  min-height: 0;
  display: flex;
  height: calc(100vh - 160px);
}
.skills-pane > * {
  flex: 1 1 auto;
  min-width: 0;
  height: 100%;
}
.blog-pane {
  min-height: 0;
  display: flex;
  height: calc(100vh - 160px);
}
.blog-pane > * {
  flex: 1 1 auto;
  min-width: 0;
  height: 100%;
}
.skills-wrap > :first-child,
.blog-wrap > :first-child {
  --band-h: 160px;
  --band-size: 5.52rem;
  position: relative;
  z-index: 4;
}

.stack-section::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0,0,0,0.16), transparent);
}

.stack-section::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 80px;
  background: linear-gradient(180deg, rgba(255,255,255,0.55), transparent);
  pointer-events: none;
  z-index: 1;
}

.hero {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  /* 首屏仍然保持亮色大标题 */
  --brand: rgba(255,255,255,0.96);
  --color-text: rgba(255,255,255,0.92);
  --color-muted: rgba(255,255,255,0.72);
  --accent: #ff2a7d;
  --accent-600: #e61f6f;
}

.hero-media {
  position: absolute;
  inset: 0;
}

.hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-fallback {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(900px 520px at 55% 25%, rgba(255,42,125,0.16), transparent 60%),
    radial-gradient(820px 460px at 45% 65%, rgba(71,227,255,0.12), transparent 60%),
    linear-gradient(120deg, rgba(0,0,0,0.55), rgba(0,0,0,0.05));
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.18) 42%, rgba(0,0,0,0.0) 70%),
    radial-gradient(700px 300px at 20% 35%, rgba(0,0,0,0.55), transparent 62%);
}

.hero-ui {
  position: relative;
  z-index: 1;
  height: 100%;
  min-height: 100vh;
  display: grid;
  align-content: end;
  gap: 18px;
  padding: 40px 42px 46px;
  max-width: 900px;
}

@media (prefers-reduced-motion: no-preference) {
  .hero-line {
    opacity: 0;
    transform: translateY(28px);
    animation: hero-rise 860ms cubic-bezier(.22,1,.36,1) forwards;
    animation-delay: calc(180ms + var(--i, 0) * 110ms);
  }
  .hero-media .hero-img,
  .hero-media .hero-fallback {
    animation: hero-zoom 1.4s cubic-bezier(.22,1,.36,1) both;
  }
}
@keyframes hero-rise {
  to {
    opacity: 1;
    transform: none;
  }
}
@keyframes hero-zoom {
  from { transform: scale(1.08); filter: blur(4px); }
  to { transform: scale(1); filter: none; }
}
@media (prefers-reduced-motion: reduce) {
  .hero-line {
    opacity: 1;
    transform: none;
    animation: none;
  }
}

.hero-title {
  font-weight: 900;
  letter-spacing: 0.02em;
  line-height: 1.03;
  font-size: clamp(2.1rem, 4.2vw, 4.2rem);
  color: rgba(255,255,255,0.94);
  text-shadow: 0 16px 50px rgba(0,0,0,0.55);
}

.hero-title .accent {
  color: rgba(255,224,54,0.98);
  text-shadow:
    0 18px 55px rgba(0,0,0,0.62),
    0 0 22px rgba(255,224,54,0.18);
}

.hero-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

/* 只改首页“查看项目/联系我”两颗按钮：去掉渐变，做成更工业的纯色 */
.hero-actions .btn.btn-primary {
  background: rgba(255,224,54,0.94);
  color: rgba(0,0,0,0.82);
  border: 1px solid rgba(255,224,54,0.55);
  box-shadow: 0 14px 46px rgba(0,0,0,0.35);
}
.hero-actions .btn.btn-primary:hover {
  background: rgba(255,224,54,0.98);
}
.hero-actions .btn.btn-secondary {
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.16);
  color: rgba(255,255,255,0.92);
}
.hero-actions .btn.btn-secondary:hover {
  background: rgba(255,255,255,0.12);
}

@media (max-width: 980px) {
  .hero-ui {
    padding: 28px 22px 28px;
  }
}
</style>

