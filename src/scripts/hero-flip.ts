/* Kotak kata bergilir di judul hero (gaya layout-text-flip, tanpa dependency).
 *
 * Kenapa vanilla, bukan island React: hero sengaja bebas React sejak awal —
 * versi React-nya pernah menyumbang satu long task 3 detik di Lighthouse
 * mobile (catatan di kepala Hero.astro). Modul ini nol dependency dan hanya
 * menyentuh satu kotak.
 *
 * Tiga lapis (lihat CSS di Hero.astro):
 *   .hero-flip-box    slot selebar kata terpanjang. Dipatok SEKALI, jadi
 *                     kata depan dan baris kedua judul tidak pernah bergerak
 *                     saat kata berganti (nol geser untuk tetangga).
 *   .hero-flip-sizer  teks tak terlihat, satu-satunya isi yang mengalir.
 *                     Inilah alat ukur lebar: lebar sizer = lebar kata.
 *   .hero-flip-frame  bingkai garis rambut yang melilit kata yang sedang
 *                     tampil. Lebarnya dianimasikan CSS mengikuti kata,
 *                     dipusatkan dengan transform supaya tepinya bergerak
 *                     tanpa memindahkan tata letak sekitarnya.
 *
 * Jadi kotaknya tetap "ikut panjang kata" seperti yang diminta, tanpa biaya
 * pergeseran tata letak: yang bergerak hanya tepi bingkai, bukan teks lain.
 *
 * Bahasa: daftar kata punya pasangan Indonesia/Inggris dan ditukar saat
 * peristiwa mifdlal:lang datang, pola yang sama dengan tautan email dan
 * WhatsApp di kontak.
 */

/** Jeda sebelum giliran pertama: biarkan cat pertama (LCP) selesai dulu. */
const START_DELAY_MS = 1200

type Lang = 'id' | 'en'

function readLang(): Lang {
  try {
    const prefs = JSON.parse(localStorage.getItem('mifdlal-prefs') || '{}')
    if (prefs && prefs.lang === 'id') return 'id'
    if (prefs && prefs.lang === 'en') return 'en'
  } catch {
    /* jatuh ke atribut html */
  }
  return document.documentElement.lang === 'id' ? 'id' : 'en'
}

function splitList(value: string | null): string[] {
  return (value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function readMs(value: string, fallback: number): number {
  const raw = value.trim()
  const n = Number.parseFloat(raw)
  if (!Number.isFinite(n) || n <= 0) return fallback
  return raw.endsWith('ms') ? n : n * 1000
}

export function mountHeroWordFlip(root: HTMLElement): void {
  const box = root.querySelector<HTMLElement>('[data-flip-box]')
  const frame = root.querySelector<HTMLElement>('[data-flip-frame]')
  const word = root.querySelector<HTMLElement>('[data-flip-word]')
  const sizer = root.querySelector<HTMLElement>('[data-flip-sizer]')
  if (!box || !frame || !word || !sizer) return

  const lists: Record<Lang, string[]> = {
    id: splitList(root.getAttribute('data-words-id')),
    en: splitList(root.getAttribute('data-words-en')),
  }
  if (lists.en.length < 2) return

  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

  const styles = getComputedStyle(root)
  const hold = readMs(styles.getPropertyValue('--flip-hold'), 2600)
  const dur = readMs(styles.getPropertyValue('--flip-dur'), 420)

  let lang: Lang = readLang()
  let words: string[] = []
  let widths: number[] = []
  let index = 0
  let timer = 0
  let running = false

  function pick(): string[] {
    const list = lists[lang]
    return list.length > 1 ? list : lists.en
  }

  /* ---------- ukur ---------- */

  /** Lebar tiap kata diukur dari sizer (padding + border termasuk karena
      box-sizing: border-box). Slot dipatok selebar kata terpanjang SEKALI;
      bingkai mengikuti kata yang sedang tampil. */
  function measure() {
    const previous = sizer!.textContent
    widths = words.map((w) => {
      sizer!.textContent = w
      return sizer!.getBoundingClientRect().width
    })
    sizer!.textContent = previous

    /* Slot: lebar tetap = kata terpanjang, supaya tetangga diam. */
    box!.style.width = `${Math.ceil(Math.max(...widths))}px`
    frame!.style.width = `${Math.ceil(widths[index])}px`
  }

  /** Bingkai mengikuti kata (dianimasikan CSS). Slot tidak disentuh. */
  function sizeFrame(i: number) {
    frame!.style.width = `${Math.ceil(widths[i])}px`
  }

  function show(i: number) {
    word!.textContent = words[i]
  }

  /* ---------- siklus ---------- */

  function step() {
    if (!running) return

    /* Fase keluar: kata berputar dan memudar. */
    box!.classList.add('is-flip')

    window.setTimeout(() => {
      if (!running) return

      index = (index + 1) % words.length
      show(index)
      /* Lebar bingkai dipasang sekarang, saat kata sedang tak terlihat. */
      sizeFrame(index)
      sizer!.textContent = words[index]

      /* Pindah ke sudut awal tanpa transisi, lalu lepas supaya transisi
         masuk berjalan dari sudut itu. */
      box!.classList.add('is-hold', 'is-in')
      requestAnimationFrame(() => {
        if (!running) {
          box!.classList.remove('is-hold', 'is-in', 'is-flip')
          return
        }
        box!.classList.remove('is-hold', 'is-flip')
        requestAnimationFrame(() => {
          box!.classList.remove('is-in')
        })
      })

      timer = window.setTimeout(step, hold)
    }, dur / 2)
  }

  function start() {
    if (reduce || running || words.length < 2) return
    running = true
    timer = window.setTimeout(step, hold)
  }

  function stop() {
    running = false
    window.clearTimeout(timer)
  }

  /* ---------- bahasa ---------- */

  function applyLang() {
    const next = readLang()
    if (next === lang) return
    stop()
    lang = next
    words = pick()
    /* Kata pertama bahasa baru dipasang tanpa animasi: ini pergantian
       setelan, bukan giliran kata. */
    index = 0
    show(index)
    sizer!.textContent = words[0]
    box!.classList.remove('is-flip', 'is-in', 'is-hold')
    measure()
    start()
  }

  function onLang() {
    applyLang()
  }

  /* ---------- pasang ---------- */

  words = pick()
  index = 0
  /* Pasang kata + ukur lebar sedini mungkin (sebelum cat pertama), supaya
     pengunjung berbahasa Indonesia tidak melihat kata Inggris sekejap dan
     slot tidak melebar setelah halaman terlihat. */
  show(index)
  /* Transisi lebar dimatikan untuk pengukuran pertama: nilai awalnya harus
     muncul seketika, bukan dianimasikan dari nol. */
  frame.style.transition = 'none'
  measure()
  requestAnimationFrame(() => {
    frame.style.transition = ''
  })

  document.addEventListener('mifdlal:lang', onLang)
  window.addEventListener('mifdlal:lang', onLang)

  /* Berhenti saat tab tidak aktif atau hero keluar layar: tidak ada kerja
     latar yang membakar CPU. */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop()
    else start()
  })
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(
      (entries) => entries.forEach((e) => (e.isIntersecting ? start() : stop())),
      { threshold: 0.2 }
    ).observe(root)
  }

  /* Ukuran fonta hero memakai clamp(): lebar kata ikut berubah saat viewport
     berubah, jadi ukur ulang tanpa animasi. */
  let resizeTimer = 0
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer)
    resizeTimer = window.setTimeout(() => {
      const wasRunning = running
      stop()
      box!.classList.remove('is-flip', 'is-in', 'is-hold')
      frame.style.transition = 'none'
      sizeFrame(index)
      measure()
      requestAnimationFrame(() => {
        frame.style.transition = ''
      })
      if (wasRunning) start()
    }, 150)
  })

  /* Beri tanda siap lalu mulai setelah cat pertama selesai. */
  const arm = () =>
    window.setTimeout(() => {
      box!.setAttribute('data-flip-armed', '')
      box!.classList.add('is-ready')
      start()
    }, START_DELAY_MS)

  const ready = document.fonts?.ready
  if (ready) ready.then(arm).catch(arm)
  else arm()
}
