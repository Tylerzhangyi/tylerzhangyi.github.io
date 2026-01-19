import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/',
  server: {
    port: 8805,
    host: true, // 允许外部访问
    allowedHosts: [
      'tyler.yunguhs.com',
      'localhost',
      '.yunguhs.com' // 允许所有 yunguhs.com 的子域名
    ]
  },
  preview: {
    port: 8805,
    host: true,
    allowedHosts: [
      'tyler.yunguhs.com',
      'localhost',
      '.yunguhs.com' // 允许所有 yunguhs.com 的子域名
    ]
  }
})

