import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/',
  server: {
    port: 8806,
    host: true,
    allowedHosts: ['tyler.yunguhs.com', 'localhost', '.yunguhs.com']
  },
  preview: {
    port: 8806,
    host: true,
    allowedHosts: ['tyler.yunguhs.com', 'localhost', '.yunguhs.com']
  }
})
