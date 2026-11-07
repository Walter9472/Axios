import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Port des lokalen Mock-Backends (siehe server/index.ts)
const API_PORT = 3001

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    // Alle Requests an /api/... leitet Vite an das Backend weiter.
    // Vorteil: gleiche Origin im Browser → kein CORS-Thema in der Demo.
    proxy: {
      '/api': {
        target: `http://localhost:${API_PORT}`,
        changeOrigin: true,
      },
    },
  },
})
