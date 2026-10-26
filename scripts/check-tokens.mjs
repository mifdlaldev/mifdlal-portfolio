#!/usr/bin/env node
/**
 * Penjaga token.
 *
 * Gagal (exit 1) kalau ada nilai desain yang ditulis manual di luar
 * tokens.css / semantic.css, atau kalau media query memakai breakpoint
 * di luar daftar yang disepakati.
 *
 * Yang diperiksa: semua file .css di src/styles dan semua blok <style>
 * di dalam .astro. File .tsx tidak dipindai karena literal di sana
 * bersifat teknis (mask kanvas, probe 1x1), bukan nilai desain.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const SRC = join(ROOT, 'src');
const TOKEN_FILES = ['src/styles/tokens.css', 'src/styles/semantic.css'];

// Breakpoint yang boleh dipakai. Menambah nilai = keputusan sadar,
// bukan hasil tuning di tengah jalan.
const BREAKPOINTS = new Set([320, 560, 620, 720, 800, 860, 900, 980, 1228]);
// max-width: N sah kalau N+1 ada di daftar (pasangan komplementer dari
// min-width, mis. min-width: 860 + max-width: 859 supaya tidak tumpang tindih).

// Properti yang wajib memakai var().
const STRICT = [
  ['font-size', /font-size\s*:\s*([^;}]+)/g],
  ['line-height', /line-height\s*:\s*([^;}]+)/g],
  ['letter-spacing', /letter-spacing\s*:\s*([^;}]+)/g],
  ['z-index', /z-index\s*:\s*([^;}]+)/g],
  ['color', /(?:^|[;\s{])color\s*:\s*([^;}]+)/g],
  ['background', /background(?:-color)?\s*:\s*([^;}]+)/g],
  ['border-color', /border(?:-[a-z]+)*-color\s*:\s*([^;}]+)/g],
];

// Nilai yang sah tanpa var().
const ALLOWED_VALUE = /^(?:0|auto|none|inherit|initial|unset|transparent|currentColor|normal|revert)$/i;

const files = [];
(function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full);
    else if (entry.endsWith('.css') || entry.endsWith('.astro')) files.push(full);
  }
})(SRC);

const problems = [];

function styleBlocks(text, file) {
  if (file.endsWith('.css')) return [{ css: text, offset: 0 }];
  const blocks = [];
  const re = /<style[^>]*>([\s\S]*?)<\/style>/g;
  let m;
  while ((m = re.exec(text))) blocks.push({ css: m[1], offset: m.index + m[0].indexOf(m[1]) });
  return blocks;
}

function lineOf(text, index) {
  return text.slice(0, index).split('\n').length;
}

for (const file of files) {
  const rel = relative(ROOT, file);
  const isTokenFile = TOKEN_FILES.includes(rel);
  const text = readFileSync(file, 'utf8');

  for (const { css, offset } of styleBlocks(text, file)) {
    // 1. warna literal
    if (!isTokenFile) {
      for (const m of css.matchAll(/#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)/g)) {
        problems.push(`${rel}:${lineOf(text, offset + m.index)} warna literal "${m[0]}" — pakai var()`);
      }
    }

    // 2. properti ketat
    for (const [name, re] of STRICT) {
      for (const m of css.matchAll(re)) {
        const value = m[1].trim();
        if (value.startsWith('var(') || ALLOWED_VALUE.test(value)) continue;
        if (/^(?:color-mix|linear-gradient|radial-gradient|repeating-linear-gradient|url|calc|max|min|clamp|translate|scale|rotate)\(/.test(value)) continue;
        if (isTokenFile) continue;
        problems.push(`${rel}:${lineOf(text, offset + m.index)} ${name}: "${value}" — pakai var()`);
      }
    }

    // 3. breakpoint
    const noComment = css.replace(/\/\*[\s\S]*?\*\//g, '');
    for (const m of noComment.matchAll(/@media([^{]*?)(\d+)px/g)) {
      const px = Number(m[2]);
      const isMax = /max-width/.test(m[1]);
      const ok = BREAKPOINTS.has(px) || (isMax && BREAKPOINTS.has(px + 1));
      if (!ok) {
        problems.push(`${rel}:${lineOf(text, offset + m.index)} breakpoint ${px}px tidak ada di daftar (${[...BREAKPOINTS].join(', ')})`);
      }
    }
  }
}

// 4. var() yang tidak pernah didefinisikan (kecuali variabel runtime)
const defined = new Set();
const used = new Map();
for (const file of files) {
  const rel = relative(ROOT, file);
  const text = readFileSync(file, 'utf8');
  for (const m of text.matchAll(/^\s*(--[a-z0-9-]+)\s*:/gm)) defined.add(m[1]);
  for (const m of text.matchAll(/var\((--[a-z0-9-]+)/g)) {
    if (!used.has(m[1])) used.set(m[1], rel);
  }
}
for (const [name, rel] of used) {
  if (defined.has(name)) continue;
  if (name.startsWith('--logoloop-')) continue; // diset runtime oleh engine LogoLoop
  problems.push(`${rel} var(${name}) tidak didefinisikan`);
}

if (problems.length) {
  console.error(`check-tokens: ${problems.length} masalah\n`);
  for (const p of problems) console.error('  ' + p);
  process.exit(1);
}
console.log(`check-tokens: bersih (${files.length} file, ${defined.size} token terdefinisi)`);
