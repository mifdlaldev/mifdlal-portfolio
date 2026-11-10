// Kirim URL ke IndexNow (Bing, Yandex, Seznam, Naver) setelah deploy.
// Protokol: berkas kunci di root situs harus bisa diambil dan isinya sama
// dengan nama berkas. Kunci dibaca dari public/<kunci>.txt supaya hanya ada
// satu sumber kebenaran.
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const PUBLIC = join(ROOT, 'public')
const HOST = 'mifdlal.com'
const ORIGIN = `https://${HOST}`

/* URL yang dikirim = URL yang benar-benar ada di sitemap-0.xml hasil build,
   bukan daftar yang diketik manual. */
const sitemap = readFileSync(join(ROOT, 'dist', 'sitemap-0.xml'), 'utf8')
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
if (urlList.length === 0) {
  console.error('[indexnow] sitemap kosong, tidak ada yang dikirim')
  process.exit(1)
}

const keyFile = readdirSync(PUBLIC).find((f) => /^[0-9a-f]{32}\.txt$/.test(f))
if (!keyFile) {
  console.error('[indexnow] berkas kunci 32 hex tidak ada di public/')
  process.exit(1)
}
const key = readFileSync(join(PUBLIC, keyFile), 'utf8').trim()
const keyLocation = `${ORIGIN}/${keyFile}`

/* Pastikan berkas kunci sudah live sebelum ping; kalau belum, mesin pencari
   akan menolak seluruh URL dan statusnya tidak kelihatan dari sini. */
const probe = await fetch(keyLocation, { headers: { 'cache-control': 'no-cache' } })
const served = probe.ok ? (await probe.text()).trim() : ''
if (served !== key) {
  console.error(`[indexnow] berkas kunci belum live (HTTP ${probe.status}), ping dibatalkan`)
  process.exit(1)
}

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key, keyLocation, urlList }),
})

console.log(
  `[indexnow] ${urlList.length} URL dikirim, HTTP ${res.status} ${res.statusText || ''}`.trim()
)
console.log(`[indexnow] kunci: ${keyLocation}`)
if (![200, 202].includes(res.status)) {
  const text = await res.text()
  console.error('[indexnow] badan respons:', text.slice(0, 300))
  process.exit(1)
}
