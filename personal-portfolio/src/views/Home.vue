<template>
  <div class="onepage">
    <FormStudioHero />

    <section id="section-about" data-scroll-section="about" class="stack-section reveal-fade-only">
      <AboutSection />
    </section>
    <section id="section-education" data-scroll-section="education" class="stack-section stack-section--solid reveal-on-scroll" data-reveal-delay="2">
      <EducationSection />
    </section>
    <SplitTitleSection
      section-id="section-projects-intro"
      scroll-section="projects-intro"
      :left="t('projectsIntro.left')"
      :right="t('projectsIntro.right')"
      :aria-label="t('projectsIntro.aria')"
    />
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
import FormStudioHero from '../components/FormStudioHero.vue'
import AboutSection from './About.vue'
import EducationSection from './Education.vue'
import SplitTitleSection from '../components/SplitTitleSection.vue'
import ProjectsSection from './ProjectsSection.vue'
import BlogSection from './Blog.vue'
import LinksSection from './Links.vue'
import ContactSection from './Contact.vue'
import { observeReveals } from '../utils/motion'

export default {
  name: 'Home',
  components: {
    FormStudioHero,
    AboutSection,
    EducationSection,
    SplitTitleSection,
    ProjectsSection,
    BlogSection,
    LinksSection,
    ContactSection
  },
  data() {
    return {
      teardownReveals: null
    }
  },
  computed: {
    currentLang() {
      return i18n.lang
    }
  },
  methods: {
    t(key) {
      return $t(key)
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
  background: var(--fs-bg, #fff);
  --brand: #16181d;
  --color-text: #252a33;
  --color-muted: #5d6674;
  --color-surface: rgba(255, 255, 255, 0.82);
  --border: rgba(0, 0, 0, 0.12);
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

.stack-section--links {
  overflow: visible;
  background: #fff;
  background-image: none;
  min-height: max(100vh, 1120px);
}

.stack-section--solid {
  background: #fff;
  background-image: none;
  isolation: isolate;
  z-index: 2;
}

.stack-section--solid::before,
.stack-section--solid::after {
  z-index: 0;
}

.stack-section--solid > * {
  position: relative;
  z-index: 1;
}

.stack-section::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.16), transparent);
}

.stack-section::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 80px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.55), transparent);
  pointer-events: none;
  z-index: 1;
}
</style>
