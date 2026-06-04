<template>
  <div class="band" aria-hidden="true">
    <div class="track" :style="{ transform: `translateX(${tx}px)` }">
      <span v-for="i in 12" :key="i" class="chunk">{{ text }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ScrollBand',
  props: {
    text: {
      type: String,
      default: '//TYLER ZHANG'
    },
    speed: {
      type: Number,
      default: 0.22
    }
  },
  data() {
    return {
      tx: 0,
      raf: 0,
      onScroll: null
    }
  },
  mounted() {
    const update = () => {
      const base = window.scrollY * this.speed
      // 让位移在一个区间内循环，避免数值无限变大
      const loop = 520
      this.tx = -((base % loop) + loop) % loop
    }
    this.onScroll = () => {
      if (this.raf) return
      this.raf = window.requestAnimationFrame(() => {
        this.raf = 0
        update()
      })
    }
    window.addEventListener('scroll', this.onScroll, { passive: true })
    window.addEventListener('resize', this.onScroll, { passive: true })
    update()
  },
  beforeUnmount() {
    if (this.raf) window.cancelAnimationFrame(this.raf)
    if (this.onScroll) {
      window.removeEventListener('scroll', this.onScroll)
      window.removeEventListener('resize', this.onScroll)
    }
  }
}
</script>

<style scoped>
.band {
  height: var(--band-h, 96px);
  border-top: 1px solid rgba(0,0,0,0.12);
  border-bottom: 1px solid rgba(0,0,0,0.12);
  background: rgba(255,224,54,0.95);
  overflow: hidden;
  display: grid;
  align-items: center;
  position: relative;
  z-index: 2;
}
.track {
  display: inline-flex;
  gap: 48px;
  padding-left: 32px;
  will-change: transform;
}
.chunk {
  font-weight: 900;
  letter-spacing: 0.18em;
  color: rgba(0,0,0,0.92);
  font-size: var(--band-size, 5.52rem); /* 再放大一倍 */
  line-height: 0.88;
  white-space: nowrap;
}
</style>

