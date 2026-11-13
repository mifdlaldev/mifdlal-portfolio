/* Navbar glass: aktif begitu halaman digeser sedikit dari paling atas.
   Same-origin (CSP script-src 'self'), passive listener, rAF-throttled.

   PENTING (perf): versi sebelumnya memanggil update() langsung saat parse.
   update() membaca nav.offsetHeight lalu getBoundingClientRect() untuk tiap
   section, yang memaksa layout seluruh dokumen (402 KB) SEBELUM paint pertama.
   Di Lighthouse mobile itu satu long task 565 ms yang menunda FCP.

   Sekarang dipisah dua:
     - applyScrolled() hanya membaca window.scrollY  -> nol layout, aman di awal
     - spy()            membaca geometri section      -> ditunda ke idle setelah
                                                       load, atau ke scroll pertama

   Hasil visual identik: di scrollY = 0 tidak ada link yang menyala, jadi
   melewatkan spy() saat init tidak mengubah tampilan. Saat halaman di-reload
   di tengah dokumen, spy() menyusul di idle sehingga status aktif tetap benar. */
;(() => {
  const nav = document.querySelector('.nav')
  if (!nav) return

  // Ambang kecil: blur aktif walau masih di dalam hero.
  const THRESHOLD = 4

  /* Scroll-spy: link aktif hanya selama section-nya berada di bawah navbar.
     Patokannya satu garis baca tepat di bawah navbar (navbar + 24px), bukan
     "section terakhir yang sudah lewat". Bedanya penting: kalau memakai
     section terakhir yang lewat, link terakhir (#pengalaman) tetap menyala
     sampai bawah halaman karena tidak ada section nav lagi sesudahnya.
     Dengan garis baca, begitu section berikutnya (pendidikan) mengisi garis
     itu, tidak ada link yang cocok dan semua link padam. */
  const links = Array.from(nav.querySelectorAll('.nav-link[href^="#"], .nav-menu-link[href^="#"]'))
  const sections = links.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean)

  let ticking = false
  let spyDone = false

  /* Nol pembacaan layout: hanya scrollY. */
  const applyScrolled = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > THRESHOLD)
  }

  /* Satu-satunya bagian yang menyentuh geometri. */
  const spy = () => {
    if (!sections.length) return
    spyDone = true

    const line = nav.offsetHeight + 24
    let current = null
    for (const section of sections) {
      const rect = section.getBoundingClientRect()
      if (rect.top <= line && rect.bottom > line) {
        current = section
        break
      }
    }

    for (const link of links) {
      const on = !!current && link.getAttribute('href') === '#' + current.id
      link.classList.toggle('is-active', on)
      if (on) link.setAttribute('aria-current', 'true')
      else link.removeAttribute('aria-current')
    }
  }

  const update = () => {
    ticking = false
    applyScrolled()
    spy()
  }

  const onScroll = () => {
    if (ticking) return
    ticking = true
    requestAnimationFrame(update)
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })

  /* Init: state navbar saja, tanpa memaksa layout. */
  applyScrolled()

  /* Scroll-spy menyusul saat main thread sudah longgar. Kalau browser tidak
     punya requestIdleCallback, tunggu load lalu satu tick. */
  const warm = () => {
    if (spyDone) return
    spy()
  }
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(warm, { timeout: 2000 })
  } else {
    window.addEventListener('load', () => window.setTimeout(warm, 0))
  }
})()
