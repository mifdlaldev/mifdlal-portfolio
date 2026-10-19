/* Navbar glass: aktif begitu halaman digeser sedikit dari paling atas.
   Same-origin (CSP script-src 'self'), passive listener, rAF-throttled. */
(() => {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  // Ambang kecil: blur aktif walau masih di dalam hero.
  const THRESHOLD = 4;

  /* Scroll-spy: link aktif hanya selama section-nya berada di bawah navbar.
     Patokannya satu garis baca tepat di bawah navbar (navbar + 24px), bukan
     "section terakhir yang sudah lewat". Bedanya penting: kalau memakai
     section terakhir yang lewat, link terakhir (#pengalaman) tetap menyala
     sampai bawah halaman karena tidak ada section nav lagi sesudahnya.
     Dengan garis baca, begitu section berikutnya (pendidikan) mengisi garis
     itu, tidak ada link yang cocok dan semua link padam. */
  const links = Array.from(nav.querySelectorAll('.nav-links a[href^="#"]'));
  const sections = links
    .map((a) => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  let ticking = false;

  const update = () => {
    ticking = false;
    nav.classList.toggle('is-scrolled', window.scrollY > THRESHOLD);

    if (!sections.length) return;

    const line = nav.offsetHeight + 24;
    let current = null;
    for (const section of sections) {
      const rect = section.getBoundingClientRect();
      if (rect.top <= line && rect.bottom > line) {
        current = section;
        break;
      }
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
