/* Tombol kembali ke atas.
   Tampil begitu section pemicu (default #proyek) menyentuh viewport, dan
   tetap tampil selama halaman digulir lebih jauh. Same-origin (CSP
   script-src 'self'), passive listener, rAF-throttled. */
(() => {
  const btn = document.querySelector('.to-top');
  if (!btn) return;

  const trigger = document.querySelector(btn.dataset.trigger || '#proyek');
  if (!trigger) return;

  // Footer: tombol naik sebesar bagian footer yang sudah masuk viewport,
  // supaya tidak pernah menimpa hak cipta di dasar halaman.
  const footer = document.querySelector('footer');

  let ticking = false;

  const update = () => {
    ticking = false;
    const show = trigger.getBoundingClientRect().top < window.innerHeight;
    btn.dataset.visible = show ? 'true' : 'false';

    if (footer) {
      /* Hanya naik kalau isi footer benar-benar menabrak kolom tombol.
         Di layar lebar tombol duduk di gutter luar dan isi footer berhenti
         di tepi konten, jadi lift tetap 0 dan tombol tidak melompat. */
      const style = getComputedStyle(btn);
      const btnLeft = window.innerWidth - parseFloat(style.right) - btn.offsetWidth;
      let footerRight = 0;
      for (const el of footer.querySelectorAll('a, p, span')) {
        const right = el.getBoundingClientRect().right;
        if (right > footerRight) footerRight = right;
      }
      const lift =
        footerRight > btnLeft
          ? Math.max(0, window.innerHeight - footer.getBoundingClientRect().top)
          : 0;
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
    if (reduce || !('scrollBehavior' in document.documentElement.style)) return;
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
})();
