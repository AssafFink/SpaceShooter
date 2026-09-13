import { copyFileSync } from 'node:fs'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// Base public path. Deployed to GitHub Pages under the project repo
// (https://assaffink.github.io/SpaceShooter/), so production assets must be
// served from '/SpaceShooter/'. Dev keeps '/' so `npm run dev` stays at the
// root. React Router reads this same value via `import.meta.env.BASE_URL`.
const BASE = '/SpaceShooter/'

// GitHub Pages has no server-side SPA rewrite: a hard load of a deep link
// (e.g. /SpaceShooter/statistics) returns 404 before the app or SW can run.
// GitHub serves 404.html for unknown paths, so shipping a copy of index.html
// as 404.html lets React Router take over and resolve the route client-side.
function spaFallback(): Plugin {
  return {
    name: 'spa-404-fallback',
    apply: 'build',
    closeBundle() {
      const dist = resolve(__dirname, 'dist')
      copyFileSync(resolve(dist, 'index.html'), resolve(dist, '404.html'))
    },
  }
}

// https://vite.dev/config/
//
// PWA setup — Milestone 8 (spec/ARCHITECTURE.md §46-47, spec/plans/milestone-8.md §2).
// `vite-plugin-pwa` (Workbox under the hood) generates the Service Worker and
// precaches every build output (JS/CSS/HTML/images/fonts/audio) so the app
// works fully offline after first load — no manual asset list to maintain.
// SFX are synthesized in-browser (Milestone 7); background music is a file
// under public/audio, so it needs `mp3` in the precache glob below.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? BASE : '/',
  plugins: [
    react(),
    spaFallback(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Space Shooter',
        short_name: 'Space Shooter',
        description: 'משחק יריות חלל פשוט ומהנה לילדים',
        start_url: BASE,
        scope: BASE,
        display: 'standalone',
        // Orientation is not locked — the game supports both (ARCHITECTURE §35).
        orientation: 'any',
        lang: 'he',
        dir: 'rtl',
        theme_color: '#0B1026',
        background_color: '#0B1026',
        // Icon src must include the base path — vite-plugin-pwa does not
        // prepend it to manifest icons (unlike start_url/scope).
        icons: [
          { src: `${BASE}icons/icon-192.png`, sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: `${BASE}icons/icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any' },
          {
            src: `${BASE}icons/maskable-512.png`,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Precache every build artifact so the app is fully usable offline
        // right after the first visit (ARCHITECTURE §47).
        globPatterns: ['**/*.{js,css,html,svg,png,woff,woff2,mp3}'],
        // Workbox's 2 MiB default is smaller than the background-music file
        // (~3.4 MB); raise the cap so precaching doesn't skip it.
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        // React Router (BrowserRouter) needs deep links (e.g. /statistics) to
        // resolve to index.html when served from the offline cache. Must
        // include the base path on GitHub Pages.
        navigateFallback: `${BASE}index.html`,
      },
    }),
  ],
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
    strictPort: true,
  },
}))
