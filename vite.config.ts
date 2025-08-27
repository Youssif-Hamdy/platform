import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
     tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'https://web-0bben6p5dii9.up-de-fra1-k8s-1.apps.run-on-seenode.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
      '/user': {
        target: 'https://educational-platform-qg3zn6tpl-youssefs-projects-e2c35ebf.vercel.app',
        changeOrigin: true,
        secure: true,
      }
    }
  }
})
