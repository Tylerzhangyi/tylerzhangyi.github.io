import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/',
  server: {
    port: 8805,
    host: true // 允许外部访问
  },
  preview: {
    port: 8805,
    host: true
  }
})

