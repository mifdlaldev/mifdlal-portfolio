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

/* Foto layanan: unduhan Unsplash, dipotong 16/10 oleh kanvas layanan.
   Berkas asli ada di public/services/layanan-0N.jpg (1600 px, sRGB).
   Rincian sumber dan status lisensi: ASSET-LICENSES.md. */
export const services = [
  {
    no: '01',
    title: 'Website dan web app',
    body: 'Landing page, profil perusahaan, e-commerce, sampai POS. Dari desain sampai rilis, bukan sekadar serah terima berkas.',
    image: '/services/layanan-01.jpg',
  },
  {
    no: '02',
    title: 'Chatbot',
    body: 'Balas pelanggan secara otomatis dan jawab pertanyaan berdasarkan data bisnis Anda, bukan templat yang selalu sama.',
    image: '/services/layanan-02.jpg',
  },
  {
    no: '03',
    title: 'Otomasi AI dan workflow',
    body: 'Kurangi pekerjaan berulang, hubungkan perkakas yang sudah Anda gunakan, agar tim kecil tidak mengerjakan hal yang sama dua kali.',
    image: '/services/layanan-03.jpg',
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
  /* CMS dan platform */
  { name: 'WordPress', logo: '/logos/wordpress.svg' },
  { name: 'WooCommerce', logo: '/logos/woocommerce.svg' },
  { name: 'Shopify', logo: '/logos/shopify.svg' },
  { name: 'Drupal', logo: '/logos/drupal.svg' },
  { name: 'Joomla', logo: '/logos/joomla.svg' },
  /* Framework dan bahasa */
  { name: 'PHP', logo: '/logos/php.svg' },
  { name: 'Laravel', logo: '/logos/laravel.svg' },
  { name: 'CodeIgniter', logo: '/logos/codeigniter.svg' },
  { name: 'Flutter', logo: '/logos/flutter.svg' },
  { name: 'Dart', logo: '/logos/dart.svg' },
  { name: 'Vue.js', logo: '/logos/vuedotjs.svg' },
  { name: 'Nuxt', logo: '/logos/nuxt.svg' },
  { name: 'Angular', logo: '/logos/angular.svg' },
  /* Database */
  { name: 'MySQL', logo: '/logos/mysql.svg' },
  { name: 'PostgreSQL', logo: '/logos/postgresql.svg' },
  { name: 'MongoDB', logo: '/logos/mongodb.svg' },
  { name: 'Redis', logo: '/logos/redis.svg' },
  { name: 'SQLite', logo: '/logos/sqlite.svg' },
  { name: 'MariaDB', logo: '/logos/mariadb.svg' },
  /* Cloud dan infrastruktur */
  { name: 'AWS', logo: '/logos/amazonwebservices.svg' },
  { name: 'Kubernetes', logo: '/logos/kubernetes.svg' },
  { name: 'NGINX', logo: '/logos/nginx.svg' },
  { name: 'Apache', logo: '/logos/apache.svg' },
  { name: 'Firebase', logo: '/logos/firebase.svg' },
  { name: 'Netlify', logo: '/logos/netlify.svg' },
  { name: 'Railway', logo: '/logos/railway.svg' },
  /* Chatbot */
  { name: 'Claude API', logo: '/logos/anthropic.svg' },
  { name: 'OpenAI API', logo: '/logos/openai.svg' },
  { name: 'Telegram Bot', logo: '/logos/telegram.svg' },
  /* Otomasi AI dan workflow */
  { name: 'n8n', logo: '/logos/n8n.svg' },
  { name: 'Python', logo: '/logos/python.svg' },
  { name: 'GitHub Actions', logo: '/logos/githubactions.svg' },
  /* Alat kerja sehari-hari */
  { name: 'Cursor', logo: '/logos/cursor.svg' },
  { name: 'VS Code', logo: '/logos/visualstudiocode.svg' },
  { name: 'Git', logo: '/logos/git.svg' },
  { name: 'GitHub', logo: '/logos/github.svg' },
  { name: 'GitKraken', logo: '/logos/gitkraken.svg' },
  { name: 'Obsidian', logo: '/logos/obsidian.svg' },
  { name: 'Hermes Agent', logo: '/logos/hermes.svg' },
  { name: 'Node.js', logo: '/logos/nodedotjs.svg' },
  { name: 'Docker', logo: '/logos/docker.svg' },
  { name: 'Podman', logo: '/logos/podman.svg' },
  { name: 'Playwright', logo: '/logos/playwright.svg' },
  { name: 'Vercel', logo: '/logos/vercel.svg' },
] as const

/* Angka bukti untuk panel hero. Sumber: GitHub API user mifdlaldev,
   dicek 18 Okt 2026 (public_repos: 21). Perbarui kalau berubah. */
export const publicRepoCount = 21

export const contact = {
  email: 'hello@mifdlal.com',
  github: 'https://github.com/mifdlaldev',
  socials: [
    { id: 'github', label: 'GitHub', href: 'https://github.com/mifdlaldev' },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/mifdlal-tsaqib-alfarras/',
    },
    { id: 'fiverr', label: 'Fiverr', href: 'https://www.fiverr.com/mifdlal_afs' },
    { id: 'upwork', label: 'Upwork', href: 'https://www.upwork.com/freelancers/~01d0da0382e9693426' },
  ],
} as const

/* ---------------------------------------------------------------
   DATA DUMMY. Isi ini template, bukan klaim. Ganti sebelum deploy.
   Struktur sengaja dibuat ketat supaya pengisian data asli konsisten.
   --------------------------------------------------------------- */

export type Experience = {
  no: string
  role: string
  org: string
  kind: 'Magang' | 'Kontrak' | 'Freelance' | 'Organisasi'
  location: string
  period: string
  points: readonly string[]
  link?: string
}

export const experience: readonly Experience[] = [
  {
    no: '01',
    role: 'Pengembang Aplikasi PE-SMKK',
    org: 'Dinas Pekerjaan Umum dan Penataan Ruang Kabupaten Sumedang',
    kind: 'Magang',
    location: 'Sumedang',
    period: 'Jun - Okt 2025',
    points: [
      'Membangun aplikasi PE-SMKK (Pemantauan dan Evaluasi Sistem Manajemen Keselamatan Konstruksi) untuk mendata hasil pemeriksaan keselamatan pada proyek konstruksi yang sedang berjalan.',
      'Isinya mengikuti elemen evaluasi kinerja SMKK pada Permen PUPR 10/2021: menilai penerapan keselamatan oleh penyedia jasa per proyek, bukan mencatat insiden setelah kejadian.',
      'Dipakai petugas lapangan Bidang Bina Konstruksi saat pemeriksaan, sehingga hasil penilaian tiap proyek terkumpul di satu tempat.',
    ],
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
    institution: 'SMKN 1 Sumedang',
    program: 'Rekayasa Perangkat Lunak',
    location: 'Sumedang',
    period: '2023 - 2026',
    status: 'Lulus',
    note: 'Materi kejuruan mencakup basis data relasional dan SQL, pemrograman web statis dan dinamis, aplikasi mobile dan desktop, IoT, dan cloud computing. Framework yang dipelajari: Laravel dan CodeIgniter untuk backend, React dan Next.js untuk frontend, Flutter untuk aplikasi mobile, serta Bootstrap dan Tailwind CSS untuk antarmuka.',
  },
]
