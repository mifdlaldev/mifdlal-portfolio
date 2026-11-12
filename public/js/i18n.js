/**
 * i18n + tema runtime — mifdlal.com
 *
 * Pola terjemahan: teks Inggris sebagai default (textContent node, dirender
 * server), versi Indonesia di atribut data-i18n-id. Saat bahasa = id, runtime
 * menimpa textContent dengan versi Indonesia. Tidak ada kamus terpusat di
 * sini: teks Inggris ditulis langsung di markup Astro, versi Indonesia di
 * atribut data-i18n-id.
 *
 * Karena default ada di markup, pengunjung tanpa JavaScript, perayap mesin
 * pencari, dan pratinjau tautan semuanya melihat versi Inggris.
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

  var prefs = { theme: 'system', lang: 'en' }
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
    root.lang = l === 'id' ? 'id' : 'en'
    root.dir = 'ltr'

    qsa('[data-i18n-id]').forEach(function (el) {
      /* teks default server = Inggris; simpan sekali untuk restore */
      if (el.__i18nDefault === undefined) el.__i18nDefault = el.textContent
      el.textContent = l === 'id' ? el.getAttribute('data-i18n-id') : el.__i18nDefault
    })

    /* aria-label (ToTop, chat panel, tombol tanpa teks) */
    qsa('[data-i18n-aria-id]').forEach(function (el) {
      if (el.__i18nAriaDefault === undefined) el.__i18nAriaDefault = el.getAttribute('aria-label')
      el.setAttribute(
        'aria-label',
        l === 'id' ? el.getAttribute('data-i18n-aria-id') : el.__i18nAriaDefault
      )
    })

    /* label dropdown bahasa */
    var lbl = qs('[data-lang-label]')
    if (lbl) lbl.textContent = l === 'id' ? 'Indonesia' : 'English'

    /* placeholder input chat */
    qsa('[data-i18n-ph-id]').forEach(function (el) {
      if (el.__i18nPhDefault === undefined) el.__i18nPhDefault = el.getAttribute('placeholder')
      el.setAttribute(
        'placeholder',
        l === 'id' ? el.getAttribute('data-i18n-ph-id') || '' : el.__i18nPhDefault
      )
    })

    /* meta content (description, og:*, twitter:*) */
    qsa('[data-i18n-meta-id]').forEach(function (el) {
      if (el.__i18nMetaDefault === undefined) el.__i18nMetaDefault = el.getAttribute('content')
      el.setAttribute(
        'content',
        l === 'id' ? el.getAttribute('data-i18n-meta-id') || '' : el.__i18nMetaDefault
      )
    })

    /* mailto subject mengikuti bahasa */
    qsa('[data-mailto]').forEach(function (el) {
      var idSub = el.getAttribute('data-subject-id') || ''
      var enSub = el.getAttribute('data-subject-en') || idSub
      el.setAttribute(
        'href',
        'mailto:' + el.getAttribute('data-mailto') + '?subject=' + (l === 'id' ? idSub : enSub)
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
          encodeURIComponent(l === 'id' ? idMsg : enMsg)
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
    if (lbl) lbl.textContent = prefs.lang === 'id' ? 'Indonesia' : 'English'
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
