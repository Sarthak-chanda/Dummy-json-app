import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
// vite.config.js
export default defineConfig({
  plugins: [react()],
  base: '/Dummy-json-app/', 
})