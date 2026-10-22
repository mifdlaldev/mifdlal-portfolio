'use client'

// ChatbotCanvas — ilustrasi animasi layanan chatbot (fig. 04.02).
// Satu percakapan muncul di dua perangkat: phone (depan) + widget web
// (belakang), disinkronkan oleh garis putus-putus "satu basis data".
// State machine: TIMELINE fase berurutan lalu loop. Nol interaksi
// (pointer-events: none) — ini tontonan, seperti WorkflowCanvas.
import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import './chatbot-canvas.css'

/* Fase alur: bubble masuk -> typing -> jawaban di-stream -> chip ->
   highlight chip -> handoff -> mirror widget web -> jeda -> fade out -> loop */
type Phase = { id: string; ms: number }

const TIMELINE: Phase[] = [
  { id: 'q', ms: 1200 },         // pesan user muncul
  { id: 'typing', ms: 1800 },    // tiga titik mengetik
  { id: 'answer', ms: 1700 },    // jawaban di-stream + caret
  { id: 'chips', ms: 1400 },     // dua chip muncul
  { id: 'highlight', ms: 1800 }, // chip "Hubungi tim" menyala
  { id: 'handoff', ms: 2000 },   // frame disambungkan ke tim
  { id: 'mirror', ms: 2600 },    // widget web menampilkan percakapan sama
  { id: 'hold', ms: 2400 },      // tahan frame akhir
  { id: 'fade', ms: 500 },       // fade out, lalu loop
]

/* Kapan tiap fase mulai (ms), dihitung sekali dari TIMELINE. */
const AT = TIMELINE.reduce<number[]>((acc, p, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + TIMELINE[i - 1].ms)
  return acc
}, [])

const SCRIPT = {
  user: 'Kirim ke Surabaya berapa lama?',
  bot: 'Estimasi 2-3 hari kerja. Tarif Rp 15rb/kg.',
  chips: ['Cek tarif', 'Hubungi'],
  handoff: 'Disambungkan ke Rani · ~2 menit',
}

export default function ChatbotCanvas() {
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(true)
  const [chars, setChars] = useState(0)
  const timers = useRef<number[]>([])

  // Karakter jawaban muncul bertahap (efek streaming).
  useEffect(() => {
    if (step !== 2) return
    setChars(0)
    const id = window.setInterval(() => {
      setChars((c) => Math.min(c + 2, SCRIPT.bot.length))
    }, 28)
    return () => window.clearInterval(id)
  }, [step])

  // Mesin fase: maju berurutan, loop di akhir. Reduced motion -> frame akhir.
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setStep(TIMELINE.length - 2)
      setChars(SCRIPT.bot.length)
      setVisible(true)
      return
    }

    const push = (fn: () => void, at: number) => {
      timers.current.push(window.setTimeout(fn, at))
    }

    for (let i = 1; i <= 7; i += 1) {
      push(() => setStep(i), AT[i])
    }
    // Fade out, lalu reset ke fase pertama.
    push(() => setVisible(false), AT[7] + TIMELINE[7].ms)
    push(() => {
      setStep(0)
      setChars(0)
      setVisible(true)
    }, AT[7] + TIMELINE[7].ms + TIMELINE[8].ms)

    return () => {
      timers.current.forEach(clearTimeout)
      timers.current = []
    }
  }, [])

  const showUser = step >= 0
  const showTyping = step >= 1 && step < 2
  const showAnswer = step >= 2
  const showChips = step >= 3
  const showHighlight = step >= 4
  const showHandoff = step >= 5
  const showMirror = step >= 6

  return (
    <motion.div
      className="cb-canvas"
      data-step={step}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      aria-hidden="true"
    >
      {/* Widget web — belakang kiri. Skeleton saat awal, lalu terisi
          percakapan yang sama dengan phone (bukti satu basis data). */}
      <div className="cb-widget">
        <div className="cb-head">
          <span className="cb-dots">
            <span></span><span></span><span></span>
          </span>
          <span className="cb-head-label">Asisten · online</span>
        </div>
        <div className="cb-widget-body">
          {!showMirror && (
            <>
              <span className="cb-skel cb-skel--short"></span>
              <span className="cb-skel cb-skel--mid"></span>
              <span className="cb-skel cb-skel--long"></span>
            </>
          )}
          {showMirror && (
            <motion.div
              className="cb-mirror"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <span className="cb-bubble cb-bubble--out cb-mini">{SCRIPT.user}</span>
              <span className="cb-bubble cb-bubble--in cb-mini">{SCRIPT.bot}</span>
            </motion.div>
          )}
        </div>
        <div className="cb-composer">
          <span className="cb-composer-field">Tulis pesan</span>
          <span className="cb-send">↑</span>
        </div>
        {showMirror && (
          <div className="cb-sync-note">
            Lanjut di aplikasi →
          </div>
        )}
      </div>
      <div className={'cb-sync' + (showMirror ? ' is-live' : '')}>
        <span className="cb-sync-line"></span>
        <span className="cb-sync-label">satu basis data</span>
      </div>

      {/* Phone — depan kanan, mockup iPhone (proporsi 433:882) */}
      <div className="cb-phone">
        <svg className="cb-frame" viewBox="0 0 433 882" fill="none" aria-hidden="true">
          {/* Body + bezel */}
          <path d="M2 73C2 32.6832 34.6832 0 75 0H357C397.317 0 430 32.6832 430 73V809C430 849.317 397.317 882 357 882H75C34.6832 882 2 849.317 2 809V73Z" fill="var(--ink-900)" />
          {/* Tombol volume kiri */}
          <path d="M0 171C0 170.448 0.447715 170 1 170H3V204H1C0.447715 204 0 203.552 0 203V171Z" fill="var(--ink-900)" />
          <path d="M1 234C1 233.448 1.44772 233 2 233H3.5V300H2C1.44772 300 1 299.552 1 299V234Z" fill="var(--ink-900)" />
          <path d="M1 319C1 318.448 1.44772 318 2 318H3.5V385H2C1.44772 385 1 384.552 1 384V319Z" fill="var(--ink-900)" />
          {/* Tombol power kanan */}
          <path d="M430 279H432C432.552 279 433 280V384C433 384.552 432.552 385 432 385H430V279Z" fill="var(--ink-900)" />
          {/* Layar */}
          <rect x="21.25" y="19.25" width="389.5" height="843.5" rx="55.75" ry="55.75" fill="var(--paper)" />
          {/* Dynamic island — dirender via .cb-island di atas overlay layar. */}
          {/* Kamera depan */}
        </svg>

        {/* Konten di atas layar */}
        <div className="cb-screen">
          <div className="cb-statusbar">
            <span>10:24</span>
            <span className="cb-status-icons" aria-hidden="true">
              <span className="cb-bar"></span>
              <span className="cb-wifi"></span>
              <span className="cb-batt"></span>
            </span>
          </div>

          {showUser && (
            <motion.div
              className="cb-bubble cb-bubble--out"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              {SCRIPT.user}
              <span className="cb-time">10:24</span>
            </motion.div>
          )}

          {showTyping && (
            <div className="cb-typing">
              <span className="cb-dot"></span>
              <span className="cb-dot"></span>
              <span className="cb-dot"></span>
            </div>
          )}

          {showAnswer && (
            <motion.div
              className="cb-bubble cb-bubble--in"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              {SCRIPT.bot.slice(0, chars)}
              {chars < SCRIPT.bot.length && <span className="cb-caret"></span>}
              <span className="cb-time">10:24</span>
            </motion.div>
          )}

          {showChips && (
            <motion.div
              className="cb-chips"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {SCRIPT.chips.map((chip, i) => (
                <span
                  key={chip}
                  className={'cb-chip' + (showHighlight && i === 1 ? ' cb-chip--active' : '')}
                >
                  {chip}
                </span>
              ))}
            </motion.div>
          )}

          {showHandoff && (
            <motion.div
              className="cb-handoff"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <span className="cb-monogram">R</span>
              <span className="cb-handoff-text">{SCRIPT.handoff}</span>
            </motion.div>
          )}

          <span className="cb-home-indicator" aria-hidden="true"></span>
        </div>

        {/* Dynamic island di atas overlay layar (bukan di SVG, agar tidak tertutup). */}
        <span className="cb-island" aria-hidden="true">
          <span className="cb-camera"></span>
        </span>
      </div>

    </motion.div>
  )
}
