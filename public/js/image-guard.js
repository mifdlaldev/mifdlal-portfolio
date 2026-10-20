/* Penjaga gambar.
 *
 * Semua <img> diperlakukan sebagai bagian dari antarmuka, bukan berkas yang
 * bisa dibuka, ditarik, atau disimpan lewat menu peramban:
 *
 *   - dragstart  : gambar tidak bisa ditarik ke tab, desktop, atau editor.
 *   - contextmenu: tidak ada "Buka gambar di tab baru" / "Simpan gambar".
 *   - selectstart: gambar tidak bisa masuk seleksi teks.
 *   - auxclick   : klik tengah tidak membuka tab baru.
 *
 * Atribut draggable juga dipasang di HTML dan di sini, dan dipasang ulang
 * untuk gambar yang disisipkan belakangan (logo loop, dialog sertifikat).
 *
 * Batas jujur: berkas gambar tetap bisa diambil lewat panel jaringan atau
 * dengan mematikan JavaScript. Skrip ini menutup jalur yang dipakai pengunjung
 * biasa, bukan jalur pengembang.
 */
(() => {
  /* Zona gambar. Bingkai potret dan wadah thumbnail ikut dijaga supaya klik
     kanan di tepi bingkai tidak membocorkan menu gambar di dalamnya. */
  const ZONE = 'img, picture, .portrait-frame, .cert-shot';

  const inZone = (node) => node instanceof Element && node.closest(ZONE) !== null;

  const lock = (img) => {
    img.draggable = false;
    img.setAttribute('draggable', 'false');
  };

  const lockTree = (root) => {
    if (root instanceof HTMLImageElement) lock(root);
    if (root instanceof Element) root.querySelectorAll('img').forEach(lock);
  };

  lockTree(document.documentElement);

  /* Gambar yang muncul kemudian: klon logo loop dan gambar di dialog
     sertifikat. */
  new MutationObserver((records) => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node.nodeType === 1) lockTree(node);
      }
    }
  }).observe(document.documentElement, { childList: true, subtree: true });

  const block = (event) => {
    if (inZone(event.target)) event.preventDefault();
  };

  document.addEventListener('dragstart', block, true);
  document.addEventListener('contextmenu', block, true);
  document.addEventListener('selectstart', block, true);
  document.addEventListener('auxclick', block, true);
})();
