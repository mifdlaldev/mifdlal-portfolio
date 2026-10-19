/* ============================================================
   SERTIFIKAT — data kurasi.

   Semua entri di sini berasal dari file asli di folder
   SERTIFIKAT milik operator. Tidak ada entri tanpa bukti:
   setiap ID di bawah sudah dicek ke halaman verifikasi
   penerbit (HackerRank: /certificates/<ID> balas 200,
   ID palsu balas 404).

   Gambar di public/certs/ dihasilkan dari PDF/PNG asli
   (render 150 dpi, crop halaman 1, WebP). Entri `featured`
   punya turunan -thumb.webp untuk kartu; entri `more` hanya
   punya versi penuh karena di daftar tidak menampilkan gambar.

   Kurasi: 4 sertifikat pelatihan guru (AI untuk Tenaga
   Pendidik, Desain pembelajaran abad ke-21, Eksplorasi AI,
   Persiapan MCE) TIDAK dimasukkan. Isinya pedagogi, bukan
   rekayasa perangkat lunak, jadi tidak sejalan dengan
   positioning situs. Kalau nanti mau ditampilkan, tinggal
   tambah entri + render gambarnya.
   ============================================================ */

export type Certificate = {
  slug: string
  title: string
  issuer: string
  date: string
  dateLabel: string
  credentialId: string
  verifyUrl?: string
  note?: string
  width: number
  height: number
  thumbWidth?: number
  thumbHeight?: number
}

const HACKERRANK = 'HackerRank'
const hr = (id: string) => `https://www.hackerrank.com/certificates/${id}`
const dicoding = (id: string) => `https://www.dicoding.com/certificates/${id}`

export const featured: readonly Certificate[] = [
  {
    slug: 'se-intern',
    title: 'Software Engineer Intern',
    issuer: HACKERRANK,
    date: '2026-07-26',
    dateLabel: '26 Jul 2026',
    credentialId: '8873F79BFF80',
    verifyUrl: hr('8873F79BFF80'),
    note: 'Sertifikasi peran, bukan satu skill: satu ujian mencakup beberapa kompetensi sekaligus.',
    width: 1400,
    height: 1067,
    thumbWidth: 640,
    thumbHeight: 488,
  },
  {
    slug: 'frontend-react',
    title: 'Frontend Developer (React)',
    issuer: HACKERRANK,
    date: '2026-07-25',
    dateLabel: '25 Jul 2026',
    credentialId: '1178C273AA93',
    verifyUrl: hr('1178C273AA93'),
    note: 'Sertifikasi peran untuk jalur frontend dengan React.',
    width: 1400,
    height: 1067,
    thumbWidth: 640,
    thumbHeight: 488,
  },
  {
    slug: 'sql-advanced',
    title: 'SQL (Advanced)',
    issuer: HACKERRANK,
    date: '2026-07-28',
    dateLabel: '28 Jul 2026',
    credentialId: '534F8AEB6350',
    verifyUrl: hr('534F8AEB6350'),
    note: 'Level tertinggi dari tiga level SQL: join, subquery, sampai optimasi query.',
    width: 1400,
    height: 1067,
    thumbWidth: 640,
    thumbHeight: 488,
  },
  {
    slug: 'problem-solving-intermediate',
    title: 'Problem Solving (Intermediate)',
    issuer: HACKERRANK,
    date: '2026-07-29',
    dateLabel: '29 Jul 2026',
    credentialId: '03DE9A17CAED',
    verifyUrl: hr('03DE9A17CAED'),
    note: 'Struktur data di luar array dan string: hash map, stack, queue.',
    width: 1400,
    height: 1067,
    thumbWidth: 640,
    thumbHeight: 488,
  },
  {
    slug: 'csharp-microsoft',
    title: 'Foundational C# with Microsoft',
    issuer: 'freeCodeCamp × Microsoft',
    date: '2026-07-24',
    dateLabel: '24 Jul 2026',
    credentialId: 'mifdlaldev',
    verifyUrl:
      'https://www.freecodecamp.org/certification/mifdlaldev/foundational-c-sharp-with-microsoft',
    note: 'Kurikulum freeCodeCamp, diuji dan ditandatangani Microsoft Developer Division.',
    width: 1097,
    height: 737,
    thumbWidth: 640,
    thumbHeight: 430,
  },
  {
    slug: 'kiro-spec-driven',
    title: 'Spec-Driven Development dengan Kiro',
    issuer: 'Dicoding',
    date: '2026-07-25',
    dateLabel: '25 Jul 2026',
    credentialId: '98XW0DN90XM3',
    verifyUrl: dicoding('98XW0DN90XM3'),
    note: 'Siklus spec, design, task, implementasi memakai Kiro. Berlaku sampai 25 Jul 2029.',
    width: 1400,
    height: 991,
    thumbWidth: 640,
    thumbHeight: 453,
  },
  {
    slug: 'prompt-engineering',
    title: 'Prompt Engineering untuk Software Developer',
    issuer: 'Dicoding',
    date: '2026-07-25',
    dateLabel: '25 Jul 2026',
    credentialId: 'L4PQ9NKO7PO1',
    verifyUrl: dicoding('L4PQ9NKO7PO1'),
    note: 'Pola prompt untuk aktivitas software development, bukan prompt umum.',
    width: 1400,
    height: 991,
    thumbWidth: 640,
    thumbHeight: 453,
  },
  {
    slug: 'hactiv8-ai',
    title: 'AI Productivity and AI API Integration for Developers',
    issuer: 'Hactiv8',
    date: '2026-08-09',
    dateLabel: '9 Agu 2026',
    credentialId: '09392/H8/CSR/MBA2/VIII/2026',
    note: '10 jam pelatihan, 1-6 Agustus 2026. Nomor sertifikat dipakai untuk verifikasi.',
    width: 1400,
    height: 991,
    thumbWidth: 640,
    thumbHeight: 453,
  },
  {
    slug: 'aws-cloud-genai',
    title: 'Belajar Dasar Cloud dan Gen AI di AWS',
    issuer: 'Dicoding',
    date: '2026-07-25',
    dateLabel: '25 Jul 2026',
    credentialId: '1RXYW586MZVM',
    verifyUrl: dicoding('1RXYW586MZVM'),
    note: 'Dasar AWS Cloud: layanan komputasi, infrastruktur global, model biaya. Berlaku sampai 25 Jul 2029.',
    width: 1400,
    height: 991,
    thumbWidth: 640,
    thumbHeight: 453,
  },
]

export const more: readonly Certificate[] = [
  { slug: 'angular-intermediate', title: 'Angular (Intermediate)', issuer: HACKERRANK, date: '2026-07-28', dateLabel: '28 Jul 2026', credentialId: 'D937574453D9', verifyUrl: hr('D937574453D9'), width: 1400, height: 1067 },
  { slug: 'js-intermediate', title: 'JavaScript (Intermediate)', issuer: HACKERRANK, date: '2026-07-27', dateLabel: '27 Jul 2026', credentialId: 'E24B3CFF3BAA', verifyUrl: hr('E24B3CFF3BAA'), width: 1400, height: 1067 },
  { slug: 'node-intermediate', title: 'Node.js (Intermediate)', issuer: HACKERRANK, date: '2026-07-29', dateLabel: '29 Jul 2026', credentialId: 'A7355C1126D5', verifyUrl: hr('A7355C1126D5'), width: 1400, height: 1067 },
  { slug: 'rest-api-intermediate', title: 'REST API (Intermediate)', issuer: HACKERRANK, date: '2026-07-29', dateLabel: '29 Jul 2026', credentialId: '4FC2682E6F3D', verifyUrl: hr('4FC2682E6F3D'), width: 1400, height: 1067 },
  { slug: 'go-intermediate', title: 'Go (Intermediate)', issuer: HACKERRANK, date: '2026-07-29', dateLabel: '29 Jul 2026', credentialId: 'FACD1DAC9C78', verifyUrl: hr('FACD1DAC9C78'), width: 1400, height: 1067 },
  { slug: 'sql-intermediate', title: 'SQL (Intermediate)', issuer: HACKERRANK, date: '2026-07-28', dateLabel: '28 Jul 2026', credentialId: '45617B100D40', verifyUrl: hr('45617B100D40'), width: 1400, height: 1067 },
  { slug: 'angular-basic', title: 'Angular (Basic)', issuer: HACKERRANK, date: '2026-07-27', dateLabel: '27 Jul 2026', credentialId: '5A8BD60760CE', verifyUrl: hr('5A8BD60760CE'), width: 1400, height: 1067 },
  { slug: 'js-basic', title: 'JavaScript (Basic)', issuer: HACKERRANK, date: '2026-07-27', dateLabel: '27 Jul 2026', credentialId: 'E82132F4C61E', verifyUrl: hr('E82132F4C61E'), width: 1400, height: 1067 },
  { slug: 'css-basic', title: 'CSS (Basic)', issuer: HACKERRANK, date: '2026-07-27', dateLabel: '27 Jul 2026', credentialId: 'AA97954A45E4', verifyUrl: hr('AA97954A45E4'), width: 1400, height: 1067 },
  { slug: 'csharp-basic', title: 'C# (Basic)', issuer: HACKERRANK, date: '2026-07-28', dateLabel: '28 Jul 2026', credentialId: '2E32261D7458', verifyUrl: hr('2E32261D7458'), width: 1400, height: 1067 },
  { slug: 'go-basic', title: 'Go (Basic)', issuer: HACKERRANK, date: '2026-07-28', dateLabel: '28 Jul 2026', credentialId: '33BDA32C0EEF', verifyUrl: hr('33BDA32C0EEF'), width: 1400, height: 1067 },
  { slug: 'java-basic', title: 'Java (Basic)', issuer: HACKERRANK, date: '2026-07-28', dateLabel: '28 Jul 2026', credentialId: 'BC690C5A7AFC', verifyUrl: hr('BC690C5A7AFC'), width: 1400, height: 1067 },
  { slug: 'node-basic', title: 'Node (Basic)', issuer: HACKERRANK, date: '2026-07-28', dateLabel: '28 Jul 2026', credentialId: 'A4A7414D301A', verifyUrl: hr('A4A7414D301A'), width: 1400, height: 1067 },
  { slug: 'problem-solving-basic', title: 'Problem Solving (Basic)', issuer: HACKERRANK, date: '2026-07-29', dateLabel: '29 Jul 2026', credentialId: 'AE96DFB62C2E', verifyUrl: hr('AE96DFB62C2E'), width: 1400, height: 1067 },
  { slug: 'python-basic', title: 'Python (Basic)', issuer: HACKERRANK, date: '2026-07-28', dateLabel: '28 Jul 2026', credentialId: 'DDF74F42663D', verifyUrl: hr('DDF74F42663D'), width: 1400, height: 1067 },
  { slug: 'react-basic', title: 'React (Basic)', issuer: HACKERRANK, date: '2026-07-28', dateLabel: '28 Jul 2026', credentialId: '439BE1075951', verifyUrl: hr('439BE1075951'), width: 1400, height: 1067 },
  { slug: 'sql-basic', title: 'SQL (Basic)', issuer: HACKERRANK, date: '2026-07-28', dateLabel: '28 Jul 2026', credentialId: 'FE050284A5F1', verifyUrl: hr('FE050284A5F1'), width: 1400, height: 1067 },
  { slug: 'dicoding-python', title: 'Memulai Pemrograman dengan Python', issuer: 'Dicoding', date: '2026-07-25', dateLabel: '25 Jul 2026', credentialId: '2VX30GD9QXYQ', verifyUrl: dicoding('2VX30GD9QXYQ'), width: 1400, height: 991 },
]

export const certTotals = {
  total: featured.length + more.length,
  issuers: 4,
  hackerrank: [...featured, ...more].filter((c) => c.issuer === HACKERRANK).length,
  moreHackerrank: more.filter((c) => c.issuer === HACKERRANK).length,
  moreOther: more.filter((c) => c.issuer !== HACKERRANK).length,
} as const
