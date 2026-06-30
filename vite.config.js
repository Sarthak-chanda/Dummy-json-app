import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
          }
        }
      }
    }
  },
  server: {
    proxy: {
      '/api/supabase': {
        target: 'https://ypvzlwkmdoueswvcagkq.supabase.co',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/supabase/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log(`[Proxy] Routing ${req.method} ${req.url} to Supabase`);
            console.log(`[Proxy] Headers check:`, {
              hasAuthorization: !!req.headers['authorization'],
              hasApiKey: !!req.headers['apikey'],
              contentType: req.headers['content-type']
            });
          });
          proxy.on('error', (err, req, res) => {
            console.error('[Proxy] Error:', err.message);
          });
        }
      }
    }
  }
})