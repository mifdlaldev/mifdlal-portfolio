/* Refleksi foto potret.
 *
 * Skrip ini hanya mengisi tiga variabel di bingkai: arah penunjuk (x, y) dan
 * sudut pita cahaya. Semua gambar lapisan ada di CSS,
 * jadi tidak ada elemen baru, tidak ada pustaka, dan tidak ada permintaan
 * jaringan.
 *
 * Keadaan diam: x = y = 0, sudut 118deg. Nilai itu juga menjadi
 * bawaan di semantic.css, sehingga foto tetap tampak selesai walau skrip
 * tidak pernah jalan (JavaScript mati, atau perangkat sentuh, atau pengguna
 * meminta gerak dikurangi).
 *
 * Beban kerja: satu bingkai layar per pemanggilan, digerakkan hanya saat nilai
 * target belum tercapai, dan dihentikan begitu nilai menyusul target.
 */
(() => {
  const figures = document.querySelectorAll('[data-reflect]');
  if (!figures.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  /* Tanpa penunjuk presisi atau saat gerak dikurangi, lapisan dibiarkan pada
     nilai bawaan CSS. Tidak ada pendengar yang dipasang. */
  if (reduceMotion.matches || !finePointer.matches) return;

  /* Sudut pita saat diam. Sama dengan bawaan di semantic.css. */
  const REST_ANGLE = 118;
  const EASE_POINTER = 0.16;
  const EPSILON = 0.002;

  /* Selisih sudut terpendek, supaya pita tidak berputar satu lingkaran penuh
     saat penunjuk melewati titik pusat. */
  const shortestTurn = (from, to) => {
    let delta = (to - from) % 360;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    return delta;
  };

  figures.forEach((figure) => {
    const frame = figure.querySelector('.portrait-frame');
    if (!frame) return;

    let raf = 0;
    let targetX = 0;
    let targetY = 0;
    let targetAngle = REST_ANGLE;
    let curX = 0;
    let curY = 0;
    let curAngle = REST_ANGLE;

    const paint = () => {
      frame.style.setProperty('--reflect-x', curX.toFixed(4));
      frame.style.setProperty('--reflect-y', curY.toFixed(4));
      frame.style.setProperty('--reflect-angle', `${curAngle.toFixed(1)}deg`);
    };

    const settled = () =>
      Math.abs(targetX - curX) < EPSILON &&
      Math.abs(targetY - curY) < EPSILON &&
      Math.abs(shortestTurn(curAngle, targetAngle)) < 0.2;

    const step = () => {
      curX += (targetX - curX) * EASE_POINTER;
      curY += (targetY - curY) * EASE_POINTER;
      curAngle += shortestTurn(curAngle, targetAngle) * EASE_POINTER;
      paint();

      if (settled()) {
        raf = 0;
        return;
      }
      raf = window.requestAnimationFrame(step);
    };

    const kick = () => {
      if (!raf) raf = window.requestAnimationFrame(step);
    };

    figure.addEventListener(
      'pointermove',
      (event) => {
        const box = frame.getBoundingClientRect();
        if (!box.width || !box.height) return;

        const nx = (event.clientX - box.left) / box.width;
        const ny = (event.clientY - box.top) / box.height;

        targetX = Math.max(-1, Math.min(1, (nx - 0.5) * 2));
        targetY = Math.max(-1, Math.min(1, (ny - 0.5) * 2));
        targetAngle = (Math.atan2(targetY, targetX) * 180) / Math.PI + 90;
        kick();
      },
      { passive: true }
    );

    const rest = () => {
      targetX = 0;
      targetY = 0;
      targetAngle = REST_ANGLE;
      kick();
    };

    figure.addEventListener('pointerleave', rest, { passive: true });
    figure.addEventListener('pointercancel', rest, { passive: true });

    /* Kalau pengguna menyalakan pengurangan gerak saat halaman terbuka,
       semua nilai dikembalikan ke keadaan diam. */
    reduceMotion.addEventListener?.('change', (event) => {
      if (event.matches) rest();
    });
  });
})();
