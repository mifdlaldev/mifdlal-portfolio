# mifdlal.com

[![CI](https://github.com/mifdlaldev/mifdlal-portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/mifdlaldev/mifdlal-portfolio/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-proprietary-inactive.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-22.x-3c873a.svg)](https://nodejs.org)
[![Astro](https://img.shields.io/badge/Astro-7-ff5d01.svg)](https://astro.build)
[![Built with Cloudflare](https://img.shields.io/badge/deploy-Workers%20Static%20Assets-f38020.svg)](https://developers.cloudflare.com/workers/static-assets/)

Situs portofolio pribadi **Mifdlal Tsaqib Alfarras**, freelance web & AI automation
developer di Bandung, Indonesia.

Satu halaman, statis, tanpa runtime server. Fokus: bukti kerja yang bisa diklik
sendiri, bukan klaim.


## Daftar isi

- [Stack](#stack)
- [Struktur](#struktur)
- [Navbar (frosted glass, dua state)](#navbar-frosted-glass-dua-state)
- [CSP dan inline script](#csp-dan-inline-script)
- [Perintah](#perintah)
- [Validasi (hasil terakhir)](#validasi-hasil-terakhir)
- [Aturan konten](#aturan-konten)
- [React Bits MCP](#react-bits-mcp)
- [Deploy](#deploy)
- [Kontribusi](#kontribusi)
- [Keamanan](#keamanan)
- [Lisensi](#lisensi)

## Stack

| Lapisan | Pilihan | Alasan |
|---|---|---|
| Framework | Astro 7 (output `static`) | Konten-first, JS nol di klien |
| Interaksi | React 19 islands | Hanya bila benar-benar perlu |
| Styling | Tailwind CSS 4 + `@tailwindcss/vite` | Config CSS-first `@theme` |
| Font | Space Grotesk + Inter + Azeret Mono (self-hosted, `@fontsource-variable`) | Bahasa desain warp.dev, nol CDN |
| Bahasa | TypeScript (strict) | Kontrak tipe di source data |
| Hosting | Cloudflare Workers Static Assets | Edge, cepat, tanpa server Node |

## Struktur

```
src/
  data/site.ts          satu sumber kebenaran konten (projects, services, stack, contact)
  layouts/Layout.astro  shell HTML, metadata SEO, Open Graph
  components/           SiteNav, Hero, Projects, About, Services, Contact, Footer
  pages/index.astro     halaman utama
  pages/404.astro       halaman 404
  styles/global.css     token desain (warp.dev grammar), primitive .btn/.fig-label/.section-headline
public/
  _headers              security headers (CSP, HSTS, X-Frame-Options, ...)
  robots.txt            crawler rules + URL sitemap
wrangler.toml           konfigurasi deploy Workers Static Assets
```

## Urutan section

1. Hero
2. Tentang (foto potret + teks)
2b. Stack (logo loop, tanpa nomor fig.)
3. Proyek
4. Layanan
5. Pengalaman
6. Pendidikan
7. Sertifikasi
8. Kontak

Section pengalaman, pendidikan, dan sertifikasi memakai data bertipe di
`src/data/site.ts` (`experience`, `education`, `certifications`). Isinya masih
template dan wajib diganti data asli sebelum deploy.

Section Stack memakai `stack` dari `src/data/site.ts` (nama + path logo) dan
menampilkannya sebagai logo loop di dalam sel yang dibatasi garis vertikal sepanjang tinggi section. Isi `stack` dikurasi dari bukti repo: pertanyaan
per area keahlian, yaitu website dan web app (Next.js, React, TypeScript,
Astro, Tailwind CSS, Svelte, Hono, Cloudflare, Supabase), chatbot (Claude API,
OpenAI API, Telegram Bot), dan otomasi AI serta workflow (n8n, Python, GitHub
Actions). Tooltip tiap sel berselang-seling atas dan bawah. Logo disimpan lokal di `public/logos/` karena
CSP hanya mengizinkan `img-src 'self' data:`. Foto potret di section Tentang
masih placeholder dan perlu diganti file asli.

Navigasi utama mengikuti urutan yang sama untuk section setelah hero.

## Navbar (frosted glass, dua state)

Navbar `position: fixed`, selalu kaca buram (`backdrop-filter: blur(14px) saturate(1.2)`).
Warna menyesuaikan posisi scroll:

| State | Latar | Teks / tombol |
|---|---|---|
| Paling atas | glass gelap (ink 62%) | teks putih, CTA putih + teks ink |
| Setelah scroll | glass terang (paper 76%) | teks ink/muted, CTA ink + teks paper |

- Threshold: 4px | blur aktif begitu halaman digeser sedikit, bahkan masih di dalam hero.
- Border bawah tersembunyi di posisi atas, muncul setelah scroll.
- Transisi 200 ms (`prefers-reduced-motion` dihormati).
- Tanpa `backdrop-filter`: fallback solid (ink di atas, paper saat scroll).
- `/js/nav-scroll.js` same-origin, passive listener, dibatasi `requestAnimationFrame`.

## CSP dan inline script

CSP memakai `script-src 'self'` tanpa `unsafe-inline`. Astro menghasilkan inline
script untuk island hydration; `scripts/csp-hash.mjs` menghitung SHA-256 tiap inline
script setelah build dan menyuntik hash ke `dist/_headers`.

Jalankan `npm run build`; `postbuild` berjalan otomatis. Deploy `dist/_headers`.
Validasi produksi memakai server yang mengirim CSP tersebut: React canvas hydrate,
navbar beralih ke `blur(14px)` saat scroll, kembali solid di atas, tanpa error CSP.

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

- `npm run build` | sukses
- `npm run typecheck` | bersih
- `npm audit --omit=dev` | 0 vulnerabilities
- Lighthouse | mobile 100/100/100/100, desktop 100/100/100/100 (FCP 1.0s/0.3s, CLS 0)
- Output: 0 script tag, CSS 21.6 KB (5 KB gzip), 0 em dash

## Aturan konten

- Hanya klaim berbukti. Setiap proyek di `site.ts` punya URL live yang bisa dibuka.
- Tidak menampilkan pengalaman, klien, atau kemampuan yang tidak terverifikasi.
- Data terpisah dari presentasi: menambah proyek = mengedit `src/data/site.ts`.

## React Bits MCP

React Bits tersedia melalui shadcn MCP server (7 tools). Registry di `components.json`:
`@react-bits` -> `https://reactbits.dev/r/{name}.json` (872 items terverifikasi).
Hermes memakai `scripts/react-bits-mcp.sh` agar proses MCP berjalan dari project root;
konfigurasi MCP ada di `~/.hermes/config.yaml` (bukan file repo).

Cari komponen lewat tool MCP `search_items_in_registries`, lalu lihat detail dan
contoh sebelum memasang. Instalasi:

```bash
npx shadcn@latest add @react-bits/<Component-TS-TW> --cwd . --yes
```

CLI akan menambahkan source ke `src/components/` dan memasang dependency yang perlu.
Sesudah add, jalankan `npm run build`, `npm run typecheck`, dan `npm audit`.
Komponen React Bits memakai React islands (`client:visible` / `client:load`) di Astro;
jangan import komponen langsung sebagai server-only Astro component.

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

## Kontribusi

Lihat [CONTRIBUTING.md](CONTRIBUTING.md) dan [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## Keamanan

Kebijakan pelaporan ada di [SECURITY.md](SECURITY.md).

## Lisensi

Proprietary. Lihat [LICENSE](LICENSE). Seluruh hak cipta milik Mifdlal Tsaqib Alfarras.
