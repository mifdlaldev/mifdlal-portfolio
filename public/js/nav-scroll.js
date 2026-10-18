/* Navbar glass: aktif begitu halaman digeser sedikit dari paling atas.
   Same-origin (CSP script-src 'self'), passive listener, rAF-throttled. */
(() => {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  // Ambang kecil: blur aktif walau masih di dalam hero.
  const THRESHOLD = 4;

  /* Scroll-spy: tandai link yang sectionnya sedang terlihat. Urutan link
     sudah sama dengan urutan section, jadi cukup ambil yang terakhir
     melewati ambang navbar. */
  const links = Array.from(nav.querySelectorAll('.nav-links a[href^="#"]'));
  const sections = links
    .map((a) => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  let ticking = false;

  const update = () => {
    ticking = false;
    nav.classList.toggle('is-scrolled', window.scrollY > THRESHOLD);

    if (!sections.length) return;
    const offset = nav.offsetHeight + 8;
    let current = null;
    for (const section of sections) {
      if (section.getBoundingClientRect().top - offset <= 0) current = section;
    }
    for (const link of links) {
      const on = !!current && link.getAttribute('href') === '#' + current.id;
      link.classList.toggle('is-active', on);
      if (on) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    }
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
