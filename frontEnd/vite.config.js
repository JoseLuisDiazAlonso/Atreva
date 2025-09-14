import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/', // rutas relativas al dominio actual

  plugins: [react()],

  server: {
    proxy: {
      '/api': {
        target: 'http://api.controldatarutas.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },
})
