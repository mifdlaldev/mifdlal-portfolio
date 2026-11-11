/**
 * i18n + tema runtime — mifdlal.com
 *
 * Pola terjemahan: teks Indonesia sebagai default (textContent node),
 * versi Inggris di atribut data-i18n-en. Saat bahasa = en, runtime
 * menimpa textContent. Tidak ada kamus terpusat di sini: teks Indonesia
 * ditulis langsung di markup Astro, versi Inggris di atribut data-i18n-en.
 *
 * Tema: data-theme="light|dark" di <html>, default "system" →
 * di-resolve via prefers-color-scheme. Preferensi disimpan di
 * localStorage (mifdlal-prefs).
 */
;(function () {
  'use strict'

  var LS_KEY = 'mifdlal-prefs'
  var qs = function (s, r) {
    return (r || document).querySelector(s)
  }
  var qsa = function (s, r) {
    return Array.prototype.slice.call((r || document).querySelectorAll(s))
  }

  /* ---------- state ---------- */

  var prefs = { theme: 'system', lang: 'id' }
  try {
    var saved = JSON.parse(localStorage.getItem(LS_KEY) || '{}')
    if (saved && typeof saved === 'object') {
      if (saved.theme === 'system' || saved.theme === 'light' || saved.theme === 'dark')
        prefs.theme = saved.theme
      if (saved.lang === 'id' || saved.lang === 'en') prefs.lang = saved.lang
    }
  } catch (e) {
    /* abaikan */
  }

  var mqlDark = window.matchMedia('(prefers-color-scheme: dark)')

  function save() {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(prefs))
    } catch (e) {
      /* abaikan */
    }
  }

  /* ---------- tema ---------- */

  function applyTheme() {
    var root = document.documentElement
    /* Nilai mentah disimpan di atribut; CSS yang memetakan
       'system' → prefers-color-scheme lewat media query. */
    if (prefs.theme === 'light') root.removeAttribute('data-theme')
    else root.setAttribute('data-theme', prefs.theme)
    var meta = qs('meta[name="theme-color"]')
    if (meta) {
      var dark = prefs.theme === 'dark' || (prefs.theme === 'system' && mqlDark.matches)
      meta.setAttribute('content', dark ? '#12121d' : '#fdfcf1')
    }
  }

  /* Saat mode system dan pengguna mengganti preferensi OS, ikutkan. */
  if (mqlDark.addEventListener)
    mqlDark.addEventListener('change', function () {
      if (prefs.theme === 'system') applyTheme()
    })
  else if (mqlDark.addListener)
    mqlDark.addListener(function () {
      if (prefs.theme === 'system') applyTheme()
    })

  /* ---------- i18n ---------- */

  function applyLang(l) {
    var root = document.documentElement
    root.lang = l === 'en' ? 'en' : 'id'
    root.dir = 'ltr'

    qsa('[data-i18n-en]').forEach(function (el) {
      /* teks default server = Indonesia; simpan sekali untuk restore */
      if (el.__i18nId === undefined) el.__i18nId = el.textContent
      el.textContent = l === 'en' ? el.getAttribute('data-i18n-en') : el.__i18nId
    })

    /* aria-label (ToTop, chat panel, tombol tanpa teks) */
    qsa('[data-i18n-aria]').forEach(function (el) {
      if (el.__i18nAriaId === undefined) el.__i18nAriaId = el.getAttribute('aria-label')
      el.setAttribute(
        'aria-label',
        l === 'en' ? el.getAttribute('data-i18n-aria') : el.__i18nAriaId
      )
    })

    /* label dropdown bahasa */
    var lbl = qs('[data-lang-label]')
    if (lbl) lbl.textContent = l === 'en' ? 'English' : 'Bahasa'

    /* placeholder input chat */
    qsa('[data-i18n-ph]').forEach(function (el) {
      if (el.__i18nPh === undefined) el.__i18nPh = el.getAttribute('placeholder')
      el.setAttribute(
        'placeholder',
        l === 'en' ? el.getAttribute('data-i18n-en') || '' : el.__i18nPh
      )
    })

    /* meta content (description, og:*, twitter:*) */
    qsa('[data-i18n-meta]').forEach(function (el) {
      if (el.__i18nMeta === undefined) el.__i18nMeta = el.getAttribute('content')
      el.setAttribute(
        'content',
        l === 'en' ? el.getAttribute('data-i18n-meta') || '' : el.__i18nMeta
      )
    })

    /* mailto subject mengikuti bahasa */
    qsa('[data-mailto]').forEach(function (el) {
      var idSub = el.getAttribute('data-subject-id') || ''
      var enSub = el.getAttribute('data-subject-en') || idSub
      el.setAttribute(
        'href',
        'mailto:' + el.getAttribute('data-mailto') + '?subject=' + (l === 'en' ? enSub : idSub)
      )
    })

    /* tautan WhatsApp: nomor tetap, pesan awal mengikuti bahasa */
    qsa('[data-wa-number]').forEach(function (el) {
      var idMsg = el.getAttribute('data-wa-text-id') || ''
      var enMsg = el.getAttribute('data-wa-text-en') || idMsg
      el.setAttribute(
        'href',
        'https://wa.me/' +
          el.getAttribute('data-wa-number') +
          '?text=' +
          encodeURIComponent(l === 'en' ? enMsg : idMsg)
      )
    })
  }

  /* ---------- kontrol ---------- */

  function syncUI() {
    qsa('[data-theme-value]').forEach(function (b) {
      var on = b.getAttribute('data-theme-value') === prefs.theme
      b.setAttribute('aria-pressed', on ? 'true' : 'false')
      b.classList.toggle('is-active', on)
    })
    var lbl = qs('[data-lang-label]')
    if (lbl) lbl.textContent = prefs.lang === 'en' ? 'English' : 'Bahasa'
    qsa('[data-lang-value]').forEach(function (b) {
      var on = b.getAttribute('data-lang-value') === prefs.lang
      b.setAttribute('aria-pressed', on ? 'true' : 'false')
    })
  }

  function initControls() {
    /* Terima event dari kontrol footer (ThemeToggle/LangSwitch
       di-render server, event ini menyinkronkan state runtime). */
    document.addEventListener('mifdlal:theme', function (e) {
      var v = e.detail
      if (v === 'light' || v === 'dark' || v === 'system') {
        prefs.theme = v
        save()
        applyTheme()
        syncUI()
      }
    })

    document.addEventListener('mifdlal:lang', function (e) {
      var v = e.detail
      if (v === 'id' || v === 'en') {
        prefs.lang = v
        save()
        applyLang(v)
        syncUI()
      }
    })
  }

  /* ---------- anti-FOUC tema: jalankan sebelum paint ---------- */
  applyTheme()

  function boot() {
    applyTheme()
    applyLang(prefs.lang)
    initControls()
    syncUI()
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot)
  else boot()
})()
