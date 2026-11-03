/* ============================================================
   WIDGET CHAT — mifdlal.com

   Widget mengambang pojok kanan bawah, DI ATAS tombol .to-top.
   Tampil di semua section sejak awal — bukan hanya #kontak.

   Aksesibilitas (WCAG 2.2 AA):
   - Launcher tombol asli dengan aria-expanded + aria-controls
   - Panel: role="dialog" aria-modal="false" (bukan modal —
     halaman tetap bisa digulir/dibaca saat chat terbuka)
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
  const statusEl = root.querySelector('.chat-status')

  if (!launcher || !panel || !log || !form || !input) return

  const sendBtn = form.querySelector('.chat-send')

  /* Status aksesibel (untuk aria-live status region) */
  const setStatus = (text) => {
    if (statusEl) statusEl.textContent = text
  }

  /* ── Buka / tutup ─────────────────────────────────────── */
  let lastFocused = null

  const openChat = () => {
    lastFocused = document.activeElement
    launcher.setAttribute('aria-expanded', 'true')
    panel.setAttribute('aria-hidden', 'false')
    root.dataset.open = 'true'
    /* Fokus masuk ke input — biarkan keyboard user langsung mengetik */
    input.focus({ preventScroll: true })
    document.addEventListener('keydown', onKeydown)
  }

  const closeChat = () => {
    launcher.setAttribute('aria-expanded', 'false')
    panel.setAttribute('aria-hidden', 'true')
    root.dataset.open = 'false'
    document.removeEventListener('keydown', onKeydown)
    /* Fokus kembali ke pemanggil, bukan hilang ke <body> */
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
      return
    }
    /* Tab tidak perlu ditahan: panel bukan modal, halaman tetap
       dijangkau. Hanya menjaga supaya klik di luar tidak menutup
       karena kehilangan fokus paksa. */
  }

  launcher.addEventListener('click', () => {
    if (root.dataset.open === 'true') closeChat()
    else openChat()
  })

  if (closeBtn) closeBtn.addEventListener('click', closeChat)

  /* ── Transkrip ────────────────────────────────────────── */
  const scrollLog = () => {
    log.scrollTop = log.scrollHeight
  }

  const addBubble = (role, text) => {
    const bubble = document.createElement('div')
    bubble.className = `chat-bubble chat-bubble--${role}`
    bubble.textContent = text
    log.appendChild(bubble)
    scrollLog()
    return bubble
  }

  /* Indikator mengetik: 3 titik, di luar log (aria-hidden) supaya
     tidak mengganggu live region tiap frame animasi. */
  const typing = document.createElement('div')
  typing.className = 'chat-typing'
  typing.setAttribute('aria-hidden', 'true')
  typing.innerHTML = '<span></span><span></span><span></span>'

  const showTyping = () => {
    log.appendChild(typing)
    scrollLog()
  }

  const hideTyping = () => {
    typing.remove()
  }

  /* ── Kirim pesan ──────────────────────────────────────── */
  let history = []
  let busy = false

  const greet = () => {
    /* Sapaan hanya sekali per halaman, ditambahkan sebelum dibuka */
    if (log.childElementCount > 0) return
    addBubble(
      'bot',
      'Halo! Saya asisten AI Mifdlal. Tanya soal layanan, proyek, atau stack — jawaban berdasarkan profil di situs ini.',
    )
  }

  const sendMessage = async (text) => {
    if (busy || !text) return
    busy = true
    if (sendBtn) sendBtn.disabled = true
    input.disabled = true

    addBubble('user', text)
    history.push({ role: 'user', content: text })
    showTyping()
    setStatus('Asisten sedang menulis...')

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      })

      hideTyping()

      if (!res.ok || !res.body) {
        let message = 'Maaf, terjadi gangguan. Coba lagi sebentar.'
        try {
          const data = await res.json()
          if (data && data.message) message = data.message
        } catch {
          /* respons bukan JSON */
        }
        addBubble('bot', message)
        setStatus('Gagal mengirim. Coba lagi.')
        return
      }

      /* Streaming teks pola: tanggap bubblenya tumbuh token demi token */
      const bubble = addBubble('bot', '')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let acc = ''

      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        acc += decoder.decode(value, { stream: true })
        bubble.textContent = acc
        scrollLog()
      }

      if (!acc.trim()) {
        bubble.textContent = 'Maaf, jawaban kosong. Coba tanya ulang.'
      }
      history.push({ role: 'assistant', content: acc })
      setStatus('')
    } catch {
      hideTyping()
      addBubble('bot', 'Koneksi terputus. Periksa internet dan coba lagi.')
      setStatus('Koneksi gagal.')
    } finally {
      busy = false
      if (sendBtn) sendBtn.disabled = false
      input.disabled = false
      input.focus({ preventScroll: true })
    }
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault()
    const text = input.value.trim().slice(0, 2000)
    if (!text) return
    input.value = ''
    sendMessage(text)
  })

  /* ── Sapaan muncul saat launcher pertama kali dirender ── */
  greet()
})()
