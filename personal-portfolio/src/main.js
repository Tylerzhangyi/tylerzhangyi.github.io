import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { lastPointer, setTransitionOrigin } from './utils/pageTransition'
import './style.css'
import './styles/formstudio.css'

function isDetailHref(href) {
  if (!href || href.startsWith('http')) return false
  return href.includes('/projects/') || href.includes('/blog/')
}

function bindDetailTransitionOrigin() {
  document.addEventListener(
    'pointermove',
    (e) => {
      lastPointer.x = e.clientX
      lastPointer.y = e.clientY
    },
    { passive: true }
  )

  document.addEventListener(
    'pointerdown',
    (e) => {
      lastPointer.x = e.clientX
      lastPointer.y = e.clientY

      const link = e.target.closest('a.project-card__link, a.blog-card__link')
      if (!link) return
      if (!isDetailHref(link.getAttribute('href') || '')) return
      setTransitionOrigin(e.clientX, e.clientY)
    },
    true
  )
}

const app = createApp(App).use(router)

router.isReady().then(() => {
  const redirectPath = sessionStorage.getItem('redirectPath')
  if (redirectPath) {
    sessionStorage.removeItem('redirectPath')
    const currentPath = window.location.pathname + window.location.search + window.location.hash
    if (currentPath !== redirectPath) {
      router.replace(redirectPath).catch(() => {})
    }
  }
})

app.mount('#app')
bindDetailTransitionOrigin()
