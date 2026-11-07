import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Port des lokalen Mock-Backends – dieselbe Variable liest server/index.ts,
// damit Proxy und Backend nie auseinanderlaufen (z. B. API_PORT=3005 npm run dev:all)
const API_PORT = Number(process.env.API_PORT ?? 3001)

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    strictPort: true, // lieber klare Fehlermeldung als stillschweigend ein anderer Port
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
