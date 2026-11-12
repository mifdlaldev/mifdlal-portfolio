/* Kotak kata bergilir di judul hero (gaya layout-text-flip, tanpa dependency).
 *
 * Kenapa vanilla, bukan island React: hero sengaja bebas React sejak awal —
 * versi React-nya pernah menyumbang satu long task 3 detik di Lighthouse
 * mobile (catatan di kepala Hero.astro). Modul ini nol dependency dan hanya
 * menyentuh satu kotak.
 *
 * Tiga hal yang harus benar sekaligus, dan cara masing-masing dicapai:
 *
 *   1. Jarak kata depan ke kotak KONSISTEN (seperti spasi teks biasa, bukan
 *      celah panjang saat katanya pendek).
 *      Caranya: bingkai menempel tepi KIRI slot, lebarnya mengikuti kata.
 *      Tepi kiri bingkai selalu berjarak sama dari kata depan.
 *
 *   2. Tata letak tidak bergeser (nol ongkos CLS).
 *      Caranya: lebar SLOT dipatok sekali selebar kata terpanjang dari
 *      KEDUA bahasa, dan sizer di markup sudah berisi kata itu. Skrip tidak
 *      pernah menyusutkan lebar slot, jadi tata letak dasar tidak pernah
 *      bergerak: kata depan diam, keputusan wrap di layar kecil stabil, dan
 *      pindah bahasa pun tidak menggeser apa pun. Pergantian lebar bingkai
 *      terjadi di dalam slot lewat properti width pada elemen absolut, dan
 *      itu tidak menggeser apa pun.
 *
 *   3. Baris tetap terlihat di tengah.
 *      Karena judul rata tengah dan bingkai menempel kiri, isi baris jadi
 *      condong ke kiri saat katanya pendek. Skrip menggeser seluruh grup
 *      (kata depan + kotak) lewat transform translateX sebesar setengah
 *      selisih lebar. Transform TIDAK dihitung sebagai layout shift, jadi
 *      perbaikan ini gratis dari sisi CLS - dan sekaligus inilah "layout
 *      flip"-nya: teks di sekitarnya ikut bergerak sedikit.
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
  const fit = root.querySelector<HTMLElement>('[data-flip-fit]')
  const sizer = root.querySelector<HTMLElement>('[data-flip-sizer]')
  if (!box || !frame || !word || !fit || !sizer) return

  const lists: Record<Lang, string[]> = {
    id: splitList(root.getAttribute('data-words-id')),
    en: splitList(root.getAttribute('data-words-en')),
  }
  if (lists.en.length < 2) return

  /** Kata pematok lebar slot: terpanjang dari KEDUA bahasa. Isi awal sizer
      di markup memakai kata ini juga, jadi lebar slot sudah benar sejak cat
      pertama, sebelum skrip jalan, dan tidak pernah berubah sesudahnya. */
  const reserved = [...lists.id, ...lists.en].reduce((a, b) => (b.length > a.length ? b : a), '')

  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

  const styles = getComputedStyle(root)
  const hold = readMs(styles.getPropertyValue('--flip-hold'), 2600)
  const dur = readMs(styles.getPropertyValue('--flip-dur'), 420)

  let lang: Lang = readLang()
  let words: string[] = []
  let widths: number[] = []
  let slot = 0
  let index = 0
  let timer = 0
  let running = false

  function pick(): string[] {
    const list = lists[lang]
    return list.length > 1 ? list : lists.en
  }

  /** Ukur lebar bingkai untuk tiap kata, lalu KEMBALIKAN sizer ke kata
      pematok. Sizer adalah satu-satunya isi yang mengalir di dalam slot,
      jadi kalau dia dibiarkan berisi kata pendek lebar slot ikut menyusut
      dan tata letak bergeser. Patokannya kata terpanjang dari KEDUA bahasa:
      dengan begitu pindah bahasa pun tidak mengubah lebar slot. */
  function measure() {
    widths = words.map((w) => {
      sizer!.textContent = w
      return sizer!.getBoundingClientRect().width
    })
    sizer!.textContent = reserved
    slot = Math.ceil(sizer!.getBoundingClientRect().width)
  }

  /** Pindahkan nama kata ke pengukur di dalam bingkai: bingkai menyesuaikan
      lebarnya sendiri lewat tata letak biasa, bukan lewat properti yang
      dipasang skrip. Dengan begitu tidak ada perubahan ukuran yang terjadi
      sesudah cat pertama, jadi tidak ada pergeseran tata letak dari kotak. */
  function show(i: number) {
    const text = words[i]
    word!.textContent = text
    fit!.textContent = text
    /* Geser grup supaya isi baris tetap terlihat di tengah. Transform tidak
       dihitung sebagai layout shift, jadi pergeseran ini gratis. */
    const stacked = syncStacked()
    root.style.setProperty('--flip-shift', stacked ? '0px' : `${(slot - widths[i]) / 2}px`)
  }

  /** Deteksi apakah baris benar-benar terbelah dua (kata depan satu baris,
      kotak di baris berikutnya). Mengembalikan true kalau terbelah. */
  function syncStacked(): boolean {
    const lead = root.querySelector<HTMLElement>('.hero-flip-lead')
    if (!lead) return false
    const lr = lead.getBoundingClientRect()
    const br = box!.getBoundingClientRect()
    const stacked = br.top > lr.top + lr.height / 2
    box!.classList.toggle('is-stacked', stacked)
    return stacked
  }

  /* ---------- siklus ---------- */

  function step() {
    if (!running) return

    /* Fase keluar: kata berputar dan memudar. */
    box!.classList.add('is-flip')

    window.setTimeout(() => {
      if (!running) return

      index = (index + 1) % words.length
      /* Kata, lebar bingkai, dan geseran berganti di sini, saat kata lama
         sudah tak terlihat, jadi tidak ada lompatan yang kasatmata. */
      show(index)

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

  function applyLang() {
    const next = readLang()
    if (next === lang) return
    stop()
    lang = next
    words = pick()
    box!.classList.remove('is-flip', 'is-in', 'is-hold')
    /* Pindah setelan, bukan giliran kata: pasang kata pertama tanpa animasi.
       Lebar slot tidak berubah, jadi tidak ada pergeseran tata letak. */
    measure()
    index = 0
    show(index)
    start()
  }

  function onLang() {
    applyLang()
  }

  words = pick()

  /* Pasang ukuran sedini mungkin (sebelum cat pertama): ukur lebar tiap kata
     lalu tampilkan kata pertama tanpa animasi, supaya pengunjung berbahasa
     Indonesia tidak melihat kata Inggris sekejap. Transisi lebar dimatikan
     dulu agar nilai awal muncul seketika, bukan dianimasikan. */
  measure()
  frame.style.transition = 'none'
  root.style.transition = 'none'
  index = 0
  show(index)
  requestAnimationFrame(() => {
    frame.style.transition = ''
    root.style.transition = ''
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
      root.style.transition = 'none'
      measure()
      show(index)
      requestAnimationFrame(() => {
        frame.style.transition = ''
        root.style.transition = ''
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
