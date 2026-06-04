<template>
  <header ref="header" class="site-header site-header--minimal">
    <div class="site-header__actions">
      <button
        ref="menuBtn"
        type="button"
        class="nav-menu"
        :class="{ 'is-open': menuOpen }"
        aria-label="Menu"
        :aria-expanded="String(menuOpen)"
        @click.stop="toggleMenu"
      >
        <span class="nav-menu__text">Menu</span>
        <img class="nav-menu__icon" :src="menuIconSrc" alt="" aria-hidden="true" />
      </button>
    </div>
  </header>

  <Teleport to="body">
    <div
      v-show="menuVisible"
      class="menu-overlay"
      :class="{ 'is-open': menuOpen, 'is-closing': menuClosing }"
      :style="menuRevealStyle"
      :aria-hidden="String(!menuOpen)"
      @click.self="closeMenu"
    >
      <div class="menu-overlay__reveal" aria-hidden="true"></div>
      <div class="menu-overlay__content">
        <nav class="menu-overlay__nav" aria-label="全站导航">
          <button
            v-for="(item, i) in menuItems"
            :key="item.id"
            type="button"
            class="menu-overlay__link"
            :style="{ '--i': i }"
            @click="goSection(item.id)"
          >
            {{ item.label }}
          </button>
        </nav>
        <button type="button" class="menu-overlay__lang" @click="toggleLanguage">
          {{ language === 'zh' ? '中文 / EN' : 'EN / 中文' }}
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script>
import { i18n, setLanguage, t as $t } from '../utils/i18n'
import { computeRevealScale } from '../utils/revealScale'

const HEADER_OFFSET = 72
const MENU_ANIM_MS = 520

export default {
  name: 'SiteHeader',
  data() {
    return {
      menuOpen: false,
      menuVisible: false,
      menuClosing: false,
      menuOriginX: 0,
      menuOriginY: 0,
      menuRevealScale: 120,
      menuTimer: null
    }
  },
  computed: {
    language() {
      return i18n.lang
    },
    menuIconSrc() {
      const base = import.meta.env.BASE_URL || '/'
      return `${base}photos/menu.png`
    },
    menuRevealStyle() {
      return {
        '--menu-ox': `${this.menuOriginX}px`,
        '--menu-oy': `${this.menuOriginY}px`,
        '--menu-reveal-scale': this.menuRevealScale
      }
    },
    menuItems() {
      return [
        { id: 'home', label: $t('nav.home') },
        { id: 'about', label: $t('nav.about') },
        { id: 'education', label: $t('nav.education') },
        { id: 'projects-intro', label: $t('nav.projects') },
        { id: 'blog', label: $t('nav.blog') },
        { id: 'links', label: $t('nav.links') },
        { id: 'contact', label: $t('nav.contact') }
      ]
    }
  },
  watch: {
    language() {
      this.$forceUpdate()
    }
  },
  mounted() {
    document.addEventListener('keydown', this.onKeydown)
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.onKeydown)
    if (this.menuTimer) window.clearTimeout(this.menuTimer)
    document.body.style.overflow = ''
    document.body.classList.remove('is-menu-open')
  },
  methods: {
    onKeydown(e) {
      if (e.key === 'Escape') this.closeMenu()
    },
    setMenuOriginFromButton() {
      const btn = this.$refs.menuBtn
      if (!btn) return
      const rect = btn.getBoundingClientRect()
      this.menuOriginX = rect.left + rect.width * 0.82
      this.menuOriginY = rect.top + rect.height / 2
      this.menuRevealScale = computeRevealScale(this.menuOriginX, this.menuOriginY)
    },
    toggleMenu() {
      if (this.menuOpen) {
        this.closeMenu()
        return
      }

      this.setMenuOriginFromButton()
      this.menuClosing = false
      this.menuVisible = true
      document.body.style.overflow = 'hidden'
      document.body.classList.add('is-menu-open')

      this.$nextTick(() => {
        requestAnimationFrame(() => {
          this.menuOpen = true
        })
      })
    },
    closeMenu() {
      if (!this.menuOpen && !this.menuVisible) return

      this.menuClosing = true
      this.menuOpen = false
      document.body.style.overflow = ''
      document.body.classList.remove('is-menu-open')

      if (this.menuTimer) window.clearTimeout(this.menuTimer)
      this.menuTimer = window.setTimeout(() => {
        this.menuVisible = false
        this.menuClosing = false
      }, MENU_ANIM_MS)
    },
    toggleLanguage() {
      setLanguage(this.language === 'zh' ? 'en' : 'zh')
    },
    goSection(id) {
      this.closeMenu()
      const scrollToTarget = () => {
        const target = document.getElementById(`section-${id}`)
        if (!target) return
        const top = target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET
        window.scrollTo({ top, behavior: 'smooth' })
      }

      if (this.$route.path !== '/') {
        this.$router.push({ path: '/', hash: `#section-${id}` }).then(() => {
          window.setTimeout(scrollToTarget, 120)
        })
        return
      }
      scrollToTarget()
    }
  }
}
</script>
