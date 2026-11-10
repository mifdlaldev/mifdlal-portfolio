#!/usr/bin/env node
/* Kartu Open Graph 1200x630 untuk mifdlal.com.

   Digambar ulang dari nol memakai aset merek situs sendiri: palet dari
   src/styles/tokens.css dan fonta asli dari dist/_astro (hasil build
   @fontsource), ditanam sebagai data URL supaya tidak ada permintaan jaringan
   dan tidak ada jalan pintas ke CDN.

   Kenapa lewat peramban, bukan ImageMagick: Inter tidak terpasang di sistem,
   jadi penggaris teks ImageMagick akan jatuh ke DejaVu dan kartunya tidak lagi
   seragam dengan situs.

   Pakai:
     npm run build          (butuh dist/_astro berisi berkas woff2)
     node scripts/og-image.mjs

   Keluaran: public/og-image.png (1200x630, PNG).
*/
import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const ASTRO_DIR = path.join(root, 'dist', '_astro')
const OUT = path.join(root, 'public', 'og-image.png')
const BRAVE = process.env.BRAVE_PATH || '/usr/bin/brave-browser'

const W = 1200
const H = 630
const PAPER = '#fdfcf1'
const INK = '#1a1522'
const ELECTRIC = '#2a1eff'
const LEMON = '#eef17c'

function fontFile(pattern) {
  if (!existsSync(ASTRO_DIR)) {
    throw new Error(`dist/_astro tidak ada. Jalankan npm run build dulu.`)
  }
  const hit = readdirSync(ASTRO_DIR).find((f) => pattern.test(f) && f.endsWith('.woff2'))
  if (!hit) throw new Error(`fonta tidak ditemukan di dist/_astro: ${pattern}`)
  return path.join(ASTRO_DIR, hit)
}

function dataUrl(file) {
  return `data:font/woff2;base64,${readFileSync(file).toString('base64')}`
}

const inter = dataUrl(fontFile(/^inter-latin-wght-normal\..*\.woff2$/))
const mono = dataUrl(fontFile(/^geist-mono-latin-wght-normal\..*\.woff2$/))

const html = `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8" />
<style>
  @font-face { font-family: 'Kartu Inter'; src: url('${inter}') format('woff2'); font-weight: 100 900; font-display: block; }
  @font-face { font-family: 'Kartu Mono'; src: url('${mono}') format('woff2'); font-weight: 100 900; font-display: block; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${W}px; height: ${H}px; overflow: hidden; }
  body {
    background-color: ${PAPER};
    background-image: radial-gradient(circle at 1px 1px, rgba(26, 21, 34, 0.16) 1.2px, transparent 0);
    background-size: 26px 26px;
    color: ${INK};
    font-family: 'Kartu Inter', 'DejaVu Sans', sans-serif;
    position: relative;
  }
  .frame { position: absolute; inset: 0; border: 1px solid rgba(26, 21, 34, 0.22); }
  .node { position: absolute; width: 12px; height: 12px; background: ${PAPER}; border: 1px solid rgba(26, 21, 34, 0.55); }
  .node--tl { top: -6px; left: -6px; }
  .node--tr { top: -6px; right: -6px; }
  .node--bl { bottom: -6px; left: -6px; }
  .node--br { bottom: -6px; right: -6px; }
  .inner { position: absolute; inset: 64px; display: flex; flex-direction: column; }
  .row { display: flex; justify-content: space-between; align-items: baseline; }
  .mono { font-family: 'Kartu Mono', 'DejaVu Sans Mono', monospace; letter-spacing: 0.12em; text-transform: uppercase; }
  .m20 { font-size: 20px; color: rgba(26, 21, 34, 0.62); }
  .rule { height: 1px; background: rgba(26, 21, 34, 0.22); margin-top: 18px; }
  .mid { margin-top: auto; }
  .kicker { font-size: 22px; color: ${ELECTRIC}; letter-spacing: 0.18em; }
  .name { font-size: 76px; font-weight: 800; letter-spacing: -0.025em; line-height: 1.04; margin-top: 18px; }
  .strip { display: flex; gap: 6px; margin-top: 26px; }
  .strip span { display: block; height: 5px; }
  .strip .a { width: 132px; background: ${ELECTRIC}; }
  .strip .b { width: 42px; background: ${LEMON}; }
  .services { font-family: 'Kartu Mono', 'DejaVu Sans Mono', monospace; font-size: 25px; color: rgba(26, 21, 34, 0.86); margin-top: 26px; letter-spacing: 0.01em; }
  .foot { margin-top: auto; padding-top: 26px; border-top: 1px solid rgba(26, 21, 34, 0.22); }
</style>
</head>
<body>
  <div class="frame"></div>
  <span class="node node--tl"></span>
  <span class="node node--tr"></span>
  <span class="node node--bl"></span>
  <span class="node node--br"></span>
  <div class="inner">
    <div class="row">
      <span class="mono m20">fig. 00 &middot; kartu identitas</span>
      <span class="mono m20">mifdlal.com</span>
    </div>
    <div class="rule"></div>
    <div class="mid">
      <div class="mono kicker">portofolio &middot; freelance</div>
      <div class="name">Mifdlal Tsaqib Alfarras</div>
      <div class="strip"><span class="a"></span><span class="b"></span></div>
      <div class="services">web app &middot; chatbot &middot; otomasi alur kerja</div>
    </div>
    <div class="foot row">
      <span class="mono m20">Bandung, ID &middot; GMT+7</span>
      <span class="mono m20">hello@mifdlal.com</span>
    </div>
  </div>
</body>
</html>
`

const dir = mkdtempSync(path.join(tmpdir(), 'og-plate-'))
const file = path.join(dir, 'plate.html')
writeFileSync(file, html)

execFileSync(
  BRAVE,
  [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    `--window-size=${W},${H}`,
    `--screenshot=${OUT}`,
    `file://${file}`,
  ],
  { stdio: 'inherit' }
)

console.log(`tulis ${path.relative(root, OUT)}`)
