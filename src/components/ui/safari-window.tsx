import { useEffect, useRef, useState } from 'react';
import './safari-window.css';

/* Showcase browser window — dipakai di canvas layanan 01.
 *
 * Layout mengikuti Safari macOS asli (layout tab "Separate"):
 *   baris 1 toolbar   : traffic light, sidebar, back/forward,
 *                       smart search field (kapsul), share, new tab,
 *                       tab overview
 *   baris 2 tab bar   : tab terpisah di bawah toolbar; tab aktif
 *                       berwarna kertas sehingga menonjol dari bar
 *   baris 3 viewport  : iframe situs showcase
 *
 * Perilaku (sesuai permintaan operator):
 * - Tiga tombol traffic light dirender TETAPI SEMUA dinonaktifkan
 *   (tidak ada handler, cursor not-allowed). Titik monokrom mengikuti
 *   konvensi situs, bukan merah/kuning/hijau.
 * - Ikon toolbar lain juga dinonaktifkan; hanya tab yang bisa diklik.
 * - Window TIDAK bisa di-resize. Ukuran tetap 90% x 80% frame canvas.
 * - Window BISA dipindah dengan drag di area kosong toolbar/tab bar,
 *   terbatas di dalam batas canvas (tidak bisa keluar .service-frame).
 * - Konten tab = iframe asli ke situs (bukan screenshot). Situs yang
 *   mengirim X-Frame-Options/CSP frame-ancestors akan tampil kosong —
 *   daftarkan domain yang diizinkan di public/_headers (frame-src).
 * - iframe dirender pada lebar virtual adaptif [800-1280]px dengan
 *   zoom ~70% — layout desktop tetap utuh (di atas breakpoint 720px
 *   situs), teks terbaca, bukan layout sempit yang membuat teks membesar.
 */

type ShowcaseTab = { label: string; url: string };
type Rect = { x: number; y: number; w: number; h: number };

const MIN_W = 240;
const MIN_H = 180;

/* Zoom tetap ~70%: iframe selalu dirender pada ukuran yang membuat
   teks terbaca, tanpa jatuh ke layout mobile.
   - virtualW = lebar viewport / 0.7, di-clamp [800, 1280]
   - 800 = batas bawah aman: di atas breakpoint mobile (720px) situs,
     jadi layout desktop (header horizontal, hero) tetap utuh
   - 1280 = cap; layar di atas ini tidak diperbesar lagi (hindari blur)
   - Efek: teks 16px tampil ~10-11px pada window showcase, tidak
     terlalu besar (layout tidak terpaksa sempit) dan tidak terlalu
     kecil (tidak terlihat seperti teks 6px pada virtual 1280). */
const MIN_VIRTUAL_W = 800;
const MAX_VIRTUAL_W = 1280;
const TARGET_ZOOM = 0.7;

export default function SafariWindow({
  tabs,
}: {
  tabs: readonly ShowcaseTab[];
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<Rect | null>(null);
  const [active, setActive] = useState(0);

  // Drag pindah posisi window (dari toolbar), clamp ke batas canvas.
  const moveRef = useRef<
    | { startX: number; startY: number; rect: Rect; maxW: number; maxH: number }
    | null
  >(null);

  // Ukuran awal: 90% x 80% dari frame canvas, rata tengah.
  // PENTING: pakai closest('.service-frame'), BUKAN parentElement —
  // Astro membungkus client component di <astro-island> yang ukurannya
  // 0×0 (inline kosong, konten absolute keluar dari alur). Jika
  // parentElement dipakai, clientWidth host = 0 → window collapse.
  useEffect(() => {
    const host = rootRef.current?.closest('.service-frame');
    if (!host) return;
    const pw = host.clientWidth;
    const ph = host.clientHeight;
    if (pw <= 0 || ph <= 0) return;
    const w = Math.max(MIN_W, Math.min(pw - 16, Math.round(pw * 0.9)));
    const h = Math.max(MIN_H, Math.min(ph - 16, Math.round(ph * 0.8)));
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
        if (!prev) {
          // Frame baru punya ukuran (mis. section belum terlihat saat mount).
          const w = Math.max(MIN_W, Math.min(pw - 16, Math.round(pw * 0.9)));
          const h = Math.max(MIN_H, Math.min(ph - 16, Math.round(ph * 0.8)));
          return {
            x: Math.round((pw - w) / 2),
            y: Math.round((ph - h) / 2),
            w,
            h,
          };
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

  // Ukuran viewport untuk menghitung skala render iframe.
  const viewportRef = useRef<HTMLDivElement>(null);
  const [vp, setVp] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() =>
      setVp({ w: el.clientWidth, h: el.clientHeight }),
    );
    ro.observe(el);
    setVp({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  // Lebar virtual adaptif: jaga zoom ~70%, clamp [800, 1280].
  const virtualW =
    vp.w > 0
      ? Math.round(
          Math.min(MAX_VIRTUAL_W, Math.max(MIN_VIRTUAL_W, vp.w / TARGET_ZOOM)),
        )
      : MAX_VIRTUAL_W;
  const scale = vp.w > 0 ? vp.w / virtualW : 1;
  // Tinggi virtual: tinggi viewport dibagi skala -> iframe memenuhi area
  // konten, sama seperti mengubah tinggi window browser laptop.
  const virtualH = scale > 0 ? Math.round(vp.h / scale) : 0;

  // Pointer drag: pindahkan window dari toolbar (tanpa resize).
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const m = moveRef.current;
      if (!m) return;
      const dx = e.clientX - m.startX;
      const dy = e.clientY - m.startY;
      // Clamp: window selalu utuh di dalam canvas.
      const maxX = Math.max(0, m.maxW - m.rect.w);
      const maxY = Math.max(0, m.maxH - m.rect.h);
      const x = Math.min(Math.max(0, m.rect.x + dx), maxX);
      const y = Math.min(Math.max(0, m.rect.y + dy), maxY);
      setRect({ x, y, w: m.rect.w, h: m.rect.h });
    };

    const onUp = () => {
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

  // Mulai pindah window: dari area kosong toolbar/tab bar.
  const startMove = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('.safari__dot')) return;
    const host = rootRef.current?.closest('.service-frame') as HTMLElement | null;
    if (!host || !rect) return;
    const maxW = host.clientWidth;
    const maxH = host.clientHeight;
    if (maxW <= 0 || maxH <= 0) return;
    e.preventDefault();
    moveRef.current = { startX: e.clientX, startY: e.clientY, rect, maxW, maxH };
    document.body.classList.add('is-moving-safari');
  };

  const current = tabs[active];

  // Safari menampilkan domain di smart search field, bukan URL penuh.
  let displayUrl = 'about:blank';
  if (current.url) {
    try {
      displayUrl = new URL(current.url).host.replace(/^www\./, '');
    } catch {
      displayUrl = current.url;
    }
  }

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
      {/* Baris 1 — toolbar Safari macOS */}
      <div className="safari__toolbar" onPointerDown={startMove}>
        <div className="safari__traffic" aria-hidden="true">
          <span className="safari__dot safari__dot--close" />
          <span className="safari__dot safari__dot--min" />
          <span className="safari__dot safari__dot--max" />
        </div>

        <div className="safari__tools">
          {/* Sidebar */}
          <button
            type="button"
            className="safari__icon"
            aria-disabled="true"
            tabIndex={-1}
            title="Tidak tersedia"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="4" width="18" height="16" rx="2.5" />
              <path d="M9 4v16" />
            </svg>
          </button>
          {/* Back */}
          <button
            type="button"
            className="safari__icon"
            aria-disabled="true"
            tabIndex={-1}
            title="Tidak tersedia"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          {/* Forward — redup: tidak ada riwayat */}
          <button
            type="button"
            className="safari__icon is-muted"
            aria-disabled="true"
            tabIndex={-1}
            title="Tidak tersedia"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Smart search field */}
        <div className="safari__address">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="4" y="11" width="16" height="10" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
          <span className="safari__url">{displayUrl}</span>
          <svg className="safari__reload" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20 12a8 8 0 1 1-2.3-5.7" />
            <path d="M20 4v5h-5" />
          </svg>
        </div>

        <div className="safari__tools safari__tools--end">
          {/* Share */}
          <button
            type="button"
            className="safari__icon"
            aria-disabled="true"
            tabIndex={-1}
            title="Tidak tersedia"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 15V4" />
              <path d="M8 8l4-4 4 4" />
              <path d="M5 14v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5" />
            </svg>
          </button>
          {/* New tab */}
          <button
            type="button"
            className="safari__icon"
            aria-disabled="true"
            tabIndex={-1}
            title="Tidak tersedia"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
          </button>
          {/* Tab overview */}
          <button
            type="button"
            className="safari__icon"
            aria-disabled="true"
            tabIndex={-1}
            title="Tidak tersedia"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="4" y="4" width="7" height="7" rx="1.5" />
              <rect x="13" y="4" width="7" height="7" rx="1.5" />
              <rect x="4" y="13" width="7" height="7" rx="1.5" />
              <rect x="13" y="13" width="7" height="7" rx="1.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Baris 2 — tab bar terpisah (layout Separate Safari macOS) */}
      <div
        className="safari__tabbar"
        role="tablist"
        aria-label="Showcase website"
        onPointerDown={startMove}
      >
        {tabs.map((t, i) => (
          <button
            key={`${t.label}-${i}`}
            type="button"
            role="tab"
            aria-selected={i === active}
            className={`safari__tab${i === active ? ' is-active' : ''}`}
            onClick={() => setActive(i)}
          >
            <span className="safari__favicon" aria-hidden="true" />
            <span className="safari__tab-label">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Baris 3 — konten: iframe asli ke situs showcase, dirender pada
          lebar laptop (1280px) lalu diskalakan agar muat window. */}
      <div className="safari__viewport" ref={viewportRef}>
        {current.url ? (
          <div className="safari__stage">
            <iframe
              key={current.url}
              className="safari__frame"
              src={current.url}
              title={`Pratinjau ${current.label}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
              style={{
                width: `${virtualW}px`,
                height: `${virtualH}px`,
                transform: `scale(${scale})`,
              }}
            />
          </div>
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
    </div>
  );
}
