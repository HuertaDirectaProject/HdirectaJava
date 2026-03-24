import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  envPrefix: 'VITE_',
  preview: {
    allowedHosts: ['upbeat-abundance-production-ff52.up.railway.app'],
    host: '0.0.0.0',
    port: 4173,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8085',
        changeOrigin: true,
        secure: false,
      },
      '/groq': {
        target: 'https://api.groq.com/openai/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/groq/, ''),
        secure: false,
      }
    }
  }
})