<template>
  <section
    ref="section"
    id="section-links"
    data-scroll-section="links"
    class="links-scroll"
  >
    <div
      ref="content"
      class="links-scroll__scatter links-scroll__content links page"
    >
      <div
        ref="canvas"
        class="scatter-canvas"
        :class="{ 'is-drag-active': dragState?.moved }"
        aria-label="链接卡片"
      >
      <header class="scatter-header">
        <p class="scatter-kicker">{{ t('links.kicker') }}</p>
        <h1 class="scatter-title">{{ t('links.title') }}</h1>
        <p class="scatter-hint">{{ t('links.dragHint') }}</p>
      </header>

      <article
        v-for="(link, index) in linksList"
        :key="`${link.title}-${index}`"
        class="scatter-card"
        :class="{ 'is-dragging': dragState?.moved && dragState?.index === index }"
        :style="cardLayout(index)"
        @pointerdown.capture="onCardPointerDown($event, index)"
        @dragstart.capture.prevent
      >
        <div class="scatter-card__tilt">
          <button
            type="button"
            class="scatter-card__grip"
            :aria-label="t('links.dragHint')"
            @pointerdown.stop="onGripPointerDown($event, index)"
          >
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </button>
          <div class="scatter-card__body">
            <span class="scatter-card__accent" aria-hidden="true"></span>
            <div class="scatter-card__icon">
              <component :is="getIconComponent(link.icon)" />
            </div>
            <h3 class="scatter-card__title">{{ link.title }}</h3>
            <p class="scatter-card__desc">{{ link.description }}</p>
            <a
              :href="link.url"
              target="_blank"
              rel="noopener noreferrer"
              class="scatter-card__cta"
              @pointerdown.stop
              @click="onVisitClick($event, index)"
            >
              {{ t('links.visit') }}
            </a>
          </div>
        </div>
      </article>
      </div>
    </div>
  </section>
</template>

<script>
import {
  BoltIcon,
  BookOpenIcon,
  CodeBracketIcon,
  QuestionMarkCircleIcon,
  RocketLaunchIcon,
  PaintBrushIcon,
  LinkIcon
} from '@heroicons/vue/24/outline'
import { i18n, t as $t, getDict } from '../utils/i18n'
import './links-drag-lock.css'

/** 相对整页画布（含标题区）的初始散落布局 */
const SCATTER_LAYOUT = [
  { x: 4, y: 10, r: -6, z: 2 },
  { x: 38, y: 4, r: 5, z: 4 },
  { x: 72, y: 12, r: -7.5, z: 1 },
  { x: 6, y: 38, r: 7, z: 3 },
  { x: 46, y: 32, r: -4, z: 6 },
  { x: 76, y: 40, r: 6, z: 2 },
  { x: 2, y: 62, r: -5.5, z: 3 },
  { x: 36, y: 68, r: 3, z: 5 },
  { x: 70, y: 60, r: -4.5, z: 4 }
]

const CARD_ACCENTS = [
  '#3b82f6',
  '#8b5cf6',
  '#0ea5e9',
  '#f59e0b',
  '#10b981',
  '#ec4899',
  '#6366f1',
  '#14b8a6',
  '#64748b'
]

const STORAGE_KEY = 'portfolio-links-scatter-v3'
const DRAG_THRESHOLD = 5
/** 允许卡片约 40% 超出画布边缘 */
const OVERFLOW_RATIO = 0.4

export default {
  name: 'Links',
  components: {
    BoltIcon,
    BookOpenIcon,
    CodeBracketIcon,
    QuestionMarkCircleIcon,
    RocketLaunchIcon,
    PaintBrushIcon,
    LinkIcon
  },
  data() {
    return {
      cardPositions: [],
      dragState: null,
      clickBlockIndex: -1,
      dragEnabled: true,
      dragShield: null,
      scrollLocked: false,
      savedScrollY: 0
    }
  },
  computed: {
    currentLang() {
      return i18n.lang
    },
    linksList() {
      const links = getDict('links.linksList') || []
      const iconMap = [
        'CodeBracketIcon',
        'BookOpenIcon',
        'CodeBracketIcon',
        'QuestionMarkCircleIcon',
        'RocketLaunchIcon',
        'PaintBrushIcon',
        'LinkIcon',
        'LinkIcon',
        'LinkIcon'
      ]
      const urlMap = {
        zh: [
          'https://github.com/Yungu-HZ-Highschool/',
          'https://eric.mojalab.cn/',
          'https://github.com/',
          'https://stackoverflow.com/',
          'https://cn.vitejs.dev/',
          'https://css-tricks.com/',
          'https://wraje.github.io/',
          'https://mathewmsj.github.io/',
          'https://dengruihan.github.io/'
        ],
        en: [
          'https://github.com/Yungu-HZ-Highschool',
          'https://eric.mojalab.cn/',
          'https://github.com/',
          'https://stackoverflow.com/',
          'https://vitejs.dev/',
          'https://css-tricks.com/',
          'https://wraje.github.io/',
          'https://mathewmsj.github.io/',
          'https://dengruihan.github.io/'
        ]
      }
      return links.map((link, index) => ({
        ...link,
        icon: iconMap[index] || 'LinkIcon',
        url: urlMap[i18n.lang][index] || urlMap.en[index]
      }))
    }
  },
  mounted() {
    this.initPositions()
    this.onPointerMoveBound = this.onPointerMove.bind(this)
    this.onPointerUpBound = this.onPointerUp.bind(this)
    this.dragEnabled = !window.matchMedia('(max-width: 820px)').matches
    window.addEventListener('resize', this.onResize)
  },
  watch: {
    currentLang() {
      this.initPositions()
    }
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.onResize)
    this.unbindDragListeners()
    this.teardownDragShield()
    this.unlockPageScroll()
  },
  methods: {
    t(key) {
      return $t(key)
    },
    onResize() {
      this.dragEnabled = !window.matchMedia('(max-width: 820px)').matches
    },
    initPositions() {
      const count = this.linksList.length
      let loaded = null
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) loaded = JSON.parse(raw)
      } catch {
        // ignore
      }
      if (Array.isArray(loaded) && loaded.length === count) {
        this.cardPositions = loaded.map((p, i) => ({
          ...(SCATTER_LAYOUT[i] || SCATTER_LAYOUT[0]),
          ...p
        }))
      } else {
        this.cardPositions = SCATTER_LAYOUT.slice(0, count).map((p) => ({ ...p }))
      }
    },
    savePositions() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.cardPositions))
      } catch {
        // ignore
      }
    },
    cardLayout(index) {
      const layout = this.cardPositions[index] ?? SCATTER_LAYOUT[index] ?? SCATTER_LAYOUT[0]
      const dragging = this.dragState?.index === index
      return {
        '--card-rotate': `${layout.r}deg`,
        '--card-accent': CARD_ACCENTS[index % CARD_ACCENTS.length],
        left: `${layout.x}%`,
        top: `${layout.y}%`,
        zIndex: dragging ? 200 : layout.z
      }
    },
    getCanvasRect() {
      return this.$refs.canvas?.getBoundingClientRect()
    },
    clampPosition(xPct, yPct, cardEl) {
      const canvas = this.getCanvasRect()
      if (!canvas || !cardEl) return { x: xPct, y: yPct }

      const cardW = cardEl.offsetWidth
      const cardH = cardEl.offsetHeight
      const wPct = (cardW / canvas.width) * 100
      const hPct = (cardH / canvas.height) * 100
      const padX = wPct * OVERFLOW_RATIO
      const padY = hPct * OVERFLOW_RATIO

      return {
        x: Math.min(100 - wPct + padX, Math.max(-padX, xPct)),
        y: Math.min(100 - hPct + padY, Math.max(-padY, yPct))
      }
    },
    bindDragListeners() {
      window.addEventListener('pointermove', this.onPointerMoveBound, { passive: false })
      window.addEventListener('pointerup', this.onPointerUpBound)
      window.addEventListener('pointercancel', this.onPointerUpBound)
    },
    unbindDragListeners() {
      window.removeEventListener('pointermove', this.onPointerMoveBound)
      window.removeEventListener('pointerup', this.onPointerUpBound)
      window.removeEventListener('pointercancel', this.onPointerUpBound)
    },
    lockPageScroll() {
      if (this.scrollLocked) return
      this.scrollLocked = true
      this.savedScrollY = window.scrollY
      document.documentElement.classList.add('scatter-drag-lock')
      document.body.classList.add('scatter-drag-lock')
    },
    unlockPageScroll() {
      if (!this.scrollLocked) return
      document.documentElement.classList.remove('scatter-drag-lock')
      document.body.classList.remove('scatter-drag-lock')
      window.scrollTo(0, this.savedScrollY)
      this.scrollLocked = false
    },
    setupDragShield() {
      if (this.dragShield) return
      this.dragShield = (ev) => ev.preventDefault()
      document.documentElement.classList.add('scatter-drag-lock')
      document.body.classList.add('scatter-drag-lock')
      document.addEventListener('selectstart', this.dragShield, true)
      document.addEventListener('dragstart', this.dragShield, true)
      this.onWheelPrevent = (ev) => ev.preventDefault()
      document.addEventListener('wheel', this.onWheelPrevent, { passive: false })
      this.onTouchMovePrevent = (ev) => ev.preventDefault()
      document.addEventListener('touchmove', this.onTouchMovePrevent, { passive: false })
    },
    teardownDragShield() {
      document.documentElement.classList.remove('scatter-drag-lock')
      document.body.classList.remove('scatter-drag-lock')
      if (this.dragShield) {
        document.removeEventListener('selectstart', this.dragShield, true)
        document.removeEventListener('dragstart', this.dragShield, true)
        this.dragShield = null
      }
      if (this.onWheelPrevent) {
        document.removeEventListener('wheel', this.onWheelPrevent)
        this.onWheelPrevent = null
      }
      if (this.onTouchMovePrevent) {
        document.removeEventListener('touchmove', this.onTouchMovePrevent)
        this.onTouchMovePrevent = null
      }
    },
    releaseCardFocus(cardEl) {
      cardEl?.querySelector?.('.scatter-card__cta')?.blur?.()
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur()
      }
    },
    beginDrag(e, index, { preventNow = false } = {}) {
      const cardEl = e.currentTarget?.closest?.('.scatter-card')
      if (!cardEl) return

      if (preventNow) e.preventDefault()

      this.dragState = {
        index,
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        originX: this.cardPositions[index].x,
        originY: this.cardPositions[index].y,
        moved: false,
        cardEl
      }
      this.bindDragListeners()

      try {
        cardEl.setPointerCapture(e.pointerId)
      } catch {
        // ignore
      }
    },
    onGripPointerDown(e, index) {
      if (!this.dragEnabled || e.button !== 0) return
      this.beginDrag(e, index, { preventNow: true })
    },
    onCardPointerDown(e, index) {
      if (!this.dragEnabled || e.button !== 0) return
      if (e.target.closest('.scatter-card__grip, .scatter-card__cta')) return
      this.beginDrag(e, index)
    },
    onPointerMove(e) {
      if (!this.dragState || e.pointerId !== this.dragState.pointerId) return

      e.preventDefault()

      const { index, startX, startY, originX, originY, cardEl } = this.dragState
      const dx = e.clientX - startX
      const dy = e.clientY - startY

      if (!this.dragState.moved) {
        if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return
        this.dragState.moved = true
        this.lockPageScroll()
        this.setupDragShield()
      }

      const canvas = this.getCanvasRect()
      if (!canvas) return

      const originLeftPx = (originX / 100) * canvas.width
      const originTopPx = (originY / 100) * canvas.height
      const nextX = ((originLeftPx + dx) / canvas.width) * 100
      const nextY = ((originTopPx + dy) / canvas.height) * 100
      const clamped = this.clampPosition(nextX, nextY, cardEl)

      const prev = this.cardPositions[index]
      this.cardPositions.splice(index, 1, { ...prev, x: clamped.x, y: clamped.y })
    },
    onPointerUp(e) {
      if (!this.dragState || e.pointerId !== this.dragState.pointerId) return

      const { index, moved, cardEl } = this.dragState

      try {
        cardEl?.releasePointerCapture?.(e.pointerId)
      } catch {
        // ignore
      }

      if (moved) {
        this.savePositions()
        this.clickBlockIndex = index
        this.releaseCardFocus(cardEl)
        window.setTimeout(() => {
          this.clickBlockIndex = -1
        }, 120)
      }

      this.dragState = null
      this.teardownDragShield()
      this.unlockPageScroll()
      this.unbindDragListeners()
    },
    onVisitClick(e, index) {
      if (this.clickBlockIndex === index) {
        e.preventDefault()
      }
    },
    getIconComponent(iconName) {
      const icons = {
        BoltIcon,
        BookOpenIcon,
        CodeBracketIcon,
        QuestionMarkCircleIcon,
        RocketLaunchIcon,
        PaintBrushIcon,
        LinkIcon
      }
      return icons[iconName] || LinkIcon
    }
  }
}
</script>

<style scoped>
.links.page {
  width: 100%;
  min-height: max(100vh, 1120px);
  padding: 48px 24px 120px;
  color: #14161a;
  background: #fff;
  overflow: visible;
}

.scatter-canvas {
  position: relative;
  width: 100%;
  max-width: 1180px;
  min-height: max(100vh, 1120px);
  margin: 0 auto;
  touch-action: pan-y;
  overflow: visible;
}

.scatter-canvas.is-drag-active {
  cursor: var(--cursor-grabbing, grabbing);
  user-select: none;
  touch-action: none;
}

.scatter-header {
  position: relative;
  z-index: 20;
  padding: 24px 8px 32px;
  pointer-events: none;
}

.scatter-header > * {
  pointer-events: auto;
}

.scatter-kicker {
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(0, 0, 0, 0.42);
  margin-bottom: 12px;
}

.scatter-title {
  font-size: clamp(2rem, 4.5vw, 3.1rem);
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1.05;
  color: #12151a;
}

.scatter-hint {
  margin-top: 12px;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  color: rgba(0, 0, 0, 0.38);
}

.scatter-card {
  position: absolute;
  width: min(272px, 30vw);
  will-change: left, top;
}

.scatter-card__tilt {
  position: relative;
  transform: rotate(var(--card-rotate, 0deg));
  transform-origin: center center;
  transition: transform 480ms cubic-bezier(0.22, 1, 0.36, 1);
  cursor: var(--cursor-grab, grab);
}

.scatter-card.is-dragging {
  z-index: 200 !important;
}

.scatter-card.is-dragging .scatter-card__tilt {
  transition: none;
  cursor: var(--cursor-grabbing, grabbing);
  transform: rotate(var(--card-rotate, 0deg)) scale(1.04);
}

.scatter-card.is-dragging .scatter-card__body {
  box-shadow:
    0 4px 8px rgba(0, 0, 0, 0.06),
    0 20px 48px rgba(0, 0, 0, 0.14),
    0 48px 96px rgba(0, 0, 0, 0.1);
}

.scatter-card__grip {
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 3;
  display: flex;
  gap: 3px;
  padding: 10px 12px;
  margin: 0;
  border: none;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.85);
  cursor: var(--cursor-grab, grab);
  opacity: 0.5;
  transition: opacity 0.25s ease, background 0.25s ease;
  -webkit-user-drag: none;
  user-select: none;
}

.scatter-card__grip span {
  display: block;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  pointer-events: none;
}

.scatter-card:hover .scatter-card__grip,
.scatter-card.is-dragging .scatter-card__grip {
  opacity: 0.9;
  background: rgba(255, 255, 255, 0.95);
}

.scatter-card.is-dragging .scatter-card__grip {
  cursor: var(--cursor-grabbing, grabbing);
}

.scatter-card__body {
  display: block;
  padding: 22px 24px 20px;
  color: inherit;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.07);
  border-radius: 16px;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.04),
    0 8px 24px rgba(0, 0, 0, 0.06),
    0 24px 48px rgba(0, 0, 0, 0.04);
  transition:
    box-shadow 520ms cubic-bezier(0.22, 1, 0.36, 1),
    border-color 380ms ease;
  -webkit-user-drag: none;
  user-select: text;
}

.scatter-card__accent {
  display: block;
  width: 28px;
  height: 3px;
  border-radius: 2px;
  background: var(--card-accent, #3b82f6);
  margin-bottom: 16px;
  opacity: 0.85;
  transition: width 420ms cubic-bezier(0.22, 1, 0.36, 1);
}

.scatter-card__icon {
  width: 1.35rem;
  height: 1.35rem;
  margin-bottom: 12px;
  color: rgba(0, 0, 0, 0.38);
}

.scatter-card__icon :deep(svg) {
  width: 100%;
  height: 100%;
  stroke-width: 1.5;
}

.scatter-card__title {
  font-size: 1.02rem;
  font-weight: 600;
  letter-spacing: -0.025em;
  line-height: 1.3;
  color: #12151a;
  margin-bottom: 8px;
}

.scatter-card__desc {
  font-size: 0.84rem;
  line-height: 1.55;
  color: rgba(0, 0, 0, 0.52);
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}

.scatter-card__cta {
  display: inline-flex;
  align-items: center;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--card-accent, #3b82f6);
  text-decoration: none;
  cursor: var(--cursor-pointer, pointer);
  border-radius: 4px;
  transition: letter-spacing 380ms ease, color 380ms ease, opacity 0.2s ease;
  -webkit-user-drag: none;
}

.scatter-card__cta:hover {
  letter-spacing: 0.1em;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.scatter-card__cta:focus-visible {
  outline: 2px solid var(--card-accent, #3b82f6);
  outline-offset: 3px;
}

/* 悬停：保持倾斜，仅上浮放大 */
.scatter-card:hover:not(.is-dragging) {
  z-index: 50;
}

.scatter-card:hover:not(.is-dragging) .scatter-card__tilt {
  transform: rotate(var(--card-rotate)) translateY(-12px) scale(1.04);
}

.scatter-card:hover:not(.is-dragging) .scatter-card__body {
  border-color: rgba(0, 0, 0, 0.1);
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.04),
    0 16px 40px rgba(0, 0, 0, 0.1),
    0 40px 80px rgba(0, 0, 0, 0.08);
}

.scatter-card:hover:not(.is-dragging) .scatter-card__accent {
  width: 40px;
}

@media (max-width: 1100px) {
  .scatter-card {
    width: min(248px, 32vw);
  }
}

@media (max-width: 820px) {
  .links.page {
    padding: 48px 20px 72px;
  }

  .scatter-canvas {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    min-height: auto;
    touch-action: auto;
  }

  .scatter-header {
    position: relative;
    z-index: 1;
    padding: 0 8px 16px;
    pointer-events: auto;
  }

  .scatter-hint {
    display: none;
  }

  .scatter-card {
    position: relative;
    left: auto !important;
    top: auto !important;
    width: 100%;
    max-width: 400px;
  }

  .scatter-card:nth-child(odd) {
    align-self: flex-start;
    margin-left: 4%;
  }

  .scatter-card:nth-child(even) {
    align-self: flex-end;
    margin-right: 4%;
  }

  .scatter-card:hover:not(.is-dragging) .scatter-card__tilt {
    transform: rotate(var(--card-rotate)) translateY(-8px) scale(1.02) !important;
  }

  .scatter-card__grip {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .scatter-card__tilt,
  .scatter-card__body,
  .scatter-card__accent,
  .scatter-card__cta {
    transition-duration: 0.01ms;
  }
}
</style>
