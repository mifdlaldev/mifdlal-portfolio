'use client'

// ChatbotCanvas — ilustrasi animasi layanan chatbot (fig. 04.02).
// Satu percakapan muncul di dua perangkat: phone (depan) + widget web
// (belakang), disinkronkan oleh garis putus-putus "satu basis data".
// State machine: 6 topik percakapan agensi diputar bergiliran, tiap topik
// 6 pesan; area chat scrollable + auto-scroll ke pesan terbaru.
import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { HugeiconsIcon } from '@hugeicons/react'
import { ChatBotIcon, UserIcon } from '@hugeicons/core-free-icons'
import './chatbot-canvas.css'

type Msg = { from: 'user' | 'bot'; text: string; en: string }
type Topic = {
  id: string
  label: string
  msgs: Msg[]
  chips: [string, string]
  chipsEn: [string, string]
  handoff: string
  handoffEn: string
}

/* Enam topik nyata dari percakapan agensi web di Indonesia:
   budget & timeline, kepemilikan domain/akses, revisi & garansi,
   SEO, maintenance bulanan, serah terima. Version EN disediakan
   untuk mode bahasa Inggris (mockup tetap ikut bahasa aktif). */
const TOPICS: Topic[] = [
  {
    id: 'budget',
    label: 'Paket & timeline',
    msgs: [
      {
        from: 'user',
        text: 'Bikin toko online, budgetnya berapa?',
        en: 'Build an online store, what budget?',
      },
      {
        from: 'bot',
        text: 'Starter Rp 3,5jt (2 minggu). Grow Rp 8jt + SEO (4 minggu).',
        en: 'Starter IDR 3.5m (2 weeks). Grow IDR 8m + SEO (4 weeks).',
      },
      { from: 'user', text: 'Domain & hosting termasuk?', en: 'Domain & hosting included?' },
      {
        from: 'bot',
        text: 'Termasuk 1 tahun. Perpanjangan Rp 900rb/tahun.',
        en: 'Included for 1 year. Renewal IDR 900k/year.',
      },
      { from: 'user', text: 'Revisi berapa putaran?', en: 'How many revision rounds?' },
      {
        from: 'bot',
        text: '3 putaran per halaman, lebihnya dihitung per jam.',
        en: '3 rounds per page, extra billed hourly.',
      },
    ],
    chips: ['Lihat paket', 'Konsultasi'],
    chipsEn: ['View packages', 'Consult'],
    handoff: 'Dialihkan ke kontak konsultan',
    handoffEn: 'Routed to consultant contact',
  },
  {
    id: 'domain',
    label: 'Domain & akses',
    msgs: [
      { from: 'user', text: 'Domain-nya atas nama siapa?', en: 'Whose name is the domain under?' },
      {
        from: 'bot',
        text: 'Atas nama Anda. Saya hanya diberi akses DNS.',
        en: "Under your name. I'm only given DNS access.",
      },
      { from: 'user', text: 'Kalau pindah vendor, bisa?', en: 'Can I move to another vendor?' },
      {
        from: 'bot',
        text: 'Bisa. Auth code & akses admin diserahkan saat launch.',
        en: 'Yes. Auth code & admin access handed over at launch.',
      },
      { from: 'user', text: 'Saya dapat admin panel penuh?', en: 'Do I get the full admin panel?' },
      {
        from: 'bot',
        text: 'Ya, role administrator + training 30 menit.',
        en: 'Yes, administrator role + 30-minute training.',
      },
    ],
    chips: ['Lihat akses', 'Tanya tim'],
    chipsEn: ['View access', 'Ask team'],
    handoff: 'Dialihkan ke kontak konsultan',
    handoffEn: 'Routed to consultant contact',
  },
  {
    id: 'revisi',
    label: 'Revisi & garansi',
    msgs: [
      {
        from: 'user',
        text: 'Garansi setelah live berapa lama?',
        en: 'How long is the warranty after launch?',
      },
      {
        from: 'bot',
        text: '30 hari untuk bug, gratis. Lewat itu kontrak support.',
        en: '30 days for bugs, free. Beyond that, a support contract.',
      },
      { from: 'user', text: 'Revisi desain termasuk?', en: 'Are design revisions included?' },
      {
        from: 'bot',
        text: '2 putaran desain + 3 putaran konten per halaman.',
        en: '2 design rounds + 3 content rounds per page.',
      },
      { from: 'user', text: 'Kalau minta ubah total?', en: 'What if I want a total change?' },
      {
        from: 'bot',
        text: 'Masuk change order, estimasi dulu sebelum kerja.',
        en: 'It becomes a change order, estimated before work.',
      },
    ],
    chips: ['Lihat garansi', 'Konsultasi'],
    chipsEn: ['View warranty', 'Consult'],
    handoff: 'Dialihkan ke kontak konsultan',
    handoffEn: 'Routed to consultant contact',
  },
  {
    id: 'seo',
    label: 'SEO & hasil',
    msgs: [
      { from: 'user', text: 'SEO-nya beneran jalan?', en: 'Does the SEO actually work?' },
      {
        from: 'bot',
        text: 'Meta, H1, schema, sitemap, Search Console saat launch.',
        en: 'Meta, H1, schema, sitemap, Search Console at launch.',
      },
      { from: 'user', text: 'Berapa lama naik peringkat?', en: 'How long to rank up?' },
      {
        from: 'bot',
        text: 'Realistis 3-6 bulan. Tanpa janji halaman 1.',
        en: 'Realistically 3-6 months. No page 1 promises.',
      },
      { from: 'user', text: 'Ada laporan bulanan?', en: 'Is there a monthly report?' },
      {
        from: 'bot',
        text: 'Ya, ringkasan trafik + kata kunci tiap awal bulan.',
        en: 'Yes, a traffic + keyword summary at the start of each month.',
      },
    ],
    chips: ['Lihat rincian', 'Konsultasi'],
    chipsEn: ['View details', 'Consult'],
    handoff: 'Dialihkan ke kontak konsultan',
    handoffEn: 'Routed to consultant contact',
  },
  {
    id: 'maintenance',
    label: 'Maintenance',
    msgs: [
      { from: 'user', text: 'Ada biaya bulanan?', en: 'Is there a monthly fee?' },
      {
        from: 'bot',
        text: 'Maintenance Rp 450rb/bulan: update, backup, monitoring.',
        en: 'Maintenance IDR 450k/month: updates, backup, monitoring.',
      },
      { from: 'user', text: 'Kalau website error?', en: 'What if the website errors?' },
      {
        from: 'bot',
        text: 'Respons 1x24 jam kerja, prioritas kalau down.',
        en: 'Response within 24 business hours, priority if down.',
      },
      { from: 'user', text: 'Bisa upgrade paket nanti?', en: 'Can I upgrade the package later?' },
      {
        from: 'bot',
        text: 'Bisa, fitur tambahan dihitung dari scope baru.',
        en: 'Yes, extra features are billed from the new scope.',
      },
    ],
    chips: ['Lihat paket', 'Konsultasi'],
    chipsEn: ['View packages', 'Consult'],
    handoff: 'Dialihkan ke kontak konsultan',
    handoffEn: 'Routed to consultant contact',
  },
  {
    id: 'handover',
    label: 'Serah terima',
    msgs: [
      { from: 'user', text: 'Pembayarannya bagaimana?', en: 'How is payment handled?' },
      {
        from: 'bot',
        text: 'DP 50% saat kontrak, 50% setelah approve sebelum launch.',
        en: '50% down payment at contract, 50% after approval before launch.',
      },
      { from: 'user', text: 'Apa saja yang diserahkan?', en: 'What gets handed over?' },
      {
        from: 'bot',
        text: 'Kode, hosting, domain, analytics, manual CMS.',
        en: 'Code, hosting, domain, analytics, CMS manual.',
      },
      { from: 'user', text: 'Berapa lama prosesnya?', en: 'How long does the process take?' },
      {
        from: 'bot',
        text: 'Serah terima 3 hari kerja setelah peluncuran.',
        en: 'Handover 3 business days after launch.',
      },
    ],
    chips: ['Lihat alur', 'Konsultasi'],
    chipsEn: ['View flow', 'Consult'],
    handoff: 'Dialihkan ke kontak konsultan',
    handoffEn: 'Routed to consultant contact',
  },
]

const TYPING_MS = 900
const MSG_GAP = 650

type Setters = {
  setShown: (n: number) => void
  setTyping: (b: boolean) => void
  setPhase: (p: number) => void
}
type Event = { at: number; run: (s: Setters) => void }

/* Jadwal satu topik: tiap pesan muncul bergiliran, pesan bot didahului
   indikator mengetik. Setelah 6 pesan -> chips (3), highlight (4),
   handoff (5), mirror widget (6), tahan (7), lalu ganti topik. */
function buildSchedule(topic: Topic): { events: Event[]; total: number } {
  const events: Event[] = []
  let t = 350

  topic.msgs.forEach((m, i) => {
    if (m.from === 'bot') {
      events.push({ at: t, run: (s) => s.setTyping(true) })
      t += TYPING_MS
      events.push({
        at: t,
        run: (s) => {
          s.setTyping(false)
          s.setShown(i + 1)
        },
      })
      t += MSG_GAP
    } else {
      events.push({ at: t, run: (s) => s.setShown(i + 1) })
      t += MSG_GAP
    }
  })

  events.push({ at: t, run: (s) => s.setPhase(3) })
  t += 1300
  events.push({ at: t, run: (s) => s.setPhase(4) })
  t += 1500
  events.push({ at: t, run: (s) => s.setPhase(5) })
  t += 1700
  events.push({ at: t, run: (s) => s.setPhase(6) })
  t += 2100
  events.push({ at: t, run: (s) => s.setPhase(7) })
  t += 2400

  return { events, total: t }
}

export default function ChatbotCanvas() {
  const [cycle, setCycle] = useState(0)
  const [shown, setShown] = useState(0)
  const [typing, setTyping] = useState(false)
  const [phase, setPhase] = useState(0)
  const [visible, setVisible] = useState(true)
  const [clock, setClock] = useState('')
  const timers = useRef<number[]>([])
  const chatRef = useRef<HTMLDivElement | null>(null)

  /* Bahasa runtime — React island: patch DOM i18n.js terhapus saat render
     ulang, jadi simpan lang sebagai state native + dengar mifdlal:lang. */
  const [lang, setLang] = useState<'id' | 'en'>('en')
  useEffect(() => {
    const read = () => {
      /* Default Inggris; tanpa preferensi tersimpan ikuti <html lang>. */
      let v: 'id' | 'en' = document.documentElement.lang === 'en' ? 'en' : 'id'
      try {
        const p = JSON.parse(localStorage.getItem('mifdlal-prefs') || '{}')
        if (p && (p.lang === 'id' || p.lang === 'en')) v = p.lang
      } catch {
        /* biarkan default */
      }
      setLang(v)
    }
    read()
    const onLang = (e: globalThis.Event) => {
      const v = (e as unknown as CustomEvent).detail
      if (v === 'en' || v === 'id') setLang(v)
    }
    document.addEventListener('mifdlal:lang', onLang)
    return () => document.removeEventListener('mifdlal:lang', onLang)
  }, [])
  const T = (id: string, en: string) => (lang === 'en' ? en : id)

  const topicIndex = cycle % TOPICS.length
  const topic = TOPICS[topicIndex]

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

  // Auto-scroll ke pesan terbaru setiap ada perubahan isi chat.
  useEffect(() => {
    const el = chatRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [shown, typing, phase])

  // Mesin fase: satu siklus = satu topik penuh. Selesai -> `cycle`
  // bertambah (topik berikutnya), semua timer dijadwalkan dari nol.
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const current = TOPICS[cycle % TOPICS.length]

    if (reduce) {
      setShown(current.msgs.length)
      setTyping(false)
      setPhase(7)
      setVisible(true)
      return
    }

    setShown(0)
    setTyping(false)
    setPhase(0)
    setVisible(true)

    const { events, total } = buildSchedule(current)
    const push = (fn: () => void, at: number) => {
      timers.current.push(window.setTimeout(fn, at))
    }

    const setters: Setters = {
      setShown: (n) => setShown(n),
      setTyping: (b) => setTyping(b),
      setPhase: (p) => setPhase(p),
    }

    events.forEach((ev) => push(() => ev.run(setters), ev.at))

    // Fade out lalu topik berikutnya.
    push(() => setVisible(false), total)
    push(() => setCycle((c) => c + 1), total + 450)

    return () => {
      timers.current.forEach(clearTimeout)
      timers.current = []
    }
  }, [cycle])

  const showChips = phase >= 3
  const showHighlight = phase >= 4
  const showHandoff = phase >= 5

  return (
    <motion.div
      className="cb-canvas"
      data-step={phase}
      data-topic={topic.id}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      aria-hidden="true"
    >
      {/* Browser statis (tanpa iframe): hero sederhana + widget chat
          di pojok kanan bawah viewport. */}
      <div className="cb-browser" aria-hidden="true">
        <div className="cb-br-bar">
          <span className="cb-br-dots">
            <span></span>
            <span></span>
            <span></span>
          </span>
          <span className="cb-br-url">mifdlal.com</span>
        </div>
        <div className="cb-br-view">
          {/* Navbar mockup */}
          <div className="cb-br-nav">
            <span className="cb-br-brand">
              <span className="cb-br-logo">M</span>
              <span className="cb-br-word">mifdlal</span>
            </span>
            <span className="cb-br-links">
              <span>{T('Layanan', 'Services')}</span>
              <span>{T('Proyek', 'Projects')}</span>
              <span>{T('Kontak', 'Contact')}</span>
            </span>
            <span className="cb-br-navcta">{T('Mulai proyek', 'Start a project')}</span>
          </div>

          {/* Hero */}
          <div className="cb-br-hero">
            <span className="cb-br-kicker">
              {T('Studio web + otomatisasi AI', 'Web studio + AI automation')}
            </span>
            <span className="cb-br-h1">
              {lang === 'en' ? (
                <>
                  Websites that <span className="cb-br-mark">work</span>, not just look.
                </>
              ) : (
                <>
                  Website yang <span className="cb-br-mark">bekerja</span>, bukan cuma tampil.
                </>
              )}
            </span>
            <span className="cb-br-sub">
              {T(
                'Asisten menjawab pelanggan 24 jam, tanpa Anda ribut.',
                'Assistants answer customers 24/7, without the hassle.'
              )}
            </span>
            <span className="cb-br-actions">
              <span className="cb-br-cta">{T('Mulai proyek', 'Start a project')}</span>
              <span className="cb-br-ghost">
                <svg
                  className="cb-br-play"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M8 5.14v13.72c0 .8.87 1.3 1.55.97l11-6.86a.99.99 0 0 0 0-1.94l-11-6.86A.99.99 0 0 0 8 5.14Z" />
                </svg>
                {T('Lihat preview', 'View preview')}
              </span>
            </span>
            <span className="cb-br-trust">
              {T('Konsultasi 30 menit · tanpa DP', '30-minute consultation · no deposit')}
            </span>
          </div>

          {/* Widget chat — pojok kanan bawah viewport browser */}
          <div className="cb-widget">
            <div className="cb-head">
              <span className="cb-head-avatar">
                <HugeiconsIcon icon={ChatBotIcon} />
              </span>
              <span className="cb-head-label">Chatbot AI</span>
            </div>
            <div className="cb-widget-body">
              <div className="cb-mirror">
                {topic.msgs.slice(0, shown).map((m, i) => (
                  <motion.div
                    key={`${topic.id}-${i}`}
                    className={
                      'cb-bubble cb-mini ' +
                      (m.from === 'user' ? 'cb-bubble--out' : 'cb-bubble--in')
                    }
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                  >
                    {lang === 'en' ? m.en : m.text}
                  </motion.div>
                ))}
                {typing && (
                  <div className="cb-typing cb-typing--mini" aria-hidden="true">
                    <span className="cb-dot"></span>
                    <span className="cb-dot"></span>
                    <span className="cb-dot"></span>
                  </div>
                )}
              </div>
            </div>
            <div className="cb-composer">
              <span className="cb-composer-field">{T('Tulis pesan', 'Type a message')}</span>
              <span className="cb-send">↑</span>
            </div>
          </div>
        </div>
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
                <rect
                  x="0.5"
                  y="0.5"
                  width="21"
                  height="11"
                  rx="3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                />
                <rect x="2" y="2" width="18" height="8" rx="1.5" />
                <rect x="22" y="3.5" width="2" height="5" rx="1" />
              </svg>
            </span>
          </div>

          {/* Header kontak ala WhatsApp: avatar ikon bot + nama centered,
              background putih, tepat di bawah status bar */}
          <div className="cb-contact" aria-hidden="true">
            <span className="cb-contact-avatar">
              <HugeiconsIcon icon={ChatBotIcon} />
            </span>
            <span className="cb-contact-name">Chatbot AI</span>
          </div>

          {/* Wallpaper HP — hanya area chat, mulai di bawah header */}
          <span className="cb-wall" aria-hidden="true"></span>

          {/* Area chat: scrollable, auto-scroll ke pesan terbaru */}
          <div className="cb-chat" ref={chatRef}>
            {topic.msgs.slice(0, shown).map((m, i) => (
              <motion.div
                key={topic.id + '-' + i}
                className={'cb-bubble ' + (m.from === 'user' ? 'cb-bubble--out' : 'cb-bubble--in')}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                {lang === 'en' ? m.en : m.text}
              </motion.div>
            ))}

            {typing && (
              <div className="cb-typing">
                <span className="cb-dot"></span>
                <span className="cb-dot"></span>
                <span className="cb-dot"></span>
              </div>
            )}

            {showChips && (
              <motion.div
                className="cb-chips"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {topic.chips.map((chip, i) => (
                  <span
                    key={chip}
                    className={'cb-chip' + (showHighlight && i === 1 ? ' cb-chip--active' : '')}
                  >
                    {lang === 'en' ? topic.chipsEn[i] : chip}
                  </span>
                ))}
              </motion.div>
            )}
          </div>

          {/* Kolom mengetik + tombol kirim ala WhatsApp */}
          <div className="cb-msgbar">
            <span className="cb-msgbar-field">{T('Tulis pesan', 'Type a message')}</span>
            <span className="cb-msgbar-send">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 19V6" />
                <path d="M6 12l6-6 6 6" />
              </svg>
            </span>
          </div>

          {showHandoff && (
            <motion.div
              className="cb-handoff"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <span className="cb-handoff-avatar">
                <HugeiconsIcon icon={UserIcon} />
              </span>
              <span className="cb-handoff-text">
                {lang === 'en' ? topic.handoffEn : topic.handoff}
              </span>
            </motion.div>
          )}

          <span className="cb-home-indicator" aria-hidden="true"></span>
        </div>
      </div>
    </motion.div>
  )
}
