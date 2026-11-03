/// <reference lib="dom" />

/* ============================================================
   API CHAT — mifdlal.com/api/chat

   Post saja. Body JSON: { messages: [{role, content}, ...] }
   Jawaban dikirim sebagai stream teks biasa (bukan SSE) supaya
   widget frontend tinggal memakai ReadableStream tanpa parser.

   API key OpenRouter disimpan sebagai secret Cloudflare:
     npx wrangler secret put OPENROUTER_API_KEY
   Model bisa dioverride lewat secret CHAT_MODEL.

   Kunci TIDAK PERNAH sampai ke browser: browser hanya menembak
   /api/chat di domain sendiri (same-origin, lolos CSP tanpa
   directive connect-src tambahan).

   Sebelum 2026-11 worker ini assets-only; sekarang jadi entry
   script, semua non-API dioper ke env.ASSETS supaya perilaku
   static (404 page, headers, dsb.) tidak berubah.
   ============================================================ */

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface Env {
  OPENROUTER_API_KEY?: string
  CHAT_MODEL?: string
  ASSETS: { fetch(request: Request): Promise<Response> }
}

/* Pengetahuan asisten: profil, layanan, proyek, stack, kontak.
   Sumber: src/data/site.ts + KONTEN.md. Aturan jawaban di bagian
   akhir: singkat, jujur, tanpa markdown berat. */
const SYSTEM_PROMPT = `Kamu asisten AI di portfolio mifdlal.com, milik Mifdlal Tsaqib Alfarras — developer web dan otomasi AI dari Bandung, Indonesia (remote). Gunakan Bahasa Indonesia santai tapi profesional (pakai "Anda" untuk pengunjung, "saya" untuk Mifdlal).

KEAHLIAN YANG DITAWARKAN:
1. Website dan web app — landing page, profil perusahaan, e-commerce, sampai POS. Dari desain sampai rilis.
2. Chatbot — balas pelanggan otomatis, menjawab berdasarkan data bisnis, bukan templat yang selalu sama.
3. Otomasi AI dan workflow — AI menangani pesan masuk, merangkum konteks pelanggan, mengirim balasan otomatis; tim hanya turun saat benar-benar dibutuhkan.
4. Nilai jualnya: pekerjaan manual diubah menjadi sistem yang benar-benar dipakai.

PROYEK BUKTI (bisa dibuka):
- PT Loka Logistics — website perusahaan logistik B2B (layanan general, project, retail cargo, visi misi, jangkauan, kontak). Stack: WordPress tema kustom. https://lokalogistics.co.id/
- Simulasi Lokasi Ujian UT Bandung — wizard enam langkah memilih lokasi ujian Universitas Terbuka (identitas, wilayah, sekolah, detail, konfirmasi, ringkasan). Stack: Vite + JavaScript. https://simulasi-pemilihan-lokasi-ujian-ut.vercel.app/
- Mahoni-House — landing page villa dua bahasa (Indonesia dan Inggris) dengan route per locale. Stack: Next.js + next-intl. https://mahoni-house.vercel.app

STACK YANG DIKUASAI (ringkas per kategori):
- Web: Next.js, React, TypeScript, Astro, Tailwind CSS, Svelte, Hono, Cloudflare, Supabase
- CMS: WordPress, WooCommerce, Shopify, Drupal, Joomla
- Framework/bahasa: PHP, Laravel, CodeIgniter, Flutter, Dart, Vue.js, Nuxt, Angular
- Database: MySQL, PostgreSQL, MongoDB, Redis, SQLite, MariaDB
- Cloud/infra: AWS, Kubernetes, NGINX, Apache, Firebase, Netlify, Railway
- Chatbot: Claude API, OpenAI API, Telegram Bot
- Otomasi: n8n, Python, GitHub Actions

PENGALAMAN:
- Pengembang Aplikasi PE-SMKK di Dinas PUPR Kabupaten Sumedang (magang, Jun-Okt 2025): membangun aplikasi Pemantauan dan Evaluasi Sistem Manajemen Keselamatan Konstruksi untuk mendata hasil pemeriksaan keselamatan proyek konstruksi, mengikuti elemen evaluasi Permen PUPR 10/2021, dipakai petugas lapangan.

PENDIDIKAN: SMKN 1 Sumedang, Rekayasa Perangkat Lunak (2023-2026, lulus). Materi: basis data dan SQL, web statis-dinamis, mobile dan desktop, IoT, cloud computing.

KONTAK: email hello@mifdlal.com (utama), GitHub github.com/mifdlaldev, LinkedIn linkedin.com/in/mifdlal-tsaqib-alfarras, Fiverr mifdlal_afs, Upwork.

ATURAN MENJAWAB:
- Ringkas: umumnya 2-4 kalimat. Boleh poin jika daftar. TANPA markdown (tanpa **, #, tabel) karena jawaban tampil di bubble chat sederhana.
- Jangan pernah mengarang: harga, lama pengerjaan, portofolio tambahan, sertifikat, atau pengalaman yang tidak ada di atas. Kalau ditanya hal yang tidak kamu tahu, jujur bilang tidak yakin dan arahkan ke email hello@mifdlal.com.
- Untuk harga dan estimasi waktu: jangan sebutkan angka. Katakan diskusi kebutuhan dulu (gratis) lewat email hello@mifdlal.com atau lewat form kontak di situs ini.
- Sesekali, kalau relevan, arahkan dengan halus ke tombol "Lihat proyek" / section terkait di halaman ini.
- Jika pengunjung bertanya di luar topik (misal curhat), sopan kembalikan ke topik layanan atau sampaikan kalau kamu spesialis situs ini.
- Jika ada yang bertanya soal kamu sebagai AI: jujur, kamu asisten AI buatan dan berjalan di Cloudflare Workers.`

/* Batas input: cegah payload raksasa dan prompt yang dibuang ke
   sistem. 10 giliran = 5 tanya + 5 jawab, cukup untuk sesi satu
   pengunjung tanpa membengkakkan biaya token. */
const MAX_CHARS_PER_MSG = 2000
const MAX_TURNS = 10
const MAX_TOKENS_REPLY = 500
const TEMPERATURE = 0.4

/* Rate limit sederhana per IP: satu isolate punya satu Map, jadi
   ini proteksi lapis pertama (bukan pengganti WAF). 12 pesan per
   menit sudah jauh di atas kebutuhan manusia yang mengetik. */
const RATE_WINDOW_MS = 60_000
const RATE_MAX = 12
const rateBuckets = new Map<string, number[]>()

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  })
}

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const hits = (rateBuckets.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS)
  hits.push(now)
  rateBuckets.set(ip, hits)
  /* Cegah Map tumbuh tanpa batas: buang entry kosong saat kebetulan lewat. */
  if (rateBuckets.size > 5000) {
    for (const [key, stamps] of rateBuckets) {
      if (stamps.every((t) => now - t >= RATE_WINDOW_MS)) rateBuckets.delete(key)
    }
  }
  return hits.length > RATE_MAX
}

/* Ubah SSE OpenRouter (data: {...} per baris, [DONE] penutup) menjadi
   stream teks pola berisi delta konten saja. Baris rusak dilewati,
   bukan mematikan stream. */
function sseToText(upstream: Response): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder()
  const encoder = new TextEncoder()
  let buffer = ''

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const reader = upstream.body!.getReader()
        for (;;) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })

          let newlineAt = buffer.indexOf('\n')
          while (newlineAt !== -1) {
            const line = buffer.slice(0, newlineAt).trim()
            buffer = buffer.slice(newlineAt + 1)
            newlineAt = buffer.indexOf('\n')

            if (!line.startsWith('data:')) continue
            const payload = line.slice(5).trim()
            if (payload === '[DONE]') {
              controller.close()
              return
            }
            try {
              const chunk = JSON.parse(payload)
              const delta: string = chunk?.choices?.[0]?.delta?.content ?? ''
              if (delta) controller.enqueue(encoder.encode(delta))
            } catch {
              /* baris JSON tidak lengkap/aneh: lewati, jangan gagalkan stream */
            }
          }
        }
        controller.close()
      } catch {
        /* pembaca upstream putus: tutup stream dengan apa yang sudah ada */
        try {
          controller.close()
        } catch {
          /* sudah ditutup */
        }
      }
    },
  })
}

async function handleChat(request: Request, env: Env): Promise<Response> {
  if (!env.OPENROUTER_API_KEY) {
    return json({ error: 'not_configured', message: 'Backend chat belum dikonfigurasi.' }, 503)
  }

  const ip = request.headers.get('cf-connecting-ip') ?? '0.0.0.0'
  if (rateLimited(ip)) {
    return json({ error: 'rate_limited', message: 'Terlalu banyak pesan. Coba sebentar lagi.' }, 429)
  }

  let body: { messages?: unknown }
  try {
    body = await request.json()
  } catch {
    return json({ error: 'bad_request', message: 'Body bukan JSON valid.' }, 400)
  }

  const incoming = Array.isArray(body.messages) ? body.messages : []
  const history: ChatMessage[] = []
  for (const raw of incoming as unknown[]) {
    const item = raw as { role?: string; content?: string }
    if ((item.role !== 'user' && item.role !== 'assistant') || typeof item.content !== 'string') continue
    const content = item.content.trim().slice(0, MAX_CHARS_PER_MSG)
    if (content) history.push({ role: item.role, content })
  }

  /* Kotong dari depan: pesan terbaru jauh lebih penting untuk konteks. */
  const trimmed = history.slice(-MAX_TURNS)
  if (!trimmed.some((m) => m.role === 'user')) {
    return json({ error: 'bad_request', message: 'Tidak ada pesan pengguna.' }, 400)
  }

  const model = env.CHAT_MODEL || 'google/gemini-2.5-flash'

  let upstream: Response
  try {
    upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
        'content-type': 'application/json',
        'HTTP-Referer': 'https://mifdlal.com',
        'X-Title': 'mifdlal.com asisten',
      },
      body: JSON.stringify({
        model,
        stream: true,
        temperature: TEMPERATURE,
        max_tokens: MAX_TOKENS_REPLY,
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...trimmed],
      }),
    })
  } catch {
    return json({ error: 'upstream_unreachable', message: 'Gagal menghubungi layanan AI.' }, 502)
  }

  if (!upstream.ok || !upstream.body) {
    return json({ error: 'upstream_error', message: 'Layanan AI sedang gagal. Coba lagi sebentar.' }, 502)
  }

  return new Response(sseToText(upstream), {
    status: 200,
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
    },
  })
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url)

    if (pathname === '/api/chat' && request.method === 'POST') {
      return handleChat(request, env)
    }
    /* OPTIONS tanpa Access-Control-Allow-Origin: hanya same-origin yang
       diizinkan memanggil endpoint ini, preflight lintas origin memang
       tidak boleh lolos. */
    if (pathname === '/api/chat' && request.method === 'OPTIONS') {
      return new Response(null, { status: 405 })
    }

    /* Semua selain /api/chat: static assets (halaman, 404 page, _headers
       tetap berlaku seperti deployment assets-only sebelumnya). */
    if (request.method === 'GET' || request.method === 'HEAD') {
      return env.ASSETS.fetch(request)
    }

    return json({ error: 'not_found', message: 'Endpoint tidak ditemukan.' }, 404)
  },
}
