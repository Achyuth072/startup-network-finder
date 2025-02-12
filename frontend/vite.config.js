import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Handle /api routes
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      // Handle /auth routes (for backward compatibility)
      '/auth': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
