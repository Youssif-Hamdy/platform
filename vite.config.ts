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
    port: 5173,
    host: true, // يسمح بالوصول من أي IP
    proxy: {
    
      '/user': {
        target: 'https://educational-platform-git-main-youssefs-projects-e2c35ebf.vercel.app',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/user/, '/user'),
      },
      '/teacher': {
        target: 'https://educational-platform-git-t-dash-youssefs-projects-e2c35ebf.vercel.app',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/teacher/, '/teacher'),
      },
      '/student': {
        target: 'https://educational-platform-git-s-dash-youssefs-projects-e2c35ebf.vercel.app',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/student/, '/student'),
      },
    },
  },
})
