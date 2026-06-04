<template>
  <nav class="navbar">
    <div class="nav-shell">
      <div class="nav-content">
        <router-link to="/" class="logo" aria-label="首页">
          <SparklesIcon class="logo-icon" />
          <span class="logo-text">Tyler Zhang</span>
        </router-link>
        <button class="menu-toggle" @click="toggleMenu" aria-label="切换菜单">
          <span></span>
          <span></span>
          <span></span>
        </button>
        <ul class="nav-links" :class="{ active: isMenuOpen }">
          <li><router-link to="/" @click="closeMenu">{{ t('nav.home') }}</router-link></li>
          <li><router-link to="/about" @click="closeMenu">{{ t('nav.about') }}</router-link></li>
          <li><router-link to="/skills" @click="closeMenu">{{ t('nav.skills') }}</router-link></li>
          <li><a href="#" @click.prevent="goProjectsSection">{{ t('nav.projects') }}</a></li>
          <li><router-link to="/blog" @click="closeMenu">{{ t('nav.blog') }}</router-link></li>
          <li><router-link to="/links" @click="closeMenu">{{ t('nav.links') }}</router-link></li>
          <li><router-link to="/contact" @click="closeMenu">{{ t('nav.contact') }}</router-link></li>
          <li class="lang-toggle-wrapper">
            <button class="lang-toggle" @click="toggleLanguage">
              <span :class="{ active: language === 'zh' }">中文</span>
              <span class="divider">|</span>
              <span :class="{ active: language === 'en' }">EN</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
import { SparklesIcon } from '@heroicons/vue/24/outline'
import { i18n, setLanguage, t as $t } from '../utils/i18n'

export default {
  name: 'Navbar',
  components: {
    SparklesIcon
  },
  data() {
    return {
      isMenuOpen: false
    }
  },
  computed: {
    language() {
      return i18n.lang
    }
  },
  created() {
    document.documentElement.setAttribute('lang', this.language)
  },
  watch: {
    language(newLang) {
      document.documentElement.setAttribute('lang', newLang)
    }
  },
  methods: {
    t(key) {
      return $t(key)
    },
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen
    },
    closeMenu() {
      this.isMenuOpen = false
    },
    goProjectsSection() {
      this.closeMenu()
      const doScroll = () => {
        const el = document.getElementById('section-projects')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
      if (this.$route?.path !== '/') {
        this.$router.push('/').then(() => window.setTimeout(doScroll, 60))
        return
      }
      doScroll()
    },
    toggleLanguage() {
      const newLang = this.language === 'zh' ? 'en' : 'zh'
      setLanguage(newLang)
    }
  }
}
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  pointer-events: none;
  padding: 14px 14px 0;
}

.nav-shell {
  pointer-events: auto;
  margin: 0 auto;
  max-width: 1240px;
  border-radius: 18px;
  border: 1px solid var(--border-soft);
  background: rgba(10, 15, 24, 0.58);
  backdrop-filter: blur(12px) saturate(160%);
  box-shadow: var(--shadow-sm);
  position: relative;
  overflow: hidden;
}

.nav-shell::before {
  content: '';
  position: absolute;
  inset: -1px;
  background:
    radial-gradient(480px 120px at 18% 0%, rgba(71,227,255,0.16), transparent 60%),
    radial-gradient(520px 120px at 82% 0%, rgba(255,42,125,0.16), transparent 62%),
    linear-gradient(90deg, rgba(255,255,255,0.06), transparent 35%, transparent 65%, rgba(255,255,255,0.05));
  opacity: 0.9;
  pointer-events: none;
  mask-image: linear-gradient(#000, #000);
}

.nav-shell::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 4px);
  opacity: 0.08;
  z-index: 1000;
}

.nav-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  gap: 14px;
  position: relative;
  z-index: 1;
}

.logo {
  font-size: 1.05rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.90);
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  text-align: left;
  gap: 10px;
  padding: 10px 10px;
  border-radius: 12px;
  transition: background 220ms var(--ease-io), color 220ms var(--ease-io);
}

.logo-icon {
  width: 20px;
  height: 20px;
  color: rgba(255,42,125,0.95);
  filter: drop-shadow(0 0 14px rgba(255,42,125,0.25));
}

.logo:hover {
  background: rgba(255,255,255,0.05);
  color: rgba(255,255,255,0.96);
}

.logo-text {
  display: inline-block;
}

.nav-links {
  display: flex;
  list-style: none;
  gap: 18px;
  margin: 0;
  padding: 0;
  align-items: center;
}

.nav-links a {
  color: rgba(255,255,255,0.78);
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-size: 0.82rem;
  transition: color 220ms var(--ease-io), background 220ms var(--ease-io), transform 220ms var(--ease-io);
  position: relative;
  padding: 10px 10px;
  border-radius: 12px;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: rgba(255,255,255,0.94);
  background: rgba(255,255,255,0.05);
  transform: translateY(-1px);
}

.nav-links a.router-link-active::after {
  content: '';
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: 6px;
  height: 2px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(71,227,255,0.55), rgba(255,42,125,0.85));
  box-shadow: 0 0 20px rgba(255,42,125,0.25);
}

.menu-toggle {
  display: none;
  flex-direction: column;
  background: none;
  border: none;
  cursor: pointer;
  gap: 5px;
}

.menu-toggle span {
  width: 25px;
  height: 3px;
  background: var(--color-text);
  transition: all 0.3s;
}

.lang-toggle-wrapper {
  display: flex;
  align-items: center;
  margin-left: 6px;
  padding-left: 10px;
  border-left: 1px solid var(--border-soft);
}

.lang-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 9px 12px;
  border-radius: 999px;
  border: 1px solid var(--border-soft);
  background: rgba(255,255,255,0.045);
  color: rgba(255,255,255,0.78);
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition: all 220ms var(--ease-io);
}

.lang-toggle:hover {
  background: rgba(255,255,255,0.07);
}

.lang-toggle .divider {
  color: rgba(255,255,255,0.25);
}

.lang-toggle span.active {
  color: rgba(255,255,255,0.96);
}

@media (max-width: 768px) {
  .menu-toggle {
    display: flex;
  }

  .nav-links {
    position: absolute;
    top: calc(100% + 10px);
    left: 10px;
    right: 10px;
    background: rgba(10, 15, 24, 0.78);
    border: 1px solid var(--border-soft);
    border-radius: 16px;
    flex-direction: column;
    padding: 12px;
    gap: 6px;
    box-shadow: var(--shadow-sm);
    transform: translateY(-100%);
    opacity: 0;
    visibility: hidden;
    transition: all 280ms var(--ease-out);
    backdrop-filter: blur(12px) saturate(160%);
  }

  .nav-links.active {
    transform: translateY(0) translateZ(0);
    opacity: 1;
    visibility: visible;
  }

  .nav-links a {
    width: 100%;
    justify-content: center;
    text-align: center;
  }

  .lang-toggle-wrapper {
    margin-left: 0;
    margin-top: 6px;
    padding-left: 0;
    border-left: none;
    border-top: 1px solid var(--border-soft);
    padding-top: 10px;
    justify-content: center;
  }
}
</style>

