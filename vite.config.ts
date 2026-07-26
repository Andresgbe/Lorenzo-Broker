import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  // GitHub Pages serves this repo from /Lorenzo-Broker/, not the domain root.
  base: mode === 'gh-pages' ? '/Lorenzo-Broker/' : '/',
  plugins: [react(), tailwindcss()],
}))
