/* Reveal wordmark — lembaran halaman diangkat, pita MIFDLAL naik dari bawah.

   Modelnya dua lapis:
     lapis bawah  .wordmark   position: fixed di dasar viewport, z-index 0
     lapis atas   .page-layer normal flow, latar opak, z-index 1

   Selama scroll biasa lapis atas menutup pita sepenuhnya. Di jarak REVEAL px
   terakhir lapis atas bergerak lebih lambat daripada scroll sementara pita
   naik, lalu keduanya berhenti tepat bersambung: tepi bawah footer = tepi atas
   pita.

   Matematikanya: padding-bottom di .page-track = REVEAL, dorongan maksimum =
   REVEAL - tinggi pita, arahnya ke bawah. Di p=1 tepi bawah footer jatuh persis
   di tepi atas pita, berapa pun lebar layar.

   Yang ditulis ke DOM tiap frame cuma tiga hal: satu transform pada lapis, satu
   opacity pada strip bayangan, satu transform + satu opacity pada pita. Tidak
   ada properti yang memaksa raster ulang area besar.

   Tanpa JS, atau saat prefers-reduced-motion, berkas ini tidak melakukan apa
   pun: pita tetap di alur normal setelah footer seperti sebelumnya. */

(() => {
  const band = document.querySelector('.wordmark');
  const layer = document.querySelector('[data-page]');
  const track = document.querySelector('[data-track]');
  const shadow = document.querySelector('[data-sheet-shadow]');
  if (!band || !layer || !track || !shadow) return;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

  const root = document.documentElement;
  /* Kalau browser punya scroll-timeline, seluruh animasi reveal dijalankan CSS
     di compositor. Skrip cuma menyiapkan angka dan menyalakan/mematikan kanvas. */
  const cssMode = typeof CSS !== 'undefined' && CSS.supports?.('animation-timeline: scroll()');
  const REVEAL_RATIO = 2.0;
  const REVEAL_MIN = 260;

  let bandHeight = 0;
  let reveal = 0;
  let liftMax = 0;
  let maxScroll = 0;
  let ticking = false;
  let progress = -1;
  let lastPx = null;
  let lastShadow = null;
  let promoted = false;
  let revealing = false;

  const measure = () => {
    bandHeight = band.offsetHeight;
    reveal = Math.max(bandHeight * REVEAL_RATIO, REVEAL_MIN);
    liftMax = Math.max(0, reveal - bandHeight);
    track.style.paddingBottom = `${Math.round(reveal)}px`;
    if (cssMode) {
      root.style.setProperty('--reveal-distance', `${Math.round(reveal)}px`);
      root.style.setProperty('--reveal-lift', `${Math.round(liftMax)}px`);
      root.style.setProperty('--wm-band-h', `${Math.round(bandHeight)}px`);
    }
    maxScroll = Math.max(0, root.scrollHeight - window.innerHeight);
  };

  const apply = (p) => {
    if (p === progress) return;
    progress = p;

    if (!cssMode) {
      const px = Math.round(p * liftMax);
      if (px !== lastPx) {
        lastPx = px;
        layer.style.transform = px ? `translate3d(0, ${px}px, 0)` : '';
      }

      const shadowOpacity = Math.round((1 - p) * 100) / 100;
      if (shadowOpacity !== lastShadow) {
        lastShadow = shadowOpacity;
        shadow.style.opacity = `${shadowOpacity}`;
      }

      band.style.transform = `translateY(${Math.round((1 - p) * bandHeight * 0.3)}px)`;
      band.style.opacity = `${(0.7 + 0.3 * p).toFixed(2)}`;
    }

    /* Kanvas berhenti menggambar selama pita masih tertutup. */
    band.dataset.awake = p > 0.01 ? 'true' : 'false';
    if (p > 0.01 && typeof band.__wake === 'function') band.__wake();

    /* Selama reveal berjalan, aurora diturunkan ke separuh frame. */
    const nowRevealing = p > 0 && p < 1;
    if (nowRevealing !== revealing) {
      revealing = nowRevealing;
      band.dataset.revealing = nowRevealing ? 'true' : 'false';
    }
  };

  /* Promosi compositor dinyalakan sebelum reveal mulai, supaya raster ulang
     tidak terjadi tepat saat animasi berjalan. */
  const promote = () => {
    if (cssMode) return;
    const near = window.scrollY >= maxScroll - reveal * 1.6;
    if (near !== promoted) {
      promoted = near;
      layer.classList.toggle('is-lifting', near);
    }
  };

  const update = () => {
    ticking = false;
    promote();
    const p = reveal > 0
      ? Math.min(1, Math.max(0, (window.scrollY - (maxScroll - reveal)) / reveal))
      : 0;
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
      lastPx = null;
      lastShadow = null;
      update();
    }, { passive: true });
    /* Tinggi halaman bisa berubah setelah font/gambar selesai dimuat. */
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => { measure(); progress = -1; update(); });
    }
    window.addEventListener('load', () => { measure(); progress = -1; update(); }, { once: true });
  };

  boot();
})();
