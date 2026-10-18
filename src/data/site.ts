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
  },
  {
    no: '02',
    title: 'Chatbot WhatsApp',
    body: 'Balas pelanggan otomatis dan jawab pertanyaan dari data bisnis kamu, bukan template yang sama terus.',
  },
  {
    no: '03',
    title: 'Otomasi AI dan workflow',
    body: 'Hapus kerja berulang, sambungkan tool yang sudah kamu pakai, biar tim kecil tidak kerja dua kali.',
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
  {
    no: '01',
    role: 'Posisi magang',
    org: 'Nama perusahaan',
    kind: 'magang',
    location: 'Kota',
    period: '2026',
    points: [
      'Ringkasan pekerjaan: apa yang dikerjakan dan untuk siapa.',
      'Hasil terukur: angka, cakupan, atau dampak yang bisa diperiksa.',
      'Tools dan stack yang dipakai sehari-hari.',
    ],
  },
  {
    no: '02',
    role: 'Peran lainnya',
    org: 'Nama organisasi',
    kind: 'organisasi',
    location: 'Kota',
    period: '2025 - 2026',
    points: ['Ringkasan kontribusi dan hasil.'],
  },
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
  {
    no: '01',
    institution: 'Nama institusi',
    program: 'Program studi',
    location: 'Kota',
    period: '2027 - sekarang',
    status: 'aktif',
    note: 'Catatan opsional: fokus studi atau pencapaian.',
  },
]

export type Certification = {
  no: string
  name: string
  issuer: string
  year: string
  credential?: string
}

export const certifications: readonly Certification[] = [
  {
    no: '01',
    name: 'Nama sertifikasi',
    issuer: 'Penerbit',
    year: '2026',
    credential: '',
  },
]
