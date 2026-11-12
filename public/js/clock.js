/* Jam WIB (GMT+7) untuk baris Zona waktu di panel kontak.
   Lokasi operator ada di WIB, jadi zona waktunya dipatok ke Asia/Jakarta,
   bukan zona waktu pengunjung. Situs ini statis: server tidak tahu jam
   berapa halaman dibuka, jadi penanda waktunya dipasang dari sisi klien.
   Tanpa JavaScript baris ini tetap menampilkan GMT+7 (WIB) saja. */
;(function () {
  var el = document.querySelector('[data-clock]')
  if (!el) return

  var fmt = null
  try {
    fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
  } catch (e) {
    fmt = null
  }

  function pad(n) {
    return (n < 10 ? '0' : '') + n
  }

  /* Cadangan bila Intl tanpa dukungan timeZone: geser ke UTC+7, baca UTC. */
  function hhmm(now) {
    if (fmt) return fmt.format(now)
    var wib = new Date(now.getTime() + 7 * 3600000)
    return pad(wib.getUTCHours()) + ':' + pad(wib.getUTCMinutes())
  }

  function render() {
    var now = new Date()
    el.textContent = ' / ' + hhmm(now) + ' WIB'
    el.setAttribute('datetime', now.toISOString())
    el.hidden = false
  }

  /* Detak diselaraskan ke pergantian menit, lalu diulang tiap menit.
     Tab latar membekukan timer, jadi jam disegarkan lagi saat terlihat. */
  var timer = 0
  function schedule() {
    clearTimeout(timer)
    var delay = 60000 - (Date.now() % 60000) + 20
    timer = setTimeout(function () {
      render()
      schedule()
    }, delay)
  }

  render()
  schedule()

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) return
    render()
    schedule()
  })
})()
