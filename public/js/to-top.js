/* Tombol kembali ke atas.
   Tampil begitu section pemicu (default #kontak) menyentuh viewport, dan
   tetap tampil selama halaman digulir lebih jauh. Same-origin (CSP
   script-src 'self'), passive listener, rAF-throttled. */
(() => {
  const btn = document.querySelector('.to-top');
  if (!btn) return;

  const trigger = document.querySelector(btn.dataset.trigger || '#kontak');
  if (!trigger) return;

  /* Footer: tombol tidak boleh masuk area footer. Posisi dasarnya dibaca
     sekali di awal (sebelum ada lift), lalu lift dihitung supaya tepi bawah
     tombol berhenti FOOTER_GAP px di atas tepi atas footer. */
  const footer = document.querySelector('footer');
  const FOOTER_GAP = 16;
  const baseBottom = parseFloat(getComputedStyle(btn).bottom);

  let ticking = false;

  const update = () => {
    ticking = false;
    const show = trigger.getBoundingClientRect().top < window.innerHeight;
    btn.dataset.visible = show ? 'true' : 'false';

    if (footer) {
      const footerTop = footer.getBoundingClientRect().top;
      const lift = Math.max(
        0,
        window.innerHeight - footerTop + FOOTER_GAP - baseBottom
      );
      btn.style.setProperty('--to-top-lift', lift + 'px');
    }
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  btn.addEventListener('click', (event) => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Lenis aktif: pakai jalur scroll yang sama supaya tidak menabrak
    // smoothing halaman (native scrollTo + Lenis = dua kontrol berebut).
    const lenis = window.__lenis;
    if (lenis) {
      event.preventDefault();
      lenis.scrollTo(0, { immediate: reduce });
      return;
    }
    if (reduce || !('scrollBehavior' in document.documentElement.style)) return;
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
})();
