import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(() => ({
  // Since 17 Nov 2026 the site lives at the root of lorenzobroker.com (public/CNAME), so the
  // GitHub Pages build no longer needs the /Lorenzo-Broker/ subpath. `mode` stays in the
  // signature because the build:gh-pages script still passes --mode gh-pages.
  base: '/',
  plugins: [react(), tailwindcss()],
}))
