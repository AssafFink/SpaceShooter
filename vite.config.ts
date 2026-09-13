import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
//
// PWA setup — Milestone 8 (spec/ARCHITECTURE.md §46-47, spec/plans/milestone-8.md §2).
// `vite-plugin-pwa` (Workbox under the hood) generates the Service Worker and
// precaches every build output (JS/CSS/HTML/images/fonts) so the app works
// fully offline after first load — no manual asset list to maintain. Audio is
// synthesized in-browser (Milestone 7, no audio files), so it needs no caching.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Space Shooter',
        short_name: 'Space Shooter',
        description: 'משחק יריות חלל פשוט ומהנה לילדים',
        start_url: '/',
        display: 'standalone',
        // Orientation is not locked — the game supports both (ARCHITECTURE §35).
        orientation: 'any',
        lang: 'he',
        dir: 'rtl',
        theme_color: '#0B1026',
        background_color: '#0B1026',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          {
            src: '/icons/maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Precache every build artifact so the app is fully usable offline
        // right after the first visit (ARCHITECTURE §47).
        globPatterns: ['**/*.{js,css,html,svg,png,woff,woff2}'],
        // React Router (BrowserRouter) needs deep links (e.g. /statistics) to
        // resolve to index.html when served from the offline cache.
        navigateFallback: '/index.html',
      },
    }),
  ],
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
    strictPort: true,
  },
})
