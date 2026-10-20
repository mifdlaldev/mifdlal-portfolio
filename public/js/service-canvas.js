/* Kanvas layanan.
 *
 * Setiap layanan punya satu kanvas kosong di dalam panel gelap. Skrip ini
 * hanya menggambar pelatnya: kisi titik, penanda sudut, label, dan garis
 * ukur. Tidak ada animasi dan tidak ada permintaan jaringan, karena aset
 * aslinya belum ada.
 *
 * Cara mengganti: timpa fungsi paint() dengan animasi layanan yang
 * sesungguhnya. Struktur data tetap: satu kanvas per [data-service-canvas],
 * nomor layanan terbaca dari data-index.
 *
 * Ukuran: kanvas mengikuti kotak CSS-nya (aspect-ratio 16/10), diskalakan
 * dengan devicePixelRatio supaya garis tetap tajam di layar rapat.
 */
(() => {
  const canvases = Array.from(document.querySelectorAll('[data-service-canvas]'));
  if (!canvases.length) return;

  const css = getComputedStyle(document.documentElement);
  const PAPER = (css.getPropertyValue('--paper') || '#fdfcf1').trim();
  const DISPLAY = '"Space Grotesk Variable", system-ui, sans-serif';
  const MONO = '"JetBrains Mono Variable", ui-monospace, monospace';

  function paint(canvas) {
    const rect = canvas.getBoundingClientRect();
    const w = Math.round(rect.width);
    const h = Math.round(rect.height);
    if (!w || !h) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const index = canvas.dataset.index || '01';
    const unit = Math.min(w, h);
    const pad = Math.round(unit * 0.06);

    /* Kisi titik: menandakan bidang gambar, bukan latar kosong. */
    const step = Math.max(18, Math.round(w / 34));
    ctx.fillStyle = PAPER;
    ctx.globalAlpha = 0.1;
    for (let y = step; y < h; y += step) {
      for (let x = step; x < w; x += step) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    /* Penanda sudut, seperti bidang potong pada gambar teknik. */
    const arm = Math.round(unit * 0.065);
    const hair = Math.max(1, unit * 0.0035);
    ctx.strokeStyle = PAPER;
    ctx.globalAlpha = 0.34;
    ctx.lineWidth = hair;
    [
      [pad, pad, 1, 1],
      [w - pad, pad, -1, 1],
      [pad, h - pad, 1, -1],
      [w - pad, h - pad, -1, -1],
    ].forEach(([x, y, sx, sy]) => {
      ctx.beginPath();
      ctx.moveTo(x + sx * arm, y);
      ctx.lineTo(x, y);
      ctx.lineTo(x, y + sy * arm);
      ctx.stroke();
    });

    /* Keterangan tengah: satu baris menyebut kanvas mana, satu baris
       menyatakan asetnya belum ada. Tidak ada nomor air besar, supaya
       tidak bersaing dengan judul di kolom teks. */
    const big = Math.max(15, Math.min(28, w * 0.04));
    const small = Math.max(11, Math.min(13, w * 0.026));

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = PAPER;

    ctx.globalAlpha = 0.94;
    ctx.font = `600 ${big}px ${DISPLAY}`;
    ctx.fillText(`Kanvas ${index}`, w / 2, h / 2 - big * 0.58);

    ctx.globalAlpha = 0.72;
    ctx.font = `500 ${small}px ${MONO}`;
    ctx.fillText('animasi alur kerja menyusul', w / 2, h / 2 + big * 0.62);
  }

  const drawAll = () => canvases.forEach(paint);

  drawAll();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawAll);

  /* Ukuran berubah saat jendela diubah atau saat font selesai dimuat. */
  let frame = 0;
  const schedule = () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      drawAll();
    });
  };
  window.addEventListener('resize', schedule, { passive: true });
})();
