# DESIGN.md — mifdlal.com

Arah desain untuk situs personal brand Mifdlal Tsaqib Alfarras.
File ini = arah (soul), bukan filter. Filter = antislop (core + antislop-ui).

Versi ini menyatukan 3 referensi visual yang diminta operator:
CommandCode (struktur), Cursor (ketenangan), macOS Tahoe Liquid Glass (permukaan).
Aturan: ambil PRINSIP tiap sumber, bukan tampilan literalnya. Kloning = slop (R-30).

## Identitas

- **Situs**: mifdlal.com, personal brand.
- **Pemilik**: Mifdlal Tsaqib Alfarras, Bandung, Indonesia.
- **Peran**: freelance Web & AI Automation Developer untuk UMKM Indonesia.
- **Pemisahan brand**: MTA Devworks (mtadevworks.web.id) = sisi bisnis/jasa.
  mifdlal.com = wajah personal, bukti kerja, pintu masuk. Beda fungsi, jangan tabrakan.

## Audiens

Dua lapis:
1. **UMKM / calon klien lokal** (Indonesia). Butuh: paham apa yang dikerjakan, lihat bukti nyata, hubungi cepat.
2. **Recruiter / sesama developer**. Butuh: link repo + live demo yang benar-benar jalan.

Konsekuensi desain: situs TIDAK boleh pakai kostum terminal gelap penuh yang
mengasingkan klien UMKM. Kredibilitas developer dipakai sebagai lapisan, bukan seluruh bahasa.

## Personality

Kalem, teknis, jujur. Tidak jualan berlebihan. Bukti dulu, klaim belakangan.
Nada: seperti developer yang menjelaskan hasil kerjanya, bukan agensi yang pitching.

## Sintesis 3 Referensi (keputusan inti)

| Sumber | Yang DIAMBIL (prinsip) | Yang DIBUANG (biar bukan klon) |
|---|---|---|
| **CommandCode** | Sistem section bernomor besar (`01`/`02`...) + label mono; struktur editorial dev-tool; klaim dipimpin bukti/link, bukan slogan | Terminal window palsu, stats "100K+ dev" (kita tidak punya), mono sebagai seluruh tampilan, estetika warn (`//` comment) di mana-mana |
| **Cursor** | Whitespace lega; SATU bukti besar di hero (di situ produk, di kita SATU live demo); aksen tunggal hemat; hierarki tipografi tegas; tombol CTA jelas | Bar "Trusted by teams" + carousel quote (kita TIDAK punya testimoni — R-17/R-36), mockup produk besar yang tidak ada produknya |
| **macOS Tahoe (Liquid Glass)** | Sudut membulat konsisten; Maks 2-3 permukaan kaca; specular edge (garis highlight atas); depth via lapisan, bukan drop-shadow berat; adaptif terang/gelap | Kaca di SEMUA elemen (nav+kartu+tombol+modal sekaligus) = visual soup; refraction asli (CSS tidak bisa, `backdrop-filter` tidak menggusur piksel); glass di layar mobile |

**Verdict**: kombinasi bisa, dengan disiplin. "Semangat" ketiganya = halaman gelap
dev-tool yang terstruktur, tenang, dengan beberapa permukaan kaca membulat. Bukan
tumpukan glass+glow+gradient+mono di semua tempat (itu justru tell AI-slop nomor satu).

## Palet (2 core + 1 accent, per R-29)

Data pendukung (you.com, createtoday.io 2026, 5.304 situs): neutral accent 35,4%,
amber 24,5% (total sekitar 60% situs portofolio). Situs developer condong near-black
monokrom. Semua lewat WCAG AA.

| Nama | Hex | Peran | Alasan |
|---|---|---|---|
| Ink navy | `#0A1628` | Base background / ink | Warna banner LinkedIn yang sudah dipakai. Cockpit gelap bikin kode dan tipografi maju. Selaras base gelap CommandCode + Cursor. |
| Paper | `#F4F1EA` | Teks di atas navy, permukaan terang | Off-white hangat, bukan putih steril. Kesan editorial, bukan kaku. |
| Amber | `#F59E0B` | Accent tunggal | Aksen #2 terpopuler di portofolio (24,5%). Dipakai hemat, hanya di titik kunci. Sealiran Cursor: satu aksen saja. |
| Concrete | `#3A4A63` | Garis, permukaan kartu, state non-aktif | Turunan navy, jaga monokrom. |
| Glass tint | `rgba(255,255,255,0.10)` | Isi permukaan kaca | Bukan warna baru, cuma overlay. Lihat aturan glass di bawah. |

Aturan accent: amber hanya di (1) satu CTA utama, (2) penanda link aktif/hover.
Bukan di semua tombol, badge, ikon, garis sekaligus (R-13 dose cap).

## Sistem Permukaan Kaca (Liquid Glass realistis)

Fakta teknis (you.com, theplusaddons 2026, Medium/ExpertAppDevs 2026): web TIDAK bisa
mereplikasi refraction Liquid Glass — `backdrop-filter` punya 10 fungsi, tidak ada yang
menggeser piksel. Yang bisa direplikasi = blur + translucency + garis specular statis.
Itu sudah sekitar 80% persepsi kualitas.

**Aturan keras:**
1. **Maks 2 permukaan kaca per viewport** (R-10 dose cap). Dipilih: (a) sticky nav, (b) kartu proyek saat hover/focus. Tidak ada di section lain.
2. **Blur 8-12px, sanggup naik ke 14px max.** Bukan 20px+. Blur tinggi = GPU mahal, hasil tak sepadan.
3. **Specular edge = garis highlight atas**, ini baris yang bikin panel dibaca sebagai kaca, bukan film buram:
   ```css
   box-shadow:
     inset 0 1.5px 0 rgba(255,255,255,.85),
     inset 0 -1px 0 rgba(255,255,255,.14),
     0 10px 30px rgba(0,0,0,.32);
   ```
4. **Wajib ada teks film** di belakang teks di atas kaca: lapisan solid ~30-40% opacity, supaya noise background tidak menurunkan kontras. Jangan pernah taruh teks 14px langsung di kaca 10% opacity.
5. **Fallback wajib**: `@supports not (backdrop-filter: blur(1px))` -> background solid opaque.
6. **`prefers-reduced-transparency: reduce`** -> kaca jadi opaque `#1a1f38`, `backdrop-filter` dihapus.
7. **Kaca OFF di mobile** (`max-width: 768px`): layar kecil + GPU rendah = jank, dan teks di atas kaca susah dibaca. Nav mobile = solid.
8. **Jangan animasikan nilai blur.** Animasi opacity/transform saja (murah). `will-change` hanya saat animasi.
9. Kaca butuh latar bertekstur di belakangnya. Kaca di atas section polos = tidak terbaca sebagai kaca.

## Sistem Radius (Tahoe = membulat, tapi jangan semua pill, R-11)

| Elemen | Radius | Alasan |
|---|---|---|
| Panel / section kaca besar | 24px | Selaras sudut membulat Tahoe di elemen besar. |
| Kartu proyek | 16px | Satu tingkat di bawah panel. |
| Input / tech badge / tag | 8px | Presisi, bukan kapsul. |
| Tombol CTA utama | pill penuh (999px) | **Hanya SATU elemen pill di seluruh halaman.** Ini titik fokus. |

Semua elemen pill = tell template. Variasi radius = alat hierarki (R-11).

## Tipografi (reason ditulis per R-06)

- **Display (headline)**: serif. Alasan: riset menunjukkan serif body 13,9% di situs
  portofolio vs 7,5% di galeri umum, hampir 2x, dipakai untuk signal kredibilitas
  editorial/artisanal. Serif membedakan dari template dev Sans-serif.
  Pilihan konkret: sistem serif (Georgia, "Iowan Old Style", "Palatino Linotype", serif).
- **Body / UI**: system sans stack (`system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`).
  Alasan: load instan, nol dependency jaringan, tidak bisa mati. Body 17px min, line-height 1.6.
- **Mono**: system mono stack (`ui-monospace, "SFMono-Regular", Menlo, monospace`).
  Alasan: dipakai HANYA untuk (a) nomor section, (b) tag tech, (c) nama repo. Itu identitas
  developer yang nyata, bukan kostum "terminal aesthetic" penuh (R-06).

Font asing (Google Fonts CDN) ditolak: operator memutuskan hindari CDN yang bisa mati.

## Layout

- **Satu halaman**, scroll vertikal. Riset konsisten: portofolio dev paling kuat =
  1 halaman, 3-4 proyek dengan live link (Brittany Chiang, T. Rascia, dev.to study).
- Urutan section ikut narasi konten, bukan template AI (R-05, C-3):
  1. Hero: nama + satu baris value prop + bukti live (satu demo besar, gaya Cursor).
  2. Proyek: 4-6 proyek live (baris lebar bernomor, bukan grid kartu identik).
  3. Tentang: paragraf jujur, stack, apa yang sedang dikerjakan.
  4. Layanan: apa yang bisa dikerjakan (website, chatbot WA, otomasi workflow).
  5. Kontak: email + GitHub, tanpa form palsu.
- Nav: sticky, satu-satunya elemen kaca permanen. Isi: nama + 3-4 anchor + satu tombol CTA pill.
- Tanpa section: "Trusted By" logo bar, testimonial rekaan, FAQ template, statistik palsu.
  Alasan: belum ada datanya (R-17, R-18, R-36, R-38).

## Motion (dials)

**Dial: ENERGY 2 / RHYTHM 3 / MOTION 1.**

- ENERGY 2 (balanced): berani di tipografi, tenang di chrome. Bukan neon, bukan steril.
- RHYTHM 3 (varied): tiap section berbeda komposisi. Proyek = baris lebar bernomor,
  bukan grid kartu identik. Tentang = kolom teks. Layanan = list, bukan 3 kartu sama.
- MOTION 1 (hover only): tanpa fade-up massal, tanpa parallax, tanpa loop abadi (R-19).
  Hover dan focus state saja. Hargai `prefers-reduced-motion`.
- Interaksi kaca: saat hover kartu, opacity kaca naik halus + garis specular muncul.
  Bukan scale, bukan blur berubah (mahal).

## Motif identitas

Satu gesture yang diulang: **nomor section besar + label mono kecil** (mis. `01 PROYEK`,
`02 TENTANG`). Ini memberi struktur editorial yang khas (dari CommandCode: sistem
bernomor) dan menandai halaman ini sebagai milik seseorang, bukan template. Alasan ditulis (R-31).

## Yang dibuang dari ketiga referensi (biar bukan klon)

- **CommandCode**: terminal window palsu, statistik angka besar yang kita tidak punya,
  mono di seluruh UI.
- **Cursor**: quote/testimonial carousel (kita nol testimoni), bar "trusted by",
  mockup produk hero (kita tidak jual produk SaaS).
- **Tahoe**: kaca di setiap elemen, refraction (tidak bisa di web), shadow berat
  (Tahoe justru pakai refractive edge, bukan drop shadow besar), animasi blur.

## Larangan eksplisit (dari antislop, sesuai riset)

- Tanpa em dash (R-02).
- Tanpa gradient biru-ungu, glow di mana-mana, glassmorphism di navbar+kartu+tombol sekaligus.
- Tanpa fake terminal window sebagai hero (R-06, C-5).
- Tanpa bento mosaic, tanpa grid seragam, tanpa 3 kolom harga template.
- Tanpa ikon generik (sparkle, robot, orb) atau satu library ikon tipis seragam.
- Tanpa badge pill "AI Powered" di atas H1. Pill hanya untuk CTA utama.
- Tanpa mockup browser frame besar di hero (lihat di atas).

## Design Read (deklarasi sebelum generate, R-37)

Reading this as: personal developer portfolio for UMKM clients and technical recruiters,
in an editorial dark-navy and amber language with a restrained liquid-glass layer
(max 2 surfaces, specular-edge, opaque fallback), dial ENERGY 2 / RHYTHM 3 / MOTION 1.
Structure borrowed from CommandCode (numbered sections), calm from Cursor (whitespace,
single accent), surface treatment from macOS Tahoe Liquid Glass (rounded, translucent,
specular edge) -- principles only, not a clone.

## Accessibility (non-negotiable)

- Kontras teks >= 4.5:1 (body), >= 3:1 (large). Uji terhadap SEMUA posisi scroll, karena latar kaca berubah.
- Focus state keyboard terlihat jelas (outline 2px amber + offset).
- `prefers-reduced-motion` -> matikan transisi.
- `prefers-reduced-transparency` -> kaca jadi opaque.
- Touch target >= 44px (HIG).
- Uji di Android mid-range, bukan cuma MacBook. Kaca mahal di GPU rendah.

## Sumber riset

- Apple Newsroom, "Apple introduces ... Liquid Glass" (Jun 2025) — definisi material: reflect/refract, real-time, specular highlight.
- theplusaddons.com/blog/liquid-glass-ui (Sep 2026) — resep specular edge 3-baris, batas CSS (backdrop-filter tidak menggusur piksel), performance rules.
- medium.com/@expertappdevs (Jan 2026) — prinsip Liquid Glass: hierarchy, harmony, depth; best practice (hindari nested glass, batasi di list).
- neelnetworks.com/blog/glassmorphism-web-design-guide-2026 — accessibility/perf checklist, @supports fallback, blur 8px > 20px.
- getpurlize.com — "glass = seasoning, not main course"; 2-3 elemen per viewport; fallback solid.
- superdesign.dev/blog/apple-design-system (Jun 2026) — HIG: SF Pro, semantic color, tap target 44pt, Liquid Glass.
- createtoday.io/examples?category=portfolio (458 situs, stats warna/font, Agt 2026)
- createtoday.io/examples?category=web-developer-portfolio (32 situs dev, Agt 2026)
- ccolorpalette.com/guides/portfolio-color-palettes (Cinematic dark: #0F172A/#F59E0B)
- digitalheroesco.com/styles/brutalist-web (brutalism vs neo-brutalism, Mei 2026)
- alexberman.com/web-designer-freelance-portfolio (struktur case study, Mar 2026)
- dev.to/mryadavgulshan (1 halaman, live demo, form nyata)
- middlehost.com/blog/web-developer-portfolio-examples (checklist, Jan 2026)
