import { reactive } from 'vue'

export const uiState = reactive({
  bootLoading: true,
  routeLoading: false,
  loadingText: 'LOADING',
  progress: 0
})

let bootTimer = null
let bootRaf = 0
let bootDone = false

function setBodyLoading(on) {
  try {
    document.documentElement.classList.toggle('is-boot-loading', !!on)
  } catch {
    // ignore
  }
}

function wait(ms) {
  return new Promise((r) => window.setTimeout(r, ms))
}

/** 防止 document.fonts.ready 在部分环境下长期不 resolve，导致启动流程永远不结束 */
function withTimeout(promise, ms) {
  return Promise.race([promise, wait(ms).then(() => null)])
}

function preloadImage(src) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = src
  })
}

async function preloadCriticalAssets() {
  // 关键：首屏头像 + 常用 icon（可按需再加）
  const assets = ['/photos/tyler.png', '/photos/circuit.svg']
  const imgJobs = assets.map((a) => preloadImage(a))

  // 字体就绪（支持就等，不支持就略过；最多等待 2.5s）
  const fontJob = document.fonts?.ready
    ? withTimeout(document.fonts.ready.catch(() => null), 2500)
    : Promise.resolve(null)

  await Promise.allSettled([fontJob, ...imgJobs])
}

export function startBootLoading() {
  uiState.bootLoading = true
  uiState.loadingText = 'INITIALIZING'
  uiState.progress = 0
  bootDone = false
  setBodyLoading(true)

  if (bootTimer) window.clearTimeout(bootTimer)
  bootTimer = null
  if (bootRaf) window.cancelAnimationFrame(bootRaf)
  bootRaf = 0

  // 匀速：2 秒线性从 0 -> 100
  const durationMs = 2000
  const startAt = performance.now()
  const tick = (now) => {
    if (!uiState.bootLoading) return
    const t = Math.min(1, Math.max(0, (now - startAt) / durationMs))
    uiState.progress = Math.round(t * 100)
    if (t < 1) bootRaf = window.requestAnimationFrame(tick)
  }
  bootRaf = window.requestAnimationFrame(tick)

  // 更像“官网式”加载：分阶段门禁（最短展示时间 + 关键资源预加载）
  ;(async () => {
    try {
      uiState.loadingText = 'PRELOADING'
      const minShow = wait(2000)
      const preload = preloadCriticalAssets()
      // 整体兜底：即使预加载异常挂起，也最多阻塞约 8s 后必定收尾
      await Promise.race([Promise.allSettled([minShow, preload]), wait(8000)])
    } finally {
      finishBootLoading()
    }
  })()
}

export function finishBootLoading() {
  if (bootDone) return
  bootDone = true

  if (bootTimer) window.clearTimeout(bootTimer)
  bootTimer = null
  if (bootRaf) window.cancelAnimationFrame(bootRaf)
  bootRaf = 0

  uiState.loadingText = 'SYNC'
  uiState.progress = 100

  // 给动画留一点时间做收尾
  window.setTimeout(() => {
    uiState.bootLoading = false
    setBodyLoading(false)
  }, 1250)
}

let routeTimer = null

export function startRouteLoading(label = 'LOADING') {
  uiState.routeLoading = true
  uiState.loadingText = label
  // 路由加载不显示“进度条精确值”，只做轻量“脉冲”
  uiState.progress = 25

  if (routeTimer) window.clearInterval(routeTimer)
  routeTimer = window.setInterval(() => {
    const next = uiState.progress + 7
    uiState.progress = next >= 85 ? 35 : next
  }, 90)
}

export function finishRouteLoading() {
  if (routeTimer) window.clearInterval(routeTimer)
  routeTimer = null
  uiState.progress = 100
  window.setTimeout(() => {
    uiState.routeLoading = false
  }, 200)
}

