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
       '/admin-panel': {
        target: 'https://educational-platform-git-main-youssefs-projects-e2c35ebf.vercel.app',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/admin-panel/, '/admin-panel'),
      },
      '/user': {
        target: 'https://educational-platform-git-main-youssefs-projects-e2c35ebf.vercel.app',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/user/, '/user'),
      },
      '/teacher': {
        target: 'https://educational-platform-git-main-youssefs-projects-e2c35ebf.vercel.app',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/teacher/, '/teacher'),
      },
      '/student': {
        target: 'https://educational-platform-git-main-youssefs-projects-e2c35ebf.vercel.app',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/student/, '/student'),
      },
      '/parent': {
        target: 'https://educational-platform-git-main-youssefs-projects-e2c35ebf.vercel.app',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/parent/, '/parent'),
      },
      '/support': {
        target: 'https://educational-platform-git-main-youssefs-projects-e2c35ebf.vercel.app',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/support/, '/support'),
      },

      // ✅ حل مشكلة static
      '/static': {
        target: 'http://localhost:8000', // الباك إند بتاع Django
        changeOrigin: true,
        secure: false,
      },

      // ✅ اختياري: لو عندك media (صور/ملفات مرفوعة)
      '/media': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
