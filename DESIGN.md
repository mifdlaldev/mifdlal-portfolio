# DESIGN.md: mifdlal.com

Arah desain untuk situs personal brand Mifdlal Tsaqib Alfarras.
File ini = arah (soul). Filter = antislop (core + antislop-ui).

**Revisi 2026-10-17 (v2):** operator meminta bahasa desain mengikuti **warp.dev**
secara presisi (layout, komponen, tipografi, warna). Sebelumnya memakai arah
dark-navy + amber + liquid glass: dibuang seluruhnya. Klon eksplisit diizinkan
oleh R-30 hanya bila operator meminta langsung (dokumen ini mencatat permintaan itu).

Yang DIADOSI = bahasa desain Warp, diukur dari CSS produksi mereka, bukan aset brand:
- Token warna, rasio, ritme spasi, pola komponen, sistem tipografi, latar dot-grid.
Yang TIDAK disalin: font proprietary (theFuture, Matter), logo/glyph Warp, teks/klaim mereka.

## Identitas

- **Situs**: mifdlal.com, personal brand.
- **Pemilik**: Mifdlal Tsaqib Alfarras, Bandung, Indonesia.
- **Peran**: freelance Web & AI Automation Developer untuk UMKM Indonesia.
- **Pemisahan brand**: MTA Devworks (mtadevworks.web.id) = sisi bisnis/jasa.
  mifdlal.com = wajah personal, bukti kerja, pintu masuk.

## Token (diukur dari warp.dev, CSS chunk /_next/static/immutable/chunks/*.css)

| Token | Nilai | Asal / peran |
|---|---|---|
| ink (`--p-space`) | `#1a1522` | Teks utama. Near-black dengan tint ungu. |
| paper | `#fdfcf1` | Latar cream hangat (bukan putih steril). |
| electric (`--p-8bit`) | `#2a1eff` | Aksen utama: label fig, link, hover, tanda bulan. |
| lemon | `#eef17c` | Highlight sekunder (glyph brand mark). Dipakai sangat hemat. |
| lilac (`--p-lilac`) | `#b7a4f2` | Cadangan aksen, saat ini tidak dipakai di UI. |
| muted | `#1a1522b3` | Teks sekunder (70% ink). Dicream ≈ 5.6:1 (WCAG AA). |
| line | `#1a152229` | Hairline pemisah (18% ink). |
| line-soft | `#1a152212` | Titik dot-grid (7% ink). |

Latar: dot grid `radial-gradient(circle at 1px 1px, line-soft 1.2px, transparent 0)`
dengan `background-size: 26px 26px`, `background-attachment: fixed`. Ini tekstur
blueprint, bukan blok warna.

## Tipografi

Warp memakai font proprietary: `theFuture` (sans), `matter` (body), `azeretSemiMono`
(mono), `Instrument Serif`. Font itu berlisensi dan tidak boleh dipakai ulang, jadi
diganti substitusi bebas dengan peran identik:

| Peran | Warp (proprietary) | Substitusi bebas | Alasan |
|---|---|---|---|
| Display (headline) | theFuture | **Space Grotesk Variable** | Grotesque geometris, tracking rapat, weight 600 |
| Body / UI | matter | **Inter Variable** | Sans netral, mata baca panjang |
| Label / data / mono | azeretSemiMono | **Azeret Mono Variable** | Mono yang sama dengan Warp, tersedia bebas |

Self-hosted via `@fontsource-variable/*` (satu `@import` per keluarga di global.css).
Nol CDN eksternal, nol CSP hole, nol FOUT dari request lintas domain. `unicode-range`
membuat browser hanya mengunduh subset latin.

Skala:
- Headline hero: `clamp(2rem, 5.5vw, 3.75rem)`, line-height 1.04, letter-spacing -0.03em.
- Section headline: `clamp(1.5rem, 3.5vw, 2.125rem)`, weight 600.
- Label `.fig-label`: mono 11px, letter-spacing 0.08em, lowercase, warna electric.
- Body: 15-18px, line-height 1.55-1.7, warna muted/ink.

## Layout

- `.wrap`: `max-width: 1180px`, `padding-inline: 24px`, `margin-inline: auto` (persis `.wrap` Warp).
- Nav: tinggi 64px, link mono uppercase 12px.
- Section: `padding-block: clamp(3.5rem, 7vw, 5.5rem)`.
- Urutan: Hero (fig. 01) -> Proyek (fig. 02) -> Tentang (fig. 03) -> Layanan (fig. 04) -> Kontak (fig. 05) -> Footer.
- Motif identitas: label `fig. NN: nama` (mono lowercase) di atas tiap section headline.

## Komponen (grammar Warp)

**Tombol** (`.btn`): kotak, radius 0, border 1px, font mono 12px weight 600,
lowercase, `min-height: 44px`. `.btn-primary` = isi ink + teks paper; hover -> electric.
`.btn-ghost` = transparan + border line; hover -> border ink.

**Panel data**: bingkai 1px, header mono kecil, isi grid statistik `dt/dd`-style
(label mono + nilai). Dipakai di hero sebagai ringkasan bukti (fig. 01 + 4 stat).
Bukan duplikat list proyek.

**Baris proyek**: hairline separator, grid `no | nama+desc | stack | live`.
Hover: tint electric 4% + bar aksen 2px di tepi kiri. Bukan kartu terpisah.

**Tabel kontak**: `dl`-style grid `label mono | nilai mono`, hairline, link underline
yang berubah electric saat hover.

## Motion

**Dial: ENERGY 2 / RHYTHM 3 / MOTION 1.**

- Transisi hanya warna/border/transform, 0.15s ease. Tanpa fade-up massal, tanpa parallax.
- Hover: warna link, bar aksen proyek, border tombol. Tidak ada scale/blur berubah.
- `prefers-reduced-motion: reduce` mematikan transisi.

## Accessibility (non-negotiable)

- Kontras teks >= 4.5:1. muted `#1a1522b3` di cream diverifikasi ≈ 5.6:1.
- Focus state: `outline: 2px solid electric; outline-offset: 2px`.
- Touch target >= 44px di semua tombol + link navigasi.
- Label aksesibel tidak mismatch dengan teks terlihat (aria-label dihapus bila konten sudah deskriptif).
- Skip link ke `#main`.
- `prefers-reduced-motion` mematikan animasi.
- Lighthouse: desktop 100/100/100/100, mobile 99/100/100/100, a11y 100.

## Larangan eksplisit

- Tanpa em dash (R-02).
- Tanpa glassmorphism/backdrop-blur (sudah dibuang; Warp tidak memakainya).
- Tanpa gradient glow / orb dekoratif (tell AI-slop nomor satu).
- Tanpa pill/kapsul (radius 0 di seluruh tombol; Warp kotak).
- Tanpa serif display (Warp pakai grotesque).
- Tanpa fake terminal window, tanpa mockup browser frame besar.
- Tanpa bento mosaic, tanpa 3 kolom harga template.
- Tanpa ikon generik (sparkle, robot, orb).
- Tanpa badge "AI Powered" di atas H1.
- Tanpa section "Trusted By", testimonial, atau statistik yang tidak ada datanya.

## Verifikasi output

- Build: `npx astro build` -> 0.
- Type: `npx tsc -p tsconfig.json --noEmit` -> 0.
- Audit: `npm audit --omit=dev` -> 0 vulnerabilities.
- Lighthouse: desktop 100/100/100/100 (FCP 0.4s), mobile 99/100/100/100 (FCP 1.5s, CLS 0.026).
- Output: 0 `<script>`, CSS gzip ~6 KB, 0 em dash, 6 baris proyek.

## Design Read (deklarasi, R-37)

Reading this as: personal developer portfolio for UMKM clients and technical recruiters,
in a light cream blueprint language with a single electric-blue accent, dot-grid
surface, monospace technical labels, square buttons, and hairline-ruled data rows,
dial ENERGY 2 / RHYTHM 3 / MOTION 1. Design language measured from warp.dev CSS;
fonts and brand assets substituted with open alternatives.

## Sumber

- warp.dev production CSS (`/_next/static/immutable/chunks/*.css`, diambil 2026-10-17) -
  token `--p-space`, `--p-8bit`, `--p-lilac`, `--p-lemon`, `.wrap`, `.btn`, `.tag`,
  `.section-headline`, dot-grid background.
- warp.dev rendered @1440px: hierarki hero (fig label -> headline -> subhead -> 2 tombol -> panel fig).
- Antislop core + antislop-ui (R-02, R-05, R-06, R-11, R-13, R-17, R-30, R-36, R-37).
