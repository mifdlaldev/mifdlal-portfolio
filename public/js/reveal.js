/* Reveal wordmark — lembaran halaman diangkat, pita MIFDLAL naik dari bawah.

   Modelnya dua lapis:
     lapis bawah  .wordmark   position: fixed di dasar viewport, z-index 0
     lapis atas   .page-layer normal flow, latar opak, z-index 1

   Selama scroll biasa lapis atas menutup pita sepenuhnya. Di ujung halaman
   (jarak REVEAL px terakhir) lapis atas diangkat dan pita naik, lalu keduanya
   berhenti tepat bersambung: tepi bawah footer = tepi atas pita.

   Matematikanya: padding-bottom lapis atas = REVEAL, dorongan maksimum =
   REVEAL - tinggi pita, arahnya ke bawah. Isi halaman jadi bergerak lebih
   lambat daripada scroll selama reveal, dan di p=1 tepi bawah footer jatuh
   persis di tepi atas pita: bersambung, tidak kurang tidak lebih.

   Tanpa JS, atau saat prefers-reduced-motion, berkas ini tidak melakukan
   apa pun: pita tetap di alur normal setelah footer seperti sebelumnya. */

(() => {
  const band = document.querySelector('.wordmark');
  const layer = document.querySelector('[data-page]');
  const track = document.querySelector('[data-track]');
  if (!band || !layer || !track) return;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

  const root = document.documentElement;
  const REVEAL_RATIO = 2.0;
  const REVEAL_MIN = 260;

  let bandHeight = 0;
  let reveal = 0;
  let liftMax = 0;
  let maxScroll = 0;
  let ticking = false;
  let progress = -1;

  const measure = () => {
    bandHeight = band.offsetHeight;
    reveal = Math.max(bandHeight * REVEAL_RATIO, REVEAL_MIN);
    liftMax = Math.max(0, reveal - bandHeight);
    track.style.paddingBottom = `${Math.round(reveal)}px`;
    maxScroll = Math.max(0, root.scrollHeight - window.innerHeight);
  };

  const apply = (p) => {
    if (p === progress) return;
    progress = p;
    layer.style.transform = p > 0 ? `translateY(${p * liftMax}px)` : '';
    layer.style.setProperty('--sheet-shadow', `${Math.round((1 - p) * 30)}`);
    band.style.setProperty('--wm-rise', `${(1 - p) * bandHeight * 0.3}px`);
    band.style.setProperty('--wm-fade', `${0.7 + 0.3 * p}`);
    /* Kanvas berhenti menggambar selama pita masih tertutup. */
    band.dataset.awake = p > 0.01 ? 'true' : 'false';
    if (p > 0.01 && typeof band.__wake === 'function') band.__wake();
  };

  const update = () => {
    ticking = false;
    const p = reveal > 0 ? Math.min(1, Math.max(0, (window.scrollY - (maxScroll - reveal)) / reveal)) : 0;
    apply(p);
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  const boot = () => {
    root.classList.add('has-reveal');
    band.classList.add('is-fixed');
    measure();
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => {
      measure();
      progress = -1;
      update();
    }, { passive: true });
    /* Tinggi halaman bisa berubah setelah font/gambar selesai dimuat. */
    if (document.fonts?.ready) document.fonts.ready.then(() => { measure(); progress = -1; update(); });
    window.addEventListener('load', () => { measure(); progress = -1; update(); }, { once: true });
  };

  boot();
})();
