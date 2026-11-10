/* Helper murni worker chat: tipe bersama, jaring pengaman keluaran,
   dan sesi bertanda tangan. Dipisah dari entry supaya modul entry hanya
   mengekspor handler default + kelas Durable Object; workerd menolak
   ekspor nilai non-fungsi di modul utama. */

/* Tipe minimal Durable Object, ditulis lokal supaya file worker tidak
   perlu menarik @cloudflare/workers-types (bentrok dengan lib dom). */
interface DurableObjectId {
  readonly name?: string
}

interface DurableObjectStub {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>
}

interface DurableObjectStorage {
  get<T = unknown>(key: string): Promise<T | undefined>
  put<T = unknown>(key: string, value: T): Promise<void>
}

export interface DurableObjectState {
  storage: DurableObjectStorage
  blockConcurrencyWhile<T>(callback: () => Promise<T>): Promise<T>
}

interface DurableObjectNamespace {
  idFromName(name: string): DurableObjectId
  get(id: DurableObjectId): DurableObjectStub
}

export interface Env {
  OPENROUTER_API_KEY?: string
  CHAT_API_KEY?: string
  CHAT_MODEL?: string
  CHAT_BASE_URL?: string
  SESSION_SECRET?: string
  CHAT_DAILY_MAX?: string
  CHAT_SESSION_MAX?: string
  CHAT_GUARD?: DurableObjectNamespace
  ASSETS: { fetch(request: Request): Promise<Response> }
}

/* ── Sesi pengunjung + kuota harian ─────────────────────────────

   Cookie sesi ditandatangani HMAC-SHA256 pakai SESSION_SECRET.
   Tanpa secret, sesi jatuh ke pengenal per IP (tetap berguna, tapi
   cookie tidak diterbitkan). Kuota disimpan di satu Durable Object
   global supaya hitungannya lintas data center, bukan per isolate.
   Semua jalur gagal bersikap fail-open: chat tetap jalan. */

const SESSION_COOKIE = 'mfc_sid'
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000
export const DAILY_MAX_DEFAULT = 300
export const SESSION_MAX_DEFAULT = 40
const sessionEncoder = new TextEncoder()

async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    sessionEncoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, sessionEncoder.encode(message))
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get('cookie')
  if (!header) return null
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=')
    if (key === name) return rest.join('=') || null
  }
  return null
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export async function resolveSession(
  request: Request,
  env: Env,
  ip: string
): Promise<{ id: string; setCookie: string | null }> {
  const secret = env.SESSION_SECRET
  if (!secret) return { id: `ip:${ip}`, setCookie: null }

  const raw = readCookie(request, SESSION_COOKIE)
  if (raw) {
    const [id, issuedAt, signature] = raw.split('.')
    if (id && issuedAt && signature) {
      const age = Date.now() - Number(issuedAt)
      if (Number.isFinite(age) && age >= 0 && age < SESSION_TTL_MS) {
        const expected = await hmacHex(secret, `${id}.${issuedAt}`)
        if (safeEqual(expected, signature)) return { id, setCookie: null }
      }
    }
  }

  const id = crypto.randomUUID()
  const issuedAt = Date.now()
  const signature = await hmacHex(secret, `${id}.${issuedAt}`)
  const setCookie = [
    `${SESSION_COOKIE}=${id}.${issuedAt}.${signature}`,
    'Path=/',
    `Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`,
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
  ].join('; ')
  return { id, setCookie }
}

export async function checkQuota(
  env: Env,
  sessionId: string
): Promise<{ allowed: boolean; reason?: 'session' | 'daily' }> {
  const namespace = env.CHAT_GUARD
  if (!namespace) return { allowed: true }

  try {
    const stub = namespace.get(namespace.idFromName('global'))
    const response = await stub.fetch('https://guard/take', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        sessionMax: Number(env.CHAT_SESSION_MAX) || SESSION_MAX_DEFAULT,
        dailyMax: Number(env.CHAT_DAILY_MAX) || DAILY_MAX_DEFAULT,
      }),
      signal: AbortSignal.timeout(2000),
    })
    if (!response.ok) return { allowed: true }
    const data = (await response.json()) as { allowed?: boolean; reason?: string }
    if (data.allowed === false) {
      return { allowed: false, reason: data.reason === 'session' ? 'session' : 'daily' }
    }
    return { allowed: true }
  } catch {
    /* fail-open: kuota tidak boleh mematikan chatbot */
    return { allowed: true }
  }
}

/* Jaring pengaman output: kalau model tetap membocorkan instruksi sistem
   (dump verbatim atau terjemahannya), stream dipotong dan diganti penolakan
   sebelum seluruh isi terbaca. Prefix 220 karakter pertama ditahan dulu;
   begitu aman, sisanya diteruskan streaming seperti biasa. */
const LEAK_REFUSAL =
  'Maaf, saya tidak bisa menampilkan detail konfigurasi internal saya. Ada yang bisa saya bantu soal layanan Mifdlal?'
const GUARD_PREFIX_CHARS = 220

/* Preamble khas dump prompt: hanya muncul kalau model membocorkan instruksi. */
const PROMPT_PREAMBLES = [
  'KAMU ASISTEN AI DI PORTFOLIO MIFDLAL.COM',
  'ANDA ADALAH ASISTEN AI DI PORTFOLIO MIFDLAL.COM',
  'YOU ARE AN AI ASSISTANT FOR MIFDLAL.COM',
  'YOU ARE THE AI ASSISTANT FOR MIFDLAL.COM',
]

/* Header bagian prompt. Wajib bentuk panjang (dengan titik dua/kurung) supaya
   jawaban sah yang menyebut "Proyek Bukti" atau "Stack" tidak ikut dipotong. */
const PROMPT_DUMP_MARKERS = [
  'ATURAN MENJAWAB:',
  'ATURAN BAHASA:',
  'KEAHLIAN YANG DITAWARKAN:',
  'PROYEK BUKTI (',
  'STACK YANG DIKUASAI (',
  'LANGUAGE RULES:',
  'OFFERED EXPERTISE:',
  'PROOF PROJECTS (',
  'TECH STACK (',
]

export function looksLikePromptDump(text: string): boolean {
  const up = text.toUpperCase()
  if (PROMPT_PREAMBLES.some((preamble) => up.includes(preamble))) return true
  let hits = 0
  for (const marker of PROMPT_DUMP_MARKERS) {
    if (up.includes(marker)) {
      hits += 1
      if (hits >= 2) return true
    }
  }
  return false
}

/* Ubah SSE OpenRouter (data: {...} per baris, [DONE] penutup) menjadi
   stream teks pola berisi delta konten saja. Baris rusak dilewati,
   bukan mematikan stream. */
export function sseToText(upstream: Response): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder()
  const encoder = new TextEncoder()
  let buffer = ''
  let pending = ''
  let streaming = false

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
              if (!streaming) {
                controller.enqueue(
                  encoder.encode(looksLikePromptDump(pending) ? LEAK_REFUSAL : pending)
                )
              }
              controller.close()
              return
            }
            try {
              const chunk = JSON.parse(payload)
              const delta: string = chunk?.choices?.[0]?.delta?.content ?? ''
              if (!delta) continue
              if (streaming) {
                controller.enqueue(encoder.encode(delta))
                continue
              }
              pending += delta
              if (looksLikePromptDump(pending)) {
                controller.enqueue(encoder.encode(LEAK_REFUSAL))
                try {
                  await reader.cancel()
                } catch {
                  /* upstream sudah tutup */
                }
                controller.close()
                return
              }
              if (pending.length >= GUARD_PREFIX_CHARS) {
                controller.enqueue(encoder.encode(pending))
                streaming = true
              }
            } catch {
              /* baris JSON tidak lengkap/aneh: lewati, jangan gagalkan stream */
            }
          }
        }
        if (!streaming) {
          controller.enqueue(encoder.encode(looksLikePromptDump(pending) ? LEAK_REFUSAL : pending))
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
