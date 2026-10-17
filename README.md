# mifdlal.com

Situs portofolio pribadi Mifdlal Tsaqib Alfarras — freelance web & AI automation
developer, Bandung.

Satu halaman, statis, tanpa runtime server. Fokus: bukti kerja yang bisa diklik
sendiri, bukan klaim.

## Stack

| Lapisan | Pilihan | Alasan |
|---|---|---|
| Framework | Astro 7 (output `static`) | Konten-first, JS nol di klien |
| Interaksi | React 19 islands | Hanya bila benar-benar perlu |
| Styling | Tailwind CSS 4 + `@tailwindcss/vite` | Config CSS-first `@theme` |
| Bahasa | TypeScript (strict) | Kontrak tipe di source data |
| Hosting | Cloudflare Workers Static Assets | Edge, cepat, tanpa server Node |
| Font | System stack | Nol CDN, nol FOUT/FOIT |

## Struktur

```
src/
  data/site.ts          satu sumber kebenaran konten (projects, services, stack, contact)
  layouts/Layout.astro  shell HTML, metadata SEO, Open Graph
  components/           SiteNav, Hero, Projects, About, Services, Contact, Footer
  pages/index.astro     halaman utama
  pages/404.astro       halaman 404
  styles/global.css     design token, glass surface, primitive .section-title/.cta-primary
public/
  _headers              security headers (CSP, HSTS, X-Frame-Options, ...)
  robots.txt            crawler rules + URL sitemap
wrangler.toml           konfigurasi deploy Workers Static Assets
```

## Perintah

```bash
npm install          # pasang dependency
npm run dev          # dev server
npm run build        # build statis ke dist/
npm run preview      # serve hasil build lokal
npm run typecheck    # tsc --noEmit
npm run audit        # npm audit --omit=dev
npm run lh           # Lighthouse (perlu CHROME_PATH)
npm run deploy       # wrangler deploy (perlu auth Cloudflare)
```

## Validasi (hasil terakhir)

- `npm run build` — sukses
- `npm run typecheck` — bersih
- `npm audit --omit=dev` — 0 vulnerabilities
- Lighthouse — mobile 100/100/100/100, desktop 100/100/100/100 (FCP 1.0s/0.3s, CLS 0)
- Output: 0 script tag, CSS 21.6 KB (5 KB gzip), 0 em dash

## Aturan konten

- Hanya klaim berbukti. Setiap proyek di `site.ts` punya URL live yang bisa dibuka.
- Tidak menampilkan pengalaman, klien, atau kemampuan yang tidak terverifikasi.
- Data terpisah dari presentasi: menambah proyek = mengedit `src/data/site.ts`.

## Deploy

Butuh akun Cloudflare dan domain `mifdlal.com` terhubung ke akun tersebut.

```bash
npx wrangler login    # sekali saja
npm run deploy        # upload dist/ ke Workers Static Assets
```

Setelah domain terhubung, aktifkan HTTPS enforcement dan redirect `www` -> apex
di dashboard Cloudflare. Security headers diserve dari `public/_headers`.

## Email

`hello@mifdlal.com` (tujuan utama). Fallback sementara sampai email domain aktif
tercatat di `src/data/site.ts`.
