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
- [Section kontak](#section-kontak)
- [Empty state section](#empty-state-section)
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

## Section Sertifikasi

27 sertifikat, dikurasi dari 31 file di folder SERTIFIKAT operator.

- **9 kartu unggulan** (`src/data/certificates.ts` → `featured`): empat sertifikat
  peran/level atas HackerRank, freeCodeCamp x Microsoft, tiga kelas Dicoding,
  satu pelatihan Hactiv8. Masing-masing punya gambar, satu baris konteks, tanggal,
  ID, dan tautan verifikasi.
- **18 baris ringkas** (`more`): 17 sertifikat keahlian HackerRank + 1 kelas dasar
  Dicoding. Tanpa gambar di daftar supaya tidak jadi badge wall; gambar tetap
  tersedia di modal.

**Tidak ditampilkan:** empat sertifikat pelatihan guru (AI untuk Tenaga Pendidik
bagian 1-2, Desain pembelajaran abad ke-21, Eksplorasi AI, Persiapan MCE). Isinya
pedagogi, bukan rekayasa perangkat lunak, jadi tidak sejalan dengan positioning
situs. Datanya masih ada di folder sumber kalau nanti mau dimasukkan.

### Gambar

`public/certs/<slug>.webp` = versi penuh 1400px (dipakai modal).
`public/certs/<slug>-thumb.webp` = 640px (dipakai kartu, hanya untuk `featured`).

Dihasilkan dari PDF/PNG asli: render 150 dpi halaman 1, lalu WebP q82 (thumb q80).
36 file, total 1,46 MB. Untuk menambah sertifikat:

```bash
pdftoppm -png -r 150 -f 1 -l 1 -singlefile "sertifikat.pdf" /tmp/x
# lalu konversi ke WebP 1400px (dan 640px kalau masuk featured) ke public/certs/
```

### Modal

Native `<dialog>` + `showModal()`, jadi browser yang menangani pindah fokus,
kembalinya fokus ke kartu, latar `inert`, dan tombol Escape (WCAG 2.4.3, teknik
H102). Yang ditambahkan manual hanya: klik latar untuk menutup, kunci scroll
`html.cert-locked`, dan pengisian `src` gambar saat dibuka (tidak ada 27 gambar
penuh yang diunduh di awal).

Tanpa JavaScript, setiap kartu tetap berfungsi: `<a href="/certs/<slug>.webp">`
membuka gambar penuh di tab baru.

### Verifikasi

Semua ID HackerRank diuji ke `https://www.hackerrank.com/certificates/<ID>`:
21 balas 200, ID palsu balas 404. Dicoding memakai
`https://www.dicoding.com/certificates/<ID>`, freeCodeCamp memakai URL
sertifikasi publik, Hactiv8 hanya nomor sertifikat (tidak ada halaman publik).

## Struktur

```
src/
  data/site.ts          satu sumber kebenaran konten (projects, services, stack, contact)
  layouts/Layout.astro  shell HTML, metadata SEO, Open Graph
  components/           SiteNav, Hero, Projects, About, Services, Contact, Footer
  pages/index.astro     halaman utama
  pages/404.astro       halaman 404
  styles/tokens.css     primitif: palet, skala teks, leading, tracking, layout, z-index, gerak
  styles/semantic.css   peran: --color-*, --accent per section, --selection-bg
  styles/global.css     dasar halaman + primitive .btn/.fig-label/.section-headline
scripts/
  check-tokens.mjs      penjaga token (dipakai CI)
public/
  _headers              security headers (CSP, HSTS, X-Frame-Options, ...)
  robots.txt            crawler rules + URL sitemap
wrangler.toml           konfigurasi deploy Workers Static Assets
```

## Token desain

Tiga lapis, satu arah: komponen tidak pernah menulis nilai mentah.

```
tokens.css     primitif   hex, rem, em, angka  -> satu-satunya tempat nilai mentah
semantic.css   peran      --color-ink, --accent, --selection-bg
komponen       konsumsi   var(--text-label), var(--space-section), var(--accent)
```

Aturan yang dijaga otomatis oleh `npm run check:tokens` (jalan di CI):

- tidak ada warna literal (`#hex`, `rgba()`) di luar `tokens.css`;
- `font-size`, `line-height`, `letter-spacing`, `z-index` wajib `var()`;
- breakpoint hanya boleh dari daftar: 560, 620, 720, 800, 860, 900, 980, 1228
  (`max-width: N` sah kalau `N+1` ada di daftar, itu pasangan komplementer);
- setiap `var(--x)` harus punya definisi, kecuali `--logoloop-*` yang diset
  runtime oleh engine pita logo.

Aksen per section dideklarasikan sekali di `semantic.css`, bukan di komponen.
Section baru otomatis mewarisi aksen default, tidak lagi jatuh ke warna garis.

Skala teks (13 langkah, dense 1px di rentang UI karena 11px dipakai 25 kali):
`--text-hero`, `--text-h2`, `--text-h3`, `--text-lede`, `--text-sub`,
`--text-title`, `--text-title-sm`, `--text-brand`, `--text-body`, `--text-sm`,
`--text-data`, `--text-nav`, `--text-label`, `--text-cap`.

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
menampilkannya sebagai logo loop di dalam sel yang dibatasi garis vertikal sepanjang tinggi section. Isi `stack` dikelompokkan per peran, 74 entri dalam
8 grup: website dan web app (Next.js, React, TypeScript, Astro, Tailwind CSS,
Svelte, Hono, Cloudflare, Supabase), CMS dan platform (WordPress, WooCommerce,
Shopify, Drupal, Joomla, Ghost, Strapi, Webflow, PrestaShop, Magento), framework
dan bahasa (PHP, Laravel, Symfony, CodeIgniter, Django, Flask, FastAPI, Ruby on
Rails, .NET, Spring Boot, Vue.js, Nuxt, Angular), database (MySQL, PostgreSQL,
MongoDB, Redis, SQLite, MariaDB), cloud dan infrastruktur (AWS, Google Cloud,
Microsoft Azure, DigitalOcean, Alibaba Cloud, Oracle Cloud, Vultr, Kubernetes,
Terraform, Ansible, NGINX, Apache, Caddy, Firebase, Netlify, Railway), chatbot
(Claude API, OpenAI API, Telegram Bot), otomasi AI serta workflow (n8n, Python,
GitHub Actions), dan alat kerja sehari-hari (Cursor, VS Code, Git, GitHub,
GitKraken, Obsidian, Hermes Agent, RAG, Node.js, Docker, Podman, Playwright,
Vercel, WhatsApp). Tooltip tiap sel berselang-seling atas dan bawah. Logo disimpan lokal di `public/logos/` karena
CSP hanya mengizinkan `img-src 'self' data:`.

Foto potret section Tentang ada di `src/assets/portrait.png` (sumber, 1254x1254)
dan diproses `astro:assets`: build menghasilkan 5 turunan WebP (8-33 KB) dengan
`srcset` 400/560/720/900w, `width`/`height` intrinsik untuk mencegah layout
shift, serta `loading="lazy"`. Ganti foto = timpa file itu, tidak ada kode yang
perlu disentuh.

Layout Tentang: di bawah 800px kolom menumpuk dan foto dipotong 4:5. Mulai
800px grid memakai `align-items: stretch` dan foto kehilangan `aspect-ratio`
(`flex: 1 1 0`), jadi tinggi foto mengikuti tinggi kolom teks, bukan lebar
kolom. `flex-basis` harus 0, bukan `auto`: dengan `auto` foto membawa tinggi
intrinsiknya (persegi) dan baris jadi setinggi foto, bukan setinggi teks.
`object-fit: cover` dengan `object-position: 50% 26%` menjaga kepala tidak
terpotong saat kotaknya melebar (rambut mulai di 11% tinggi sumber; kotak
landscape hanya menampakkan 76% tinggi, jadi anchor 26% menyisakan ~19px biru
di atas rambut pada lebar 404px). Dasar kedua kolom berhenti di garis yang sama (terukur 0px selisih
di 800/1024/1366/1600/1920). Efek sampingnya rasio foto ikut lebar layar: 0,83
di 800px, 1,16 di 1024px, 1,32 di 1366px ke atas. `p:last-child` di kolom teks dibuat
`margin-bottom: 0` karena margin itu membuat dasar kolom menggantung 20px di
atas caption.

Konsekuensi jumlah: satu salinan pita selebar 5930px, jadi pada `speed={55}`
satu siklus penuh 108 detik dan tiap logo berada di layar sekitar 1,5 detik.
Pengunjung hanya melihat sebagian daftar. Kalau seluruh 74 harus terbaca,
naikkan `speed` di `StackLoop.astro` atau pecah pita jadi dua baris.

Dua sel memakai wordmark teks, bukan ikon: `hermes.svg` dan `rag.svg`. Keduanya
SVG lokal berisi `<text>` mono 600 dengan tinggi kapital yang sama, karena
Hermes Agent tidak punya mark datar resmi (aset resminya berupa ilustrasi
potret dan stempel detail yang jadi kabur di 34px) dan RAG adalah teknik, bukan
produk. Logo brand diambil dari `cdn.simpleicons.org/<slug>` yang sudah membawa
warna brand; CSS pita memaksa hitam saat diam (`filter: brightness(0)`) lalu
menampilkan warna asli saat hover.

Empat logo tidak ada di simple-icons v11: `amazonwebservices`, `microsoftazure`,
`oracle`, dan `magento`. Keempatnya diambil dari `simple-icons@latest` (SVG tanpa
`fill`) lalu diisi hex brand resmi secara manual karena ikonnya sudah tidak
terdaftar di `_data/simple-icons.json`: Azure `#0078D4`, Oracle `#F80000`,
Magento `#EE672F`. Kalau salah satu brand meminta penghapusan, cukup hapus baris
di `stack` dan file di `public/logos/`.

## Animasi teks hero (EncryptedText)

Judul hero memakai komponen `EncryptedText` (`src/components/EncryptedText.tsx`),
adaptasi dari Aceternity UI `ui.aceternity.com/components/encrypted-text`.
Keputusan implementasi:

- Tanpa dependency `motion`. Komponen aslinya menarik `motion/react` hanya untuk
  `<motion.span>` tanpa properti animasi dan hook `useInView`. Keduanya diganti
  `span` biasa dan `IntersectionObserver` native.
- Teks asli ada di HTML hasil build. State awal komponen adalah teks penuh, jadi
  crawler dan pengunjung tanpa JavaScript tetap membaca kalimat utuh; animasi baru
  mulai setelah hidrasi.
- Tidak ada pergeseran layout. Tiap baris dikunci oleh ghost tak terlihat
  (`.enc-ghost`) dan karakter teracak digambar absolut di atasnya (`.enc-live`),
  sehingga lebar baris konstan selama animasi.
- Reveal berbasis waktu, bukan per frame, plus jaring pengaman `setTimeout` supaya
  teks tetap terbuka penuh kalau `requestAnimationFrame` berhenti.
- Tempo dibikin lambat supaya proses enkripsi terlihat: judul hero
  `revealDelayMs 72` / `flipDelayMs 90` (47 karakter, sekitar 3,3 detik) dan
  komentar section `revealDelayMs 110` / `flipDelayMs 85` (sekitar 1 detik).
- `prefers-reduced-motion: reduce` melewati animasi sepenuhnya.
- Nama aksesibel ada di `aria-label` elemen `h1`; isi visual animasi `aria-hidden`.

## Section layanan

Tiga kartu horizontal (`grid`, `gap: 1.5rem`, tiga kolom mulai 860px, satu kolom di
bawahnya). Tiap kartu punya border sendiri, jadi tidak ada border luar bersama.
Bagian atas kartu berisi gambar 16:10, bagian bawah nomor, judul, dan deskripsi.

Gambar saat ini placeholder: `public/services/layanan-01.svg` sampai `-03.svg`,
path-nya ada di field `image` pada `services` di `src/data/site.ts`. Ganti isi file
atau arahkan field `image` ke gambar asli; `alt` dibentuk dari judul layanan.
Gambar memakai `loading="lazy"` supaya tidak menahan render awal.

## Komentar kode per section

Tiap section (kecuali hero dan strip logo) punya komentar gaya source code di pita
kosong antara garis atas section dan garis awal konten, misalnya `// proyek`.
Komponennya `src/components/CodeComment.astro`, isinya `EncryptedText` dengan
`client:visible` supaya animasi baru jalan saat section masuk viewport.

Penempatan memakai `position: absolute` di tengah pita kosong (horizontal center,
vertikal `calc(var(--space-section) / 2)`), jadi tinggi section tidak berubah sama
sekali. Terukur: tinggi tiap section identik sebelum dan sesudah penambahan
(755, 1059, 708, 687, 485, 439, 541 px di 1366px), selisih titik tengah teks vs
titik tengah section 0 px. Ukuran 14px mono (fig label 11px). Warna 60% ink di atas
paper = 4.66:1, lolos AA untuk teks kecil.

## Empty state section

Section Pengalaman, Pendidikan, dan Sertifikasi membaca data dari `src/data/site.ts`.
Selama array-nya kosong, section menampilkan empty state, bukan teks template. Baris
tetap memakai grid row asli (`.entry-row` / `.edu-row` / `.cert-row`) sehingga layout
tidak bergeser saat data nyata masuk; isi teks diganti bar dekoratif `.ph`, dan di
bawah daftar ada catatan mono `belum diisi`.

- Bar dekoratif: `.ph`, `.ph--title`, `.ph--sub`, `.ph--meta`, `.ph--line`, `.ph--short` di `src/styles/global.css`.
- Disembunyikan dari pembaca layar: `aria-hidden="true"` pada `<ul>` saat kosong, diganti teks `.sr-only` ("Bagian ... belum diisi").
- Mengisi data: tambahkan entri ke array di `src/data/site.ts`; empty state hilang otomatis.

## Font kode

`--font-mono` memakai JetBrains Mono Variable (`@fontsource-variable/jetbrains-mono`,
lisensi OFL), self-hosted seperti font lain. Font ini dipakai untuk fig label, tag
teknologi, tombol, tooltip logo, dan elemen data lain. Azeret Mono tetap dipakai
khusus kanvas ASCII di hero.

`vite.build.assetsInlineLimit` diset `0` supaya font tidak pernah di-inline sebagai
`data:` URI. Subset font kecil (misalnya cyrillic-ext) sebelumnya di-inline Vite dan
diblokir CSP `font-src 'self'`.

Navigasi utama berisi `Tentang · Proyek · Layanan · Pengalaman` — urutannya sama
dengan urutan section di halaman, jadi klik tidak pernah melompat ke belakang. Lalu
tombol `Mulai proyek` menuju section kontak. Pendidikan dan sertifikasi tetap ada di
halaman tetapi tidak masuk nav karena bukan bagian dari alur keputusan klien. Link
tengah dipusatkan terhadap viewport (`grid-template-columns: 1fr auto 1fr`), bukan
terhadap ruang sisa setelah brand. Di bawah 860px link disembunyikan dan hanya brand
+ tombol CTA yang tampil.

Brand navbar memakai `src/assets/logo-mark.png` (monogram, dipotong ke kotak isinya,
tanpa padding bawaan) lewat `astro:assets`, tinggi 30px, tanpa kotak latar. Sumbernya
hitam, jadi state terang tidak diberi filter; state gelap memakai
`filter: brightness(0) invert(1)` untuk memaksa putih bersih tanpa menyentuh alpha.

Favicon memakai monogram yang sama: `public/favicon-{32,64}-{light,dark}.png`, latar
transparan, dipilih peramban lewat atribut `media="(prefers-color-scheme: ...)"` pada
`<link rel="icon">` (glyph hitam di tema terang, putih di tema gelap). `apple-touch-icon.png`
180px memakai latar kertas karena iOS tidak menghormati mode gelap untuk ikon sentuh.

`public/js/nav-scroll.js` mengerjakan dua hal: menyalakan kelas `is-scrolled` (glass)
dan scroll-spy yang menandai link sesuai section yang sedang terlihat, lengkap dengan
`aria-current="true"`. Link aktif digaris-bawahi 1px.

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

## Section kontak

Dua kolom: kiri headline + tabel spec mono (`balasan`, `zona waktu`, `lokasi`, `github`),
kanan panel berbingkai berisi email dan checklist 4 item. Di desktop kolom memakai
`align-items: stretch` dan `.spec-list { margin-top: auto }` supaya dasar tabel spec rata
dengan dasar panel (terukur 0px di 1024/1366/1600). Panel sengaja hanya berisi email +
checklist; kanal lain masuk tabel spec agar panel tetap satu tugas.

Nomor `01`-`04` di checklist diberi `aria-hidden="true"` karena `<ol>` sudah memberi
nomor sendiri ke pembaca layar.

Kartu email memakai permukaan biru (`--color-electric`) dengan seluruh isinya berwarna
kertas: label `paper 82%`, email `paper` penuh, item `paper 90%`, nomor `--color-lemon`.
Rasio kontras terukur terhadap latar biru: 5.36 / 7.47 / 6.24 / 6.42 — semuanya lolos AA.
Border kartu disamakan dengan warna latar (bukan dihapus) supaya ukuran kotak tidak
berubah.

Ikon media sosial ada di `src/components/SocialIcons.astro`: path brand simple-icons v11
(CC0) di-inline sebagai SVG `fill="currentColor"`, jadi tidak ada request tambahan dan
aman terhadap CSP `img-src 'self'`. Ukuran per brand berbeda (github 19, linkedin 15,
fiverr 30) karena wordmark mendatar punya massa tinta jauh lebih ringan daripada mark
padat; dengan ukuran seragam selisih tinta 3x, setelah penyesuaian 1,5x.

## Footer

Footer hanya berisi dua hal: navigasi ke seluruh section halaman dan baris hak cipta.
Sosial, email, dan label stack sengaja TIDAK ada di footer karena sudah ada di section
kontak (menghindari duplikasi). Urutan tautan mengikuti urutan section di halaman
sehingga klik tidak pernah melompat ke belakang; `#stack` tidak dimasukkan karena itu
pita logo tanpa judul. Di bawah 900px susunannya menumpuk.

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
