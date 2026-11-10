/* Tombol kembali ke atas.
   Tampil begitu section pemicu (default #kontak) menyentuh viewport, dan
   tetap tampil selama halaman digulir lebih jauh. Same-origin (CSP
   script-src 'self'), passive listener, rAF-throttled. */
;(() => {
  const btn = document.querySelector('.to-top')
  if (!btn) return

  const trigger = document.querySelector(btn.dataset.trigger || '#kontak')
  if (!trigger) return

  /* Footer: tombol tidak boleh masuk area footer. Lift dihitung supaya tepi
     bawah tombol berhenti FOOTER_GAP px di atas tepi atas footer.
     PERFORMA: lift diterapkan lewat `translate` (individual transform
     property = kompositor-only) pada ELEMEN INI SAJA. Versi lama menulis
     custom property ke :root tiap frame, yang meng-invalidasi style seluruh
     dokumen dan memicu layout+paint ulang penuh = frame drop. */
  const footer = document.querySelector('footer')
  const chat = document.querySelector('.site-chat')
  const FOOTER_GAP = 16
  let baseBottom = 0
  try {
    baseBottom = parseFloat(getComputedStyle(btn).bottom) || 0
  } catch {
    baseBottom = 0
  }
  let lastLift = -1
  let lastShow = null

  let ticking = false

  const update = () => {
    ticking = false
    const show = trigger.getBoundingClientRect().top < window.innerHeight
    if (show !== lastShow) {
      btn.dataset.visible = show ? 'true' : 'false'
      lastShow = show
    }

    if (!footer) return
    const footerTop = footer.getBoundingClientRect().top
    const lift = Math.max(0, Math.round(window.innerHeight - footerTop + FOOTER_GAP - baseBottom))
    /* Tulis hanya kalau berubah — menghindari invalidasi style tiap frame */
    if (lift !== lastLift) {
      btn.style.translate = `0 ${-lift}px`
      /* Chat widget adalah sibling, bukan child: pakai property `translate`
         yang sama supaya ikut naik tanpa menyentuh transform merged-nya. */
      if (chat) chat.style.translate = `0 ${-lift}px`
      lastLift = lift
    }
  }

  const onScroll = () => {
    if (ticking) return
    ticking = true
    requestAnimationFrame(update)
  }

  btn.addEventListener('click', (event) => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // Lenis aktif: pakai jalur scroll yang sama supaya tidak menabrak
    // smoothing halaman (native scrollTo + Lenis = dua kontrol berebut).
    // force:true  -> tetap jalan walau Lenis sedang stopped/locked
    // duration    -> animasi berbasis waktu, pasti selesai; mode lerp
    //                asimtotik terasa berhenti sebelum mentok 0
    const lenis = window.__lenis
    if (lenis) {
      event.preventDefault()
      lenis.scrollTo(0, { immediate: reduce, force: true, duration: reduce ? 0 : 1.2 })
      return
    }
    if (reduce || !('scrollBehavior' in document.documentElement.style)) return
    event.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })

  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
  update()
})()
