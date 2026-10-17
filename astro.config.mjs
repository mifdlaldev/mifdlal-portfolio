// @ts-check
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'

// output: 'static' -> nol server runtime.
// Konsekuensi keamanan: tidak ada Node server, tidak ada API route,
// tidak ada permukaan serangan sisi server (RCE/SSRF/injection).
export default defineConfig({
  site: 'https://mifdlal.com',
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [react(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
    build: {
      // Nol source map di produksi: jangan bocorkan struktur source.
      sourcemap: false,
      cssMinify: 'lightningcss',
    },
  },
})
