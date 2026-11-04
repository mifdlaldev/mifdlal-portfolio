/**
 * Kamus bilingual (ID + EN) untuk mifdlal.com.
 * Satu sumber teks UI. Komponen menempelkan data-i18n="key" pada
 * elemen teks; modus klien (public/js/i18n.js) menimpa textContent
 * sesuai bahasa aktif. String data (nama proyek, dll) tetap di
 * site.ts karena umumnya nama diri + istilah teknis.
 */

export type Locale = 'id' | 'en'

export const dict = {
  id: {
    'nav.tentang': 'Tentang',
    'nav.proyek': 'Proyek',
    'nav.layanan': 'Layanan',
    'nav.pengalaman': 'Pengalaman',
    'nav.mulai': 'Mulai proyek',
    'nav.skip': 'Lewati ke konten',

    'hero.status': 'Terbuka untuk proyek',
    'hero.line1': 'Membangun website',
    'hero.line2': 'dan otomasi AI',
    'hero.sub': 'Saya Mifdlal — pengembang web dan otomasi AI. Situs ini adalah blueprint: setiap bagian diukur, berlabel, dan siap dirakit.',
    'hero.cta.problem': 'Ada yang mau dibangun?',
    'hero.cta.projects': 'Lihat hasil kerja',

    'about.eyebrow': 'Tentang',
    'about.hello': 'Halo, saya Mifdlal.',
    'about.role': 'Pengembang web & otomasi AI',
    'about.p1': 'Saya membangun website yang tidak cuma rapi di layar, tapi juga berjalan cepat, mudah dirawat, dan siap berkembang. Dari landing page sampai aplikasi web dengan data dan alur kerja nyata.',
    'about.p2': 'Di sisi lain, saya menerapkan otomasi berbasis AI: chatbot yang menjawab pelanggan dari data bisnis Anda, workflow yang merangkum percakapan, dan sistem yang mengurangi pekerjaan berulang tim.',
    'about.fig': 'fig. 01 · profil',

    'stack.eyebrow': 'Stack',
    'stack.title': 'Alat yang saya pakai sehari-hari',
    'stack.sub': 'Framework dan layanan yang terbukti untuk situs cepat dan aplikasi web yang stabil.',

    'services.eyebrow': 'Layanan',
    'services.title': 'Yang bisa saya bangun untuk Anda',
    'services.intro': 'Tiga area kerja. Setiap satu diawali dengan memahami masalah, baru merancang dan mengimplementasikan.',
    'services.fig': 'fig. 02 · layanan',
    'services.t1': 'Website dan web app',
    'services.t2': 'Chatbot',
    'services.t3': 'Otomasi AI dan workflow',
    'services.b1': 'Landing page, profil perusahaan, e-commerce, sampai POS. Dari desain sampai rilis, bukan sekadar serah terima berkas.',
    'services.b2': 'Balas pelanggan secara otomatis dan jawab pertanyaan berdasarkan data bisnis Anda, bukan templat yang selalu sama.',
    'services.b3': 'AI menangani pesan masuk, merangkum konteks pelanggan, dan mengirim balasan otomatis — tim hanya turun saat benar-benar dibutuhkan.',

    'projects.eyebrow': 'Proyek',
    'projects.title': 'Hasil kerja yang bisa Anda lihat',
    'projects.sub': 'Setiap proyek diawali dari masalah nyata, lalu dirakit dan diuji sampai berjalan.',
    'projects.live': 'Lihat situs',
    'projects.newTab': 'Buka {{name}} di tab baru',
    'projects.fig': 'fig. 03 · proyek',
    'projects.empty': 'Belum ada proyek yang ditampilkan.',

    'experience.eyebrow': 'Pengalaman',
    'experience.title': 'Pengalaman.',
    'experience.fig': 'fig. 04 · pengalaman',
    'experience.empty': 'Belum diisi.',
    'experience.evidence': 'Bukti ↗',
    'experience.period': '{{start}} — {{end}}',

    'education.eyebrow': 'Pendidikan',
    'education.title': 'Pendidikan formal.',
    'education.fig': 'fig. 05 · pendidikan',
    'education.empty': 'Belum diisi.',
    'education.period': '{{start}} — {{end}}',

    'certs.eyebrow': 'Sertifikasi',
    'certs.title': 'Sertifikasi.',
    'certs.sub': 'Verifikasi langsung di situs penerbit masing-masing.',
    'certs.fig': 'fig. 06 · sertifikasi',
    'certs.all': 'Lihat semua',
    'certs.close': 'Tutup',
    'certs.open': 'Buka sertifikasi',
    'certs.verify': 'verifikasi di situs penerbit ↗',
    'certs.total': '{{count}} sertifikasi tercatat',
    'certs.ofTotal': '{{shown}} dari {{count}} ditampilkan',

    'contact.eyebrow': 'Kontak',
    'contact.title': 'Ceritakan yang ingin Anda bangun.',
    'contact.sub': 'Jika belum yakin kebutuhan Anda termasuk yang mana, ceritakan saja masalahnya. Saya bantu memetakan solusinya.',
    'contact.response': 'Balasan biasanya dalam 1×24 jam',
    'contact.tz': 'Zona waktu WIB (UTC+7)',
    'contact.loc': 'Bandung, Indonesia',
    'contact.email': 'Email',
    'contact.fast': 'Yang mempercepat balasan:',
    'contact.fast1': 'Tujuan akhir situs/aplikasi',
    'contact.fast2': 'Contoh referensi yang Anda suka',
    'contact.fast3': 'Timeline dan anggaran kasar',
    'contact.social': 'Media sosial',
    'contact.fig': 'fig. 07 · kontak',

    'footer.copy': 'Dibangun dengan tangan di Bandung. Diagram blueprint, bukan template.',
    'footer.rights': 'Hak cipta dilindungi.',

    'chat.title': 'Chatbot AI',
    'chat.sub': 'Balasan otomatis dari data situs ini',
    'chat.privacy': 'Percakapan tidak disimpan.',
    'chat.placeholder': 'Ketik pertanyaan Anda…',
    'chat.send': 'Kirim pesan',
    'chat.error': 'Gagal mengirim. Coba lagi.',
    'chat.greeting': 'Halo! Saya asisten virtual Mifdlal. Ada yang bisa saya bantu regarding website, chatbot, atau otomasi AI?',
    'chip.q1': 'Layanan apa saja?',
    'chip.q2': 'Biaya pembuatan website?',
    'chip.q3': 'Berapa lama pengerjaan?',
    'chip.q4': 'Apakah ada maintenance?',

    'totop.label': 'Kembali ke atas',

    'theme.label': 'Tema',
    'theme.system': 'Sistem',
    'theme.light': 'Terang',
    'theme.dark': 'Gelap',
    'lang.label': 'Bahasa',
    'lang.id': 'Bahasa Indonesia',
    'lang.en': 'English',

    'toast.copied': 'Tersalin',

    'meta.viewOriginal': 'Lihat gambar asli',
  },

  en: {
    'nav.tentang': 'About',
    'nav.proyek': 'Work',
    'nav.layanan': 'Services',
    'nav.pengalaman': 'Experience',
    'nav.mulai': 'Start a project',
    'nav.skip': 'Skip to content',

    'hero.status': 'Open for projects',
    'hero.line1': 'Building websites',
    'hero.line2': 'and AI automation',
    'hero.sub': "I'm Mifdlal — a web developer and AI automation builder. This site is a blueprint: every section measured, labelled, and ready to ship.",
    'hero.cta.problem': 'Have something to build?',
    'hero.cta.projects': 'See my work',

    'about.eyebrow': 'About',
    'about.hello': "Hello, I'm Mifdlal.",
    'about.role': 'Web developer & AI automation',
    'about.p1': 'I build websites that look sharp and run fast — easy to maintain and ready to grow. From landing pages to web apps with real data and workflows.',
    'about.p2': 'I also build AI automation: chatbots that answer customers from your business data, workflows that summarize conversations, and systems that cut repetitive work for your team.',
    'about.fig': 'fig. 01 · profile',

    'stack.eyebrow': 'Stack',
    'stack.title': 'Tools I work with daily',
    'stack.sub': 'Frameworks and services proven to keep sites fast and web apps stable.',

    'services.eyebrow': 'Services',
    'services.title': 'What I can build for you',
    'services.intro': 'Three areas of work. Each starts with understanding the problem, then designing and shipping the solution.',
    'services.fig': 'fig. 02 · services',
    'services.t1': 'Websites & web apps',
    'services.t2': 'Chatbots',
    'services.t3': 'AI automation & workflows',
    'services.b1': 'Landing pages, company profiles, e-commerce, up to POS systems. From design to launch — not just handing over files.',
    'services.b2': 'Automatically reply to customers and answer questions based on your business data — not the same template every time.',
    'services.b3': 'AI handles incoming messages, summarizes customer context, and sends automatic replies — your team steps in only when truly needed.',

    'projects.eyebrow': 'Work',
    'projects.title': 'Work you can look at',
    'projects.sub': 'Every project starts from a real problem, then gets built and tested until it runs.',
    'projects.live': 'View site',
    'projects.newTab': 'Open {{name}} in a new tab',
    'projects.fig': 'fig. 03 · work',
    'projects.empty': 'No projects to show yet.',

    'experience.eyebrow': 'Experience',
    'experience.title': 'Experience.',
    'experience.fig': 'fig. 04 · experience',
    'experience.empty': 'Not filled in yet.',
    'experience.evidence': 'Proof ↗',
    'experience.period': '{{start}} — {{end}}',

    'education.eyebrow': 'Education',
    'education.title': 'Formal education.',
    'education.fig': 'fig. 05 · education',
    'education.empty': 'Not filled in yet.',
    'education.period': '{{start}} — {{end}}',

    'certs.eyebrow': 'Certifications',
    'certs.title': 'Certifications.',
    'certs.sub': 'Verified directly on each issuer’s site.',
    'certs.fig': 'fig. 06 · certifications',
    'certs.all': 'View all',
    'certs.close': 'Close',
    'certs.open': 'Open certification',
    'certs.verify': 'verify on issuer’s site ↗',
    'certs.total': '{{count}} certifications recorded',
    'certs.ofTotal': '{{shown}} of {{count}} shown',

    'contact.eyebrow': 'Contact',
    'contact.title': "Tell me what you want to build.",
    'contact.sub': "If you're not sure which service fits, just describe the problem. I'll help map out the solution.",
    'contact.response': 'Reply usually within 24 hours',
    'contact.tz': 'Timezone WIB (UTC+7)',
    'contact.loc': 'Bandung, Indonesia',
    'contact.email': 'Email',
    'contact.fast': 'What speeds up my reply:',
    'contact.fast1': 'The end goal of the site/app',
    'contact.fast2': 'Reference examples you like',
    'contact.fast3': 'Timeline and rough budget',
    'contact.social': 'Social media',
    'contact.fig': 'fig. 07 · contact',

    'footer.copy': 'Hand-built in Bandung. Blueprint diagrams, not templates.',
    'footer.rights': 'All rights reserved.',

    'chat.title': 'AI Chatbot',
    'chat.sub': 'Automatic replies from this site’s data',
    'chat.privacy': 'Conversations are not stored.',
    'chat.placeholder': 'Type your question…',
    'chat.send': 'Send message',
    'chat.error': 'Failed to send. Try again.',
    'chat.greeting': 'Hi! I’m Mifdlal’s virtual assistant. How can I help you with websites, chatbots, or AI automation?',
    'chip.q1': 'What services do you offer?',
    'chip.q2': 'How much does a website cost?',
    'chip.q3': 'How long does it take?',
    'chip.q4': 'Do you offer maintenance?',

    'totop.label': 'Back to top',

    'theme.label': 'Theme',
    'theme.system': 'System',
    'theme.light': 'Light',
    'theme.dark': 'Dark',
    'lang.label': 'Language',
    'lang.id': 'Bahasa Indonesia',
    'lang.en': 'English',

    'toast.copied': 'Copied',

    'meta.viewOriginal': 'View original image',
  },
} as const

export type DictKey = keyof typeof dict.id

/** Ambil string terjemahan untuk locale + kunci. Mendukung placeholder {{name}}. */
export function t(locale: Locale, key: DictKey, vars?: Record<string, string>): string {
  let s: string = dict[locale][key] ?? dict.id[key] ?? key
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.replaceAll(`{{${k}}}`, v)
    }
  }
  return s
}
