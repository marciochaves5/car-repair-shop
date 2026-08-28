import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The .NET API runs on HTTPS with a self-signed dev certificate.
// Proxying through Vite with `secure: false` lets the browser talk to it
// without certificate warnings and keeps everything same-origin (no CORS).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_TARGET || 'https://localhost:62635',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
