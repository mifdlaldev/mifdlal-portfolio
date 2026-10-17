/* Navbar glass setelah melewati hero. Same-origin (CSP script-src 'self'). */
(() => {
  const nav = document.querySelector('.nav');
  const hero = document.querySelector('.hero');
  if (!nav || !hero) return;

  let ticking = false;

  const update = () => {
    ticking = false;
    const threshold = Math.max(0, hero.offsetTop + hero.offsetHeight - nav.offsetHeight);
    nav.classList.toggle('is-scrolled', window.scrollY >= threshold);
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
