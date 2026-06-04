<template>
  <aside
    class="side-nav"
    :class="{ expanded: isExpanded }"
    aria-label="主导航"
    @mouseenter="isExpanded = true"
    @mouseleave="isExpanded = false"
  >
    <div class="panel" :style="{ '--active-index': String(activeIndex) }">
      <div class="brand">
        <div class="rail">
          <img class="brand-mark" src="/photos/circuit.svg" alt="" aria-hidden="true" />
        </div>
        <div class="brand-text">
          <div class="brand-title">PORTFOLIO</div>
          <div class="brand-sub">Zhang Yi</div>
        </div>
      </div>

      <nav class="menu" aria-label="页面">
        <div class="active-indicator" aria-hidden="true"></div>
        <button
          v-for="(it, idx) in items"
          :key="it.id"
          class="item"
          :class="{ active: activeSection === it.id }"
          type="button"
          @click="goSection(it.id)"
        >
          <span class="ic-wrap" aria-hidden="true">
            <component :is="it.icon" class="ic" />
          </span>
          <span class="txt">{{ it.label }}</span>
          <span class="tip">{{ it.label }}</span>
        </button>
      </nav>

      <div class="bottom">
        <button class="lang" type="button" @click="toggleLanguage" aria-label="切换语言">
          <span class="ic-wrap" aria-hidden="true"><LanguageIcon class="ic" /></span>
          <span class="txt">中文 / EN</span>
          <span class="tip">Language</span>
        </button>
      </div>
    </div>
  </aside>
</template>

<script>
import { i18n, setLanguage, t as $t } from '../utils/i18n'
import {
  ChatBubbleLeftRightIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  HomeIcon,
  LinkIcon,
  Squares2X2Icon,
  UserIcon,
  WrenchScrewdriverIcon
} from '@heroicons/vue/24/outline'
import { LanguageIcon } from '@heroicons/vue/24/solid'

export default {
  name: 'SideNav',
  components: {
    ChatBubbleLeftRightIcon,
    AcademicCapIcon,
    DocumentTextIcon,
    HomeIcon,
    LinkIcon,
    Squares2X2Icon,
    UserIcon,
    WrenchScrewdriverIcon,
    LanguageIcon
  },
  data() {
    return {
      isExpanded: false,
      activeSection: 'home',
      observer: null,
      rafId: 0,
      onScrollBound: null,
      items: []
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.setupObserver()
      this.setupScrollSpy()
    })
  },
  beforeUnmount() {
    if (this.observer) this.observer.disconnect()
    this.teardownScrollSpy()
  },
  watch: {
    '$route.path'() {
      window.setTimeout(() => {
        this.setupObserver()
        // 路由返回首页但没有滚动事件时，也要立即刷新高亮
        this.setupScrollSpy()
        this.onScrollBound?.()
      }, 80)
    },
    language() {
      this.refreshLabels()
    }
  },
  computed: {
    language() {
      return i18n.lang
    },
    activeIndex() {
      const idx = this.items.findIndex((it) => it.id === this.activeSection)
      return idx < 0 ? 0 : idx
    }
  },
  created() {
    this.refreshLabels()
  },
  methods: {
    t(key) {
      return $t(key)
    },
    refreshLabels() {
      this.items = [
        { id: 'home', label: $t('nav.home'), icon: HomeIcon },
        { id: 'about', label: $t('nav.about'), icon: UserIcon },
        { id: 'education', label: $t('nav.education'), icon: AcademicCapIcon },
        { id: 'skills', label: $t('nav.skills'), icon: WrenchScrewdriverIcon },
        { id: 'projects', label: $t('nav.projects'), icon: Squares2X2Icon },
        { id: 'blog', label: $t('nav.blog'), icon: DocumentTextIcon },
        { id: 'links', label: $t('nav.links'), icon: LinkIcon },
        { id: 'contact', label: $t('nav.contact'), icon: ChatBubbleLeftRightIcon }
      ]
    },
    toggleLanguage() {
      const newLang = this.language === 'zh' ? 'en' : 'zh'
      setLanguage(newLang)
    },
    goSection(id) {
      const scrollToTarget = () => {
        const target = document.getElementById(`section-${id}`)
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' })
          this.activeSection = id
        }
      }

      if (this.$route.path !== '/') {
        this.$router.push('/').then(() => {
          window.setTimeout(scrollToTarget, 50)
        })
        return
      }
      scrollToTarget()
    },
    setupObserver() {
      if (this.observer) {
        this.observer.disconnect()
        this.observer = null
      }
      const sections = Array.from(document.querySelectorAll('[data-scroll-section]'))
      if (!sections.length) return

      this.observer = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
          if (!visible) return
          const id = visible.target.getAttribute('data-scroll-section')
          if (id) this.activeSection = id
        },
        // 更贴近“章节滚动高亮”的手感：用 rootMargin 锁定视口中间区域
        { threshold: [0, 0.08, 0.18, 0.3], rootMargin: '-35% 0px -55% 0px' }
      )
      sections.forEach((section) => this.observer.observe(section))
    },
    setupScrollSpy() {
      // IntersectionObserver 在某些布局/浏览器下可能不稳定，这里加一个 rAF 的滚动兜底
      if (this.onScrollBound) return
      this.onScrollBound = () => {
        if (this.rafId) return
        this.rafId = window.requestAnimationFrame(() => {
          this.rafId = 0
          const sections = Array.from(document.querySelectorAll('[data-scroll-section]'))
          if (!sections.length) return

          const anchorY = Math.round(window.innerHeight * 0.35)
          let bestId = this.activeSection
          let bestDist = Number.POSITIVE_INFINITY

          for (const el of sections) {
            const rect = el.getBoundingClientRect()
            const dist = Math.abs(rect.top - anchorY)
            if (dist < bestDist) {
              bestDist = dist
              bestId = el.getAttribute('data-scroll-section') || bestId
            }
          }
          if (bestId) this.activeSection = bestId
        })
      }
      window.addEventListener('scroll', this.onScrollBound, { passive: true })
      window.addEventListener('resize', this.onScrollBound, { passive: true })
      this.onScrollBound()
    },
    teardownScrollSpy() {
      if (this.rafId) {
        window.cancelAnimationFrame(this.rafId)
        this.rafId = 0
      }
      if (this.onScrollBound) {
        window.removeEventListener('scroll', this.onScrollBound)
        window.removeEventListener('resize', this.onScrollBound)
        this.onScrollBound = null
      }
    }
  }
}
</script>

<style scoped>
.side-nav {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 86px;
  z-index: 1500;
  pointer-events: none;
}

.panel {
  pointer-events: auto;
  width: 228px;
  height: 100%;
  background: rgba(245, 245, 246, 0.94);
  color: #17191d;
  border-right: 1px solid rgba(0,0,0,0.07);
  /* 用 clip-path 裁切：收缩仍显示图标轨道，展开显示文字（图标永远可见） */
  clip-path: inset(0 calc(100% - 86px) 0 0 round 0);
  transition: clip-path 620ms cubic-bezier(.25,1,.3,1), box-shadow 620ms var(--ease-out);
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 16px;
  padding: 16px 12px 12px;
  backdrop-filter: blur(7px) saturate(120%);
  box-shadow: 8px 0 28px rgba(0,0,0,0.08);
}

.side-nav.expanded .panel {
  clip-path: inset(0 0 0 0 round 0);
  box-shadow: 12px 0 36px rgba(0,0,0,0.12);
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 10px;
  border-bottom: 1px solid rgba(0,0,0,0.06);
}
.rail {
  width: 46px;
  display: grid;
  place-items: center;
}
.brand-mark {
  width: 38px;
  height: 38px;
}
.brand-text {
  opacity: 0;
  transform: translateX(-6px);
  transition: opacity 240ms var(--ease-io), transform 240ms var(--ease-io);
}
.side-nav.expanded .brand-text {
  opacity: 1;
  transform: translateX(0);
}
.brand-title {
  font-weight: 900;
  letter-spacing: 0.18em;
  font-size: 0.86rem;
}
.brand-sub {
  font-size: 0.78rem;
  color: rgba(0,0,0,0.55);
  font-weight: 700;
}

.menu {
  display: grid;
  gap: 0;
  align-content: start;
  overflow-y: auto;
  padding: 0;
  position: relative;
}

.active-indicator {
  position: absolute;
  left: 0;
  right: 0;
  height: 48px;
  border-radius: 0;
  background: rgba(0,0,0,0.075);
  transform: translateY(calc(var(--active-index) * 48px));
  transition: transform 480ms cubic-bezier(.34,1.28,.64,1);
  pointer-events: none;
  z-index: 0;
}

.item {
  position: relative;
  display: grid;
  grid-template-columns: 52px 1fr;
  align-items: center;
  gap: 10px;
  min-height: 48px;
  border-radius: 0;
  padding: 0 10px 0 0;
  color: rgba(0,0,0,0.72);
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  border: 0;
  transition:
    color 220ms var(--ease-io),
    transform 220ms var(--ease-spring);
  appearance: none;
  text-align: left;
  width: 100%;
  cursor: pointer;
  overflow: hidden;
  background: transparent;
  z-index: 1;
  box-shadow: inset 0 -1px rgba(0,0,0,0.06);
}
.item:hover {
  color: #14161b;
}
.item:active {
  transform: scale(0.98);
}
.item.active {
  color: #14161b;
}

.item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 10px;
  bottom: 10px;
  width: 3px;
  border-radius: 999px;
  background: #14161b;
  transform: scaleY(0);
  animation: nav-bar-in 420ms cubic-bezier(.34,1.28,.64,1) forwards;
}
@keyframes nav-bar-in {
  to { transform: scaleY(1); }
}

.item:not(.active):hover::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.04);
  pointer-events: none;
}

.ic-wrap {
  width: 52px;
  height: 48px;
  border-radius: 0;
  display: grid;
  place-items: center;
  background: transparent;
  border: 0;
}
.ic {
  width: 22px;
  height: 22px;
  color: rgba(0,0,0,0.55);
  transition:
    color 220ms var(--ease-io),
    transform 320ms var(--ease-spring);
}

.item.active .ic,
.item:hover .ic {
  color: #14161b;
  transform: scale(1.08);
}
.item.active .ic {
  transform: scale(1.12);
}

.txt {
  opacity: 0;
  transform: translateX(-6px);
  transition: opacity 280ms var(--ease-io), transform 320ms var(--ease-out);
  white-space: nowrap;
}
.side-nav.expanded .txt {
  opacity: 1;
  transform: translateX(0);
}

.tip {
  position: absolute;
  left: calc(100% + 10px);
  top: 50%;
  transform: translateY(-50%);
  background: rgba(22,24,30,0.94);
  border: 1px solid rgba(255,255,255,0.12);
  color: rgba(255,255,255,0.95);
  border-radius: 8px;
  padding: 6px 8px;
  font-size: 0.72rem;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 260ms var(--ease-io), transform 260ms var(--ease-out);
}
.side-nav:not(.expanded) .item:hover .tip {
  opacity: 1;
  transform: translateY(-50%) translateX(4px);
}
.side-nav.expanded .tip {
  display: none;
}

.bottom {
  border-top: 1px solid rgba(0,0,0,0.08);
  padding-top: 10px;
}
.lang {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  border: 0;
  border-radius: 0;
  background: transparent;
  color: rgba(0,0,0,0.72);
  font-weight: 800;
  letter-spacing: 0.08em;
  padding: 0 10px 0 0;
  min-height: 44px;
  cursor: pointer;
  position: relative;
  z-index: 1;
  overflow: hidden;
  transition: color 220ms var(--ease-io), transform 220ms var(--ease-spring);
}
.lang:hover {
  color: #14161b;
  transform: translateX(2px);
}
.lang:active {
  transform: scale(0.98);
}
.lang:hover::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.04);
  pointer-events: none;
}

@media (max-width: 980px) {
  .side-nav {
    display: none;
  }
}
</style>

