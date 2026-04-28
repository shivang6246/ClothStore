import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Optimize build output
    minify: 'terser',
    // Code splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/react')) return 'vendor-react';
          if (id.includes('node_modules')) return 'vendor';
        },
      },
    },
    // Smaller chunk size for mobile
    chunkSizeWarningLimit: 500,
    // Source maps for production debugging
    sourcemap: false,
    // Optimize CSS
    cssCodeSplit: true,
  },
  server: {
    headers: {
      'Cache-Control': 'public, max-age=3600',
      'X-Content-Type-Options': 'nosniff',
    } as Record<string, string>,
    hmr: {
      // Fallback: use polling if WebSocket is blocked by a browser extension
      overlay: false,
    },
    watch: {
      usePolling: true,
      interval: 1000,
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
})
