<template>
  <footer class="footer">
    <div class="container">
      <!-- 顶部导航链接 -->
      <nav class="footer-nav">
        <router-link to="/" @click="scrollToTop">{{ t('nav.home').toUpperCase() }}</router-link>
        <router-link to="/about" @click="scrollToTop">{{ t('nav.about').toUpperCase() }}</router-link>
        <router-link to="/skills" @click="scrollToTop">{{ t('nav.skills').toUpperCase() }}</router-link>
        <a href="#" @click.prevent="goProjectsSection">{{ t('nav.projects').toUpperCase() }}</a>
        <router-link to="/blog" @click="scrollToTop">{{ t('nav.blog').toUpperCase() }}</router-link>
        <router-link to="/links" @click="scrollToTop">{{ t('nav.links').toUpperCase() }}</router-link>
        <router-link to="/contact" @click="scrollToTop">{{ t('nav.contact').toUpperCase() }}</router-link>
      </nav>

      <!-- 底部版权 -->
      <div class="footer-bottom">
        <p class="footer-copyright">&copy; 2025 Zhang Yi. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<script>
import { i18n, t as $t } from '../utils/i18n'

export default {
  name: 'Footer',
  computed: {
    __lang() { return i18n.lang }
  },
  methods: {
    t(key) {
      return $t(key)
    },
    scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    goProjectsSection() {
      const doScroll = () => {
        const el = document.getElementById('section-projects')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
      if (this.$route?.path !== '/') {
        this.$router.push('/').then(() => window.setTimeout(doScroll, 60))
        return
      }
      doScroll()
    }
  }
}
</script>

<style scoped>
.footer {
  background: var(--color-bg);
  border-top: 1px solid var(--border);
  padding: 2.5rem 0 1.5rem;
  margin-top: auto;
}

.footer .container {
  max-width: 1200px;
}

/* 顶部导航 */
.footer-nav {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--border);
}

.footer-nav a {
  color: var(--color-text);
  font-size: 0.85rem;
  font-weight: 500;
  letter-spacing: 0.5px;
  text-decoration: none;
  transition: color 0.2s ease;
  white-space: nowrap;
}

.footer-nav a:hover {
  color: var(--accent);
}

.footer-nav a.router-link-active {
  color: var(--accent);
}

/* 底部区域 */
.footer-bottom {
  display: flex;
  justify-content: center;
  align-items: center;
}

.footer-copyright {
  color: var(--color-muted);
  font-size: 0.875rem;
  margin: 0;
  line-height: 1.6;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .footer {
    padding: 2rem 0 1.25rem;
  }

  .footer-nav {
    gap: 1rem;
    margin-bottom: 1.5rem;
    padding-bottom: 1.5rem;
  }

  .footer-nav a {
    font-size: 0.8rem;
  }

  .footer-copyright {
    font-size: 0.8125rem;
  }
}

@media (max-width: 480px) {
  .footer-nav {
    gap: 0.75rem;
  }

  .footer-nav a {
    font-size: 0.75rem;
  }

  .footer-copyright {
    font-size: 0.75rem;
  }
}
</style>
