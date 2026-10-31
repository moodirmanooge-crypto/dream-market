import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: { output: { manualChunks: { firebase: ['firebase/app', 'firebase/firestore', 'firebase/auth', 'firebase/analytics'], vendor: ['react', 'react-dom', 'react-router-dom', 'framer-motion'] } } },
  },
})
