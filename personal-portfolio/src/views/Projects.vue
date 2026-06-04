<template>
  <div class="projects page">
    <div class="container">
      <h1 class="page-title">{{ t('projects.title') }}</h1>
      
      <div v-if="loading" class="loading">
        <p>{{ t('projects.loading') }}</p>
      </div>

      <div v-else-if="error" class="error">
        <p>{{ error }}</p>
      </div>

      <div v-else class="projects-grid">
        <div v-for="project in projects" :key="project.id" class="project-card">
          <div class="project-image">
            <img :src="resolveAssetUrl(project.image) || '/photos/placeholder.jpg'" :alt="project.name" @error="handleImageError" />
          </div>
          <div class="project-content">
            <h2>{{ project.name }}</h2>
            <div class="project-tech">
              <span v-for="tech in project.technologies" :key="tech" class="tech-tag">{{ tech }}</span>
            </div>
            <div class="project-actions">
              <router-link :to="`/projects/${project.id}`" class="btn btn-primary">{{ t('projects.details') }}</router-link>
              <a v-if="project.demo" :href="project.demo" target="_blank" rel="noopener noreferrer" class="btn btn-demo">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 0.3rem;">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
                {{ t('projects.demo') || 'Try' }}
              </a>
              <a v-if="project.github" :href="project.github" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 0.3rem;">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                </svg>
                GitHub
              </a>
            </div>
          </div>
        </div>
      </div>

      <div class="github-section">
        <h2>{{ t('projects.github') }}</h2>
        <div class="github-repos">
          <div v-for="repo in githubRepos" :key="repo.name" class="repo-card">
            <h3>{{ repo.name }}</h3>
            <p>{{ repo.description }}</p>
            <a :href="repo.url" target="_blank" class="repo-link">{{ t('projects.visit') }}</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { i18n, t as $t } from '../utils/i18n'
export default {
  name: 'Projects',
  data() {
    return {
      projects: [],
      githubRepos: [],
      loading: true,
      error: null
    }
  },
  computed: {
    __lang() { return i18n.lang }
  },
  async mounted() {
    await this.fetchProjects()
    await this.fetchGithubRepos()
  },
  methods: {
    t(key) {
      return $t(key)
    },
    async fetchProjects() {
      try {
        // 优先按语言加载，若不存在则回退到 projects.json
        let res = await fetch(`${import.meta.env.BASE_URL}data/projects.${i18n.lang}.json`)
        if (!res.ok) {
          res = await fetch(`${import.meta.env.BASE_URL}data/projects.json`)
        }
        if (!res.ok) throw new Error($t('projects.loadError') || '无法加载项目数据')
        const data = await res.json()
        this.projects = data.projects || []
        this.loading = false
      } catch (error) {
        this.error = error.message
        this.loading = false
      }
    },
    async fetchGithubRepos() {
      this.githubRepos = [
        {
          name: "Tyler's Github Link",
          url: 'https://github.com/Tylerzhangyi'
        }
      ]
    },
    resolveAssetUrl(url) {
      if (!url) return url
      if (/^https?:\/\//i.test(url)) return url
      const cleaned = url.replace(/^\//, '')
      return `${import.meta.env.BASE_URL}${cleaned}`
    },
    handleImageError(e) {
      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23e0e0e0" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E暂无图片%3C/text%3E%3C/svg%3E'
    }
  },
  watch: {
    async __lang() {
      this.loading = true
      await this.fetchProjects()
      await this.fetchGithubRepos()
    }
  }
}
</script>

<style scoped>
.projects {
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

.page-title {
  font-size: 2.5rem;
  margin-bottom: 3rem;
  color: var(--brand);
  text-align: center;
  font-weight: 700;
  letter-spacing: -0.02em;
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

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.project-card {
  background: var(--color-surface);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border);
  transition: transform 0.3s, box-shadow 0.3s;
}

.project-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-md);
  border-color: var(--accent);
}

.project-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: #e0e0e0;
}

.project-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.project-content {
  padding: 1.5rem;
}

.project-content h2 {
  color: var(--brand);
  margin-bottom: 0.5rem;
  font-size: 1.3rem;
  font-weight: 600;
}

.project-intro {
  color: var(--color-muted);
  margin-bottom: 1rem;
  line-height: 1.7;
  font-size: 0.95rem;
}

.project-tech {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tech-tag {
  background: rgba(0,0,0,0.04);
  padding: 0.35rem 0.85rem;
  border-radius: 6px;
  font-size: 0.8rem;
  color: var(--color-text);
  border: 1px solid var(--border);
}

.project-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: nowrap;
}

.btn {
  padding: 0.6rem 1.2rem;
  border-radius: 5px;
  font-weight: 500;
  transition: all 0.3s;
  border: none;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  flex: 0 1 auto;
  white-space: nowrap;
}

.btn-primary {
  background: var(--accent);
  color: #fff;
}

.btn-primary:hover {
  background: var(--accent-600);
  transform: translateY(-2px);
}

.btn-secondary {
  background: rgba(38,58,82,0.06);
  color: var(--brand);
  border: 1px solid var(--border);
}

.btn-secondary:hover {
  background: rgba(38,58,82,0.12);
  transform: translateY(-2px);
}

.btn-demo {
  background: rgba(38,58,82,0.06);
  color: var(--brand);
  border: 1px solid var(--border);
}

.btn-demo:hover {
  background: rgba(38,58,82,0.12);
  transform: translateY(-2px);
}

.github-section {
  background: var(--color-surface);
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border);
}

.github-section h2 {
  color: var(--brand);
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.github-repos {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.repo-card {
  padding: 1.5rem;
  background: var(--color-surface);
  border-radius: 8px;
  border-left: 4px solid var(--accent);
  border: 1px solid var(--border);
  border-left: 4px solid var(--accent);
  transition: all 0.2s ease;
}

.repo-card:hover {
  box-shadow: var(--shadow-sm);
  transform: translateX(4px);
}

.repo-card h3 {
  color: var(--brand);
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.repo-card p {
  color: var(--color-muted);
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.repo-link {
  color: var(--accent);
  font-weight: 500;
  transition: color 0.3s;
}

.repo-link:hover {
  color: var(--accent-600);
}

@media (max-width: 768px) {
  .projects-grid {
    grid-template-columns: 1fr;
  }

  .page-title {
    font-size: 2rem;
  }

  .project-actions {
    flex-wrap: wrap;
  }

  .btn {
    flex: 1 1 auto;
    min-width: 0;
  }
}
</style>

