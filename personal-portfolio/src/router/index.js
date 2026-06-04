import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Skills from '../views/Skills.vue'
import ProjectDetail from '../views/ProjectDetail.vue'
import BlogDetail from '../views/BlogDetail.vue'
import { playPageEnter, playPageExit, scrollDetailToTop, setTransitionOrigin, lastPointer } from '../utils/pageTransition'

const SECTION_REDIRECTS = {
  '/about': '#section-about',
  '/education': '#section-education',
  '/projects': '#section-projects-intro',
  '/blog': '#section-blog',
  '/links': '#section-links',
  '/contact': '#section-contact'
}

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  ...Object.entries(SECTION_REDIRECTS).map(([path, hash]) => ({
    path,
    redirect: () => ({ path: '/', hash })
  })),
  {
    path: '/skills',
    name: 'Skills',
    component: Skills,
    meta: { transition: 'slide-left' }
  },
  {
    path: '/projects/:id',
    name: 'ProjectDetail',
    component: ProjectDetail,
    meta: { transition: 'detail-fade' }
  },
  {
    path: '/blog/:id',
    name: 'BlogDetail',
    component: BlogDetail,
    meta: { transition: 'detail-fade' }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (DETAIL_NAMES.has(to.name)) {
      return { top: 0, left: 0, behavior: 'auto' }
    }
    if (to.hash) {
      return new Promise((resolve) => {
        window.setTimeout(() => {
          const el = document.querySelector(to.hash)
          if (el) {
            resolve({ el, top: 72, behavior: 'smooth' })
          } else {
            resolve({ top: 0, left: 0 })
          }
        }, 120)
      })
    }
    return { top: 0, left: 0, behavior: 'auto' }
  }
})

const DETAIL_NAMES = new Set(['BlogDetail', 'ProjectDetail'])

async function runDetailTransition(from, to) {
  const toDetail = DETAIL_NAMES.has(to.name)
  const fromDetail = DETAIL_NAMES.has(from.name)
  if (!toDetail && !fromDetail) return

  to.meta.transition = 'detail-fade'

  if (from.name) {
    await playPageExit()
    return
  }

  if (toDetail) {
    setTransitionOrigin(lastPointer.x, lastPointer.y)
    await playPageExit()
  }
}

router.beforeEach(async (to, from, next) => {
  await runDetailTransition(from, to)
  if (DETAIL_NAMES.has(to.name) || DETAIL_NAMES.has(from.name)) {
    to.meta.transition = 'detail-fade'
  } else if (!to.meta.transition) {
    delete to.meta.transition
  }
  next()
})

router.afterEach((to, from) => {
  const toDetail = DETAIL_NAMES.has(to.name)
  const fromDetail = DETAIL_NAMES.has(from.name)

  if (toDetail) {
    scrollDetailToTop()
  }

  if (toDetail || fromDetail) {
    playPageEnter()
  }

  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'G-R6DC0Y49B9', {
      page_path: to.fullPath
    })
  }
})

export default router
