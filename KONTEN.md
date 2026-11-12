# KONTEN.md: mifdlal.com

Konten berbukti. Aturan: yang tidak ada buktinya tidak ditulis (R-17, R-36, R-38).
Bahasa: Indonesia untuk narasi, istilah teknis English. Tanpa em dash.

## 0. BAHASA SITUS (diubah 2026-11-11)

Default situs adalah INGGRIS, untuk semua pengunjung, tanpa deteksi bahasa
peramban. Alasan: pasar internasional. Mekanismenya:

- Markup Astro merender teks Inggris langsung, jadi perayap mesin pencari,
  pratinjau tautan, dan pengunjung tanpa JavaScript semuanya melihat Inggris.
- Versi Indonesia disimpan di atribut data-i18n-id (juga data-i18n-aria-id,
  data-i18n-meta-id, data-i18n-ph-id) dan hanya dipasang runtime i18n.js saat
  pengunjung memilih Indonesia lewat tombol bahasa di footer.
- Atribut data-i18n-en tidak dipakai lagi. Prop Astro tanpa akhiran (title,
  description) berisi versi Indonesia; prop berakhiran En berisi teks yang
  dirender (Inggris).
- Pulau React (EncryptedText, ChatbotCanvas, WorkflowCanvas, CopyEmail,
  LogoLoop) berdefault state 'en' dan membaca localStorage mifdlal-prefs;
  tanpa preferensi tersimpan, ikut nilai <html lang>.
- html lang="en", og:locale en_US + alternate id_ID, JSON-LD inLanguage en.

Semua proyek di bawah sudah diverifikasi HTTP 200 (curl -L) pada 2026-10-17.

## 1. HERO

Nama: Mifdlal Tsaqib Alfarras
Baris peran: Freelance Web & AI Automation Developer, Bandung.

Value prop (satu baris, tanpa filler):
"Bangun web app dan otomasi AI untuk UMKM Indonesia, dari nol sampai live."

Sub-line (bukti langsung, bukan klaim):
"6 proyek live. Kode terbuka di GitHub. Kerjakan sendiri dari desain sampai deploy."

CTA utama (satu, isi ink):
"Lihat proyek" -> scroll ke section proyek.
CTA kedua (teks/ghost):
"Email saya" -> mailto hello@mifdlal.com (aktif nanti; sementara pakai alamat yang ada).

Tanpa badge pill di atas H1. Tanpa angka palsu. Tanpa "crafted with passion".

## 2. PROYEK (4 terkuat, live link wajib)

Format tiap entri: nomor besar, nama, satu baris fungsi, stack, tautan live.
Komposisi baris lebar bernomor, BUKAN grid kartu identik (RHYTHM 3).

01. PT Loka Logistics
    Fungsi: situs profil perusahaan logistik B2B, layanan general/project/retail
    cargo, visi misi, area jangkauan, formulir kontak.
    Stack: WordPress, tema kustom.
    Link: https://lokalogistics.co.id/

02. Simulasi Lokasi Ujian UT Bandung
    Fungsi: wizard enam langkah pemilihan lokasi ujian Universitas Terbuka
    (identitas, wilayah, sekolah, detail, konfirmasi, ringkasan).
    Stack: Vite, JavaScript.
    Link: https://simulasi-pemilihan-lokasi-ujian-ut.vercel.app/

03. Mahoni-House
    Fungsi: landing villa, dua bahasa Indonesia/Inggris.
    Stack: Next.js, next-intl.
    Link: https://mahoni-house.vercel.app

04. conduit
    Fungsi: tool pengekstrak video berbasis Playwright.
    Stack: TypeScript, React, Express, Playwright.
    Link: https://conduit-iota-rust.vercel.app
    Repo: https://github.com/mifdlaldev/conduit
    Catatan: KONTEN.md versi 2026-10-17 menulis "Rust". Diverifikasi ulang
    2026-11-11 lewat GitHub API (language TypeScript, topik playwright/express/
    react) dan halaman live ("Built with TypeScript + React"). Nilai Rust
    diganti dengan stack yang terbukti.

Cadangan (DIPAKAI sejak 2026-11-11 sebagai entri 05 dan 06 di situs):
e-baso-ikan (Next.js + Supabase, https://e-baso-ikan.vercel.app) dan
orbit-cli (TypeScript, https://mifdlaldev.github.io/orbit-cli). Keduanya
diverifikasi HTTP 200 dan punya repo publik di github.com/mifdlaldev.

JANGAN tampilkan: AI-Agent (archived, klaim inflated), AI-Lead-Qualification-Agent
(slideware), antigravity-customize, freelance-os.

## 3. TENTANG

Paragraf jujur, tanpa "berpengalaman X tahun", tanpa "passionate":

"Saya Mifdlal, developer di Bandung. Saya bangun aplikasi web dan otomasi AI untuk
bisnis kecil dan menengah di Indonesia. Fokus saya: hasil yang jalan, bukan slide.
Tiap proyek di halaman ini punya tautan yang bisa kamu klik sendiri. Saya kerjakan
dari desain sampai deploy, dan saya pakai AI sebagai alat kerja supaya pengiriman
lebih cepat tanpa menurunkan mutu."

Stack yang benar-benar dipakai (dari repo nyata): Next.js, Svelte, TypeScript,
Rust, Supabase, Cloudflare (D1), Playwright, Bun, HTML/CSS/JS.

Yang sedang dipelajari (jujur, per kebijakan vault): otomasi workflow n8n.
Yang TIDAK diklaim: Laravel, mobile app, "X tahun pengalaman", klien bayaran.

## 4. LAYANAN

Tiga jasa, dari positioning vault, tiap baris fungsi konkret (bukan buzzword):

- Website & web app: landing page, situs profil perusahaan, toko online, POS, dari desain sampai pemasangan.
- Chatbot WhatsApp: membalas pelanggan otomatis dan menjawab pertanyaan memakai data bisnis pelanggan.
- Otomasi AI & workflow: AI mengerjakan bagian berulang, seperti merangkum pesan masuk dan mengirim balasan rutin.

Tanpa harga di situs (belum ada paket tetap). Arahkan ke kontak untuk diskusi.

## 5. KONTAK

- Email: hello@mifdlal.com (dibuat nanti). Sementara: mifdlaltsaqibalf26@outlook.com
- WhatsApp: +62 831-4212-1226 (tautan wa.me/6283142121226). Nomor diberikan
  pemilik situs lewat file wa-business-mifdlal.txt, ditambahkan 2026-11-11.
  Tujuan: kanal alternatif bagi pengunjung yang tidak mau membuka email.
  Pesan awal terisi otomatis, versi Indonesia dan Inggris.
- GitHub: https://github.com/mifdlaldev
- LinkedIn: [tautan profil, isi nanti]
- Bisnis: https://www.mtadevworks.web.id

Tanpa form kontak palsu. mailto langsung, atau tautan. (R-26)

## Yang SENGAJA tidak ada di halaman (dan alasannya)

- Testimonial: belum ada klien yang kasih quote berangka. Kosong lebih baik dari palsu (R-18).
- Statistik ("10K+ user", "99,9% uptime"): tidak ada sumbernya (R-17).
- Logo "Trusted By": tidak ada daftar klien publik (R-36).
- FAQ: belum tahu pertanyaan nyata dari klien (R-28).
- Mockup browser raksasa di hero: portofolio jual orang, bukan produk (riset).
