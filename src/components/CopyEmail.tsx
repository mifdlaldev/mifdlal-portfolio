"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import UseAnimations from "react-useanimations";
import copyIcon from "react-useanimations/lib/copy";

/* Tombol salin alamat email.

   Kenapa island terpisah, bukan tautan biasa: alamat di panel kontak sudah
   berupa mailto. Tombol ini jalur kedua — untuk orang yang menyalin alamat
   ke klien email lain, bukan mengirim lewat handler default.

   Empat hal yang dijaga:
   1. Tanpa JavaScript tombol tetap tampil dengan glyph statis, bukan kotak
      kosong. Player animasi baru dipasang setelah hidrasi.
   2. Animasi dipasang pada <button> itu sendiri lewat prop `render`, bukan
      pada <span> ikon di dalamnya. Kalau dipasang di span 18px, klik pada
      area padding tombol tidak memicu animasi — hanya klik tepat di ikon.
   3. Ikon hanya beranimasi saat diklik, bukan saat hover — animasi hover
      di layar sentuh menempel setelah tap.
   4. Status "Tersalin" diumumkan lewat role="status", bukan hanya warna. */

type CopyStatus = "idle" | "done" | "fail";

type CopyEmailProps = {
  email: string;
};

export default function CopyEmail({ email }: CopyEmailProps) {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const [mounted, setMounted] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  const announce = useCallback((next: Exclude<CopyStatus, "idle">) => {
    setStatus(next);
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setStatus("idle"), 2200);
  }, []);

  const copy = useCallback(async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(email);
      } else {
        /* Fallback untuk konteks tidak aman (http, WebView lama). */
        const field = document.createElement("textarea");
        field.value = email;
        field.setAttribute("readonly", "");
        field.style.position = "fixed";
        field.style.top = "0";
        field.style.opacity = "0";
        document.body.appendChild(field);
        field.select();
        const copied = document.execCommand("copy");
        document.body.removeChild(field);
        if (!copied) throw new Error("execCommand copy gagal");
      }
      announce("done");
    } catch {
      announce("fail");
    }
  }, [email, announce]);

  const label = `Salin alamat email ${email}`;

  return (
    <span className="copy-email">
      {mounted ? (
        <UseAnimations
          animation={copyIcon}
          interaction="click-replay"
          size={18}
          speed={0.65}
          render={(eventProps, animationProps) => (
            <button
              {...animationProps}
              {...eventProps}
              type="button"
              className="copy-email__btn"
              /* Ukuran tombol diatur CSS. Lebar/tinggi bawaan player (18px)
                 dibuang supaya kotak sentuh tetap 44px. */
              style={{ ...animationProps.style, width: undefined, height: undefined }}
              aria-label={label}
              aria-hidden={undefined}
              onClick={(event) => {
                void copy();
                eventProps.onClick(event);
              }}
            />
          )}
        />
      ) : (
        <button type="button" className="copy-email__btn" onClick={copy} aria-label={label}>
          <svg
            viewBox="0 0 24 24"
            width={18}
            height={18}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            <rect x="9" y="9" width="11" height="11" rx="2.5" />
            <path d="M6.5 15H5.5A1.5 1.5 0 0 1 4 13.5v-8A1.5 1.5 0 0 1 5.5 4h8A1.5 1.5 0 0 1 15 5.5v1" />
          </svg>
        </button>
      )}
      <span className="copy-email__status" role="status" aria-live="polite">
        {status === "done" ? "Tersalin" : status === "fail" ? "Salin manual" : ""}
      </span>
    </span>
  );
}
