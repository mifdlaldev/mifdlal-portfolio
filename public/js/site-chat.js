/* ============================================================
   WIDGET CHAT — mifdlal.com

   Widget mengambang pojok kanan bawah, DI ATAS tombol .to-top.
   Tampil di semua section sejak awal — bukan hanya #kontak.

   Fitur bergaya mtadevworks.web.id:
   - Quick questions (chip collapsible)
   - Teks privasi (collapsible)
   - Textarea dengan batas 1000 karakter + counter
   - Tombol send biru kotak
   - Bubble IN (bot) / OUT (pengguna), fully rounded tanpa tail
   - Status header: "online" -> "mengetik..." saat bot merespons
   - Typing indicator 3 titik di dalam log

   Aksesibilitas (WCAG 2.2 AA):
   - Launcher tombol asli dengan aria-expanded + aria-controls
   - Panel: role="dialog" aria-modal="false"
   - Daftar pesan: role="log" aria-live="polite"
   - Esc menutup dan mengembalikan fokus ke launcher
   - prefers-reduced-motion: animasi dimatikan
   ============================================================ */
(() => {
  const root = document.querySelector('[data-site-chat]')
  if (!root) return

  const launcher = root.querySelector('.chat-launcher')
  const panel = root.querySelector('.chat-panel')
  const closeBtn = root.querySelector('.chat-close')
  const log = root.querySelector('.chat-log')
  const form = root.querySelector('.chat-form')
  const input = root.querySelector('.chat-input')
  const sendBtn = root.querySelector('.chat-send')
  const counterEl = root.querySelector('[data-counter]')
  const MAX_CHARS = 1000
  const WARN_AT = 800

  if (!launcher || !panel || !log || !form || !input) return

  /* ── Status header: online / mengetik... ──────────────── */
  const statusEl = root.querySelector('[data-chat-status]')
  const setStatus = (text, typing = false) => {
    if (!statusEl) return
    statusEl.textContent = text
    if (typing) {
      statusEl.setAttribute('data-typing', 'true')
    } else {
      statusEl.removeAttribute('data-typing')
    }
  }

  /* ── Buka / tutup ─────────────────────────────────────── */
  let lastFocused = null

  const openChat = () => {
    lastFocused = document.activeElement
    launcher.setAttribute('aria-expanded', 'true')
    panel.setAttribute('aria-hidden', 'false')
    root.dataset.open = 'true'
    input.focus({ preventScroll: true })
    document.addEventListener('keydown', onKeydown)
  }

  const closeChat = () => {
    launcher.setAttribute('aria-expanded', 'false')
    panel.setAttribute('aria-hidden', 'true')
    root.dataset.open = 'false'
    document.removeEventListener('keydown', onKeydown)
    if (lastFocused && document.contains(lastFocused)) {
      lastFocused.focus({ preventScroll: true })
    } else {
      launcher.focus({ preventScroll: true })
    }
  }

  const onKeydown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      closeChat()
    }
  }

  launcher.addEventListener('click', () => {
    if (root.dataset.open === 'true') closeChat()
    else openChat()
  })

  if (closeBtn) closeBtn.addEventListener('click', closeChat)

  /* ── Quick questions: toggle collapse ─────────────────── */
  const quickSection = root.querySelector('[data-chat-quick]')
  const quickToggle = root.querySelector('.chat-quick-toggle')

  if (quickToggle && quickSection) {
    quickToggle.addEventListener('click', () => {
      const collapsed = quickSection.dataset.collapsed === 'true'
      quickSection.dataset.collapsed = String(!collapsed)
      quickToggle.setAttribute('aria-expanded', String(collapsed))
    })
  }

  /* Klik chip -> isi textarea + kirim langsung */
  const chips = root.querySelectorAll('.chat-chip')
  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const lang = langOf()
      const prompt = (lang === 'en' ? chip.dataset.promptEn : chip.dataset.prompt) || ''
      input.value = prompt.slice(0, MAX_CHARS)
      updateCounter()
      updateSendState()
      /* Buka chat jika tertutup, lalu kirim */
      if (root.dataset.open !== 'true') openChat()
      form.requestSubmit()
    })
  })

  /* ── Privasi: toggle collapse ─────────────────────────── */
  const privacySection = root.querySelector('[data-chat-privacy]')
  const privacyToggle = root.querySelector('.chat-privacy-toggle')

  if (privacyToggle && privacySection) {
    privacyToggle.addEventListener('click', () => {
      const collapsed = privacySection.dataset.collapsed === 'true'
      privacySection.dataset.collapsed = String(!collapsed)
      privacyToggle.setAttribute('aria-expanded', String(collapsed))
    })
  }

  /* ── Counter karakter ─────────────────────────────────── */
  const updateCounter = () => {
    if (!counterEl) return
    const len = input.value.length
    counterEl.textContent = `${len} / ${MAX_CHARS} ${str('counter')}`
    counterEl.removeAttribute('data-warn')
    counterEl.removeAttribute('data-over')
    if (len >= MAX_CHARS) {
      counterEl.setAttribute('data-over', 'true')
    } else if (len >= WARN_AT) {
      counterEl.setAttribute('data-warn', 'true')
    }
  }

  const updateSendState = () => {
    if (!sendBtn) return
    sendBtn.disabled = input.value.trim().length === 0
  }

  input.addEventListener('input', () => {
    /* Potong jika melebihi batas (defense in depth, maxlength juga diset) */
    if (input.value.length > MAX_CHARS) {
      input.value = input.value.slice(0, MAX_CHARS)
    }
    updateCounter()
    updateSendState()
  })

  /* Enter = kirim pesan, Shift+Enter = baris baru. Tanpa Shift, newline
     default textarea akan mencegah pengiriman yang diharapkan. */
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
      event.preventDefault()
      form.requestSubmit()
    }
  })

  /* ── Transkrip ────────────────────────────────────────── */
  const scrollLog = () => {
    log.scrollTop = log.scrollHeight
  }

  /* role: 'in' = bot (kiri), 'out' = pengguna (kanan) */
  const addBubble = (role, text) => {
    const row = document.createElement('div')
    row.className = `chat-row chat-row--${role}`

    const bubble = document.createElement('div')
    bubble.className = `chat-bubble chat-bubble--${role}`

    const textNode = document.createTextNode(text)

    bubble.appendChild(textNode)
    row.appendChild(bubble)
    log.appendChild(row)
    scrollLog()
    return bubble
  }

  /* Indikator mengetik: 3 titik melompat, di dalam log */
  const typing = document.createElement('div')
  typing.className = 'chat-typing'
  typing.setAttribute('aria-hidden', 'true')
  typing.innerHTML = '<span></span><span></span><span></span>'

  const showTyping = () => {
    log.appendChild(typing)
    scrollLog()
    setStatus(str('typing'), true)
  }

  const hideTyping = () => {
    typing.remove()
    setStatus(str('online'), false)
  }

  /* ── Kirim pesan ──────────────────────────────────────── */
  let history = []
  let busy = false

  /* ── Bahasa aktif (sinkron dengan i18n.js) ─────────────── */
  const langOf = () => {
    try {
      const p = JSON.parse(localStorage.getItem('mifdlal-prefs') || '{}')
      return p.lang === 'en' ? 'en' : 'id'
    } catch {
      return 'id'
    }
  }
  const CHAT_STR = {
    id: {
      greeting: 'Halo! Saya asisten AI Mifdlal. Tanya soal layanan, proyek, atau stack — jawaban berdasarkan profil di situs ini.',
      error: 'Gagal mengirim. Coba lagi.',
      counter: 'Karakter',
      typing: 'mengetik...',
      online: 'online',
      errGeneric: 'Maaf, terjadi gangguan. Coba lagi sebentar.',
      errEmpty: 'Maaf, jawaban kosong. Coba tanya ulang.',
      errConn: 'Koneksi terputus. Periksa internet dan coba lagi.',
    },
    en: {
      greeting: "Hi! I'm Mifdlal's AI assistant. Ask about services, projects, or stack — answers based on the profile on this site.",
      error: 'Failed to send. Try again.',
      counter: 'Characters',
      typing: 'typing...',
      online: 'online',
      errGeneric: 'Sorry, something went wrong. Try again in a moment.',
      errEmpty: 'Sorry, the answer was empty. Try asking again.',
      errConn: 'Connection lost. Check your internet and try again.',
    },
  }
  const str = (k) => CHAT_STR[langOf()][k] || CHAT_STR.id[k]

  const greet = () => {
    /* Sapaan hanya sekali per halaman */
    if (log.childElementCount > 0) return
    addBubble('in', str('greeting'))
  }

  const sendMessage = async (text) => {
    if (busy || !text) return
    busy = true
    if (sendBtn) sendBtn.disabled = true
    input.disabled = true

    addBubble('out', text)
    history.push({ role: 'user', content: text })
    showTyping()

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: history, lang: langOf() }),
      })

      hideTyping()

      if (!res.ok || !res.body) {
        let message = str('errGeneric')
        try {
          const data = await res.json()
          if (data && data.message) message = data.message
        } catch {
          /* respons bukan JSON */
        }
        addBubble('in', message)
        setStatus(str('online'), false)
        return
      }

      /* Streaming teks: bubble bot tumbuh token demi token */
      const bubble = addBubble('in', '')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let acc = ''

      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        acc += decoder.decode(value, { stream: true })
        /* Set teks akumulasi */
        bubble.textContent = acc
        scrollLog()
      }

      if (!acc.trim()) {
        bubble.textContent = str('errEmpty')
      }
      history.push({ role: 'assistant', content: acc })
      setStatus(str('online'), false)
    } catch {
      hideTyping()
      addBubble('in', str('errConn'))
      setStatus(str('online'), false)
    } finally {
      busy = false
      if (sendBtn) sendBtn.disabled = false
      input.disabled = false
      input.focus({ preventScroll: true })
    }
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault()
    const text = input.value.trim().slice(0, MAX_CHARS)
    if (!text) return
    input.value = ''
    updateCounter()
    updateSendState()
    sendMessage(text)
  })

  /* ── Posisi launcher per section ────────────────────────
     Hero + sertifikasi: launcher menutupi tepat tombol .to-top
     (class --merged -> translateY turun 3.5rem).
     Kontak: launcher di posisi normal (translateY 0).
     Scroll listener dengan rAF throttle: maksimal 1 getBoundingClientRect
     per frame = tidak ada layout thrash. Animasi via transform
     (kompositor-only), bukan bottom. */
  const SECTION_ORDER = ['hero', 'sertifikasi', 'kontak']

  const setMerged = (id) => {
    if (id === 'kontak') root.classList.remove('site-chat--merged')
    else root.classList.add('site-chat--merged')
  }

  /* Cek sinkron sekali saat load */
  const initialCheck = () => {
    const vh = window.innerHeight
    const inBand = SECTION_ORDER.filter((id) => {
      const el = document.getElementById(id)
      if (!el) return false
      const r = el.getBoundingClientRect()
      return r.bottom > vh * 0.4 && r.top < vh * 0.6
    })
    if (inBand.length) {
      setMerged(inBand.sort((a, b) => SECTION_ORDER.indexOf(a) - SECTION_ORDER.indexOf(b))[0])
    }
  }

  let scrollTicking = false
  window.addEventListener('scroll', () => {
    if (scrollTicking) return
    scrollTicking = true
    window.requestAnimationFrame(() => {
      const vh = window.innerHeight
      /* Ambil section TERBAWAH yang masih di band tengah viewport —
         kalau dua section straddle, yang bawah menang (kontak > sertifikasi). */
      let active = null
      for (const id of SECTION_ORDER) {
        const el = document.getElementById(id)
        if (!el) continue
        const r = el.getBoundingClientRect()
        if (r.top < vh * 0.6 && r.bottom > vh * 0.4) active = id
      }
      if (active) setMerged(active)
      scrollTicking = false
    })
  }, { passive: true })

  initialCheck()

  /* ── Sapaan muncul saat launcher pertama kali dirender ── */
  greet()
})()
