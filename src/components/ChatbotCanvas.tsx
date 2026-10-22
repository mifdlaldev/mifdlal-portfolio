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
  const [clock, setClock] = useState('')
  const timers = useRef<number[]>([])

  // Jam status bar realtime (format 12 jam seperti iOS: 2:40 PM).
  useEffect(() => {
    const tick = () =>
      setClock(
        new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        })
      )
    tick()
    const id = window.setInterval(tick, 15000)
    return () => window.clearInterval(id)
  }, [])

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

      {/* Phone — depan kanan, mockup PNG iPhone 18 Pro Max (962x1978) */}
      <div className="cb-phone">
        <img
          className="cb-frame-img"
          src="/device-mockups/apple/apple-iphone-18-pro-max-2026device.png"
          alt=""
          width="962"
          height="1978"
          loading="eager"
          decoding="async"
          draggable="false"
        />

        {/* Konten di dalam layar PNG (area layar: 3.01%/0.76%/94.07%/98.13%) */}
        <div className="cb-screen">
          {/* Dynamic island — aset PNG, center atas, di atas konten */}
          <img
            className="cb-island-img"
            src="/device-mockups/apple/dynamic-island.png"
            alt=""
            width="840"
            height="289"
            loading="eager"
            decoding="async"
            draggable="false"
          />

          {/* Status bar: jam realtime + sinyal + wifi + baterai */}
          <div className="cb-statusbar" aria-hidden="true">
            <span className="cb-clock">{clock || '12:00 PM'}</span>
            <span className="cb-status-icons">
              {/* Sinyal 4 bar */}
              <svg className="cb-ico cb-ico-signal" viewBox="0 0 18 12" fill="currentColor">
                <rect x="0" y="8" width="3" height="4" rx="1" />
                <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
                <rect x="10" y="3" width="3" height="9" rx="1" />
                <rect x="15" y="0.5" width="3" height="11.5" rx="1" />
              </svg>
              {/* Wi-Fi */}
              <svg className="cb-ico cb-ico-wifi" viewBox="0 0 24 24" fill="currentColor">
                <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
              </svg>
              {/* Baterai */}
              <svg className="cb-ico cb-ico-batt" viewBox="0 0 25 12" fill="currentColor">
                <rect x="0.5" y="0.5" width="21" height="11" rx="3" fill="none" stroke="currentColor" strokeWidth="1" />
                <rect x="2" y="2" width="18" height="8" rx="1.5" />
                <rect x="22" y="3.5" width="2" height="5" rx="1" />
              </svg>
            </span>
          </div>

          {/* Wallpaper HP — hanya area chat, mulai di bawah status bar */}
          <span className="cb-wall" aria-hidden="true"></span>

          <div className="cb-chat">
          {showUser && (
            <motion.div
              className="cb-bubble cb-bubble--out"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              {SCRIPT.user}
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

          </div>

          <span className="cb-home-indicator" aria-hidden="true"></span>
        </div>
      </div>

    </motion.div>
  )
}
