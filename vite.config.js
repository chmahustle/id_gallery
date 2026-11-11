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
    proxy: {
      '/api': 'http://localhost:3001',
      '/uploads': 'http://localhost:3001',
    },
  },
})
