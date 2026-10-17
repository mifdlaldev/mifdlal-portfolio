/* Navbar glass: aktif begitu halaman digeser sedikit dari paling atas.
   Same-origin (CSP script-src 'self'), passive listener, rAF-throttled. */
(() => {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  // Ambang kecil: blur aktif walau masih di dalam hero.
  const THRESHOLD = 4;

  let ticking = false;

  const update = () => {
    ticking = false;
    nav.classList.toggle('is-scrolled', window.scrollY > THRESHOLD);
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
})();
