import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // In development, requests to /api are forwarded to the local Express API
    // so VITE_API_URL can be left unset.
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
})
