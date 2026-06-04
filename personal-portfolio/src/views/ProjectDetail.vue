<template>
  <div class="project-detail page">
    <div class="container">
      <div v-if="loading" class="loading">
        <p>{{ t('projectDetail.loading') }}</p>
      </div>

      <div v-else-if="error" class="error">
        <p>{{ error }}</p>
        <button type="button" class="btn btn-primary" @click="goBackToProjects">{{ t('projectDetail.back') }}</button>
      </div>

      <div v-else-if="project" class="project-detail-content detail-enter">
        <button type="button" class="close-fab" @click="goBackToProjects($event)" aria-label="关闭详情">
          CLOSE
        </button>
        <button type="button" class="back-link" @click="goBackToProjects($event)">← {{ t('projectDetail.back') }}</button>
        
        <h1 class="project-title">{{ project.name }}</h1>
        
        <div class="project-header">
          <div class="project-image-large">
            <img :src="resolveAssetUrl(project.image) || '/photos/placeholder.jpg'" :alt="project.name" @error="handleImageError" />
          </div>
        </div>

        <div class="project-intro-section">
          <h2>{{ t('projectDetail.intro') }}</h2>
          <p>{{ project.intro }}</p>
        </div>

        <div class="project-tech-section">
          <h2>{{ t('projectDetail.tech') }}</h2>
          <div class="tech-list">
            <span v-for="tech in project.technologies" :key="tech" class="tech-tag-large">{{ tech }}</span>
          </div>
        </div>

        <div v-if="project.description" class="project-contribution-section">
          <h2>{{ t('projectDetail.description') }}</h2>
          <p class="project-description-text">{{ project.description }}</p>
        </div>

        <div class="project-links-section">
          <h2>{{ t('projectDetail.links') }}</h2>
          <div class="project-links">
            <a v-if="project.github" :href="project.github" target="_blank" class="project-link github">
              <CubeIcon class="icon-inline" />
              {{ t('projectDetail.github') }}
            </a>
            <a v-if="project.demo" :href="project.demo" target="_blank" class="project-link demo">
              <RocketLaunchIcon class="icon-inline" />
              {{ t('projectDetail.demo') }}
            </a>
          </div>
        </div>

        <div v-if="project.screenshots && project.screenshots.length > 0" class="project-screenshots-section">
          <h2>{{ t('projectDetail.screenshots') }}</h2>
          <div class="screenshots-grid">
            <img v-for="(screenshot, index) in project.screenshots" :key="index" :src="resolveAssetUrl(screenshot)" :alt="`${t('projectDetail.screenshot')} ${index + 1}`" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { CubeIcon, RocketLaunchIcon } from '@heroicons/vue/24/outline'
import { i18n, t as $t } from '../utils/i18n'
import { setTransitionOrigin, setTransitionOriginFromElement, scrollDetailToTop } from '../utils/pageTransition'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default {
  name: 'ProjectDetail',
  components: {
    CubeIcon,
    RocketLaunchIcon
  },
  data() {
    return {
      project: null,
      loading: true,
      error: null
    }
  },
  computed: {
    __lang() { return i18n.lang }
  },
  async mounted() {
    scrollDetailToTop()
    await this.fetchProject()
  },
  watch: {
    '$route'() {
      scrollDetailToTop()
      this.fetchProject()
    },
    async __lang() {
      this.loading = true
      await this.fetchProject()
    }
  },
  methods: {
    t(key) {
      return $t(key)
    },
    resolveAssetUrl(url) {
      if (!url) return url
      if (/^https?:\/\//i.test(url)) return url
      const cleaned = url.replace(/^\//, '')
      return `${import.meta.env.BASE_URL}${cleaned}`
    },
    async fetchProject() {
      const projectId = this.$route.params.id
      try {
        let res = await fetch(`${import.meta.env.BASE_URL}data/projects.${i18n.lang}.json`)
        if (!res.ok) {
          res = await fetch(`${import.meta.env.BASE_URL}data/projects.json`)
        }
        if (!res.ok) throw new Error($t('projectDetail.loadError') || '无法加载项目数据')
        const data = await res.json()
        const project = data.projects.find(p => p.id === parseInt(projectId))
        if (!project) {
          throw new Error($t('projectDetail.notFound') || '项目不存在')
        }
        this.project = project
        this.loading = false
      } catch (error) {
        this.error = error.message
        this.loading = false
      }
    },
    goBackToProjects(event) {
      if (event?.clientX != null) {
        setTransitionOrigin(event.clientX, event.clientY)
      } else {
        setTransitionOriginFromElement(document.querySelector('.close-fab'))
      }
      const doScroll = () => {
        ScrollTrigger.refresh()
        const el = document.getElementById('section-projects')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
      this.$router.push('/').then(() => window.setTimeout(doScroll, 120))
    },
    handleImageError(e) {
      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400"%3E%3Crect fill="%23e0e0e0" width="800" height="400"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="24" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E暂无图片%3C/text%3E%3C/svg%3E'
    }
  }
}
</script>

<style scoped>
.project-detail {
  background-image: var(--contour-light-bg);
  background-size: 56px 56px, 56px 56px, 100% 100%;
  color: #202734;
  --color-surface: rgba(255,255,255,0.90);
  --border: rgba(0,0,0,0.12);
  --brand: #0f141c;
  --color-muted: #5d6675;
  --accent: rgba(255,224,54,0.94);
  --accent-600: rgba(255,224,54,1);
}

.project-detail-content {
  max-width: 900px;
  margin: 0 auto;
}

.close-fab {
  position: fixed;
  top: 18px;
  right: 24px;
  z-index: 2200;
  min-height: 42px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid rgba(0,0,0,0.14);
  background: rgba(255,255,255,0.88);
  color: rgba(0,0,0,0.78);
  font-weight: 900;
  letter-spacing: 0.1em;
  cursor: pointer;
  box-shadow: 0 12px 30px rgba(0,0,0,0.16);
  backdrop-filter: blur(6px);
}
.close-fab:hover {
  background: rgba(255,255,255,0.98);
}

.back-link {
  display: inline-block;
  color: rgba(0,0,0,0.72);
  margin-bottom: 2rem;
  font-weight: 500;
  transition: color 0.3s;
  background: transparent;
  border: 0;
  cursor: pointer;
  padding: 0;
}

.back-link:hover {
  color: rgba(0,0,0,0.92);
}

.project-title {
  font-size: 2.5rem;
  color: var(--brand);
  margin-bottom: 2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.project-header {
  margin-bottom: 2rem;
}

.project-image-large {
  width: 100%;
  height: 400px;
  border-radius: 10px;
  overflow: hidden;
  background: rgba(255,255,255,0.78);
  border: 1px solid rgba(0,0,0,0.12);
  box-shadow: 0 20px 56px rgba(0,0,0,0.16);
}

.project-image-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.project-intro-section,
.project-tech-section,
.project-contribution-section,
.project-links-section,
.project-screenshots-section {
  background: var(--color-surface);
  padding: 2.5rem;
  margin-bottom: 2rem;
  border-radius: 12px;
  box-shadow: 0 20px 56px rgba(0,0,0,0.14);
  border: 1px solid var(--border);
  backdrop-filter: blur(6px) saturate(130%);
}

h2 {
  color: var(--brand);
  margin-bottom: 1.2rem;
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.project-intro-section p {
  color: var(--color-muted);
  line-height: 1.8;
  font-size: 1.05rem;
}

.project-description-text {
  color: var(--color-muted);
  line-height: 1.8;
  font-size: 1.05rem;
  white-space: pre-wrap;
}

.tech-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.tech-tag-large {
  background: rgba(255,224,54,0.20);
  color: rgba(0,0,0,0.78);
  border: 1px solid rgba(0,0,0,0.14);
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.9rem;
}

.project-links {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.project-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s;
  text-decoration: none;
}

.icon-inline {
  width: 1.2rem;
  height: 1.2rem;
}

.project-link.github {
  background: rgba(255,255,255,0.94);
  color: rgba(0,0,0,0.82);
  border: 1px solid rgba(0,0,0,0.14);
}

.project-link.github:hover {
  background: rgba(255,255,255,1);
  transform: translateY(-2px);
}

.project-link.demo {
  background: rgba(255,224,54,0.92);
  color: rgba(0,0,0,0.82);
  border: 1px solid rgba(255,224,54,0.55);
}

.project-link.demo:hover {
  background: var(--accent-600);
  transform: translateY(-2px);
}

.screenshots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.screenshots-grid img {
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.loading,
.error {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.error {
  color: #e74c3c;
}

@media (max-width: 768px) {
  .project-title {
    font-size: 2rem;
  }

  .project-image-large {
    height: 250px;
  }

  .project-intro-section,
  .project-tech-section,
  .project-contribution-section,
  .project-links-section,
  .project-screenshots-section {
    padding: 1.5rem;
  }
}
</style>

