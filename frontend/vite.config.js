import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // '@' è scorciatoia per la cartella src/
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    // Es. /api/v2/annunci → http://localhost:3000/api/v2/annunci
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
