/* Test unit worker/lib.ts — logika yang tidak pernah terlihat CI sebelumnya:
   jaring pengaman kebocoran prompt, transformasi SSE, dan sesi bertanda tangan.

   Semua fungsi yang diuji murni/berbasis Web API standar (crypto.subtle,
   ReadableStream, Request) sehingga bisa jalan di Node tanpa wrangler. */

import { describe, expect, it } from 'vitest'

import { checkQuota, looksLikePromptDump, resolveSession, sseToText, type Env } from './lib'

/* Susun ReadableStream dari potongan teks supaya bisa disuapkan ke sseToText. */
function streamOf(parts: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const part of parts) controller.enqueue(encoder.encode(part))
      controller.close()
    },
  })
}

function sseBody(parts: string[]): Response {
  return new Response(streamOf(parts))
}

function env(partial: Partial<Env> = {}): Env {
  return partial as Env
}

describe('looksLikePromptDump', () => {
  it('menandai preamble dump yang dikenali', () => {
    expect(looksLikePromptDump('Kamu asisten AI di portfolio mifdlal.com, halo')).toBe(true)
    expect(looksLikePromptDump('You are an AI assistant for mifdlal.com')).toBe(true)
  })

  it('menandai dump saat dua header prompt muncul', () => {
    const text = 'ATURAN MENJAWAB: sopan. ATURAN BAHASA: ikuti pengguna.'
    expect(looksLikePromptDump(text)).toBe(true)
  })

  it('tidak menandai kalau hanya satu header prompt muncul', () => {
    expect(looksLikePromptDump('Bagian STACK YANG DIKUASAI ( silakan dibaca)')).toBe(false)
  })

  it('tidak menandai teks biasa yang menyebut proyek atau stack', () => {
    const text = 'Proyek bukti saya ada tiga. Stack yang saya pakai Astro dan React.'
    expect(looksLikePromptDump(text)).toBe(false)
  })
})

describe('sseToText', () => {
  it('menggabungkan delta menjadi teks utuh', async () => {
    const body = sseBody([
      'data: {"choices":[{"delta":{"content":"Halo "}}]}\n\n',
      'data: {"choices":[{"delta":{"content":"dunia"}}]}\n\n',
      'data: [DONE]\n\n',
    ])
    expect(await new Response(sseToText(body)).text()).toBe('Halo dunia')
  })

  it('melewati baris JSON rusak tanpa mematikan stream', async () => {
    const body = sseBody([
      'data: {bukan json}\n\n',
      'data: {"choices":[{"delta":{"content":"aman"}}]}\n\n',
      'data: [DONE]\n\n',
    ])
    expect(await new Response(sseToText(body)).text()).toBe('aman')
  })

  it('memotong stream dan mengembalikan penolakan saat prompt bocor', async () => {
    const body = sseBody([
      'data: {"choices":[{"delta":{"content":"KAMU ASISTEN AI DI PORTFOLIO MIFDLAL.COM"}}]}\n\n',
      'data: {"choices":[{"delta":{"content":" RAHASIA_INTERNAL"}}]}\n\n',
      'data: [DONE]\n\n',
    ])
    const out = await new Response(sseToText(body)).text()
    expect(out).toContain('tidak bisa menampilkan detail konfigurasi internal')
    expect(out).not.toContain('RAHASIA_INTERNAL')
    expect(out).not.toContain('KAMU ASISTEN AI')
  })

  it('meneruskan stream normal yang lebih panjang dari prefix tahan', async () => {
    const long = 'a'.repeat(300)
    const body = sseBody([
      `data: {"choices":[{"delta":{"content":"${long}"}}]}\n\n`,
      'data: [DONE]\n\n',
    ])
    expect(await new Response(sseToText(body)).text()).toBe(long)
  })

  it('mengembalikan isi apa adanya kalau upstream tidak mengirim [DONE]', async () => {
    const body = sseBody(['data: {"choices":[{"delta":{"content":"potong"}}]}\n\n'])
    expect(await new Response(sseToText(body)).text()).toBe('potong')
  })
})

describe('resolveSession', () => {
  it('jatuh ke pengenal per IP tanpa SESSION_SECRET', async () => {
    const request = new Request('https://example.com/')
    const out = await resolveSession(request, env(), '1.2.3.4')
    expect(out.id).toBe('ip:1.2.3.4')
    expect(out.setCookie).toBeNull()
  })

  it('menerbitkan cookie yang ditandatangani lalu memverifikasinya', async () => {
    const secret = 'rahasia-uji'
    const issued = await resolveSession(
      new Request('https://example.com/'),
      env({ SESSION_SECRET: secret }),
      '1.2.3.4'
    )
    expect(issued.setCookie).toContain('mfc_sid=')
    expect(issued.setCookie).toContain('HttpOnly')
    expect(issued.setCookie).toContain('Secure')

    const cookie = issued.setCookie!.split(';')[0]
    const verified = await resolveSession(
      new Request('https://example.com/', { headers: { cookie } }),
      env({ SESSION_SECRET: secret }),
      '1.2.3.4'
    )
    expect(verified.id).toBe(issued.id)
    expect(verified.setCookie).toBeNull()
  })

  it('menolak cookie dengan tanda tangan yang diubah', async () => {
    const secret = 'rahasia-uji'
    const issued = await resolveSession(
      new Request('https://example.com/'),
      env({ SESSION_SECRET: secret }),
      '1.2.3.4'
    )
    const [pair] = issued.setCookie!.split(';')
    const [name, value] = pair.split('=')
    const [id, issuedAt, signature] = value.split('.')
    const tampered = `${id}.${issuedAt}.${signature.slice(0, -1)}${signature.endsWith('a') ? 'b' : 'a'}`

    const out = await resolveSession(
      new Request('https://example.com/', { headers: { cookie: `${name}=${tampered}` } }),
      env({ SESSION_SECRET: secret }),
      '1.2.3.4'
    )
    expect(out.id).not.toBe(issued.id)
    expect(out.setCookie).not.toBeNull()
  })

  it('menerbitkan sesi baru untuk cookie yang kedaluwarsa', async () => {
    const secret = 'rahasia-uji'
    const issued = await resolveSession(
      new Request('https://example.com/'),
      env({ SESSION_SECRET: secret }),
      '1.2.3.4'
    )
    const [name, value] = issued.setCookie!.split(';')[0].split('=')
    const [id, , signature] = value.split('.')
    const old = `${name}=${id}.${Date.now() - 40 * 24 * 60 * 60 * 1000}.${signature}`

    const out = await resolveSession(
      new Request('https://example.com/', { headers: { cookie: old } }),
      env({ SESSION_SECRET: secret }),
      '1.2.3.4'
    )
    expect(out.id).not.toBe(id)
    expect(out.setCookie).not.toBeNull()
  })
})

describe('checkQuota', () => {
  function namespaceReturning(handler: () => Promise<Response>) {
    return {
      idFromName: () => ({ name: 'global' }),
      get: () => ({ fetch: handler }),
    } as unknown as NonNullable<Env['CHAT_GUARD']>
  }

  it('mengizinkan saat Durable Object tidak dikonfigurasi', async () => {
    expect(await checkQuota(env(), 'abc')).toEqual({ allowed: true })
  })

  it('mengizinkan saat kuota penuh dilaporkan sebagai denied', async () => {
    const guard = namespaceReturning(
      async () =>
        new Response(JSON.stringify({ allowed: false, reason: 'session' }), { status: 200 })
    )
    expect(await checkQuota(env({ CHAT_GUARD: guard }), 'abc')).toEqual({
      allowed: false,
      reason: 'session',
    })
  })

  it('gagal-terbuka saat Durable Object melempar error', async () => {
    const guard = namespaceReturning(async () => {
      throw new Error('network')
    })
    expect(await checkQuota(env({ CHAT_GUARD: guard }), 'abc')).toEqual({ allowed: true })
  })

  it('gagal-terbuka saat respons guard tidak ok', async () => {
    const guard = namespaceReturning(async () => new Response('boom', { status: 500 }))
    expect(await checkQuota(env({ CHAT_GUARD: guard }), 'abc')).toEqual({ allowed: true })
  })
})
