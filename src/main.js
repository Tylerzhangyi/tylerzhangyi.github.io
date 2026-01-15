import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'

const app = createApp(App).use(router)

// Handle GitHub Pages 404 redirect
// When a 404.html redirects to index.html, restore the original path
router.isReady().then(() => {
  const redirectPath = sessionStorage.getItem('redirectPath')
  if (redirectPath) {
    sessionStorage.removeItem('redirectPath')
    // Only navigate if we're not already on that path
    const currentPath = window.location.pathname + window.location.search + window.location.hash
    if (currentPath !== redirectPath) {
      router.replace(redirectPath).catch(() => {
        // Ignore navigation errors (e.g., if route doesn't exist)
      })
    }
  }
})

app.mount('#app')

