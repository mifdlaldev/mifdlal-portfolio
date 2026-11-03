/* ============================================================
   WIDGET CHAT — mifdlal.com

   Widget mengambang pojok kanan bawah, DI ATAS tombol .to-top.
   Tampil di semua section sejak awal — bukan hanya #kontak.

   Fitur bergaya WhatsApp:
   - Bubble IN (bot) / OUT (pengguna) dengan tail
   - Timestamp mono di pojok bubble
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
  const statusEl = root.querySelector('[data-chat-status]')

  if (!launcher || !panel || !log || !form || !input) return

  const sendBtn = form.querySelector('.chat-send')

  /* ── Status header: online / mengetik... ──────────────── */
  const setStatus = (text, typing = false) => {
    if (!statusEl) return
    statusEl.textContent = text
    if (typing) {
      statusEl.setAttribute('data-typing', 'true')
    } else {
      statusEl.removeAttribute('data-typing')
    }
  }

  /* Timestamp HH:MM untuk bubble */
  const nowTime = () => {
    const d = new Date()
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0')
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

    const time = document.createElement('span')
    time.className = 'chat-time'
    time.textContent = nowTime()
    time.setAttribute('aria-hidden', 'true')

    bubble.appendChild(textNode)
    bubble.appendChild(time)
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
    setStatus('mengetik...', true)
  }

  const hideTyping = () => {
    typing.remove()
    setStatus('online', false)
  }

  /* ── Kirim pesan ──────────────────────────────────────── */
  let history = []
  let busy = false

  const greet = () => {
    /* Sapaan hanya sekali per halaman */
    if (log.childElementCount > 0) return
    addBubble(
      'in',
      'Halo! Saya asisten AI Mifdlal. Tanya soal layanan, proyek, atau stack — jawaban berdasarkan profil di situs ini.',
    )
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
        addBubble('in', message)
        setStatus('online', false)
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
        /* Hapus timestamp lama, set teks + timestamp baru */
        bubble.lastChild.remove()
        bubble.appendChild(document.createTextNode(acc))
        const time = document.createElement('span')
        time.className = 'chat-time'
        time.textContent = nowTime()
        time.setAttribute('aria-hidden', 'true')
        bubble.appendChild(time)
        scrollLog()
      }

      if (!acc.trim()) {
        bubble.textContent = 'Maaf, jawaban kosong. Coba tanya ulang.'
      }
      history.push({ role: 'assistant', content: acc })
      setStatus('online', false)
    } catch {
      hideTyping()
      addBubble('in', 'Koneksi terputus. Periksa internet dan coba lagi.')
      setStatus('online', false)
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
