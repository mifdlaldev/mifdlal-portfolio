"use client";

import { useEffect, useRef, useState } from "react";

/* EncryptedText: adaptasi Aceternity UI (ui.aceternity.com/components/encrypted-text).
   Versi ini tanpa dependency `motion`. Tiga penyesuaian:

   1. SSR-safe: state awal = teks penuh, jadi HTML pertama (dan kondisi tanpa
      JavaScript) berisi teks asli. Animasi baru jalan setelah hidrasi.
   2. Tanpa reflow: tiap baris punya ghost tak terlihat yang mengunci lebar,
      lalu karakter teracak digambar absolut di atasnya. Kotak teks tidak
      bergerak, hanya bentuk glyph yang berubah.
   3. Menghormati prefers-reduced-motion: teks langsung tampil utuh. */

type EncryptedTextProps = {
  /** Satu entri = satu baris. Baris dipisah eksplisit supaya tidak ada reflow. */
  lines: readonly string[];
  /** Jeda per karakter yang dibuka (ms). Kecil = cepat. */
  revealDelayMs?: number;
  /** Jeda per giliran acak karakter yang belum terbuka (ms). */
  flipDelayMs?: number;
  charset?: string;
  className?: string;
  encryptedClassName?: string;
  revealedClassName?: string;
};

const DEFAULT_CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&*+-=/<>[]{}";

function randomChar(charset: string): string {
  return charset.charAt(Math.floor(Math.random() * charset.length));
}

export default function EncryptedText({
  lines,
  revealDelayMs = 36,
  flipDelayMs = 48,
  charset = DEFAULT_CHARSET,
  className,
  encryptedClassName = "enc-scrambled",
  revealedClassName,
}: EncryptedTextProps) {
  const full = lines.join(" ");

  /* Indeks awal tiap baris di dalam `full`, supaya hitungan reveal konsisten
     walau tiap baris dirender terpisah. */
  const offsets: number[] = [];
  let cursor = 0;
  for (const line of lines) {
    offsets.push(cursor);
    cursor += line.length + 1;
  }

  const [revealCount, setRevealCount] = useState<number>(full.length);
  const [scramble, setScramble] = useState<string[]>(() => full.split(""));
  /* idle = belum mulai (atau reduced motion), running = sedang membuka,
     done = teks penuh. Dipakai untuk pengujian dan styling. */
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const rootRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let cancelled = false;
    let start = 0;
    let lastFlip = 0;

    const seed = full
      .split("")
      .map((char) => (char === " " ? " " : randomChar(charset)));

    const tick = (now: number) => {
      if (cancelled) return;
      if (!start) {
        start = now;
        lastFlip = now;
      }
      /* Reveal berbasis waktu, bukan per frame: kalau rAF di-throttle
         (tab background, GPU lambat), teks tetap selesai sesuai durasi
         yang sama, tidak menggantung. */
      const wanted = Math.min(
        full.length,
        Math.floor((now - start) / Math.max(1, revealDelayMs)),
      );
      setRevealCount(wanted);
      if (wanted >= full.length) {
        setPhase("done");
        return;
      }

      if (now - lastFlip >= Math.max(0, flipDelayMs)) {
        for (let i = 0; i < full.length; i += 1) {
          if (i >= wanted && full[i] !== " ") seed[i] = randomChar(charset);
        }
        lastFlip = now;
        setScramble(seed.slice());
      }
      raf = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        setScramble(seed.slice());
        setRevealCount(0);
        setPhase("running");
        start = 0;
        lastFlip = 0;
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.35 },
    );

    observer.observe(el);

    /* Jaring pengaman: kalau rAF berhenti (tab disembunyikan, driver GPU
       macet), teks tetap dibuka penuh setelah durasi nominal. */
    const failSafe = window.setTimeout(
      () => {
        setRevealCount(full.length);
        setPhase("done");
      },
      full.length * Math.max(1, revealDelayMs) + 600,
    );

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(failSafe);
      observer.disconnect();
    };
  }, [full, charset, revealDelayMs, flipDelayMs]);

  if (!full) return null;

  return (
    /* Nama aksesibel dipasang di elemen induk (h1) lewat aria-label, bukan di
       span ini: span generik tidak punya role sehingga aria-label diabaikan.
       Semua isi visual di bawah ini aria-hidden. */
    <span ref={rootRef} className={className} data-state={phase}>
      {lines.map((line, lineIndex) => {
        const offset = offsets[lineIndex];
        return (
          <span className="enc-line" key={line}>
            {/* Ghost: mengunci lebar baris, tidak terlihat mata. */}
            <span className="enc-ghost" aria-hidden="true">
              {line}
            </span>
            <span className="enc-live" aria-hidden="true">
              {line.split("").map((char, index) => {
                const globalIndex = offset + index;
                const revealed = globalIndex < revealCount;
                const display =
                  revealed || char === " "
                    ? char
                    : (scramble[globalIndex] ?? randomChar(charset));
                return (
                  <span
                    key={index}
                    className={revealed ? revealedClassName : encryptedClassName}
                  >
                    {display}
                  </span>
                );
              })}
            </span>
          </span>
        );
      })}
    </span>
  );
}
