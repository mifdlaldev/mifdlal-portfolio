/* Kanvas layanan.
 *
 * Setiap layanan punya satu kanvas di dalam panel gelap. Skrip ini memotret
 * aset layanan (public/services/layanan-0N.jpg) ke kanvas dengan crop cover,
 * lalu menambahkan penanda sudut dan label gambar teknik di atasnya. Tidak
 * ada animasi dan tidak ada permintaan jaringan selain berkas gambar itu.
 *
 * Aset belum siap: kalau gambar gagal dimuat, kanvas menggambar pelat kosong
 * (kisi titik + keterangan), jadi tidak pernah tampil bidang hitam kosong.
 *
 * Struktur data tetap: satu kanvas per [data-service-canvas], nomor layanan
 * terbaca dari data-index, alamat gambar dari data-src.
 *
 * Ukuran: kanvas mengikuti kotak CSS-nya (aspect-ratio 16/10), diskalakan
 * dengan devicePixelRatio supaya garis tetap tajam di layar rapat.
 */
(() => {
  const canvases = Array.from(document.querySelectorAll('[data-service-canvas]'));
  if (!canvases.length) return;

  const css = getComputedStyle(document.documentElement);
  const PAPER = (css.getPropertyValue('--color-paper') || css.getPropertyValue('--paper') || '#fdfcf1').trim();
  const INK = (css.getPropertyValue('--ink-900') || '#1a1522').trim();
  const DISPLAY = '"Space Grotesk Variable", system-ui, sans-serif';
  const MONO = '"JetBrains Mono Variable", ui-monospace, monospace';

  /* Satu berkas gambar per layanan, dimuat sekali lalu dipakai ulang tiap
     repaint (resize, zoom peramban, font selesai dimuat). */
  const sources = new Map();
  const loaded = new Set();

  function sourceFor(canvas) {
    const src = canvas.dataset.src;
    if (!src) return null;
    if (!sources.has(src)) {
      const img = new Image();
      img.decoding = 'async';
      img.addEventListener('load', () => {
        loaded.add(src);
        canvases.forEach((c) => {
          if (c.dataset.src === src) paint(c);
        });
      });
      img.src = src;
      sources.set(src, img);
    }
    return sources.get(src);
  }

  /* Crop cover: gambar memenuhi kotak, bagian lebih dipotong di tengah. */
  function drawCover(ctx, img, w, h) {
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    if (!iw || !ih) return;
    const scale = Math.max(w / iw, h / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
  }

  /* Pelat cadangan: kisi titik dan keterangan, dipakai saat aset belum ada. */
  function paintPlate(ctx, w, h, index) {
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
    ctx.fillText('aset layanan belum ada', w / 2, h / 2 + big * 0.62);
    ctx.globalAlpha = 1;
  }

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

    /* Latar panel: kanvas tidak tembus pandang, jadi tepi crop gambar tidak
       pernah memperlihatkan warna kertas di belakangnya. */
    ctx.fillStyle = INK;
    ctx.fillRect(0, 0, w, h);

    const src = canvas.dataset.src;
    const img = sourceFor(canvas);
    const ready = Boolean(img && src && loaded.has(src) && (img.naturalWidth || img.width));

    if (ready) {
      /* Sedikit diturunkan saturasinya supaya lukisan masuk palet kertas dan
         tinta, bukan muncul sebagai blok warna asing di panel gelap. */
      ctx.save();
      if ('filter' in ctx) ctx.filter = 'saturate(0.9) contrast(1.02)';
      drawCover(ctx, img, w, h);
      ctx.restore();

      /* Selubung tinta tipis di bagian bawah: label mono harus terbaca di
         atas langit maupun rumput. */
      const scrim = ctx.createLinearGradient(0, h * 0.62, 0, h);
      scrim.addColorStop(0, 'rgba(26, 21, 34, 0)');
      scrim.addColorStop(1, 'rgba(26, 21, 34, 0.55)');
      ctx.fillStyle = scrim;
      ctx.fillRect(0, h * 0.62, w, h * 0.38);
    } else {
      paintPlate(ctx, w, h, index);
    }

    /* Penanda sudut, seperti bidang potong pada gambar teknik. */
    const arm = Math.round(unit * 0.065);
    const hair = Math.max(1, unit * 0.0035);
    ctx.strokeStyle = PAPER;
    ctx.globalAlpha = ready ? 0.55 : 0.34;
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

    ctx.globalAlpha = 1;
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
