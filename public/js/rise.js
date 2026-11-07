/* Reveal saat scroll — semua section kecuali hero.

   Elemen ber-class .rise disembunyikan oleh CSS (opacity 0) hanya saat
   html.js ada, lalu berkas ini menambahkan .is-in begitu elemen menyentuh
   viewport. Animasi masuk dijalankan SEKALI (langsung unobserve).

   Stagger antar elemen diatur lewat custom property --rise-delay yang
   ditulis inline di markup (mis. --rise-delay:110ms).

   Hormati prefers-reduced-motion: kalau aktif, semua langsung tampil.
   Tanpa JS, html.js tak pernah di-set, jadi CSS tak menyembunyikan apa pun.

   Ada jaring pengaman: apa pun yang belum tampil setelah 4 detik dipaksa
   .is-in, supaya konten tidak pernah "hilang" kalau observer gagal. */

(() => {
  const els = Array.from(document.querySelectorAll('.rise'));
  if (!els.length) return;

  const reveal = (el) => el.classList.add('is-in');
  const revealAll = () => els.forEach(reveal);

  let reduce = false;
  try {
    reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    reduce = false;
  }

  if (reduce || !('IntersectionObserver' in window)) {
    revealAll();
    return;
  }

  try {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          reveal(entry.target);
          io.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));

    /* Jaring pengaman: apa pun yang belum ter-reveal dipaksa tampil. */
    window.setTimeout(revealAll, 4000);
  } catch {
    revealAll();
  }
})();
