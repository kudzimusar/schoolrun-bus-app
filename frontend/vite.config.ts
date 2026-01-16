import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/schoolrun-bus-app/' : '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
      '~backend/client': path.resolve(__dirname, './client'),
      '~backend': path.resolve(__dirname, '../backend'),
    },
  },
  plugins: [
    tailwindcss(),
    react(),
  ],
  server: {
    allowedHosts: true,
  },
  build: {
    target: 'esnext',
    minify: mode === 'production',
  }
}))
