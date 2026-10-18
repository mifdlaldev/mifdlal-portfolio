/**
 * Data konten: satu sumber kebenaran.
 * Semua nilai di sini berasal dari KONTEN.md (berbukti).
 * MENAMBAH proyek = menambah entri di sini, bukan mengedit JSX.
 */

export type Project = {
  no: string
  name: string
  role: string
  description: string
  stack: readonly string[]
  live: string
  repo?: string
  note?: string
}

export const projects: readonly Project[] = [
  {
    no: '01',
    name: 'gmrh-kitchen',
    role: 'Website klien',
    description:
      'Situs restoran dan katering dengan katalog menu dan halaman pemesanan.',
    stack: ['Next.js', 'Supabase'],
    live: 'https://gmrh-kitchen.vercel.app',
    note: 'Repo deploy berisi deskripsi "delivered for a client".',
  },
  {
    no: '02',
    name: 'VeggiePos',
    role: 'Aplikasi point of sale',
    description:
      'POS untuk jualan sayur: login, kelola transaksi, stok, dan laporan penjualan harian.',
    stack: ['Web app', 'Vercel'],
    live: 'https://veggie-pos.vercel.app',
  },
  {
    no: '03',
    name: 'Mahoni-House',
    role: 'Landing page',
    description:
      'Landing page villa dua bahasa, Indonesia dan Inggris, dengan route per locale.',
    stack: ['Next.js', 'next-intl'],
    live: 'https://mahoni-house.vercel.app',
  },
  {
    no: '04',
    name: 'conduit',
    role: 'CLI tool',
    description:
      'Tool pengekstrak video berbasis Playwright, untuk otomasi scraping.',
    stack: ['Rust', 'Playwright'],
    live: 'https://conduit-iota-rust.vercel.app',
    repo: 'https://github.com/mifdlaldev/conduit',
  },
  {
    no: '05',
    name: 'e-baso-ikan',
    role: 'E-commerce',
    description:
      'Toko bakso online: katalog produk dan alur checkout sampai pembayaran.',
    stack: ['Web app', 'Vercel'],
    live: 'https://e-baso-ikan.vercel.app',
  },
  {
    no: '06',
    name: 'orbit-cli',
    role: 'CLI tool',
    description:
      'CLI project generator untuk membuat kerangka proyek baru dari terminal.',
    stack: ['Node.js'],
    live: 'https://mifdlaldev.github.io/orbit-cli',
  },
]

export const services = [
  {
    no: '01',
    title: 'Website dan web app',
    body: 'Landing page, company profile, e-commerce, sampai POS. Dari desain sampai deploy, bukan handover file.',
    image: '/services/layanan-01.svg',
  },
  {
    no: '02',
    title: 'Chatbot WhatsApp',
    body: 'Balas pelanggan otomatis dan jawab pertanyaan dari data bisnis Anda, bukan template yang sama terus.',
    image: '/services/layanan-02.svg',
  },
  {
    no: '03',
    title: 'Otomasi AI dan workflow',
    body: 'Hapus kerja berulang, sambungkan tool yang sudah Anda pakai, biar tim kecil tidak kerja dua kali.',
    image: '/services/layanan-03.svg',
  },
] as const

export const stack = [
  /* Website dan web app */
  { name: 'Next.js', logo: '/logos/nextdotjs.svg' },
  { name: 'React', logo: '/logos/react.svg' },
  { name: 'TypeScript', logo: '/logos/typescript.svg' },
  { name: 'Astro', logo: '/logos/astro.svg' },
  { name: 'Tailwind CSS', logo: '/logos/tailwindcss.svg' },
  { name: 'Svelte', logo: '/logos/svelte.svg' },
  { name: 'Hono', logo: '/logos/hono.svg' },
  { name: 'Cloudflare', logo: '/logos/cloudflare.svg' },
  { name: 'Supabase', logo: '/logos/supabase.svg' },
  /* Chatbot */
  { name: 'Claude API', logo: '/logos/anthropic.svg' },
  { name: 'OpenAI API', logo: '/logos/openai.svg' },
  { name: 'Telegram Bot', logo: '/logos/telegram.svg' },
  /* Otomasi AI dan workflow */
  { name: 'n8n', logo: '/logos/n8n.svg' },
  { name: 'Python', logo: '/logos/python.svg' },
  { name: 'GitHub Actions', logo: '/logos/githubactions.svg' },
] as const

/* Angka bukti untuk panel hero. Sumber: GitHub API user mifdlaldev,
   dicek 18 Okt 2026 (public_repos: 21). Perbarui kalau berubah. */
export const publicRepoCount = 21

export const contact = {
  email: 'hello@mifdlal.com',
  emailFallback: 'mifdlaltsaqibalf26@outlook.com',
  github: 'https://github.com/mifdlaldev',
  business: 'https://www.mtadevworks.web.id',
} as const

/* ---------------------------------------------------------------
   DATA DUMMY. Isi ini template, bukan klaim. Ganti sebelum deploy.
   Struktur sengaja dibuat ketat supaya pengisian data asli konsisten.
   --------------------------------------------------------------- */

export type Experience = {
  no: string
  role: string
  org: string
  kind: 'magang' | 'kontrak' | 'freelance' | 'organisasi'
  location: string
  period: string
  points: readonly string[]
  link?: string
}

export const experience: readonly Experience[] = [
  // Isi dengan data nyata. Selama array kosong, section Pengalaman
  // menampilkan empty state. Bentuk satu entri:
  // { no: '01', role: 'Frontend Developer', org: 'Nama perusahaan', kind: 'magang',
  //   location: 'Bandung', period: 'Jun - Agu 2026', points: ['...'], link: 'https://...' },
]

export type Education = {
  no: string
  institution: string
  program: string
  location: string
  period: string
  status: string
  note?: string
}

export const education: readonly Education[] = [
  // Isi dengan data nyata. Selama array kosong, section Pendidikan
  // menampilkan empty state. Bentuk satu entri:
  // { no: '01', institution: 'Telkom University', program: 'S1 Informatika',
  //   location: 'Bandung', period: '2027 - sekarang', status: 'aktif', note: '...' },
]

export type Certification = {
  no: string
  name: string
  issuer: string
  year: string
  credential?: string
}

export const certifications: readonly Certification[] = [
  // Isi dengan data nyata. Selama array kosong, section Sertifikasi
  // menampilkan empty state. Bentuk satu entri:
  // { no: '01', name: 'Nama sertifikasi', issuer: 'Penerbit', year: '2026',
  //   credential: 'https://tautan-verifikasi' },
]
