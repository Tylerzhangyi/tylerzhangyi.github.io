<template>
  <div
    class="app-loader"
    :class="{
      'is-boot': mode === 'boot',
      'is-route': mode === 'route',
      finishing: mode === 'boot' && progress >= 100
    }"
    role="status"
    aria-live="polite"
    aria-label="加载中"
  >
    <div class="loader-bg" aria-hidden="true"></div>
    <div class="loader-noise" aria-hidden="true"></div>

    <div v-if="mode === 'boot'" class="boot" :style="{ '--p': String(Math.max(0, Math.min(100, Math.round(progress)))) }">
      <div class="boot-rail" aria-label="加载进度">
        <div class="boot-fill" aria-hidden="true"></div>
      </div>
      <div class="boot-pct mono">{{ Math.max(0, Math.min(100, Math.round(progress))) }}%</div>
    </div>

    <div v-else class="loader-center">
      <div class="mark">
        <div class="mark-ring" aria-hidden="true"></div>
        <div class="mark-core" aria-hidden="true"></div>
      </div>

      <div class="text">
        <div class="title">{{ title }}</div>
        <div class="sub">
          <span class="mono">{{ text }}</span>
          <span class="dots" aria-hidden="true">
            <span></span><span></span><span></span>
          </span>
        </div>
      </div>

      <div class="bar" aria-hidden="true">
        <div class="bar-fill" :style="{ width: `${progress}%` }"></div>
        <div class="bar-glow"></div>
      </div>
    </div>

    <div class="scan" aria-hidden="true"></div>
  </div>
</template>

<script>
export default {
  name: 'AppLoader',
  props: {
    mode: {
      type: String,
      default: 'boot' // boot | route
    },
    title: {
      type: String,
      default: 'SYSTEM'
    },
    text: {
      type: String,
      default: 'LOADING'
    },
    progress: {
      type: Number,
      default: 0
    }
  }
}
</script>

<style scoped>
.app-loader {
  position: fixed;
  inset: 0;
  z-index: 4000;
  display: grid;
  place-items: center;
  overflow: hidden;
  color: var(--color-text);
}

.loader-bg {
  position: absolute;
  inset: -40px;
  background:
    radial-gradient(900px 520px at 50% 35%, rgba(255,45,117,0.14), transparent 62%),
    radial-gradient(820px 460px at 35% 65%, rgba(64,224,255,0.10), transparent 60%),
    linear-gradient(180deg, #070a10 0%, #0b1018 55%, #070a10 100%);
  filter: saturate(120%);
}
.is-boot .loader-bg {
  inset: 0;
  background:
    linear-gradient(90deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.15) 100%),
    url("/photos/back.jpg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  filter: none;
}

.loader-noise {
  position: absolute;
  inset: 0;
  opacity: 0.08;
  mix-blend-mode: overlay;
  background-image:
    repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 3px),
    repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 4px);
}
.is-boot .loader-noise {
  opacity: 0.06;
}

.boot {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  display: block;
}
.boot-rail {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 43px; /* 86px 的一半：收缩侧栏半宽 */
  background: rgba(255, 224, 54, 0.0);
  box-shadow: 10px 0 50px rgba(0,0,0,0.35);
  transform-origin: left center;
  overflow: hidden;
}
.boot-fill {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: calc(var(--p) * 1%);
  background: rgba(255, 224, 54, 1);
  transition: height 120ms linear;
}
.boot-pct {
  position: absolute;
  left: calc(43px + 14px);
  top: 0;
  transform: translateY(
    clamp(10px, calc((var(--p) * 1vh) - 34px), calc(100vh - 74px))
  );
  font-weight: 900;
  letter-spacing: 0.02em;
  font-size: 1.45rem;
  color: rgba(255, 224, 54, 1);
  text-shadow: 0 18px 50px rgba(0,0,0,0.55);
  mix-blend-mode: normal;
  pointer-events: none;
}
.app-loader.finishing .boot-pct {
  animation: boot-text-out 160ms var(--ease-io) both;
}
@keyframes boot-text-out {
  to { opacity: 0; transform: translateY(-4px); }
}

/* 100% 后：黄条向右扩张填满屏幕 */
.app-loader.finishing .boot-rail {
  animation: boot-expand 380ms cubic-bezier(.16,1,.3,1) both;
}
@keyframes boot-expand {
  from { width: 43px; }
  to { width: 100vw; }
}
/* 扩张时填满整屏（保持黄色块） */
.app-loader.finishing .boot-fill {
  height: 100%;
}
.app-loader.finishing .boot-rail {
  background: rgba(255, 224, 54, 1);
}

/* 扩张完成后 0.5s：溶解消失（淡出+轻微模糊+噪点抖动） */
.app-loader.finishing {
  animation: boot-dissolve 320ms var(--ease-out) 880ms both;
}
@keyframes boot-dissolve {
  0% { opacity: 1; filter: blur(0); }
  45% { opacity: 0.78; filter: blur(2px); }
  100% { opacity: 0; filter: blur(5px); }
}

.loader-center {
  position: relative;
  width: min(520px, calc(100vw - 40px));
  padding: 26px 22px 22px;
  border-radius: 18px;
  border: 1px solid rgba(255,255,255,0.10);
  background: rgba(12, 16, 22, 0.62);
  backdrop-filter: blur(10px) saturate(150%);
  box-shadow: 0 26px 70px rgba(0,0,0,0.55);
}

.mark {
  width: 64px;
  height: 64px;
  position: relative;
  margin-bottom: 14px;
}

.mark-ring {
  position: absolute;
  inset: 0;
  border-radius: 999px;
  border: 2px solid rgba(255,45,117,0.55);
  box-shadow: 0 0 0 6px rgba(255,45,117,0.10);
  animation: ring 1.1s linear infinite;
}

.mark-core {
  position: absolute;
  inset: 16px;
  border-radius: 999px;
  background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.75), rgba(255,45,117,0.85));
  filter: drop-shadow(0 0 18px rgba(255,45,117,0.35));
}

.text .title {
  letter-spacing: 0.22em;
  font-weight: 800;
  color: rgba(255,255,255,0.88);
  font-size: 0.9rem;
}

.text .sub {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: rgba(229,231,235,0.78);
}

.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  letter-spacing: 0.08em;
  font-weight: 700;
}

.dots span {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: rgba(255,45,117,0.75);
  margin-right: 6px;
  animation: dot 1.1s ease-in-out infinite;
}
.dots span:nth-child(2) { animation-delay: 0.12s; }
.dots span:nth-child(3) { animation-delay: 0.24s; margin-right: 0; }

.bar {
  position: relative;
  margin-top: 16px;
  height: 10px;
  border-radius: 999px;
  background: rgba(255,255,255,0.08);
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.10);
}

.bar-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(64,224,255,0.65), rgba(255,45,117,0.9));
  transition: width 180ms ease;
}

.bar-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(120px 18px at 20% 50%, rgba(255,45,117,0.35), transparent 65%);
  animation: glow 1.2s ease-in-out infinite;
  mix-blend-mode: screen;
}

.scan {
  position: absolute;
  left: -10%;
  right: -10%;
  height: 140px;
  top: -160px;
  background: linear-gradient(180deg, transparent, rgba(255,45,117,0.08), rgba(64,224,255,0.10), transparent);
  filter: blur(2px);
  transform: skewY(-6deg);
  animation: scan 1.6s ease-in-out infinite;
  opacity: 0.95;
}

.is-route .loader-center {
  width: min(420px, calc(100vw - 40px));
  padding: 20px 18px 18px;
}
.is-route .mark { width: 52px; height: 52px; }
.is-route .mark-core { inset: 13px; }

@keyframes ring {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes dot {
  0%, 80%, 100% { transform: translateY(0); opacity: 0.7; }
  40% { transform: translateY(-5px); opacity: 1; }
}

@keyframes glow {
  0% { transform: translateX(-10%); opacity: 0.65; }
  50% { transform: translateX(35%); opacity: 1; }
  100% { transform: translateX(80%); opacity: 0.65; }
}

@keyframes scan {
  0% { top: -180px; opacity: 0.0; }
  15% { opacity: 1; }
  60% { top: calc(100% + 140px); opacity: 0.9; }
  100% { top: calc(100% + 180px); opacity: 0.0; }
}
</style>

