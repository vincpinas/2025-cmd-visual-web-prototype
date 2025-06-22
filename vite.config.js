import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
  server: {
    fs: {
      allow: ['..']
    }
  },
  publicDir: 'public'
}) 