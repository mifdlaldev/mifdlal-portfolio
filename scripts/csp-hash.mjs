/**
 * Postbuild: hitung SHA-256 tiap inline <script> di HTML hasil build,
 * lalu suntikkan hash ke CSP di dist/_headers.
 * Tujuan: CSP ketat (tanpa 'unsafe-inline') tetap mengizinkan
 * script hydration bawaan Astro.
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

let headers = readFileSync(HEADERS, 'utf8')
const scriptSrcRe = /(script-src[^;]*);/
if (!scriptSrcRe.test(headers)) {
  console.error('[csp-hash] directive script-src tidak ditemukan')
  process.exit(1)
}

const list = [...hashes].join(' ')
headers = headers.replace(scriptSrcRe, (full, directive) => {
  const cleaned = directive.replace(/\s+'sha256-[^']+'\s*/g, ' ').trim()
  return `${cleaned} ${list};`
})
writeFileSync(HEADERS, headers)
console.log(`[csp-hash] ${hashes.size} hash inline script disuntik ke CSP`)
