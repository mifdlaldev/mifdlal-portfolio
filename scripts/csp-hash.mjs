/**
 * Postbuild: hitung SHA-256 tiap inline <script> di HTML hasil build,
 * lalu suntikkan hash ke CSP di dist/_headers.
 * Tujuan: CSP ketat (tanpa 'unsafe-inline') tetap mengizinkan
 * script hydration bawaan Astro.
 *
 * Penting: hash HANYA ditulis ke directive script-src di dalam baris
 * Content-Security-Policy. Pencarian tidak boleh dilakukan di seluruh berkas,
 * karena komentar di atas baris CSP juga menyebut nama directive (mis.
 * "script-src:"). Kalau ikut terbaca, hash akan mendarat di directive lain
 * (pernah terjadi: masuk ke default-src sehingga CSP rusak tapi build tetap
 * "sukses" tanpa error).
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join } from 'node:path'

const DIST = 'dist'
const HEADERS = join(DIST, '_headers')

const htmlFiles = readdirSync(DIST).filter((f) => f.endsWith('.html'))
const hashes = new Set()

for (const file of htmlFiles) {
  const html = readFileSync(join(DIST, file), 'utf8')
  const re = /<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/gi
  let m
  while ((m = re.exec(html)) !== null) {
    const body = m[2]
    if (!body.trim()) continue
    // CSP hash dihitung dari isi elemen script apa adanya.
    const digest = createHash('sha256').update(body, 'utf8').digest('base64')
    hashes.add(`'sha256-${digest}'`)
  }
}

if (!existsSync(HEADERS)) {
  console.error('[csp-hash] dist/_headers tidak ada, lewati')
  process.exit(0)
}

const cspLineRe = /^([ \t]*Content-Security-Policy:[ \t]*)(.+)$/m
const headersRaw = readFileSync(HEADERS, 'utf8')
const found = headersRaw.match(cspLineRe)
if (!found) {
  console.error('[csp-hash] baris Content-Security-Policy tidak ditemukan')
  process.exit(1)
}

const parts = found[2]
  .split(';')
  .map((s) => s.trim())
  .filter(Boolean)

const idx = parts.findIndex((p) => /^script-src(\s|$)/.test(p))
if (idx === -1) {
  console.error('[csp-hash] directive script-src tidak ditemukan di dalam CSP')
  process.exit(1)
}

const list = [...hashes].join(' ')
const cleaned = parts[idx].replace(/\s+'sha256-[^']+'\s*/g, ' ').trim()
parts[idx] = `${cleaned} ${list}`

const rebuilt = `${parts.join('; ')};`
const headers = headersRaw.replace(cspLineRe, `${found[1]}${rebuilt}`)
writeFileSync(HEADERS, headers)

const check = readFileSync(HEADERS, 'utf8').match(cspLineRe)[2]
const inScriptSrc = check
  .split(';')
  .map((s) => s.trim())
  .find((p) => /^script-src(\s|$)/.test(p))
const written = (inScriptSrc.match(/'sha256-[^']+'/g) || []).length
if (written !== hashes.size) {
  console.error(`[csp-hash] GAGAL: ${hashes.size} hash dihitung, ${written} tertulis di script-src`)
  process.exit(1)
}
console.log(`[csp-hash] ${hashes.size} hash inline script disuntik ke script-src`)
