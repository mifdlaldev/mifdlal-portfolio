import { useEffect, useRef, useState } from 'react';
import './safari-window.css';

/* Showcase browser window — dipakai di canvas layanan 01.
 *
 * Perilaku (sesuai permintaan operator):
 * - Tiga tombol traffic light dirender TETAPI SEMUA dinonaktifkan
 *   (tidak ada handler, cursor not-allowed, title "Tidak tersedia").
 * - Minimize & maximize TIDAK mengubah state window; tidak ada animasi.
 *   Keduanya hanya affordance visual (cursor berubah saat hover pinggir
 *   window) — user bisa drag pinggiran window untuk ubah ukuran, seperti
 *   window OS biasa. Klik tombol tidak melakukan apa-apa.
 * - Tab bar: pindah tab mengubah konten (iframe ke situs showcase).
 * - Konten tab = iframe asli ke situs (bukan screenshot). Situs yang
 *   mengirim X-Frame-Options/CSP frame-ancestors akan tampil kosong —
 *   daftarkan domain yang diizinkan di public/_headers (frame-src).
 */

type ShowcaseTab = { label: string; url: string };
type Rect = { x: number; y: number; w: number; h: number };
type Dir = 'n' | 's' | 'e' | 'w' | 'nw' | 'ne' | 'sw' | 'se';

const MIN_W = 240;
const MIN_H = 180;
const DIRS: Dir[] = ['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se'];

export default function SafariWindow({
  tabs,
}: {
  tabs: readonly ShowcaseTab[];
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<Rect | null>(null);
  const [active, setActive] = useState(0);

  const dragRef = useRef<
    | { dir: Dir; startX: number; startY: number; rect: Rect; maxW: number; maxH: number }
    | null
  >(null);

  // Drag pindah posisi window (dari title bar), clamp ke batas canvas.
  const moveRef = useRef<
    | { startX: number; startY: number; rect: Rect; maxW: number; maxH: number }
    | null
  >(null);

  // Ukuran awal: 84% x 74% dari frame canvas, rata tengah.
  // PENTING: pakai closest('.service-frame'), BUKAN parentElement —
  // Astro membungkus client component di <astro-island> yang ukurannya
  // 0×0 (inline kosong, konten absolute keluar dari alur). Jika
  // parentElement dipakai, clientWidth/host = 0 → window collapse
  // ke ukuran 0 saat pertama di-resize.
  useEffect(() => {
    const host = rootRef.current?.closest('.service-frame');
    if (!host) return;
    const pw = host.clientWidth;
    const ph = host.clientHeight;
    if (pw <= 0 || ph <= 0) return;
    const w = Math.max(MIN_W, Math.min(pw - 16, Math.round(pw * 0.84)));
    const h = Math.max(MIN_H, Math.min(ph - 16, Math.round(ph * 0.74)));
    setRect({ x: Math.round((pw - w) / 2), y: Math.round((ph - h) / 2), w, h });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clamp otomatis saat frame canvas berubah ukuran (resize browser).
  useEffect(() => {
    const host = rootRef.current?.closest('.service-frame');
    if (!host) return;
    const ro = new ResizeObserver(() => {
      const pw = host.clientWidth;
      const ph = host.clientHeight;
      if (pw <= 0 || ph <= 0) return;
      setRect((prev) => {
        if (pw <= 0 || ph <= 0) return prev;
        if (!prev) {
          // Frame baru punya ukuran (mis. section belum terlihat saat mount).
          const w = Math.max(MIN_W, Math.min(pw - 16, Math.round(pw * 0.84)));
          const h = Math.max(MIN_H, Math.min(ph - 16, Math.round(ph * 0.74)));
          return { x: Math.round((pw - w) / 2), y: Math.round((ph - h) / 2), w, h };
        }
        const w = Math.max(MIN_W, Math.min(prev.w, pw));
        const h = Math.max(MIN_H, Math.min(prev.h, ph));
        return {
          w,
          h,
          x: Math.max(0, Math.min(prev.x, Math.max(0, pw - w))),
          y: Math.max(0, Math.min(prev.y, Math.max(0, ph - h))),
        };
      });
    });
    ro.observe(host);
    return () => ro.disconnect();
  }, []);

  // Pointer drag: resize dari 8 pinggiran/sudut, pindah dari title bar.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      // --- mode pindah posisi (title bar) ---
      const m = moveRef.current;
      if (m) {
        const dx = e.clientX - m.startX;
        const dy = e.clientY - m.startY;
        // Clamp: window selalu utuh di dalam canvas.
        const maxX = Math.max(0, m.maxW - m.rect.w);
        const maxY = Math.max(0, m.maxH - m.rect.h);
        const x = Math.min(Math.max(0, m.rect.x + dx), maxX);
        const y = Math.min(Math.max(0, m.rect.y + dy), maxY);
        setRect({ x, y, w: m.rect.w, h: m.rect.h });
        return;
      }

      // --- mode resize ---
      const d = dragRef.current;
      if (!d) return;
      const dx = e.clientX - d.startX;
      const dy = e.clientY - d.startY;
      let { x, y, w, h } = d.rect;

      if (d.dir.includes('e')) w = d.rect.w + dx;
      if (d.dir.includes('s')) h = d.rect.h + dy;
      if (d.dir.includes('w')) {
        const right = d.rect.x + d.rect.w;
        w = Math.max(MIN_W, right - (d.rect.x + dx));
        x = right - w;
      }
      if (d.dir.includes('n')) {
        const bottom = d.rect.y + d.rect.h;
        h = Math.max(MIN_H, bottom - (d.rect.y + dy));
        y = bottom - h;
      }

      // Batas frame. maxW/maxH di-floor ke MIN supaya tidak pernah
      // menghasilkan lebar/tinggi 0 (penyebab window menghilang).
      const maxW = Math.max(MIN_W, d.maxW);
      const maxH = Math.max(MIN_H, d.maxH);
      x = Math.min(Math.max(0, x), maxW - MIN_W);
      y = Math.min(Math.max(0, y), maxH - MIN_H);
      w = Math.min(Math.max(w, MIN_W), maxW - x);
      h = Math.min(Math.max(h, MIN_H), maxH - y);

      setRect({ x, y, w, h });
    };

    const onUp = () => {
      if (dragRef.current) {
        dragRef.current = null;
        document.body.classList.remove('is-resizing-safari');
      }
      if (moveRef.current) {
        moveRef.current = null;
        document.body.classList.remove('is-moving-safari');
      }
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      onUp();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mulai pindah window: hanya dari title bar, bukan dari tab/dots.
  const startMove = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.safari__tab') || target.closest('.safari__dot')) return;
    const host = rootRef.current?.closest('.service-frame') as HTMLElement | null;
    if (!host || !rect) return;
    const maxW = host.clientWidth;
    const maxH = host.clientHeight;
    if (maxW <= 0 || maxH <= 0) return;
    e.preventDefault();
    moveRef.current = { startX: e.clientX, startY: e.clientY, rect, maxW, maxH };
    document.body.classList.add('is-moving-safari');
  };

  const startDrag = (e: React.PointerEvent, dir: Dir) => {
    e.preventDefault();
    e.stopPropagation();
    const host = rootRef.current?.closest('.service-frame') as HTMLElement | null;
    if (!host || !rect) return;
    const maxW = host.clientWidth;
    const maxH = host.clientHeight;
    if (maxW <= 0 || maxH <= 0) return;
    dragRef.current = {
      dir,
      startX: e.clientX,
      startY: e.clientY,
      rect,
      maxW,
      maxH,
    };
    document.body.classList.add('is-resizing-safari');
  };

  const current = tabs[active];

  return (
    <div
      ref={rootRef}
      className="safari"
      style={
        rect
          ? { left: rect.x, top: rect.y, width: rect.w, height: rect.h }
          : { visibility: 'hidden' }
      }
    >
      {/* Bar atas: traffic light + tab bar.
          Drag dari sini memindahkan window (kecuali klik di tab/dots). */}
      <div className="safari__bar" onPointerDown={startMove}>
        {/* Traffic light — SEMUA DINONAKTIFKAN, hanya affordance visual */}
        <div className="safari__dots" aria-hidden="true">
          <span
            className="safari__dot safari__dot--close"
            role="button"
            aria-disabled="true"
            tabIndex={-1}
            title="Tidak tersedia"
          />
          <span
            className="safari__dot safari__dot--min"
            role="button"
            aria-disabled="true"
            tabIndex={-1}
            title="Tidak tersedia"
          />
          <span
            className="safari__dot safari__dot--max"
            role="button"
            aria-disabled="true"
            tabIndex={-1}
            title="Tidak tersedia"
          />
        </div>

        <div className="safari__tabs" role="tablist" aria-label="Showcase website">
          {tabs.map((t, i) => (
            <button
              key={`${t.label}-${i}`}
              type="button"
              role="tab"
              aria-selected={i === active}
              className={`safari__tab${i === active ? ' is-active' : ''}`}
              onClick={() => setActive(i)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Address bar */}
      <div className="safari__address">
        <svg
          className="safari__lock"
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="4" y="11" width="16" height="10" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
        <span className="safari__url">{current.url || 'about:blank'}</span>
      </div>

      {/* Konten: iframe asli ke situs showcase */}
      <div className="safari__viewport">
        {current.url ? (
          <iframe
            key={current.url}
            className="safari__frame"
            src={current.url}
            title={`Pratinjau ${current.label}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          />
        ) : (
          <div className="safari__empty">
            <span className="safari__empty-label">Slot showcase</span>
            <p className="safari__empty-text">
              Isi <code>url</code> di <code>src/data/site.ts</code> untuk
              menampilkan website di tab ini.
            </p>
          </div>
        )}
      </div>

      {/* Handle resize — 8 pinggiran/sudut, cursor berubah per region */}
      {DIRS.map((dir) => (
        <span
          key={dir}
          className={`safari__handle safari__handle--${dir}`}
          onPointerDown={(e) => startDrag(e, dir)}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
