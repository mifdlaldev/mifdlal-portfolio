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
- [Ikon mikro animasi](#ikon-mikro-animasi)
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
- **18 kartu di modal** (`more`): 17 sertifikat keahlian HackerRank + 1 kelas
  dasar Dicoding. Tidak memenuhi halaman sebagai grid kedua; dibuka lewat tombol
  **Lihat Lainnya** di tengah bawah grid unggulan, dan di dalam modal semuanya
  tampil sebagai kartu yang sama persis dengan kartu unggulan.

**Tidak ditampilkan:** empat sertifikat pelatihan guru (AI untuk Tenaga Pendidik
bagian 1-2, Desain pembelajaran abad ke-21, Eksplorasi AI, Persiapan MCE). Isinya
pedagogi, bukan rekayasa perangkat lunak, jadi tidak sejalan dengan positioning
situs. Datanya masih ada di folder sumber kalau nanti mau dimasukkan.

### Gambar

`public/certs/<slug>.webp` = versi penuh 1400px (dipakai lightbox).
`public/certs/<slug>-thumb.webp` = 640px (dipakai kartu di grid dan di modal).

Dihasilkan dari PDF/PNG asli: render 150 dpi halaman 1, lalu WebP q82 (thumb q72).
54 file, total 1,73 MB. Thumbnail 18 entri `more` baru ditambahkan saat entri itu
pindah ke modal: 266 KB untuk 18 file, dan tidak diunduh sebelum modal dibuka.
Untuk menambah sertifikat:

```bash
pdftoppm -png -r 150 -f 1 -l 1 -singlefile "sertifikat.pdf" /tmp/x
# lalu konversi ke WebP 1400px (dan 640px kalau masuk featured) ke public/certs/
```

### Dua dialog, bertumpuk

Ada dua `<dialog>` native: `#cert-dialog` (lightbox satu sertifikat) dan
`#cert-list` (daftar lengkap 18 kartu). Keduanya `showModal()`, jadi browser yang
menangani pindah fokus, kembalinya fokus, latar `inert`, dan Escape (WCAG 2.4.3,
H102).

Kartu di dalam daftar memakai atribut `data-cert` yang sama dengan kartu unggulan,
jadi klik kartu membuka lightbox **di atas** modal daftar — dialog kedua masuk top
layer, Escape menutup yang paling atas dan fokus balik ke daftar. Tidak ada state
tambahan untuk itu.

Yang ditambahkan manual: klik latar untuk menutup, kunci scroll `html.cert-locked`,
dan pengisian `src` gambar lightbox saat dibuka. Kunci scroll hanya dilepas kalau
tidak ada dialog lain yang masih terbuka — tanpa itu, menutup lightbox membuka
scroll padahal daftar masih tampil.

Gambar kartu memakai `loading="lazy"`. Karena dialog tertutup tidak punya layout,
18 thumbnail tidak diunduh sampai daftar dibuka; terverifikasi 18 permintaan HTTP
200 setelah tombol ditekan, nol sebelumnya.

Tanpa JavaScript: tombol tidak berfungsi, jadi `<noscript>` menulis 18 tautan
sertifikat apa adanya di bawah tombol. Setiap kartu juga tetap `<a href>` biasa ke
gambar penuh.

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

Scroll-spy memakai satu garis baca di `navHeight + 24px`, bukan aturan "section
terakhir yang sudah lewat". Bedanya penting: dengan aturan terakhir-yang-lewat, link
`PENGALAMAN` tetap menyala sampai dasar halaman karena tidak ada section nav lagi
sesudahnya. Dengan garis baca, begitu section berikutnya mengisi garis itu dan tidak
ada link yang cocok, semua link padam. Section yang tidak ada di nav (pendidikan,
sertifikasi, kontak) dan footer karenanya tidak pernah menyalakan link mana pun.

## Scrollbar

Scrollbar disesuaikan di `global.css`: tipis, biru elektrik, track transparan dengan
satu garis rambut di tengah.

| Bagian | Nilai |
|---|---|
| Slot | 10px |
| Thumb | biru `var(--color-electric)`, inset 3px kiri-kanan (pil 4px), radius 999px |
| Track | transparan + garis rambut `var(--color-line)` 1px di tengah |
| Hover | `color-mix` 72% elektrik + 28% ink, jadi biru lebih pekat |
| Aktif (drag) | ink penuh |

Dua jalur, bukan satu:

- `::-webkit-scrollbar-*` untuk Chromium dan Safari.
- `scrollbar-width`/`scrollbar-color` untuk Firefox, dibungkus
  `@supports not selector(::-webkit-scrollbar)`.

Pembungkus itu wajib. Kalau properti standar dibiarkan aktif di Chromium, ia menang atas
`::-webkit-scrollbar` dan memakai pelukis bawaan yang menggambar tombol panah 3px di ujung
atas-bawah dengan warna thumb, sehingga muncul dua bintik biru menggantung di luar pil.
Sudah diuji: tanpa `scrollbar-color`, bintik itu hilang.

## Tombol kembali ke atas

`src/components/ToTop.astro` + `public/js/to-top.js`. Kotak 44px di pojok kanan bawah,
muncul begitu `#kontak` menyentuh viewport dan tetap tampil selama halaman digulir lebih
jauh. Pemicunya section kontak, bukan section ketiga: sebelum pembaca sampai di ujung
halaman tombol hanya menutupi konten, dan yang dibutuhkan di sana bukan jalan pulang.

- Posisi `right: var(--grid-gutter)` (pojok jendela, bukan tepi konten), jadi di layar
  lebar tombol duduk di gutter luar dan terukur 0 tabrakan glyph pada 25 posisi gulir.
- Tersembunyi memakai `visibility: hidden`, bukan hanya `opacity: 0`, supaya tidak ikut
  kena Tab saat belum tampil.
- `--to-top-lift` dihitung supaya tepi bawah tombol selalu berhenti 16px di atas tepi atas
  footer, berapa pun lebar layar. Di tengah halaman lift 0 karena footer belum terlihat.
- Tanpa JavaScript tombol tetap tersembunyi: tidak ada kontrol mati.
- `href="#main"` tetap berfungsi tanpa JS; dengan JS klik memakai smooth scroll dan
  menghormati `prefers-reduced-motion`.
- Masuk dan keluar dianimasikan, bukan langsung muncul-hilang: `opacity` 0→1 dan
  `translateY(10px)` → `none`, 260ms `--ease-out` saat masuk, 160ms `--ease-in` saat keluar.
- Tanpa `scale()`. Versi pertama memakai `scale(0.96)` dan panah di dalamnya terlihat
  bergeser 0.5px sendiri selama animasi: ikon 16px dipaksa rasterisasi di 15.36px,
  sehingga tepi stroke 1.5px mendarat di batas subpiksel yang berbeda tiap frame.
  Geser murni + `will-change: opacity, transform` (satu lapisan kompositor) membuat
  panah bergerak sebagai bitmap utuh, tanpa digambar ulang per frame. `visibility` ikut ditransisikan dengan delay sepanjang durasi
  keluar — tanpa delay itu `visibility: hidden` memotong animasinya dan tombolnya lenyap
  seketika, persis keluhan "langsung menghilang".
- `pointer-events: none` saat tersembunyi supaya sisa 160ms animasi keluar tidak menangkap
  klik. Saat `prefers-reduced-motion: reduce`, blok transisi tidak dipasang dan tombol
  muncul-hilang tanpa animasi.

## Plat gambar pita wordmark

Pita MIFDLAL digambar seperti plat arsitek: satu kotak yang mengurung huruf
dengan jarak seragam di keempat sisi, node di empat sudutnya, dan garis dimensi
selebar huruf di bawahnya. Semua garis adalah `background-image` statis — nol
elemen tambahan, nol biaya per frame.

| Lapis | Digambar di | Isi |
|---|---|---|
| dasar | `.wordmark` background | dot grid 26px |
| kotak | `[data-plate]::before` | 4 sisi kotak, posisi dari bbox tinta |
| dimensi | `[data-plate][data-dim]::after` | garis + tick 9px di kedua ujung |
| node | `.wm-node` | 4 kotak 12px di sudut kotak |
| anotasi | `.wm-anno` | `fig. 09 · wordmark`, `grid 1180 · dot 26 · 7 glyph`, lebar huruf |

### Ukuran diambil dari huruf, bukan dari container

`paint()` di `public/js/wordmark.js` membaca bbox tinta langsung dari
framebuffer (`gl.readPixels`) setelah satu frame digambar, lalu menulis
`--wm-f-left/-top/-w/-h` dan `--wm-dim-*`. Kotak jadi selalu selebar dan
setinggi huruf yang benar-benar tampil.

Ini bukan kemewahan: bbox kanvas mask **tidak** sama dengan huruf di layar.
Shader menyampel mask 1:1, tapi tepi glyph yang tipis bisa jatuh di bawah
ambang alpha, dan aurora bisa membuat sebagian huruf kembali ke warna tinta.
Mengukur dari output nyata menghapus seluruh selisih itu — terukur, jarak kotak
ke huruf 20/20/19/20 px di 1366, 12/12/13/11 px di 768.

Jarak kotak `clamp(12px, 1.5vw, 24px)`, jadi huruf tidak pernah tersentuh garis,
di lebar layar mana pun.

### Angka di layar tidak boleh bohong

- `data-plate` baru dipasang setelah kanvas berhasil mengukur huruf. Tanpa
  WebGL, tanpa JS, atau font belum siap: pita tampil sebagai kertas + dot grid.
- `data-dim` hanya `true` kalau garis dimensi muat di dalam pita. Di layar
  sempit garis dan angkanya hilang, bukan dipaksa tampil terpotong.
- Label dimensi berisi lebar tinta terukur (mis. `1218`), bukan angka karangan.

Di bawah 1229px label disembunyikan, di bawah 900px node disembunyikan; kotak
dan garis dimensi tetap karena posisinya dihitung dari huruf.

### Garis bawah footer

`border-top` pita memakai `--color-line` dan tidak lagi dibuat transparan saat
`.is-fixed`. Selama reveal garis itu masih tertutup footer; begitu scroll mentok
di dasar, garis muncul tepat di sambungan footer dan pita, selebar layar.

## Wordmark reveal

`public/js/reveal.js` + `.page-track` / `.page-layer` di `Layout.astro`. Pita MIFDLAL
dipasang `position: fixed` di dasar viewport, isi halaman (main + footer) menutupinya
sepenuhnya. Di jarak scroll terakhir, halaman bergerak lebih lambat daripada scroll
sementara pita naik — seperti tutup peti yang diangkat, dan di ujungnya keduanya
bersambung tanpa celah.

Dua lapis:

| Lapis | Elemen | Posisi | z-index |
|---|---|---|---|
| bawah | `.wordmark` | `fixed; inset: auto 0 0 0` | `--z-below` |
| atas | `.page-layer` | normal flow, latar kertas opak | `--z-content` |

Angkanya diturunkan, bukan dikira-kira. `REVEAL = max(2 x tinggi pita, 260px)` jadi
`padding-bottom` di `.page-track`; dorongan maksimum `REVEAL - tinggi pita` diterapkan
sebagai `translateY(+…)` pada `.page-layer`. Karena isi terdorong ke bawah selama
reveal, tepi bawah footer bergerak naik lebih lambat daripada scroll, dan saat
`progress = 1` posisinya jatuh persis di tepi atas pita:

```
tepi bawah footer = tinggi viewport - REVEAL - dorongan = tinggi viewport - tinggi pita
```

`padding-bottom` sengaja dipasang di `.page-track` (di luar lapis), bukan di
`.page-layer`: kalau padding ada di dalam lapis, latar kertasnya ikut memanjang ke bawah
dan pita di belakangnya tidak akan pernah kelihatan.

Detail lain:

- Bayangan tepi turun dari 1 ke 0 menjelang akhir: hilang tepat saat menyatu.
- Pita naik dari `0.3 x tinggi pita` ke 0, opacity 0.7 ke 1.
- `border-top` pita dibuat transparan dalam mode fixed supaya tidak ada jahitan.
- Kanvas aurora turun ke separuh frame selama reveal (`data-revealing`), karena GPU
  saat itu sedang dipakai menggeser seluruh halaman.

### Kenapa scroll-timeline, bukan rAF

Versi pertama menulis `transform` tiap frame dari `requestAnimationFrame` di handler
`scroll`. Hasilnya terasa patah-patah di area reveal: scroll di Chrome berjalan di
compositor, sedangkan tulisan kita terjadi di main thread sesudahnya, jadi isi halaman
tertinggal satu frame di belakang posisi scroll. Selama reveal, isi bergerak 0,5x
kecepatan scroll, jadi selisih satu frame itu terasa.

Sekarang `animation-timeline: scroll(root block)` + `animation-range: calc(100% -
var(--reveal-distance)) 100%` menggerakkan `transform` dan `opacity` langsung di
compositor. Skrip hanya menyiapkan tiga variabel (`--reveal-distance`,
`--reveal-lift`, `--wm-band-h`) sekali saat ukur, lalu menyalakan/mematikan kanvas.
Tidak ada lagi tulis gaya per frame.

Browser tanpa `animation-timeline` (dan tanpa `@supports` itu) jatuh ke jalur lama:
`transform` inline dari rAF. Kedua jalur diuji dan menghasilkan geometri identik
(`seam = 0` di ujung), jalur lama hanya kurang halus.

Bayangan juga bukan `box-shadow` lagi: `box-shadow` pada elemen setinggi dokumen harus
digambar ulang setiap kali kekuatannya berubah. Sekarang strip gradien 64px dengan
`opacity` yang dianimasikan — cuma disentuh compositor.
- Kanvas berhenti menggambar selama pita masih tertutup (`data-awake="false"`), dibangunkan
  lewat `band.__wake()` saat mulai terbuka.
- Tanpa JS atau `prefers-reduced-motion: reduce`: mode reveal tidak dipasang, pita tetap
  di alur normal setelah footer seperti sebelumnya.

## Wordmark setelah footer

`src/components/Wordmark.astro` + `public/js/wordmark.js`. Pita penuh selebar halaman di
bawah footer berisi `MIFDLAL` raksasa, diisi Aurora (React Bits) yang bergerak dan
mengikuti kursor.

Cara kerjanya: huruf tidak ditulis sebagai teks, tapi digambar ke kanvas 2D sebagai mask,
lalu shader Aurora memotong cahayanya dengan alpha mask itu. Jadi warna hanya hidup di
dalam huruf, latar tetap kertas.

| Bagian | Nilai |
|---|---|
| Tinggi pita | `clamp(5rem, 22vw, 32rem)` |
| Padding | `clamp(0.75rem, 2.4vw, 1.75rem)` vertikal, `clamp(1rem, 4vw, 3.5rem)` horizontal |
| Dasar huruf | `--color-ink` |
| Stop Aurora | `--color-electric` → `--color-violet` → `--color-magenta` |
| Huruf | Space Grotesk 700, tracking `-0.035em`, `ctx.letterSpacing` supaya kerning utuh |
| Reveal | `.is-armed` → `.is-in` (IntersectionObserver 18%), geser 18% + fade 1100ms |

Kenapa mask Canvas2D, bukan `clip-path` atau SVG `<text>`: SVG yang dimuat sebagai mask
tidak mewarisi webfont halaman, dan `clip-path` userSpaceOnUse tidak ikut skala viewBox.
Canvas2D memakai font yang sudah dimuat dokumen, dan ukuran huruf dihitung ulang setiap
resize dari lebar pita dikurangi padding — jadi huruf selalu pas, tidak pernah menempel
tepi.

Kontras terukur di dalam huruf: 5,20 (tengah) sampai 6,61 (ujung kanan) terhadap kertas —
di atas ambang 4,5 untuk teks besar.

Tanpa JavaScript atau tanpa WebGL2, `<span class="wordmark-fallback">` tampil sebagai huruf
tinta biasa dengan padding yang sama. Tanpa JS pita tidak pernah kosong, dan tidak ada
kontrol mati. `prefers-reduced-motion`: waktu shader berhenti, intro langsung selesai.

Shader berjalan hanya saat pita terlihat (`IntersectionObserver`) dan tab aktif
(`document.hidden`), dpr dibatasi 2.

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

## Ikon mikro animasi

Tombol salin email di panel kontak memakai `react-useanimations` 3.1.1 (MIT, nol
runtime dependency, peer `react >= 18`). Ikon dikirim sebagai Lottie JSON di dalam
paket — `copy` 1,6 kB — jadi tidak ada request ke useanimations.com. Player-nya
JavaScript murni: tanpa WASM dan tanpa `eval`, sehingga tetap lolos CSP
`script-src 'self'` (dotLottie dan Rive gugur di sini karena menuntut
`wasm-unsafe-eval`).

Island memakai `client:visible`, jadi chunk `CopyEmail` (24.034 B, 9.630 B gzip)
baru diunduh saat section kontak masuk viewport.

Tiga keputusan yang menentukan hasilnya:

1. **Animasi dipasang pada `<button>`, bukan pada `<span>` ikon.** Prop `render`
   dipakai untuk memindahkan handler ke tombol. Kalau handler menempel di span
   18px, klik pada area padding tombol tidak memicu apa pun — terukur: hanya klik
   tepat di ikon yang beranimasi. Dengan `render`, seluruh kotak 44px jadi pemicu.
2. **Ukuran ikon tidak mengikuti kotak sentuh.** Tombol 44×44 dengan `padding:
   12px` + border 1px menyisakan kotak isi 18px, dan SVG player digambar 100%
   dari kotak isi. Tanpa padding, ikon ikut membesar ke 44px.
3. **Ada glyph statis sebelum hidrasi.** Player baru ada setelah mount; tanpa
   fallback, tombol tampil sebagai kotak kosong di HTML awal dan saat JS mati.

Warna tidak ditulis di komponen: player menulis `--ua-stroke: currentColor`, jadi
ikon mengikuti `color` tombol dan otomatis jadi lemon saat hover.

Animasi ikon `copy` hanya 5 frame @30fps. Dengan `speed={0.65}` terukur 14 state
DOM dalam 282 ms — cukup terlihat, tidak mengganggu. Saat
`prefers-reduced-motion: reduce`, hook paket menghentikan animasi (terukur 1 state)
tetapi penyalinan tetap berjalan.

Umpan balik teks memakai `role="status" aria-live="polite"`: "tersalin" muncul
2,2 detik lalu hilang. Posisinya `position: absolute` di atas tombol supaya
kemunculannya tidak menggeser baris email.

Verifikasi terakhir: 0 error konsol dan 0 pelanggaran CSP (Chromium, CSP diambil
dari `dist/_headers`), clipboard terisi di desktop, mobile 390px, dan mode
reduced-motion, fokus keyboard memakai outline lemon 2px offset 2px.

Menambah ikon lain: `import nama from 'react-useanimations/lib/<nama>'`, lalu
pakai pola `render` yang sama kalau target klik lebih besar dari ikonnya.

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
