# KONTEN.md: mifdlal.com

Konten berbukti. Aturan: yang tidak ada buktinya tidak ditulis (R-17, R-36, R-38).
Bahasa: Indonesia untuk narasi, istilah teknis English. Tanpa em dash.
Disinkronkan dengan situs live pada 2026-11-12 (HEAD 159ffc1). Setiap klaim di
bawah punya rujukan berkas atau tautan yang bisa diperiksa.

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
- Pulau React (ChatbotCanvas, CopyEmail, EncryptedText, GradientASCII,
  LogoLoop, ServiceBotIcon, ServiceBrowserIcon, ServiceWorkflowIcon,
  WorkflowCanvas, ui/ascii-art, ui/safari-window) berdefault state 'en' dan
  membaca localStorage mifdlal-prefs; tanpa preferensi tersimpan, ikut nilai
  <html lang>.
- Runtime bahasa (i18n.js) dimuat di SEMUA halaman. Halaman yang melewatkannya
  akan selalu tampil Inggris walau pengunjung memilih Indonesia.
- html lang="en", og:locale en_US + alternate id_ID, JSON-LD inLanguage en.
- Kartu OG (public/og-image.png) dan public/llms.txt juga versi Inggris; keduanya
  dibaca mesin, tidak bisa ditukar saat runtime.

## 0b. STRUKTUR HALAMAN (baru 2026-11-11)

Situs bukan lagi satu halaman. Ada 13 halaman yang dibangun (12 di sitemap):

- /                      beranda, satu halaman panjang berisi 9 section
- /proyek/               indeks 6 proyek
- /proyek/<slug>/        6 halaman detail, satu per proyek
- /layanan/              indeks 3 layanan
- /layanan/<slug>/       3 halaman detail, satu per layanan

Slug proyek: loka-logistics, simulasi-ut-bandung, mahoni-house, conduit,
e-baso-ikan, orbit-cli. Slug layanan: website-web-app, chatbot,
otomasi-ai-workflow. Urutan section beranda: hero, tentang (fig. 02), stack,
proyek (fig. 03), layanan (fig. 04), pengalaman (fig. 05), pendidikan (fig. 06),
sertifikasi (fig. 07 + 07b), kontak (fig. 08), lalu wordmark (fig. 09).

Nav atas: Tentang, Proyek, Layanan, Pengalaman. Nav footer menambah Pendidikan,
Sertifikasi, Kontak, plus tautan indeks /proyek/ dan /layanan/.

## 1. HERO

Nama: Mifdlal Tsaqib Alfarras.

Badge di atas judul (satu, kertas):
"Terbuka untuk proyek" / "Open for projects".

Judul: kata bergilir di tengah kalimat, empat kata per bahasa.
Inggris: "Build What You [Need / Want / Dream / Imagine] Here Quickly"
Indonesia: "Bangun [Kebutuhanmu / Keinginanmu / Mimpimu / Idemu] Di Sini Dengan Cepat"
Kata gilir wajib muat di ruang yang sama; sizer memakai kata terpanjang
("Imagine" / "Keinginanmu") supaya tidak ada pergeseran tata letak. Pengunjung
dengan reduced-motion melihat satu kata diam, tanpa animasi.

Sub-line:
"Websites, web apps, chatbots, and AI automation for development and MVPs,
business needs, and other digital solutions." (versi Inggris, yang dirender)
Indonesia: "Website, web app, chatbot, dan otomasi AI untuk Development & MVP,
kebutuhan bisnis, dan solusi digital lainnya."

CTA utama (satu, isi ink): "Ceritakan masalahnya" -> scroll ke #kontak.
CTA kedua (teks/ghost): "Lihat proyek" -> scroll ke #proyek.

Animasi masuk hero (commit a4fa8f8): badge, judul, sub, dan tombol muncul
berurutan (delay 0 / 70 / 180 / 270 ms), naik 1.25rem sambil memudar, durasi
620ms. CSS murni, bukan modul motion, supaya tidak ada pergeseran tata letak.
Reduced-motion mematikannya; elemen langsung di keadaan akhir.

## 2. PROYEK (6, live link wajib)

Format tiap entri: nomor besar, peran, nama, satu baris fungsi, stack, tautan
live. Komposisi baris lebar bernomor, BUKAN grid kartu identik (RHYTHM 3).
Setiap entri punya halaman detail di /proyek/<slug>/.

Semua tautan live di bawah sudah diverifikasi HTTP 200 (curl -Ls) pada
2026-11-12.

01. PT Loka Logistics Solution
    Peran: website perusahaan.
    Fungsi: situs profil perusahaan logistik B2B, layanan general/project/retail
    cargo, visi misi, area jangkauan, formulir kontak.
    Stack: WordPress.
    Link: https://lokalogistics.co.id/
    Slug: loka-logistics

02. Simulasi Lokasi Ujian UT Bandung
    Peran: aplikasi simulasi.
    Fungsi: wizard enam langkah pemilihan lokasi ujian Universitas Terbuka
    (identitas, wilayah, sekolah, detail, konfirmasi, ringkasan).
    Stack: Vite.
    Link: https://simulasi-pemilihan-lokasi-ujian-ut.vercel.app/
    Slug: simulasi-ut-bandung

03. Mahoni-House
    Peran: landing page.
    Fungsi: landing villa dua bahasa, Indonesia dan Inggris, route terpisah per
    bahasa.
    Stack: Next.js.
    Link: https://mahoni-house.vercel.app
    Slug: mahoni-house

04. Conduit
    Peran: alat web.
    Fungsi: pengekstrak sumber video dari situs hosting video, dibungkus API
    Express dan antarmuka React. Backend Playwright mengambil tautan unduhan
    langsung.
    Stack: TypeScript, React, Playwright.
    Link: https://conduit-iota-rust.vercel.app
    Repo: https://github.com/mifdlaldev/conduit
    Slug: conduit
    Catatan: KONTEN.md versi 2026-10-17 menulis "Rust". Diverifikasi ulang
    2026-11-11 lewat GitHub API (language TypeScript, topik
    playwright/express/react) dan halaman live ("Built with TypeScript +
    React"). Nilai Rust diganti dengan stack yang terbukti. Nama direktori
    live masih memuat "iota-rust", itu sisa nama lama, bukan stack.

05. E-Baso-Ikan
    Peran: toko daring.
    Fungsi: toko daring untuk usaha baso ikan, katalog menu, empat produk
    unggulan, alur pesan ringkas.
    Stack: Next.js, Supabase.
    Link: https://e-baso-ikan.vercel.app
    Slug: e-baso-ikan

06. Orbit CLI
    Peran: alat CLI.
    Fungsi: generator proyek serbaguna, satu perintah menyiapkan proyek pada
    tujuh framework, memakai perintah create resmi tiap framework.
    Stack: TypeScript, Node.js.
    Link: https://mifdlaldev.github.io/orbit-cli/
    Repo: https://github.com/mifdlaldev/orbit-cli
    Slug: orbit-cli

JANGAN tampilkan: AI-Agent (archived, klaim inflated),
AI-Lead-Qualification-Agent (slideware), antigravity-customize, freelance-os.

## 3. TENTANG

Catatan: paragraf ini disimpan apa adanya atas permintaan operator
(2026-11-12). Jangan diubah tanpa izin.

Teks yang dirender (Inggris): judul "Hello, I'm Mifdlal." Paragraf pertama
"I'm an AI Automation & Web Developer with over 2 years of experience and a
Software Engineering background. I build AI automation, chatbots, websites,
and web applications, using AI to make the development process more efficient."
Paragraf kedua "I love exploring new technologies and turning ideas into
something that truly works. Have an idea or project you want to build? Let's
discuss it via the contact info below."
Versi Indonesia disimpan di data-i18n-id.

Konsistensi klaim: KONTEN.md versi 2026-10-17 menolak klaim "X tahun
pengalaman". Teks About yang live sekarang justru memuat "pengalaman lebih
dari 2 tahun". Operator memutuskan teks ini tetap (bukan diubah), jadi aturan
lama itu tidak lagi berlaku untuk section About. Sisa aturan tetap: tanpa
"passionate", tanpa angka pengguna, tanpa logo "Trusted By".

Stack yang tampil di pita logo (53 logo, section Stack) mencakup WordPress,
WooCommerce, Laravel, Flutter, dan lain-lain. Pita itu = teknologi yang
dikenal/dipelajari (lihat catatan kurikulum di bagian Pendidikan), bukan klaim
pengalaman produksi per teknologi. Klaim yang tidak halus: Laravel dan Flutter
dipelajari di SMK, bukan dari proyek berbayar.

## 4. LAYANAN

Tiga jasa. Tiap entri punya halaman detail di /layanan/<slug>/. Setiap halaman
detail menampilkan alur kerja empat langkah: diskusi kebutuhan, rencana dan
desain, bangun dan uji, rilis dan serah terima.

01. Website dan web app (slug website-web-app)
    "Saya bangun landing page, situs profil perusahaan, toko online, dan sistem
    POS. Rancangan tampilan, kode, dan pemasangannya saya kerjakan sendiri."
    Cakupan: landing page, profil perusahaan, e-commerce, POS.

02. Chatbot (slug chatbot)
    "Chatbot membalas pelanggan secara otomatis dan menjawab pertanyaan memakai
    data bisnis Anda sendiri."
    Cakupan: balasan otomatis, jawaban dari data bisnis pelanggan.
    Catatan: judul di situs cuma "Chatbot" (versi 2026-10-17 menulis "Chatbot
    WhatsApp").

03. Otomasi AI dan workflow (slug otomasi-ai-workflow)
    "AI mengerjakan bagian berulang, seperti merangkum pesan masuk dan mengirim
    balasan rutin. Tim Anda menangani kasus yang butuh orang."
    Cakupan: menangani pesan masuk, merangkum konteks pelanggan, mengirim
    balasan otomatis.

Deskripsi ini ditulis ulang pada 2026-11-12 (commit 159ffc1) untuk membuang
tiga pola bahasa mesin: rentang kosong ("dari desain sampai rilis"),
penyangkalan menempel ("bukan sekadar serah terima berkas"), dan em dash
pengganti koma. Prompt chatbot di worker/index.ts dan ringkasan di berkas ini
diselaraskan supaya tidak ada dua versi teks.

Tanpa harga di situs (belum ada paket tetap). Arahkan ke kontak untuk diskusi.

## 5. PENGALAMAN (baru, 2026-11-12)

Satu entri magang, dari src/data/site.ts.

01. PE-SMKK Application Developer, magang.
    Organisasi: Dinas Pekerjaan Umum dan Penataan Ruang Kabupaten Sumedang.
    Periode: Jun - Okt 2025. Lokasi: Sumedang.
    Isi: membangun aplikasi PE-SMKK (Pemantauan dan Evaluasi Sistem Manajemen
    Keselamatan Konstruksi) untuk mendata hasil pemeriksaan keselamatan pada
    proyek konstruksi berjalan. Mengikuti elemen evaluasi kinerja SMKK pada
    Permen PUPR 10/2021, menilai penerapan keselamatan oleh penyedia jasa per
    proyek, bukan mencatat insiden setelah kejadian. Dipakai petugas lapangan
    Bidang Bina Konstruksi saat pemeriksaan.

## 6. PENDIDIKAN (baru, 2026-11-12)

01. SMKN 1 Sumedang, Rekayasa Perangkat Lunak, 2023 - 2026, Lulus.
    Lokasi: Sumedang.
    Catatan kurikulum: basis data relasional dan SQL, pemrograman web statis
    dan dinamis, aplikasi mobile dan desktop, IoT, dan cloud computing.
    Framework yang dipelajari: Laravel dan CodeIgniter untuk backend, React dan
    Next.js untuk frontend, Flutter untuk mobile, Bootstrap dan Tailwind CSS
    untuk antarmuka.

## 7. SERTIFIKASI (baru, 2026-11-12)

27 sertifikat dari 4 penerbit (HackerRank, freeCodeCamp bekerja sama dengan
Microsoft, Dicoding, Hacktiv8). Sembilan ditampilkan sebagai kartu unggulan,
18 sisanya di daftar lengkap (fig. 07b). Setiap ID bisa diperiksa sendiri di
halaman verifikasi penerbitnya. Data: src/data/certificates.ts.

## 8. STACK (baru, 2026-11-12)

Pita logo berjalan, 53 teknologi, dari src/data/site.ts. Dikelompokkan: web dan
app (Next.js, React, TypeScript, Astro, Tailwind CSS, Svelte, Hono, Cloudflare,
Supabase), CMS dan platform (WordPress, WooCommerce, Shopify, Drupal, Joomla),
framework dan bahasa (PHP, Laravel, CodeIgniter, Flutter, Dart, Vue.js, Nuxt,
Angular), basis data (MySQL, PostgreSQL, MongoDB, Redis, SQLite, MariaDB), cloud
dan infrastruktur (AWS, Kubernetes, NGINX, Apache, Firebase, Netlify, Railway),
chatbot (Claude API, OpenAI API, Telegram Bot), otomasi AI dan workflow (n8n,
Python, GitHub Actions), dan alat kerja harian (Cursor, VS Code, Git, GitHub,
GitKraken, Obsidian, Hermes Agent, Node.js, Docker, Podman, Playwright,
Vercel). Logo SVG di public/logos/, viewBox 0 0 24 24.

## 9. KONTAK

Section kontak menampilkan tiga baris spesifikasi dan dua kanal.

Spesifikasi:
- Balasan: 1 hari kerja
- Zona waktu: GMT+7 (WIB)
- Lokasi: Bandung, ID

Kanal:
- Email: hello@mifdlal.com (sudah aktif; kirim lewat mailto)
- WhatsApp: +62 831-4212-1226, tautan wa.me/6283142121226. Nomor diberikan
  pemilik situs lewat file wa-business-mifdlal.txt, ditambahkan 2026-11-11.
  Tujuan: kanal alternatif. Pesan awal terisi otomatis, versi Indonesia dan
  Inggris.

Tautan lain (footer):
- GitHub: https://github.com/mifdlaldev
- LinkedIn: https://www.linkedin.com/in/mifdlal-tsaqib-alfarras/
- Fiverr: https://www.fiverr.com/mifdlal_afs
- Upwork: https://www.upwork.com/freelancers/~01d0da0382e9693426

Catatan sinkronisasi: KONTEN.md versi 2026-10-17 masih menulis "hello@mifdlal.com
(dibuat nanti)", "LinkedIn [isi nanti]", dan "Bisnis mtadevworks.web.id". Ketiga
baris itu sudah tidak benar. Email aktif, LinkedIn terisi, dan tautan MTA Devworks
sudah dihapus dari situs atas perintah operator.

Tanpa form kontak palsu. mailto langsung, atau tautan. (R-26)

## Yang SENGAJA tidak ada di halaman (dan alasannya)

- Testimonial: belum ada klien yang kasih quote berangka. Kosong lebih baik dari palsu (R-18).
- Statistik ("10K+ user", "99,9% uptime"): tidak ada sumbernya (R-17).
- Logo "Trusted By": tidak ada daftar klien publik (R-36).
- FAQ: belum tahu pertanyaan nyata dari klien (R-28).
- Mockup browser raksasa di hero: portofolio jual orang, bukan produk (riset).
  Mockup browser yang ada di kanvas layanan 01 menampilkan situs kerja sendiri,
  bukan situs orang lain.
