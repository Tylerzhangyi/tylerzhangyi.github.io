<template>
  <!-- 根节点勿再用 id="app"，与 index.html 挂载点重复，避免部分环境下选择器/DOM 异常 -->
  <div class="app-shell">
    <SiteHeader />
    <main class="main-content" :class="{ 'is-route-anim': routeAnimating }">
      <router-view v-slot="{ Component, route }">
        <transition
          :name="route.meta?.transition || 'page'"
          mode="out-in"
          appear
        >
          <component :is="Component" :key="route.fullPath" />
        </transition>
      </router-view>
    </main>

    <PageTransition />

    <transition name="loader-fade">
      <AppLoader
        v-if="ui.bootLoading"
        mode="boot"
        title="PORTFOLIO"
        :text="ui.loadingText"
        :progress="ui.progress"
      />
    </transition>

    <transition name="loader-fade">
      <AppLoader
        v-if="ui.routeLoading"
        mode="route"
        title="NAVIGATE"
        :text="ui.loadingText"
        :progress="ui.progress"
      />
    </transition>
  </div>
</template>

<script>
import AppLoader from './components/AppLoader.vue'
import PageTransition from './components/PageTransition.vue'
import SiteHeader from './components/SiteHeader.vue'
import { uiState, startBootLoading } from './utils/uiState'

export default {
  name: 'App',
  components: {
    AppLoader,
    PageTransition,
    SiteHeader
  },
  data() {
    return {
      routeAnimating: false,
      routeAnimTimer: null
    }
  },
  computed: {
    ui() {
      return uiState
    }
  },
  watch: {
    '$route.path'() {
      this.pulseRouteAnim()
    },
    'ui.bootLoading'(loading) {
      if (!loading) {
        document.body.classList.add('is-ready')
      }
    }
  },
  mounted() {
    startBootLoading()
    if (!this.ui.bootLoading) {
      document.body.classList.add('is-ready')
    }
  },
  beforeUnmount() {
    if (this.routeAnimTimer) window.clearTimeout(this.routeAnimTimer)
  },
  methods: {
    pulseRouteAnim() {
      this.routeAnimating = true
      if (this.routeAnimTimer) window.clearTimeout(this.routeAnimTimer)
      this.routeAnimTimer = window.setTimeout(() => {
        this.routeAnimating = false
      }, 920)
    }
  }
}
</script>

<style>
.app-shell {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
}
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  position: relative;
  overflow-x: clip;
}

/* 路由切换时的光带扫过 */
.main-content::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 50;
  pointer-events: none;
  opacity: 0;
  background: linear-gradient(
    105deg,
    transparent 42%,
    rgba(255,224,54,0.14) 50%,
    rgba(71,227,255,0.10) 54%,
    transparent 62%
  );
  transform: translateX(-120%);
}
.main-content.is-route-anim::after {
  animation: route-sweep 880ms cubic-bezier(.22,1,.36,1) both;
}
@keyframes route-sweep {
  0% { opacity: 0; transform: translateX(-120%); }
  18% { opacity: 1; }
  100% { opacity: 0; transform: translateX(120%); }
}

@media (prefers-reduced-motion: reduce) {
  .main-content.is-route-anim::after {
    animation: none;
  }
}

/* 详情页左侧平滑侧拉（进入/退出） */
.slide-left-enter-active {
  transition:
    transform 920ms cubic-bezier(.22,1,.36,1),
    opacity 680ms cubic-bezier(.22,1,.36,1),
    filter 720ms cubic-bezier(.22,1,.36,1);
  will-change: transform, opacity, filter;
}
.slide-left-leave-active {
  transition:
    transform 760ms cubic-bezier(.55,0,.85,.36),
    opacity 520ms cubic-bezier(.55,0,.85,.36),
    filter 560ms cubic-bezier(.55,0,.85,.36);
  will-change: transform, opacity, filter;
}
.slide-left-leave-active {
  pointer-events: none;
}
.slide-left-enter-from {
  transform: translateX(-14%) scale(0.985);
  opacity: 0;
  filter: blur(6px);
}
.slide-left-leave-to {
  transform: translateX(12%) scale(0.99);
  opacity: 0;
  filter: blur(4px);
}

.detail-fade-enter-active,
.detail-fade-leave-active {
  transition: opacity 0.01s linear;
}

.detail-fade-enter-from,
.detail-fade-leave-to {
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .slide-left-enter-active,
  .slide-left-leave-active,
  .detail-fade-enter-active,
  .detail-fade-leave-active {
    transition-duration: 1ms;
  }
  .slide-left-enter-from,
  .slide-left-leave-to,
  .detail-fade-enter-from,
  .detail-fade-leave-to {
    transform: none;
    opacity: 1;
    filter: none;
  }
}
</style>

