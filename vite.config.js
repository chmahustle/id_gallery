import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // lightningcss (Vite 8 default) drops unprefixed backdrop-filter when
  // -webkit- is also present — glass/blur then works in dev but not in prod.
  build: {
    cssMinify: 'esbuild',
  },
  server: {
    /*
     * changeOrigin: false — сервер видит адрес страницы (localhost:5173), а не свой.
     * Иначе защита от запросов с чужих сайтов отклоняет вход и сохранение в админке.
     */
    proxy: {
      '/api': { target: 'http://localhost:3001', changeOrigin: false },
      '/uploads': { target: 'http://localhost:3001', changeOrigin: false },
    },
  },
})
