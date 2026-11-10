/**
 * Data konten: satu sumber kebenaran.
 * Semua nilai di sini berasal dari KONTEN.md (berbukti).
 * MENAMBAH proyek = menambah entri di sini, bukan mengedit JSX.
 */

export type Project = {
  no: string
  name: string
  nameEn?: string
  role: string
  roleEn?: string
  description: string
  descriptionEn?: string
  stack: readonly string[]
  stackEn?: readonly string[]
  live: string
  repo?: string
  note?: string
  /** Tangkapan layar asli di public/projects/. Wajib: kartu proyek harus
      memuat bukti visual, bukan placeholder. */
  image: string
}

export const projects: readonly Project[] = [
  {
    no: '01',
    name: 'PT Loka Logistics Solution',
    role: 'Website perusahaan',
    roleEn: 'Company website',
    description:
      'Situs profil perusahaan logistik B2B: layanan general, project, dan retail cargo, visi misi, area jangkauan, serta formulir kontak.',
    descriptionEn:
      'B2B logistics company profile site: general, project, and retail cargo services, vision and mission, coverage areas, and a contact form.',
    stack: ['WordPress'],
    stackEn: ['WordPress'],
    live: 'https://lokalogistics.co.id/',
    image: '/projects/loka-logistics.webp',
  },
  {
    no: '02',
    name: 'Simulasi Lokasi Ujian UT Bandung',
    nameEn: 'UT Bandung Exam Location Simulator',
    role: 'Aplikasi simulasi',
    roleEn: 'Simulation app',
    description:
      'Wizard enam langkah untuk memilih lokasi ujian Universitas Terbuka: identitas, wilayah, sekolah, detail, konfirmasi, lalu ringkasan pilihan.',
    descriptionEn:
      'A six-step wizard for choosing an exam location at Universitas Terbuka: identity, region, school, details, confirmation, then a summary of your selection.',
    stack: ['Vite'],
    stackEn: ['Vite'],
    live: 'https://simulasi-pemilihan-lokasi-ujian-ut.vercel.app/',
    image: '/projects/ut-bandung-simulator.webp',
  },
  {
    no: '03',
    name: 'Mahoni-House',
    role: 'Landing page',
    roleEn: 'Landing page',
    description: 'Landing page villa dua bahasa, Indonesia dan Inggris, dengan route per locale.',
    descriptionEn:
      'Two-language villa landing page, Indonesian and English, with per-locale routing.',
    stack: ['Next.js'],
    stackEn: ['Next.js'],
    live: 'https://mahoni-house.vercel.app',
    image: '/projects/mahoni-house.webp',
  },
]
/* Foto layanan: unduhan Unsplash, dipotong 16/10 oleh kanvas layanan.
   Berkas asli ada di public/services/layanan-0N.jpg (1600 px, sRGB).
   Rincian sumber dan status lisensi: ASSET-LICENSES.md. */
export const services = [
  {
    no: '01',
    title: 'Website dan web app',
    titleEn: 'Websites and web apps',
    body: 'Landing page, profil perusahaan, e-commerce, sampai POS. Dari desain sampai rilis, bukan sekadar serah terima berkas.',
    bodyEn:
      'Landing pages, company profiles, e-commerce, up to POS systems. From design to launch, not just handing over files.',
    image: '/services/layanan-01.jpg',
  },
  {
    no: '02',
    title: 'Chatbot',
    titleEn: 'Chatbots',
    body: 'Balas pelanggan secara otomatis dan jawab pertanyaan berdasarkan data bisnis Anda, bukan templat yang selalu sama.',
    bodyEn:
      'Automatically reply to customers and answer questions based on your business data, not the same old templates.',
    image: '/services/layanan-02.jpg',
  },
  {
    no: '03',
    title: 'Otomasi AI dan workflow',
    titleEn: 'AI automation and workflow',
    body: 'AI menangani pesan masuk, merangkum konteks pelanggan, dan mengirim balasan otomatis — tim hanya turun saat benar-benar dibutuhkan.',
    bodyEn:
      'AI handles incoming messages, summarizes customer context, and sends automatic replies — your team only steps in when truly needed.',
    image: '/services/layanan-03.jpg',
  },
] as const

/* Tab showcase di dalam kanvas layanan 01 (Website dan web app).
   Tiap tab memuat satu situs melalui iframe. URL kosong =
   panel placeholder lokal (bukan iframe eksternal).
   Tambah/ubah URL di sini; domain baru juga wajib didaftarkan di
   Content-Security-Policy (frame-src) pada public/_headers. */
export const showcaseSites = [
  { label: 'Loka Logistics', url: 'https://lokalogistics.co.id/' },
  { label: 'Mahoni House', url: 'https://mahoni-house.vercel.app/en' },
  { label: 'Orbit CLI', url: 'https://mifdlaldev.github.io/orbit-cli/' },
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
    {
      id: 'upwork',
      label: 'Upwork',
      href: 'https://www.upwork.com/freelancers/~01d0da0382e9693426',
    },
  ],
} as const

/* ---------------------------------------------------------------
   DATA DUMMY. Isi ini template, bukan klaim. Ganti sebelum deploy.
   Struktur sengaja dibuat ketat supaya pengisian data asli konsisten.
   --------------------------------------------------------------- */

export type Experience = {
  no: string
  role: string
  roleEn?: string
  org: string
  orgEn?: string
  kind: 'Magang' | 'Kontrak' | 'Freelance' | 'Organisasi'
  kindEn?: string
  location: string
  period: string
  periodEn?: string
  points: readonly string[]
  pointsEn?: readonly string[]
  link?: string
}

export const experience: readonly Experience[] = [
  {
    no: '01',
    role: 'Pengembang Aplikasi PE-SMKK',
    roleEn: 'PE-SMKK Application Developer',
    org: 'Dinas Pekerjaan Umum dan Penataan Ruang Kabupaten Sumedang',
    orgEn: 'Public Works and Spatial Planning Office of Sumedang Regency',
    kind: 'Magang',
    kindEn: 'Internship',
    location: 'Sumedang',
    period: 'Jun - Okt 2025',
    periodEn: 'Jun - Oct 2025',
    points: [
      'Membangun aplikasi PE-SMKK (Pemantauan dan Evaluasi Sistem Manajemen Keselamatan Konstruksi) untuk mendata hasil pemeriksaan keselamatan pada proyek konstruksi yang sedang berjalan.',
      'Isinya mengikuti elemen evaluasi kinerja SMKK pada Permen PUPR 10/2021: menilai penerapan keselamatan oleh penyedia jasa per proyek, bukan mencatat insiden setelah kejadian.',
      'Dipakai petugas lapangan Bidang Bina Konstruksi saat pemeriksaan, sehingga hasil penilaian tiap proyek terkumpul di satu tempat.',
    ],
    pointsEn: [
      'Built the PE-SMKK application (Construction Safety Management System Monitoring and Evaluation) to digitize safety inspection results for ongoing construction projects.',
      'Follows the SMKK performance evaluation elements from Minister of PUPR Regulation 10/2021: assessing safety implementation by service provider per project, rather than logging incidents after they happen.',
      'Used by field officers from the Construction Industry Division during inspections, so every project assessment is collected in one place.',
    ],
  },
]

export type Education = {
  no: string
  institution: string
  institutionEn?: string
  program: string
  programEn?: string
  location: string
  period: string
  status: string
  statusEn?: string
  note?: string
  noteEn?: string
}

export const education: readonly Education[] = [
  {
    no: '01',
    institution: 'SMKN 1 Sumedang',
    institutionEn: 'SMKN 1 Sumedang',
    program: 'Rekayasa Perangkat Lunak',
    programEn: 'Software Engineering',
    location: 'Sumedang',
    period: '2023 - 2026',
    status: 'Lulus',
    statusEn: 'Graduated',
    note: 'Materi kejuruan mencakup basis data relasional dan SQL, pemrograman web statis dan dinamis, aplikasi mobile dan desktop, IoT, dan cloud computing. Framework yang dipelajari: Laravel dan CodeIgniter untuk backend, React dan Next.js untuk frontend, Flutter untuk aplikasi mobile, serta Bootstrap dan Tailwind CSS untuk antarmuka.',
    noteEn:
      'Vocational coursework covers relational databases and SQL, static and dynamic web programming, mobile and desktop applications, IoT, and cloud computing. Frameworks studied: Laravel and CodeIgniter for backend, React and Next.js for frontend, Flutter for mobile apps, and Bootstrap and Tailwind CSS for interfaces.',
  },
]
